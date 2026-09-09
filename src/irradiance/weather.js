import { sha256 } from '../domain/study.js';
function csvLine(line) {
  return (line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g) || [])
    .filter((v, i, a) => i < a.length - 1 || v)
    .map((v) => v.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
}
export async function parseWeather(text, name, date) {
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
  let end = 0;
  for (const r of rows) {
    if (
      ![r.minute, r.duration, r.ghi, r.dni, r.dhi].every(Number.isFinite) ||
      r.minute < 0 ||
      r.minute + r.duration > 1440 ||
      r.duration <= 0 ||
      r.minute < end
    )
      throw Error('Weather contains missing values, overlapping intervals, or invalid times.');
    if (r.ghi < 0 || r.ghi > 1500 || r.dni < 0 || r.dni > 1600 || r.dhi < 0 || r.dhi > r.ghi)
      throw Error('Weather irradiance must be valid W/m² and 0 ≤ DHI ≤ GHI.');
    if (r.ppfd !== undefined && (!Number.isFinite(r.ppfd) || r.ppfd < 0 || r.ppfd > 4000))
      throw Error('PPFD must be 0–4000 µmol m⁻² s⁻¹.');
    if (
      r.diffusePpfd !== undefined &&
      (r.ppfd === undefined ||
        !Number.isFinite(r.diffusePpfd) ||
        r.diffusePpfd < 0 ||
        r.diffusePpfd > r.ppfd)
    )
      throw Error('Diffuse PPFD requires total PPFD and must be between zero and total PPFD.');
    end = r.minute + r.duration;
  }
  if (rows.some((r) => r.ppfd !== undefined) && rows.some((r) => r.ppfd === undefined))
    throw Error('Provide PPFD for every interval or omit the PPFD column.');
  if (rows[0].minute !== 0 || end !== 1440 || rows.reduce((n, r) => n + r.duration, 0) !== 1440)
    throw Error(
      'A daily analysis requires complete, contiguous 24-hour weather coverage, including nighttime zeros.',
    );
  return {
    weather: { name, hash: await sha256(text), format: epw ? 'EPW' : tmy ? 'TMY3' : 'CSV', rows },
    site,
  };
}
export const weatherTemplate =
  'timestamp,duration_minutes,GHI,DNI,DHI,PPFD,diffuse_PPFD\n' +
  Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00,60,0,0,0,,`).join('\n');
