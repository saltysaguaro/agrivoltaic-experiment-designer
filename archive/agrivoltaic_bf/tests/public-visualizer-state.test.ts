import test from "node:test";
import assert from "node:assert/strict";

async function loadStateModule() {
  // @ts-ignore browser-side JS module under test
  return import("../src/public/publicVisualizerState.js");
}

test("default site is preserved when latitude and longitude are missing from the URL", async () => {
  const { stateFromQuery } = await loadStateModule();
  const state = stateFromQuery({
    label: "Golden, Colorado",
    fullAddress: "Golden, Colorado, United States",
    latitude: 39.7555,
    longitude: -105.2211,
    region: "Colorado",
    regionCode: "US-CO",
    country: "United States",
    countryCode: "us",
    timezone: "America/Denver",
    timezoneApproximate: false,
  }, "?system=fixed&date=2026-06-21&time=13%3A00&view=rowOblique");

  assert.equal(state.site.latitude, 39.7555);
  assert.equal(state.site.longitude, -105.2211);
  assert.equal(state.site.timezone, "America/Denver");
  assert.equal(state.minutesInDay, 13 * 60);
  assert.equal(state.viewPreset, "rowOblique");
});

test("explicit coordinates in the URL override the default site", async () => {
  const { stateFromQuery } = await loadStateModule();
  const state = stateFromQuery({
    label: "Golden, Colorado",
    fullAddress: "Golden, Colorado, United States",
    latitude: 39.7555,
    longitude: -105.2211,
    timezone: "America/Denver",
    timezoneApproximate: false,
  }, "?lat=32.2226&lng=-110.9747&label=Tucson%2C%20Arizona&tz=America%2FPhoenix");

  assert.equal(state.site.latitude, 32.2226);
  assert.equal(state.site.longitude, -110.9747);
  assert.equal(state.site.timezone, "America/Phoenix");
  assert.equal(state.site.label, "Tucson, Arizona");
});

test("fixed and raised systems default the public preview to row view when no view query is supplied", async () => {
  const { stateFromQuery } = await loadStateModule();
  const defaultSite = {
    label: "Golden, Colorado",
    fullAddress: "Golden, Colorado, United States",
    latitude: 39.7555,
    longitude: -105.2211,
    timezone: "America/Denver",
    timezoneApproximate: false,
  };

  assert.equal(stateFromQuery(defaultSite, "?system=fixed").viewPreset, "rowOblique");
  assert.equal(stateFromQuery(defaultSite, "?system=raised").viewPreset, "rowOblique");
  assert.equal(stateFromQuery(defaultSite, "?system=sat").viewPreset, "arrayOblique");
});
