import type {
  AnnualWeatherMetadata,
  HourlyWeatherSample,
  SiteLocation,
} from "@agrivoltaic/shared";

function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

function radToDeg(value: number): number {
  return (value * 180) / Math.PI;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86400000);
}

export function solarPosition(timestamp: Date, latitude: number, longitude: number) {
  const doy = dayOfYear(timestamp);
  const hour = timestamp.getUTCHours() + (timestamp.getUTCMinutes() / 60);
  const gamma = (2 * Math.PI / 365) * ((doy - 1) + ((hour - 12) / 24));
  const decl = 0.006918
    - (0.399912 * Math.cos(gamma))
    + (0.070257 * Math.sin(gamma))
    - (0.006758 * Math.cos(2 * gamma))
    + (0.000907 * Math.sin(2 * gamma))
    - (0.002697 * Math.cos(3 * gamma))
    + (0.00148 * Math.sin(3 * gamma));
  const eqTime = 229.18 * (
    0.000075
    + (0.001868 * Math.cos(gamma))
    - (0.032077 * Math.sin(gamma))
    - (0.014615 * Math.cos(2 * gamma))
    - (0.040849 * Math.sin(2 * gamma))
  );

  const timeOffset = eqTime + (4 * longitude);
  const trueSolarMinutes = ((hour * 60) + timeOffset + 1440) % 1440;
  const hourAngleDeg = trueSolarMinutes / 4 < 0
    ? (trueSolarMinutes / 4) + 180
    : (trueSolarMinutes / 4) - 180;
  const hourAngle = degToRad(hourAngleDeg);
  const latRad = degToRad(latitude);

  const cosZenith = (Math.sin(latRad) * Math.sin(decl))
    + (Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle));
  const zenith = Math.acos(Math.min(1, Math.max(-1, cosZenith)));
  const elevation = 90 - radToDeg(zenith);

  const azimuth = radToDeg(Math.atan2(
    Math.sin(hourAngle),
    (Math.cos(hourAngle) * Math.sin(latRad)) - (Math.tan(decl) * Math.cos(latRad)),
  )) + 180;

  return {
    elevationDeg: elevation,
    azimuthDeg: azimuth,
  };
}

function monthIndexFromTimestamp(timestamp: Date): number {
  return timestamp.getUTCMonth() + 1;
}

function buildWeatherSummary(
  site: SiteLocation,
  source: AnnualWeatherMetadata["source"],
  hourly: HourlyWeatherSample[],
  extras: Partial<Pick<AnnualWeatherMetadata, "providerLabel" | "notes">> = {},
): AnnualWeatherMetadata {
  const monthlyGhiWhM2 = new Array(12).fill(0);
  const monthlyDniWhM2 = new Array(12).fill(0);
  const monthlyDhiWhM2 = new Array(12).fill(0);

  for (const sample of hourly) {
    const index = sample.month - 1;
    monthlyGhiWhM2[index] += sample.ghi;
    monthlyDniWhM2[index] += sample.dni;
    monthlyDhiWhM2[index] += sample.dhi;
  }

  return {
    source,
    site,
    retrievedAt: new Date().toISOString(),
    timezone: site.timezone,
    providerLabel: extras.providerLabel,
    notes: extras.notes,
    records: hourly.length,
    annualGhiWhM2: monthlyGhiWhM2.reduce((sum, value) => sum + value, 0),
    annualDniWhM2: monthlyDniWhM2.reduce((sum, value) => sum + value, 0),
    annualDhiWhM2: monthlyDhiWhM2.reduce((sum, value) => sum + value, 0),
    monthlyGhiWhM2,
    monthlyDniWhM2,
    monthlyDhiWhM2,
    hourly,
  };
}

