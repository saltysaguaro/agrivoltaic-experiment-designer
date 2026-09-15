import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  defaultStudy,
  studySchema,
  migrateStudy,
  designIssues,
  analysisKey,
} from '../src/domain/study.js';
import { moduleOptics } from '../src/domain/optics.js';
import { analysisPeriod, periodDates } from '../src/domain/period.js';
import { simulationGeometry, disposeGroup } from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { calculateDay, integrateSources } from '../src/irradiance/engine.js';
import { calculateStudy, weatherForPeriod } from '../src/irradiance/period-engine.js';
import { downloadWeather } from '../src/irradiance/weather-service.js';
import { parseWeather } from '../src/irradiance/weather.js';
import { verifyWeatherRecord } from '../src/irradiance/weather-record.js';
import { validateResult } from '../src/project/results.js';
import { buildProjectPackage, readProject } from '../src/project/package.js';
import { readZip } from '../src/project/zip.js';
import { reportHtml, exportCsv } from '../src/report/export.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const emptyCache = { get: async () => null, put: async () => {} };
function small() {
  const s = defaultStudy();
  s.weather.mode = 'sample';
  s.table.high = 1;
  s.table.wide = 1;
  s.row.tables = 1;
  s.array.rows = 1;
  s.array.buffer = 0;
  s.analysis.resolution = 5;
  s.analysis.patches = 145;
  s.analysis.interval = 15;
  s.analysis.backend = 'cpu';
  return s;
}
test('bifacial gaps derive fitted cells and transmission without double-counting crossings; old designs migrate opaque', () => {
  const s = small(),
    old = structuredClone(s);
  old.schemaVersion = 1;
  delete old.module.bifacial;
  delete old.analysis.period;
  delete old.weather.days;
  const migrated = migrateStudy(old);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.module.bifacial, false);
  assert.equal(migrated.analysis.period, 'day');
  Object.assign(s.module, {
    bifacial: true,
    width: 2,
    length: 2,
    cellColumns: 2,
    cellRows: 2,
    cellGapX: 0.2,
    cellGapY: 0.2,
    cellMargin: 0,
    gapTransmission: 0.8,
    gapParTransmission: 0.6,
  });
  const o = moduleOptics(s.module);
  near(o.cellWidth, 0.9);
  near(o.openFraction, 0.19);
  near(o.broadband, 0.152);
  near(o.par, 0.114);
  const key = analysisKey(s);
  s.module.cellGapY = 0.1;
  assert.notEqual(key, analysisKey(s));
  s.module.bifacial = false;
  near(moduleOptics(s.module).broadband, 0);
  s.module.bifacial = true;
  s.module.cellColumns = 24;
  assert.ok(designIssues(s).some((x) => x.includes('Cell gaps')));
});
test('CPU transmission counts modules once at centres, edges, corners and oblique rays; supports remain opaque', async () => {
  const g = new THREE.Group();
  g.userData.transmitting = true;
  for (const z of [2, 4]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1));
    m.position.z = z;
    m.userData.kind = 'module';
    g.add(m);
  }
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1));
  post.position.set(3, 0, 0.5);
  post.userData.kind = 'post';
  g.add(post);
  g.updateMatrixWorld(true);
  const geometry = simulationGeometry(g),
    cpu = new CpuBvhIrradianceEngine();
  await cpu.initializeGeometry(geometry);
  const points = [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 3, y: 0, z: 0 },
    { x: 5, y: 0, z: 0 },
  ];
  assert.deepEqual(
    [...(await cpu.visibility(points, [new THREE.Vector3(0, 0, 1)]))],
    [2, 2, 2, 65535, 0],
  );
  assert.deepEqual(
    [...(await cpu.visibility([{ x: -2, y: 0, z: 0 }], [new THREE.Vector3(1, 0, 1).normalize()]))],
    [1],
  );
  geometry.dispose();
  disposeGroup(g);
  cpu.dispose();
});
test('fractional ray throughput attenuates broadband and PAR independently across multiple modules', async () => {
  const s = small();
  s.module.bifacial = true;
  s.module.cellGapX = 0.05;
  s.module.cellGapY = 0.05;
  s.module.gapTransmission = 0.8;
  s.module.gapParTransmission = 0.5;
  s.analysis.backend = 'gpu';
  const o = moduleOptics(s.module),
    source = integrateSources(s);
  for (const count of [0, 1, 2, 65535]) {
    const engine = {
      name: 'Test transmitting adapter',
      initializeGeometry: async () => {},
      visibility: async (p, d) => new Uint16Array(p.length * d.length).fill(count),
      dispose: () => {},
    };
    const r = await calculateDay(s, () => {}, { createGpu: async () => engine, cache: emptyCache });
    near(r.cells[0].wh, source.open * (count === 65535 ? 0 : o.broadband ** count));
    near(r.cells[0].dli, source.openDli * (count === 65535 ? 0 : o.par ** count));
  }
});
test('period dates cover leap years and inclusive seasons crossing the year boundary', () => {
  const s = small();
  Object.assign(s.analysis, { period: 'year', year: 2024 });
  assert.equal(analysisPeriod(s).days, 366);
  assert.ok(periodDates(s).includes('2024-02-29'));
  Object.assign(s.analysis, { period: 'season', year: 2025, startMonth: 11, endMonth: 3 });
  assert.deepEqual(analysisPeriod(s), {
    mode: 'season',
    start: '2025-11-01',
    end: '2026-03-31',
    days: 151,
  });
  s.analysis.startMonth = 2;
  s.analysis.endMonth = 2;
  assert.equal(analysisPeriod(s).days, 28);
});
test('monthly runs aggregate daily energy ratios, mean DLI, checkpoint resume and complete project exports', async () => {
  const s = small();
  Object.assign(s.analysis, {
    period: 'season',
    year: 2024,
    startMonth: 2,
    endMonth: 2,
    date: '2024-02-01',
    samplesPerCell: 4,
  });
  s.module.bifacial = true;
  let checkpoint;
  await assert.rejects(
    calculateStudy(s, () => {}, {
      cache: emptyCache,
      onCheckpoint: (c) => {
        if (c.completedDays === 3) {
          checkpoint = c;
          throw Error('test interruption');
        }
      },
    }),
    /test interruption/,
  );
  const resumed = await calculateStudy(s, () => {}, { checkpoint, cache: emptyCache });
  const full = await calculateStudy(s, () => {}, { cache: emptyCache });
  assert.equal(full.daily.length, 29);
  near(resumed.cells[0].wh, full.cells[0].wh);
  near(resumed.cells[0].dli, full.cells[0].dli);
  near(
    full.openWh,
    full.daily.reduce((n, d) => n + d.openWh, 0),
  );
  near(full.meanDli, full.daily.reduce((n, d) => n + d.meanDli, 0) / 29);
  near(full.meanSunlight, (100 * full.daily.reduce((n, d) => n + d.meanWh, 0)) / full.openWh);
  assert.ok(full.daily.some((d) => Math.abs(d.openWh - full.daily[0].openWh) > 1));
  await validateResult(s, full);
  const bad = structuredClone(full);
  bad.daily[0].meanWh += 1;
  await assert.rejects(validateResult(s, bad));
  const packageFile = await buildProjectPackage(s, full),
    files = await readZip(packageFile.archive);
  assert.ok(files.has('tables/daily.csv'));
  assert.ok(files.has('tables/monthly.csv'));
  const imported = await readProject(packageFile.archive, 'period.agrivoltaic.zip');
  assert.equal(imported.result.daily.length, 29);
  near(imported.result.cells[0].wh, full.cells[0].wh);
  assert.match(reportHtml(s, full), /2024-02-01 to 2024-02-29/);
  assert.match(reportHtml(s, full), /Monthly light summary/);
  assert.match(reportHtml(s, full), /W; bifacial, area-averaged gap transmission/);
  assert.doesNotMatch(reportHtml(s, full), /W; opaque/);
  assert.match(reportHtml(s, full), /date, interval arrays/);
  assert.match(exportCsv(s, full), /mean daily over period/);
});
test('calendar-year calculation includes all 366 days and zero-energy polar-night days', async () => {
  const s = small();
  Object.assign(s.analysis, { period: 'year', year: 2024, date: '2024-01-01' });
  s.site.latitude = 75;
  const r = await calculateStudy(s, () => {}, { cache: emptyCache });
  assert.equal(r.daily.length, 366);
  assert.equal(r.monthly.length, 12);
  assert.ok(r.daily.some((d) => d.openWh === 0));
  await validateResult(s, r);
});
test('multi-day weather downloads preserve fractional-offset boundaries and full original source hashes', async () => {
  const s = small();
  s.weather.mode = 'automatic';
  s.site.utcOffset = 5.5;
  Object.assign(s.analysis, {
    period: 'season',
    year: 2024,
    startMonth: 2,
    endMonth: 3,
    date: '2024-02-01',
  });
  let calls = 0;
  const weather = await downloadWeather(s, {
    now: new Date('2026-09-11'),
    fetchImpl: async (url) => {
      calls++;
      const u = new URL(url),
        start = Date.parse(u.searchParams.get('start_date')),
        end = Date.parse(u.searchParams.get('end_date')) + 86400000;
      const time = Array.from({ length: (end - start) / 3600000 + 1 }, (_, i) =>
        new Date(start + i * 3600000).toISOString().slice(0, 16),
      );
      const raw = JSON.stringify({
        hourly: {
          time,
          shortwave_radiation: time.map(() => 10),
          diffuse_radiation: time.map(() => 10),
          direct_normal_irradiance: time.map(() => 0),
        },
      });
      return { ok: true, text: async () => raw };
    },
  });
  assert.equal(calls, 2);
  assert.equal(weather.days.length, 60);
  assert.equal(weather.days[0].rows[0].duration, 30);
  assert.equal(weather.days.at(-1).rows.at(-1).duration, 30);
  s.weather = weather;
  studySchema.parse(s);
  assert.equal(weatherForPeriod(s).length, 60);
  await verifyWeatherRecord(weather);
  const damaged = structuredClone(weather);
  damaged.days[0].rows[0].ghi++;
  await assert.rejects(verifyWeatherRecord(damaged), /SHA-256/);
  s.weather.days.pop();
  assert.throws(() => weatherForPeriod(s), /every date/);
});
test('period CSV import requires dated, complete days and retains the original file', async () => {
  const s = small();
  Object.assign(s.analysis, { period: 'season', year: 2025, startMonth: 2, endMonth: 2 });
  const csv =
    'timestamp,GHI,DNI,DHI\n' +
    periodDates(s)
      .flatMap((date) =>
        Array.from({ length: 24 }, (_, i) => `${date}T${String(i).padStart(2, '0')}:00,0,0,0`),
      )
      .join('\n');
  const p = await parseWeather(csv, 'period.csv', s);
  assert.equal(p.weather.days.length, 28);
  assert.equal(p.weather.sourceText, csv);
  await verifyWeatherRecord(p.weather);
  await assert.rejects(
    parseWeather(csv.replace('2025-02-04T12:00,0,0,0\n', ''), 'gap.csv', s),
    /2025-02-04/,
  );
  await assert.rejects(
    parseWeather('timestamp,GHI,DNI,DHI\n00:00,0,0,0', 'undated.csv', s),
    /YYYY/,
  );
});
