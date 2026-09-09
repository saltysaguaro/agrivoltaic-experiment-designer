import test from "node:test";
import assert from "node:assert/strict";

async function loadModule() {
  // @ts-ignore browser-side JS module under test
  return import("../src/public/publicStudySession.js");
}

function makeStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test("legacy sessions without site.address are normalized on read", async () => {
  const { createPublicStudySession } = await loadModule();
  const storage = makeStorage({
    "agrivoltaic-public-study-v1": JSON.stringify({
      site: {
        label: "Tucson, Arizona",
        fullAddress: "Tucson, Arizona, United States",
        latitude: 32.2226,
        longitude: -110.9747,
        timezone: "America/Phoenix",
      },
    }),
  });

  const session = createPublicStudySession(storage);
  const site = session.getSite();

  assert.equal(site.address, "Tucson, Arizona, United States");
  assert.equal(site.source, "stored");
});
