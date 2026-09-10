import { cropCatalogVersion, cropCatalogSource } from '../domain/crop-catalog.js';
import { landUseSettings, landUseDefinition } from '../domain/land-use.js';
import { VERSION, cropSpacing } from '../domain/study.js';
export function provenanceRecord(s, r) {
  return {
    crop_catalog: `${cropCatalogVersion}; ${cropCatalogSource}; species-level identities with taxon URLs per crop bed`,
    software: `Agrivoltaic Experiment Designer ${r?.version || VERSION}`,
    schemaVersion: s.schemaVersion,
    landUse: `U ${landUseSettings(s).underPanelWidth} m; S ${Number(cropSpacing(s).cropSetback.toFixed(4))} m (signed); C ${Number(cropSpacing(s).croppingWidth.toFixed(4))} m; U + C = pitch; B ${landUseSettings(s).perimeterBuffer} m; receiver buffer R ${s.array.buffer} m. Planning overlays only; do not occlude or change light results.`,
    landUseDefinition,
    study: s.metadata.title,
    date: s.analysis.date,
    site: `${s.site.latitude}°, ${s.site.longitude}°; UTC ${s.site.utcOffset}; elevation ${s.site.elevation} m`,
    receivers: `${s.analysis.resolution} m nominal spacing; ${s.analysis.receiverHeight} m height; horizontal`,
    openField: r ? `${r.openWh} Wh/m²/day; ${r.openDli} mol/m²/day` : 'Not calculated',
    analysisHash: r?.studyHash || 'Not calculated',
    backend: r?.backend || 'Not calculated',
    weather: s.weather.name,
    weatherSourceHash: s.weather.hash || 'No retained source hash (synthetic or legacy)',
    weatherInputHash: r?.weatherInputHash || s.weather.normalizedHash || 'Not calculated',
    sourceSnapshot:
      s.weather.sourceText !== undefined
        ? 'Retained in study JSON'
        : 'Unavailable (synthetic or legacy)',
    weatherAttribution: s.weather.provenance?.attribution || 'User-supplied or synthetic',
    weatherUrl: s.weather.provenance?.url || 'Local',
    dli:
      r?.estimated === false
        ? 'Measured total PPFD; diffuse supplied or estimated with Spitters'
        : `Estimated DLI; PAR fraction ${s.analysis.parFraction}; ${s.analysis.photonFactor} µmol/J; Spitters diffuse partition`,
    model: `Perez / Reinhart ${s.analysis.patches} patches; ${s.analysis.interval} min direct; GHI energy conserved`,
    assumptions:
      'Opaque PV/supports; flat ground; horizontal receivers; no reflection, transmission or plant shading',
    validation:
      'CPU occlusion checked against Radiance; independent daily-energy and field validation pending',
    warnings: r?.warnings || [],
  };
}
