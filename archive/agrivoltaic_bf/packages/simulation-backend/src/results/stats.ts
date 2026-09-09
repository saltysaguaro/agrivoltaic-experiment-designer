import {
  percentile,
  type ArrayResultSummary,
  type AxisSliceSummary,
  type ClassificationSummary,
  type GridClassification,
  type GridResult,
  type IrradianceSample,
  type IrradianceStats,
  type SensorGridVolume,
} from "@agrivoltaic/shared";

function valuesFrom(samples: readonly IrradianceSample[]): number[] {
  return samples.map((sample) => sample.Ee);
}

export function computeIrradianceStats(samples: readonly IrradianceSample[]): IrradianceStats {
  if (samples.length === 0) {
    throw new Error("Cannot compute irradiance stats for an empty sample set");
  }

  const values = valuesFrom(samples).sort((a, b) => a - b);
  const sum = values.reduce((acc, value) => acc + value, 0);
  return {
    min: values[0] ?? 0,
    max: values.at(-1) ?? 0,
    mean: sum / values.length,
    median: percentile(values, 0.5),
    p05: percentile(values, 0.05),
    p95: percentile(values, 0.95),
  };
}

function sliceSamples(samples: readonly IrradianceSample[], axis: AxisSliceSummary["axis"]): AxisSliceSummary[] {
  const axisIndex = axis === "row" ? 0 : axis === "cross" ? 1 : 2;
  const groups = new Map<number, number[]>();

  for (const sample of samples) {
    const bucket = groups.get(sample.indices[axisIndex]) ?? [];
    bucket.push(sample.Ee);
    groups.set(sample.indices[axisIndex], bucket);
  }

  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, values]) => ({
      axis,
      index,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    }));
}

export function computeGridSlices(samples: readonly IrradianceSample[]) {
  return {
    row: sliceSamples(samples, "row"),
    cross: sliceSamples(samples, "cross"),
    up: sliceSamples(samples, "up"),
  };
}

export function buildGridResult(grid: SensorGridVolume, samples: IrradianceSample[]): GridResult {
  return {
    gridId: grid.gridId,
    arrayId: grid.arrayId,
    rowPairId: grid.rowPairId,
    bayId: grid.bayId,
    rowIds: grid.rowIds,
    classifications: grid.classifications,
    dimensions: grid.dimensions,
    bounds: grid.bounds,
    worldBounds: grid.worldBounds,
    centroid: grid.centroid,
    sensors: grid.sensors,
    irradianceResults: samples,
    stats: computeIrradianceStats(samples),
    slices: computeGridSlices(samples),
  };
}

function buildSummary(gridResults: GridResult[]): ArrayResultSummary {
  const samples = gridResults.flatMap((grid) => grid.irradianceResults);
  return {
    gridCount: gridResults.length,
    sensorCount: samples.length,
    stats: computeIrradianceStats(samples),
  };
}

export function isEdgeLikeClassification(classification: GridClassification): boolean {
  return classification === "corner"
    || classification === "end_of_row"
    || classification.startsWith("edge_");
}

export function isEdgeLikeGrid(grid: Pick<GridResult, "classifications">): boolean {
  return grid.classifications.some((classification) => isEdgeLikeClassification(classification));
}

export function summarizeClassifications(gridResults: GridResult[]): ClassificationSummary[] {
  const classifications = new Map<GridClassification, GridResult[]>();
  for (const grid of gridResults) {
    for (const classification of grid.classifications) {
      const bucket = classifications.get(classification) ?? [];
      bucket.push(grid);
      classifications.set(classification, bucket);
    }
  }

  return [...classifications.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([classification, grids]) => {
      const samples = grids.flatMap((grid) => grid.irradianceResults);
      return {
        classification,
        gridIds: grids.map((grid) => grid.gridId),
        sensorCount: samples.length,
        stats: computeIrradianceStats(samples),
      };
    });
}

export function summarizeArray(gridResults: GridResult[]) {
  const arrayStats = buildSummary(gridResults);
  const edgeGrids = gridResults.filter((grid) => isEdgeLikeGrid(grid));
  const interiorGrids = gridResults.filter((grid) => grid.classifications.includes("interior"));
  const edgeStats = edgeGrids.length > 0 ? buildSummary(edgeGrids) : undefined;
  const interiorStats = interiorGrids.length > 0 ? buildSummary(interiorGrids) : undefined;

  return {
    arrayStats: {
      ...arrayStats,
      edgeInteriorDifference: edgeStats && interiorStats
        ? edgeStats.stats.mean - interiorStats.stats.mean
        : undefined,
      edgeInteriorRatio: edgeStats && interiorStats && interiorStats.stats.mean !== 0
        ? edgeStats.stats.mean / interiorStats.stats.mean
        : undefined,
    },
    edgeStats,
    interiorStats,
  };
}
