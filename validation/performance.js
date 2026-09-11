import * as THREE from 'three';
import { defaultStudy, dimensions, selectRacking, designIssues } from '../src/domain/study.js';
import { buildGeometry, disposeGroup, receiverGridSpec } from '../src/domain/geometry.js';
const run = document.getElementById('run'),
  stop = document.getElementById('stop'),
  status = document.getElementById('status'),
  out = document.getElementById('results');
let report,
  stopped = false,
  cancelCurrent;
const specs = [
  { id: '250 modules / 5k receivers', high: 2, wide: 5, tables: 5, rows: 5, target: 5000 },
  { id: '2000 modules / 19k receivers', high: 2, wide: 10, tables: 5, rows: 20, target: 19000 },
  { id: '10000 modules / 19k receivers', high: 5, wide: 20, tables: 10, rows: 10, target: 19000 },
  { id: '48000 modules / 19k receivers', high: 5, wide: 20, tables: 20, rows: 24, target: 19000 },
];
function study(spec, type = 'fixed', patches = 577) {
  let s = defaultStudy();
  s.table.high = spec.high;
  s.table.wide = spec.wide;
  s.row.tables = spec.tables;
  s.array.rows = spec.rows;
  s.rowPair.pitch = Math.max(8, dimensions(s).width + 1);
  s = selectRacking(s, type);
  s.weather = { ...s.weather, mode: 'sample', name: 'Illustrative benchmark day' };
  const d = dimensions(s);
  s.analysis.resolution = Math.min(
    5,
    Math.max(0.25, Math.sqrt((d.footprintX * d.footprintY) / spec.target)),
  );
  s.analysis.patches = patches;
  s.analysis.interval = 10;
  const issues = designIssues(s);
  if (issues.length) throw Error(issues.join(' '));
  return s;
}
function publish() {
  out.textContent = JSON.stringify(report, null, 2);
}
function waitReady(worker) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Worker startup timeout')), 30000);
    worker.onmessage = ({ data }) => {
      if (data.type === 'ready') {
        clearTimeout(timer);
        resolve();
      }
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      reject(Error(e.message));
    };
  });
}
function solve(worker, s) {
  return new Promise((resolve) => {
    const began = performance.now();
    let last = began,
      maxHeartbeatGapMs = 0;
    const pulse = setInterval(() => {
      const now = performance.now();
      maxHeartbeatGapMs = Math.max(maxHeartbeatGapMs, now - last);
      last = now;
    }, 50);
    const finish = (value) => {
      clearTimeout(timer);
      clearInterval(pulse);
      cancelCurrent = null;
      resolve({ ...value, wallSeconds: (performance.now() - began) / 1000, maxHeartbeatGapMs });
    };
    const timer = setTimeout(() => {
      worker.terminate();
      finish({ timeout: true });
    }, 30000);
    cancelCurrent = () => {
      worker.terminate();
      finish({ cancelled: true });
    };
    worker.onmessage = ({ data }) =>
      data.type === 'result' ? finish(data.result) : finish({ error: data.error });
    worker.onerror = (e) => finish({ error: e.message });
    worker.postMessage({ study: s });
  });
}
async function benchmark(s, label, backend) {
  const worker = new Worker(new URL('./performance-worker.js', import.meta.url), {
    type: 'module',
  });
  const d = dimensions(s),
    g = receiverGridSpec(s);
  const entry = {
    label,
    requestedBackend: backend,
    modules: d.modules,
    receivers: g.nx * g.ny,
    gridSpacing: s.analysis.resolution,
    areaM2: d.footprintX * d.footprintY,
    rack: s.racking.type,
    patches: s.analysis.patches,
    intervalMinutes: s.analysis.interval,
  };
  status.textContent = `${label} · ${backend}`;
  try {
    await waitReady(worker);
    s.analysis.backend = backend;
    entry.cold = await solve(worker, s);
    if (!stopped && !entry.cold.timeout && !entry.cold.error && !entry.cold.cancelled)
      entry.warm = await solve(worker, s);
  } catch (e) {
    entry.error = e.message;
  } finally {
    worker.terminate();
  }
  report.solves.push(entry);
  publish();
}
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
async function renderProbe(s) {
  status.textContent = `Drawing ${dimensions(s).modules} modules`;
  const start = performance.now(),
    group = buildGeometry(s),
    built = performance.now();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(1000, 650);
  renderer.setPixelRatio(1);
  document.getElementById('drawing').append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#edf2ee');
  scene.add(group, new THREE.HemisphereLight(0xffffff, 0x777777, 3));
  const d = dimensions(s),
    extent = Math.max(d.footprintX, d.footprintY) * 0.8;
  const camera = new THREE.OrthographicCamera(
    -extent,
    extent,
    extent * 0.65,
    -extent * 0.65,
    0.1,
    10000,
  );
  camera.up.set(0, 0, 1);
  camera.position.set(extent, -extent, extent);
  camera.lookAt(0, 0, 0);
  const t = performance.now();
  renderer.render(scene, camera);
  const first = performance.now() - t;
  const times = [];
  let last = await frame();
  for (let i = 0; i < 30; i++) {
    renderer.render(scene, camera);
    const now = await frame();
    times.push(now - last);
    last = now;
  }
  times.sort((a, b) => a - b);
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  report.rendering.push({
    modules: d.modules,
    meshes: group.children.length,
    geometryBuildMs: built - start,
    firstRenderSubmitMs: first,
    medianFrameMs: times[15],
    p95FrameMs: times[28],
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable',
    scope:
      'Hardware meshes only, 1000x650, pixel ratio 1; excludes full React UI, receiver map and figure export.',
  });
  disposeGroup(group);
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
  publish();
}
stop.onclick = () => {
  stopped = true;
  cancelCurrent?.();
  status.textContent = 'Stopping';
};
run.onclick = async () => {
  stopped = false;
  run.disabled = true;
  stop.disabled = false;
  report = {
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemoryGiB: navigator.deviceMemory ?? null,
    scope:
      'Synthetic Tucson June 21, 2026. Bounded real-browser daily solves; cold/warm in-worker memory cache only. 30-second per-solve timeout. No independent physics validation, no crash/memory exhaustion test.',
    solves: [],
    rendering: [],
  };
  publish();
  try {
    for (const spec of specs) {
      for (const backend of ['gpu', 'cpu']) {
        if (stopped) break;
        await benchmark(study(spec), spec.id, backend);
      }
      if (stopped) break;
    }
    for (const type of ['single-axis', 'dual-axis']) {
      if (stopped) break;
      await benchmark(study(specs[0], type), `${type} 250 modules`, 'gpu');
    }
    if (!stopped) await benchmark(study(specs[1], 'fixed', 2305), '2000 modules / fine sky', 'gpu');
    for (const spec of [specs[0], specs[1], specs[2]]) {
      if (stopped) break;
      await renderProbe(study(spec));
    }
    report.completed = !stopped;
    status.textContent = stopped ? 'Stopped' : 'Benchmarks complete';
  } catch (e) {
    report.error = e.message;
    status.textContent = `Stopped: ${e.message}`;
  } finally {
    publish();
    run.disabled = false;
    stop.disabled = true;
    document.getElementById('download').disabled = false;
  }
};
document.getElementById('download').onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'browser-performance.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
