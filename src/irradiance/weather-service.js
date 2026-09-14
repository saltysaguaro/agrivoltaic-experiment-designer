import { analysisPeriod, periodDates, isPeriod } from '../domain/period.js';
import { weatherRecord } from './weather-record.js';
import { validateWeatherRows } from './weather-validation.js';
import { fetchWeatherText } from './weather-fetch.js';
const HOUR = 3600000,
  DAY = 24 * HOUR;
export const WEATHER_ATTRIBUTION =
  'Weather data by Open-Meteo.com (CC BY 4.0); historical reanalysis: Copernicus ERA5.';
export function weatherRequestKey(s) {
  return JSON.stringify([
    s.site.latitude,
    s.site.longitude,
    s.site.utcOffset,
    s.site.elevation,
    s.analysis.date,
    analysisPeriod(s),
  ]);
}
export function weatherRequest(s, now = new Date()) {
  const start = Date.parse(s.analysis.date + 'T00:00:00Z') - s.site.utcOffset * HOUR,
    end = start + DAY;
  if (!Number.isFinite(start)) throw Error('Choose a valid analysis date.');
  const historical = end <= now.getTime() - 6 * DAY;
  if (start > now.getTime() + 14 * DAY)
    throw Error(
      'Weather forecasts are available only about two weeks ahead. Choose a historical study date or upload representative weather for a future experiment.',
    );
  if (start < Date.UTC(1940, 0, 1))
    throw Error('Automatic historical weather starts in 1940. Upload weather for an earlier date.');
  const model = historical ? 'ERA5 reanalysis' : 'Open-Meteo forecast / recent model output';
  const url = new URL(
    historical
      ? 'https://archive-api.open-meteo.com/v1/archive'
      : 'https://api.open-meteo.com/v1/forecast',
  );
  const params = {
    latitude: s.site.latitude,
    longitude: s.site.longitude,
    elevation: s.site.elevation,
    start_date: new Date(start).toISOString().slice(0, 10),
    end_date: new Date(Math.ceil(end / HOUR) * HOUR).toISOString().slice(0, 10),
    timezone: 'GMT',
    hourly: 'shortwave_radiation,direct_normal_irradiance,diffuse_radiation',
    ...(historical ? { models: 'era5' } : {}),
  };
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return { url: url.href, start, end, model, historical, key: weatherRequestKey(s) };
}
export function normalizeWeatherResponse(data, request) {
  const h = data.hourly,
    units = data.hourly_units;
  if (!h?.time?.length) throw Error(data.reason || 'The weather service returned no hourly data.');
  for (const key of ['shortwave_radiation', 'direct_normal_irradiance', 'diffuse_radiation']) {
    if (!Array.isArray(h[key]) || h[key].length !== h.time.length)
      throw Error('The weather response is incomplete.');
    if (units?.[key] && !['W/m²', 'W/m2'].includes(units[key]))
      throw Error('Unexpected irradiance units from the weather service.');
  }
  const rows = [];
  h.time.forEach((stamp, i) => {
    // Open-Meteo radiation is the PRECEDING hour mean; its timestamp is the END.
    const end = Date.parse(stamp.endsWith('Z') ? stamp : stamp + 'Z'),
      start = end - HOUR,
      a = Math.max(start, request.start),
      b = Math.min(end, request.end);
    if (b <= a) return;
    const values = [
      h.shortwave_radiation[i],
      h.direct_normal_irradiance[i],
      h.diffuse_radiation[i],
    ];
    if (values.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0))
      throw Error(
        'Weather is not yet available for the entire selected day. Choose an earlier date or upload a complete weather file.',
      );
    const [ghi, dni, dhi] = values;
    if (dhi > ghi + 0.2)
      throw Error(
        'Downloaded diffuse radiation exceeds total radiation. Upload a checked weather file.',
      );
    rows.push({
      minute: (a - request.start) / 60000,
      duration: (b - a) / 60000,
      ghi,
      dni,
      dhi: Math.min(dhi, ghi),
    });
  });
  rows.sort((a, b) => a.minute - b.minute);
  let end = 0;
  for (const r of rows) {
    if (Math.abs(r.minute - end) > 1e-7)
      throw Error('Downloaded weather has missing or overlapping hours.');
    end = r.minute + r.duration;
  }
  if (Math.abs(end - (request.end - request.start) / 60000) > 1e-7)
    throw Error(
      'Weather is not available for the complete selected day. Choose another date or upload weather.',
    );
  validateWeatherRows(rows, { totalMinutes: (request.end - request.start) / 60000 });
  return rows;
}
async function downloadDayWeather(s, options = {}) {
  const { now = new Date() } = options;
  const request = weatherRequest(s, now),
    raw = await fetchWeatherText(request.url, options);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw Error('The weather service returned an unreadable response.');
  }
  const rows = normalizeWeatherResponse(data, request);
  return {
    mode: 'automatic',
    name: `Open-Meteo · ${request.model} · ${s.analysis.date}`,
    ...(await weatherRecord(rows, raw)),
    format: 'Open-Meteo',
    rows,
    requestKey: request.key,
    provenance: {
      url: request.url,
      model: request.model,
      retrievedAt: new Date().toISOString(),
      attribution: WEATHER_ATTRIBUTION,
      gridLatitude: data.latitude,
      gridLongitude: data.longitude,
      gridElevation: data.elevation,
    },
  };
}

