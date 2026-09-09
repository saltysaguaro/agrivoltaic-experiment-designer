import test from "node:test";
import assert from "node:assert/strict";
// @ts-ignore JS browser helper used directly in tests.
import { centeredSquareSensorIds } from "../src/platform/sensorSelectionPresets.js";

function buildSensors(alongCount: number, crossCount: number) {
  const sensors: Array<{
    id: string;
    position: { x: number; y: number };
    indices: [number, number];
  }> = [];

  for (let along = 0; along < alongCount; along += 1) {
    for (let cross = 0; cross < crossCount; cross += 1) {
      sensors.push({
        id: `s-${along}-${cross}`,
        position: { x: along, y: cross },
        indices: [along, cross],
      });
    }
  }

  return sensors;
}

test("centeredSquareSensorIds selects a centered span-by-span square", () => {
  const sensors = buildSensors(12, 10);
  const selected = centeredSquareSensorIds(sensors, {
    span: 10,
    project: (sensor: { position: { x: number; y: number } }) => ({
      along: sensor.position.x,
      cross: sensor.position.y,
    }),
  });

  assert.equal(selected.length, 100);
  assert.ok(selected.includes("s-1-0"));
  assert.ok(selected.includes("s-10-9"));
  assert.ok(!selected.includes("s-0-0"));
  assert.ok(!selected.includes("s-11-9"));
});

test("centeredSquareSensorIds shrinks gracefully when the requested span exceeds available values", () => {
  const sensors = buildSensors(3, 2);
  const selected = centeredSquareSensorIds(sensors, {
    span: 10,
    project: (sensor: { position: { x: number; y: number } }) => ({
      along: sensor.position.x,
      cross: sensor.position.y,
    }),
  });

  assert.equal(selected.length, 6);
});
