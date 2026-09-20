import { DEFAULT_CELLS_PER_ROW } from './domain/receiver-grid.js';
import DliZoneLegend from './ui/DliZoneLegend.jsx';
import {
  fieldStudy,
  storeField,
  initializeControl,
  controlResult,
  controlLayers,
  allFieldIds,
  uniqueFieldId,
} from './experiment/control-field.js';
import { isPeriod, periodLabel, periodKeys, hasWeather, dliLabel } from './domain/period.js';
import { projectJob } from './project/client.js';
import {
  persistedBrowserRecord,
  readWeatherSnapshot,
  pruneWeatherSnapshots,
} from './project/weather-storage.js';
import { browserStudyRecord, restoreBrowserStudy } from './project/browser-study.js';
import { MAX_ARCHIVE } from './project/zip.js';
import ProjectImportDialog from './ui/ProjectImportDialog.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  PanelLeftOpen,
  PanelLeftClose,
  Sprout,
} from 'lucide-react';
import {
  defaultStudy,
  VERSION,
  studySchema,
  dimensions,
  designIssues,
  analysisKey,
  updateStudyInput,
  validationMessage,
} from './domain/study.js';
import { MAX_WEATHER_BYTES, weatherTemplate, periodWeatherTemplate } from './irradiance/weather.js';
import {
  weatherImportJob,
  weatherImportContext,
  applyWeatherImport,
} from './irradiance/import-client.js';
import { downloadWeather, weatherRequestKey } from './irradiance/weather-service.js';
import { normalizeLayout, cellAt } from './experiment/grid-layout.js';
import { percentileSensors } from './experiment/layout.js';
import { download } from './report/download.js';
import { figureSvg } from './report/figures.js';
import Controls from './ui/Controls.jsx';
import Scene from './ui/Scene.jsx';
import FieldTools from './ui/FieldTools.jsx';
import CropBedsDialog from './ui/CropBedsDialog.jsx';
import SensorsDialog from './ui/SensorsDialog.jsx';
import { addSensors } from './experiment/sensor-grid.js';
import { addCropBeds } from './experiment/crop-beds.js';
import FieldEditor from './ui/FieldEditor.jsx';
import { cropIdentity, cropById, unresolvedCrops } from './domain/crop-catalog.js';
import {
  layoutSnapshot,
  replaceFieldItem,
  duplicateFieldGroup,
  moveFieldGroup,
} from './experiment/field-editing.js';
import DisplayLegend from './ui/DisplayLegend.jsx';
import { designLayers, irradianceLayers } from './ui/display-layers.js';
import { steps, defaults, normalizeNavigation } from './ui/workflow.js';
import { logCalculationDiagnostics } from './ui/calculation-diagnostics.js';
import './styles.css';
function navigation() {
  try {
    return normalizeNavigation(JSON.parse(sessionStorage.getItem('aed-navigation')));
  } catch {
    return normalizeNavigation(null);
  }
}
function load() {
  let original = null;
  try {
    original = localStorage.getItem('aed-study-v1') || localStorage.getItem('fieldwork-study-v1');
    return {
      study: original ? restoreBrowserStudy(JSON.parse(original)) : defaultStudy(),
      weatherRef: original ? JSON.parse(original).browserWeatherRef : null,
    };
  } catch (error) {
    return {
      study: defaultStudy(),
      original,
      error: original
        ? 'The saved study needs repair. Its original data is retained; use Recover saved JSON, then open a corrected study. Automatic saving is paused.'
        : 'Device storage could not be read. Export JSON to keep your work.',
    };
  }
}
function App() {
  const [initial] = useState(load);
  const [projectStatus, setProjectStatus] = useState(''),
    [pendingProject, setPendingProject] = useState(null);
  const projectTask = useRef(null);
  const weatherImportTask = useRef(null),
    projectImportToken = useRef(0);
  const [weatherPinned, setWeatherPinned] = useState(() => {
    try {
      return localStorage.getItem('aed-weather-pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [restoringWeather, setRestoringWeather] = useState(Boolean(initial.weatherRef));
  const [savedLayoutKey, setSavedLayoutKey] = useState(null);
  const [recovery, setRecovery] = useState(initial.original || null);
  const [s, setRawStudy] = useState(() => normalizeLayout(initial.study)),
    [step, setStep] = useState(() => navigation().step),
    [view, setView] = useState(() => navigation().view),
    [grid, setGrid] = useState(true),
    [layerPrefs, setLayerPrefs] = useState({
      design: { ...designLayers },
      analysis: { ...irradianceLayers },
    }),
    [opacityPrefs, setOpacityPrefs] = useState({ design: 1, analysis: 0.2 }),
    [inspection, setInspection] = useState(null),
    [metric, setMetric] = useState('none'),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(null),
    [notice, setNotice] = useState(initial.error || ''),
    [placing, setPlacing] = useState(false),
    [resetKey, setResetKey] = useState(0),
    [sidebarExpanded, setSidebarExpanded] = useState(false),
    [fieldTool, setFieldTool] = useState(null),
    [newCropId, setNewCropId] = useState('lettuce'),
    [cropBedsOpen, setCropBedsOpen] = useState(false),
    [sensorsOpen, setSensorsOpen] = useState(false),
    [newSensorType, setNewSensorType] = useState('PAR'),
    [selection, setSelection] = useState(null),
    [selections, setSelections] = useState([]),
    [editorOpen, setEditorOpen] = useState(false),
    [undoCount, setUndoCount] = useState(0),
    [weatherStatus, setWeatherStatus] = useState({ state: 'idle', message: '' }),
    [saveStatus, setSaveStatus] = useState('Layout is session-only · export to save');
  function setStudy(update) {
    setRawStudy((current) => {
      const candidate = normalizeLayout(typeof update === 'function' ? update(current) : update);
      const parsed = studySchema.safeParse(candidate);
      if (!parsed.success) {
        setNotice(parsed.error.issues.map(validationMessage).join(' '));
        return current;
      }
      return parsed.data;
    });
  }
  const activeStudy = fieldStudy(s, step === 8);
  const fieldLatest = useRef(activeStudy);
  fieldLatest.current = activeStudy;
  function setFieldStudy(update) {
    setStudy((current) => {
      const active = fieldStudy(current, step === 8);
      const edited = typeof update === 'function' ? update(active) : update;
      return storeField(current, edited, step === 8);
    });
  }
  function duplicateSelection(delta) {
    try {
      const copied = duplicateFieldGroup(
        fieldLatest.current,
        selections,
        delta,
        allFieldIds(latest.current),
      );
      rememberFieldLayout();
      setFieldStudy(copied.study);
      setSelections(copied.selections);
      setSelection(copied.selections[0] || null);
      setEditorOpen(false);
      setNotice(
        `Duplicated ${copied.selections.length} items with unique IDs; offset ${copied.offset.column} columns / ${copied.offset.row} rows. The shared offset is limited to compatible cells within the field so sizes and spacing are preserved.`,
      );
    } catch (error) {
      setNotice(error.message);
    }
  }
  function rememberFieldLayout() {
    fieldHistory.current = [
      ...fieldHistory.current.slice(-39),
      layoutSnapshot(fieldLatest.current),
    ];
    setUndoCount(fieldHistory.current.length);
  }
  function undoFieldEdit() {
    const previous = fieldHistory.current.pop();
    if (!previous) return;
    setFieldStudy((current) => ({ ...current, ...previous }));
    setUndoCount(fieldHistory.current.length);
    setSelection(null);
    setSelections([]);
    setEditorOpen(false);
    setNotice('Field edit undone.');
  }
  function selectFieldItem(target, open = true, additive = false) {
    if (additive && target) {
      const next = selections.some((v) => v.kind === target.kind && v.id === target.id)
        ? selections.filter((v) => v.kind !== target.kind || v.id !== target.id)
        : [...selections, target];
      setSelections(next);
      setSelection(next.at(-1) || null);
      setEditorOpen(false);
      return;
    }
    if (open || !target || !selections.some((v) => v.kind === target.kind && v.id === target.id))
      setSelections(target ? [target] : []);
    setSelection(target);
    setEditorOpen(Boolean(target && open));
    setInspection(null);
    if (target) {
      const layer = target.kind === 'sensor' ? 'sensors' : 'plots';
      setLayerPrefs((current) => ({
        ...current,
        [layerMode]: { ...current[layerMode], [layer]: true },
      }));
    }
  }
  function editFieldItem(target, item) {
    const key = target.kind === 'sensor' ? 'experimentSensors' : 'crops';
    const current = fieldLatest.current[key].find((v) => v.id === target.id);
    if (!current) return;
    if (JSON.stringify(current) === JSON.stringify(item)) {
      setEditorOpen(false);
      return;
    }
    const grouped =
      selections.length > 1 &&
      selections.some((v) => v.kind === target.kind && v.id === target.id) &&
      item.id === current.id &&
      item.grid &&
      current.grid &&
      item.grid.columns === current.grid.columns &&
      item.grid.rows === current.grid.rows &&
      (item.grid.column !== current.grid.column || item.grid.row !== current.grid.row);
    const edited = grouped
      ? moveFieldGroup(fieldLatest.current, selections, {
          column: item.grid.column - current.grid.column,
          row: item.grid.row - current.grid.row,
        })
      : replaceFieldItem(fieldLatest.current, target, item);
    if (item.id !== current.id && allFieldIds(latest.current).has(item.id)) {
      setNotice('Choose a unique field item ID.');
      return;
    }
    const validated = studySchema.safeParse(edited);
    if (!validated.success) {
      setNotice(validated.error.issues.map(validationMessage).join(' '));
      return;
    }
    rememberFieldLayout();
    setFieldStudy(edited);
    setSelection({ ...target, id: item.id });
    setSelections((items) =>
      items.map((v) => (v.kind === target.kind && v.id === target.id ? { ...v, id: item.id } : v)),
    );
    setEditorOpen(false);
  }
  function removeFieldItem(target) {
    const key = target.kind === 'sensor' ? 'experimentSensors' : 'crops';
    rememberFieldLayout();
    setFieldStudy((current) => ({
      ...current,
      [key]: current[key].filter((v) => v.id !== target.id),
    }));
    setSelection(null);
    setSelections([]);
    setEditorOpen(false);
  }
  function chooseFieldTool(tool) {
    if (tool && view === 'profile') setView('plan');
    setFieldTool(tool);
    setPlacing(Boolean(tool));
    setEditorOpen(false);
    setSelection(null);
    setSelections([]);
    if (tool) {
      const layer = tool === 'sensor' ? 'sensors' : 'plots';
      setLayerPrefs((current) => ({
        ...current,
        [layerMode]: { ...current[layerMode], [layer]: true },
      }));
    }
  }
  function selectLocation(location) {
    setWeatherPinned(false);
    weatherFlight.current?.controller.abort();
    setStudy((current) => ({
      ...updateStudyInput(current, 'site', 'latitude', location.latitude),
      site: {
        ...current.site,
        address: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
        utcOffset: location.utcOffset,
        utcOffsetApproximate: true,
      },
      weather:
        current.weather.mode === 'automatic'
          ? {
              ...current.weather,
              rows: [],
              days: [],
              hash: '',
              sourceText: undefined,
              normalizedHash: '',
              requestKey: '',
              provenance: undefined,
              name: 'Open-Meteo · ready to download for your site',
            }
          : current.weather,
    }));
    setNotice(
      'Location selected. UTC offset is estimated from longitude; confirm local standard time below.',
    );
  }
  const mainRef = useRef(null);
  const fieldHistory = useRef([]);
  const fieldInteraction = useRef(null);
  const enteredArray = useRef(navigation().step === 4);
  const enteredAnalysis = useRef(navigation().step >= 6);
  const weatherFlight = useRef(null),
    runToken = useRef(0);
  const checkpoint = useRef(null);
  const [resumeKey, setResumeKey] = useState(null);
  const worker = useRef(null),
    importRef = useRef(),
    latest = useRef(s);
  latest.current = s;
  const currentAnalysisKey = useMemo(() => analysisKey(s), [s]);
  const d = dimensions(s),
    validResult = result?.key === currentAnalysisKey ? result : null,
    issues = designIssues(s),
    scope = steps[step][2];
  const fieldWorkspace = step === 7 || step === 8;
  const activeResult = useMemo(
    () => (step === 8 ? controlResult(validResult) : validResult),
    [step, validResult],
  );
  useEffect(() => {
    if (validResult) logCalculationDiagnostics(s, validResult);
  }, [validResult]);
  const compactSidebar = fieldWorkspace && !sidebarExpanded;
  const unidentifiedCrops = [...unresolvedCrops(s), ...unresolvedCrops(fieldStudy(s, true))];
  const layerMode = step >= 6 && step <= 8 ? 'analysis' : 'design';
  const opacityMode = step === 6 || (validResult && step >= 6) ? 'analysis' : 'design';
  const layers =
      step === 8
        ? controlLayers(layerPrefs[layerMode])
        : step === 6
          ? { ...layerPrefs[layerMode], sensors: false, plots: false }
          : layerPrefs[layerMode],
    panelOpacity = opacityPrefs[opacityMode];
  useEffect(() => {
    if (validResult) {
      setSidebarExpanded(false);
      setEditorOpen(false);
      setLayerPrefs((current) => ({
        ...current,
        analysis: {
          ...irradianceLayers,
          ...(fieldWorkspace ? { sensors: true, plots: true, cropping: true } : {}),
        },
      }));
    }
  }, [validResult]);
  useEffect(() => {
    if (fieldWorkspace)
      setLayerPrefs((current) => ({
        ...current,
        analysis: { ...current.analysis, sensors: true, plots: true, cropping: true },
      }));
  }, [step]);

  useEffect(() => {
    if (!initial.weatherRef) return;
    let cancelled = false;
    const context = weatherImportContext(initial.study);
    readWeatherSnapshot(initial.weatherRef)
      .then((data) => {
        if (!data)
          throw Error(
            'The retained weather snapshot is unavailable. Download or upload weather again.',
          );
        if (!cancelled)
          setStudy((current) =>
            weatherImportContext(current) === context
              ? { ...current, weather: { ...current.weather, ...data } }
              : current,
          );
      })
      .catch((error) => {
        if (!cancelled) setNotice(error.message);
      })
      .finally(() => {
        if (!cancelled) setRestoringWeather(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (recovery) {
      setSaveStatus('Original study retained · repair required');
      return;
    }
    if (restoringWeather) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        let record;
        try {
          record = await persistedBrowserRecord(s);
        } catch {
          record = browserStudyRecord(s);
        }
        if (cancelled) return;
        localStorage.setItem('aed-study-v1', JSON.stringify(record));
        localStorage.removeItem('fieldwork-study-v1');
        if (record.browserWeatherRef) void pruneWeatherSnapshots(record.browserWeatherRef);
        setSaveStatus('Layout is session-only · export to save');
      } catch {
        if (!cancelled)
          setSaveStatus('Device storage unavailable · export a project package to save');
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [s, recovery, restoringWeather]);
  const fieldKey = useMemo(
    () =>
      JSON.stringify([
        s.experimentSensors,
        s.crops,
        s.controlField.experimentSensors,
        s.controlField.crops,
      ]),
    [s],
  );
  const hasLayout =
    s.experimentSensors.length ||
    s.crops.length ||
    s.controlField.experimentSensors.length ||
    s.controlField.crops.length;
  const unsavedLayout = savedLayoutKey === null ? Boolean(hasLayout) : savedLayoutKey !== fieldKey;
  useEffect(() => {
    if (!unsavedLayout) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsavedLayout]);
  useEffect(() => {
    try {
      sessionStorage.setItem('aed-navigation', JSON.stringify({ version: 3, step, view }));
    } catch {}
  }, [step, view]);
  useEffect(() => {
    try {
      localStorage.setItem('aed-weather-pinned', String(weatherPinned));
    } catch {}
  }, [weatherPinned]);
  const requestKey = weatherRequestKey(s);
  useEffect(() => {
    if (
      step >= 5 &&
      !weatherPinned &&
      !restoringWeather &&
      s.weather.mode === 'automatic' &&
      (!hasWeather(s) || s.weather.requestKey !== requestKey)
    ) {
      const timer = setTimeout(() => {
        ensureWeather().catch(() => {});
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [step >= 5, requestKey, s.weather.mode, weatherPinned, restoringWeather]);
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
      projectTask.current?.cancel();
      weatherImportTask.current?.cancel();
      warmup?.terminate();
      worker.current?.terminate();
      weatherFlight.current?.controller.abort();
    };
  }, []);
  async function ensureWeather(snapshot = latest.current, force = false) {
    if (snapshot.weather.mode !== 'automatic') {
      if (snapshot.weather.mode === 'upload' && !hasWeather(snapshot))
        throw Error('Upload a complete weather file, or choose automatic weather.');
      return snapshot.weather;
    }
    if (!force && weatherPinned && hasWeather(snapshot)) return snapshot.weather;
    const key = weatherRequestKey(snapshot);
    if (!force && hasWeather(snapshot) && snapshot.weather.requestKey === key)
      return snapshot.weather;
    if (
      !force &&
      weatherFlight.current?.key === key &&
      !weatherFlight.current.controller.signal.aborted
    )
      return weatherFlight.current.promise;
    weatherFlight.current?.controller.abort();
    const controller = new AbortController();
    setWeatherStatus({ state: 'loading', message: 'Downloading weather for your site…' });
    const flight = { key, controller };
    weatherFlight.current = flight;
    flight.promise = downloadWeather(snapshot, {
      signal: controller.signal,
      onProgress: (message) => {
        if (
          !controller.signal.aborted &&
          weatherFlight.current === flight &&
          weatherRequestKey(latest.current) === key &&
          latest.current.weather.mode === 'automatic'
        )
          setWeatherStatus({ state: 'loading', message });
      },
    })
      .then((weather) => {
        if (
          !controller.signal.aborted &&
          weatherFlight.current === flight &&
          weatherRequestKey(latest.current) === key &&
          latest.current.weather.mode === 'automatic'
        ) {
          setWeatherPinned(false);
          setStudy((current) => ({ ...current, weather }));
          setWeatherStatus({
            state: 'ready',
            message: 'Site weather downloaded and saved with this study.',
          });
        }
        return weather;
      })
      .catch((error) => {
        if (
          weatherFlight.current === flight &&
          weatherRequestKey(latest.current) === key &&
          latest.current.weather.mode === 'automatic'
        ) {
          setWeatherStatus(
            error.name === 'AbortError'
              ? { state: 'idle', message: '' }
              : { state: 'error', message: error.message },
          );
        }
        throw error;
      })
      .finally(() => {
        if (weatherFlight.current === flight) weatherFlight.current = null;
      });
    return flight.promise;
  }
  function set(section, key, value) {
    if (
      (section === 'site' && ['latitude', 'longitude', 'utcOffset'].includes(key)) ||
      (section === 'analysis' && periodKeys.includes(key)) ||
      (section === 'weather' && key === 'mode')
    )
      setWeatherPinned(false);
    if (section === 'experimentSensors' || section === 'crops') {
      rememberFieldLayout();
      setFieldStudy((current) => updateStudyInput(current, section, key, value));
      return;
    }
    setStudy((current) => {
      const next = updateStudyInput(current, section, key, value);
      if (section === 'site' && key === 'utcOffset') next.site.utcOffsetApproximate = false;
      if (section === 'site' && ['latitude', 'longitude'].includes(key)) next.site.address = '';
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
                ? 'Illustrative clear-sky weather · synthetic'
                : 'Upload a weather file',
          hash: '',
          sourceText: undefined,
          normalizedHash: '',
          format: value === 'sample' ? 'sample' : value === 'automatic' ? 'Open-Meteo' : 'CSV',
          rows: [],
          days: [],
        };
      }
      const parsed = studySchema.safeParse(next);
      if (!parsed.success) {
        setNotice(parsed.error.issues.map(validationMessage).join(' '));
        return current;
      }
      setNotice('');
      if (
        (section === 'site' || (section === 'analysis' && periodKeys.includes(key))) &&
        next.weather.mode === 'automatic'
      ) {
        next.weather = {
          ...next.weather,
          rows: [],
          days: [],
          hash: '',
          sourceText: undefined,
          normalizedHash: '',
          requestKey: '',
          provenance: undefined,
          name: 'Open-Meteo · ready to download for your site',
        };
      } else if (
        section === 'analysis' &&
        periodKeys.includes(key) &&
        next.weather.mode === 'upload'
      ) {
        next.weather = {
          ...next.weather,
          rows: [],
          days: [],
          hash: '',
          sourceText: undefined,
          normalizedHash: '',
          name: 'Upload weather for the new date',
        };
      }
      return parsed.success ? next : current;
    });
  }
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!busy) {
      setElapsed(0);
      return;
    }
    const start = performance.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((performance.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [busy]);
  function preview(standard = false) {
    setStudy((current) => ({
      ...current,
      analysis: {
        ...current.analysis,
        patches: standard ? 577 : 145,
        resolution: standard ? 1 : 3,
        gridAlignment: standard ? 'row-centres' : 'spacing',
        cellsPerRow: standard ? DEFAULT_CELLS_PER_ROW : current.analysis.cellsPerRow,
        interval: standard ? 10 : 15,
      },
    }));
    setNotice(
      standard
        ? `Standard settings applied: ${DEFAULT_CELLS_PER_ROW} cells between PV row centres, 1 m along-row spacing, 577 patches, 10-minute steps. Recalculate light.`
        : 'Preview settings applied: 145 patches, 3 m cells, 15-minute direct steps. Receiver spacing controls ground detail; sky patches control angular detail. Recalculate light.',
    );
  }
  function go(n) {
    if (n === 8) setStudy((current) => initializeControl(current));
    fieldHistory.current = [];
    setUndoCount(0);
    setSelections([]);
    mainRef.current?.scrollTo({ top: 0 });
    setStep(n);
    setInspection(null);
    setFieldTool(null);
    setSelection(null);
    setEditorOpen(false);
    setSidebarExpanded(false);
    if (n === 4 && !enteredArray.current) {
      setView('oblique');
      enteredArray.current = true;
    } else if (n === 6 && !enteredAnalysis.current) {
      setView('oblique');
      enteredAnalysis.current = true;
    } else if (step < 4 || n < 4) setView(defaults[n]);
    setPlacing(false);
    if (!(step >= 6 && n >= 6)) setMetric(n >= 6 && validResult ? 'sunlight' : 'none');
  }
  function cancel() {
    runToken.current++;
    weatherFlight.current?.controller.abort();
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
    setProgress(null);
    setNotice(
      checkpoint.current
        ? 'Calculation cancelled. Completed days can be resumed while this page stays open.'
        : 'Calculation cancelled.',
    );
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
        if (data.type === 'checkpoint') {
          checkpoint.current = data.checkpoint;
          setResumeKey(data.checkpoint.key);
        }
        if (data.type === 'error') {
          setNotice(data.message);
          setBusy(false);
          w.terminate();
        }
        if (data.type === 'result') {
          checkpoint.current = null;
          setResumeKey(null);
          setResult(data.result);
          setBusy(false);
          setMetric('sunlight');
          setNotice(
            data.result.key === analysisKey(latest.current)
              ? `${isPeriod(snapshot) ? 'Period' : 'Daily'} light calculated for ${periodLabel(snapshot)} with ${data.result.backend} in ${data.result.seconds.toFixed(1)} s.`
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
      w.postMessage({
        study: snapshot,
        checkpoint: checkpoint.current?.key === analysisKey(snapshot) ? checkpoint.current : null,
      });
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
  const importContext = weatherImportContext(s);
  useEffect(() => {
    const task = weatherImportTask.current;
    if (task && task.context !== importContext) {
      task.cancel();
      weatherImportTask.current = null;
    }
  }, [importContext]);
  async function uploadWeather(file) {
    weatherImportTask.current?.cancel();
    let job;
    try {
      if (file.size > MAX_WEATHER_BYTES) throw Error('Weather files must be no larger than 25 MB.');
      const snapshot = latest.current,
        context = weatherImportContext(snapshot);
      job = weatherImportJob(file, snapshot);
      job.context = context;
      weatherImportTask.current = job;
      setNotice('Reading weather file…');
      const parsed = await job.promise;
      if (weatherImportTask.current !== job || weatherImportContext(latest.current) !== context)
        return;
      weatherImportTask.current = null;
      weatherFlight.current?.controller.abort();
      setWeatherStatus({ state: 'idle', message: '' });
      setWeatherPinned(false);
      setStudy((current) =>
        weatherImportContext(current) === context ? applyWeatherImport(current, parsed) : current,
      );
      setNotice(
        `Loaded ${parsed.weather.days?.length ? `${parsed.weather.days.length} days of` : parsed.weather.rows.length} weather intervals. ${parsed.site ? 'Site metadata imported.' : ''}`,
      );
    } catch (e) {
      if (e.name !== 'AbortError' && (!job || weatherImportTask.current === job))
        setNotice(e.message);
    } finally {
      if (weatherImportTask.current === job) weatherImportTask.current = null;
    }
  }
  async function processProject(type, payload) {
    projectTask.current?.cancel();
    setProjectStatus(type === 'import' ? 'Reading project…' : 'Preparing project snapshot…');
    let job;
    try {
      job = projectJob(type, payload, setProjectStatus);
      projectTask.current = job;
      return await job.promise;
    } finally {
      if (!job || projectTask.current === job) {
        projectTask.current = null;
        setProjectStatus('');
      }
    }
  }
  async function importStudy(file) {
    const token = ++projectImportToken.current;
    projectTask.current?.cancel();
    weatherImportTask.current?.cancel();
    weatherImportTask.current = null;
    try {
      if (file.size > MAX_ARCHIVE) throw Error('Project files must be smaller than 128 MiB.');
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (token !== projectImportToken.current) return;
      const project = await processProject('import', { bytes, name: file.name });
      if (token === projectImportToken.current) setPendingProject(project);
    } catch (error) {
      if (token === projectImportToken.current && error.name !== 'AbortError')
        setNotice('Could not open project: ' + error.message);
    }
  }
  function openPreparedProject() {
    if (!pendingProject) return;
    projectImportToken.current++;
    weatherImportTask.current?.cancel();
    weatherImportTask.current = null;
    runToken.current++;
    worker.current?.terminate();
    weatherFlight.current?.controller.abort();
    weatherFlight.current = null;
    setBusy(false);
    setProgress(null);
    setRecovery(null);
    setStudy(pendingProject.study);
    const loaded = pendingProject.study;
    setSavedLayoutKey(
      JSON.stringify([
        loaded.experimentSensors,
        loaded.crops,
        loaded.controlField.experimentSensors,
        loaded.controlField.crops,
      ]),
    );
    setResult(pendingProject.result);
    setWeatherPinned(hasWeather(pendingProject.study));
    setWeatherStatus({ state: 'idle', message: '' });
    fieldHistory.current = [];
    setUndoCount(0);
    go(
      pendingProject.result ||
        pendingProject.study.experimentSensors.length ||
        pendingProject.study.crops.length
        ? 7
        : 4,
    );
    setView('oblique');
    setResetKey((n) => n + 1);
    setMetric(pendingProject.result ? 'sunlight' : 'none');
    setNotice(
      pendingProject.result
        ? 'Project opened with saved light results. These imported results have not been recalculated.'
        : 'Project opened. Calculate light when you are ready.',
    );
    setPendingProject(null);
  }
  function addSensor(point = { x: 0, y: 0 }) {
    if (fieldLatest.current.experimentSensors.length >= 500) {
      setNotice('The study supports up to 500 sensors.');
      return;
    }
    const id = uniqueFieldId(step === 8 ? 'C-S' : 'S', allFieldIds(latest.current));
    if (!cellAt(activeStudy, point, undefined, false)) {
      setNotice('Choose a receiver cell inside the array grid.');
      return;
    }
    rememberFieldLayout();
    setFieldStudy((current) => ({
      ...current,
      experimentSensors: [
        ...current.experimentSensors,
        {
          id,
          type: 'PAR',
          x: point.x,
          y: point.y,
          grid: cellAt(current, point),
          z: current.analysis.receiverHeight,
          treatment: step === 8 ? 'Control' : 'Interior',
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
    setFieldTool(null);
    selectFieldItem({ kind: 'sensor', id });
  }
  function addPlot(point = { x: 0, y: 0 }, cropId = newCropId) {
    if (fieldLatest.current.crops.length >= 200) {
      setNotice('The study supports up to 200 crop beds.');
      return;
    }
    if (!cropById(cropId)) {
      setNotice('Select a crop from the catalog before placing a bed.');
      return;
    }
    const id = uniqueFieldId(step === 8 ? 'C-P' : 'P', allFieldIds(latest.current));
    if (!cellAt(activeStudy, point, undefined, false)) {
      setNotice('Choose a receiver cell inside the array grid.');
      return;
    }
    rememberFieldLayout();
    setFieldStudy((current) => ({
      ...current,
      crops: [
        ...current.crops,
        {
          id,
          ...cropIdentity(cropId),
          cultivar: '',
          notes: '',
          treatment: step === 8 ? 'Control' : 'Interrow',
          replicate: '1',
          x: point.x,
          y: point.y,
          grid: { ...cellAt(current, point), columns: 1, rows: 1 },
          width: 1,
          length: 1,
        },
      ],
    }));
    setPlacing(false);
    setFieldTool(null);
    selectFieldItem({ kind: 'crop', id });
  }
  async function saveStudy(jsonOnly = false) {
    const exportedLayout = fieldKey;
    try {
      const value = await processProject(jsonOnly ? 'json' : 'export', {
        study: s,
        result: validResult,
      });
      setSavedLayoutKey(exportedLayout);
      if (jsonOnly)
        download(JSON.stringify(value.document, null, 2), 'project.json', 'application/json');
      else
        download(
          new Blob([value.archive], { type: 'application/zip' }),
          value.filename,
          'application/zip',
        );
      setNotice(
        jsonOnly
          ? 'Editable project JSON exported with a content checksum.'
          : `Project package exported: ${value.fileCount} files, ${(value.archive.length / 1024 / 1024).toFixed(2)} MiB. ${value.resultIncluded ? 'Matching saved light results included.' : 'Design and research plan; no calculated light results included.'}`,
      );
    } catch (error) {
      if (error.name !== 'AbortError') setNotice('Project export failed: ' + error.message);
    }
  }
  async function exportFigure(format) {
    try {
      const { pngFigure } = await import('./report/export.js');
      const svg = figureSvg(activeStudy, activeResult, view, metric, scope, grid, {
        control: step === 8,
        layers,
        panelOpacity,
        callouts: !fieldWorkspace && scope !== 'report',
      });
      download(
        format === 'png' ? await pngFigure(svg) : svg,
        `agrivoltaic-${view}-${metric}.${format}`,
        format === 'svg' ? 'image/svg+xml' : 'image/png',
      );
    } catch (e) {
      setNotice('Figure export failed: ' + e.message);
    }
  }
  async function report() {
    try {
      const { reportHtml } = await import('./report/export.js');
      const html = reportHtml(s, validResult);
      download(html, 'agrivoltaic-methods.html', 'text/html');
      setNotice('Methods report downloaded. Open it to print or save as PDF.');
    } catch (error) {
      setNotice('Methods report export failed: ' + error.message);
    }
  }
  async function exportTable(methods = false) {
    try {
      const { csv, methodsRows, exportCsv } = await import('./report/export.js');
      download(
        methods
          ? csv([['Parameter', 'Value'], ...methodsRows(s, validResult)])
          : exportCsv(s, validResult),
        `agrivoltaic-${methods ? 'methods' : 'data'}.csv`,
        'text/csv',
      );
    } catch (error) {
      setNotice('CSV export failed: ' + error.message);
    }
  }
  const mean = activeResult?.meanDli;
  return (
    <div className="app">
      <header className="app-header">
        <a className="brand" href="./" aria-label="Agrivoltaic Experiment Designer home">
          <span>Agrivoltaic Experiment Designer</span>
        </a>
        <div className="header-actions">
          {recovery && (
            <button
              className="secondary compact"
              onClick={() => download(recovery, 'agrivoltaic-recovery.json', 'application/json')}
            >
              Recover saved JSON
            </button>
          )}
          <span className="local-status">
            <i />
            {unsavedLayout ? 'Unsaved field layout · export to keep changes' : saveStatus}
          </span>
          <button
            className="icon-button"
            title="Open project package or study JSON"
            disabled={Boolean(projectStatus)}
            onClick={() => importRef.current.click()}
          >
            <Upload size={17} />
            <span>Open project</span>
          </button>
          <button
            className="secondary compact"
            disabled={Boolean(projectStatus)}
            onClick={() => saveStudy()}
          >
            <Download size={16} /> Export project
          </button>
          <input
            ref={importRef}
            hidden
            type="file"
            accept=".zip,.json"
            aria-label="Choose project file"
            onChange={(e) => {
              if (e.target.files[0]) importStudy(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </div>
      </header>
      {pendingProject && (
        <ProjectImportDialog
          project={pendingProject}
          busy={Boolean(projectStatus)}
          progress={projectStatus}
          onStop={() => projectTask.current?.cancel()}
          onOpen={openPreparedProject}
          onCancel={() => setPendingProject(null)}
          onBackup={() => saveStudy()}
        />
      )}
      {projectStatus && !pendingProject && (
        <div className="project-progress" role="status">
          <Loader2 size={18} className="spin" />
          <span>{projectStatus}</span>
          <button onClick={() => projectTask.current?.cancel()}>Cancel</button>
        </div>
      )}
      <div
        className={`workspace ${fieldWorkspace ? 'field-workspace' : ''} ${compactSidebar ? 'compact-sidebar' : ''}`}
      >
        <aside className="sidebar" id="study-controls">
          {fieldWorkspace && (
            <button
              className="sidebar-expand"
              onClick={() => setSidebarExpanded((v) => !v)}
              aria-label={compactSidebar ? 'Expand inputs' : 'Collapse inputs'}
              title={compactSidebar ? 'Expand inputs' : 'Collapse inputs'}
            >
              {compactSidebar ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              <span>{compactSidebar ? '' : 'Collapse inputs'}</span>
            </button>
          )}
          <a className="mobile-jump" href="#design-drawing">
            Jump to drawing ↓
          </a>
          <div className="sidebar-heading">
            <span className="eyebrow">YOUR EXPERIMENT</span>
            <div className="study-name">{s.metadata.title}</div>
            <div className="progress-track">
              <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
            <span className="muted step-count">
              Step {String(step + 1).padStart(2, '0')} of {steps.length}
            </span>
          </div>
          <nav aria-label="Design steps">
            {steps.map(([name, subtitle], i) => (
              <section key={name} className={'step-section ' + (i === step ? 'active' : '')}>
                <button
                  className="step-toggle"
                  aria-label={name}
                  title={name}
                  aria-expanded={i === step && !compactSidebar}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => go(i)}
                >
                  {compactSidebar &&
                    React.createElement(
                      [
                        PanelTop,
                        Box,
                        Layers,
                        ArrowLeft,
                        Grid2X2,
                        MapPin,
                        Sun,
                        Sprout,
                        Sprout,
                        FileText,
                      ][i],
                      { size: 20, className: 'rail-icon' },
                    )}
                  <span className={'step-number ' + (i < step ? 'visited' : '')}>
                    {i < step ? <Check size={13} /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{name}</span>
                  {i === step ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {i === step && !compactSidebar && (
                  <Controls
                    canResume={resumeKey === currentAnalysisKey}
                    onInspect={(value) => setInspection({ ...value, step })}
                    step={step}
                    s={activeStudy}
                    set={set}
                    selectLocation={selectLocation}
                    result={activeResult}
                    busy={busy}
                    progress={progress}
                    elapsed={elapsed}
                    preview={() => preview(false)}
                    standard={() => preview(true)}
                    run={run}
                    cancel={cancel}
                    uploadWeather={uploadWeather}
                    weatherStatus={weatherStatus}
                    refreshWeather={() => ensureWeather(latest.current, true).catch(() => {})}
                    template={() =>
                      download(
                        isPeriod(s) ? periodWeatherTemplate(s) : weatherTemplate,
                        'weather-template.csv',
                        'text/csv',
                      )
                    }
                    placing={placing}
                    fieldTool={fieldTool}
                    setPlacing={(v, kind) => chooseFieldTool(v ? kind : null)}
                    addSensor={() => addSensor()}
                    addPercentiles={() => {
                      rememberFieldLayout();
                      setFieldStudy({
                        ...activeStudy,
                        experimentSensors: [
                          ...activeStudy.experimentSensors,
                          ...percentileSensors(activeStudy, activeResult),
                        ],
                      });
                    }}
                    addPlot={() => addPlot()}
                    removeSensor={(i) =>
                      removeFieldItem({ kind: 'sensor', id: activeStudy.experimentSensors[i].id })
                    }
                    removePlot={(i) =>
                      removeFieldItem({ kind: 'crop', id: activeStudy.crops[i].id })
                    }
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
                    'Compare ground light for the selected period with an unobstructed horizontal reference.',
                    'Arrange sensors and crop beds over the agrivoltaic light field.',
                    'Edit the matching field without PV; uniform light comes from the full-sun reference.',
                    'Export clear figures and traceable parameters for your methods section.',
                  ][step]
                }
              </p>
            </div>
            <div className="units-chip">
              SI <span>metres · watts</span>
            </div>
          </div>
          {weatherPinned && step >= 5 && (
            <div className="snapshot-note">
              Using the imported weather snapshot. Site/period edits or Refresh weather select new
              weather data.
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Dismiss notification">
                ×
              </button>
            </div>
          )}
          {unidentifiedCrops.length > 0 && step >= 7 && (
            <div className="warning" role="alert">
              <Sprout size={17} />
              <span>
                {unidentifiedCrops.length} imported crop bed(s) need a catalog selection to identify
                their botanical names. Open each bed and choose its crop.
              </span>
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
          <a className="mobile-jump" href="#study-controls">
            Back to inputs ↑
          </a>
          {step === 8 && (
            <p className="info-box">
              Control field · same receiver footprint as Agrivoltaic · no PV infrastructure.{' '}
              {activeResult
                ? `${dliLabel(activeResult)}: ${activeResult.openDli.toFixed(2)} mol/m²/day uniformly; 100% relative sunlight.`
                : 'Calculate irradiance to obtain the full-sun DLI for this site and period.'}{' '}
              Layouts are copied on first entry and edited independently afterward.
            </p>
          )}
          {fieldWorkspace && (
            <FieldTools
              onAddSensors={() => {
                chooseFieldTool(null);
                setSensorsOpen(true);
              }}
              onAddCropBeds={() => {
                chooseFieldTool(null);
                setCropBedsOpen(true);
              }}
              onDropPalette={(tool, event) => {
                const point = fieldInteraction.current?.pointAtClient(event);
                if (point) {
                  if (tool.kind === 'sensor') addSensor(point);
                  else addPlot(point, tool.cropId);
                }
              }}
              tool={fieldTool}
              setTool={chooseFieldTool}
              cropId={newCropId}
              setCropId={setNewCropId}
              onUndo={undoFieldEdit}
              canUndo={undoCount > 0}
              study={activeStudy}
              selection={selection}
              selections={selections}
              onDuplicate={duplicateSelection}
              onSelect={selectFieldItem}
              view={view}
            />
          )}
          {fieldWorkspace && sensorsOpen && (
            <SensorsDialog
              study={activeStudy}
              sensorType={newSensorType}
              control={step === 8}
              onClose={() => setSensorsOpen(false)}
              onApply={(options) => {
                const added = addSensors(fieldLatest.current, options, {
                  control: step === 8,
                  reservedIds: allFieldIds(latest.current),
                });
                const parsed = studySchema.safeParse(added.study);
                if (!parsed.success)
                  throw Error(parsed.error.issues.map(validationMessage).join(' '));
                rememberFieldLayout();
                setFieldStudy(parsed.data);
                setNewSensorType(options.type);
                setSelections(added.selections);
                setSelection(added.selections[0]);
                setLayerPrefs((current) => ({
                  ...current,
                  analysis: { ...current.analysis, sensors: true, cropping: true },
                }));
                setSensorsOpen(false);
                setNotice(`Added ${added.selections.length} ${options.type} sensors.`);
              }}
            />
          )}
          {fieldWorkspace && cropBedsOpen && (
            <CropBedsDialog
              study={activeStudy}
              cropId={newCropId}
              control={step === 8}
              onClose={() => setCropBedsOpen(false)}
              onApply={(options) => {
                const added = addCropBeds(fieldLatest.current, options, {
                  control: step === 8,
                  reservedIds: allFieldIds(latest.current),
                });
                const parsed = studySchema.safeParse(added.study);
                if (!parsed.success)
                  throw Error(parsed.error.issues.map(validationMessage).join(' '));
                rememberFieldLayout();
                setFieldStudy(parsed.data);
                setNewCropId(options.cropId);
                setSelections(added.selections);
                setSelection(added.selections[0]);
                setLayerPrefs((current) => ({
                  ...current,
                  analysis: { ...current.analysis, plots: true, cropping: true },
                }));
                setCropBedsOpen(false);
                setNotice(
                  `Added ${added.selections.length} crop beds across ${new Set(options.rowIds).size} crop ${new Set(options.rowIds).size === 1 ? 'row' : 'rows'}.`,
                );
              }}
            />
          )}
          <section className="visual-card" id="design-drawing" tabIndex={-1}>
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
                    aria-pressed={view === v}
                    onClick={() => {
                      setView(v);
                      if (v === 'profile') chooseFieldTool(null);
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
                control={step === 8}
                focus={inspection?.step === step ? inspection : null}
                layers={layers}
                panelOpacity={panelOpacity}
                study={activeStudy}
                scope={scope}
                view={view}
                result={activeResult}
                metric={metric}
                showGrid={grid}
                onPlace={fieldTool === 'crop' ? addPlot : addSensor}
                interactionRef={fieldInteraction}
                editing={fieldWorkspace}
                selection={selection}
                selections={selections}
                onSelect={selectFieldItem}
                onEditItem={editFieldItem}
                onDropTool={(tool, point) =>
                  tool.kind === 'crop' ? addPlot(point, tool.cropId) : addSensor(point)
                }
                editor={
                  fieldWorkspace && editorOpen && selection ? (
                    <FieldEditor
                      key={`${selection.kind}:${selection.id}`}
                      study={activeStudy}
                      selection={selection}
                      control={step === 8}
                      result={activeResult}
                      onSave={(item) => editFieldItem(selection, item)}
                      onClose={() => setEditorOpen(false)}
                      onDelete={() => removeFieldItem(selection)}
                    />
                  ) : null
                }
                placing={placing}
                placementKind={fieldTool === 'crop' ? 'crop plot' : 'sensor'}
                resetKey={resetKey}
              />
              <div className="scene-label">
                <i />
                {step === 8
                  ? 'CONTROL · NO PV'
                  : step < 5
                    ? steps[step][0].toUpperCase()
                    : 'FINITE ARRAY'}{' '}
                <span>·</span>{' '}
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
              {placing && (
                <div className="placing-banner">
                  <MapPin size={15} />{' '}
                  {view === 'profile'
                    ? 'Use the receiver inspector below, or choose another view to place an item'
                    : fieldTool === 'crop'
                      ? 'Click a receiver cell to place a crop bed'
                      : 'Click a receiver cell to place an instrument'}
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
                  {Math.round((progress?.progress || 0) * 100)}% · Calculating selected-period light
                </div>
              )}
            </div>
            <div id="drawing-annotations" />
            <DisplayLegend
              control={step === 8}
              fieldLayout={step !== 6}
              scope={scope}
              layers={layers}
              opacity={panelOpacity}
              setLayer={(key, visible) =>
                setLayerPrefs((current) => ({
                  ...current,
                  [layerMode]: { ...current[layerMode], [key]: visible },
                }))
              }
              setOpacity={(value) =>
                setOpacityPrefs((current) => ({ ...current, [opacityMode]: value }))
              }
            />
          </section>
          <div id="receiver-inspector" />
          {step >= 6 && (
            <div className="light-control">
              <div className="metric-tabs">
                {[
                  ['none', 'Geometry'],
                  ['sunlight', 'Relative sunlight'],
                  ['dli', dliLabel(validResult)],
                  ['zoned-dli', 'Zoned DLI'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={metric === v ? 'selected' : ''}
                    aria-pressed={metric === v}
                    disabled={v !== 'none' && !validResult}
                    onClick={() => {
                      setMetric(v);
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {validResult && metric === 'zoned-dli' && (
                <DliZoneLegend result={activeResult} count={s.analysis.dliZoneCount} />
              )}
              {validResult && metric !== 'none' && metric !== 'zoned-dli' && (
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
                        activeResult.meanSunlight.toFixed(1),
                        '%',
                      ],
                      [
                        Leaf,
                        validResult.period?.days > 1
                          ? `Receiver-area ${dliLabel(validResult).toLowerCase()}`
                          : validResult.estimated
                            ? 'Mean estimated DLI'
                            : 'Mean DLI',
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
                  : step === 8
                    ? [
                        [
                          Maximize,
                          'Control footprint',
                          `${d.footprintX.toFixed(2)} × ${d.footprintY.toFixed(2)}`,
                          'm',
                        ],
                        [
                          MapPin,
                          'Control sensors',
                          activeStudy.experimentSensors.length,
                          'instruments',
                        ],
                        [Leaf, 'Control crop beds', activeStudy.crops.length, 'beds'],
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
                        [Maximize, 'Row length', d.rowLength.toFixed(2), 'm'],
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
                <p>
                  Export one portable ZIP with the editable project, saved results, weather, methods
                  report, CSV tables and SVG figures.
                </p>
              </div>
              <div className="export-buttons">
                <button
                  className="primary"
                  disabled={Boolean(projectStatus)}
                  onClick={() => saveStudy()}
                >
                  <Download size={16} /> Export project package
                </button>
                <button
                  className="secondary"
                  disabled={Boolean(projectStatus)}
                  onClick={() => saveStudy(true)}
                >
                  Project JSON
                </button>
                <button className="secondary" onClick={report}>
                  <FileText size={16} /> Printable methods report
                </button>
                <button className="secondary" onClick={() => exportTable()}>
                  Data CSV
                </button>
                <button className="secondary" onClick={() => exportTable(true)}>
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
                      ? 'Relative sunlight is irradiation received over the selected period as a percentage of incoming GHI (100% = open-field sunlight). DLI uses the same visibility, with documented PAR assumptions.'
                      : 'The same dimensions drive the interactive view, finite simulation geometry, and publication drawings.'}
                </p>
              </div>
              {step === 0 && <span className="tag">01 / MODULE</span>}
            </div>
          )}
          <footer className="step-footer">
            <span>
              {recovery
                ? 'Automatic saving is paused; the original study is retained.'
                : step < steps.length - 1
                  ? 'Export a project to save sensors, crop beds and results.'
                  : 'Keep the project package with your research records.'}
            </span>
            <div>
              {step > 0 && (
                <button className="text-button" onClick={() => go(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < steps.length - 1 && (
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
        <span>Local computation · Version {VERSION}</span>
      </footer>
    </div>
  );
}
export const applicationRoot = createRoot(document.getElementById('root'));
applicationRoot.render(<App />);
