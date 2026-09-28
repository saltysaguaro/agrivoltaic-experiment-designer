import test from 'node:test';
import assert from 'node:assert/strict';
import { cropCatalog, cropIdentity } from '../src/domain/crop-catalog.js';
import spacing from '../src/data/crop-spacing.json' with { type: 'json' };
import {
  defaultPlanting,
  cropSpacingPreset,
  changePlotCrop,
  plantingSummary,
} from '../src/domain/crop-planting.js';
import { cropPlantingGeometry } from '../src/experiment/crop-planting.js';
import { defaultStudy, studySchema, analysisKey } from '../src/domain/study.js';
import { addCropBeds } from '../src/experiment/crop-beds.js';
import { worldToLocal } from '../src/domain/geometry.js';
import { initializeControl } from '../src/experiment/control-field.js';
import { duplicateFieldGroup, layoutSnapshot } from '../src/experiment/field-editing.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { projectDocument, readProject } from '../src/project/package.js';
import { exportCsv, reportHtml } from '../src/report/export.js';
import { figureSvg } from '../src/report/figures.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('all catalog crops have explicit, sourced spacing profiles with honest evidence labels', () => {
  assert.deepEqual(Object.keys(spacing.crops).sort(), cropCatalog.map((c) => c.id).sort());
  for (const crop of cropCatalog) {
    const p = cropSpacingPreset(crop.id);
    assert.ok(
      p.rowSpacing > 0 && p.plantSpacing > 0 && p.rowSpacing <= 100 && p.plantSpacing <= 100,
    );
    assert.ok(['published', 'adapted'].includes(p.basis));
    assert.match(p.sourceUrl, /^https:\/\//);
    assert.ok(p.note.length && p.version.length);
    assert.equal(defaultPlanting(crop.id).rowCount, 1);
  }
  close(cropSpacingPreset('lettuce').plantSpacing, 0.3048);
  close(cropSpacingPreset('tomato').rowSpacing, 1.524);
  assert.equal(cropSpacingPreset('wheat').basis, 'adapted');
  assert.equal(cropSpacingPreset('not-resolved').basis, 'placeholder');
});

test('crop changes update defaults while retaining independent overrides and row count', () => {
  const original = {
    ...cropIdentity('lettuce'),
    planting: {
      ...defaultPlanting('lettuce'),
      rowCount: 3,
      rowSpacing: 0.2,
      rowSpacingMode: 'custom',
    },
  };
  const changed = changePlotCrop(original, 'tomato');
  assert.equal(changed.planting.rowCount, 3);
  assert.equal(changed.planting.rowSpacing, 0.2);
  close(changed.planting.plantSpacing, 0.762);
  assert.equal(changed.planting.preset.profile, 'tomato');
  assert.equal(original.cropId, 'lettuce');
});

test('crop rows and plants stay centred, spaced and rotated with bed geometry', () => {
  const s = defaultStudy();
  s.racking.type = 'fixed';
  s.array.azimuth = 37;
  const planting = {
    ...defaultPlanting('lettuce'),
    rowCount: 3,
    rowSpacing: 0.4,
    plantSpacing: 0.3,
    rowSpacingMode: 'custom',
    plantSpacingMode: 'custom',
  };
  const { study } = addCropBeds(s, { count: 2, rowIds: [1], cropId: 'lettuce', planting });
  const bed = study.crops[0],
    geometry = cropPlantingGeometry(study, bed, 20000);
  const centre = worldToLocal(study, bed.x, bed.y);
  assert.equal(geometry.rows.length, 3);
  geometry.rows.forEach(([a, b], i) => {
    const p = worldToLocal(study, a.x, a.y),
      q = worldToLocal(study, b.x, b.y);
    close(p.x, centre.x - bed.width / 2);
    close(q.x, centre.x + bed.width / 2);
    close(p.y, centre.y + (i - 1) * 0.4);
    close(q.y, p.y);
  });
  assert.equal(geometry.plants.length, 3 * Math.floor(bed.width / 0.3));
  const positions = geometry.plants.map((p) => worldToLocal(study, p.x, p.y));
  close(positions[1].x - positions[0].x, 0.3);
  close((positions[0].x + positions[geometry.plantsPerRow - 1].x) / 2, centre.x);
  assert.equal(analysisKey(study), analysisKey(s));
  const dense = cropPlantingGeometry(study, {
    ...bed,
    planting: { ...planting, plantSpacing: 0.001 },
  });
  assert.ok(dense.plants.length <= 200 && dense.sampled);
  assert.equal(dense.rows.length, 3);
  const single = cropPlantingGeometry(study, {
    ...bed,
    width: 0.1,
    planting: { ...planting, rowCount: 1, plantSpacing: 2 },
  });
  assert.equal(single.positions, 1);
  close(single.plants[0].x, bed.x);
  close(single.plants[0].y, bed.y);
});

