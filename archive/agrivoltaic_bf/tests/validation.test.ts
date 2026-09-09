import test from "node:test";
import assert from "node:assert/strict";
import {
  exportPackageRequestSchema,
  importedSimulationResultSchema,
} from "../packages/shared/src/index.js";
import { annualResultsDatasetSchema } from "../packages/shared/src/platform-schemas";

test("export package request schema accepts the Radiance package workflow shape", () => {
  const payload = {
    sceneExport: {
      sceneManifest: {
        sceneId: "scene",
        createdAt: "2026-03-14T00:00:00.000Z",
        source: "three.js",
        exporterVersion: "0.2.0",
        geometryFormat: "obj",
        selection: { mode: "taggedScene" },
        geometrySourceMode: "simulationMesh",
        combinedGeometryPath: "geometry/scene.obj",
        geometryHash: "hash",
        objects: [],
        assets: [],
      },
      files: [],
    },
    sensorConfig: {
      mode: "centerArrayGrid",
      boundsMode: "manual",
      verticalExtentMode: "customHeight",
      normalMode: "upward",
      explicitFrame: {
        origin: { x: 0, y: 0, z: 1 },
        eRow: { x: 1, y: 0, z: 0 },
        eCross: { x: 0, y: 1, z: 0 },
        eUp: { x: 0, y: 0, z: 1 },
      },
      explicitBounds: {
        center: { x: 0, y: 0, z: 1 },
        lengthRow: 10,
        lengthCross: 4,
        height: 2,
      },
      dimensions: [25, 25, 5],
      customHeight: 2,
    },
    sky: {
      latitude: 35,
      longitude: -106,
      timezone: "America/Phoenix",
      timestamp: "2026-03-14T18:00:00.000Z",
      dni: 800,
      dhi: 120,
    },
  };

  const parsed = exportPackageRequestSchema.parse(payload);
  assert.equal(parsed.sensorConfig.mode, "centerArrayGrid");
  assert.equal(parsed.sky.timezone, "America/Phoenix");
});

test("imported result schema accepts structured full-array results", () => {
  const payload = {
    simulationId: "sim-1",
    exportPackageId: "pkg-1",
    mode: "fullArrayGrid",
    tilingStrategy: "rowPairBayTiling",
    grids: [{
      gridId: "grid-1",
      arrayId: "array-a",
      rowPairId: "row-pair-a",
      rowIds: ["row-1", "row-2"],
      classifications: ["interior"],
      dimensions: [2, 2, 2],
      bounds: {
        center: { x: 0, y: 0, z: 1 },
        lengthRow: 2,
        lengthCross: 2,
        height: 2,
      },
      worldBounds: {
        min: { x: -1, y: -1, z: 0 },
        max: { x: 1, y: 1, z: 2 },
      },
      centroid: { x: 0, y: 0, z: 1 },
      sensors: [{
        id: "sensor-1",
        gridId: "grid-1",
        position: { x: 0, y: 0, z: 1 },
        localPosition: { x: 0, y: 0, z: 0 },
        normal: { x: 0, y: 0, z: 1 },
        indices: [0, 0, 0],
        normalized: [0.25, 0.25, 0.25],
        rowPairId: "row-pair-a",
        arrayId: "array-a",
      }],
      irradianceResults: [{
        sensorId: "sensor-1",
        gridId: "grid-1",
        Ee: 250,
        position: { x: 0, y: 0, z: 1 },
        normal: { x: 0, y: 0, z: 1 },
        indices: [0, 0, 0],
        normalized: [0.25, 0.25, 0.25],
      }],
      stats: {
        min: 250,
        max: 250,
        mean: 250,
        median: 250,
        p05: 250,
        p95: 250,
      },
      slices: {
        row: [],
        cross: [],
        up: [],
      },
    }],
    arrayStats: {
      gridCount: 1,
      sensorCount: 1,
      stats: {
        min: 250,
        max: 250,
        mean: 250,
        median: 250,
        p05: 250,
        p95: 250,
      },
    },
    classificationStats: [{
      classification: "interior",
      gridIds: ["grid-1"],
      sensorCount: 1,
      stats: {
        min: 250,
        max: 250,
        mean: 250,
        median: 250,
        p05: 250,
        p95: 250,
      },
    }],
    provenance: {
      sourceFiles: ["grid-1.res"],
      importedAt: "2026-03-14T00:00:00.000Z",
      parserNotes: [],
    },
  };

  const parsed = importedSimulationResultSchema.parse(payload);
  assert.equal(parsed.grids.length, 1);
  assert.equal(parsed.mode, "fullArrayGrid");
});

test("annual results dataset schema accepts central-grid aggregates without a bayId", () => {
  const parsed = annualResultsDatasetSchema.parse({
    job: {
      jobId: "job-1",
      projectName: "Central Grid Study",
      site: {
        address: "Tucson, Arizona, United States",
        label: "Tucson, Arizona, United States",
        latitude: 32.2226,
        longitude: -110.9747,
        timezone: "America/Phoenix",
        source: "fallback",
      },
      status: "completed",
      phase: "completed",
      progress: 1,
      gridMode: "centerArrayGrid",
      engine: "bifacial_radiance",
      createdAt: "2026-03-16T00:00:00.000Z",
      updatedAt: "2026-03-16T00:01:00.000Z",
      notes: [],
    },
    exportPackage: {
      exportPackageId: "pkg-1",
      analysis: {},
      manifest: {},
      grids: [],
    },
    weather: {
      source: "synthetic_fallback",
      site: {
        address: "Tucson, Arizona, United States",
        label: "Tucson, Arizona, United States",
        latitude: 32.2226,
        longitude: -110.9747,
        timezone: "America/Phoenix",
        source: "fallback",
      },
      retrievedAt: "2026-03-16T00:00:00.000Z",
      timezone: "America/Phoenix",
      records: 8760,
      annualGhiWhM2: 100,
      annualDniWhM2: 80,
      annualDhiWhM2: 20,
      monthlyGhiWhM2: Array(12).fill(1),
      monthlyDniWhM2: Array(12).fill(1),
      monthlyDhiWhM2: Array(12).fill(1),
      hourly: [],
    },
    dataResolution: "monthly_aggregate",
    monthlyAggregates: [{
      gridId: "grid-1",
      classification: ["interior"],
      dimensions: [25, 25, 5],
      rowPairId: "row-pair-1",
      bayId: null,
      sensors: [{
        sensorId: "sensor-1",
        gridId: "grid-1",
        position: { x: 0, y: 0, z: 0 },
        indices: [0, 0, 0],
        normalized: [0, 0, 0],
        heightAboveGroundM: 0,
        monthlyIrradianceWhM2: Array(12).fill(1),
      }],
    }],
    provenance: {
      engine: "bifacial_radiance",
      generatedAt: "2026-03-16T00:00:00.000Z",
      notes: [],
    },
  });

  assert.equal(parsed.monthlyAggregates[0]?.bayId, null);
});
