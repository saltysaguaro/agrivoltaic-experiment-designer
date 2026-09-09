import { normalizedModulo } from "./math.js";

function signedDeltaDeg(target, reference) {
  const normalized = normalizedModulo(target - reference + 180, 360) - 180;
  return normalized === -180 ? 180 : normalized;
}

export function getSystemAzimuthMode(state) {
  return state.systemType === "sat"
    || state.systemType === "vertical"
    || (state.systemType === "raised" && state.pergolaTracking)
    ? "axis"
    : "surface";
}

export function getCanonicalSystemAzimuthDeg(state) {
  if (state.systemType === "sat") {
    return 0;
  }
  if (state.systemType === "raised" && state.pergolaTracking) {
    return 90;
  }
  if (state.systemType === "vertical") {
    return 90;
  }
  return 180;
}

export function getSystemRotationDeg(state) {
  const targetAzimuth = normalizedModulo(
    Number.isFinite(state.systemAzimuthDeg) ? state.systemAzimuthDeg : getCanonicalSystemAzimuthDeg(state),
    360,
  );
  return signedDeltaDeg(targetAzimuth, getCanonicalSystemAzimuthDeg(state));
}

export function getTrackerAxisAzimuthDeg(state) {
  if (state.systemType === "raised") {
    return normalizedModulo(state.systemAzimuthDeg - 90, 360);
  }
  return normalizedModulo(state.systemAzimuthDeg, 360);
}

export function toPergolaTrackingAzimuth(surfaceAzimuthDeg) {
  return normalizedModulo(surfaceAzimuthDeg - 90, 360);
}

export function toPergolaFixedAzimuth(axisAzimuthDeg) {
  return normalizedModulo(axisAzimuthDeg + 90, 360);
}

export function getAzimuthHelpText(state) {
  if (state.systemType === "sat") {
    return "Row-axis azimuth. 0°/180° = north-south tracker axis, 90° = east-west tracker axis.";
  }
  if (state.systemType === "vertical") {
    return "Row-axis azimuth for the vertical panel fences. 0°/180° aligns rows north-south.";
  }
  if (state.systemType === "raised" && state.pergolaTracking) {
    return "Row-axis azimuth for the pergola tracker rows. 90° = east-west row axis, 0°/180° = north-south row axis.";
  }
  return "Module-facing azimuth. 180° is south-facing, 90° east-facing, 270° west-facing.";
}
