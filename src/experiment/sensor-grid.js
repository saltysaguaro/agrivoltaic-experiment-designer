import { sensorTypes } from '../domain/study.js';
import { localToWorld, receiverGridSpec } from '../domain/geometry.js';
import { cropRows } from './crop-beds.js';
import { cellAt, cellCenter, normalizeLayout } from './grid-layout.js';
import { allFieldIds, uniqueFieldId } from './control-field.js';

export const sensorGridDefaults = Object.freeze({ rows: 3, columns: 10 });

// This planning grid chooses locations; it never changes numerical receivers.
export function sensorGrid(study, { rows, columns }) {
  if (![rows, columns].every((n) => Number.isInteger(n) && n >= 1 && n <= 50))
    throw Error('Enter whole numbers from 1 to 50 for grid rows and columns.');
  const areas = cropRows(study);
  if (!areas.length)
    throw Error(
      'No cropping areas are available. Use at least two PV rows with space between their no-crop strips.',
    );
  if (areas.length * rows * columns > 10000)
    throw Error(
      'Use fewer rows or columns; the selection preview supports up to 10,000 cells across the array.',
    );
  const grid = receiverGridSpec(study);
  return areas.map((area) => ({
    ...area,
    cells: Array.from({ length: rows * columns }, (_, i) => {
      const row = Math.floor(i / columns),
        column = i % columns;
      const target = localToWorld(
        study,
        area.x0 + ((column + 0.5) * (area.x1 - area.x0)) / columns,
        area.y1 - ((row + 0.5) * (area.y1 - area.y0)) / rows,
      );
      const cell = cellAt(study, target, grid);
      return {
        id: `${area.id}:${row}:${column}`,
        cropRow: area.id,
        row,
        column,
        target,
        grid: cell,
        position: cellCenter(study, cell, grid),
      };
    }),
  }));
}

export function planSensors(
  study,
  { rows, columns, selected, type },
  areas = sensorGrid(study, { rows, columns }),
) {
  if (!sensorTypes.includes(type)) throw Error('Choose a sensor type from the list.');
  const ids = new Set(selected);
  if (!ids.size) throw Error('Select at least one grid cell.');
  if (study.experimentSensors.length + ids.size > 500)
    throw Error(
      `This field supports 500 sensors; ${500 - study.experimentSensors.length} more can be added.`,
    );
  const cells = areas.flatMap((area) => area.cells).filter((cell) => ids.has(cell.id));
  if (cells.length !== ids.size) throw Error('The selected cells no longer match the sensor grid.');
  return cells;
}

export function addSensors(
  study,
  options,
  { control = false, reservedIds = allFieldIds(study) } = {},
) {
  const cells = planSensors(study, options),
    used = new Set(reservedIds);
  const sensors = cells.map((cell) => ({
    id: uniqueFieldId(control ? 'C-S' : 'S', used),
    type: options.type,
    x: cell.position.x,
    y: cell.position.y,
    grid: cell.grid,
    z: study.analysis.receiverHeight,
    treatment: control ? 'Control' : 'Interior',
    replicate: '1',
    model: '',
    logger: '',
    channel: '',
    azimuth: 0,
    tilt: 0,
    notes: `Bulk sensor layout: crop row ${cell.cropRow}, planning row ${cell.row + 1}, column ${cell.column + 1} (${options.rows} × ${options.columns} grid).`,
  }));
  return {
    study: normalizeLayout({
      ...study,
      experimentSensors: [...study.experimentSensors, ...sensors],
    }),
    selections: sensors.map((s) => ({ kind: 'sensor', id: s.id })),
  };
}
