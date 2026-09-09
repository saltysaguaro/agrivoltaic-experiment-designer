import { FIXED_STACK_SEAM_M } from "./constants.js";
import { clamp, degToRad } from "./math.js";

export function parseTableConfig(config) {
  const count = Math.max(1, Number.parseInt(config.slice(0, -1), 10) || 1);
  const orientation = config.slice(-1).toUpperCase() === "L" ? "landscape" : "portrait";
  return { count, orientation };
}

export function computeModuleCount(stateOrDcSizeKw, moduleW) {
  if (typeof stateOrDcSizeKw === "object" && stateOrDcSizeKw !== null) {
    if (stateOrDcSizeKw.forceModuleCount) {
      return Math.max(1, Math.round(stateOrDcSizeKw.forcedModuleCount || 1));
    }
    return Math.ceil((stateOrDcSizeKw.dcSizeKw * 1000) / stateOrDcSizeKw.moduleW);
  }
  return Math.ceil((stateOrDcSizeKw * 1000) / moduleW);
}

export function computeTableSpec(state) {
  const { count, orientation } = parseTableConfig(state.config);
  let moduleWidth = state.moduleWidth;
  let moduleHeight = state.moduleHeight;

  if (orientation === "landscape") {
    [moduleWidth, moduleHeight] = [moduleHeight, moduleWidth];
  }

  const tableLength = moduleWidth;
  const stackSpan = count * moduleHeight + (count - 1) * FIXED_STACK_SEAM_M;

  return {
    count,
    orientation,
    moduleWidth,
    moduleHeight,
    tableLength,
    stackSpan,
    moduleThickness: state.moduleThickness,
    modulesPerTable: count,
    stackSeam: FIXED_STACK_SEAM_M,
  };
}

export function computeCrossAxisFootprint(state, archetype, tableSpec) {
  const tiltRad = degToRad(state.tiltDeg);

  if (archetype.id === "fixed" || archetype.id === "raised") {
    return tableSpec.stackSpan * Math.cos(tiltRad);
  }

  if (archetype.id === "sat") {
    const trackerAngle = degToRad(clamp(Math.abs(state.trackerAngleDeg), 0, 89));
    return Math.max(0.6, tableSpec.stackSpan * Math.cos(trackerAngle));
  }

  if (archetype.id === "vertical") {
    return Math.max(0.18, state.moduleThickness + 0.16);
  }

  return Math.max(0.28, state.moduleThickness + 0.14);
}

