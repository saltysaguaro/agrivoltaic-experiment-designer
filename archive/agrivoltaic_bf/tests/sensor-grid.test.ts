import test from "node:test";
import assert from "node:assert/strict";
import type { SceneExportManifest } from "../packages/shared/src/index.js";
import { inferFullArrayAnalysis } from "../packages/simulation-backend/src/array-analysis/inference.js";
import { inferSensorGridVolumes } from "../packages/simulation-backend/src/sensors/inference.js";

function moduleRecord(input: {
  id: string;
  rowId: string;
  arrayId: string;
  bayId: string;
  xMin: number;
  xMax: number;
  yCenter: number;
  zMin?: number;
  zMax?: number;
}) {
  const zMin = input.zMin ?? 2.1;
  const zMax = input.zMax ?? 2.8;
  return {
    id: input.id,
    stableId: input.id,
    name: input.id,
    childrenStableIds: [],
    transform: {
      position: {
        x: (input.xMin + input.xMax) * 0.5,
        y: input.yCenter,
        z: (zMin + zMax) * 0.5,
      },
      rotationEuler: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    },
    bounds: {
      min: { x: input.xMin, y: input.yCenter - 0.55, z: zMin },
      max: { x: input.xMax, y: input.yCenter + 0.55, z: zMax },
    },
    radianceMaterial: "pv_glass",
    simulationRole: "pv_module" as const,
    metadata: {
      includeInSimulation: true,
      simulationRole: "pv_module" as const,
      radianceMaterial: "pv_glass",
      castShadow: true,
      receiveShadowForAnalysis: true,
      rowId: input.rowId,
      arrayId: input.arrayId,
      bayId: input.bayId,
      tags: [],
    },
  };
}

function terrainRecord() {
  return {
    id: "terrain",
    stableId: "terrain",
    name: "terrain",
    childrenStableIds: [],
    transform: {
      position: { x: 0, y: 0, z: -0.05 },
      rotationEuler: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.05, 1],
    },
    bounds: {
      min: { x: -20, y: -8, z: -0.1 },
      max: { x: 20, y: 8, z: 0 },
    },
    radianceMaterial: "soil_dry",
    simulationRole: "terrain" as const,
    metadata: {
      includeInSimulation: true,
      simulationRole: "terrain" as const,
      radianceMaterial: "soil_dry",
      castShadow: false,
      receiveShadowForAnalysis: true,
      arrayId: "array-a",
      tags: [],
    },
  };
}

function makeManifest(): SceneExportManifest {
  const objects = [
    moduleRecord({ id: "r1b1", rowId: "row-01", arrayId: "array-a", bayId: "bay-01", xMin: -12, xMax: -6, yCenter: -4.5 }),
    moduleRecord({ id: "r1b2", rowId: "row-01", arrayId: "array-a", bayId: "bay-02", xMin: -4, xMax: 2, yCenter: -4.5 }),
    moduleRecord({ id: "r1b3", rowId: "row-01", arrayId: "array-a", bayId: "bay-03", xMin: 4, xMax: 10, yCenter: -4.5 }),
    moduleRecord({ id: "r2b1", rowId: "row-02", arrayId: "array-a", bayId: "bay-01", xMin: -12, xMax: -6, yCenter: -1.5 }),
    moduleRecord({ id: "r2b2", rowId: "row-02", arrayId: "array-a", bayId: "bay-02", xMin: -4, xMax: 2, yCenter: -1.5 }),
    moduleRecord({ id: "r2b3", rowId: "row-02", arrayId: "array-a", bayId: "bay-03", xMin: 4, xMax: 10, yCenter: -1.5 }),
    moduleRecord({ id: "r3b1", rowId: "row-03", arrayId: "array-a", bayId: "bay-01", xMin: -12, xMax: -6, yCenter: 1.5 }),
    moduleRecord({ id: "r3b2", rowId: "row-03", arrayId: "array-a", bayId: "bay-02", xMin: -4, xMax: 2, yCenter: 1.5 }),
    moduleRecord({ id: "r3b3", rowId: "row-03", arrayId: "array-a", bayId: "bay-03", xMin: 4, xMax: 10, yCenter: 1.5 }),
    moduleRecord({ id: "r4b1", rowId: "row-04", arrayId: "array-a", bayId: "bay-01", xMin: -12, xMax: -6, yCenter: 4.5 }),
    moduleRecord({ id: "r4b2", rowId: "row-04", arrayId: "array-a", bayId: "bay-02", xMin: -4, xMax: 2, yCenter: 4.5 }),
    moduleRecord({ id: "r4b3", rowId: "row-04", arrayId: "array-a", bayId: "bay-03", xMin: 4, xMax: 10, yCenter: 4.5 }),
    terrainRecord(),
  ];

  return {
    sceneId: "sensor-grid-scene",
    createdAt: "2026-03-14T00:00:00.000Z",
    source: "three.js",
    exporterVersion: "0.2.0",
    geometryFormat: "obj",
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
    combinedGeometryPath: "geometry/scene.obj",
    geometryHash: "hash-scene",
    objects,
    assets: [],
  };
}

