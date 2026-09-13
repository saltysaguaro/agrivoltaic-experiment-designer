import { moduleOptics, opticalAssumptions } from '../domain/optics.js';
import { isPeriod, periodLabel, analysisPeriod, dliLabel } from '../domain/period.js';
import {
  landUseSettings,
  landUseSummary,
  landUseDefinition,
  plotZoneOverlap,
} from '../domain/land-use.js';
import { getPose } from '../domain/geometry.js';
import {
  normalizeCropIdentity,
  cropCatalogVersion,
  cropCatalogSource,
  cropCatalogCitation,
} from '../domain/crop-catalog.js';
import { provenanceRecord } from './provenance.js';
import { dimensions, cropSpacing, VERSION } from '../domain/study.js';
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
function botanicalLabel(crop) {
  if (!crop.botanicalName) return 'Catalog selection required';
  const authorship = crop.scientificName.startsWith(crop.botanicalName)
    ? crop.scientificName.slice(crop.botanicalName.length).trim()
    : crop.scientificName;
  return `<i>${e(crop.botanicalName)}</i>${authorship ? ` ${e(authorship)}` : ''}`;
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
  const d = dimensions(s),
    land = landUseSettings(s),
    spacing = cropSpacing(s),
    areas = landUseSummary(s);
  return [
    ['Software', `Agrivoltaic Experiment Designer ${VERSION}; study schema ${s.schemaVersion}`],
    ['Study', s.metadata.title],
    ['Investigator', s.metadata.investigator || 'Not specified'],
    ['Coordinates', 'East / north / up (m); origin at array centre'],
    [
      'Module',
      `${s.module.length} × ${s.module.width} × ${s.module.thickness} m; ${s.module.power} W; ${s.module.bifacial ? 'bifacial, area-averaged gap transmission' : 'opaque'}`,
    ],
    ['Module gap', `${s.module.gap} m`],
    ['Racking', s.racking.type],
    ...(s.racking.type === 'pergola'
      ? [
          [
            'Pergola layout',
            s.racking.pergolaLayout === 'checkerboard'
              ? `Checkerboard; alternating table rows offset ${d.stagger} m along the row (half module-plus-gap spacing)`
              : 'Aligned table rows',
          ],
        ]
      : []),
    ['Axis / centre height · H', `${s.racking.height} m`],
    ['Support post width · p', `${s.racking.postSize} m`],
    [
      'Effective fixed tilt',
      ['single-axis', 'dual-axis'].includes(s.racking.type)
        ? 'Not applicable (tracking)'
        : `${getPose(s).tilt}°`,
    ],
    [
      'Tracker rotation limit',
      ['single-axis', 'dual-axis'].includes(s.racking.type)
        ? `±${s.racking.limit}°`
        : 'Not applicable',
    ],
    [
      'Tracker preview tilt',
      ['single-axis', 'dual-axis'].includes(s.racking.type)
        ? `${getPose(s).tilt}° (display only)`
        : 'Not applicable',
    ],
    [
      'Backtracking',
      s.racking.type === 'single-axis' ? String(s.racking.backtracking) : 'Not applicable',
    ],
    ['Table', `${s.table.high} across × ${s.table.wide} along; ${s.table.orientation}`],
    ['Tables per row / gap', `${s.row.tables} / ${s.row.tableGap} m`],
    [
      'Array',
      `${s.array.rows} rows; ${d.modules} modules; ${((d.modules * s.module.power) / 1000).toFixed(2)} kWp`,
    ],
    ['Row pitch · P', `${s.rowPair.pitch} m`],
    ['Numerical receiver buffer · R', `${s.array.buffer} m`],
    [
      'Under-row no-crop width · U',
      `${Number(land.underPanelWidth.toFixed(4))} m (centred continuous strip)`,
    ],
    ['Perimeter no-crop buffer · B', `${land.perimeterBuffer} m (outside design envelope)`],
    ['Design envelope', `${d.length.toFixed(3)} × ${(d.span + d.width).toFixed(3)} m`],
    ['Reserved land union area', `${areas.reservedArea.toFixed(2)} m²; overlaps counted once`],
    ['Envelope plus perimeter area', `${areas.outerArea.toFixed(2)} m²`],
    [
      'Plot / reservation conflicts',
      areas.conflicts.length
        ? areas.conflicts.map((p) => `${p.id}: ${p.area.toFixed(2)} m²`).join('; ')
        : 'None',
    ],
    ['Land-use definitions', landUseDefinition],
    [
      'Crop catalog',
      `${cropCatalogVersion}; ${cropCatalogSource}; crop groups use species-level botanical identities; cultivars are recorded separately. ${cropCatalogCitation}`,
    ],
    ['Groups / additional aisle', `${s.array.groupSize} rows per group / ${s.array.aisle} m`],
    [
      'PV-edge crop setback · S',
      `${Number(spacing.cropSetback.toFixed(4))} m (signed; negative beneath PV)`,
    ],
    [
      'Interrow cropping width · C',
      `${Number(spacing.croppingWidth.toFixed(4))} m; C + U = row pitch`,
    ],
    ['Surface-facing azimuth', `${s.array.azimuth}° clockwise from north`],
    [
      'Site',
      `${s.site.latitude}°, ${s.site.longitude}°; ${s.site.elevation} m; UTC ${s.site.utcOffset}`,
    ],
    ['Address / place', s.site.address || 'Coordinates entered manually'],
    [
      'UTC offset source',
      s.site.utcOffsetApproximate
        ? 'Longitude estimate; confirm local standard time'
        : 'User/default local standard time',
    ],
    [
      'Field layout',
      'Sensors at receiver-cell centres; crop boundaries follow receiver cells and rotate with the array. Packed marker offsets are display-only; sensor heights/depths remain installation metadata. Grid rows/columns are 1-based in tables.',
    ],
    ['Analysis date', periodLabel(s)],
    ['Analysis mode', s.analysis.period],
    [
      'DLI basis',
      isPeriod(s)
        ? 'Mean daily DLI across all included days; irradiation is the period total'
        : 'Single day',
    ],
    [
      'Module construction',
      s.module.bifacial ? 'Bifacial; transparent internal cell gaps' : 'Monofacial; opaque',
    ],
    [
      'Internal cell grid',
      `${s.module.cellColumns} columns × ${s.module.cellRows} rows; fixed outer dimensions`,
    ],
    [
      'Internal cell gaps X / Y',
      `${s.module.cellGapX} / ${s.module.cellGapY} m; opaque perimeter ${s.module.cellMargin} m`,
    ],
    [
      'Laminate transmission broadband / PAR',
      `${s.module.gapTransmission} / ${s.module.gapParTransmission}`,
    ],
    [
      'Effective module transmission broadband / PAR',
      `${(100 * moduleOptics(s.module).broadband).toFixed(4)}% / ${(100 * moduleOptics(s.module).par).toFixed(4)}%`,
    ],
    [
      isPeriod(s) ? 'Open-field period irradiation' : 'Open-field daily irradiation',
      r
        ? `${(r.openWh / 1000).toFixed(4)} kWh/m²/${isPeriod(s) ? 'period' : 'day'}`
        : 'Not calculated',
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
    ['Weather mode', s.weather.mode],
    ['Weather', s.weather.name],
    [
      'Weather dataset / retrieval',
      s.weather.provenance
        ? `${s.weather.provenance.model}; retrieved ${s.weather.provenance.retrievedAt}`
        : 'User-uploaded or illustrative',
    ],
    ['Weather attribution', s.weather.provenance?.attribution || 'User-supplied or synthetic'],
    ['Weather request', s.weather.provenance?.url || 'Local'],
    ['Weather source SHA-256', s.weather.hash || 'Unavailable (synthetic or legacy)'],
    ['Weather inputs SHA-256', r?.weatherInputHash || s.weather.normalizedHash || 'Not calculated'],
    [
      'Weather source snapshot',
      s.weather.sourceText !== undefined
        ? 'Retained in study JSON'
        : 'Unavailable (synthetic or legacy)',
    ],
    [
      'Weather input hash encoding',
      `${isPeriod(s) ? 'JSON array of [date, interval arrays] in day order. ' : ''}JSON arrays in interval order: minute, duration, GHI, DNI, DHI, PPFD or null, diffuse PPFD or null`,
    ],
    ['Requested compute engine', s.analysis.backend],
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
      '100 × receiver irradiation / open-field GHI over the selected period; 0% = no sunlight, 100% = open field',
    ],
    ['Tracker diffuse poses', '2° angle bins; direct uses exact pose'],
    [
      'Reflection / transmission',
      opticalAssumptions(s) + ' No reflected radiation or multiple reflections.',
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
  rows.length === 0
    ? '<p class="empty">None specified.</p>'
    : `<table><thead><tr>${heads.map((h) => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v) => `<td>${e(v ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export function publicationTables(s, r) {
  const rows = methodsRows(s, r);
  const groups = [
    [
      'PV system and geometry',
      [
        'Module',
        'Module gap',
        'Racking',
        'Axis / centre height · H',
        'Support post width · p',
        'Effective fixed tilt',
        'Tracker rotation limit',
        'Tracker preview tilt',
        'Backtracking',
        'Table',
        'Tables per row / gap',
        'Array',
        'Row pitch · P',
        'Groups / additional aisle',
        'Surface-facing azimuth',
      ],
    ],
    [
      'Land-use plan',
      [
        'Under-row no-crop width · U',
        'PV-edge crop setback · S',
        'Interrow cropping width · C',
        'Perimeter no-crop buffer · B',
        'Design envelope',
        'Reserved land union area',
        'Envelope plus perimeter area',
        'Numerical receiver buffer · R',
      ],
    ],
    [
      'Site, calculation and light outputs',
      [
        'Site',
        'Analysis date',
        'Weather mode',
        'Requested compute engine',
        'Solver',
        'Sky subdivision',
        'Receiver grid',
        'Numerical receivers',
        'Open-field daily irradiation',
        'Open-field period irradiation',
        'Analysis mode',
        'DLI basis',
        'Open-field DLI',
        'Receiver-area mean relative sunlight / DLI',
      ],
    ],
  ];
  const included = new Set(groups.flatMap(([, keys]) => keys));
  return {
    sections: groups.map(([title, keys]) => ({
      title,
      rows: keys.map((key) => rows.find(([name]) => name === key)).filter(Boolean),
    })),
    notes: rows.filter(([key]) => !included.has(key)),
  };
}
function pairedTable(rows) {
  const half = Math.ceil(rows.length / 2);
  return `<table class="parameters"><colgroup><col class="parameter"><col class="value"><col class="parameter"><col class="value"></colgroup><thead><tr><th scope="col">Parameter</th><th scope="col">Value</th><th scope="col">Parameter</th><th scope="col">Value</th></tr></thead><tbody>${rows
    .slice(0, half)
    .map(
      (row, i) =>
        `<tr>${[row, rows[i + half]].map((pair) => (pair ? `<th scope="row">${e(pair[0])}</th><td>${e(pair[1])}</td>` : '<td></td><td></td>')).join('')}</tr>`,
    )
    .join('')}</tbody></table>`;
}
export function reportHtml(s, r) {
  const publication = publicationTables(s, r);
  const crops = s.crops.map(normalizeCropIdentity);
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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${e(s.metadata.title)} · Methods</title><style>
*{box-sizing:border-box}body{max-width:1080px;margin:28px auto;padding:0 18px;font:12px/1.35 Arial,sans-serif;color:#203b37}
h1{font-size:24px;margin:12px 0 4px;overflow-wrap:anywhere}h2{font-size:14px;margin:14px 0 5px;break-after:avoid}p{margin:5px 0 9px}.report-meta{color:#50625a;overflow-wrap:anywhere}
table{width:100%;border-collapse:collapse;margin:5px 0 12px;font-size:11px;table-layout:fixed}td,th{padding:5px 7px;border-bottom:1px solid #cbd5ce;text-align:left;vertical-align:top;overflow-wrap:anywhere}thead th{background:#eaf0e9;border-top:1.5px solid #37564b}tbody th{font-weight:500;color:#395649}.parameters .parameter{width:20%}.parameters .value{width:30%}.parameters tr>:nth-child(3){border-left:1px solid #b9c8bc}
svg{width:100%;height:auto}figure{margin:22px 0;break-inside:avoid}figcaption{font-size:11px;color:#455d51;overflow-wrap:anywhere}.appendix{border-top:2px solid #37564b;margin-top:22px}.methods-notes{columns:2;column-gap:26px}.methods-notes p{break-inside:avoid;overflow-wrap:anywhere;font-size:11px;line-height:1.4}.methods-notes strong{display:block;margin-bottom:2px}button{padding:10px 18px;background:#183d38;color:white;border:0;cursor:pointer}.note{border-left:3px solid #af873e;padding:7px 10px;background:#fff8e7;font-size:11px}.empty{color:#60736a;font-style:italic}.table-scroll{overflow-x:auto}
@page{size:A4 landscape;margin:12mm}@media(max-width:650px){.methods-notes{columns:1}.parameters{min-width:610px}body{padding:0 12px}}
@media print{body{margin:0;padding:0;max-width:none;font-size:9pt}h1{font-size:17pt;margin-top:0}h2{font-size:10pt;margin:3mm 0 1mm}table{font-size:8pt;margin:1mm 0 3mm}td,th{padding:1.1mm 1.5mm}button{display:none}.note{font-size:8pt;padding:2mm 3mm}.report-meta{font-size:8pt}.table-scroll{overflow:visible}.parameters{min-width:0}.appendix{break-before:page;border-top:0}.methods-notes p{font-size:8pt}figure{break-before:page;margin:0}figure svg{max-height:165mm;max-width:100%;width:auto;display:block;margin:auto}figcaption{font-size:8pt}thead{display:table-header-group}tr{break-inside:avoid}a{color:inherit;text-decoration:none}}
</style></head><body><button onclick="window.print()">Print / save PDF</button><h1>${e(s.metadata.title)}</h1><p class="report-meta">${e(s.metadata.investigator || 'Investigator not specified')} · ${e(periodLabel(s))} · Agrivoltaic experimental design · SI units</p><p class="note">Development model: CPU occlusion matched Radiance on 45,990 rays; independent sky, daily-energy, GPU and field validation remain pending. ${r ? r.warnings.map(e).join(' ') : 'Irradiance has not been calculated.'}</p>${publication.sections.map((section) => `<section><h2>${e(section.title)}</h2><div class="table-scroll">${pairedTable(section.rows)}</div></section>`).join('')}<p class="report-meta">U / C / B identify the ground zones. S is the signed PV-edge setback; negative values place crops beneath panels. R is the separate numerical receiver buffer. Full definitions and reproducibility records follow in the appendix.</p><h2>Physical field instruments</h2>${table(
    [
      'ID / type',
      'E / N / Z (m)',
      'Receiver column / row',
      'Treatment / replicate',
      'Model / logger',
      'Notes',
    ],
    s.experimentSensors.map((v) => [
      v.id + ' · ' + v.type,
      `${v.x.toFixed(3)} / ${v.y.toFixed(3)} / ${v.z}`,
      v.grid ? `${v.grid.column + 1} / ${v.grid.row + 1}` : '—',
      v.treatment + ' / ' + v.replicate,
      v.model + ' / ' + v.logger + ' / ' + (v.channel || ''),
      v.notes + `; orientation ${v.azimuth ?? 0}° azimuth / ${v.tilt ?? 0}° tilt`,
    ]),
  )}<h2>Crop bed identities</h2>${crops.length ? `<table class="crop-identities"><thead><tr><th>Bed / crop</th><th>Botanical name / cultivar</th><th>Family</th><th>Taxonomy record</th></tr></thead><tbody>${crops.map((c) => `<tr><td>${e(c.id)} · ${e(c.crop)}</td><td>${botanicalLabel(c)}${c.cultivar ? `<br>Cultivar: ${e(c.cultivar)}` : ''}${c.notes ? `<br>Notes: ${e(c.notes)}` : ''}</td><td>${e(c.cropFamily || 'Unresolved')}</td><td>${c.taxonUrl ? `<a href="${e(c.taxonUrl)}">GBIF ${c.taxonKey}</a><br>Catalog ${e(c.cropCatalogVersion)}<br>${e(c.cropId)}` : 'No botanical identity assigned'}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">None specified.</p>'}<h2>Crop bed layout and light</h2>${table(
    [
      'ID / crop',
      'Treatment / replicate',
      'Area (m²)',
      'Starting column / row; columns × rows',
      `Mean / median / SD ${dliLabel(r)} (mol/m²/day)`,
      'Range DLI / sunlight; reservation overlap',
    ],
    s.crops.map((c) => {
      const p = plotStats(r, c);
      return [
        c.id + ' · ' + c.crop,
        c.treatment + ' / ' + c.replicate,
        (c.width * c.length).toFixed(3),
        c.grid
          ? `${c.grid.column + 1} / ${c.grid.row + 1}; ${c.grid.columns} × ${c.grid.rows}`
          : '—',
        p
          ? `${p.mean.toFixed(2)} / ${p.median.toFixed(2)} / ${p.sd.toFixed(2)}`
          : 'No receiver samples',
        `${p ? `${p.min.toFixed(2)}–${p.max.toFixed(2)} / ${p.sunlight.toFixed(1)}%` : '—'}; ${plotZoneOverlap(s, c).toFixed(2)} m² reserved`,
      ];
    }),
  )}${
    r?.monthly
      ? `<h2>Monthly light summary</h2>${table(
          [
            'Month',
            'Days',
            'Mean received kWh/m²',
            'Mean daily DLI (mol/m²/day)',
            'Relative sunlight (%)',
          ],
          r.monthly.map((m) => [
            m.month,
            m.days,
            (m.meanWh / 1000).toFixed(3),
            m.meanDli.toFixed(3),
            m.meanSunlight === null ? 'No incoming energy' : m.meanSunlight.toFixed(2),
          ]),
        )}`
      : ''
  }<section class="appendix"><h2>Methods, assumptions and provenance</h2><div class="methods-notes">${publication.notes.map(([key, value]) => `<p><strong>${e(key)}</strong>${e(value)}</p>`).join('')}</div></section>${figs.map(([view, metric], i) => `<figure>${figureSvg(s, r, view, metric, 'array', true, { compact: true, callouts: false })}<figcaption>Figure ${i + 1}. ${view} ${metric === 'none' ? 'system geometry' : metric + ' distribution'}. ${metric === 'dli' && r?.estimated ? 'DLI estimated from broadband irradiance.' : ''}</figcaption></figure>`).join('')}<p>Model references: Perez et al. (1993), doi:10.1016/0038-092X(93)90017-I; Spitters et al. (1986), doi:10.1016/0168-1923(86)90060-2. No reflected radiation is included.</p></body></html>`;
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
      'crop_catalog_id',
      'botanical_name',
      'scientific_name_with_authorship',
      'botanical_family',
      'cultivar',
      'taxonomy_key',
      'taxonomy_url',
      'crop_catalog_version',
      'irradiation_wh_m2',
      'analysis_start',
      'analysis_end',
      'dli_basis',
    ],
  ];
  for (const c of r?.cells || [])
    rows.push([
      'receiver',
      '',
      'numerical',
      c.x,
      c.y,
      c.z,
      c.sunlight,
      c.dli,
      ...Array(16).fill(''),
      c.wh,
    ]);
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
      v.notes +
        '; horizontal receiver estimate; ' +
        rowRelative(s, v) +
        (v.grid ? `; receiver_column=${v.grid.column + 1}; receiver_row=${v.grid.row + 1}` : ''),
    ]);
  }
  for (const raw of s.crops) {
    const p = normalizeCropIdentity(raw);
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
      `width_along_m=${p.width}; length_across_m=${p.length}; receiver_column=${p.grid ? p.grid.column + 1 : ''}; receiver_row=${p.grid ? p.grid.row + 1 : ''}; receiver_columns=${p.grid?.columns ?? ''}; receiver_rows=${p.grid?.rows ?? ''}; reserved_overlap_m2=${plotZoneOverlap(s, p).toFixed(4)}; median=${stats?.median ?? ''}; SD=${stats?.sd ?? ''}; notes=${p.notes || ''}`,
      p.cropId,
      p.botanicalName,
      p.scientificName,
      p.cropFamily,
      p.cultivar,
      p.taxonKey || '',
      p.taxonUrl,
      p.cropCatalogVersion,
    ]);
  }
  const period = analysisPeriod(s);
  for (const row of rows.slice(1)) {
    row[25] = period.start;
    row[26] = period.end;
    row[27] = isPeriod(s) ? 'mean daily over period' : 'single day';
  }
  for (const [key, value] of Object.entries(provenanceRecord(s, r)))
    rows.push(['metadata', key, Array.isArray(value) ? value.join('; ') : value]);
  return csv(rows);
}
export async function pngFigure(svg) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(
      3,
      16000 / img.naturalHeight,
      Math.sqrt(16000000 / (img.naturalWidth * img.naturalHeight)),
    );
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(Error('PNG exceeds this browser’s canvas capacity. Export SVG instead.')),
        'image/png',
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
