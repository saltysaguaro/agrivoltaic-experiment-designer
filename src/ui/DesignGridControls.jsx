import React, { useState } from 'react';
import { Field } from './Controls.jsx';
import {
  copyIrradianceGrid,
  designGridSpec,
  designGridDescription,
} from '../experiment/design-grid.js';
export default function DesignGridControls({ study, onChange }) {
  const [error, setError] = useState('');
  const g = designGridSpec(study);
  const apply = (value) => {
    try {
      onChange(value);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <details className="design-grid-controls">
      <summary>
        Design grid · {g.nx} × {g.ny} cells
      </summary>
      <p>
        {designGridDescription(study)} Placement grid changes do not recalculate light. Existing
        instruments and cell-aligned beds snap to the new cells; exact beds retain their dimensions.
      </p>
      <Field
        label="Design cells across a PV row"
        value={study.designGrid?.cellsPerRow || study.analysis.cellsPerRow}
        min={1}
        max={200}
        step={1}
        integer
        help="Number of square cells from one PV row centre to the next at regular row pitch. Cell width and height both equal row pitch divided by this count. This only changes placement detail. Limit: 200,000 design cells. Wider group aisles may not align with cell edges."
        onChange={(cellsPerRow) => apply({ version: 1, mode: 'square', cellsPerRow })}
      />
      <button
        type="button"
        className="secondary compact"
        onClick={() => apply(copyIrradianceGrid(study))}
      >
        Copy current irradiance grid
      </button>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
