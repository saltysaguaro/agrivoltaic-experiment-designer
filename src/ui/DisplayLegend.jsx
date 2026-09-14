import React from 'react';
import { zoneStyles } from '../domain/land-use.js';
export default function DisplayLegend({
  scope,
  layers,
  setLayer,
  opacity,
  setOpacity,
  control = false,
  fieldLayout = true,
}) {
  const array = ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(
    scope,
  );
  const items = [
    ['modules', 'PV modules', 'legend-square'],
    ...(scope === 'module' ? [] : [['supports', 'Racking', 'legend-square steel']]),
    ...(array || scope === 'pair'
      ? Object.entries(zoneStyles)
          .filter(([key]) => array || key !== 'perimeter')
          .map(([key, s]) => [key, `${s.symbol} · ${s.label}`, `zone-swatch ${key}`])
      : []),
    ...(array
      ? [
          ['receiver', 'Receiver boundary', 'receiver-swatch'],
          ['plots', 'Crop plots', 'zone-swatch cropping'],
          ['sensors', 'Field sensors', 'legend-dot'],
        ]
      : []),
  ];
  return (
    <div className="display-legend" aria-label="Drawing layers">
      <div className="layer-buttons">
        {items
          .filter(
            ([key]) =>
              (!control ||
                !['modules', 'supports', 'underPanel', 'cropping', 'perimeter'].includes(key)) &&
              (fieldLayout || !['sensors', 'plots'].includes(key)),
          )
          .map(([key, label, style]) => (
            <button
              key={key}
              type="button"
              aria-pressed={layers[key]}
              onClick={() => setLayer(key, !layers[key])}
              className={'layer-toggle ' + (layers[key] ? '' : 'hidden-layer')}
            >
              <i className={style} />
              {label}
            </button>
          ))}
        <small>Click a legend item to show or hide it.</small>
      </div>
      {array && !control && (
        <label className="panel-opacity">
          Panel opacity <output>{Math.round(opacity * 100)}%</output>
          <input
            aria-label="Panel opacity"
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          />
        </label>
      )}
    </div>
  );
}
