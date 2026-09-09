const memory = new Map();
let db;
async function database() {
  if (typeof indexedDB === 'undefined') return null;
  if (!db)
    db = new Promise((resolve) => {
      const r = indexedDB.open('fieldwork-visibility-v1', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('visibility');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
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
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
export async function putCached(key, bits) {
  memory.set(key, bits);
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
