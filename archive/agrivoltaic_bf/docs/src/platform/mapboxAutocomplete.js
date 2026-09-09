import { autocompleteSite, getClientConfig, resolveSite } from "./apiClient.js";

const MAPBOX_REQUIRED_MESSAGE = "Mapbox address lookup is not configured on this backend. Set `MAPBOX_ACCESS_TOKEN` and restart the backend.";
const MAPBOX_IDLE_MESSAGE = "Type at least three characters to search for a site with Mapbox.";

function debounce(fn, delay = 200) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

function approximateTimezoneFromLongitude(longitude) {
  if (longitude <= -157) return "Pacific/Honolulu";
  if (longitude <= -123) return "America/Los_Angeles";
  if (longitude <= -111) return "America/Phoenix";
  if (longitude <= -101) return "America/Denver";
  if (longitude <= -85) return "America/Chicago";
  if (longitude <= -66) return "America/New_York";
  return "UTC";
}

function findContextText(feature, prefix) {
  const match = feature.context?.find((entry) => String(entry.id).startsWith(prefix));
  return match?.text;
}

function normalizeFeature(feature) {
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

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function featureSearchTexts(feature) {
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
  const haystacks = featureSearchTexts(feature);
  return tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
}

function resolutionScore(feature, query) {
  const normalizedQuery = normalizeText(query);
  const haystacks = featureSearchTexts(feature);
  const exactMatch = haystacks.some((value) => value === normalizedQuery) ? 100 : 0;
  const startsWith = haystacks.some((value) => value.startsWith(normalizedQuery)) ? 50 : 0;
  const contains = haystacks.some((value) => value.includes(normalizedQuery)) ? 20 : 0;
  const addressBonus = Array.isArray(feature.place_type) && feature.place_type.includes("address") ? 10 : 0;
  const relevance = Number(feature.relevance ?? 0);
  return exactMatch + startsWith + contains + addressBonus + relevance;
}

function renderSuggestions(container, suggestions, onSelect) {
  container.innerHTML = "";
  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-item";
    button.textContent = suggestion.label;
    button.addEventListener("click", () => {
      void Promise.resolve(onSelect(suggestion));
    });
    container.append(button);
  });
}

async function fetchDirectMapboxFeatures(query, token, { autocomplete, limit }) {
  const endpoint = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  endpoint.searchParams.set("autocomplete", autocomplete ? "true" : "false");
  endpoint.searchParams.set("limit", String(limit));
  endpoint.searchParams.set("language", "en");
  endpoint.searchParams.set("access_token", token);

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Mapbox lookup failed with status ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.features) ? payload.features : [];
}

async function searchDirectMapboxPlaces(query, token, limit = 5) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const features = await fetchDirectMapboxFeatures(trimmed, token, {
    autocomplete: true,
    limit,
  });
  return features.map(normalizeFeature);
}

async function resolveDirectMapboxPlace(query, token) {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Enter an address or place name to verify with Mapbox.");
  }

  const features = await fetchDirectMapboxFeatures(trimmed, token, {
    autocomplete: false,
    limit: 5,
  });
  const candidates = features
    .filter((feature) => featureMatchesQuery(feature, trimmed))
    .sort((a, b) => resolutionScore(b, trimmed) - resolutionScore(a, trimmed));
  const candidate = candidates[0];
  if (!candidate) {
    throw new Error(`Mapbox could not verify "${trimmed}" as an address or place. Refine the entry and try again.`);
  }
  return normalizeFeature(candidate);
}

export async function mountSiteAutocomplete({
  input,
  suggestionsEl,
  statusEl,
  onSelect,
  onPendingSelection,
  minChars = 3,
}) {
  let config = { mapboxTokenAvailable: false, mapboxPublicToken: undefined };
  let configErrorMessage = "";
  let selectedLabel = "";

  try {
    config = await getClientConfig();
  } catch (error) {
    configErrorMessage = error instanceof Error ? error.message : "Could not reach the local backend.";
  }

  const mapboxAvailable = Boolean(config.mapboxPublicToken || config.mapboxTokenAvailable);

  function unavailableMessage() {
    return configErrorMessage || MAPBOX_REQUIRED_MESSAGE;
  }

  function clearPendingSelection() {
    if (!selectedLabel) return;
    selectedLabel = "";
    onPendingSelection?.();
  }

  async function commitSelection(suggestion) {
    selectedLabel = suggestion.label;
    input.value = suggestion.label;
    suggestionsEl.innerHTML = "";
    await onSelect(suggestion, "mapbox");
  }

  async function searchPlaces(query) {
    if (config.mapboxPublicToken) {
      return {
        suggestions: await searchDirectMapboxPlaces(query, config.mapboxPublicToken, 5),
      };
    }
    return autocompleteSite(query);
  }

  async function resolvePlace(query) {
    if (config.mapboxPublicToken) {
      return {
        suggestion: await resolveDirectMapboxPlace(query, config.mapboxPublicToken),
      };
    }
    return resolveSite(query);
  }

  async function resolveExactInput() {
    if (!mapboxAvailable) {
      throw new Error(unavailableMessage());
    }

    const query = input.value.trim();
    if (!query) {
      throw new Error("Enter an address or place name to verify with Mapbox.");
    }

    statusEl.textContent = "Verifying address with Mapbox…";
    const payload = await resolvePlace(query);
    await commitSelection(payload.suggestion);
    statusEl.textContent = `Verified with Mapbox: ${payload.suggestion.label}.`;
    return payload.suggestion;
  }

  const fetchSuggestions = debounce(async () => {
    const query = input.value.trim();
    if (!mapboxAvailable) {
      suggestionsEl.innerHTML = "";
      statusEl.textContent = unavailableMessage();
      return;
    }

    if (query.length < minChars) {
      suggestionsEl.innerHTML = "";
      statusEl.textContent = MAPBOX_IDLE_MESSAGE;
      return;
    }

    statusEl.textContent = "Searching Mapbox…";
    try {
      const payload = await searchPlaces(query);
      const suggestions = payload.suggestions || [];
      if (!suggestions.length) {
        suggestionsEl.innerHTML = "";
        statusEl.textContent = `Mapbox found no matches for "${query}". Keep typing or press Enter to verify the full address.`;
        return;
      }

      statusEl.textContent = "Select a Mapbox match to use its coordinates and timezone.";
      renderSuggestions(suggestionsEl, suggestions, async (suggestion) => {
        await commitSelection(suggestion);
        statusEl.textContent = `${suggestion.label} selected from Mapbox.`;
      });
    } catch (error) {
      suggestionsEl.innerHTML = "";
      statusEl.textContent = error instanceof Error ? error.message : "Mapbox address lookup failed.";
    }
  }, 180);

  if (!mapboxAvailable) {
    statusEl.textContent = unavailableMessage();
  } else {
    statusEl.textContent = MAPBOX_IDLE_MESSAGE;
  }

  input.addEventListener("input", () => {
    if (selectedLabel && input.value.trim() !== selectedLabel) {
      clearPendingSelection();
    }
    fetchSuggestions();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void resolveExactInput().catch((error) => {
      suggestionsEl.innerHTML = "";
      statusEl.textContent = error instanceof Error ? error.message : "Mapbox could not verify that address.";
    });
  });

  return {
    config,
    resolveExactInput,
  };
}
