import {
  DEFAULTS,
  FIELD_ORDER,
  PERGOLA_DEFAULT_CLEARANCE_M,
  SYSTEM_PRESETS,
} from "../utils/constants.js";
import { CROP_LIBRARY } from "../crops/cropCatalog.js";
import { clamp, normalizedModulo, toFiniteNumber } from "../utils/math.js";
import { toPergolaFixedAzimuth, toPergolaTrackingAzimuth } from "../utils/orientation.js";

function applyNumericRules(next) {
  next.dcSizeKw = Math.max(1, toFiniteNumber(next.dcSizeKw, DEFAULTS.dcSizeKw));
  next.moduleW = Math.max(1, toFiniteNumber(next.moduleW, DEFAULTS.moduleW));
  next.moduleWidth = Math.max(0.2, toFiniteNumber(next.moduleWidth, DEFAULTS.moduleWidth));
  next.moduleHeight = Math.max(0.2, toFiniteNumber(next.moduleHeight, DEFAULTS.moduleHeight));
  next.moduleThickness = Math.max(0.02, toFiniteNumber(next.moduleThickness, DEFAULTS.moduleThickness));
  next.interModuleSpacing = Math.max(0, toFiniteNumber(next.interModuleSpacing, DEFAULTS.interModuleSpacing));
  next.forceModuleCount = Boolean(next.forceModuleCount);
  next.forcedModuleCount = Math.max(1, Math.round(toFiniteNumber(next.forcedModuleCount, DEFAULTS.forcedModuleCount)));
  next.tiltDeg = clamp(toFiniteNumber(next.tiltDeg, DEFAULTS.tiltDeg), 0, 90);
  next.trackerAngleDeg = clamp(toFiniteNumber(next.trackerAngleDeg, DEFAULTS.trackerAngleDeg), -75, 75);
  next.systemAzimuthDeg = normalizedModulo(toFiniteNumber(next.systemAzimuthDeg, DEFAULTS.systemAzimuthDeg), 360);
  next.heightM = Math.max(0, toFiniteNumber(next.heightM, DEFAULTS.heightM));
  next.pergolaRackGap = Math.max(0, toFiniteNumber(next.pergolaRackGap, DEFAULTS.pergolaRackGap));
  next.rowSpacing = Math.max(0.5, toFiniteNumber(next.rowSpacing, DEFAULTS.rowSpacing));
  next.rowColumnCount = Math.max(1, Math.round(toFiniteNumber(next.rowColumnCount, DEFAULTS.rowColumnCount)));
  next.rowColumnGap = Math.max(0, toFiniteNumber(next.rowColumnGap, DEFAULTS.rowColumnGap));
  next.cropRowBuffer = Math.max(0, toFiniteNumber(next.cropRowBuffer, DEFAULTS.cropRowBuffer));
  next.arrayEdgeBuffer = Math.max(0, toFiniteNumber(next.arrayEdgeBuffer, DEFAULTS.arrayEdgeBuffer));
  next.maxTablesPerRow = Math.max(1, Math.round(toFiniteNumber(next.maxTablesPerRow, DEFAULTS.maxTablesPerRow)));
  next.rowCountHint = Math.max(0, Math.round(toFiniteNumber(next.rowCountHint, DEFAULTS.rowCountHint)));
  next.cropBedsPerRow = Math.max(1, Math.round(toFiniteNumber(next.cropBedsPerRow, DEFAULTS.cropBedsPerRow)));
  next.plantSpacingIn = Math.max(2, toFiniteNumber(next.plantSpacingIn, DEFAULTS.plantSpacingIn));
  next.groundSize = Math.max(50, toFiniteNumber(next.groundSize, DEFAULTS.groundSize));
  next.groundTileSize = Math.max(0, toFiniteNumber(next.groundTileSize, DEFAULTS.groundTileSize));
  next.sunAz = normalizedModulo(toFiniteNumber(next.sunAz, DEFAULTS.sunAz), 360);
  next.sunEl = clamp(toFiniteNumber(next.sunEl, DEFAULTS.sunEl), 1, 85);
  return next;
}

export function sanitizeState(raw) {
  const next = { ...DEFAULTS, ...raw };
  applyNumericRules(next);

  if (!["fixed", "sat", "raised", "vertical"].includes(next.systemType)) {
    next.systemType = DEFAULTS.systemType;
  }

  if (next.systemType === "raised" && next.heightM === DEFAULTS.heightM) {
    next.heightM = PERGOLA_DEFAULT_CLEARANCE_M;
  }

  next.useMetric = Boolean(next.useMetric);
  next.pergolaCheckerboard = Boolean(next.pergolaCheckerboard);
  next.pergolaTracking = Boolean(next.pergolaTracking);
  if (!["on", "off"].includes(next.showBuffers)) next.showBuffers = DEFAULTS.showBuffers;
  if (!["on", "off"].includes(next.showHeatmap)) next.showHeatmap = DEFAULTS.showHeatmap;

  return next;
}

