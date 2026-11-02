import { plantingSummary } from '../domain/crop-planting.js';
import { worldToLocal, localToWorld } from '../domain/geometry.js';
// Planting positions are display-only and never contribute occluders or numerical receivers.
// Keep every row; sample dense plant glyphs at actual planting positions, without changing counts.
export function cropPlantingGeometry(study, plot, maxMarkers = 200) {
  const p = plantingSummary(plot);
  if (p.issue) return { rows: [], plants: [], ...p, sampled: false };
  const centre = worldToLocal(study, plot.x, plot.y);
  const point = (x, y) =>
    plot.grid
      ? { ...localToWorld(study, centre.x + x, centre.y + y), z: 0.055 }
      : { x: plot.x + x, y: plot.y + y, z: 0.055 };
  const across = (i) => (i - (p.rowCount - 1) / 2) * p.rowSpacing;
  const rows = Array.from({ length: p.rowCount }, (_, i) => [
    point(-plot.width / 2, across(i)),
    point(plot.width / 2, across(i)),
  ]);
  const stride = Math.max(1, Math.ceil(p.positions / Math.max(1, maxMarkers)));
  const plants = [];
  for (let i = 0; i < p.positions; i += stride) {
    const row = Math.floor(i / p.plantsPerRow),
      column = i % p.plantsPerRow;
    plants.push(point((column - (p.plantsPerRow - 1) / 2) * p.plantSpacing, across(row)));
  }
  return { ...p, rows, plants, sampled: stride > 1 };
}
