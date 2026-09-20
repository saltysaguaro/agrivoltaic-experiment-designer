import { rowHeight } from './receiver-grid.js';

export const DEFAULT_DLI_ZONES = 5;
export const MAX_DLI_ZONES = 10;
const HISTOGRAM_SIZE = 256;
const cache = new WeakMap();
export const DLI_ZONE_METHOD = 'Area-weighted natural breaks (256-bin histogram approximation)';
export const DLI_ZONE_NOTE =
  'Zones describe light differences, not crop-response thresholds or statistical significance. Breaks are specific to this map and period; equal colors across maps need not mean equal DLI. Includes the entire receiver footprint and buffer. Disconnected cells can share a zone; no spatial smoothing is applied.';

// Display-only postprocessing. Exact weighted moments are retained in each histogram
// bucket; dynamic programming minimizes within-zone squared DLI deviations over
// the bucket boundaries. Work is bounded by O(N + K * 256²), independent of ray count.
// Inputs/results are immutable in the app, so all views/exports share this cache.
export function dliZones(result, requestedCount = DEFAULT_DLI_ZONES) {
  if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > MAX_DLI_ZONES)
    throw Error(`DLI zones must be a whole number from 1 to ${MAX_DLI_ZONES}.`);
  if (!result) return null;
  let entries = cache.get(result);
  if (entries?.has(requestedCount)) return entries.get(requestedCount);
  const values = result.cells.map((cell) => cell.dli);
  if (values.some((value) => !Number.isFinite(value) || value < 0))
    throw Error('Zoned DLI requires finite, nonnegative DLI values.');
  const min = values.reduce((a, b) => Math.min(a, b), Infinity);
  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  const span = max - min;
  const buckets = Array.from({ length: HISTOGRAM_SIZE }, () => ({
    weight: 0,
    sum: 0,
    square: 0,
    min: Infinity,
    max: -Infinity,
  }));
  const weights = values.map((value, index) => {
    const weight = result.grid.dx * rowHeight(result.grid, Math.floor(index / result.grid.nx));
    if (!(weight > 0) || !Number.isFinite(weight)) throw Error('Invalid receiver cell area.');
    // Normalize before taking moments to avoid cancellation for nearly uniform DLI.
    const x = span > 0 ? (value - min) / span : 0;
    const bucket = buckets[Math.min(HISTOGRAM_SIZE - 1, Math.floor(x * HISTOGRAM_SIZE))];
    bucket.weight += weight;
    bucket.sum += weight * x;
    bucket.square += weight * x * x;
    bucket.min = Math.min(bucket.min, value);
    bucket.max = Math.max(bucket.max, value);
    return weight;
  });
  const occupied = buckets.filter((b) => b.weight > 0);
  const n = occupied.length,
    count = Math.min(requestedCount, n);
  const w = new Float64Array(n + 1),
    s = new Float64Array(n + 1),
    q = new Float64Array(n + 1);
  occupied.forEach((b, i) => {
    w[i + 1] = w[i] + b.weight;
    s[i + 1] = s[i] + b.sum;
    q[i + 1] = q[i] + b.square;
  });
  let previous = new Float64Array(n + 1).fill(Infinity);
  previous[0] = 0;
  const splits = Array.from({ length: count + 1 }, () => new Uint16Array(n + 1));
  for (let k = 1; k <= count; k++) {
    const next = new Float64Array(n + 1).fill(Infinity);
    for (let end = k; end <= n; end++) {
      for (let start = k - 1; start < end; start++) {
        const sum = s[end] - s[start];
        const cost =
          previous[start] + Math.max(0, q[end] - q[start] - (sum * sum) / (w[end] - w[start]));
        if (cost < next[end]) {
          next[end] = cost;
          splits[k][end] = start;
        }
      }
    }
    previous = next;
  }
  const breaks = [];
  let end = n;
  for (let k = count; k > 1; k--) {
    const start = splits[k][end];
    const lower = occupied[start - 1].max,
      upper = occupied[start].min;
    const midpoint = lower + (upper - lower) / 2;
    // A rounded midpoint must stay strictly below the next class's minimum.
    breaks.unshift(midpoint < upper ? midpoint : lower);
    end = start;
  }
  const zones = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    min: Infinity,
    max: -Infinity,
    mean: 0,
    area: 0,
    cells: 0,
    areaPercent: 0,
  }));
  const cellZones = values.map((value, i) => {
    let index = 0;
    while (index < breaks.length && value > breaks[index]) index++;
    const zone = zones[index];
    zone.min = Math.min(zone.min, value);
    zone.max = Math.max(zone.max, value);
    zone.mean += value * weights[i];
    zone.area += weights[i];
    zone.cells++;
    return zone.id;
  });
  zones.forEach((zone) => {
    zone.mean /= zone.area;
    zone.areaPercent = (100 * zone.area) / w[n];
  });
  const classified = {
    method: DLI_ZONE_METHOD,
    requestedCount,
    count,
    histogramBins: HISTOGRAM_SIZE,
    // Upper-inclusive boundaries; zone IDs increase with DLI.
    breaks,
    zones,
    cellZones,
    totalArea: w[n],
    range: values.length ? [min, max] : null,
  };
  if (!entries) cache.set(result, (entries = new Map()));
  entries.set(requestedCount, classified);
  return classified;
}

export function dliZoneSummary(zoning) {
  if (!zoning) return 'Not calculated';
  return (
    `${zoning.method}; ${zoning.count} of ${zoning.requestedCount} requested zones. ` +
    zoning.zones
      .map(
        (z) =>
          `Z${z.id}: ${z.min.toFixed(3)}–${z.max.toFixed(3)} mol/m²/day; mean ${z.mean.toFixed(3)}; ${z.areaPercent.toFixed(1)}% of receiver area`,
      )
      .join('; ') +
    `. Upper-inclusive DLI breaks: ${zoning.breaks.join(', ') || 'none'}. ${DLI_ZONE_NOTE}`
  );
}
