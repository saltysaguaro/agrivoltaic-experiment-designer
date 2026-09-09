import { roundTo } from "./math.js";

const FEET_PER_METER = 3.28084;
const INCHES_PER_METER = 39.3701;
const CM_PER_METER = 100;
const CM_PER_INCH = 2.54;

function isMetric(state) {
  return Boolean(state?.useMetric);
}

function getMeasurementKind(field) {
  return field?.measurement || null;
}

function convertToDisplay(measurement, value, state) {
  if (!Number.isFinite(Number(value))) return value;
  const numericValue = Number(value);

  switch (measurement) {
    case "length":
      return isMetric(state) ? numericValue : numericValue * FEET_PER_METER;
    case "smallLength":
      return isMetric(state) ? numericValue * CM_PER_METER : numericValue * INCHES_PER_METER;
    case "plantSpacing":
      return isMetric(state) ? numericValue * CM_PER_INCH : numericValue;
    default:
      return numericValue;
  }
}

function convertFromDisplay(measurement, value, state) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;

  switch (measurement) {
    case "length":
      return isMetric(state) ? numericValue : numericValue / FEET_PER_METER;
    case "smallLength":
      return isMetric(state) ? numericValue / CM_PER_METER : numericValue / INCHES_PER_METER;
    case "plantSpacing":
      return isMetric(state) ? numericValue / CM_PER_INCH : numericValue;
    default:
      return numericValue;
  }
}

function getDisplayDecimals(measurement, state) {
  switch (measurement) {
    case "length":
      return isMetric(state) ? 3 : 2;
    case "smallLength":
      return isMetric(state) ? 1 : 2;
    case "plantSpacing":
      return isMetric(state) ? 1 : 0;
    default:
      return 3;
  }
}

function getUnitLabel(measurement, state) {
  switch (measurement) {
    case "length":
      return isMetric(state) ? "m" : "ft";
    case "smallLength":
      return isMetric(state) ? "cm" : "in";
    case "plantSpacing":
      return isMetric(state) ? "cm" : "in";
    default:
      return "";
  }
}

export function formatFieldValue(field, value, state) {
  const measurement = getMeasurementKind(field);
  if (!measurement) return String(value);
  const displayValue = convertToDisplay(measurement, value, state);
  const decimals = getDisplayDecimals(measurement, state);
  return String(roundTo(displayValue, decimals));
}

export function parseFieldValue(field, value, state) {
  const measurement = getMeasurementKind(field);
  if (!measurement || value === "") return value;
  return convertFromDisplay(measurement, value, state);
}

export function getFieldPresentation(field, state) {
  const measurement = getMeasurementKind(field);
  const unitLabel = measurement
    ? getUnitLabel(measurement, state)
    : typeof field.unit === "object"
      ? field.unit[isMetric(state) ? "metric" : "imperial"]
      : field.unit || "";

  const label = measurement && unitLabel ? `${field.label} (${unitLabel})` : field.label;
  const min = field.min !== undefined ? convertToDisplay(measurement, field.min, state) : undefined;
  const max = field.max !== undefined ? convertToDisplay(measurement, field.max, state) : undefined;
  const step = field.step !== undefined ? convertToDisplay(measurement, field.step, state) : undefined;

  return {
    label,
    unit: unitLabel,
    min,
    max,
    step,
  };
}

export function formatLength(valueM, state, { decimalsMetric = 2, decimalsImperial = 1, small = false } = {}) {
  const measurement = small ? "smallLength" : "length";
  const displayValue = convertToDisplay(measurement, valueM, state);
  const decimals = isMetric(state) ? decimalsMetric : decimalsImperial;
  return `${roundTo(displayValue, decimals).toFixed(decimals)} ${getUnitLabel(measurement, state)}`;
}

export function formatPlantSpacing(valueIn, state, { decimalsMetric = 1, decimalsImperial = 0 } = {}) {
  const displayValue = convertToDisplay("plantSpacing", valueIn, state);
  const decimals = isMetric(state) ? decimalsMetric : decimalsImperial;
  return `${roundTo(displayValue, decimals).toFixed(decimals)} ${getUnitLabel("plantSpacing", state)}`;
}

export function formatDimensions(widthM, depthM, state, { decimalsMetric = 1, decimalsImperial = 1 } = {}) {
  const decimals = isMetric(state) ? decimalsMetric : decimalsImperial;
  const widthValue = convertToDisplay("length", widthM, state);
  const depthValue = convertToDisplay("length", depthM, state);
  const unitLabel = getUnitLabel("length", state);
  return `${roundTo(widthValue, decimals).toFixed(decimals)} ${unitLabel} × ${roundTo(depthValue, decimals).toFixed(decimals)} ${unitLabel}`;
}

export function getUnitModeLabel(state) {
  return isMetric(state) ? "Metric" : "Imperial";
}
