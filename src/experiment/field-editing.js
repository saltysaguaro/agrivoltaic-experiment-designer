import { receiverGridSpec, worldToLocal } from '../domain/geometry.js';
import { normalizeLayout } from './grid-layout.js';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function layoutItems(study, kind) {
  return kind === 'sensor' ? study.experimentSensors : study.crops;
}
export function gridPoint(study, point) {
  const g = receiverGridSpec(study),
    p = worldToLocal(study, point.x, point.y);
  return { column: (p.x + g.width / 2) / g.dx, row: (p.y + g.height / 2) / g.dy };
}
// The opposite corner stays fixed. A bed cannot flip, leave the grid, or exceed 100 m.
export function resizeGrid(study, original, corner, point) {
  const g = receiverGridSpec(study),
    p = gridPoint(study, point);
  const right = corner.includes('e'),
    top = corner.includes('n');
  const fixedX = original.column + (right ? 0 : original.columns);
  const fixedY = original.row + (top ? 0 : original.rows);
  const maxX = Math.max(1, Math.min(g.nx, Math.floor(100 / g.dx)));
  const maxY = Math.max(1, Math.min(g.ny, Math.floor(100 / g.dy)));
  const x = clamp(
    Math.round(p.column),
    right ? fixedX + 1 : Math.max(0, fixedX - maxX),
    right ? Math.min(g.nx, fixedX + maxX) : fixedX - 1,
  );
  const y = clamp(
    Math.round(p.row),
    top ? fixedY + 1 : Math.max(0, fixedY - maxY),
    top ? Math.min(g.ny, fixedY + maxY) : fixedY - 1,
  );
  return {
    column: Math.min(x, fixedX),
    row: Math.min(y, fixedY),
    columns: Math.abs(x - fixedX),
    rows: Math.abs(y - fixedY),
  };
}
export function moveGrid(study, original, delta) {
  const g = receiverGridSpec(study);
  return {
    ...original,
    column: clamp(original.column + Math.round(delta.column), 0, g.nx - (original.columns || 1)),
    row: clamp(original.row + Math.round(delta.row), 0, g.ny - (original.rows || 1)),
  };
}
export function replaceFieldItem(study, selection, item) {
  const key = selection.kind === 'sensor' ? 'experimentSensors' : 'crops';
  return normalizeLayout({
    ...study,
    [key]: study[key].map((v) => (v.id === selection.id ? item : v)),
  });
}
export function layoutSnapshot(study) {
  return {
    experimentSensors: structuredClone(study.experimentSensors),
    crops: structuredClone(study.crops),
  };
}
