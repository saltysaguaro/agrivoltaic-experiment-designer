import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  attachSimulationMetadata,
  collectSelectedSimulationObjects,
  getSimulationMetadata,
} from "../packages/three-exporter/src/index.js";
// @ts-expect-error Browser-side JS module is exercised here via runtime test coverage.
import { tagSceneForAnnualSimulation } from "../src/platform/sceneExport.js";

test("annual scene tagging excludes crop beds from simulation export", () => {
  const scene = new THREE.Scene();

  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial());
  terrain.name = "Terrain";
  terrain.userData.simulationKind = "inner_terrain";
  scene.add(terrain);

  const module = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1), new THREE.MeshBasicMaterial());
  module.name = "Module";
  module.userData.simulationKind = "module_glass";
  scene.add(module);

  const cropBed = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 8), new THREE.MeshBasicMaterial());
  cropBed.name = "Crop Bed";
  cropBed.userData.simulationKind = "crop_bed";
  attachSimulationMetadata(cropBed, {
    includeInSimulation: true,
    simulationRole: "crop_zone",
    radianceMaterial: "mulch",
    tags: ["stale"],
  });
  scene.add(cropBed);

  const sceneApp = {
    getSimulationContext() {
      return {
        scene,
        sceneSummary: { layout: { anchors: [] } },
      };
    },
  };

  tagSceneForAnnualSimulation(sceneApp);

  const selected = collectSelectedSimulationObjects(scene, { mode: "taggedScene" });
  assert.deepEqual(
    selected.map((entry) => entry.object.name).sort(),
    ["Module", "Terrain"],
  );

  const cropMetadata = getSimulationMetadata(cropBed);
  assert.equal(cropMetadata?.includeInSimulation, false);
  assert.equal(cropMetadata?.simulationRole, "ignore");
});
