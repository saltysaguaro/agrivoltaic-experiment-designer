import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultStudy,
  migrateStudy,
  analysisKey,
  dimensions,
  studySchema,
} from '../src/domain/study.js';
import {
  buildGeometry,
  disposeGroup,
  receiverGrid,
  receiverGridSpec,
  localToWorld,
  worldToLocal,
} from '../src/domain/geometry.js';
import { cellLocal, rowEdge, rowSpan, gridMean, rowHeight } from '../src/domain/receiver-grid.js';
import {
  normalizeLayout,
  cellAt,
  plotCorners,
  receiverLines,
  sensorMarkers,
} from '../src/experiment/grid-layout.js';
import { receiverAtPoint } from '../src/ui/camera.js';
import { initializeControl, fieldStudy } from '../src/experiment/control-field.js';
import { duplicateFieldGroup } from '../src/experiment/field-editing.js';
import { plotStats } from '../src/experiment/layout.js';
import { figureSvg } from '../src/report/figures.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { buildProjectPackage, readProject } from '../src/project/package.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('uniform-grid point inside a vertical support reads zero; aligned samples avoid that collision', async () => {
  const s = defaultStudy();
  s.racking.type = 'vertical';
  s.module.bifacial = true;
  s.table.high = 1;
  s.table.wide = 2;
  s.row.tables = 1;
  s.array.rows = 1;
  s.weather.mode = 'sample';
  Object.assign(s.analysis, {
    gridAlignment: 'spacing',
    resolution: 1,
    date: '2025-04-01',
    backend: 'cpu',
  });
  const cache = { get: async () => null, put: async () => {} };
  const geometry = buildGeometry(s, 'array', undefined, { textures: false });
  assert.ok(
    geometry.children.some(
      (m) => m.userData.kind === 'post' && Math.hypot(m.position.x, m.position.y) < 1e-8,
    ),
  );
  disposeGroup(geometry);
  for (const patches of [145, 577]) {
    s.analysis.patches = patches;
    const result = await calculateDay(s, () => {}, { cache });
    const centre = result.cells.find((c) => Math.hypot(c.x, c.y) < 1e-8);
    assert.equal(centre.wh, 0);
    assert.equal(centre.dli, 0);
    assert.equal(centre.sunlight, 0);
    assert.ok(result.cells.some((c) => Math.hypot(c.x, c.y) < 1 && c.wh > 0));
  }
  s.analysis.samplesPerCell = 4;
  const averaged = await calculateDay(s, () => {}, { cache });
  assert.ok(averaged.cells.find((c) => Math.hypot(c.x, c.y) < 1e-8).wh > 0);
  s.analysis.samplesPerCell = 1;
  s.analysis.gridAlignment = 'row-centres';
  const aligned = await calculateDay(s, () => {}, { cache });
  assert.ok(aligned.cells.every((c) => c.wh > 0));
});

