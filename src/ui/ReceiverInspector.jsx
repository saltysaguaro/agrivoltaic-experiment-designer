import { dliLabel } from '../domain/period.js';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Field } from './Controls.jsx';
import { receiverGridSpec } from '../domain/geometry.js';
import { cellCenter } from '../experiment/grid-layout.js';
export default function ReceiverInspector({
  study,
  result,
  zoning,
  cell,
  setCell,
  open,
  setOpen,
  placing,
  onPlace,
  kind,
}) {
  const g = receiverGridSpec(study);
  const current = { column: Math.min(cell.column, g.nx - 1), row: Math.min(cell.row, g.ny - 1) };
  const index = current.row * g.nx + current.column,
    point = cellCenter(study, current, g);
  const value = result?.cells[index];
  const sensors = study.experimentSensors.filter(
    (s) => s.grid?.column === current.column && s.grid?.row === current.row,
  );
  const [target, setTarget] = useState(null);
  useEffect(() => {
    setTarget(document.getElementById('receiver-inspector'));
  }, []);
  if (!target) return null;
  return createPortal(
    <details
      className="receiver-inspector"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>Inspect receiver values and instruments</summary>
      <p>Select a cell here, or focus the drawing and use the arrow keys.</p>
      <div className="field-pair">
        {['column', 'row'].map((k) => (
          <Field
            key={k}
            label={`Inspect ${k}`}
            value={current[k] + 1}
            min={1}
            max={k === 'column' ? g.nx : g.ny}
            step={1}
            integer
            onChange={(n) => setCell({ ...current, [k]: n - 1 })}
          />
        ))}
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        Receiver {index + 1}: east {point.x.toFixed(2)} m, north {point.y.toFixed(2)} m; height{' '}
        {study.analysis.receiverHeight} m.
        {value ? (
          <p>
            {value.sunlight.toFixed(1)}% relative sunlight; {value.dli.toFixed(2)}{' '}
            {dliLabel(result)} mol m⁻² d⁻¹.
            {zoning && ` DLI zone ${zoning.cellZones[index]}.`}
          </p>
        ) : (
          <p>Light has not been calculated.</p>
        )}
        <p>
          {sensors.length
            ? sensors.map((s) => `${s.id}: ${s.type}, height/depth ${s.z} m`).join('; ')
            : 'No instruments in this cell.'}
        </p>
      </div>
      {placing && (
        <button className="secondary" onClick={() => onPlace(point)}>
          Place {kind} in this cell
        </button>
      )}
    </details>,
    target,
  );
}