export function buildSyntheticWeather(site: SiteLocation, year = 2025): AnnualWeatherMetadata {
  const hourly: HourlyWeatherSample[] = [];

  let hourIndex = 0;
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(Date.UTC(year, month, day, hour, 0, 0));
        const solar = solarPosition(timestamp, site.latitude, site.longitude);
        const elevationRad = degToRad(Math.max(0, solar.elevationDeg));
        const daylight = Math.max(0, Math.sin(elevationRad));
        const seasonal = 0.62 + (0.28 * Math.cos(((dayOfYear(timestamp) - 172) / 365) * 2 * Math.PI));
        const cloud = 0.84 + (0.08 * Math.sin((dayOfYear(timestamp) * 0.31) + (hour * 0.43)));
        const ghi = Math.max(0, 940 * daylight * seasonal * cloud);
        const dhi = Math.max(0, ghi * (0.2 + ((1 - daylight) * 0.28)));
        const dni = daylight > 0.05
          ? Math.max(0, (ghi - dhi) / Math.max(0.12, daylight))
          : 0;

        hourly.push({
          timestamp: timestamp.toISOString(),
          month: monthIndexFromTimestamp(timestamp),
          hourIndex,
          ghi,
          dni,
          dhi,
          sunAzDeg: solar.azimuthDeg,
          sunElDeg: solar.elevationDeg,
        });
        hourIndex += 1;
      }
    }
  }

  return buildWeatherSummary(site, "synthetic_fallback", hourly, {
    providerLabel: "Synthetic fallback weather",
    notes: [
      "No external TMY weather source could be retrieved, so the annual workflow used a synthetic hourly weather profile.",
      "Set NSRDB_API_KEY (or AGRIVOLTAIC_NSRDB_API_KEY) and NSRDB_EMAIL (or AGRIVOLTAIC_CONTACT_EMAIL) to prefer NSRDB GOES TMY weather retrieval.",
    ],
  });
}

