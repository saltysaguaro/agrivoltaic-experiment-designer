import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import {
  defaultStudy,
  migrateStudy,
  studySchema,
  updateStudyInput,
  dimensions,
  analysisKey,
  designIssues,
} from '../src/domain/study.js';
import { rowPitches, rowPositions, applySpacingPattern } from '../src/domain/row-spacing.js';
import {
  buildGeometry,
  disposeGroup,
  receiverGridSpec,
  getPose,
  worldToLocal,
} from '../src/domain/geometry.js';
import { landUseZones } from '../src/domain/land-use.js';
import { cropRows, planCropBeds } from '../src/experiment/crop-beds.js';
import { designGridSpec } from '../src/experiment/design-grid.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
import { createFigureContext, figureSvg } from '../src/report/figures.js';
import { methodsRows } from '../src/report/export.js';
import { provenanceRecord } from '../src/report/provenance.js';
import { projectDocument, readProject } from '../src/project/package.js';
import { calculateDay } from '../src/irradiance/engine.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} ≈ ${b}`);
const custom = (pitches = [6, 10, 7]) => {
  let s = defaultStudy();
  s.row.tables = 1;
  s.table.wide = 2;
  s.array.groupSize = 2;
  s = updateStudyInput(s, 'rowPair', 'multipleSpacings', true);
  return updateStudyInput(s, 'rowPair', 'customPitches', pitches);
};

test('custom spacing defaults off, seeds actual aisles, retains inactive gaps, and round-trips', async () => {
  let s = defaultStudy();
  delete s.rowPair.multipleSpacings;
  delete s.rowPair.customPitches;
  s = migrateStudy(s);
  assert.equal(s.rowPair.multipleSpacings, false);
  s.array.groupSize = 2;
  const originalKey = analysisKey(s);
  const original = rowPositions(s);
  s = updateStudyInput(s, 'rowPair', 'multipleSpacings', true);
  assert.deepEqual(s.rowPair.customPitches, [8, 11, 8]);
  assert.deepEqual(rowPositions(s), original);
  s = updateStudyInput(s, 'rowPair', 'customPitches', [6, 10, 7]);
  const key = analysisKey(s);
  assert.notEqual(key, originalKey);
  s = updateStudyInput(s, 'rowPair', 'multipleSpacings', false);
  assert.equal(analysisKey(s), originalKey);
  assert.deepEqual(rowPositions(s), original);
  s = updateStudyInput(s, 'rowPair', 'multipleSpacings', true);
  assert.equal(analysisKey(s), key);
  s = updateStudyInput(s, 'array', 'rows', 2);
  assert.deepEqual(rowPitches(s), [6]);
  assert.deepEqual(s.rowPair.customPitches, [6, 10, 7]);
  s = updateStudyInput(s, 'array', 'rows', 5);
  assert.deepEqual(rowPitches(s), [6, 10, 7, 11]);
  assert.deepEqual(migrateStudy(JSON.parse(JSON.stringify(s))), s);
  const imported = await readProject(
    new TextEncoder().encode(JSON.stringify(await projectDocument(s, null))),
    'custom.json',
  );
  assert.deepEqual(imported.study.rowPair, s.rowPair);
});

test('patterns and individual gaps are bounded and land widths use the narrowest gap', () => {
  let s = custom();
  assert.deepEqual(applySpacingPattern(s, '6, 10'), [6, 10, 6]);
  for (const text of ['', '0', '141', 'NaN', '6, nope'])
    assert.throws(() => applySpacingPattern(s, text));
  for (const pitches of [[0], [NaN], [Infinity], [141], Array(24).fill(6)])
    assert.equal(
      studySchema.safeParse({ ...s, rowPair: { ...s.rowPair, customPitches: pitches } }).success,
      false,
    );
  s = updateStudyInput(s, 'landUse', 'underPanelWidth', 8);
  assert.equal(s.landUse.underPanelWidth, 6);
  assert.equal(s.rowPair.croppingWidth, 0);
  assert.deepEqual(
    cropRows(s).map((r) => r.id),
    [2, 3],
  );
  s = updateStudyInput(s, 'rowPair', 'customPitches', [140, 140, 140]);
  assert.doesNotThrow(() => studySchema.parse(s));
  s = updateStudyInput(s, 'rowPair', 'customPitches', [1, 10, 7]);
  assert.ok(designIssues(s).some((issue) => /overlap/.test(issue)));
});

