import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, sha256 } from '../src/domain/study.js';
import { fetchWeatherText } from '../src/irradiance/weather-fetch.js';
import { downloadWeather } from '../src/irradiance/weather-service.js';

const aborted = () => new DOMException('Aborted', 'AbortError');
const stall = (signal) =>
  new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(aborted()), { once: true });
  });
function responseFor(url) {
  const u = new URL(url),
    start = Date.parse(u.searchParams.get('start_date')),
    end = Date.parse(u.searchParams.get('end_date')) + 86400000;
  const time = Array.from({ length: (end - start) / 3600000 }, (_, i) =>
    new Date(start + i * 3600000).toISOString().slice(0, 16),
  );
  return JSON.stringify({
    latitude: 32.22,
    longitude: -110.97,
    elevation: 728,
    hourly: {
      time,
      shortwave_radiation: time.map(() => 100),
      direct_normal_irradiance: time.map(() => 0),
      diffuse_radiation: time.map(() => 100),
    },
  });
}

test('a stalled response body times out and retries without losing weather provenance', async () => {
  const s = defaultStudy(),
    progress = [];
  let calls = 0,
    raw;
  const weather = await downloadWeather(s, {
    timeoutMs: 10,
    retryDelayMs: 0,
    onProgress: (message) => progress.push(message),
    fetchImpl: async (url, { signal }) => {
      calls++;
      raw = responseFor(url);
      return { ok: true, text: () => (calls === 1 ? stall(signal) : Promise.resolve(raw)) };
    },
  });
  assert.equal(calls, 2);
  assert.match(progress[0], /taking longer.*attempt 2 of 2/);
  assert.equal(weather.rows.length, 24);
  assert.equal(weather.sourceText, raw);
  assert.equal(weather.hash, await sha256(raw));
  assert.equal(weather.mode, 'automatic');
});

test('transient HTTP and connection failures get one retry, while invalid and rate-limited requests do not', async () => {
  for (const failure of [new TypeError('Failed to fetch'), 503, 502, 504]) {
    let calls = 0;
    const text = await fetchWeatherText('https://example.test', {
      retryDelayMs: 0,
      fetchImpl: async () => {
        if (++calls > 1) return { ok: true, text: async () => 'response' };
        if (failure instanceof Error) throw failure;
        return { ok: false, status: failure, json: async () => ({ reason: 'Unavailable' }) };
      },
    });
    assert.equal(calls, 2);
    assert.equal(text, 'response');
  }
  for (const status of [400, 403, 429]) {
    let calls = 0;
    await assert.rejects(
      fetchWeatherText('https://example.test', {
        fetchImpl: async () => {
          calls++;
          return { ok: false, status, json: async () => ({ reason: 'Specific provider reason' }) };
        },
      }),
      /Specific provider reason/,
    );
    assert.equal(calls, 1);
  }
});

test('exhausted request deadlines report TimeoutError and never synthesize replacement weather', async () => {
  let calls = 0;
  const s = defaultStudy(),
    before = structuredClone(s);
  await assert.rejects(
    downloadWeather(s, {
      timeoutMs: 5,
      retryDelayMs: 0,
      fetchImpl: (_, { signal }) => {
        calls++;
        return stall(signal);
      },
    }),
    (error) => error.name === 'TimeoutError' && /two attempts/.test(error.message),
  );
  assert.equal(calls, 2);
  assert.deepEqual(s, before);
});

test('user cancellation during a request or retry delay aborts promptly without another attempt', async () => {
  for (const duringDelay of [false, true]) {
    const controller = new AbortController();
    let calls = 0;
    const promise = fetchWeatherText('https://example.test', {
      signal: controller.signal,
      retryDelayMs: 10000,
      onProgress: () => controller.abort(),
      fetchImpl: (_, { signal }) => {
        calls++;
        if (duringDelay) return Promise.reject(new TypeError('Network'));
        return stall(signal);
      },
    });
    if (!duringDelay) controller.abort();
    await assert.rejects(promise, { name: 'AbortError' });
    assert.equal(calls, 1);
  }
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    fetchWeatherText('https://example.test', {
      signal: controller.signal,
      fetchImpl: () => assert.fail('Already cancelled request must not start'),
    }),
    { name: 'AbortError' },
  );
});

test('period download retries only the failed chunk and retains complete source snapshots and fractional offsets', async () => {
  const s = defaultStudy();
  s.site.utcOffset = 5.5;
  Object.assign(s.analysis, {
    period: 'season',
    year: 2024,
    startMonth: 2,
    endMonth: 3,
    date: '2024-02-01',
  });
  const urls = [],
    progress = [];
  const weather = await downloadWeather(s, {
    retryDelayMs: 0,
    onProgress: (message) => progress.push(message),
    fetchImpl: async (url) => {
      urls.push(url);
      if (urls.length === 2)
        return { ok: false, status: 503, json: async () => ({ reason: 'Busy' }) };
      return { ok: true, text: async () => responseFor(url) };
    },
  });
  assert.equal(urls.length, 3);
  assert.equal(urls[1], urls[2]);
  assert.notEqual(urls[0], urls[1]);
  assert.equal(weather.days.length, 60);
  assert.equal(weather.days[0].rows[0].duration, 30);
  assert.equal(weather.days.at(-1).rows.at(-1).duration, 30);
  const sources = JSON.parse(weather.sourceText);
  assert.deepEqual(
    sources.map((s) => s.url),
    [urls[0], urls[2]],
  );
  assert.match(progress[2], /2024-03-03 to 2024-03-31:.*attempt 2 of 2/);
});

test('invalid weather payloads are not retried as network failures', async () => {
  let calls = 0;
  await assert.rejects(
    downloadWeather(defaultStudy(), {
      fetchImpl: async () => {
        calls++;
        return { ok: true, text: async () => '<html>not weather</html>' };
      },
    }),
    /unreadable response/,
  );
  assert.equal(calls, 1);
});
