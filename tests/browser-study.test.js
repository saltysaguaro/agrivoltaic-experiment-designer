import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, migrateStudy } from '../src/domain/study.js';
import { browserStudyRecord, restoreBrowserStudy } from '../src/project/browser-study.js';

test('old browser preferences adopt the aligned grid once, preserving other study inputs', () => {
  for (const alignment of [undefined, 'spacing']) {
    const old = defaultStudy();
    Object.assign(old.analysis, {
      gridAlignment: alignment,
      resolution: 3,
      patches: 145,
      interval: 15,
    });
    old.metadata.title = 'Existing field';
    old.array.rows = 7;
    const before = structuredClone(old);
    const restored = restoreBrowserStudy(JSON.parse(JSON.stringify(old)));
    assert.deepEqual(restored.analysis, {
      ...old.analysis,
      gridAlignment: 'row-centres',
      cellsPerRow: 9,
      resolution: 1,
    });
    assert.deepEqual(restored.array, old.array);
    assert.deepEqual(restored.weather, old.weather);
    assert.deepEqual(restored.metadata, old.metadata);
    assert.deepEqual(old, before);

    // A later explicit preview/custom choice survives subsequent reloads.
    Object.assign(restored.analysis, { gridAlignment: 'spacing', resolution: 3 });
    const saved = JSON.parse(JSON.stringify(browserStudyRecord(restored)));
    assert.deepEqual(restoreBrowserStudy(saved), restored);
  }
});

test('project imports preserve custom grids and existing aligned browser grids retain refinements', () => {
  const s = defaultStudy();
  Object.assign(s.analysis, { gridAlignment: 'spacing', resolution: 3 });
  assert.equal(migrateStudy(s).analysis.resolution, 3);
  assert.equal(migrateStudy(s).analysis.gridAlignment, 'spacing');
  assert.deepEqual(restoreBrowserStudy(browserStudyRecord(migrateStudy(s))).analysis, s.analysis);
  Object.assign(s.analysis, { gridAlignment: 'row-centres', resolution: 0.5, cellsPerRow: 18 });
  assert.deepEqual(restoreBrowserStudy(s).analysis, s.analysis);
  assert.throws(() => restoreBrowserStudy({ ...s, schemaVersion: 99 }), /Unsupported/);
  assert.throws(() => restoreBrowserStudy({ ...s, analysis: { ...s.analysis, resolution: -3 } }));
});
