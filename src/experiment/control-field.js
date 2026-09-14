// Control fields share the numerical footprint and coordinates, but have no PV.
// Their light is the same source integration's unobstructed horizontal reference.
export function fieldStudy(study, control = false) {
  return control
    ? {
        ...study,
        experimentSensors: study.controlField.experimentSensors,
        crops: study.controlField.crops,
      }
    : study;
}
export function storeField(study, edited, control = false) {
  return control
    ? {
        ...study,
        controlField: {
          ...study.controlField,
          initialized: true,
          experimentSensors: edited.experimentSensors,
          crops: edited.crops,
        },
      }
    : { ...study, experimentSensors: edited.experimentSensors, crops: edited.crops };
}
export function allFieldIds(study) {
  return new Set(
    [
      ...study.experimentSensors,
      ...study.crops,
      ...(study.controlField?.experimentSensors || []),
      ...(study.controlField?.crops || []),
    ].map((item) => item.id),
  );
}
export function uniqueFieldId(prefix, used) {
  let n = 1;
  while (used.has(`${prefix}-${String(n).padStart(2, '0')}`)) n++;
  const id = `${prefix}-${String(n).padStart(2, '0')}`;
  used.add(id);
  return id;
}
export function initializeControl(study) {
  if (study.controlField?.initialized) return study;
  const used = allFieldIds(study);
  const copy = (items, prefix) =>
    items.map((item) => ({
      ...structuredClone(item),
      id: uniqueFieldId(prefix, used),
      treatment: 'Control',
    }));
  return {
    ...study,
    controlField: {
      version: 1,
      initialized: true,
      experimentSensors: copy(study.experimentSensors, 'C-S'),
      crops: copy(study.crops, 'C-P'),
    },
  };
}
export function controlResult(result) {
  if (!result) return null;
  return {
    ...result,
    cells: result.cells.map((cell) => ({
      ...cell,
      wh: result.openWh,
      dli: result.openDli,
      sunlight: 100,
      shade: 0,
    })),
    meanDli: result.openDli,
    meanSunlight: 100,
    meanShade: 0,
    backend: `Open-field reference (source calculation: ${result.backend})`,
  };
}
export const controlLayers = (layers) => ({
  ...layers,
  modules: false,
  supports: false,
  underPanel: false,
  cropping: false,
  perimeter: false,
});
