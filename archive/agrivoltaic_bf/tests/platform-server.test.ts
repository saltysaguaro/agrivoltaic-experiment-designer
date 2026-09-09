import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_STATIC_DIRS } from "../packages/simulation-backend/src/api/server.js";

test("browser pages can import the backend sensor inference bundle", () => {
  assert.ok(PUBLIC_STATIC_DIRS.includes("/packages/simulation-backend/dist"));
});
