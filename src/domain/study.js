import { z } from 'zod';
export const VERSION = '0.1.0';
const num = (min, max) => z.number().finite().min(min).max(max),
  count = (min, max) => num(min, max).int();
const text = z.string().max(500);
export const sensorTypes = [
  'PAR',
  'Pyranometer',
  'Soil moisture + temperature',
  'Soil moisture',
  'Soil temperature',
  'Air temperature / RH',
  'Weather station',
  'Anemometer',
  'Rain gauge',
  'Leaf temperature',
  'Custom',
];
export const studySchema = z.object({
  schemaVersion: z.literal(1),
  metadata: z.object({ title: text, investigator: text, units: z.literal('SI') }),
  module: z.object({
    length: num(0.1, 5),
    width: num(0.1, 3),
    thickness: num(0.005, 0.2),
    power: num(1, 1500),
    gap: num(0, 0.5),
  }),
  racking: z.object({
    type: z.enum(['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola']),
    tilt: num(0, 85),
    height: num(0.2, 25),
    limit: num(0, 85),
    backtracking: z.boolean(),
    postSize: num(0.02, 0.5),
  }),
  table: z.object({
    high: count(1, 5),
    wide: count(1, 20),
    orientation: z.enum(['portrait', 'landscape']),
  }),
  row: z.object({ tables: count(1, 20), tableGap: num(0.05, 30) }),
  rowPair: z.object({ pitch: num(0.5, 120), cropSetback: num(0, 5), maintenance: num(0, 5) }),
  array: z.object({
    rows: count(1, 24),
    azimuth: num(0, 359.9),
    buffer: num(0, 20),
    groupSize: count(1, 24),
    aisle: num(0, 20),
  }),
  site: z.object({
    latitude: num(-89, 89),
    longitude: num(-180, 180),
    utcOffset: num(-12, 14),
    elevation: num(-500, 9000),
  }),
  analysis: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const t = Date.parse(v + 'T12:00:00Z');
        return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === v;
      }, 'Use a valid calendar date'),
    resolution: num(0.25, 5),
    receiverHeight: num(0, 5),
    interval: z.union([z.literal(5), z.literal(10), z.literal(15)]),
    patches: z.union([z.literal(145), z.literal(577), z.literal(2305)]),
    parFraction: num(0.3, 0.6),
    photonFactor: num(3, 6),
    backend: z.enum(['auto', 'cpu', 'gpu']),
  }),
  weather: z.object({
    mode: z.enum(['automatic', 'upload', 'sample']).default('upload'),
    requestKey: z.string().default(''),
    provenance: z
      .object({
        url: z.string(),
        model: z.string(),
        retrievedAt: z.string(),
        attribution: z.string(),
        gridLatitude: z.number().optional(),
        gridLongitude: z.number().optional(),
        gridElevation: z.number().optional(),
      })
      .optional(),
    name: text,
    hash: text,
    format: text,
    rows: z
      .array(
        z.object({
          minute: num(0, 1440),
          duration: num(1, 180),
          ghi: num(0, 1500),
          dni: num(0, 1600),
          dhi: num(0, 1500),
          ppfd: num(0, 4000).optional(),
          diffusePpfd: num(0, 4000).optional(),
        }),
      )
      .max(1440),
  }),
  experimentSensors: z
    .array(
      z.object({
        id: text,
        type: z.enum(sensorTypes),
        x: num(-1000, 1000),
        y: num(-1000, 1000),
        z: num(-5, 20),
        treatment: text,
        replicate: text,
        model: text,
        logger: text,
        channel: text.default(''),
        azimuth: num(0, 360).default(0),
        tilt: num(0, 180).default(0),
        notes: text,
      }),
    )
    .max(500),
  crops: z
    .array(
      z.object({
        id: text,
        crop: text,
        treatment: text,
        replicate: text,
        x: num(-1000, 1000),
        y: num(-1000, 1000),
        width: num(0.1, 100),
        length: num(0.1, 100),
      }),
    )
    .max(200),
});
export const defaultStudy = () =>
  studySchema.parse({
    schemaVersion: 1,
    metadata: { title: 'Agrivoltaic field study', investigator: '', units: 'SI' },
    module: { length: 2.278, width: 1.134, thickness: 0.035, power: 550, gap: 0.02 },
    racking: {
      type: 'fixed',
      tilt: 25,
      height: 2.8,
      limit: 60,
      backtracking: true,
      postSize: 0.12,
    },
    table: { high: 2, wide: 6, orientation: 'portrait' },
    row: { tables: 2, tableGap: 0.3 },
    rowPair: { pitch: 8, cropSetback: 0.5, maintenance: 1 },
    array: { rows: 4, azimuth: 180, buffer: 3, groupSize: 4, aisle: 3 },
    site: { latitude: 32.22, longitude: -110.97, utcOffset: -7, elevation: 728 },
    analysis: {
      date: '2026-06-21',
      resolution: 1,
      receiverHeight: 0.2,
      interval: 10,
      patches: 577,
      parFraction: 0.5,
      photonFactor: 4.57,
      backend: 'auto',
    },
    weather: {
      mode: 'automatic',
      name: 'Open-Meteo · ready to download for your site',
      hash: '',
      format: 'sample',
      rows: [],
    },
    experimentSensors: [],
    crops: [],
  });
