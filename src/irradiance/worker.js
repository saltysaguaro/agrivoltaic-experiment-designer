import { calculateDay } from './engine.js';
self.onmessage = async ({ data }) => {
  if (data.type === 'warmup') {
    self.postMessage({ type: 'ready' });
    return;
  }
  try {
    const result = await calculateDay(data.study, (progress) =>
      self.postMessage({ type: 'progress', ...progress }),
    );
    self.postMessage({ type: 'result', result });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
