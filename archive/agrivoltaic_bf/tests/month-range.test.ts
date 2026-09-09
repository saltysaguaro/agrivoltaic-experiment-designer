import test from "node:test";
import assert from "node:assert/strict";
import { expandMonthRange, sumSelectedMonths } from "../packages/simulation-backend/src/annual/months.js";

test("expandMonthRange supports standard non-wrapping periods", () => {
  assert.deepEqual(expandMonthRange(4, 9), [4, 5, 6, 7, 8, 9]);
});

test("expandMonthRange supports wrapped periods across the new year", () => {
  assert.deepEqual(expandMonthRange(11, 3), [11, 12, 1, 2, 3]);
});

test("sumSelectedMonths aggregates the requested month set", () => {
  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  assert.equal(sumSelectedMonths(values, expandMonthRange(11, 2)), 260);
});
