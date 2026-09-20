import { cellLocal, gridMean } from '../domain/receiver-grid.js';
import { resultWeatherHash, sourceReferences } from '../irradiance/period-engine.js';
import { isPeriod, analysisPeriod, periodDates } from '../domain/period.js';
import { analysisKey, sha256 } from '../domain/study.js';
import { receiverGridSpec, localToWorld } from '../domain/geometry.js';
const close = (a, b) =>
  Array.isArray(b)
    ? Array.isArray(a) && a.length === b.length && b.every((v, i) => close(a[i], v))
    : Number.isFinite(a) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
export async function validateResult(s, r) {
  if (!r || typeof r !== 'object') throw Error('No calculated results were included.');
  const key = analysisKey(s);
  if ((r.samplesPerCell ?? 1) !== (s.analysis.samplesPerCell ?? 1))
    throw Error('Saved within-cell sampling does not match this project.');
  if (r.key !== key || r.studyHash !== (await sha256(key)) || r.date !== s.analysis.date)
    throw Error('Saved light results belong to different or older analysis inputs.');
  const weatherHash = await resultWeatherHash(s);
  if (r.weatherInputHash !== weatherHash || (s.weather.hash && r.weatherHash !== s.weather.hash))
    throw Error('Saved light results do not match the retained weather.');
  const references = sourceReferences(s);
  const sourceWh = references.reduce((n, d) => n + d.openWh, 0),
    sourceDli = references.reduce((n, d) => n + d.openDli, 0) / references.length;
  if (
    !close(r.openWh, sourceWh) ||
    !close(r.openDli, sourceDli) ||
    r.estimated !== references.some((d) => d.estimated)
  )
    throw Error('Saved open-field totals or PAR provenance do not match retained weather.');
  const g = receiverGridSpec(s),
    count = g.nx * g.ny;
  if (count > 20000 || !Array.isArray(r.cells) || r.cells.length !== count)
    throw Error('Saved receiver count does not match this project.');
  if (
    !r.grid ||
    (!g.yEdges && r.grid.yEdges !== undefined) ||
    !Object.entries(g).every(([k, v]) => close(r.grid[k], v))
  )
    throw Error('Saved receiver-grid geometry does not match this project.');
  for (const key of ['openWh', 'openDli', 'seconds', 'meanSunlight', 'meanShade', 'meanDli'])
    if (!Number.isFinite(r[key]) || r[key] < 0 || r[key] > 1e9)
      throw Error('Invalid saved light summary: ' + key);
  if (
    r.openWh <= 0 ||
    typeof r.estimated !== 'boolean' ||
    typeof r.backend !== 'string' ||
    !r.backend ||
    r.backend.length > 100 ||
    typeof r.version !== 'string' ||
    r.version.length > 50 ||
    !Number.isFinite(Date.parse(r.createdAt))
  )
    throw Error('Saved results lack valid calculation provenance.');
  if (
    !Array.isArray(r.warnings) ||
    r.warnings.length > 1000 ||
    r.warnings.some((w) => typeof w !== 'string' || w.length > 2000)
  )
    throw Error('Invalid saved calculation warnings.');

  for (const [i, c] of r.cells.entries()) {
    const { x: lx, y: ly } = cellLocal(g, i % g.nx, Math.floor(i / g.nx));
    const point = localToWorld(s, lx, ly, s.analysis.receiverHeight);
    if (
      !c ||
      !close(c.x, point.x) ||
      !close(c.y, point.y) ||
      !close(c.z, point.z) ||
      !close(c.lx, lx) ||
      !close(c.ly, ly)
    )
      throw Error('Invalid position/order in saved receiver ' + (i + 1));
    for (const key of ['wh', 'dli', 'sunlight', 'shade'])
      if (
        !Number.isFinite(c[key]) ||
        c[key] < 0 ||
        c[key] > (['shade', 'sunlight'].includes(key) ? 100 : 1e9)
      )
        throw Error('Invalid light value in receiver ' + (i + 1));
    if (
      c.wh > r.openWh + 1e-7 * Math.max(1, r.openWh) ||
      c.dli > r.openDli + 1e-7 * Math.max(1, r.openDli)
    )
      throw Error('Saved receiver light exceeds its open-field reference.');
    const fraction = Math.max(0, Math.min(100, (100 * c.wh) / r.openWh));
    if (!close(c.sunlight, fraction) || !close(c.shade, 100 - fraction))
      throw Error('Inconsistent sunlight values in receiver ' + (i + 1));
  }
  if (
    !close(r.meanSunlight, gridMean(r.cells, g, 'sunlight')) ||
    !close(r.meanShade, gridMean(r.cells, g, 'shade')) ||
    !close(r.meanDli, gridMean(r.cells, g, 'dli'))
  )
    throw Error('Saved summary does not match the receiver values.');
  if (isPeriod(s)) {
    const p = analysisPeriod(s),
      dates = periodDates(s);
    if (
      !r.period ||
      Object.keys(p).some((k) => r.period[k] !== p[k]) ||
      !Array.isArray(r.daily) ||
      r.daily.length !== p.days
    )
      throw Error('Saved period or daily summaries do not match the selected calendar range.');
    for (const [i, d] of r.daily.entries()) {
      if (
        d.date !== dates[i] ||
        !close(d.openWh, references[i].openWh) ||
        !close(d.openDli, references[i].openDli) ||
        d.meanDli > d.openDli + 1e-7 * Math.max(1, d.openDli) ||
        !['openWh', 'openDli', 'meanWh', 'meanDli'].every(
          (k) => Number.isFinite(d[k]) && d[k] >= 0,
        ) ||
        typeof d.backend !== 'string' ||
        d.backend.length > 100 ||
        d.meanWh > d.openWh + 1e-6 ||
        (d.openWh ? !close(d.meanSunlight, (100 * d.meanWh) / d.openWh) : d.meanSunlight !== null)
      )
        throw Error('Invalid saved daily summary.');
    }
    const sum = (k) => r.daily.reduce((n, d) => n + d[k], 0);
    if (
      !close(sum('openWh'), r.openWh) ||
      !close(sum('openDli') / p.days, r.openDli) ||
      !close(sum('meanDli') / p.days, r.meanDli) ||
      !close(sum('meanWh'), gridMean(r.cells, g, 'wh'))
    )
      throw Error('Period totals do not match daily summaries.');
    const months = [...new Set(dates.map((d) => d.slice(0, 7)))];
    if (!Array.isArray(r.monthly) || r.monthly.length !== months.length)
      throw Error('Invalid monthly summaries.');
    months.forEach((month, i) => {
      const m = r.monthly[i],
        ds = r.daily.filter((d) => d.date.startsWith(month)),
        total = (k) => ds.reduce((n, d) => n + d[k], 0);
      if (
        m.month !== month ||
        m.days !== ds.length ||
        !close(m.openWh, total('openWh')) ||
        !close(m.meanWh, total('meanWh')) ||
        !close(m.meanDli, total('meanDli') / ds.length) ||
        (m.openWh ? !close(m.meanSunlight, (100 * m.meanWh) / m.openWh) : m.meanSunlight !== null)
      )
        throw Error('Inconsistent monthly summary.');
    });
  } else if (r.period && r.period.days !== 1)
    throw Error('Period results cannot be restored as a single day.');
  return r;
}
