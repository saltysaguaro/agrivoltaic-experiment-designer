import * as THREE from 'three';
import { dimensions } from '../domain/study.js';
import { buildGeometry, disposeGroup, localToWorld, worldToLocal } from '../domain/geometry.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { receiverLines, sensorMarkers, plotCorners } from '../experiment/grid-layout.js';
import { groundGrid } from '../ui/ground-grid.js';
export const escapeXml = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  );
export function heatColor(value, max = 100) {
  const t = Math.max(0, Math.min(1, value / max));
  const stops = [
    [37, 78, 113],
    [57, 147, 146],
    [151, 197, 135],
    [244, 222, 112],
  ];
  const a = Math.min(2, Math.floor(t * 3)),
    f = t * 3 - a;
  return (
    '#' +
    stops[a]
      .map((v, i) =>
        Math.round(v + (stops[a + 1][i] - v) * f)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function figureSvg(
  s,
  result = null,
  view = 'plan',
  metric = 'none',
  scope = 'array',
  showGrid = true,
) {
  const group = buildGeometry(s, scope),
    meshes = group.children.filter((o) => o.isMesh);
  const ground = scope !== 'module' && showGrid ? groundGrid(s, group.userData) : null;
  const arrayScope = ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(
    scope,
  );
  const receivers = receiverGridSpec(s);
  const glyphs = arrayScope ? sensorMarkers(s) : [];
  const project = (p) =>
    view === 'profile'
      ? [worldToLocal(s, p.x, p.y).y, -p.z]
      : view === 'oblique'
        ? [
            (p.x - p.y) / Math.SQRT2,
            ((p.x + p.y) * Math.sin((35 * Math.PI) / 180)) / Math.SQRT2 -
              p.z * Math.cos((35 * Math.PI) / 180),
          ]
        : [p.x, -p.y];
  const shapes = meshes.map((m) => {
    const a = m.geometry.attributes.position,
      points = [];
    for (let i = 0; i < a.count; i++)
      points.push(
        project(new THREE.Vector3().fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld)),
      );
    return { points, kind: m.userData.kind };
  });
  function hull(points) {
    const p = [...new Map(points.map((p) => [p.join(','), p])).values()].sort(
      (a, b) => a[0] - b[0] || a[1] - b[1],
    );
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [],
      upper = [];
    for (const a of p) {
      while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), a) <= 0) lower.pop();
      lower.push(a);
    }
    for (const a of p.toReversed()) {
      while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), a) <= 0) upper.pop();
      upper.push(a);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }
  let all = shapes.flatMap((s) => s.points);
  if (ground) all.push(...ground.corners.map(project));
  if (result && metric !== 'none')
    all.push(...result.cells.map((c) => project(new THREE.Vector3(c.x, c.y, 0))));
  if (arrayScope) {
    for (const sensor of s.experimentSensors)
      all.push(project(new THREE.Vector3(sensor.x, sensor.y, sensor.z)));
    for (const c of s.crops) all.push(...plotCorners(s, c).map(project));
  }
  let xmin = Math.min(...all.map((p) => p[0])),
    xmax = Math.max(...all.map((p) => p[0])),
    ymin = Math.min(...all.map((p) => p[1])),
    ymax = Math.max(...all.map((p) => p[1]));
  const scale = Math.min(850 / Math.max(0.2, xmax - xmin), 410 / Math.max(0.2, ymax - ymin)),
    tx = 500 - ((xmin + xmax) / 2) * scale,
    ty = 285 - ((ymin + ymax) / 2) * scale,
    xy = (p) => [p[0] * scale + tx, p[1] * scale + ty],
    poly = (p, fill, stroke = '#304e52', opacity = 1) =>
      `<polygon points="${p
        .map((p) =>
          xy(p)
            .map((x) => x.toFixed(2))
            .join(','),
        )
        .join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width=".65" opacity="${opacity}"/>`;
  let content = '';
  if (ground && view !== 'profile')
    content += `<g data-ground-surface="true">${poly(ground.corners.map(project), '#edf2e8', '#9bab98')}</g>`;
  if (result && metric !== 'none' && view !== 'profile') {
    for (const c of result.cells) {
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([x, y]) =>
        project(
          localToWorld(s, c.lx + (x * result.grid.dx) / 2, c.ly + (y * result.grid.dy) / 2, 0),
        ),
      );
      content += poly(
        corners,
        heatColor(
          metric === 'sunlight' ? c.sunlight : c.dli,
          metric === 'sunlight' ? 100 : result.openDli,
        ),
        'none',
      );
    }
  }
  if (ground) {
    const segment = (a, b) => {
      const p = xy(project(a)),
        q = xy(project(b));
      return `M ${p[0].toFixed(2)} ${p[1].toFixed(2)} L ${q[0].toFixed(2)} ${q[1].toFixed(2)}`;
    };
    const lines =
      view === 'profile'
        ? [[ground.corners[0], ground.corners[3]]]
        : arrayScope
          ? receiverLines(s, receivers)
          : ground.lines;
    content += `<g data-ground-grid="true" ${arrayScope ? 'data-receiver-grid="true"' : ''}><path d="${lines.map(([a, b]) => segment(a, b)).join(' ')}" fill="none" stroke="#8c9f85" stroke-width="${view === 'profile' ? 1.5 : 0.55}" opacity=".65"/></g>`;
  }
  shapes.sort((a, b) => (a.kind === 'module') - (b.kind === 'module'));
  for (const shape of shapes)
    content += poly(
      hull(shape.points),
      shape.kind === 'module' ? (metric === 'none' ? '#46727a' : 'none') : '#b5beb8',
      '#294d55',
      metric === 'none' ? 1 : 0.65,
    );
  if (arrayScope) {
    for (const c of s.crops) {
      const p = plotCorners(s, c).map(project);
      content += poly(p, '#94bc69', '#557a35', 0.45);
      const [x, y] = xy(project(new THREE.Vector3(c.x, c.y, 0)));
      content += `<text x="${x}" y="${y}" text-anchor="middle" font-size="13">${escapeXml(c.id)}</text>`;
    }
    for (const glyph of glyphs) {
      const sensor = glyph.sensors[0],
        z = view === 'profile' ? sensor.z : 0.065;
      const point = new THREE.Vector3(glyph.position.x, glyph.position.y, z);
      const [x, y] = xy(project(point));
      const title = glyph.sensors
        .map((v) => `${v.id} · ${v.type || ''} · height/depth ${v.z} m`)
        .join('; ');
      const circle = Array.from({ length: 24 }, (_, i) =>
        project(
          new THREE.Vector3(
            point.x + glyph.radius * Math.cos((i * Math.PI) / 12),
            point.y + glyph.radius * Math.sin((i * Math.PI) / 12),
            z,
          ),
        ),
      );
      const dot =
        view === 'profile'
          ? `<circle cx="${x}" cy="${y}" r="${glyph.radius * scale}" fill="#dc7147" stroke="white" stroke-width=".65"/>`
          : poly(circle, glyph.count > 1 ? '#8f4934' : '#dc7147', 'white');
      content += `<g data-sensor-cell="${glyph.cell.column},${glyph.cell.row}"><title>${escapeXml(title)}</title>${dot}`;
      if (glyph.count > 1)
        content += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="white" font-size="${Math.min(11, glyph.radius * scale)}">${escapeXml(glyph.label)}</text>`;
      content += '</g>';
    }
  }
  const dim = dimensions(s);
  const line = (a, b, label, offset = 16) => {
    const p = xy(a),
      q = xy(b);
    return `<path d="M ${p[0]} ${p[1] + offset} L ${q[0]} ${q[1] + offset}" stroke="#667b60" fill="none"/><circle cx="${p[0]}" cy="${p[1] + offset}" r="2" fill="#667b60"/><circle cx="${q[0]}" cy="${q[1] + offset}" r="2" fill="#667b60"/><text x="${(p[0] + q[0]) / 2}" y="${(p[1] + q[1]) / 2 + offset + 17}" font-size="12" text-anchor="middle">${escapeXml(label)}</text>`;
  };
  if (scope === 'module') {
    content += line(
      [xmin, ymax],
      [xmax, ymax],
      `${s.module.length} × ${s.module.width} m; thickness ${s.module.thickness} m`,
    );
  } else if (view === 'profile') {
    const y0 = group.userData.rowOffsets[0] ?? 0,
      y1 = group.userData.rowOffsets[1];
    if (y1 !== undefined) content += line([y0, 0], [y1, 0], `${(y1 - y0).toFixed(2)} m pitch`, 24);
    const x = xy([xmin, -s.racking.height])[0] - 18,
      top = xy([xmin, -s.racking.height])[1],
      bottom = xy([xmin, 0])[1];
    content += `<path d="M ${x} ${top} V ${bottom}" stroke="#667b60"/><text x="${x - 6}" y="${(top + bottom) / 2}" text-anchor="end" font-size="12">${s.racking.height} m</text><text x="500" y="515" text-anchor="middle" font-size="12">Tilt ${s.racking.type === 'vertical' ? 90 : s.racking.type === 'pergola' ? 0 : s.racking.tilt}° · assembly ${dim.width.toFixed(2)} m · setback ${s.rowPair.cropSetback} m · maintenance ${s.rowPair.maintenance} m</text>`;
  } else if (view === 'plan') {
    content += line(
      [xmin, ymax],
      [xmax, ymax],
      `Extent ${(xmax - xmin).toFixed(2)} m east–west`,
      12,
    );
    if (arrayScope) {
      group.userData.rowOffsets.forEach((offset, i) => {
        const p = xy(project(localToWorld(s, -group.userData.length / 2 - 0.5, offset, 0)));
        content += `<text x="${p[0] - 4}" y="${p[1]}" text-anchor="end" font-size="11">R${i + 1}</text>`;
      });
    }
  }
  const bar = Math.max(0.1, 10 ** Math.floor(Math.log10((xmax - xmin) / 5 || 1)));
  let legend = '';
  if (metric !== 'none' && result) {
    for (let i = 0; i < 100; i++)
      legend += `<rect x="${650 + i * 2.5}" y="535" width="2.6" height="10" fill="${heatColor((i / 99) * 100)}"/>`;
    legend += `<text x="650" y="565" font-size="12">0</text><text x="900" y="565" text-anchor="end" font-size="12">${metric === 'sunlight' ? '100% sunlight' : result.openDli.toFixed(1) + ' mol m⁻² d⁻¹'}</text>`;
  }
  const title =
    metric === 'sunlight'
      ? 'Daily relative sunlight'
      : metric === 'dli'
        ? result?.estimated
          ? 'Estimated DLI'
          : 'Daily light integral'
        : view === 'profile'
          ? 'Array profile'
          : view === 'oblique'
            ? 'Orthographic system view'
            : 'Array plan';
  disposeGroup(group);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600" role="img" aria-label="${title}"><rect width="1000" height="600" fill="#fbfcf9"/><g font-family="Arial,sans-serif" fill="#243d3a"><text x="40" y="36" font-size="19" font-weight="bold">${escapeXml(title)}</text><text x="40" y="57" font-size="12">${escapeXml(s.metadata.title)}${result ? ' · ' + result.date : ''}</text>${content}<path d="M 60 530 v 7 h ${bar * scale} v -7" fill="none" stroke="#243d3a" stroke-width="2"/><text x="60" y="558" font-size="12">${bar} m${view === 'oblique' ? ' (projection plane)' : ''}</text>${view === 'plan' ? '<path d="M 935 125 v -40 l -5 12 m 5 -12 l 5 12" fill="none" stroke="#243d3a" stroke-width="2"/><text x="935" y="75" text-anchor="middle" font-size="14">N</text>' : ''}<text x="40" y="583" font-size="11">Coordinates: east / north / up · dimensions in metres · ${escapeXml(view)} projection${ground ? ` · Ground z = 0 m${view === 'profile' ? '' : arrayScope ? ` · Receiver cells ${receivers.dx.toFixed(3)} × ${receivers.dy.toFixed(3)} m` : ` · Grid ${ground.spacing} m`}` : ''}</text>${legend}</g></svg>`;
}