export async function downloadWeather(s, options = {}) {
  if (!isPeriod(s)) return downloadDayWeather(s, options);
  const { now = new Date(), onProgress = () => {} } = options;
  const dates = periodDates(s),
    requests = dates.map((date) =>
      weatherRequest({ ...s, analysis: { ...s.analysis, period: 'day', date } }, now),
    );
  const days = [],
    sources = [],
    models = new Set();
  let metadata;
  for (let i = 0; i < dates.length; ) {
    let j = i + 1;
    while (j < dates.length && j - i < 31 && requests[j].historical === requests[i].historical) j++;
    const request = { ...requests[i], end: requests[j - 1].end },
      url = new URL(request.url);
    url.searchParams.set(
      'end_date',
      new Date(Math.ceil(request.end / HOUR) * HOUR).toISOString().slice(0, 10),
    );
    request.url = url.href;
    onProgress(`Downloading weather: ${dates[i]} to ${dates[j - 1]} (${i}/${dates.length} days)`);
    const raw = await fetchWeatherText(request.url, {
        ...options,
        onProgress: (message) => onProgress(`${dates[i]} to ${dates[j - 1]}: ${message}`),
      }),
      data = JSON.parse(raw),
      rows = normalizeWeatherResponse(data, request);
    metadata ??= data;
    sources.push({ url: request.url, sourceText: raw });
    models.add(request.model);
    for (let k = i; k < j; k++) {
      const offset = (k - i) * 1440;
      const daily = [];
      for (const row of rows) {
        const a = Math.max(offset, row.minute),
          b = Math.min(offset + 1440, row.minute + row.duration);
        if (b > a) daily.push({ ...row, minute: a - offset, duration: b - a });
      }
      validateWeatherRows(daily);
      days.push({ date: dates[k], rows: daily });
    }
    i = j;
  }
  const model = [...models].join(' + '),
    sourceText = JSON.stringify(sources);
  return {
    mode: 'automatic',
    name: `Open-Meteo · ${model} · ${dates[0]} to ${dates.at(-1)}`,
    ...(await weatherRecord([], sourceText, days)),
    format: 'Open-Meteo period',
    requestKey: weatherRequestKey(s),
    provenance: {
      url: sources[0].url,
      model,
      retrievedAt: new Date().toISOString(),
      attribution: WEATHER_ATTRIBUTION,
      gridLatitude: metadata.latitude,
      gridLongitude: metadata.longitude,
      gridElevation: metadata.elevation,
    },
  };
}
