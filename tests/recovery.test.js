import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { act } from 'react';
import { defaultStudy } from '../src/domain/study.js';
import { sampleWeather } from '../src/irradiance/solar.js';

test('stricter validation preserves invalid saved JSON instead of replacing it with defaults', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' }),
    previous = {};
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    sessionStorage: dom.window.sessionStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  dom.window.HTMLElement.prototype.scrollTo = () => {};
  const oldError = console.error;
  console.error = (...args) => {
    if (!String(args[0]).includes('Error creating WebGL context')) oldError(...args);
  };
  const study = defaultStudy();
  study.weather.rows = sampleWeather(study).map((w) => ({ ...w, ppfd: 100, diffusePpfd: 200 }));
  const original = JSON.stringify(study);
  localStorage.setItem('aed-study-v1', original);
  const file = path.resolve('node_modules/.aed-recovery-test.mjs');
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
      await import(pathToFileURL(file).href);
    });
    assert.match(document.body.textContent, /Recover saved JSON/);
    assert.match(document.body.textContent, /Automatic saving is paused/);
    assert.equal(localStorage.getItem('aed-study-v1'), original);
    const button = [...document.querySelectorAll('.step-toggle')].find((b) =>
      b.textContent.includes('Methods'),
    );
    await act(async () =>
      button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })),
    );
    const title = document.querySelector('.control-content input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        title,
        'Unsaved replacement',
      );
      title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    assert.equal(
      localStorage.getItem('aed-study-v1'),
      original,
      'Editing defaults must not overwrite the original',
    );
  } finally {
    await fs.rm(file, { force: true });
    console.error = oldError;
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
