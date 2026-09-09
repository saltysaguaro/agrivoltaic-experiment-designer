import { approximateTimezoneFromLongitude } from "./solarPosition.js";

const MAPBOX_IDLE_MESSAGE = "";

function debounce(fn, delay = 180) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function searchTexts(feature) {
  const contextEntries = Array.isArray(feature.context) ? feature.context : [];
  return [
    feature.place_name,
    feature.text,
    feature.address,
    feature.properties?.short_code,
    ...contextEntries.flatMap((entry) => [entry?.text, entry?.short_code]),
  ]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

function featureMatchesQuery(feature, query) {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const haystacks = searchTexts(feature);
  return tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
}

function resolutionScore(feature, query) {
  const normalizedQuery = normalizeText(query);
  const haystacks = searchTexts(feature);
  const exactMatch = haystacks.some((value) => value === normalizedQuery) ? 100 : 0;
  const startsWith = haystacks.some((value) => value.startsWith(normalizedQuery)) ? 50 : 0;
  const contains = haystacks.some((value) => value.includes(normalizedQuery)) ? 20 : 0;
  const addressBonus = Array.isArray(feature.place_type) && feature.place_type.includes("address") ? 10 : 0;
  const relevance = Number(feature.relevance ?? 0);
  return exactMatch + startsWith + contains + addressBonus + relevance;
}

function findContextText(feature, prefix) {
  return feature.context?.find((entry) => String(entry.id || "").startsWith(prefix))?.text;
}

function findContextShortCode(feature, prefix) {
  return feature.context?.find((entry) => String(entry.id || "").startsWith(prefix))?.short_code;
}

function normalizeFeature(feature) {
  const center = Array.isArray(feature.center) ? feature.center : [0, 0];
  const longitude = Number(center[0] ?? 0);
  const latitude = Number(center[1] ?? 0);
  return {
    id: String(feature.id ?? feature.place_name ?? `${longitude},${latitude}`),
    label: String(feature.place_name ?? feature.text ?? "Selected location"),
    address: String(feature.place_name ?? feature.text ?? "Selected location"),
    fullAddress: String(feature.place_name ?? feature.text ?? "Selected location"),
    latitude,
    longitude,
    // Geocoding results do not include an IANA timezone, so the public page starts with a longitude estimate.
    timezone: approximateTimezoneFromLongitude(longitude),
    timezoneApproximate: true,
    region: findContextText(feature, "region"),
    regionCode: findContextShortCode(feature, "region"),
    country: findContextText(feature, "country"),
    countryCode: findContextShortCode(feature, "country"),
  };
}

async function mapboxErrorMessage(response) {
  let detail = "";
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string" && payload.message.trim()) {
      detail = payload.message.trim();
    }
  } catch {
    // The response body is only used to improve the status text, so parse failures are ignored.
  }

  if (response.status === 403) {
    const origin = window.location.origin;
    const hint = [
      "Address lookup is not authorized for this site (403).",
      "Confirm the token allows geocoding requests and that its allowed URL list includes",
      origin,
      "exactly.",
      "A path-only restriction such as",
      `${origin}${window.location.pathname}`,
      "will not match by itself.",
    ].join(" ");
    return detail ? `${hint} Mapbox says: ${detail}` : hint;
  }

  if (response.status === 401) {
    return detail
      ? `Address lookup key rejected the request (401). ${detail}`
      : "Address lookup key rejected the request (401).";
  }

  return detail
    ? `Mapbox lookup failed with status ${response.status}. ${detail}`
    : `Mapbox lookup failed with status ${response.status}.`;
}

async function fetchMapboxFeatures(query, token, { autocomplete, limit }) {
  const endpoint = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  endpoint.searchParams.set("access_token", token);
  endpoint.searchParams.set("autocomplete", autocomplete ? "true" : "false");
  endpoint.searchParams.set("limit", String(limit));
  endpoint.searchParams.set("language", "en");
  endpoint.searchParams.set("types", "address,place,locality,neighborhood,postcode,district,region");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(await mapboxErrorMessage(response));
  }

  const payload = await response.json();
  return Array.isArray(payload.features) ? payload.features : [];
}

