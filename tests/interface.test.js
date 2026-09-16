import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { act } from 'react';
import { defaultStudy } from '../src/domain/study.js';
import { projectDocument, readProject } from '../src/project/package.js';
import { sampleWeather } from '../src/irradiance/solar.js';
import { weatherRecord } from '../src/irradiance/weather-record.js';
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
  study.analysis.resolution = 1;
  study.experimentSensors = [
    {
      id: 'OLD-SENSOR',
      type: 'PAR',
      x: 0,
      y: 0,
      z: 1,
      treatment: '',
      replicate: '',
      model: '',
      logger: '',
      notes: '',
    },
  ];
  study.crops = [
    {
      id: 'OLD-BED',
      crop: 'Lettuce',
      x: 0,
      y: 0,
      width: 1,
      length: 1,
      treatment: '',
      replicate: '',
    },
  ];
  const legacyBrowserStudy = {
    ...study,
    analysis: { ...study.analysis, gridAlignment: 'spacing', resolution: 3 },
  };
  localStorage.setItem('aed-study-v1', JSON.stringify(legacyBrowserStudy));
  localStorage.setItem('fieldwork-study-v1', JSON.stringify(legacyBrowserStudy));
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
      if (data.type === 'import') {
        readProject(data.bytes, data.name)
          .then((value) => {
            if (!this.terminated) this.onmessage?.({ data: { type: 'complete', value } });
          })
          .catch((error) => this.onmessage?.({ data: { type: 'error', message: error.message } }));
        return;
      }
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
  const oldFetch = globalThis.fetch;
  let mapboxRequests = 0;
  globalThis.fetch = async (url) => {
    assert.ok(String(url).startsWith('https://api.mapbox.com/geocoding/v5/'));
    mapboxRequests++;
    return {
      ok: true,
      json: async () => ({
        features: [
          {
            id: 'place.tucson',
            place_name: 'Tucson, Arizona, United States',
            center: [-110.9747, 32.2226],
          },
        ],
      }),
    };
  };
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
    assert.equal(document.querySelector('.brand svg'), null);
    assert.deepEqual(JSON.parse(localStorage.getItem('aed-study-v1')).experimentSensors, []);
    assert.deepEqual(JSON.parse(localStorage.getItem('aed-study-v1')).crops, []);
    assert.deepEqual(JSON.parse(localStorage.getItem('aed-study-v1')).analysis, study.analysis);
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).browserGridDefaultsVersion, 1);
    assert.equal(localStorage.getItem('fieldwork-study-v1'), null);
    assert.match(document.body.textContent, /Layout is session-only/);
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
    await click(step('Full array'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(step('Site & weather'));
    const latitude = document.querySelector('[data-annotation="site.latitude"] input');
    await act(async () => latitude.focus());
    assert.match(document.querySelector('.annotation-cards').textContent, /Latitude/);
    const search = document.querySelector('input[role="combobox"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        search,
        'Tucson',
      );
      search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    assert.equal(mapboxRequests, 1);
    assert.equal(document.querySelectorAll('[role="option"]').length, 1);
    await act(async () =>
      search.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      ),
    );
    const selectedSite = JSON.parse(localStorage.getItem('aed-study-v1')).site;
    assert.equal(selectedSite.latitude, 32.2226);
    assert.equal(selectedSite.longitude, -110.9747);
    assert.equal(selectedSite.address, 'Tucson, Arizona, United States');
    assert.equal(selectedSite.utcOffsetApproximate, true);
    await click(step('Irradiance'));
    assert.equal(
      byText('Receiver boundary').getAttribute('aria-pressed'),
      'true',
      'Field outline is visible before calculation',
    );
    assert.equal(
      document.querySelector('.drawing-annotations'),
      null,
      'Irradiance has no callouts before calculating',
    );
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(byText('Calculate daily light'));
    await act(async () => {
      await calculation;
    });
    assert.equal(calculations, 1);
    assert.equal(document.querySelector('.drawing-annotations'), null);
    assert.equal(byText('U · Under-row no-crop strip').getAttribute('aria-pressed'), 'false');
    assert.equal(byText('C · Cropping area').getAttribute('aria-pressed'), 'false');
    assert.equal(document.querySelector('input[aria-label="Panel opacity"]').value, '20');
    await click(byText('C · Cropping area'));
    assert.equal(byText('C · Cropping area').getAttribute('aria-pressed'), 'true');
    assert.equal(calculations, 1);
    assert.match(
      document.querySelector('.step-section.active .step-toggle').textContent,
      /Irradiance/,
    );
    assert.match(document.querySelector('.notice').textContent, /Daily light calculated/);
    assert.equal(document.querySelector('.model-disclosure'), null);
    assert.doesNotMatch(document.body.textContent, /GHI closure:|CPU occlusion matched Radiance/);
    const sampleInput = document.querySelector('[data-annotation="analysis.samplesPerCell"] input');
    assert.equal(sampleInput.value, '1');
    assert.equal(sampleInput.min, '1');
    assert.equal(sampleInput.max, '9');
    for (const count of [9, 1]) {
      await act(async () => {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
          sampleInput,
          String(count),
        );
        sampleInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      });
      assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).analysis.samplesPerCell, count);
      assert.equal(byText('Relative sunlight').disabled, count !== 1);
      assert.equal(calculations, 1, 'Sampling edits invalidate results without starting a solve');
    }
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(step('Row spacing'));
    const reservation = document.querySelector('[data-annotation="landUse.underPanelWidth"] input');
    await act(async () => reservation.focus());
    assert.match(
      document.querySelector('.annotation-cards').textContent,
      /Non-cultivated width beneath each row/,
    );
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        reservation,
        '2',
      );
      reservation.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    assert.equal(
      JSON.parse(localStorage.getItem('aed-study-v1')).landUse.underPanelWidth,
      2,
      'Typing updates before blur',
    );
    const setback = document.querySelector('[data-annotation="rowPair.cropSetback"] input');
    const cropWidth = document.querySelector('[data-annotation="rowPair.croppingWidth"] input');
    const beforeArrow = Number(setback.value);
    await act(async () =>
      setback.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      ),
    );
    const linked = JSON.parse(localStorage.getItem('aed-study-v1'));
    assert.ok(Math.abs(linked.rowPair.cropSetback - beforeArrow - 0.1) < 1e-6);
    assert.ok(
      Math.abs(linked.landUse.underPanelWidth + Number(cropWidth.value) - linked.rowPair.pitch) <
        1e-6,
    );
    // Restore the reference width through its own live input.
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        reservation,
        '2',
      );
      reservation.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await act(async () => reservation.blur());
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).landUse.underPanelWidth, 2);
    assert.match(document.querySelector('.annotation-cards').textContent, /2 m/);
    await click(step('Irradiance'));
    assert.equal(calculations, 1, 'Changing reserved ground does not repeat the solve');
    assert.equal(
      byText('Relative sunlight').disabled,
      false,
      'Existing light results remain valid',
    );
    await click(byText('Top-down'));
    await click(byText('Estimated DLI'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    assert.equal(
      document.querySelector('.compact-sidebar'),
      null,
      'Irradiance keeps input controls open after calculation',
    );
    assert.equal(
      document.querySelector('.field-tools'),
      null,
      'No placement toolbar in Irradiance',
    );
    assert.ok(document.querySelector('[data-annotation="analysis.resolution"] input'));
    await click(step('Agrivoltaic'));
    assert.ok(document.querySelector('.compact-sidebar'));
    assert.equal(byText('C · Cropping area').getAttribute('aria-pressed'), 'true');
    await click(document.querySelector('button[aria-label="Expand inputs"]'));
    await click(byText('Place a sensor in the view'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    await click(byText('Add at array centre'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    await click(byText('Add at array centre'));
    let saved = JSON.parse(localStorage.getItem('aed-study-v1'));
    assert.equal(saved.experimentSensors.length, 0, 'New sensors never enter autosave');
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option[value^="sensor:"]')
        .length,
      2,
    );
    const fieldValue = (path) => document.querySelector(`[data-annotation="${path}"] input`).value;
    assert.equal(
      fieldValue('experimentSensors.0.grid.column'),
      fieldValue('experimentSensors.1.grid.column'),
    );
    assert.equal(
      fieldValue('experimentSensors.0.grid.row'),
      fieldValue('experimentSensors.1.grid.row'),
    );
    await click(byText('Add crop plot'));
    saved = JSON.parse(localStorage.getItem('aed-study-v1'));
    assert.equal(saved.crops.length, 0, 'New beds never enter autosave');
    assert.match(
      document.querySelector('select[aria-label="Select field item"]').textContent,
      /Lettuce/,
    );
    assert.ok(document.querySelector('[role="dialog"]'));
    assert.equal(fieldValue('crops.0.grid.columns'), '1');
    assert.equal(fieldValue('crops.0.grid.rows'), '1');
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Top-down/);
    assert.equal(calculations, 1);
    await click(step('Agrivoltaic'));
    await click(byText('Orthographic'));
    await click(byText('Relative sunlight'));
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    assert.equal(JSON.parse(sessionStorage.getItem('aed-navigation')).step, 7);
    const workflowButtons = [...document.querySelectorAll('.step-toggle')];
    assert.equal(workflowButtons.length, 10);
    assert.ok(
      !workflowButtons.some((b) =>
        ['Field sensors', 'Crop plots'].includes(b.getAttribute('aria-label')),
      ),
    );
    // Bulk layout is one undoable edit, preserves the view/result, and accepts a subset of rows.
    await click(byText('Add crop beds'));
    assert.ok(document.querySelector('.crop-beds-dialog[open]'));
    await click(
      [...document.querySelectorAll('.crop-beds-dialog button')].find(
        (b) => b.textContent === 'Clear',
      ),
    );
    assert.equal(document.querySelector('.crop-beds-dialog button[type="submit"]').disabled, true);
    await click(document.querySelector('.crop-beds-dialog [role="checkbox"]'));
    await click(document.querySelector('.crop-beds-dialog button[type="submit"]'));
    assert.equal(document.querySelector('.crop-beds-dialog'), null);
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option[value^="crop:"]')
        .length,
      4,
    );
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    assert.equal(calculations, 1);
    await click(byText('Undo'));
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option[value^="crop:"]')
        .length,
      1,
    );
    // First control entry clones all field items; edits remain independent and never solve.
    await click(step('Control'));
    assert.equal(JSON.parse(sessionStorage.getItem('aed-navigation')).step, 8);
    assert.match(document.querySelector('.scene-label').textContent, /CONTROL/);
    assert.equal(byText('C · Cropping area').getAttribute('aria-pressed'), 'true');
    await click(byText('C · Cropping area'));
    assert.equal(byText('C · Cropping area').getAttribute('aria-pressed'), 'false');
    assert.match(document.body.textContent, /100% relative sunlight/);
    const choices = () =>
      [...document.querySelectorAll('select[aria-label="Select field item"] option')].filter(
        (o) => o.value,
      );
    assert.equal(choices().length, 3);
    assert.ok(choices().every((o) => o.value.includes(':C-')));
    assert.equal(document.querySelector('button[aria-label="Panel opacity"]'), null);
    await click(document.querySelector('input[aria-label="Select C-S-01"]'));
    await click(document.querySelector('input[aria-label="Select C-P-01"]'));
    await click(byText('Duplicate selected (2)'));
    assert.equal(choices().length, 5);
    await click(byText('Undo'));
    assert.equal(choices().length, 3);
    await click(document.querySelector('input[aria-label="Select C-S-01"]'));
    await click(byText('Duplicate selected (1)'));
    assert.equal(choices().length, 4);
    await click(step('Agrivoltaic'));
    assert.equal(choices().length, 3, 'Control duplication did not change Agrivoltaic');
    await click(step('Control'));
    assert.equal(choices().length, 4, 'Revisiting Control does not overwrite edits');
    assert.equal(calculations, 1);
    await click(step('Irradiance'));
    assert.equal(document.querySelector('.field-tools'), null);
    assert.equal(document.querySelector('.compact-sidebar'), null);
    await click(byText('Apply coarse preview settings'));
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).analysis.resolution, 3);
    await click(byText('Apply standard settings'));
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).analysis.resolution, 1);
    assert.equal(
      JSON.parse(localStorage.getItem('aed-study-v1')).analysis.gridAlignment,
      'row-centres',
    );
    assert.equal(JSON.parse(localStorage.getItem('aed-study-v1')).analysis.cellsPerRow, 9);
    assert.match(document.querySelector('.control-content').textContent, /Current grid:/);
    // Restore the original numerical inputs without running another calculation.
    await act(async () => {
      const spacing = document.querySelector('[data-annotation="analysis.resolution"] input');
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        spacing,
        '1',
      );
      spacing.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      const patches = document.querySelector('[data-annotation="analysis.patches"] select');
      patches.value = '145';
      patches.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    await click(step('Methods & export'));
    assert.ok(document.querySelector('.export-panel'));
    assert.equal(document.querySelector('[aria-label="Drawing callouts"]'), null);
    assert.equal(document.querySelectorAll('.svg-fallback [data-callout]').length, 0);
    assert.equal(JSON.parse(sessionStorage.getItem('aed-navigation')).step, 9);
    assert.equal(calculations, 1);
    // Import is previewed before changing storage and restores a matching result without downloading weather.
    const incoming = JSON.parse(localStorage.getItem('aed-study-v1'));
    incoming.experimentSensors = study.experimentSensors;
    incoming.crops = study.crops;
    incoming.metadata.title = 'Shared supplemental project';
    incoming.weather = {
      ...incoming.weather,
      mode: 'automatic',
      requestKey: 'retained-publication-snapshot',
      ...(await weatherRecord(sampleWeather(incoming), 'retained fixture weather')),
    };
    const importedResult = await calculateDay(incoming);
    const packed = await projectDocument(incoming, importedResult);
    const bytes = new TextEncoder().encode(JSON.stringify(packed));
    const input = document.querySelector('input[aria-label="Choose project file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [
        { name: 'project.json', size: bytes.length, arrayBuffer: async () => bytes.slice().buffer },
      ],
    });
    const originalStored = localStorage.getItem('aed-study-v1');
    async function chooseImport() {
      await act(async () => {
        input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 40));
      });
      assert.ok(document.querySelector('.project-dialog[open]'));
    }
    await chooseImport();
    assert.equal(localStorage.getItem('aed-study-v1'), originalStored);
    await click(
      [...document.querySelectorAll('.project-dialog button')].find(
        (b) => b.textContent === 'Cancel',
      ),
    );
    assert.equal(localStorage.getItem('aed-study-v1'), originalStored);
    await chooseImport();
    await click(
      [...document.querySelectorAll('.project-dialog button')].find(
        (b) => b.textContent === 'Open project',
      ),
    );
    await act(async () => new Promise((r) => setTimeout(r, 700)));
    assert.equal(
      JSON.parse(localStorage.getItem('aed-study-v1')).metadata.title,
      incoming.metadata.title,
    );
    assert.equal(localStorage.getItem('aed-weather-pinned'), 'true');
    assert.equal(byText('Relative sunlight').disabled, false);
    assert.match(document.body.textContent, /Using the imported weather snapshot/);
    assert.equal(calculations, 1, 'Opening a package restores results without recalculation');
    assert.deepEqual(JSON.parse(localStorage.getItem('aed-study-v1')).experimentSensors, []);
    assert.deepEqual(JSON.parse(localStorage.getItem('aed-study-v1')).crops, []);
    await click(step('Agrivoltaic'));
    assert.match(
      document.querySelector('select[aria-label="Select field item"]').textContent,
      /OLD-SENSOR/,
    );
    assert.match(
      document.querySelector('select[aria-label="Select field item"]').textContent,
      /OLD-BED/,
    );
    // Cancelling a download by changing sources must not leave a timeout error
    // or prevent a fresh request for the same site and date.
    let weatherCalls = 0;
    globalThis.fetch = (_url, { signal }) => {
      weatherCalls++;
      return new Promise((_, reject) =>
        signal.addEventListener(
          'abort',
          () => reject(new DOMException('Cancelled', 'AbortError')),
          {
            once: true,
          },
        ),
      );
    };
    await click(step('Site & weather'));
    await click(byText('Refresh site weather'));
    assert.equal(weatherCalls, 1);
    assert.ok(byText('Downloading…').disabled);
    const source = document.querySelector('[data-annotation="weather.mode"] select');
    const chooseSource = async (value) =>
      act(async () => {
        source.value = value;
        source.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
      });
    await chooseSource('sample');
    await chooseSource('automatic');
    assert.equal(document.querySelector('.weather-error'), null);
    await click(byText('Refresh site weather'));
    assert.equal(weatherCalls, 2);
    await chooseSource('sample');
  } finally {
    await fs.rm(file, { force: true });
    console.error = originalError;
    globalThis.Worker = oldWorker;
    globalThis.fetch = oldFetch;
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
