import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultStudy,
  selectRacking,
  updateStudyInput,
  rackingMinimums,
  studySchema,
  designIssues,
  validationMessage,
} from '../src/domain/study.js';
import { buildGeometry, disposeGroup } from '../src/domain/geometry.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { figureSvg, heatColor } from '../src/report/figures.js';
import { methodsRows, reportHtml, exportCsv } from '../src/report/export.js';
import { groundGrid } from '../src/ui/ground-grid.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('racking defaults follow later assembly changes and support minimums beyond old spacing bounds', () => {
  let s = selectRacking(defaultStudy(), 'dual-axis');
  s = updateStudyInput(s, 'table', 'high', 5);
  assert.ok(s.row.tableGap > 1.43);
  assert.deepEqual(designIssues(s), []);
  for (const type of ['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola']) {
    let large = defaultStudy();
    large.module = { ...large.module, length: 5, width: 3, gap: 0.5 };
    large.table = { high: 5, wide: 20, orientation: 'landscape' };
    large = selectRacking(large, type);
    assert.ok(studySchema.safeParse(large).success, type);
    assert.ok(
      !designIssues(large).some((issue) => /interference|overlap|height|ground/.test(issue)),
      type,
    );
  }
  s = updateStudyInput(s, 'row', 'tableGap', 0.05);
  assert.ok(designIssues(s).some((issue) => /along the row/.test(issue)));
  s = updateStudyInput(s, 'racking', 'type', 'dual-axis');
  assert.equal(s.row.tableGap, rackingMinimums(s).tableGap);
  assert.deepEqual(designIssues(s), []);
});

test('table-count validation explains the field and software limit', () => {
  const s = defaultStudy();
  s.row.tables = 21;
  const parsed = studySchema.safeParse(s);
  assert.equal(parsed.success, false);
  const message = validationMessage(parsed.error.issues[0]);
  assert.match(message, /Tables per row.*1 to 20.*application limit/);
  assert.doesNotMatch(message, /row\.tables/);
});

test('relative sunlight complements shade and is consistent across report, CSV, maps and legends', async () => {
  const s = defaultStudy();
  s.weather.mode = 'sample';
  s.analysis = { ...s.analysis, backend: 'cpu', resolution: 3, patches: 145 };
  const r = await calculateDay(s);
  for (const c of r.cells) {
    near(c.sunlight + c.shade, 100);
    near(c.sunlight, (100 * c.wh) / r.openWh);
  }
  near(r.meanSunlight + r.meanShade, 100);
  assert.equal(heatColor(0), '#254e71');
  assert.equal(heatColor(100), '#f4de70');
  assert.equal(heatColor(r.openDli, r.openDli), '#f4de70');
  assert.match(exportCsv(s, r).split('\r\n')[0], /relative_sunlight_percent/);
  const receiverRow = exportCsv(s, r).split('\r\n')[1].split(',');
  near(Number(receiverRow[6].replaceAll('"', '')), r.cells[0].sunlight);
  const mean = methodsRows(s, r).find(([label]) => label.includes('mean relative sunlight'));
  assert.ok(mean[1].startsWith(r.meanSunlight.toFixed(3) + '%'));
  const html = reportHtml(s, r);
  assert.doesNotMatch(html, /relative shade|shade_percent/i);
  assert.equal(
    (html.match(/data-ground-grid="true"/g) || []).length,
    3,
    'Light figures default to a clean map without ground-grid overlays',
  );
  assert.match(figureSvg(s, r, 'plan', 'sunlight'), /100% sunlight/);
});

test('canonical report projections include a ground reference; grid is display-only at z = 0', () => {
  const s = defaultStudy();
  s.array.azimuth = 37;
  const group = buildGeometry(s);
  const ground = groundGrid(s, group.userData);
  assert.ok(ground.lines.length > 2);
  assert.ok(ground.lines.flat().every((p) => p.z === 0));
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = figureSvg(s, null, view);
    assert.match(svg, /data-ground-grid="true"/);
    assert.match(svg, /Ground z = 0 m/);
    assert.doesNotMatch(svg, /NaN|Infinity/);
  }
  assert.doesNotMatch(figureSvg(s, null, 'oblique', 'none', 'module'), /data-ground-grid/);
  assert.doesNotMatch(figureSvg(s, null, 'oblique', 'none', 'array', false), /data-ground-grid/);
  disposeGroup(group);
});

test('daily tracker calculations follow solar motion independently of the static preview tilt', async () => {
  for (const type of ['single-axis', 'dual-axis']) {
    let s = defaultStudy();
    s.weather.mode = 'sample';
    s.table = { ...s.table, high: 1, wide: 2 };
    s.row.tables = 1;
    s.array.rows = 1;
    s.analysis = { ...s.analysis, backend: 'cpu', resolution: 3, patches: 145, interval: 15 };
    s = selectRacking(s, type);
    s.racking.tilt = 0;
    const first = await calculateDay(s);
    s.racking.tilt = 50;
    const second = await calculateDay(s);
    first.cells.forEach((c, i) => near(c.wh, second.cells[i].wh));
  }
});
