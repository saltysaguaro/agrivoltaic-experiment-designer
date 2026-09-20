import { updateStudyInput } from '../domain/study.js';
import { weatherRequestKey } from './weather-service.js';
export function weatherImportContext(s) {
  return JSON.stringify([weatherRequestKey(s), s.weather.mode, s.weather.hash, s.weather.name]);
}
export function applyWeatherImport(s, parsed) {
  const next = parsed.site ? updateStudyInput(s, 'site', 'latitude', parsed.site.latitude) : s;
  return {
    ...next,
    weather: { ...parsed.weather, mode: 'upload' },
    site: parsed.site
      ? { ...next.site, ...parsed.site, address: '', utcOffsetApproximate: false }
      : next.site,
  };
}
export function weatherImportJob(file, study) {
  const worker = new Worker(new URL('./import-worker.js', import.meta.url), { type: 'module' });
  let reject;
  const promise = new Promise((resolve, fail) => {
    reject = fail;
    worker.onmessage = ({ data }) => {
      worker.terminate();
      data.type === 'error' ? fail(Error(data.message)) : resolve(data.value);
    };
    worker.onerror = (e) => {
      worker.terminate();
      fail(Error(e.message || 'Weather import failed.'));
    };
    worker.postMessage({ file, study: { analysis: study.analysis } });
  });
  return {
    promise,
    cancel() {
      worker.terminate();
      reject(new DOMException('Weather import cancelled.', 'AbortError'));
    },
  };
}
