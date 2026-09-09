import {
  DEFAULT_SENSOR_CONFIG,
  DEFAULT_SENSOR_MARGINS,
  addVec3,
  scaleVec3,
  type ArrayDescriptor,
  type FullArrayAnalysis,
  type RowDescriptor,
  type RowPairDescriptor,
  type SceneExportManifest,
  type SensorGridConfig,
  type SensorGridVolume,
} from "@agrivoltaic/shared";
import { inferFullArrayAnalysis } from "../array-analysis/inference.js";
import { buildSensorGridVolume } from "./generator.js";

export interface InferredSensorGrids {
  analysis: FullArrayAnalysis;
  grids: SensorGridVolume[];
  notes: string[];
}

function rowPairMatches(rowIds: [string, string], selectedRowIds?: [string, string]): boolean {
  if (!selectedRowIds) return true;
  return (
    (rowIds[0] === selectedRowIds[0] && rowIds[1] === selectedRowIds[1])
    || (rowIds[0] === selectedRowIds[1] && rowIds[1] === selectedRowIds[0])
  );
}

function isEdgeLike(classifications: readonly string[]): boolean {
  return classifications.some((classification) => classification === "corner"
    || classification === "end_of_row"
    || classification.startsWith("edge_"));
}

function chooseRepresentativeRowPair(analysis: FullArrayAnalysis, rowPairs: RowPairDescriptor[]): RowPairDescriptor {
  if (rowPairs.length === 0) {
    throw new Error("No candidate row pairs were available for representative sensor placement");
  }

  const arrayMap = new Map(analysis.arrays.map((array) => [array.arrayId, array]));
  const ranked = [...rowPairs].sort((a, b) => {
    const arrayA = arrayMap.get(a.arrayId);
    const arrayB = arrayMap.get(b.arrayId);
    const distanceA = arrayA
      ? Math.hypot(a.centroid.x - arrayA.centroid.x, a.centroid.y - arrayA.centroid.y)
      : 0;
    const distanceB = arrayB
      ? Math.hypot(b.centroid.x - arrayB.centroid.x, b.centroid.y - arrayB.centroid.y)
      : 0;
    const edgePenaltyA = isEdgeLike(a.classifications) ? 1 : 0;
    const edgePenaltyB = isEdgeLike(b.classifications) ? 1 : 0;

    if (edgePenaltyA !== edgePenaltyB) {
      return edgePenaltyA - edgePenaltyB;
    }

    return distanceA - distanceB;
  });

  return ranked[0]!;
}

function manualGrid(configInput: SensorGridConfig): InferredSensorGrids {
  if (!configInput.explicitFrame || !configInput.explicitBounds) {
    throw new Error("Manual sensor bounds mode requires explicitFrame and explicitBounds");
  }

  const grid = buildSensorGridVolume({
    gridId: "grid-manual-01",
    mode: configInput.mode,
    arrayId: configInput.selectedArrayId ?? "manual-array",
    rowPairId: "manual-row-pair",
    bayId: configInput.selectedBayId ?? "manual-bay",
    rowIds: configInput.selectedRowIds ?? ["manual-row-a", "manual-row-b"],
    classifications: ["custom"],
    frame: configInput.explicitFrame,
    bounds: configInput.explicitBounds,
    dimensions: configInput.dimensions,
    bayIndex: 0,
    bayCount: 1,
  });

  return {
    analysis: {
      arrays: [],
      rows: [],
      rowPairs: [],
      bays: [],
      representativeGridId: grid.gridId,
      tilingStrategy: configInput.fullArrayTilingStrategy ?? DEFAULT_SENSOR_CONFIG.fullArrayTilingStrategy ?? "rowPairBayTiling",
    },
    grids: [grid],
    notes: ["Manual sensor grid bounds were used; geometry inference was bypassed."],
  };
}

function getRowPairContext(
  analysis: FullArrayAnalysis,
  rowPair: RowPairDescriptor,
): { array: ArrayDescriptor; rowA: RowDescriptor; rowB: RowDescriptor } {
  const array = analysis.arrays.find((entry) => entry.arrayId === rowPair.arrayId);
  const rows = rowPair.rowIds.map((rowId) => analysis.rows.find((entry) => entry.rowId === rowId));
  if (!array || rows.some((row) => !row)) {
    throw new Error(`Could not resolve array or rows for row pair ${rowPair.rowPairId}`);
  }

  const [rowA, rowB] = rows as [RowDescriptor, RowDescriptor];
  return { array, rowA, rowB };
}

