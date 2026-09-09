import {
  createInstancedSensorMarkers,
  createSliceHeatmap,
} from "@agrivoltaic/three-exporter";
import {
  importRadianceResults,
  inferSensorGridVolumes,
} from "@agrivoltaic/simulation-backend";
import { buildFullArrayExampleRequest } from "./full-array-example.js";

export function buildResultImportExample() {
  const request = buildFullArrayExampleRequest();
  const inferred = inferSensorGridVolumes(request.sceneExport.sceneManifest, {
    ...request.sensorConfig,
    dimensions: [4, 4, 4],
  });
  const grid = inferred.grids[0]!;

  const imported = importRadianceResults({
    exportPackageManifest: {
      exportPackageId: "example-pkg",
      sceneId: request.sceneExport.sceneManifest.sceneId,
      createdAt: new Date().toISOString(),
      sceneManifest: request.sceneExport.sceneManifest,
      sensorConfig: {
        ...request.sensorConfig,
        dimensions: [4, 4, 4],
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
      sky: request.sky,
      geometry: {
        files: [],
        combinedGeometryPath: request.sceneExport.sceneManifest.combinedGeometryPath,
        metadataPath: "geometry/scene-manifest.json",
        hash: request.sceneExport.sceneManifest.geometryHash,
      },
      materials: {
        jsonPath: "materials/materials.json",
        radPath: "materials/materials.rad",
      },
      sensors: {
        mode: request.sensorConfig.mode,
        tilingStrategy: request.sensorConfig.fullArrayTilingStrategy ?? "rowPairBayTiling",
        gridMetadataPath: "sensors/grids.json",
        pointFiles: [`sensors/${grid.gridId}.pts`],
        totalGridCount: 1,
        totalSensorCount: grid.sensors.length,
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
        geometryHash: request.sceneExport.sceneManifest.geometryHash,
        materialConfigHash: "example",
        notes: [],
      },
    },
    grids: [grid],
    resultFiles: [{
      fileName: `${grid.gridId}.res`,
      gridId: grid.gridId,
      content: Array.from({ length: grid.sensors.length }, (_, index) => `${180 + (index * 0.5)}`).join("\n"),
      format: "radianceScalar",
    }],
  });

  return {
    imported,
    points: createInstancedSensorMarkers(imported, { size: 0.08 }),
    slice: createSliceHeatmap(imported, { axis: "up", index: 1, cellOpacity: 0.55 }),
  };
}
