import { periodDates, isPeriod } from '../domain/period.js';
import { validateWeatherRows } from './weather-validation.js';
import { weatherRecord } from './weather-record.js';
export const MAX_WEATHER_BYTES = 25000000;
export const MAX_WEATHER_RECORDS = 600000;
function csvLine(line) {
  return (line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g) || [])
    .filter((v, i, a) => i < a.length - 1 || v)
    .map((v) => v.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
}
function localTimestamp(stamp) {
  const match = /^(?:(\d{4}-\d{2}-\d{2})[T ])?(\d{1,2}):(\d{2})$/.exec(stamp || '');
  if (!match)
    throw Error(
      'Use local standard timestamps YYYY-MM-DDTHH:mm or HH:mm without Z or UTC offsets; set site UTC offset separately.',
    );
  const [, date, hour, minute] = match;
  if (
    +hour > 23 ||
    +minute > 59 ||
    (date && new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) !== date)
  )
    throw Error('Invalid local weather date or time.');
  return { date, minute: +hour * 60 + +minute };
}
export async function parseWeather(text, name, dateOrStudy) {
  if (
    text.length > MAX_WEATHER_BYTES ||
    new TextEncoder().encode(text).byteLength > MAX_WEATHER_BYTES
  )
    throw Error('Weather files must be no larger than 25 MB.');
  const lines = text.trim().split(/\r?\n/);
  if (lines.length > MAX_WEATHER_RECORDS + 8)
    throw Error('Weather files may contain at most 600,000 intervals.');
  const epw = lines[0].startsWith('LOCATION,'),
    tmy = !epw && lines[1]?.includes('GHI (W/m^2)'),
    period = typeof dateOrStudy !== 'string' && isPeriod(dateOrStudy),
    dates = typeof dateOrStudy === 'string' ? [dateOrStudy] : periodDates(dateOrStudy),
    format = epw ? 'EPW' : tmy ? 'TMY3' : 'CSV',
    header = csvLine(lines[tmy ? 1 : 0]).map((h) => h.trim().toLowerCase()),
    index = new Map(),
    get = (c, ...names) => c[header.findIndex((h) => names.includes(h))];
  let site = null;
  if (epw || tmy) {
    const meta = csvLine(lines[0]);
    site = epw
      ? { latitude: +meta[6], longitude: +meta[7], utcOffset: +meta[8], elevation: +meta[9] }
      : { latitude: +meta[4], longitude: +meta[5], utcOffset: +meta[3], elevation: +meta[6] };
  }
  // Tokenize each source record once, retaining EPW/TMY3 climatological month/day semantics.
  for (let i = epw ? 8 : tmy ? 2 : 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = csvLine(lines[i]);
    let key, row;
    if (epw) {
      if (!Number.isInteger(+c[3]) || +c[3] < 1 || +c[3] > 24)
        throw Error('Invalid EPW interval-ending hour.');
      key = `${String(+c[1]).padStart(2, '0')}-${String(+c[2]).padStart(2, '0')}`;
      row = { minute: (+c[3] - 1) * 60, duration: 60, ghi: +c[13], dni: +c[14], dhi: +c[15] };
    } else {
      const stamp = get(c, 'timestamp', 'time', 'time (hh:mm)');
      let minute;
      if (tmy) {
        const day = /^(\d{1,2})\/(\d{1,2})\/\d{4}$/.exec(get(c, 'date (mm/dd/yyyy)') || ''),
          time = /^(\d{1,2}):(\d{2})$/.exec(stamp || '');
        if (!day || !time || +time[1] < 1 || +time[1] > 24 || +time[2] !== 0)
          throw Error('Invalid TMY3 date or interval-ending hour.');
        key = `${day[1].padStart(2, '0')}-${day[2].padStart(2, '0')}`;
        minute = +time[1] * 60 - 60;
      } else {
        const parsed = localTimestamp(stamp);
        if (period && !parsed.date)
          throw Error(
            'Season/year CSV files require YYYY-MM-DDTHH:mm timestamps for every interval.',
          );
        key = parsed.date || dates[0];
        minute = parsed.minute;
      }
      const val = (...names) => {
        const value = get(c, ...names);
        return value === undefined || value === '' ? undefined : Number(value);
      };
      row = {
        minute,
        duration: val('duration_minutes') ?? 60,
        ghi: val('ghi', 'ghi (w/m^2)'),
        dni: val('dni', 'dni (w/m^2)'),
        dhi: val('dhi', 'dhi (w/m^2)'),
        ...(val('ppfd') !== undefined ? { ppfd: val('ppfd') } : {}),
        ...(val('diffuse_ppfd') !== undefined ? { diffusePpfd: val('diffuse_ppfd') } : {}),
      };
    }
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
  }
  const days = dates.map((date) => {
    const rows = index.get(epw || tmy ? date.slice(5) : date);
    if (!rows?.length) throw Error(`${date}: No weather records for the selected date.`);
    rows.sort((a, b) => a.minute - b.minute);
    try {
      validateWeatherRows(rows);
    } catch (e) {
      throw Error(`${date}: ${e.message}`);
    }
    return { date, rows };
  });
  return {
    site,
    weather: {
      name,
      format,
      ...(await weatherRecord(period ? [] : days[0].rows, text, period ? days : undefined)),
    },
  };
}
export const weatherTemplate =
  'timestamp,duration_minutes,GHI,DNI,DHI,PPFD,diffuse_PPFD\n' +
  Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00,60,0,0,0,,`).join('\n');
export function periodWeatherTemplate(s) {
  return (
    'timestamp,duration_minutes,GHI,DNI,DHI,PPFD,diffuse_PPFD\n' +
    periodDates(s)
      .flatMap((date) =>
        Array.from({ length: 24 }, (_, i) => `${date}T${String(i).padStart(2, '0')}:00,60,0,0,0,,`),
      )
      .join('\n')
  );
}
