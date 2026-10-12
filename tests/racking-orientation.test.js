import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import {
  defaultStudy,
  selectRacking,
  updateStudyInput,
  migrateStudy,
  analysisKey,
  designIssues,
} from '../src/domain/study.js';
import {
  axes,
  buildGeometry,
  disposeGroup,
  getPose,
  receiverGrid,
  worldToLocal,
} from '../src/domain/geometry.js';
import {
  rackingOrientation,
  northSouthRowsRequired,
  defaultRackingAzimuth,
} from '../src/domain/racking-orientation.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { restoreBrowserStudy } from '../src/project/browser-study.js';
import { readProject } from '../src/project/package.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { solarPosition } from '../src/irradiance/solar.js';
import { methodsRows, publicationTables } from '../src/report/export.js';
import { provenanceRecord } from '../src/report/provenance.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';

const types = ['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola'];
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
function moduleNormal(s, sun) {
  const group = buildGeometry(s, 'array', getPose(s, sun), { textures: false });
  try {
    const module = group.children.find((m) => m.userData.kind === 'module');
    return new Vector3(0, 0, 1).transformDirection(module.matrixWorld);
  } finally {
    disposeGroup(group);
  }
}

test('every rack switch resets orientation and operating defaults, including custom bearings', () => {
  for (const from of types)
    for (const to of types) {
      if (from === to) continue;
      const initial = selectRacking(defaultStudy(), from);
      initial.array.azimuth = 37;
      initial.racking.tilt = 80;
      initial.racking.limit = 0;
      initial.racking.backtracking = false;
      initial.racking.pergolaTilt = 70;
      initial.racking.pergolaLayout = 'checkerboard';
      const s = updateStudyInput(initial, 'racking', 'type', to);
      assert.equal(
        s.array.azimuth,
        ['single-axis', 'dual-axis', 'vertical'].includes(to) ? 90 : 180,
      );
      assert.equal(
        rackingOrientation(s).rowAzimuth,
        ['single-axis', 'dual-axis', 'vertical'].includes(to) ? 0 : 90,
      );
      assert.equal(s.racking.tilt, ['vertical', 'pergola'].includes(to) ? 0 : 25);
      assert.equal(s.racking.limit, to === 'dual-axis' ? 85 : 60);
      assert.equal(s.racking.backtracking, true);
      assert.equal(s.racking.pergolaTilt, 0);
      assert.equal(s.racking.pergolaLayout, 'aligned');
      assert.deepEqual(designIssues(s), []);
      if (to === 'vertical') assert.equal(s.module.bifacial, true);
    }
});

test('locked rack orientations resist direct edits; clearance refreshes preserve configured settings', () => {
  for (const type of ['single-axis', 'vertical']) {
    const s = selectRacking(defaultStudy(), type);
    assert.equal(updateStudyInput(s, 'array', 'azimuth', 180).array.azimuth, 90);
    assert.equal(analysisKey(updateStudyInput(s, 'array', 'azimuth', 37)), analysisKey(s));
  }
  let s = selectRacking(defaultStudy(), 'dual-axis');
  s.array.azimuth = 37;
  s.racking.tilt = 15;
  s.racking.limit = 50;
  s.racking.height = 10;
  s.rowPair.pitch = 20;
  s.row.tableGap = 15;
  for (const [section, key, value] of [
    ['table', 'wide', 3],
    ['module', 'width', 1.2],
    ['racking', 'limit', 50],
    ['racking', 'type', 'dual-axis'],
  ]) {
    s = updateStudyInput(s, section, key, value);
    assert.equal(
      s.array.azimuth,
      37,
      'Geometry edits and clearance refreshes preserve orientation',
    );
    assert.equal(s.racking.tilt, 15);
    assert.equal(s.racking.limit, 50);
    assert.equal(s.racking.height, 10);
    assert.equal(s.rowPair.pitch, 20);
    assert.equal(s.row.tableGap, 15);
  }
  assert.equal(
    migrateStudy(JSON.parse(JSON.stringify(s))).array.azimuth,
    37,
    'Unlocked project bearings are retained',
  );
});

