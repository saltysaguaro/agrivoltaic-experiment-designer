import test from "node:test";
import assert from "node:assert/strict";
import {
  PUBLIC_STATIC_DIRS,
  STATIC_FILES,
  STATIC_PAGES,
  isTrustedLocalOrigin,
} from "../packages/simulation-backend/src/api/server.js";
import { AnnualJobService } from "../packages/simulation-backend/src/annual/job-service.js";

test("backend rejects non-local cross-origin requests", () => {
  assert.equal(isTrustedLocalOrigin("https://evil.example"), false);
  assert.equal(isTrustedLocalOrigin("null"), false);
});

test("backend allows loopback cross-origin requests for local tooling", () => {
  assert.equal(isTrustedLocalOrigin("http://localhost:3000"), true);
  assert.equal(isTrustedLocalOrigin("http://127.0.0.1:8787"), true);
  assert.equal(isTrustedLocalOrigin("https://app.localhost:5173"), true);
});

test("backend only exposes the allowlisted static asset routes", () => {
  assert.deepEqual([...PUBLIC_STATIC_DIRS], [
    "/src",
    "/packages/shared/dist",
    "/packages/three-exporter/dist",
    "/packages/simulation-backend/dist",
    "/node_modules/three",
    "/node_modules/zod",
  ]);
  assert.equal(STATIC_PAGES.has("/index.html"), true);
  assert.equal(STATIC_PAGES.has("/results.html"), true);
  assert.equal(STATIC_PAGES.has("/README.md"), false);
  assert.equal(STATIC_FILES.has("/platform.css"), true);
  assert.equal(STATIC_FILES.has("/styles.css"), true);
  assert.equal(STATIC_FILES.has("/local-data/jobs/example.json"), false);
});

test("client config no longer exposes local machine paths", async () => {
  const config = await new AnnualJobService().getClientConfig();
  assert.equal("dataRoot" in config, false);
  assert.equal("bifacialPython" in config, false);
});