test('custom row positions agree across physical geometry, receivers, crop beds and dimensions', () => {
  const s = custom();
  s.array.azimuth = 137;
  s.landUse.underPanelWidth = 2;
  const positions = [-11.5, -5.5, 4.5, 11.5],
    g = buildGeometry(s),
    grid = receiverGridSpec(s);
  try {
    assert.deepEqual(g.userData.rowOffsets, positions);
    near(dimensions(s).span, 23);
    for (const y of positions) assert.ok(grid.yEdges.some((edge) => Math.abs(edge - y) < 1e-8));
    const modules = g.children.filter((m) => m.userData.kind === 'module');
    for (let i = 0; i < 4; i++)
      near(worldToLocal(s, modules[i * 2].position.x, modules[i * 2].position.y).y, positions[i]);
    const crops = cropRows(s);
    assert.deepEqual(
      crops.map((r) => r.y1 - r.y0),
      [4, 8, 5],
    );
    assert.deepEqual(
      crops.map((r) => r.id),
      [1, 2, 3],
    );
    const beds = planCropBeds(s, { count: 2, rowIds: [2], cropId: 'lettuce' });
    near(beds[0].y0, -4.5);
    near(beds[1].y1, 3.5);
    const land = landUseZones(s);
    assert.deepEqual(land, landUseZones(s, g.userData));
    const annotation = engineeringAnnotations(s, 'array', g, { id: 'rowPair.customPitches.1' })[0];
    near(annotation.points[0].distanceTo(annotation.points[1]), 10);
    assert.equal(annotation.value, '10 m');
    s.designGrid = { version: 1, mode: 'square', cellsPerRow: 8 };
    const fieldGrid = designGridSpec(s);
    near(fieldGrid.dx, 1);
    near(fieldGrid.dy, 1);
    assert.deepEqual(receiverGridSpec(s), grid);
  } finally {
    disposeGroup(g);
  }
});

test('tracker backtracking uses narrowest active gap and ignores retained inactive gaps', () => {
  let s = custom([3, 10, 7]);
  const sun = new Vector3(1, 0, 0.1).normalize();
  const regular = structuredClone(s);
  regular.rowPair.multipleSpacings = false;
  regular.rowPair.pitch = 3;
  near(getPose(s, sun).tilt, getPose(regular, sun).tilt);
  regular.rowPair.pitch = 8;
  assert.ok(Math.abs(getPose(s, sun).tilt) < Math.abs(getPose(regular, sun).tilt));
  s = updateStudyInput(s, 'rowPair', 'customPitches', [8, 10, 0.5]);
  s = updateStudyInput(s, 'array', 'rows', 2);
  near(getPose(s, sun).tilt, getPose(regular, sun).tilt);
});

test('custom spacing invalidates figure geometry and numerical keys, and is disclosed in exports', () => {
  const s = custom(),
    key = analysisKey(s),
    context = createFigureContext();
  try {
    const before = context.get(s, 'array');
    const changed = updateStudyInput(s, 'rowPair', 'customPitches', [6, 12, 7]);
    assert.notEqual(analysisKey(changed), key);
    assert.notEqual(context.get(changed, 'array'), before);
    near(context.get(changed, 'array').userData.span, 25);
    assert.match(new Map(methodsRows(s, null)).get('Row pitch · P'), /2–3: 10 m/);
    assert.match(provenanceRecord(s, null).backtracking, /narrowest active pitch \(6 m\)/);
    assert.match(figureSvg(s, null, 'plan'), /2–3: 10 m/);
    assert.equal(analysisKey(updateStudyInput(s, 'landUse', 'underPanelWidth', 3)), key);
    const hidden = updateStudyInput(s, 'rowPair', 'customPitches', [6, 10, 7, 20]);
    assert.equal(analysisKey(hidden), key);
  } finally {
    context.dispose();
  }
});

test('changing custom gaps with the same total span cannot reuse stale receiver visibility', async () => {
  const s = custom([6, 10, 7]);
  s.racking.type = 'fixed';
  s.weather.mode = 'sample';
  s.analysis.backend = 'cpu';
  s.analysis.patches = 145;
  s.analysis.cellsPerRow = 2;
  s.analysis.interval = 60;
  const memory = new Map(),
    cache = {
      get: async (key) => memory.get(key),
      put: async (key, value) => memory.set(key, value),
    };
  const first = await calculateDay(s, () => {}, { cache });
  const changed = updateStudyInput(s, 'rowPair', 'customPitches', [10, 6, 7]);
  const second = await calculateDay(changed, () => {}, { cache });
  assert.notEqual(first.key, second.key);
  assert.equal(first.grid.height, second.grid.height);
  assert.notDeepEqual(first.grid.yEdges, second.grid.yEdges);
  assert.equal(second.cached, 0);
  const reference = await calculateDay(changed, () => {}, {
    cache: { get: async () => null, put: async () => {} },
  });
  second.cells.forEach((cell, i) => {
    near(cell.wh, reference.cells[i].wh);
    near(cell.dli, reference.cells[i].dli);
  });
  assert.ok((await calculateDay(changed, () => {}, { cache })).cached > 0);
});
