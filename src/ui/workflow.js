export const steps = [
  ['Module', 'Define the building block', 'module'],
  ['Racking', 'Choose a support system', 'racking'],
  ['PV table & row', 'Build your repeated assembly', 'row'],
  ['Row spacing', 'Make room for the experiment', 'pair'],
  ['Full array', 'Set the field boundaries', 'array'],
  ['Site & weather', 'Define the light environment', 'environment'],
  ['Irradiance', 'Understand the daily light field', 'irradiance'],
  ['Field layout', 'Place sensors and crop beds', 'array'],
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
];
export function normalizeNavigation(value) {
  const fallback = { version: 2, step: 0, view: 'oblique' };
  if (
    !value ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    !['oblique', 'plan', 'profile'].includes(value.view)
  )
    return fallback;
  // Previously sensors and crops were steps 7/8, with publication at step 9.
  const step =
    value.version === 2 ? value.step : value.step === 8 ? 7 : value.step === 9 ? 8 : value.step;
  return step < steps.length ? { version: 2, step, view: value.view } : fallback;
}
