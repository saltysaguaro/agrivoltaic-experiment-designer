import {
  rowIndex,
  rowEdge,
  rowHeight,
  rowSpan,
  cellLocal,
  maxRows,
} from '../domain/receiver-grid.js';
import { receiverGridSpec, localToWorld, worldToLocal } from '../domain/geometry.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));
export function cellAt(study, point, grid = receiverGridSpec(study), clampOutside = true) {
  const p = worldToLocal(study, point.x, point.y);
  const column = Math.floor((p.x + grid.width / 2) / grid.dx);
  const row = Math.floor(rowIndex(grid, p.y));
  if (!clampOutside && (column < 0 || row < 0 || column >= grid.nx || row >= grid.ny)) return null;
  return { column: clamp(column, 0, grid.nx - 1), row: clamp(row, 0, grid.ny - 1) };
}
export function cellCenter(study, cell, grid = receiverGridSpec(study)) {
  const p = cellLocal(grid, cell.column, cell.row);
  return localToWorld(study, p.x, p.y);
}
export function normalizeLayout(study) {
  const normalized = normalizeField(study);
  if (study.controlField) {
    const control = normalizeField({ ...study, ...study.controlField });
    normalized.controlField = {
      ...study.controlField,
      experimentSensors: control.experimentSensors,
      crops: control.crops,
    };
  }
  return normalized;
}
function normalizeField(study) {
  const g = receiverGridSpec(study);
  return {
    ...study,
    experimentSensors: study.experimentSensors.map((sensor) => {
      const cell = sensor.grid || cellAt(study, sensor, g);
      const grid = { column: clamp(cell.column, 0, g.nx - 1), row: clamp(cell.row, 0, g.ny - 1) };
      const p = cellCenter(study, grid, g);
      return { ...sensor, grid, x: p.x, y: p.y };
    }),
    crops: study.crops.map((plot) => {
      const columns = clamp(
        plot.grid?.columns ?? plot.width / g.dx,
        1,
        Math.min(g.nx, Math.floor(100 / g.dx)),
      );
      const local = worldToLocal(study, plot.x, plot.y);
      let rows = clamp(
        plot.grid?.rows ??
          rowIndex(g, local.y + plot.length / 2) - rowIndex(g, local.y - plot.length / 2),
        1,
        g.ny,
      );
      const p = worldToLocal(study, plot.x, plot.y);
      const column = clamp(
        plot.grid?.column ?? (p.x + g.width / 2) / g.dx - columns / 2,
        0,
        g.nx - columns,
      );
      const row = clamp(plot.grid?.row ?? rowIndex(g, p.y - plot.length / 2), 0, g.ny - rows);
      rows = Math.min(rows, maxRows(g, row));
      const center = localToWorld(
        study,
        -g.width / 2 + (column + columns / 2) * g.dx,
        (rowEdge(g, row) + rowEdge(g, row + rows)) / 2,
      );
      return {
        ...plot,
        grid: { column, row, columns, rows },
        x: center.x,
        y: center.y,
        width: columns * g.dx,
        length: rowSpan(g, row, rows),
      };
    }),
  };
}
export function plotCorners(study, plot) {
  const p = worldToLocal(study, plot.x, plot.y);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) =>
    plot.grid
      ? localToWorld(study, p.x + (x * plot.width) / 2, p.y + (y * plot.length) / 2)
      : { x: plot.x + (x * plot.width) / 2, y: plot.y + (y * plot.length) / 2, z: 0 },
  );
}
export function receiverLines(study, grid = receiverGridSpec(study)) {
  const lines = [];
  for (let i = 0; i <= grid.nx; i++) {
    const x = -grid.width / 2 + i * grid.dx;
    lines.push([localToWorld(study, x, -grid.height / 2), localToWorld(study, x, grid.height / 2)]);
  }
  for (let j = 0; j <= grid.ny; j++) {
    const y = rowEdge(grid, j);
    lines.push([localToWorld(study, -grid.width / 2, y), localToWorld(study, grid.width / 2, y)]);
  }
  return lines;
}
// Positions below are glyph offsets, not changes to installation coordinates.
// Up to nine individual dots; denser cells use one larger, readable count badge.
export function sensorMarkers(study, { profile = false } = {}) {
  const g = receiverGridSpec(study),
    groups = new Map();
  for (const sensor of study.experimentSensors) {
    const cell = sensor.grid || cellAt(study, sensor, g),
      key = `${cell.column}:${cell.row}${profile ? ':' + sensor.z : ''}`;
    if (!groups.has(key)) groups.set(key, { cell, sensors: [] });
    groups.get(key).sensors.push(sensor);
  }
  return [...groups.values()].flatMap(({ cell, sensors }) => {
    const crowded = sensors.length > 9,
      count = crowded ? 1 : sensors.length,
      cols = Math.ceil(Math.sqrt(count)),
      rows = Math.ceil(count / cols);
    const dy = rowHeight(g, cell.row);
    const radius = Math.min(g.dx / cols, dy / rows) * 0.28;
    return Array.from({ length: count }, (_, i) => {
      const lastCount = Math.min(cols, count - Math.floor(i / cols) * cols);
      const x =
        -g.width / 2 +
        (cell.column + 0.5) * g.dx +
        ((((i % cols) - (lastCount - 1) / 2) * g.dx) / cols) * 0.8;
      const y =
        cellLocal(g, cell.column, cell.row).y +
        (((Math.floor(i / cols) - (rows - 1) / 2) * dy) / rows) * 0.8;
      const members = crowded ? sensors : [sensors[i]];
      return {
        position: localToWorld(study, x, y),
        radius,
        cell,
        sensors: members,
        label: members.length > 1 ? `${members.length}` : members[0].id,
        count: members.length,
      };
    });
  });
}
