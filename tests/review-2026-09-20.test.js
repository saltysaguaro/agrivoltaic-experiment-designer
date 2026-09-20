import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import {
  defaultStudy,
  studySchema,
  selectRacking,
  analysisKey,
  designIssues,
} from '../src/domain/study.js';
import { parseWeather, MAX_WEATHER_BYTES } from '../src/irradiance/weather.js';
import { applyWeatherImport, weatherImportContext } from '../src/irradiance/import-client.js';
import { calculateDay, VISIBILITY_TILE_BYTES } from '../src/irradiance/engine.js';
import { calculateStudy, validateCheckpoint } from '../src/irradiance/period-engine.js';
import {
  receiverGridSpec,
  receiverGrid,
  buildGeometry,
  disposeGroup,
  createModuleMaterial,
} from '../src/domain/geometry.js';
import { gridSpacingLabel } from '../src/domain/receiver-grid.js';
import { normalizeLayout, receiverLines } from '../src/experiment/grid-layout.js';
import { figureSvg, heatColor } from '../src/report/figures.js';
import { reportHtml, csv } from '../src/report/export.js';
import { buildProjectPackage } from '../src/project/package.js';
import { validateResult } from '../src/project/results.js';
import { sampleWeather } from '../src/irradiance/solar.js';
import { hardwarePoints } from '../src/ui/drawing-bounds.js';
import { batchHardware } from '../src/ui/hardware-display.js';
import { plotStats } from '../src/experiment/layout.js';
import { getCached, putCached, cacheDiagnostics } from '../src/irradiance/cache.js';
const weather = (suffix) =>
  'timestamp,GHI,DNI,DHI\n' +
  Array.from(
    { length: 24 },
    (_, h) => `2026-06-21T${String(h).padStart(2, '0')}:00${suffix},100,0,100`,
  ).join('\n');
