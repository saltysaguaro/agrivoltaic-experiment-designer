export const designLayers = Object.freeze({
  modules: true,
  supports: true,
  underPanel: true,
  cropping: true,
  perimeter: true,
  receiver: true,
  sensors: true,
  plots: true,
});
export const irradianceLayers = Object.freeze({
  ...designLayers,
  underPanel: false,
  cropping: false,
  perimeter: false,
  receiver: false,
  sensors: false,
  plots: false,
});
