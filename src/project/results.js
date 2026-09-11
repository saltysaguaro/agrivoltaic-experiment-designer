import { analysisKey, sha256 } from '../domain/study.js';
import { receiverGridSpec, localToWorld } from '../domain/geometry.js';
import { canonicalWeatherRows } from '../irradiance/weather-validation.js';
import { sampleWeather } from '../irradiance/solar.js';
const close = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
export async function validateResult(s, r) {
  if (!r || typeof r !== 'object') throw Error('No calculated results were included.');
  const key = analysisKey(s);
  if (r.key !== key || r.studyHash !== (await sha256(key)) || r.date !== s.analysis.date)
    throw Error('Saved light results belong to different or older analysis inputs.');
  const weatherHash = await sha256(
    canonicalWeatherRows(s.weather.rows.length ? s.weather.rows : sampleWeather(s)),
  );
  if (r.weatherInputHash !== weatherHash || (s.weather.hash && r.weatherHash !== s.weather.hash))
    throw Error('Saved light results do not match the retained weather.');
  const g = receiverGridSpec(s),
    count = g.nx * g.ny;
  if (count > 20000 || !Array.isArray(r.cells) || r.cells.length !== count)
    throw Error('Saved receiver count does not match this project.');
  if (!r.grid || !Object.entries(g).every(([k, v]) => close(r.grid[k], v)))
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
  let sunlight = 0,
    shade = 0,
    dli = 0;
  for (const [i, c] of r.cells.entries()) {
    const lx = -g.width / 2 + ((i % g.nx) + 0.5) * g.dx,
      ly = -g.height / 2 + (Math.floor(i / g.nx) + 0.5) * g.dy;
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
    const fraction = Math.max(0, Math.min(100, (100 * c.wh) / r.openWh));
    if (!close(c.sunlight, fraction) || !close(c.shade, 100 - fraction))
      throw Error('Inconsistent sunlight values in receiver ' + (i + 1));
    sunlight += c.sunlight;
    shade += c.shade;
    dli += c.dli;
  }
  if (
    !close(r.meanSunlight, sunlight / count) ||
    !close(r.meanShade, shade / count) ||
    !close(r.meanDli, dli / count)
  )
    throw Error('Saved summary does not match the receiver values.');
  return r;
}
