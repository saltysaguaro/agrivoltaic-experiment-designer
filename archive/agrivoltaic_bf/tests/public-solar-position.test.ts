import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";

async function loadSolarModule() {
  // The solar utilities ship as browser-side JavaScript, so the test loads them dynamically.
  // @ts-ignore local browser module under test
  return import("../src/public/solarPosition.js");
}

async function loadLightModule() {
  // @ts-ignore JS scene module used directly in tests.
  return import("../src/scene/lights.js");
}

test("zonedDateTimeToUtc uses daylight-saving offset for summer Denver timestamps", async () => {
  const { zonedDateTimeToUtc } = await loadSolarModule();
  const { utcDate } = zonedDateTimeToUtc("2026-06-21", 12 * 60, "America/Denver");
  assert.equal(utcDate.toISOString(), "2026-06-21T18:00:00.000Z");
});

test("summer midday sun in Golden is high and roughly southern", async () => {
  const { computeSolarPosition } = await loadSolarModule();
  const solar = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-06-21",
    minutesInDay: 13 * 60,
    timeZone: "America/Denver",
  });

  assert.equal(solar.timeZone, "America/Denver");
  assert.ok(solar.apparentElevationDeg > 70 && solar.apparentElevationDeg < 76);
  assert.ok(solar.azimuthDeg > 150 && solar.azimuthDeg < 210);
  assert.equal(solar.isDaylight, true);
});

test("winter midday sun is much lower than summer midday sun at the same site", async () => {
  const { computeSolarPosition } = await loadSolarModule();
  const summer = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-06-21",
    minutesInDay: 13 * 60,
    timeZone: "America/Denver",
  });
  const winter = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-12-21",
    minutesInDay: 12 * 60,
    timeZone: "America/Denver",
  });

  assert.ok(winter.apparentElevationDeg > 24 && winter.apparentElevationDeg < 31);
  assert.ok(summer.apparentElevationDeg > winter.apparentElevationDeg + 40);
});

test("invalid time zones fall back to a longitude-based estimate", async () => {
  const { resolveSiteTimeZone } = await loadSolarModule();
  const timeZone = resolveSiteTimeZone({
    longitude: -105.2211,
    timezone: "Invalid/Zone",
  });
  assert.equal(timeZone, "America/Denver");
});

test("Arizona locations use America/Phoenix when Mapbox only provides region context", async () => {
  const { resolveSiteTimeZone, computeSolarPosition } = await loadSolarModule();
  const site = {
    latitude: 32.2226,
    longitude: -110.9747,
    region: "Arizona",
    regionCode: "US-AZ",
    country: "United States",
    countryCode: "us",
    timezone: "",
  };

  site.timezone = resolveSiteTimeZone(site);
  assert.equal(site.timezone, "America/Phoenix");

  const solar = computeSolarPosition({
    latitude: site.latitude,
    longitude: site.longitude,
    dateInput: "2026-06-21",
    minutesInDay: 10 * 60,
    timeZone: site.timezone,
  });

  assert.equal(solar.timeZone, "America/Phoenix");
  assert.ok(solar.apparentElevationDeg > 50 && solar.apparentElevationDeg < 60);
  assert.ok(solar.azimuthDeg > 90 && solar.azimuthDeg < 110);
});

test("scene sun path stays east in the morning and west in the evening", async () => {
  const { computeSolarPosition } = await loadSolarModule();
  const { createLightRig, updateSun } = await loadLightModule();
  const scene = new THREE.Scene();
  const lightRig = createLightRig(scene);

  const morning = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-06-21",
    minutesInDay: 10 * 60,
    timeZone: "America/Denver",
  });
  updateSun(lightRig, {
    sunAz: morning.azimuthDeg,
    sunEl: morning.apparentElevationDeg,
  });
  assert.ok(lightRig.sun.position.x > 0);

  const evening = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-06-21",
    minutesInDay: 18 * 60,
    timeZone: "America/Denver",
  });
  updateSun(lightRig, {
    sunAz: evening.azimuthDeg,
    sunEl: evening.apparentElevationDeg,
  });
  assert.ok(lightRig.sun.position.x < 0);
});

test("preview east-west compensation mirrors the displayed sun path without changing the default world convention", async () => {
  const { computeSolarPosition } = await loadSolarModule();
  const { createLightRig, updateSun } = await loadLightModule();
  const scene = new THREE.Scene();
  const lightRig = createLightRig(scene);

  const morning = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-12-21",
    minutesInDay: 10 * 60,
    timeZone: "America/Denver",
  });

  updateSun(lightRig, {
    sunAz: morning.azimuthDeg,
    sunEl: morning.apparentElevationDeg,
  });
  assert.ok(lightRig.sun.position.x > 0, "default preview keeps physical morning sun on the east side");

  updateSun(lightRig, {
    sunAz: morning.azimuthDeg,
    sunEl: morning.apparentElevationDeg,
    previewMirrorEastWest: true,
  });
  assert.ok(lightRig.sun.position.x < 0, "display-compensated preview mirrors the sun path horizontally");
  assert.ok(lightRig.sun.position.z < 0, "display compensation must not move the sun off the southern sky in winter");
});

test("winter-solstice shadows stay northwest in the morning and northeast in the evening", async () => {
  const { computeSolarPosition } = await loadSolarModule();
  const { createLightRig, updateSun } = await loadLightModule();
  const scene = new THREE.Scene();
  const lightRig = createLightRig(scene);

  const morning = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-12-21",
    minutesInDay: 8 * 60,
    timeZone: "America/Denver",
  });
  updateSun(lightRig, {
    sunAz: morning.azimuthDeg,
    sunEl: morning.apparentElevationDeg,
  });
  assert.ok(lightRig.sun.position.x > 0, "winter morning sun should sit on the east side of the scene");
  assert.ok(lightRig.sun.position.z < 0, "winter morning sun should stay south of the array");

  const evening = computeSolarPosition({
    latitude: 39.7555,
    longitude: -105.2211,
    dateInput: "2026-12-21",
    minutesInDay: 16 * 60,
    timeZone: "America/Denver",
  });
  updateSun(lightRig, {
    sunAz: evening.azimuthDeg,
    sunEl: evening.apparentElevationDeg,
  });
  assert.ok(lightRig.sun.position.x < 0, "winter evening sun should sit on the west side of the scene");
  assert.ok(lightRig.sun.position.z < 0, "winter evening sun should stay south of the array");
});