function centeredSpan(overlap: [number, number], desiredLength: number): [number, number] {
  const available = overlap[1] - overlap[0];
  const length = Math.max(0, Math.min(available, desiredLength));
  const center = (overlap[0] + overlap[1]) * 0.5;
  return [center - (length * 0.5), center + (length * 0.5)];
}

function rowCountForLength(length: number, targetSpacing: number, minimumCount: number): number {
  if (length <= 0) {
    return Math.max(1, minimumCount);
  }

  if (targetSpacing <= 1e-6) {
    return Math.max(2, minimumCount);
  }

  return Math.max(minimumCount, Math.round(length / targetSpacing) + 1);
}

function paddingCellsForLength(length: number, cellSize: number): number {
  if (length <= 1e-6 || cellSize <= 1e-6) {
    return 0;
  }

  return Math.max(0, Math.ceil(length / cellSize));
}

function createGridFromRowPair(
  analysis: FullArrayAnalysis,
  rowPair: RowPairDescriptor,
  config: SensorGridConfig,
  index: number,
  totalCount: number,
): SensorGridVolume {
  const { array, rowA, rowB } = getRowPairContext(analysis, rowPair);
  const margins = {
    ...DEFAULT_SENSOR_MARGINS,
    ...config.margins,
  };
  const crossMin = Math.min(rowA.centerCross, rowB.centerCross);
  const crossMax = Math.max(rowA.centerCross, rowB.centerCross);
  const crossSpan = crossMax - crossMin;
  const centerCross = (crossMin + crossMax) * 0.5;
  const groundElevation = config.groundElevation ?? Math.min(0, rowA.bounds.min.z, rowB.bounds.min.z, array.bounds.min.z);
  const moduleUndersideZ = Math.min(rowA.undersideZ, rowB.undersideZ);
  const arrayTopZ = Math.max(rowA.maxZ, rowB.maxZ);
  const topZ = config.verticalExtentMode === "customHeight"
    ? groundElevation + (config.customHeight ?? (moduleUndersideZ - groundElevation))
    : config.verticalExtentMode === "groundToArrayTop"
      ? arrayTopZ
      : moduleUndersideZ;
  const height = topZ - groundElevation - margins.bottomOffset - margins.topOffset;
  if (height <= 0) {
    throw new Error(`Row pair ${rowPair.rowPairId} produced a non-positive sensor height`);
  }

  const [baseRowCount, crossCount, heightCount] = config.dimensions;
  const crossSpacing = crossCount > 1 ? crossSpan / (crossCount - 1) : crossSpan;
  const overlap = rowPair.overlapAlongRow;
  const spanAlongRow = config.mode === "centerArrayGrid"
    ? centeredSpan(overlap, crossSpacing * Math.max(0, baseRowCount - 1))
    : overlap;
  const lengthRow = spanAlongRow[1] - spanAlongRow[0];
  const rowCount = config.mode === "centerArrayGrid"
    ? baseRowCount
    : rowCountForLength(lengthRow, crossSpacing, baseRowCount);
  const centerAlong = (spanAlongRow[0] + spanAlongRow[1]) * 0.5;
  const planarOrigin = {
    x: array.localFrame.origin.x,
    y: array.localFrame.origin.y,
    z: 0,
  };

  const frameOrigin = addVec3(
    addVec3(
      addVec3(planarOrigin, scaleVec3(array.localFrame.eRow, centerAlong)),
      scaleVec3(array.localFrame.eCross, centerCross),
    ),
    scaleVec3(array.localFrame.eUp, groundElevation + margins.bottomOffset + (height * 0.5)),
  );

  return buildSensorGridVolume({
    gridId: config.mode === "centerArrayGrid"
      ? `grid-${rowPair.rowPairId}-central-grid`
      : config.mode === "centralRowGrid"
        ? `grid-${rowPair.rowPairId}-central-row`
        : `grid-${rowPair.rowPairId}`,
    mode: config.mode,
    arrayId: rowPair.arrayId,
    rowPairId: rowPair.rowPairId,
    bayId: undefined,
    rowIds: rowPair.rowIds,
    classifications: rowPair.classifications,
    frame: {
      origin: frameOrigin,
      eRow: array.localFrame.eRow,
      eCross: array.localFrame.eCross,
      eUp: array.localFrame.eUp,
    },
    bounds: {
      center: frameOrigin,
      lengthRow: lengthRow + (2 * margins.rowPadding),
      lengthCross: crossSpan,
      height,
    },
    dimensions: [rowCount, crossCount, heightCount] as [number, number, number],
    bayIndex: index,
    bayCount: totalCount,
  });
}

