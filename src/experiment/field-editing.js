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
    row: clamp(
      Math.round(delta.row),
      Math.max(...items.map(({ item }) => -item.grid.row)),
      Math.min(...items.map(({ item }) => g.ny - item.grid.row - (item.grid.rows || 1))),
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
