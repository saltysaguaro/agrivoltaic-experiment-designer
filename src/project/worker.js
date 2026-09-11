import { buildProjectPackage, readProject, projectDocument } from './package.js';
self.onmessage = async ({ data }) => {
  try {
    const progress = (message) => self.postMessage({ type: 'progress', message });
    const value =
      data.type === 'export'
        ? await buildProjectPackage(data.study, data.result, progress)
        : data.type === 'json'
          ? { document: await projectDocument(data.study, data.result) }
          : await readProject(data.bytes, data.name, progress);
    self.postMessage({ type: 'complete', value }, value.archive ? [value.archive.buffer] : []);
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
