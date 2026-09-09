import { sha256 } from '../domain/study.js';
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
  if (Math.abs(end - 1440) > 1e-7)
    throw Error(
      'Weather is not available for the complete selected day. Choose another date or upload weather.',
    );
  return rows;
}
export async function downloadWeather(
  s,
  { signal, fetchImpl = globalThis.fetch, now = new Date() } = {},
) {
  const request = weatherRequest(s, now),
    response = await fetchImpl(request.url, { signal });
  if (!response.ok) {
    let reason = '';
    try {
      reason = (await response.json()).reason || '';
    } catch {}
    throw Error(
      `Weather download failed (${response.status}). ${reason || 'Retry or upload a weather file.'}`,
    );
  }
  const raw = await response.text();
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
    hash: await sha256(raw),
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
