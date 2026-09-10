// Shared screen-space labeling for the interactive map and exported figures.
// Labels never shrink below 12 px or overlap; dense layouts retain all items in their key.
export const labelColors = { sensor: '#954325', crop: '#315d35' };
export function intersects(a, b, gap = 5) {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}
export function fieldLabelItems(projection, selection) {
  return [
    ...projection.beds.map((b) => ({
      kind: 'crop',
      id: b.id,
      text: b.id,
      title: `Crop bed ${b.id} · ${b.crop}`,
      point: [0, 1].map((axis) => b.points.reduce((sum, p) => sum + p[axis], 0) / b.points.length),
      edges: b.points
        .map((p, i) =>
          [0, 1].map((axis) => (p[axis] + b.points[(i + 1) % b.points.length][axis]) / 2),
        )
        .sort((a, b) => a[0] - b[0]),
      selected: selection?.kind === 'crop' && selection.id === b.id,
    })),
    ...projection.markers.map((m) => {
      const selected = selection?.kind === 'sensor' && m.ids.includes(selection.id);
      const id = selected ? selection.id : m.ids[0];
      return {
        kind: 'sensor',
        id,
        text: selected ? id : m.ids.length > 1 ? `${m.ids.length} sensors` : id,
        title: `Sensor${m.ids.length > 1 ? 's' : ''} · ${m.ids.join(', ')}`,
        point: m.point,
        radius: m.radius,
        selected,
      };
    }),
  ];
}
export function layoutFieldLabels(
  items,
  width,
  height,
  { top = 34, bottom = 24, obstacles = [] } = {},
) {
  const labels = [],
    hidden = [];
  const occupied = [
    ...obstacles,
    ...items
      .filter((i) => i.kind === 'sensor')
      .map((i) => ({ x: i.point[0] - 8, y: i.point[1] - 8, width: 16, height: 16 })),
  ];
  for (const item of [...items].sort(
    (a, b) =>
      Number(b.selected) - Number(a.selected) ||
      Number(b.kind === 'sensor') - Number(a.kind === 'sensor'),
  )) {
    const [x, y] = item.point;
    if (x < 0 || x > width || y < top || y > height - bottom) {
      hidden.push(item);
      continue;
    }
    const characters = Array.from(item.text);
    const text = characters.length > 20 ? characters.slice(0, 19).join('') + '…' : item.text;
    const w = Math.max(
        42,
        Array.from(text).reduce(
          (sum, c) => sum + (/[WM@#%]/.test(c) || c.charCodeAt(0) > 255 ? 12 : 8),
          0,
        ) + 16,
      ),
      h = 24;
    const gap = Math.max(12, item.radius || 0) + 6;
    const candidates = [
      ...(item.edges
        ? [
            [item.edges[0][0] - w - 8, item.edges[0][1] - h / 2],
            [item.edges.at(-1)[0] + 8, item.edges.at(-1)[1] - h / 2],
          ]
        : []),
      ...(item.kind === 'crop' ? [[x - w / 2, y - h / 2]] : []),
      [x + gap, y - h / 2],
      [x - gap - w, y - h / 2],
      [x - w / 2, y - gap - h],
      [x - w / 2, y + gap],
      [x + gap, y - h - gap],
      [x - w - gap, y - h - gap],
      [x + gap, y + gap],
      [x - w - gap, y + gap],
    ];
    const box = candidates
      .map(([cx, cy]) => ({ x: cx, y: cy, width: w, height: h }))
      .find(
        (b) =>
          b.x >= 10 &&
          b.x + b.width <= width - 10 &&
          b.y >= top &&
          b.y + b.height <= height - bottom &&
          !occupied.some((other) => intersects(b, other)),
      );
    if (!box) {
      hidden.push(item);
      continue;
    }
    labels.push({ ...item, ...box, text });
    occupied.push(box);
  }
  return { labels, hidden };
}
