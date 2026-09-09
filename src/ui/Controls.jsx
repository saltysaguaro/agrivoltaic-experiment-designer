import React, { useId } from 'react';
import Info from './Info.jsx';
import LocationSearch from './LocationSearch.jsx';
import { receiverGridSpec } from '../domain/geometry.js';
import { inputHelp, labelHelp } from './help.js';
import { Upload, Plus, Trash2, MapPin, Sparkles, Download, Play, Square } from 'lucide-react';
import { dimensions, sensorTypes, rackingMinimums } from '../domain/study.js';
import { plotStats } from '../experiment/layout.js';
export function Field({
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
}) {
  const id = useId();
  return (
    <div className="field">
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
            type={type}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              if (type === 'number') {
                if (e.target.value !== '' && Number.isFinite(+e.target.value))
                  onChange(+e.target.value);
              } else onChange(e.target.value);
            }}
          />
          {unit && <span>{unit}</span>}
        </div>
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}
export default function Controls({
  step,
  s,
  set,
  result,
  busy,
  progress,
  run,
  cancel,
  uploadWeather,
  selectLocation,
  weatherStatus,
  refreshWeather,
  template,
  placing,
  setPlacing,
  addSensor,
  addPercentiles,
  addPlot,
  removeSensor,
  removePlot,
}) {
  const receiver = receiverGridSpec(s);
  const d = dimensions(s),
    minimum = rackingMinimums(s);
  const field = (section, key, label, unit, options, extra = {}) => (
    <Field
      key={section + key}
      help={inputHelp[`${section}.${key}`]}
      label={label}
      value={s[section][key]}
      onChange={(v) => set(section, key, v)}
      unit={unit}
      options={options}
      {...extra}
    />
  );
  return (
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
            {field('module', 'power', 'Rated DC power', 'W', null, { min: 1, max: 1500, step: 5 })}
          </div>
          {field('module', 'gap', 'Default module gap', 'm', null, {
            min: 0,
            max: 0.5,
            step: 0.005,
          })}
          <div className="info-box">
            Opaque module surfaces. Bifaciality affects module energy yield; the ground-light model
            uses physical occlusion.
          </div>
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
            Rack, module and table changes increase clearances when needed. Larger custom clearances
            are retained.
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
            <span>Clear edge-to-edge spacing</span>
            <strong>{d.clear.toFixed(2)} m</strong>
          </div>
          {field('rowPair', 'cropSetback', 'Crop setback from each edge', 'm', null, {
            min: 0,
            max: 5,
          })}
          {field('rowPair', 'maintenance', 'Maintenance strip', 'm', null, { min: 0, max: 5 })}
          <div className="info-box">
            {d.usable.toFixed(2)} m available between row setbacks and the maintenance strip, at the
            displayed pose.
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
          <LocationSearch address={s.site.address} onSelect={selectLocation} />
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
            {field('site', 'utcOffset', 'UTC offset', 'h', null, { min: -12, max: 14, step: 0.5 })}
            {field('site', 'elevation', 'Site elevation', 'm', null, {
              min: -500,
              max: 9000,
              step: 1,
            })}
          </div>
          {field('analysis', 'date', 'Analysis date', null, null, { type: 'date' })}
          {field('weather', 'mode', 'Weather source', null, [
            { value: 'automatic', label: 'Automatic · Open-Meteo' },
            { value: 'upload', label: 'Upload my weather' },
            { value: 'sample', label: 'Illustrative clear-sky day' },
          ])}
          {s.weather.mode === 'automatic' && (
            <div className="weather-download">
              <p>Weather downloads automatically for your coordinates and date.</p>
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                Weather by Open-Meteo · CC BY 4.0
              </a>
              {weatherStatus?.message && (
                <p role="status" className={weatherStatus.state === 'error' ? 'weather-error' : ''}>
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
              Upload a complete day of GHI, DNI and DHI from your own source. Accepts CSV, EPW or
              TMY3. Uploading switches off automatic downloads.
            </Info>
            <input
              type="file"
              accept=".csv,.epw"
              onChange={(e) => {
                if (e.target.files[0]) uploadWeather(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </label>
          <small className="muted">
            EPW, TMY3, or CSV. Local standard time; complete 24-hour coverage.
          </small>
          <button className="text-button" onClick={template}>
            <Download size={14} /> CSV template
          </button>
          <div className="info-box">{s.weather.name}</div>
        </>
      )}
      {step === 6 && (
        <>
          <div className="field-pair">
            {field('analysis', 'resolution', 'Receiver spacing', 'm', null, {
              min: 0.25,
              max: 5,
              step: 0.25,
            })}
            {field('analysis', 'receiverHeight', 'Receiver height', 'm', null, { min: 0, max: 5 })}
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
            {busy ? 'Cancel calculation' : 'Calculate daily light'}
          </button>
          {busy && (
            <>
              <progress value={progress?.progress || 0} max="1" />
              <small>{progress?.message || 'Preparing geometry…'}</small>
            </>
          )}
          <div className="info-box">
            Numerical receivers sample the horizontal light field. Place physical instruments in the
            next step.
          </div>
        </>
      )}
      {step === 7 && (
        <>
          <p className="control-note">
            Place instruments in receiver cells, then edit their installation details. Dots share a
            cell without changing the recorded centre coordinates.
          </p>
          <button
            className={'secondary wide ' + (placing ? 'selected' : '')}
            onClick={() => setPlacing(!placing)}
          >
            <MapPin size={16} />
            {placing ? 'Click the ground to place a sensor' : 'Place a sensor in the view'}
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
                label="Instrument type"
                value={v.type}
                options={sensorTypes}
                onChange={(value) => set('experimentSensors', i, { ...v, type: value })}
              />
              <div className="field-pair">
                {['column', 'row'].map((k) => (
                  <Field
                    key={k}
                    label={`Receiver ${k}`}
                    value={(v.grid?.[k] ?? 0) + 1}
                    min={1}
                    max={k === 'column' ? receiver.nx : receiver.ny}
                    step={1}
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
                    label={k === 'azimuth' ? 'Orientation azimuth' : 'Sensor tilt'}
                    unit="°"
                    value={v[k] ?? 0}
                    onChange={(value) => set('experimentSensors', i, { ...v, [k]: value })}
                  />
                ))}
              </div>
              <small>
                Negative Z places the instrument below ground. Orientation is installation metadata;
                map values are horizontal receiver estimates.
              </small>
              <button className="text-button danger" onClick={() => removeSensor(i)}>
                <Trash2 size={14} /> Remove instrument
              </button>
            </details>
          ))}
        </>
      )}
      {step === 8 && (
        <>
          <button
            className={'secondary wide ' + (placing ? 'selected' : '')}
            onClick={() => setPlacing(!placing)}
          >
            <MapPin size={16} />
            {placing ? 'Click a receiver cell for the crop plot' : 'Place a crop plot in the view'}
          </button>
          <p className="control-note">
            Crop plots occupy whole receiver cells and rotate with the array. Choose a starting cell
            and the number of cells along and across the rows.
          </p>
          <button className="secondary wide" onClick={addPlot}>
            <Plus size={16} /> Add crop plot
          </button>
          {s.crops.map((v, i) => {
            const stats = plotStats(result, v);
            return (
              <details className="item-card" key={v.id} open={i === s.crops.length - 1}>
                <summary>
                  {v.id} · {v.crop}
                </summary>
                {['crop', 'treatment', 'replicate'].map((k) => (
                  <Field
                    key={k}
                    label={k[0].toUpperCase() + k.slice(1)}
                    value={v[k]}
                    type="text"
                    onChange={(value) => set('crops', i, { ...v, [k]: value })}
                  />
                ))}
                <div className="field-pair">
                  {['column', 'row', 'columns', 'rows'].map((k) => (
                    <Field
                      key={k}
                      label={
                        {
                          column: 'Starting column',
                          row: 'Starting row',
                          columns: 'Columns wide',
                          rows: 'Rows long',
                        }[k]
                      }
                      value={(v.grid?.[k] ?? (k.endsWith('s') ? 1 : 0)) + (k.endsWith('s') ? 0 : 1)}
                      min={1}
                      max={k.startsWith('column') ? receiver.nx : receiver.ny}
                      step={1}
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
                <div className="info-box">
                  {stats
                    ? `DLI ${stats.mean.toFixed(1)} ± ${stats.sd.toFixed(1)} · median ${stats.median.toFixed(1)} · range ${stats.min.toFixed(1)}–${stats.max.toFixed(1)} · sunlight ${stats.sunlight.toFixed(1)}% · ${stats.count} receivers`
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
      {step === 9 && (
        <>
          {field('metadata', 'title', 'Study title', null, null, { type: 'text' })}
          {field('metadata', 'investigator', 'Investigator / group', null, null, { type: 'text' })}
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
  );
}
