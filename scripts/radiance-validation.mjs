import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Vector3 } from 'three';
import { defaultStudy } from '../src/domain/study.js';
import {
  buildGeometry,
  simulationGeometry,
  disposeGroup,
  getPose,
} from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
import { skyPatches, perezWeights } from '../src/irradiance/sky.js';
const probe = spawnSync('rtrace', ['-version'], { encoding: 'utf8' });
if (probe.error) {
  console.error('Radiance is unavailable. Install rtrace and oconv; comparison was NOT run.');
  process.exit(2);
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'fieldwork-radiance-'));
const cases = [
  ['single-module', 'fixed', 'racking'],
  ['finite-row', 'fixed', 'row'],
  ['two-rows', 'fixed', 'pair'],
  ['array-centre-edge-corner', 'fixed', 'array'],
  ['vertical-bifacial', 'vertical', 'array'],
  ['single-axis-morning', 'single-axis', 'array'],
  ['single-axis-afternoon', 'single-axis', 'array'],
  ['dual-axis', 'dual-axis', 'array'],
  ['pergola', 'pergola', 'array'],
];
const results = [];
try {
  for (const [name, type, scope] of cases) {
    const s = defaultStudy();
    s.table.wide = 3;
    s.row.tables = 1;
    s.array.rows = 4;
    s.racking.type = type;
    const sun = new Vector3(0.3, name.includes('afternoon') ? 0.75 : -0.75, 0.55).normalize(),
      group = buildGeometry(s, scope, getPose(s, sun)),
      geometry = simulationGeometry(group);
    disposeGroup(group);
    const p = geometry.attributes.position,
      index = geometry.index;
    let rad = 'void plastic opaque\n0\n0\n5 0 0 0 0 0\n';
    for (let i = 0; i < index.count; i += 3) {
      const values = [];
      for (let k = 0; k < 3; k++) {
        const j = index.getX(i + k);
        values.push(p.getX(j), p.getY(j), p.getZ(j));
      }
      rad += `opaque polygon triangle_${i / 3}\n0\n0\n9 ${values.join(' ')}\n`;
    }
    const scene = path.join(temp, name + '.rad'),
      oct = path.join(temp, name + '.oct');
    fs.writeFileSync(scene, rad);
    const compile = spawnSync('oconv', [scene], { maxBuffer: 32 * 1024 * 1024 });
    if (compile.status !== 0) throw Error(compile.stderr.toString());
    fs.writeFileSync(oct, compile.stdout);
    const points = [];
    for (const x of [-5.13, -1.17, 0.137, 1.77, 5.27])
      for (const y of [-18.37, -12.137, -4.173, 0.213, 4.137, 12.313, 18.197])
        points.push({ x, y, z: 0.2 });
    const patches = skyPatches(145),
      directions = [sun, ...patches.map((p) => p.direction)],
      rays =
        points
          .flatMap((p) => directions.map((d) => `${p.x} ${p.y} ${p.z + 1e-5} ${d.x} ${d.y} ${d.z}`))
          .join('\n') + '\n';
    const trace = spawnSync('rtrace', ['-h-', '-w-', '-ab', '0', '-oL', oct], {
      input: rays,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    if (trace.status !== 0) throw Error(trace.stderr);
    const distances = trace.stdout.trim().split(/\s+/).map(Number);
    if (distances.length !== points.length * directions.length)
      throw Error('Unexpected rtrace result count');
    const cpu = new CpuBvhIrradianceEngine();
    await cpu.initializeGeometry(geometry);
    const bits = await cpu.visibility(points, directions),
      words = Math.ceil(directions.length / 32);
    let differences = 0,
      maxIrradianceError = 0;
    const weights = perezWeights(patches, sun, 800, 120);
    for (let i = 0; i < points.length; i++) {
      let cpuW = 0,
        radW = 0;
      for (let j = 0; j < directions.length; j++) {
        const cv = Boolean(bits[i * words + (j >>> 5)] & (1 << (j & 31))),
          rv = distances[i * directions.length + j] >= 1e9;
        if (cv !== rv) differences++;
        const w = j === 0 ? 800 * sun.z : weights[j - 1];
        cpuW += cv ? w : 0;
        radW += rv ? w : 0;
      }
      maxIrradianceError = Math.max(maxIrradianceError, Math.abs(cpuW - radW));
    }
    results.push({
      case: name,
      rays: distances.length,
      visibilityMismatches: differences,
      maxIrradianceError_W_m2: maxIrradianceError,
    });
    console.log(name, results.at(-1));
    geometry.dispose();
    cpu.dispose();
  }
  const report = {
    createdAt: new Date().toISOString(),
    radiance: probe.stdout.trim() || probe.stderr.trim(),
    scope:
      'CPU MeshBVH versus Radiance first-hit occlusion, identical finite triangulated geometry and sky/sun directions. Irradiance uses shared Perez weights. This does NOT independently validate Perez sky, solar position, multi-bounce reflection, daily integration, or WebGPU.',
    results,
  };
  fs.writeFileSync('docs/radiance-validation.json', JSON.stringify(report, null, 2) + '\n');
  if (results.some((r) => r.visibilityMismatches)) process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
