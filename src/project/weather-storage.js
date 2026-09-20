import { sha256 } from '../domain/study.js';
import { browserStudyRecord } from './browser-study.js';
let databasePromise, retainedKey;
function database() {
  if (!globalThis.indexedDB) return Promise.reject(Error('Weather storage unavailable'));
  return (databasePromise ??= new Promise((resolve, reject) => {
    const r = indexedDB.open('aed-weather-snapshot-v1', 1);
    const timeout = setTimeout(() => reject(Error('Weather storage timed out')), 1500);
    r.onupgradeneeded = () => r.result.createObjectStore('snapshots');
    r.onsuccess = () => {
      clearTimeout(timeout);
      resolve(r.result);
    };
    r.onerror = r.onblocked = () => {
      clearTimeout(timeout);
      reject(Error('Weather storage unavailable'));
    };
  }));
}
async function transaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('snapshots', mode),
      request = action(tx.objectStore('snapshots'));
    const timer = setTimeout(() => {
      tx.abort();
      reject(Error('Weather storage timed out'));
    }, 3000);
    tx.oncomplete = () => {
      clearTimeout(timer);
      resolve(request?.result);
    };
    tx.onabort = tx.onerror = () => {
      clearTimeout(timer);
      reject(Error('Weather storage unavailable'));
    };
  });
}
export const readWeatherSnapshot = async (key) => {
  const value = await transaction('readonly', (store) => store.get(key));
  return value?.data ?? value;
};
export async function persistedBrowserRecord(study) {
  const record = browserStudyRecord(study),
    w = study.weather;
  if (!w.rows.length && !w.days?.length) return record;
  // Retained hashes have already been verified at import/download boundaries.
  const key =
    w.normalizedHash && w.hash ? `${w.hash}:${w.normalizedHash}` : await sha256(JSON.stringify(w));
  if (retainedKey !== key) {
    await transaction('readwrite', (store) =>
      store.put(
        { data: { rows: w.rows, days: w.days, sourceText: w.sourceText }, touched: Date.now() },
        key,
      ),
    );
    retainedKey = key;
  }
  record.weather = { ...w, rows: [], days: [], sourceText: undefined };
  record.browserWeatherRef = key;
  return record;
}
// Prune only after the matching local preference pointer has been committed.
export async function pruneWeatherSnapshots(key) {
  try {
    await transaction('readwrite', (store) => {
      const cursor = store.openCursor(),
        entries = [];
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          entries.push({ key: c.key, touched: c.value.touched || 0 });
          c.continue();
          return;
        }
        entries.sort((a, b) => b.touched - a.touched);
        for (const entry of entries.slice(3)) if (entry.key !== key) store.delete(entry.key);
      };
      return cursor;
    });
  } catch {
    /* Reclaiming optional storage must not lose the saved snapshot. */
  }
}
