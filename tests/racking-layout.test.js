import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3, DoubleSide } from 'three';
import {
  defaultStudy,
  studySchema,
  selectRacking,
  updateStudyInput,
  dimensions,
  analysisKey,
  VERSION,
} from '../src/domain/study.js';
import {
  buildGeometry,
  disposeGroup,
  worldToLocal,
  simulationGeometry,
  receiverGridSpec,
  axes,
} from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { figureSvg } from '../src/report/figures.js';
import { methodsRows } from '../src/report/export.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const kind = (g, k) => g.children.filter((m) => m.userData.kind === k);

test('vertical selection defaults to bifacial while later edits retain an explicit construction choice', () => {
  let s = selectRacking(defaultStudy(), 'vertical');
  assert.equal(s.module.bifacial, true);
  s = updateStudyInput(s, 'module', 'bifacial', false);
  s = updateStudyInput(s, 'table', 'wide', 3);
  assert.equal(s.module.bifacial, false);
  s = updateStudyInput(s, 'racking', 'type', 'vertical');
  assert.equal(s.module.bifacial, true);
  assert.deepEqual(studySchema.parse(JSON.parse(JSON.stringify(s))), s);
  assert.equal(JSON.parse(analysisKey(s))[0], VERSION);
});

test('vertical racking has full-height side posts, shared uprights across table boundaries, and matching bifacial faces', () => {
  for (const orientation of ['portrait', 'landscape']) {
    const s = selectRacking(defaultStudy(), 'vertical');
    s.table = { high: 2, wide: 3, orientation };
    s.row.tables = 2;
    s.array.rows = 3;
    s.array.azimuth = 37;
    for (const scope of ['module', 'racking', 'row', 'pair', 'array']) {
      const g = buildGeometry(s, scope);
      try {
        const simple = ['module', 'racking'].includes(scope);
        const columns = simple ? 1 : s.table.wide * s.row.tables;
        const rows = scope === 'array' ? 3 : scope === 'pair' ? 2 : 1;
        const posts = kind(g, 'post');
        assert.equal(posts.length, scope === 'module' ? 0 : rows * (columns + 1));
        assert.equal(kind(g, 'tube').length, 0);
        const modules = kind(g, 'module');
        assert.equal(modules[0].material.side, DoubleSide);
        assert.ok(modules.every((m) => m.material === modules[0].material));
        assert.ok(modules[0].material.map?.isDataTexture);
        const d = dimensions(s);
        for (let r = 0; r < rows && scope !== 'module'; r++) {
          const rowModules = modules.slice(r * columns * (simple ? 1 : s.table.high));
          const centers = [
            ...new Set(
              rowModules
                .slice(0, columns * (simple ? 1 : s.table.high))
                .map((m) => Number(worldToLocal(s, m.position.x, m.position.y).x.toFixed(9))),
            ),
          ].sort((a, b) => a - b);
          const rowPosts = posts.slice(r * (columns + 1), (r + 1) * (columns + 1));
          const positions = rowPosts.map((p) => worldToLocal(s, p.position.x, p.position.y).x);
          near(positions[0], centers[0] - d.along / 2 - s.racking.postSize / 2);
          near(positions.at(-1), centers.at(-1) + d.along / 2 + s.racking.postSize / 2);
          for (let i = 1; i < columns; i++) near(positions[i], (centers[i - 1] + centers[i]) / 2);
          for (const p of rowPosts) {
            near(p.position.z - p.geometry.parameters.depth / 2, 0);
            near(
              p.position.z + p.geometry.parameters.depth / 2,
              s.racking.height + g.userData.width / 2,
            );
          }
        }
      } finally {
        disposeGroup(g);
      }
    }
  }
});

