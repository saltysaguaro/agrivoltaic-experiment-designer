import {
  defaultIrrigation,
  irrigationMethod,
  irrigationReferenceIssues,
  irrigationUnitSchema,
} from '../domain/irrigation.js';
import { localToWorld, worldToLocal } from '../domain/geometry.js';
import { rowEdge, cellLocal } from '../domain/receiver-grid.js';
import { designGridSpec } from './design-grid.js';
import { cellAt, cellCenter, normalizeLayout } from './grid-layout.js';
import { allFieldIds, uniqueFieldId } from './control-field.js';
import { plantingSummary } from '../domain/crop-planting.js';

export function normalizeIrrigation(study) {
  const g = designGridSpec(study);
  if (g.exceeded) return study.irrigationUnits || [];
  return (study.irrigationUnits || []).map((unit) => {
    const u = { ...unit },
      bed = u.link && study.crops.find((c) => c.id === u.link.bedId);
    let p;
    if (bed) {
      const b = worldToLocal(study, bed.x, bed.y);
      p = { x: b.x + u.link.along, y: b.y + u.link.across };
      if (u.link.followLength) {
        if (u.kind === 'line') u.length = bed.width;
        if (u.kind === 'area') {
          u.length = bed.width;
          u.width = bed.length;
        }
      }
    } else if (u.grid) {
      const grid = {
        column: Math.max(0, Math.min(g.nx - 1, u.grid.column)),
        row: Math.max(0, Math.min(g.ny - 1, u.grid.row)),
      };
      const c = cellLocal(g, grid.column, grid.row);
      p = { x: c.x + (u.offsetX || 0), y: c.y + (u.offsetY || 0) };
    } else p = worldToLocal(study, u.x, u.y);
    p.x = Math.max(-g.width / 2, Math.min(g.width / 2 - 1e-9, p.x));
    p.y = Math.max(rowEdge(g, 0), Math.min(rowEdge(g, g.ny) - 1e-9, p.y));
    const world = localToWorld(study, p.x, p.y),
      grid = cellAt(study, world, g),
      c = cellLocal(g, grid.column, grid.row);
    return { ...u, grid, x: world.x, y: world.y, offsetX: p.x - c.x, offsetY: p.y - c.y };
  });
}
export function irrigationGeometry(study, u, { profile = false } = {}) {
  const centre = worldToLocal(study, u.x, u.y),
    angle = ((u.angle || 0) * Math.PI) / 180;
  const point = (x, y, z = profile ? u.z : 0.075) => {
    const p = localToWorld(
      study,
      centre.x + x * Math.cos(angle) - y * Math.sin(angle),
      centre.y + x * Math.sin(angle) + y * Math.cos(angle),
    );
    return { x: p.x, y: p.y, z };
  };
  const lines = [],
    markers = [],
    coverage = [];
  if (u.kind === 'line') {
    lines.push([point(-u.length / 2, 0), point(u.length / 2, 0)]);
    if (u.emitterSpacing) {
      const n = Math.max(0, Math.floor((u.length - u.emitterOffset) / u.emitterSpacing + 1e-9) + 1),
        stride = Math.max(1, Math.ceil(n / 200));
      for (let i = 0; i < n; i += stride)
        markers.push(point(-u.length / 2 + u.emitterOffset + i * u.emitterSpacing, 0));
    } else {
      lines.push([
        point(u.length / 2 - 0.2, -0.1),
        point(u.length / 2, 0),
        point(u.length / 2 - 0.2, 0.1),
      ]);
    }
  } else if (u.kind === 'area') {
    lines.push([
      point(-u.length / 2, -u.width / 2),
      point(u.length / 2, -u.width / 2),
      point(u.length / 2, u.width / 2),
      point(-u.length / 2, u.width / 2),
      point(-u.length / 2, -u.width / 2),
    ]);
    // Distinguishable hatched treatment area; no inferred wetting prediction.
    for (let i = 1; i <= 6; i++)
      lines.push([
        point(-u.length / 2, u.width * (i / 7 - 0.5)),
        point(u.length / 2, u.width * (i / 7 - 0.5)),
      ]);
    markers.push(point(-u.length / 2, (u.inletOffset || 0) * u.width));
  } else markers.push(point(0, 0));
  if (u.radius) {
    const arc = Array.from({ length: 49 }, (_, i) => {
      const a = (((i / 48) * u.arc - u.arc / 2) * Math.PI) / 180;
      return point(u.radius * Math.cos(a), u.radius * Math.sin(a));
    });
    coverage.push(u.arc === 360 ? arc : [point(0, 0), ...arc, point(0, 0)]);
  }
  return { lines, markers, coverage, centre: point(0, 0), dashed: u.method === 'subsurface-drip' };
}
export function irrigationBedWarnings(study) {
  return (study.irrigationUnits || []).flatMap((u) => {
    const bed = u.link && study.crops.find((c) => c.id === u.link.bedId);
    if (!bed) return [];
    return Math.abs(u.link.across) >= bed.length / 2 || Math.abs(u.link.along) > bed.width / 2
      ? [`${u.id} lies outside linked bed ${bed.id}; edit its offsets or regenerate linked units.`]
      : [];
  });
}
export function planIrrigation(study, options) {
  const method = options.method || 'drip',
    rainfed = method === 'rainfed';
  const base = rainfed
    ? null
    : irrigationUnitSchema.parse({
        ...defaultIrrigation(method),
        ...options.unit,
        method,
        kind: irrigationMethod(method)[2],
      });
  const beds = study.crops.filter((c) => (options.bedIds || []).includes(c.id));
  if ((options.bedIds || []).some((id) => !beds.some((b) => b.id === id)))
    throw Error('A selected bed no longer exists.');
  const units = [];
  const push = (x, y, extra = {}) => {
    if (units.length >= 500) throw Error('A field supports at most 500 irrigation units.');
    units.push({ ...base, ...extra, ...localToWorld(study, x, y), z: base.z, grid: undefined });
  };
  if (options.placement === 'beds' || rainfed) {
    if (!beds.length) throw Error('Select at least one crop bed.');
    if (!rainfed)
      for (const bed of beds) {
        const b = worldToLocal(study, bed.x, bed.y),
          p = plantingSummary(bed);
        if (p.issue) throw Error(`${bed.id}: ${p.issue}`);
        if (base.kind === 'area')
          push(b.x, b.y, {
            length: bed.width,
            width: bed.length,
            link: { bedId: bed.id, along: 0, across: 0, followLength: true },
          });
        else if (base.kind === 'line') {
          const count = options.followRows !== false ? p.rowCount : Number(options.laterals || 1);
          const spacing =
            options.followRows !== false ? p.rowSpacing : Number(options.lateralSpacing || 0.3);
          if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 100 ||
            !Number.isFinite(spacing) ||
            spacing <= 0
          )
            throw Error('Use 1–100 laterals and a positive spacing.');
          if ((count - 1) * spacing >= bed.length && count > 1)
            throw Error(`Laterals do not fit bed ${bed.id}.`);
          for (let i = 0; i < count; i++) {
            const across = (i - (count - 1) / 2) * spacing + (Number(options.bedOffset) || 0);
            if (Math.abs(across) >= bed.length / 2)
              throw Error(`Lateral offset leaves bed ${bed.id}.`);
            push(b.x, b.y + across, {
              length: bed.width,
              link: { bedId: bed.id, along: 0, across, followLength: true },
            });
          }
        } else {
          if (options.atPlants) {
            if (units.length + p.positions > 500)
              throw Error(
                'Plant placement exceeds 500 irrigation units; use drip laterals or fewer beds.',
              );
            for (let i = 0; i < p.rowCount; i++)
              for (let j = 0; j < p.plantsPerRow; j++) {
                const along = (j - (p.plantsPerRow - 1) / 2) * p.plantSpacing,
                  across = (i - (p.rowCount - 1) / 2) * p.rowSpacing;
                push(b.x + along, b.y + across, {
                  link: { bedId: bed.id, along, across, followLength: false },
                });
              }
          } else
            push(b.x, b.y, { link: { bedId: bed.id, along: 0, across: 0, followLength: false } });
        }
      }
  } else {
    const countX = options.placement === 'single' ? 1 : Number(options.columns || 1),
      countY = options.placement === 'single' ? 1 : Number(options.rows || 1);
    if (
      ![countX, countY].every((n) => Number.isInteger(n) && n >= 1 && n <= 100) ||
      countX * countY > 500
    )
      throw Error('Use positive whole counts with at most 500 units.');
    const dx = Number(options.spacingX ?? 2),
      dy = Number(options.spacingY ?? 2),
      x = Number(options.x ?? 0),
      y = Number(options.y ?? 0);
    if (![dx, dy, x, y].every(Number.isFinite) || dx <= 0 || dy <= 0)
      throw Error('Enter finite coordinates and positive unit spacing.');
    for (let j = 0; j < countY; j++)
      for (let i = 0; i < countX; i++)
        push(
          x + (i - (countX - 1) / 2) * dx + (options.staggered && j % 2 ? dx / 2 : 0),
          y + (j - (countY - 1) / 2) * dy,
        );
  }
  const g = designGridSpec(study);
  if (g.exceeded) throw Error('Reduce design-grid detail before adding irrigation.');
  for (const u of units) {
    if (!cellAt(study, u, g, false))
      throw Error(
        'One or more irrigation centres lie outside the design grid. Adjust counts, spacing or location.',
      );
    if (options.snap && options.placement !== 'beds') {
      const c = cellCenter(study, cellAt(study, u, g), g);
      u.x = c.x;
      u.y = c.y;
    }
    if (u.emitterOffset > u.length) throw Error('Emitter offset cannot exceed lateral length.');
  }
  const replaced = options.replaceLinked
    ? (study.irrigationUnits || []).filter((u) => u.link && beds.some((b) => b.id === u.link.bedId))
    : [];
  if ((study.irrigationUnits || []).length - replaced.length + units.length > 500)
    throw Error('A field supports at most 500 irrigation units.');
  return {
    units,
    beds,
    replaced,
    totalLength: units.filter((u) => u.kind === 'line').reduce((n, u) => n + u.length, 0),
  };
}
export function addIrrigation(
  study,
  options,
  { control = false, reservedIds = allFieldIds(study) } = {},
) {
  const plan = planIrrigation(study, options),
    used = new Set(reservedIds);
  let zones = [...(study.irrigationZones || [])],
    zoneId = options.zoneId || '';
  if (zoneId && !zones.some((z) => z.id === zoneId))
    throw Error('Choose an existing irrigation zone.');
  if (!zoneId) {
    if (zones.length >= 200) throw Error('A field supports 200 irrigation zones.');
    zoneId = uniqueFieldId(control ? 'C-Z' : 'Z', used);
    zones.push({
      version: 1,
      id: zoneId,
      name: options.zoneName || `Zone ${zoneId}`,
      kind: options.method === 'rainfed' ? 'rainfed' : 'irrigated',
      bedIds: plan.beds.map((b) => b.id),
      treatment:
        options.treatment ||
        (options.method === 'rainfed' ? 'Rainfed' : control ? 'Control' : 'Irrigated'),
      replicate: options.replicate || '1',
      waterSource: options.waterSource || '',
      notes: options.notes || '',
    });
  } else {
    const zone = zones.find((z) => z.id === zoneId);
    if ((zone.kind === 'rainfed') !== (options.method === 'rainfed'))
      throw Error(
        'Rainfed zones cannot contain irrigation hardware. Choose a matching zone or create a new one.',
      );
    zones = zones.map((z) =>
      z.id === zoneId
        ? { ...z, bedIds: [...new Set([...z.bedIds, ...plan.beds.map((b) => b.id)])] }
        : z,
    );
  }
  const zone = zones.find((z) => z.id === zoneId);
  const units = plan.units.map((u) => ({
    ...u,
    id: uniqueFieldId(control ? 'C-I' : 'I', used),
    zoneId,
    treatment: zone.treatment,
    replicate: zone.replicate,
  }));
  const next = normalizeLayout({
    ...study,
    irrigationZones: zones,
    irrigationUnits: [
      ...(study.irrigationUnits || []).filter((u) => !plan.replaced.some((r) => r.id === u.id)),
      ...units,
    ],
  });
  const issues = irrigationReferenceIssues(next);
  if (issues.length) throw Error(issues.join(' '));
  return { study: next, selections: units.map((u) => ({ kind: 'irrigation', id: u.id })) };
}
