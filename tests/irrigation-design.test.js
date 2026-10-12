import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, studySchema, analysisKey } from '../src/domain/study.js';
import { receiverGridSpec, localToWorld, worldToLocal } from '../src/domain/geometry.js';
import { cellLocal, rowEdge, rowHeight } from '../src/domain/receiver-grid.js';
import { copyIrradianceGrid, designGridSpec, regridField } from '../src/experiment/design-grid.js';
import { normalizeLayout, cellAt } from '../src/experiment/grid-layout.js';
import { addCropBeds, cropRows } from '../src/experiment/crop-beds.js';
import { planIrrigation, addIrrigation, irrigationGeometry } from '../src/experiment/irrigation.js';
import {
  defaultIrrigation,
  irrigationMethods,
  irrigationUnitSchema,
  irrigationFlowFromDisplay,
  irrigationFlowToDisplay,
} from '../src/domain/irrigation.js';
import {
  moveFieldGroup,
  duplicateFieldGroup,
  deleteFieldItem,
  replaceFieldItem,
} from '../src/experiment/field-editing.js';
import { initializeControl, fieldStudy, storeField } from '../src/experiment/control-field.js';
import { plotStats } from '../src/experiment/layout.js';
import { projectDocument, readProject, buildProjectPackage } from '../src/project/package.js';
import { readZip } from '../src/project/zip.js';
import { irrigationRows, irrigationZoneRows, reportHtml } from '../src/report/export.js';
import { figureSvg } from '../src/report/figures.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
function fixture() {
  let s = defaultStudy();
  s.weather.mode = 'sample';
  s.designGrid = copyIrradianceGrid(s);
  s = addCropBeds(s, { count: 1, rowIds: [cropRows(s)[1].id], cropId: 'lettuce' }).study;
  s.crops[0].planting = {
    ...s.crops[0].planting,
    rowCount: 3,
    rowSpacing: 0.4,
    rowSpacingMode: 'custom',
  };
  return studySchema.parse(normalizeLayout(s));
}
const withDrip = (s) =>
  addIrrigation(s, { method: 'drip', placement: 'beds', bedIds: [s.crops[0].id], followRows: true })
    .study;

