import React, { useId, useState } from 'react';
import Info from './Info.jsx';
import { dimensions, rackingMinimums } from '../domain/study.js';
import {
  rowPitches,
  rowPositions,
  applySpacingPattern,
  backtrackingDescription,
  MAX_ROW_PITCH,
} from '../domain/row-spacing.js';

export default function RowSpacingEditor({ s, set, Field }) {
  const id = useId();
  const [pattern, setPattern] = useState(String(s.rowPair.pitch));
  const [error, setError] = useState('');
  const pitches = rowPitches(s),
    positions = rowPositions(s, s.array.rows, false),
    span = positions.at(-1),
    d = dimensions(s),
    minimum = rackingMinimums(s).pitch;
  return (
    <section className="row-spacing-editor" aria-label="Custom row spacings">
      <p className="control-note">
        Set the complete centre-to-centre pitch for each adjacent pair, including access space.
        Group aisles are not added in this mode. Changing these pitches invalidates light results.
      </p>
      <Field
        label="Number of rows"
        annotation="array.rows"
        value={s.array.rows}
        onChange={(n) => set('array', 'rows', n)}
        min={1}
        max={24}
        step={1}
        integer
        help="Set 1–24 PV rows. New gaps start from the default pitch and group aisle settings. Reducing the row count retains hidden custom gaps for reuse."
      />
      {pitches.length ? (
        <>
          <div className="field">
            <div className="field-label">
              <label htmlFor={id}>Repeating pitch pattern</label>
              <Info label="Repeating pitch pattern">
                Enter one or more centre-to-centre distances in metres, such as 6, 10. Apply repeats
                the sequence across all current gaps and replaces their values. You can then edit
                individual gaps.
              </Info>
            </div>
            <input
              id={id}
              type="text"
              value={pattern}
              placeholder="e.g. 6, 10"
              onChange={(e) => {
                setPattern(e.target.value);
                setError('');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${id}-help`}
            />
            <small id={`${id}-help`}>
              Metres, separated by commas or spaces. Applies to all current gaps.
            </small>
            {error && (
              <small role="alert" className="field-error">
                {error}
              </small>
            )}
            <button
              type="button"
              className="secondary compact"
              onClick={() => {
                try {
                  set('rowPair', 'customPitches', applySpacingPattern(s, pattern));
                  setError('');
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Apply pattern to all gaps
            </button>
          </div>
          <svg
            className="row-spacing-preview"
            viewBox="0 0 300 70"
            role="img"
            aria-label="Row centres across the array, numbered in gap order"
          >
            <title>Across-row layout · distances to scale</title>
            <line x1="12" x2="288" y1="32" y2="32" stroke="#9aa9a4" />
            {positions.map((p, i) => (
              <g key={i}>
                <line
                  x1={12 + (p / span) * 276}
                  x2={12 + (p / span) * 276}
                  y1="10"
                  y2="38"
                  stroke="#315f69"
                  strokeWidth="3"
                />
                <text
                  x={12 + (p / span) * 276}
                  y={i % 2 ? 65 : 51}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
          <p className="control-note">
            Edit any gap below. Clear spacing is measured between projected panel edges at the
            displayed tilt; cropping width excludes the under-row no-crop strips. Suggested minimum
            pitch: {minimum.toFixed(2)} m.
          </p>
          <div className="row-spacing-gaps">
            {pitches.map((pitch, i) => (
              <div className="row-spacing-gap" key={i}>
                <Field
                  label={`Rows ${i + 1}–${i + 2} pitch`}
                  annotation={`rowPair.customPitches.${i}`}
                  value={pitch}
                  unit="m"
                  min={0.5}
                  max={MAX_ROW_PITCH}
                  step={0.01}
                  help={`Centre-to-centre distance from row ${i + 1} to row ${i + 2}, including access space. Software range: 0.5–${MAX_ROW_PITCH} m. Focus this input to mark the gap in the drawing.`}
                  onChange={(value) => {
                    const values = [...(s.rowPair.customPitches || [])];
                    pitches.forEach((p, j) => {
                      values[j] = p;
                    });
                    values[i] = value;
                    set('rowPair', 'customPitches', values);
                  }}
                />
                <small>
                  Clear: {(pitch - d.projected).toFixed(2)} m · Cropping:{' '}
                  {(pitch - s.landUse.underPanelWidth).toFixed(2)} m
                </small>
                {pitch < minimum && (
                  <small className="field-error">
                    Below the suggested rack clearance ({minimum.toFixed(2)} m).
                  </small>
                )}
              </div>
            ))}
          </div>
          <p className="control-note">
            Row-centre span: {span.toFixed(2)} m. New gaps use the default pitch; reapply a pattern
            to extend it.
          </p>
        </>
      ) : (
        <p className="info-box">
          One row has no interrow gaps. Increase the number of rows to configure spacings.
        </p>
      )}
      {backtrackingDescription(s) && <p className="info-box">{backtrackingDescription(s)}</p>}
    </section>
  );
}
