import React from 'react';
export default function FieldMapOverlay({
  projection,
  selection,
  onStart,
  onMove,
  onEnd,
  onKey,
  placing,
}) {
  if (!projection) return null;
  const selected = (kind, id) => selection?.kind === kind && selection.id === id;
  const events = (target, corner) => ({
    onPointerDown: (e) => onStart(e, target, corner),
    onPointerMove: onMove,
    onPointerUp: (e) => onEnd(e, true),
    onPointerCancel: (e) => onEnd(e, false),
    onLostPointerCapture: (e) => onEnd(e, false),
    onKeyDown: (e) => onKey(e, target),
  });
  return (
    <svg
      className={`field-map-overlay ${placing ? 'placing' : ''}`}
      viewBox={`0 0 ${projection.width} ${projection.height}`}
      aria-label="Editable field layout"
    >
      {projection.beds.map((b) => (
        <g key={b.id}>
          <polygon
            points={b.points.map((p) => p.join(',')).join(' ')}
            role="button"
            tabIndex={0}
            aria-label={`Crop bed ${b.id}: ${b.crop}. Drag to move, Enter to edit.`}
            className={`bed-hit ${selected('crop', b.id) ? 'is-selected' : ''}`}
            {...events({ kind: 'crop', id: b.id })}
          />
          <text x={b.points[0][0] + 7} y={b.points[0][1] - 7} className="map-item-label">
            {b.id}
          </text>
          {selected('crop', b.id) &&
            b.points.map((p, i) => (
              <rect
                key={i}
                x={p[0] - 7}
                y={p[1] - 7}
                width={14}
                height={14}
                rx={2}
                role="button"
                tabIndex={0}
                aria-label={`Resize ${['southwest', 'southeast', 'northeast', 'northwest'][i]} corner of ${b.id}`}
                className="bed-handle"
                {...events({ kind: 'crop', id: b.id }, ['sw', 'se', 'ne', 'nw'][i])}
              />
            ))}
        </g>
      ))}
      {projection.markers.map((m) => (
        <g
          key={m.ids.join('|')}
          role="button"
          tabIndex={0}
          aria-label={
            m.ids.length > 1
              ? `${m.ids.length} sensors in receiver cell. Select an individual sensor from Find item.`
              : `Sensor ${m.ids[0]}. Drag to move, Enter to edit.`
          }
          className={`sensor-hit ${m.ids.some((id) => selected('sensor', id)) ? 'is-selected' : ''}`}
          {...events({
            kind: 'sensor',
            id: m.ids.includes(selection?.id) ? selection.id : m.ids[0],
          })}
        >
          <circle
            cx={m.point[0]}
            cy={m.point[1]}
            r={Math.max(6, m.radius)}
            className="sensor-outline"
          />
          <circle
            cx={m.point[0]}
            cy={m.point[1]}
            r={Math.max(12, m.radius)}
            fill="transparent"
            className="sensor-touch-target"
          />
          <text
            x={m.point[0] + Math.max(6, m.radius) + 5}
            y={m.point[1] + 4}
            className="map-item-label"
          >
            {m.ids.length > 1 ? `${m.ids.length} sensors` : m.ids[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}
