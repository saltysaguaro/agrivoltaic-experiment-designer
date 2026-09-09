import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
// @ts-ignore JS modules under test.
import { sanitizeState } from "../src/app/state.js";
// @ts-ignore JS modules under test.
import { SYSTEM_PRESETS } from "../src/utils/constants.js";
// @ts-ignore JS modules under test.
import { buildSystemAssembly } from "../src/systems/systemFactory.js";
// @ts-ignore JS modules under test.
import { getSystemRotationDeg } from "../src/utils/orientation.js";
// @ts-ignore JS modules under test.
import { createLightRig, updateSun } from "../src/scene/lights.js";
// @ts-ignore JS modules under test.
import { computeDirectionDebugState } from "../src/scene/directionDebugOverlay.js";

function testMaterials() {
  const material = new THREE.MeshStandardMaterial();
  return {
    panel: material,
    frame: material,
    steel: material,
    torqueTube: material,
    bufferPrimary: new THREE.LineBasicMaterial(),
    bufferSecondary: new THREE.LineBasicMaterial(),
  };
}

function buildWorldAssembly(stateInput: Record<string, unknown>) {
  const state = sanitizeState(stateInput);
  const assembly = buildSystemAssembly(state, testMaterials());
  const root = new THREE.Group();
  root.add(assembly.group);
  root.rotation.y = THREE.MathUtils.degToRad(getSystemRotationDeg(state));
  root.updateWorldMatrix(true, true);
  return { root, sceneSummary: { arrayW: assembly.layout.arrayW, arrayD: assembly.layout.arrayD } };
}

test("direction debug overlay keeps winter morning sample shadows northwest in world space", () => {
  const scene = new THREE.Scene();
  const lightRig = createLightRig(scene);
  updateSun(lightRig, {
    sunAz: 127.7,
    sunEl: 11.2,
  });

  const { root, sceneSummary } = buildWorldAssembly({
    ...SYSTEM_PRESETS.fixed,
    systemType: "fixed",
  });

  const debug = computeDirectionDebugState({
    sceneSummary,
    systemRoot: root,
    sunPosition: lightRig.sun.position.clone(),
  });

  assert.ok(debug.modulePoint, "expected a representative module point for debug tracing");
  assert.ok(debug.shadowHit, "expected the sample module point to intersect the ground");
  assert.ok(debug.horizontalSun, "expected a horizontal sun direction");
  assert.ok(debug.horizontalShadow, "expected a horizontal shadow direction");

  assert.ok(debug.horizontalSun!.x > 0, "winter morning sun should remain east in world space");
  assert.ok(debug.horizontalSun!.z < 0, "winter morning sun should remain south in world space");
  assert.ok(debug.horizontalShadow!.x < 0, "winter morning shadow should remain west in world space");
  assert.ok(debug.horizontalShadow!.z > 0, "winter morning shadow should remain north in world space");

  const sampleShadowDelta = debug.shadowHit!.clone().sub(debug.modulePoint!);
  assert.ok(sampleShadowDelta.x < 0, "sample shadow hit should land west of the module point");
  assert.ok(sampleShadowDelta.z > 0, "sample shadow hit should land north of the module point");
});
