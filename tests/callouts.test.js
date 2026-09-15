import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  Box3,
  OrthographicCamera,
  Vector3,
  Group,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { defaultStudy, dimensions } from '../src/domain/study.js';
import { buildGeometry, disposeGroup, axes, worldToLocal } from '../src/domain/geometry.js';
import { hardwarePoints, fitDrawing } from '../src/ui/drawing-bounds.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
import { annotationSvg } from '../src/ui/annotation-svg.js';
import { figureSvg } from '../src/report/figures.js';
import { designLayers, irradianceLayers } from '../src/ui/display-layers.js';
import { applyDisplayLayers } from '../src/ui/land-meshes.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('callout obstacle hull has no invented box corners and preserves the exact hardware silhouette', () => {
  for (const type of ['fixed', 'vertical', 'pergola']) {
    const s = defaultStudy();
    s.racking.type = type;
    s.racking.pergolaLayout = 'checkerboard';
    s.module.gap = 0.4;
    s.array.azimuth = 137;
    s.array.rows = 8;
    const group = buildGeometry(s),
      actual = [];
    for (const mesh of group.children) {
      const positions = mesh.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++)
        actual.push(new Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld));
    }
    const hull = hardwarePoints(group);
    assert.ok(hull.length < 100, 'Only hull vertices are projected on each redraw');
    assert.ok(
      hull.every((p) => actual.some((q) => p.distanceTo(q) < 1e-7)),
      'No empty bounding-box corners',
    );
    for (let i = 0; i < 30; i++) {
      const direction = new Vector3(Math.sin(i), Math.cos(i), Math.sin(i * 2.1));
      near(
        Math.max(...hull.map((p) => p.dot(direction))),
        Math.max(...actual.map((p) => p.dot(direction))),
      );
    }
    disposeGroup(group);
  }
});

test('table, aisle and gap callouts measure the actual first-row geometry, including stagger and single-item cases', () => {
  for (const type of ['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola'])
    for (const orientation of ['portrait', 'landscape']) {
      const s = defaultStudy();
      s.racking.type = type;
      s.racking.pergolaLayout = 'checkerboard';
      s.module.gap = 0.4;
      s.array.azimuth = 137;
      s.array.groupSize = 1;
      s.table.orientation = orientation;
      const group = buildGeometry(s),
        d = dimensions(s),
        g = group.userData;
      const callout = (id) => engineeringAnnotations(s, 'array', group, { id })[0];
      for (const [id, length] of [
        ['module.length', s.module.length],
        ['module.width', s.module.width],
        ['module.thickness', s.module.thickness],
        ['module.gap', s.module.gap],
        ['table.high', g.width],
        ['table.wide', d.tableLength],
        ['row.tables', d.rowLength],
        ['row.tableGap', s.row.tableGap],
        ['racking.height', s.racking.height],
        ['racking.postSize', s.racking.postSize],
        ['rowPair.pitch', s.rowPair.pitch],
        ['array.aisle', s.array.aisle],
      ]) {
        const a = callout(id);
        near(a.points[0].distanceTo(a.points[1]), length);
      }
      const rowStart = g.rowShifts[0] - g.rowLength / 2;
      for (const id of ['table.high', 'table.wide']) {
        const a = callout(id);
        near(worldToLocal(s, a.points[0].x, a.points[0].y).x, rowStart);
      }
      const gap = callout('row.tableGap');
      near(worldToLocal(s, gap.points[0].x, gap.points[0].y).x, rowStart + d.tableLength);
      const aisle = callout('array.aisle');
      near(
        worldToLocal(s, aisle.points[0].x, aisle.points[0].y).y,
        g.rowOffsets[0] + s.rowPair.pitch,
      );
      near(worldToLocal(s, aisle.points[1].x, aisle.points[1].y).y, g.rowOffsets[1]);
      const crop = callout('rowPair.croppingWidth');
      assert.equal(crop.symbol, 'C + A');
      near(parseFloat(crop.value), crop.points[0].distanceTo(crop.points[1]));
      disposeGroup(group);
    }
  const s = defaultStudy();
  s.row.tables = 1;
  s.array.rows = 1;
  const g = buildGeometry(s),
    rack = buildGeometry(s, 'racking');
  assert.equal(engineeringAnnotations(s, 'array', g, { id: 'array.rows' })[0].kind, 'leader');
  assert.equal(engineeringAnnotations(s, 'array', g, { id: 'array.groupSize' })[0].kind, 'context');
  assert.equal(engineeringAnnotations(s, 'row', g, { id: 'row.tableGap' })[0].points.length, 0);
  assert.ok(engineeringAnnotations(s, 'row', g).every((a) => a.id !== 'row.tableGap'));
  assert.equal(
    engineeringAnnotations(s, 'racking', rack, { id: 'module.gap' })[0].points.length,
    0,
  );
  disposeGroup(g);
  disposeGroup(rack);
});

