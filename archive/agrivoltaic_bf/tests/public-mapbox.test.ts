import test from "node:test";
import assert from "node:assert/strict";

async function loadModule() {
  // @ts-ignore browser-side JS module under test
  return import("../src/public/publicMapbox.js");
}

test("normalizeConfiguredSite always provides a schema-safe address", async () => {
  const { normalizeConfiguredSite } = await loadModule();

  const fromFullAddress = normalizeConfiguredSite({
    label: "Tucson, Arizona",
    fullAddress: "Tucson, Arizona, United States",
    latitude: 32.2226,
    longitude: -110.9747,
    timezone: "America/Phoenix",
  });

  assert.equal(fromFullAddress.address, "Tucson, Arizona, United States");

  const fromAddress = normalizeConfiguredSite({
    label: "Phoenix, Arizona",
    address: "Phoenix, Arizona, United States",
    latitude: 33.4484,
    longitude: -112.074,
    timezone: "America/Phoenix",
  });

  assert.equal(fromAddress.address, "Phoenix, Arizona, United States");
});
