import type {
  AnnualGridSliceView,
  AnnualMetric,
  AnnualResultsView,
} from "@agrivoltaic/shared";

export function convertMetric(
  metric: AnnualMetric,
  irradianceWhM2: number,
  denominatorGhiWhM2: number,
  periodDayCount = 365,
): { value: number; units: string } {
  if (metric === "annualIrradiance") {
    const safeDayCount = Math.max(1, periodDayCount);
    return {
      value: (irradianceWhM2 / 1000) / safeDayCount,
      units: "kWh/m²/day",
    };
  }

  const availableSunPercent = denominatorGhiWhM2 > 0
    ? (irradianceWhM2 / denominatorGhiWhM2) * 100
    : 0;

  if (metric === "percentGHI") {
    return {
      value: availableSunPercent,
      units: "% of site GHI",
    };
  }

  if (metric === "shadeFraction") {
    return {
      value: Math.max(0, 100 - availableSunPercent),
      units: "% shade",
    };
  }

  // PAR proxy: irradiance kWh/m² -> MJ/m² (x3.6) -> mol/m² using ~2.04 mol/MJ.
  return {
    value: (irradianceWhM2 / 1000) * 3.6 * 2.04,
    units: "mol/m² PAR proxy",
  };
}

export function summarizeNumeric(values: readonly number[]) {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0 };
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: sum / values.length,
  };
}

function isEdgeLike(classifications: readonly string[]): boolean {
  return classifications.some((classification) => classification === "corner"
    || classification === "end_of_row"
    || classification.startsWith("edge_"));
}

export function buildEdgeInteriorSummary(grids: readonly AnnualGridSliceView[]): AnnualResultsView["edgeInterior"] {
  const edgeValues = grids
    .filter((grid) => isEdgeLike(grid.classifications))
    .flatMap((grid) => grid.cells.map((cell) => cell.value));
  const interiorValues = grids
    .filter((grid) => grid.classifications.includes("interior"))
    .flatMap((grid) => grid.cells.map((cell) => cell.value));

  if (!edgeValues.length || !interiorValues.length) {
    return undefined;
  }

  const edge = summarizeNumeric(edgeValues);
  const interior = summarizeNumeric(interiorValues);
  return {
    edgeMean: edge.mean,
    interiorMean: interior.mean,
    difference: edge.mean - interior.mean,
    ratio: interior.mean !== 0 ? edge.mean / interior.mean : undefined,
  };
}
