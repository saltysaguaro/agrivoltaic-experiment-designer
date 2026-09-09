import test from "node:test";
import assert from "node:assert/strict";
// @ts-ignore Runtime JS module used directly in browser as part of the local platform.
import { designHref, extractJobId, jobRunHref, resultsHref } from "../src/platform/router.js";
// @ts-ignore Runtime JS module used directly in browser as part of the local platform.
import { createSessionStore } from "../src/platform/sessionStore.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test("router helpers build and parse platform paths", () => {
  globalThis.window = {
    location: {
      search: "?jobId=job-123",
    },
  } as any;

  assert.equal(designHref(), "/design.html");
  assert.equal(jobRunHref("job-123"), "/model-run.html?jobId=job-123");
  assert.equal(resultsHref("job-123"), "/results.html?jobId=job-123");
  assert.equal(extractJobId("/results.html", "/results"), "job-123");
});

test("session store persists site and design state locally", () => {
  const storage = createMemoryStorage();
  const store = createSessionStore(storage);
  store.setSite({ label: "Phoenix", latitude: 33.4, longitude: -112, timezone: "America/Phoenix" });
  store.setDesignState({ systemType: "fixed", dcSizeKw: 250 });
  store.rememberJob({ jobId: "job-42", projectName: "Study", status: "queued" });

  const restored = createSessionStore(storage).load();
  assert.equal(restored.site.label, "Phoenix");
  assert.equal(restored.designState.dcSizeKw, 250);
  assert.equal(restored.lastJobId, "job-42");
});

test("session store normalizes legacy site records without an address", () => {
  const storage = createMemoryStorage();
  storage.setItem("agrivoltaic-platform-session-v1", JSON.stringify({
    site: {
      label: "Tucson, Arizona",
      fullAddress: "Tucson, Arizona, United States",
      latitude: 32.2226,
      longitude: -110.9747,
      timezone: "America/Phoenix",
    },
  }));

  const restored = createSessionStore(storage).load();

  assert.equal(restored.site.address, "Tucson, Arizona, United States");
  assert.equal(restored.site.source, "stored");
});