function fixture() {
  const s = defaultStudy();
  s.array.rows = 5;
  s.array.groupSize = 2;
  s.array.aisle = 3;
  s.array.azimuth = 37;
  return s;
}
test('default grid has exactly fifteen cells per actual row-centre interval, including wider aisles', () => {
  const s = fixture(),
    g = receiverGridSpec(s),
    d = dimensions(s),
    geometry = buildGeometry(s);
  assert.equal(s.analysis.gridAlignment, 'row-centres');
  assert.equal(s.analysis.cellsPerRow, 15);
  const centres = geometry.userData.rowOffsets;
  const indices = centres.map((y) => g.yEdges.findIndex((edge) => Math.abs(edge - y) < 1e-8));
  assert.ok(indices.every((i) => i >= 0));
  for (let r = 1; r < indices.length; r++) {
    assert.equal(indices[r] - indices[r - 1], 15);
    for (let k = 0; k < 15; k++)
      near(rowHeight(g, indices[r - 1] + k), (centres[r] - centres[r - 1]) / 15);
  }
  near(g.yEdges[0], -d.footprintY / 2);
  near(g.yEdges.at(-1), d.footprintY / 2);
  near(g.width, d.footprintX);
  disposeGroup(geometry);
});
test('cell centres, hover selection, outlines, crops and sensor glyphs share the aligned rotated grid', () => {
  let s = fixture();
  const g = receiverGrid(s);
  for (const [i, point] of g.points.entries()) {
    const expected = { column: i % g.nx, row: Math.floor(i / g.nx) };
    assert.deepEqual(cellAt(s, point), expected);
    assert.equal(receiverAtPoint({ grid: g, cells: g.points }, point).index, i);
  }
  s.crops = [
    {
      id: 'BED',
      crop: 'Lettuce',
      treatment: '',
      replicate: '',
      x: 0,
      y: 0,
      width: 1,
      length: 1,
      grid: { column: 1, row: 12, columns: 3, rows: 11 },
    },
  ];
  s.experimentSensors = [
    {
      id: 'S',
      type: 'PAR',
      x: 0,
      y: 0,
      z: -0.3,
      grid: { column: 2, row: 15 },
      treatment: '',
      replicate: '',
      model: '',
      logger: '',
      notes: '',
    },
  ];
  s = normalizeLayout(s);
  const bed = s.crops[0];
  near(bed.length, g.yEdges[23] - g.yEdges[12]);
  assert.deepEqual(
    plotCorners(s, bed).map((v) => worldToLocal(s, v.x, v.y).y.toFixed(8)),
    [g.yEdges[12], g.yEdges[12], g.yEdges[23], g.yEdges[23]].map((v) => v.toFixed(8)),
  );
  assert.equal(receiverLines(s).length, g.nx + g.ny + 2);
  const marker = sensorMarkers(s)[0],
    p = worldToLocal(s, marker.position.x, marker.position.y);
  assert.ok(p.y - marker.radius >= g.yEdges[15] && p.y + marker.radius <= g.yEdges[16]);
  const copied = duplicateFieldGroup(
    s,
    [
      { kind: 'crop', id: 'BED' },
      { kind: 'sensor', id: 'S' },
    ],
    { column: 1, row: 4 },
  );
  near(copied.study.crops[1].length, bed.length);
  near(
    copied.study.crops[1].y - copied.study.experimentSensors[1].y,
    bed.y - s.experimentSensors[0].y,
  );
  const control = initializeControl(s);
  assert.deepEqual(receiverGridSpec(fieldStudy(control, true)), receiverGridSpec(s));
});
test('unequal cells use area-weighted field and crop light summaries', () => {
  const grid = { nx: 1, ny: 2, width: 1, height: 4, dx: 1, dy: 2, yEdges: [-2, -1, 2] };
  const cells = [
    { dli: 10, sunlight: 25, shade: 75 },
    { dli: 30, sunlight: 75, shade: 25 },
  ];
  near(gridMean(cells, grid, 'dli'), 25);
  const stats = plotStats({ grid, cells }, { grid: { column: 0, row: 0, columns: 1, rows: 2 } });
  near(stats.mean, 25);
  near(stats.median, 30);
  near(stats.sunlight, 62.5);
  near(stats.sd, Math.sqrt(75));
});
test('old studies preserve their uniform grids and analysis keys; alignment invalidates prior light', () => {
  const raw = defaultStudy();
  delete raw.analysis.gridAlignment;
  delete raw.analysis.cellsPerRow;
  const old = migrateStudy(raw);
  assert.equal(old.analysis.gridAlignment, 'spacing');
  assert.equal(receiverGridSpec(old).yEdges, undefined);
  assert.equal(analysisKey(raw), analysisKey(old));
  const aligned = {
    ...old,
    analysis: { ...old.analysis, gridAlignment: 'row-centres', cellsPerRow: 9 },
  };
  assert.notEqual(analysisKey(aligned), analysisKey(old));
  assert.equal(analysisKey(aligned), analysisKey(initializeControl(aligned)));
});
test('aligned light and cell edges round-trip through project packages and export matching SVG tiles', async () => {
  const s = defaultStudy();
  s.table.high = 1;
  s.table.wide = 1;
  s.row.tables = 1;
  s.array.rows = 3;
  s.array.groupSize = 2;
  s.array.buffer = 0.5;
  s.analysis.resolution = 3;
  s.analysis.patches = 145;
  s.analysis.backend = 'cpu';
  s.weather.mode = 'sample';
  const result = await calculateDay(s),
    g = result.grid;
  const svg = figureSvg(s, result, 'plan', 'dli');
  assert.match(svg, /across rows/);
  assert.ok(!svg.includes('NaN'));
  const file = await buildProjectPackage(s, result);
  const opened = await readProject(file.archive, 'aligned.agrivoltaic.zip');
  assert.ok(opened.result);
  assert.deepEqual(opened.result.grid.yEdges, g.yEdges);
  near(opened.result.meanDli, result.meanDli);
  const grid = receiverGridSpec(s);
  for (const row of [0, 9, grid.ny - 1]) {
    const point = cellLocal(grid, 0, row);
    near(point.y, (rowEdge(grid, row) + rowEdge(grid, row + 1)) / 2);
  }
});

test('switching alignment never reuses visibility cached for different cell positions', async () => {
  const s = defaultStudy();
  s.table.high = 1;
  s.table.wide = 1;
  s.row.tables = 1;
  s.array.rows = 2;
  s.array.buffer = 0.5;
  s.analysis.resolution = 3;
  s.analysis.patches = 145;
  s.analysis.backend = 'cpu';
  s.weather.mode = 'sample';
  const memory = new Map(),
    cache = {
      get: async (key) => memory.get(key),
      put: async (key, value) => memory.set(key, value),
    };
  const manual = { ...s, analysis: { ...s.analysis, gridAlignment: 'spacing' } };
  await calculateDay(manual, () => {}, { cache });
  const aligned = await calculateDay(s, () => {}, { cache });
  assert.equal(aligned.cached, 0);
  const reference = await calculateDay(s, () => {}, {
    cache: { get: async () => null, put: async () => {} },
  });
  aligned.cells.forEach((cell, i) => {
    near(cell.wh, reference.cells[i].wh);
    near(cell.dli, reference.cells[i].dli);
  });
  const rerun = await calculateDay(s, () => {}, { cache });
  assert.ok(rerun.cached > 0);
});
