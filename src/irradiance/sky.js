import { Vector3 } from 'three';
import { coefficients } from './perez-coefficients.js';
export function skyPatches(count = 145) {
  const mf = count === 2305 ? 4 : count === 577 ? 2 : 1,
    base = [30, 30, 24, 24, 18, 12, 6],
    step = Math.PI / 2 / (7 * mf + 0.5),
    out = [];
  for (let row = 0; row < 7 * mf; row++) {
    const low = row * step,
      high = (row + 1) * step,
      alt = (low + high) / 2,
      n = base[Math.floor(row / mf)] * mf;
    for (let j = 0; j < n; j++) {
      const a = (2 * Math.PI * j) / n;
      out.push({
        direction: new Vector3(
          Math.cos(alt) * Math.sin(a),
          Math.cos(alt) * Math.cos(a),
          Math.sin(alt),
        ),
        solidAngle: (2 * Math.PI * (Math.sin(high) - Math.sin(low))) / n,
      });
    }
  }
  out.push({
    direction: new Vector3(0, 0, 1),
    solidAngle: 2 * Math.PI * (1 - Math.sin(7 * mf * step)),
  });
  return out;
}
export function perezWeights(patches, sun, dni, dhi) {
  if (dhi <= 0) return new Float64Array(patches.length);
  const z = Math.acos(Math.max(0.001, sun.z)),
    eps = ((dhi + dni) / dhi + 1.041 * z ** 3) / (1 + 1.041 * z ** 3);
  let cat = [1.065, 1.23, 1.5, 1.95, 2.8, 4.5, 6.2, Infinity].findIndex((v) => eps < v);
  const am = 1 / (Math.max(0.001, sun.z) + 0.50572 * (96.07995 - (z * 180) / Math.PI) ** -1.6364);
  let delta = Math.max(0.01, Math.min(0.6, (dhi * am) / 1367));
  if (eps > 1.065 && eps < 2.8) delta = Math.max(0.2, delta);
  const c = coefficients[cat],
    p = Array.from(
      { length: 5 },
      (_, i) => c[i * 4] + c[i * 4 + 1] * z + delta * (c[i * 4 + 2] + c[i * 4 + 3] * z),
    );
  if (cat === 0) {
    p[2] = Math.exp((delta * (c[8] + c[9] * z)) ** c[10]) - c[11];
    p[3] = -Math.exp(delta * (c[12] + c[13] * z)) + c[14] + delta * c[15];
  }
  const weights = Float64Array.from(patches, ({ direction: d, solidAngle }) => {
    const gamma = Math.acos(Math.max(-1, Math.min(1, d.dot(sun))));
    return (
      Math.max(
        0,
        (1 + p[0] * Math.exp(p[1] / Math.max(0.01, d.z))) *
          (1 + p[2] * Math.exp(p[3] * gamma) + p[4] * Math.cos(gamma) ** 2),
      ) *
      d.z *
      solidAngle
    );
  });
  let sum = weights.reduce((a, b) => a + b, 0);
  if (!sum) {
    patches.forEach((p, i) => (weights[i] = p.direction.z * p.solidAngle));
    sum = weights.reduce((a, b) => a + b, 0);
  }
  return weights.map((w) => (w / sum) * dhi);
}