export function migrateStudy(data) {
  if (data.schemaVersion !== 1) throw Error('Unsupported study version. Expected schemaVersion 1.');
  const candidate = structuredClone(data);
  if (!candidate.weather.mode)
    candidate.weather.mode = candidate.weather.format === 'sample' ? 'automatic' : 'upload';
  return studySchema.parse(candidate);
}
export function analysisKey(s) {
  return JSON.stringify([
    s.module,
    s.racking,
    s.table,
    s.row,
    s.rowPair,
    s.array,
    s.site,
    s.analysis,
    s.weather,
  ]);
}
export async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
export function dimensions(s) {
  const along = s.table.orientation === 'portrait' ? s.module.width : s.module.length,
    cross = s.table.orientation === 'portrait' ? s.module.length : s.module.width;
  const width = s.table.high * cross + (s.table.high - 1) * s.module.gap,
    tableLength = s.table.wide * along + (s.table.wide - 1) * s.module.gap;
  const length = s.row.tables * tableLength + (s.row.tables - 1) * s.row.tableGap;
  const tilt =
    s.racking.type === 'vertical' ? 90 : s.racking.type === 'pergola' ? 0 : s.racking.tilt;
  const projected = width * Math.cos((tilt * Math.PI) / 180);
  const span =
    (s.array.rows - 1) * s.rowPair.pitch +
    Math.floor((s.array.rows - 1) / s.array.groupSize) * s.array.aisle;
  return {
    along,
    cross,
    width,
    tableLength,
    length,
    projected,
    span,
    footprintX: length + 2 * s.array.buffer,
    footprintY: span + width + 2 * s.array.buffer,
    modules: s.table.high * s.table.wide * s.row.tables * s.array.rows,
    clear: s.rowPair.pitch - projected,
    usable: Math.max(
      0,
      s.rowPair.pitch - projected - 2 * s.rowPair.cropSetback - s.rowPair.maintenance,
    ),
    minHeight:
      s.racking.height -
      (width / 2) *
        Math.sin(
          ((['single-axis', 'dual-axis'].includes(s.racking.type) ? s.racking.limit : tilt) *
            Math.PI) /
            180,
        ) -
      s.module.thickness / 2,
  };
}
// Switching hardware is a setup action: provide clearances that work with the
// current table size instead of immediately presenting a red warning.
export function rackingMinimums(s) {
  const type = s.racking.type;
  const d = dimensions(s);
  const clearance =
    s.analysis.receiverHeight +
    0.25 +
    (d.width / 2) *
      Math.sin(
        ((type === 'vertical'
          ? 90
          : type === 'pergola'
            ? 0
            : ['single-axis', 'dual-axis'].includes(type)
              ? Math.max(s.racking.limit, s.racking.tilt)
              : s.racking.tilt) *
          Math.PI) /
          180,
      ) +
    s.module.thickness / 2;
  const up = (n) => Math.ceil(n * 100) / 100;
  const diameter = Math.hypot(d.width, d.tableLength) + 0.05;
  return {
    height: up(Math.max(0.2, clearance)),
    pitch: up(
      Math.max(
        0.5,
        type === 'dual-axis' ? diameter : (type === 'single-axis' ? d.width : d.projected) + 0.05,
      ),
    ),
    tableGap: type === 'dual-axis' ? up(diameter - d.tableLength) : 0.05,
  };
}
export function selectRacking(study, type) {
  const s = structuredClone(study);
  s.racking.type = type;
  const minimum = rackingMinimums(s);
  s.racking.height = Math.max(s.racking.height, minimum.height);
  s.rowPair.pitch = Math.max(s.rowPair.pitch, minimum.pitch);
  s.row.tableGap = Math.max(s.row.tableGap, minimum.tableGap);
  return s;
}
// Later workflow steps can enlarge the assembly after its rack was selected.
// Keep dependent clearances compatible; direct spacing edits remain user-controlled.
export function updateStudyInput(study, section, key, value) {
  let s = structuredClone(study);
  s[section][key] = value;
  if (
    ['module', 'table'].includes(section) ||
    (section === 'racking' && ['type', 'tilt', 'limit'].includes(key)) ||
    (section === 'analysis' && key === 'receiverHeight')
  )
    s = selectRacking(s, s.racking.type);
  return s;
}
export function validationMessage(issue) {
  const names = {
    'row.tables': 'Tables per row',
    'row.tableGap': 'Gap between tables',
    'rowPair.pitch': 'Row centre-to-centre pitch',
    'racking.height': 'Module centre / axis height',
    'table.high': 'Modules across',
    'table.wide': 'Modules along',
    'array.rows': 'Number of rows',
  };
  const path = issue.path.join('.');
  if (path === 'row.tables')
    return 'Tables per row must be a whole number from 1 to 20. This is the current application limit.';
  const label = names[path] || String(issue.path.at(-1)).replace(/([a-z])([A-Z])/g, '$1 $2');
  if (issue.code === 'too_big') return `${label} must be ${issue.maximum} or less.`;
  if (issue.code === 'too_small') return `${label} must be ${issue.minimum} or more.`;
  return `${label}: ${issue.message}`;
}
export function designIssues(s) {
  const d = dimensions(s),
    issues = [];
  if (s.racking.type === 'dual-axis') {
    const envelope = Math.hypot(d.width, d.tableLength);
    if (s.rowPair.pitch < envelope + 0.05)
      issues.push(
        'Possible rotation interference between rows. The conservative clearance check needs a pitch of ' +
          rackingMinimums(s).pitch.toFixed(2) +
          ' m.',
      );
    if (s.row.tables > 1 && d.tableLength + s.row.tableGap < envelope + 0.05)
      issues.push(
        'Possible rotation interference along the row. The conservative clearance check needs a table gap of ' +
          rackingMinimums(s).tableGap.toFixed(2) +
          ' m.',
      );
  }
  if (d.minHeight < 0.05)
    issues.push(
      'The lowest module edge intersects the ground. Increase axis height or reduce assembly width / tilt.',
    );
  if (
    s.rowPair.pitch <
    (['single-axis', 'dual-axis'].includes(s.racking.type) ? d.width : d.projected) + 0.05
  )
    issues.push('Adjacent row envelopes overlap. Increase row pitch.');
  if (s.analysis.receiverHeight >= d.minHeight)
    issues.push('Receiver height must be below the lowest module edge.');
  if ((d.footprintX * d.footprintY) / s.analysis.resolution ** 2 > 20000)
    issues.push('This grid exceeds 20,000 receivers. Increase grid spacing or reduce the array.');
  return issues;
}
