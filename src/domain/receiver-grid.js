export const MAX_RECEIVERS = 20000;
export const DEFAULT_CELLS_PER_ROW = 15;
// Pure grid math shared by solver geometry, field editing, hit testing and exports.
// x is along PV rows; y is across row centre lines. Bounds retain the exact footprint.
export function cellSampleOffsets(count = 1) {
  if (!Number.isInteger(count) || count < 1 || count > 9)
    throw Error('Samples per cell must be an integer from 1 to 9.');
  // Partition into equal-area rectangles and sample each rectangle's centre.
  // Row heights scale with their column counts, so every sample has weight 1/N.
  // Four and nine samples give regular 2×2 and 3×3 patterns.
  const rows = Math.round(Math.sqrt(count)),
    points = [];
  let used = 0;
  for (let row = 0; row < rows; row++) {
    const columns = Math.floor(count / rows) + (row >= rows - (count % rows) ? 1 : 0);
    for (let column = 0; column < columns; column++)
      points.push({ x: (column + 0.5) / columns, y: (used + columns / 2) / count });
    used += columns;
  }
  return points;
}

export function cellSamplingDescription(count = 1) {
  return count === 1
    ? '1 cell-centre point sample; not a within-cell spatial average. A sample inside an opaque support can read zero.'
    : `${count} samples per cell; estimated cell mean from equally weighted centres of equal-area subrectangles. Supports remain opaque; finite sampling can miss small shadows.`;
}

export function receiverSpec(study, dimensions) {
  const s = study,
    d = dimensions;
  const nx = Math.ceil(d.footprintX / s.analysis.resolution),
    width = d.footprintX,
    height = d.footprintY;
  if (s.analysis.gridAlignment !== 'row-centres') {
    const ny = Math.ceil(height / s.analysis.resolution);
    return {
      nx,
      ny,
      dx: width / nx,
      dy: height / ny,
      width,
      height,
      azimuth: s.array.azimuth,
      ...(!(nx * ny <= MAX_RECEIVERS) ? { exceeded: true } : {}),
    };
  }
  const centres = Array.from(
    { length: s.array.rows },
    (_, i) => i * s.rowPair.pitch + Math.floor(i / s.array.groupSize) * s.array.aisle - d.span / 2,
  );
  const count = s.analysis.cellsPerRow ?? DEFAULT_CELLS_PER_ROW,
    spacing = s.rowPair.pitch / count;
  const anchors = [-height / 2, ...centres, height / 2];
  const segments = anchors.slice(0, -1).map((start, i) => ({
    start,
    end: anchors[i + 1],
    n:
      i === 0 || i === anchors.length - 2
        ? Math.max(1, Math.ceil((anchors[i + 1] - start) / spacing - 1e-10))
        : count,
  }));
  const ny = segments.reduce((n, segment) => n + segment.n, 0);
  if (!(nx * ny <= MAX_RECEIVERS))
    return {
      nx,
      ny,
      dx: width / nx,
      dy: height / ny,
      width,
      height,
      azimuth: s.array.azimuth,
      exceeded: true,
    };
  const yEdges = [anchors[0]];
  for (const { start, end, n } of segments)
    for (let j = 1; j <= n; j++) yEdges.push(start + ((end - start) * j) / n);
  return {
    nx,
    ny,
    dx: width / nx,
    dy: height / ny,
    width,
    height,
    azimuth: s.array.azimuth,
    yEdges,
  };
}
export function rowEdge(g, row) {
  if (!g.yEdges) return -g.height / 2 + row * g.dy;
  const i = Math.max(0, Math.min(g.ny - 1, Math.floor(row)));
  return g.yEdges[i] + (row - i) * (g.yEdges[i + 1] - g.yEdges[i]);
}
export function rowIndex(g, y) {
  if (!g.yEdges) return (y + g.height / 2) / g.dy;
  let lo = 0,
    hi = g.ny;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >>> 1;
    if (g.yEdges[mid] <= y) lo = mid;
    else hi = mid;
  }
  return lo + (y - g.yEdges[lo]) / (g.yEdges[lo + 1] - g.yEdges[lo]);
}
export function rowHeight(g, row) {
  return rowEdge(g, row + 1) - rowEdge(g, row);
}
export function rowSpan(g, row, rows) {
  return rowEdge(g, row + rows) - rowEdge(g, row);
}
export function cellLocal(g, column, row) {
  return {
    x: -g.width / 2 + (column + 0.5) * g.dx,
    y: (rowEdge(g, row) + rowEdge(g, row + 1)) / 2,
  };
}
export function maxRows(g, row, limit = 100) {
  return Math.max(
    1,
    Math.min(g.ny - row, Math.floor(rowIndex(g, rowEdge(g, row) + limit) + 1e-9) - row),
  );
}
export function gridSpacingLabel(g, digits = 3) {
  if (g.exceeded) return 'Grid exceeds 20,000 receivers; reduce dimensions or increase spacing';
  if (!g.yEdges) return `${g.dx.toFixed(digits)} × ${g.dy.toFixed(digits)} m`;
  let min = Infinity,
    max = -Infinity;
  for (let i = 0; i < g.ny; i++) {
    const size = rowHeight(g, i);
    min = Math.min(min, size);
    max = Math.max(max, size);
  }
  return `${g.dx.toFixed(digits)} m along rows × ${min.toFixed(digits) === max.toFixed(digits) ? min.toFixed(digits) : `${min.toFixed(digits)}–${max.toFixed(digits)}`} m across rows`;
}
export function gridMean(cells, g, key) {
  let sum = 0,
    area = 0;
  cells.forEach((c, i) => {
    const weight = rowHeight(g, Math.floor(i / g.nx));
    sum += c[key] * weight;
    area += weight;
  });
  return sum / area;
}
