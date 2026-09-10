import { escapeXml as e } from '../report/xml.js';
import { zoneStyles } from '../domain/land-use.js';

// Screen-space hatching stays legible in orthographic views and monochrome print.
export function zonePatternDefs(prefix = 'zone') {
  return `<defs>${Object.entries(zoneStyles)
    .map(
      ([kind, style]) =>
        `<pattern id="${prefix}-${kind}" width="9" height="9" patternUnits="userSpaceOnUse"><path d="${style.hatch === 'cross' ? 'M 0 4.5 H 9 M 4.5 0 V 9' : style.hatch === 'dots' ? 'M 4 4 h 1' : 'M -2 2 L 2 -2 M 0 9 L 9 0 M 7 11 L 11 7'}" fill="none" stroke="${style.color}" stroke-width="${style.hatch === 'dots' ? 2 : 0.7}"/></pattern>`,
    )
    .join('')}</defs>`;
}
export function zoneSvg(zones, project, { prefix = 'zone', profile = false, muted = false } = {}) {
  const points = (ps) =>
    ps
      .map((p) =>
        project(p)
          .map((n) => n.toFixed(2))
          .join(','),
      )
      .join(' ');
  return zones
    .filter((z) => !profile || (z.x0 <= 0 && z.x1 >= 0))
    .map((z) => {
      const style = zoneStyles[z.kind];
      return `<g data-land-zone="${z.kind}"><title>${e(style.label)}</title>${
        profile
          ? `<polyline points="${points([z.corners[0], z.corners[3]])}" fill="none" stroke="${style.color}" stroke-width="5" stroke-dasharray="${z.kind === 'perimeter' ? '7 3' : 'none'}"/>`
          : `${muted ? '' : `<polygon points="${points(z.corners)}" fill="#ffffff" fill-opacity=".3"/>`}<polygon points="${points(z.corners)}" fill="url(#${prefix}-${z.kind})" fill-opacity="${muted ? 0.35 : 0.85}" stroke="${style.color}" stroke-width="1"/>`
      }</g>`;
    })
    .join('');
}
export function annotationSvg(annotations, project, width, height, { obstacles = [] } = {}) {
  if (width < 80 || height < 100) return '';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const occupied = [];
  const obstacle = obstacles.length
    ? {
        left: Math.min(...obstacles.map((p) => p[0])),
        right: Math.max(...obstacles.map((p) => p[0])),
        top: Math.min(...obstacles.map((p) => p[1])),
        bottom: Math.max(...obstacles.map((p) => p[1])),
      }
    : null;
  const center = obstacle
    ? [(obstacle.left + obstacle.right) / 2, (obstacle.top + obstacle.bottom) / 2]
    : [width / 2, height / 2];
  return annotations
    .map((a, i) => {
      if (!a.points.length) return '';
      const ps = a.points.map(project);
      if (ps.some((p) => !p.every(Number.isFinite))) return '';
      const color = a.active ? '#a54819' : '#264e58';
      let marks = '',
        anchor = ps[0],
        normal = null;
      const segment = (p, q, extra = '') =>
        `<path d="M ${p[0]} ${p[1]} L ${q[0]} ${q[1]}" ${extra}/>`;
      if (a.kind === 'dimension') {
        const [p, q] = ps,
          dx = q[0] - p[0],
          dy = q[1] - p[1],
          length = Math.hypot(dx, dy);
        const ux = length > 0.5 ? dx / length : 1,
          uy = length > 0.5 ? dy / length : 0;
        const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        normal = [-uy, ux];
        if ((mid[0] - center[0]) * normal[0] + (mid[1] - center[1]) * normal[1] < 0)
          normal = normal.map((n) => -n);
        const clearance =
          a.external && obstacles.length
            ? Math.max(
                0,
                ...obstacles.map((v) => (v[0] - mid[0]) * normal[0] + (v[1] - mid[1]) * normal[1]),
              )
            : 0;
        const offset = clearance + 24 + (i % 2) * 6;
        const from = [p[0] + normal[0] * offset, p[1] + normal[1] * offset],
          to = [q[0] + normal[0] * offset, q[1] + normal[1] * offset];
        anchor = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
        marks +=
          segment(p, from, 'opacity=".55"') +
          segment(q, to, 'opacity=".55"') +
          segment(from, to, 'data-dimension-line="true"');
        if (length > 14) {
          for (const [v, direction] of [
            [from, 1],
            [to, -1],
          ]) {
            const back = [v[0] + ux * 6 * direction, v[1] + uy * 6 * direction];
            marks += `<path d="M ${back[0] - uy * 2.5} ${back[1] + ux * 2.5} L ${v[0]} ${v[1]} L ${back[0] + uy * 2.5} ${back[1] - ux * 2.5}"/>`;
          }
        } else {
          // Sub-pixel/foreshortened dimensions use witness ticks and a leader;
          // the numeric value remains true, never stretched to a fake scale.
          marks += segment([from[0] - 3, from[1] - 5], [from[0] + 3, from[1] + 5]);
          marks += segment([to[0] - 3, to[1] - 5], [to[0] + 3, to[1] + 5]);
        }
      } else if (a.kind === 'angle') {
        marks += segment(ps[0], ps[1], 'stroke-dasharray="4 3"') + segment(ps[0], ps.at(-1));
        marks += `<polyline points="${ps
          .slice(1)
          .map((p) => p.join(','))
          .join(' ')}"/>`;
        anchor = ps[Math.ceil(ps.length / 2)];
      } else if (a.kind === 'outline') {
        marks += `<polygon points="${ps.map((p) => p.join(',')).join(' ')}" stroke-width="2.5"/>`;
        ((anchor = ps[0]), (normal = null));
      } else marks += `<circle cx="${anchor[0]}" cy="${anchor[1]}" r="5"/>`;
      // If panning moves the target off canvas, do not leave a misleading edge label.
      if (
        ps.every((p) => p[0] < 0) ||
        ps.every((p) => p[0] > width) ||
        ps.every((p) => p[1] < 0) ||
        ps.every((p) => p[1] > height)
      )
        return '';
      const shortValue = a.value.length > 25 ? a.value.slice(0, 22) + '…' : a.value;
      const text = `${a.symbol.length > 12 ? a.symbol.slice(0, 10) + '…' : a.symbol} · ${shortValue}`;
      const boxW = Math.min(width - 16, Math.max(55, text.length * 6.7 + 16));
      const boxH = 23;
      const distance = normal
        ? 10 + (Math.abs(normal[0]) * boxW) / 2 + (Math.abs(normal[1]) * boxH) / 2
        : 30;
      const natural = [
        anchor[0] + (normal?.[0] || 0) * distance - boxW / 2,
        anchor[1] + (normal?.[1] || -1) * distance - boxH / 2,
      ];
      const candidates = [natural];
      if (obstacle)
        candidates.push(
          [obstacle.left - boxW - 12, anchor[1] - boxH / 2],
          [obstacle.right + 12, anchor[1] - boxH / 2],
          [anchor[0] - boxW / 2, obstacle.top - boxH - 12],
          [anchor[0] - boxW / 2, obstacle.bottom + 12],
        );
      for (let row = 58; row < height - boxH - 8; row += 30) {
        candidates.push([8, row], [width - boxW - 8, row]);
      }
      const overlap = (x, y, r) =>
        Math.max(0, Math.min(x + boxW, r.right) - Math.max(x, r.left)) *
        Math.max(0, Math.min(y + boxH, r.bottom) - Math.max(y, r.top));
      const scored = candidates
        .map(([x, y]) => [clamp(x, 8, width - boxW - 8), clamp(y, 58, height - boxH - 8)])
        .map(([x, y]) => ({
          x,
          y,
          score:
            (obstacle
              ? overlap(x - 3, y - 3, {
                  left: obstacle.left - 3,
                  right: obstacle.right + 6,
                  top: obstacle.top - 3,
                  bottom: obstacle.bottom + 6,
                })
              : 0) *
              10000 +
            occupied.reduce(
              (n, r) =>
                n +
                overlap(x - 3, y - 3, {
                  left: r.x - 3,
                  right: r.x + r.w + 6,
                  top: r.y - 3,
                  bottom: r.y + 29,
                }) *
                  100000,
              0,
            ) +
            Math.hypot(x - natural[0], y - natural[1]),
        }))
        .sort((a, b) => a.score - b.score);
      const { x, y } = scored[0];
      occupied.push({ x, y, w: boxW });
      marks += segment(anchor, [x + boxW / 2, y + 22], 'opacity=".7"');
      return `<g data-callout="${e(a.id)}" fill="none" stroke="${color}" stroke-width="1.3"><title>${e(a.label + ': ' + a.value)}</title>${marks}<rect x="${x}" y="${y}" width="${boxW}" height="23" rx="3" fill="#fffffff2"/><text x="${x + boxW / 2}" y="${y + 15.5}" text-anchor="middle" fill="${color}" stroke="none" font-size="12" font-family="Arial,sans-serif">${e(text)}</text></g>`;
    })
    .join('');
}
