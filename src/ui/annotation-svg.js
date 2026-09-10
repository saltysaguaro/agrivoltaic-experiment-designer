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
          ? `<polyline points="${points([z.corners[0], z.corners[3]])}" fill="none" stroke="${style.color}" stroke-width="5" stroke-dasharray="${z.kind === 'setback' ? '2 3' : z.kind === 'perimeter' ? '7 3' : 'none'}"/>`
          : `${muted ? '' : `<polygon points="${points(z.corners)}" fill="#ffffff" fill-opacity=".3"/>`}<polygon points="${points(z.corners)}" fill="url(#${prefix}-${z.kind})" fill-opacity="${muted ? 0.35 : 0.85}" stroke="${style.color}" stroke-width="1"/>`
      }</g>`;
    })
    .join('');
}
export function annotationSvg(annotations, project, width, height) {
  if (width < 80 || height < 100) return '';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const occupied = [];
  return annotations
    .map((a, i) => {
      if (!a.points.length) return '';
      const ps = a.points.map(project);
      if (ps.some((p) => !p.every(Number.isFinite))) return '';
      const color = a.active ? '#a54819' : '#264e58';
      let marks = '',
        anchor = ps[0];
      const segment = (p, q, extra = '') =>
        `<path d="M ${p[0]} ${p[1]} L ${q[0]} ${q[1]}" ${extra}/>`;
      if (a.kind === 'dimension') {
        const [p, q] = ps,
          dx = q[0] - p[0],
          dy = q[1] - p[1],
          length = Math.hypot(dx, dy);
        const ux = length > 0.5 ? dx / length : 1,
          uy = length > 0.5 ? dy / length : 0;
        const offset = 20 + (i % 2) * 12;
        const from = [p[0] - uy * offset, p[1] + ux * offset],
          to = [q[0] - uy * offset, q[1] + ux * offset];
        anchor = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
        marks +=
          segment(p, from, 'opacity=".55"') + segment(q, to, 'opacity=".55"') + segment(from, to);
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
        anchor = ps[0];
      } else marks += `<circle cx="${anchor[0]}" cy="${anchor[1]}" r="5"/>`;
      // If panning moves the target off canvas, do not leave a misleading edge label.
      if (anchor[0] < 0 || anchor[0] > width || anchor[1] < 0 || anchor[1] > height) return '';
      const shortValue = a.value.length > 25 ? a.value.slice(0, 22) + '…' : a.value;
      const text = `${a.symbol.length > 12 ? a.symbol.slice(0, 10) + '…' : a.symbol} · ${shortValue}`;
      const boxW = Math.min(width - 16, Math.max(55, text.length * 6.7 + 16));
      let x = clamp(anchor[0] - boxW / 2, 8, width - boxW - 8),
        y = clamp(anchor[1] - 32, 58, height - 32);
      for (let attempts = 0; attempts < annotations.length * 2; attempts++) {
        if (
          !occupied.some((r) => x < r.x + r.w + 5 && x + boxW + 5 > r.x && Math.abs(y - r.y) < 27)
        )
          break;
        y = y + 30 <= height - 32 ? y + 30 : Math.max(58, y - 60);
      }
      occupied.push({ x, y, w: boxW });
      marks += segment(anchor, [x + boxW / 2, y + 22], 'opacity=".7"');
      return `<g data-callout="${e(a.id)}" fill="none" stroke="${color}" stroke-width="1.3"><title>${e(a.label + ': ' + a.value)}</title>${marks}<rect x="${x}" y="${y}" width="${boxW}" height="23" rx="3" fill="#fffffff2"/><text x="${x + boxW / 2}" y="${y + 15.5}" text-anchor="middle" fill="${color}" stroke="none" font-size="12" font-family="Arial,sans-serif">${e(text)}</text></g>`;
    })
    .join('');
}
