import { parseWeather } from './weather.js';
self.onmessage = async ({ data }) => {
  try {
    const value = await parseWeather(await data.file.text(), data.file.name, data.study);
    self.postMessage({ type: 'complete', value });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
