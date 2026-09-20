import test from 'node:test';
import assert from 'node:assert/strict';
import { dliZones } from '../src/domain/dli-zones.js';
import { defaultStudy, migrateStudy, analysisKey } from '../src/domain/study.js';
import { figureSvg, dliZoneColor } from '../src/report/figures.js';
import { exportCsv, methodsRows } from '../src/report/export.js';
import { receiverGrid } from '../src/domain/geometry.js';

const fixture = (values, weights = values.map(() => 1)) => ({
  cells: values.map((dli) => ({ dli })),
  grid: {
    nx: 1,
    ny: values.length,
    dx: 1,
    dy: 1,
    yEdges: [0, ...weights.map((_, i) => weights.slice(0, i + 1).reduce((a, b) => a + b, 0))],
  },
});

test('natural breaks separate light clusters, keep ties together, and handle uniform/empty maps', () => {
  const result = fixture([1, 1, 2, 12, 13, 30, 31]);
  const zones = dliZones(result, 3);
  assert.deepEqual(zones.cellZones, [1, 1, 1, 2, 2, 3, 3]);
  assert.deepEqual(zones.breaks, [7, 21.5]);
  assert.strictEqual(dliZones(result, 3), zones, 'Reuse classification across views');
  assert.equal(dliZones(result, 10).count, 6);
  for (const value of [0, 25]) {
    const uniform = dliZones(fixture([value, value]), 5);
    assert.equal(uniform.count, 1);
    assert.deepEqual(uniform.cellZones, [1, 1]);
    assert.equal(uniform.zones[0].areaPercent, 100);
  }
  assert.equal(dliZones(fixture([]), 5).count, 0);
  assert.equal(dliZones(null), null);
  const adjacent = dliZones(fixture([1 + Number.EPSILON, 1 + 2 * Number.EPSILON]), 2);
  assert.deepEqual(adjacent.cellZones, [1, 2]);
  assert.ok(adjacent.zones.every((zone) => Number.isFinite(zone.mean)));
  for (const count of [0, 11, 2.5, NaN]) assert.throws(() => dliZones(result, count));
  assert.throws(() => dliZones(fixture([NaN]), 2));
});

test('area-weighted optimization matches exhaustive partitions and reports true cell areas', () => {
  const values = [1, 2, 8, 9, 20],
    weights = [1, 20, 1, 3, 1];
  const cost = (lo, hi) => {
    const w = weights.slice(lo, hi).reduce((a, b) => a + b, 0);
    const mean = values.slice(lo, hi).reduce((a, b, j) => a + b * weights[lo + j], 0) / w;
    return values.slice(lo, hi).reduce((a, b, j) => a + (b - mean) ** 2 * weights[lo + j], 0);
  };
  function optimal(start, k) {
    if (k === 1) return cost(start, values.length);
    return Math.min(
      ...Array.from({ length: values.length - start - k + 1 }, (_, j) => {
        const end = start + j + 1;
        return cost(start, end) + optimal(end, k - 1);
      }),
    );
  }
  for (let k = 1; k <= 5; k++) {
    const z = dliZones(fixture(values, weights), k);
    const actual = values.reduce(
      (sum, value, i) => sum + weights[i] * (value - z.zones[z.cellZones[i] - 1].mean) ** 2,
      0,
    );
    assert.ok(Math.abs(actual - optimal(0, k)) < 1e-9);
    assert.equal(z.totalArea, 26);
    assert.ok(Math.abs(z.zones.reduce((sum, zone) => sum + zone.areaPercent, 0) - 100) < 1e-10);
  }
});

test('histogram classification stays finite, deterministic, ordered and exhaustive at 20,000 cells', () => {
  const values = Array.from({ length: 20000 }, (_, i) => 10 + (30 * i) / 19999);
  const result = {
    cells: values.map((dli) => ({ dli })),
    grid: { nx: 200, ny: 100, dx: 1, dy: 1, height: 100 },
  };
  const z = dliZones(result, 10);
  assert.equal(z.count, 10);
  assert.equal(
    z.zones.reduce((sum, zone) => sum + zone.cells, 0),
    20000,
  );
  assert.deepEqual(z, dliZones(structuredClone(result), 10));
  assert.ok(z.cellZones.every((id, i) => i === 0 || id >= z.cellZones[i - 1]));
  assert.ok(z.zones.every((zone) => zone.min <= zone.mean && zone.mean <= zone.max));
  const narrow = dliZones(fixture([20, 20 + 1e-12, 20 + 2e-12]), 2);
  assert.ok(narrow.zones.every((zone) => Number.isFinite(zone.mean)));
});

test('zone preferences migrate and round-trip without changing numerical result identity', () => {
  const s = defaultStudy(),
    original = analysisKey(s);
  assert.equal(s.analysis.dliZoneCount, 5);
  delete s.analysis.dliZoneCount;
  assert.equal(analysisKey(s), original, 'Legacy saved result keys remain valid');
  assert.equal(migrateStudy(s).analysis.dliZoneCount, 5);
  s.analysis.dliZoneCount = 3;
  assert.equal(migrateStudy(JSON.parse(JSON.stringify(s))).analysis.dliZoneCount, 3);
  assert.equal(analysisKey(s), original);
});

test('zoned figures, methods and receiver CSV share the displayed zone assignments', () => {
  const s = defaultStudy();
  s.analysis.dliZoneCount = 3;
  const grid = receiverGrid(s);
  const result = {
    grid,
    openDli: 40,
    openWh: 5000,
    meanDli: 20,
    meanSunlight: 50,
    estimated: true,
    cells: grid.points.map((cell, i) => ({
      ...cell,
      dli: [2, 15, 30][i % 3],
      sunlight: 50,
      wh: 2500,
    })),
  };
  const z = dliZones(result, 3);
  const svg = figureSvg(s, result, 'plan', 'zoned-dli');
  assert.match(svg, /Zoned DLI · Estimated DLI/);
  assert.match(svg, /Z1: 2.000–2.000/);
  assert.match(svg, /Z3: 30.000–30.000/);
  for (const zone of z.zones) assert.ok(svg.includes(dliZoneColor(z, zone.id)));
  assert.doesNotMatch(svg, /NaN|Infinity/);
  assert.match(methodsRows(s, result).find(([key]) => key === 'Zoned DLI')[1], /3 of 3/);
  const rows = exportCsv(s, result)
    .split('\r\n')
    .map((row) => row.split(',').map((v) => v.replaceAll('"', '')));
  assert.equal(rows[0][29], 'dli_zone');
  assert.deepEqual(
    rows.filter((row) => row[0] === 'receiver').map((row) => Number(row[29])),
    z.cellZones,
  );
  assert.doesNotMatch(figureSvg(s, null, 'plan', 'zoned-dli'), /Zoned DLI/);
});
