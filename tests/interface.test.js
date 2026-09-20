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
import { parseWeather } from '../src/irradiance/weather.js';
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
      if (data.file) {
        data.file
          .text()
          .then((text) => parseWeather(text, data.file.name, data.study))
          .then((value) => {
            if (!this.terminated) this.onmessage?.({ data: { type: 'complete', value } });
          })
          .catch((error) => {
            if (!this.terminated)
              this.onmessage?.({ data: { type: 'error', message: error.message } });
          });
        return;
      }
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
  let application;
  const savedStudy = async () => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 350)));
    return JSON.parse(localStorage.getItem('aed-study-v1'));
  };
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
      application = await import(pathToFileURL(file).href + '?test=' + Date.now());
    });
    assert.match(document.querySelector('.brand').textContent, /Agrivoltaic Experiment Designer/);
    assert.equal(document.querySelector('.brand svg'), null);
    assert.deepEqual((await savedStudy()).experimentSensors, []);
    assert.deepEqual((await savedStudy()).crops, []);
    assert.deepEqual((await savedStudy()).analysis, study.analysis);
    assert.equal((await savedStudy()).browserGridDefaultsVersion, 1);
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
      rack.value = 'single-axis';
      rack.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal((await savedStudy()).array.azimuth, 90);
    assert.match(
      document.querySelector('.control-content').textContent,
      /panels track east–west around a north–south axis/,
    );
    await click(step('Full array'));
    const bearing = document.querySelector('[data-annotation="array.azimuth"] input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        bearing,
        '180',
      );
      bearing.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    assert.equal((await savedStudy()).array.azimuth, 180);
    await click(step('Racking'));
    await click(byText('Apply default orientation'));
    assert.equal((await savedStudy()).array.azimuth, 90);
    await act(async () => {
      const selection = document.querySelector('select');
      selection.value = 'dual-axis';
      selection.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal((await savedStudy()).array.azimuth, 90);
    assert.equal(document.querySelector('[role="alert"]'), null);
    await click(step('PV table & row'));
    const orientation = document.querySelector('select');
    await act(async () => {
      orientation.value = 'portrait';
      orientation.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal((await savedStudy()).row.tableGap, 1.43);
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
    const selectedSite = (await savedStudy()).site;
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
    await click(byText('Zoned DLI'));
    assert.equal(document.querySelectorAll('.dli-zone-items > div').length, 5);
    const zoneInput = document.querySelector('[data-annotation="analysis.dliZoneCount"] input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        zoneInput,
        '3',
      );
      zoneInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    assert.equal(document.querySelectorAll('.dli-zone-items > div').length, 3);
    assert.equal((await savedStudy()).analysis.dliZoneCount, 3);
    assert.equal(byText('Relative sunlight').disabled, false);
    assert.equal(calculations, 1, 'Zoning is recomputed without rerunning the light solver');
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    assert.match(
      document.querySelector('.svg-fallback svg').getAttribute('aria-label'),
      /Zoned DLI/,
    );
    await click(byText('Relative sunlight'));
    const sampleInput = document.querySelector('[data-annotation="analysis.samplesPerCell"] input');
    const advanced = sampleInput.closest('details');
    assert.equal(advanced.open, false);
    assert.equal(advanced.querySelector('summary').textContent, 'Advanced settings');
    await click(advanced.querySelector('summary'));
    assert.equal(advanced.open, true);
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
      assert.equal((await savedStudy()).analysis.samplesPerCell, count);
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
    assert.equal((await savedStudy()).landUse.underPanelWidth, 2, 'Typing updates before blur');
    const setback = document.querySelector('[data-annotation="rowPair.cropSetback"] input');
    const cropWidth = document.querySelector('[data-annotation="rowPair.croppingWidth"] input');
    const beforeArrow = Number(setback.value);
    await act(async () =>
      setback.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      ),
    );
    const linked = await savedStudy();
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
    assert.equal((await savedStudy()).landUse.underPanelWidth, 2);
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
    let saved = await savedStudy();
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
    saved = await savedStudy();
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
    assert.ok(
      [...document.querySelectorAll('.crop-beds-dialog [role="checkbox"]')].every(
        (c) => c.getAttribute('aria-checked') === 'false',
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
    // Sensor grid starts empty, clears selection after resizing, and commits one undoable batch.
    await click(byText('Add sensors'));
    const sensorDialog = () => document.querySelector('.sensors-dialog');
    assert.equal(
      sensorDialog().querySelector('.sensor-crop-row').querySelectorAll('input[type="checkbox"]')
        .length,
      30,
    );
    await click(sensorDialog().querySelector('[aria-label="About Rows per crop row"]'));
    assert.match(sensorDialog().querySelector('[role="tooltip"]').textContent, /cropping width/);
    assert.equal(sensorDialog().querySelector('[aria-label="Rows per crop row"]').value, '3');
    assert.equal(sensorDialog().querySelector('[aria-label="Columns per crop row"]').value, '10');
    assert.ok(
      [...sensorDialog().querySelectorAll('input[type="checkbox"]')].every((c) => !c.checked),
    );
    assert.equal(sensorDialog().querySelector('button[type="submit"]').disabled, true);
    await click(sensorDialog().querySelector('input[type="checkbox"]'));
    await act(async () => {
      const input = sensorDialog().querySelector('[aria-label="Rows per crop row"]');
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        input,
        '2',
      );
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    assert.ok(
      [...sensorDialog().querySelectorAll('input[type="checkbox"]')].every((c) => !c.checked),
    );
    await click(sensorDialog().querySelector('input[type="checkbox"]'));
    await click(sensorDialog().querySelectorAll('input[type="checkbox"]')[19]);
    await act(async () => {
      const select = sensorDialog().querySelector('select');
      select.value = 'Soil moisture';
      select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    await click(sensorDialog().querySelector('button[type="submit"]'));
    assert.equal(sensorDialog(), null);
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option[value^="sensor:"]')
        .length,
      4,
    );
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option').length,
      6,
    );
    assert.match(
      document.querySelector('select[aria-label="Select field item"]').textContent,
      /Soil moisture/,
    );
    assert.equal(calculations, 1);
    assert.match(document.querySelector('.view-tabs .selected').textContent, /Orthographic/);
    await click(byText('Undo'));
    assert.equal(
      document.querySelectorAll('select[aria-label="Select field item"] option[value^="sensor:"]')
        .length,
      2,
    );
    await click(byText('Add sensors'));
    assert.equal(sensorDialog().querySelector('select').value, 'Soil moisture');
    assert.ok(
      [...sensorDialog().querySelectorAll('input[type="checkbox"]')].every((c) => !c.checked),
    );
    await click(sensorDialog().querySelector('[aria-label="Close sensor layout"]'));
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
    assert.equal((await savedStudy()).analysis.resolution, 3);
    await click(byText('Apply standard settings'));
    assert.equal((await savedStudy()).analysis.resolution, 1);
    assert.equal((await savedStudy()).analysis.gridAlignment, 'row-centres');
    assert.equal((await savedStudy()).analysis.cellsPerRow, 15);
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
    const incoming = await savedStudy();
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
    assert.equal((await savedStudy()).metadata.title, incoming.metadata.title);
    assert.equal(localStorage.getItem('aed-weather-pinned'), 'true');
    assert.equal(byText('Relative sunlight').disabled, false);
    assert.match(document.body.textContent, /Using the imported weather snapshot/);
    assert.equal(calculations, 1, 'Opening a package restores results without recalculation');
    assert.deepEqual((await savedStudy()).experimentSensors, []);
    assert.deepEqual((await savedStudy()).crops, []);
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
    // Deferred weather reads exercise the actual App import lifecycle.
    const csvWeather =
      'timestamp,GHI,DNI,DHI\n' +
      Array.from({ length: 24 }, (_, h) => `${h}:00,100,0,100`).join('\n');
    const beginWeather = async (name) => {
      await click(step('Site & weather'));
      let resolve;
      const file = {
        name,
        size: csvWeather.length,
        text: () =>
          new Promise((r) => {
            resolve = r;
          }),
      };
      const input = document.querySelector('input[accept=".csv,.epw"]');
      Object.defineProperty(input, 'files', { configurable: true, value: [file] });
      await act(async () => input.dispatchEvent(new dom.window.Event('change', { bubbles: true })));
      return async () =>
        act(async () => {
          resolve(csvWeather);
          await new Promise((r) => setTimeout(r, 30));
        });
    };
    const setNumber = async (selector, value) => {
      const input = document.querySelector(selector);
      await act(async () => {
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
          input,
          String(value),
        );
        input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      });
      await act(async () =>
        input.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true })),
      );
    };
    const finishFirst = await beginWeather('deferred.csv');
    await click(step('Module'));
    await setNumber('[data-annotation="module.width"] input', 1.5);
    await finishFirst();
    let uploaded = await savedStudy();
    assert.equal(
      uploaded.module.width,
      1.5,
      'Finishing an upload preserves concurrent geometry edits',
    );
    assert.equal(uploaded.weather.name, 'deferred.csv');
    const finishOld = await beginWeather('obsolete.csv');
    const finishNew = await beginWeather('newest.csv');
    await finishNew();
    await finishOld();
    assert.equal((await savedStudy()).weather.name, 'newest.csv');
    const finishStale = await beginWeather('wrong-date.csv');
    const dateInput = document.querySelector('[data-annotation="analysis.date"] input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
        dateInput,
        '2026-06-22',
      );
      dateInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await act(async () =>
      dateInput.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true })),
    );
    await finishStale();
    uploaded = await savedStudy();
    assert.equal(uploaded.analysis.date, '2026-06-22');
    assert.notEqual(uploaded.weather.name, 'wrong-date.csv');
    const finishPreviousProject = await beginWeather('previous-project.csv');
    await chooseImport();
    await click(
      [...document.querySelectorAll('.project-dialog button')].find(
        (b) => b.textContent === 'Open project',
      ),
    );
    await finishPreviousProject();
    uploaded = await savedStudy();
    assert.equal(uploaded.metadata.title, incoming.metadata.title);
    assert.notEqual(uploaded.weather.name, 'previous-project.csv');
  } finally {
    await act(async () => application?.applicationRoot.unmount());
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
