import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
async function baselineModule(file) {
  const source = execFileSync('git', ['show', `e549b7a:${file}`], { encoding: 'utf8' }).replace(
    /from ['"](\.[^'"]+)['"]/g,
    (_, relative) => `from '${pathToFileURL(path.resolve(path.dirname(file), relative)).href}'`,
  );
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
const baselineWeather = await baselineModule('src/irradiance/weather.js');
const baselineLayout = await baselineModule('src/experiment/layout.js');
import { performance } from 'node:perf_hooks';
import { defaultStudy, selectRacking, VERSION } from '../src/domain/study.js';
import { periodDates } from '../src/domain/period.js';
import { parseWeather } from '../src/irradiance/weather.js';
import { plotStats } from '../src/experiment/layout.js';
import { calculateStudy } from '../src/irradiance/period-engine.js';
import { buildGeometry, disposeGroup } from '../src/domain/geometry.js';
import { hardwarePoints } from '../src/ui/drawing-bounds.js';
import { batchHardware } from '../src/ui/hardware-display.js';
const s = defaultStudy();
Object.assign(s.analysis, { period: 'year', year: 2024, date: '2024-01-01' });
const csv =
  'timestamp,GHI,DNI,DHI\n' +
  periodDates(s)
    .flatMap((date) =>
      Array.from({ length: 24 }, (_, h) => `${date}T${String(h).padStart(2, '0')}:00,100,0,100`),
    )
    .join('\n');
let start = performance.now();
await parseWeather(csv, 'year.csv', s);
const parseMs = performance.now() - start;
start = performance.now();
await baselineWeather.parseWeather(csv, 'year.csv', s);
const baselineParseMs = performance.now() - start;
const result = {
  grid: { nx: 100, ny: 200, dx: 1, dy: 1, width: 100, height: 200 },
  cells: Array.from({ length: 20000 }, (_, i) => ({ dli: i % 100, sunlight: 80, shade: 20 })),
};
const beds = Array.from({ length: 200 }, (_, i) => ({
  grid: { column: i % 100, row: i % 190, columns: 1, rows: 10 },
}));
start = performance.now();
beds.forEach((b) => plotStats(result, b));
const cropMs = performance.now() - start;
start = performance.now();
beds.forEach((b) => plotStats(result, b));
const warmCropMs = performance.now() - start;
start = performance.now();
beds.forEach((b) => baselineLayout.plotStats(result, b));
const baselineCropMs = performance.now() - start;
const drawing = defaultStudy();
drawing.row.tables = 20;
drawing.array.rows = 24;
drawing.table.high = 5;
drawing.table.wide = 20;
start = performance.now();
const group = buildGeometry(drawing, 'array', { tilt: 25, yaw: 0 }, { textures: false });
const meshCount = group.children.length;
const points = hardwarePoints(group);
batchHardware(group, points);
const instancedDrawObjects = group.children.length,
  drawBuildMs = performance.now() - start;
disposeGroup(group);
const periods = [];
for (const type of ['fixed', 'single-axis']) {
  let study = selectRacking(defaultStudy(), type);
  study.weather.mode = 'sample';
  study.table.high = 1;
  study.table.wide = 2;
  study.row.tables = 1;
  study.array.rows = 2;
  Object.assign(study.analysis, {
    backend: 'cpu',
    period: 'year',
    year: 2024,
    date: '2024-01-01',
    patches: 145,
    interval: 15,
    resolution: 3,
    gridAlignment: 'spacing',
  });
  const memory = new Map(),
    cache = { get: async (k) => memory.get(k), put: async (k, v) => memory.set(k, v) };
  for (const warm of [false, true]) {
    start = performance.now();
    const r = await calculateStudy(study, () => {}, { cache });
    periods.push({
      type,
      warm,
      days: r.daily.length,
      cells: r.cells.length,
      seconds: (performance.now() - start) / 1000,
      cachedTiles: r.cached,
    });
  }
}
const report = {
  createdAt: new Date().toISOString(),
  version: VERSION,
  node: process.version,
  scope:
    'One local synthetic run; parsing and crop microbenchmarks, bounded full-size geometry construction/instancing, small CPU annual cold/warm fixtures. Not browser frame rates or universal throughput.',
  baselineCommit: 'e549b7a',
  baselineParseMs,
  baselineCropMs,
  baselineScope:
    'Original parser and plotStats functions on the identical fixture and current shared helper modules; single-run comparison.',
  parseBytes: Buffer.byteLength(csv),
  parseMs,
  cropMs,
  warmCropMs,
  originalMeshes: meshCount,
  instancedDrawObjects,
  drawBuildMs,
  periods,
};
fs.writeFileSync('docs/review-fixes-performance.json', JSON.stringify(report, null, 2) + '\n');
console.log(report);
