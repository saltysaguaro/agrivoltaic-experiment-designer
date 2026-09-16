import { dimensions } from '../domain/study.js';
import { landUseZones, landUseSettings } from '../domain/land-use.js';
import { cropById, cropIdentity } from '../domain/crop-catalog.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { rowIndex } from '../domain/receiver-grid.js';
import { allFieldIds, uniqueFieldId } from './control-field.js';
import { normalizeLayout } from './grid-layout.js';

// Retain the physical PV-pair number even when another pair has no cultivable space.
export function cropRows(study) {
  const d = dimensions(study);
  const zones = landUseZones(study).zones.filter((z) => z.kind === 'cropping');
  const starts = Array.from(
    { length: study.array.rows - 1 },
    (_, i) =>
      i * study.rowPair.pitch +
      Math.floor(i / study.array.groupSize) * study.array.aisle -
      d.span / 2,
  );
  return zones.map((zone) => ({
    ...zone,
    id:
      starts.findIndex(
        (cy) => Math.abs(cy + landUseSettings(study).underPanelWidth / 2 - zone.y0) < 1e-8,
      ) + 1,
  }));
}

export function planCropBeds(study, { count, rowIds, cropId }) {
  if (!Number.isInteger(count) || count < 1 || count > 200)
    throw Error('Enter a whole number from 1 to 200 beds per crop row.');
  if (!cropById(cropId)) throw Error('Choose a crop from the catalog.');
  const rows = cropRows(study),
    selected = new Set(rowIds);
  if (!rows.length)
    throw Error(
      'No cropping areas are available. Use at least two PV rows with space between their no-crop strips.',
    );
  if (!selected.size) throw Error('Select at least one crop row.');
  if ([...selected].some((id) => !rows.some((r) => r.id === id)))
    throw Error('The crop-row selection no longer matches this array.');
  if (study.crops.length + selected.size * count > 200)
    throw Error(
      `This field supports 200 crop beds; ${200 - study.crops.length} more can be added.`,
    );
  return rows
    .filter((r) => selected.has(r.id))
    .flatMap((r) => {
      const width = (r.y1 - r.y0) / count,
        length = r.x1 - r.x0;
      if (length > 100 + 1e-9 || width > 100 + 1e-9)
        throw Error('Full-length beds must fit the software limit of 100 m in either direction.');
      if (width < 0.000001)
        throw Error('Use fewer beds; each bed must be at least 0.000001 m wide.');
      return Array.from({ length: count }, (_, i) => ({
        cropRow: r.id,
        x0: r.x0,
        x1: r.x1,
        y0: r.y0 + i * width,
        y1: r.y0 + (i + 1) * width,
      }));
    });
}

export function addCropBeds(
  study,
  options,
  { control = false, reservedIds = allFieldIds(study) } = {},
) {
  const plan = planCropBeds(study, options),
    g = receiverGridSpec(study),
    used = new Set(reservedIds);
  const crops = plan.map((b) => ({
    id: uniqueFieldId(control ? 'C-P' : 'P', used),
    ...cropIdentity(options.cropId),
    cultivar: '',
    notes: `Crop row ${b.cropRow} (bulk layout).`,
    treatment: control ? 'Control' : 'Interrow',
    replicate: '1',
    gridMode: 'exact',
    grid: {
      column: (b.x0 + g.width / 2) / g.dx,
      columns: (b.x1 - b.x0) / g.dx,
      row: rowIndex(g, b.y0),
      rows: rowIndex(g, b.y1) - rowIndex(g, b.y0),
    },
    x: 0,
    y: 0,
    width: b.x1 - b.x0,
    length: b.y1 - b.y0,
  }));
  return {
    study: normalizeLayout({ ...study, crops: [...study.crops, ...crops] }),
    selections: crops.map((c) => ({ kind: 'crop', id: c.id })),
  };
}