test('legacy locked racks rotate layouts on import and restore, and reject stale light', async () => {
  for (const type of ['single-axis', 'vertical']) {
    let old = selectRacking(defaultStudy(), type);
    old.array.azimuth = 180;
    old.weather.mode = 'sample';
    old.experimentSensors = [
      {
        id: 'S-1',
        type: 'PAR',
        x: 2,
        y: 3,
        z: -0.2,
        treatment: 'AV',
        replicate: '1',
        model: '',
        logger: '',
        notes: '',
      },
    ];
    old.crops = [
      {
        id: 'P-1',
        crop: 'Lettuce',
        x: 2,
        y: 3,
        width: 1,
        length: 1,
        treatment: 'AV',
        replicate: '1',
      },
    ];
    old = normalizeLayout(old);
    old.controlField = {
      version: 1,
      initialized: true,
      experimentSensors: old.experimentSensors.map((s) => ({ ...s, id: 'C-S-1' })),
      crops: old.crops.map((p) => ({ ...p, id: 'C-P-1' })),
    };
    // Include coordinate-only legacy records, as well as current cell indices.
    for (const withGrid of [true, false]) {
      const raw = structuredClone(old);
      if (!withGrid)
        for (const field of [raw, raw.controlField]) {
          field.experimentSensors.forEach((s) => delete s.grid);
          field.crops.forEach((p) => delete p.grid);
        }
      const restored = normalizeLayout(migrateStudy(raw));
      assert.equal(restored.array.azimuth, 90);
      assert.notEqual(analysisKey(restored), analysisKey(old));
      assert.equal(restoreBrowserStudy(raw).array.azimuth, 90);
      for (const [before, after] of [
        [old, restored],
        [old.controlField, restored.controlField],
      ]) {
        for (const key of ['experimentSensors', 'crops']) {
          assert.deepEqual(after[key][0].grid, before[key][0].grid);
          const a = worldToLocal(old, before[key][0].x, before[key][0].y);
          const b = worldToLocal(restored, after[key][0].x, after[key][0].y);
          near(a.x, b.x);
          near(a.y, b.y);
        }
        assert.equal(after.experimentSensors[0].z, -0.2);
      }
      const project = await readProject(
        new TextEncoder().encode(JSON.stringify({ study: raw, result: { key: analysisKey(raw) } })),
      );
      assert.equal(project.result, null);
      assert.ok(project.warnings.some((w) => /corrected to north–south/.test(w)));
      assert.ok(project.warnings.some((w) => /Light results will not be restored/.test(w)));
      assert.equal(project.study.array.azimuth, 90);
    }
    await assert.rejects(calculateDay(old), /require north–south rows/);
  }
});

test('fixed defaults face the equator on hemisphere changes and rack switches, preserving custom bearings', () => {
  let s = selectRacking(defaultStudy(), 'fixed');
  for (const latitude of [-33, 45, -12, 0]) {
    s = updateStudyInput(s, 'site', 'latitude', latitude);
    const expected = latitude < 0 ? 0 : 180;
    assert.equal(s.array.azimuth, expected);
    assert.ok(moduleNormal(s).y * (latitude < 0 ? 1 : -1) > 0);
    for (const type of types) {
      const switched = updateStudyInput(selectRacking(s, type), 'racking', 'type', 'fixed');
      assert.equal(switched.array.azimuth, expected);
    }
  }
  s.array.azimuth = 37;
  assert.equal(updateStudyInput(s, 'site', 'latitude', -33).array.azimuth, 37);
  for (const type of ['single-axis', 'dual-axis', 'vertical']) {
    const south = updateStudyInput(selectRacking(defaultStudy(), type), 'site', 'latitude', -33);
    assert.equal(south.array.azimuth, 90);
  }
  for (const type of ['fixed', 'pergola']) {
    const south = updateStudyInput(defaultStudy(), 'site', 'latitude', -33);
    const s = selectRacking(south, type);
    assert.equal(s.array.azimuth, defaultRackingAzimuth(type, -33));
    assert.equal(s.array.azimuth, 0);
  }
});

