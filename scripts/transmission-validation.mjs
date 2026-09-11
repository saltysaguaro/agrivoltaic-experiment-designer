import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import * as THREE from 'three';
import { simulationGeometry, disposeGroup } from '../src/domain/geometry.js';
import { CpuBvhIrradianceEngine } from '../src/irradiance/cpu.js';
const version = spawnSync('rtrace', ['-version'], { encoding: 'utf8' });
if (version.error) {
  console.error('Radiance unavailable; transmission comparison NOT run.');
  process.exit(2);
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'aed-transmission-'));
const report = {
  createdAt: new Date().toISOString(),
  radiance: version.stdout.trim() || version.stderr.trim(),
  scope:
    'Independent Radiance trans-material comparison for constant transmission through one/two modules and opaque support. Uniform unit-radiance environment, no ambient bounces. Interior rays only: does not validate fine cell patterns, angular glass optics, daily sky or field measurements.',
  cases: [],
};
try {
  for (const tau of [0, 0.2, 0.8, 1])
    for (const layers of [1, 2]) {
      const group = new THREE.Group();
      group.userData.transmitting = true;
      let rad = `void trans laminate\n0\n0\n7 1 1 1 0 0 ${tau} 1\nvoid plastic opaque\n0\n0\n5 0 0 0 0 0\nvoid glow sky\n0\n0\n4 1 1 1 0\nsky source environment\n0\n0\n4 0 0 1 360\n`;
      for (let k = 0; k < layers; k++) {
        const z = 2 + 2 * k,
          m = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.01));
        m.position.z = z;
        m.userData.kind = 'module';
        group.add(m);
        rad += `laminate polygon module_${k}\n0\n0\n12 -1 -1 ${z} 1 -1 ${z} 1 1 ${z} -1 1 ${z}\n`;
      }
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1));
      post.position.set(3, 0, 0.5);
      post.userData.kind = 'post';
      group.add(post);
      group.updateMatrixWorld(true);
      rad += 'opaque polygon post_top\n0\n0\n12 2.9 -.1 1 3.1 -.1 1 3.1 .1 1 2.9 .1 1\n';
      const geometry = simulationGeometry(group),
        cpu = new CpuBvhIrradianceEngine();
      await cpu.initializeGeometry(geometry);
      const points = [
          { x: 0, y: 0, z: 0 },
          { x: -0.5, y: 0, z: 0 },
          { x: 3, y: 0, z: 0 },
          { x: 5, y: 0, z: 0 },
        ],
        dirs = [new THREE.Vector3(0, 0, 1)];
      const counts = await cpu.visibility(points, dirs),
        expected = [...counts].map((n) => (n === 65535 ? 0 : tau ** n));
      const file = path.join(temp, 'scene.rad'),
        oct = path.join(temp, 'scene.oct');
      fs.writeFileSync(file, rad);
      const compile = spawnSync('oconv', [file]);
      if (compile.status !== 0) throw Error(compile.stderr.toString());
      fs.writeFileSync(oct, compile.stdout);
      const trace = spawnSync(
        'rtrace',
        ['-h', '-ov', '-ab', '0', '-lr', '12', '-lw', '0.0000001', oct],
        {
          encoding: 'utf8',
          input: points.map((p) => `${p.x} ${p.y} ${p.z} 0 0 1`).join('\n') + '\n',
        },
      );
      if (trace.status !== 0) throw Error(trace.stderr);
      const actual = trace.stdout
        .trim()
        .split(/\n/)
        .map((line) => Number(line.trim().split(/\s+/)[0]));
      const error = Math.max(...actual.map((v, i) => Math.abs(v - expected[i])));
      report.cases.push({
        tau,
        layers,
        rays: points.length,
        expected,
        radiance: actual,
        maxDifference: error,
      });
      cpu.dispose();
      geometry.dispose();
      disposeGroup(group);
      if (actual.length !== expected.length || !Number.isFinite(error) || error > 1e-5)
        throw Error('Radiance transmission mismatch');
    }
  report.passed = true;
} catch (e) {
  report.passed = false;
  report.error = e.message;
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
  fs.writeFileSync(
    'docs/transmission-radiance-validation.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report, null, 2));
}
