import React from 'react';
import { Field } from './Controls.jsx';
import { irrigationFlowToDisplay, irrigationFlowFromDisplay } from '../domain/irrigation.js';
export default function IrrigationFields({ unit, onChange, followBed = false }) {
  const field = (key, label, unitLabel, min, max, step = 0.1, help) => (
    <Field
      key={key}
      label={label}
      value={unit[key]}
      unit={unitLabel}
      min={min}
      max={max}
      step={step}
      help={help}
      onChange={(v) => onChange({ ...unit, [key]: v })}
    />
  );
  const optional = (key, label, display, convert, unitLabel) => (
    <Field
      key={key}
      label={label}
      value={display(unit[key])}
      type="text"
      unit={unitLabel}
      help="Leave blank if unknown. Equipment ratings do not imply modeled water delivery."
      onChange={(v) => onChange({ ...unit, [key]: convert(v) })}
    />
  );
  return (
    <>
      {followBed && (
        <p>
          Unit length and area width match each linked bed automatically. Detach or disable matching
          in the unit editor to set dimensions independently.
        </p>
      )}
      {unit.method.startsWith('custom-') && (
        <Field
          label="Custom method name"
          type="text"
          value={unit.label}
          onChange={(label) => onChange({ ...unit, label })}
        />
      )}

      <div className="field-pair">
        {unit.kind !== 'point' && !followBed && field('length', 'Unit length', 'm', 0.01, 1000)}
        {unit.kind === 'area' &&
          !followBed &&
          field('width', 'Irrigated area width', 'm', 0.01, 1000)}
        {unit.angle !== undefined &&
          field(
            'angle',
            'Bearing relative to crop rows',
            '°',
            -360,
            360,
            1,
            'Zero follows the crop rows; positive angles turn toward the across-row axis. The unit rotates with the array.',
          )}
        {field(
          'z',
          unit.method === 'subsurface-drip'
            ? 'Installation depth (negative)'
            : 'Installation height / depth',
          'm',
          -5,
          unit.method === 'subsurface-drip' ? -0.001 : 20,
          0.05,
          'Stored installation elevation; below ground is negative. Plan-view hardware is drawn at ground level for readability.',
        )}
        {unit.emitterSpacing !== undefined &&
          field(
            'emitterSpacing',
            'Emitter spacing',
            'm',
            0.001,
            100,
            0.01,
            'Independent of crop plant spacing. Dense emitter marks are sampled for display.',
          )}
        {unit.emitterOffset !== undefined &&
          field('emitterOffset', 'First emitter from line start', 'm', 0, unit.length, 0.01)}
        {unit.radius !== undefined &&
          field(
            'radius',
            'Nominal spray radius',
            'm',
            0.01,
            100,
            0.1,
            'Manufacturer nominal radius, not a simulated wetted area. Wind, pressure and PV obstructions are not modeled.',
          )}
        {unit.arc !== undefined && field('arc', 'Nominal spray arc', '°', 1, 360, 1)}
        {unit.method === 'furrow' && field('width', 'Furrow width', 'm', 0.01, 10)}
        {unit.method === 'furrow' && field('depth', 'Furrow depth', 'm', 0.001, 5)}
        {unit.method === 'furrow' &&
          field(
            'grade',
            'Furrow grade',
            'm/m',
            -1,
            1,
            0.001,
            'Signed elevation change per metre in the arrow direction; metadata only, without a terrain or flow simulation.',
          )}
        {unit.kind === 'area' &&
          field(
            'grade',
            'Area grade',
            'm/m',
            -1,
            1,
            0.001,
            'Signed elevation change per metre along the unit bearing; recorded only.',
          )}
        {unit.kind === 'area' &&
          field(
            'inletOffset',
            'Inlet offset across area',
            '× width',
            -0.5,
            0.5,
            0.05,
            'Position on the starting edge as a fraction of area width; zero centres the inlet.',
          )}
        {unit.kind === 'area' && field('bundHeight', 'Bund height', 'm', 0, 5, 0.01)}
      </div>
      <details>
        <summary>Equipment and water metadata</summary>
        <p>
          Leave unknown ratings blank. Drip flow is per emitter; other unit flow is per head or
          inlet. Layout only: no hydraulic or water-demand simulation.
        </p>
        {optional(
          'ratedFlow',
          'Rated flow',
          irrigationFlowToDisplay,
          irrigationFlowFromDisplay,
          'L/h',
        )}
        {optional(
          'measuredFlow',
          'Measured flow',
          irrigationFlowToDisplay,
          irrigationFlowFromDisplay,
          'L/h',
        )}
        {optional(
          'pressure',
          'Rated operating pressure',
          (v) => (v === null ? '' : v / 1000),
          (v) => (v === '' ? null : Number(v) * 1000),
          'kPa',
        )}
        {unit.kind === 'area' &&
          optional(
            'appliedDepth',
            'Intended applied depth',
            (v) => (v === null ? '' : v * 1000),
            (v) => (v === '' ? null : Number(v) / 1000),
            'mm',
          )}
        <Field
          label="Manufacturer / model"
          type="text"
          value={unit.model}
          onChange={(v) => onChange({ ...unit, model: v })}
        />
        <Field
          label="Installation status"
          value={unit.status}
          options={['planned', 'installed']}
          onChange={(v) => onChange({ ...unit, status: v })}
        />
        <Field
          label="Unit notes"
          type="text"
          value={unit.notes}
          onChange={(v) => onChange({ ...unit, notes: v })}
        />
      </details>
    </>
  );
}
