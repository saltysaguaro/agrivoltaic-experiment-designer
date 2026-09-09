import { clamp, lerp } from "./math.js";

export const HEATMAP_PALETTES = {
  meadow: ["#22543d", "#2f855a", "#68d391", "#f6e05e", "#ed8936"],
  sunrise: ["#1f2a44", "#2563eb", "#2dd4bf", "#facc15", "#f97316"],
  ember: ["#10252f", "#2563eb", "#0ea5e9", "#f59e0b", "#ef4444"],
};

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToCss({ r, g, b }, alpha = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

export function samplePalette(paletteName, t, alpha = 1) {
  const palette = HEATMAP_PALETTES[paletteName] || HEATMAP_PALETTES.sunrise;
  const clampedT = clamp(t, 0, 1);
  const scaled = clampedT * (palette.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(palette.length - 1, index + 1);
  const localT = scaled - index;

  const a = hexToRgb(palette[index]);
  const b = hexToRgb(palette[nextIndex]);
  return rgbToCss({
    r: lerp(a.r, b.r, localT),
    g: lerp(a.g, b.g, localT),
    b: lerp(a.b, b.b, localT),
  }, alpha);
}
