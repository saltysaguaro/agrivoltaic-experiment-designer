import { rowIndex, rowEdge, rowSpan, cellLocal } from '../domain/receiver-grid.js';
import { allFieldIds, uniqueFieldId } from './control-field.js';
import { receiverGridSpec, worldToLocal } from '../domain/geometry.js';
import { normalizeLayout } from './grid-layout.js';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function layoutItems(study, kind) {
  return kind === 'sensor' ? study.experimentSensors : study.crops;
}
export function gridPoint(study, point) {
  const g = receiverGridSpec(study),
    p = worldToLocal(study, point.x, point.y);
  return { column: (p.x + g.width / 2) / g.dx, row: rowIndex(g, p.y) };
}
// The opposite corner stays fixed. A bed cannot flip, leave the grid, or exceed 100 m.
export function resizeGrid(study, original, corner, point, exact = false) {
  const g = receiverGridSpec(study),
    p = gridPoint(study, point);
  const right = corner.includes('e'),
    top = corner.includes('n');
  const fixedX = original.column + (right ? 0 : original.columns);
  const fixedY = original.row + (top ? 0 : original.rows);
  if (exact) {
    const x = clamp(
      p.column,
      right ? fixedX + 0.1 / g.dx : Math.max(0, fixedX - 100 / g.dx),
      right ? Math.min(g.nx, fixedX + 100 / g.dx) : fixedX - 0.1 / g.dx,
    );
    const fixedMetres = rowEdge(g, fixedY);
    const y = clamp(
      p.row,
      top ? rowIndex(g, fixedMetres + 0.000001) : Math.max(0, rowIndex(g, fixedMetres - 100)),
      top ? Math.min(g.ny, rowIndex(g, fixedMetres + 100)) : rowIndex(g, fixedMetres - 0.000001),
    );
    return {
      column: Math.min(x, fixedX),
      row: Math.min(y, fixedY),
      columns: Math.abs(x - fixedX),
      rows: Math.abs(y - fixedY),
    };
  }
  const maxX = Math.max(1, Math.min(g.nx, Math.floor(100 / g.dx)));
  const minY = Math.max(0, Math.ceil(rowIndex(g, rowEdge(g, fixedY) - 100) - 1e-9));
  const maxY = Math.min(g.ny, Math.floor(rowIndex(g, rowEdge(g, fixedY) + 100) + 1e-9));
  const x = clamp(
    Math.round(p.column),
    right ? fixedX + 1 : Math.max(0, fixedX - maxX),
    right ? Math.min(g.nx, fixedX + maxX) : fixedX - 1,
  );
  const y = clamp(Math.round(p.row), top ? fixedY + 1 : minY, top ? maxY : fixedY - 1);
  return {
    column: Math.min(x, fixedX),
    row: Math.min(y, fixedY),
    columns: Math.abs(x - fixedX),
    rows: Math.abs(y - fixedY),
  };
}
// Unequal aisle cells cannot always accept an exact translated copy. Snap to the
// nearest compatible row offset, preserving physical bed sizes and group spacing.
function compatibleRowOffset(g, grids, requested) {
  const min = Math.ceil(Math.max(...grids.map((v) => -v.row)));
  const max = Math.floor(Math.min(...grids.map((v) => g.ny - v.row - (v.rows || 1))));
  const target = clamp(Math.round(requested), min, max);
  if (!g.yEdges) return target;
  const centre = (v, offset) =>
    (rowEdge(g, v.row + offset) + rowEdge(g, v.row + offset + (v.rows || 1))) / 2;
  const valid = (offset) => {
    const delta = centre(grids[0], offset) - centre(grids[0], 0);
    return grids.every(
      (v) =>
        Math.abs(centre(v, offset) - centre(v, 0) - delta) < 1e-7 &&
        (!v.rows ||
          Math.abs(rowSpan(g, v.row + offset, v.rows) - rowSpan(g, v.row, v.rows)) < 1e-7),
    );
  };
  for (let distance = 0; distance <= max - min; distance++) {
    for (const offset of distance ? [target - distance, target + distance] : [target]) {
      if (offset >= min && offset <= max && valid(offset)) return offset;
    }
  }
  return 0;
}
export function moveGrid(study, original, delta) {
  const g = receiverGridSpec(study);
  return {
    ...original,
    column: clamp(original.column + Math.round(delta.column), 0, g.nx - (original.columns || 1)),
    row: original.row + compatibleRowOffset(g, [original], delta.row),
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

export function selectedItems(study, selections) {
  return selections.flatMap((target) => {
    const item = layoutItems(study, target.kind).find((v) => v.id === target.id);
    return item ? [{ target, item }] : [];
  });
}
// Clamp one shared translation, not each item separately: relative spacing is preserved.
export function groupDelta(study, selections, delta) {
  const items = selectedItems(study, selections),
    g = receiverGridSpec(study);
  if (!items.length) return { column: 0, row: 0 };
  return {
    column: clamp(
      Math.round(delta.column),
      Math.max(...items.map(({ item }) => -item.grid.column)),
      Math.min(...items.map(({ item }) => g.nx - item.grid.column - (item.grid.columns || 1))),
    ),
    row: compatibleRowOffset(
      g,
      items.map(({ item }) => item.grid),
      delta.row,
    ),
  };
}
export function moveFieldGroup(study, selections, delta) {
  const offset = groupDelta(study, selections, delta);
  const chosen = new Set(selections.map((v) => `${v.kind}:${v.id}`));
  const move = (items, kind) =>
    items.map((item) =>
      chosen.has(`${kind}:${item.id}`)
        ? {
            ...item,
            grid: {
              ...item.grid,
              column: item.grid.column + offset.column,
              row: item.grid.row + offset.row,
            },
          }
        : item,
    );
  return normalizeLayout({
    ...study,
    experimentSensors: move(study.experimentSensors, 'sensor'),
    crops: move(study.crops, 'crop'),
  });
}
export function duplicateFieldGroup(
  study,
  selections,
  delta = { column: 1, row: 1 },
  reservedIds = allFieldIds(study),
) {
  const items = selectedItems(study, selections),
    offset = groupDelta(study, selections, delta);
  const used = new Set(reservedIds),
    next = { ...study, experimentSensors: [...study.experimentSensors], crops: [...study.crops] },
    copies = [];
  for (const { target, item } of items) {
    const key = target.kind === 'sensor' ? 'experimentSensors' : 'crops';
    if (next[key].length >= (target.kind === 'sensor' ? 500 : 200))
      throw Error('Duplication would exceed the field limit of 500 sensors or 200 crop beds.');
    const id = uniqueFieldId(target.kind === 'sensor' ? 'S' : 'P', used);
    next[key].push({
      ...structuredClone(item),
      id,
      grid: {
        ...item.grid,
        column: item.grid.column + offset.column,
        row: item.grid.row + offset.row,
      },
    });
    copies.push({ kind: target.kind, id });
  }
  return { study: normalizeLayout(next), selections: copies, offset };
}
