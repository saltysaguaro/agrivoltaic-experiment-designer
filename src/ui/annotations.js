import { Vector3 } from 'three';
import { dimensions, cropSpacing } from '../domain/study.js';
import { localToWorld, getPose, receiverGridSpec } from '../domain/geometry.js';
import { landUseSettings } from '../domain/land-use.js';
import { plotCorners } from '../experiment/grid-layout.js';
import { inputHelp, labelHelp } from './help.js';

const labels = {
  'module.length': ['L', 'Module length', 'm'],
  'module.width': ['W', 'Module width', 'm'],
  'module.thickness': ['t', 'Frame thickness', 'm'],
  'module.gap': ['g', 'Module gap', 'm'],
  'racking.height': ['H', 'Axis height', 'm'],
  'racking.tilt': ['θ', 'Fixed / preview tilt', '°'],
  'racking.limit': ['θmax', 'Rotation limit', '°'],
  'racking.postSize': ['p', 'Post width', 'm'],
  'table.high': ['Nc', 'Modules across'],
  'table.wide': ['Nl', 'Modules along'],
  'row.tables': ['Nt', 'Tables per row'],
  'row.tableGap': ['Gt', 'Table gap', 'm'],
  'rowPair.pitch': ['P', 'Row pitch', 'm'],
  'rowPair.cropSetback': ['S', 'PV-edge setback', 'm'],
  'rowPair.croppingWidth': ['C', 'Cropping width', 'm'],
  'landUse.underPanelWidth': ['U', 'Under-row no-crop width', 'm'],
  'landUse.perimeterBuffer': ['B', 'Perimeter no-crop buffer', 'm'],
  'array.rows': ['Nr', 'PV rows'],
  'array.azimuth': ['α', 'Facing azimuth', '°'],
  'array.buffer': ['R', 'Receiver buffer', 'm'],
  'array.groupSize': ['Ng', 'Rows per group'],
  'array.aisle': ['A', 'Extra group aisle', 'm'],
  'analysis.resolution': ['Δ', 'Nominal receiver spacing', 'm'],
  'analysis.receiverHeight': ['Hr', 'Receiver height', 'm'],
};
const defaults = {
  module: ['module.length', 'module.width'],
  racking: ['racking.height', 'racking.tilt'],
  row: ['table.high', 'row.tables', 'row.tableGap'],
  pair: ['rowPair.pitch', 'landUse.underPanelWidth', 'rowPair.croppingWidth'],
  array: ['array.rows', 'landUse.perimeterBuffer', 'array.buffer'],
  environment: ['site.latitude'],
  irradiance: [],
  sensors: ['experimentSensors.0.z'],
  crops: ['crops.0.grid.columns'],
  report: [
    'landUse.underPanelWidth',
    'rowPair.cropSetback',
    'rowPair.croppingWidth',
    'landUse.perimeterBuffer',
  ],
};
export function engineeringAnnotations(s, scope, group, focus = null) {
  if (scope === 'irradiance') return [];
  const spacing = cropSpacing(s);
  const d = dimensions(s),
    g = group.userData,
    settings = landUseSettings(s);
  const p = (x, y, z = 0) => localToWorld(s, x, y, z);
  const cy = g.rowOffsets[0] || 0,
    cy1 = g.rowOffsets[1];
  const tilt = (getPose(s).tilt * Math.PI) / 180,
    h = scope === 'module' ? 0 : s.racking.height;
  const surface = (x, y, row = cy) => p(x, row + y * Math.cos(tilt), h + y * Math.sin(tilt));
  const projectedEdge =
    (g.width * Math.cos(tilt) + s.module.thickness * Math.abs(Math.sin(tilt))) / 2;
  const first = group.children.find((o) => o.userData.kind === 'module');
  const modulePoint = (x, y, z) => new Vector3(x, y, z).applyMatrix4(first.matrixWorld);
  const ids = focus ? [focus.id] : defaults[scope] || defaults.array;
  return ids.map((id) => {
    const named = labels[id];
    let value = id.split('.').reduce((o, key) => o?.[key], s);
    if (id === 'rowPair.cropSetback') value = spacing.cropSetback;
    if (id === 'rowPair.croppingWidth') value = spacing.croppingWidth;
    if (id.startsWith('landUse.')) value = settings[id.split('.')[1]];
    if (typeof value === 'number') value = Number(value.toFixed(4));
    if (/\.grid\.(column|row)$/.test(id) && typeof value === 'number') value++;
    const label = focus?.label || named?.[1] || id.split('.').at(-1);
    const unit = focus?.unit || named?.[2] || '';
    const a = {
      id,
      symbol: named?.[0] || '•',
      label,
      value: `${value === undefined || value === '' ? 'Not specified' : value}${unit ? ' ' + unit : ''}`,
      detail: focus?.help || inputHelp[id] || labelHelp[label] || '',
      kind: 'context',
      points: [],
      active: Boolean(focus),
    };
    const dimension = (from, to, note) => {
      a.kind = 'dimension';
      a.external =
        /^(module|table|racking|row)\./.test(id) || ['array.rows', 'array.groupSize'].includes(id);
      a.points = [from, to];
      if (note) a.detail = note;
    };
    const along = d.along / 2,
      cross = d.cross / 2,
      thick = s.module.thickness / 2;
    if (id === 'module.length' || id === 'module.width') {
      const isAlong = (id === 'module.width') === (s.table.orientation === 'portrait');
      dimension(
        modulePoint(-along, -cross, thick),
        modulePoint(isAlong ? along : -along, isAlong ? -cross : cross, thick),
      );
    } else if (id === 'module.thickness')
      dimension(modulePoint(along, -cross, -thick), modulePoint(along, -cross, thick));
    else if (id === 'module.gap')
      dimension(
        modulePoint(along, -cross, thick),
        modulePoint(along + s.module.gap, -cross, thick),
        'Clear gap beyond this frame; repeats between modules when a table is assembled.',
      );
    else if (id === 'racking.height') dimension(p(0, cy), p(0, cy, h));
    else if (id === 'racking.postSize') {
      const post = group.children.find((o) => o.userData.kind === 'post');
      if (post)
        dimension(
          post.position.clone().add(new Vector3(-s.racking.postSize / 2, 0, 0)),
          post.position.clone().add(new Vector3(s.racking.postSize / 2, 0, 0)),
        );
    } else if (id === 'racking.tilt' || id === 'racking.limit') {
      const limit = id.endsWith('limit'),
        angle = limit ? (s.racking.limit * Math.PI) / 180 : tilt;
      a.value = `${limit ? '±' : ''}${limit ? s.racking.limit : getPose(s).tilt}°`;
      const radius = g.width * 0.7;
      a.kind = 'angle';
      a.points = [
        p(0, cy, h),
        ...Array.from({ length: 25 }, (_, i) => {
          const t =
            limit && s.racking.type === 'single-axis'
              ? -angle + (2 * angle * i) / 24
              : (angle * i) / 24;
          return p(0, cy + radius * Math.cos(t), h + radius * Math.sin(t));
        }),
      ];
      if (limit && s.racking.type === 'dual-axis') a.value = `0–${s.racking.limit}° tilt`;
    } else if (id === 'table.high')
      dimension(surface(-g.length / 2, -g.width / 2), surface(-g.length / 2, g.width / 2));
    else if (id === 'table.wide')
      dimension(
        surface(-g.length / 2, -g.width / 2),
        surface(-g.length / 2 + d.tableLength, -g.width / 2),
      );
    else if (id === 'row.tables') dimension(surface(-g.length / 2, 0), surface(g.length / 2, 0));
    else if (id === 'row.tableGap')
      dimension(
        surface(-g.length / 2 + d.tableLength, 0),
        surface(-g.length / 2 + d.tableLength + s.row.tableGap, 0),
        s.row.tables === 1 ? 'Gap to the next table, once another table is added.' : a.detail,
      );
    else if (id === 'rowPair.pitch' && cy1 !== undefined) {
      dimension(p(-g.length / 2, cy), p(-g.length / 2, cy + s.rowPair.pitch));
      if (cy1 - cy > s.rowPair.pitch + 1e-6)
        a.detail += ' The displayed pair also includes the extra group aisle.';
    } else if (id === 'landUse.underPanelWidth')
      dimension(
        p(-g.length * 0.25, cy - settings.underPanelWidth / 2),
        p(-g.length * 0.25, cy + settings.underPanelWidth / 2),
      );
    else if (id === 'rowPair.cropSetback')
      dimension(
        p(g.length * 0.15, cy + projectedEdge),
        p(g.length * 0.15, cy + settings.underPanelWidth / 2),
      );
    else if (id === 'rowPair.croppingWidth' && cy1 !== undefined) {
      dimension(
        p(g.length * 0.35, cy + settings.underPanelWidth / 2),
        p(g.length * 0.35, cy1 - settings.underPanelWidth / 2),
        cy1 - cy > s.rowPair.pitch + 1e-6
          ? 'The marked gap includes the extra group aisle; C is the regular cropping width.'
          : a.detail,
      );
      if (cy1 - cy > s.rowPair.pitch + 1e-6) {
        a.symbol = 'C + A';
        a.value = `${Number((cy1 - cy - settings.underPanelWidth).toFixed(4))} m`;
        a.detail = `Regular cropping width C = ${Number(spacing.croppingWidth.toFixed(4))} m; extra group aisle A = ${s.array.aisle} m. The witness spans their combined width.`;
      }
    } else if (id === 'landUse.perimeterBuffer' || id === 'array.buffer') {
      const b = id === 'array.buffer' ? s.array.buffer : settings.perimeterBuffer;
      dimension(
        p(g.length / 2, id === 'array.buffer' ? g.span / 2 : -g.span / 2),
        p(g.length / 2 + b, id === 'array.buffer' ? g.span / 2 : -g.span / 2),
      );
    } else if (id === 'array.rows') dimension(p(0, cy), p(0, g.rowOffsets.at(-1)));
    else if (id === 'array.groupSize')
      dimension(
        p(g.length / 2, cy),
        p(g.length / 2, g.rowOffsets[Math.min(s.array.groupSize, g.rowOffsets.length) - 1]),
      );
    else if (id === 'array.aisle') {
      const prev = g.rowOffsets[s.array.groupSize - 1];
      if (g.rowOffsets.length > s.array.groupSize)
        dimension(
          p(0, prev + s.rowPair.pitch / 2),
          p(0, prev + s.rowPair.pitch / 2 + s.array.aisle),
        );
      else
        a.detail =
          'No group boundary in this view. This extra spacing appears once the array has more rows than one group.';
    } else if (id === 'array.azimuth') {
      const radius = Math.min(g.length, g.span + g.width) * 0.35;
      a.kind = 'angle';
      a.points = [
        p(0, 0),
        ...Array.from({ length: 37 }, (_, i) => {
          const angle = (((s.array.azimuth * Math.PI) / 180) * i) / 36;
          return new Vector3(radius * Math.sin(angle), radius * Math.cos(angle), 0);
        }),
      ];
    } else if (id.startsWith('analysis.')) {
      const grid = receiverGridSpec(s),
        x = -grid.width / 2 + grid.dx / 2,
        y = -grid.height / 2 + grid.dy / 2;
      if (id === 'analysis.receiverHeight') dimension(p(x, y), p(x, y, s.analysis.receiverHeight));
      if (id === 'analysis.resolution') {
        dimension(
          p(-grid.width / 2, -grid.height / 2),
          p(-grid.width / 2 + grid.dx, -grid.height / 2),
        );
        a.detail = `Actual cells: ${grid.dx.toFixed(3)} × ${grid.dy.toFixed(3)} m; ${grid.nx} columns × ${grid.ny} rows. The marked edge is one actual cell.`;
      }
    } else if (id.startsWith('experimentSensors.')) {
      const sensor = s.experimentSensors[Number(id.split('.')[1])];
      if (sensor) {
        a.symbol = sensor.id;
        a.kind = 'leader';
        a.points = [new Vector3(sensor.x, sensor.y, sensor.z)];
        if (id.endsWith('.z')) dimension(new Vector3(sensor.x, sensor.y, 0), a.points[0]);
        a.detail ||= `Selected instrument ${sensor.id}; installation metadata. Ground-light values describe horizontal receivers.`;
      } else {
        a.label = 'Field instruments';
        a.value = 'Place an instrument';
        a.detail = 'Select a receiver cell, then set its installation height or burial depth.';
      }
    } else if (id.startsWith('crops.')) {
      const crop = s.crops[Number(id.split('.')[1])];
      if (crop) {
        a.symbol = crop.id;
        a.kind = 'outline';
        a.points = plotCorners(s, crop);
        a.detail ||= `${crop.width.toFixed(3)} × ${crop.length.toFixed(3)} m; whole receiver cells. Non-cultivated and cropping areas share their boundaries.`;
      } else {
        a.label = 'Crop plots';
        a.value = 'Place a plot';
        a.detail =
          'Select whole receiver cells. Check the reserved land-use zones before assigning a crop.';
      }
    } else if (id.startsWith('module.') || id.startsWith('racking.') || id.startsWith('table.')) {
      a.kind = 'leader';
      a.points = [first.position.clone()];
    }
    return a;
  });
}
