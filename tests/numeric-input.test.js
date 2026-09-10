import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';

test('numeric editing preserves incomplete drafts and publishes valid numbers and arrow steps immediately', async () => {
  const dom = new JSDOM('<div id="root"></div>');
  const before = {};
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    before[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  // Import React DOM after establishing the simulated browser environment.
  const { default: React, act } = await import('react'),
    { createRoot } = await import('react-dom/client');
  const file = path.resolve('node_modules/.aed-number-test.mjs');
  let root;
  try {
    await build({
      entryPoints: ['src/ui/Controls.jsx'],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: file,
      packages: 'external',
      logLevel: 'silent',
    });
    const { Field } = await import(pathToFileURL(file).href);
    let commits = [];
    root = createRoot(document.getElementById('root'));
    await act(async () =>
      root.render(
        React.createElement(Field, {
          label: 'Depth',
          value: 0.2,
          min: -5,
          max: 20,
          onChange: (v) => commits.push(v),
        }),
      ),
    );
    const input = document.querySelector('input');
    const type = async (value) =>
      act(async () => {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
          input,
          value,
        );
        input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      });
    for (const draft of ['', '-', '-0', '-0.', '-0.1', '-0.15']) {
      await type(draft);
      assert.equal(input.value, draft);
    }
    assert.deepEqual(commits, [-0, -0.1, -0.15]);
    await act(async () =>
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    assert.deepEqual(commits, [-0, -0.1, -0.15]);
    await type('');
    await act(async () =>
      input.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true })),
    );
    assert.equal(input.getAttribute('aria-invalid'), 'true');
    assert.deepEqual(commits, [-0, -0.1, -0.15]);
    await type('21');
    await act(async () =>
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    assert.match(document.querySelector('[role=alert]').textContent, /20 or less/);
    await type('.35');
    await act(async () =>
      input.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true })),
    );
    assert.deepEqual(commits, [-0, -0.1, -0.15, 0.35]);
    await act(async () =>
      input.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      ),
    );
    assert.equal(commits.at(-1), 0.45);
    assert.equal(input.value, '0.45');
    await act(async () =>
      input.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    assert.equal(input.value, '0.2');
  } finally {
    if (root) await act(async () => root.unmount());
    await fs.rm(file, { force: true });
    dom.window.close();
    for (const [key, descriptor] of Object.entries(before)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
