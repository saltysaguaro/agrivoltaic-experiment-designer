import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  cropCatalog,
  cropIdentity,
  searchCrops,
  normalizeCropIdentity,
  unresolvedCrops,
} from '../src/domain/crop-catalog.js';
import { defaultStudy, studySchema, migrateStudy, analysisKey } from '../src/domain/study.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { reportHtml, exportCsv } from '../src/report/export.js';
test('every selectable crop has a unique catalog ID and a recorded exact species-level accepted GBIF identity', () => {
  const matches = JSON.parse(
    fs.readFileSync(new URL('../docs/crop-taxonomy-validation.json', import.meta.url)),
  ).matches;
  assert.ok(cropCatalog.length >= 400);
  assert.equal(new Set(cropCatalog.map((c) => c.id)).size, cropCatalog.length);
  for (const c of cropCatalog) {
    const record = matches[c.sourceName];
    assert.ok(record, c.commonName);
    assert.equal(record.match.matchType, 'EXACT');
    assert.ok(['SPECIES', 'SUBSPECIES', 'VARIETY'].includes(record.accepted.rank));
    assert.equal(record.accepted.status || record.accepted.taxonomicStatus, 'ACCEPTED');
    assert.equal(c.taxonKey, record.accepted.key || record.accepted.usageKey);
    assert.equal(c.botanicalName, record.accepted.canonicalName);
    assert.match(c.taxonUrl, /^https:\/\/www.gbif.org\/species\/\d+$/);
    assert.ok(c.family);
  }
});
test('local crop search supports common names, aliases and botanical names without permitting arbitrary identities', () => {
  assert.equal(searchCrops('lettuce')[0].id, 'lettuce');
  assert.ok(searchCrops('coriandrum').some((c) => c.commonName === 'Cilantro'));
  assert.ok(searchCrops('courgette').some((c) => c.commonName === 'Zucchini'));
  assert.equal(searchCrops('zzzz-no-crop').length, 0);
  assert.equal(cropIdentity('invented crop'), null);
  assert.equal(normalizeCropIdentity({ crop: 'Lettuce' }).botanicalName, 'Lactuca sativa');
  const unknown = normalizeCropIdentity({
    crop: 'Unidentified legacy crop',
    botanicalName: 'Fake species',
    taxonUrl: 'javascript:alert(1)',
  });
  assert.equal(unknown.crop, 'Unidentified legacy crop');
  assert.equal(unknown.cropId, '');
  assert.equal(unknown.botanicalName, '');
  assert.equal(unknown.taxonUrl, '');
});
test('catalog identity and cultivar round-trip, override stale/tampered metadata, and reach reports and CSV per bed', () => {
  const s = defaultStudy();
  s.crops = [
    {
      id: 'B-1',
      crop: 'Lettuce',
      x: 0,
      y: 0,
      width: 2,
      length: 3,
      treatment: 'Test',
      replicate: '1',
      cultivar: 'Oakleaf <test>',
      notes: 'Bed note',
    },
  ];
  const imported = migrateStudy(s);
  assert.equal(imported.crops[0].cropId, 'lettuce');
  assert.equal(unresolvedCrops(imported).length, 0);
  const next = studySchema.parse(
    normalizeLayout({
      ...imported,
      crops: [{ ...imported.crops[0], botanicalName: 'Wrong name', taxonUrl: 'javascript:bad' }],
    }),
  );
  assert.equal(next.crops[0].botanicalName, 'Lactuca sativa');
  assert.equal(analysisKey(next), analysisKey(imported));
  assert.deepEqual(migrateStudy(JSON.parse(JSON.stringify(next))), next);
  const html = reportHtml(next, null),
    doc = new JSDOM(html).window.document;
  const identity = doc.querySelector('.crop-identities');
  assert.match(identity.textContent, /Lactuca sativa/);
  assert.equal(identity.querySelector('i').textContent, 'Lactuca sativa');
  assert.match(identity.textContent, /Lactuca sativa L\./);
  assert.match(identity.textContent, /Asteraceae/);
  assert.match(identity.textContent, /Oakleaf <test>/);
  assert.match(identity.textContent, /Bed note/);
  assert.equal(identity.querySelectorAll('script').length, 0);
  assert.equal(identity.querySelector('a').href, next.crops[0].taxonUrl);
  const csv = exportCsv(next, null);
  for (const v of [
    'botanical_name',
    'Lactuca sativa',
    'Asteraceae',
    'lettuce',
    'Oakleaf <test>',
    next.crops[0].taxonUrl,
  ])
    assert.ok(csv.includes(v), v);
});
