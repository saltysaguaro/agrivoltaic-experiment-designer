import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = 'archive/agrivoltaic_bf',
  manifest = JSON.parse(fs.readFileSync('archive/manifest.json', 'utf8'));
let errors = 0;
for (const [name, hash] of Object.entries(manifest.files)) {
  const p = path.join(root, name);
  if (
    !fs.existsSync(p) ||
    crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') !== hash
  ) {
    console.error('Archive changed:', name);
    errors++;
  }
}
function inspect(p) {
  for (const n of fs.readdirSync(p)) {
    const full = path.join(p, n);
    if (fs.statSync(full).isDirectory()) inspect(full);
    else if (!Object.hasOwn(manifest.files, path.relative(root, full))) {
      console.error('Unexpected archived file:', full);
      errors++;
    }
  }
}
inspect(root);
if (process.argv.includes('--lock')) {
  function lock(p) {
    if (fs.statSync(p).isDirectory()) {
      for (const n of fs.readdirSync(p)) lock(path.join(p, n));
      fs.chmodSync(p, 0o555);
    } else fs.chmodSync(p, 0o444);
  }
  lock(root);
}
console.log(`${Object.keys(manifest.files).length} archived files checked; ${errors} differences.`);
process.exitCode = errors ? 1 : 0;
