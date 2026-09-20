import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, studySchema, analysisKey, sensorTypes } from '../src/domain/study.js';
import { sensorGrid, planSensors, addSensors } from '../src/experiment/sensor-grid.js';
import { cellAt, cellCenter, normalizeLayout } from '../src/experiment/grid-layout.js';
import { worldToLocal, receiverGridSpec } from '../src/domain/geometry.js';
import {
  initializeControl,
  fieldStudy,
  storeField,
  allFieldIds,
} from '../src/experiment/control-field.js';
import { projectDocument, readProject } from '../src/project/package.js';
const options = {
  rows: 3,
  columns: 10,
  type: 'Soil moisture',
  selected: ['1:0:0', '1:2:9', '2:1:4'],
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('sensor planning divides rotated cropping areas and aisles into the requested grid and snaps cell centres', () => {
  for (const gridAlignment of ['row-centres', 'spacing']) {
    const s = defaultStudy();
    s.array.azimuth = 37;
    s.array.groupSize = 2;
    s.array.aisle = 4;
    s.analysis.gridAlignment = gridAlignment;
    const areas = sensorGrid(s, options);
    assert.equal(areas.length, 3);
    assert.ok(areas[1].y1 - areas[1].y0 > areas[0].y1 - areas[0].y0);
    for (const area of areas) {
      assert.equal(area.cells.length, 30);
      for (const cell of area.cells) {
        const target = worldToLocal(s, cell.target.x, cell.target.y);
        near(target.x, area.x0 + ((cell.column + 0.5) * (area.x1 - area.x0)) / 10);
        near(target.y, area.y1 - ((cell.row + 0.5) * (area.y1 - area.y0)) / 3);
        assert.deepEqual(cell.grid, cellAt(s, cell.target));
        assert.deepEqual(cell.position, cellCenter(s, cell.grid));
      }
    }
  }
});

test('bulk sensors preserve type, independent height, existing items, unique IDs and irradiation across control and project round trips', async () => {
  const s = defaultStudy(),
    key = analysisKey(s),
    grid = receiverGridSpec(s);
  for (const type of sensorTypes) {
    const added = addSensors(s, { ...options, type });
    const next = studySchema.parse(added.study);
    assert.equal(next.experimentSensors.length, 3);
    assert.ok(
      next.experimentSensors.every((v) => v.type === type && v.z === s.analysis.receiverHeight),
    );
    assert.equal(analysisKey(next), key);
    assert.deepEqual(receiverGridSpec(next), grid);
    assert.deepEqual(normalizeLayout(next).experimentSensors, next.experimentSensors);
  }
  const first = addSensors(s, options).study;
  const second = addSensors(first, options).study;
  assert.equal(second.experimentSensors.length, 6);
  assert.deepEqual(second.experimentSensors.slice(0, 3), first.experimentSensors);
  assert.equal(allFieldIds(second).size, 6);
  const control = initializeControl(second);
  const added = addSensors(fieldStudy(control, true), options, {
    control: true,
    reservedIds: allFieldIds(control),
  });
  const combined = studySchema.parse(storeField(control, added.study, true));
  assert.equal(combined.experimentSensors.length, 6);
  assert.equal(combined.controlField.experimentSensors.length, 9);
  assert.equal(allFieldIds(combined).size, 15);
  assert.ok(combined.controlField.experimentSensors.every((s) => s.treatment === 'Control'));
  assert.equal(analysisKey(combined), key);
  const loaded = await readProject(
    new TextEncoder().encode(JSON.stringify(await projectDocument(combined))),
    'sensors.json',
  );
  assert.deepEqual(loaded.study.experimentSensors, combined.experimentSensors);
  assert.deepEqual(
    loaded.study.controlField.experimentSensors,
    combined.controlField.experimentSensors,
  );
});

test('invalid sensor grids, empty selection, stale cells and field limits reject the whole batch', () => {
  const s = defaultStudy();
  for (const n of [0, -1, 1.5, NaN, 51]) {
    assert.throws(() => sensorGrid(s, { rows: n, columns: 10 }));
    assert.throws(() => sensorGrid(s, { rows: 3, columns: n }));
  }
  assert.throws(() => planSensors(s, { ...options, selected: [] }), /at least one/);
  assert.throws(() => planSensors(s, { ...options, selected: ['1:3:0'] }), /no longer match/);
  assert.throws(() => planSensors(s, { ...options, type: 'unknown' }), /sensor type/);
  assert.equal(planSensors(s, { ...options, selected: ['1:0:0', '1:0:0'] }).length, 1);
  const full = { ...s, experimentSensors: Array(499).fill({}) };
  assert.throws(() => addSensors(full, options), /500 sensors/);
  assert.equal(full.experimentSensors.length, 499);
  assert.throws(
    () => sensorGrid({ ...s, array: { ...s.array, rows: 1 } }, options),
    /No cropping areas/,
  );
  assert.throws(
    () => sensorGrid({ ...s, array: { ...s.array, rows: 24 } }, { rows: 50, columns: 50 }),
    /10,000/,
  );
});

test('multiple checked planning cells sharing a receiver location still create independent sensors', () => {
  const s = defaultStudy();
  s.analysis.cellsPerRow = 1;
  const areas = sensorGrid(s, { rows: 10, columns: 50 });
  const [a, b] = areas[0].cells;
  assert.deepEqual(a.grid, b.grid);
  const added = addSensors(s, { rows: 10, columns: 50, type: 'PAR', selected: [a.id, b.id] });
  assert.equal(added.study.experimentSensors.length, 2);
  assert.notEqual(added.study.experimentSensors[0].id, added.study.experimentSensors[1].id);
  assert.deepEqual(added.study.experimentSensors[0].grid, added.study.experimentSensors[1].grid);
});
