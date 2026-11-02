import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, studySchema } from '../src/domain/study.js';
import { readProject } from '../src/project/package.js';

test('missing and empty legacy control fields receive complete independent defaults', async () => {
  const expected = {
    version: 1,
    initialized: false,
    irrigationUnits: [],
    irrigationZones: [],
    experimentSensors: [],
    crops: [],
  };
  assert.deepEqual(defaultStudy().controlField, expected);
  for (const controlField of [undefined, {}]) {
    const legacy = { ...defaultStudy(), controlField };
    const parsed = studySchema.parse(legacy);
    assert.deepEqual(parsed.controlField, expected);
    const imported = await readProject(new TextEncoder().encode(JSON.stringify(legacy)));
    assert.deepEqual(imported.study.controlField, expected);
    assert.deepEqual(studySchema.parse(JSON.parse(JSON.stringify(parsed))), parsed);
    parsed.controlField.crops.push({ id: 'only-in-this-study' });
    assert.deepEqual(defaultStudy().controlField, expected);
  }
});

test('oversized study collections are rejected before any element is validated', () => {
  const limits = [
    [['experimentSensors'], 500],
    [['crops'], 200],
    [['irrigationUnits'], 500],
    [['irrigationZones'], 200],
    [['controlField', 'experimentSensors'], 500],
    [['controlField', 'crops'], 200],
    [['controlField', 'irrigationUnits'], 500],
    [['controlField', 'irrigationZones'], 200],
    [['weather', 'rows'], 1440],
    [['weather', 'days'], 366],
  ];
  for (const [path, maximum] of limits) {
    const study = defaultStudy();
    const oversized = Array(maximum + 1);
    Object.defineProperty(oversized, 0, {
      get() {
        assert.fail(`Oversized ${path.join('.')} must be rejected before reading elements`);
      },
    });
    const parent = path.slice(0, -1).reduce((value, key) => value[key], study);
    parent[path.at(-1)] = oversized;
    const parsed = studySchema.safeParse(study);
    assert.equal(parsed.success, false);
    assert.equal(parsed.error.issues.length, 1);
    assert.deepEqual(parsed.error.issues[0].path, path);
    assert.equal(parsed.error.issues[0].code, 'too_big');
    assert.equal(parsed.error.issues[0].maximum, maximum);
  }
});
