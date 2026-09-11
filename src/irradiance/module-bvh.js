// One oriented box per module: count each module once, including edge/corner rays.
// Packed boxes: centre, then three unit axes with their half extents in w.
export function packModuleBvh(boxes) {
  const items = boxes.map((b) => {
    const radius = [0, 1, 2].map(
      (a) => Math.abs(b[4 + a] * b[7]) + Math.abs(b[8 + a] * b[11]) + Math.abs(b[12 + a] * b[15]),
    );
    return { b, lo: radius.map((r, a) => b[a] - r), hi: radius.map((r, a) => b[a] + r) };
  });
  const nodes = [],
    ordered = [];
  function build(items) {
    const index = nodes.length,
      lo = [Infinity, Infinity, Infinity],
      hi = [-Infinity, -Infinity, -Infinity];
    for (const t of items)
      for (let a = 0; a < 3; a++) {
        lo[a] = Math.min(lo[a], t.lo[a]);
        hi[a] = Math.max(hi[a], t.hi[a]);
      }
    const n = { lo, hi, start: 0, count: 0, escape: 0 };
    nodes.push(n);
    if (items.length <= 4) {
      n.start = ordered.length;
      n.count = items.length;
      ordered.push(...items);
    } else {
      const axis = [0, 1, 2].sort((a, b) => hi[b] - lo[b] - (hi[a] - lo[a]))[0];
      items.sort((a, b) => a.b[axis] - b.b[axis]);
      const mid = Math.floor(items.length / 2);
      build(items.slice(0, mid));
      build(items.slice(mid));
    }
    n.escape = nodes.length;
  }
  if (items.length) build(items);
  return {
    boxes: Float32Array.from(ordered.flatMap((t) => t.b)),
    nodes: Float32Array.from(
      nodes.flatMap((n) => [...n.lo, n.start, ...n.hi, n.count, n.escape, 0, 0, 0]),
    ),
    count: nodes.length,
  };
}
function slab(o, d, lo, hi, range) {
  if (Math.abs(d) < 1e-9) return o >= lo && o <= hi;
  const a = (lo - o) / d,
    b = (hi - o) / d;
  range[0] = Math.max(range[0], Math.min(a, b));
  range[1] = Math.min(range[1], Math.max(a, b));
  return range[1] >= range[0];
}
export function moduleIntersections(packed, origin, direction) {
  if (!packed?.count) return 0;
  const { nodes, boxes } = packed,
    o = [origin.x, origin.y, origin.z],
    d = [direction.x, direction.y, direction.z];
  let node = 0,
    count = 0;
  while (node < packed.count) {
    const i = node * 12,
      range = [1e-5, Infinity];
    if (![0, 1, 2].every((a) => slab(o[a], d[a], nodes[i + a], nodes[i + 4 + a], range))) {
      node = nodes[i + 8];
      continue;
    }
    for (let b = nodes[i + 3]; b < nodes[i + 3] + nodes[i + 7]; b++) {
      const k = b * 16,
        delta = o.map((v, a) => v - boxes[k + a]),
        r = [1e-5, Infinity];
      if (
        [4, 8, 12].every((a) => {
          const localO = delta.reduce((v, x, j) => v + x * boxes[k + a + j], 0);
          const localD = d.reduce((v, x, j) => v + x * boxes[k + a + j], 0);
          return slab(localO, localD, -boxes[k + a + 3], boxes[k + a + 3], r);
        })
      )
        count++;
    }
    node++;
  }
  return count;
}
