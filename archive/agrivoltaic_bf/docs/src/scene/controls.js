import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createSceneControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.minDistance = 5;
  controls.maxDistance = 1000;
  return controls;
}
