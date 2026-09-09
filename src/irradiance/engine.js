import {
  buildGeometry,
  simulationGeometry,
  disposeGroup,
  receiverGrid,
  getPose,
} from '../domain/geometry.js';
import { analysisKey, sha256, VERSION, designIssues } from '../domain/study.js';
import { solarPosition, sampleWeather, spitters } from './solar.js';
import { skyPatches, perezWeights } from './sky.js';
import { CpuBvhIrradianceEngine } from './cpu.js';
import { WebGpuIrradianceEngine } from './gpu.js';
import { getCached, putCached } from './cache.js';
const sum = (a) => a.reduce((n, v) => n + v, 0);
export function integrateSources(s) {
  if (s.weather.mode === 'automatic' && !s.weather.rows.length)
    throw Error(
      'Download site weather before calculating, or choose the illustrative weather option.',
    );
  if (s.weather.mode === 'upload' && !s.weather.rows.length)
    throw Error('Upload a complete day of weather before calculating.');
  const weather = s.weather.rows.length ? s.weather.rows : sampleWeather(s),
    patches = skyPatches(s.analysis.patches),
    steps = [],
    warnings = [];
  let open = 0,
    diffuse = 0,
    zenith = 0,
    dayMinutes = 0,
    maxClosure = 0;
  let end = 0;
  for (const w of weather) {
    if (w.minute !== end || w.duration <= 0 || w.minute + w.duration > 1440)
      throw Error('Weather must contain contiguous, ordered intervals covering 24 hours.');
    end = w.minute + w.duration;
  }
  if (end !== 1440) throw Error('A complete 24-hour weather day is required.');
  if (weather.some((w) => w.ppfd !== undefined) && weather.some((w) => w.ppfd === undefined))
    throw Error('PPFD must be supplied for every interval or omitted.');
  for (const w of weather) {
    if (w.dhi > w.ghi) throw Error('DHI exceeds GHI.');
    const sub = [];
    for (let start = w.minute; start < w.minute + w.duration; start += s.analysis.interval) {
      const duration = Math.min(s.analysis.interval, w.minute + w.duration - start),
        sun = solarPosition(s.analysis.date, start + duration / 2, s.site);
      sub.push({ sun, duration });
      if (sun.z > 0) {
        zenith += ((Math.acos(sun.z) * 180) / Math.PI) * duration;
        dayMinutes += duration;
      }
    }
    const cosIntegral = sum(sub.map((v) => Math.max(0, v.sun.z) * v.duration)),
      directEnergy = ((w.ghi - w.dhi) * w.duration) / 60;
    open += (w.ghi * w.duration) / 60;
    diffuse += (w.dhi * w.duration) / 60;
    maxClosure = Math.max(maxClosure, Math.abs((w.dni * cosIntegral) / w.duration + w.dhi - w.ghi));
    if (directEnergy > 1e-5 && cosIntegral === 0)
      throw Error(
        'Weather has direct energy while the modeled sun is below the horizon. Check date, coordinates and UTC offset.',
      );
    for (const v of sub) {
      const direct = cosIntegral
          ? (directEnergy * Math.max(0, v.sun.z) * v.duration) / cosIntegral
          : 0,
        dh = (w.dhi * v.duration) / 60;
      steps.push({
        ...v,
        direct,
        diffuse: dh,
        dni: w.dni,
        ppfd: w.ppfd,
        diffusePpfd: w.diffusePpfd,
        weather: w,
      });
    }
  }
  if (open <= 0) throw Error('The selected day has no incoming solar energy.');
  if (maxClosure > 10)
    warnings.push(
      `GHI closure: supplied DNI differs by up to ${maxClosure.toFixed(1)} W/m². Direct horizontal energy is normalized to GHI − DHI.`,
    );
  if (!s.weather.rows.length)
    warnings.push(
      'Synthetic illustrative weather; replace with measured or modeled site weather before publication.',
    );
  const fraction = spitters(dayMinutes ? zenith / dayMinutes : 90, diffuse / open);
  let openDli = 0;
  const totalDirect = open - diffuse;
  for (const v of steps) {
    const measured = v.ppfd !== undefined;
    if (measured) {
      const fd = v.diffusePpfd !== undefined ? (v.ppfd ? v.diffusePpfd / v.ppfd : 0) : fraction;
      const total = (v.ppfd * v.duration * 60) / 1e6;
      v.parDiffuse = total * fd;
      const w = v.weather;
      const wCos = sum(
        steps.filter((q) => q.weather === w).map((q) => Math.max(0, q.sun.z) * q.duration),
      );
      v.parDirect = wCos
        ? (((v.ppfd * (1 - fd) * w.duration * 60) / 1e6) * Math.max(0, v.sun.z) * v.duration) / wCos
        : 0;
      if (!wCos && total * (1 - fd) > 1e-8)
        throw Error(
          'Measured direct PPFD occurs below the horizon. Check timestamps or provide diffuse_PPFD.',
        );
    } else {
      const total = (open * s.analysis.parFraction * s.analysis.photonFactor * 3600) / 1e6;
      v.parDiffuse = diffuse ? (total * fraction * v.diffuse) / diffuse : 0;
      v.parDirect = totalDirect ? (total * (1 - fraction) * v.direct) / totalDirect : 0;
    }
    openDli += v.parDiffuse + v.parDirect;
  }
  const measured = weather.every((w) => w.ppfd !== undefined);
  if (measured && weather.some((w) => w.diffusePpfd === undefined))
    warnings.push(
      'Measured total PPFD partitioned using daily Spitters diffuse fraction; provide diffuse_PPFD to avoid estimated partition.',
    );
  if (!measured && dayMinutes && 90 - zenith / dayMinutes < 10)
    warnings.push('Low mean solar elevation: the default broadband-to-PAR fraction is uncertain.');
  return { steps, patches, open, openDli, measured, warnings };
}
export async function calculateDay(s, onProgress = () => {}) {
  const issues = designIssues(s);
  if (issues.length) throw Error(issues.join(' '));
  const start = performance.now(),
    source = integrateSources(s),
    grid = receiverGrid(s),
    energy = new Float64Array(grid.points.length),
    dli = new Float64Array(grid.points.length),
    warnings = [...source.warnings];
  let engine, backend;
  try {
    if (s.analysis.backend === 'cpu') throw Error('CPU selected');
    engine = await WebGpuIrradianceEngine.create();
  } catch (e) {
    if (s.analysis.backend === 'gpu')
      warnings.push(`WebGPU unavailable (${e.message}); used CPU reference.`);
    engine = new CpuBvhIrradianceEngine();
  }
  backend = engine.name;
  let currentGeometry = null,
    currentPose = null;
  async function initialize(pose) {
    if (currentPose === pose.key) return;
    currentPose = pose.key;
    if (currentGeometry) currentGeometry.dispose();
    const group = buildGeometry(s, 'array', pose);
    currentGeometry = simulationGeometry(group);
    disposeGroup(group);
    await engine.initializeGeometry(currentGeometry);
  }
  async function visibility(directions) {
    try {
      return await engine.visibility(grid.points, directions);
    } catch (e) {
      if (engine.name === 'CPU MeshBVH') throw e;
      engine.dispose();
      warnings.push(`GPU execution failed; CPU fallback used: ${e.message}`);
      engine = new CpuBvhIrradianceEngine();
      backend = 'WebGPU + CPU fallback';
      await engine.initializeGeometry(currentGeometry);
      return engine.visibility(grid.points, directions);
    }
  }
  const geometryHash = await sha256(
    JSON.stringify([
      VERSION,
      s.module,
      s.racking,
      s.table,
      s.row,
      s.rowPair,
      s.array,
      s.analysis.resolution,
      s.analysis.receiverHeight,
      s.analysis.patches,
    ]),
  );
  let cached = 0;
  try {
    const groups = new Map();
    for (const step of source.steps) {
      if (!step.direct && !step.diffuse && !step.parDiffuse && !step.parDirect) continue;
      const pose = getPose(s, step.sun, true);
      if (!groups.has(pose.key))
        groups.set(pose.key, {
          pose,
          sky: new Float64Array(source.patches.length),
          par: new Float64Array(source.patches.length),
        });
      const group = groups.get(pose.key),
        weights = perezWeights(
          source.patches,
          step.sun,
          step.dni,
          Math.max(0.001, step.weather.dhi),
        ).map((w) => w / Math.max(0.001, step.weather.dhi));
      weights.forEach((v, j) => {
        group.sky[j] += v * step.diffuse;
        group.par[j] += v * step.parDiffuse;
      });
    }
    let done = 0,
      total = groups.size + source.steps.filter((v) => v.direct || v.parDirect).length;
    for (const group of groups.values()) {
      const key = `${geometryHash}:${engine.name}:${group.pose.key}`,
        existing = await getCached(key);
      let bits = existing;
      if (bits) cached++;
      else {
        await initialize(group.pose);
        bits = await visibility(source.patches.map((p) => p.direction));
        await putCached(key, bits);
      }
      const words = Math.ceil(source.patches.length / 32);
      for (let i = 0; i < grid.points.length; i++)
        for (let j = 0; j < source.patches.length; j++)
          if (bits[i * words + (j >>> 5)] & (1 << (j & 31))) {
            energy[i] += group.sky[j];
            dli[i] += group.par[j];
          }
      onProgress({ progress: ++done / total, message: 'Integrating diffuse sky' });
    }
    for (const step of source.steps) {
      if (!step.direct && !step.parDirect) continue;
      await initialize(getPose(s, step.sun));
      const bits = await visibility([step.sun]);
      for (let i = 0; i < grid.points.length; i++)
        if (bits[i] & 1) {
          energy[i] += step.direct;
          dli[i] += step.parDirect;
        }
      onProgress({ progress: ++done / total, message: 'Tracing moving direct shadows' });
    }
    const cells = grid.points.map((p, i) => ({
      ...p,
      wh: energy[i],
      sunlight: Math.max(0, Math.min(100, (100 * energy[i]) / source.open)),
      shade: Math.max(0, Math.min(100, 100 * (1 - energy[i] / source.open))),
      dli: dli[i],
    }));
    return {
      key: analysisKey(s),
      studyHash: await sha256(analysisKey(s)),
      weatherHash: s.weather.hash || (await sha256(JSON.stringify(sampleWeather(s)))),
      date: s.analysis.date,
      cells,
      grid: { ...grid, points: undefined },
      openWh: source.open,
      openDli: source.openDli,
      estimated: !source.measured,
      backend,
      version: VERSION,
      createdAt: new Date().toISOString(),
      seconds: (performance.now() - start) / 1000,
      cached,
      warnings,
      meanSunlight: sum(cells.map((c) => c.sunlight)) / cells.length,
      meanShade: sum(cells.map((c) => c.shade)) / cells.length,
      meanDli: sum(cells.map((c) => c.dli)) / cells.length,
    };
  } finally {
    engine.dispose();
    currentGeometry?.dispose();
  }
}
