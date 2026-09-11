import {
  defaultStudy,
  dimensions,
  selectRacking,
  designIssues,
  VERSION,
} from '../src/domain/study.js';
import { receiverGridSpec } from '../src/domain/geometry.js';
import { moduleOptics } from '../src/domain/optics.js';
import { analysisPeriod } from '../src/domain/period.js';
import { validateResult } from '../src/project/results.js';
const run = document.getElementById('run'),
  stop = document.getElementById('stop'),
  status = document.getElementById('status'),
  out = document.getElementById('results');
const budgetMs = 120000;
let report,
  stopped = false,
  cancelCurrent;
const specs = {
  typical: { high: 2, wide: 6, tables: 2, rows: 4, resolution: 1 },
  medium: { high: 2, wide: 5, tables: 5, rows: 5, target: 5000 },
  large: { high: 2, wide: 10, tables: 5, rows: 20, target: 19000 },
  maximum: { high: 5, wide: 20, tables: 20, rows: 24, target: 19000 },
  tracker: { high: 2, wide: 5, tables: 5, rows: 5, target: 1000 },
};
const standardCases = [
  { size: 'typical', mode: 'season', backend: 'gpu', repeat: true },
  { size: 'typical', mode: 'year', backend: 'gpu', repeat: true },
  { size: 'typical', mode: 'season', backend: 'cpu' },
  { size: 'typical', mode: 'year', backend: 'cpu' },
  { size: 'medium', mode: 'season', backend: 'gpu' },
  { size: 'medium', mode: 'year', backend: 'gpu' },
  { size: 'large', mode: 'season', backend: 'gpu' },
  { size: 'large', mode: 'year', backend: 'gpu' },
  { size: 'maximum', mode: 'season', backend: 'gpu' },
  { size: 'tracker', rack: 'single-axis', mode: 'season', backend: 'gpu' },
  { size: 'tracker', rack: 'single-axis', mode: 'year', backend: 'gpu' },
  { size: 'medium', patches: 2305, mode: 'season', backend: 'gpu' },
];
const cpuCases = [
  { size: 'medium', mode: 'season', backend: 'cpu' },
  { size: 'medium', mode: 'year', backend: 'cpu' },
];
let cases = standardCases;
const suite = document.getElementById('suite');
function makeStudy(spec) {
  let s = defaultStudy();
  const shape = specs[spec.size];
  Object.assign(s.table, { high: shape.high, wide: shape.wide });
  s.row.tables = shape.tables;
  s.array.rows = shape.rows;
  s.rowPair.pitch = Math.max(8, dimensions(s).width + 1);
  s = selectRacking(s, spec.rack ?? 'fixed');
  const d = dimensions(s);
  Object.assign(s.module, {
    bifacial: true,
    cellGapX: 0.02,
    cellGapY: 0.01,
    gapTransmission: 0.9,
    gapParTransmission: 0.8,
  });
  Object.assign(s.analysis, {
    period: spec.mode,
    year: 2024,
    startMonth: 6,
    endMonth: 6,
    date: spec.mode === 'year' ? '2024-01-01' : '2024-06-01',
    patches: spec.patches ?? 577,
    interval: 10,
    backend: spec.backend,
    resolution:
      shape.resolution ??
      Math.min(5, Math.max(0.25, Math.sqrt((d.footprintX * d.footprintY) / shape.target))),
  });
  s.weather = {
    ...s.weather,
    mode: 'sample',
    name: 'Synthetic Tucson benchmark weather',
    rows: [],
    days: [],
    hash: '',
  };
  const issues = designIssues(s);
  if (issues.length) throw Error(issues.join('; '));
  return s;
}
function publish() {
  out.textContent = JSON.stringify(report, null, 2);
  try {
    sessionStorage.setItem('aed-period-benchmark-report', out.textContent);
  } catch {}
}
async function environment() {
  const adapter = await navigator.gpu?.requestAdapter();
  const info = adapter?.info;
  return {
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemoryGiB: navigator.deviceMemory ?? null,
    webgpu: adapter
      ? {
          vendor: info?.vendor,
          architecture: info?.architecture,
          device: info?.device,
          description: info?.description,
          isFallbackAdapter: info?.isFallbackAdapter ?? null,
          limits: {
            maxBufferSize: adapter.limits.maxBufferSize,
            maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
            maxComputeWorkgroupsPerDimension: adapter.limits.maxComputeWorkgroupsPerDimension,
          },
        }
      : null,
    initialVisibility: document.visibilityState,
  };
}
function clearCache() {
  if (location.origin !== 'http://127.0.0.1:5175')
    throw Error(
      'Use the dedicated benchmark origin http://127.0.0.1:5175 to isolate cache cleanup.',
    );
  return new Promise((resolve, reject) => {
    const r = indexedDB.deleteDatabase('fieldwork-visibility-v1');
    r.onsuccess = resolve;
    r.onerror = () => reject(Error('Unable to reset benchmark cache'));
    r.onblocked = () => reject(Error('Benchmark cache is in use; close other benchmark tabs'));
  });
}
function ready(worker) {
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
function solve(worker, study, label) {
  return new Promise((resolve) => {
    const began = performance.now(),
      gaps = [],
      longTasks = [],
      heap = [];
    let checkpoint,
      lastProgress,
      lastPulse = began,
      settled = false,
      hidden = document.visibilityState !== 'visible';
    const visibility = () => {
      hidden ||= document.visibilityState !== 'visible';
    };
    document.addEventListener('visibilitychange', visibility);
    const pulse = setInterval(() => {
      const now = performance.now();
      gaps.push(now - lastPulse);
      lastPulse = now;
      if (performance.memory) heap.push(performance.memory.usedJSHeapSize);
    }, 50);
    const observer =
      typeof PerformanceObserver !== 'undefined' &&
      PerformanceObserver.supportedEntryTypes.includes('longtask')
        ? new PerformanceObserver((list) =>
            longTasks.push(...list.getEntries().map((e) => e.duration)),
          )
        : null;
    observer?.observe({ type: 'longtask' });
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(pulse);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      cancelCurrent = null;
      gaps.sort((a, b) => a - b);
      resolve({
        ...value,
        checkpoint,
        measurement: {
          wallSeconds: (performance.now() - began) / 1000,
          completedDays: checkpoint?.completedDays ?? 0,
          lastProgress,
          hiddenDuringRun: hidden,
          mainThreadHeartbeat: {
            intervalMs: 50,
            samples: gaps.length,
            p95GapMs: gaps[Math.floor(gaps.length * 0.95)] ?? null,
            maxGapMs: gaps.at(-1) ?? null,
          },
          mainThreadLongTasks: observer
            ? { count: longTasks.length, maxMs: Math.max(0, ...longTasks) }
            : null,
          pageJsHeapObservedMaxBytes: heap.length ? Math.max(...heap) : null,
        },
      });
    };
    const timer = setTimeout(() => {
      worker.terminate();
      finish({ timeout: true });
    }, budgetMs);
    cancelCurrent = () => {
      worker.terminate();
      finish({ cancelled: true });
    };
    worker.onmessage = ({ data }) => {
      if (data.type === 'checkpoint') checkpoint = data.checkpoint;
      if (data.type === 'progress') {
        lastProgress = data.progress;
        status.textContent = `${label} · ${data.progress.message}`;
      }
      if (data.type === 'result') finish({ result: data.result, cache: data.cache });
      if (data.type === 'error') finish({ error: data.error, cache: data.cache });
    };
    worker.onerror = (e) => finish({ error: e.message });
    worker.postMessage({ study });
  });
}
const references = new Map();
async function summarize(s, outcome, spec) {
  const { result: r, checkpoint, measurement, ...other } = outcome;
  const value = { ...other, ...measurement };
  if (!r) {
    value.backend = checkpoint?.backends?.join(' + ') ?? 'Not captured';
    value.cachedPoses = checkpoint?.cached ?? null;
    return value;
  }
  value.solverSeconds = r.seconds;
  value.backend = r.backend;
  value.completedDays = r.daily.length;
  value.completedMonths = r.monthly.length;
  value.cachedPoses = r.cached;
  value.meanSunlight = r.meanSunlight;
  value.meanDli = r.meanDli;
  value.openWh = r.openWh;
  value.warnings = r.warnings;
  const validationStart = performance.now();
  try {
    await validateResult(s, r);
    value.resultValidation = 'passed';
  } catch (e) {
    value.resultValidation = e.message;
  }
  value.validationSecondsExcludedFromTiming = (performance.now() - validationStart) / 1000;
  if (spec.size === 'typical') {
    const reference = references.get(spec.mode);
    if (reference) {
      value.agreementWithFirstGpu = {
        maxWhDifference: 0,
        maxDliDifference: 0,
        maxSunlightDifference: 0,
      };
      r.cells.forEach((c, i) => {
        value.agreementWithFirstGpu.maxWhDifference = Math.max(
          value.agreementWithFirstGpu.maxWhDifference,
          Math.abs(c.wh - reference[i].wh),
        );
        value.agreementWithFirstGpu.maxDliDifference = Math.max(
          value.agreementWithFirstGpu.maxDliDifference,
          Math.abs(c.dli - reference[i].dli),
        );
        value.agreementWithFirstGpu.maxSunlightDifference = Math.max(
          value.agreementWithFirstGpu.maxSunlightDifference,
          Math.abs(c.sunlight - reference[i].sunlight),
        );
      });
    } else if (spec.backend === 'gpu') references.set(spec.mode, r.cells);
  }
  return value;
}
async function benchmark(spec, index) {
  await clearCache();
  const s = makeStudy(spec),
    d = dimensions(s),
    g = receiverGridSpec(s);
  const label = `${index + 1}/${cases.length} · ${d.modules} modules / ${g.nx * g.ny} receivers · ${s.racking.type} · ${spec.mode === 'year' ? 'year' : 'June'} · ${spec.backend}`;
  const entry = {
    label,
    spec,
    modules: d.modules,
    receivers: g.nx * g.ny,
    areaM2: d.footprintX * d.footprintY,
    nominalSpacing: s.analysis.resolution,
    patches: s.analysis.patches,
    intervalMinutes: s.analysis.interval,
    period: analysisPeriod(s),
    optics: moduleOptics(s.module),
    study: s,
  };
  const worker = new Worker(new URL('./period-performance-worker.js', import.meta.url), {
    type: 'module',
  });
  status.textContent = label;
  try {
    await ready(worker);
    entry.cold = await summarize(s, await solve(worker, s, label), spec);
    publish();
    if (
      spec.repeat &&
      !stopped &&
      !entry.cold.error &&
      !entry.cold.timeout &&
      !entry.cold.cancelled
    )
      entry.warm = await summarize(s, await solve(worker, s, label + ' · repeat'), spec);
  } catch (e) {
    entry.error = e.message;
  } finally {
    worker.terminate();
  }
  report.solves.push(entry);
  publish();
}
run.onclick = async () => {
  cases = suite.value === 'cpu-dense' ? cpuCases : standardCases;
  suite.disabled = true;
  stopped = false;
  run.disabled = true;
  stop.disabled = false;
  references.clear();
  report = {
    createdAt: new Date().toISOString(),
    version: VERSION,
    suite: suite.value,
    budgetSeconds: budgetMs / 1000,
    environment: await environment(),
    scope:
      'Sequential actual browser worker solves, June 2024 (30 days) and full leap year 2024 (366 days), bifacial area-averaged transmission. Actual production IndexedDB/memory cache reset before each cold case; optional warm repeat. Includes checkpoint/result transfer. Excludes worker imports, network weather, result validation, full application rendering and export. Page JS heap is not total browser/worker/GPU memory. A timeout is not a hardware limit.',
    solves: [],
  };
  publish();
  try {
    for (const [i, spec] of cases.entries()) {
      if (stopped) break;
      await benchmark(spec, i);
    }
    report.completed = !stopped;
    status.textContent = stopped
      ? 'Stopped; partial results retained'
      : 'Period benchmarks complete';
  } catch (e) {
    report.error = e.message;
    status.textContent = e.message;
  } finally {
    report.finishedAt = new Date().toISOString();
    publish();
    run.disabled = false;
    suite.disabled = false;
    stop.disabled = true;
    document.getElementById('download').disabled = false;
  }
};
stop.onclick = () => {
  stopped = true;
  cancelCurrent?.();
};
document.getElementById('download').onclick = () => {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    ),
    a = document.createElement('a');
  a.href = url;
  a.download =
    suite.value === 'cpu-dense'
      ? 'bifacial-period-performance-cpu.json'
      : 'bifacial-period-performance.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Preserve completed/partial observations across an accidental reload of this fixture.
try {
  const saved = sessionStorage.getItem('aed-period-benchmark-report');
  if (saved) {
    report = JSON.parse(saved);
    out.textContent = saved;
    suite.value = report.suite ?? 'standard';
    document.getElementById('download').disabled = false;
    status.textContent = 'Previous benchmark observations restored; start a run to replace them.';
  }
} catch {}
