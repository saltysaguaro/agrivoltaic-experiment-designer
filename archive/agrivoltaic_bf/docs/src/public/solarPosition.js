const MINUTES_PER_DAY = 24 * 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function formatterParts(date, timeZone) {
  // Intl gives timezone-aware calendar parts without bringing in a date library.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });

  const parts = Object.create(null);
  formatter.formatToParts(date).forEach((part) => {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  });
  return parts;
}

export function approximateTimezoneFromLongitude(longitude) {
  // The public page only needs a practical fallback when a precise timezone is not known.
  if (longitude <= -157) return "Pacific/Honolulu";
  if (longitude <= -123) return "America/Los_Angeles";
  if (longitude <= -111) return "America/Phoenix";
  if (longitude <= -101) return "America/Denver";
  if (longitude <= -85) return "America/Chicago";
  if (longitude <= -66) return "America/New_York";
  if (longitude <= -30) return "Atlantic/Azores";
  if (longitude <= 60) return "Etc/UTC";
  if (longitude <= 90) return "Asia/Dubai";
  if (longitude <= 120) return "Asia/Dhaka";
  if (longitude <= 150) return "Asia/Tokyo";
  return "Pacific/Auckland";
}

export function isValidTimeZone(timeZone) {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function timeZoneFromRegion(site) {
  const country = normalizeKey(site?.country);
  const region = normalizeKey(site?.region);
  const regionCode = normalizeKey(site?.regionCode);
  const countryCode = normalizeKey(site?.countryCode);

  if (countryCode === "us" || country === "united states" || country === "united states of america") {
    if (region === "arizona" || regionCode === "us-az" || regionCode === "az") return "America/Phoenix";
    if (region === "hawaii" || regionCode === "us-hi" || regionCode === "hi") return "Pacific/Honolulu";
    if (region === "alaska" || regionCode === "us-ak" || regionCode === "ak") return "America/Anchorage";
  }

  return "";
}

export function resolveSiteTimeZone(site) {
  if (isValidTimeZone(site?.timezone)) {
    return site.timezone;
  }
  const regionalTimeZone = timeZoneFromRegion(site);
  if (regionalTimeZone) {
    return regionalTimeZone;
  }
  return approximateTimezoneFromLongitude(Number(site?.longitude ?? 0));
}

export function formatTimeInput(minutesInDay) {
  const normalized = ((Math.round(minutesInDay) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function formatTimeLabel(minutesInDay) {
  const normalized = ((Math.round(minutesInDay) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${pad2(minutes)} ${meridiem}`;
}

export function parseTimeInput(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return 12 * 60;
  const hours = clamp(Number(match[1]), 0, 23);
  const minutes = clamp(Number(match[2]), 0, 59);
  return (hours * 60) + minutes;
}

export function roundMinutes(minutes, step = 15) {
  return clamp(Math.round(minutes / step) * step, 0, MINUTES_PER_DAY - step);
}

export function getTimeZoneOffsetMinutes(date, timeZone) {
  // Rebuild a UTC timestamp from the timezone-aware parts, then compare it with the input date.
  const parts = formatterParts(date, timeZone);
  const utcEquivalent = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (utcEquivalent - date.getTime()) / 60000;
}

export function zonedDateTimeToUtc(dateInput, minutesInDay, timeZone) {
  const [year, month, day] = String(dateInput).split("-").map(Number);
  const hours = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;
  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

  // Resolve the timezone offset twice so DST boundaries land on the correct UTC instant.
  let utcDate = new Date(naiveUtc);
  let offsetMinutes = getTimeZoneOffsetMinutes(utcDate, timeZone);
  utcDate = new Date(naiveUtc - (offsetMinutes * 60000));

  const correctedOffset = getTimeZoneOffsetMinutes(utcDate, timeZone);
  if (correctedOffset !== offsetMinutes) {
    offsetMinutes = correctedOffset;
    utcDate = new Date(naiveUtc - (offsetMinutes * 60000));
  }

  return {
    utcDate,
    offsetMinutes,
  };
}

export function getCurrentZonedDateTime(timeZone, now = new Date()) {
  const parts = formatterParts(now, timeZone);
  return {
    dateInput: `${parts.year}-${parts.month}-${parts.day}`,
    minutesInDay: roundMinutes((Number(parts.hour) * 60) + Number(parts.minute)),
  };
}

function formatOffsetLabel(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `UTC${sign}${pad2(hours)}:${pad2(minutes)}`;
}

export function formatZonedDateTime(utcDate, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(utcDate);
}

export function computeSolarPosition({
  latitude,
  longitude,
  dateInput,
  minutesInDay,
  timeZone,
}) {
  const resolvedTimeZone = resolveSiteTimeZone({ longitude, timezone: timeZone });
  const { utcDate, offsetMinutes } = zonedDateTimeToUtc(dateInput, minutesInDay, resolvedTimeZone);

  // The remaining calculations follow the standard NOAA-style solar position equations.
  const julianDay = (utcDate.getTime() / MS_PER_DAY) + 2440587.5;
  const julianCentury = (julianDay - 2451545) / 36525;

  const meanLongitude = normalizeDegrees(
    280.46646 + (julianCentury * (36000.76983 + (julianCentury * 0.0003032))),
  );
  const meanAnomaly = 357.52911 + (julianCentury * (35999.05029 - (0.0001537 * julianCentury)));
  const eccentricity = 0.016708634 - (julianCentury * (0.000042037 + (0.0000001267 * julianCentury)));
  const equationCenter = (
    Math.sin(toRadians(meanAnomaly)) * (1.914602 - (julianCentury * (0.004817 + (0.000014 * julianCentury))))
    + Math.sin(toRadians(2 * meanAnomaly)) * (0.019993 - (0.000101 * julianCentury))
    + Math.sin(toRadians(3 * meanAnomaly)) * 0.000289
  );
  const trueLongitude = meanLongitude + equationCenter;
  const apparentLongitude = trueLongitude - 0.00569 - (0.00478 * Math.sin(toRadians(125.04 - (1934.136 * julianCentury))));
  const meanObliquity = 23
    + ((26 + ((21.448 - (julianCentury * (46.815 + (julianCentury * (0.00059 - (julianCentury * 0.001813)))))) / 60)) / 60);
  const obliquityCorrection = meanObliquity + (0.00256 * Math.cos(toRadians(125.04 - (1934.136 * julianCentury))));
  const declination = toDegrees(
    Math.asin(
      Math.sin(toRadians(obliquityCorrection)) * Math.sin(toRadians(apparentLongitude)),
    ),
  );
  const y = Math.tan(toRadians(obliquityCorrection / 2)) ** 2;

  const equationOfTime = 4 * toDegrees(
    (y * Math.sin(2 * toRadians(meanLongitude)))
    - (2 * eccentricity * Math.sin(toRadians(meanAnomaly)))
    + (4 * eccentricity * y * Math.sin(toRadians(meanAnomaly)) * Math.cos(2 * toRadians(meanLongitude)))
    - (0.5 * (y ** 2) * Math.sin(4 * toRadians(meanLongitude)))
    - (1.25 * (eccentricity ** 2) * Math.sin(2 * toRadians(meanAnomaly))),
  );

  let trueSolarTime = minutesInDay + equationOfTime + (4 * longitude) - offsetMinutes;
  trueSolarTime = ((trueSolarTime % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  let hourAngle = (trueSolarTime / 4) - 180;
  if (hourAngle < -180) hourAngle += 360;

  const latitudeRad = toRadians(latitude);
  const declinationRad = toRadians(declination);
  const hourAngleRad = toRadians(hourAngle);
  const cosZenith = clamp(
    (Math.sin(latitudeRad) * Math.sin(declinationRad))
      + (Math.cos(latitudeRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)),
    -1,
    1,
  );
  const zenith = toDegrees(Math.acos(cosZenith));
  const elevation = 90 - zenith;

  let refraction = 0;
  if (elevation > 85) {
    refraction = 0;
  } else if (elevation > 5) {
    const tangent = Math.tan(toRadians(elevation));
    refraction = ((58.1 / tangent) - (0.07 / (tangent ** 3)) + (0.000086 / (tangent ** 5))) / 3600;
  } else if (elevation > -0.575) {
    refraction = (
      1735
      + (elevation * (-518.2 + (elevation * (103.4 + (elevation * (-12.79 + (elevation * 0.711)))))))
    ) / 3600;
  } else {
    refraction = (-20.772 / Math.tan(toRadians(elevation))) / 3600;
  }

  const apparentElevation = elevation + refraction;
  const sinZenith = Math.max(Math.sin(toRadians(zenith)), 1e-6);

  // Convert the zenith solution into the azimuth convention already used by the scene lights.
  const azimuthBase = clamp(
    ((Math.sin(latitudeRad) * Math.cos(toRadians(zenith))) - Math.sin(declinationRad))
      / (Math.cos(latitudeRad) * sinZenith),
    -1,
    1,
  );
  const azimuth = hourAngle > 0
    ? normalizeDegrees(toDegrees(Math.acos(azimuthBase)) + 180)
    : normalizeDegrees(540 - toDegrees(Math.acos(azimuthBase)));

  return {
    utcDate,
    timeZone: resolvedTimeZone,
    timeZoneOffsetMinutes: offsetMinutes,
    timeZoneOffsetLabel: formatOffsetLabel(offsetMinutes),
    localDateTimeLabel: formatZonedDateTime(utcDate, resolvedTimeZone),
    equationOfTimeMinutes: equationOfTime,
    declinationDeg: declination,
    azimuthDeg: azimuth,
    elevationDeg: elevation,
    apparentElevationDeg: apparentElevation,
    isDaylight: apparentElevation > 0,
    isGoldenHour: apparentElevation > 0 && apparentElevation < 10,
  };
}
