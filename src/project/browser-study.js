import { migrateStudy } from '../domain/study.js';

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
const gridDefaultsVersion = 2;

// Apply the current automatic sizing to older browser preferences once. Explicit
// project-file imports keep their original grid and saved numerical results.
export function restoreBrowserStudy(record) {
  const study = migrateStudy(withoutFieldLayout(record));
  if (record.browserGridDefaultsVersion !== gridDefaultsVersion) {
    study.analysis.gridAlignment = 'row-centres';
    study.analysis.gridSizing = 'row-pitch';
  }
  return study;
}

export function browserStudyRecord(study) {
  return { ...withoutFieldLayout(study), browserGridDefaultsVersion: gridDefaultsVersion };
}
