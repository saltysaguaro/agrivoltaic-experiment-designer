import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { intersects, layoutFieldLabels, fieldLabelItems } from '../src/ui/field-labels.js';
import { normalizeNavigation, steps } from '../src/ui/workflow.js';
import { defaultStudy } from '../src/domain/study.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { figureSvg } from '../src/report/figures.js';
import { reportHtml } from '../src/report/export.js';

function assertSpaced(labels, width, height, top = 34, bottom = 24) {
  for (const [i, a] of labels.entries()) {
    assert.ok(a.x >= 10 && a.y >= top);
    assert.ok(a.x + a.width <= width - 10 && a.y + a.height <= height - bottom);
    for (const b of labels.slice(i + 1)) assert.ok(!intersects(a, b), `${a.id} overlaps ${b.id}`);
  }
}
test('shared ID tags stay spaced and inside the drawing at mobile/desktop sizes, prioritizing selection in dense layouts', () => {
  for (const [width, height] of [
    [310, 430],
    [1168, 420],
    [1000, 520],
  ]) {
    const items = Array.from({ length: 40 }, (_, i) => ({
      kind: i % 3 ? 'sensor' : 'crop',
      id: `ID-${i}`,
      text: `ID-${i}`,
      point: [width / 2 + (i % 4) * 2, height / 2],
      selected: i === 39,
    }));
    const { labels, hidden } = layoutFieldLabels(items, width, height);
    assertSpaced(labels, width, height);
    assert.equal(labels[0].id, 'ID-39');
    assert.ok(hidden.length > 0);
    assert.equal(labels.length + hidden.length, items.length);
  }
  const grouped = fieldLabelItems(
    { beds: [], markers: [{ ids: ['A', 'B'], point: [100, 100], radius: 6 }] },
    { kind: 'sensor', id: 'B' },
  );
  assert.equal(grouped[0].text, 'B');
  assert.equal(grouped[0].title, 'Sensors · A, B');
});

test('saved sensor/crop navigation converges to one layout stage while publication stays publication', () => {
  assert.equal(steps.length, 9);
  for (const old of [7, 8]) assert.equal(normalizeNavigation({ step: old, view: 'plan' }).step, 7);
  assert.equal(normalizeNavigation({ step: 9, view: 'profile' }).step, 8);
  assert.deepEqual(normalizeNavigation({ version: 2, step: 8, view: 'oblique' }), {
    version: 2,
    step: 8,
    view: 'oblique',
  });
  assert.equal(normalizeNavigation({ version: 2, step: 9, view: 'plan' }).step, 0);
});

test('methods/report figures omit all engineering callouts and use legible ID tags with complete field keys', () => {
  const s = defaultStudy();
  s.experimentSensors = Array.from({ length: 12 }, (_, i) => ({
    id: `S-${i + 1}`,
    type: 'PAR',
    x: 0,
    y: 0,
    z: 0.2,
    grid: { column: 8 + (i % 3), row: 10 + Math.floor(i / 3) },
    treatment: 'Interior',
    replicate: '1',
  }));
  s.crops = [
    {
      id: 'BED-1',
      crop: 'Lettuce',
      x: 0,
      y: 0,
      width: 3,
      length: 3,
      grid: { column: 4, row: 5, columns: 3, rows: 3 },
      treatment: 'Interrow',
      replicate: '1',
    },
  ];
  const study = normalizeLayout(s);
  for (const view of ['plan', 'profile', 'oblique']) {
    const svg = figureSvg(study, null, view, 'none', 'report');
    const doc = new JSDOM(svg, { contentType: 'image/svg+xml' }).window.document;
    assert.equal(doc.querySelectorAll('[data-callout]').length, 0);
    const tags = [...doc.querySelectorAll('[data-field-label]')];
    assert.ok(tags.length > 0);
    const boxes = tags.map((g) =>
      Object.fromEntries(
        ['x', 'y', 'width', 'height'].map((key) => [
          key,
          Number(g.querySelector('rect').getAttribute(key)),
        ]),
      ),
    );
    assertSpaced(boxes, 1000, 520, 75, 16);
    assert.ok(tags.every((g) => g.querySelector('text').getAttribute('font-size') === '12'));
    for (const sensor of study.experimentSensors)
      assert.ok(doc.documentElement.textContent.includes(sensor.id));
    assert.ok(doc.documentElement.textContent.includes('BED-1'));
    assert.doesNotMatch(svg, /stroke="#a86a50"/);
  }
  const report = new JSDOM(reportHtml(study, null)).window.document;
  assert.equal(report.querySelectorAll('[data-callout]').length, 0);
  assert.equal(report.querySelectorAll('figure').length, 3);
  assert.match(report.body.textContent, /Lettuce/);
});
