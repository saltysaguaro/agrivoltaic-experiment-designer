// All distances are centre-to-centre metres. Custom gaps include any access aisle.
// Kept independent of Study/geometry so every consumer resolves the same layout.
export const MAX_ROW_PITCH = 140;
export function regularRowPitch(s, gap) {
  return s.rowPair.pitch + ((gap + 1) % s.array.groupSize === 0 ? s.array.aisle : 0);
}
export function rowPitches(s, rows = s.array.rows) {
  return Array.from({ length: Math.max(0, rows - 1) }, (_, i) =>
    s.rowPair.multipleSpacings
      ? (s.rowPair.customPitches?.[i] ?? regularRowPitch(s, i))
      : regularRowPitch(s, i),
  );
}
export function rowPositions(s, rows = s.array.rows, centered = true) {
  const positions = s.rowPair.multipleSpacings
    ? [0]
    : Array.from(
        { length: rows },
        (_, i) => i * s.rowPair.pitch + Math.floor(i / s.array.groupSize) * s.array.aisle,
      );
  if (s.rowPair.multipleSpacings)
    for (const pitch of rowPitches(s, rows)) positions.push(positions.at(-1) + pitch);
  const centre = centered ? positions.at(-1) / 2 : 0;
  return positions.map((p) => p - centre);
}
export function minimumRowPitch(s) {
  const pitches = rowPitches(s);
  return s.rowPair.multipleSpacings && pitches.length ? Math.min(...pitches) : s.rowPair.pitch;
}
export function rowSpacingKey(s) {
  return {
    pitch: s.rowPair.pitch,
    ...(s.rowPair.multipleSpacings ? { customPitches: rowPitches(s) } : {}),
  };
}
export function applySpacingPattern(s, text) {
  const pattern = text
    .trim()
    .split(/[\s,;]+/)
    .map(Number);
  if (
    !text.trim() ||
    pattern.length > 23 ||
    pattern.some((n) => !Number.isFinite(n) || n < 0.5 || n > MAX_ROW_PITCH)
  )
    throw Error(
      `Enter 1–23 pitches from 0.5 to ${MAX_ROW_PITCH} m, separated by commas or spaces.`,
    );
  const pitches = [...(s.rowPair.customPitches || [])];
  for (let i = 0; i < s.array.rows - 1; i++) pitches[i] = pattern[i % pattern.length];
  return pitches;
}
export function rowSpacingDescription(s) {
  return s.rowPair.multipleSpacings
    ? `Custom centre-to-centre pitches: ${
        rowPitches(s)
          .map((p, i) => `${i + 1}–${i + 2}: ${Number(p.toFixed(4))} m`)
          .join('; ') || 'no gaps (one row)'
      }. Each pitch includes access space; group aisles are not added.`
    : `Regular centre-to-centre pitch ${s.rowPair.pitch} m; extra ${s.array.aisle} m aisle after each group of ${s.array.groupSize} rows.`;
}
export function backtrackingDescription(s) {
  return s.racking.type === 'single-axis' && s.racking.backtracking && s.rowPair.multipleSpacings
    ? s.array.rows > 1
      ? `Synchronized backtracking uses the narrowest active pitch (${minimumRowPitch(s)} m) for all rows; wider gaps do not have independent tracker angles.`
      : `Single-row backtracking uses the default pitch (${s.rowPair.pitch} m); no adjacent rows are modeled.`
    : '';
}
