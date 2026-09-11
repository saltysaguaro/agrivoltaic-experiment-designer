import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3, BoxGeometry, Matrix4 } from 'three';
import {
  defaultStudy as baseStudy,
  migrateStudy,
  analysisKey,
  dimensions,
  designIssues,
} from '../src/domain/study.js';
import {
  buildGeometry,
  simulationGeometry,
  disposeGroup,
  receiverGrid,
  getPose,
  localToWorld,
  worldToLocal,
} from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { packBvh } from '../src/irradiance/gpu.js';
import { skyPatches, perezWeights } from '../src/irradiance/sky.js';
import { solarPosition, spitters, sampleWeather } from '../src/irradiance/solar.js';
import { integrateSources, calculateDay } from '../src/irradiance/engine.js';
import { parseWeather } from '../src/irradiance/weather.js';
import { plotStats } from '../src/experiment/layout.js';
import { figureSvg } from '../src/report/figures.js';
import { reportHtml, csv } from '../src/report/export.js';
const defaultStudy = () => {
  const s = baseStudy();
  s.weather.mode = 'sample';
  s.weather.name = 'Illustrative clear-sky day · synthetic';
  return s;
};
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);
test('versioned study round-trips and rejects invalid versions / dimensions', () => {
  const s = defaultStudy();
  assert.deepEqual(migrateStudy(JSON.parse(JSON.stringify(s))), s);
  assert.throws(() => migrateStudy({ ...s, schemaVersion: 99 }));
  assert.throws(() => migrateStudy({ ...s, module: { ...s.module, width: -1 } }));
});
test('receiver coordinates rotate with the study, preserve area, and exclude field sensors', () => {
  const s = defaultStudy();
  s.array.azimuth = 37;
  const p = localToWorld(s, 3, 7),
    q = worldToLocal(s, p.x, p.y);
  near(q.x, 3);
  near(q.y, 7);
  const a = receiverGrid(s),
    d = dimensions(s);
  near(a.dx * a.dy * a.points.length, d.footprintX * d.footprintY);
  s.experimentSensors.push({ id: 'x' });
  assert.deepEqual(receiverGrid(s), a);
});
test('finite scene has the correct module count and ground clearance', () => {
  const s = defaultStudy(),
    group = buildGeometry(s),
    geo = simulationGeometry(group);
  assert.equal(
    group.children.filter((m) => m.userData.kind === 'module').length,
    dimensions(s).modules,
  );
  assert.equal(designIssues(s).length, 0);
  assert.ok(geo.index.count > 0);
  disposeGroup(group);
  geo.dispose();
  s.racking.height = 0.2;
  assert.ok(designIssues(s).some((v) => v.includes('ground')));
});
test('solar direction: local equatorial equinox noon is almost zenith; sunrise is east', () => {
  const site = { latitude: 0, longitude: 0, utcOffset: 0 };
  const noon = solarPosition('2026-03-20', 720, site),
    morning = solarPosition('2026-03-20', 420, site);
  assert.ok(noon.z > 0.999);
  assert.ok(morning.x > 0);
  near(noon.length(), 1);
});
test('Reinhart subdivisions integrate a complete hemisphere', () => {
  for (const count of [145, 577, 2305]) {
    const p = skyPatches(count);
    assert.equal(p.length, count);
    near(
      p.reduce((n, p) => n + p.solidAngle, 0),
      2 * Math.PI,
    );
    assert.ok(p.every((p) => p.direction.z > 0));
  }
});
test('Perez quadrature is nonnegative and exactly closes to DHI for all sky categories', () => {
  for (const dni of [0, 10, 80, 200, 400, 800, 1400]) {
    const p = skyPatches(577),
      weights = perezWeights(p, new Vector3(0.5, 0, Math.sqrt(0.75)), dni, 100);
    assert.ok([...weights].every((v) => Number.isFinite(v) && v >= 0));
    near(
      weights.reduce((a, b) => a + b, 0),
      100,
      1e-10,
    );
  }
});
test('empty scene has zero shade and full sky visibility at every bit boundary', async () => {
  const cpu = new CpuBvhIrradianceEngine();
  await cpu.initializeGeometry(null);
  const p = skyPatches(145),
    weights = perezWeights(p, new Vector3(0, 0, 1), 800, 100),
    bits = await cpu.visibility(
      [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 100, z: 0 },
      ],
      p.map((p) => p.direction),
    );
  for (let i = 0; i < 2; i++) {
    let diffuse = 0;
    weights.forEach((v, j) => {
      if (bits[i * 5 + (j >>> 5)] & (1 << (j & 31))) diffuse += v;
    });
    near(100 * (1 - (800 + diffuse) / 900), 0);
  }
});
test('opaque finite roof blocks an interior ray and leaves an outside control exposed', async () => {
  const geometry = new BoxGeometry(2, 2, 0.1).applyMatrix4(new Matrix4().makeTranslation(0, 0, 2));
  const engine = new CpuBvhIrradianceEngine();
  await engine.initializeGeometry(geometry);
  const bits = await engine.visibility(
    [
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ],
    [new Vector3(0, 0, 1)],
  );
  assert.deepEqual([...bits], [0, 1]);
  const gpu = packBvh(geometry);
  assert.equal(gpu.triangles.length, 12 * 3 * 4);
  assert.ok(gpu.count > 1);
  geometry.dispose();
});
test('subdivision conserves daily GHI and default DLI energy', () => {
  const s = defaultStudy();
  s.weather.rows = sampleWeather(s);
  const outputs = [5, 10, 15].map((interval) => {
    s.analysis.interval = interval;
    return integrateSources(s);
  });
  for (const a of outputs) {
    near(
      a.steps.reduce((n, v) => n + v.direct + v.diffuse, 0),
      a.open,
      1e-8,
    );
    near(a.openDli, (a.open * 0.5 * 4.57 * 3600) / 1e6, 1e-9);
    near(a.open, outputs[0].open, 1e-9);
  }
});
test('measured PPFD and diffuse PPFD preserve the daily photon integral', () => {
  const s = defaultStudy();
  s.weather.rows = sampleWeather(s).map((w) => ({ ...w, ppfd: w.ghi * 2, diffusePpfd: w.dhi * 2 }));
  const a = integrateSources(s);
  near(
    a.openDli,
    s.weather.rows.reduce((n, v) => n + (v.ppfd * v.duration * 60) / 1e6, 0),
    1e-9,
  );
  assert.equal(a.measured, true);
});
test('Spitters bounds and limiting fractions', () => {
  near(spitters(40, 0), 0);
  near(spitters(40, 1), 1);
  assert.ok(spitters(40, 0.5) > 0.5);
});
test('single axis obeys angle limits, backtracking reduces rotation, dual axis faces sun', () => {
  const s = defaultStudy();
  s.racking.type = 'single-axis';
  s.racking.backtracking = false;
  const sun = new Vector3(0.1, -0.98, 0.15).normalize(),
    a = getPose(s, sun);
  assert.ok(Math.abs(a.tilt) <= s.racking.limit);
  s.racking.backtracking = true;
  assert.ok(Math.abs(getPose(s, sun).tilt) <= Math.abs(a.tilt));
  s.racking.type = 'dual-axis';
  s.racking.limit = 85;
  const b = getPose(s, sun);
  near(b.tilt, (Math.acos(sun.z) * 180) / Math.PI);
});
test('sensor and crop edits retain analysis, geometry and weather edits invalidate it', () => {
  const s = defaultStudy(),
    key = analysisKey(s);
  s.experimentSensors.push({ id: 'probe' });
  s.crops.push({ id: 'plot' });
  assert.equal(analysisKey(s), key);
  s.module.width += 0.1;
  assert.notEqual(analysisKey(s), key);
});
test('daily finite-array computation returns bounded spatial metrics', async () => {
  const s = defaultStudy();
  s.analysis.backend = 'cpu';
  s.analysis.resolution = 2;
  const r = await calculateDay(s);
  assert.equal(r.backend, 'CPU MeshBVH');
  assert.ok(
    r.cells.every((c) => c.shade >= 0 && c.shade <= 100 && c.dli >= 0 && c.dli <= r.openDli + 1e-8),
  );
  assert.ok(r.meanShade > 0);
  assert.ok(new Set(r.cells.map((c) => c.shade.toFixed(1))).size > 10);
  assert.equal(r.studyHash.length, 64);
});
test('CSV weather: complete local day imports; gaps, negative values and DHI > GHI fail', async () => {
  const s = defaultStudy(),
    data =
      'timestamp,GHI,DNI,DHI\n' +
      sampleWeather(s)
        .map((w) => `${String(w.minute / 60).padStart(2, '0')}:00,${w.ghi},${w.dni},${w.dhi}`)
        .join('\n');
  const parsed = await parseWeather(data, 'test.csv', s.analysis.date);
  assert.equal(parsed.weather.rows.length, 24);
  assert.equal(parsed.weather.hash.length, 64);
  await assert.rejects(
    parseWeather(data.split('\n').slice(0, -1).join('\n'), 'test.csv', s.analysis.date),
  );
  await assert.rejects(
    parseWeather(data.replace('00:00,0,0,0', '00:00,-1,0,0'), 'test.csv', s.analysis.date),
  );
});
test('plot statistics use only contained receivers and use population SD', () => {
  const r = {
      cells: [
        { x: 0, y: 0, dli: 10, shade: 60 },
        { x: 0.2, y: 0, dli: 20, shade: 20 },
        { x: 10, y: 10, dli: 100, shade: 0 },
      ],
    },
    p = plotStats(r, { x: 0, y: 0, width: 2, length: 2 });
  near(p.mean, 15);
  near(p.sd, 5);
  near(p.median, 15);
  near(p.shade, 40);
});
test('publication figures escape metadata and provide all projections without a browser', () => {
  const s = defaultStudy();
  s.metadata.title = '<script>alert(1)</script>';
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = figureSvg(s, null, view);
    assert.ok(svg.startsWith('<svg'));
    assert.ok(!svg.includes('<script>'));
    assert.ok(!svg.includes('NaN'));
  }
  const html = reportHtml(s, null);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('window.print()'));
  assert.ok(csv([['=1+1']]).includes("'=1+1"));
});
test('fixed poses retain exact noninteger tilt when diffuse poses are cached', () => {
  const s = defaultStudy();
  s.racking.tilt = 25.3;
  near(getPose(s, new Vector3(0, 0, 1), true).tilt, 25.3);
});
test('invalid dates, incomplete imported weather and dual-axis swept collisions are rejected', () => {
  const s = defaultStudy();
  assert.throws(() => migrateStudy({ ...s, analysis: { ...s.analysis, date: '2026-02-31' } }));
  s.weather.rows = sampleWeather(s).slice(1);
  assert.throws(() => integrateSources(s), /24 hours|contiguous/);
  s.racking.type = 'dual-axis';
  assert.ok(designIssues(s).some((v) => v.includes('rotation interference')));
});
test('EPW and TMY3 interval-ending hours and metadata import as local interval starts', async () => {
  const epw = [
    'LOCATION,Test,AZ,US,Source,1,32.22,-110.97,-7,728',
    ...Array(7).fill('header'),
    ...Array.from({ length: 24 }, (_, h) => {
      const c = Array(35).fill('0');
      [2020, 6, 21, h + 1, 60].forEach((v, i) => (c[i] = String(v)));
      return c.join(',');
    }),
  ].join('\n');
  const a = await parseWeather(epw, 'test.epw', '2026-06-21');
  assert.equal(a.weather.rows[23].minute, 1380);
  near(a.site.utcOffset, -7);
  near(a.site.latitude, 32.22);
  const tmy = [
    '1,Test,AZ,-7,32.22,-110.97,728',
    'Date (MM/DD/YYYY),Time (HH:MM),GHI (W/m^2),DNI (W/m^2),DHI (W/m^2)',
    ...Array.from(
      { length: 24 },
      (_, h) => `06/21/2001,${String(h + 1).padStart(2, '0')}:00,0,0,0`,
    ),
  ].join('\n');
  const b = await parseWeather(tmy, 'test.csv', '2026-06-21');
  assert.equal(b.weather.rows[0].minute, 0);
  assert.equal(b.weather.rows[23].minute, 1380);
  near(b.site.longitude, -110.97);
});
