import { Box3, Vector3 } from 'three';
import { fitOrthographic } from './camera.js';
export function hardwarePoints(group) {
  // A module uses its exact oriented box; larger assemblies use a bounded envelope.
  if (group.userData.scope === 'module') {
    const mesh = group.children.find((o) => o.userData.kind === 'module');
    mesh.geometry.computeBoundingBox();
    return corners(mesh.geometry.boundingBox).map((p) => p.applyMatrix4(mesh.matrixWorld));
  }
  return corners(new Box3().setFromObject(group));
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