function createUniformArrayGridFromArray(
  analysis: FullArrayAnalysis,
  array: ArrayDescriptor,
  config: SensorGridConfig,
  index: number,
  totalCount: number,
): SensorGridVolume {
  const arrayRows = analysis.rows
    .filter((row) => row.arrayId === array.arrayId)
    .filter((row) => !config.selectedRowIds || config.selectedRowIds.includes(row.rowId))
    .sort((a, b) => a.rowIndex - b.rowIndex);

  if (arrayRows.length < 2) {
    throw new Error(`Array ${array.arrayId} does not contain enough rows for uniform full-array sensor placement`);
  }

  const margins = {
    ...DEFAULT_SENSOR_MARGINS,
    ...config.margins,
  };
  const [baseRowCount, crossPointsPerPitch, heightCount] = config.dimensions;
  const firstRow = arrayRows[0]!;
  const lastRow = arrayRows.at(-1)!;
  const crossIntervals = arrayRows.length - 1;
  const rowCenterSpan = Math.abs(lastRow.centerCross - firstRow.centerCross);
  if (rowCenterSpan <= 1e-6) {
    throw new Error(`Array ${array.arrayId} produced a non-positive row-center span for uniform sensor placement`);
  }

  const pointsPerPitch = Math.max(2, crossPointsPerPitch);
  const baseCrossCount = Math.max(2, (crossIntervals * Math.max(1, pointsPerPitch - 1)) + 1);
  const cellSize = rowCenterSpan / Math.max(1, baseCrossCount - 1);
  const alongMin = Math.min(...arrayRows.map((row) => row.alongMin)) - margins.rowPadding;
  const alongMax = Math.max(...arrayRows.map((row) => row.alongMax)) + margins.rowPadding;
  const requestedAlongLength = Math.max(0, alongMax - alongMin);
  const rowCount = Math.max(baseRowCount, Math.ceil(requestedAlongLength / Math.max(cellSize, 1e-6)));
  const outerPaddingCells = paddingCellsForLength(margins.outerRowPadding, cellSize);
  const crossCount = Math.max(2, baseCrossCount + (outerPaddingCells * 2));
  const lengthRow = Math.max(cellSize, rowCount * cellSize);
  const lengthCross = Math.max(cellSize, Math.max(1, crossCount - 1) * cellSize);
  const centerAlong = (alongMin + alongMax) * 0.5;
  const centerCross = (firstRow.centerCross + lastRow.centerCross) * 0.5;
  const groundElevation = config.groundElevation ?? Math.min(0, ...arrayRows.map((row) => row.bounds.min.z), array.bounds.min.z);
  const defaultTopZ = Math.min(...arrayRows.map((row) => row.undersideZ));
  const arrayTopZ = Math.max(...arrayRows.map((row) => row.maxZ));
  const topZ = config.verticalExtentMode === "customHeight"
    ? groundElevation + (config.customHeight ?? (defaultTopZ - groundElevation))
    : config.verticalExtentMode === "groundToArrayTop"
      ? arrayTopZ
      : defaultTopZ;
  const height = topZ - groundElevation - margins.bottomOffset - margins.topOffset;
  if (height <= 0) {
    throw new Error(`Array ${array.arrayId} produced a non-positive sensor height`);
  }

  const planarOrigin = {
    x: array.localFrame.origin.x,
    y: array.localFrame.origin.y,
    z: 0,
  };
  const frameOrigin = addVec3(
    addVec3(
      addVec3(planarOrigin, scaleVec3(array.localFrame.eRow, centerAlong)),
      scaleVec3(array.localFrame.eCross, centerCross),
    ),
    scaleVec3(array.localFrame.eUp, groundElevation + margins.bottomOffset + (height * 0.5)),
  );

  return buildSensorGridVolume({
    gridId: `grid-${array.arrayId}-uniform-array`,
    mode: config.mode,
    arrayId: array.arrayId,
    rowPairId: `row-span-${array.arrayId}`,
    bayId: undefined,
    rowIds: [firstRow.rowId, lastRow.rowId],
    classifications: ["custom"],
    frame: {
      origin: frameOrigin,
      eRow: array.localFrame.eRow,
      eCross: array.localFrame.eCross,
      eUp: array.localFrame.eUp,
    },
    bounds: {
      center: frameOrigin,
      lengthRow,
      lengthCross,
      height,
    },
    dimensions: [rowCount, crossCount, heightCount] as [number, number, number],
    bayIndex: index,
    bayCount: totalCount,
    placement: {
      row: "cellCenter",
      cross: "boundary",
      up: "boundary",
    },
  });
}

