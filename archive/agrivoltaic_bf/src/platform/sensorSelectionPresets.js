function rounded(value) {
  return Number(value.toFixed(6));
}

function centeredWindow(values, span) {
  const width = Math.max(1, Math.min(values.length, Math.round(Number(span) || 0)));
  const start = Math.max(0, Math.floor((values.length - width) * 0.5));
  return new Set(values.slice(start, start + width));
}

export function centeredSquareSensorIds(sensors, {
  span,
  project = (sensor) => ({
    along: sensor.position?.x ?? 0,
    cross: sensor.position?.y ?? 0,
  }),
} = {}) {
  const projected = sensors
    .map((sensor) => {
      const coordinates = project(sensor);
      if (!coordinates) return null;
      const along = Number(coordinates.along ?? 0);
      const cross = Number(coordinates.cross ?? 0);
      if (!Number.isFinite(along) || !Number.isFinite(cross)) {
        return null;
      }
      return {
        sensor,
        along: rounded(along),
        cross: rounded(cross),
      };
    })
    .filter(Boolean);

  if (!projected.length) {
    return [];
  }

  const alongValues = [...new Set(projected.map((entry) => entry.along))].sort((a, b) => a - b);
  const crossValues = [...new Set(projected.map((entry) => entry.cross))].sort((a, b) => a - b);
  const alongWindow = centeredWindow(alongValues, span);
  const crossWindow = centeredWindow(crossValues, span);

  return projected
    .filter((entry) => alongWindow.has(entry.along) && crossWindow.has(entry.cross))
    .map((entry) => entry.sensor.id);
}