test('default single-axis rows run north–south and module normals follow the sun east to west', () => {
  const s = selectRacking(defaultStudy(), 'single-axis');
  s.racking.backtracking = false;
  const group = buildGeometry(s, 'array', getPose(s), { textures: false });
  try {
    const modules = group.children.filter((m) => m.userData.kind === 'module');
    const along = modules[1].position.clone().sub(modules[0].position);
    near(along.x, 0);
    assert.ok(Math.abs(along.y) > 0);
    const adjacent = modules[s.table.high * s.table.wide * s.row.tables].position
      .clone()
      .sub(modules[0].position);
    near(adjacent.y, 0);
    assert.ok(Math.abs(adjacent.x) > 0);
    const points = receiverGrid(s).points;
    near(points[1].x, points[0].x);
    assert.ok(Math.abs(points[1].y - points[0].y) > 0);
  } finally {
    disposeGroup(group);
  }
  for (const [minute, sign] of [
    [9 * 60, 1],
    [16 * 60, -1],
  ]) {
    const sun = solarPosition(s.analysis.date, minute, s.site);
    assert.ok(sun.x * sign > 0 && sun.z > 0);
    const normal = moduleNormal(s, sun);
    assert.ok(
      normal.x * sign > 0,
      'Front face tilts east in the morning and west in the afternoon',
    );
    near(normal.y, 0);
    const expected = new Vector3(sun.x, 0, sun.z).normalize();
    assert.ok(normal.dot(expected) > 0.999999);
    s.racking.backtracking = true;
    const backtracked = moduleNormal(s, sun);
    assert.ok(backtracked.x * sign > 0);
    near(backtracked.y, 0);
    s.racking.backtracking = false;
  }
});

test('geometry obeys locked and editable compass directions; dual-axis normals follow the sun', () => {
  const fixed = selectRacking(defaultStudy(), 'fixed');
  assert.ok(moduleNormal(fixed).y < 0, 'Default fixed front faces south');
  near(moduleNormal(fixed).x, 0);
  const vertical = selectRacking(defaultStudy(), 'vertical');
  near(moduleNormal(vertical).x, 1);
  near(moduleNormal(vertical).z, 0);
  for (const azimuth of [0, 37, 90, 180, 270]) {
    for (const type of types) {
      const s = selectRacking(defaultStudy(), type);
      const configured = updateStudyInput(s, 'array', 'azimuth', azimuth);
      s.array = configured.array;
      s.racking.backtracking = false;
      s.racking.limit = 85;
      for (const sun of [
        new Vector3(0.6, -0.3, 0.7).normalize(),
        new Vector3(-0.5, 0.4, 0.7).normalize(),
      ]) {
        const normal = moduleNormal(s, sun);
        const angle = (s.array.azimuth * Math.PI) / 180;
        if (northSouthRowsRequired(type)) assert.equal(s.array.azimuth, 90);
        const expected =
          type === 'dual-axis'
            ? sun
            : type === 'single-axis'
              ? sun
                  .clone()
                  .addScaledVector(axes(s).u, -sun.dot(axes(s).u))
                  .normalize()
              : new Vector3(
                  Math.sin(angle) * Math.sin((getPose(s).tilt * Math.PI) / 180),
                  Math.cos(angle) * Math.sin((getPose(s).tilt * Math.PI) / 180),
                  Math.cos((getPose(s).tilt * Math.PI) / 180),
                );
        near(normal.dot(expected), 1);
      }
    }
  }
});

test('orientation descriptions agree across controls, annotations and publication records for every rack', () => {
  for (const type of types) {
    const s = selectRacking(defaultStudy(), type);
    const orientation = rackingOrientation(s);
    const rows = methodsRows(s, null);
    assert.equal(rows.find(([label]) => label === 'Rack orientation')[1], orientation.description);
    assert.equal(
      rows.find(([label]) => label === orientation.label)[1],
      `${s.array.azimuth}° clockwise from north`,
    );
    const tables = publicationTables(s, null);
    assert.deepEqual(
      new Map([...tables.sections.flatMap((section) => section.rows), ...tables.notes]),
      new Map(rows),
    );
    assert.equal(provenanceRecord(s, null).orientation, orientation.description);
    const group = buildGeometry(s, 'array', getPose(s), { textures: false });
    try {
      const [annotation] = engineeringAnnotations(s, 'array', group, { id: 'array.azimuth' });
      assert.equal(annotation.label, orientation.label);
      assert.equal(annotation.detail, orientation.description);
      const direction = annotation.points.at(-1).clone().normalize();
      const angle = (s.array.azimuth * Math.PI) / 180;
      near(direction.x, Math.sin(angle));
      near(direction.y, Math.cos(angle));
    } finally {
      disposeGroup(group);
    }
  }
});
