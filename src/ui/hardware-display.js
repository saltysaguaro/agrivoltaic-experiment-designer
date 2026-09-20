import * as THREE from 'three';
// Display-only batching; scientific geometry remains the unbatched domain output.
export function batchHardware(group, points) {
  if (group.children.length <= 200) return;
  group.userData.hardwarePoints = points;
  group.userData.references = ['module', 'post']
    .map((kind) => group.children.find((o) => o.userData.kind === kind))
    .filter(Boolean);
  const batches = new Map();
  for (const o of [...group.children]) {
    const key = `${o.userData.kind}:${o.geometry.uuid}`;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(o);
    group.remove(o);
  }
  for (const objects of batches.values()) {
    const first = objects[0],
      mesh = new THREE.InstancedMesh(first.geometry, first.material, objects.length);
    mesh.userData.kind = first.userData.kind;
    objects.forEach((o, i) => mesh.setMatrixAt(i, o.matrixWorld));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  group.userData.instanced = true;
  group.updateMatrixWorld(true);
}