export function serializeSystemConfig(state) {
  return {
    system: {
      type: state.systemType,
      dcSizeKw: state.dcSizeKw,
      tableConfig: state.config,
    },
    module: {
      ratedPowerW: state.moduleW,
      widthM: state.moduleWidth,
      heightM: state.moduleHeight,
      thicknessM: state.moduleThickness,
      interpanelSpacingM: state.interModuleSpacing,
      forceModuleCount: state.forceModuleCount,
      forcedModuleCount: state.forceModuleCount ? state.forcedModuleCount : null,
    },
    mounting: {
      tiltDeg: state.tiltDeg,
      trackerAngleDeg: state.trackerAngleDeg,
      azimuthDeg: state.systemAzimuthDeg,
      heightM: state.heightM,
      pergolaTracking: state.pergolaTracking,
    },
    layout: {
      pergolaRackGapM: state.pergolaRackGap,
      rowSpacingM: state.rowSpacing,
      interpanelSpacingM: state.interModuleSpacing,
      rowColumnCount: state.rowColumnCount,
      rowColumnGapM: state.rowColumnGap,
      cropRowBufferM: state.cropRowBuffer,
      arrayEdgeBufferM: state.arrayEdgeBuffer,
      maxTablesPerRow: state.maxTablesPerRow,
      rowCountHint: state.rowCountHint,
    },
    agronomy: {
      checkerboardPergola: state.pergolaCheckerboard,
      cropBedsPerRow: state.cropBedsPerRow,
      cropType: state.cropType,
      plantSpacingIn: state.plantSpacingIn,
    },
    scene: {
      groundSizeM: state.groundSize,
      groundTileSizeM: state.groundTileSize || null,
      sunAzDeg: state.sunAz,
      sunElDeg: state.sunEl,
      showBuffers: state.showBuffers === "on",
      unitSystem: state.useMetric ? "metric" : "imperial",
    },
    analysis: {
      showHeatmap: state.showHeatmap === "on",
    },
  };
}

export function createStateStore(initialState = {}) {
  const initialSystemType = initialState.systemType || DEFAULTS.systemType;
  let state = sanitizeState({ ...DEFAULTS, ...(SYSTEM_PRESETS[initialSystemType] || {}), ...initialState });
  const listeners = new Set();

  function emit(meta) {
    for (const listener of listeners) {
      listener(state, meta);
    }
  }

  function setState(patch, meta = {}) {
    const nextPatch = { ...patch };
    const nextSystemType = nextPatch.systemType && nextPatch.systemType !== state.systemType
      ? patch.systemType
      : null;
    const systemPreset = nextSystemType ? (SYSTEM_PRESETS[nextSystemType] || {}) : {};
    const nextCropType = nextPatch.cropType && nextPatch.cropType !== state.cropType
      ? nextPatch.cropType
      : null;
    const cropPreset = nextCropType && !Object.prototype.hasOwnProperty.call(nextPatch, "plantSpacingIn")
      ? { plantSpacingIn: CROP_LIBRARY[nextCropType]?.defaultSpacingIn ?? state.plantSpacingIn }
      : {};
    const effectiveSystemType = nextSystemType || state.systemType;

    if (
      effectiveSystemType === "raised"
      && Object.prototype.hasOwnProperty.call(nextPatch, "pergolaTracking")
      && !Object.prototype.hasOwnProperty.call(nextPatch, "systemAzimuthDeg")
    ) {
      const nextPergolaTracking = Boolean(nextPatch.pergolaTracking);
      if (nextPergolaTracking !== Boolean(state.pergolaTracking)) {
        nextPatch.systemAzimuthDeg = nextPergolaTracking
          ? toPergolaTrackingAzimuth(state.systemAzimuthDeg)
          : toPergolaFixedAzimuth(state.systemAzimuthDeg);
      }
    }

    const candidate = sanitizeState({ ...state, ...systemPreset, ...cropPreset, ...nextPatch });
    const changedKeys = FIELD_ORDER.filter((key) => candidate[key] !== state[key]);
    if (!changedKeys.length) return state;
    state = candidate;
    emit({ ...meta, changedKeys });
    return state;
  }

  return {
    getState() {
      return { ...state };
    },
    setState,
    reset(meta = {}) {
      state = sanitizeState(DEFAULTS);
      emit({ ...meta, changedKeys: [...FIELD_ORDER] });
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