test('vertical scientific geometry leaves the middle module gap open and blocks rays at shared uprights', async () => {
  const s = selectRacking(defaultStudy(), 'vertical');
  s.module.bifacial = false;
  s.table.high = 2;
  s.table.wide = 2;
  s.row.tables = s.array.rows = 1;
  const g = buildGeometry(s),
    geometry = simulationGeometry(g);
  const modules = kind(g, 'module'),
    posts = kind(g, 'post');
  const cpu = new CpuBvhIrradianceEngine();
  try {
    await cpu.initializeGeometry(geometry);
    const visibility = await cpu.visibility(
      [
        modules[0].position.clone().setZ(s.racking.height).addScaledVector(axes(s).v, -5),
        posts[1].position.clone().setZ(s.racking.height).addScaledVector(axes(s).v, -5),
        modules[0].position.clone().addScaledVector(axes(s).v, -5),
      ],
      [axes(s).v],
    );
    assert.deepEqual([...visibility], [1, 0, 0]);
  } finally {
    cpu.dispose();
    geometry.dispose();
    disposeGroup(g);
  }
});

test('pergola checkerboard aligns module centres with neighboring gap centres and expands the shared envelope', () => {
  for (const orientation of ['portrait', 'landscape']) {
    let s = selectRacking(defaultStudy(), 'pergola');
    s.table = { high: 2, wide: 3, orientation };
    s.row.tables = 2;
    s.array.rows = 4;
    s.array.azimuth = 73;
    s = updateStudyInput(s, 'module', 'gap', 2.75);
    const alignedKey = analysisKey(s);
    s = updateStudyInput(s, 'racking', 'pergolaLayout', 'checkerboard');
    assert.notEqual(analysisKey(s), alignedKey);
    assert.deepEqual(studySchema.parse(JSON.parse(JSON.stringify(s))), s);
    const d = dimensions(s),
      g = buildGeometry(s),
      grid = receiverGridSpec(s);
    try {
      const modules = kind(g, 'module');
      const perRow = s.table.wide * s.table.high * s.row.tables;
      const x = (r, t, j, i) => {
        const m = modules[r * perRow + t * s.table.high * s.table.wide + j * s.table.wide + i];
        return worldToLocal(s, m.position.x, m.position.y).x;
      };
      for (let r = 0; r < s.array.rows - 1; r++)
        for (let t = 0; t < s.row.tables; t++)
          for (let j = 0; j < s.table.high; j++)
            for (let i = 0; i < s.table.wide - 1; i++) {
              const a = r % 2 ? r + 1 : r,
                b = r % 2 ? r : r + 1;
              near(x(b, t, j, i), (x(a, t, j, i) + x(a, t, j, i + 1)) / 2);
            }
      near(g.userData.length, d.length);
      near(d.length, d.rowLength + (d.along + s.module.gap) / 2);
      near(grid.width, d.length + 2 * s.array.buffer);
      for (const m of modules) {
        const p = worldToLocal(s, m.position.x, m.position.y);
        assert.ok(Math.abs(p.x) + d.along / 2 <= grid.width / 2 + 1e-7);
        assert.ok(Math.abs(p.y) + d.cross / 2 <= grid.height / 2 + 1e-7);
      }
      const rowDimension = engineeringAnnotations(s, 'array', g, { id: 'row.tables' })[0];
      near(rowDimension.points[0].distanceTo(rowDimension.points[1]), d.rowLength);
      const svg = figureSvg(s);
      assert.match(svg, /Checkerboard/);
      assert.match(
        methodsRows(s, null).find(([key]) => key === 'Pergola layout')[1],
        /half module-plus-gap/,
      );
    } finally {
      disposeGroup(g);
    }
    for (const scope of ['module', 'racking', 'row']) {
      const g = buildGeometry(s, scope);
      near(g.userData.rowShifts[0], 0);
      disposeGroup(g);
    }
    s.array.rows = 1;
    near(dimensions(s).length, dimensions(s).rowLength);
  }
});

test('unbounded nonnegative module gaps survive input updates and imports; old pergolas default aligned', () => {
  for (const gap of [0, 0.75, 3, 1000]) {
    const s = updateStudyInput(selectRacking(defaultStudy(), 'pergola'), 'module', 'gap', gap);
    assert.equal(studySchema.parse(s).module.gap, gap);
  }
  for (const gap of [-1, NaN, Infinity]) {
    const s = defaultStudy();
    s.module.gap = gap;
    assert.equal(studySchema.safeParse(s).success, false);
  }
  const old = selectRacking(defaultStudy(), 'pergola');
  delete old.racking.pergolaLayout;
  assert.equal(studySchema.parse(old).racking.pergolaLayout, 'aligned');
});
