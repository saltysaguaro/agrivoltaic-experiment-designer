import { moduleOptics, opticalAssumptions } from '../domain/optics.js';
import { isPeriod, periodLabel, dliLabel } from '../domain/period.js';
import { cropCatalogVersion, cropCatalogSource } from '../domain/crop-catalog.js';
import { landUseSettings, landUseDefinition } from '../domain/land-use.js';
import { VERSION, cropSpacing, dimensions } from '../domain/study.js';
export function provenanceRecord(s, r) {
  return {
    crop_catalog: `${cropCatalogVersion}; ${cropCatalogSource}; species-level identities with taxon URLs per crop bed`,
    software: `Agrivoltaic Experiment Designer ${r?.version || VERSION}`,
    schemaVersion: s.schemaVersion,
    racking: s.racking.type,
    ...(s.racking.type === 'pergola'
      ? {
          pergolaLayout:
            s.racking.pergolaLayout === 'checkerboard'
              ? `Checkerboard; alternating table rows offset ${dimensions(s).stagger} m along the row`
              : 'Aligned table rows',
        }
      : {}),
    landUse: `U ${landUseSettings(s).underPanelWidth} m; S ${Number(cropSpacing(s).cropSetback.toFixed(4))} m (signed); C ${Number(cropSpacing(s).croppingWidth.toFixed(4))} m; U + C = pitch; B ${landUseSettings(s).perimeterBuffer} m; receiver buffer R ${s.array.buffer} m. Planning overlays only; do not occlude or change light results.`,
    landUseDefinition,
    study: s.metadata.title,
    date: periodLabel(s),
    site: `${s.site.latitude}°, ${s.site.longitude}°; UTC ${s.site.utcOffset}; elevation ${s.site.elevation} m`,
    receivers: `${s.analysis.resolution} m nominal spacing; ${s.analysis.receiverHeight} m height; horizontal`,
    openField: r
      ? `${r.openWh} Wh/m²/${isPeriod(s) ? 'period' : 'day'}; ${r.openDli} mol/m²/day${isPeriod(s) ? ' (period mean)' : ''}`
      : 'Not calculated',
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
    dliBasis: isPeriod(s)
      ? 'Arithmetic mean daily DLI over every included day; irradiation is a period total; sunlight is the ratio of period energy totals.'
      : 'Single-day irradiation and DLI.',
    moduleTransmission: JSON.stringify(moduleOptics(s.module)),
    dli:
      r?.estimated === false
        ? 'Measured total PPFD; diffuse supplied or estimated with Spitters'
        : `Estimated DLI; PAR fraction ${s.analysis.parFraction}; ${s.analysis.photonFactor} µmol/J; Spitters diffuse partition`,
    model: `Perez / Reinhart ${s.analysis.patches} patches; ${s.analysis.interval} min direct; GHI energy conserved`,
    assumptions:
      opticalAssumptions(s) + ' Flat ground; horizontal receivers; no reflection or plant shading',
    validation:
      'CPU occlusion checked against Radiance; independent daily-energy and field validation pending',
    warnings: r?.warnings || [],
  };
}
