import { calculateStudy } from '../src/irradiance/period-engine.js';
import { getCached, putCached } from '../src/irradiance/cache.js';
self.postMessage({ type: 'ready' });
self.onmessage = async ({ data }) => {
  const cache = { hits: 0, misses: 0, attemptedWrites: 0, skippedLarge: 0, largestMatrixBytes: 0 };
  try {
    let lastProgress = 0;
    const r = await calculateStudy(
      data.study,
      (p) => {
        if (performance.now() - lastProgress > 500) {
          self.postMessage({ type: 'progress', progress: p });
          lastProgress = performance.now();
        }
      },
      {
        cache: {
          get: async (key) => {
            const value = await getCached(key);
            value ? cache.hits++ : cache.misses++;
            return value;
          },
          put: async (key, value) => {
            cache.attemptedWrites++;
            cache.largestMatrixBytes = Math.max(cache.largestMatrixBytes, value.byteLength);
            if (value.byteLength > 4 * 1024 * 1024) cache.skippedLarge++;
            return putCached(key, value);
          },
        },
        // Match the application's completed-day checkpoint transfer and retained state.
        onCheckpoint: (checkpoint) => self.postMessage({ type: 'checkpoint', checkpoint }),
      },
    );
    self.postMessage({ type: 'result', result: r, cache });
  } catch (e) {
    self.postMessage({ type: 'error', error: e.message, cache });
  }
};
