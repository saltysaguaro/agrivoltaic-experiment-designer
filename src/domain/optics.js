export function moduleOptics(m) {
  const columns = m.cellColumns ?? 6,
    rows = m.cellRows ?? 12;
  const gapX = m.cellGapX ?? 0.002,
    gapY = m.cellGapY ?? 0.002,
    margin = m.cellMargin ?? 0.01;
  const cellWidth = (m.width - 2 * margin - (columns - 1) * gapX) / columns;
  const cellLength = (m.length - 2 * margin - (rows - 1) * gapY) / rows;
  // The perimeter is opaque. Only internal cell gaps transmit; intersections count once.
  const interior = (m.width - 2 * margin) * (m.length - 2 * margin);
  const gapArea = interior - columns * rows * cellWidth * cellLength;
  const openFraction = Math.max(0, Math.min(1, gapArea / (m.width * m.length)));
  return {
    columns,
    rows,
    gapX,
    gapY,
    margin,
    cellWidth,
    cellLength,
    openFraction,
    broadband: m.bifacial ? openFraction * (m.gapTransmission ?? 0.9) : 0,
    par: m.bifacial ? openFraction * (m.gapParTransmission ?? 0.9) : 0,
  };
}
export const opticalAssumptions = (s) =>
  s.module.bifacial
    ? 'Bifacial module: area-averaged internal-gap transmission, opaque cells/perimeter and supports; constant laminate transmittance; each intersected module attenuates once. Cell-scale sunflecks, angular/spectral optics and electrical bifacial yield are not modeled.'
    : 'Opaque monofacial modules and supports; no module transmission.';
