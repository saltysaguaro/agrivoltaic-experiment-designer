import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { JSDOM } from 'jsdom';
import {
  defaultStudy,
  migrateStudy,
  studySchema,
  dimensions,
  analysisKey,
  cropSpacing,
  updateStudyInput,
  selectRacking,
} from '../src/domain/study.js';
import {
  landUseZones,
  rectangleUnionArea,
  plotZoneOverlap,
  landUseSummary,
} from '../src/domain/land-use.js';
import {
  buildGeometry,
  disposeGroup,
  simulationGeometry,
  receiverGridSpec,
  worldToLocal,
  localToWorld,
} from '../src/domain/geometry.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
import { zoneSvg } from '../src/ui/annotation-svg.js';
import { figureSvg } from '../src/report/figures.js';
import { methodsRows, publicationTables, reportHtml } from '../src/report/export.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ≈ ${b}`);
test('land-use inputs migrate, validate and round-trip without changing the solver or receiver domain', () => {
  const legacy = defaultStudy();
  delete legacy.landUse;
  const s = migrateStudy(legacy);
  assert.deepEqual(s.landUse, { underPanelWidth: 1, perimeterBuffer: 3 });
  const key = analysisKey(s),
    grid = receiverGridSpec(s),
    before = buildGeometry(s);
  const original = simulationGeometry(before);
  s.landUse = { underPanelWidth: 5, perimeterBuffer: 12 };
  s.rowPair.cropSetback = 2;
  s.rowPair.maintenance = 4;
  const after = buildGeometry(s),
    updated = simulationGeometry(after);
  assert.deepEqual([...original.attributes.position.array], [...updated.attributes.position.array]);
  assert.equal(analysisKey(s), key);
  assert.deepEqual(receiverGridSpec(s), grid);
  const migrated = migrateStudy(JSON.parse(JSON.stringify(s)));
  assert.equal(migrated.rowPair.maintenance, undefined);
  assert.equal(migrated.rowPair.croppingWidth, 3);
  assert.equal(migrated.landUse.underPanelWidth, 5);
  assert.deepEqual(migrateStudy(JSON.parse(JSON.stringify(migrated))), migrated);
  assert.equal(
    studySchema.safeParse({ ...s, landUse: { underPanelWidth: -1, perimeterBuffer: 3 } }).success,
    false,
  );
  assert.equal(
    studySchema.safeParse({ ...s, landUse: { underPanelWidth: 1, perimeterBuffer: Infinity } })
      .success,
    false,
  );
  s.array.buffer += 1;
  assert.notEqual(analysisKey(s), key, 'Sampling extent still invalidates numerical results');
  original.dispose();
  updated.dispose();
  disposeGroup(before);
  disposeGroup(after);
});

test('reserved rectangles rotate with the array, retain metric widths and include group lanes and buffer corners', () => {
  const s = defaultStudy();
  s.array.azimuth = 137;
  s.array.groupSize = 2;
  const d = dimensions(s),
    { zones, outer } = landUseZones(s);
  for (const z of zones) {
    z.corners.forEach((p, i) => {
      const local = worldToLocal(s, p.x, p.y);
      near(local.x, i === 0 || i === 3 ? z.x0 : z.x1);
      near(local.y, i < 2 ? z.y0 : z.y1);
      assert.equal(p.z, 0);
    });
  }
  const under = zones.filter((z) => z.kind === 'underPanel');
  assert.equal(under.length, s.array.rows);
  under.forEach((r) => near(r.y1 - r.y0, s.landUse.underPanelWidth));
  const lanes = zones.filter((z) => z.kind === 'cropping');
  assert.equal(lanes.length, s.array.rows - 1);
  near((lanes[1].y0 + lanes[1].y1) / 2, 0);
  near(outer.x1 - outer.x0, d.length + 2 * s.landUse.perimeterBuffer);
  const buffer = zones.filter((z) => z.kind === 'perimeter');
  near(
    rectangleUnionArea(buffer),
    (d.length + 6) * (d.span + d.width + 6) - d.length * (d.span + d.width),
  );
  s.landUse = { underPanelWidth: 0, perimeterBuffer: 0 };
  s.rowPair.cropSetback = 0;
  s.rowPair.maintenance = 0;
  assert.ok(landUseZones(s).zones.every((z) => z.kind === 'cropping'));
  assert.equal(landUseSummary(s).reservedArea, 0);
});