function renderSuggestions(container, suggestions, onSelect) {
  container.replaceChildren(
    ...suggestions.map((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pv-suggestion-button";
      button.textContent = suggestion.label;
      button.addEventListener("click", () => {
        void onSelect(suggestion);
      });
      return button;
    }),
  );
}

export function normalizeConfiguredSite(site) {
  const normalizedAddress = String(site?.address ?? site?.fullAddress ?? site?.label ?? "Golden, Colorado");
  return {
    label: String(site?.label ?? "Golden, Colorado"),
    address: normalizedAddress,
    fullAddress: String(site?.fullAddress ?? site?.label ?? "Golden, Colorado"),
    latitude: Number(site?.latitude ?? 39.7555),
    longitude: Number(site?.longitude ?? -105.2211),
    timezone: String(site?.timezone ?? approximateTimezoneFromLongitude(Number(site?.longitude ?? -105.2211))),
    timezoneApproximate: Boolean(site?.timezoneApproximate),
    region: String(site?.region ?? ""),
    regionCode: String(site?.regionCode ?? ""),
    country: String(site?.country ?? ""),
    countryCode: String(site?.countryCode ?? ""),
  };
}

export function mountPublicSiteLookup({
  input,
  suggestionsEl,
  statusEl,
  onSelect,
  token,
  minChars = 3,
}) {
  let selectedLabel = "";

  async function commitSelection(site) {
    selectedLabel = site.label;
    input.value = site.fullAddress || site.label;
    suggestionsEl.replaceChildren();
    await onSelect(site);
  }

  async function searchPlaces(query) {
    const features = await fetchMapboxFeatures(query, token, {
      autocomplete: true,
      limit: 5,
    });
    return features.map(normalizeFeature);
  }

  async function resolvePlace(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error("Enter an address or place name to verify with Mapbox.");
    }

    const features = await fetchMapboxFeatures(trimmed, token, {
      autocomplete: false,
      limit: 5,
    });
    // Exact entry resolution uses a stricter match than autocomplete so shared links stay stable.
    const candidates = features
      .filter((feature) => featureMatchesQuery(feature, trimmed))
      .sort((a, b) => resolutionScore(b, trimmed) - resolutionScore(a, trimmed));
    const candidate = candidates[0];
    if (!candidate) {
      throw new Error(`Mapbox could not verify "${trimmed}". Refine the address and try again.`);
    }
    return normalizeFeature(candidate);
  }

  const fetchSuggestions = debounce(async () => {
    const query = input.value.trim();
    if (!token) {
      statusEl.textContent = "Address lookup is unavailable in this deployment.";
      suggestionsEl.replaceChildren();
      return;
    }

    if (query.length < minChars) {
      suggestionsEl.replaceChildren();
      statusEl.textContent = MAPBOX_IDLE_MESSAGE;
      return;
    }

    statusEl.textContent = "Searching Mapbox…";
    try {
      const suggestions = await searchPlaces(query);
      if (!suggestions.length) {
        suggestionsEl.replaceChildren();
        statusEl.textContent = `No matches found for "${query}". Press Enter to verify the full address.`;
        return;
      }

      statusEl.textContent = "";
      renderSuggestions(suggestionsEl, suggestions, async (suggestion) => {
        await commitSelection(suggestion);
        statusEl.textContent = "";
      });
    } catch (error) {
      suggestionsEl.replaceChildren();
      statusEl.textContent = error instanceof Error ? error.message : "Mapbox search failed.";
    }
  }, 180);

  input.addEventListener("input", () => {
    if (selectedLabel && input.value.trim() !== selectedLabel) {
      selectedLabel = "";
    }
    // Only the selected suggestion is treated as authoritative. Free typing reopens the search state.
    void fetchSuggestions();
  });

  input.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!token) return;

    try {
      statusEl.textContent = "Verifying address with Mapbox…";
      const site = await resolvePlace(input.value.trim());
      await commitSelection(site);
      statusEl.textContent = "";
    } catch (error) {
      statusEl.textContent = error instanceof Error ? error.message : "Could not verify this address.";
    }
  });

  if (!token) {
    input.disabled = true;
    statusEl.textContent = "Address lookup is unavailable in this deployment.";
  } else {
    input.disabled = false;
    statusEl.textContent = MAPBOX_IDLE_MESSAGE;
  }
}