test('invalid inputs reject atomically; shrinking a bed preserves requested spacing and reports fit', () => {
  const s = defaultStudy(),
    options = { count: 3, rowIds: [1], cropId: 'lettuce' };
  for (const change of [
    { rowCount: 0 },
    { rowCount: 1.5 },
    { rowCount: 101 },
    { rowSpacing: NaN },
    { plantSpacing: 0 },
    { rowSpacing: Infinity },
    { rowCount: 10, rowSpacing: 1 },
  ]) {
    assert.throws(() =>
      addCropBeds(s, { ...options, planting: { ...defaultPlanting('lettuce'), ...change } }),
    );
  }
  assert.equal(s.crops.length, 0);
  const { study } = addCropBeds(s, {
    ...options,
    planting: { ...defaultPlanting('lettuce'), rowCount: 2, rowSpacing: 0.5 },
  });
  const bed = study.crops[0];
  const invalid = { ...bed, length: 0.4 };
  assert.match(plantingSummary(invalid).issue, /need more than/);
  assert.equal(cropPlantingGeometry(study, invalid).rows.length, 0);
  assert.equal(invalid.planting.rowCount, 2);
  const bad = structuredClone(study);
  bad.crops[0].planting.rowCount = NaN;
  assert.equal(studySchema.safeParse(bad).success, false);
});

test('legacy beds gain defaults; custom planting and source snapshots survive field operations and project/export round trips', async () => {
  const { study, selections } = addCropBeds(defaultStudy(), {
    count: 1,
    rowIds: [1],
    cropId: 'lettuce',
  });
  const legacy = structuredClone(study);
  delete legacy.crops[0].planting;
  const migrated = studySchema.parse(legacy);
  assert.equal(migrated.crops[0].planting.rowCount, 1);
  study.crops[0].planting = {
    ...defaultPlanting('lettuce'),
    rowCount: 4,
    rowSpacing: 0.3,
    plantSpacing: 0.2,
    rowSpacingMode: 'custom',
    plantSpacingMode: 'custom',
  };
  study.crops[0].planting.preset.version = 'retained-source-version';
  const control = initializeControl(studySchema.parse(study));
  assert.deepEqual(control.controlField.crops[0].planting, study.crops[0].planting);
  const copied = duplicateFieldGroup(study, selections, { column: 0, row: 0 }).study;
  assert.deepEqual(copied.crops[1].planting, study.crops[0].planting);
  const snapshot = layoutSnapshot(study);
  copied.crops[1].planting.rowCount = 1;
  assert.equal(snapshot.crops[0].planting.rowCount, 4);
  const read = await readProject(
    new TextEncoder().encode(JSON.stringify(await projectDocument(control))),
    'planting.json',
  );
  assert.deepEqual(read.study.crops[0].planting, study.crops[0].planting);
  assert.deepEqual(normalizeLayout(read.study).crops, read.study.crops);
  const csv = exportCsv(control, null);
  assert.match(csv, /crop_rows_per_bed/);
  assert.match(csv, /retained-source-version/);
  const html = reportHtml(control, null);
  assert.match(html, /4 crop row\(s\)/);
  assert.match(html, /plants 0.2 m apart \(custom\)/);
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = figureSvg(control, null, view, 'none', 'array');
    assert.match(svg, /data-crop-rows=/);
    assert.doesNotMatch(svg, /NaN|Infinity/);
  }
});