function makePortraitWeightedManifest(): SceneExportManifest {
  const objects = [
    moduleRecord({ id: "p-r1b1", rowId: "row-01", arrayId: "array-a", bayId: "bay-01", xMin: -3.2, xMax: -2.0, yCenter: -4.5 }),
    moduleRecord({ id: "p-r1b2", rowId: "row-01", arrayId: "array-a", bayId: "bay-02", xMin: -0.6, xMax: 0.6, yCenter: -4.5 }),
    moduleRecord({ id: "p-r1b3", rowId: "row-01", arrayId: "array-a", bayId: "bay-03", xMin: 2.0, xMax: 3.2, yCenter: -4.5 }),
    moduleRecord({ id: "p-r2b1", rowId: "row-02", arrayId: "array-a", bayId: "bay-01", xMin: -3.2, xMax: -2.0, yCenter: 0 }),
    moduleRecord({ id: "p-r2b2", rowId: "row-02", arrayId: "array-a", bayId: "bay-02", xMin: -0.6, xMax: 0.6, yCenter: 0 }),
    moduleRecord({ id: "p-r2b3", rowId: "row-02", arrayId: "array-a", bayId: "bay-03", xMin: 2.0, xMax: 3.2, yCenter: 0 }),
    moduleRecord({ id: "p-r3b1", rowId: "row-03", arrayId: "array-a", bayId: "bay-01", xMin: -3.2, xMax: -2.0, yCenter: 4.5 }),
    moduleRecord({ id: "p-r3b2", rowId: "row-03", arrayId: "array-a", bayId: "bay-02", xMin: -0.6, xMax: 0.6, yCenter: 4.5 }),
    moduleRecord({ id: "p-r3b3", rowId: "row-03", arrayId: "array-a", bayId: "bay-03", xMin: 2.0, xMax: 3.2, yCenter: 4.5 }),
  ].map((record) => ({
    ...record,
    bounds: {
      min: { ...record.bounds.min, y: record.transform.position.y - 1.05 },
      max: { ...record.bounds.max, y: record.transform.position.y + 1.05 },
    },
  }));

  return {
    sceneId: "portrait-weighted-scene",
    createdAt: "2026-03-15T00:00:00.000Z",
    source: "three.js",
    exporterVersion: "0.2.0",
    geometryFormat: "obj",
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
    combinedGeometryPath: "geometry/scene.obj",
    geometryHash: "hash-portrait-weighted",
    objects,
    assets: [],
  };
}

test("inferFullArrayAnalysis builds row pairs and explicit bays", () => {
  const analysis = inferFullArrayAnalysis(makeManifest(), {
    mode: "fullArrayGrid",
    fullArrayTilingStrategy: "rowPairBayTiling",
  });

  assert.equal(analysis.arrays.length, 1);
  assert.equal(analysis.rows.length, 4);
  assert.equal(analysis.rowPairs.length, 3);
  assert.equal(analysis.bays.length, 9);
  assert.equal(analysis.bays[0]?.rowIds[0], "row-01");
  assert.equal(analysis.bays.at(-1)?.rowIds[1], "row-04");
});

test("inferFullArrayAnalysis uses explicit row grouping before module aspect-ratio votes", () => {
  const analysis = inferFullArrayAnalysis(makePortraitWeightedManifest(), {
    mode: "centerArrayGrid",
    rowParallelToleranceDeg: 5,
  });

  assert.equal(analysis.rows.length, 3);
  assert.ok(Math.abs(analysis.arrays[0]!.localFrame.eRow.x) > 0.9);
  assert.ok(Math.abs(analysis.arrays[0]!.localFrame.eCross.y) > 0.9);
});

test("centerArrayGrid selects a representative interior 25x25x5 sampling lattice", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "centerArrayGrid",
    dimensions: [25, 25, 5],
    fullArrayTilingStrategy: "rowPairSingleVolume",
  });

  assert.equal(inferred.grids.length, 1);
  assert.equal(inferred.analysis.representativeGridId, inferred.grids[0]?.gridId);
  assert.ok(inferred.grids[0]?.classifications.includes("interior"));
  assert.equal(inferred.grids[0]?.sensors.length, 3125);
  assert.deepEqual(inferred.grids[0]?.sensors[0]?.indices, [0, 0, 0]);
  assert.deepEqual(inferred.grids[0]?.sensors.at(-1)?.indices, [24, 24, 4]);
  assert.equal(inferred.grids[0]?.worldBounds.min.z, 0);
  assert.equal(inferred.grids[0]?.sensors[0]?.position.z, 0);
});

