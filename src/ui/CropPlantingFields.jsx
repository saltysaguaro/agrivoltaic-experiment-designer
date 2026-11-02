import React from 'react';
import { Field } from './Controls.jsx';
import { normalizeCropPlanting, plantingSummary, MAX_CROP_ROWS } from '../domain/crop-planting.js';
export default function CropPlantingFields({ plot, onChange }) {
  const p = normalizeCropPlanting(plot).planting;
  const summary = Number.isFinite(plot.width) ? plantingSummary(plot) : null;
  const update = (key, value) => onChange({ ...p, [key]: value });
  return (
    <fieldset className="crop-planting-fields">
      <legend>Rows and plants within each bed</legend>
      <Field
        label="Crop rows per bed"
        value={p.rowCount}
        min={1}
        max={MAX_CROP_ROWS}
        step={1}
        integer
        help="Default: one centred crop row. Rows run along the PV rows. This is separate from the number of beds between PV rows. Software limit: 100 crop rows per bed."
        onChange={(v) => update('rowCount', v)}
      />
      <button type="button" className="text-button" onClick={() => update('rowCount', 1)}>
        Reset to one crop row
      </button>
      <div className="field-pair">
        {[
          [
            'rowSpacing',
            'Spacing between crop rows',
            'Centre-to-centre distance across the bed. One row stays centred; additional rows are centred as a group. Row centres must fit inside the bed.',
          ],
          [
            'plantSpacing',
            'Spacing between plants',
            'Centre-to-centre distance along each crop row. Plants are centred along the bed; counts are planned planting positions, not a prediction of germination or yield.',
          ],
        ].map(([key, label, help]) => (
          <div key={key}>
            <Field
              label={label}
              unit="m"
              min={0.001}
              max={100}
              step={0.01}
              value={p[key]}
              help={help}
              onChange={(v) => onChange({ ...p, [key]: v, [`${key}Mode`]: 'custom' })}
            />
            <label className="spacing-default-toggle">
              <input
                type="checkbox"
                checked={p[`${key}Mode`] === 'default'}
                aria-label={`Use crop default for ${key === 'rowSpacing' ? 'row' : 'plant'} spacing`}
                onChange={(event) =>
                  onChange({
                    ...p,
                    [key]: event.target.checked ? p.preset[key] : p[key],
                    [`${key}Mode`]: event.target.checked ? 'default' : 'custom',
                  })
                }
              />
              Use crop default
            </label>
            <small>
              {p[`${key}Mode`] === 'custom' ? 'User defined' : 'Crop preset'} · {p.preset[key]} m
              preset
            </small>
            <button
              type="button"
              className="text-button"
              onClick={() => onChange({ ...p, [key]: p.preset[key], [`${key}Mode`]: 'default' })}
            >
              Reset {key === 'rowSpacing' ? 'row' : 'plant'} spacing
            </button>
          </div>
        ))}
      </div>
      <small>
        {p.preset.basis === 'published'
          ? 'Published crop guidance'
          : p.preset.basis === 'adapted'
            ? 'Adapted planning estimate'
            : 'Placeholder spacing'}{' '}
        · {p.preset.note}{' '}
        {/^https:\/\//.test(p.preset.sourceUrl) && (
          <a href={p.preset.sourceUrl} target="_blank" rel="noreferrer">
            {p.preset.sourceTitle}
          </a>
        )}
      </small>
      {summary &&
        (summary.issue ? (
          <p className="warning" role="alert">
            {summary.issue} Crop rows are hidden until they fit.
          </p>
        ) : (
          <p>
            {summary.plantsPerRow} planting positions per row · {summary.positions} per bed. Dense
            plant dots are sampled in drawings; row spacing and counts stay exact.
          </p>
        ))}
    </fieldset>
  );
}
