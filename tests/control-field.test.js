import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, migrateStudy, analysisKey, studySchema } from '../src/domain/study.js';
import { receiverGridSpec, receiverGrid } from '../src/domain/geometry.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import {
  fieldStudy,
  storeField,
  initializeControl,
  controlResult,
  allFieldIds,
} from '../src/experiment/control-field.js';
import { duplicateFieldGroup, moveFieldGroup } from '../src/experiment/field-editing.js';
import { withoutFieldLayout } from '../src/project/browser-study.js';
import { figureSvg } from '../src/report/figures.js';
import { reportHtml, exportCsv } from '../src/report/export.js';
import { projectDocument, readProject, buildProjectPackage } from '../src/project/package.js';
import { cropIdentity } from '../src/domain/crop-catalog.js';
function example() {
  const s = defaultStudy();
  s.racking.type = 'fixed';
  s.array.azimuth = 37;
  s.experimentSensors = [1, 2].map((n) => ({
    id: `S-${n}`,
    type: 'PAR',
    x: 0,
    y: 0,
    z: -0.2,
    grid: { column: n, row: n + 1 },
    treatment: 'AV',
    replicate: '2',
    model: 'PAR model',
    logger: 'L',
    channel: '3',
    azimuth: 180,
    tilt: 20,
    notes: 'Installation metadata',
  }));
  s.crops = [
    {
      id: 'P-1',
      ...cropIdentity('lettuce'),
      cultivar: 'Trial cultivar',
      notes: 'Bed notes',
      treatment: 'AV',
      replicate: '2',
      x: 0,
      y: 0,
      width: 1,
      length: 1,
      grid: { column: 4, row: 3, columns: 2, rows: 3 },
    },
  ];
  return studySchema.parse(normalizeLayout(s));
}
const targets = [
  { kind: 'sensor', id: 'S-1' },
  { kind: 'sensor', id: 'S-2' },
  { kind: 'crop', id: 'P-1' },
];
test('control starts as an independent matching layout, keeps unique IDs and does not invalidate irradiance', () => {
  const original = example(),
    s = initializeControl(original),
    c = fieldStudy(s, true);
  assert.equal(original.controlField.initialized, false);
  assert.equal(allFieldIds(s).size, 6);
  assert.equal(analysisKey(s), analysisKey(original));
  assert.deepEqual(receiverGridSpec(c), receiverGridSpec(original));
  assert.deepEqual(c.crops[0].grid, original.crops[0].grid);
  assert.equal(c.crops[0].cultivar, original.crops[0].cultivar);
  assert.equal(c.experimentSensors[0].z, -0.2);
  assert.equal(c.experimentSensors[0].treatment, 'Control');
  c.experimentSensors = [];
  const edited = storeField(s, c, true);
  assert.equal(edited.experimentSensors.length, 2);
  assert.equal(edited.controlField.experimentSensors.length, 0);
  assert.equal(initializeControl(edited), edited);
  assert.equal(analysisKey(edited), analysisKey(s));
  const changed = normalizeLayout({
    ...edited,
    analysis: { ...edited.analysis, cellsPerRow: 30 },
  });
  assert.deepEqual(changed.controlField.crops[0].grid, s.controlField.crops[0].grid);
  assert.notEqual(analysisKey(changed), analysisKey(s));
});
test('control light uses the full-sun source, including period mean daily DLI and measured PPFD provenance', () => {
  const s = example(),
    grid = receiverGrid(s);
  for (const estimated of [true, false]) {
    const r = {
      grid,
      cells: grid.points.map((c) => ({ ...c, dli: 12, wh: 5000, sunlight: 25, shade: 75 })),
      openWh: 20000,
      openDli: 48,
      meanDli: 12,
      estimated,
      period: { days: 3 },
      backend: 'CPU',
      warnings: [],
    };
    const control = controlResult(r);
    assert.ok(
      control.cells.every(
        (c) => c.dli === 48 && c.wh === 20000 && c.sunlight === 100 && c.shade === 0,
      ),
    );
    assert.equal(control.meanDli, 48);
    assert.equal(control.estimated, estimated);
    assert.equal(r.cells[0].dli, 12);
  }
  assert.equal(controlResult(null), null);
});
test('group duplication and movement preserve cell relationships, sizes and metadata at field boundaries', () => {
  const s = example(),
    key = analysisKey(s);
  const copy = duplicateFieldGroup(s, targets, { column: 20000, row: -20000 });
  assert.equal(copy.selections.length, 3);
  const a = copy.study.experimentSensors.at(-2),
    b = copy.study.experimentSensors.at(-1),
    bed = copy.study.crops.at(-1);
  assert.equal(b.grid.column - a.grid.column, 1);
  assert.equal(b.grid.row - a.grid.row, 1);
  assert.equal(bed.grid.column - a.grid.column, 3);
  assert.equal(bed.grid.row - a.grid.row, 1);
  assert.equal(bed.grid.columns, 2);
  assert.equal(bed.grid.rows, 3);
  assert.equal(bed.width, s.crops[0].width);
  assert.equal(bed.cultivar, 'Trial cultivar');
  assert.equal(a.z, -0.2);
  assert.equal(a.channel, '3');
  assert.equal(allFieldIds(copy.study).size, 6);
  assert.equal(analysisKey(copy.study), key);
  const moved = moveFieldGroup(copy.study, copy.selections, { column: -1, row: 1 });
  assert.equal(moved.crops.at(-1).grid.column - moved.experimentSensors.at(-2).grid.column, 3);
  assert.equal(moved.crops[0].grid.column, s.crops[0].grid.column);
  const full = {
    ...s,
    experimentSensors: Array.from({ length: 500 }, (_, i) => ({
      ...s.experimentSensors[0],
      id: i ? `S-${i + 2}` : 'S-1',
    })),
  };
  assert.throws(() => duplicateFieldGroup(full, [targets[0]]), /limit/);
  assert.equal(full.experimentSensors.length, 500);
});
test('legacy migration, autosave exclusion and explicit JSON/ZIP exports handle both layouts', async () => {
  const legacy = example();
  delete legacy.controlField;
  assert.equal(migrateStudy(legacy).controlField.initialized, false);
  const s = initializeControl(example());
  const saved = withoutFieldLayout(s);
  assert.equal(saved.controlField.initialized, false);
  assert.equal(saved.controlField.crops.length, 0);
  const project = await projectDocument(s, null);
  const loaded = await readProject(
    new TextEncoder().encode(JSON.stringify(project)),
    'project.json',
  );
  assert.deepEqual(loaded.study.controlField, s.controlField);
  const archive = await buildProjectPackage(s, null);
  const zipped = await readProject(archive.archive, 'study.agrivoltaic.zip');
  assert.deepEqual(zipped.study.controlField, s.controlField);
});
test('report and CSV distinguish full-sun control fields and retain installation and crop records', () => {
  const s = initializeControl(example()),
    grid = receiverGrid(s);
  const r = {
    grid,
    cells: grid.points.map((c) => ({ ...c, dli: 12, wh: 5000, sunlight: 25, shade: 75 })),
    openWh: 20000,
    openDli: 48,
    meanDli: 12,
    meanSunlight: 25,
    estimated: true,
    backend: 'CPU',
    warnings: [],
    version: '0.4.1',
  };
  const html = reportHtml(s, r),
    data = exportCsv(s, r);
  assert.match(html, /Control physical field instruments/);
  assert.match(html, /Control crop bed identities and layout/);
  assert.match(html, /CONTROL FIELD/);
  const controlFigure = figureSvg(
    fieldStudy(s, true),
    controlResult(r),
    'plan',
    'dli',
    'array',
    true,
    { control: true },
  );
  assert.match(controlFigure, /Control field · Estimated DLI/);
  assert.doesNotMatch(controlFigure, /data-hardware=/);
  assert.match(controlFigure, /None \(control field\)/);
  assert.match(html, /48\.000 mol\/m²\/day/);
  assert.match(html, /Trial cultivar/);
  assert.match(html, /C-S-01/);
  assert.match(data, /"field"/);
  const lines = data.split('\r\n');
  const control = lines.find((line) => line.startsWith('"sensor","C-S-01"'));
  assert.match(control, /"100","48"/);
  assert.ok(control.endsWith('"control"'));
  assert.ok(
    lines.some((line) => line.startsWith('"sensor","S-1"') && line.endsWith('"agrivoltaic"')),
  );
  assert.match(reportHtml(s, null), /Full-sun DLI not calculated/);
});
