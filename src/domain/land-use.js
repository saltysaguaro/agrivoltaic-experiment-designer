import { dimensions } from './study.js';
import { localToWorld, worldToLocal } from './geometry.js';

// Planning overlays only. These rectangles never enter scientific occluders.
export const zoneStyles = {
  underPanel: {
    symbol: 'U',
    label: 'Under-row no-crop strip',
    color: '#a05a31',
    hatch: 'diagonal',
  },
  setback: { symbol: 'S', label: 'PV-edge crop setback', color: '#a17c17', hatch: 'dots' },
  maintenance: { symbol: 'M', label: 'Maintenance lane', color: '#64717a', hatch: 'cross' },
  perimeter: {
    symbol: 'B',
    label: 'Perimeter no-crop buffer',
    color: '#81598b',
    hatch: 'diagonal',
  },
};
export const landUseDefaults = { underPanelWidth: 1, perimeterBuffer: 3 };
export const landUseSettings = (s) => s.landUse || landUseDefaults;
export const landUseDefinition =
  'U: continuous no-crop strip centred on each row axis, including table gaps. S: outside each PV edge at the displayed pose. M: centred between adjacent row axes. B: outward from the design envelope (row length × axis span plus untilted assembly width). Zones may overlap; they are planning reservations, not shadows or a tracker swept-clearance certification. Receiver-area statistics include reserved zones.';

export function landUseZones(s, geometry = null) {
  const d = dimensions(s),
    settings = landUseSettings(s);
  const g = geometry || {
    length: d.length,
    width: d.width,
    span: d.span,
    rowOffsets: Array.from(
      { length: s.array.rows },
      (_, i) =>
        i * s.rowPair.pitch + Math.floor(i / s.array.groupSize) * s.array.aisle - d.span / 2,
    ),
  };
  const x = g.length / 2,
    y = (g.span + g.width) / 2;
  const rect = (kind, x0, y0, x1, y1) => ({
    kind,
    x0,
    y0,
    x1,
    y1,
    corners: [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ].map(([a, b]) => localToWorld(s, a, b)),
  });
  const zones = [];
  const add = (...args) => {
    const r = rect(...args);
    if (r.x1 - r.x0 > 1e-9 && r.y1 - r.y0 > 1e-9) zones.push(r);
  };
  const tilt =
    s.racking.type === 'vertical' ? 90 : s.racking.type === 'pergola' ? 0 : s.racking.tilt;
  const angle = (tilt * Math.PI) / 180;
  const edge = (g.width * Math.cos(angle) + s.module.thickness * Math.abs(Math.sin(angle))) / 2;
  for (const cy of g.rowOffsets) {
    add('underPanel', -x, cy - settings.underPanelWidth / 2, x, cy + settings.underPanelWidth / 2);
    add('setback', -x, cy - edge - s.rowPair.cropSetback, x, cy - edge);
    add('setback', -x, cy + edge, x, cy + edge + s.rowPair.cropSetback);
  }
  for (let i = 1; i < g.rowOffsets.length; i++) {
    const cy = (g.rowOffsets[i - 1] + g.rowOffsets[i]) / 2;
    add('maintenance', -x, cy - s.rowPair.maintenance / 2, x, cy + s.rowPair.maintenance / 2);
  }
  const b = settings.perimeterBuffer;
  // Four non-overlapping rectangles form the ring, including its corners.
  add('perimeter', -x - b, -y - b, x + b, -y);
  add('perimeter', -x - b, y, x + b, y + b);
  add('perimeter', -x - b, -y, -x, y);
  add('perimeter', x, -y, x + b, y);
  return {
    zones,
    envelope: rect('envelope', -x, -y, x, y),
    outer: rect('outer', -x - b, -y - b, x + b, y + b),
  };
}

// Exact union area of axis-aligned rectangles in the array coordinate system.
// Sweep x slabs so intersecting reservations are never counted twice.
export function rectangleUnionArea(rectangles) {
  const rs = rectangles.filter((r) => r.x1 > r.x0 && r.y1 > r.y0);
  const xs = [...new Set(rs.flatMap((r) => [r.x0, r.x1]))].sort((a, b) => a - b);
  let area = 0;
  for (let i = 1; i < xs.length; i++) {
    const intervals = rs
      .filter((r) => r.x0 < xs[i] && r.x1 > xs[i - 1])
      .map((r) => [r.y0, r.y1])
      .sort((a, b) => a[0] - b[0]);
    let end = -Infinity,
      height = 0;
    for (const [a, b] of intervals) {
      height += Math.max(0, b - Math.max(a, end));
      end = Math.max(end, b);
    }
    area += (xs[i] - xs[i - 1]) * height;
  }
  return area;
}
export function plotZoneOverlap(s, plot, zones = landUseZones(s).zones) {
  const p = worldToLocal(s, plot.x, plot.y);
  // Layout normalization aligns imported plots with the array before rendering.
  const clipped = zones.map((z) => ({
    ...z,
    x0: Math.max(z.x0, p.x - plot.width / 2),
    x1: Math.min(z.x1, p.x + plot.width / 2),
    y0: Math.max(z.y0, p.y - plot.length / 2),
    y1: Math.min(z.y1, p.y + plot.length / 2),
  }));
  return rectangleUnionArea(clipped);
}
export function landUseSummary(s) {
  const { zones, outer } = landUseZones(s);
  return {
    reservedArea: rectangleUnionArea(zones),
    outerArea: (outer.x1 - outer.x0) * (outer.y1 - outer.y0),
    conflicts: s.crops
      .map((p) => ({ id: p.id, area: plotZoneOverlap(s, p, zones) }))
      .filter((p) => p.area > 1e-6),
  };
}
