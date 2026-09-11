// Standard ZIP (STORE / DEFLATE), using native streams; no filesystem extraction.
// PKWARE APPNOTE 6.3.10. ZIP64, encryption and split archives are intentionally unsupported.
export const MAX_ARCHIVE = 128 * 1024 * 1024;
export const MAX_EXPANDED = 256 * 1024 * 1024;
const encoder = new TextEncoder(),
  decoder = new TextDecoder('utf-8', { fatal: true });
const table = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pathAllowed(name) {
  return (
    name.length <= 160 &&
    /^[a-zA-Z0-9_./-]+$/.test(name) &&
    !name.startsWith('/') &&
    !name.split('/').some((s) => !s || s === '.' || s === '..')
  );
}
function join(chunks, length = chunks.reduce((sum, b) => sum + b.length, 0)) {
  const output = new Uint8Array(length);
  let offset = 0;
  for (const b of chunks) {
    output.set(b, offset);
    offset += b.length;
  }
  return output;
}
async function transform(bytes, stream, limit) {
  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const parts = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit)
        throw Error('Expanded package exceeds its declared size or the 256 MiB limit.');
      parts.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  return join(parts, size);
}
export async function writeZip(files, { compress = true, onProgress = () => {} } = {}) {
  if (!files.size || files.size > 40) throw Error('A project package must contain 1–40 files.');
  const local = [],
    central = [];
  let offset = 0,
    expanded = 0,
    count = 0;
  for (const [name, value] of files) {
    if (!pathAllowed(name)) throw Error('Unsupported package path: ' + name);
    const data = typeof value === 'string' ? encoder.encode(value) : value;
    expanded += data.length;
    if (data.length > MAX_ARCHIVE || expanded > MAX_EXPANDED)
      throw Error('Project exceeds the package size limit.');
    let packed = data,
      method = 0,
      compressor;
    if (compress) {
      try {
        compressor = new CompressionStream('deflate-raw');
      } catch {}
    }
    if (compressor) {
      const compressed = await transform(data, compressor, MAX_ARCHIVE);
      if (compressed.length < data.length) {
        packed = compressed;
        method = 8;
      }
    }
    const filename = encoder.encode(name),
      crc = crc32(data);
    const header = new Uint8Array(30 + filename.length),
      h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x800, true);
    h.setUint16(8, method, true);
    h.setUint16(12, 33, true); // 1980-01-01; actual creation is in the manifest.
    h.setUint32(14, crc, true);
    h.setUint32(18, packed.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, filename.length, true);
    header.set(filename, 30);
    const record = new Uint8Array(46 + filename.length),
      c = new DataView(record.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint16(10, method, true);
    c.setUint16(14, 33, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, packed.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, filename.length, true);
    c.setUint32(42, offset, true);
    record.set(filename, 46);
    local.push(header, packed);
    central.push(record);
    offset += header.length + packed.length;
    if (offset > MAX_ARCHIVE) throw Error('Compressed package exceeds 128 MiB.');
    onProgress(`Packaging ${++count} of ${files.size} files`);
  }
  const directory = join(central),
    end = new Uint8Array(22),
    e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.size, true);
  e.setUint16(10, files.size, true);
  e.setUint32(12, directory.length, true);
  e.setUint32(16, offset, true);
  if (offset + directory.length + 22 > MAX_ARCHIVE)
    throw Error('Compressed package exceeds 128 MiB.');
  return join([...local, directory, end]);
}
export async function readZip(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 22 || bytes.length > MAX_ARCHIVE)
    throw Error('Invalid ZIP size (maximum 128 MiB).');
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p--) {
    if (
      v.getUint32(p, true) === 0x06054b50 &&
      p + 22 + v.getUint16(p + 20, true) === bytes.length
    ) {
      end = p;
      break;
    }
  }
  if (end < 0) throw Error('ZIP directory is missing or incomplete.');
  const count = v.getUint16(end + 10, true),
    size = v.getUint32(end + 12, true),
    start = v.getUint32(end + 16, true);
  if (
    v.getUint16(end + 4, true) ||
    v.getUint16(end + 6, true) ||
    v.getUint16(end + 8, true) !== count ||
    !count ||
    count > 40 ||
    start + size !== end
  )
    throw Error('Unsupported ZIP directory, file count or split archive.');
  const entries = [],
    names = new Set();
  let p = start,
    expanded = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > end || v.getUint32(p, true) !== 0x02014b50) throw Error('Invalid ZIP entry.');
    const flags = v.getUint16(p + 8, true),
      method = v.getUint16(p + 10, true),
      crc = v.getUint32(p + 16, true);
    const packed = v.getUint32(p + 20, true),
      length = v.getUint32(p + 24, true);
    const n = v.getUint16(p + 28, true),
      extra = v.getUint16(p + 30, true),
      comment = v.getUint16(p + 32, true),
      offset = v.getUint32(p + 42, true);
    if (
      p + 46 + n + extra + comment > end ||
      v.getUint16(p + 34, true) ||
      flags & ~0x808 ||
      ![0, 8].includes(method)
    )
      throw Error('Unsupported ZIP encoding, encryption or compression.');
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + n));
    if (!pathAllowed(name) || names.has(name)) throw Error('Unsafe or duplicate ZIP path.');
    names.add(name);
    expanded += length;
    if (length > MAX_ARCHIVE || expanded > MAX_EXPANDED)
      throw Error('Expanded package exceeds 256 MiB.');
    if (offset + 30 > start || v.getUint32(offset, true) !== 0x04034b50)
      throw Error('Invalid local ZIP header.');
    const localN = v.getUint16(offset + 26, true),
      localExtra = v.getUint16(offset + 28, true),
      dataStart = offset + 30 + localN + localExtra;
    if (
      dataStart + packed > start ||
      v.getUint16(offset + 6, true) !== flags ||
      v.getUint16(offset + 8, true) !== method ||
      decoder.decode(bytes.subarray(offset + 30, offset + 30 + localN)) !== name
    )
      throw Error('ZIP headers disagree.');
    if (
      !(flags & 8) &&
      (v.getUint32(offset + 14, true) !== crc ||
        v.getUint32(offset + 18, true) !== packed ||
        v.getUint32(offset + 22, true) !== length)
    )
      throw Error('ZIP file sizes or checksums disagree.');
    entries.push({ name, offset, dataStart, packed, length, method, crc });
    p += 46 + n + extra + comment;
  }
  if (p !== end) throw Error('Unexpected ZIP directory data.');
  const ordered = [...entries].sort((a, b) => a.offset - b.offset);
  for (let i = 1; i < ordered.length; i++)
    if (ordered[i].offset < ordered[i - 1].dataStart + ordered[i - 1].packed)
      throw Error('Overlapping ZIP entries.');
  const files = new Map();
  for (const entry of entries) {
    const packed = bytes.subarray(entry.dataStart, entry.dataStart + entry.packed);
    let data;
    if (entry.method === 0) data = packed;
    else {
      let decompressor;
      try {
        decompressor = new DecompressionStream('deflate-raw');
      } catch {
        throw Error(
          'This browser cannot decompress this package. Unzip it and open project.json, or use a current browser.',
        );
      }
      data = await transform(packed, decompressor, entry.length);
    }
    if (data.length !== entry.length || crc32(data) !== entry.crc)
      throw Error('ZIP content is damaged: ' + entry.name);
    files.set(entry.name, data);
  }
  return files;
}
