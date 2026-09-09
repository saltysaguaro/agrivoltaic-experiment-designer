import type { SiteAutocompleteSuggestion } from "@agrivoltaic/shared";

export const MAPBOX_NOT_CONFIGURED_MESSAGE = "Mapbox geocoding is not configured on this backend. Set MAPBOX_ACCESS_TOKEN and restart the backend.";

export class MapboxNotConfiguredError extends Error {
  constructor(message = MAPBOX_NOT_CONFIGURED_MESSAGE) {
    super(message);
    this.name = "MapboxNotConfiguredError";
  }
}

export class MapboxResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MapboxResolutionError";
  }
}

export function approximateTimezoneFromLongitude(longitude: number): string {
  if (longitude <= -157) return "Pacific/Honolulu";
  if (longitude <= -123) return "America/Los_Angeles";
  if (longitude <= -111) return "America/Phoenix";
  if (longitude <= -101) return "America/Denver";
  if (longitude <= -85) return "America/Chicago";
  if (longitude <= -66) return "America/New_York";
  return "UTC";
}

function findContextText(feature: any, prefix: string): string | undefined {
  const match = feature.context?.find((entry: any) => String(entry.id).startsWith(prefix));
  return match?.text;
}

export function normalizeMapboxFeature(feature: any): SiteAutocompleteSuggestion {
  const center = Array.isArray(feature.center) ? feature.center : [0, 0];
  const longitude = Number(center[0] ?? 0);
  const latitude = Number(center[1] ?? 0);

  return {
    id: String(feature.id ?? feature.place_name ?? `${longitude},${latitude}`),
    label: String(feature.place_name ?? feature.text ?? "Selected location"),
    fullAddress: String(feature.place_name ?? feature.text ?? "Selected location"),
    latitude,
    longitude,
    timezone: approximateTimezoneFromLongitude(longitude),
    region: findContextText(feature, "region"),
    country: findContextText(feature, "country"),
  };
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function featureSearchTexts(feature: any): string[] {
  const contextEntries = Array.isArray(feature.context) ? feature.context : [];
  return [
    feature.place_name,
    feature.text,
    feature.address,
    feature.properties?.short_code,
    ...contextEntries.flatMap((entry: any) => [entry?.text, entry?.short_code]),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

function featureMatchesQuery(feature: any, query: string): boolean {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const haystacks = featureSearchTexts(feature);
  return tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
}

function resolutionScore(feature: any, query: string): number {
  const normalizedQuery = normalizeText(query);
  const haystacks = featureSearchTexts(feature);
  const exactMatch = haystacks.some((value) => value === normalizedQuery) ? 100 : 0;
  const startsWith = haystacks.some((value) => value.startsWith(normalizedQuery)) ? 50 : 0;
  const contains = haystacks.some((value) => value.includes(normalizedQuery)) ? 20 : 0;
  const addressBonus = Array.isArray(feature.place_type) && feature.place_type.includes("address") ? 10 : 0;
  const relevance = Number(feature.relevance ?? 0);
  return exactMatch + startsWith + contains + addressBonus + relevance;
}

function formatFetchFailure(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Mapbox lookup request failed.";
  }

  const causeCode = typeof (error as Error & { cause?: { code?: unknown } }).cause?.code === "string"
    ? (error as Error & { cause?: { code?: string } }).cause?.code
    : undefined;
  const causeMessage = typeof (error as Error & { cause?: { message?: unknown } }).cause?.message === "string"
    ? (error as Error & { cause?: { message?: string } }).cause?.message
    : undefined;
  const details = [causeCode, causeMessage].filter(Boolean).join(": ");

  return details
    ? `Mapbox lookup request failed. ${details}`
    : `Mapbox lookup request failed. ${error.message}`;
}

async function fetchMapboxFeatures(
  query: string,
  accessToken: string,
  options: {
    autocomplete: boolean;
    limit: number;
  },
): Promise<any[]> {
  if (!accessToken.trim()) {
    throw new MapboxNotConfiguredError();
  }

  const endpoint = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  endpoint.searchParams.set("autocomplete", options.autocomplete ? "true" : "false");
  endpoint.searchParams.set("limit", String(options.limit));
  endpoint.searchParams.set("language", "en");
  endpoint.searchParams.set("access_token", accessToken);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(formatFetchFailure(error));
  }

  if (!response.ok) {
    throw new Error(`Mapbox lookup failed with status ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.features) ? payload.features : [];
}

export async function searchMapboxPlaces(
  query: string,
  accessToken: string,
  limit = 5,
): Promise<SiteAutocompleteSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const features = await fetchMapboxFeatures(trimmed, accessToken, {
    autocomplete: true,
    limit,
  });
  return features.map(normalizeMapboxFeature);
}

export async function resolveMapboxPlace(
  query: string,
  accessToken: string,
): Promise<SiteAutocompleteSuggestion> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new MapboxResolutionError("Enter an address or place name to verify with Mapbox.");
  }

  const features = await fetchMapboxFeatures(trimmed, accessToken, {
    autocomplete: false,
    limit: 5,
  });
  const candidates = features
    .filter((feature) => featureMatchesQuery(feature, trimmed))
    .sort((a, b) => resolutionScore(b, trimmed) - resolutionScore(a, trimmed));
  const candidate = candidates[0];
  if (!candidate) {
    throw new MapboxResolutionError(`Mapbox could not verify "${trimmed}" as an address or place. Refine the entry and try again.`);
  }
  return normalizeMapboxFeature(candidate);
}

export async function searchSitePlaces(
  query: string,
  options: {
    accessToken?: string;
    limit?: number;
  } = {},
): Promise<{
  suggestions: SiteAutocompleteSuggestion[];
  provider: "mapbox";
}> {
  return {
    suggestions: await searchMapboxPlaces(query, options.accessToken ?? "", options.limit),
    provider: "mapbox",
  };
}

export async function resolveSitePlace(
  query: string,
  options: {
    accessToken?: string;
  } = {},
): Promise<{
  suggestion: SiteAutocompleteSuggestion;
  provider: "mapbox";
}> {
  return {
    suggestion: await resolveMapboxPlace(query, options.accessToken ?? ""),
    provider: "mapbox",
  };
}
