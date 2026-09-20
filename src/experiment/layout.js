import { rowHeight, rowIndex, rowEdge } from '../domain/receiver-grid.js';
import { worldToLocal } from '../domain/geometry.js';
export function nearestCell(result, x, y) {
  if (!result?.cells.length) return null;
  if (result.grid?.azimuth !== undefined) {
    const a = (result.grid.azimuth * Math.PI) / 180;
    const along = -Math.cos(a) * x + Math.sin(a) * y;
    const across = -Math.sin(a) * x - Math.cos(a) * y;
    if (Math.abs(along) > result.grid.width / 2 || Math.abs(across) > result.grid.height / 2)
      return null;
    const column = Math.min(
      result.grid.nx - 1,
      Math.floor((along + result.grid.width / 2) / result.grid.dx),
    );
    const row = Math.min(result.grid.ny - 1, Math.floor(rowIndex(result.grid, across)));
    return result.cells[row * result.grid.nx + column] || null;
  }
  return result.cells.reduce((a, c) =>
    (c.x - x) ** 2 + (c.y - y) ** 2 < (a.x - x) ** 2 + (a.y - y) ** 2 ? c : a,
  );
}
const statsCache = new WeakMap();
export function plotStats(result, plot) {
  if (!result) return null;
  const key = JSON.stringify([plot.gridMode, plot.grid, plot.x, plot.y, plot.width, plot.length]);
  if (!statsCache.has(result)) statsCache.set(result, new Map());
  const cache = statsCache.get(result);
  if (cache.has(key)) return cache.get(key);
  const cells = [],
    g = result.grid,
    p = plot.grid;
  const append = (i, weight) => {
    if (weight > 1e-12) cells.push({ ...result.cells[i], weight });
  };
  if (g && p) {
    const exact = plot.gridMode === 'exact';
    for (
      let row = Math.max(0, Math.floor(p.row));
      row < Math.min(g.ny, Math.ceil(p.row + p.rows));
      row++
    ) {
      const across = exact
        ? Math.max(
            0,
            Math.min(rowEdge(g, row + 1), rowEdge(g, p.row + p.rows)) -
              Math.max(rowEdge(g, row), rowEdge(g, p.row)),
          )
        : rowHeight(g, row);
      for (
        let column = Math.max(0, Math.floor(p.column));
        column < Math.min(g.nx, Math.ceil(p.column + p.columns));
        column++
      )
        append(
          row * g.nx + column,
          across *
            (exact
              ? Math.max(0, Math.min(column + 1, p.column + p.columns) - Math.max(column, p.column))
              : 1),
        );
    }
  } else
    result.cells.forEach((c, i) => {
      if (Math.abs(c.x - plot.x) <= plot.width / 2 && Math.abs(c.y - plot.y) <= plot.length / 2)
        append(i, g ? rowHeight(g, Math.floor(i / g.nx)) : 1);
    });
  if (!cells.length) return null;
  const ordered = [...cells].sort((a, b) => a.dli - b.dli);
  const weight = cells.reduce((n, c) => n + c.weight, 0);
  const meanOf = (fn) => cells.reduce((n, c) => n + fn(c) * c.weight, 0) / weight;
  const mean = meanOf((c) => c.dli);
  let cumulative = 0,
    median = ordered.at(-1).dli;
  for (let i = 0; i < ordered.length; i++) {
    cumulative += ordered[i].weight;
    if (cumulative >= weight / 2 - 1e-9) {
      median =
        Math.abs(cumulative - weight / 2) < 1e-9 && i + 1 < ordered.length
          ? (ordered[i].dli + ordered[i + 1].dli) / 2
          : ordered[i].dli;
      break;
    }
  }
  const stats = {
    count: cells.length,
    mean,
    median,
    sd: Math.sqrt(meanOf((c) => (c.dli - mean) ** 2)),
    min: ordered[0].dli,
    max: ordered.at(-1).dli,
    sunlight: meanOf((c) => c.sunlight ?? 100 - c.shade),
    shade: meanOf((c) => c.shade),
  };
  cache.set(key, stats);
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return stats;
}
export function percentileSensors(s, result) {
  if (!result) return [];
  const cells = [...result.cells].sort((a, b) => a.dli - b.dli),
    ids = new Set(s.experimentSensors.map((v) => v.id));
  let counter = 1;
  return [0.1, 0.25, 0.5, 0.75, 0.9].map((p, i) => {
    const c = cells[Math.round(p * (cells.length - 1))];
    while (ids.has(`PAR-${String(counter).padStart(2, '0')}`)) counter++;
    const id = `PAR-${String(counter++).padStart(2, '0')}`;
    ids.add(id);
    return {
      id,
      type: 'PAR',
      x: +c.x.toFixed(3),
      y: +c.y.toFixed(3),
      z: s.analysis.receiverHeight,
      treatment: `DLI P${p * 100}`,
      replicate: '1',
      model: '',
      logger: '',
      channel: '',
      azimuth: 0,
      tilt: 0,
      notes: 'Location nearest grid DLI percentile; verify spatial replication in the field.',
    };
  });
}
export function rowRelative(s, sensor) {
  const p = worldToLocal(s, sensor.x, sensor.y);
  return `along ${p.x.toFixed(2)} m; across ${p.y.toFixed(2)} m from array centre`;
}