test('default callout labels and dimension lines stay legible and bounded across rotated engineering views', () => {
  for (const type of ['fixed', 'vertical', 'pergola'])
    for (const scope of ['module', 'racking', 'row', 'pair', 'array'])
      for (const view of ['plan', 'profile', 'oblique'])
        for (const azimuth of [0, 137, 220])
          for (const [width, height] of [
            [866, 440],
            [350, 360],
          ]) {
            const s = defaultStudy();
            s.racking.type = type;
            s.array.azimuth = azimuth;
            const group = buildGeometry(s, scope),
              annotations = engineeringAnnotations(s, scope, group);
            const bounds = new Box3().setFromObject(group);
            for (const a of annotations) for (const p of a.points) bounds.expandByPoint(p);
            const center = bounds.getCenter(new Vector3()),
              camera = new OrthographicCamera();
            camera.up.set(0, 0, 1);
            if (view === 'plan') {
              camera.position.copy(center).add(new Vector3(0, 0, 100));
              camera.up.set(0, 1, 0);
            } else if (view === 'profile')
              camera.position.copy(center).add(axes(s).u.multiplyScalar(100));
            else camera.position.copy(center).add(new Vector3(100, -100, 85));
            camera.lookAt(center);
            Object.assign(camera, fitDrawing(camera, bounds, width, height));
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld(true);
            const project = (p) => {
              const q = p.clone().project(camera);
              return [((q.x + 1) * width) / 2, ((1 - q.y) * height) / 2];
            };
            const svg = annotationSvg(annotations, project, width, height - 25, {
              obstacles: hardwarePoints(group).map(project),
            });
            const doc = new JSDOM(`<svg>${svg}</svg>`, { contentType: 'image/svg+xml' }).window
              .document;
            assert.doesNotMatch(svg, /NaN|Infinity/);
            const boxes = [...doc.querySelectorAll('[data-callout] rect')].map((r) => ({
              x: +r.getAttribute('x'),
              y: +r.getAttribute('y'),
              w: +r.getAttribute('width'),
              h: +r.getAttribute('height'),
            }));
            assert.equal(boxes.length, annotations.filter((a) => a.points.length).length);
            for (const [i, b] of boxes.entries()) {
              assert.ok(
                b.x >= 0 && b.y >= 58 && b.x + b.w <= width && b.y + b.h <= height - 25,
                `${scope}/${view}/${azimuth}`,
              );
              for (const other of boxes.slice(i + 1))
                assert.ok(
                  b.x + b.w <= other.x ||
                    other.x + other.w <= b.x ||
                    b.y + b.h <= other.y ||
                    other.y + other.h <= b.y,
                  'Labels must not overlap',
                );
            }
            for (const path of doc.querySelectorAll('[data-dimension-line]')) {
              const [x1, y1, x2, y2] = path
                .getAttribute('d')
                .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)
                .map(Number);
              assert.ok(
                [x1, x2].every((x) => x >= 0 && x <= width) &&
                  [y1, y2].every((y) => y >= 58 && y <= height - 25),
                `${scope}/${view}/${azimuth}: dimension line bounds`,
              );
              const id = path.parentNode.getAttribute('data-callout-marks'),
                a = annotations.find((a) => a.id === id),
                [p, q] = a.points.map(project);
              near(x2 - x1, q[0] - p[0]);
              near(y2 - y1, q[1] - p[1]);
            }
            // Marks precede all label boxes; later witnesses cannot cover text.
            const firstLabel = doc.querySelector('[data-callout]');
            assert.ok(
              !firstLabel || !firstLabel.nextElementSibling?.hasAttribute('data-callout-marks'),
            );
            disposeGroup(group);
            doc.defaultView.close();
          }
});

