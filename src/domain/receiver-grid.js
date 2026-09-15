// Pure grid math shared by solver geometry, field editing, hit testing and exports.
// x is along PV rows; y is across row centre lines. Bounds retain the exact footprint.
export function receiverSpec(study, dimensions) {
  const s = study,
    d = dimensions;
  const nx = Math.ceil(d.footprintX / s.analysis.resolution),
    width = d.footprintX,
    height = d.footprintY;
  if (s.analysis.gridAlignment !== 'row-centres') {
    const ny = Math.ceil(height / s.analysis.resolution);
    return { nx, ny, dx: width / nx, dy: height / ny, width, height, azimuth: s.array.azimuth };
  }
  const centres = Array.from(
    { length: s.array.rows },
    (_, i) => i * s.rowPair.pitch + Math.floor(i / s.array.groupSize) * s.array.aisle - d.span / 2,
  );
  const count = s.analysis.cellsPerRow ?? 9,
    spacing = s.rowPair.pitch / count;
  const anchors = [-height / 2, ...centres, height / 2];
  const yEdges = [anchors[0]];
  for (let i = 0; i < anchors.length - 1; i++) {
    const start = anchors[i],
      end = anchors[i + 1];
    const n =
      i === 0 || i === anchors.length - 2
        ? Math.max(1, Math.ceil((end - start) / spacing - 1e-10))
        : count;
    for (let j = 1; j <= n; j++) yEdges.push(start + ((end - start) * j) / n);
  }
  const ny = yEdges.length - 1;
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
  if (!g.yEdges) return `${g.dx.toFixed(digits)} × ${g.dy.toFixed(digits)} m`;
  const sizes = Array.from({ length: g.ny }, (_, i) => rowHeight(g, i));
  const min = Math.min(...sizes),
    max = Math.max(...sizes);
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
