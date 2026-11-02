import spacing from '../data/crop-spacing.json' with { type: 'json' };
import { cropIdentity } from './crop-catalog.js';
export const cropSpacingVersion = spacing.version;
export const MAX_CROP_ROWS = 100;
export function cropSpacingPreset(cropId) {
  const profile = spacing.crops[cropId];
  const p = spacing.profiles[profile];
  if (!p)
    return {
      rowSpacing: 0.3,
      plantSpacing: 0.3,
      profile: 'unresolved',
      version: spacing.version,
      basis: 'placeholder',
      sourceTitle: '',
      sourceUrl: '',
      note: 'Unresolved crop: placeholder spacing only. Select a catalog crop or enter local spacing.',
    };
  const source = spacing.sources[p.source];
  return {
    rowSpacing: p.rowSpacing,
    plantSpacing: p.plantSpacing,
    profile,
    version: spacing.version,
    basis: p.basis,
    sourceTitle: source.title,
    sourceUrl: source.url,
    note: p.note,
  };
}
export function defaultPlanting(cropId) {
  const preset = cropSpacingPreset(cropId);
  return {
    rowCount: 1,
    rowSpacing: preset.rowSpacing,
    plantSpacing: preset.plantSpacing,
    rowSpacingMode: 'default',
    plantSpacingMode: 'default',
    preset,
  };
}
export function normalizeCropPlanting(plot) {
  const defaults = defaultPlanting(plot.cropId);
  return {
    ...plot,
    planting: { ...defaults, ...plot.planting, preset: plot.planting?.preset || defaults.preset },
  };
}
// Crop changes refresh only default-controlled spacings; row count and user choices survive.
export function changePlotCrop(plot, cropId) {
  const old = normalizeCropPlanting(plot).planting,
    next = defaultPlanting(cropId);
  return {
    ...plot,
    ...cropIdentity(cropId),
    planting: {
      ...old,
      preset: next.preset,
      rowSpacing: old.rowSpacingMode === 'custom' ? old.rowSpacing : next.rowSpacing,
      plantSpacing: old.plantSpacingMode === 'custom' ? old.plantSpacing : next.plantSpacing,
    },
  };
}
export function plantingIssue(plot) {
  const p = normalizeCropPlanting(plot).planting;
  if (!Number.isInteger(p.rowCount) || p.rowCount < 1 || p.rowCount > MAX_CROP_ROWS)
    return `Use 1–${MAX_CROP_ROWS} whole crop rows per bed.`;
  if (![p.rowSpacing, p.plantSpacing].every((v) => Number.isFinite(v) && v >= 0.001 && v <= 100))
    return 'Row and plant spacing must be between 0.001 and 100 m.';
  const span = (p.rowCount - 1) * p.rowSpacing;
  if (Number.isFinite(plot.length) && span >= plot.length && p.rowCount > 1)
    return `${p.rowCount} rows need more than ${span.toFixed(3)} m across the bed; this bed is ${plot.length.toFixed(3)} m wide. Widen the bed, reduce row count, or reduce row spacing.`;
  return '';
}
export function plantingSummary(plot) {
  const p = normalizeCropPlanting(plot).planting;
  const issue = plantingIssue(plot);
  const plantsPerRow = issue ? 0 : Math.max(1, Math.floor(plot.width / p.plantSpacing + 1e-9));
  return { ...p, issue, plantsPerRow, positions: plantsPerRow * p.rowCount };
}
export function plantingDescription(plot, includeSource = true) {
  const p = plantingSummary(plot);
  const layout = `${p.rowCount} crop row(s); rows ${p.rowSpacing} m apart (${p.rowSpacingMode}); plants ${p.plantSpacing} m apart (${p.plantSpacingMode}); ${p.positions} planned planting positions. ${p.issue || ''}`;
  return includeSource
    ? `${layout} Preset ${p.preset.profile}, ${p.preset.version}, ${p.preset.basis}; ${p.preset.note} ${p.preset.sourceTitle} ${p.preset.sourceUrl}`
    : layout;
}
