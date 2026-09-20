import { dliZones, dliZoneSummary } from '../domain/dli-zones.js';
import { gridSpacingLabel, cellSamplingDescription } from '../domain/receiver-grid.js';
import { fieldStudy, controlResult, controlLayers } from '../experiment/control-field.js';
import { designLayers } from '../ui/display-layers.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { moduleOptics, opticalAssumptions } from '../domain/optics.js';
import { rackingOrientation } from '../domain/racking-orientation.js';
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
import { figureSvg, createFigureContext, escapeXml as e } from './figures.js';
import { plotStats, rowRelative, nearestCell } from '../experiment/layout.js';
export { download } from './download.js';
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
              .replace(typeof v === 'number' ? /$^/ : /^(?=\s*[=+@-]|[\t\r])/, "'")
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
    [rackingOrientation(s).label, `${s.array.azimuth}° clockwise from north`],
    ['Rack orientation', rackingOrientation(s).description],
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
      'Sensors are at receiver-cell centres. Single beds follow whole cells; bulk beds use exact cropping-area divisions and may cross cell boundaries. All beds rotate with the array. Exact-bed light statistics weight cell values by overlap area, assuming uniform light within each cell. Packed marker offsets are display-only; sensor heights/depths remain installation metadata. Grid rows/columns are 1-based in tables; fractional values describe exact bed boundaries.',
    ],
    [
      'Control field',
      s.controlField?.initialized
        ? `Independent full-sun field; same ${receiverGridSpec(s).width.toFixed(3)} × ${receiverGridSpec(s).height.toFixed(3)} m receiver footprint and grid as Agrivoltaic; no PV infrastructure. ${s.controlField.experimentSensors.length} sensors; ${s.controlField.crops.length} crop beds. Copied on first entry, then edited independently. Coordinates are local to each field, not a surveyed control-site position.`
        : 'Not initialized',
    ],
    [
      'Control light assumption',
      'Spatially uniform unobstructed horizontal reference from the same site, weather, dates and PAR conversion (or measured PPFD). 100% relative sunlight; DLI equals open-field DLI, averaged daily for a period. Does not represent measured field observations.',
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
      r ? `${r.cells.length}; actual cell ${gridSpacingLabel(r.grid, 4)}` : 'Not calculated',
    ],
    ['Zoned DLI', dliZoneSummary(dliZones(r, s.analysis.dliZoneCount))],
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
    ['Within-cell sampling', cellSamplingDescription(s.analysis.samplesPerCell)],
    [
      'Direct integration',
      `${s.analysis.interval} min; source interval energy conserved; GHI authoritative`,
    ],
    [
      'Receiver grid',
      `${s.analysis.gridAlignment === 'row-centres' ? `${s.analysis.cellsPerRow} cells between adjacent PV row centre lines, including wider aisles; ${s.analysis.resolution} m nominal along-row spacing; outer-buffer cells fitted to footprint; area-weighted summaries` : `${s.analysis.resolution} m nominal uniform spacing`}; height ${s.analysis.receiverHeight} m; horizontal`,
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
      'Analytical invariant tests; CPU occlusion matched Radiance on 51,100 rays / 10 cases. Independent sky, daily-energy and GPU validation pending',
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
        rackingOrientation(s).label,
        'Rack orientation',
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
function controlReport(study, result, context) {
  if (!study.controlField?.initialized) return '<h2>Control field</h2><p>Not initialized.</p>';
  const s = fieldStudy(study, true),
    r = controlResult(result),
    g = receiverGridSpec(s);
  return `<section><h2>Control field · no PV infrastructure</h2><p>Same ${g.width.toFixed(3)} × ${g.height.toFixed(3)} m footprint and receiver cells as Agrivoltaic. Coordinates are relative to the control-field centre. The layout was copied on first entry and is independently editable; IDs are distinct.</p><p>${r ? `Uniform ${e(dliLabel(r))}: ${r.openDli.toFixed(3)} mol/m²/day; 100% relative sunlight. ${isPeriod(s) ? 'DLI is the mean daily value across the selected period.' : ''}` : 'Full-sun DLI not calculated.'} The unobstructed horizontal reference uses the same site, weather and PAR inputs as the agrivoltaic calculation; there are no PV occluders or PV land reservations.</p><h2>Control physical field instruments</h2>${table(
    [
      'ID / type',
      'E / N / Z (m)',
      'Column / row',
      'Treatment / replicate',
      'Model / logger / channel',
      'Orientation / notes',
    ],
    s.experimentSensors.map((v) => [
      v.id + ' · ' + v.type,
      `${v.x.toFixed(3)} / ${v.y.toFixed(3)} / ${v.z}`,
      v.grid ? `${v.grid.column + 1} / ${v.grid.row + 1}` : '—',
      `${v.treatment} / ${v.replicate}`,
      `${v.model} / ${v.logger} / ${v.channel}`,
      `${v.azimuth}° azimuth / ${v.tilt}° tilt; ${v.notes}`,
    ]),
  )}<h2>Control crop bed identities and layout</h2>${table(
    [
      'ID / crop',
      'Botanical identity / cultivar',
      'Treatment / replicate',
      'E / N; width × length (m)',
      'Column / row; columns × rows',
      `${dliLabel(r)} (mol/m²/day); notes`,
    ],
    s.crops.map((c) => [
      c.id + ' · ' + c.crop,
      `${c.scientificName || c.botanicalName || 'Catalog selection required'}; family ${c.cropFamily}; cultivar ${c.cultivar}; ${c.taxonUrl}; catalog ${c.cropCatalogVersion} / ${c.cropId}`,
      `${c.treatment} / ${c.replicate}`,
      `${c.x.toFixed(3)} / ${c.y.toFixed(3)}; ${c.width.toFixed(3)} × ${c.length.toFixed(3)}`,
      c.grid ? `${c.grid.column + 1} / ${c.grid.row + 1}; ${c.grid.columns} × ${c.grid.rows}` : '—',
      `${r ? `Mean / median / min / max ${r.openDli.toFixed(3)}; SD 0; sunlight 100%` : 'Not calculated'}; ${c.notes}`,
    ]),
  )}</section><figure>${figureSvg(s, r, 'plan', r ? 'dli' : 'none', 'array', true, { context, control: true, compact: true, callouts: false, layers: controlLayers(designLayers) })}<figcaption>Control field layout, with uniform full-sun light when calculated. Ground grid at z = 0; sensor installation heights/depths are recorded in the table.</figcaption></figure>`;
}
export function reportHtml(s, r, sharedContext) {
  const context = sharedContext || createFigureContext();
  try {
    return makeReportHtml(s, r, context);
  } finally {
    if (!sharedContext) context.dispose();
  }
}
function makeReportHtml(s, r, context) {
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
          ['plan', 'zoned-dli'],
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
</style></head><body><button onclick="window.print()">Print / save PDF</button><h1>${e(s.metadata.title)}</h1><p class="report-meta">${e(s.metadata.investigator || 'Investigator not specified')} · ${e(periodLabel(s))} · Agrivoltaic experimental design · SI units</p><p class="note">Development model: automated source, ray and CPU/GPU checks cover the documented fixtures; independent field validation and broader device coverage remain required. See versioned validation records. ${r ? r.warnings.map(e).join(' ') : 'Irradiance has not been calculated.'}</p>${publication.sections.map((section) => `<section><h2>${e(section.title)}</h2><div class="table-scroll">${pairedTable(section.rows)}</div></section>`).join('')}<p class="report-meta">U / C / B identify the ground zones. S is the signed PV-edge setback; negative values place crops beneath panels. R is the separate numerical receiver buffer. Full definitions and reproducibility records follow in the appendix.</p><h2>Agrivoltaic physical field instruments</h2>${table(
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
  )}<h2>Agrivoltaic crop bed identities</h2>${crops.length ? `<table class="crop-identities"><thead><tr><th>Bed / crop</th><th>Botanical name / cultivar</th><th>Family</th><th>Taxonomy record</th></tr></thead><tbody>${crops.map((c) => `<tr><td>${e(c.id)} · ${e(c.crop)}</td><td>${botanicalLabel(c)}${c.cultivar ? `<br>Cultivar: ${e(c.cultivar)}` : ''}${c.notes ? `<br>Notes: ${e(c.notes)}` : ''}</td><td>${e(c.cropFamily || 'Unresolved')}</td><td>${c.taxonUrl ? `<a href="${e(c.taxonUrl)}">GBIF ${c.taxonKey}</a><br>Catalog ${e(c.cropCatalogVersion)}<br>${e(c.cropId)}` : 'No botanical identity assigned'}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">None specified.</p>'}<h2>Agrivoltaic crop bed layout and light</h2>${table(
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
  }${controlReport(s, r, context)}<section class="appendix"><h2>Methods, assumptions and provenance</h2><div class="methods-notes">${publication.notes.map(([key, value]) => `<p><strong>${e(key)}</strong>${e(value)}</p>`).join('')}</div></section>${figs.map(([view, metric], i) => `<figure>${figureSvg(s, r, view, metric, 'array', true, { context, compact: true, callouts: false })}<figcaption>Figure ${i + 1}. ${view} ${metric === 'none' ? 'system geometry' : metric + ' distribution'}. ${metric === 'dli' && r?.estimated ? 'DLI estimated from broadband irradiance.' : ''}</figcaption></figure>`).join('')}<p>Model references: Perez et al. (1993), doi:10.1016/0038-092X(93)90017-I; Spitters et al. (1986), doi:10.1016/0168-1923(86)90060-2. No reflected radiation is included.</p></body></html>`;
}
export function exportCsv(study, result) {
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
      'field',
      'dli_zone',
    ],
  ];
  for (const [field, s, r] of [
    ['agrivoltaic', study, result],
    ...(study.controlField?.initialized
      ? [['control', fieldStudy(study, true), controlResult(result)]]
      : []),
  ]) {
    const start = rows.length;
    const zoning = dliZones(r, s.analysis.dliZoneCount);
    for (const [index, c] of (r?.cells || []).entries())
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
        '',
        '',
        '',
        field,
        zoning.cellZones[index],
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
        `bed_alignment=${p.gridMode || 'cells'}; width_along_m=${p.width}; length_across_m=${p.length}; receiver_column=${p.grid ? p.grid.column + 1 : ''}; receiver_row=${p.grid ? p.grid.row + 1 : ''}; receiver_columns=${p.grid?.columns ?? ''}; receiver_rows=${p.grid?.rows ?? ''}; reserved_overlap_m2=${(field === 'control' ? 0 : plotZoneOverlap(s, p)).toFixed(4)}; median=${stats?.median ?? ''}; SD=${stats?.sd ?? ''}; notes=${p.notes || ''}`,
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
    for (const row of rows.slice(start)) row[28] = field;
  }
  const s = study,
    r = result;
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