test('edge-on dimensions and angles use point leaders; fully offscreen anchors do not leave pinned labels', () => {
  const s = defaultStudy(),
    g = buildGeometry(s, 'module');
  const annotations = engineeringAnnotations(s, 'module', g);
  const edgeOn = annotationSvg(annotations, (p) => [200, 150 + p.y * 20], 400, 350);
  const doc = new JSDOM(`<svg>${edgeOn}</svg>`, { contentType: 'image/svg+xml' }).window.document;
  assert.ok(doc.querySelector('[data-projected-edge]'));
  assert.match(edgeOn, /edge-on projection/);
  assert.equal(
    annotationSvg(annotations, () => [-100, 150], 400, 350),
    '',
  );
  const angle = engineeringAnnotations(s, 'racking', g, { id: 'racking.tilt' });
  const collapsed = annotationSvg(angle, (p) => [200, 150 + p.y * 20], 400, 350);
  assert.doesNotMatch(collapsed, /<polyline/);
  assert.match(collapsed, /Angle plane is edge-on/);
  disposeGroup(g);
});

function assertLabels(svg, obstacle, width, height) {
  const doc = new JSDOM(`<svg>${svg}</svg>`, { contentType: 'image/svg+xml' }).window.document;
  const labels = [...doc.querySelectorAll('[data-callout] rect')];
  assert.equal(labels.length, 2, 'Both module dimensions are present');
  for (const rect of labels) {
    const x = +rect.getAttribute('x'),
      y = +rect.getAttribute('y'),
      w = +rect.getAttribute('width'),
      h = +rect.getAttribute('height');
    assert.ok(
      x >= 0 && y >= 0 && x + w <= width && y + h <= height,
      'Label fits without zooming out',
    );
    assert.ok(
      x + w <= obstacle.left ||
        x >= obstacle.right ||
        y + h <= obstacle.top ||
        y >= obstacle.bottom,
      'Label lies outside the module envelope',
    );
  }
}
test('module L and W labels fit outside the panel at desktop and mobile default framing in all views', () => {
  for (const orientation of ['portrait', 'landscape'])
    for (const view of ['plan', 'profile', 'oblique'])
      for (const [width, height] of [
        [866, 380],
        [350, 360],
      ]) {
        const s = defaultStudy();
        s.table.orientation = orientation;
        s.array.azimuth = 137;
        const group = buildGeometry(s, 'module'),
          bounds = new Box3().setFromObject(group),
          center = bounds.getCenter(new Vector3()),
          cam = new OrthographicCamera();
        cam.up.set(0, 0, 1);
        if (view === 'plan') {
          cam.position.copy(center).add(new Vector3(0, 0, 20));
          cam.up.set(0, 1, 0);
        } else if (view === 'profile') cam.position.copy(center).add(axes(s).u.multiplyScalar(20));
        else cam.position.copy(center).add(new Vector3(20, -20, 17));
        cam.lookAt(center);
        Object.assign(cam, fitDrawing(cam, bounds, width, height));
        cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
        const project = (p) => {
          const q = p.clone().project(cam);
          return [((q.x + 1) * width) / 2, ((1 - q.y) * height) / 2];
        };
        const obstacles = hardwarePoints(group).map(project),
          obstacle = {
            left: Math.min(...obstacles.map((p) => p[0])),
            right: Math.max(...obstacles.map((p) => p[0])),
            top: Math.min(...obstacles.map((p) => p[1])),
            bottom: Math.max(...obstacles.map((p) => p[1])),
          };
        assertLabels(
          annotationSvg(engineeringAnnotations(s, 'module', group), project, width, height - 25, {
            obstacles,
          }),
          obstacle,
          width,
          height - 25,
        );
        disposeGroup(group);
      }
});
test('publication dimensions clear modules and irradiance figures omit callouts and default ground overlays', () => {
  const s = defaultStudy();
  for (const view of ['plan', 'profile', 'oblique']) {
    const doc = new JSDOM(figureSvg(s, null, view, 'none', 'module'), {
      contentType: 'image/svg+xml',
    }).window.document;
    const coords = [...doc.querySelectorAll('[data-hardware="module"] polygon')].flatMap((p) =>
      p
        .getAttribute('points')
        .split(' ')
        .map((pair) => pair.split(',').map(Number)),
    );
    const obstacle = {
      left: Math.min(...coords.map((p) => p[0])),
      right: Math.max(...coords.map((p) => p[0])),
      top: Math.min(...coords.map((p) => p[1])),
      bottom: Math.max(...coords.map((p) => p[1])),
    };
    assertLabels(
      [...doc.querySelectorAll('[data-callout]')].map((g) => g.outerHTML).join(''),
      obstacle,
      1000,
      520,
    );
  }
  const svg = figureSvg(s, null, 'plan', 'none', 'irradiance', true, {
    layers: irradianceLayers,
    panelOpacity: 0.2,
  });
  assert.doesNotMatch(svg, /data-callout=/);
  assert.doesNotMatch(svg, /data-land-zone=/);
  assert.match(svg, /data-receiver-boundary="true"/);
  for (const view of ['plan', 'oblique']) {
    const outlineOnly = figureSvg(s, null, view, 'none', 'irradiance', false, {
      layers: irradianceLayers,
    });
    assert.match(outlineOnly, /data-receiver-boundary="true"/);
    assert.doesNotMatch(outlineOnly, /data-receiver-grid=/);
  }
  assert.match(svg, /data-hardware="module"[^]*opacity="0.2"/);
  const restored = figureSvg(s, null, 'plan', 'none', 'irradiance', true, {
    layers: { ...irradianceLayers, cropping: true },
  });
  assert.match(restored, /data-land-zone="cropping"/);
  assert.doesNotMatch(restored, /data-callout=/);
});
test('display toggles and panel opacity do not mutate the study or make ground meshes paint over hardware', () => {
  const s = defaultStudy(),
    before = JSON.stringify(s),
    group = buildGeometry(s),
    overlay = new Group();
  const zone = new Mesh(
    new BoxGeometry(1, 1, 0.01),
    new MeshBasicMaterial({ transparent: true, depthWrite: false }),
  );
  zone.userData.layer = 'cropping';
  overlay.add(zone);
  applyDisplayLayers(group, overlay, designLayers, 1);
  assert.ok(
    group.children
      .filter((o) => o.userData.kind === 'module')
      .every((o) => o.material.depthWrite && o.visible && o.renderOrder > zone.renderOrder),
  );
  assert.equal(zone.material.depthTest, true);
  applyDisplayLayers(group, overlay, irradianceLayers, 0.2);
  assert.equal(zone.visible, false);
  assert.ok(
    group.children
      .filter((o) => o.userData.kind === 'module')
      .every((o) => o.material.opacity === 0.2 && !o.material.depthWrite),
  );
  applyDisplayLayers(group, overlay, { ...designLayers, modules: false, supports: false }, 0.5);
  assert.ok(group.children.every((o) => !o.visible));
  assert.equal(JSON.stringify(s), before);
  disposeGroup(group);
  disposeGroup(overlay);
});
