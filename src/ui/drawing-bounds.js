import { Vector3 } from 'three';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
import { fitOrthographic } from './camera.js';
export function hardwarePoints(group) {
  if (group.userData.hardwarePoints) return group.userData.hardwarePoints;
  // Project the true hardware hull. Even an array-aligned bounding box invents
  // empty corners above a tilted panel and can force dimensions below the ground.
  if (group.userData.scope === 'module') {
    const mesh = group.children.find((o) => o.userData.kind === 'module');
    mesh.geometry.computeBoundingBox();
    return corners(mesh.geometry.boundingBox).map((p) => p.applyMatrix4(mesh.matrixWorld));
  }
  let points = [];
  const compact = () => {
    if (points.length <= 8) return;
    const hull = new ConvexHull().setFromPoints(points),
      vertices = new Set();
    for (const face of hull.faces) {
      let edge = face.edge;
      do {
        vertices.add(edge.head().point);
        edge = edge.next;
      } while (edge !== face.edge);
    }
    points = [...vertices];
  };
  for (const mesh of group.children.filter((o) => o.isMesh)) {
    mesh.geometry.computeBoundingBox();
    points.push(...corners(mesh.geometry.boundingBox).map((p) => p.applyMatrix4(mesh.matrixWorld)));
    // The hull of accumulated hulls is exact, and keeps large arrays bounded.
    if (points.length >= 2048) compact();
  }
  compact();
  return points;
}
function corners(b) {
  const ps = [];
  for (const x of [b.min.x, b.max.x])
    for (const y of [b.min.y, b.max.y])
      for (const z of [b.min.z, b.max.z]) ps.push(new Vector3(x, y, z));
  return ps;
}
export function fitDrawing(camera, bounds, width, height, withCallouts = true) {
  const marginX = withCallouts ? Math.min(105, width * 0.25) : 25;
  const marginY = withCallouts ? 80 : 35;
  const fit = fitOrthographic(camera, bounds, width / Math.max(1, height), 1);
  const factor = Math.max(
    width / Math.max(40, width - 2 * marginX),
    height / Math.max(40, height - 2 * marginY),
  );
  return Object.fromEntries(Object.entries(fit).map(([k, v]) => [k, v * factor]));
}
