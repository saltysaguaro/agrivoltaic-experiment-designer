// Field layouts are session work. Only an explicit project export persists them.
// Use this on both sides of autosave so older browser records cannot restore them.
export function withoutFieldLayout(study) {
  return { ...study, experimentSensors: [], crops: [] };
}
