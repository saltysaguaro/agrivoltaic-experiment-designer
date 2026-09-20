const MEMORY_LIMIT = 32 * 1024 * 1024,
  DISK_LIMIT = 128 * 1024 * 1024;
const memory = new Map();
let memoryBytes = 0,
  db;
const diagnostics = { memoryHits: 0, diskHits: 0, misses: 0, writes: 0, evictions: 0 };
export const cacheDiagnostics = () => ({ ...diagnostics, memoryBytes, entries: memory.size });
function remember(key, bits) {
  if (memory.has(key)) {
    memoryBytes -= memory.get(key).byteLength;
    memory.delete(key);
  }
  memory.set(key, bits);
  memoryBytes += bits.byteLength;
  while (memoryBytes > MEMORY_LIMIT || memory.size > 1024) {
    const oldest = memory.keys().next().value;
    memoryBytes -= memory.get(oldest).byteLength;
    memory.delete(oldest);
    diagnostics.evictions++;
  }
}
async function database() {
  if (typeof indexedDB === 'undefined') return null;
  if (!db)
    db = new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) {
          value?.close();
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), 1500);
      const r = indexedDB.open('fieldwork-visibility-v1', 2);
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains('visibility'))
          r.result.createObjectStore('visibility');
        else r.transaction.objectStore('visibility').clear();
        r.result.createObjectStore('metadata');
      };
      r.onsuccess = () => finish(r.result);
      r.onerror = r.onblocked = () => finish(null);
    });
  return db;
}
export async function getCached(key) {
  if (memory.has(key)) {
    const bits = memory.get(key);
    remember(key, bits);
    diagnostics.memoryHits++;
    return bits;
  }
  try {
    const d = await database();
    if (d) {
      const bits = await new Promise((resolve) => {
        const tx = d.transaction(['visibility', 'metadata'], 'readwrite'),
          request = tx.objectStore('visibility').get(key),
          timer = setTimeout(() => resolve(null), 1500);
        request.onsuccess = () => {
          if (request.result)
            tx.objectStore('metadata').put(
              { bytes: request.result.byteLength, touched: Date.now() },
              key,
            );
        };
        tx.oncomplete = () => {
          clearTimeout(timer);
          resolve(request.result || null);
        };
        tx.onerror = tx.onabort = () => {
          clearTimeout(timer);
          resolve(null);
        };
      });
      if (bits) {
        diagnostics.diskHits++;
        remember(key, bits);
        return bits;
      }
    }
  } catch {
    /* Cache failures cannot affect numerical results. */
  }
  diagnostics.misses++;
  return null;
}
export async function putCached(key, bits) {
  if (bits.byteLength > 4 * 1024 * 1024) return;
  remember(key, bits);
  diagnostics.writes++;
  try {
    const d = await database();
    if (!d) return;
    await new Promise((resolve) => {
      const tx = d.transaction(['visibility', 'metadata'], 'readwrite'),
        store = tx.objectStore('visibility'),
        meta = tx.objectStore('metadata'),
        entries = [];
      store.put(bits, key);
      meta.put({ bytes: bits.byteLength, touched: Date.now() }, key);
      const request = meta.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          entries.push({ key: cursor.key, ...cursor.value });
          cursor.continue();
          return;
        }
        let bytes = entries.reduce((n, e) => n + e.bytes, 0),
          count = entries.length;
        entries.sort((a, b) => a.touched - b.touched);
        for (const e of entries) {
          if (bytes <= DISK_LIMIT && count <= 2048) break;
          store.delete(e.key);
          meta.delete(e.key);
          bytes -= e.bytes;
          count--;
          diagnostics.evictions++;
        }
      };
      const timer = setTimeout(resolve, 1500);
      tx.oncomplete =
        tx.onerror =
        tx.onabort =
          () => {
            clearTimeout(timer);
            resolve();
          };
    });
  } catch {
    /* Storage availability does not affect results. */
  }
}