test('independent grid starts identical, stays square at custom pitch/count, and does not change numerical inputs', () => {
  let s = fixture(),
    key = analysisKey(s),
    numeric = receiverGridSpec(s),
    copied = designGridSpec(s);
  assert.deepEqual(copied, numeric);
  s.analysis.cellsPerRow = 8;
  assert.deepEqual(designGridSpec(s), copied);
  s.analysis.cellsPerRow = 15;
  const bed = s.crops[0];
  s = normalizeLayout(regridField(s, { version: 1, mode: 'square', cellsPerRow: 24 }));
  const g = designGridSpec(s);
  near(g.dx, s.rowPair.pitch / 24);
  near(g.dy, g.dx);
  for (let r = 0; r < g.ny; r++) near(rowHeight(g, r), g.dx);
  assert.equal(analysisKey(s), key);
  assert.deepEqual(receiverGridSpec(s), numeric);
  near(s.crops[0].width, bed.width);
  near(s.crops[0].length, bed.length);
  near(s.crops[0].x, bed.x);
  near(s.crops[0].y, bed.y);
  assert.equal(s.crops[0].gridSpace, 'design');
  const huge = structuredClone(s);
  huge.row.tables = 100;
  huge.array.rows = 100;
  assert.throws(
    () => regridField(huge, { version: 1, mode: 'square', cellsPerRow: 200 }),
    /exceeds/,
  );
});
test('bed light statistics use physical overlap with numerical cells after independent regridding', () => {
  let s = fixture(),
    g = receiverGridSpec(s),
    cells = [];
  for (let r = 0; r < g.ny; r++)
    for (let c = 0; c < g.nx; c++) {
      const p = cellLocal(g, c, r);
      cells.push({ ...localToWorld(s, p.x, p.y), dli: c + 2 * r, sunlight: 60, shade: 40 });
    }
  const result = { grid: g, cells },
    before = plotStats(result, s.crops[0]);
  s = normalizeLayout(regridField(s, { version: 1, mode: 'square', cellsPerRow: 29 }));
  const after = plotStats(result, s.crops[0]);
  near(after.mean, before.mean);
  near(after.sd, before.sd);
  near(after.sunlight, 60);
});
test('all irrigation methods validate, retain unknown ratings, draw finite geometry and reject invalid references', () => {
  let s = fixture();
  for (const [method] of irrigationMethods) {
    const unit = defaultIrrigation(method);
    assert.equal(unit.ratedFlow, null);
    assert.equal(unit.pressure, null);
    assert.equal(
      irrigationUnitSchema.safeParse({ ...unit, length: NaN }).success,
      unit.kind === 'point',
    );
    const added = addIrrigation(s, { method, placement: 'single' }).study;
    assert.ok(studySchema.safeParse(added).success);
    const geom = irrigationGeometry(added, added.irrigationUnits.at(-1));
    assert.ok(
      [...geom.lines.flat(), ...geom.coverage.flat(), ...geom.markers].every((p) =>
        [p.x, p.y, p.z].every(Number.isFinite),
      ),
    );
  }
  near(irrigationFlowFromDisplay('2'), 2 / 3600000);
  near(irrigationFlowToDisplay(2 / 3600000), 2);
  assert.equal(irrigationFlowFromDisplay(''), null);
  s = withDrip(s);
  const bad = structuredClone(s);
  bad.irrigationUnits[0].zoneId = 'missing';
  assert.equal(studySchema.safeParse(bad).success, false);
  bad.irrigationUnits[0].zoneId = s.irrigationZones[0].id;
  bad.irrigationZones[0].kind = 'rainfed';
  assert.equal(studySchema.safeParse(bad).success, false);
});
test('linked drip follows beds; row changes only regenerate on explicit replacement and emitter spacing stays independent', () => {
  let s = withDrip(fixture()),
    key = analysisKey(s),
    bed = s.crops[0],
    unit = s.irrigationUnits[0];
  assert.equal(s.irrigationUnits.length, 3);
  near(unit.emitterSpacing, 0.3);
  const moved = moveFieldGroup(s, [{ kind: 'crop', id: bed.id }], { column: 0, row: 2 });
  const b = moved.crops[0],
    u = moved.irrigationUnits[0];
  near(u.x - unit.x, b.x - bed.x);
  near(u.y - unit.y, b.y - bed.y);
  near(u.length, b.width);
  assert.equal(analysisKey(moved), key);
  s = replaceFieldItem(
    moved,
    { kind: 'crop', id: b.id },
    {
      ...b,
      id: 'Renamed',
      planting: { ...b.planting, rowCount: 4, plantSpacing: 0.5, plantSpacingMode: 'custom' },
    },
  );
  assert.equal(s.irrigationUnits.length, 3);
  assert.equal(s.irrigationUnits[0].link.bedId, 'Renamed');
  assert.deepEqual(s.irrigationZones[0].bedIds, ['Renamed']);
  const plan = planIrrigation(s, {
    method: 'drip',
    placement: 'beds',
    bedIds: ['Renamed'],
    replaceLinked: true,
  });
  assert.equal(plan.units.length, 4);
  assert.equal(plan.replaced.length, 3);
  assert.equal(s.irrigationUnits.length, 3);
  s = addIrrigation(s, {
    method: 'drip',
    placement: 'beds',
    bedIds: ['Renamed'],
    replaceLinked: true,
    zoneId: s.irrigationZones[0].id,
  }).study;
  assert.equal(s.irrigationUnits.length, 4);
  near(s.irrigationUnits[0].emitterSpacing, 0.3);
  const detached = deleteFieldItem(s, { kind: 'crop', id: 'Renamed' });
  assert.equal(detached.irrigationUnits.length, 4);
  assert.ok(detached.irrigationUnits.every((u) => u.link === null));
  assert.ok(studySchema.safeParse(detached).success);
  assert.equal(
    deleteFieldItem(s, { kind: 'crop', id: 'Renamed' }, 'delete').irrigationUnits.length,
    0,
  );
});
test('duplicate beds and control fields remap irrigation links and retain independent grid settings', () => {
  const s = withDrip(fixture()),
    copy = duplicateFieldGroup(s, [{ kind: 'crop', id: s.crops[0].id }], {
      column: 0,
      row: 3,
    }).study;
  assert.equal(copy.irrigationUnits.length, 6);
  assert.equal(copy.irrigationUnits[3].link.bedId, copy.crops[1].id);
  assert.ok(studySchema.safeParse(copy).success);
  let control = initializeControl(s),
    field = fieldStudy(control, true);
  assert.notEqual(field.irrigationZones[0].id, s.irrigationZones[0].id);
  assert.equal(field.irrigationUnits[0].zoneId, field.irrigationZones[0].id);
  assert.equal(field.irrigationUnits[0].link.bedId, field.crops[0].id);
  field = normalizeLayout(regridField(field, { version: 1, mode: 'square', cellsPerRow: 8 }));
  control = storeField(control, field, true);
  assert.equal(control.designGrid.cellsPerRow, 15);
  assert.equal(control.controlField.designGrid.cellsPerRow, 8);
  assert.equal(analysisKey(control), analysisKey(s));
});
test('point patterns and rainfed zones enforce atomic budgets and preserve exact offsets across grid edits', () => {
  let s = fixture();
  const before = JSON.stringify(s);
  assert.throws(
    () => addIrrigation(s, { method: 'sprinkler', placement: 'grid', columns: 100, rows: 100 }),
    /500/,
  );
  assert.equal(JSON.stringify(s), before);
  assert.throws(
    () => planIrrigation(s, { method: 'drip', placement: 'single', x: 10000 }),
    /outside/,
  );
  s = addIrrigation(s, {
    method: 'sprinkler',
    placement: 'grid',
    columns: 2,
    rows: 2,
    spacingX: 2.3,
    spacingY: 1.7,
    staggered: true,
  }).study;
  const centres = s.irrigationUnits.map((u) => [u.x, u.y]);
  s = normalizeLayout(regridField(s, { version: 1, mode: 'square', cellsPerRow: 20 }));
  s.irrigationUnits.forEach((u, i) => {
    near(u.x, centres[i][0]);
    near(u.y, centres[i][1]);
    assert.deepEqual(u.grid, cellAt(s, u));
  });
  s = addIrrigation(s, { method: 'rainfed', bedIds: [s.crops[0].id] }).study;
  assert.equal(s.irrigationUnits.length, 4);
  assert.equal(s.irrigationZones.at(-1).kind, 'rainfed');
  assert.equal(s.irrigationZones.at(-1).treatment, 'Rainfed');
});
test('irrigation and design grids survive JSON and ZIP; figures and reports describe nominal coverage without changing light keys', async () => {
  let s = withDrip(fixture());
  s = addIrrigation(s, {
    method: 'sprinkler',
    placement: 'single',
    unit: {
      ...defaultIrrigation('sprinkler'),
      ratedFlow: 2 / 3600000,
      notes: '<script>bad</script>',
    },
  }).study;
  s = studySchema.parse(normalizeLayout(s));
  const doc = await projectDocument(s);
  const reopened = await readProject(new TextEncoder().encode(JSON.stringify(doc)));
  assert.deepEqual(reopened.study.irrigationUnits, s.irrigationUnits);
  assert.deepEqual(reopened.study.designGrid, s.designGrid);
  const exported = await buildProjectPackage(s),
    files = await readZip(exported.archive);
  assert.ok(files.has('tables/irrigation-units.csv'));
  assert.ok(files.has('tables/irrigation-zones.csv'));
  const restored = await readProject(exported.archive);
  assert.deepEqual(restored.study.irrigationUnits, s.irrigationUnits);
  const svg = figureSvg(s, null, 'plan', 'none', 'report');
  assert.match(svg, /data-irrigation-unit=/);
  assert.match(svg, /data-design-grid=/);
  assert.doesNotMatch(svg, /NaN|undefined/);
  const html = reportHtml(s);
  assert.match(html, /nominal coverage/);
  assert.doesNotMatch(html, /<script>bad/);
  assert.equal(irrigationRows(s).length, 5);
  assert.equal(irrigationZoneRows(s).length, 3);
});
