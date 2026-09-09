import { worldToLocal } from '../domain/geometry.js';
export function nearestCell(result, x, y) {
  if (!result?.cells.length) return null;
  if (result.grid?.azimuth !== undefined) {
    const a = (result.grid.azimuth * Math.PI) / 180;
    const along = -Math.cos(a) * x + Math.sin(a) * y;
    const across = -Math.sin(a) * x - Math.cos(a) * y;
    if (Math.abs(along) > result.grid.width / 2 || Math.abs(across) > result.grid.height / 2)
      return null;
  }
  return result.cells.reduce((a, c) =>
    (c.x - x) ** 2 + (c.y - y) ** 2 < (a.x - x) ** 2 + (a.y - y) ** 2 ? c : a,
  );
}
export function plotStats(result, plot) {
  if (!result) return null;
  const cells = result.cells.filter(
    (c) => Math.abs(c.x - plot.x) <= plot.width / 2 && Math.abs(c.y - plot.y) <= plot.length / 2,
  );
  if (!cells.length) return null;
  const a = cells.map((c) => c.dli).sort((a, b) => a - b),
    mean = a.reduce((n, v) => n + v, 0) / a.length;
  return {
    count: a.length,
    mean,
    median: (a[Math.floor((a.length - 1) / 2)] + a[Math.ceil((a.length - 1) / 2)]) / 2,
    sd: Math.sqrt(a.reduce((n, v) => n + (v - mean) ** 2, 0) / a.length),
    min: a[0],
    max: a.at(-1),
    sunlight: cells.reduce((n, c) => n + (c.sunlight ?? 100 - c.shade), 0) / cells.length,
    shade: cells.reduce((n, c) => n + c.shade, 0) / cells.length,
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
