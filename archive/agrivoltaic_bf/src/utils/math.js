export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function remap(value, inMin, inMax, outMin, outMax) {
  if (Math.abs(inMax - inMin) < 1e-6) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function normalizedModulo(value, base) {
  return ((value % base) + base) % base;
}

export function debounce(fn, delay = 50) {
  let timer = 0;
  let latestArgs = null;

  return (...args) => {
    latestArgs = args;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn(...latestArgs);
    }, delay);
  };
}

export function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatMeters(value, decimals = 1) {
  return `${roundTo(value, decimals).toFixed(decimals)} m`;
}

export function formatArea(width, depth, decimals = 1) {
  return `${roundTo(width, decimals).toFixed(decimals)} m × ${roundTo(depth, decimals).toFixed(decimals)} m`;
}
