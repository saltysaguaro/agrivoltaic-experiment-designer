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
import { defaultStudy } from '../src/domain/study.js';
import { buildGeometry, disposeGroup, axes } from '../src/domain/geometry.js';
import { hardwarePoints, fitDrawing } from '../src/ui/drawing-bounds.js';
import { engineeringAnnotations } from '../src/ui/annotations.js';
import { annotationSvg } from '../src/ui/annotation-svg.js';
import { figureSvg } from '../src/report/figures.js';
import { designLayers, irradianceLayers } from '../src/ui/display-layers.js';
import { applyDisplayLayers } from '../src/ui/land-meshes.js';

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
