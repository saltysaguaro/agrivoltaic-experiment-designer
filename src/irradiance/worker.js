import { calculateStudy } from './period-engine.js';
self.onmessage = async ({ data }) => {
  if (data.type === 'warmup') {
    self.postMessage({ type: 'ready' });
    return;
  }
  try {
    let lastProgress = 0;
    const result = await calculateStudy(
      data.study,
      (progress) => {
        const now = performance.now();
        if (now - lastProgress >= 100 || progress.progress === 1) {
          lastProgress = now;
          self.postMessage({ type: 'progress', ...progress });
        }
      },
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
