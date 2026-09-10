import catalog from '../data/crop-catalog.json' with { type: 'json' };
export const cropCatalog = catalog.crops;
export const cropCatalogVersion = catalog.version;
export const cropCatalogSource = catalog.source;
export const cropCatalogCitation = `${catalog.citation} License: ${catalog.license}`;
const byId = new Map(cropCatalog.map((c) => [c.id, c]));
const fold = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
export function cropById(id) {
  return byId.get(id);
}
export function searchCrops(query, limit = 30) {
  const q = fold(query),
    words = q.split(' ').filter(Boolean);
  return cropCatalog
    .map((c) => {
      const common = fold(c.commonName),
        names = [common, fold(c.botanicalName), ...c.aliases.map(fold)];
      const hay = names.join(' ');
      return {
        c,
        score: common === q ? 0 : common.startsWith(q) ? 1 : names.some((n) => n === q) ? 2 : 3,
        match: words.every((w) => hay.includes(w)),
      };
    })
    .filter((v) => v.match)
    .sort((a, b) => a.score - b.score || a.c.commonName.localeCompare(b.c.commonName))
    .slice(0, limit)
    .map((v) => v.c);
}
export function matchLegacyCrop(name) {
  const q = fold(name);
  const direct = cropCatalog.filter((c) => fold(c.commonName) === q);
  if (direct.length === 1) return direct[0];
  const aliases = cropCatalog.filter((c) => c.aliases.some((a) => fold(a) === q));
  return aliases.length === 1 ? aliases[0] : null;
}
export function cropIdentity(id) {
  const c = cropById(id);
  return c
    ? {
        cropId: c.id,
        crop: c.commonName,
        botanicalName: c.botanicalName,
        scientificName: c.scientificName,
        cropFamily: c.family,
        taxonKey: c.taxonKey,
        taxonUrl: c.taxonUrl,
        cropCatalogVersion,
      }
    : null;
}
export function normalizeCropIdentity(plot) {
  const c = plot.cropId ? cropById(plot.cropId) : matchLegacyCrop(plot.crop);
  if (c) return { ...plot, ...cropIdentity(c.id) };
  // Preserve unrecognized imported text, but never attach a guessed botanical identity.
  return {
    ...plot,
    cropId: '',
    botanicalName: '',
    scientificName: '',
    cropFamily: '',
    taxonKey: 0,
    taxonUrl: '',
    cropCatalogVersion: '',
  };
}
export function unresolvedCrops(study) {
  return study.crops.filter((c) => !cropById(c.cropId));
}
