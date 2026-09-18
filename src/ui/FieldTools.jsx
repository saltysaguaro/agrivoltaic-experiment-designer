import React, { useRef, useState } from 'react';
import { MousePointer2, MapPin, Sprout, Undo2 } from 'lucide-react';
import CropPicker from './CropPicker.jsx';
export default function FieldTools({
  tool,
  setTool,
  cropId,
  setCropId,
  onUndo,
  canUndo,
  study,
  selection,
  selections = [],
  onDuplicate,
  onSelect,
  view,
  onDropPalette,
  onAddCropBeds,
  onAddSensors,
}) {
  const gesture = useRef(null),
    suppressClick = useRef(false);
  const [ghost, setGhost] = useState(null);
  const [offset, setOffset] = useState({ column: 1, row: 1 });
  function palette(kind) {
    return {
      className: 'palette-tool',
      onPointerDown: (e) => {
        if (e.button !== 0 || view === 'profile') return;
        suppressClick.current = false;
        gesture.current = {
          kind,
          x: e.clientX,
          y: e.clientY,
          pointerId: e.pointerId,
          moved: false,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e) => {
        const d = gesture.current;
        if (!d || d.pointerId !== e.pointerId) return;
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) d.moved = true;
        if (d.moved) {
          e.preventDefault();
          setGhost({ kind, x: e.clientX, y: e.clientY });
        }
      },
      onPointerUp: (e) => {
        const d = gesture.current;
        if (!d || d.pointerId !== e.pointerId) return;
        gesture.current = null;
        setGhost(null);
        if (d.moved) {
          suppressClick.current = true;
          e.preventDefault();
          onDropPalette?.({ kind, cropId }, { clientX: e.clientX, clientY: e.clientY });
        }
      },
      onPointerCancel: () => {
        gesture.current = null;
        setGhost(null);
        suppressClick.current = true;
      },
      onLostPointerCapture: () => {
        if (!gesture.current) return;
        gesture.current = null;
        setGhost(null);
        suppressClick.current = true;
      },
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          gesture.current = null;
          setGhost(null);
          suppressClick.current = true;
        }
      },
      onClick: () => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        setTool(tool === kind ? null : kind);
      },
    };
  }
  return (
    <div className="field-tools" aria-label="Field layout tools">
      {ghost && (
        <div className="palette-ghost" style={{ left: ghost.x + 12, top: ghost.y + 12 }}>
          {ghost.kind === 'sensor' ? 'New sensor' : 'New crop bed'}
        </div>
      )}
      <div className="tool-buttons">
        <button
          className={!tool ? 'selected' : ''}
          aria-pressed={!tool}
          onClick={() => setTool(null)}
        >
          <MousePointer2 size={16} /> Select / move
        </button>
        <button className="bulk-crop-button" onClick={onAddCropBeds}>
          <Sprout size={16} /> Add crop beds
        </button>
        <button className="bulk-sensor-button" onClick={onAddSensors}>
          <MapPin size={16} /> Add sensors
        </button>
        <button disabled={!canUndo} onClick={onUndo} aria-label="Undo field edit">
          <Undo2 size={16} /> Undo
        </button>
        <button disabled={!selections.length} onClick={() => onDuplicate(offset)}>
          Duplicate selected ({selections.length})
        </button>
        <label className="item-select-label">
          Find item
          <select
            aria-label="Select field item"
            value={selection ? `${selection.kind}:${selection.id}` : ''}
            onChange={(e) => {
              const [kind, ...ids] = e.target.value.split(':');
              onSelect(kind ? { kind, id: ids.join(':') } : null);
            }}
          >
            <option value="">Select a sensor or bed…</option>
            {study.experimentSensors.map((s) => (
              <option key={`sensor:${s.id}`} value={`sensor:${s.id}`}>
                {s.id} · {s.type}
              </option>
            ))}
            {study.crops.map((c) => (
              <option key={`crop:${c.id}`} value={`crop:${c.id}`}>
                {c.id} · {c.crop}
              </option>
            ))}
          </select>
        </label>
        <div className="single-field-tools">
          <button {...palette('sensor')} aria-pressed={tool === 'sensor'}>
            <MapPin size={16} /> Add sensor
          </button>
          <button {...palette('crop')} aria-pressed={tool === 'crop'}>
            <Sprout size={16} /> Add single crop bed
          </button>
        </div>
      </div>
      {selections.length > 0 && (
        <div className="copy-offsets">
          {' '}
          <label className="copy-offset-label">
            Copy offset · columns
            <input
              aria-label="Copy column offset"
              type="number"
              step="1"
              value={offset.column}
              onChange={(e) => setOffset({ ...offset, column: Number(e.target.value) })}
            />
          </label>
          <label className="copy-offset-label">
            rows
            <input
              aria-label="Copy row offset"
              type="number"
              step="1"
              value={offset.row}
              onChange={(e) => setOffset({ ...offset, row: Number(e.target.value) })}
            />
          </label>
        </div>
      )}
      <details className="field-multiselect">
        <summary>Select multiple items ({selections.length} selected)</summary>
        <div className="field-selection-list">
          {[
            ...study.experimentSensors.map((item) => ({ ...item, kind: 'sensor' })),
            ...study.crops.map((item) => ({ ...item, kind: 'crop' })),
          ].map((item) => (
            <label key={`${item.kind}:${item.id}`}>
              <input
                type="checkbox"
                aria-label={`Select ${item.id}`}
                checked={selections.some((v) => v.kind === item.kind && v.id === item.id)}
                onChange={() => onSelect({ kind: item.kind, id: item.id }, false, true)}
              />
              {item.id} · {item.kind === 'sensor' ? item.type : item.crop}
            </label>
          ))}
        </div>
      </details>
      {tool === 'crop' && (
        <CropPicker label="Crop for new beds" value={cropId} onChange={setCropId} />
      )}
      <p>
        {view === 'profile'
          ? 'Choose Top-down or Orthographic to drag items; the item list opens their editors in any view.'
          : tool
            ? `Click a receiver cell to place ${tool === 'sensor' ? 'a sensor' : 'a crop bed'}, or drag its toolbar button onto the drawing.`
            : 'Click to edit; Shift-click to select a group. Drag to move; drag bed corners to resize. Arrow keys move; Shift + arrows resize. Escape cancels.'}
      </p>
    </div>
  );
}
