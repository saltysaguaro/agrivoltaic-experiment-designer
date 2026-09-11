import { periodDates, isPeriod } from '../domain/period.js';
import { validateWeatherRows } from './weather-validation.js';
import { weatherRecord } from './weather-record.js';
function csvLine(line) {
  return (line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g) || [])
    .filter((v, i, a) => i < a.length - 1 || v)
    .map((v) => v.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
}
async function parseWeatherDay(text, name, date, retain = true) {
  const lines = text.trim().split(/\r?\n/),
    epw = lines[0].startsWith('LOCATION,'),
    tmy = !epw && lines[1]?.includes('GHI (W/m^2)');
  let rows = [],
    site = null;
  if (epw) {
    const meta = csvLine(lines[0]);
    site = { latitude: +meta[6], longitude: +meta[7], utcOffset: +meta[8], elevation: +meta[9] };
    for (const line of lines.slice(8)) {
      const c = csvLine(line);
      if (+c[1] !== +date.slice(5, 7) || +c[2] !== +date.slice(8, 10)) continue;
      rows.push({ minute: (+c[3] - 1) * 60, duration: 60, ghi: +c[13], dni: +c[14], dhi: +c[15] });
    }
  } else {
    const head = csvLine(lines[tmy ? 1 : 0]).map((h) => h.trim().toLowerCase()),
      get = (c, ...keys) => {
        const i = head.findIndex((v) => keys.includes(v));
        return i < 0 ? undefined : c[i];
      };
    if (tmy) {
      const meta = csvLine(lines[0]);
      site = { latitude: +meta[4], longitude: +meta[5], utcOffset: +meta[3], elevation: +meta[6] };
    }
    for (const line of lines.slice(tmy ? 2 : 1)) {
      if (!line.trim()) continue;
      const c = csvLine(line),
        stamp = get(c, 'timestamp', 'time', 'time (hh:mm)'),
        day = get(c, 'date (mm/dd/yyyy)');
      let minute;
      if (tmy) {
        if (!day) throw Error('Missing TMY3 date.');
        const parts = day.split('/');
        if (+parts[0] !== +date.slice(5, 7) || +parts[1] !== +date.slice(8, 10)) continue;
        minute = +stamp.split(':')[0] * 60 + +stamp.split(':')[1] - 60;
      } else {
        if (!stamp) throw Error('CSV requires timestamp,GHI,DNI,DHI columns.');
        if (stamp.includes('T') || stamp.includes(' ')) {
          if (stamp.slice(0, 10) !== date) continue;
          if (/[Zz]|[+-]\d\d:\d\d$/.test(stamp))
            throw Error(
              'Use local standard timestamps without Z or UTC offsets; set site UTC offset separately.',
            );
        }
        const match = stamp.match(/(?:T|\s|^)(\d{1,2}):(\d{2})/);
        if (!match) throw Error('Use YYYY-MM-DDTHH:mm or HH:mm timestamps.');
        minute = +match[1] * 60 + +match[2];
      }
      const val = (...keys) => {
        const value = get(c, ...keys);
        return value === undefined || value === '' ? undefined : Number(value);
      };
      rows.push({
        minute,
        duration: val('duration_minutes') ?? 60,
        ghi: val('ghi', 'ghi (w/m^2)'),
        dni: val('dni', 'dni (w/m^2)'),
        dhi: val('dhi', 'dhi (w/m^2)'),
        ...(val('ppfd') !== undefined ? { ppfd: val('ppfd') } : {}),
        ...(val('diffuse_ppfd') !== undefined ? { diffusePpfd: val('diffuse_ppfd') } : {}),
      });
    }
  }
  rows.sort((a, b) => a.minute - b.minute);
  if (!rows.length) throw Error('No weather records for the selected date.');
  validateWeatherRows(rows);
  return {
    weather: {
      name,
      ...(retain ? await weatherRecord(rows, text) : { rows }),
      format: epw ? 'EPW' : tmy ? 'TMY3' : 'CSV',
    },
    site,
  };
}
export const weatherTemplate =
  'timestamp,duration_minutes,GHI,DNI,DHI,PPFD,diffuse_PPFD\n' +
  Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00,60,0,0,0,,`).join('\n');

export async function parseWeather(text, name, dateOrStudy) {
  if (typeof dateOrStudy === 'string' || !isPeriod(dateOrStudy))
    return parseWeatherDay(
      text,
      name,
      typeof dateOrStudy === 'string' ? dateOrStudy : dateOrStudy.analysis.date,
    );
  const epw = text.startsWith('LOCATION,'),
    tmy = text.split(/\r?\n/)[1]?.includes('GHI (W/m^2)');
  if (
    !epw &&
    !tmy &&
    text
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .some((line) => line.trim() && !/\d{4}-\d{2}-\d{2}[T ]/.test(line))
  )
    throw Error('Season/year CSV files require YYYY-MM-DDTHH:mm timestamps for every interval.');
  const days = [];
  let site, format;
  for (const date of periodDates(dateOrStudy)) {
    let parsed;
    try {
      parsed = await parseWeatherDay(text, name, date, false);
    } catch (e) {
      throw Error(`${date}: ${e.message}`);
    }
    days.push({ date, rows: parsed.weather.rows });
    site = parsed.site;
    format = parsed.weather.format;
    if (days.length % 8 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { site, weather: { name, format, ...(await weatherRecord([], text, days)) } };
}
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