function small() {
  const s = defaultStudy();
  s.weather.mode = 'sample';
  s.analysis.backend = 'cpu';
  s.analysis.patches = 145;
  s.analysis.interval = 15;
  s.table.wide = s.table.high = s.row.tables = s.array.rows = 1;
  return s;
}
test('CSV rejects all timezone suffixes, trailing text and invalid clock fields', async () => {
  for (const suffix of ['Z', 'z', '+0000', '-0700', '+00', '+00:00', '+05:30', 'garbage', ':30'])
    await assert.rejects(parseWeather(weather(suffix), 'x.csv', '2026-06-21'), /local standard/);
  for (const value of ['24:00', '12:60', '2026-02-30T12:00'])
    await assert.rejects(
      parseWeather(weather('').replace('2026-06-21T12:00', value), 'x.csv', '2026-06-21'),
    );
  assert.equal((await parseWeather(weather(''), 'x.csv', '2026-06-21')).weather.rows.length, 24);
  await assert.rejects(
    parseWeather('x'.repeat(MAX_WEATHER_BYTES + 1), 'large.csv', '2026-06-21'),
    /25 MB/,
  );
});
test('annual parsing retains leap days and source provenance in a single indexed pass', async () => {
  const s = small();
  Object.assign(s.analysis, { period: 'year', year: 2024, date: '2024-01-01' });
  const text =
    'timestamp,GHI,DNI,DHI\n' +
    Array.from({ length: 366 }, (_, d) => {
      const day = new Date(Date.UTC(2024, 0, d + 1)).toISOString().slice(0, 10);
      return Array.from(
        { length: 24 },
        (_, h) => `${day}T${String(h).padStart(2, '0')}:00,100,0,100`,
      ).join('\n');
    }).join('\n');
  const parsed = await parseWeather(text, 'year.csv', s);
  assert.equal(parsed.weather.days.length, 366);
  assert.equal(parsed.weather.days[59].date, '2024-02-29');
  assert.equal(parsed.weather.sourceText, text);
  assert.equal(parsed.weather.hash.length, 64);
});
test('site imports share hemisphere rules while preserving geometry and custom bearings', () => {
  let s = selectRacking(small(), 'fixed'),
    parsed = {
      site: { latitude: -33, longitude: 151, utcOffset: 10, elevation: 30 },
      weather: { ...s.weather },
    };
  const context = weatherImportContext(s);
  s.module.width = 1.5;
  assert.equal(weatherImportContext(s), context);
  let next = applyWeatherImport(s, parsed);
  assert.equal(next.array.azimuth, 0);
  assert.equal(next.module.width, 1.5);
  next = applyWeatherImport(next, { ...parsed, site: { ...parsed.site, latitude: 33 } });
  assert.equal(next.array.azimuth, 180);
  s.array.azimuth = 123;
  assert.equal(applyWeatherImport(s, parsed).array.azimuth, 123);
  for (const type of ['single-axis', 'dual-axis', 'vertical']) {
    s = selectRacking(s, type);
    s.array.azimuth = 90;
    assert.equal(applyWeatherImport(s, parsed).array.azimuth, 90);
  }
  s.site.utcOffset = 5.5;
  assert.notEqual(weatherImportContext(s), context);
});
test('zero measured DLI remains exportable and has a finite color/legend', async () => {
  const s = small();
  s.weather.rows = sampleWeather(s).map((w) => ({ ...w, ppfd: 0, diffusePpfd: 0 }));
  const result = await calculateDay(s);
  assert.equal(result.openDli, 0);
  await validateResult(s, result);
  assert.equal(heatColor(0, 0), '#254e71');
  assert.equal(heatColor(NaN, 100), '#254e71');
  assert.doesNotMatch(figureSvg(s, result, 'plan', 'dli'), /NaN/);
  assert.doesNotMatch(reportHtml(s, result), /NaN/);
  const packed = await buildProjectPackage(s, result);
  assert.ok(packed.archive.length > 0);
  assert.equal(packed.resultIncluded, true);
});
test('invalid grid inputs remain editable without allocating edges or lines', () => {
  const s = defaultStudy();
  s.module.gap = 200000;
  const parsed = studySchema.parse(s),
    grid = receiverGridSpec(parsed);
  assert.equal(grid.exceeded, true);
  assert.equal(grid.yEdges, undefined);
  assert.match(gridSpacingLabel(grid), /20,000/);
  assert.deepEqual(receiverLines(parsed), []);
  assert.doesNotThrow(() => normalizeLayout(parsed));
  assert.ok(designIssues(parsed).length);
  assert.throws(() => receiverGrid(parsed), /20,000/);
  assert.throws(() => figureSvg(parsed), /20,000/);
  parsed.module.gap = 0.02;
  assert.equal(receiverGridSpec(normalizeLayout(parsed)).exceeded, undefined);
});
test('module materials reflect cell-layout edits and batched display preserves hardware bounds', () => {
  const s = defaultStudy();
  s.module.bifacial = true;
  const a = createModuleMaterial(s, 'module');
  s.module.cellColumns = 10;
  const b = createModuleMaterial(s, 'module');
  assert.notDeepEqual(a.map.image.data, b.map.image.data);
  a.map.dispose();
  a.dispose();
  b.map.dispose();
  b.dispose();
  s.row.tables = 10;
  const group = buildGeometry(s),
    bounds = new Box3().setFromObject(group),
    points = hardwarePoints(group);
  const before = group.children.length;
  batchHardware(group, points);
  assert.ok(before > 200);
  assert.ok(group.children.length < 10);
  assert.ok(group.children.every((m) => m.isInstancedMesh));
  const after = new Box3().setFromObject(group);
  assert.ok(bounds.min.distanceTo(after.min) < 1e-5);
  assert.ok(bounds.max.distanceTo(after.max) < 1e-5);
  assert.deepEqual(hardwarePoints(group), points);
  disposeGroup(group);
});
test('saved results reject excess receiver energy and tampered source provenance', async () => {
  const s = small(),
    r = await calculateDay(s);
  await validateResult(s, r);
  for (const mutate of [
    (r) => {
      r.cells.forEach((c) => {
        c.wh = 2 * r.openWh;
        c.sunlight = 100;
        c.shade = 0;
      });
      r.meanSunlight = 100;
      r.meanShade = 0;
    },
    (r) => {
      r.cells[0].dli = 2 * r.openDli;
    },
    (r) => {
      r.openWh *= 2;
    },
    (r) => {
      r.estimated = !r.estimated;
    },
  ]) {
    const bad = structuredClone(r);
    mutate(bad);
    await assert.rejects(validateResult(s, bad));
  }
});
test('period sessions reuse one backend/geometry and reject corrupted checkpoints', async () => {
  const s = selectRacking(small(), 'fixed');
  Object.assign(s.analysis, {
    period: 'season',
    year: 2026,
    startMonth: 6,
    endMonth: 6,
    date: '2026-06-01',
    backend: 'gpu',
  });
  let creates = 0,
    initializes = 0,
    disposes = 0,
    checkpoint;
  const r = await calculateStudy(s, () => {}, {
    createGpu: async () => {
      creates++;
      return {
        name: 'WebGPU BVH',
        initializeGeometry: async () => {
          initializes++;
        },
        visibility: async (p, d) =>
          new Uint32Array(p.length * Math.ceil(d.length / 32)).fill(0xffffffff),
        dispose() {
          disposes++;
        },
      };
    },
    onCheckpoint: (c) => {
      checkpoint = c;
    },
  });
  assert.equal(creates, 1);
  assert.equal(initializes, 1);
  assert.equal(disposes, 1);
  await validateResult(s, r);
  validateCheckpoint(s, checkpoint);
  checkpoint.wh[0] = checkpoint.openWh * 2;
  assert.throws(() => validateCheckpoint(s, checkpoint), /energy/);
});
test('transmission tiles stay bounded, conserve source energy and reuse cached tiles', async () => {
  const s = small();
  s.module.bifacial = true;
  s.array.buffer = 15;
  s.analysis.patches = 2305;
  s.analysis.backend = 'gpu';
  const cache = new Map();
  let max = 0,
    calls = 0;
  const options = {
    cache: {
      get: async (k) => cache.get(k),
      put: async (k, v) => {
        assert.ok(v.byteLength <= VISIBILITY_TILE_BYTES);
        cache.set(k, v);
      },
    },
    createGpu: async () => ({
      name: 'WebGPU BVH',
      initializeGeometry: async () => {},
      visibility: async (p, d) => {
        calls++;
        const v = new Uint16Array(p.length * d.length);
        max = Math.max(max, v.byteLength);
        return v;
      },
      dispose() {},
    }),
  };
  const r = await calculateDay(s, () => {}, options);
  assert.ok(cache.size > 1);
  assert.ok(max <= VISIBILITY_TILE_BYTES);
  for (const c of r.cells) {
    assert.ok(Math.abs(c.wh - r.openWh) < 1e-6);
    assert.ok(Math.abs(c.dli - r.openDli) < 1e-6);
  }
  const firstCalls = calls,
    warm = await calculateDay(s, () => {}, options);
  assert.equal(warm.cached, cache.size);
  assert.ok(calls - firstCalls < firstCalls);
  assert.deepEqual(warm.cells, r.cells);
});
test('memory visibility cache evicts least recently used entries by bytes', async () => {
  const bits = new Uint16Array(1024 * 1024);
  for (let i = 0; i < 16; i++) await putCached(`lru-${i}`, bits);
  await getCached('lru-0');
  await putCached('lru-new', bits);
  assert.ok(await getCached('lru-0'));
  assert.equal(await getCached('lru-1'), null);
  assert.ok(cacheDiagnostics().memoryBytes <= 32 * 1024 * 1024);
});
test('CSV treats negative text as untrusted while preserving negative numeric coordinates', () => {
  assert.equal(csv([['-1+1', ' =1+1', -33]]), '"\'-1+1","\' =1+1","-33"');
});
test('display-only module power and address edits retain the analysis identity', () => {
  const s = small(),
    key = analysisKey(s);
  s.module.power = 1000;
  s.site.address = 'Description';
  s.site.elevation = 2000;
  s.weather.name = 'Renamed';
  assert.equal(analysisKey(s), key);
  s.site.latitude = -33;
  assert.notEqual(analysisKey(s), key);
});
test('crop summaries only inspect intersecting cells and cache repeated geometry', () => {
  const cells = Array.from({ length: 20000 }, (_, i) => ({ dli: i, shade: 20, sunlight: 80 }));
  let reads = 0;
  const wrapped = new Proxy(cells, {
    get(t, k) {
      if (/^\d+$/.test(String(k))) reads++;
      return t[k];
    },
  });
  const result = {
      cells: wrapped,
      grid: { nx: 100, ny: 200, dx: 1, dy: 1, width: 100, height: 200 },
    },
    plot = { grid: { column: 10, row: 10, columns: 2, rows: 3 }, gridMode: 'exact' };
  const stats = plotStats(result, plot);
  assert.equal(stats.count, 6);
  assert.equal(reads, 6);
  assert.equal(stats.mean, 1110.5);
  assert.equal(plotStats(result, { ...plot }), stats);
  assert.equal(reads, 6);
});
