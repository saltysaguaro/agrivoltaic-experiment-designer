import { cellAt } from '../experiment/grid-layout.js';
import React, { useState } from 'react';
import { Field } from './Controls.jsx';
import IrrigationFields from './IrrigationFields.jsx';
import { irrigationMethod, irrigationUnitSchema } from '../domain/irrigation.js';
import { localToWorld, worldToLocal } from '../domain/geometry.js';
export default function IrrigationEditor({ study, selection, onSave, onClose, onDelete }) {
  const original = study.irrigationUnits.find((u) => u.id === selection.id);
  const [draft, setDraft] = useState(() => structuredClone(original)),
    [error, setError] = useState('');
  if (!draft) return null;
  const local = worldToLocal(study, draft.x, draft.y);
  return (
    <form
      className="field-editor"
      role="dialog"
      aria-label={`Edit irrigation ${original.id}`}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') onClose();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        try {
          if (e.currentTarget.querySelector('[aria-invalid="true"]'))
            throw Error('Correct the marked value.');
          const parsed = irrigationUnitSchema.parse(draft);
          if (!parsed.link && !cellAt(study, parsed, undefined, false))
            throw Error('Unit centre must be inside the design grid.');
          onSave(parsed);
        } catch (e) {
          setError(e.issues ? e.issues.map((i) => i.message).join(' ') : e.message);
        }
      }}
    >
      <header>
        <strong>
          {irrigationMethod(draft.method)[1]} · {original.id}
        </strong>
        <button type="button" aria-label="Close item editor" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="editor-fields">
        <Field
          label="ID"
          type="text"
          value={draft.id}
          onChange={(id) => setDraft({ ...draft, id })}
        />
        <Field
          label="Unit label"
          type="text"
          value={draft.label}
          onChange={(label) => setDraft({ ...draft, label })}
        />
        <Field
          label="Irrigation zone"
          value={draft.zoneId}
          options={[
            { value: '', label: 'Unassigned' },
            ...(study.irrigationZones || [])
              .filter((z) => z.kind === 'irrigated')
              .map((z) => ({ value: z.id, label: z.name })),
          ]}
          onChange={(zoneId) => setDraft({ ...draft, zoneId })}
        />
        {draft.link ? (
          <>
            <p>
              Linked to bed {draft.link.bedId}. Movement follows that bed; crop-row changes require
              an explicit replacement layout.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setDraft({ ...draft, link: null })}
            >
              Detach from bed
            </button>
            {[
              ['along', 'Offset along bed'],
              ['across', 'Offset across bed'],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={draft.link[key]}
                min={-100}
                max={100}
                unit="m"
                onChange={(v) => setDraft({ ...draft, link: { ...draft.link, [key]: v } })}
              />
            ))}
            <label>
              <input
                type="checkbox"
                checked={draft.link.followLength}
                onChange={(e) =>
                  setDraft({ ...draft, link: { ...draft.link, followLength: e.target.checked } })
                }
              />
              Match bed length / area
            </label>
          </>
        ) : (
          <div className="field-pair">
            {[
              ['x', 'Along-row centre'],
              ['y', 'Across-row centre'],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={local[key]}
                min={-10000}
                max={10000}
                unit="m"
                onChange={(v) => {
                  const p = localToWorld(
                    study,
                    key === 'x' ? v : local.x,
                    key === 'y' ? v : local.y,
                  );
                  setDraft({ ...draft, x: p.x, y: p.y, grid: undefined });
                }}
              />
            ))}
          </div>
        )}
        <IrrigationFields unit={draft} onChange={setDraft} followBed={draft.link?.followLength} />
        {['treatment', 'replicate'].map((key) => (
          <Field
            key={key}
            label={key === 'treatment' ? 'Treatment' : 'Replicate'}
            type="text"
            value={draft[key]}
            onChange={(v) => setDraft({ ...draft, [key]: v })}
          />
        ))}
        {error && <p role="alert">{error}</p>}
      </div>
      <footer>
        <button type="button" className="text-button danger" onClick={onDelete}>
          Delete
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="primary">
          Apply
        </button>
      </footer>
    </form>
  );
}
