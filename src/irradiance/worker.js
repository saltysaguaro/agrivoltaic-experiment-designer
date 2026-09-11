import { calculateStudy } from './period-engine.js';
self.onmessage = async ({ data }) => {
  if (data.type === 'warmup') {
    self.postMessage({ type: 'ready' });
    return;
  }
  try {
    const result = await calculateStudy(
      data.study,
      (progress) => self.postMessage({ type: 'progress', ...progress }),
      {
        checkpoint: data.checkpoint,
        onCheckpoint: (checkpoint) => self.postMessage({ type: 'checkpoint', checkpoint }),
      },
    );
    self.postMessage({ type: 'result', result });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
