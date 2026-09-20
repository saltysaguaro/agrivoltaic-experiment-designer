import React from 'react';
import { createRoot } from 'react-dom/client';
import Scene from '../src/ui/Scene.jsx';
import { defaultStudy } from '../src/domain/study.js';
import '../src/styles.css';
const s = defaultStudy();
s.weather.mode = 'sample';
let extension;
function lose() {
  const canvas = document.querySelector('canvas');
  extension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
  extension.loseContext();
}
createRoot(document.getElementById('root')).render(
  <main>
    <section style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'white' }}>
      <h1>Drawing recovery</h1>
      <button onClick={lose}>Lose drawing context</button>
      <button onClick={() => extension.restoreContext()}>Restore drawing context</button>
    </section>
    <div style={{ height: 600 }}>
      <Scene study={s} scope="array" view="oblique" metric="none" showGrid={true} />
    </div>
  </main>,
);
