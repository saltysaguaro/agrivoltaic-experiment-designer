import { gridMean } from '../domain/receiver-grid.js';
import { moduleOptics, opticalAssumptions } from '../domain/optics.js';
import { validateWeatherRows, canonicalWeatherRows } from './weather-validation.js';
import { verifyWeatherRecord } from './weather-record.js';
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
export function integrateSources(s, { allowZero = false } = {}) {
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
  validateWeatherRows(weather);
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
        weatherCos: cosIntegral,
      });
    }
  }
  if (open <= 0 && !allowZero) throw Error('The selected day has no incoming solar energy.');
  if (maxClosure > 10)
    warnings.push(
      `GHI closure: supplied DNI differs by up to ${maxClosure.toFixed(1)} W/m². Direct horizontal energy is normalized to GHI − DHI.`,
    );
  if (!s.weather.rows.length)
    warnings.push(
      'Synthetic illustrative weather; replace with measured or modeled site weather before publication.',
    );
  const fraction = spitters(dayMinutes ? zenith / dayMinutes : 90, open ? diffuse / open : 1);
  let openDli = 0;
  const totalDirect = open - diffuse;
  for (const v of steps) {
    const measured = v.ppfd !== undefined;
    if (measured) {
      const fd = v.diffusePpfd !== undefined ? (v.ppfd ? v.diffusePpfd / v.ppfd : 0) : fraction;
      const total = (v.ppfd * v.duration * 60) / 1e6;
      v.parDiffuse = total * fd;
      const w = v.weather;
      const wCos = v.weatherCos;
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
export async function calculateDay(
  s,
  onProgress = () => {},
  {
    createGpu = () => WebGpuIrradianceEngine.create(),
    diffusePoseStep = 2,
    allowZero = false,
    cache = { get: getCached, put: putCached },
  } = {},
) {
  const issues = designIssues(s);
  if (issues.length) throw Error(issues.join(' '));
  await verifyWeatherRecord(s.weather);
  const start = performance.now(),
    source = integrateSources(s, { allowZero }),
    grid = receiverGrid(s),
    energy = new Float64Array(grid.points.length),
    dli = new Float64Array(grid.points.length),
    warnings = [...source.warnings];
  const optics = moduleOptics(s.module),
    transmitting = optics.broadband > 0 || optics.par > 0;
  const weights = transmitting
    ? [optics.broadband, optics.par].map((t) =>
        Float64Array.from({ length: 65536 }, (_, n) => (n === 65535 ? 0 : t ** n)),
      )
    : null;
  if (s.module.bifacial) warnings.push(opticalAssumptions(s));
  let engine, backend;
  try {
    if (s.analysis.backend === 'cpu') throw Error('CPU selected');
    engine = await createGpu();
  } catch (e) {
    if (s.analysis.backend === 'gpu')
      warnings.push(`WebGPU unavailable (${e.message}); used CPU reference.`);
    engine = new CpuBvhIrradianceEngine();
  }
  backend = engine.name;
  async function fallback(error) {
    if (engine.name === 'CPU MeshBVH') throw error;
    engine.dispose();
    warnings.push(`GPU execution failed; CPU fallback used: ${error.message}`);
    engine = new CpuBvhIrradianceEngine();
    backend = 'WebGPU + CPU fallback';
    await engine.initializeGeometry(currentGeometry);
  }
  const timings = { geometryMs: 0, visibilityMs: 0 };
  let currentGeometry = null,
    currentPose = null;
  async function initialize(pose) {
    if (currentPose === pose.key) return;
    const started = performance.now();
    currentPose = pose.key;
    if (currentGeometry) currentGeometry.dispose();
    const group = buildGeometry(s, 'array', pose, { textures: false });
    currentGeometry = simulationGeometry(group);
    disposeGroup(group);
    try {
      await engine.initializeGeometry(currentGeometry);
    } catch (error) {
      await fallback(error);
    }
    timings.geometryMs += performance.now() - started;
  }
  async function visibility(directions) {
    const started = performance.now();
    try {
      return await engine.visibility(grid.points, directions);
    } catch (e) {
      await fallback(e);
      return await engine.visibility(grid.points, directions);
    } finally {
      timings.visibilityMs += performance.now() - started;
    }
  }
  const geometryHash = await sha256(
    JSON.stringify([
      VERSION,
      diffusePoseStep,
      s.module,
      s.racking,
      s.table,
      s.row,
      s.rowPair,
      s.array,
      s.analysis.resolution,
      s.analysis.receiverHeight,
      s.analysis.patches,
      ...(s.analysis.gridAlignment === 'row-centres'
        ? ['row-centres', s.analysis.cellsPerRow ?? 9]
        : []),
    ]),
  );
  let cached = 0;
  try {
    const groups = new Map();
    for (const step of source.steps) {
      if (!step.direct && !step.diffuse && !step.parDiffuse && !step.parDirect) continue;
      const pose = getPose(s, step.sun, diffusePoseStep);
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
      total =
        groups.size * source.patches.length +
        source.steps.filter((v) => v.direct || v.parDirect).length;
    for (const group of groups.values()) {
      const key = `${geometryHash}:${engine.name}:${group.pose.key}`,
        existing = await cache.get(key).catch(() => null);
      let bits = existing;
      if (bits) cached++;
      else {
        await initialize(group.pose);
        bits = await visibility(source.patches.map((p) => p.direction));
        // The backend may change after a failed GPU dispatch. Do not label CPU
        // visibility as GPU data in a later run.
        await cache.put(`${geometryHash}:${engine.name}:${group.pose.key}`, bits).catch(() => {});
      }
      const words = Math.ceil(source.patches.length / 32);
      for (let i = 0; i < grid.points.length; i++)
        for (let j = 0; j < source.patches.length; j++)
          if (transmitting) {
            const n = bits[i * source.patches.length + j];
            energy[i] += group.sky[j] * weights[0][n];
            dli[i] += group.par[j] * weights[1][n];
          } else if (bits[i * words + (j >>> 5)] & (1 << (j & 31))) {
            energy[i] += group.sky[j];
            dli[i] += group.par[j];
          }
      done += source.patches.length;
      onProgress({
        progress: done / total,
        message: `${engine.name}: integrating diffuse sky (${cached} cached poses)`,
      });
    }
    for (const step of source.steps) {
      if (!step.direct && !step.parDirect) continue;
      await initialize(getPose(s, step.sun));
      const bits = await visibility([step.sun]);
      for (let i = 0; i < grid.points.length; i++)
        if (transmitting) {
          energy[i] += step.direct * weights[0][bits[i]];
          dli[i] += step.parDirect * weights[1][bits[i]];
        } else if (bits[i] & 1) {
          energy[i] += step.direct;
          dli[i] += step.parDirect;
        }
      onProgress({ progress: ++done / total, message: 'Tracing moving direct shadows' });
    }
    const cells = grid.points.map((p, i) => ({
      ...p,
      wh: energy[i],
      sunlight: Math.max(0, Math.min(100, source.open ? (100 * energy[i]) / source.open : 100)),
      shade: Math.max(0, Math.min(100, source.open ? 100 * (1 - energy[i] / source.open) : 0)),
      dli: dli[i],
    }));
    return {
      key: analysisKey(s),
      studyHash: await sha256(analysisKey(s)),
      weatherHash:
        s.weather.hash ||
        (await sha256(
          canonicalWeatherRows(s.weather.rows.length ? s.weather.rows : sampleWeather(s)),
        )),
      weatherInputHash: await sha256(
        canonicalWeatherRows(s.weather.rows.length ? s.weather.rows : sampleWeather(s)),
      ),
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
      timings,
      warnings,
      meanSunlight: gridMean(cells, grid, 'sunlight'),
      meanShade: gridMean(cells, grid, 'shade'),
      meanDli: gridMean(cells, grid, 'dli'),
    };
  } finally {
    engine.dispose();
    currentGeometry?.dispose();
  }
}
