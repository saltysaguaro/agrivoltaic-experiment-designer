import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3, Box3 } from 'three';
import { defaultStudy, selectRacking, designIssues } from '../src/domain/study.js';
import { receiverGrid, localToWorld } from '../src/domain/geometry.js';
import {
  fitOrthographic,
  cameraSnapshot,
  restoreCamera,
  receiverAtPoint,
} from '../src/ui/camera.js';
import {
  weatherRequest,
  normalizeWeatherResponse,
  downloadWeather,
} from '../src/irradiance/weather-service.js';
import { integrateSources } from '../src/irradiance/engine.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
function response(request, value = 100) {
  const first = Math.floor(request.start / 3600000) * 3600000;
  const time = Array.from({ length: 27 }, (_, i) =>
    new Date(first + i * 3600000).toISOString().slice(0, 16),
  );
  return {
    latitude: 32.25,
    longitude: -111,
    elevation: 730,
    hourly_units: {
      shortwave_radiation: 'W/m²',
      direct_normal_irradiance: 'W/m²',
      diffuse_radiation: 'W/m²',
    },
    hourly: {
      time,
      shortwave_radiation: time.map(() => value),
      direct_normal_irradiance: time.map(() => 500),
      diffuse_radiation: time.map(() => 20),
    },
  };
}
test('every racking choice starts with compatible clearances and retains larger custom spacing', () => {
  const original = defaultStudy();
  for (const type of ['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola']) {
    const s = selectRacking(original, type);
    assert.deepEqual(designIssues(s), []);
    assert.equal(original.racking.type, 'fixed');
  }
  const s = defaultStudy();
  s.rowPair.pitch = 20;
  s.row.tableGap = 5;
  const dual = selectRacking(s, 'dual-axis');
  assert.equal(dual.rowPair.pitch, 20);
  assert.equal(dual.row.tableGap, 5);
});
test('orthographic fit fills the viewport while retaining all projected corners', () => {
  const c = new OrthographicCamera();
  c.up.set(0, 0, 1);
  c.position.set(30, -30, 25);
  c.lookAt(0, 0, 2);
  const b = new Box3(new Vector3(-8, -15, 0), new Vector3(8, 15, 4));
  Object.assign(c, fitOrthographic(c, b, 1.8));
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
  let extent = 0;
  for (const x of [-8, 8])
    for (const y of [-15, 15])
      for (const z of [0, 4]) {
        const v = new Vector3(x, y, z).project(c);
        assert.ok(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1);
        extent = Math.max(extent, Math.abs(v.x), Math.abs(v.y));
      }
  assert.ok(extent > 0.85);
});
test('camera position, pan, zoom and frustum survive rebuilding map layers', () => {
  const c = new OrthographicCamera(-10, 10, 8, -8, 0.01, 1000);
  c.position.set(12, -40, 30);
  c.up.set(0, 0, 1);
  c.lookAt(3, 4, 2);
  c.zoom = 2.3;
  const control = { target: new Vector3(3, 4, 2) },
    snapshot = cameraSnapshot(c, control, 'oblique', 0),
    next = new OrthographicCamera(),
    nextControls = { target: new Vector3() };
  restoreCamera(next, nextControls, snapshot);
  assert.deepEqual(next.position.toArray(), c.position.toArray());
  assert.deepEqual(next.quaternion.toArray(), c.quaternion.toArray());
  assert.deepEqual(nextControls.target.toArray(), control.target.toArray());
  assert.equal(next.zoom, 2.3);
  assert.equal(next.left, -10);
  assert.equal(next.top, 8);
});
test('receiver hover selects the rotated cell and rejects ground outside the grid', () => {
  const s = defaultStudy();
  s.array.azimuth = 31;
  const grid = receiverGrid(s),
    result = { grid, cells: grid.points };
  for (const index of [0, 55, grid.points.length - 1]) {
    const p = grid.points[index];
    assert.equal(receiverAtPoint(result, new Vector3(p.x, p.y, 0)).index, index);
  }
  assert.equal(receiverAtPoint(result, localToWorld(s, grid.width, 0, 0)), null);
});
test('automatic weather uses a fixed ERA5 source for history and labels recent forecasts', () => {
  const s = defaultStudy(),
    now = new Date('2026-09-09T12:00Z'),
    historical = weatherRequest(s, now);
  assert.ok(historical.url.includes('models=era5'));
  assert.ok(historical.url.includes('timezone=GMT'));
  s.analysis.date = '2026-09-10';
  assert.equal(weatherRequest(s, now).historical, false);
  s.analysis.date = '2027-09-10';
  assert.throws(() => weatherRequest(s, now), /two weeks/);
});
test('weather averages are interpreted as interval ends and clipped for fractional UTC offsets', () => {
  const s = defaultStudy();
  s.site.utcOffset = 5.5;
  const req = weatherRequest(s, new Date('2026-09-09')),
    rows = normalizeWeatherResponse(response(req), req);
  assert.equal(rows.length, 25);
  assert.equal(rows[0].duration, 30);
  assert.equal(rows.at(-1).duration, 30);
  assert.equal(rows[0].minute, 0);
  assert.equal(rows.at(-1).minute + rows.at(-1).duration, 1440);
  near(
    rows.reduce((n, r) => n + (r.ghi * r.duration) / 60, 0),
    2400,
  );
});
test('weather download preserves source, snapshot and hash; missing values cannot become example data', async () => {
  const s = defaultStudy(),
    now = new Date('2026-09-09'),
    req = weatherRequest(s, now),
    raw = JSON.stringify(response(req));
  const weather = await downloadWeather(s, {
    now,
    fetchImpl: async () => ({ ok: true, text: async () => raw }),
  });
  assert.equal(weather.mode, 'automatic');
  assert.equal(weather.rows.length, 24);
  assert.equal(weather.hash.length, 64);
  assert.ok(weather.provenance.url.includes('archive-api'));
  const invalid = response(req);
  invalid.hourly.shortwave_radiation[10] = null;
  assert.throws(() => normalizeWeatherResponse(invalid, req), /not yet available/);
  assert.throws(() => integrateSources(s), /Download site weather/);
  await assert.rejects(
    downloadWeather(s, {
      fetchImpl: async () => ({
        ok: false,
        status: 429,
        json: async () => ({ reason: 'Rate limited' }),
      }),
    }),
    /429/,
  );
});
