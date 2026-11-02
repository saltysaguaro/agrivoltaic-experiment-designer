import { z } from 'zod';
const text = z.string().max(500),
  n = (min, max) => z.number().finite().min(min).max(max);
export const irrigationMethods = [
  ['drip', 'Surface drip / tape', 'line'],
  ['subsurface-drip', 'Subsurface drip', 'line'],
  ['emitter', 'Point drip emitter', 'point'],
  ['bubbler', 'Bubbler', 'point'],
  ['micro-sprinkler', 'Micro-sprinkler', 'point'],
  ['sprinkler', 'Fixed sprinkler', 'point'],
  ['furrow', 'Furrow', 'line'],
  ['basin', 'Basin / flood', 'area'],
  ['border', 'Border irrigation', 'area'],
  ['custom-point', 'Custom point', 'point'],
  ['custom-line', 'Custom line', 'line'],
  ['custom-area', 'Custom area', 'area'],
];
export const irrigationMethod = (id) => irrigationMethods.find((m) => m[0] === id);
const common = {
  version: z.literal(1).default(1),
  id: text,
  label: text.default(''),
  zoneId: text.default(''),
  treatment: text.default('Irrigated'),
  replicate: text.default('1'),
  model: text.default(''),
  status: z.enum(['planned', 'installed']).default('planned'),
  notes: text.default(''),
  x: n(-10000, 10000),
  y: n(-10000, 10000),
  z: n(-5, 20).default(0),
  grid: z.object({ column: n(0, 200000).int(), row: n(0, 200000).int() }).optional(),
  offsetX: n(-10000, 10000).default(0),
  offsetY: n(-10000, 10000).default(0),
  link: z
    .object({
      bedId: text,
      along: n(-100, 100),
      across: n(-100, 100),
      followLength: z.boolean().default(false),
    })
    .nullable()
    .default(null),
  ratedFlow: n(0, 10).nullable().default(null),
  measuredFlow: n(0, 10).nullable().default(null),
  pressure: n(0, 10000000).nullable().default(null),
};
export const irrigationUnitSchema = z.discriminatedUnion(
  'method',
  irrigationMethods.map(([method, , kind]) =>
    z.object({
      ...common,
      method: z.literal(method),
      kind: z.literal(kind),
      ...(kind === 'line'
        ? { length: n(0.01, 1000).default(5), angle: n(-360, 360).default(0) }
        : {}),
      ...(kind === 'area'
        ? {
            length: n(0.01, 1000).default(5),
            width: n(0.01, 1000).default(2),
            angle: n(-360, 360).default(0),
            grade: n(-1, 1).default(0),
            inletOffset: n(-0.5, 0.5).default(0),
            bundHeight: n(0, 5).default(0.15),
            appliedDepth: n(0, 2).nullable().default(null),
          }
        : {}),
      ...(['drip', 'subsurface-drip'].includes(method)
        ? { emitterSpacing: n(0.001, 100).default(0.3), emitterOffset: n(0, 1000).default(0.15) }
        : {}),
      ...(method === 'furrow'
        ? {
            width: n(0.01, 10).default(0.3),
            depth: n(0.001, 5).default(0.15),
            grade: n(-1, 1).default(0),
          }
        : {}),
      ...(['sprinkler', 'micro-sprinkler'].includes(method)
        ? {
            radius: n(0.01, 100).default(method === 'sprinkler' ? 3 : 1),
            arc: n(1, 360).default(360),
            angle: n(-360, 360).default(0),
          }
        : {}),
    }),
  ),
);
export const irrigationZonesSchema = z
  .array(
    z.object({
      version: z.literal(1).default(1),
      id: text,
      name: text,
      kind: z.enum(['irrigated', 'rainfed']).default('irrigated'),
      bedIds: z.array(text).max(200).default([]),
      treatment: text.default('Irrigated'),
      replicate: text.default('1'),
      waterSource: text.default(''),
      notes: text.default(''),
    }),
  )
  .max(200)
  .default([]);
export const irrigationUnitsSchema = z.array(irrigationUnitSchema).max(500).default([]);
export function defaultIrrigation(method = 'drip') {
  const info = irrigationMethod(method);
  if (!info) throw Error('Choose an irrigation method.');
  return irrigationUnitSchema.parse({
    id: '',
    method,
    kind: info[2],
    x: 0,
    y: 0,
    z: method === 'subsurface-drip' ? -0.2 : method.includes('sprinkler') ? 0.5 : 0,
  });
}
export function irrigationReferenceIssues(field) {
  const issues = [],
    beds = new Set(field.crops.map((c) => c.id)),
    zones = new Map((field.irrigationZones || []).map((z) => [z.id, z]));
  for (const zone of zones.values())
    if (zone.bedIds.some((id) => !beds.has(id)))
      issues.push(`Irrigation zone ${zone.id} references a missing bed.`);
  for (const u of field.irrigationUnits || []) {
    if (u.link && !beds.has(u.link.bedId))
      issues.push(`Irrigation ${u.id} references missing bed ${u.link.bedId}.`);
    if (u.zoneId && !zones.has(u.zoneId))
      issues.push(`Irrigation ${u.id} references missing zone ${u.zoneId}.`);
    if (zones.get(u.zoneId)?.kind === 'rainfed')
      issues.push(`Rainfed zone ${u.zoneId} cannot contain irrigation hardware.`);
    if (u.method === 'subsurface-drip' && u.z >= 0)
      issues.push(`Subsurface drip ${u.id} requires a negative installation depth.`);
    if (u.emitterOffset !== undefined && u.emitterOffset > u.length)
      issues.push(`Emitter offset for ${u.id} exceeds its lateral length.`);
  }
  for (const items of [field.irrigationUnits || [], field.irrigationZones || []]) {
    if (items.some((u) => !u.id.trim()) || new Set(items.map((u) => u.id)).size !== items.length)
      issues.push('Irrigation IDs must be non-empty and unique.');
  }
  return issues;
}
export const irrigationFlowToDisplay = (flow) => (flow === null ? '' : flow * 3600000);
export const irrigationFlowFromDisplay = (value) => (value === '' ? null : Number(value) / 3600000);
