import { defaultStudy, selectRacking } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { calculateStudy } from '../src/irradiance/period-engine.js';
import { validateResult } from '../src/project/results.js';
import { WebGpuIrradianceEngine } from '../src/irradiance/gpu.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { simulationGeometry, disposeGroup } from '../src/domain/geometry.js';
import * as THREE from 'three';
const cache = { get: async () => null, put: async () => {} };
self.onmessage = async () => {
  const report = {
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    scope:
      'Synthetic tests: shared solar/sky model, actual CPU/GPU module-count and daily-result parity; calendar-year CPU browser solve. Not independent field validation.',
    cases: [],
  };
  try {
    const group = new THREE.Group();
    group.userData.transmitting = true;
    for (const z of [2, 4]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1));
      m.position.z = z;
      m.userData.kind = 'module';
      group.add(m);
    }
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1));
    post.position.set(3, 0, 0.5);
    post.userData.kind = 'post';
    group.add(post);
    group.updateMatrixWorld(true);
    const geometry = simulationGeometry(group),
      cpu = new CpuBvhIrradianceEngine(),
      gpu = await WebGpuIrradianceEngine.create();
    await cpu.initializeGeometry(geometry);
    await gpu.initializeGeometry(geometry);
    const points = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 3, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ],
      dirs = [new THREE.Vector3(0, 0, 1)];
    const a = [...(await cpu.visibility(points, dirs))],
      b = [...(await gpu.visibility(points, dirs))];
    if (JSON.stringify(a) !== JSON.stringify(b) || JSON.stringify(a) !== '[2,2,2,65535,0]')
      throw Error('Module intersection-count mismatch: ' + JSON.stringify({ a, b }));
    report.cases.push({
      type: 'module counts at centre, edge, corner and opaque support',
      cpu: a,
      gpu: b,
    });
    cpu.dispose();
    gpu.dispose();
    geometry.dispose();
    disposeGroup(group);
    for (const type of [
      'fixed',
      'single-axis',
      'dual-axis',
      'vertical',
      'pergola',
      'tiled-fixed',
    ]) {
      self.postMessage({ message: 'Checking transmitting ' + type, report });
      let s = defaultStudy();
      s.table.high = 1;
      s.table.wide = 2;
      s.row.tables = 1;
      s.array.rows = 2;
      s.analysis.resolution = 2;
      s.analysis.patches = 145;
      s.analysis.interval = 15;
      s.weather.mode = 'sample';
      s.module.bifacial = true;
      s.module.cellGapX = 0.05;
      s.module.cellGapY = 0.02;
      s.module.gapTransmission = 0.9;
      s.module.gapParTransmission = 0.7;
      s = selectRacking(s, type === 'tiled-fixed' ? 'fixed' : type);
      if (type === 'tiled-fixed') {
        s.analysis.resolution = 0.25;
        s.analysis.patches = 2305;
      }
      s.analysis.backend = 'cpu';
      const cpu = await calculateDay(s, () => {}, { cache });
      s.analysis.backend = 'gpu';
      const gpu = await calculateDay(s, () => {}, { cache });
      if (gpu.backend !== 'WebGPU BVH') throw Error('GPU fallback: ' + gpu.warnings.join('; '));
      let wh = 0,
        dli = 0,
        sunlight = 0;
      cpu.cells.forEach((c, i) => {
        wh = Math.max(wh, Math.abs(c.wh - gpu.cells[i].wh));
        dli = Math.max(dli, Math.abs(c.dli - gpu.cells[i].dli));
        sunlight = Math.max(sunlight, Math.abs(c.sunlight - gpu.cells[i].sunlight));
      });
      if (wh > 0.1 || dli > 0.001)
        throw Error('Daily parity tolerance exceeded: ' + JSON.stringify({ wh, dli, sunlight }));
      report.cases.push({
        type,
        receivers: cpu.cells.length,
        backend: gpu.backend,
        cpuSeconds: cpu.seconds,
        gpuSeconds: gpu.seconds,
        maxWhDifference: wh,
        maxDliDifference: dli,
        maxSunlightDifference: sunlight,
      });
    }
    const s = defaultStudy();
    s.table.high = 1;
    s.table.wide = 1;
    s.row.tables = 1;
    s.array.rows = 1;
    s.array.buffer = 0;
    s.module.bifacial = true;
    Object.assign(s.analysis, {
      period: 'year',
      year: 2024,
      date: '2024-01-01',
      resolution: 5,
      patches: 145,
      interval: 15,
      backend: 'cpu',
    });
    s.weather.mode = 'sample';
    const r = await calculateStudy(
      s,
      (p) => {
        if (p.message.includes('Day') && p.progress % 0.05 < 0.003)
          self.postMessage({ message: p.message, report });
      },
      { cache },
    );
    await validateResult(s, r);
    report.cases.push({
      type: 'full leap calendar year',
      days: r.daily.length,
      months: r.monthly.length,
      seconds: r.seconds,
      backend: r.backend,
      receivers: r.cells.length,
      openWh: r.openWh,
      meanDli: r.meanDli,
    });
    report.passed = true;
    self.postMessage({ done: true, message: 'All extension checks passed', report });
  } catch (error) {
    report.passed = false;
    report.error = error.message;
    self.postMessage({ done: true, message: 'Failed: ' + error.message, report });
  }
};
