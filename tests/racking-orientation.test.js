import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import {
  defaultStudy,
  selectRacking,
  updateStudyInput,
  migrateStudy,
  analysisKey,
} from '../src/domain/study.js';
import {
  axes,
  buildGeometry,
  disposeGroup,
  getPose,
  receiverGrid,
} from '../src/domain/geometry.js';
import { rackingOrientation } from '../src/domain/racking-orientation.js';
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

test('rack switches adopt the appropriate orientation and retain explicit custom bearings', () => {
  for (const from of types)
    for (const to of types) {
      const initial = selectRacking(defaultStudy(), from);
      const s = updateStudyInput(initial, 'racking', 'type', to);
      assert.equal(
        s.array.azimuth,
        ['single-axis', 'dual-axis', 'vertical'].includes(to) ? 90 : 180,
      );
      assert.equal(
        rackingOrientation(s).rowAzimuth,
        ['single-axis', 'dual-axis', 'vertical'].includes(to) ? 0 : 90,
      );
      initial.array.azimuth = 37;
      assert.equal(updateStudyInput(initial, 'racking', 'type', to).array.azimuth, 37);
    }
  let s = selectRacking(defaultStudy(), 'single-axis');
  const previousKey = analysisKey(s);
  s = updateStudyInput(s, 'array', 'azimuth', 180);
  assert.notEqual(analysisKey(s), previousKey);
  for (const [section, key, value] of [
    ['table', 'wide', 3],
    ['module', 'width', 1.2],
    ['racking', 'limit', 50],
    ['racking', 'type', 'single-axis'],
  ]) {
    s = updateStudyInput(s, section, key, value);
    assert.equal(
      s.array.azimuth,
      180,
      'Geometry edits and clearance refreshes preserve orientation',
    );
  }
  assert.equal(
    migrateStudy(JSON.parse(JSON.stringify(s))).array.azimuth,
    180,
    'Existing project bearings are retained',
  );
});

test('fixed defaults face the equator on hemisphere changes and rack switches, preserving custom bearings', () => {
  let s = defaultStudy();
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

test('fixed, vertical, pergola and dual-axis geometry obey compass directions at arbitrary layout bearings', () => {
  const fixed = selectRacking(defaultStudy(), 'fixed');
  assert.ok(moduleNormal(fixed).y < 0, 'Default fixed front faces south');
  near(moduleNormal(fixed).x, 0);
  const vertical = selectRacking(defaultStudy(), 'vertical');
  near(moduleNormal(vertical).x, 1);
  near(moduleNormal(vertical).z, 0);
  for (const azimuth of [0, 37, 90, 180, 270]) {
    for (const type of types) {
      const s = selectRacking(defaultStudy(), type);
      s.array.azimuth = azimuth;
      s.racking.backtracking = false;
      s.racking.limit = 85;
      for (const sun of [
        new Vector3(0.6, -0.3, 0.7).normalize(),
        new Vector3(-0.5, 0.4, 0.7).normalize(),
      ]) {
        const normal = moduleNormal(s, sun);
        const angle = (azimuth * Math.PI) / 180;
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
