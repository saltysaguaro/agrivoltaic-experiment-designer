// Each HTTP request gets its own deadline, including response-body download.
// A long period can keep making progress without a whole-period deadline.
const retryableStatus = new Set([408, 500, 502, 503, 504]);
const cancelled = () => new DOMException('Weather download cancelled.', 'AbortError');

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      error ? reject(error) : resolve();
    };
    const abort = () => finish(cancelled());
    const timer = setTimeout(() => finish(), ms);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });
}

export async function fetchWeatherText(
  url,
  {
    signal,
    fetchImpl = globalThis.fetch,
    timeoutMs = 60000,
    retryDelayMs = 2000,
    onProgress = () => {},
  } = {},
) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal?.aborted) throw cancelled();
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    let retry;
    try {
      const response = await fetchImpl(url, { signal: controller.signal });
      if (!response.ok) {
        let reason = '';
        try {
          reason = (await response.json()).reason || '';
        } catch {}
        const error = new Error(
          `Weather download failed (${response.status}). ${reason || 'Retry or upload a weather file.'}`,
        );
        error.retryable = retryableStatus.has(response.status);
        throw error;
      }
      const raw = await response.text();
      if (signal?.aborted) throw cancelled();
      if (timedOut) throw new DOMException('Request deadline reached.', 'TimeoutError');
      return raw;
    } catch (error) {
      if (signal?.aborted) throw cancelled();
      const transient = timedOut || error instanceof TypeError || error.retryable;
      if (!transient) throw error;
      if (attempt === 1) {
        if (timedOut)
          throw new DOMException(
            'Open-Meteo did not finish responding after two attempts. Retry shortly, or upload a weather file for the selected dates.',
            'TimeoutError',
          );
        if (error instanceof TypeError)
          throw new Error(
            'Could not connect to Open-Meteo after two attempts. Check your connection and retry, or upload a weather file.',
          );
        throw error;
      }
      retry = timedOut
        ? 'Open-Meteo is taking longer than expected. Retrying weather download (attempt 2 of 2)…'
        : 'Open-Meteo is temporarily unavailable. Retrying weather download (attempt 2 of 2)…';
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
    onProgress(retry);
    await delay(retryDelayMs, signal);
  }
}
