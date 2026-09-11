import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultStudy, studySchema, sha256 } from '../src/domain/study.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { sampleWeather } from '../src/irradiance/solar.js';
import { weatherRecord } from '../src/irradiance/weather-record.js';
import { cropIdentity } from '../src/domain/crop-catalog.js';
import {
  buildProjectPackage,
  readProject,
  projectDocument,
  canonicalJson,
} from '../src/project/package.js';
import { readZip, writeZip, MAX_ARCHIVE } from '../src/project/zip.js';
import { validateResult } from '../src/project/results.js';
const encoder = new TextEncoder(),
  decoder = new TextDecoder();
const fixture = async () => {
  const s = defaultStudy();
  s.metadata.title = 'Shared research <plan>';
  s.table.high = 1;
  s.table.wide = 1;
  s.row.tables = 1;
  s.array.rows = 2;
  s.analysis.backend = 'cpu';
  s.analysis.patches = 145;
  s.analysis.resolution = 3;
  const rows = sampleWeather(s),
    source = JSON.stringify(rows);
  s.weather = {
    ...s.weather,
    mode: 'upload',
    ...(await weatherRecord(rows, source)),
    name: 'Retained weather snapshot',
    format: 'json',
  };
  s.experimentSensors = [
    {
      id: 'S-1',
      type: 'PAR',
      x: 0,
      y: 0,
      z: -0.2,
      treatment: 'Interior',
      replicate: '1',
      model: 'Probe',
      logger: 'L1',
      channel: '2',
      notes: 'Independent installation depth',
      grid: { column: 1, row: 1 },
    },
  ];
  s.crops = [
    {
      id: 'P-1',
      ...cropIdentity('lettuce'),
      cultivar: 'Butterhead',
      notes: 'Research bed',
      x: 0,
      y: 0,
      width: 1,
      length: 1,
      grid: { column: 0, row: 1, columns: 2, rows: 2 },
      treatment: 'Interrow',
      replicate: '1',
    },
  ];
  return studySchema.parse(normalizeLayout(s));
};

test('project ZIP round-trips the whole research plan, retained weather and validated daily results', async () => {
  const s = await fixture(),
    r = await calculateDay(s);
  const exported = await buildProjectPackage(s, r),
    files = await readZip(exported.archive);
  assert.equal(files.size, 14);
  for (const path of [
    'manifest.json',
    'README.md',
    'project.json',
    'report.html',
    'provenance.json',
    'tables/data.csv',
    'tables/methods.csv',
    'weather/source.txt',
    'weather/intervals.csv',
    'figures/plan.svg',
    'figures/profile.svg',
    'figures/oblique.svg',
    'figures/sunlight.svg',
    'figures/dli.svg',
  ])
    assert.ok(files.has(path), path);
  assert.equal(decoder.decode(files.get('weather/source.txt')), s.weather.sourceText);
  assert.match(decoder.decode(files.get('report.html')), /Shared research &lt;plan&gt;/);
  const imported = await readProject(exported.archive, exported.filename);
  assert.deepEqual(imported.study, s);
  assert.deepEqual(imported.result, JSON.parse(JSON.stringify(r)));
  assert.match(imported.integrity, /All package file checksums verified/);
  assert.equal(imported.study.experimentSensors[0].z, -0.2);
  assert.equal(imported.study.crops[0].botanicalName, 'Lactuca sativa');
  const standalone = await readProject(files.get('project.json'));
  assert.deepEqual(standalone.study, imported.study);
  assert.deepEqual(standalone.result, imported.result);
  assert.ok(exported.archive.length < [...files.values()].reduce((n, v) => n + v.length, 0));
});

test('unfinished projects remain shareable without fabricated light results or source weather', async () => {
  const s = defaultStudy();
  const exported = await buildProjectPackage(s, null),
    files = await readZip(exported.archive);
  assert.equal(exported.resultIncluded, false);
  assert.equal(files.has('figures/dli.svg'), false);
  assert.equal(files.has('weather/source.txt'), false);
  assert.match(decoder.decode(files.get('README.md')), /no matching calculated light results/i);
  assert.equal((await readProject(exported.archive)).result, null);
});

test('package, standalone JSON and legacy checksums reject altered data before replacing any project', async () => {
  const s = await fixture(),
    exported = await buildProjectPackage(s, null);
  const files = await readZip(exported.archive);
  files.set('tables/data.csv', encoder.encode('altered'));
  await assert.rejects(readProject(await writeZip(files)), /checksum mismatch/);
  const project = await projectDocument(s, null);
  project.study.module.length += 0.1;
  await assert.rejects(readProject(encoder.encode(JSON.stringify(project))), /content SHA-256/);
  const legacy = { study: s, studySha256: await sha256(JSON.stringify(s)), result: null };
  assert.deepEqual((await readProject(encoder.encode(JSON.stringify(legacy)))).study, s);
  legacy.study.metadata.title = 'Modified';
  await assert.rejects(readProject(encoder.encode(JSON.stringify(legacy))), /Legacy study SHA-256/);
  project.formatVersion = 99;
  await assert.rejects(
    readProject(encoder.encode(JSON.stringify(project))),
    /Unsupported project format/,
  );
});

test('stale, mispositioned, nonfinite or inconsistent saved results cannot be restored', async () => {
  const s = await fixture(),
    r = await calculateDay(s);
  for (const mutate of [
    (v) => (v.cells[0].x += 1),
    (v) => (v.cells[0].dli = null),
    (v) => (v.meanDli += 2),
    (v) => v.grid.nx++,
    (v) => (v.weatherInputHash = 'bad'),
    (v) => v.cells.pop(),
  ]) {
    const bad = structuredClone(r);
    mutate(bad);
    await assert.rejects(validateResult(s, bad));
  }
  const stale = structuredClone(s);
  stale.module.length += 0.1;
  const opened = await readProject(encoder.encode(JSON.stringify({ study: stale, result: r })));
  assert.equal(opened.result, null);
  assert.match(opened.warnings.join(' '), /different or older analysis inputs/);
  assert.equal(opened.study.module.length, stale.module.length);
  const exported = await projectDocument(stale, r);
  assert.equal(exported.result, null);
  assert.equal(
    exported.contentSha256,
    await sha256(canonicalJson({ study: exported.study, result: null })),
  );
});

test('ZIP stored/deflated Unicode text round-trips and damaged, unsafe and oversized entries are rejected', async () => {
  const text = 'Lactuca sativa · 温度\n'.repeat(100);
  for (const compress of [true, false]) {
    const archive = await writeZip(new Map([['weather/source.txt', text]]), { compress });
    assert.equal(decoder.decode((await readZip(archive)).get('weather/source.txt')), text);
    const damaged = archive.slice();
    damaged[55] ^= 1;
    await assert.rejects(readZip(damaged));
  }
  await assert.rejects(writeZip(new Map([['../project.json', '{}']])), /Unsupported package path/);
  await assert.rejects(readZip(new Uint8Array(5)), /Invalid ZIP size/);
  const archive = await writeZip(new Map([['a.txt', 'x'.repeat(100000)]])),
    view = new DataView(archive.buffer);
  const directory = view.getUint32(archive.length - 6, true);
  view.setUint32(22, 1, true);
  view.setUint32(directory + 24, 1, true);
  await assert.rejects(readZip(archive), /Expanded package exceeds/);
  view.setUint32(22, MAX_ARCHIVE + 1, true);
  view.setUint32(directory + 24, MAX_ARCHIVE + 1, true);
  await assert.rejects(readZip(archive), /Expanded package exceeds/);
});
