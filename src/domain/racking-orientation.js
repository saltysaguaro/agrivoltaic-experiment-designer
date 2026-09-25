// Stored azimuth is the positive-tilt facing direction, perpendicular to rows.
// Keep this convention for saved studies, field layouts and solver geometry.
export const northSouthRowsRequired = (type) => ['single-axis', 'vertical'].includes(type);

// Normalize at the Study boundary, including browser restores and file imports.
// Rotate existing coordinates with the array so legacy layouts without grid
// indices retain their locations relative to the rows.
export function normalizeRackingOrientation(s) {
  if (!northSouthRowsRequired(s.racking.type) || s.array.azimuth === 90) return s;
  const angle = ((90 - s.array.azimuth) * Math.PI) / 180;
  const rotate = (items) =>
    items.map((item) => ({
      ...item,
      x: item.x * Math.cos(angle) + item.y * Math.sin(angle),
      y: -item.x * Math.sin(angle) + item.y * Math.cos(angle),
    }));
  return {
    ...s,
    array: { ...s.array, azimuth: 90 },
    experimentSensors: rotate(s.experimentSensors),
    crops: rotate(s.crops),
    ...(s.controlField
      ? {
          controlField: {
            ...s.controlField,
            experimentSensors: rotate(s.controlField.experimentSensors),
            crops: rotate(s.controlField.crops),
          },
        }
      : {}),
  };
}

export function defaultRackingAzimuth(type, latitude) {
  if (['single-axis', 'dual-axis', 'vertical'].includes(type)) return 90;
  return latitude < 0 ? 0 : 180;
}

export function rackingOrientation(s) {
  const facing = s.array.azimuth;
  const rowAzimuth = (facing + 90) % 180;
  const rowDirection =
    rowAzimuth === 0
      ? 'north–south'
      : rowAzimuth === 90
        ? 'east–west'
        : `${rowAzimuth}° / ${rowAzimuth + 180}°`;
  const rows = `Rows run ${rowDirection} (${rowAzimuth}° clockwise from north).`;
  switch (s.racking.type) {
    case 'single-axis':
      return {
        label: 'Tracking reference azimuth',
        rowAzimuth,
        description: `${rows} Orientation is locked: panels track east–west around a north–south axis.`,
      };
    case 'dual-axis':
      return {
        label: 'Layout / preview azimuth',
        rowAzimuth,
        description: `${rows} Preview faces ${facing}°; during calculation, tilt and facing direction follow the sun within the tilt limit.`,
      };
    case 'vertical':
      return {
        label: 'Front-face azimuth',
        rowAzimuth,
        description: `${rows} Orientation is locked: the two vertical module faces point east and west.`,
      };
    case 'pergola':
      return {
        label:
          (s.racking.pergolaTilt ?? 0) > 0 ? 'Module-facing azimuth' : 'Layout reference azimuth',
        rowAzimuth,
        description:
          (s.racking.pergolaTilt ?? 0) > 0
            ? `${rows} Pergola modules have a fixed ${s.racking.pergolaTilt}° tilt above horizontal and face ${facing}° clockwise from north.`
            : `${rows} Modules face upward at 0° tilt. This reference sets their facing direction when tilt is increased.`,
      };
    default:
      return {
        label: 'Module-facing azimuth',
        rowAzimuth,
        description: `${rows} Tilted modules face ${facing}° clockwise from north. Default: ${s.site.latitude < 0 ? 'north-facing (0°) in the southern hemisphere' : 'south-facing (180°) in the northern hemisphere (also used at the equator)'}.`,
      };
  }
}
