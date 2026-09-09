import { SYSTEM_TYPE_OPTIONS } from "../utils/constants.js";
import {
  getCurrentZonedDateTime,
  parseTimeInput,
  resolveSiteTimeZone,
} from "./solarPosition.js";

const DEFAULT_SYSTEM_TYPE = "fixed";
const DEFAULT_MONTH_DAY = "06-21";
const DEFAULT_MINUTES_IN_DAY = 10 * 60;

function defaultViewPresetForSystem(systemType) {
  return systemType === "fixed" || systemType === "raised"
    ? "rowOblique"
    : "arrayOblique";
}

function validSystemType(value) {
  return SYSTEM_TYPE_OPTIONS.some((option) => option.value === value);
}

function parseCoordinate(params, key) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function stateFromQuery(defaultSite, locationSearch = window.location.search) {
  const params = new URLSearchParams(locationSearch);
  const latitude = parseCoordinate(params, "lat");
  const longitude = parseCoordinate(params, "lng");
  const hasValidCoordinates = latitude !== null && longitude !== null;
  const querySite = hasValidCoordinates
    ? {
      label: params.get("label") || defaultSite.label,
      fullAddress: params.get("label") || defaultSite.fullAddress,
      latitude,
      longitude,
      timezone: params.get("tz") || defaultSite.timezone,
      timezoneApproximate: !params.get("tz"),
    }
    : defaultSite;

  const timeZone = resolveSiteTimeZone(querySite);
  const nowParts = getCurrentZonedDateTime(timeZone);
  const defaultYear = String(nowParts.dateInput).slice(0, 4) || String(new Date().getFullYear());
  const timeValue = params.get("time");
  const systemType = validSystemType(params.get("system")) ? params.get("system") : DEFAULT_SYSTEM_TYPE;

  return {
    site: {
      ...querySite,
      timezone: timeZone,
      timezoneApproximate: Boolean(querySite.timezoneApproximate),
    },
    systemType,
    dateInput: params.get("date") || `${defaultYear}-${DEFAULT_MONTH_DAY}`,
    minutesInDay: timeValue ? parseTimeInput(timeValue) : DEFAULT_MINUTES_IN_DAY,
    viewPreset: params.get("view") || defaultViewPresetForSystem(systemType),
  };
}
