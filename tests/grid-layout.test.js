import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, analysisKey, migrateStudy, studySchema } from '../src/domain/study.js';
import {
  receiverGrid,
  receiverGridSpec,
  localToWorld,
  worldToLocal,
} from '../src/domain/geometry.js';
import {
  normalizeLayout,
  cellAt,
  cellCenter,
  sensorMarkers,
  plotCorners,
  receiverLines,
} from '../src/experiment/grid-layout.js';
import { plotStats } from '../src/experiment/layout.js';
import { figureSvg } from '../src/report/figures.js';
import { MAPBOX_PUBLIC_TOKEN, mapboxUrl, searchLocations } from '../src/site/mapbox.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const sensor = (id, x = 0, y = 0) => ({
  id,
  type: 'PAR',
  x,
  y,
  z: -0.2,
  treatment: 'control',
  replicate: '1',
  model: '',
  logger: '',
  notes: '',
});

test('placement snaps to rotated receiver centres, preserves depths and survives grid changes / JSON round trips', () => {
  let s = defaultStudy();
  s.array.azimuth = 37;
  const spec = receiverGridSpec(s),
    point = localToWorld(s, -spec.width / 2 + 2.2 * spec.dx, -spec.height / 2 + 3.1 * spec.dy),
    before = analysisKey(s);
  s.experimentSensors = [sensor('S-01', point.x, point.y)];
  s = normalizeLayout(s);
  const v = s.experimentSensors[0],
    g = receiverGridSpec(s),
    center = cellCenter(s, v.grid, g);
  near(v.x, center.x);
  near(v.y, center.y);
  near(v.z, -0.2);
  assert.equal(analysisKey(s), before);
  assert.deepEqual(
    normalizeLayout(migrateStudy(JSON.parse(JSON.stringify(s)))),
    studySchema.parse(s),
  );
  const cell = { ...v.grid };
  s.array.azimuth = 82;
  s.analysis.resolution = 2;
  s = normalizeLayout(s);
  assert.deepEqual(s.experimentSensors[0].grid, cell);
  const next = cellCenter(s, cell);
  near(s.experimentSensors[0].x, next.x);
  near(s.experimentSensors[0].y, next.y);
  assert.equal(cellAt(s, { x: 1e8, y: 1e8 }, undefined, false), null);
});

test('rotated crops occupy exact whole cells, include the correct samples, and stay within boundaries', () => {
  let s = defaultStudy();
  s.analysis.gridAlignment = 'spacing';
  s.array.azimuth = 53;
  s.crops = [
    {
      id: 'P-01',
      crop: 'Lettuce',
      treatment: 'Interrow',
      replicate: '1',
      x: 0,
      y: 0,
      width: 2,
      length: 4,
      grid: { column: 3, row: 4, columns: 2, rows: 3 },
    },
  ];
  s = normalizeLayout(s);
  const p = s.crops[0],
    g = receiverGrid(s);
  near(p.width, 2 * g.dx);
  near(p.length, 3 * g.dy);
  for (const corner of plotCorners(s, p)) {
    const local = worldToLocal(s, corner.x, corner.y);
    near((local.x + g.width / 2) / g.dx, Math.round((local.x + g.width / 2) / g.dx));
    near((local.y + g.height / 2) / g.dy, Math.round((local.y + g.height / 2) / g.dy));
  }
  const result = {
    grid: g,
    cells: g.points.map((c, i) => ({ ...c, dli: i, sunlight: 75, shade: 25 })),
  };
  const stats = plotStats(result, p);
  assert.equal(stats.count, 6);
  near(stats.sunlight, 75);
  near(stats.mean, 5 * g.nx + 3.5);
  s.crops[0].grid = { column: 999, row: 999, columns: 999, rows: 999 };
  s = normalizeLayout(s);
  const a = s.crops[0].grid;
  assert.ok(a.column + a.columns <= g.nx && a.row + a.rows <= g.ny);
});

test('packed sensor dots stay inside their cell, do not overlap, and retain all instrument identities', () => {
  for (const count of [1, 2, 3, 4, 8, 9, 10, 50, 500]) {
    let s = defaultStudy();
    s.array.azimuth = 71;
    s.experimentSensors = Array.from({ length: count }, (_, i) => sensor(`S-${i + 1}`));
    s = normalizeLayout(s);
    const g = receiverGridSpec(s),
      markers = sensorMarkers(s),
      center = cellCenter(s, s.experimentSensors[0].grid, g);
    assert.equal(markers.flatMap((m) => m.sensors).length, count);
    assert.ok(markers.length <= 9);
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i],
        offset = worldToLocal(s, m.position.x - center.x, m.position.y - center.y);
      assert.ok(Math.abs(offset.x) + m.radius < g.dx / 2);
      assert.ok(Math.abs(offset.y) + m.radius < g.dy / 2);
      for (let j = 0; j < i; j++)
        assert.ok(m.position.distanceTo(markers[j].position) > m.radius + markers[j].radius);
    }
    assert.ok(
      s.experimentSensors.every((v) => v.x === center.x && v.y === center.y && v.z === -0.2),
    );
    if (count > 9) assert.equal(markers.at(-1).label, `${count}`);
  }
});

test('receiver outlines follow exact cell boundaries and publication figures include packed markers', () => {
  let s = defaultStudy();
  s.array.azimuth = 23;
  s.experimentSensors = Array.from({ length: 12 }, (_, i) => sensor(`S-${i + 1}`));
  s = normalizeLayout(s);
  const g = receiverGridSpec(s),
    lines = receiverLines(s, g);
  assert.equal(lines.length, g.nx + g.ny + 2);
  assert.ok(lines.flat().every((p) => p.z === 0));
  const svg = figureSvg(s, null, 'oblique');
  assert.match(svg, /data-receiver-grid="true"/);
  assert.equal((svg.match(/data-sensor-cell=/g) || []).length, 1);
  assert.match(svg, /S-12/);
  assert.match(svg, />12<\/text>/);
});

test('Mapbox uses the archived public endpoint/key, encodes addresses, and maps longitude/latitude correctly', async () => {
  const url = new URL(mapboxUrl('123 Main St / Tucson #2'));
  assert.equal(url.origin, 'https://api.mapbox.com');
  assert.equal(url.searchParams.get('access_token'), MAPBOX_PUBLIC_TOKEN);
  assert.equal(url.searchParams.get('autocomplete'), 'true');
  assert.ok(url.pathname.includes('%2F'));
  assert.ok(url.pathname.includes('%23'));
  let calls = 0;
  const results = await searchLocations('Tucson', {
    fetchImpl: async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({
          features: [
            { id: 'place.1', place_name: 'Tucson, Arizona', center: [-110.9747, 32.2226] },
            { id: 'invalid', center: [null, null] },
          ],
        }),
      };
    },
  });
  assert.equal(calls, 1);
  assert.equal(results.length, 1);
  assert.deepEqual(results[0], {
    id: 'place.1',
    label: 'Tucson, Arizona',
    longitude: -110.9747,
    latitude: 32.2226,
    utcOffset: -7,
  });
  assert.deepEqual(
    await searchLocations('Tu', {
      fetchImpl: () => {
        throw Error('Must not fetch');
      },
    }),
    [],
  );
  await assert.rejects(
    searchLocations('Tucson', { fetchImpl: async () => ({ ok: false, status: 403 }) }),
    /403.*coordinates/,
  );
});
