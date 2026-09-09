import test from "node:test";
import assert from "node:assert/strict";
import { buildEdgeInteriorSummary, convertMetric } from "../packages/simulation-backend/src/annual/metrics.js";

test("convertMetric returns average daily irradiance in kWh per square meter per day", () => {
  const metric = convertMetric("annualIrradiance", 2450, 5000, 7);
  assert.equal(metric.units, "kWh/m²/day");
  assert.equal(Number(metric.value.toFixed(6)), 0.35);
});

test("convertMetric computes percent GHI and shade fraction consistently", () => {
  const percent = convertMetric("percentGHI", 3200, 4000);
  const shade = convertMetric("shadeFraction", 3200, 4000);
  assert.equal(percent.value, 80);
  assert.equal(shade.value, 20);
});

test("buildEdgeInteriorSummary compares edge-like and interior grids", () => {
  const summary = buildEdgeInteriorSummary([
    {
      gridId: "edge-grid",
      rowPairId: "rp-1",
      classifications: ["edge_west"],
      dimensions: [25, 25, 25],
      heightIndex: 0,
      heightAboveGroundM: 0,
      cells: [{ sensorId: "a", gridId: "edge-grid", position: { x: 0, y: 0, z: 0 }, rowIndex: 0, colIndex: 0, heightIndex: 0, heightAboveGroundM: 0, value: 10 }],
      min: 10,
      max: 10,
      mean: 10,
    },
    {
      gridId: "interior-grid",
      rowPairId: "rp-2",
      classifications: ["interior"],
      dimensions: [25, 25, 25],
      heightIndex: 0,
      heightAboveGroundM: 0,
      cells: [{ sensorId: "b", gridId: "interior-grid", position: { x: 0, y: 0, z: 0 }, rowIndex: 0, colIndex: 0, heightIndex: 0, heightAboveGroundM: 0, value: 5 }],
      min: 5,
      max: 5,
      mean: 5,
    },
  ]);

  assert.equal(summary?.difference, 5);
  assert.equal(summary?.ratio, 2);
});
