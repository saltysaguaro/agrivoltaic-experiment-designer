import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
test('crop picker requires a matching selection and palette gestures commit only completed drags', async () => {
  const dom = new JSDOM('<div id="root"></div>'),
    before = {};
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    before[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLElement.prototype.setPointerCapture = () => {};
  const { default: React, act } = await import('react'),
    { createRoot } = await import('react-dom/client');
  const file = path.resolve('node_modules/.aed-picker-test.mjs');
  let root;
  try {
    await build({
      stdin: {
        contents:
          "export {default as Picker} from './src/ui/CropPicker.jsx'; export {default as Tools} from './src/ui/FieldTools.jsx';",
        resolveDir: process.cwd(),
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: file,
      packages: 'external',
      logLevel: 'silent',
    });
    const { Picker, Tools } = await import(pathToFileURL(file).href);
    root = createRoot(document.getElementById('root'));
    const chosen = [];
    function Harness() {
      const [value, setValue] = React.useState('lettuce');
      return React.createElement(Picker, {
        value,
        onChange: (id) => {
          chosen.push(id);
          setValue(id);
        },
      });
    }
    await act(async () => root.render(React.createElement(Harness)));
    const input = document.querySelector('input');
    const type = async (value) =>
      act(async () => {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
          input,
          value,
        );
        input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      });
    await type('not a real crop name');
    assert.equal(document.querySelectorAll('[role=option]').length, 0);
    await act(async () =>
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    assert.deepEqual(chosen, []);
    await type('Coriandrum');
    assert.equal(document.querySelectorAll('[role=option]').length, 1);
    await act(async () =>
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    assert.deepEqual(chosen, ['cilantro']);
    assert.equal(input.value, 'Cilantro');
    assert.match(document.querySelector('.crop-picker small').textContent, /Coriandrum sativum/);
    const drops = [],
      tools = [];
    await act(async () =>
      root.render(
        React.createElement(Tools, {
          tool: null,
          setTool: (t) => tools.push(t),
          cropId: 'lettuce',
          setCropId: () => {},
          onUndo: () => {},
          canUndo: false,
          study: { crops: [], experimentSensors: [] },
          selection: null,
          onSelect: () => {},
          view: 'plan',
          onDropPalette: (...v) => drops.push(v),
        }),
      ),
    );
    const button = [...document.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Add sensor',
    );
    async function pointer(type, x, y) {
      await act(async () => {
        const e = new dom.window.MouseEvent(type, {
          bubbles: true,
          clientX: x,
          clientY: y,
          button: 0,
        });
        Object.defineProperty(e, 'pointerId', { value: 1 });
        button.dispatchEvent(e);
      });
    }
    await pointer('pointerdown', 10, 10);
    await pointer('pointermove', 50, 80);
    assert.ok(document.querySelector('.palette-ghost'));
    await pointer('pointercancel', 50, 80);
    assert.equal(document.querySelector('.palette-ghost'), null);
    assert.equal(drops.length, 0);
    await pointer('pointerdown', 10, 10);
    await pointer('pointermove', 60, 90);
    await pointer('pointerup', 60, 90);
    assert.deepEqual(drops, [
      [
        { kind: 'sensor', cropId: 'lettuce' },
        { clientX: 60, clientY: 90 },
      ],
    ]);
    await act(async () =>
      button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })),
    );
    assert.deepEqual(tools, [], 'Release click does not enable a second placement');
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
