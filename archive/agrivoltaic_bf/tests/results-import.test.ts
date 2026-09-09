import test from "node:test";
import assert from "node:assert/strict";
import type { SceneExportManifest } from "../packages/shared/src/index.js";
import { inferSensorGridVolumes } from "../packages/simulation-backend/src/sensors/inference.js";
import { importRadianceResults } from "../packages/simulation-backend/src/results/parser.js";

function makeManifest(): SceneExportManifest {
  return {
    sceneId: "results-scene",
    createdAt: "2026-03-14T00:00:00.000Z",
    source: "three.js",
    exporterVersion: "0.2.0",
    geometryFormat: "obj",
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
    combinedGeometryPath: "geometry/scene.obj",
    geometryHash: "hash",
    objects: [
      {
        id: "mod-1",
        stableId: "mod-1",
        name: "mod-1",
        childrenStableIds: [],
        transform: {
          position: { x: -1, y: -2, z: 2.4 },
          rotationEuler: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, 2.4, 1],
        },
        bounds: { min: { x: -4, y: -2.5, z: 2.0 }, max: { x: 2, y: -1.5, z: 2.8 } },
        radianceMaterial: "pv_glass",
        simulationRole: "pv_module",
        metadata: {
          includeInSimulation: true,
          simulationRole: "pv_module",
          radianceMaterial: "pv_glass",
          castShadow: true,
          receiveShadowForAnalysis: true,
          rowId: "row-a",
          arrayId: "array-a",
          bayId: "bay-a",
          tags: [],
        },
      },
      {
        id: "mod-2",
        stableId: "mod-2",
        name: "mod-2",
        childrenStableIds: [],
        transform: {
          position: { x: -1, y: 2, z: 2.4 },
          rotationEuler: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, 2, 2.4, 1],
        },
        bounds: { min: { x: -4, y: 1.5, z: 2.0 }, max: { x: 2, y: 2.5, z: 2.8 } },
        radianceMaterial: "pv_glass",
        simulationRole: "pv_module",
        metadata: {
          includeInSimulation: true,
          simulationRole: "pv_module",
          radianceMaterial: "pv_glass",
          castShadow: true,
          receiveShadowForAnalysis: true,
          rowId: "row-b",
          arrayId: "array-a",
          bayId: "bay-a",
          tags: [],
        },
      },
    ],
    assets: [],
  };
}

test("Radiance result importer maps scalar files back onto sensor positions", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "centerArrayGrid",
    dimensions: [2, 2, 2],
  });

  const grid = inferred.grids[0]!;
  const result = importRadianceResults({
    exportPackageManifest: {
      exportPackageId: "pkg-1",
      sceneId: "results-scene",
      createdAt: "2026-03-14T00:00:00.000Z",
      sceneManifest: makeManifest(),
      sensorConfig: {
        mode: "centerArrayGrid",
        dimensions: [2, 2, 2],
        boundsMode: "autoInfer",
        verticalExtentMode: "groundToModuleUnderside",
        normalMode: "upward",
        fullArrayTilingStrategy: "rowPairSingleVolume",
        bayLengthMode: "singleBay",
        rowParallelToleranceDeg: 5,
      },
      simulationOptions: {
        conversionStrategy: "obj2mesh",
        outputMode: "packageOnly",
        ambientBounces: 2,
        ambientDivisions: 2048,
        ambientResolution: 256,
        ambientAccuracy: 0.15,
        limitWeight: 0.0001,
      },
      sky: {
        latitude: 35,
        longitude: -106,
        timezone: "America/Phoenix",
        timestamp: "2026-03-14T18:00:00.000Z",
        dni: 800,
        dhi: 120,
      },
      geometry: {
        files: [],
        combinedGeometryPath: "geometry/scene.obj",
        metadataPath: "geometry/scene-manifest.json",
        hash: "hash",
      },
      materials: {
        jsonPath: "materials/materials.json",
        radPath: "materials/materials.rad",
      },
      sensors: {
        mode: "centerArrayGrid",
        tilingStrategy: "rowPairSingleVolume",
        gridMetadataPath: "sensors/grids.json",
        pointFiles: [`sensors/${grid.gridId}.pts`],
        totalGridCount: 1,
        totalSensorCount: 8,
      },
      skyFiles: {
        jsonPath: "sky/sky-config.json",
        shellScriptPath: "sky/generate-sky.sh",
        plannedRadPath: "sky/sky.rad",
      },
      radiancePlan: {
        planPath: "radiance/plan.json",
        shellScriptPath: "radiance/run-radiance.sh",
        commands: [],
      },
      results: {
        directory: "results",
        parsedResultPath: "results/imported-results.json",
      },
      provenance: {
        exporterVersion: "0.2.0",
        backendVersion: "0.2.0",
        geometryHash: "hash",
        materialConfigHash: "hash",
        notes: [],
      },
    },
    grids: inferred.grids,
    resultFiles: [{
      fileName: `${grid.gridId}.res`,
      format: "radianceScalar",
      content: "100\n110\n120\n130\n140\n150\n160\n170\n",
    }],
  });

  assert.equal(result.grids.length, 1);
  assert.equal(result.grids[0]?.irradianceResults.length, 8);
  assert.equal(result.arrayStats.stats.mean, 135);
  assert.ok(result.classificationStats.length >= 1);
});

