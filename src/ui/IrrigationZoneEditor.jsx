import React, { useState, useEffect, useRef } from 'react';
import { Field } from './Controls.jsx';
import { irrigationZonesSchema, irrigationReferenceIssues } from '../domain/irrigation.js';
export default function IrrigationZoneEditor({ study, zoneId, onApply, onClose }) {
  const [draft, setDraft] = useState(() =>
    structuredClone(study.irrigationZones.find((z) => z.id === zoneId)),
  );
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  if (!draft) return null;
  const save = () => {
    try {
      const zones = irrigationZonesSchema.parse(
        study.irrigationZones.map((z) => (z.id === zoneId ? draft : z)),
      );
      const next = { ...study, irrigationZones: zones };
      const issues = irrigationReferenceIssues(next);
      if (issues.length) throw Error(issues.join(' '));
      onApply(next);
    } catch (e) {
      setError(e.issues ? e.issues.map((i) => i.message).join(' ') : e.message);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="project-dialog irrigation-zone-dialog"
      aria-label={`Edit irrigation zone ${zoneId}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form
        className="field-editor"
        aria-label={`Edit irrigation zone ${zoneId}`}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <header>
          <strong>Irrigation zone {zoneId}</strong>
          <button type="button" onClick={onClose} aria-label="Close zone editor">
            ×
          </button>
        </header>
        <div className="editor-fields">
          {['name', 'treatment', 'replicate', 'waterSource', 'notes'].map((key) => (
            <Field
              key={key}
              label={
                {
                  name: 'Zone name',
                  treatment: 'Treatment',
                  replicate: 'Replicate',
                  waterSource: 'Water source',
                  notes: 'Notes',
                }[key]
              }
              type="text"
              value={draft[key]}
              onChange={(v) => setDraft({ ...draft, [key]: v })}
            />
          ))}
          <Field
            label="Water treatment"
            value={draft.kind}
            options={[
              { value: 'irrigated', label: 'Irrigated' },
              { value: 'rainfed', label: 'Rainfed / no irrigation' },
            ]}
            onChange={(kind) => setDraft({ ...draft, kind })}
          />
          <p>
            Changing zone metadata does not overwrite individual unit metadata. Rainfed zones cannot
            contain hardware.
          </p>
          <fieldset>
            <legend>Associated beds</legend>
            {study.crops.map((b) => (
              <label key={b.id}>
                <input
                  type="checkbox"
                  checked={draft.bedIds.includes(b.id)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      bedIds: e.target.checked
                        ? [...draft.bedIds, b.id]
                        : draft.bedIds.filter((id) => id !== b.id),
                    })
                  }
                />
                {b.id} · {b.crop}
              </label>
            ))}
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </div>
        <footer>
          <button
            type="button"
            className="danger"
            onClick={() =>
              onApply({
                ...study,
                irrigationZones: study.irrigationZones.filter((z) => z.id !== zoneId),
                irrigationUnits: study.irrigationUnits.map((u) =>
                  u.zoneId === zoneId ? { ...u, zoneId: '' } : u,
                ),
              })
            }
          >
            Delete zone; keep units
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Apply
          </button>
        </footer>
      </form>
    </dialog>
  );
}
