import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeJobId,
  normalizeDirectoryPath,
  resolveJobDirectory,
} from "../packages/simulation-backend/src/annual/storage.js";

test("normalizeDirectoryPath rejects invalid empty and NUL-delimited paths", () => {
  assert.throws(() => normalizeDirectoryPath("   ", "Project root"), /required/i);
  assert.throws(() => normalizeDirectoryPath("abc\0def", "Project root"), /invalid characters/i);
});

test("resolveJobDirectory rejects traversal-shaped job ids", () => {
  assert.equal(assertSafeJobId("job-123"), "job-123");
  assert.throws(() => assertSafeJobId("../job-123"), /invalid/i);
  assert.throws(() => resolveJobDirectory("../../etc/passwd", "/tmp/example"), /invalid/i);
});