export function inferSensorGridVolumes(
  manifest: SceneExportManifest,
  configInput: Partial<SensorGridConfig> = {},
): InferredSensorGrids {
  const config: SensorGridConfig = {
    ...DEFAULT_SENSOR_CONFIG,
    ...configInput,
  };

  if (config.boundsMode === "manual") {
    return manualGrid(config);
  }

  const analysis = inferFullArrayAnalysis(manifest, config);
  let candidateRowPairs = analysis.rowPairs.filter((rowPair) => {
    if (config.selectedArrayId && rowPair.arrayId !== config.selectedArrayId) {
      return false;
    }
    if (!rowPairMatches(rowPair.rowIds, config.selectedRowIds)) {
      return false;
    }
    return true;
  });

  if (candidateRowPairs.length === 0) {
    throw new Error("No row pairs matched the requested array and row filters");
  }

  if (config.mode === "centerArrayGrid" || config.mode === "centralRowGrid") {
    candidateRowPairs = [chooseRepresentativeRowPair(analysis, candidateRowPairs)];
  }

  let grids: SensorGridVolume[];
  let representativeGridId: string | undefined;

  if (config.mode === "fullArrayGrid" && config.fullArrayTilingStrategy === "uniformArrayGrid") {
    const candidateArrays = analysis.arrays
      .filter((array) => !config.selectedArrayId || array.arrayId === config.selectedArrayId)
      .filter((array) => candidateRowPairs.some((rowPair) => rowPair.arrayId === array.arrayId));

    if (!candidateArrays.length) {
      throw new Error("No arrays matched the requested filters for uniform full-array sensor placement");
    }

    grids = candidateArrays.map((array, index) => createUniformArrayGridFromArray(
      analysis,
      array,
      config,
      index,
      candidateArrays.length,
    ));
    representativeGridId = grids[0]?.gridId;
  } else {
    grids = candidateRowPairs.map((rowPair, index) => createGridFromRowPair(
      analysis,
      rowPair,
      config,
      index,
      candidateRowPairs.length,
    ));
    const representativeRowPair = chooseRepresentativeRowPair(analysis, candidateRowPairs);
    representativeGridId = config.mode === "centerArrayGrid" || config.mode === "centralRowGrid"
      ? grids[0]?.gridId
      : `grid-${representativeRowPair.rowPairId}`;
  }

  return {
    analysis: {
      ...analysis,
      representativeGridId,
    },
    grids,
    notes: config.mode === "centerArrayGrid"
      ? ["Central Grid mode selected one representative interior row pair and generated a 25 x 25 x 5 sampling lattice."]
      : config.mode === "centralRowGrid"
        ? ["Central Row mode selected one representative interior row pair and extended sampling across the full central crop row."]
        : config.fullArrayTilingStrategy === "uniformArrayGrid"
          ? ["Full Array mode generated one uniform lattice across the full array footprint with the requested center-to-center sensor points between adjacent PV row centers."]
          : ["Full Array mode generated one full-row 3D sampling lattice per inferred adjacent row pair."],
  };
}
