import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3, OrthographicCamera } from 'three';
import {
  defaultStudy,
  migrateStudy,
  studySchema,
  selectRacking,
  designIssues,
  sha256,
} from '../src/domain/study.js';
import {
  getPose,
  buildGeometry,
  disposeGroup,
  localToWorld,
  receiverGridSpec,
} from '../src/domain/geometry.js';
import { displayBounds, fitOrthographic } from '../src/ui/camera.js';
import { integrateSources, calculateDay } from '../src/irradiance/engine.js';
import { sampleWeather } from '../src/irradiance/solar.js';
import { parseWeather } from '../src/irradiance/weather.js';
import { canonicalWeatherRows } from '../src/irradiance/weather-validation.js';
import { verifyWeatherRecord } from '../src/irradiance/weather-record.js';
import { figureSvg } from '../src/report/figures.js';
import { methodsRows, exportCsv, reportHtml } from '../src/report/export.js';
import { normalizeLayout, sensorMarkers } from '../src/experiment/grid-layout.js';

function smallStudy() {
  const s = defaultStudy();
  s.weather.mode = 'sample';
  s.table.wide = 2;
  s.table.high = 1;
  s.row.tables = 1;
  s.array.rows = 2;
  s.analysis = { ...s.analysis, backend: 'cpu', patches: 145, interval: 15, resolution: 3 };
  return s;
}
const noCache = { get: async () => null, put: async () => {} };

test('all weather boundaries reject invalid PPFD and interval relationships', () => {
  const base = smallStudy();
  base.weather.rows = sampleWeather(base).map((w) => ({
    ...w,
    ppfd: w.ghi ? 100 : 0,
    diffusePpfd: w.ghi ? 50 : 0,
  }));
  for (const mutate of [
    (s) => {
      s.weather.rows[12].diffusePpfd = 200;
    },
    (s) => {
      delete s.weather.rows[12].ppfd;
    },
    (s) => {
      s.weather.rows[1].minute = 70;
    },
    (s) => {
      s.weather.rows[1].ghi = -1;
    },
  ]) {
    const s = structuredClone(base);
    mutate(s);
    assert.equal(studySchema.safeParse(s).success, false);
    assert.throws(() => migrateStudy(JSON.parse(JSON.stringify(s))));
    assert.throws(() => integrateSources(s));
  }
});

test('source and normalized weather hashes survive JSON and detect altered data', async () => {
  const s = smallStudy();
  const text =
    'timestamp,GHI,DNI,DHI\n' +
    Array.from({ length: 24 }, (_, i) => `${i}:00,100,0,100`).join('\n');
  s.weather = {
    ...(await parseWeather(text, 'weather.csv', s.analysis.date)).weather,
    mode: 'upload',
  };
  const loaded = migrateStudy(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.weather.sourceText, text);
  assert.equal(loaded.weather.hash, await sha256(text));
  assert.equal(
    loaded.weather.normalizedHash,
    await sha256(canonicalWeatherRows(loaded.weather.rows)),
  );
  await verifyWeatherRecord(loaded.weather);
  const r = await calculateDay(loaded);
  assert.equal(r.weatherInputHash, loaded.weather.normalizedHash);
  loaded.weather.rows[12].ghi = 101;
  await assert.rejects(calculateDay(loaded), /input SHA-256/);
  loaded.weather = { ...s.weather, sourceText: text + ' ' };
  await assert.rejects(verifyWeatherRecord(loaded.weather), /source SHA-256/);
});

test('all figure projections and report handle a large accepted array', () => {
  const s = defaultStudy();
  s.row.tables = 20;
  s.array.rows = 24;
  s.analysis.cellsPerRow = 5;
  assert.deepEqual(designIssues(s), []);
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = figureSvg(s, null, view);
    assert.match(svg, /<\/svg>$/);
    assert.doesNotMatch(svg, /NaN|Infinity/);
  }
  assert.match(reportHtml(s, null), /<\/html>$/);
});

test('explicit display fit includes rotated buffers, crops and deep instruments', () => {
  const s = smallStudy();
  s.array.buffer = 20;
  s.array.azimuth = 37;
  s.experimentSensors = [{ id: 'deep', x: 0, y: 0, z: -5 }];
  const group = buildGeometry(s),
    bounds = displayBounds(s, group, 'array'),
    g = receiverGridSpec(s);
  for (const view of ['plan', 'profile', 'oblique']) {
    const c = new OrthographicCamera(),
      center = bounds.getCenter(new Vector3());
    c.up.set(0, view === 'plan' ? 1 : 0, view === 'plan' ? 0 : 1);
    c.position
      .copy(center)
      .add(view === 'plan' ? new Vector3(0, 0, 500) : new Vector3(500, -300, 300));
    c.lookAt(center);
    c.near = 0.01;
    c.far = 2000;
    Object.assign(c, fitOrthographic(c, bounds, 1.8));
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
    const points = [new Vector3(0, 0, -5)];
    for (const x of [-1, 1])
      for (const y of [-1, 1]) points.push(localToWorld(s, (x * g.width) / 2, (y * g.height) / 2));
    for (const p of points) {
      const q = p.project(c);
      assert.ok(Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1);
    }
  }
  disposeGroup(group);
});