export function computeArrayLayout(state, archetype) {
  const tableSpec = computeTableSpec(state);
  const moduleCount = computeModuleCount(state);
  const checkerboardExpanded = archetype.id === "raised" && state.pergolaCheckerboard;
  const canopyPositionCount = checkerboardExpanded ? moduleCount * 2 : moduleCount;
  const tablesNeeded = Math.ceil(canopyPositionCount / tableSpec.modulesPerTable);
  const inRowGap = state.interModuleSpacing;
  const tableSpan = tableSpec.tableLength + inRowGap;
  const crossAxisFootprint = computeCrossAxisFootprint(state, archetype, tableSpec);

  let tablesPerRow = Math.max(1, Math.min(state.maxTablesPerRow, tablesNeeded));
  let rowCount = Math.max(1, Math.ceil(tablesNeeded / tablesPerRow));

  if (state.rowCountHint > 0) {
    const targetRows = Math.max(1, Math.min(state.rowCountHint, tablesNeeded));
    tablesPerRow = Math.max(1, Math.min(state.maxTablesPerRow, Math.ceil(tablesNeeded / targetRows)));
    rowCount = Math.max(1, Math.ceil(tablesNeeded / tablesPerRow));
  }

  const rowPitch = state.rowSpacing;
  const structuralRowPitch = archetype.id === "raised" && state.pergolaRackGap > 0
    ? crossAxisFootprint + state.pergolaRackGap
    : rowPitch;
  const tablesPerRowEffective = Math.max(1, Math.ceil(tablesNeeded / rowCount));
  const spanAlongRow = tableSpec.tableLength + Math.max(0, tablesPerRowEffective - 1) * tableSpan;
  const totalRowColumns = Math.max(1, Math.min(state.rowColumnCount || 1, rowCount));
  const rowsPerColumn = Array.from({ length: totalRowColumns }, (_, index) => {
    const base = Math.floor(rowCount / totalRowColumns);
    const remainder = rowCount % totalRowColumns;
    return base + (index < remainder ? 1 : 0);
  }).filter((count) => count > 0);
  const rowColumnCount = rowsPerColumn.length;
  const rowDepthByColumn = rowsPerColumn.map((count) => {
    return crossAxisFootprint + Math.max(0, count - 1) * structuralRowPitch;
  });
  const maxColumnDepth = rowDepthByColumn.length
    ? Math.max(...rowDepthByColumn)
    : crossAxisFootprint;
  const rowReferenceMode = archetype.crossAxisAnchorMode || "leading-edge";

  const isTrackerOrientation = archetype.rowAxis === "z";
  const totalColumnSpan = (spanAlongRow * rowColumnCount) + (Math.max(0, rowColumnCount - 1) * state.rowColumnGap);
  const arrayW = isTrackerOrientation ? maxColumnDepth : totalColumnSpan;
  const arrayD = isTrackerOrientation ? totalColumnSpan : maxColumnDepth;

  const anchors = [];
  const columnCenters = Array.from({ length: rowColumnCount }, (_, columnIndex) => {
    return (-totalColumnSpan / 2) + (spanAlongRow / 2) + columnIndex * (spanAlongRow + state.rowColumnGap);
  });

  const rowTableCounts = Array.from({ length: rowCount }, (_, index) => {
    const base = Math.floor(tablesNeeded / rowCount);
    const remainder = tablesNeeded % rowCount;
    return base + (index < remainder ? 1 : 0);
  });
  let globalRowIndex = 0;
  const rowColumnLayouts = [];

  rowsPerColumn.forEach((rowsInColumn, columnIndex) => {
    const columnDepth = rowDepthByColumn[columnIndex];
    const depthOffset = (maxColumnDepth - columnDepth) / 2;
    const arrayId = `array-${String(columnIndex + 1).padStart(2, "0")}`;
    const rowStart = rowReferenceMode === "center"
      ? (-maxColumnDepth / 2) + depthOffset + (crossAxisFootprint / 2)
      : (-maxColumnDepth / 2) + depthOffset;

    rowColumnLayouts.push({
      arrayId,
      columnIndex,
      rowsInColumn,
      centerOffset: columnCenters[columnIndex],
      depthOffset,
      rowStart,
      depth: columnDepth,
      structuralRowPitch,
    });

    for (let rowIndexInColumn = 0; rowIndexInColumn < rowsInColumn; rowIndexInColumn++) {
      const rowGlobal = globalRowIndex;
      globalRowIndex += 1;
      const rowId = `row-${String(rowGlobal + 1).padStart(2, "0")}`;
      const tableCount = rowTableCounts[rowGlobal] || 0;

      if (isTrackerOrientation) {
        const zCenter = columnCenters[columnIndex];
        const eastEdgeX = arrayW / 2 - depthOffset;
        const x = eastEdgeX - rowIndexInColumn * structuralRowPitch;
        for (let col = 0; col < tableCount; col++) {
          const z = zCenter - (spanAlongRow / 2) + (tableSpec.tableLength / 2) + col * tableSpan;
          anchors.push({ row: rowGlobal, rowId, col, x, z, arrayId, rowColumn: columnIndex });
        }
      } else {
        const centerX = columnCenters[columnIndex] - (spanAlongRow / 2) + (tableSpec.tableLength / 2);
        const z = rowStart + rowIndexInColumn * structuralRowPitch;
        for (let col = 0; col < tableCount; col++) {
          const x = centerX + col * tableSpan;
          anchors.push({ row: rowGlobal, rowId, col, x, z, arrayId, rowColumn: columnIndex });
        }
      }
    }
  });

  const cropRows = computeCropRows({
    arrayW,
    arrayD,
    rowCount,
    rowColumnCount,
    rowPitch: structuralRowPitch,
    crossAxisFootprint,
    archetype,
    state,
    rowColumnLayouts,
    spanAlongRow,
    isTrackerOrientation,
  });

  return {
    tableSpec,
    moduleCount,
    canopyPositionCount,
    checkerboardExpanded,
    tablesNeeded,
    tablesPerRow: tablesPerRowEffective,
    rowCount,
    rowPitch: structuralRowPitch,
    tableSpan,
    crossAxisFootprint,
    arrayW,
    arrayD,
    rowColumnCount,
    rowColumnGap: state.rowColumnGap,
    rowColumnLayouts,
    rowReferenceMode,
    anchors,
    cropRows,
  };
}

function computeBedCenters(start, end, bedCount) {
  if (bedCount <= 0 || end <= start) return [];
  const width = end - start;
  return Array.from({ length: bedCount }, (_, index) => {
    return start + ((index + 0.5) / bedCount) * width;
  });
}

