import { defaultStudy, migrateStudy } from '../domain/study.js';

// Field layouts are session work. Only an explicit project export persists them.
// Use this on both sides of autosave so older browser records cannot restore them.
export function withoutFieldLayout(study) {
  return {
    ...study,
    experimentSensors: [],
    crops: [],
    controlField: { version: 1, initialized: false, experimentSensors: [], crops: [] },
  };
}
const gridDefaultsVersion = 1;

// Browser preferences predate the row-aligned default. Upgrade them once without
// changing explicit project-file imports, or later choices of a custom grid.
export function restoreBrowserStudy(record) {
  const study = migrateStudy(withoutFieldLayout(record));
  if (
    record.browserGridDefaultsVersion !== gridDefaultsVersion &&
    study.analysis.gridAlignment === 'spacing'
  ) {
    const defaults = defaultStudy().analysis;
    for (const key of ['gridAlignment', 'cellsPerRow', 'resolution'])
      study.analysis[key] = defaults[key];
  }
  return study;
}

export function browserStudyRecord(study) {
  return { ...withoutFieldLayout(study), browserGridDefaultsVersion: gridDefaultsVersion };
}
