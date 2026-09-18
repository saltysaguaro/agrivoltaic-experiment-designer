import React, { useEffect, useMemo, useRef, useState } from 'react';
import Info from './Info.jsx';
import { sensorTypes } from '../domain/study.js';
import { sensorGrid, sensorGridDefaults, planSensors } from '../experiment/sensor-grid.js';

export default function SensorsDialog({ study, sensorType = 'PAR', control, onApply, onClose }) {
  const dialog = useRef(null);
  const [rows, setRows] = useState(String(sensorGridDefaults.rows));
  const [columns, setColumns] = useState(String(sensorGridDefaults.columns));
  const [type, setType] = useState(sensorType);
  const [selected, setSelected] = useState(() => new Set());
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    if (dialog.current.showModal) dialog.current.showModal();
    else dialog.current.setAttribute('open', '');
    dialog.current.querySelector('select')?.focus();
    return () => {
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  const preview = useMemo(() => {
    try {
      return {
        areas: sensorGrid(study, { rows: Number(rows), columns: Number(columns) }),
        problem: '',
      };
    } catch (e) {
      return { areas: [], problem: e.message };
    }
  }, [study, rows, columns]);
  const options = { rows: Number(rows), columns: Number(columns), type, selected: [...selected] };
  let cells = [],
    problem = preview.problem;
  if (!problem) {
    try {
      cells = planSensors(study, options, preview.areas);
    } catch (e) {
      problem = e.message;
    }
  }
  const locations = new Set(cells.map((cell) => `${cell.grid.column}:${cell.grid.row}`));
  function choose(ids, checked) {
    setSelected((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
    setError('');
  }
  return (
    <dialog
      ref={dialog}
      className="project-dialog crop-beds-dialog sensors-dialog"
      aria-labelledby="sensors-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="sensors-title">Add sensors</h2>
        <button type="button" aria-label="Close sensor layout" onClick={onClose}>
          ×
        </button>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (problem) return;
          try {
            onApply(options);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="project-preview-content">
          <p>
            Choose a sensor type, then check the cells where you want to deploy it. Each checked
            cell adds one sensor. Existing sensors are kept.
          </p>
          <div className="sensor-grid-inputs">
            <label className="field">
              <span>
                Sensor type{' '}
                <Info label="Sensor type" portalTarget={dialog}>
                  All checked cells receive this sensor type. You can edit individual instruments
                  after adding them.
                </Info>
              </span>
              <select
                aria-label="Sensor type for new sensors"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {sensorTypes.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            {[
              ['Rows per crop row', rows, setRows],
              ['Columns per crop row', columns, setColumns],
            ].map(([label, value, setValue]) => (
              <label className="field" key={label}>
                <span>
                  {label}{' '}
                  <Info label={label} portalTarget={dialog}>
                    {label.startsWith('Rows')
                      ? 'Rows divide the cropping width between PV rows.'
                      : 'Columns divide the cropping length along the PV rows.'}{' '}
                    Changing the count clears the selected cells.
                  </Info>
                </span>
                <input
                  aria-label={label}
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  required
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setSelected(new Set());
                    setError('');
                  }}
                />
              </label>
            ))}
          </div>
          <details className="sensor-grid-help">
            <summary>About grid spacing and sensor placement</summary>
            <p>
              Rows divide the cropping width; columns divide its length. Changing either count
              clears the selection. The grid supports 1–50 rows and columns, up to 10,000 preview
              cells; a field can hold 500 sensors.
            </p>
            <p>
              Locations start at planning-cell centres and snap to receiver-cell centres, as with
              single sensors. A fine planning grid may place several sensors at the same receiver
              location. Installation height starts at {study.analysis.receiverHeight} m and can be
              edited for each sensor.
            </p>
          </details>
          <div className="crop-row-actions">
            <strong>{selected.size} cells selected</strong>
            <button
              type="button"
              className="secondary compact"
              disabled={!preview.areas.length}
              onClick={() =>
                choose(
                  preview.areas.flatMap((area) => area.cells.map((cell) => cell.id)),
                  true,
                )
              }
            >
              Select all cells
            </button>
            <button
              type="button"
              className="secondary compact"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          </div>
          <p>
            Schematic top-down view · columns run left to right along PV rows. Scroll to see all{' '}
            {preview.areas.length} crop rows.{' '}
            {control && 'PV rows are shown only as a reference for the control field.'}
          </p>
          <div className="sensor-array-preview" role="group" aria-label="Sensor placement grid">
            {[...preview.areas].reverse().map((area) => (
              <section className="sensor-crop-row" key={area.id} aria-label={`Crop row ${area.id}`}>
                <div className="sensor-pv-strip">PV row {area.id + 1}</div>
                <div className="crop-row-actions">
                  <strong>
                    Crop row {area.id} · {(area.x1 - area.x0).toFixed(2)} ×{' '}
                    {(area.y1 - area.y0).toFixed(2)} m
                  </strong>
                  <button
                    type="button"
                    className="secondary compact"
                    aria-label={`Select all cells in crop row ${area.id}`}
                    onClick={() =>
                      choose(
                        area.cells.map((cell) => cell.id),
                        true,
                      )
                    }
                  >
                    Select row
                  </button>
                  <button
                    type="button"
                    className="secondary compact"
                    aria-label={`Clear cells in crop row ${area.id}`}
                    onClick={() =>
                      choose(
                        area.cells.map((cell) => cell.id),
                        false,
                      )
                    }
                  >
                    Clear row
                  </button>
                </div>
                <div className="sensor-cell-scroll">
                  <div
                    className="sensor-selection-grid"
                    style={{
                      gridTemplateColumns: `24px repeat(${Number(columns)}, minmax(32px, 1fr))`,
                    }}
                  >
                    <span aria-hidden="true" />
                    {Array.from({ length: Number(columns) }, (_, i) => (
                      <span className="sensor-grid-axis" aria-hidden="true" key={`column-${i}`}>
                        {i + 1}
                      </span>
                    ))}
                    {Array.from({ length: Number(rows) }, (_, row) => (
                      <React.Fragment key={row}>
                        <span className="sensor-grid-axis" aria-hidden="true">
                          {row + 1}
                        </span>
                        {area.cells
                          .slice(row * Number(columns), (row + 1) * Number(columns))
                          .map((cell) => (
                            <label
                              className="sensor-selection-cell"
                              key={cell.id}
                              title={`Crop row ${area.id}, grid row ${row + 1}, column ${cell.column + 1}`}
                            >
                              <input
                                type="checkbox"
                                aria-label={`Crop row ${area.id}, grid row ${row + 1}, column ${cell.column + 1}`}
                                checked={selected.has(cell.id)}
                                onChange={(e) => choose([cell.id], e.target.checked)}
                              />
                            </label>
                          ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="sensor-pv-strip">PV row {area.id}</div>
              </section>
            ))}
          </div>
          <p role="status">
            {problem ||
              `${cells.length} new ${type} sensors at ${locations.size} receiver locations.`}
          </p>
          {cells.length > locations.size && (
            <p className="zone-warning">
              Some selected cells share a receiver location. Each checked cell still creates its own
              sensor.
            </p>
          )}
          {error && (
            <p className="zone-warning" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={Boolean(problem)}>
            Add {cells.length || ''} sensors
          </button>
        </footer>
      </form>
    </dialog>
  );
}
