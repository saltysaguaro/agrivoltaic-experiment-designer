import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  attachSimulationLOD,
  attachSimulationMetadata,
  buildSceneExportBundle,
  buildSelectionScopeFromObjects,
  collectSelectedSimulationObjects,
  ensureStableSimulationId,
  resolveSimulationMesh,
} from "../packages/three-exporter/src/index.js";

test("tagging helpers support stable IDs, LOD resolution, and scoped selection", () => {
  const root = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1), new THREE.MeshBasicMaterial());
  panel.name = "Panel A";
  root.add(panel);

  attachSimulationMetadata(panel, {
    includeInSimulation: true,
    simulationRole: "pv_module",
    radianceMaterial: "pv_glass",
    rowId: "row-01",
    arrayId: "array-a",
    tags: ["test"],
  });

  const coarse = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 1), new THREE.MeshBasicMaterial());
  attachSimulationLOD(panel, "coarse", coarse);
  attachSimulationMetadata(panel, { simulationLOD: "coarse" });

  const stableId = ensureStableSimulationId(panel);
  assert.equal(typeof stableId, "string");
  assert.equal(resolveSimulationMesh(panel), coarse);

  const scope = buildSelectionScopeFromObjects([panel]);
  const selected = collectSelectedSimulationObjects(root, scope);
  assert.equal(selected.length, 1);
  assert.equal(selected[0]?.stableId, stableId);
});

test("scene export bundle writes combined and per-object OBJ payloads", () => {
  const root = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1), new THREE.MeshBasicMaterial());
  panel.name = "Module 1";
  root.add(panel);

  attachSimulationMetadata(panel, {
    includeInSimulation: true,
    simulationRole: "pv_module",
    radianceMaterial: "pv_glass",
    rowId: "row-01",
    arrayId: "array-a",
    tags: [],
  });

  const bundle = buildSceneExportBundle(root, {
    sceneId: "bundle-scene",
    geometrySourceMode: "visualMesh",
  });

  assert.equal(bundle.sceneManifest.objects.length, 1);
  assert.equal(bundle.sceneManifest.assets.length, 1);
  assert.ok(bundle.files.some((file) => file.relativePath === "geometry/scene.obj"));
  assert.ok(bundle.files.some((file) => file.relativePath.includes("geometry/objects/")));
});
