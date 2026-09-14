export const steps = [
  ['Module', 'Define the building block', 'module'],
  ['Racking', 'Choose a support system', 'racking'],
  ['PV table & row', 'Build your repeated assembly', 'row'],
  ['Row spacing', 'Make room for the experiment', 'pair'],
  ['Full array', 'Set the field boundaries', 'array'],
  ['Site & weather', 'Define the light environment', 'environment'],
  ['Irradiance', 'Understand the light field', 'irradiance'],
  ['Agrivoltaic', 'Place sensors and crop beds beneath PV', 'array'],
  ['Control', 'Edit the matching full-sun field', 'array'],
  ['Methods & export', 'From field design to publication', 'report'],
];
export const defaults = [
  'oblique',
  'oblique',
  'oblique',
  'profile',
  'oblique',
  'plan',
  'oblique',
  'oblique',
  'oblique',
  'oblique',
];
export function normalizeNavigation(value) {
  const fallback = { version: 3, step: 0, view: 'oblique' };
  if (
    !value ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    !['oblique', 'plan', 'profile'].includes(value.view)
  )
    return fallback;
  // v1 had separate sensor/crop steps; v2 combined them at step 7.
  const step =
    value.version === 3
      ? value.step
      : value.version === 2
        ? value.step === 8
          ? 9
          : value.step < 8
            ? value.step
            : -1
        : value.step === 8
          ? 7
          : value.step === 9
            ? 9
            : value.step;
  return step >= 0 && step < steps.length ? { version: 3, step, view: value.view } : fallback;
}
