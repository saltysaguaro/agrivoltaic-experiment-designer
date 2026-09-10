import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, analysisKey, studySchema } from '../src/domain/study.js';
import { normalizeLayout, cellCenter, plotCorners } from '../src/experiment/grid-layout.js';
import { receiverGridSpec, localToWorld } from '../src/domain/geometry.js';
import {
  moveGrid,
  resizeGrid,
  replaceFieldItem,
  layoutSnapshot,
} from '../src/experiment/field-editing.js';
import { cropIdentity } from '../src/domain/crop-catalog.js';
function fixture() {
  const s = defaultStudy();
  s.array.azimuth = 137;
  s.analysis.resolution = 1.3;
  s.experimentSensors = [
    {
      id: 'S1',
      type: 'Soil temperature',
      x: 0,
      y: 0,
      z: -0.35,
      grid: { column: 4, row: 4 },
      treatment: 'Interior',
      replicate: '1',
      model: 'Probe',
      logger: 'L1',
      channel: '2',
      notes: 'Buried',
    },
  ];
  s.crops = [
    {
      id: 'P1',
      ...cropIdentity('lettuce'),
      cultivar: 'Butterhead',
      x: 0,
      y: 0,
      width: 3,
      length: 4,
      grid: { column: 2, row: 3, columns: 3, rows: 4 },
      treatment: 'Interrow',
      replicate: '1',
    },
  ];
  return studySchema.parse(normalizeLayout(s));
}
test('sensor and bed moves snap, clamp and retain independent depth, metadata and numerical results', () => {
  const s = fixture(),
    key = analysisKey(s),
    snap = layoutSnapshot(s),
    g = receiverGridSpec(s);
  const moved = {
    ...s.experimentSensors[0],
    grid: moveGrid(s, s.experimentSensors[0].grid, { column: 10000, row: -10000 }),
  };
  let next = replaceFieldItem(s, { kind: 'sensor', id: 'S1' }, moved);
  assert.equal(next.experimentSensors[0].grid.column, g.nx - 1);
  assert.equal(next.experimentSensors[0].grid.row, 0);
  assert.equal(next.experimentSensors[0].z, -0.35);
  assert.equal(next.experimentSensors[0].logger, 'L1');
  const p = cellCenter(s, next.experimentSensors[0].grid);
  assert.equal(next.experimentSensors[0].x, p.x);
  assert.equal(next.experimentSensors[0].y, p.y);
  next = replaceFieldItem(
    next,
    { kind: 'crop', id: 'P1' },
    { ...s.crops[0], grid: moveGrid(s, s.crops[0].grid, { column: 1.4, row: -1.7 }) },
  );
  assert.deepEqual(next.crops[0].grid, { column: 3, row: 1, columns: 3, rows: 4 });
  assert.equal(next.crops[0].cultivar, 'Butterhead');
  assert.equal(analysisKey(next), key);
  assert.deepEqual(layoutSnapshot(s), snap, 'Gesture source remains unchanged for cancel/undo');
  assert.deepEqual(layoutSnapshot(studySchema.parse(normalizeLayout({ ...next, ...snap }))), snap);
});
test('all four crop-bed corners resize from their opposite anchor in a rotated receiver grid', () => {
  const s = fixture(),
    g = receiverGridSpec(s),
    old = s.crops[0].grid;
  for (const [corner, xy] of Object.entries({ sw: [1, 2], se: [7, 2], ne: [7, 9], nw: [1, 9] })) {
    const point = localToWorld(s, -g.width / 2 + xy[0] * g.dx, -g.height / 2 + xy[1] * g.dy);
    const grid = resizeGrid(s, old, corner, point);
    const fixedX = old.column + (corner.includes('e') ? 0 : old.columns),
      fixedY = old.row + (corner.includes('n') ? 0 : old.rows);
    assert.equal(corner.includes('e') ? grid.column : grid.column + grid.columns, fixedX);
    assert.equal(corner.includes('n') ? grid.row : grid.row + grid.rows, fixedY);
    const updated = replaceFieldItem(s, { kind: 'crop', id: 'P1' }, { ...s.crops[0], grid });
    assert.ok(Math.abs(updated.crops[0].width - grid.columns * g.dx) < 1e-10);
    assert.ok(Math.abs(updated.crops[0].length - grid.rows * g.dy) < 1e-10);
    assert.equal(analysisKey(updated), analysisKey(s));
    assert.equal(plotCorners(updated, updated.crops[0]).length, 4);
  }
});
test('resizing cannot flip a bed, leave the receiver domain or exceed software dimensions', () => {
  const s = fixture(),
    old = s.crops[0].grid,
    g = receiverGridSpec(s);
  for (const corner of ['sw', 'se', 'ne', 'nw'])
    for (const x of [-1e6, 1e6])
      for (const y of [-1e6, 1e6]) {
        const grid = resizeGrid(s, old, corner, localToWorld(s, x, y));
        assert.ok(grid.columns >= 1 && grid.rows >= 1);
        assert.ok(grid.column >= 0 && grid.row >= 0);
        assert.ok(grid.column + grid.columns <= g.nx && grid.row + grid.rows <= g.ny);
        assert.ok(grid.columns * g.dx <= 100 && grid.rows * g.dy <= 100);
      }
});
