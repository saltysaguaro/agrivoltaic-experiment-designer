import { designGridSpec } from '../experiment/design-grid.js';
import { rowIndex, rowEdge, rowSpan, cellLocal } from '../domain/receiver-grid.js';
import { allFieldIds, uniqueFieldId } from './control-field.js';
import { worldToLocal } from '../domain/geometry.js';
import { normalizeLayout } from './grid-layout.js';
export const fieldItemKey = (kind) =>
  kind === 'sensor' ? 'experimentSensors' : kind === 'irrigation' ? 'irrigationUnits' : 'crops';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function layoutItems(study, kind) {
  return study[fieldItemKey(kind)] || [];
}
export function gridPoint(study, point) {
  const g = designGridSpec(study),
    p = worldToLocal(study, point.x, point.y);
  return { column: (p.x + g.width / 2) / g.dx, row: rowIndex(g, p.y) };
}
// The opposite corner stays fixed. A bed cannot flip, leave the grid, or exceed 100 m.
export function resizeGrid(study, original, corner, point, exact = false) {
  const g = designGridSpec(study),
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
  const g = designGridSpec(study);
  return {
    ...original,
    column: clamp(original.column + Math.round(delta.column), 0, g.nx - (original.columns || 1)),
    row: original.row + compatibleRowOffset(g, [original], delta.row),
  };
}
export function replaceFieldItem(study, selection, item) {
  const key = fieldItemKey(selection.kind),
    original = layoutItems(study, selection.kind).find((v) => v.id === selection.id);
  let next = {
    ...study,
    [key]: layoutItems(study, selection.kind).map((v) => (v.id === selection.id ? item : v)),
  };
  if (selection.kind === 'crop' && original.id !== item.id) {
    next.irrigationUnits = (study.irrigationUnits || []).map((u) =>
      u.link?.bedId === original.id ? { ...u, link: { ...u.link, bedId: item.id } } : u,
    );
    next.irrigationZones = (study.irrigationZones || []).map((z) => ({
      ...z,
      bedIds: z.bedIds.map((id) => (id === original.id ? item.id : id)),
    }));
  }
  if (
    selection.kind === 'irrigation' &&
    item.link &&
    original?.grid &&
    item.grid &&
    (item.grid.column !== original.grid.column || item.grid.row !== original.grid.row)
  ) {
    const g = designGridSpec(study),
      a = cellLocal(g, original.grid.column, original.grid.row),
      b = cellLocal(g, item.grid.column, item.grid.row);
    next[key] = next[key].map((u) =>
      u.id === item.id
        ? {
            ...u,
            link: { ...u.link, along: u.link.along + b.x - a.x, across: u.link.across + b.y - a.y },
          }
        : u,
    );
  }
  return normalizeLayout(next);
}
export function deleteFieldItem(study, target, linkedAction = 'detach') {
  const key = fieldItemKey(target.kind);
  let next = { ...study, [key]: layoutItems(study, target.kind).filter((v) => v.id !== target.id) };
  if (target.kind === 'crop') {
    next.irrigationUnits = (study.irrigationUnits || [])
      .filter((u) => linkedAction !== 'delete' || u.link?.bedId !== target.id)
      .map((u) => (u.link?.bedId === target.id ? { ...u, link: null } : u));
    next.irrigationZones = (study.irrigationZones || []).map((z) => ({
      ...z,
      bedIds: z.bedIds.filter((id) => id !== target.id),
    }));
  }
  return normalizeLayout(next);
}
export function layoutSnapshot(study) {
  return {
    experimentSensors: structuredClone(study.experimentSensors),
    crops: structuredClone(study.crops),
    designGrid: study.designGrid ? structuredClone(study.designGrid) : undefined,
    irrigationUnits: structuredClone(study.irrigationUnits || []),
    irrigationZones: structuredClone(study.irrigationZones || []),
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
    g = designGridSpec(study);
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
    irrigationUnits: move(study.irrigationUnits || [], 'irrigation').map((u) => {
      if (!u.link || !chosen.has(`irrigation:${u.id}`) || chosen.has(`crop:${u.link.bedId}`))
        return u;
      const old = study.irrigationUnits.find((v) => v.id === u.id),
        a = cellLocal(designGridSpec(study), old.grid.column, old.grid.row),
        b = cellLocal(designGridSpec(study), u.grid.column, u.grid.row);
      return {
        ...u,
        link: { ...u.link, along: u.link.along + b.x - a.x, across: u.link.across + b.y - a.y },
      };
    }),
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
    next = {
      ...study,
      experimentSensors: [...study.experimentSensors],
      crops: [...study.crops],
      irrigationUnits: [...(study.irrigationUnits || [])],
      irrigationZones: structuredClone(study.irrigationZones || []),
    },
    copies = [];
  for (const { target, item } of items) {
    const key = fieldItemKey(target.kind);
    if (next[key].length >= (target.kind === 'crop' ? 200 : 500))
      throw Error('Duplication would exceed the field limit of 500 sensors or 200 crop beds.');
    const id = uniqueFieldId(
      target.kind === 'sensor' ? 'S' : target.kind === 'irrigation' ? 'I' : 'P',
      used,
    );
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
  const bedMap = new Map(
    items
      .filter((v) => v.target.kind === 'crop')
      .map((v) => [v.item.id, copies[items.indexOf(v)].id]),
  );
  const unitMap = new Map(
    items
      .filter((v) => v.target.kind === 'irrigation')
      .map((v) => [v.item.id, copies[items.indexOf(v)].id]),
  );
  // Copy linked hardware with selected beds, and remap links rather than attaching copies to originals.
  for (const u of study.irrigationUnits || [])
    if (u.link && bedMap.has(u.link.bedId) && !unitMap.has(u.id)) {
      if (next.irrigationUnits.length >= 500)
        throw Error('Duplication would exceed 500 irrigation units.');
      const id = uniqueFieldId('I', used);
      unitMap.set(u.id, id);
      next.irrigationUnits.push({
        ...structuredClone(u),
        id,
        link: { ...u.link, bedId: bedMap.get(u.link.bedId) },
      });
    }
  next.irrigationUnits = next.irrigationUnits.map((u) => {
    const originalId = [...unitMap].find(([, id]) => id === u.id)?.[0];
    if (!originalId || !u.link) return u;
    const original = study.irrigationUnits.find((v) => v.id === originalId);
    if (bedMap.has(original.link.bedId))
      return { ...u, link: { ...u.link, bedId: bedMap.get(original.link.bedId) } };
    return { ...u, link: null };
  });
  next.irrigationZones = next.irrigationZones.map((z) => ({
    ...z,
    bedIds: [...z.bedIds, ...z.bedIds.filter((id) => bedMap.has(id)).map((id) => bedMap.get(id))],
  }));
  return { study: normalizeLayout(next), selections: copies, offset };
}
