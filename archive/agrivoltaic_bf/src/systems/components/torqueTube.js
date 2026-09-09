import * as THREE from "three";

export function createTorqueTube(length, radius, material) {
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 18), material);
  tube.name = "torque-tube";
  tube.userData.simulationKind = "torque_tube";
  tube.rotation.x = Math.PI / 2;
  tube.castShadow = true;
  tube.receiveShadow = true;
  return tube;
}
