import test from "node:test";
import assert from "node:assert/strict";
import {
  MAPBOX_NOT_CONFIGURED_MESSAGE,
  MapboxNotConfiguredError,
  MapboxResolutionError,
  approximateTimezoneFromLongitude,
  normalizeMapboxFeature,
  resolveSitePlace,
  searchSitePlaces,
} from "../packages/simulation-backend/src/site/mapbox.js";

test("approximateTimezoneFromLongitude maps common US longitudes", () => {
  assert.equal(approximateTimezoneFromLongitude(-112), "America/Phoenix");
  assert.equal(approximateTimezoneFromLongitude(-104), "America/Denver");
  assert.equal(approximateTimezoneFromLongitude(-74), "America/New_York");
});

test("normalizeMapboxFeature converts feature payloads into site suggestions", () => {
  const suggestion = normalizeMapboxFeature({
    id: "place.1",
    place_name: "Boulder, Colorado, United States",
    center: [-105.2705, 40.015],
    context: [
      { id: "region.1", text: "Colorado" },
      { id: "country.1", text: "United States" },
    ],
  });

  assert.equal(suggestion.label, "Boulder, Colorado, United States");
  assert.equal(suggestion.region, "Colorado");
  assert.equal(suggestion.country, "United States");
  assert.equal(suggestion.timezone, "America/Denver");
});

test("searchSitePlaces requires a configured Mapbox token", async () => {
  await assert.rejects(
    searchSitePlaces("Phoenix, AZ"),
    (error: unknown) => error instanceof MapboxNotConfiguredError && error.message === MAPBOX_NOT_CONFIGURED_MESSAGE,
  );
});

test("searchSitePlaces returns Mapbox autocomplete suggestions", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: URL | RequestInfo | string) => {
    const url = String(input);
    assert.match(url, /autocomplete=true/);
    assert.match(url, /access_token=test-token/);
    return new Response(JSON.stringify({
      features: [{
        id: "address.1",
        place_name: "732 N Avenida Calma, Green Valley, Arizona 85614, United States",
        center: [-111.0241, 31.8542],
        context: [
          { id: "region.1", text: "Arizona", short_code: "us-az" },
          { id: "country.1", text: "United States", short_code: "us" },
        ],
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await searchSitePlaces("732 n avenida calma", {
      accessToken: "test-token",
      limit: 5,
    });
    assert.equal(result.provider, "mapbox");
    assert.equal(result.suggestions.length, 1);
    assert.equal(result.suggestions[0]?.latitude, 31.8542);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("resolveSitePlace verifies the final typed address through Mapbox", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: URL | RequestInfo | string) => {
    const url = String(input);
    assert.match(url, /autocomplete=false/);
    return new Response(JSON.stringify({
      features: [{
        id: "address.1",
        place_name: "732 N Avenida Calma, Green Valley, Arizona 85614, United States",
        text: "Avenida Calma",
        address: "732",
        relevance: 1,
        place_type: ["address"],
        center: [-111.0241, 31.8542],
        context: [
          { id: "region.1", text: "Arizona", short_code: "us-az" },
          { id: "country.1", text: "United States", short_code: "us" },
        ],
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await resolveSitePlace("732 n avenida calma", {
      accessToken: "test-token",
    });
    assert.equal(result.provider, "mapbox");
    assert.equal(result.suggestion.label, "732 N Avenida Calma, Green Valley, Arizona 85614, United States");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("resolveSitePlace rejects unmatched Mapbox results", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    features: [{
      id: "place.1",
      place_name: "Los Angeles, California, United States",
      center: [-118.2437, 34.0522],
      context: [
        { id: "region.1", text: "California", short_code: "us-ca" },
        { id: "country.1", text: "United States", short_code: "us" },
      ],
    }],
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  try {
    await assert.rejects(
      resolveSitePlace("totally unknown address", {
        accessToken: "test-token",
      }),
      (error: unknown) => error instanceof MapboxResolutionError,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