export async function fetchPvgisTmy(site: SiteLocation): Promise<AnnualWeatherMetadata> {
  const params = new URLSearchParams({
    lat: site.latitude.toFixed(6),
    lon: site.longitude.toFixed(6),
    outputformat: "json",
    usehorizon: "1",
  });
  const response = await fetch(`https://re.jrc.ec.europa.eu/api/tmy?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`PVGIS TMY lookup failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rows = payload.outputs?.tmy_hourly;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("PVGIS TMY payload did not contain hourly records");
  }

  const hourly: HourlyWeatherSample[] = rows.map((row: any, hourIndex: number) => {
    const time = row["time(UTC)"] ?? row["time"] ?? row.time ?? row.timestamp;
    const timestamp = new Date(String(time).replace(" ", "T"));
    const solar = solarPosition(timestamp, site.latitude, site.longitude);
    return {
      timestamp: timestamp.toISOString(),
      month: monthIndexFromTimestamp(timestamp),
      hourIndex,
      ghi: Number(row["G(h)"] ?? row.ghi ?? 0),
      dni: Number(row["Gb(n)"] ?? row.dni ?? 0),
      dhi: Number(row["Gd(h)"] ?? row.dhi ?? 0),
      sunAzDeg: solar.azimuthDeg,
      sunElDeg: solar.elevationDeg,
    };
  });

  return buildWeatherSummary(site, "pvgis_tmy", hourly, {
    providerLabel: "PVGIS TMY",
    notes: ["Weather source retrieved from the PVGIS TMY API."],
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function lineHasHourlyColumns(values: string[]): boolean {
  const normalized = new Set(values.map((value) => value.toLowerCase()));
  return normalized.has("year") && normalized.has("month") && normalized.has("day")
    && normalized.has("hour") && normalized.has("ghi") && normalized.has("dni") && normalized.has("dhi");
}

export function parseNsrdbTmyCsv(csv: string, site: SiteLocation): AnnualWeatherMetadata {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headerIndex = lines.findIndex((line) => lineHasHourlyColumns(splitCsvLine(line)));
  if (headerIndex === -1) {
    throw new Error("NSRDB TMY CSV did not contain the expected hourly header row");
  }

  const header = splitCsvLine(lines[headerIndex]!);
  const headerLookup = new Map(header.map((value, index) => [value.toLowerCase(), index]));
  const yearIndex = headerLookup.get("year");
  const monthIndex = headerLookup.get("month");
  const dayIndex = headerLookup.get("day");
  const hourIndex = headerLookup.get("hour");
  const minuteIndex = headerLookup.get("minute") ?? headerLookup.get("min");
  const ghiIndex = headerLookup.get("ghi");
  const dniIndex = headerLookup.get("dni");
  const dhiIndex = headerLookup.get("dhi");

  if ([yearIndex, monthIndex, dayIndex, hourIndex, ghiIndex, dniIndex, dhiIndex].some((index) => index === undefined)) {
    throw new Error("NSRDB TMY CSV is missing one or more required columns");
  }

  const hourly: HourlyWeatherSample[] = [];
  for (let lineIndex = headerIndex + 1; lineIndex < lines.length; lineIndex++) {
    const parts = splitCsvLine(lines[lineIndex]!);
    if (parts.length < header.length) continue;

    const year = Number(parts[yearIndex!]);
    const month = Number(parts[monthIndex!]);
    const day = Number(parts[dayIndex!]);
    const hour = Number(parts[hourIndex!]);
    const minute = minuteIndex !== undefined ? Number(parts[minuteIndex]) : 0;
    if (![year, month, day, hour, minute].every(Number.isFinite)) continue;

    const timestamp = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    const solar = solarPosition(timestamp, site.latitude, site.longitude);
    hourly.push({
      timestamp: timestamp.toISOString(),
      month,
      hourIndex: hourly.length,
      ghi: Number(parts[ghiIndex!] ?? 0),
      dni: Number(parts[dniIndex!] ?? 0),
      dhi: Number(parts[dhiIndex!] ?? 0),
      sunAzDeg: solar.azimuthDeg,
      sunElDeg: solar.elevationDeg,
    });
  }

  if (hourly.length === 0) {
    throw new Error("NSRDB TMY CSV did not contain any hourly weather rows");
  }

  return buildWeatherSummary(site, "nsrdb_tmy", hourly, {
    providerLabel: "NSRDB GOES TMY",
    notes: ["Weather source retrieved from the NSRDB GOES TMY download API."],
  });
}

export async function fetchNsrdbTmy(site: SiteLocation): Promise<AnnualWeatherMetadata> {
  const apiKey = process.env.NSRDB_API_KEY
    || process.env.AGRIVOLTAIC_NSRDB_API_KEY
    || process.env.NREL_API_KEY;
  const email = process.env.NSRDB_EMAIL
    || process.env.AGRIVOLTAIC_CONTACT_EMAIL
    || process.env.NREL_EMAIL;
  if (!apiKey) {
    throw new Error("[WEATHER_NSRDB_API_KEY_MISSING] NSRDB_API_KEY is not configured");
  }
  if (!email) {
    throw new Error("[WEATHER_NSRDB_EMAIL_MISSING] NSRDB_EMAIL is not configured");
  }
  const datasetCandidates = process.env.AGRIVOLTAIC_NSRDB_DATASET
    ? [process.env.AGRIVOLTAIC_NSRDB_DATASET]
    : ["tmy"];
  const errors: string[] = [];

  for (const datasetName of datasetCandidates) {
    const params = new URLSearchParams({
      api_key: apiKey,
      email,
      wkt: `POINT(${site.longitude.toFixed(6)} ${site.latitude.toFixed(6)})`,
      names: datasetName,
      interval: "60",
      utc: "true",
      leap_day: "false",
      attributes: "ghi,dni,dhi",
      full_name: "Agrivoltaic Local Platform",
      affiliation: "local",
      mailing_list: "false",
      reason: "Agrivoltaic irradiance modeling",
    });

    const response = await fetch(
      `https://developer.nrel.gov/api/nsrdb/v2/solar/nsrdb-GOES-tmy-v4-0-0-download.csv?${params.toString()}`
    );
    if (!response.ok) {
      const detail = (await response.text()).trim().replace(/\s+/g, " ").slice(0, 220);
      errors.push(`${datasetName}: status ${response.status}${detail ? ` (${detail})` : ""}`);
      continue;
    }

    const csv = await response.text();
    try {
      const weather = parseNsrdbTmyCsv(csv, site);
      return {
        ...weather,
        notes: [
          ...(weather.notes ?? []),
          `NSRDB dataset name used: ${datasetName}.`,
        ],
      };
    } catch (error) {
      errors.push(`${datasetName}: ${error instanceof Error ? error.message : "could not parse CSV"}`);
    }
  }

  throw new Error(`[WEATHER_NSRDB_FETCH_FAILED] NSRDB GOES TMY lookup failed (${errors.join("; ")})`);
}

export async function acquireAnnualWeather(site: SiteLocation): Promise<AnnualWeatherMetadata> {
  if (process.env.AGRIVOLTAIC_WEATHER_MODE === "synthetic") {
    if (process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC !== "true") {
      throw new Error(
        "[WEATHER_SYNTHETIC_DISABLED] Synthetic weather is disabled for the real app. "
        + "Configure NSRDB_API_KEY and NSRDB_EMAIL instead."
      );
    }
    return buildSyntheticWeather(site);
  }

  return fetchNsrdbTmy(site);
}
