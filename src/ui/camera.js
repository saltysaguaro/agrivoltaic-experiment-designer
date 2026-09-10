import { Vector3, Box3 } from 'three';
import { receiverGridSpec, localToWorld } from '../domain/geometry.js';
import { plotCorners } from '../experiment/grid-layout.js';
export function displayBounds(study, group, scope) {
  const bounds = new Box3().setFromObject(group);
  if (scope === 'array') {
    const g = receiverGridSpec(study);
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        bounds.expandByPoint(localToWorld(study, (x * g.width) / 2, (y * g.height) / 2, 0));
    for (const s of study.experimentSensors) bounds.expandByPoint(new Vector3(s.x, s.y, s.z));
    for (const plot of study.crops)
      for (const p of plotCorners(study, plot)) bounds.expandByPoint(p);
  }
  return bounds;
}
// Project the actual bounding-box corners into the camera basis instead of using
// the largest world axis as the orthographic height (which wasted screen space).
export function fitOrthographic(camera, bounds, aspect, padding = 1.13) {
  camera.updateMatrixWorld(true);
  let x = 0,
    y = 0;
  for (const a of [bounds.min.x, bounds.max.x])
    for (const b of [bounds.min.y, bounds.max.y])
      for (const c of [bounds.min.z, bounds.max.z]) {
        const p = new Vector3(a, b, c).applyMatrix4(camera.matrixWorldInverse);
        x = Math.max(x, Math.abs(p.x));
        y = Math.max(y, Math.abs(p.y));
      }
  const half = Math.max(y, x / aspect, 0.1) * padding;
  return { left: -half * aspect, right: half * aspect, top: half, bottom: -half };
}
export function cameraSnapshot(camera, controls, view, resetKey) {
  return {
    view,
    resetKey,
    position: camera.position.toArray(),
    quaternion: camera.quaternion.toArray(),
    up: camera.up.toArray(),
    target: controls.target.toArray(),
    zoom: camera.zoom,
    frustum: { left: camera.left, right: camera.right, top: camera.top, bottom: camera.bottom },
    near: camera.near,
    far: camera.far,
  };
}
export function restoreCamera(camera, controls, snapshot) {
  camera.position.fromArray(snapshot.position);
  camera.quaternion.fromArray(snapshot.quaternion);
  camera.up.fromArray(snapshot.up);
  camera.zoom = snapshot.zoom;
  camera.near = snapshot.near;
  camera.far = snapshot.far;
  Object.assign(camera, snapshot.frustum);
  controls.target.fromArray(snapshot.target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
export function receiverAtPoint(result, point) {
  if (!result?.grid) return null;
  const g = result.grid,
    a = (g.azimuth * Math.PI) / 180,
    x = -Math.cos(a) * point.x + Math.sin(a) * point.y,
    y = -Math.sin(a) * point.x - Math.cos(a) * point.y,
    i = Math.floor((x + g.width / 2) / g.dx),
    j = Math.floor((y + g.height / 2) / g.dy);
  return i < 0 || j < 0 || i >= g.nx || j >= g.ny
    ? null
    : { cell: result.cells[j * g.nx + i], index: j * g.nx + i };
}
