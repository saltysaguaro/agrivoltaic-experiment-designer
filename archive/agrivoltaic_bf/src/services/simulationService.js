import { remap } from "../utils/math.js";

function buildMockIrradianceGrid(config, tileDescriptor) {
  const values = new Array(tileDescriptor.rows * tileDescriptor.cols).fill(0);
  const sunFactor = Math.max(0.15, config.scene.sunElDeg / 90);

  for (let row = 0; row < tileDescriptor.rows; row++) {
    for (let col = 0; col < tileDescriptor.cols; col++) {
      const rowN = row / Math.max(1, tileDescriptor.rows - 1);
      const colN = col / Math.max(1, tileDescriptor.cols - 1);
      const rowWave = Math.sin(rowN * Math.PI * 4.5 - 0.4) * 0.18;
      const colWave = Math.cos(colN * Math.PI * 3.1 + 0.3) * 0.12;
      const radial = 1 - Math.hypot(colN - 0.52, rowN - 0.58);
      values[row * tileDescriptor.cols + col] = 160 + (640 * sunFactor) + (180 * radial) + (120 * rowWave) + (80 * colWave);
    }
  }

  return {
    rows: tileDescriptor.rows,
    cols: tileDescriptor.cols,
    values,
    meta: {
      units: "W/m²",
      min: 120,
      max: 1050,
      palette: "sunrise",
    },
  };
}

export async function requestSimulation(config, tileDescriptor) {
  await new Promise((resolve) => window.setTimeout(resolve, 80));

  return {
    status: "mock-ready",
    metrics: {
      estimatedAnnualMWh: remap(config.system.dcSizeKw, 100, 1000, 190, 1940),
      estimatedCapexPerW: remap(config.system.dcSizeKw, 100, 1000, 1.52, 0.94),
    },
    irradianceGrid: buildMockIrradianceGrid(config, tileDescriptor),
  };
}

export function applyIrradianceGrid(groundSystem, gridData) {
  groundSystem.heatmap.setTileValues(gridData);
}

export function applySimulationResults(groundSystem, results) {
  if (!results?.irradianceGrid) return;
  applyIrradianceGrid(groundSystem, results.irradianceGrid);
}

export function describeSimulationStatus(state, lastResults) {
  if (state.showHeatmap !== "on") {
    return {
      label: "Dormant",
      detail: "Overlay framework loaded, waiting for tile data",
    };
  }

  if (!lastResults) {
    return {
      label: "Preparing",
      detail: "Mock backend request in progress",
    };
  }

  return {
    label: "Mock overlay",
    detail: `${lastResults.irradianceGrid.meta.units} mapped onto the shared tile grid`,
  };
}
