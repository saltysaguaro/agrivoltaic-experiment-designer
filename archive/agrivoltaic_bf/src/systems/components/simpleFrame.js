import * as THREE from "three";

export function createBoxBeam(width, height, depth, material) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  beam.name = "frame-beam";
  beam.userData.simulationKind = "beam";
  beam.castShadow = true;
  beam.receiveShadow = true;
  return beam;
}

export function createBeamBetween(start, end, thickness, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness, length), material);
  beam.name = "frame-beam";
  beam.userData.simulationKind = "beam";
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    direction.clone().normalize()
  );
  beam.castShadow = true;
  beam.receiveShadow = true;
  return beam;
}
