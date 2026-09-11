import { VERSION, migrateStudy, studySchema, sha256, designIssues } from '../domain/study.js';
import { normalizeLayout } from '../experiment/grid-layout.js';
import { unresolvedCrops } from '../domain/crop-catalog.js';
import { verifyWeatherRecord } from '../irradiance/weather-record.js';
import { sampleWeather } from '../irradiance/solar.js';
import { csv, exportCsv, methodsRows, reportHtml } from '../report/export.js';
import { figureSvg } from '../report/figures.js';
import { provenanceRecord } from '../report/provenance.js';
import { validateResult } from './results.js';
import { writeZip, readZip, MAX_ARCHIVE } from './zip.js';

export const PROJECT_FORMAT = 'org.agrivoltaic-experiment-designer.project';
export const PACKAGE_FORMAT = 'org.agrivoltaic-experiment-designer.package';
const encode = new TextEncoder(),
  decode = new TextDecoder('utf-8', { fatal: true });
const json = (value) => JSON.stringify(value, null, 2) + '\n';
export function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object')
    return (
      '{' +
      Object.keys(value)
        .filter((k) => value[k] !== undefined)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k]))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
async function digest(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
function validateIds(study) {
  for (const [name, items] of [
    ['sensor', study.experimentSensors],
    ['crop bed', study.crops],
  ]) {
    if (items.some((v) => !v.id.trim()) || new Set(items.map((v) => v.id)).size !== items.length)
      throw Error(`Every ${name} needs a non-empty, unique ID.`);
  }
}
export function projectFilename(study) {
  const stem =
    study.metadata.title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 75) || 'agrivoltaic-project';
  return `${stem}-${study.analysis.date}.agrivoltaic.zip`;
}
export async function projectDocument(study, result) {
  const normalized = studySchema.parse(normalizeLayout(migrateStudy(study)));
  validateIds(normalized);
  await verifyWeatherRecord(normalized.weather);
  let savedResult = null;
  const warnings = [...designIssues(normalized)];
  if (result) {
    try {
      savedResult = await validateResult(normalized, result);
    } catch (error) {
      warnings.push('Light results omitted: ' + error.message);
    }
  }
  if (!savedResult)
    warnings.push(
      'Design and research plan only; no matching calculated light results are included.',
    );
  if (normalized.weather.sourceText === undefined)
    warnings.push(
      normalized.weather.mode === 'sample'
        ? 'Weather is explicitly illustrative; generated intervals are included.'
        : 'Original weather source text is unavailable in this project.',
    );
  const unresolved = unresolvedCrops(normalized);
  if (unresolved.length)
    warnings.push(`${unresolved.length} crop bed(s) still need a catalog identity.`);
  const payload = JSON.parse(JSON.stringify({ study: normalized, result: savedResult }));
  return {
    format: PROJECT_FORMAT,
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    software: { name: 'Agrivoltaic Experiment Designer', version: VERSION },
    contentSha256: await sha256(canonicalJson(payload)),
    ...payload,
    warnings,
  };
}
export async function buildProjectPackage(study, result, onProgress = () => {}) {
  onProgress('Validating project and saved light results');
  const project = await projectDocument(study, result),
    s = project.study,
    r = project.result;
  const files = new Map(),
    types = new Map();
  const add = (path, value, mediaType) => {
    files.set(path, encode.encode(value));
    types.set(path, mediaType);
  };
  add('project.json', json(project), 'application/json');
  add('provenance.json', json(provenanceRecord(s, r)), 'application/json');
  add('tables/data.csv', exportCsv(s, r), 'text/csv');
  add('tables/methods.csv', csv([['Parameter', 'Value'], ...methodsRows(s, r)]), 'text/csv');
  const rows = s.weather.rows.length
    ? s.weather.rows
    : s.weather.mode === 'sample'
      ? sampleWeather(s)
      : [];
  add(
    'weather/intervals.csv',
    csv([
      ['minute', 'duration', 'ghi', 'dni', 'dhi', 'ppfd', 'diffusePpfd'],
      ...rows.map((v) => [
        v.minute,
        v.duration,
        v.ghi,
        v.dni,
        v.dhi,
        v.ppfd ?? '',
        v.diffusePpfd ?? '',
      ]),
    ]),
    'text/csv',
  );
  if (s.weather.sourceText !== undefined)
    add('weather/source.txt', s.weather.sourceText, 'text/plain');
  onProgress('Preparing the standalone methods report');
  add('report.html', reportHtml(s, r), 'text/html');
  const figures = [
    ['plan', 'none', 'plan'],
    ['profile', 'none', 'profile'],
    ['oblique', 'none', 'oblique'],
    ...(r
      ? [
          ['plan', 'sunlight', 'sunlight'],
          ['plan', 'dli', 'dli'],
        ]
      : []),
  ];
  for (const [view, metric, name] of figures) {
    onProgress('Preparing ' + name + ' figure');
    add(`figures/${name}.svg`, figureSvg(s, r, view, metric, 'report', true), 'image/svg+xml');
  }
  add(
    'README.md',
    `# ${s.metadata.title}\n\nAgrivoltaic system and research plan, exported ${project.createdAt}.\nInvestigator / group: ${s.metadata.investigator || 'Not specified'}\nSoftware: Agrivoltaic Experiment Designer ${VERSION}; project format 1; Study schema ${s.schemaVersion}.\n\n## Read or reopen\n\n- Open report.html in a browser to read the methods, field tables and figures, or print/save a PDF. It is self-contained and needs no network.\n- Open this entire .agrivoltaic.zip file in the designer to resume editing. Alternatively unzip it and open project.json.\n- project.json is the authoritative editable record: complete study, field layouts, botanical identities, weather source/intervals and ${r ? 'saved receiver results' : 'an explicit absence of calculated results'}.\n- figures/ contains publication-ready vector SVGs. tables/data.csv uses row types for receivers, sensors and crop beds; tables/methods.csv carries every methods parameter.\n- weather/intervals.csv preserves local-day interval starts (minutes after midnight), duration (minutes), irradiance (W/m²), and PPFD where available (µmol/m²/s). Site UTC offset is in project.json. ${s.weather.sourceText !== undefined ? 'weather/source.txt preserves the retained original source text in UTF-8; its original format is recorded in project.json.' : 'No original source text was available. Illustrative intervals, if selected, are generated by the recorded software version.'}\n- provenance.json records model assumptions, weather attribution, actual calculation backend and versions. manifest.json inventories every other file with byte length and SHA-256.\n\n## Research reference\n\nTitle: ${s.metadata.title}\nCreators: ${s.metadata.investigator || 'Not specified'}\nAnalysis date: ${s.analysis.date}\nProject content SHA-256: ${project.contentSha256}\nCalculation: ${r ? `${r.backend}, software ${r.version}, created ${r.createdAt}` : 'Not calculated'}\n\nDeposit this ZIP alongside the publication and cite the persistent identifier assigned by your repository. No DOI or reuse license is assigned by the application. Weather and botanical data retain their source attribution; specify your research-data license in the repository record.\n\n## Scope and integrity\n\nThis is a design and numerical light-model record, not a claim of measured sensor observations or crop yield. Imported results are restored only when their inputs, receiver grid and weather match; restoring is not rerunning or independently validating the simulation. Checksums detect alteration and transfer errors; they do not authenticate authorship. The package contains site coordinates, investigator information and field notes as entered in the project.\n\n${project.warnings.length ? project.warnings.map((w) => '- ' + w).join('\n') : 'Matching calculated light results are included.'}\n\nPackage format documentation: docs/PROJECT-PACKAGES.md in the application source.\n`,
    'text/markdown',
  );
  onProgress('Computing file checksums');
  const inventory = [];
  for (const [path, data] of files)
    inventory.push({
      path,
      mediaType: types.get(path),
      bytes: data.length,
      sha256: await digest(data),
    });
  const manifest = {
    format: PACKAGE_FORMAT,
    formatVersion: 1,
    packageId: crypto.randomUUID(),
    createdAt: project.createdAt,
    software: project.software,
    title: s.metadata.title,
    project: 'project.json',
    contentSha256: project.contentSha256,
    resultIncluded: Boolean(r),
    files: inventory,
  };
  const archive = await writeZip(
    new Map([['manifest.json', encode.encode(json(manifest))], ...files]),
    { onProgress },
  );
  return {
    archive,
    filename: projectFilename(s),
    warnings: project.warnings,
    resultIncluded: Boolean(r),
    fileCount: files.size + 1,
  };
}
export async function readProject(input, name = 'project.json', onProgress = () => {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length > MAX_ARCHIVE) throw Error('Project files must be smaller than 128 MiB.');
  let data,
    integrity = 'Legacy JSON (no package manifest)',
    manifest = null;
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    onProgress('Checking package files and checksums');
    const files = await readZip(bytes);
    if (!files.has('manifest.json'))
      throw Error('This ZIP is not a project package: manifest.json is missing.');
    manifest = JSON.parse(decode.decode(files.get('manifest.json')));
    if (
      manifest.format !== PACKAGE_FORMAT ||
      manifest.formatVersion !== 1 ||
      manifest.project !== 'project.json'
    )
      throw Error('Unsupported project package format/version.');
    if (
      !Array.isArray(manifest.files) ||
      manifest.files.some((v) => !v || typeof v.path !== 'string') ||
      manifest.files.length !== files.size - 1 ||
      new Set(manifest.files.map((v) => v.path)).size !== manifest.files.length
    )
      throw Error('Package inventory does not match its files.');
    for (const entry of manifest.files) {
      const file = files.get(entry.path);
      if (
        entry.path === 'manifest.json' ||
        !file ||
        entry.bytes !== file.length ||
        entry.sha256 !== (await digest(file))
      )
        throw Error('Package checksum mismatch: ' + entry.path);
    }
    if (!files.has('project.json')) throw Error('The editable project record is missing.');
    data = JSON.parse(decode.decode(files.get('project.json')));
    integrity = 'All package file checksums verified';
  } else data = JSON.parse(decode.decode(bytes));
  onProgress('Validating the design, weather and research layout');
  if (!data || typeof data !== 'object') throw Error('The file does not contain a project.');
  if (data.format && (data.format !== PROJECT_FORMAT || data.formatVersion !== 1))
    throw Error('Unsupported project format/version.');
  if (manifest && data.format !== PROJECT_FORMAT)
    throw Error('The package does not contain a versioned project record.');
  if (data.format === PROJECT_FORMAT) {
    const hash = await sha256(canonicalJson({ study: data.study, result: data.result }));
    if (data.contentSha256 !== hash || (manifest && manifest.contentSha256 !== hash))
      throw Error('Project content SHA-256 does not match.');
    if (!manifest) integrity = 'Project content checksum verified';
  } else if (data.studySha256) {
    if (data.studySha256 !== (await sha256(JSON.stringify(data.study))))
      throw Error('Legacy study SHA-256 does not match.');
    integrity = 'Legacy study checksum verified';
  }
  const raw = data.study || data,
    study = studySchema.parse(normalizeLayout(migrateStudy(raw)));
  validateIds(study);
  await verifyWeatherRecord(study.weather);
  const warnings = [...designIssues(study)];
  if (
    canonicalJson(raw.experimentSensors) !== canonicalJson(study.experimentSensors) ||
    canonicalJson(raw.crops) !== canonicalJson(study.crops)
  )
    warnings.push(
      'Legacy field layouts or crop identities were normalized to the current schema and receiver grid.',
    );
  let result = null;
  if (data.result) {
    try {
      result = await validateResult(study, data.result);
    } catch (error) {
      warnings.push('Light results will not be restored: ' + error.message);
    }
  }
  if (result)
    warnings.push(
      `Saved calculation from software ${result.version}; restored data have not been recalculated or independently validated.`,
    );
  if (unresolvedCrops(study).length)
    warnings.push('Some imported crop beds need a catalog identity.');
  return {
    study,
    result,
    name,
    integrity,
    warnings,
    createdAt: data.createdAt || manifest?.createdAt || null,
  };
}
