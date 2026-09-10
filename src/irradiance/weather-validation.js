// Shared by the Study schema, file import and the numerical engine.
export function validateWeatherRows(rows, { allowEmpty = false } = {}) {
  if (!rows.length && allowEmpty) return;
  let end = 0;
  for (const r of rows) {
    if (
      ![r.minute, r.duration, r.ghi, r.dni, r.dhi].every(Number.isFinite) ||
      Math.abs(r.minute - end) > 1e-7 ||
      r.duration <= 0 ||
      r.duration > 180 ||
      r.minute < 0 ||
      r.minute + r.duration > 1440 + 1e-7
    )
      throw Error(
        'Weather requires complete, contiguous, ordered 24-hour coverage with valid intervals.',
      );
    if (r.ghi < 0 || r.ghi > 1500 || r.dni < 0 || r.dni > 1600 || r.dhi < 0 || r.dhi > r.ghi)
      throw Error('Weather irradiance must be valid W/m² and 0 ≤ DHI ≤ GHI.');
    if (r.ppfd !== undefined && (!Number.isFinite(r.ppfd) || r.ppfd < 0 || r.ppfd > 4000))
      throw Error('PPFD must be 0–4000 µmol m⁻² s⁻¹.');
    if (
      r.diffusePpfd !== undefined &&
      (r.ppfd === undefined ||
        !Number.isFinite(r.diffusePpfd) ||
        r.diffusePpfd < 0 ||
        r.diffusePpfd > r.ppfd)
    )
      throw Error('Diffuse PPFD requires total PPFD and must be between zero and total PPFD.');
    end = r.minute + r.duration;
  }
  if (Math.abs(end - 1440) > 1e-7)
    throw Error(
      'A complete, contiguous 24-hour weather day is required, including nighttime zeros.',
    );
  if (rows.some((r) => r.ppfd !== undefined) && rows.some((r) => r.ppfd === undefined))
    throw Error('Provide PPFD for every interval or omit the PPFD column.');
}

// Stable field order, independent of imported object property order. Units are
// local-start minutes, duration minutes, W/m², and µmol/m²/s respectively.
export function canonicalWeatherRows(rows) {
  return JSON.stringify(
    rows.map((r) => [
      r.minute,
      r.duration,
      r.ghi,
      r.dni,
      r.dhi,
      r.ppfd ?? null,
      r.diffusePpfd ?? null,
    ]),
  );
}