test('plot reservations use union area and central profile sections do not project side buffers through the field', () => {
  near(
    rectangleUnionArea([
      { x0: 0, x1: 3, y0: 0, y1: 2 },
      { x0: 2, x1: 4, y0: 1, y1: 3 },
    ]),
    9,
  );
  const s = defaultStudy();
  s.array.rows = 1;
  s.landUse.underPanelWidth = 10;
  const p = localToWorld(s, 0, 0);
  const plot = { id: 'P1', x: p.x, y: p.y, width: 2, length: 6 };
  near(plotZoneOverlap(s, plot), 12, 'Under-row strip plus overlapping setbacks is counted once');
  s.crops = [plot];
  near(landUseSummary(s).conflicts[0].area, 12);
  const zones = landUseZones(s).zones;
  const profile = new JSDOM(
    `<svg>${zoneSvg(zones, (p) => [worldToLocal(s, p.x, p.y).y, -p.z], { profile: true })}</svg>`,
  );
  assert.equal(
    profile.window.document.querySelectorAll('[data-land-zone="perimeter"]').length,
    2,
    'Only the two end buffers cross the centre section',
  );
});

test('engineering witnesses match actual rotated module edges, land widths, sensor depths and special poses', () => {
  for (const orientation of ['portrait', 'landscape']) {
    const s = defaultStudy();
    s.array.azimuth = 123;
    s.table.orientation = orientation;
    const group = buildGeometry(s, 'module');
    for (const key of ['length', 'width', 'thickness', 'gap']) {
      const [a] = engineeringAnnotations(s, 'module', group, { id: `module.${key}` });
      near(a.points[0].distanceTo(a.points[1]), s.module[key]);
    }
    disposeGroup(group);
  }
  for (const type of ['fixed', 'vertical', 'pergola', 'single-axis', 'dual-axis']) {
    const s = selectRacking(defaultStudy(), type),
      group = buildGeometry(s);
    for (const id of [
      'landUse.underPanelWidth',
      'landUse.perimeterBuffer',
      'rowPair.cropSetback',
      'rowPair.croppingWidth',
      'array.buffer',
    ]) {
      const [a] = engineeringAnnotations(s, 'array', group, { id });
      const [section, key] = id.split('.');
      near(a.points[0].distanceTo(a.points[1]), Math.abs(s[section][key]));
    }
    let edge = -Infinity;
    for (const mesh of group.children.filter((m) => m.userData.kind === 'module')) {
      const vertices = mesh.geometry.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const p = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(mesh.matrixWorld);
        edge = Math.max(edge, worldToLocal(s, p.x, p.y).y);
      }
    }
    const [setback] = engineeringAnnotations(s, 'array', group, { id: 'rowPair.cropSetback' });
    assert.ok(
      Math.abs(
        worldToLocal(s, setback.points[0].x, setback.points[0].y).y + dimensions(s).span - edge,
      ) < 1e-6,
      'Signed setback starts at the actual frame edge, including thickness',
    );
    near(
      worldToLocal(s, setback.points[1].x, setback.points[1].y).y,
      group.userData.rowOffsets[0] + s.landUse.underPanelWidth / 2,
    );
    const [tilt] = engineeringAnnotations(s, 'racking', group, { id: 'racking.tilt' });
    assert.equal(
      tilt.value,
      `${type === 'vertical' ? 90 : type === 'pergola' ? 0 : s.racking.tilt}°`,
    );
    s.experimentSensors = [{ id: 'S1', x: 2, y: 3, z: -0.4 }];
    const [sensor] = engineeringAnnotations(s, 'sensors', group, { id: 'experimentSensors.0.z' });
    near(sensor.points[0].distanceTo(sensor.points[1]), 0.4);
    const [site] = engineeringAnnotations(s, 'environment', group, {
      id: 'site.latitude',
      label: 'Latitude',
    });
    assert.equal(site.kind, 'context');
    assert.equal(site.points.length, 0);
    disposeGroup(group);
  }
});

