import { calculateDay } from '../src/irradiance/engine.js';
const cached = new Map();
self.postMessage({ type: 'ready' });
self.onmessage = async ({ data }) => {
  try {
    const r = await calculateDay(data.study, () => {}, {
      cache: { get: async (k) => cached.get(k), put: async (k, v) => cached.set(k, v) },
    });
    self.postMessage({
      type: 'result',
      result: {
        backend: r.backend,
        seconds: r.seconds,
        cells: r.cells.length,
        cached: r.cached,
        timings: r.timings,
        warnings: r.warnings,
        finite: r.cells.every(
          (c) => Number.isFinite(c.wh) && Number.isFinite(c.dli) && Number.isFinite(c.sunlight),
        ),
      },
    });
  } catch (e) {
    self.postMessage({ type: 'error', error: e.message });
  }
};
