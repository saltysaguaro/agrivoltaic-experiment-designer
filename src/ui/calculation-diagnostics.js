import validation from '../../docs/radiance-validation.json' with { type: 'json' };
// Routine scientific diagnostics belong in developer tools and exported provenance.
// Calculation failures still use the application's visible error/notice flow.
export function logCalculationDiagnostics(study, result, logger = console) {
  logger.groupCollapsed(`Irradiance diagnostics · ${result.period?.start || result.date}`);
  logger.info(
    `${result.backend} · ${study.analysis.patches} sky patches · ${study.analysis.interval}-minute direct steps · reflection excluded`,
  );
  for (const warning of result.warnings) logger.warn(warning);
  const rays = validation.results.reduce((n, value) => n + value.rays, 0);
  logger.info(
    `Radiance occlusion comparison: ${rays.toLocaleString('en-US')} rays across ${validation.results.length} cases. ${validation.scope}`,
  );
  logger.groupEnd();
}
