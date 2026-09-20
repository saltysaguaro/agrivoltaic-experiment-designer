import { gridMean } from '../domain/receiver-grid.js';
import { analysisPeriod, periodDates, isPeriod } from '../domain/period.js';
import { analysisKey, sha256, VERSION, MODEL_REVISION } from '../domain/study.js';
import { calculateDay, createEngineSession } from './engine.js';
import { verifyWeatherRecord } from './weather-record.js';
import { canonicalWeatherInput } from './weather-validation.js';
import { sampleWeather } from './solar.js';
import { receiverGridSpec } from '../domain/geometry.js';

export function weatherForPeriod(s) {
  const dates = periodDates(s);
  if (!isPeriod(s))
    return [
      {
        date: dates[0],
        rows: s.weather.rows.length
          ? s.weather.rows
          : s.weather.mode === 'sample'
            ? sampleWeather(s)
            : [],
      },
    ];
  if (s.weather.mode === 'sample')
    return dates.map((date) => ({
      date,
      rows: sampleWeather({ ...s, analysis: { ...s.analysis, date } }),
    }));
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
export function sourceReferences(s) {
  return weatherForPeriod(s).map(({ date, rows }) => {
    if (!rows.length) throw Error('Retained source weather is missing.');
    const openWh = rows.reduce((n, w) => n + (w.ghi * w.duration) / 60, 0),
      estimated = !rows.every((w) => w.ppfd !== undefined),
      openDli = estimated
        ? (openWh * s.analysis.parFraction * s.analysis.photonFactor * 3600) / 1e6
        : rows.reduce((n, w) => n + (w.ppfd * w.duration * 60) / 1e6, 0);
    return { date, openWh, openDli, estimated };
  });
}
export function validateCheckpoint(s, state) {
  const close = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
  const grid = receiverGridSpec(s),
    count = grid.nx * grid.ny,
    refs = sourceReferences(s);
  if (
    grid.exceeded ||
    !Number.isInteger(state.completedDays) ||
    state.completedDays < 1 ||
    state.completedDays > refs.length ||
    state.daily?.length !== state.completedDays ||
    state.wh?.length !== count ||
    state.dli?.length !== count
  )
    throw Error('Invalid period checkpoint dimensions or dates.');
  let openWh = 0,
    openDli = 0;
  for (let i = 0; i < state.completedDays; i++) {
    const d = state.daily[i],
      source = refs[i];
    if (
      d.date !== source.date ||
      !close(d.openWh, source.openWh) ||
      !close(d.openDli, source.openDli) ||
      ![d.meanWh, d.meanDli].every((v) => Number.isFinite(v) && v >= 0) ||
      d.meanWh > d.openWh + 1e-6 ||
      d.meanDli > d.openDli + 1e-6 ||
      (d.openWh ? !close(d.meanSunlight, (100 * d.meanWh) / d.openWh) : d.meanSunlight !== null)
    )
      throw Error('Invalid period checkpoint source totals.');
    openWh += source.openWh;
    openDli += source.openDli;
  }
  if (
    !close(state.openWh, openWh) ||
    !close(state.openDli, openDli) ||
    state.estimated !== refs.slice(0, state.completedDays).some((d) => d.estimated) ||
    ![...state.wh].every((v) => Number.isFinite(v) && v >= 0 && v <= openWh + 1e-6) ||
    ![...state.dli].every((v) => Number.isFinite(v) && v >= 0 && v <= openDli + 1e-6) ||
    ![state.seconds, state.cached].every((v) => Number.isFinite(v) && v >= 0) ||
    !Array.isArray(state.backends) ||
    !state.backends.every((v) => typeof v === 'string') ||
    !Array.isArray(state.warnings) ||
    !state.warnings.every((v) => typeof v === 'string')
  )
    throw Error('Invalid period checkpoint energy or provenance.');
  const cells = Array.from(state.wh, (wh, i) => ({ wh, dli: state.dli[i] }));
  if (
    !close(
      gridMean(cells, grid, 'wh'),
      state.daily.reduce((n, d) => n + d.meanWh, 0),
    ) ||
    !close(
      gridMean(cells, grid, 'dli'),
      state.daily.reduce((n, d) => n + d.meanDli, 0),
    )
  )
    throw Error('Checkpoint receiver totals do not match daily summaries.');
}
export async function calculateStudy(s, onProgress = () => {}, options = {}) {
  if (!isPeriod(s)) return calculateDay(s, onProgress, options);
  await verifyWeatherRecord(s.weather);
  const days = weatherForPeriod(s),
    period = analysisPeriod(s),
    key = analysisKey(s);
  const old = options.checkpoint?.key === key ? options.checkpoint : null;
  if (old) validateCheckpoint(s, old);
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
  const session = createEngineSession();
  try {
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
        { ...options, session, allowZero: true },
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
        meanWh: gridMean(r.cells, r.grid, 'wh'),
        meanDli: r.meanDli,
        meanSunlight: r.openWh ? r.meanSunlight : null,
        backend: r.backend,
      });
      state.completedDays = i + 1;
      state.seconds = baseSeconds + (performance.now() - started) / 1000;
      options.onCheckpoint?.(structuredClone(state));
    }
  } finally {
    session.dispose();
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
    samplesPerCell: s.analysis.samplesPerCell ?? 1,
    period,
    cells,
    grid: last.grid,
    openWh: state.openWh,
    openDli: state.openDli / days.length,
    estimated: state.estimated,
    backend: state.backends.join(' + '),
    version: VERSION,
    modelRevision: MODEL_REVISION,
    createdAt: new Date().toISOString(),
    seconds: state.seconds,
    cached: state.cached,
    warnings: state.warnings,
    daily: state.daily,
    monthly,
    meanSunlight: gridMean(cells, last.grid, 'sunlight'),
    meanShade: gridMean(cells, last.grid, 'shade'),
    meanDli: gridMean(cells, last.grid, 'dli'),
  };
}
