import { rowHeight, rowIndex } from '../domain/receiver-grid.js';
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
export function plotStats(result, plot) {
  if (!result) return null;
  const samples = result.cells.map((c, i) => ({
    ...c,
    weight: result.grid ? rowHeight(result.grid, Math.floor(i / result.grid.nx)) : 1,
  }));
  const cells = samples.filter((c, i) => {
    if (plot.grid && result.grid) {
      const column = i % result.grid.nx,
        row = Math.floor(i / result.grid.nx),
        g = plot.grid;
      return (
        column >= g.column && column < g.column + g.columns && row >= g.row && row < g.row + g.rows
      );
    }
    return Math.abs(c.x - plot.x) <= plot.width / 2 && Math.abs(c.y - plot.y) <= plot.length / 2;
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
  return {
    count: cells.length,
    mean,
    median,
    sd: Math.sqrt(meanOf((c) => (c.dli - mean) ** 2)),
    min: ordered[0].dli,
    max: ordered.at(-1).dli,
    sunlight: meanOf((c) => c.sunlight ?? 100 - c.shade),
    shade: meanOf((c) => c.shade),
  };
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
