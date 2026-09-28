import React, { useState, useRef, useEffect } from 'react';
import { Field } from './Controls.jsx';
import IrrigationFields from './IrrigationFields.jsx';
import {
  defaultIrrigation,
  irrigationMethods,
  irrigationUnitSchema,
} from '../domain/irrigation.js';
import { planIrrigation, irrigationGeometry } from '../experiment/irrigation.js';
import { worldToLocal } from '../domain/geometry.js';
import { designGridSpec } from '../experiment/design-grid.js';
import { rowEdge } from '../domain/receiver-grid.js';
export default function IrrigationDialog({ study, onApply, onClose }) {
  const dialog = useRef(null);
  const [method, setMethod] = useState('drip'),
    [unit, setUnit] = useState(() => defaultIrrigation()),
    [options, setOptions] = useState({
      placement: study.crops.length ? 'beds' : 'grid',
      bedIds: [],
      followRows: true,
      laterals: 1,
      lateralSpacing: 0.3,
      bedOffset: 0,
      atPlants: false,
      columns: 2,
      rows: 2,
      spacingX: 2,
      spacingY: 2,
      x: 0,
      y: 0,
      snap: false,
      zoneId: '',
      zoneName: 'Irrigation treatment',
      treatment: 'Irrigated',
      replicate: '1',
      waterSource: '',
      notes: '',
      replaceLinked: false,
    });
  const [error, setError] = useState('');
  const update = (key, value) => {
    setOptions((o) => ({ ...o, [key]: value }));
    setError('');
  };
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => previous?.isConnected && previous.focus?.();
  }, []);
  const opts = { ...options, method, unit };
  let plan = null,
    problem = '';
  try {
    if (method !== 'rainfed') irrigationUnitSchema.parse(unit);
    plan = planIrrigation(study, opts);
  } catch (e) {
    problem = e.issues
      ? e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' ')
      : e.message;
  }
  const g = designGridSpec(study);
  const xy = (p) => {
    const a = worldToLocal(study, p.x, p.y);
    return [
      20 + ((a.x + g.width / 2) / g.width) * 540,
      220 - ((a.y - rowEdge(g, 0)) / g.height) * 200,
    ];
  };
  return (
    <dialog
      ref={dialog}
      className="project-dialog crop-beds-dialog"
      aria-labelledby="irrigation-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="irrigation-title">Add irrigation units</h2>
        <button type="button" aria-label="Close irrigation layout" onClick={onClose}>
          ×
        </button>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (problem || e.currentTarget.querySelector('[aria-invalid="true"]')) return;
          try {
            onApply(opts);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="project-preview-content">
          <Field
            label="Irrigation method"
            value={method}
            options={[
              ...irrigationMethods.map(([value, label]) => ({ value, label })),
              { value: 'rainfed', label: 'Rainfed / no irrigation' },
            ]}
            onChange={(v) => {
              setMethod(v);
              setOptions((o) => ({
                ...o,
                treatment:
                  v === 'rainfed'
                    ? 'Rainfed'
                    : o.treatment === 'Rainfed'
                      ? 'Irrigated'
                      : o.treatment,
              }));
              if (v !== 'rainfed') setUnit(defaultIrrigation(v));
            }}
            help="Choose delivery hardware or a rainfed treatment. Sprinkler coverage is nominal and water delivery is not simulated."
          />
          {method !== 'rainfed' && (
            <Field
              label="Placement"
              value={options.placement}
              options={[
                { value: 'beds', label: 'Link to selected crop beds' },
                { value: 'grid', label: 'Repeat in an area' },
                { value: 'single', label: 'Individual unit' },
              ]}
              onChange={(v) => update('placement', v)}
            />
          )}
          {options.placement === 'beds' || method === 'rainfed' ? (
            <>
              <strong>Crop beds</strong>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  update(
                    'bedIds',
                    study.crops.map((c) => c.id),
                  )
                }
              >
                Select all beds
              </button>
              <div className="irrigation-bed-list">
                {study.crops.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={options.bedIds.includes(c.id)}
                      onChange={(e) =>
                        update(
                          'bedIds',
                          e.target.checked
                            ? [...options.bedIds, c.id]
                            : options.bedIds.filter((id) => id !== c.id),
                        )
                      }
                    />
                    {c.id} · {c.crop}
                  </label>
                ))}
              </div>
              {!study.crops.length && (
                <p>Add crop beds first, or choose individual/area placement.</p>
              )}
              {method !== 'rainfed' && unit.kind === 'line' && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.followRows}
                      onChange={(e) => update('followRows', e.target.checked)}
                    />
                    One line per crop row
                  </label>
                  {!options.followRows && (
                    <div className="field-pair">
                      <Field
                        label="Lines per bed"
                        value={options.laterals}
                        min={1}
                        max={100}
                        step={1}
                        integer
                        onChange={(v) => update('laterals', v)}
                      />
                      <Field
                        label="Lateral spacing"
                        value={options.lateralSpacing}
                        min={0.001}
                        max={100}
                        unit="m"
                        onChange={(v) => update('lateralSpacing', v)}
                      />
                    </div>
                  )}
                  <Field
                    label="Offset across bed"
                    value={options.bedOffset}
                    min={-100}
                    max={100}
                    unit="m"
                    onChange={(v) => update('bedOffset', v)}
                    help="Shift all lines relative to crop-row centres. Furrows can be offset between crop rows."
                  />
                </>
              )}
              {method !== 'rainfed' && unit.kind === 'point' && (
                <label>
                  <input
                    type="checkbox"
                    checked={options.atPlants}
                    onChange={(e) => update('atPlants', e.target.checked)}
                  />
                  One unit at each planting position (maximum 500)
                </label>
              )}
              {method !== 'rainfed' && (
                <label>
                  <input
                    type="checkbox"
                    checked={options.replaceLinked}
                    onChange={(e) => update('replaceLinked', e.target.checked)}
                  />
                  Replace existing irrigation linked to these beds on Apply
                </label>
              )}
              <p>
                Linked units follow bed movement. After changing crop rows, reopen this layout to
                preview and apply replacement lines; emitter spacing remains independent.
              </p>
            </>
          ) : (
            <>
              <div className="field-pair">
                {[
                  ['x', 'Along-row centre'],
                  ['y', 'Across-row centre'],
                ].map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={options[key]}
                    min={-10000}
                    max={10000}
                    unit="m"
                    onChange={(v) => update(key, v)}
                  />
                ))}
              </div>
              {options.placement === 'grid' && (
                <>
                  <div className="field-pair">
                    {[
                      ['columns', 'Units along rows'],
                      ['rows', 'Units across rows'],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={options[key]}
                        min={1}
                        max={100}
                        step={1}
                        integer
                        onChange={(v) => update(key, v)}
                      />
                    ))}
                    {[
                      ['spacingX', 'Unit spacing along'],
                      ['spacingY', 'Unit spacing across'],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={options[key]}
                        min={0.001}
                        max={1000}
                        unit="m"
                        onChange={(v) => update(key, v)}
                      />
                    ))}
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(options.staggered)}
                      onChange={(e) => update('staggered', e.target.checked)}
                    />
                    Stagger alternating rows
                  </label>
                </>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={options.snap}
                  onChange={(e) => update('snap', e.target.checked)}
                />
                Snap centres to design cells
              </label>
              <p>
                Unchecked preserves exact metre offsets. Drag or use arrow keys after creation to
                move by design cells.
              </p>
            </>
          )}
          {method !== 'rainfed' && (
            <IrrigationFields
              unit={unit}
              onChange={setUnit}
              followBed={options.placement === 'beds' && unit.kind !== 'point'}
            />
          )}
          <Field
            label="Irrigation zone"
            value={options.zoneId}
            options={[
              { value: '', label: 'Create a new zone' },
              ...(study.irrigationZones || []).map((z) => ({
                value: z.id,
                label: `${z.name} (${z.kind})`,
              })),
            ]}
            onChange={(v) => update('zoneId', v)}
          />
          {!options.zoneId && (
            <>
              {[
                ['zoneName', 'Zone name'],
                ['treatment', 'Treatment'],
                ['replicate', 'Replicate'],
                ['waterSource', 'Water source'],
                ['notes', 'Zone notes'],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  type="text"
                  value={options[key]}
                  onChange={(v) => update(key, v)}
                />
              ))}
            </>
          )}
          {plan && (
            <>
              <svg
                className="irrigation-preview"
                viewBox="0 0 580 240"
                role="img"
                aria-label="Irrigation placement preview"
              >
                <rect x="20" y="20" width="540" height="200" fill="#eef3e8" stroke="#a7b39b" />
                {study.crops.map((c) => {
                  const p = worldToLocal(study, c.x, c.y);
                  return (
                    <rect
                      key={c.id}
                      x={20 + ((p.x - c.width / 2 + g.width / 2) / g.width) * 540}
                      y={220 - ((p.y + c.length / 2 - rowEdge(g, 0)) / g.height) * 200}
                      width={(c.width / g.width) * 540}
                      height={(c.length / g.height) * 200}
                      fill="#94bc69"
                      opacity=".4"
                    />
                  );
                })}
                {plan.units.map((u, i) => {
                  const geo = irrigationGeometry(study, u);
                  return (
                    <g key={i}>
                      {[...geo.lines, ...geo.coverage].map((line, j) => (
                        <polyline
                          key={j}
                          points={line.map((p) => xy(p).join(',')).join(' ')}
                          fill="none"
                          stroke="#167da3"
                          strokeWidth="1.5"
                        />
                      ))}
                      <circle cx={xy(geo.centre)[0]} cy={xy(geo.centre)[1]} r="2" fill="#167da3" />
                    </g>
                  );
                })}
              </svg>
              <p>
                {plan.units.length} new units · {plan.totalLength.toFixed(2)} m of lines ·{' '}
                {plan.replaced.length} existing linked units replaced. Sprinkler outlines show
                nominal coverage.
              </p>
            </>
          )}
          {(problem || error) && (
            <p role="alert" className="warning">
              {error || problem}
            </p>
          )}
        </div>
        <footer>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={Boolean(problem)}>
            {method === 'rainfed' ? 'Add rainfed treatment' : 'Apply irrigation layout'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
