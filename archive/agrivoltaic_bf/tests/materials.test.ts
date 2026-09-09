import test from "node:test";
import assert from "node:assert/strict";
import { defaultMaterialLibrary } from "../packages/simulation-backend/src/config/material-library.js";
import { buildMaterialFile, validateManifestMaterials } from "../packages/simulation-backend/src/materials/material-resolver.js";

test("material library emits Radiance definitions", () => {
  const text = buildMaterialFile(defaultMaterialLibrary.slice(0, 2));
  assert.match(text, /void glass pv_glass/);
  assert.match(text, /void metal pv_frame_metal/);
});

test("manifest validation reports unknown materials", () => {
  const missing = validateManifestMaterials({
    sceneId: "x",
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "three.js",
    exporterVersion: "0.1.0",
    geometryFormat: "obj",
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
    combinedGeometryPath: "geometry/scene.obj",
    geometryHash: "hash",
    objects: [{
      id: "1",
      stableId: "1",
      name: "bad",
      childrenStableIds: [],
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotationEuler: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        matrixWorld: Array(16).fill(0),
      },
      bounds: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
      radianceMaterial: "not-real",
      simulationRole: "obstacle",
      metadata: {
        includeInSimulation: true,
        simulationRole: "obstacle",
        radianceMaterial: "not-real",
        castShadow: true,
        receiveShadowForAnalysis: true,
        tags: [],
      },
    }],
    assets: [],
  }, defaultMaterialLibrary);

  assert.deepEqual(missing, ["not-real"]);
});
