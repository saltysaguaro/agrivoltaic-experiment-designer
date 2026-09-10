import { defaultStudy, selectRacking } from '../src/domain/study.js';
import { figureSvg } from '../src/report/figures.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
const run = document.getElementById('run'),
  status = document.getElementById('status'),
  out = document.getElementById('results');
function calculate(study, prefix, failure) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      worker.terminate();
      data.error ? reject(Error(data.error)) : resolve(data.result);
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(Error(e.message));
    };
    worker.postMessage({ study, prefix, failure });
  });
}
function compare(a, b) {
  if (a.cells.length !== b.cells.length) throw Error('Grid mismatch');
  let wh = 0,
    dli = 0,
    sunlight = 0;
  a.cells.forEach((c, i) => {
    wh = Math.max(wh, Math.abs(c.wh - b.cells[i].wh));
    dli = Math.max(dli, Math.abs(c.dli - b.cells[i].dli));
    sunlight = Math.max(sunlight, Math.abs(c.sunlight - b.cells[i].sunlight));
  });
  if (![wh, dli, sunlight].every(Number.isFinite) || wh > 0.1 || dli > 0.001)
    throw Error(`Parity failed: ${JSON.stringify({ wh, dli, sunlight })}`);
  return { maxWhDifference: wh, maxDliDifference: dli, maxSunlightDifference: sunlight };
}
run.onclick = async () => {
  run.disabled = true;
  out.textContent = '';
  const report = {
    createdAt: new Date().toISOString(),
    scope:
      'Five small rack designs; per-cell daily GPU/CPU parity; isolated real IndexedDB cold/warm cache; actual device destruction; simulated allocation and storage errors. Shared sky/solar physics. Not independent physical validation.',
    tolerances: { wh: 0.1, dli: 0.001 },
    cases: [],
  };
  const prefix = `validation-${Date.now()}`;
  try {
    for (const type of ['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola']) {
      status.textContent = `Checking ${type}`;
      let s = defaultStudy();
      s.weather = { ...s.weather, mode: 'sample', name: 'Illustrative validation day' };
      s.table.high = 1;
      s.table.wide = 2;
      s.row.tables = 1;
      s.array.rows = 2;
      s.array.azimuth = 173;
      s.analysis = { ...s.analysis, patches: 145, resolution: 2, interval: 15, backend: 'cpu' };
      s = selectRacking(s, type);
      const cpu = await calculate(s, prefix);
      s.analysis.backend = 'gpu';
      const gpu = await calculate(s, prefix);
      if (gpu.backend !== 'WebGPU BVH')
        throw Error(`Real WebGPU required: ${gpu.warnings.join(' ')}`);
      const warm = await calculate(s, prefix);
      if (!warm.cached) throw Error('Expected persistent cache reuse in a fresh worker');
      report.cases.push({
        type,
        cells: cpu.cells.length,
        cpuSeconds: cpu.seconds,
        gpuSeconds: gpu.seconds,
        warmCachedPoses: warm.cached,
        ...compare(cpu, gpu),
        warmDifference: compare(gpu, warm),
      });
      if (type === 'fixed') {
        for (const failure of ['device', 'allocation', 'storage']) {
          const r = await calculate(s, `${prefix}-${failure}`, failure);
          if (failure !== 'storage' && r.backend !== 'WebGPU + CPU fallback')
            throw Error('Expected CPU fallback');
          report.cases.push({
            type: failure,
            backend: r.backend,
            warnings: r.warnings,
            ...compare(cpu, r),
          });
        }
        const sample = normalizeLayout({
          ...s,
          experimentSensors: [{ id: 'S-01', type: 'PAR', x: 0, y: 0, z: -0.15 }],
        });
        document.getElementById('figure').innerHTML = figureSvg(sample, gpu, 'plan', 'dli');
      }
      out.textContent = JSON.stringify(report, null, 2);
    }
    report.passed = true;
    status.textContent = 'Passed all GPU / CPU checks';
  } catch (error) {
    report.passed = false;
    report.error = error.message;
    status.textContent = 'Failed: ' + error.message;
  } finally {
    out.textContent = JSON.stringify(report, null, 2);
    run.disabled = false;
  }
};

// Exercise the real browser SVG decoding and bounded PNG canvas separately from
// scientific comparisons, so export changes do not require rerunning the solver.
const pngButton = document.createElement('button');
pngButton.textContent = 'Check PNG export';
document.body.appendChild(pngButton);
pngButton.onclick = async () => {
  pngButton.disabled = true;
  try {
    const { pngFigure } = await import('../src/report/export.js');
    const svg = figureSvg(defaultStudy(), null, 'plan');
    const blob = await pngFigure(svg);
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    try {
      await img.decode();
    } finally {
      URL.revokeObjectURL(url);
    }
    img.alt = 'PNG export with publication provenance';
    img.style.width = '100%';
    const expectedHeight = Number(svg.match(/height="([0-9]+)"/)[1]);
    if (Math.abs(img.naturalHeight / img.naturalWidth - expectedHeight / 1000) > 0.001)
      throw Error('PNG aspect ratio mismatch');
    const message = document.createElement('p');
    message.setAttribute('role', 'status');
    message.textContent = `PNG passed: ${img.naturalWidth} × ${img.naturalHeight}; ${blob.size} bytes`;
    document.body.append(message, img);
  } catch (error) {
    status.textContent = `PNG failed: ${error.message}`;
  } finally {
    pngButton.disabled = false;
  }
};