test("Radiance result importer can split one file across full-array grids and summarize edge effects", () => {
  const objects = [];
  const rowYs = [-4.5, -1.5, 1.5, 4.5];
  const baySpans = [[-12, -6], [-4, 2], [4, 10]] as const;
  for (const [rowIndex, rowY] of rowYs.entries()) {
    for (const [bayIndex, [xMin, xMax]] of baySpans.entries()) {
      objects.push({
        id: `row${rowIndex + 1}-bay${bayIndex + 1}`,
        stableId: `row${rowIndex + 1}-bay${bayIndex + 1}`,
        name: `row${rowIndex + 1}-bay${bayIndex + 1}`,
        childrenStableIds: [],
        transform: {
          position: { x: (xMin + xMax) * 0.5, y: rowY, z: 2.4 },
          rotationEuler: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, (xMin + xMax) * 0.5, rowY, 2.4, 1],
        },
        bounds: { min: { x: xMin, y: rowY - 0.5, z: 2.0 }, max: { x: xMax, y: rowY + 0.5, z: 2.8 } },
        radianceMaterial: "pv_glass",
        simulationRole: "pv_module" as const,
        metadata: {
          includeInSimulation: true,
          simulationRole: "pv_module" as const,
          radianceMaterial: "pv_glass",
          castShadow: true,
          receiveShadowForAnalysis: true,
          rowId: `row-${rowIndex + 1}`,
          arrayId: "array-a",
          bayId: `bay-${bayIndex + 1}`,
          tags: [],
        },
      });
    }
  }

  const manifest: SceneExportManifest = {
    sceneId: "full-array-results",
    createdAt: "2026-03-14T00:00:00.000Z",
    source: "three.js",
    exporterVersion: "0.2.0",
    geometryFormat: "obj",
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
    combinedGeometryPath: "geometry/scene.obj",
    geometryHash: "hash-full-array",
    objects,
    assets: [],
  };

  const inferred = inferSensorGridVolumes(manifest, {
    mode: "fullArrayGrid",
    dimensions: [1, 1, 1],
    fullArrayTilingStrategy: "rowPairSingleVolume",
    bayLengthMode: "singleBay",
  });
  const sequentialValues = inferred.grids.flatMap((grid, index) => (
    Array.from({ length: grid.sensors.length }, () => 100 + (index * 10))
  ));

  const result = importRadianceResults({
    exportPackageManifest: {
      exportPackageId: "pkg-2",
      sceneId: "full-array-results",
      createdAt: "2026-03-14T00:00:00.000Z",
      sceneManifest: manifest,
      sensorConfig: {
        mode: "fullArrayGrid",
        dimensions: [1, 1, 1],
        boundsMode: "autoInfer",
        verticalExtentMode: "groundToModuleUnderside",
        normalMode: "upward",
        fullArrayTilingStrategy: "rowPairBayTiling",
        bayLengthMode: "tableSpanDerived",
        rowParallelToleranceDeg: 5,
      },
      simulationOptions: {
        conversionStrategy: "obj2mesh",
        outputMode: "packageOnly",
        ambientBounces: 2,
        ambientDivisions: 2048,
        ambientResolution: 256,
        ambientAccuracy: 0.15,
        limitWeight: 0.0001,
      },
      sky: {
        latitude: 35,
        longitude: -106,
        timezone: "America/Phoenix",
        timestamp: "2026-03-14T18:00:00.000Z",
        dni: 800,
        dhi: 120,
      },
      geometry: {
        files: [],
        combinedGeometryPath: "geometry/scene.obj",
        metadataPath: "geometry/scene-manifest.json",
        hash: "hash",
      },
      materials: {
        jsonPath: "materials/materials.json",
        radPath: "materials/materials.rad",
      },
      sensors: {
        mode: "fullArrayGrid",
        tilingStrategy: "rowPairSingleVolume",
        gridMetadataPath: "sensors/grids.json",
        pointFiles: inferred.grids.map((grid) => `sensors/${grid.gridId}.pts`),
        totalGridCount: inferred.grids.length,
        totalSensorCount: inferred.grids.length,
      },
      skyFiles: {
        jsonPath: "sky/sky-config.json",
        shellScriptPath: "sky/generate-sky.sh",
        plannedRadPath: "sky/sky.rad",
      },
      radiancePlan: {
        planPath: "radiance/plan.json",
        shellScriptPath: "radiance/run-radiance.sh",
        commands: [],
      },
      results: {
        directory: "results",
      },
      provenance: {
        exporterVersion: "0.2.0",
        backendVersion: "0.2.0",
        geometryHash: "hash",
        materialConfigHash: "hash",
        notes: [],
      },
    },
    grids: inferred.grids,
    resultFiles: [{
      fileName: "all-grids.res",
      format: "radianceScalar",
      content: `${sequentialValues.join("\n")}\n`,
    }],
  });

  assert.equal(result.grids.length, 3);
  assert.equal(result.arrayStats.stats.mean, 110);
  assert.equal(result.interiorStats?.stats.mean, 110);
  assert.equal(result.edgeStats?.stats.mean, 110);
  assert.equal(result.arrayStats.edgeInteriorDifference, 0);
});