test('publication tables retain every methods value exactly once and all figure projections carry zone definitions', () => {
  const s = defaultStudy();
  s.metadata.title = '<script>bad()</script>';
  const publication = publicationTables(s, null),
    rows = methodsRows(s, null);
  const flattened = [
    ...publication.sections.flatMap((section) => section.rows),
    ...publication.notes,
  ];
  assert.equal(flattened.length, rows.length);
  assert.deepEqual(new Map(flattened), new Map(rows));
  const dom = new JSDOM(reportHtml(s, null)),
    doc = dom.window.document;
  assert.equal(doc.querySelectorAll('.parameters').length, 3);
  for (const table of doc.querySelectorAll('.parameters')) {
    assert.equal(table.querySelectorAll('thead th').length, 4);
    for (const row of table.querySelectorAll('tbody tr')) assert.equal(row.children.length, 4);
  }
  assert.equal(doc.querySelectorAll('script').length, 0);
  const sensorStudy = defaultStudy();
  sensorStudy.experimentSensors = [
    { id: 'Probe Alpha', type: 'PAR', x: 0, y: 0, z: 0.2, grid: { column: 0, row: 0 } },
  ];
  assert.match(
    figureSvg(sensorStudy, null, 'plan', 'none', 'array', true, { compact: true }),
    /Probe Alpha/,
  );

  assert.ok(doc.querySelector('.appendix').textContent.includes('Land-use definitions'));
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = new JSDOM(figureSvg(s, null, view), { contentType: 'image/svg+xml' });
    assert.ok(svg.window.document.querySelector('[data-land-zone="underPanel"]'));
    assert.ok(svg.window.document.querySelector('[data-land-zone="perimeter"]'));
    assert.ok(svg.window.document.documentElement.textContent.includes('Planning overlays only'));
    assert.ok(svg.window.document.querySelector('[data-callout]'));
  }
});

test('editing any linked width or signed setback maintains a contiguous crop partition across geometry changes', () => {
  let s = defaultStudy();
  const check = () => {
    const d = cropSpacing(s);
    near(s.rowPair.cropSetback, (s.landUse.underPanelWidth - d.projected) / 2);
    near(s.rowPair.croppingWidth + s.landUse.underPanelWidth, s.rowPair.pitch);
    const { zones } = landUseZones(s),
      under = zones.filter((z) => z.kind === 'underPanel'),
      crop = zones.filter((z) => z.kind === 'cropping');
    crop.forEach((c, i) => {
      near(c.y0, under[i].y1);
      near(c.y1, under[i + 1].y0);
    });
  };
  check();
  s = updateStudyInput(s, 'rowPair', 'cropSetback', -0.5);
  check();
  near(s.landUse.underPanelWidth, dimensions(s).projected - 1);
  s = updateStudyInput(s, 'landUse', 'underPanelWidth', 2);
  check();
  s = updateStudyInput(s, 'rowPair', 'croppingWidth', 3);
  check();
  near(s.landUse.underPanelWidth, 5);
  s = updateStudyInput(s, 'module', 'length', 3);
  check();
  near(s.landUse.underPanelWidth, 5);
  s = updateStudyInput(s, 'rowPair', 'pitch', 4);
  check();
  near(s.landUse.underPanelWidth, 4);
  near(s.rowPair.croppingWidth, 0);
  s = updateStudyInput(s, 'landUse', 'underPanelWidth', 0);
  near(s.rowPair.cropSetback, -dimensions(s).projected / 2);
  near(s.rowPair.croppingWidth, 4);
  s = defaultStudy();
  s.array.groupSize = 1;
  const group = buildGeometry(s, 'pair');
  const [gap] = engineeringAnnotations(s, 'pair', group, { id: 'rowPair.croppingWidth' });
  assert.equal(gap.symbol, 'C + A');
  near(gap.points[0].distanceTo(gap.points[1]), s.rowPair.croppingWidth + s.array.aisle);
  near(parseFloat(gap.value), s.rowPair.croppingWidth + s.array.aisle);
  disposeGroup(group);
});
