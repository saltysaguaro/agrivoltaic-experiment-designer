import { dimensions, VERSION } from '../domain/study.js';
import { figureSvg, escapeXml as e } from './figures.js';
import { plotStats, rowRelative, nearestCell } from '../experiment/layout.js';
export function download(content, name, type = 'text/plain') {
  const url = URL.createObjectURL(
      content instanceof Blob ? content : new Blob([content], { type }),
    ),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(rows) {
  return rows
    .map((row) =>
      row
        .map(
          (v) =>
            '"' +
            String(v ?? '')
              .replace(/^(?=[=+@\t\r])/, "'")
              .replaceAll('"', '""') +
            '"',
        )
        .join(','),
    )
    .join('\r\n');
}
export function methodsRows(s, r) {
  const d = dimensions(s);
  return [
    ['Software', `Agrivoltaic Experiment Designer ${VERSION}; study schema ${s.schemaVersion}`],
    ['Study', s.metadata.title],
    ['Investigator', s.metadata.investigator || 'Not specified'],
    ['Coordinates', 'East / north / up (m); origin at array centre'],
    [
      'Module',
      `${s.module.length} × ${s.module.width} × ${s.module.thickness} m; ${s.module.power} W; opaque`,
    ],
    ['Module gap', `${s.module.gap} m`],
    ['Racking', s.racking.type],
    ['Axis / centre height', `${s.racking.height} m`],
    ['Fixed tilt / tracker limit', `${s.racking.tilt}° / ±${s.racking.limit}°`],
    ['Backtracking', String(s.racking.backtracking)],
    ['Table', `${s.table.high} across × ${s.table.wide} along; ${s.table.orientation}`],
    ['Tables per row / gap', `${s.row.tables} / ${s.row.tableGap} m`],
    [
      'Array',
      `${s.array.rows} rows; ${d.modules} modules; ${((d.modules * s.module.power) / 1000).toFixed(2)} kWp`,
    ],
    ['Row pitch / buffer', `${s.rowPair.pitch} m / ${s.array.buffer} m`],
    ['Groups / additional aisle', `${s.array.groupSize} rows per group / ${s.array.aisle} m`],
    ['Crop setback / maintenance zone', `${s.rowPair.cropSetback} m / ${s.rowPair.maintenance} m`],
    ['Surface-facing azimuth', `${s.array.azimuth}° clockwise from north`],
    [
      'Site',
      `${s.site.latitude}°, ${s.site.longitude}°; ${s.site.elevation} m; UTC ${s.site.utcOffset}`,
    ],
    ['Analysis date', s.analysis.date],
    [
      'Open-field daily irradiation',
      r ? `${(r.openWh / 1000).toFixed(4)} kWh/m²/day` : 'Not calculated',
    ],
    [
      'Open-field DLI',
      r
        ? `${r.openDli.toFixed(3)} mol/m²/day${r.estimated ? ' (estimated)' : ''}`
        : 'Not calculated',
    ],
    [
      'Receiver-area mean relative sunlight / DLI',
      r
        ? `${r.meanSunlight.toFixed(3)}% / ${r.meanDli.toFixed(3)} mol/m²/day; includes perimeter receiver buffer`
        : 'Not calculated',
    ],
    [
      'Numerical receivers',
      r
        ? `${r.cells.length}; actual cell ${r.grid.dx.toFixed(4)} × ${r.grid.dy.toFixed(4)} m`
        : 'Not calculated',
    ],
    ['Weather', s.weather.name],
    [
      'Weather dataset / retrieval',
      s.weather.provenance
        ? `${s.weather.provenance.model}; retrieved ${s.weather.provenance.retrievedAt}`
        : 'User-uploaded or illustrative',
    ],
    ['Weather attribution', s.weather.provenance?.attribution || 'User-supplied or synthetic'],
    ['Weather request', s.weather.provenance?.url || 'Local'],
    ['Weather SHA-256', r?.weatherHash || s.weather.hash || 'Not calculated'],
    ['Solver', r?.backend || 'Not calculated'],
    ['Sky', 'Perez 1993 relative sky distribution normalized to DHI'],
    ['Sky subdivision', `Reinhart ${s.analysis.patches} patches`],
    [
      'Direct integration',
      `${s.analysis.interval} min; source interval energy conserved; GHI authoritative`,
    ],
    [
      'Receiver grid',
      `${s.analysis.resolution} m nominal; height ${s.analysis.receiverHeight} m; horizontal`,
    ],
    [
      'PAR method',
      r && !r.estimated
        ? 'Measured total PPFD; supplied diffuse PPFD or Spitters partition'
        : `Estimated: PAR fraction ${s.analysis.parFraction}; ${s.analysis.photonFactor} µmol/J; daily Spitters diffuse fraction`,
    ],
    [
      'Relative sunlight',
      '100 × receiver daily irradiation / open-field daily GHI; 0% = no sunlight, 100% = open field',
    ],
    ['Tracker diffuse poses', '2° angle bins; direct uses exact pose'],
    [
      'Reflection / transmission',
      'None; opaque modules and modeled supports; no multiple reflections',
    ],
    ['Solar position', 'NOAA fractional-year approximation; geometric, no refraction'],
    [
      'Scientific validation',
      'Analytical invariant tests; CPU occlusion matched Radiance on 45,990 rays / 9 cases. Independent sky, daily-energy and GPU validation pending',
    ],
    ['Analysis inputs SHA-256', r?.studyHash || 'Not calculated'],
  ];
}
const table = (heads, rows) =>
  `<table><thead><tr>${heads.map((h) => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v) => `<td>${e(v ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export function reportHtml(s, r) {
  const figs = [
    ['plan', 'none'],
    ['profile', 'none'],
    ['oblique', 'none'],
    ...(r
      ? [
          ['plan', 'sunlight'],
          ['plan', 'dli'],
        ]
      : []),
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${e(s.metadata.title)} · Methods</title><style>body{max-width:1000px;margin:40px auto;font:14px/1.5 Arial;color:#203b37}h1{font-size:28px}h2{margin-top:30px}table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px}td,th{padding:8px;border-bottom:1px solid #cbd5ce;text-align:left;overflow-wrap:anywhere}th{background:#eef2ed}svg{width:100%;height:auto}figure{margin:20px 0;break-inside:avoid}button{padding:12px 20px;background:#183d38;color:white;border:0;cursor:pointer}.note{background:#fff4d7;padding:14px}@page{size:A4 landscape;margin:14mm}@media print{body{margin:0;max-width:none}button{display:none}figure{break-before:page}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body><button onclick="window.print()">Print / save PDF</button><h1>${e(s.metadata.title)}</h1><p>Agrivoltaic experimental design · Methods package</p><p class="note">Development model: CPU occlusion matched Radiance on 45,990 rays; independent sky, daily-energy, GPU and field validation remain pending. ${r ? r.warnings.map(e).join(' ') : 'Irradiance has not been calculated.'}</p><h2>System and modeling parameters</h2>${table(['Parameter', 'Value'], methodsRows(s, r))}<h2>Physical field instruments</h2>${table(
    ['ID / type', 'E / N / Z (m)', 'Treatment / replicate', 'Model / logger', 'Notes'],
    s.experimentSensors.map((v) => [
      v.id + ' · ' + v.type,
      `${v.x} / ${v.y} / ${v.z}`,
      v.treatment + ' / ' + v.replicate,
      v.model + ' / ' + v.logger + ' / ' + (v.channel || ''),
      v.notes + `; orientation ${v.azimuth ?? 0}° azimuth / ${v.tilt ?? 0}° tilt`,
    ]),
  )}<h2>Crop plots</h2>${table(
    [
      'ID / crop',
      'Treatment / replicate',
      'Area (m²)',
      'Mean / median / SD DLI (mol/m²/day)',
      'Range DLI / relative sunlight',
    ],
    s.crops.map((c) => {
      const p = plotStats(r, c);
      return [
        c.id + ' · ' + c.crop,
        c.treatment + ' / ' + c.replicate,
        c.width * c.length,
        p
          ? `${p.mean.toFixed(2)} / ${p.median.toFixed(2)} / ${p.sd.toFixed(2)}`
          : 'No receiver samples',
        p ? `${p.min.toFixed(2)}–${p.max.toFixed(2)} / ${p.sunlight.toFixed(1)}%` : '—',
      ];
    }),
  )}${figs.map(([view, metric], i) => `<figure>${figureSvg(s, r, view, metric)}<figcaption>Figure ${i + 1}. ${view} ${metric === 'none' ? 'system geometry' : metric + ' distribution'}. ${metric === 'dli' && r?.estimated ? 'DLI estimated from broadband irradiance.' : ''}</figcaption></figure>`).join('')}<p>Model references: Perez et al. (1993), doi:10.1016/0038-092X(93)90017-I; Spitters et al. (1986), doi:10.1016/0168-1923(86)90060-2. No reflected radiation is included.</p></body></html>`;
}
export function exportCsv(s, r) {
  const rows = [
    [
      'record',
      'id',
      'type',
      'east_m',
      'north_m',
      'z_m',
      'relative_sunlight_percent',
      'dli_mol_m2_day',
      'treatment',
      'replicate',
      'model',
      'logger',
      'channel',
      'azimuth_deg',
      'tilt_deg',
      'notes',
    ],
  ];
  for (const c of r?.cells || [])
    rows.push(['receiver', '', 'numerical', c.x, c.y, c.z, c.sunlight, c.dli]);
  for (const v of s.experimentSensors) {
    const c = nearestCell(r, v.x, v.y);
    rows.push([
      'sensor',
      v.id,
      v.type,
      v.x,
      v.y,
      v.z,
      c?.sunlight,
      c?.dli,
      v.treatment,
      v.replicate,
      v.model,
      v.logger,
      v.channel,
      v.azimuth,
      v.tilt,
      v.notes + '; nearest horizontal receiver estimate; ' + rowRelative(s, v),
    ]);
  }
  for (const p of s.crops) {
    const stats = plotStats(r, p);
    rows.push([
      'plot',
      p.id,
      p.crop,
      p.x,
      p.y,
      0,
      stats?.sunlight,
      stats?.mean,
      p.treatment,
      p.replicate,
      '',
      '',
      '',
      '',
      '',
      `width=${p.width}; length=${p.length}; median=${stats?.median ?? ''}; SD=${stats?.sd ?? ''}`,
    ]);
  }
  return csv(rows);
}
export async function pngFigure(svg) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 1800;
    canvas.getContext('2d').drawImage(img, 0, 0, 3000, 1800);
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
