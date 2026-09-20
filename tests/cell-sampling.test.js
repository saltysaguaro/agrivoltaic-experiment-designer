import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, migrateStudy, analysisKey } from '../src/domain/study.js';
import { cellSampleOffsets, rowHeight } from '../src/domain/receiver-grid.js';
import { receiverGrid, localToWorld } from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { readProject, buildProjectPackage } from '../src/project/package.js';
import { validateResult } from '../src/project/results.js';
import { reportHtml, exportCsv } from '../src/report/export.js';
import { controlResult } from '../src/experiment/control-field.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const cache = { get: async () => null, put: async () => {} };
function fixture() {
  const s = defaultStudy();
  s.racking.type = 'fixed';
  s.table.high = 1;
  s.table.wide = 2;
  s.row.tables = 1;
  s.array.rows = 3;
  s.array.groupSize = 2;
  s.array.buffer = 0.5;
  s.array.azimuth = 37;
  s.weather.mode = 'sample';
  s.analysis.resolution = 2;
  s.analysis.patches = 145;
  s.analysis.backend = 'auto';
  return s;
}

test('all integer sample counts 1–9 have bounded equal-area centroids; old projects retain single-sample keys', () => {
  const old = fixture();
  delete old.analysis.samplesPerCell;
  const restored = migrateStudy(old);
  assert.equal(restored.analysis.samplesPerCell, 1);
  assert.equal(analysisKey(restored), analysisKey(old));
  for (let count = 1; count <= 9; count++) {
    const s = fixture();
    s.analysis.samplesPerCell = count;
    assert.equal(migrateStudy(s).analysis.samplesPerCell, count);
    const points = cellSampleOffsets(count);
    assert.equal(points.length, count);
    assert.equal(new Set(points.map((p) => JSON.stringify(p))).size, count);
    assert.ok(points.every((p) => p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1));
    near(
      points.reduce((v, p) => v + p.x / count, 0),
      0.5,
    );
    near(
      points.reduce((v, p) => v + p.y / count, 0),
      0.5,
    );
    if (count > 1) assert.notEqual(analysisKey(s), analysisKey(restored));
  }
  assert.deepEqual(cellSampleOffsets(1), [{ x: 0.5, y: 0.5 }]);
  for (const n of [2, 3])
    assert.deepEqual(
      cellSampleOffsets(n * n),
      Array.from({ length: n * n }, (_, i) => ({
        x: ((i % n) + 0.5) / n,
        y: (Math.floor(i / n) + 0.5) / n,
      })),
    );
  for (const count of [0, 10, 1.5]) {
    const s = fixture();
    s.analysis.samplesPerCell = count;
    assert.throws(() => migrateStudy(s));
    assert.throws(() => cellSampleOffsets(count));
  }
});

test('every sampling count conserves open-field energy and measured PPFD with bounded batches', async () => {
  for (let count = 1; count <= 9; count++) {
    const s = fixture();
    s.analysis.samplesPerCell = count;
    const base = await import('../src/irradiance/solar.js');
    s.weather.rows = base
      .sampleWeather(s)
      .map((w) => ({ ...w, ppfd: w.ghi * 2, diffusePpfd: w.dhi * 2 }));
    const grid = receiverGrid(s),
      engine = new CpuBvhIrradianceEngine();
    engine.initializeGeometry = async () => {}; // Empty-scene conservation reference.
    const trace = engine.visibility.bind(engine);
    engine.visibility = (points, directions) => {
      assert.equal(points.length, grid.points.length);
      return trace(points, directions);
    };
    const result = await calculateDay(s, () => {}, { cache, createGpu: async () => engine });
    assert.equal(result.estimated, false);
    for (const cell of result.cells) {
      near(cell.wh, result.openWh);
      near(cell.dli, result.openDli);
      near(cell.sunlight, 100);
    }
  }
});

test('cell means match independent offset CPU solves for opaque and transmitting rotated unequal cells', async () => {
  for (const bifacial of [false, true]) {
    const s = fixture();
    s.module.bifacial = bifacial;
    for (const count of [4, 9]) {
      s.analysis.samplesPerCell = count;
      const progress = [];
      const actual = await calculateDay(s, (p) => progress.push(p.progress), {
        cache,
        createGpu: async () => new CpuBvhIrradianceEngine(),
      });
      const grid = receiverGrid(s);
      const totals = grid.points.map(() => ({ wh: 0, dli: 0 }));
      const side = Math.sqrt(count);
      // Independently shift centre-point solves onto a regular 2×2 / 3×3 pattern.
      for (let y = 0; y < side; y++)
        for (let x = 0; x < side; x++) {
          const engine = new CpuBvhIrradianceEngine(),
            trace = engine.visibility.bind(engine);
          engine.visibility = (points, directions) =>
            trace(
              points.map((p, i) => {
                const offset = localToWorld(
                  s,
                  ((x + 0.5) / side - 0.5) * grid.dx,
                  ((y + 0.5) / side - 0.5) * rowHeight(grid, Math.floor(i / grid.nx)),
                  0,
                );
                return { x: p.x + offset.x, y: p.y + offset.y, z: p.z };
              }),
              directions,
            );
          const single = await calculateDay(
            { ...s, analysis: { ...s.analysis, samplesPerCell: 1 } },
            () => {},
            {
              cache,
              createGpu: async () => engine,
            },
          );
          single.cells.forEach((c, i) => {
            totals[i].wh += c.wh / count;
            totals[i].dli += c.dli / count;
          });
        }
      actual.cells.forEach((cell, i) => {
        near(cell.wh, totals[i].wh);
        near(cell.dli, totals[i].dli);
        near(cell.x, grid.points[i].x);
        near(cell.y, grid.points[i].y);
      });
      assert.equal(progress.at(-1), 1);
      assert.ok(progress.every((p, i) => p >= 0 && p <= 1 && (!i || p >= progress[i - 1])));
    }
  }
});

test('sampling caches stay isolated; packages, reports and control retain the sampling definition', async () => {
  const s = fixture(),
    memory = new Map();
  const options = {
    cache: {
      get: async (key) => memory.get(key),
      put: async (key, value) => memory.set(key, value),
    },
    createGpu: async () => new CpuBvhIrradianceEngine(),
  };
  const single = await calculateDay(s, () => {}, options);
  const legacy = structuredClone(single);
  delete legacy.samplesPerCell;
  await validateResult(s, legacy);
  for (const count of [2, 5, 9]) {
    s.analysis.samplesPerCell = count;
    const first = await calculateDay(s, () => {}, options);
    assert.equal(first.cached, 0);
    const second = await calculateDay(s, () => {}, options);
    assert.equal(second.cached, count);
    assert.deepEqual(second.cells, first.cells);
    await assert.rejects(validateResult(s, single));
    const file = await buildProjectPackage(s, first),
      opened = await readProject(file.archive, 'sampled.zip');
    assert.equal(opened.study.analysis.samplesPerCell, count);
    assert.equal(opened.result.samplesPerCell, count);
    assert.deepEqual(opened.result.cells, first.cells);
    assert.match(reportHtml(s, first), new RegExp(`${count} samples per cell`));
    assert.match(exportCsv(s, first), new RegExp(`${count} samples per cell`));
    const control = controlResult(first);
    assert.ok(control.cells.every((c) => c.dli === first.openDli && c.sunlight === 100));
    await assert.rejects(validateResult(s, { ...first, samplesPerCell: 1 }), /sampling/);
  }
});
