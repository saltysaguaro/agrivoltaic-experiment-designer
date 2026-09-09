import { localToWorld } from '../domain/geometry.js';

// Display geometry only: shared by interactive and publication views, never
// passed to the irradiance solver. Grid spacing stays readable for large arrays.
export function groundGrid(study, geometry) {
  const buffer = Math.max(1, study.array.buffer);
  const width = geometry.length + 2 * buffer;
  const height = geometry.span + geometry.width + 2 * buffer;
  const target = Math.max(1, Math.max(width, height) / 60);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const spacing = [1, 2, 5, 10].find((n) => n * magnitude >= target) * magnitude;
  const x = Math.ceil(width / 2 / spacing) * spacing;
  const y = Math.ceil(height / 2 / spacing) * spacing;
  const point = (a, b) => localToWorld(study, a, b, 0);
  const lines = [];
  for (let i = -Math.round(x / spacing); i <= Math.round(x / spacing); i++)
    lines.push([point(i * spacing, -y), point(i * spacing, y)]);
  for (let i = -Math.round(y / spacing); i <= Math.round(y / spacing); i++)
    lines.push([point(-x, i * spacing), point(x, i * spacing)]);
  return {
    spacing,
    corners: [point(-x, -y), point(x, -y), point(x, y), point(-x, y)],
    lines,
  };
}
