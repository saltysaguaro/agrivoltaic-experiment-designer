import { analysisPeriod, periodDates, isPeriod } from '../domain/period.js';
import { analysisKey, sha256, VERSION } from '../domain/study.js';
import { calculateDay } from './engine.js';
import { verifyWeatherRecord } from './weather-record.js';
import { canonicalWeatherInput } from './weather-validation.js';
import { sampleWeather } from './solar.js';

export function weatherForPeriod(s) {
  const dates = periodDates(s);
  if (s.weather.mode === 'sample')
    return dates.map((date) => ({
      date,
      rows: sampleWeather({ ...s, analysis: { ...s.analysis, date } }),
    }));
  if (!isPeriod(s)) return [{ date: dates[0], rows: s.weather.rows }];
  const days = s.weather.days ?? [];
  if (days.length !== dates.length || days.some((d, i) => d.date !== dates[i]))
    throw Error(
      'Weather must contain every date in the selected period, in order, with no missing or duplicate days. Download or upload the complete period.',
    );
  return days;
}
export async function resultWeatherHash(s) {
  if (!isPeriod(s))
    return sha256(
      canonicalWeatherInput({ rows: s.weather.rows.length ? s.weather.rows : sampleWeather(s) }),
    );
  return sha256(canonicalWeatherInput({ rows: [], days: weatherForPeriod(s) }));
}
export async function calculateStudy(s, onProgress = () => {}, options = {}) {
  if (!isPeriod(s)) return calculateDay(s, onProgress, options);
  await verifyWeatherRecord(s.weather);
  const days = weatherForPeriod(s),
    period = analysisPeriod(s),
    key = analysisKey(s);
  const old = options.checkpoint?.key === key ? options.checkpoint : null;
  let state = old
    ? structuredClone(old)
    : {
        key,
        completedDays: 0,
        wh: null,
        dli: null,
        openWh: 0,
        openDli: 0,
        daily: [],
        backends: [],
        warnings: [],
        estimated: false,
        seconds: 0,
        cached: 0,
      };
  if (s.weather.mode === 'sample')
    state.warnings = [
      ...new Set([
        ...state.warnings,
        'Synthetic illustrative weather for every day; replace with site weather before publication.',
      ]),
    ];
  let last;
  const started = performance.now(),
    baseSeconds = state.seconds;
  for (let i = state.completedDays; i < days.length; i++) {
    const day = days[i],
      single = {
        ...s,
        analysis: { ...s.analysis, period: 'day', date: day.date },
        weather: {
          ...s.weather,
          days: [],
          rows: day.rows,
          sourceText: undefined,
          hash: '',
          normalizedHash: '',
        },
      };
    const r = await calculateDay(
      single,
      (p) =>
        onProgress({
          ...p,
          progress: (i + p.progress) / days.length,
          message: `Day ${i + 1}/${days.length} · ${day.date} · ${p.message}`,
        }),
      { ...options, allowZero: true },
    );
    last = r;
    state.wh ??= new Float64Array(r.cells.length);
    state.dli ??= new Float64Array(r.cells.length);
    r.cells.forEach((c, j) => {
      state.wh[j] += c.wh;
      state.dli[j] += c.dli;
    });
    state.openWh += r.openWh;
    state.openDli += r.openDli;
    state.estimated ||= r.estimated;
    state.cached += r.cached;
    state.backends = [...new Set([...state.backends, r.backend])];
    state.warnings = [...new Set([...state.warnings, ...r.warnings])].slice(0, 900);
    state.daily.push({
      date: day.date,
      openWh: r.openWh,
      openDli: r.openDli,
      meanWh: r.cells.reduce((n, c) => n + c.wh, 0) / r.cells.length,
      meanDli: r.meanDli,
      meanSunlight: r.openWh ? r.meanSunlight : null,
      backend: r.backend,
    });
    state.completedDays = i + 1;
    state.seconds = baseSeconds + (performance.now() - started) / 1000;
    options.onCheckpoint?.(structuredClone(state));
  }
  if (!state.openWh) throw Error('The selected period has no incoming solar energy.');
  // A completed checkpoint is never emitted as a substitute for final provenance.
  if (!last) {
    const { receiverGrid } = await import('../domain/geometry.js');
    const g = receiverGrid(s);
    last = { cells: g.points, grid: { ...g, points: undefined } };
  }
  const cells = last.cells.map((c, i) => ({
    ...c,
    wh: state.wh[i],
    dli: state.dli[i] / days.length,
    sunlight: Math.max(0, Math.min(100, (100 * state.wh[i]) / state.openWh)),
    shade: Math.max(0, Math.min(100, 100 * (1 - state.wh[i] / state.openWh))),
  }));
  const monthly = [];
  for (const date of state.daily) {
    const month = date.date.slice(0, 7);
    let m = monthly.find((v) => v.month === month);
    if (!m) {
      m = { month, days: 0, openWh: 0, meanWh: 0, meanDli: 0 };
      monthly.push(m);
    }
    m.days++;
    m.openWh += date.openWh;
    m.meanWh += date.meanWh;
    m.meanDli += date.meanDli;
  }
  monthly.forEach((m) => {
    m.meanDli /= m.days;
    m.meanSunlight = m.openWh ? (100 * m.meanWh) / m.openWh : null;
  });
  const weatherInputHash = await resultWeatherHash(s);
  return {
    key,
    studyHash: await sha256(key),
    weatherHash: s.weather.hash || weatherInputHash,
    weatherInputHash,
    date: s.analysis.date,
    period,
    cells,
    grid: last.grid,
    openWh: state.openWh,
    openDli: state.openDli / days.length,
    estimated: state.estimated,
    backend: state.backends.join(' + '),
    version: VERSION,
    createdAt: new Date().toISOString(),
    seconds: state.seconds,
    cached: state.cached,
    warnings: state.warnings,
    daily: state.daily,
    monthly,
    meanSunlight: cells.reduce((n, c) => n + c.sunlight, 0) / cells.length,
    meanShade: cells.reduce((n, c) => n + c.shade, 0) / cells.length,
    meanDli: cells.reduce((n, c) => n + c.dli, 0) / cells.length,
  };
}
