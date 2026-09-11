import { moduleOptics } from '../domain/optics.js';
import { isPeriod, periodLabel, dliLabel } from '../domain/period.js';
import React, { useId, useState, useEffect, useRef, createContext, useContext } from 'react';
import Info from './Info.jsx';
import CropPicker from './CropPicker.jsx';
import { cropIdentity } from '../domain/crop-catalog.js';
import LocationSearch from './LocationSearch.jsx';
import { receiverGridSpec } from '../domain/geometry.js';
import { inputHelp, labelHelp } from './help.js';
import { Upload, Plus, Trash2, MapPin, Sparkles, Download, Play, Square } from 'lucide-react';
import { dimensions, sensorTypes, rackingMinimums } from '../domain/study.js';
import { plotZoneOverlap, landUseSummary } from '../domain/land-use.js';
import { plotStats } from '../experiment/layout.js';
const inputText = (value) =>
  typeof value === 'number' ? String(Number(value.toFixed(6))) : String(value);
const InspectionContext = createContext(null);
export function Field({
  annotation,
  label,
  value,
  onChange,
  unit,
  type = 'number',
  min,
  max,
  step = 0.1,
  options,
  hint,
  help,
  integer = false,
}) {
  const inspect = useContext(InspectionContext);
  const id = useId();
  const [draft, setDraft] = useState(inputText(value));
  const emitted = useRef(value);
  const dirty = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (value !== emitted.current) {
      setDraft(inputText(value));
      dirty.current = false;
      emitted.current = value;
    }
    setError('');
  }, [value]);
  function commit(text = draft) {
    if (!dirty.current) return;
    const number = Number(text);
    const message =
      text.trim() === '' || !Number.isFinite(number)
        ? 'Enter a number.'
        : min !== undefined && number < min
          ? `Enter ${min} or more.`
          : max !== undefined && number > max
            ? `Enter ${max} or less.`
            : integer && !Number.isInteger(number)
              ? 'Enter a whole number.'
              : '';
    setError(message);
    if (!message) {
      setDraft(inputText(number));
      dirty.current = false;
      if (number !== emitted.current) {
        emitted.current = number;
        onChange(number);
      }
    }
  }
  return (
    <div
      className="field"
      data-annotation={annotation}
      onFocusCapture={() =>
        annotation && inspect?.({ id: annotation, label, unit, help: help || labelHelp[label] })
      }
    >
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        <Info label={label}>
          {help || labelHelp[label] || hint || `Set ${label.toLowerCase()} for this study.`}
        </Info>
      </div>
      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(typeof value === 'number' ? +e.target.value : e.target.value)}
        >
          {options.map((o) => (
            <option
              key={typeof o === 'object' ? o.value : o}
              value={typeof o === 'object' ? o.value : o}
            >
              {typeof o === 'object' ? o.label : o}
            </option>
          ))}
        </select>
      ) : (
        <div className="input-wrap">
          <input
            id={id}
            type={type === 'number' ? 'text' : type}
            inputMode={type === 'number' ? 'decimal' : undefined}
            role={type === 'number' ? 'spinbutton' : undefined}
            aria-valuenow={
              type === 'number' && draft.trim() && Number.isFinite(Number(draft))
                ? Number(draft)
                : undefined
            }
            aria-valuemin={min}
            aria-valuemax={max}
            value={type === 'number' ? draft : value}
            min={min}
            max={max}
            step={step}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onBlur={type === 'number' ? () => commit() : undefined}
            onKeyDown={(e) => {
              if (type !== 'number') return;
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
              if (e.key === 'Escape') {
                dirty.current = false;
                setDraft(inputText(value));
                setError('');
              }
              if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                dirty.current = true;
                const n = Number(draft.trim() && Number.isFinite(Number(draft)) ? draft : value);
                commit(
                  String(
                    Math.max(
                      min ?? -Infinity,
                      Math.min(
                        max ?? Infinity,
                        Number((n + (e.key === 'ArrowUp' ? step : -step)).toFixed(10)),
                      ),
                    ),
                  ),
                );
                setError('');
              }
            }}
            onChange={(e) => {
              if (type === 'number') {
                dirty.current = true;
                const text = e.target.value;
                setDraft(text);
                setError('');
                // Publish complete, valid numbers while preserving intermediate drafts.
                const n = Number(text);
                if (
                  /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text) &&
                  Number.isFinite(n) &&
                  (min === undefined || n >= min) &&
                  (max === undefined || n <= max) &&
                  (!integer || Number.isInteger(n))
                ) {
                  if (n !== emitted.current) {
                    emitted.current = n;
                    onChange(n);
                  }
                }
              } else onChange(e.target.value);
            }}
          />
          {unit && <span>{unit}</span>}
        </div>
      )}
      {hint && <small>{hint}</small>}
      {error && (
        <small id={`${id}-error`} role="alert" className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
export default function Controls({
  onInspect,
  canResume,
  step,
  s,
  set,
  result,
  busy,
  progress,
  elapsed,
  preview,
  run,
  cancel,
  uploadWeather,
  selectLocation,
  weatherStatus,
  refreshWeather,
  template,
  placing,
  fieldTool,
  setPlacing,
  addSensor,
  addPercentiles,
  addPlot,
  removeSensor,
  removePlot,
}) {
  const receiver = receiverGridSpec(s);
  const optics = moduleOptics(s.module);
  const d = dimensions(s),
    minimum = rackingMinimums(s);
  const field = (section, key, label, unit, options, extra = {}) => (
    <Field
      key={section + key}
      annotation={`${section}.${key}`}
      help={inputHelp[`${section}.${key}`]}
      label={label}
      value={s[section][key]}
      onChange={(v) => set(section, key, v)}
      unit={unit}
      options={options}
      integer={['high', 'wide', 'tables', 'rows', 'groupSize'].includes(key)}
      {...extra}
    />
  );
  return (
    <InspectionContext.Provider value={onInspect}>
      <div className="control-content">
        {step === 0 && (
          <>
            <p className="control-note">
              Start with the module you will install. Dimensions refer to the outer frame.
            </p>
            <div className="field-pair">
              {field('module', 'length', 'Length', 'm', null, { min: 0.1, max: 5, step: 0.001 })}
              {field('module', 'width', 'Width', 'm', null, { min: 0.1, max: 3, step: 0.001 })}
            </div>
            <div className="field-pair">
              {field('module', 'thickness', 'Thickness', 'm', null, {
                min: 0.005,
                max: 0.2,
                step: 0.001,
              })}
              {field('module', 'power', 'Rated DC power', 'W', null, {
                min: 1,
                max: 1500,
                step: 5,
              })}
            </div>
            {field('module', 'gap', 'Default module gap', 'm', null, {
              min: 0,
              max: 0.5,
              step: 0.005,
            })}
            <Field
              annotation="module.bifacial"
              label="Module construction"
              value={s.module.bifacial ? 'bifacial' : 'monofacial'}
              options={[
                { value: 'monofacial', label: 'Monofacial · opaque' },
                { value: 'bifacial', label: 'Bifacial · transmitting cell gaps' },
              ]}
              onChange={(v) => set('module', 'bifacial', v === 'bifacial')}
              help="Bifacial enables internal cell gaps and light transmission through transparent laminate. Electrical output and rear-side electrical gain are not simulated."
            />
            {s.module.bifacial && (
              <>
                <p className="control-note">
                  Outer dimensions stay fixed. X runs across module width; Y runs along module
                  length, before table orientation and rotation.
                </p>
                <div className="field-pair">
                  {field('module', 'cellColumns', 'Cell columns (X)', null, null, {
                    min: 1,
                    max: 24,
                    step: 1,
                    integer: true,
                  })}
                  {field('module', 'cellRows', 'Cell rows (Y)', null, null, {
                    min: 1,
                    max: 48,
                    step: 1,
                    integer: true,
                  })}
                </div>
                <div className="field-pair">
                  {field('module', 'cellGapX', 'Cell gap X', 'm', null, {
                    min: 0,
                    max: 0.2,
                    step: 0.001,
                  })}
                  {field('module', 'cellGapY', 'Cell gap Y', 'm', null, {
                    min: 0,
                    max: 0.2,
                    step: 0.001,
                  })}
                </div>
                {field('module', 'cellMargin', 'Opaque perimeter width', 'm', null, {
                  min: 0,
                  max: 0.2,
                  step: 0.001,
                })}
                <div className="field-pair">
                  {field(
                    'module',
                    'gapTransmission',
                    'Laminate broadband transmission',
                    null,
                    null,
                    { min: 0, max: 1, step: 0.01 },
                  )}
                  {field('module', 'gapParTransmission', 'Laminate PAR transmission', null, null, {
                    min: 0,
                    max: 1,
                    step: 0.01,
                  })}
                </div>
                <div className="info-box" role="status">
                  Fitted cells: {(optics.cellWidth * 1000).toFixed(1)} ×{' '}
                  {(optics.cellLength * 1000).toFixed(1)} mm.
                  <br />
                  Internal gap area: {(100 * optics.openFraction).toFixed(2)}%.
                  <br />
                  Linked module transmission: {(100 * optics.broadband).toFixed(2)}% broadband ·{' '}
                  {(100 * optics.par).toFixed(2)}% PAR.
                </div>
                <p className="control-note">
                  Area-averaged transmission through each module. Does not resolve individual
                  cell-gap sunflecks or angle-dependent glass optics. Set both laminate values to 0
                  for an opaque backsheet.
                </p>
              </>
            )}
          </>
        )}
        {step === 1 && (
          <>
            {field('racking', 'type', 'Mounting system', null, [
              { value: 'fixed', label: 'Fixed tilt' },
              { value: 'single-axis', label: 'Single-axis tracker' },
              { value: 'dual-axis', label: 'Dual-axis tracker' },
              { value: 'vertical', label: 'Vertical bifacial' },
              { value: 'pergola', label: 'Raised / pergola' },
            ])}
            <small>
              Rack, module and table changes increase clearances when needed. Larger custom
              clearances are retained.
            </small>
            <button className="text-button" onClick={() => set('racking', 'type', s.racking.type)}>
              Apply minimum clearances
            </button>
            {field('racking', 'height', 'Module centre / axis height', 'm', null, {
              min: 0.2,
              max: 25,
              step: 0.01,
              hint: `Suggested minimum: ${minimum.height.toFixed(2)} m.`,
            })}
            {!['vertical', 'pergola'].includes(s.racking.type) &&
              field('racking', 'tilt', 'Fixed / preview tilt', '°', null, {
                min: 0,
                max: 85,
                step: 1,
              })}
            {['single-axis', 'dual-axis'].includes(s.racking.type) && (
              <>
                {field('racking', 'limit', 'Rotation limit', '± °', null, {
                  min: 0,
                  max: 85,
                  step: 1,
                })}
                {s.racking.type === 'single-axis' && (
                  <label className="check">
                    <input
                      type="checkbox"
                      onFocus={() =>
                        onInspect?.({ id: 'racking.backtracking', label: 'Backtracking' })
                      }
                      checked={s.racking.backtracking}
                      onChange={(e) => set('racking', 'backtracking', e.target.checked)}
                    />{' '}
                    Enable flat-terrain backtracking{' '}
                    <Info label="backtracking">{inputHelp['racking.backtracking']}</Info>
                  </label>
                )}
                <div className="info-box">
                  During analysis, the rack follows the sun. Diffuse visibility uses 2° pose bins.
                </div>
              </>
            )}
            {field('racking', 'postSize', 'Support post width', 'm', null, {
              min: 0.02,
              max: 0.5,
              step: 0.01,
            })}
          </>
        )}
        {step === 2 && (
          <>
            {field('table', 'orientation', 'Module orientation', null, ['portrait', 'landscape'])}
            <div className="field-pair">
              {field('table', 'high', 'Modules across', null, null, { min: 1, max: 5, step: 1 })}
              {field('table', 'wide', 'Modules along', null, null, { min: 1, max: 20, step: 1 })}
            </div>
            {field('row', 'tables', 'Tables per row', null, null, {
              min: 1,
              max: 20,
              step: 1,
              hint: '1–20 tables per row (current application limit).',
            })}
            {field('row', 'tableGap', 'Gap between tables', 'm', null, {
              min: 0.05,
              max: 30,
              step: 0.01,
              hint: `Suggested minimum for this rack: ${minimum.tableGap.toFixed(2)} m.`,
            })}
            <div className="info-box">
              Assembly: {d.width.toFixed(2)} m across × {d.length.toFixed(2)} m along the row.
            </div>
          </>
        )}
        {step === 3 && (
          <>
            {field('rowPair', 'pitch', 'Row centre-to-centre pitch', 'm', null, {
              min: 0.5,
              max: 120,
              step: 0.01,
              hint: `Suggested minimum for this rack: ${minimum.pitch.toFixed(2)} m.`,
            })}
            <div className="derived">
              <span>Clear spacing at regular pitch</span>
              <strong>{d.clear.toFixed(2)} m</strong>
            </div>
            {field(
              'landUse',
              'underPanelWidth',
              'Non-cultivated width beneath each row',
              'm',
              null,
              {
                min: 0,
                max: s.rowPair.pitch,
                hint: 'U · Total centred strip width; 0 allows crops beneath the row.',
              },
            )}
            {field('rowPair', 'cropSetback', 'Crop setback from each edge', 'm', null, {
              min: -d.projected / 2,
              max: (s.rowPair.pitch - d.projected) / 2,
              hint: 'S · Negative values allow crops beneath the panel edges.',
            })}
            {field('rowPair', 'croppingWidth', 'Cropping area width', 'm', null, {
              min: 0,
              max: s.rowPair.pitch,
              hint: 'C · Linked to non-cultivated width and setback.',
            })}
            <div className="info-box">
              Non-cultivated width + cropping width = {s.rowPair.pitch} m row pitch. The two areas
              share an edge. Group aisles add cropping space. Setback is measured from the panel
              edge at the displayed tilt.
            </div>
          </>
        )}
        {step === 4 && (
          <>
            {field('array', 'rows', 'Number of rows', null, null, { min: 1, max: 24, step: 1 })}
            {field('array', 'azimuth', 'Module-facing azimuth', '°', null, {
              min: 0,
              max: 359.9,
              step: 1,
              hint: 'Clockwise from north. 180° faces south; rows run east–west.',
            })}
            {field('landUse', 'perimeterBuffer', 'Perimeter no-crop buffer', 'm', null, {
              min: 0,
              max: 20,
              hint: 'B · Outside the design envelope; independent of sampling.',
            })}
            {field('array', 'buffer', 'Perimeter receiver buffer', 'm', null, { min: 0, max: 20 })}
            <div className="field-pair">
              {field('array', 'groupSize', 'Rows per group', null, null, {
                min: 1,
                max: 24,
                step: 1,
              })}
              {field('array', 'aisle', 'Extra group aisle', 'm', null, { min: 0, max: 20 })}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <div
              onFocusCapture={() =>
                onInspect?.({
                  id: 'site.address',
                  label: 'Place search',
                  help: 'Selected latitude and longitude locate the array for weather and solar position.',
                })
              }
            >
              <LocationSearch address={s.site.address} onSelect={selectLocation} />
            </div>
            {s.site.utcOffsetApproximate && (
              <div className="info-box">
                UTC offset is estimated from longitude. Confirm the location’s standard time; do not
                include daylight saving time.
              </div>
            )}
            <div className="field-pair">
              {field('site', 'latitude', 'Latitude', '°', null, { min: -89, max: 89, step: 0.001 })}
              {field('site', 'longitude', 'Longitude', '°', null, {
                min: -180,
                max: 180,
                step: 0.001,
              })}
            </div>
            <div className="field-pair">
              {field('site', 'utcOffset', 'UTC offset', 'h', null, {
                min: -12,
                max: 14,
                step: 0.5,
              })}
              {field('site', 'elevation', 'Site elevation', 'm', null, {
                min: -500,
                max: 9000,
                step: 1,
              })}
            </div>
            {field('analysis', 'period', 'Analysis period', null, [
              { value: 'day', label: 'Single day' },
              { value: 'season', label: 'Season · month range' },
              { value: 'year', label: 'Calendar year' },
            ])}
            {!isPeriod(s) ? (
              field('analysis', 'date', 'Analysis date', null, null, { type: 'date' })
            ) : (
              <>
                {field(
                  'analysis',
                  'year',
                  s.analysis.period === 'season' ? 'Season starting year' : 'Calendar year',
                  null,
                  null,
                  { min: 1900, max: 2100, step: 1, integer: true },
                )}
                {s.analysis.period === 'season' && (
                  <div className="field-pair">
                    {field(
                      'analysis',
                      'startMonth',
                      'Start month',
                      null,
                      Array.from({ length: 12 }, (_, i) => ({
                        value: i + 1,
                        label: new Date(2020, i, 1).toLocaleString('en', { month: 'long' }),
                      })),
                    )}
                    {field(
                      'analysis',
                      'endMonth',
                      'End month',
                      null,
                      Array.from({ length: 12 }, (_, i) => ({
                        value: i + 1,
                        label: new Date(2020, i, 1).toLocaleString('en', { month: 'long' }),
                      })),
                    )}
                  </div>
                )}
                <div className="info-box">
                  {periodLabel(s)}. Every day is calculated. An earlier end month extends into the
                  following year. For future periods, upload representative dated weather or choose
                  illustrative weather explicitly.
                </div>
              </>
            )}
            {field('weather', 'mode', 'Weather source', null, [
              { value: 'automatic', label: 'Automatic · Open-Meteo' },
              { value: 'upload', label: 'Upload my weather' },
              { value: 'sample', label: 'Illustrative clear-sky weather' },
            ])}
            {s.weather.mode === 'automatic' && (
              <div className="weather-download">
                <p>Weather downloads automatically for your coordinates and selected period.</p>
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                  Weather by Open-Meteo · CC BY 4.0
                </a>
                {weatherStatus?.message && (
                  <p
                    role="status"
                    className={weatherStatus.state === 'error' ? 'weather-error' : ''}
                  >
                    {weatherStatus.message}
                  </p>
                )}
                <button
                  type="button"
                  className="secondary wide"
                  disabled={weatherStatus?.state === 'loading'}
                  onClick={refreshWeather}
                >
                  <Download size={14} />
                  {weatherStatus?.state === 'loading' ? 'Downloading…' : 'Refresh site weather'}
                </button>
              </div>
            )}

            <label className="upload-button">
              <Upload size={16} /> Upload weather{' '}
              <Info label="weather file">
                Upload complete coverage of GHI, DNI and DHI for the selected period from your own
                source. Accepts CSV, EPW or TMY3. Uploading switches off automatic downloads.
              </Info>
              <input
                onFocus={() =>
                  onInspect?.({
                    id: 'weather.name',
                    label: 'Weather upload',
                    help: 'Import complete weather for the selected period; its provenance is retained with the study.',
                  })
                }
                type="file"
                accept=".csv,.epw"
                onChange={(e) => {
                  if (e.target.files[0]) uploadWeather(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </label>
            <small className="muted">
              EPW, TMY3, or CSV. Local standard time; complete 24-hour coverage for every selected
              day.
            </small>
            <button className="text-button" onClick={template}>
              <Download size={14} /> CSV template
            </button>
            <div className="info-box">{s.weather.name}</div>
          </>
        )}
        {step === 6 && (
          <>
            <p className="control-note">
              {periodLabel(s)}
              {isPeriod(s) ? ' · Maps show period-total irradiation and mean daily DLI.' : ''}
            </p>
            <div className="field-pair">
              {field('analysis', 'resolution', 'Receiver spacing', 'm', null, {
                min: 0.25,
                max: 5,
                step: 0.25,
              })}
              {field('analysis', 'receiverHeight', 'Receiver height', 'm', null, {
                min: 0,
                max: 5,
              })}
            </div>
            {field('analysis', 'patches', 'Diffuse sky resolution', null, [
              { value: 145, label: 'Preview · 145 patches' },
              { value: 577, label: 'Standard · 577 patches' },
              { value: 2305, label: 'High · 2,305 patches' },
            ])}
            {field('analysis', 'interval', 'Direct integration interval', null, [
              { value: 5, label: '5 minutes' },
              { value: 10, label: '10 minutes' },
              { value: 15, label: '15 minutes' },
            ])}
            {field('analysis', 'backend', 'Compute engine', null, [
              { value: 'auto', label: 'Automatic · prefer WebGPU' },
              { value: 'cpu', label: 'CPU reference' },
              { value: 'gpu', label: 'WebGPU with CPU fallback' },
            ])}
            <details>
              <summary>PAR conversion assumptions</summary>
              <div className="field-pair">
                {field('analysis', 'parFraction', 'PAR energy fraction', null, null, {
                  min: 0.3,
                  max: 0.6,
                  step: 0.01,
                })}
                {field('analysis', 'photonFactor', 'Photon conversion', 'µmol/J', null, {
                  min: 3,
                  max: 6,
                  step: 0.01,
                })}
              </div>
              <small>
                Spitters daily diffuse partition. Supplied PPFD overrides broadband conversion.
              </small>
            </details>
            <button className="primary wide" onClick={busy ? cancel : run}>
              {busy ? <Square size={16} /> : <Play size={16} />}{' '}
              {busy
                ? 'Cancel calculation'
                : canResume
                  ? 'Resume period calculation'
                  : isPeriod(s)
                    ? 'Calculate period light'
                    : 'Calculate daily light'}
            </button>
            {busy && (
              <>
                <progress value={progress?.progress || 0} max="1" />
                <small role="status">
                  {progress?.message || 'Preparing geometry…'} · {elapsed || 0} s elapsed
                </small>
                <small>Progress counts sky and sun directions; cached poses finish faster.</small>
              </>
            )}
            <button className="secondary wide" disabled={busy} onClick={preview}>
              Apply coarse preview settings
            </button>
            <small>
              Changes to 145 patches, 3 m cells and 15-minute steps. Check sensor/plot cells after
              changing resolution.
            </small>
            <div className="info-box">
              Numerical receivers sample the horizontal light field. Place physical instruments in
              the next step.
            </div>
          </>
        )}
        {step === 7 && (
          <>
            <h3>Field sensors</h3>
            <p className="control-note">
              Place instruments in receiver cells, then edit their installation details. Dots share
              a cell without changing the recorded centre coordinates.
            </p>
            <button
              className={'secondary wide ' + (placing && fieldTool === 'sensor' ? 'selected' : '')}
              onClick={() => setPlacing(!(placing && fieldTool === 'sensor'), 'sensor')}
            >
              <MapPin size={16} />
              {placing && fieldTool === 'sensor'
                ? 'Click the ground to place a sensor'
                : 'Place a sensor in the view'}
            </button>
            <button className="secondary wide" onClick={addSensor}>
              <Plus size={16} /> Add at array centre
            </button>
            <button className="text-button" disabled={!result} onClick={addPercentiles}>
              <Sparkles size={15} /> Sample five DLI percentiles
            </button>
            {!result && (
              <div className="info-box">Calculate irradiance to guide placement by DLI.</div>
            )}
            {s.experimentSensors.map((v, i) => (
              <details className="item-card" key={v.id} open={i === s.experimentSensors.length - 1}>
                <summary>
                  {v.id} · {v.type}
                </summary>
                <Field
                  annotation={`experimentSensors.${i}.type`}
                  label="Instrument type"
                  value={v.type}
                  options={sensorTypes}
                  onChange={(value) => set('experimentSensors', i, { ...v, type: value })}
                />
                <div className="field-pair">
                  {['column', 'row'].map((k) => (
                    <Field
                      key={k}
                      annotation={`experimentSensors.${i}.grid.${k}`}
                      label={`Receiver ${k}`}
                      value={(v.grid?.[k] ?? 0) + 1}
                      min={1}
                      max={k === 'column' ? receiver.nx : receiver.ny}
                      step={1}
                      integer
                      help="Select a receiver-grid cell, counted from the negative along-row / across-row edge. The instrument snaps to its centre."
                      onChange={(value) =>
                        set('experimentSensors', i, { ...v, grid: { ...v.grid, [k]: value - 1 } })
                      }
                    />
                  ))}
                </div>
                <small>
                  East {v.x.toFixed(3)} m · North {v.y.toFixed(3)} m · cell centre
                </small>
                <Field
                  annotation={`experimentSensors.${i}.z`}
                  label="Height / depth"
                  unit="m"
                  value={v.z}
                  min={-5}
                  max={20}
                  onChange={(value) => set('experimentSensors', i, { ...v, z: value })}
                />
                {['treatment', 'replicate', 'model', 'logger', 'channel', 'notes'].map((k) => (
                  <Field
                    key={k}
                    annotation={`experimentSensors.${i}.${k}`}
                    label={k[0].toUpperCase() + k.slice(1)}
                    type="text"
                    value={v[k]}
                    onChange={(value) => set('experimentSensors', i, { ...v, [k]: value })}
                  />
                ))}
                <div className="field-pair">
                  {['azimuth', 'tilt'].map((k) => (
                    <Field
                      key={k}
                      annotation={`experimentSensors.${i}.${k}`}
                      label={k === 'azimuth' ? 'Orientation azimuth' : 'Sensor tilt'}
                      unit="°"
                      min={0}
                      max={k === 'azimuth' ? 360 : 180}
                      value={v[k] ?? 0}
                      onChange={(value) => set('experimentSensors', i, { ...v, [k]: value })}
                    />
                  ))}
                </div>
                <small>
                  Negative Z places the instrument below ground. Orientation is installation
                  metadata; map values are horizontal receiver estimates.
                </small>
                <button className="text-button danger" onClick={() => removeSensor(i)}>
                  <Trash2 size={14} /> Remove instrument
                </button>
              </details>
            ))}
          </>
        )}
        {step === 7 && (
          <>
            <h3>Crop beds</h3>
            <button
              className={'secondary wide ' + (placing && fieldTool === 'crop' ? 'selected' : '')}
              onClick={() => setPlacing(!(placing && fieldTool === 'crop'), 'crop')}
            >
              <MapPin size={16} />
              {placing && fieldTool === 'crop'
                ? 'Click a receiver cell for the crop plot'
                : 'Place a crop plot in the view'}
            </button>
            <p className="control-note">
              Crop plots occupy whole receiver cells and rotate with the array. Choose a starting
              cell and the number of cells along and across the rows.
            </p>
            <button className="secondary wide" onClick={addPlot}>
              <Plus size={16} /> Add crop plot
            </button>
            {landUseSummary(s).conflicts.length > 0 && (
              <div className="info-box zone-warning" role="status">
                Some plots intersect non-cultivated or perimeter zones. Their locations are
                retained; review the marked areas below.
              </div>
            )}
            {s.crops.map((v, i) => {
              const stats = plotStats(result, v);
              const overlap = plotZoneOverlap(s, v);
              return (
                <details className="item-card" key={v.id} open={i === s.crops.length - 1}>
                  <summary>
                    {v.id} · {v.crop}
                  </summary>
                  <CropPicker
                    value={v.cropId}
                    legacy={v.crop}
                    onChange={(id) => set('crops', i, { ...v, ...cropIdentity(id) })}
                  />
                  {['cultivar', 'treatment', 'replicate', 'notes'].map((k) => (
                    <Field
                      key={k}
                      annotation={`crops.${i}.${k}`}
                      label={k[0].toUpperCase() + k.slice(1)}
                      value={v[k] || ''}
                      type="text"
                      onChange={(value) => set('crops', i, { ...v, [k]: value })}
                    />
                  ))}
                  <div className="field-pair">
                    {['column', 'row', 'columns', 'rows'].map((k) => (
                      <Field
                        key={k}
                        annotation={`crops.${i}.grid.${k}`}
                        label={
                          {
                            column: 'Starting column',
                            row: 'Starting row',
                            columns: 'Columns wide',
                            rows: 'Rows long',
                          }[k]
                        }
                        value={
                          (v.grid?.[k] ?? (k.endsWith('s') ? 1 : 0)) + (k.endsWith('s') ? 0 : 1)
                        }
                        min={1}
                        max={k.startsWith('column') ? receiver.nx : receiver.ny}
                        step={1}
                        integer
                        help="Crop boundaries follow whole receiver cells. Columns run along the PV rows; receiver rows run across them. Plots stay inside the grid."
                        onChange={(value) =>
                          set('crops', i, {
                            ...v,
                            grid: { ...v.grid, [k]: value - (k.endsWith('s') ? 0 : 1) },
                          })
                        }
                      />
                    ))}
                  </div>
                  <small>
                    {v.width.toFixed(3)} m along × {v.length.toFixed(3)} m across · centre E{' '}
                    {v.x.toFixed(3)}, N {v.y.toFixed(3)} m
                  </small>
                  {overlap > 1e-6 && (
                    <p className="zone-warning">
                      {overlap.toFixed(2)} m² intersects reserved zones (overlaps counted once).
                    </p>
                  )}
                  <div className="info-box">
                    {stats
                      ? `${dliLabel(result)} ${stats.mean.toFixed(1)} ± ${stats.sd.toFixed(1)} · median ${stats.median.toFixed(1)} · range ${stats.min.toFixed(1)}–${stats.max.toFixed(1)} · sunlight ${stats.sunlight.toFixed(1)}% · ${stats.count} receivers`
                      : 'No receiver samples in this plot.'}
                  </div>
                  <button className="text-button danger" onClick={() => removePlot(i)}>
                    <Trash2 size={14} /> Remove plot
                  </button>
                </details>
              );
            })}
          </>
        )}
        {step === 8 && (
          <>
            {field('metadata', 'title', 'Study title', null, null, { type: 'text' })}
            {field('metadata', 'investigator', 'Investigator / group', null, null, {
              type: 'text',
            })}
            <div className="info-box">
              The methods package includes system parameters, model assumptions, physical sensor and
              crop tables, and five canonical figures when light results are available.
            </div>
            <small>
              Inspect the exported report before using it in a publication. CPU occlusion has been
              checked against Radiance; broader model validation is still pending.
            </small>
          </>
        )}
      </div>
    </InspectionContext.Provider>
  );
}
