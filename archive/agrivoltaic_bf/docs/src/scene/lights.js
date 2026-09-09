import * as THREE from "three";
import { degToRad } from "../utils/math.js";

function smoothStep(min, max, value) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const t = (value - min) / (max - min);
  return t * t * (3 - (2 * t));
}

export function createLightRig(scene) {
  const hemi = new THREE.HemisphereLight(0xfdf8ef, 0x7b9070, 0.72);
  hemi.position.set(0, 140, 0);
  hemi.name = "scene-hemi-light";
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfffaf0, 1.2);
  sun.name = "scene-sun";
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.00012;
  sun.shadow.normalBias = 0.032;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 800;
  scene.add(sun);
  sun.target.name = "scene-sun-target";
  scene.add(sun.target);

  return { hemi, sun };
}

export function updateSun(lightRig, state) {
  const elevationDeg = Number(state.sunEl ?? 35);
  const azimuth = degToRad(state.sunAz);
  const elevation = degToRad(elevationDeg);
  const radius = 260;
  const eastWestScale = state?.previewMirrorEastWest ? -1 : 1;

  // The public preview can opt into an east/west display compensation so the
  // rendered sun path matches the intended cardinal reading without touching
  // export geometry or the Radiance modeling pipeline.
  const x = eastWestScale * radius * Math.cos(elevation) * Math.sin(azimuth);
  const y = radius * Math.sin(elevation);
  const z = radius * Math.cos(elevation) * Math.cos(azimuth);

  lightRig.sun.position.set(x, y, z);
  lightRig.sun.target.position.set(0, 0, 0);
  lightRig.sun.target.updateMatrixWorld();

  // Fade direct light near and below the horizon so nighttime selections do not cast daytime shadows.
  const directFactor = smoothStep(-6, 2, elevationDeg);
  const ambientFactor = smoothStep(-12, 10, elevationDeg);
  lightRig.sun.intensity = 1.2 * directFactor;
  lightRig.sun.visible = directFactor > 0.001;
  lightRig.sun.castShadow = directFactor > 0.08;
  lightRig.hemi.intensity = 0.18 + (0.54 * ambientFactor);
}