test("centralRowGrid extends the representative row pair using the same base spacing", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "centralRowGrid",
    dimensions: [25, 25, 5],
  });

  assert.equal(inferred.grids.length, 1);
  assert.equal(inferred.grids[0]?.dimensions[1], 25);
  assert.equal(inferred.grids[0]?.dimensions[2], 5);
  assert.ok((inferred.grids[0]?.dimensions[0] ?? 0) >= 25);
});

test("fullArrayGrid spans each adjacent row pair and keeps row spacing close to cross spacing", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "fullArrayGrid",
    dimensions: [25, 25, 5],
    fullArrayTilingStrategy: "rowPairSingleVolume",
  });

  assert.equal(inferred.grids.length, 3);
  const grid = inferred.grids.find((entry) => entry.classifications.includes("interior"));
  assert.ok(grid);
  const alongStart = grid!.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 0);
  const alongNext = grid!.sensors.find((sensor) => sensor.indices[0] === 1 && sensor.indices[1] === 0 && sensor.indices[2] === 0);
  const crossNext = grid!.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 1 && sensor.indices[2] === 0);
  const heightTop = grid!.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 4);

  const alongStep = Math.abs((alongNext?.position.x ?? 0) - (alongStart?.position.x ?? 0));
  const crossStep = Math.abs((crossNext?.position.y ?? 0) - (alongStart?.position.y ?? 0));
  const heightRange = Math.abs((heightTop?.position.z ?? 0) - (alongStart?.position.z ?? 0));

  assert.ok(Math.abs(alongStep - crossStep) < 0.1);
  assert.equal(Number(heightRange.toFixed(6)), Number(grid!.bounds.height.toFixed(6)));
});

test("uniform fullArrayGrid spans the full array footprint and optional farming buffer at row-pitch spacing", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "fullArrayGrid",
    dimensions: [10, 10, 3],
    fullArrayTilingStrategy: "uniformArrayGrid",
  });
  const padded = inferSensorGridVolumes(makeManifest(), {
    mode: "fullArrayGrid",
    dimensions: [10, 10, 3],
    fullArrayTilingStrategy: "uniformArrayGrid",
    margins: {
      rowPadding: 2,
      outerRowPadding: 2,
    },
  });

  assert.equal(inferred.grids.length, 1);
  const grid = inferred.grids[0]!;
  assert.equal(grid.rowIds[0], "row-01");
  assert.equal(grid.rowIds[1], "row-04");

  const first = grid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 0)!;
  const second = grid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 1 && sensor.indices[2] === 0)!;
  const last = grid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === grid.dimensions[1] - 1 && sensor.indices[2] === 0)!;
  const paddedGrid = padded.grids[0]!;
  const paddedFirst = paddedGrid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 0)!;
  const paddedLast = paddedGrid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === paddedGrid.dimensions[1] - 1 && sensor.indices[2] === 0)!;
  const crossStep = second.position.y - first.position.y;
  const firstGapCount = grid.sensors.filter((sensor) => {
    return sensor.indices[0] === 0
      && sensor.indices[2] === 0
      && sensor.position.y > -4.5
      && sensor.position.y < -1.5;
  }).length;

  assert.ok(Math.abs(crossStep - (1 / 3)) < 1e-6);
  assert.equal(firstGapCount, 8);
  assert.equal(Number(first.position.y.toFixed(6)), -4.5);
  assert.equal(Number(last.position.y.toFixed(6)), 4.5);
  assert.ok(paddedGrid.dimensions[1] > grid.dimensions[1]);
  assert.ok(paddedFirst.position.y < first.position.y);
  assert.ok(paddedLast.position.y > last.position.y);
});

test("groundToArrayTop reaches module tops while Radiance point exports are lifted off surfaces", () => {
  const inferred = inferSensorGridVolumes(makeManifest(), {
    mode: "fullArrayGrid",
    dimensions: [10, 10, 3],
    fullArrayTilingStrategy: "uniformArrayGrid",
    verticalExtentMode: "groundToArrayTop",
  });

  const grid = inferred.grids[0]!;
  const firstSensor = grid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 0)!;
  const topSensor = grid.sensors.find((sensor) => sensor.indices[0] === 0 && sensor.indices[1] === 0 && sensor.indices[2] === 2)!;
  const firstRadianceLine = grid.radiancePoints.trim().split(/\r?\n/)[0]!;
  const exportedZ = Number(firstRadianceLine.split(/\s+/)[2]);

  assert.equal(Number(firstSensor.position.z.toFixed(6)), 0);
  assert.equal(Number(topSensor.position.z.toFixed(6)), 2.8);
  assert.equal(Number(exportedZ.toFixed(6)), 0.05);
});
