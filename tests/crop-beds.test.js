import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, studySchema, analysisKey } from '../src/domain/study.js';
import { cropRows, planCropBeds, addCropBeds } from '../src/experiment/crop-beds.js';
import { normalizeLayout, plotCorners } from '../src/experiment/grid-layout.js';
import { receiverGridSpec, worldToLocal, localToWorld } from '../src/domain/geometry.js';
import { plotStats } from '../src/experiment/layout.js';
import { rowEdge, rowHeight } from '../src/domain/receiver-grid.js';
import { initializeControl, fieldStudy, controlLayers } from '../src/experiment/control-field.js';
import {
  duplicateFieldGroup,
  moveFieldGroup,
  layoutSnapshot,
  resizeGrid,
} from '../src/experiment/field-editing.js';
import { projectDocument, readProject } from '../src/project/package.js';
import { figureSvg } from '../src/report/figures.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('bulk beds exactly partition selected cropping rows, including rotated wider aisles, without changing the receiver grid', async () => {
  for (const alignment of ['row-centres', 'spacing']) {
    const s = defaultStudy();
    s.array.azimuth = 37;
    s.array.groupSize = 2;
    s.array.aisle = 3;
    s.analysis.gridAlignment = alignment;
    const rows = cropRows(s),
      chosen = [rows[0].id, rows[1].id];
    const before = layoutSnapshot(s),
      key = analysisKey(s);
    const added = addCropBeds(s, { count: 4, rowIds: chosen, cropId: 'cilantro' });
    const next = studySchema.parse(added.study);
    assert.equal(next.crops.length, 8);
    assert.equal(analysisKey(next), key);
    assert.deepEqual(receiverGridSpec(next), receiverGridSpec(s));
    assert.deepEqual(layoutSnapshot(s), before);
    for (const r of rows.slice(0, 2)) {
      const beds = next.crops.filter((c) => c.notes === `Crop row ${r.id} (bulk layout).`);
      beds.forEach((bed, i) => {
        near(bed.width, r.x1 - r.x0);
        near(bed.length, (r.y1 - r.y0) / 4);
        assert.equal(bed.cropId, 'cilantro');
        const p = plotCorners(next, bed).map((p) => worldToLocal(next, p.x, p.y));
        near(Math.min(...p.map((p) => p.x)), r.x0);
        near(Math.max(...p.map((p) => p.x)), r.x1);
        near(Math.min(...p.map((p) => p.y)), r.y0 + i * bed.length);
        near(Math.max(...p.map((p) => p.y)), r.y0 + (i + 1) * bed.length);
      });
    }
    assert.deepEqual(normalizeLayout(next).crops, next.crops);
    const read = await readProject(
      new TextEncoder().encode(JSON.stringify(await projectDocument(next))),
      'beds.json',
    );
    assert.deepEqual(read.study.crops, next.crops);
    const control = initializeControl(next);
    assert.deepEqual(
      fieldStudy(control, true).crops.map((c) => c.grid),
      next.crops.map((c) => c.grid),
    );
    const copy = duplicateFieldGroup(next, added.selections, { column: 1, row: 1 });
    copy.study.crops.slice(8).forEach((c, i) => {
      near(c.width, next.crops[i].width);
      near(c.length, next.crops[i].length);
    });
    assert.equal(new Set(copy.study.crops.map((c) => c.id)).size, 16);
    const moved = moveFieldGroup(next, added.selections, { column: 10000, row: -10000 });
    moved.crops.forEach((c, i) => {
      near(c.width, next.crops[i].width);
      near(c.length, next.crops[i].length);
    });
  }
});

test('bulk planning rejects empty/invalid selections and limits without partially adding beds', () => {
  const s = defaultStudy(),
    options = { count: 3, rowIds: [1], cropId: 'lettuce' };
  for (const count of [0, -1, 1.5, 201, NaN])
    assert.throws(() => planCropBeds(s, { ...options, count }));
  assert.throws(() => planCropBeds(s, { ...options, rowIds: [] }));
  assert.throws(() => planCropBeds(s, { ...options, rowIds: [100] }));
  assert.throws(() => planCropBeds(s, { ...options, cropId: 'missing' }));
  assert.equal(planCropBeds(s, { ...options, rowIds: [1, 1] }).length, 3);
  const full = { ...s, crops: Array(199).fill({}) };
  assert.throws(() => addCropBeds(full, options), /200 crop beds/);
  assert.equal(full.crops.length, 199);
  s.array.rows = 1;
  assert.throws(() => planCropBeds(s, options), /No cropping areas/);
  s.array.rows = 4;
  s.landUse.underPanelWidth = 0;
  assert.deepEqual(
    cropRows(s).map((r) => r.id),
    [1, 2, 3],
  );
});

test('exact bed light weights include partial cells and conserve cropping-area light over all divisions', () => {
  const s = defaultStudy();
  const { study: next } = addCropBeds(s, { count: 13, rowIds: [1], cropId: 'lettuce' });
  const g = receiverGridSpec(s),
    cells = Array.from({ length: g.nx * g.ny }, (_, i) => ({
      dli: 10 + Math.floor(i / g.nx),
      sunlight: 50,
      shade: 50,
    }));
  const r = cropRows(s)[0];
  let integral = 0;
  for (let row = 0; row < g.ny; row++)
    integral +=
      (10 + row) *
      Math.max(0, Math.min(r.y1, rowEdge(g, row + 1)) - Math.max(r.y0, rowEdge(g, row)));
  const stats = next.crops.map((p) => plotStats({ grid: g, cells }, p));
  assert.ok(stats.every((v) => v && v.count > 0));
  near(
    stats.reduce((sum, v, i) => sum + v.mean * next.crops[i].length, 0),
    integral,
  );
  near(stats[0].sunlight, 50);
});

test('control cropping-area reference can be shown, hidden and exported without PV', () => {
  const layers = controlLayers({ cropping: true, plots: true });
  assert.equal(layers.cropping, true);
  assert.equal(layers.modules, false);
  assert.equal(controlLayers({ cropping: false }).cropping, false);
  const svg = figureSvg(defaultStudy(), null, 'plan', 'sunlight', 'array', true, {
    control: true,
    layers,
  });
  assert.match(svg, /data-land-zone="cropping"/);
  assert.doesNotMatch(svg, /data-land-zone="underPanel"/);
});

test('exact bulk-bed resizing keeps the opposite corner and respects physical boundaries', () => {
  const s = addCropBeds(defaultStudy(), { count: 13, rowIds: [1], cropId: 'lettuce' }).study;
  const g = receiverGridSpec(s),
    old = s.crops[0].grid;
  for (const corner of ['sw', 'se', 'ne', 'nw']) {
    const fixedX = old.column + (corner.includes('e') ? 0 : old.columns);
    const fixedY = old.row + (corner.includes('n') ? 0 : old.rows);
    for (const x of [-1e6, 1e6])
      for (const y of [-1e6, 1e6]) {
        const resized = resizeGrid(s, old, corner, localToWorld(s, x, y), true);
        near(corner.includes('e') ? resized.column : resized.column + resized.columns, fixedX);
        near(corner.includes('n') ? resized.row : resized.row + resized.rows, fixedY);
        assert.ok(resized.column >= 0 && resized.row >= 0);
        assert.ok(
          resized.column + resized.columns <= g.nx + 1e-8 &&
            resized.row + resized.rows <= g.ny + 1e-8,
        );
        assert.ok(resized.columns > 0 && resized.rows > 0);
      }
  }
});
