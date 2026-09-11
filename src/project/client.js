export function projectJob(type, payload, onProgress) {
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  let reject;
  const promise = new Promise((resolve, fail) => {
    reject = fail;
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') onProgress(data.message);
      else if (data.type === 'error') {
        worker.terminate();
        fail(Error(data.message));
      } else if (data.type === 'complete') {
        worker.terminate();
        resolve(data.value);
      }
    };
    worker.onerror = (e) => {
      worker.terminate();
      fail(Error(e.message || 'Project processing failed.'));
    };
    worker.postMessage({ type, ...payload }, payload.bytes ? [payload.bytes.buffer] : []);
  });
  return {
    promise,
    cancel() {
      worker.terminate();
      reject(new DOMException('Project operation cancelled.', 'AbortError'));
    },
  };
}
