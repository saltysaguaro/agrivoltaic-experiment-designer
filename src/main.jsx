import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Grid2X2,
  Sun,
  Leaf,
  MapPin,
  Layers,
  PanelTop,
  Box,
  FileText,
  Compass,
  Maximize,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  defaultStudy,
  migrateStudy,
  studySchema,
  dimensions,
  designIssues,
  analysisKey,
  sha256,
  updateStudyInput,
  validationMessage,
} from './domain/study.js';
import { parseWeather, weatherTemplate } from './irradiance/weather.js';
import { downloadWeather, weatherRequestKey } from './irradiance/weather-service.js';
import { percentileSensors } from './experiment/layout.js';
import { download, reportHtml, exportCsv, methodsRows, csv, pngFigure } from './report/export.js';
import { figureSvg } from './report/figures.js';
import Controls from './ui/Controls.jsx';
import Scene from './ui/Scene.jsx';
import './styles.css';
const steps = [
  ['Module', 'Define the building block', 'module'],
  ['Racking', 'Choose a support system', 'racking'],
  ['PV table & row', 'Build your repeated assembly', 'row'],
  ['Row spacing', 'Make room for the experiment', 'pair'],
  ['Full array', 'Set the field boundaries', 'array'],
  ['Site & weather', 'Define the light environment', 'environment'],
  ['Irradiance', 'Understand the daily light field', 'irradiance'],
  ['Field sensors', 'Instrument the experiment', 'sensors'],
  ['Crop plots', 'Design your growing treatments', 'crops'],
  ['Methods & export', 'From field design to publication', 'report'],
];
const defaults = [
  'oblique',
  'oblique',
  'oblique',
  'profile',
  'plan',
  'plan',
  'oblique',
  'oblique',
  'oblique',
  'oblique',
];
function navigation() {
  try {
    const v = JSON.parse(sessionStorage.getItem('aed-navigation'));
    return v &&
      Number.isInteger(v.step) &&
      v.step >= 0 &&
      v.step < 10 &&
      ['oblique', 'plan', 'profile'].includes(v.view)
      ? v
      : { step: 0, view: 'oblique' };
  } catch {
    return { step: 0, view: 'oblique' };
  }
}
function load() {
  try {
    const v = localStorage.getItem('aed-study-v1') || localStorage.getItem('fieldwork-study-v1');
    return v ? migrateStudy(JSON.parse(v)) : defaultStudy();
  } catch {
    return defaultStudy();
  }
}
function App() {
  const [s, setStudy] = useState(load),
    [step, setStep] = useState(() => navigation().step),
    [view, setView] = useState(() => navigation().view),
    [grid, setGrid] = useState(true),
    [metric, setMetric] = useState('none'),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(null),
    [notice, setNotice] = useState(''),
    [placing, setPlacing] = useState(false),
    [resetKey, setResetKey] = useState(0),
    [weatherStatus, setWeatherStatus] = useState({ state: 'idle', message: '' }),
    [saveStatus, setSaveStatus] = useState('Saved on this device');
  const mainRef = useRef(null);
  const enteredAnalysis = useRef(navigation().step >= 6);
  const weatherFlight = useRef(null),
    runToken = useRef(0);
  const worker = useRef(null),
    importRef = useRef(),
    latest = useRef(s);
  latest.current = s;
  const d = dimensions(s),
    validResult = result?.key === analysisKey(s) ? result : null,
    issues = designIssues(s),
    scope = steps[step][2];
  useEffect(() => {
    try {
      localStorage.setItem('aed-study-v1', JSON.stringify(s));
      setSaveStatus('Saved on this device');
    } catch {
      setSaveStatus('Device storage unavailable · export JSON to save');
    }
  }, [s]);
  useEffect(() => {
    try {
      sessionStorage.setItem('aed-navigation', JSON.stringify({ step, view }));
    } catch {}
  }, [step, view]);
  const requestKey = weatherRequestKey(s);
  useEffect(() => {
    if (
      step >= 5 &&
      s.weather.mode === 'automatic' &&
      (!s.weather.rows.length || s.weather.requestKey !== requestKey)
    ) {
      const timer = setTimeout(() => {
        ensureWeather().catch(() => {});
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [step >= 5, requestKey, s.weather.mode]);
  useEffect(() => {
    // Load worker-only dependencies before a user starts their first calculation.
    let warmup;
    try {
      warmup = new Worker(new URL('./irradiance/worker.js', import.meta.url), { type: 'module' });
      warmup.onmessage = () => warmup.terminate();
      warmup.onerror = () => warmup.terminate();
      warmup.postMessage({ type: 'warmup' });
    } catch {}
    return () => {
      warmup?.terminate();
      worker.current?.terminate();
      weatherFlight.current?.controller.abort();
    };
  }, []);
  async function ensureWeather(snapshot = latest.current, force = false) {
    if (snapshot.weather.mode !== 'automatic') {
      if (snapshot.weather.mode === 'upload' && !snapshot.weather.rows.length)
        throw Error('Upload a complete weather file, or choose automatic weather.');
      return snapshot.weather;
    }
    const key = weatherRequestKey(snapshot);
    if (!force && snapshot.weather.rows.length && snapshot.weather.requestKey === key)
      return snapshot.weather;
    if (!force && weatherFlight.current?.key === key) return weatherFlight.current.promise;
    weatherFlight.current?.controller.abort();
    const controller = new AbortController();
    setWeatherStatus({ state: 'loading', message: 'Downloading weather for your site…' });
    const timeout = setTimeout(() => controller.abort(), 30000);
    const flight = { key, controller };
    flight.promise = downloadWeather(snapshot, { signal: controller.signal })
      .then((weather) => {
        if (
          weatherRequestKey(latest.current) === key &&
          latest.current.weather.mode === 'automatic'
        ) {
          setStudy((current) => ({ ...current, weather }));
          setWeatherStatus({
            state: 'ready',
            message: 'Site weather downloaded and saved with this study.',
          });
        }
        return weather;
      })
      .catch((error) => {
        if (weatherFlight.current === flight) {
          const message =
            error.name === 'AbortError'
              ? 'Weather request timed out or was cancelled. Retry the download.'
              : error.message;
          setWeatherStatus({ state: 'error', message });
        }
        throw error;
      })
      .finally(() => {
        clearTimeout(timeout);
        if (weatherFlight.current === flight) weatherFlight.current = null;
      });
    weatherFlight.current = flight;
    return flight.promise;
  }
  function set(section, key, value) {
    setStudy((current) => {
      const next = updateStudyInput(current, section, key, value);
      if (section === 'weather' && key === 'mode') {
        weatherFlight.current?.controller.abort();
        setWeatherStatus({ state: 'idle', message: '' });
        next.weather = {
          mode: value,
          requestKey: '',
          name:
            value === 'automatic'
              ? 'Open-Meteo · ready to download for your site'
              : value === 'sample'
                ? 'Illustrative clear-sky day · synthetic'
                : 'Upload a weather file',
          hash: '',
          format: value === 'sample' ? 'sample' : value === 'automatic' ? 'Open-Meteo' : 'CSV',
          rows: [],
        };
      }
      const parsed = studySchema.safeParse(next);
      if (!parsed.success) {
        setNotice(parsed.error.issues.map(validationMessage).join(' '));
        return current;
      }
      setNotice('');
      if (
        (section === 'site' || (section === 'analysis' && key === 'date')) &&
        next.weather.mode === 'automatic'
      ) {
        next.weather = {
          ...next.weather,
          rows: [],
          hash: '',
          requestKey: '',
          provenance: undefined,
          name: 'Open-Meteo · ready to download for your site',
        };
      } else if (section === 'analysis' && key === 'date' && next.weather.mode === 'upload') {
        next.weather = {
          ...next.weather,
          rows: [],
          hash: '',
          name: 'Upload weather for the new date',
        };
      }
      return parsed.success ? next : current;
    });
  }
  function go(n) {
    mainRef.current?.scrollTo({ top: 0 });
    setStep(n);
    if (n === 6 && !enteredAnalysis.current) {
      setView('oblique');
      enteredAnalysis.current = true;
    } else if (step < 4 || n < 4) setView(defaults[n]);
    setPlacing(false);
    if (!(step >= 6 && n >= 6)) setMetric(n >= 6 && validResult ? 'sunlight' : 'none');
  }
  function cancel() {
    runToken.current++;
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
    setProgress(null);
    setNotice('Calculation cancelled.');
  }
  async function run() {
    if (issues.length) {
      setNotice(issues.join(' '));
      return;
    }
    const token = ++runToken.current,
      snapshot = structuredClone(s);
    worker.current?.terminate();
    setBusy(true);
    setNotice('');
    setProgress({
      progress: 0,
      message:
        snapshot.weather.mode === 'automatic' ? 'Preparing site weather…' : 'Preparing geometry…',
    });
    try {
      snapshot.weather = await ensureWeather(snapshot);
      if (token !== runToken.current) return;
      setProgress({ progress: 0, message: 'Preparing geometry…' });
      const w = new Worker(new URL('./irradiance/worker.js', import.meta.url), { type: 'module' });
      worker.current = w;
      w.onmessage = ({ data }) => {
        if (token !== runToken.current) return;
        if (data.type === 'progress') setProgress(data);
        if (data.type === 'error') {
          setNotice(data.message);
          setBusy(false);
          w.terminate();
        }
        if (data.type === 'result') {
          setResult(data.result);
          setBusy(false);
          setMetric('sunlight');
          setNotice(
            data.result.key === analysisKey(latest.current)
              ? `Daily light calculated with ${data.result.backend} in ${data.result.seconds.toFixed(1)} s.`
              : 'Calculation finished for an older design. Recalculate for the current inputs.',
          );
          w.terminate();
        }
      };
      w.onerror = (e) => {
        if (token !== runToken.current) return;
        setNotice(e.message || 'Calculation failed. Try the CPU reference engine.');
        setBusy(false);
        w.terminate();
      };
      w.postMessage({ study: snapshot });
    } catch (error) {
      if (token === runToken.current) {
        setNotice(
          error.name === 'AbortError'
            ? 'Weather download was interrupted. Retry the calculation.'
            : error.message,
        );
        setBusy(false);
      }
    }
  }
  async function uploadWeather(file) {
    try {
      const parsed = await parseWeather(await file.text(), file.name, s.analysis.date);
      const next = studySchema.parse({
        ...s,
        weather: { ...parsed.weather, mode: 'upload' },
        site: parsed.site ? { ...s.site, ...parsed.site } : s.site,
      });
      weatherFlight.current?.controller.abort();
      setWeatherStatus({ state: 'idle', message: '' });
      setStudy(next);
      setNotice(
        `Loaded ${parsed.weather.rows.length} weather intervals. ${parsed.site ? 'Site metadata imported.' : ''}`,
      );
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function importStudy(file) {
    try {
      const data = JSON.parse(await file.text()),
        next = migrateStudy(data.study || data);
      setStudy(next);
      setResult(null);
      setNotice('Study imported. Recalculate light to verify results.');
    } catch (e) {
      setNotice('Could not import study: ' + e.message);
    }
  }
  function newId(prefix, items) {
    let i = 1;
    while (items.some((v) => v.id === `${prefix}-${String(i).padStart(2, '0')}`)) i++;
    return `${prefix}-${String(i).padStart(2, '0')}`;
  }
  function addSensor(point = { x: 0, y: 0 }) {
    setStudy((current) => ({
      ...current,
      experimentSensors: [
        ...current.experimentSensors,
        {
          id: newId('S', current.experimentSensors),
          type: 'PAR',
          x: +point.x.toFixed(2),
          y: +point.y.toFixed(2),
          z: current.analysis.receiverHeight,
          treatment: 'Interior',
          replicate: '1',
          model: '',
          logger: '',
          channel: '',
          azimuth: 0,
          tilt: 0,
          notes: '',
        },
      ],
    }));
    setPlacing(false);
  }
  function addPlot() {
    setStudy((current) => ({
      ...current,
      crops: [
        ...current.crops,
        {
          id: newId('P', current.crops),
          crop: 'Lettuce',
          treatment: 'Interrow',
          replicate: '1',
          x: 0,
          y: 0,
          width: 2,
          length: 4,
        },
      ],
    }));
  }
  async function saveStudy() {
    download(
      JSON.stringify(
        { study: s, studySha256: await sha256(JSON.stringify(s)), result: validResult },
        null,
        2,
      ),
      'agrivoltaic-study.json',
      'application/json',
    );
  }
  async function exportFigure(format) {
    try {
      const svg = figureSvg(s, validResult, view, metric, step < 5 ? scope : 'array', grid);
      download(
        format === 'png' ? await pngFigure(svg) : svg,
        `agrivoltaic-${view}-${metric}.${format}`,
        format === 'svg' ? 'image/svg+xml' : 'image/png',
      );
    } catch (e) {
      setNotice('Figure export failed: ' + e.message);
    }
  }
  function report() {
    const html = reportHtml(s, validResult);
    download(html, 'agrivoltaic-methods.html', 'text/html');
    setNotice('Methods report downloaded. Open it to print or save as PDF.');
  }
  const mean = validResult?.meanDli;
  return (
    <div className="app">
      <header className="app-header">
        <a className="brand" href="./" aria-label="Agrivoltaic Experiment Designer home">
          <span className="brand-mark">
            <PanelTop size={21} />
            <Leaf size={13} />
          </span>
          <span>Agrivoltaic Experiment Designer</span>
        </a>
        <div className="header-actions">
          <span className="local-status">
            <i />
            {saveStatus}
          </span>
          <button
            className="icon-button"
            title="Import study JSON"
            onClick={() => importRef.current.click()}
          >
            <Upload size={17} />
            <span>Open</span>
          </button>
          <button className="secondary compact" onClick={saveStudy}>
            <Download size={16} /> Save study
          </button>
          <input
            ref={importRef}
            hidden
            type="file"
            accept=".json"
            onChange={(e) => {
              if (e.target.files[0]) importStudy(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span className="eyebrow">YOUR EXPERIMENT</span>
            <div className="study-name">{s.metadata.title}</div>
            <div className="progress-track">
              <span style={{ width: `${(step + 1) * 10}%` }} />
            </div>
            <span className="muted step-count">Step {String(step + 1).padStart(2, '0')} of 10</span>
          </div>
          <nav aria-label="Design steps">
            {steps.map(([name, subtitle], i) => (
              <section key={name} className={'step-section ' + (i === step ? 'active' : '')}>
                <button className="step-toggle" aria-expanded={i === step} onClick={() => go(i)}>
                  <span className={'step-number ' + (i < step ? 'visited' : '')}>
                    {i < step ? <Check size={13} /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{name}</span>
                  {i === step ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {i === step && (
                  <Controls
                    step={step}
                    s={s}
                    set={set}
                    result={validResult}
                    busy={busy}
                    progress={progress}
                    run={run}
                    cancel={cancel}
                    uploadWeather={uploadWeather}
                    weatherStatus={weatherStatus}
                    refreshWeather={() => ensureWeather(latest.current, true).catch(() => {})}
                    template={() => download(weatherTemplate, 'weather-template.csv', 'text/csv')}
                    placing={placing}
                    setPlacing={(v) => {
                      setPlacing(v);
                    }}
                    addSensor={() => addSensor()}
                    addPercentiles={() =>
                      setStudy({
                        ...s,
                        experimentSensors: [
                          ...s.experimentSensors,
                          ...percentileSensors(s, validResult),
                        ],
                      })
                    }
                    addPlot={addPlot}
                    removeSensor={(i) =>
                      setStudy({
                        ...s,
                        experimentSensors: s.experimentSensors.filter((_, j) => i !== j),
                      })
                    }
                    removePlot={(i) => setStudy({ ...s, crops: s.crops.filter((_, j) => i !== j) })}
                  />
                )}
              </section>
            ))}
          </nav>
          <div className="sidebar-foot">
            <Leaf size={15} />
            <span>Designed for reproducible field research</span>
          </div>
        </aside>
        <main ref={mainRef}>
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">
                DESIGN WORKSPACE <span>/</span> {String(step + 1).padStart(2, '0')}
              </div>
              <h1>
                {steps[step][1]}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {
                  [
                    'A precise starting point for your agrivoltaic system.',
                    'Set the geometry that shapes the light below.',
                    'Arrange modules into a repeatable structural unit.',
                    'Balance solar geometry, crop access, and working space.',
                    'Bring the individual rows together into a finite system.',
                    'Connect your field location to a reproducible weather source.',
                    'Compare daily ground light with an unobstructed horizontal reference.',
                    'Turn your light field into an instrumented experiment.',
                    'Connect each treatment to its local growing environment.',
                    'Export clear figures and traceable parameters for your methods section.',
                  ][step]
                }
              </p>
            </div>
            <div className="units-chip">
              SI <span>metres · watts</span>
            </div>
          </div>
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Dismiss notification">
                ×
              </button>
            </div>
          )}
          {issues.length > 0 && (
            <div className="warning" role="alert">
              <AlertTriangle size={17} />
              <span>{issues.join(' ')}</span>
            </div>
          )}
          {result && !validResult && (
            <div className="warning">
              <Sun size={17} />
              <span>
                The design or weather changed. Recalculate irradiance before using light metrics.
              </span>
              <button onClick={() => go(6)}>Go to analysis</button>
            </div>
          )}
          <section className="visual-card">
            <div className="visual-toolbar">
              <div className="view-tabs" role="group" aria-label="Projection">
                {[
                  ['oblique', 'Orthographic', Box],
                  ['plan', 'Top-down', Grid2X2],
                  ['profile', 'Profile', PanelTop],
                ].map(([v, label, Icon]) => (
                  <button
                    key={v}
                    className={view === v ? 'selected' : ''}
                    onClick={() => {
                      setView(v);
                      if (v !== 'plan') setPlacing(false);
                    }}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="visual-actions">
                <button
                  title="Toggle ground grid"
                  aria-label="Toggle ground grid"
                  aria-pressed={grid}
                  onClick={() => setGrid(!grid)}
                >
                  <Grid2X2 size={17} />
                </button>
                <button
                  title="Fit view"
                  aria-label="Fit view"
                  onClick={() => setResetKey(resetKey + 1)}
                >
                  <Maximize size={17} />
                </button>
                <span />
                <button
                  title="Download current SVG figure"
                  aria-label="Download SVG figure"
                  onClick={() => exportFigure('svg')}
                >
                  <Download size={17} />
                </button>
              </div>
            </div>
            <div className="scene-wrap">
              <Scene
                study={s}
                scope={scope}
                view={view}
                result={validResult}
                metric={metric}
                showGrid={grid}
                onPlace={addSensor}
                placing={placing}
                resetKey={resetKey}
              />
              <div className="scene-label">
                <i />
                {step < 5 ? steps[step][0].toUpperCase() : 'FINITE ARRAY'} <span>·</span>{' '}
                {view === 'oblique'
                  ? 'ORTHOGRAPHIC'
                  : view === 'plan'
                    ? 'PLAN VIEW'
                    : 'CROSS-SECTION'}
              </div>
              <div className="north-compass">
                <Compass size={25} />
                <span>{view === 'plan' ? 'NORTH ↑' : 'Z ↑'}</span>
              </div>
              {step === 0 && (
                <div className="dimension-label">
                  {s.module.length.toFixed(3)} × {s.module.width.toFixed(3)} m{' '}
                  <span>· {s.module.thickness * 1000} mm frame</span>
                </div>
              )}
              {step === 3 && (
                <div className="dimension-label">
                  ← {s.rowPair.pitch.toFixed(2)} m row pitch →{' '}
                  <span>· {d.usable.toFixed(2)} m usable strip</span>
                </div>
              )}
              {placing && (
                <div className="placing-banner">
                  <MapPin size={15} />{' '}
                  {view === 'profile'
                    ? 'Choose Orthographic or Top-down to place a sensor'
                    : 'Click the ground to place a field instrument'}
                </div>
              )}
              <div className="scene-hint">
                {view === 'oblique'
                  ? 'Drag to pan · right-drag to orbit · scroll to zoom'
                  : 'Drag to pan · scroll to zoom'}
              </div>
              {busy && (
                <div className="solving-pill">
                  <Loader2 size={16} className="spin" />
                  {Math.round((progress?.progress || 0) * 100)}% · Calculating daily light
                </div>
              )}
            </div>
            <div className="visual-footer">
              <span>
                <span className="legend-square" /> PV module
              </span>
              {step > 0 && (
                <span>
                  <span className="legend-square steel" /> Structural support
                </span>
              )}
              {step >= 7 && (
                <span>
                  <span className="legend-dot" /> Field sensor
                </span>
              )}
              <span className="scale-note">
                {step === 0
                  ? 'Module dimensions in metres'
                  : 'Origin at array centre · east / north / up'}
              </span>
            </div>
          </section>
          {step >= 6 && (
            <div className="light-control">
              <div className="metric-tabs">
                {[
                  ['none', 'Geometry'],
                  ['sunlight', 'Relative sunlight'],
                  ['dli', validResult?.estimated === false ? 'DLI' : 'Estimated DLI'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={metric === v ? 'selected' : ''}
                    disabled={v !== 'none' && !validResult}
                    onClick={() => {
                      setMetric(v);
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {validResult && metric !== 'none' && (
                <div className="heat-legend">
                  <span>0</span>
                  <i />
                  <span>
                    {metric === 'sunlight'
                      ? '100%'
                      : validResult.openDli.toFixed(1) + ' mol m⁻² d⁻¹'}
                  </span>
                </div>
              )}
              {!validResult && (
                <button className="text-button" onClick={() => go(6)}>
                  Calculate light to show maps <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
          <div className="stats-grid">
            {(step === 0
              ? [
                  [PanelTop, 'Module area', (s.module.length * s.module.width).toFixed(2), 'm²'],
                  [Sun, 'Rated power', s.module.power, 'W'],
                  [Layers, 'Module gap', (s.module.gap * 1000).toFixed(0), 'mm'],
                ]
              : step === 3
                ? [
                    [Layers, 'Row pitch', s.rowPair.pitch.toFixed(2), 'm'],
                    [Maximize, 'Clear spacing', d.clear.toFixed(2), 'm'],
                    [Leaf, 'Usable crop strip', d.usable.toFixed(2), 'm'],
                  ]
                : step >= 6 && validResult
                  ? [
                      [
                        Sun,
                        'Receiver-area mean relative sunlight',
                        validResult.meanSunlight.toFixed(1),
                        '%',
                      ],
                      [
                        Leaf,
                        validResult.estimated ? 'Mean estimated DLI' : 'Mean DLI',
                        mean.toFixed(1),
                        'mol m⁻² d⁻¹',
                      ],
                      [
                        Grid2X2,
                        'Analysis receivers',
                        validResult.cells.length.toLocaleString(),
                        'points',
                      ],
                    ]
                  : [
                      [
                        Layers,
                        step < 4 ? 'Modules in row' : 'Modules in array',
                        step < 4 ? s.table.high * s.table.wide * s.row.tables : d.modules,
                        'modules',
                      ],
                      [
                        Sun,
                        'Array DC capacity',
                        ((d.modules * s.module.power) / 1000).toFixed(1),
                        'kWp',
                      ],
                      [Maximize, 'Row length', d.length.toFixed(2), 'm'],
                    ]
            ).map(([Icon, label, value, unit]) => (
              <div className="stat" key={label}>
                <span className="stat-icon">
                  <Icon size={19} />
                </span>
                <div>
                  <span className="stat-label">{label}</span>
                  <div className="stat-value">
                    {value}
                    <small>{unit}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {step === 9 ? (
            <section className="export-panel">
              <div>
                <FileText size={21} />
                <h2>Publication package</h2>
                <p>Vector figures, field coordinates, and documented methods.</p>
              </div>
              <div className="export-buttons">
                <button className="primary" onClick={report}>
                  <FileText size={16} /> Printable methods report
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    download(exportCsv(s, validResult), 'agrivoltaic-data.csv', 'text/csv')
                  }
                >
                  Data CSV
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    download(
                      csv([['Parameter', 'Value'], ...methodsRows(s, validResult)]),
                      'agrivoltaic-methods.csv',
                      'text/csv',
                    )
                  }
                >
                  Methods CSV
                </button>
                <button className="secondary" onClick={() => exportFigure('svg')}>
                  Figure SVG
                </button>
                <button className="secondary" onClick={() => exportFigure('png')}>
                  Figure PNG
                </button>
              </div>
            </section>
          ) : (
            <div className="design-note">
              <span className="note-icon">i</span>
              <div>
                <strong>
                  {step === 0
                    ? 'Small details. Reproducible systems.'
                    : step >= 6
                      ? 'Light metrics with a clear reference.'
                      : 'One study. Consistent geometry.'}
                </strong>
                <p>
                  {step === 0
                    ? 'Module dimensions and gaps carry through to every row, shadow calculation, and exported figure.'
                    : step >= 6
                      ? 'Relative sunlight is daily irradiation received as a percentage of incoming GHI (100% = open-field sunlight). DLI uses the same visibility, with documented PAR assumptions.'
                      : 'The same dimensions drive the interactive view, finite simulation geometry, and publication drawings.'}
                </p>
              </div>
              {step === 0 && <span className="tag">01 / MODULE</span>}
            </div>
          )}
          {step >= 6 && validResult && (
            <div className="model-disclosure">
              <strong>{validResult.backend}</strong>
              <span>
                {' '}
                · {s.analysis.patches} sky patches · {s.analysis.interval}-minute direct steps ·
                reflection excluded
              </span>
              {validResult.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
              <p>
                CPU occlusion matched Radiance on 45,990 rays. Independent sky, daily-energy, GPU
                and field validation remain pending.
              </p>
            </div>
          )}
          <footer className="step-footer">
            <span>
              {step < 9
                ? 'Your changes are saved as you design.'
                : 'Keep the JSON study with your research records.'}
            </span>
            <div>
              {step > 0 && (
                <button className="text-button" onClick={() => go(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < 9 && (
                <button className="primary" onClick={() => go(step + 1)}>
                  Continue to {steps[step + 1][0].toLowerCase()} <ArrowRight size={17} />
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
      <footer className="app-footer">
        <span>AGRIVOLTAIC EXPERIMENT DESIGNER</span>
        <span>Local computation · Version 0.1.0</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
