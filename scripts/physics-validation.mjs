import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Vector3 } from 'three';
import {
  defaultStudy,
  selectRacking,
  dimensions,
  VERSION,
  MODEL_REVISION,
} from '../src/domain/study.js';
import {
  getPose,
  buildGeometry,
  simulationGeometry,
  disposeGroup,
  receiverGrid,
} from '../src/domain/geometry.js';
import { solarPosition } from '../src/irradiance/solar.js';
import { skyPatches, perezWeights } from '../src/irradiance/sky.js';
import { integrateSources, calculateDay } from '../src/irradiance/engine.js';
function run(command, args, input, encoding = 'utf8') {
  const result = spawnSync(command, args, { input, encoding, maxBuffer: 64 * 1024 * 1024 });
  if (result.error || result.status !== 0)
    throw Error(
      `${command} unavailable or failed; comparison NOT passed: ${result.error?.message || result.stderr}`,
    );
  return result.stdout;
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'aed-physics-'));
const report = {
  createdAt: new Date().toISOString(),
  version: VERSION,
  modelRevision: MODEL_REVISION,
  scope:
    'Independent pvlib NREL SPA sun and tracker equations; Radiance gendaylit Perez distributions and finite-array daily integration using the same triangulated geometry and specified sun/poses. Synthetic data; not measured field accuracy. PAR partition and source substep timing are shared with the application; the Radiance comparison isolates sky distribution and occlusion, not an independent PAR conversion model. Diffuse comparisons use identical quadrature and DHI normalization; direct shadows use the application sun separately compared with SPA.',
  solar: [],
  sky: [],
  daily: [],
};
const sites = [
  { latitude: 32.22, longitude: -110.97, utcOffset: -7 },
  { latitude: -33.87, longitude: 151.21, utcOffset: 10 },
  { latitude: 51.97, longitude: 5.67, utcOffset: 1 },
  { latitude: 27.7, longitude: 85.3, utcOffset: 5.75 },
];
try {
  const inputs = [];
  for (const site of sites)
    for (const date of ['2026-03-21', '2026-06-21', '2026-12-21'])
      for (let minute = 0; minute < 1440; minute += 60) {
        const s = selectRacking(defaultStudy(), 'single-axis');
        s.site = { ...s.site, ...site };
        const sun = solarPosition(date, minute, site);
        inputs.push({
          site,
          date,
          minute,
          sun: sun.toArray(),
          tilt: getPose(s, sun).tilt,
          gcr: dimensions(s).width / s.rowPair.pitch,
        });
      }
  const reference = JSON.parse(
    run(
      process.env.AED_VALIDATION_PYTHON || 'python3',
      ['scripts/solar-reference.py'],
      JSON.stringify(inputs),
    ),
  );
  report.pvlib = reference.pvlib;
  for (let i = 0; i < inputs.length; i++) {
    const own = inputs[i],
      ref = reference.cases[i];
    report.solar.push({
      site: own.site,
      date: own.date,
      minute: own.minute,
      angularDifferenceDegrees:
        (Math.acos(
          Math.max(-1, Math.min(1, new Vector3(...own.sun).dot(new Vector3(...ref.sun)))),
        ) *
          180) /
        Math.PI,
      trackerDifferenceDegrees:
        ref.trackerTilt === null ? null : Math.abs(own.tilt - ref.trackerTilt),
    });
  }
  const patches = skyPatches(145);
  function radianceWeights(sun, dni, dhi) {
    const altitude = (Math.asin(sun.z) * 180) / Math.PI,
      azimuth = (Math.atan2(-sun.x, -sun.y) * 180) / Math.PI;
    const text = run('gendaylit', [
      '-ang',
      String(altitude),
      String(azimuth),
      '-W',
      String(dni),
      String(dhi),
      '-O',
      '1',
    ]);
    if (/10 0\.00 0\.00/.test(text))
      throw Error('Radiance rejected the Perez parameter range (error sky).');
    const sky =
      text.slice(text.indexOf('void brightfunc skyfunc')) +
      '\nskyfunc glow skyglow\n0\n0\n4 1 1 1 0\nskyglow source sky\n0\n0\n4 0 0 1 180\n';
    fs.writeFileSync(path.join(temp, 'sky.rad'), sky);
    fs.writeFileSync(
      path.join(temp, 'sky.oct'),
      run('oconv', [path.join(temp, 'sky.rad')], undefined, null),
    );
    const rays = patches.map((p) => `0 0 0 ${p.direction.toArray().join(' ')}`).join('\n') + '\n';
    const values = run(
      'rtrace',
      ['-h-', '-w-', '-ab', '0', '-ov', path.join(temp, 'sky.oct')],
      rays,
    )
      .trim()
      .split(/\s+/)
      .map(Number);
    const w = patches.map((p, i) => values[i * 3] * p.direction.z * p.solidAngle),
      sum = w.reduce((a, b) => a + b, 0);
    if (!(sum > 0) || !Number.isFinite(sum)) throw Error('Non-finite Radiance sky weights.');
    return w.map((v) => (v * dhi) / sum);
  }
  for (const altitude of [5, 20, 45, 75])
    for (const [dni, dhi] of [
      [0, 100],
      [300, 200],
      [800, 100],
    ]) {
      const sun = new Vector3(0.3, -0.953939, 0)
        .normalize()
        .multiplyScalar(Math.cos((altitude * Math.PI) / 180));
      sun.z = Math.sin((altitude * Math.PI) / 180);
      let reference;
      try {
        reference = radianceWeights(sun, dni, dhi);
      } catch (error) {
        if (!error.message.includes('error sky')) throw error;
        report.sky.push({ altitude, dni, dhi, compared: false, reason: error.message });
        continue;
      }
      const own = perezWeights(patches, sun, dni, dhi);
      report.sky.push({
        altitude,
        dni,
        dhi,
        compared: true,
        normalizedL1Difference: own.reduce((n, v, i) => n + Math.abs(v - reference[i]), 0) / dhi,
        maxPatchDifference: Math.max(...own.map((v, i) => Math.abs(v - reference[i]))),
      });
    }
  for (const site of sites.slice(0, 2))
    for (const type of ['fixed', 'single-axis', 'dual-axis']) {
      let s = defaultStudy();
      s.site = { ...s.site, ...site };
      s = selectRacking(s, type);
      s.table.high = 1;
      s.table.wide = 2;
      s.row.tables = 1;
      s.array.rows = 2;
      s.array.buffer = 0.5;
      Object.assign(s.analysis, {
        date: '2026-06-21',
        backend: 'cpu',
        patches: 145,
        interval: 15,
        resolution: 3,
        gridAlignment: 'spacing',
      });
      s.weather.mode = 'sample';
      const result = await calculateDay(s, () => {}, { diffusePoseStep: 0.001 }),
        source = integrateSources(s),
        points = receiverGrid(s).points;
      const wh = new Float64Array(points.length),
        dli = new Float64Array(points.length);
      for (const step of source.steps) {
        if (!step.direct && !step.diffuse) continue;
        const group = buildGeometry(s, 'array', getPose(s, step.sun)),
          geometry = simulationGeometry(group);
        disposeGroup(group);
        const p = geometry.attributes.position,
          index = geometry.index;
        let rad = 'void plastic opaque\n0\n0\n5 0 0 0 0 0\n';
        for (let i = 0; i < index.count; i += 3) {
          const v = [];
          for (let k = 0; k < 3; k++) {
            const j = index.getX(i + k);
            v.push(p.getX(j), p.getY(j), p.getZ(j));
          }
          rad += `opaque polygon t${i}\n0\n0\n9 ${v.join(' ')}\n`;
        }
        geometry.dispose();
        fs.writeFileSync(path.join(temp, 'array.rad'), rad);
        fs.writeFileSync(
          path.join(temp, 'array.oct'),
          run('oconv', [path.join(temp, 'array.rad')], undefined, null),
        );
        const directions = [step.sun, ...patches.map((p) => p.direction)],
          rays =
            points
              .flatMap((p) =>
                directions.map((d) => `${p.x} ${p.y} ${p.z + 1e-5} ${d.toArray().join(' ')}`),
              )
              .join('\n') + '\n';
        const distances = run(
          'rtrace',
          ['-h-', '-w-', '-ab', '0', '-oL', path.join(temp, 'array.oct')],
          rays,
        )
          .trim()
          .split(/\s+/)
          .map(Number);
        const weights = radianceWeights(step.sun, step.dni, Math.max(0.001, step.weather.dhi));
        points.forEach((_, i) => {
          if (distances[i * directions.length] >= 1e9) {
            wh[i] += step.direct;
            dli[i] += step.parDirect;
          }
          weights.forEach((w, j) => {
            if (distances[i * directions.length + j + 1] >= 1e9) {
              wh[i] += (w / Math.max(0.001, step.weather.dhi)) * step.diffuse;
              dli[i] += (w / Math.max(0.001, step.weather.dhi)) * step.parDiffuse;
            }
          });
        });
      }
      report.daily.push({
        site,
        type,
        receivers: points.length,
        maxWhDifference: Math.max(...result.cells.map((c, i) => Math.abs(c.wh - wh[i]))),
        maxDliDifference: Math.max(...result.cells.map((c, i) => Math.abs(c.dli - dli[i]))),
        maxSunlightDifferencePercentagePoints: Math.max(
          ...result.cells.map((c, i) => (100 * Math.abs(c.wh - wh[i])) / result.openWh),
        ),
      });
      console.log(site.latitude, type, report.daily.at(-1));
    }
  report.maxSunAngularDifferenceDegrees = Math.max(
    ...report.solar.map((x) => x.angularDifferenceDegrees),
  );
  report.maxTrackerDifferenceDegrees = Math.max(
    ...report.solar.map((x) => x.trackerDifferenceDegrees || 0),
  );
  report.completed = true;
  fs.writeFileSync(
    'docs/independent-physics-validation.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(
    'Independent comparison complete',
    report.maxSunAngularDifferenceDegrees,
    report.maxTrackerDifferenceDegrees,
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
