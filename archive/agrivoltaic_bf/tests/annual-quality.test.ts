import test from "node:test";
import assert from "node:assert/strict";
import {
  ANNUAL_SIMULATION_QUALITY_PRESETS,
  DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET,
  resolveAnnualSimulationQualityPreset,
  simulationOptionsForAnnualQualityPreset,
} from "../packages/shared/src/index.js";

test("annual simulation quality presets resolve to stable Radiance option bundles", () => {
  assert.equal(resolveAnnualSimulationQualityPreset(undefined), DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET);
  assert.equal(resolveAnnualSimulationQualityPreset("high"), "high");

  const low = simulationOptionsForAnnualQualityPreset("low");
  const medium = simulationOptionsForAnnualQualityPreset("medium");
  const high = simulationOptionsForAnnualQualityPreset("high");

  assert.equal(low.ambientBounces, 1);
  assert.equal(medium.ambientBounces, 2);
  assert.equal(high.ambientBounces, 4);
  assert.ok((low.ambientDivisions ?? 0) < (medium.ambientDivisions ?? 0));
  assert.ok((medium.ambientDivisions ?? 0) < (high.ambientDivisions ?? 0));
  assert.ok((low.limitWeight ?? 1) > (medium.limitWeight ?? 0));
  assert.ok((medium.limitWeight ?? 1) > (high.limitWeight ?? 0));
  assert.equal(ANNUAL_SIMULATION_QUALITY_PRESETS.high.label, "High");
});
