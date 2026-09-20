import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import {
  defaultStudy,
  selectRacking,
  updateStudyInput,
  migrateStudy,
  analysisKey,
  dimensions,
  designIssues,
} from '../src/domain/study.js';
import { getPose, buildGeometry, disposeGroup, worldToLocal } from '../src/domain/geometry.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { buildProjectPackage, readProject } from '../src/project/package.js';
import { methodsRows } from '../src/report/export.js';
import { provenanceRecord } from '../src/report/provenance.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
function fixture() {
  const s = selectRacking(defaultStudy(), 'pergola');
  s.table.high = 1;
  s.table.wide = 2;
  s.row.tables = 1;
  s.array.rows = 2;
  s.array.buffer = 0.5;
  s.analysis.cellsPerRow = 5;
  s.analysis.patches = 145;
  s.analysis.backend = 'cpu';
  s.weather.mode = 'sample';
  return migrateStudy(s);
}
test('pergola tilt preserves checkerboard offsets and governs geometry, clearances and exports', () => {
  for (const layout of ['aligned', 'checkerboard']) {
    const base = fixture();
    base.racking.pergolaLayout = layout;
    base.module.gap = 1;
    base.array.azimuth = 37;
    base.racking.height = 0.5;
    const s = updateStudyInput(base, 'racking', 'pergolaTilt', 23.7);
    assert.deepEqual(designIssues(s), []);
    assert.ok(s.racking.height > base.racking.height);
    assert.notEqual(analysisKey(s), analysisKey(base));
    near(getPose(s, new Vector3(0, 0, 1), true).tilt, 23.7);
    const angle = (23.7 * Math.PI) / 180,
      d = dimensions(s),
      g = buildGeometry(s);
    try {
      near(d.projected, d.width * Math.cos(angle) + s.module.thickness * Math.sin(angle));
      const modules = g.children.filter((m) => m.userData.kind === 'module');
      for (const m of modules) {
        const n = new Vector3(0, 0, 1).transformDirection(m.matrixWorld);
        near(n.z, Math.cos(angle));
        near(n.x, Math.sin((37 * Math.PI) / 180) * Math.sin(angle));
        near(n.y, Math.cos((37 * Math.PI) / 180) * Math.sin(angle));
      }
      near(
        worldToLocal(s, modules[2].position.x, modules[2].position.y).x -
          worldToLocal(s, modules[0].position.x, modules[0].position.y).x,
        layout === 'checkerboard' ? (d.along + s.module.gap) / 2 : 0,
      );
      const annotation = engineeringAnnotations(s, 'racking', g).find(
        (a) => a.id === 'racking.pergolaTilt',
      );
      assert.equal(annotation.value, '23.7°');
      assert.equal(annotation.kind, 'angle');
    } finally {
      disposeGroup(g);
    }
    assert.equal(methodsRows(s, null).find(([k]) => k === 'Effective fixed tilt')[1], '23.7°');
    assert.match(provenanceRecord(s, null).orientation, /23.7°.*37°/);
    const steep = updateStudyInput(s, 'racking', 'pergolaTilt', 85);
    assert.deepEqual(designIssues(steep), []);
    assert.throws(() => migrateStudy({ ...s, racking: { ...s.racking, pergolaTilt: 86 } }));
  }
});
test('legacy horizontal pergola geometry, keys and saved results survive import', async () => {
  const legacy = fixture();
  delete legacy.racking.pergolaTilt;
  legacy.racking.tilt = 45; // Previously ignored for pergolas.
  const restored = migrateStudy(legacy);
  assert.equal(restored.racking.pergolaTilt, 0);
  assert.equal(analysisKey(legacy), analysisKey(restored));
  assert.deepEqual(dimensions(legacy), dimensions(restored));
  assert.equal(getPose(restored).tilt, 0);
  const result = await calculateDay(legacy);
  const packed = await buildProjectPackage(legacy, result);
  const opened = await readProject(packed.archive, 'horizontal-pergola.zip');
  assert.ok(opened.result);
  assert.equal(opened.study.racking.pergolaTilt, 0);
});
test('tilted pergola irradiance matches equivalent fixed geometry and invalidates cached flat visibility', async () => {
  const base = fixture(),
    memory = new Map();
  const cache = { get: async (k) => memory.get(k), put: async (k, v) => memory.set(k, v) };
  const flat = await calculateDay(base, () => {}, { cache });
  const tilted = updateStudyInput(base, 'racking', 'pergolaTilt', 30);
  const actual = await calculateDay(tilted, () => {}, { cache });
  assert.equal(actual.cached, 0);
  const fixed = { ...tilted, racking: { ...tilted.racking, type: 'fixed', tilt: 30 } };
  const reference = await calculateDay(fixed, () => {}, { cache });
  actual.cells.forEach((c, i) => {
    near(c.wh, reference.cells[i].wh);
    near(c.dli, reference.cells[i].dli);
  });
  assert.ok(actual.cells.some((c, i) => Math.abs(c.wh - flat.cells[i].wh) > 1));
  const packed = await buildProjectPackage(tilted, actual);
  const opened = await readProject(packed.archive, 'tilted-pergola.zip');
  assert.ok(opened.result);
  assert.equal(opened.study.racking.pergolaTilt, 30);
});
