import type { MaterialDefinition } from "@agrivoltaic/shared";

export const defaultMaterialLibrary: MaterialDefinition[] = [
  {
    name: "pv_glass",
    modifier: "glass",
    rgb: [0.60, 0.62, 0.64],
    transmissivity: 0.88,
    transmittedSpecular: 0.04,
    comment: "Placeholder low-iron PV cover glass. Calibrate to measured module optics before final studies.",
  },
  {
    name: "pv_frame_metal",
    modifier: "metal",
    rgb: [0.63, 0.64, 0.66],
    specularity: 0.75,
    roughness: 0.08,
  },
  {
    name: "steel_post",
    modifier: "metal",
    rgb: [0.43, 0.44, 0.45],
    specularity: 0.15,
    roughness: 0.18,
  },
  {
    name: "galvanized_racking",
    modifier: "metal",
    rgb: [0.58, 0.60, 0.62],
    specularity: 0.22,
    roughness: 0.14,
  },
  {
    name: "concrete",
    modifier: "plastic",
    rgb: [0.53, 0.53, 0.52],
    specularity: 0.02,
    roughness: 0.12,
  },
  {
    name: "soil_dry",
    modifier: "plastic",
    rgb: [0.36, 0.29, 0.20],
    specularity: 0,
    roughness: 0.22,
  },
  {
    name: "soil_wet",
    modifier: "plastic",
    rgb: [0.24, 0.20, 0.14],
    specularity: 0.01,
    roughness: 0.12,
  },
  {
    name: "grass",
    modifier: "plastic",
    rgb: [0.21, 0.33, 0.16],
    specularity: 0.01,
    roughness: 0.18,
  },
  {
    name: "gravel",
    modifier: "plastic",
    rgb: [0.62, 0.60, 0.57],
    specularity: 0.01,
    roughness: 0.18,
  },
  {
    name: "mulch",
    modifier: "plastic",
    rgb: [0.30, 0.18, 0.12],
    specularity: 0,
    roughness: 0.18,
  },
  {
    name: "black_plastic",
    modifier: "plastic",
    rgb: [0.05, 0.05, 0.05],
    specularity: 0.01,
    roughness: 0.05,
  },
  {
    name: "reflective_groundcover",
    modifier: "plastic",
    rgb: [0.84, 0.84, 0.82],
    specularity: 0.02,
    roughness: 0.1,
    comment: "High-albedo placeholder for white woven or reflective agronomic ground covers.",
  },
  {
    name: "crop_canopy_generic",
    modifier: "trans",
    rgb: [0.18, 0.36, 0.14],
    specularity: 0,
    roughness: 0.20,
    transmissivity: 0.12,
    comment: "Crude crop canopy placeholder. Replace with crop-specific canopy optical properties when available.",
  },
];

export function resolveMaterialLibrary(override?: MaterialDefinition[]): MaterialDefinition[] {
  if (!override || override.length === 0) {
    return defaultMaterialLibrary;
  }

  const merged = new Map(defaultMaterialLibrary.map((material) => [material.name, material]));
  for (const material of override) {
    merged.set(material.name, material);
  }

  return [...merged.values()];
}
