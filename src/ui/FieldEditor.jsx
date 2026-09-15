import { maxRows } from '../domain/receiver-grid.js';
import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Field } from './Controls.jsx';
import CropPicker from './CropPicker.jsx';
import { sensorTypes } from '../domain/study.js';
import { cropIdentity, cropById } from '../domain/crop-catalog.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { plotStats } from '../experiment/layout.js';
import { plotZoneOverlap } from '../domain/land-use.js';
export default function FieldEditor({
  study,
  selection,
  result,
  control = false,
  onSave,
  onClose,
  onDelete,
}) {
  const sensor = selection.kind === 'sensor';
  const items = sensor ? study.experimentSensors : study.crops;
  const item = items.find((v) => v.id === selection.id);
  const [draft, setDraft] = useState(() => structuredClone(item)),
    [error, setError] = useState('');
  const form = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    form.current?.querySelector('input,select')?.focus();
    return () => {
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  if (!item) return null;
  const g = receiverGridSpec(study),
    update = (key, v) => setDraft((d) => ({ ...d, [key]: v }));
  const stats = sensor ? null : plotStats(result, item),
    overlap = sensor || control ? 0 : plotZoneOverlap(study, item);
  function save(e) {
    e.preventDefault();
    if (form.current.querySelector('[aria-invalid="true"]')) {
      setError('Correct the marked value before saving.');
      return;
    }
    if (!draft.id.trim()) {
      setError('Enter an ID.');
      return;
    }
    if (items.some((v) => v.id !== item.id && v.id === draft.id.trim())) {
      setError('Choose an unused ID.');
      return;
    }
    if (!sensor && !cropById(draft.cropId)) {
      setError('Select a crop from the catalog.');
      return;
    }
    onSave({ ...draft, id: draft.id.trim() });
  }
  return (
    <form
      ref={form}
      className="field-editor"
      role="dialog"
      aria-label={sensor ? `Edit sensor ${item.id}` : `Edit crop bed ${item.id}`}
      onSubmit={save}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <header>
        <strong>
          {sensor ? 'Sensor' : 'Crop bed'} · {item.id}
        </strong>
        <button type="button" aria-label="Close item editor" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <div className="editor-fields">
        <Field label="ID" type="text" value={draft.id} onChange={(v) => update('id', v)} />
        {sensor ? (
          <Field
            label="Instrument type"
            value={draft.type}
            options={sensorTypes}
            onChange={(v) => update('type', v)}
          />
        ) : (
          <>
            <CropPicker
              value={draft.cropId}
              legacy={draft.crop}
              onChange={(id) => setDraft((d) => ({ ...d, ...cropIdentity(id) }))}
            />
            <Field
              label="Cultivar / variety"
              type="text"
              value={draft.cultivar || ''}
              onChange={(v) => update('cultivar', v)}
            />
          </>
        )}
        <div className="field-pair">
          {['column', 'row', ...(sensor ? [] : ['columns', 'rows'])].map((key) => {
            const size = key.endsWith('s'),
              horizontal = key.startsWith('column');
            const limit = horizontal ? g.nx : g.ny,
              extent = horizontal ? draft.grid.columns : draft.grid.rows;
            const max = size
              ? Math.min(
                  limit - draft.grid[horizontal ? 'column' : 'row'],
                  horizontal ? Math.floor(100 / g.dx) : maxRows(g, draft.grid.row),
                )
              : limit - (extent || 1) + 1;
            return (
              <Field
                key={key}
                label={
                  {
                    column: 'Receiver column',
                    row: 'Receiver row',
                    columns: 'Columns wide',
                    rows: 'Rows long',
                  }[key]
                }
                value={draft.grid[key] + (size ? 0 : 1)}
                min={1}
                max={Math.max(1, max)}
                step={1}
                integer
                help="Coordinates snap to whole receiver cells; columns run along the PV rows."
                onChange={(v) => update('grid', { ...draft.grid, [key]: v - (size ? 0 : 1) })}
              />
            );
          })}
        </div>
        <small>
          East {item.x.toFixed(3)} m · North {item.y.toFixed(3)} m
        </small>
        {sensor && (
          <Field
            label="Height / depth"
            unit="m"
            min={-5}
            max={20}
            value={draft.z}
            onChange={(v) => update('z', v)}
          />
        )}
        {['treatment', 'replicate', ...(sensor ? ['model', 'logger', 'channel'] : [])].map(
          (key) => (
            <Field
              key={key}
              label={key[0].toUpperCase() + key.slice(1)}
              type="text"
              value={draft[key]}
              onChange={(v) => update(key, v)}
            />
          ),
        )}
        {sensor && (
          <div className="field-pair">
            {['azimuth', 'tilt'].map((key) => (
              <Field
                key={key}
                label={key === 'azimuth' ? 'Orientation azimuth' : 'Sensor tilt'}
                unit="°"
                min={0}
                max={key === 'azimuth' ? 360 : 180}
                value={draft[key] ?? 0}
                onChange={(v) => update(key, v)}
              />
            ))}
          </div>
        )}
        <Field
          label="Notes"
          type="text"
          value={draft.notes || ''}
          onChange={(v) => update('notes', v)}
        />
        {sensor ? (
          <small>
            Height/depth is independent of map position. Light values describe the horizontal
            numerical receiver.
          </small>
        ) : (
          <>
            <small>
              {item.width.toFixed(2)} × {item.length.toFixed(2)} m ·{' '}
              {(item.width * item.length).toFixed(2)} m²
            </small>
            {stats && (
              <p className="info-box">
                {result.estimated ? 'Estimated DLI' : 'DLI'}: {stats.mean.toFixed(1)} ±{' '}
                {stats.sd.toFixed(1)} mol m⁻² d⁻¹ · sunlight {stats.sunlight.toFixed(1)}% ·{' '}
                {stats.count} receivers
              </p>
            )}
            {overlap > 1e-6 && (
              <p className="zone-warning">{overlap.toFixed(2)} m² overlaps reserved ground.</p>
            )}
            {cropById(draft.cropId) && (
              <a href={cropById(draft.cropId).taxonUrl} target="_blank" rel="noreferrer">
                GBIF botanical record ↗
              </a>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="zone-warning">
            {error}
          </p>
        )}
      </div>
      <footer>
        <button type="button" className="text-button danger" onClick={onDelete}>
          <Trash2 size={15} /> Delete
        </button>
        <button type="button" className="secondary compact" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="primary compact">
          Apply
        </button>
      </footer>
    </form>
  );
}
