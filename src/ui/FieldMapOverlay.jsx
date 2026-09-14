import React from 'react';
import { fieldLabelItems, layoutFieldLabels, labelColors } from './field-labels.js';
export default function FieldMapOverlay({
  projection,
  interactive = true,
  selection,
  selections = [],
  onStart,
  onMove,
  onEnd,
  onKey,
  placing,
}) {
  if (!projection) return null;
  const selected = (kind, id) =>
    selections.length
      ? selections.some((v) => v.kind === kind && v.id === id)
      : selection?.kind === kind && selection.id === id;
  const events = (target, corner) =>
    !interactive
      ? {}
      : {
          onPointerDown: (e) => onStart(e, target, corner),
          onPointerMove: onMove,
          onPointerUp: (e) => onEnd(e, true),
          onPointerCancel: (e) => onEnd(e, false),
          onLostPointerCapture: (e) => onEnd(e, false),
          onKeyDown: (e) => onKey(e, target),
        };
  const layout = layoutFieldLabels(
    fieldLabelItems(projection, selection),
    projection.width,
    projection.height,
    {
      obstacles: [
        { x: projection.width - 92, y: 0, width: 92, height: 90 },
        ...projection.beds
          .filter((b) => selected('crop', b.id))
          .flatMap((b) =>
            b.points.map(([x, y]) => ({ x: x - 9, y: y - 9, width: 18, height: 18 })),
          ),
      ],
    },
  );
  return (
    <svg
      className={`field-map-overlay ${placing ? 'placing' : ''} ${interactive ? '' : 'read-only'}`}
      viewBox={`0 0 ${projection.width} ${projection.height}`}
      aria-label={interactive ? 'Editable field layout' : 'Field layout'}
    >
      {projection.beds.map((b) => (
        <g key={b.id}>
          <polygon
            points={b.points.map((p) => p.join(',')).join(' ')}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`Crop bed ${b.id}: ${b.crop}. Drag to move, Enter to edit.`}
            className={`bed-hit ${selected('crop', b.id) ? 'is-selected' : ''}`}
            {...events({ kind: 'crop', id: b.id })}
          />
          {interactive &&
            !projection.profile &&
            selected('crop', b.id) &&
            b.points.map((p, i) => (
              <rect
                key={i}
                x={p[0] - 7}
                y={p[1] - 7}
                width={14}
                height={14}
                rx={2}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
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
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
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
        </g>
      ))}
      {layout.labels.map((label) => (
        <g
          key={`${label.kind}:${label.id}`}
          className={`field-id-tag ${label.selected ? 'is-selected' : ''}`}
          data-field-label={`${label.kind}:${label.id}`}
          style={{ '--tag-color': labelColors[label.kind] }}
          {...events({ kind: label.kind, id: label.id })}
        >
          <title>{label.title}</title>
          <rect x={label.x} y={label.y} width={label.width} height={label.height} rx={4} />
          <text x={label.x + 8} y={label.y + 16}>
            {label.text}
          </text>
        </g>
      ))}
      {layout.hidden.length > 0 && (
        <g className="field-label-note" aria-hidden="true">
          <rect
            x={8}
            y={projection.height - 23}
            width={Math.min(300, projection.width - 16)}
            height={22}
            rx={3}
          />
          <text x={14} y={projection.height - 8}>
            {interactive
              ? 'More IDs: zoom in or use Find item.'
              : 'More IDs are listed in the report.'}
          </text>
        </g>
      )}
    </svg>
  );
}
