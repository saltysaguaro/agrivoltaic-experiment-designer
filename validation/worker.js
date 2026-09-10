import { calculateDay } from '../src/irradiance/engine.js';
import { WebGpuIrradianceEngine } from '../src/irradiance/gpu.js';
import { getCached, putCached } from '../src/irradiance/cache.js';
self.onmessage = async ({ data }) => {
  try {
    const options = {
      cache: {
        get: (key) => getCached(`${data.prefix}:${key}`),
        put: (key, bits) => putCached(`${data.prefix}:${key}`, bits),
      },
    };
    if (data.failure === 'storage')
      options.cache = {
        get: async () => {
          throw Error('Simulated blocked storage');
        },
        put: async () => {
          throw Error('Simulated quota exhaustion');
        },
      };
    if (data.failure === 'device')
      options.createGpu = async () => {
        const engine = await WebGpuIrradianceEngine.create(),
          visibility = engine.visibility.bind(engine);
        let first = true;
        engine.visibility = async (...args) => {
          if (first) {
            first = false;
            engine.device.destroy();
            await engine.device.lost;
          }
          return visibility(...args);
        };
        return engine;
      };
    if (data.failure === 'allocation')
      options.createGpu = async () => {
        const engine = await WebGpuIrradianceEngine.create();
        engine.initializeGeometry = async () => {
          throw Error('Simulated allocation limit');
        };
        return engine;
      };
    self.postMessage({ result: await calculateDay(data.study, () => {}, options) });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
