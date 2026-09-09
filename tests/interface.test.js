import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { act } from 'react';
import { defaultStudy } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
// Component integration test in a simulated DOM. Does not open/control a browser.
test('first calculation succeeds without leaving Irradiance; controls preserve selected view and expose input help', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
  });
  const previous = {};
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    localStorage: dom.window.localStorage,
    sessionStorage: dom.window.sessionStorage,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  dom.window.HTMLElement.prototype.scrollTo = () => {};
  const originalError = console.error;
  console.error = (...args) => {
    if (!String(args[0]).includes('Error creating WebGL context')) originalError(...args);
  };
  const study = defaultStudy();
  study.table.orientation = 'landscape';
  study.weather.mode = 'sample';
  study.weather.name = 'Illustrative clear-sky day · synthetic';
  study.analysis.backend = 'cpu';
  study.analysis.patches = 145;
  study.analysis.resolution = 2;
  localStorage.setItem('aed-study-v1', JSON.stringify(study));
  let calculations = 0,
    calculation;
  class TestWorker {
    constructor() {
      this.terminated = false;
    }
    terminate() {
      this.terminated = true;
    }
    postMessage(data) {
      if (data.type === 'warmup') {
        queueMicrotask(() => !this.terminated && this.onmessage?.({ data: { type: 'ready' } }));
        return;
      }
      calculations++;
      calculation = calculateDay(data.study).then((result) => {
        if (!this.terminated) this.onmessage?.({ data: { type: 'result', result } });
      });
    }
  }
  const oldWorker = globalThis.Worker;
  globalThis.Worker = TestWorker;
  const file = path.resolve('node_modules/.aed-interface-test.mjs');
  const byText = (text) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
  const click = async (button) => {
    assert.ok(button, 'Expected button exists');
    await act(async () =>
      button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })),
    );
  };
  const step = (name) =>
    [...document.querySelectorAll('.step-toggle')].find((b) => b.textContent.includes(name));
  try {
    await build({
      entryPoints: ['src/main.jsx'],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: file,
      packages: 'external',
      loader: { '.css': 'empty' },
      logLevel: 'silent',
    });
    await act(async () => {
      await import(pathToFileURL(file).href + '?test=' + Date.now());
    });
    assert.match(document.querySelector('.brand').textContent, /Agrivoltaic Experiment Designer/);
    const help = document.querySelector('button[aria-label="About Length"]');
    await act(async () => help.focus());
    assert.match(document.querySelector('[role="tooltip"]').textContent, /long outside edge/);
    await click(help);
    assert.ok(
      document.querySelector('[role="tooltip"]'),
      'Tapping a focused help icon keeps its explanation open',
    );
    await act(async () => help.blur());
    await click(step('Racking'));
    const rack = document.querySelector('select');
    await act(async () => {
      rack.value = 'dual-axis';
      rack.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal(document.querySelector('[role="alert"]'), null);
    await click(step('PV table & row'));
    const orientation = document.querySelector('select');
    await act(async () => {
      orientation.value = 'portrait';
      orientation.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).row.tableGap, 1.43);
    assert.equal(document.querySelector('[role="alert"]'), null);
    assert.match(document.querySelector('.control-content').textContent, /1–20 tables/);
    await click(step('Irradiance'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(byText('Calculate daily light'));
    await act(async () => {
      await calculation;
    });
    assert.equal(calculations, 1);
    assert.match(
      document.querySelector('.step-section.active .step-toggle').textContent,
      /Irradiance/,
    );
    assert.match(document.querySelector('.notice').textContent, /Daily light calculated/);
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(byText('Top-down'));
    await click(byText('Estimated DLI'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    await click(step('Field sensors'));
    await click(byText('Place a sensor in the view'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    await click(byText('Add at array centre'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    await click(byText('Orthographic'));
    await click(byText('Relative sunlight'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    assert.equal(JSON.parse(sessionStorage.getItem('aed-navigation')).step, 7);
  } finally {
    await fs.rm(file, { force: true });
    console.error = originalError;
    globalThis.Worker = oldWorker;
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
