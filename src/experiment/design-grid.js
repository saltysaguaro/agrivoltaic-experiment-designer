import { dimensions } from '../domain/study.js';
import { receiverGridSpec, localToWorld, worldToLocal } from '../domain/geometry.js';
import { rowIndex, rowEdge } from '../domain/receiver-grid.js';
export const MAX_DESIGN_CELLS = 200000;
export function copyIrradianceGrid(study) {
  const { gridSizing, gridAlignment, cellsPerRow, resolution } = study.analysis;
  return { version: 1, mode: 'copy', gridSizing, gridAlignment, cellsPerRow, resolution };
}
export function designGridSpec(study) {
  const config = study.designGrid;
  if (!config || config.mode === 'copy')
    return receiverGridSpec(
      config ? { ...study, analysis: { ...study.analysis, ...config } } : study,
    );
  const spacing = study.rowPair.pitch / config.cellsPerRow;
  const d = dimensions(study);
  const nx = Math.ceil(d.footprintX / spacing - 1e-10);
  // Anchor a grid edge at the first PV row centre. Extend the outside boundary
  // by less than one cell so every custom cell remains exactly square.
  const anchor = -d.span / 2;
  const first = anchor - Math.ceil((anchor + d.footprintY / 2) / spacing - 1e-10) * spacing;
  const ny = Math.ceil((d.footprintY / 2 - first) / spacing - 1e-10);
  const exceeded = nx * ny > MAX_DESIGN_CELLS;
  return {
    nx,
    ny,
    dx: spacing,
    dy: spacing,
    width: nx * spacing,
    height: ny * spacing,
    azimuth: study.array.azimuth,
    ...(exceeded
      ? { exceeded: true }
      : { yEdges: Array.from({ length: ny + 1 }, (_, i) => first + i * spacing) }),
  };
}
export function designGridDescription(study) {
  const g = designGridSpec(study);
  return study.designGrid?.mode === 'square'
    ? `${study.designGrid.cellsPerRow} cells per regular PV centre-to-centre pitch; ${g.dx.toFixed(4)} m square cells. Outer bounds extend by less than one cell. Extra group aisles retain square cells and may not coincide with grid edges.`
    : 'Independent copy of irradiance-grid settings; edit the cell count below to use square cells.';
}
export function designGridLines(study) {
  const g = designGridSpec(study);
  if (g.exceeded) return [];
  const lines = [];
  for (let i = 0; i <= g.nx; i++) {
    const x = -g.width / 2 + i * g.dx;
    lines.push([localToWorld(study, x, rowEdge(g, 0)), localToWorld(study, x, rowEdge(g, g.ny))]);
  }
  for (let j = 0; j <= g.ny; j++)
    lines.push([
      localToWorld(study, -g.width / 2, rowEdge(g, j)),
      localToWorld(study, g.width / 2, rowEdge(g, j)),
    ]);
  return lines;
}
// Re-index in physical coordinates when changing grid detail. Exact beds retain
// their footprint. Cell beds and instruments snap to the new placement cells.
export function regridField(study, designGrid) {
  const next = { ...study, designGrid },
    g = designGridSpec(next);
  if (g.exceeded)
    throw Error(
      `Design grid exceeds ${designGrid.mode === 'square' ? MAX_DESIGN_CELLS : 20000} cells; use fewer cells across a PV row.`,
    );
  return {
    ...next,
    experimentSensors: study.experimentSensors.map(({ grid, ...s }) => s),
    crops: study.crops.map((c) => {
      const { grid, ...p } = c;
      if (c.gridMode !== 'exact') return p;
      const local = worldToLocal(study, c.x, c.y);
      return {
        ...p,
        grid: {
          column: (local.x - c.width / 2 + g.width / 2) / g.dx,
          columns: c.width / g.dx,
          row: rowIndex(g, local.y - c.length / 2),
          rows: rowIndex(g, local.y + c.length / 2) - rowIndex(g, local.y - c.length / 2),
        },
      };
    }),
    irrigationUnits: (study.irrigationUnits || []).map(({ grid, ...u }) => u),
  };
}