test('publication uses effective rack poses and carries standalone provenance', async () => {
  assert.match(figureSvg(smallStudy(), null, 'plan', 'dli'), /aria-label="Array plan"/);
  for (const [type, tilt] of [
    ['vertical', 90],
    ['pergola', 0],
    ['fixed', 25],
  ]) {
    const s = selectRacking(smallStudy(), type),
      rows = methodsRows(s, null);
    assert.equal(rows.find((r) => r[0] === 'Effective fixed tilt')[1], `${tilt}°`);
    assert.equal(rows.find((r) => r[0] === 'Backtracking')[1], 'Not applicable');
  }
  const s = smallStudy(),
    r = await calculateDay(s),
    csv = exportCsv(s, r),
    svg = figureSvg(s, r, 'plan', 'dli');
  for (const value of [
    r.studyHash,
    r.backend,
    r.weatherInputHash,
    'Estimated DLI',
    'no reflection',
  ]) {
    assert.ok(svg.includes(value), value);
    assert.ok(csv.includes(value), value);
  }
  assert.match(svg, /<metadata>/);
  assert.match(svg, /height="\d+" viewBox="0 0 1000 \d+"/);
});

test('diffuse bins obey positive and negative mechanical limits', () => {
  for (const type of ['single-axis', 'dual-axis'])
    for (const limit of [0, 1, 45, 60.5, 85])
      for (const sign of [-1, 1]) {
        const s = selectRacking(smallStudy(), type);
        s.racking.limit = limit;
        s.racking.backtracking = false;
        const pose = getPose(s, new Vector3(0.1, sign, 0.01).normalize(), true);
        assert.ok(Math.abs(pose.tilt) <= limit);
        if (type === 'dual-axis') assert.ok(pose.tilt >= 0);
        assert.ok(pose.key.startsWith(pose.tilt.toFixed(4)));
      }
});

test('profile markers retain separate depths and printed legends identify instruments', () => {
  const s = smallStudy();
  s.experimentSensors = Array.from({ length: 12 }, (_, i) => ({
    id: `S-${i}`,
    type: 'PAR',
    x: 0,
    y: 0,
    z: i < 6 ? -0.2 : 0.3,
  }));
  const n = normalizeLayout(s),
    profile = sensorMarkers(n, { profile: true });
  assert.equal(
    profile.reduce((a, g) => a + g.count, 0),
    12,
  );
  for (const glyph of profile) assert.equal(new Set(glyph.sensors.map((s) => s.z)).size, 1);
  const svg = figureSvg(n, null, 'profile');
  for (const sensor of n.experimentSensors)
    assert.match(svg, new RegExp(`<text[^>]*>[^<]*${sensor.id} \\(PAR`));
});

test('GPU initialization and dispatch failures fall back without polluting GPU cache', async () => {
  const s = smallStudy(),
    reference = await calculateDay(s, () => {}, { cache: noCache });
  s.analysis.backend = 'gpu';
  for (const stage of ['initialize', 'dispatch']) {
    const writes = [];
    const result = await calculateDay(s, () => {}, {
      cache: { get: async () => null, put: async (key) => writes.push(key) },
      createGpu: async () => ({
        name: 'WebGPU BVH',
        dispose() {},
        async initializeGeometry() {
          if (stage === 'initialize') throw Error('test device loss');
        },
        async visibility() {
          throw Error('test dispatch failure');
        },
      }),
    });
    assert.equal(result.backend, 'WebGPU + CPU fallback');
    assert.ok(writes.length && writes.every((key) => key.includes('CPU MeshBVH')));
    result.cells.forEach((c, i) => assert.equal(c.wh, reference.cells[i].wh));
    assert.match(result.warnings.join(' '), /CPU fallback/);
  }
});

test('storage failures do not change results and work progress reaches one', async () => {
  const s = smallStudy(),
    progress = [];
  const a = await calculateDay(s, () => {}, { cache: noCache });
  const b = await calculateDay(s, (p) => progress.push(p.progress), {
    cache: {
      get: async () => {
        throw Error('blocked');
      },
      put: async () => {
        throw Error('quota');
      },
    },
  });
  assert.deepEqual(a.cells, b.cells);
  assert.equal(progress.at(-1), 1);
  assert.ok(progress.every((p, i) => p >= (progress[i - 1] || 0)));
  assert.ok(b.timings.visibilityMs > 0);
});
