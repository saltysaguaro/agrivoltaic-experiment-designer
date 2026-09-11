const DAY = 86400000;
export const periodKeys = ['date', 'period', 'year', 'startMonth', 'endMonth'];
export function analysisPeriod(s) {
  const a = s.analysis,
    mode = a.period ?? 'day';
  let start = a.date,
    end = a.date;
  if (mode !== 'day') {
    const year = a.year ?? Number(a.date.slice(0, 4));
    const first = mode === 'year' ? 1 : (a.startMonth ?? 4);
    const last = mode === 'year' ? 12 : (a.endMonth ?? 9);
    start = `${year}-${String(first).padStart(2, '0')}-01`;
    end = new Date(Date.UTC(year + (last < first ? 1 : 0), last, 0)).toISOString().slice(0, 10);
  }
  const days = Math.round((Date.parse(end) - Date.parse(start)) / DAY) + 1;
  if (!Number.isFinite(days) || days < 1 || days > 366)
    throw Error('Choose a valid period of at most 366 days.');
  return { mode, start, end, days };
}
export function periodDates(s) {
  const p = analysisPeriod(s),
    start = Date.parse(p.start);
  return Array.from({ length: p.days }, (_, i) =>
    new Date(start + i * DAY).toISOString().slice(0, 10),
  );
}
export function periodLabel(s) {
  const p = analysisPeriod(s);
  return p.mode === 'day' ? p.start : `${p.start} to ${p.end} (${p.days} days)`;
}
export const isPeriod = (s) => (s.analysis.period ?? 'day') !== 'day';
export const dliLabel = (r) =>
  `${r?.period?.days > 1 ? 'Mean daily ' : ''}${r?.estimated === false ? 'DLI' : 'Estimated DLI'}`;

export const hasWeather = (s) =>
  isPeriod(s) ? Boolean(s.weather.days?.length) : Boolean(s.weather.rows.length);
