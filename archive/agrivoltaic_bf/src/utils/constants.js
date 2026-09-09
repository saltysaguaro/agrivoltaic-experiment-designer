export const APP_TITLE = "Agrivoltaic PV Layout";

export const SYSTEM_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed tilt" },
  { value: "sat", label: "Single-axis tracker" },
  { value: "raised", label: "Pergola / raised" },
  { value: "vertical", label: "Vertical bifacial" },
];

export const TABLE_CONFIG_OPTIONS = [
  { value: "1P", label: "1P" },
  { value: "2P", label: "2P" },
  { value: "3P", label: "3P" },
  { value: "4P", label: "4P" },
  { value: "1L", label: "1L" },
  { value: "2L", label: "2L" },
  { value: "3L", label: "3L" },
  { value: "4L", label: "4L" },
];

export const TOGGLE_OPTIONS = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

export const DEFAULTS = {
  systemType: "fixed",
  useMetric: false,
  dcSizeKw: 55,
  moduleW: 550,
  moduleWidth: 1.134,
  moduleHeight: 2.278,
  moduleThickness: 0.035,
  interModuleSpacing: 0.02,
  forceModuleCount: false,
  forcedModuleCount: 455,
  config: "1P",
  tiltDeg: 25,
  trackerAngleDeg: 0,
  systemAzimuthDeg: 180,
  heightM: 1.8288,
  pergolaCheckerboard: false,
  pergolaTracking: false,
  pergolaRackGap: 0,
  rowSpacing: 9.144,
  rowColumnCount: 1,
  rowColumnGap: 6.096,
  cropRowBuffer: 0.3048,
  arrayEdgeBuffer: 9.144,
  maxTablesPerRow: 25,
  rowCountHint: 0,
  cropBedsPerRow: 3,
  cropType: "lettuce",
  plantSpacingIn: 12,
  groundSize: 240,
  groundTileSize: 0,
  sunAz: 220,
  sunEl: 35,
  showBuffers: "on",
  showHeatmap: "off",
};

export const SYSTEM_PRESETS = {
  fixed: {
    config: "1P",
    tiltDeg: 25,
    systemAzimuthDeg: 180,
    heightM: 1.8288,
    rowSpacing: 9.144,
    rowColumnCount: 1,
    rowColumnGap: 6.096,
    cropRowBuffer: 0.3048,
    arrayEdgeBuffer: 9.144,
    maxTablesPerRow: 25,
    rowCountHint: 0,
    dcSizeKw: 55,
    cropType: "lettuce",
    plantSpacingIn: 12,
  },
  sat: {
    config: "1P",
    trackerAngleDeg: 0,
    systemAzimuthDeg: 0,
    heightM: 1.8288,
    rowSpacing: 9.144,
    rowColumnCount: 1,
    rowColumnGap: 6.096,
    cropRowBuffer: 0.3048,
    arrayEdgeBuffer: 9.144,
    maxTablesPerRow: 25,
    rowCountHint: 0,
    dcSizeKw: 55,
    cropType: "pepper",
    plantSpacingIn: 24,
  },
  raised: {
    config: "1P",
    tiltDeg: 32,
    systemAzimuthDeg: 180,
    pergolaCheckerboard: true,
    pergolaTracking: false,
    pergolaRackGap: 1.5,
    heightM: 4.8768,
    rowSpacing: 9.144,
    rowColumnCount: 1,
    rowColumnGap: 6.096,
    cropRowBuffer: 0.3048,
    arrayEdgeBuffer: 9.144,
    maxTablesPerRow: 20,
    rowCountHint: 10,
    dcSizeKw: 55,
    cropType: "pepper",
    plantSpacingIn: 24,
  },
  vertical: {
    config: "1P",
    systemAzimuthDeg: 0,
    heightM: 0.9144,
    rowSpacing: 9.144,
    rowColumnCount: 1,
    rowColumnGap: 6.096,
    cropRowBuffer: 0.3048,
    arrayEdgeBuffer: 9.144,
    maxTablesPerRow: 25,
    rowCountHint: 0,
    dcSizeKw: 55,
    cropType: "wheat",
    plantSpacingIn: 6,
  },
};

export const FIXED_STACK_SEAM_M = 0.02;
export const PERGOLA_DEFAULT_CLEARANCE_M = 4.8768;
export const DEFAULT_TILE_DIVISIONS_PER_ROW = 10;
export const MIN_GROUND_TILES = 20;
export const MAX_GROUND_TILES = 512;

export const LIGHT_UPDATE_KEYS = new Set(["sunAz", "sunEl"]);
export const GROUND_ONLY_KEYS = new Set(["groundSize", "groundTileSize"]);
export const HEATMAP_KEYS = new Set(["showHeatmap", "groundSize", "groundTileSize", "rowSpacing", "sunAz", "sunEl"]);
export const BUFFER_KEYS = new Set(["showBuffers"]);
export const DISPLAY_ONLY_KEYS = new Set(["useMetric"]);

export const STRUCTURAL_KEYS = new Set([
  "systemType",
  "dcSizeKw",
  "moduleW",
  "moduleWidth",
  "moduleHeight",
  "moduleThickness",
  "interModuleSpacing",
  "forceModuleCount",
  "forcedModuleCount",
  "config",
  "tiltDeg",
  "trackerAngleDeg",
  "systemAzimuthDeg",
  "heightM",
  "pergolaCheckerboard",
  "pergolaTracking",
  "pergolaRackGap",
  "rowSpacing",
  "rowColumnCount",
  "rowColumnGap",
  "maxTablesPerRow",
  "rowCountHint",
]);

export const FIELD_ORDER = Object.keys(DEFAULTS);
