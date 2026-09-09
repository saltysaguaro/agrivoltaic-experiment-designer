import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(52, 1, 0.25, 1600);
  camera.position.set(18, 10, 16);
  return camera;
}
