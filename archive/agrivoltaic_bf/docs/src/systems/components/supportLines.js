export function getStackModuleCenters(tableSpec, { centered = false } = {}) {
  const firstCenter = centered
    ? (-tableSpec.stackSpan / 2) + (tableSpec.moduleHeight / 2)
    : tableSpec.moduleHeight / 2;

  return Array.from({ length: tableSpec.count }, (_, index) => {
    return firstCenter + index * (tableSpec.moduleHeight + tableSpec.stackSeam);
  });
}

export function getSupportLinePositions(tableSpec, { centered = false, insetRatio = 0.22 } = {}) {
  const supportInset = Math.min(tableSpec.moduleHeight * 0.48, tableSpec.moduleHeight * insetRatio);
  const halfModule = tableSpec.moduleHeight / 2;

  return getStackModuleCenters(tableSpec, { centered }).flatMap((center) => {
    const offset = halfModule - supportInset;
    return [center - offset, center + offset];
  });
}
