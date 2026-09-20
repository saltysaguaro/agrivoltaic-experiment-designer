import { dliZones, DLI_ZONE_NOTE } from '../domain/dli-zones.js';
import { rowHeight, gridSpacingLabel } from '../domain/receiver-grid.js';
import { controlLayers } from '../experiment/control-field.js';
import { isPeriod, periodLabel, dliLabel } from '../domain/period.js';
import * as THREE from 'three';
import { buildGeometry, disposeGroup, localToWorld, worldToLocal } from '../domain/geometry.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { receiverLines, sensorMarkers, plotCorners } from '../experiment/grid-layout.js';
import { groundGrid } from '../ui/ground-grid.js';
import { provenanceRecord } from './provenance.js';
import { escapeXml } from './xml.js';
export { escapeXml } from './xml.js';
import { landUseZones, zoneStyles, landUseDefinition } from '../domain/land-use.js';
import { designLayers, irradianceLayers } from '../ui/display-layers.js';
import { hardwarePoints } from '../ui/drawing-bounds.js';
import { fieldLabelItems, layoutFieldLabels, labelColors } from '../ui/field-labels.js';
import { engineeringAnnotations } from '../ui/annotations.js';
import { annotationSvg, zoneSvg, zonePatternDefs } from '../ui/annotation-svg.js';
export function heatColor(value, max = 100) {
  const t =
    Number.isFinite(value) && Number.isFinite(max) && max > 0
      ? Math.max(0, Math.min(1, value / max))
      : 0;
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
export function dliZoneColor(zoning, id) {
  if (!id || !zoning?.count) return '#b9c4c4';
  return heatColor(zoning.count === 1 ? 0.5 : (id - 1) / (zoning.count - 1), 1);
}
export function createFigureContext() {
  const groups = new Map();
  return {
    get(s, scope) {
      const normalizedScope = [
        'array',
        'environment',
        'irradiance',
        'sensors',
        'crops',
        'report',
      ].includes(scope)
        ? 'array'
        : scope;
      const key = JSON.stringify([
        s.module,
        s.racking,
        s.table,
        s.row,
        s.rowPair.pitch,
        s.array,
        normalizedScope,
      ]);
      if (!groups.has(key)) {
        const group = buildGeometry(s, normalizedScope, undefined, { textures: false });
        group.userData.hardwarePoints = hardwarePoints(group);
        groups.set(key, group);
      }
      return groups.get(key);
    },
    dispose() {
      groups.forEach(disposeGroup);
      groups.clear();
    },
  };
}
export function figureSvg(
  s,
  result = null,
  view = 'plan',
  metric = 'none',
  scope = 'array',
  showGrid = true,
  options = {},
) {
  // A stale/absent result must export a geometry figure, never a labeled light map.
  if (!result) metric = 'none';
  const zoning = metric === 'zoned-dli' ? dliZones(result, s.analysis.dliZoneCount) : null;
  const noCallouts =
    options.control ||
    ['irradiance', 'report'].includes(scope) ||
    metric !== 'none' ||
    options.callouts === false;
  const baseLayers = options.layers || (metric !== 'none' ? irradianceLayers : designLayers);
  const layers = options.control ? controlLayers(baseLayers) : baseLayers;
  const opacity = options.panelOpacity ?? (metric !== 'none' || scope === 'irradiance' ? 0.2 : 1);
  if (receiverGridSpec(s).exceeded)
    throw Error(
      'This grid exceeds 20,000 receivers. Reduce dimensions or cells between PV row centres before exporting figures.',
    );
  const group =
      options.context?.get(s, scope) || buildGeometry(s, scope, undefined, { textures: false }),
    meshes = options.control ? [] : group.children.filter((o) => o.isMesh);
  const ground = scope !== 'module' && showGrid ? groundGrid(s, group.userData) : null;
  const arrayScope = ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(
    scope,
  );
  const receivers = receiverGridSpec(s);
  const zones =
    arrayScope || scope === 'pair'
      ? landUseZones(s, group.userData).zones.filter(
          (z) => (arrayScope || z.kind !== 'perimeter') && layers[z.kind],
        )
      : [];
  const annotationScope =
    arrayScope && view === 'plan' ? 'report' : arrayScope && view === 'profile' ? 'pair' : scope;
  const annotations = noCallouts
    ? []
    : engineeringAnnotations(s, annotationScope, group, options.focus);
  const hardware = options.control ? [] : hardwarePoints(group);
  if (!noCallouts && arrayScope && view === 'profile' && !options.focus)
    annotations.unshift(...engineeringAnnotations(s, 'racking', group).slice(0, 1));
  const receiverBoundary = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) => localToWorld(s, (x * receivers.width) / 2, (y * receivers.height) / 2));
  const glyphs =
    arrayScope && layers.sensors ? sensorMarkers(s, { profile: view === 'profile' }) : [];
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
  // Projected data no longer needs Three.js resources, even if later export fails.
  const rowOffsets = group.userData.rowOffsets;
  const groupLength = group.userData.length;
  if (!options.context) disposeGroup(group);
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
  for (const annotation of annotations) all.push(...annotation.points.map(project));
  if (ground) all.push(...ground.corners.map(project));
  for (const zone of zones) all.push(...zone.corners.map(project));
  if (arrayScope) all.push(...receiverBoundary.map(project));
  if (result && metric !== 'none')
    all.push(...result.cells.map((c) => project(new THREE.Vector3(c.x, c.y, 0))));
  if (arrayScope) {
    for (const sensor of s.experimentSensors)
      all.push(project(new THREE.Vector3(sensor.x, sensor.y, sensor.z)));
    for (const c of s.crops) all.push(...plotCorners(s, c).map(project));
  }
  let xmin = Infinity,
    xmax = -Infinity,
    ymin = Infinity,
    ymax = -Infinity;
  for (const [x, y] of all) {
    xmin = Math.min(xmin, x);
    xmax = Math.max(xmax, x);
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
  }
  const scale = Math.min(
      (noCallouts ? 850 : 730) / Math.max(0.2, xmax - xmin),
      (noCallouts ? 410 : 310) / Math.max(0.2, ymax - ymin),
    ),
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
    for (const [cellIndex, c] of result.cells.entries()) {
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([x, y]) =>
        project(
          localToWorld(
            s,
            c.lx + (x * result.grid.dx) / 2,
            c.ly + (y * rowHeight(result.grid, Math.floor(cellIndex / result.grid.nx))) / 2,
            0,
          ),
        ),
      );
      content += poly(
        corners,
        zoning
          ? dliZoneColor(zoning, zoning.cellZones[cellIndex])
          : heatColor(
              metric === 'sunlight' ? c.sunlight : c.dli,
              metric === 'sunlight' ? 100 : result.openDli,
            ),
        'none',
      );
    }
  }
  // Standalone light maps retain their clear interiors; an explicit UI layer
  // selection can include cell lines. The outer receiver boundary is independent.
  if (
    ground &&
    (!arrayScope ||
      (layers.receiver && (metric === 'none' || options.layers)) ||
      view === 'profile')
  ) {
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
  content += zoneSvg(zones, (p) => xy(project(p)), {
    profile: view === 'profile',
    muted: metric !== 'none',
  });
  if (arrayScope && layers.receiver && view !== 'profile')
    content += `<polygon data-receiver-boundary="true" points="${receiverBoundary.map((p) => xy(project(p)).join(',')).join(' ')}" fill="none" stroke="#276a80" stroke-dasharray="5 4"/>`;
  const fieldProjection = { beds: [], markers: [] };
  if (arrayScope) {
    for (const c of layers.plots ? s.crops : []) {
      const p = plotCorners(s, c).map(project);
      content += poly(p, '#94bc69', '#557a35', 0.45);
      fieldProjection.beds.push({ id: c.id, crop: c.crop, points: p.map(xy) });
    }
    for (const [glyphIndex, glyph] of glyphs.entries()) {
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
      fieldProjection.markers.push({
        ids: glyph.sensors.map((v) => v.id),
        point: [x, y],
        radius: Math.min(15, glyph.radius * scale),
      });
      content += '</g>';
    }
  }
  shapes.sort((a, b) => (a.kind === 'module') - (b.kind === 'module'));
  for (const shape of shapes) {
    const module = shape.kind === 'module';
    if (!(module ? layers.modules && opacity > 0 : layers.supports)) continue;
    content += `<g data-hardware="${shape.kind}">${poly(hull(shape.points), module ? '#46727a' : '#b5beb8', '#294d55', module ? opacity : 1)}</g>`;
  }
  const fieldLabels = layoutFieldLabels(fieldLabelItems(fieldProjection), 1000, 520, {
    top: 75,
    bottom: 16,
    obstacles: view === 'plan' ? [{ x: 914, y: 65, width: 43, height: 65 }] : [],
  });
  for (const label of fieldLabels.labels) {
    const color = labelColors[label.kind];
    content += `<g data-field-label="${escapeXml(label.kind + ':' + label.id)}"><title>${escapeXml(label.title)}</title><rect x="${label.x}" y="${label.y}" width="${label.width}" height="${label.height}" rx="4" fill="white" fill-opacity=".97" stroke="${color}"/><text x="${label.x + 8}" y="${label.y + 16}" font-size="12" font-weight="600" fill="${color}">${escapeXml(label.text)}</text></g>`;
  }
  content += annotationSvg(annotations, (p) => xy(project(p)), 1000, 520, {
    obstacles: hardware.map((p) => xy(project(p))),
    top: 75,
  });
  if (!noCallouts && arrayScope && layers.modules && view === 'plan')
    rowOffsets.forEach((offset, i) => {
      const p = xy(project(localToWorld(s, -groupLength / 2 - 0.5, offset, 0)));
      content += `<text x="${p[0] - 4}" y="${p[1]}" text-anchor="end" font-size="11">R${i + 1}</text>`;
    });
  const bar = Math.max(0.1, 10 ** Math.floor(Math.log10((xmax - xmin) / 5 || 1)));
  let legend = '';
  if (zoning) {
    const width = 250 / (zoning.count || 1);
    zoning.zones.forEach((z, i) => {
      legend += `<rect x="${650 + i * width}" y="535" width="${width}" height="10" fill="${dliZoneColor(zoning, z.id)}"/><text x="${650 + (i + 0.5) * width}" y="560" text-anchor="middle" font-size="10">Z${z.id}</text>`;
    });
  } else if (metric !== 'none' && result) {
    for (let i = 0; i < 100; i++)
      legend += `<rect x="${650 + i * 2.5}" y="535" width="2.6" height="10" fill="${heatColor((i / 99) * 100)}"/>`;
    legend += `<text x="650" y="565" font-size="12">0</text><text x="900" y="565" text-anchor="end" font-size="12">${metric === 'sunlight' ? '100% sunlight' : result.openDli.toFixed(1) + ' mol m⁻² d⁻¹'}</text>`;
  }
  const baseTitle = zoning
    ? `Zoned DLI · ${dliLabel(result)}`
    : metric === 'sunlight'
      ? isPeriod(s)
        ? 'Period relative sunlight'
        : 'Daily relative sunlight'
      : metric === 'dli'
        ? result?.estimated
          ? dliLabel(result)
          : isPeriod(s)
            ? 'Mean daily light integral'
            : 'Daily light integral'
        : view === 'profile'
          ? 'Array profile'
          : view === 'oblique'
            ? 'Orthographic system view'
            : 'Array plan';
  const title = (options.control ? 'Control field · ' : '') + baseTitle;
  const provenance = provenanceRecord(s, result, { control: options.control });
  const wrap = (text, width = 135) => {
    const lines = [];
    let line = '';
    for (let word of String(text).trim().split(/\s+/)) {
      if (line && line.length + word.length + 1 > width) {
        lines.push(line);
        line = '';
      }
      while (word.length > width) {
        lines.push(word.slice(0, width));
        word = word.slice(width);
      }
      line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
    return lines;
  };
  const sensorFooter = [
    ...(fieldLabels.hidden.length > 0
      ? ['Some ID tags omitted to avoid overlap; use the field key and receiver coordinates below.']
      : []),
    ...glyphs.map(
      (glyph) =>
        `${glyph.sensors.map((v) => `${v.id} (${v.type}, z=${v.z} m)`).join('; ')}; cell ${glyph.cell.column + 1}/${glyph.cell.row + 1}`,
    ),
    ...(layers.plots
      ? s.crops.map(
          (c) =>
            `Bed ${c.id}: ${c.crop}; ${c.grid ? `cell ${c.grid.column + 1}/${c.grid.row + 1}; ${c.grid.columns} × ${c.grid.rows} cells` : `E ${c.x} / N ${c.y} m`}`,
        )
      : []),
  ].flatMap((text) => wrap(text));
  const fullFooter = [
    `${provenance.software} · ${provenance.date} · ${provenance.backend}`,
    `Analysis SHA-256: ${provenance.analysisHash}`,
    `Site: ${provenance.site}; receivers: ${provenance.receivers}`,
    `Weather: ${provenance.weather}`,
    `Source SHA-256: ${provenance.weatherSourceHash}`,
    `Weather inputs SHA-256: ${provenance.weatherInputHash}`,
    provenance.weatherAttribution,
    provenance.dli,
    provenance.model,
    provenance.assumptions,
    provenance.validation,
    ...(options.control
      ? [
          'Control field: same receiver footprint; no PV or PV land reservations. Uniform full-sun light from the source integration.',
        ]
      : [provenance.landUse, landUseDefinition]),
    ...provenance.warnings,
    ...sensorFooter,
  ].flatMap((text) => wrap(text));
  const drawingKey = annotations.map((a) => `${a.symbol}: ${a.label} ${a.value}`).join('; ');
  const footer = [
    ...(options.control ? ['CONTROL FIELD · no PV infrastructure · uniform open-field light'] : []),
    ...wrap(drawingKey),
    ...(options.compact
      ? [
          ...wrap(
            `${provenance.software} · ${provenance.backend}; complete provenance and assumptions in the report appendix.`,
          ),
          ...(sensorFooter.length
            ? [
                'ID tags: orange = sensors; green = crop beds. Full identities and receiver coordinates are in the report tables.',
              ]
            : []),
          ...(fieldLabels.hidden.length
            ? [
                'Some ID tags omitted to avoid overlap. All field items remain in the report tables.',
              ]
            : []),
          ...(metric !== 'none' ? wrap(provenance.dli) : []),
          ...(zones.length
            ? wrap(
                'U and C meet at the cropping edge; U + C = pitch. S is signed from the PV edge (negative beneath panels). B surrounds the design envelope.',
              )
            : []),
        ]
      : fullFooter),
  ];
  const legendStart = zones.length ? 664 : 615;
  const dliLegend = zoning
    ? zoning.zones
        .map(
          (z, i) =>
            `<rect x="40" y="${legendStart + i * 17 - 9}" width="14" height="11" fill="${dliZoneColor(zoning, z.id)}"/><text x="62" y="${legendStart + i * 17}" font-size="11">Z${z.id}: ${z.min.toFixed(3)}–${z.max.toFixed(3)} mol m⁻² d⁻¹ · mean ${z.mean.toFixed(3)} · ${z.areaPercent.toFixed(1)}% of receiver area</text>`,
        )
        .join('')
    : '';
  if (zoning)
    footer.unshift(
      ...wrap(
        `${zoning.method}; ${zoning.count} of ${zoning.requestedCount} requested zones. ${DLI_ZONE_NOTE}`,
      ),
    );
  const footerStart = legendStart + (zoning ? zoning.count * 17 + 10 : 0);
  const height = footerStart + 10 + footer.length * 13;
  const zoneLegend = zones.length
    ? Object.entries(zoneStyles)
        .filter(([kind]) => (arrayScope || kind !== 'perimeter') && layers[kind])
        .map(([kind, style], i) => {
          const x = 40 + (i % 2) * 475,
            y = 601 + Math.floor(i / 2) * 18;
          return `<rect x="${x}" y="${y - 10}" width="22" height="12" fill="url(#zone-${kind})" stroke="${style.color}"/><text x="${x + 30}" y="${y}" font-size="11">${escapeXml(style.symbol + ' · ' + style.label)}</text>`;
        })
        .join('') +
      `<text x="40" y="642" font-size="11">${view === 'profile' ? 'Ground reservations: centre cross-section along the across-row axis.' : 'Dashed blue: numerical receiver boundary (R). Ground layers lie beneath PV surfaces.'} Ground z = 0 m.</text>`
    : '';
  const footerSvg = footer
    .map(
      (line, i) =>
        `<text x="40" y="${footerStart + i * 13}" font-size="10">${escapeXml(line)}</text>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}" viewBox="0 0 1000 ${height}" role="img" aria-label="${title}"><metadata>${escapeXml(JSON.stringify(provenance))}</metadata>${zonePatternDefs()}<rect width="1000" height="${height}" fill="#fbfcf9"/><g font-family="Arial,sans-serif" fill="#243d3a"><text x="40" y="36" font-size="19" font-weight="bold">${escapeXml(title)}</text><text x="40" y="57" font-size="12">${escapeXml(s.metadata.title)}${result ? ' · ' + periodLabel(s) : ''}</text>${content}<path d="M 60 530 v 7 h ${bar * scale} v -7" fill="none" stroke="#243d3a" stroke-width="2"/><text x="60" y="558" font-size="12">${bar} m${view === 'oblique' ? ' (projection plane)' : ''}</text>${view === 'plan' ? '<path d="M 935 125 v -40 l -5 12 m 5 -12 l 5 12" fill="none" stroke="#243d3a" stroke-width="2"/><text x="935" y="75" text-anchor="middle" font-size="14">N</text>' : ''}<text x="40" y="583" font-size="11">Coordinates: east / north / up · dimensions in metres · ${escapeXml(view)} projection${ground ? ` · Ground z = 0 m${view === 'profile' ? '' : arrayScope ? ` · Receiver cells ${gridSpacingLabel(receivers)}` : ` · Grid ${ground.spacing} m`}` : ''}</text>${legend}${zoneLegend}${dliLegend}${footerSvg}</g></svg>`;
}
