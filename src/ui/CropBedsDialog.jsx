import React, { useEffect, useRef, useState } from 'react';
import CropPicker from './CropPicker.jsx';
import { cropRows, planCropBeds } from '../experiment/crop-beds.js';
import { dimensions } from '../domain/study.js';

export default function CropBedsDialog({ study, cropId, control, onApply, onClose }) {
  const dialog = useRef(null);
  const rows = cropRows(study);
  const [count, setCount] = useState('3');
  const [crop, setCrop] = useState(cropId);
  const [chosen, setChosen] = useState(() => rows.map((r) => r.id));
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    if (dialog.current.showModal) dialog.current.showModal();
    else dialog.current.setAttribute('open', '');
    dialog.current.querySelector('input')?.focus();
    return () => {
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  const toggle = (id) =>
    setChosen((ids) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
  let plan = [],
    problem = '';
  try {
    plan = planCropBeds(study, { count: Number(count), rowIds: chosen, cropId: crop });
  } catch (e) {
    problem = e.message;
  }
  const d = dimensions(study);
  const height = Math.max(260, study.array.rows * 64);
  const y = (v) => 24 + (1 - (v + (d.span + d.width) / 2) / (d.span + d.width)) * (height - 48);
  return (
    <dialog
      ref={dialog}
      className="project-dialog crop-beds-dialog"
      aria-labelledby="crop-beds-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="crop-beds-title">Add crop beds</h2>
        <button type="button" aria-label="Close crop bed layout" onClick={onClose}>
          ×
        </button>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (problem) return;
          try {
            onApply({ count: Number(count), rowIds: chosen, cropId: crop });
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="project-preview-content">
          <p>
            Divide each selected cropping area into beds running the full length of the PV rows.
            Choose a crop for all new beds. Existing beds are kept.
          </p>
          <div className="crop-bed-inputs">
            <label className="field">
              Crop beds per crop row
              <input
                aria-label="Crop beds per crop row"
                type="number"
                min="1"
                max="200"
                step="1"
                required
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </label>
            <CropPicker label="Crop for new beds" value={crop} onChange={setCrop} />
          </div>
          <div className="crop-row-actions">
            <strong>Choose crop rows · {chosen.length} selected</strong>
            <button
              type="button"
              className="secondary compact"
              onClick={() => setChosen(rows.map((r) => r.id))}
            >
              Select all
            </button>
            <button type="button" className="secondary compact" onClick={() => setChosen([])}>
              Clear
            </button>
          </div>
          <p id="crop-row-help">
            Click the green strips between PV rows. Highlighted strips receive beds.{' '}
            {control ? 'PV rows are shown only as a reference for the control field. ' : ''}
            Schematic top-down view · row lengths run left to right.
          </p>
          <div className="crop-row-preview">
            <svg
              viewBox={`0 0 580 ${height}`}
              role="group"
              aria-label="Choose cropping areas in the array"
              aria-describedby="crop-row-help"
            >
              {Array.from({ length: study.array.rows }, (_, i) => {
                const cy =
                  i * study.rowPair.pitch +
                  Math.floor(i / study.array.groupSize) * study.array.aisle -
                  d.span / 2;
                return (
                  <g key={i}>
                    <rect x="95" y={y(cy) - 5} width="458" height="10" rx="2" fill="#536d7c" />
                    <text x="86" y={y(cy) + 4} textAnchor="end">
                      PV row {i + 1}
                    </text>
                  </g>
                );
              })}
              {rows.map((r) => {
                const top = y(r.y1),
                  h = y(r.y0) - top,
                  selected = chosen.includes(r.id);
                const beds = plan.filter((b) => b.cropRow === r.id);
                return (
                  <g
                    key={r.id}
                    role="checkbox"
                    aria-checked={selected}
                    tabIndex="0"
                    aria-label={`Crop row ${r.id}, between PV rows ${r.id} and ${r.id + 1}`}
                    className="crop-row-choice"
                    onClick={() => toggle(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggle(r.id);
                      }
                    }}
                  >
                    <rect
                      x="95"
                      y={top}
                      width="458"
                      height={Math.max(2, h)}
                      rx="2"
                      fill={selected ? '#bfd99e' : '#eef3e8'}
                      stroke={selected ? '#315f51' : '#a7b39b'}
                      strokeWidth={selected ? 2 : 1}
                    />
                    {beds.slice(1).map((b, i) => (
                      <line
                        key={i}
                        x1="95"
                        x2="553"
                        y1={y(b.y0)}
                        y2={y(b.y0)}
                        stroke="#527545"
                        strokeDasharray="5 3"
                      />
                    ))}
                    <text x="324" y={top + h / 2 + 4} textAnchor="middle">
                      {selected ? '✓ ' : ''}Crop row {r.id} · {(r.y1 - r.y0).toFixed(2)} m wide
                    </text>
                    <title>
                      {(r.x1 - r.x0).toFixed(2)} m long × {(r.y1 - r.y0).toFixed(2)} m wide
                    </title>
                  </g>
                );
              })}
            </svg>
          </div>
          <p role="status">
            {problem || `${plan.length} new beds · ${Number(count)} per selected crop row`}
          </p>
          {!problem && (
            <p>
              {[
                ...new Set(
                  plan.map(
                    (b) =>
                      `${(b.x1 - b.x0).toFixed(2)} m long × ${(b.y1 - b.y0).toFixed(2)} m wide`,
                  ),
                ),
              ].join(' · ')}
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
            Add {plan.length || ''} crop beds
          </button>
        </footer>
      </form>
    </dialog>
  );
}
