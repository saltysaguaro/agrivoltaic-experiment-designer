import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Scene from '../src/ui/Scene.jsx';
import DisplayLegend from '../src/ui/DisplayLegend.jsx';
import { designLayers, irradianceLayers } from '../src/ui/display-layers.js';
import { defaultStudy, selectRacking } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
import '../src/styles.css';
function Fixture() {
  const [study, setStudy] = useState(() => {
    const s = defaultStudy();
    s.table.wide = 2;
    s.row.tables = 2;
    s.array.rows = 3;
    s.analysis.backend = 'cpu';
    s.analysis.patches = 145;
    s.analysis.resolution = 2;
    s.weather.mode = 'sample';
    s.weather.name = 'Illustrative clear-sky day · synthetic';
    return s;
  });
  const [scope, setScope] = useState('array'),
    [view, setView] = useState('oblique');
  const [layers, setLayers] = useState({ ...designLayers }),
    [opacity, setOpacity] = useState(1);
  const [result, setResult] = useState(null),
    [status, setStatus] = useState('Ready');
  const [focus, setFocus] = useState(null);
  async function solve() {
    setStatus('Calculating');
    setScope('irradiance');
    setFocus(null);
    try {
      const r = await calculateDay(study);
      setResult(r);
      setLayers({ ...irradianceLayers });
      setOpacity(0.2);
      setStatus(`Calculated ${r.cells.length} receivers · ${r.backend}`);
    } catch (e) {
      setStatus(e.message);
    }
  }
  return (
    <main style={{ maxWidth: 1100, margin: '20px auto', padding: 12 }}>
      <h1>Display and callout checks</h1>
      <p>Isolated synthetic fixture; saved studies are not changed.</p>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <label>
          Stage{' '}
          <select
            aria-label="Stage"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setFocus(null);
              setLayers({ ...designLayers });
              setOpacity(1);
              setResult(null);
            }}
          >
            {['module', 'racking', 'row', 'pair', 'array', 'irradiance'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          View{' '}
          <select aria-label="View" value={view} onChange={(e) => setView(e.target.value)}>
            {['oblique', 'plan', 'profile'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Rack{' '}
          <select
            aria-label="Rack"
            value={study.racking.type}
            onChange={(e) => {
              setStudy(selectRacking(study, e.target.value));
              setResult(null);
            }}
          >
            {['fixed', 'single-axis', 'dual-axis', 'vertical', 'pergola'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Callout{' '}
          <select
            aria-label="Callout"
            value={focus?.id || ''}
            onChange={(e) => setFocus(e.target.value ? { id: e.target.value } : null)}
          >
            {[
              '',
              'module.length',
              'module.width',
              'module.thickness',
              'module.gap',
              'racking.height',
              'racking.tilt',
              'table.wide',
              'row.tableGap',
              'rowPair.pitch',
              'landUse.underPanelWidth',
              'rowPair.cropSetback',
              'rowPair.croppingWidth',
              'landUse.perimeterBuffer',
              'array.azimuth',
            ].map((v) => (
              <option key={v} value={v}>
                {v || 'Stage overview'}
              </option>
            ))}
          </select>
        </label>
        <button onClick={solve}>Calculate synthetic day</button>
        <output>{status}</output>
      </nav>
      <section className="visual-card">
        <div className="scene-wrap" style={{ height: 'min(55vh, 480px)', minHeight: 320 }}>
          <Scene
            study={study}
            scope={scope}
            view={view}
            result={result}
            metric={result ? 'sunlight' : 'none'}
            showGrid
            focus={focus}
            layers={layers}
            panelOpacity={opacity}
          />
        </div>
        <DisplayLegend
          scope={scope}
          layers={layers}
          opacity={opacity}
          setOpacity={setOpacity}
          setLayer={(k, v) => setLayers({ ...layers, [k]: v })}
        />
        <div id="drawing-annotations" />
      </section>
    </main>
  );
}
createRoot(document.getElementById('root')).render(<Fixture />);