function computeCropRows({
  arrayW,
  arrayD,
  rowCount,
  rowColumnCount,
  rowPitch,
  crossAxisFootprint,
  archetype,
  state,
  rowColumnLayouts,
  spanAlongRow,
  isTrackerOrientation,
}) {
  if (archetype.id === "raised") {
    return computePergolaCropRows({
      arrayW,
      arrayD,
      rowCount,
      rowColumnCount,
      rowPitch,
      crossAxisFootprint,
      state,
      rowColumnLayouts,
      spanAlongRow,
      isTrackerOrientation,
    });
  }

  if (rowCount < 2) return [];

  const cropRows = [];
  const interRowGap = rowPitch - crossAxisFootprint;

  if (interRowGap <= 0) return cropRows;

  if (isTrackerOrientation) {
    for (const columnLayout of rowColumnLayouts) {
      const eastEdgeOrigin = arrayW / 2 - columnLayout.depthOffset;
      for (let rowIndex = 0; rowIndex < columnLayout.rowsInColumn - 1; rowIndex++) {
        const eastEdge = eastEdgeOrigin - rowIndex * rowPitch;
        const westEdge = eastEdge - crossAxisFootprint;
        const nextEastEdge = eastEdgeOrigin - (rowIndex + 1) * rowPitch;
        const plantableStart = nextEastEdge + state.cropRowBuffer;
        const plantableEnd = westEdge - state.cropRowBuffer;
        const width = Math.max(0, plantableEnd - plantableStart);
        cropRows.push({
          index: cropRows.length,
          mode: "inter-row",
          orientation: "z",
          centerX: width > 0 ? (plantableStart + plantableEnd) / 2 : (nextEastEdge + westEdge) / 2,
          centerZ: columnLayout.centerOffset,
          width,
          interRowGap,
          alongLength: spanAlongRow,
          alongStart: columnLayout.centerOffset - (spanAlongRow / 2),
          alongEnd: columnLayout.centerOffset + (spanAlongRow / 2),
          bedCenters: computeBedCenters(plantableStart, plantableEnd, state.cropBedsPerRow),
        });
      }
    }
    return cropRows;
  }

  for (const columnLayout of rowColumnLayouts) {
    for (let rowIndex = 0; rowIndex < columnLayout.rowsInColumn - 1; rowIndex++) {
      const southEdge = columnLayout.rowStart + rowIndex * rowPitch;
      const northEdge = southEdge + crossAxisFootprint;
      const nextSouthEdge = columnLayout.rowStart + (rowIndex + 1) * rowPitch;
      const plantableStart = northEdge + state.cropRowBuffer;
      const plantableEnd = nextSouthEdge - state.cropRowBuffer;
      const width = Math.max(0, plantableEnd - plantableStart);
      cropRows.push({
        index: cropRows.length,
        mode: "inter-row",
        orientation: "x",
        centerX: columnLayout.centerOffset,
        centerZ: width > 0 ? (plantableStart + plantableEnd) / 2 : (northEdge + nextSouthEdge) / 2,
        width,
        interRowGap,
        alongLength: spanAlongRow,
        alongStart: columnLayout.centerOffset - (spanAlongRow / 2),
        alongEnd: columnLayout.centerOffset + (spanAlongRow / 2),
        bedCenters: computeBedCenters(plantableStart, plantableEnd, state.cropBedsPerRow),
      });
    }
  }

  return cropRows;
}

function computePergolaCropRows({
  rowCount,
  rowPitch,
  crossAxisFootprint,
  rowColumnLayouts,
  spanAlongRow,
  isTrackerOrientation,
  state,
}) {
  if (rowCount < 1) return [];

  const cropRows = [];
  const canopyGap = Math.max(0, (rowColumnLayouts[0]?.structuralRowPitch ?? rowPitch) - crossAxisFootprint);

  for (const columnLayout of rowColumnLayouts) {
    for (let rowIndex = 0; rowIndex < columnLayout.rowsInColumn; rowIndex++) {
      const structuralPitch = columnLayout.structuralRowPitch ?? rowPitch;
      const rowCenter = columnLayout.rowStart + rowIndex * structuralPitch;
      const southEdge = rowCenter - (crossAxisFootprint / 2);
      const northEdge = rowCenter + (crossAxisFootprint / 2);
      const plantableStart = southEdge + state.cropRowBuffer;
      const plantableEnd = northEdge - state.cropRowBuffer;
      const width = Math.max(0, plantableEnd - plantableStart);

      cropRows.push({
        index: cropRows.length,
        mode: "under-canopy",
        orientation: isTrackerOrientation ? "z" : "x",
        centerX: isTrackerOrientation
          ? (width > 0 ? (plantableStart + plantableEnd) / 2 : (southEdge + northEdge) / 2)
          : columnLayout.centerOffset,
        centerZ: isTrackerOrientation
          ? columnLayout.centerOffset
          : width > 0
            ? (plantableStart + plantableEnd) / 2
            : (southEdge + northEdge) / 2,
        width,
        interRowGap: canopyGap,
        alongLength: spanAlongRow,
        alongStart: columnLayout.centerOffset - (spanAlongRow / 2),
        alongEnd: columnLayout.centerOffset + (spanAlongRow / 2),
        bedCountOverride: 1,
        bedCenters: computeBedCenters(plantableStart, plantableEnd, 1),
      });
    }
  }

  return cropRows;
}
