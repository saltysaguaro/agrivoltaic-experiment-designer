const memory = new Map();
let db;
async function database() {
  if (typeof indexedDB === 'undefined') return null;
  if (!db)
    db = new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve(value);
        } else value?.close();
      };
      const timeout = setTimeout(() => finish(null), 1500);
      const r = indexedDB.open('fieldwork-visibility-v1', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('visibility');
      r.onsuccess = () => finish(r.result);
      r.onerror = () => finish(null);
      r.onblocked = () => finish(null);
    });
  return db;
}
export async function getCached(key) {
  if (memory.has(key)) return memory.get(key);
  try {
    const d = await database();
    if (!d) return null;
    return await new Promise((resolve) => {
      const r = d.transaction('visibility').objectStore('visibility').get(key);
      const timeout = setTimeout(() => resolve(null), 1500);
      r.onsuccess = () => {
        clearTimeout(timeout);
        resolve(r.result || null);
      };
      r.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}
export async function putCached(key, bits) {
  // Transmitting layouts use two-byte intersection counts instead of bitsets.
  // Avoid caching large pose matrices; the solver can stream/recompute them.
  if (bits.byteLength > 4 * 1024 * 1024) return;
  memory.set(key, bits);
  while ([...memory.values()].reduce((n, v) => n + v.byteLength, 0) > 32 * 1024 * 1024)
    memory.delete(memory.keys().next().value);
  if (memory.size > 16) memory.delete(memory.keys().next().value);
  try {
    const d = await database();
    if (!d) return;
    const tx = d.transaction('visibility', 'readwrite'),
      store = tx.objectStore('visibility');
    const count = store.count();
    count.onsuccess = () => {
      if (count.result > 64) store.clear();
      store.put(bits, key);
    };
  } catch {
    /* Cache is an optimization; storage availability does not affect results. */
  }
}
