import { defaultStudy, selectRacking } from '../src/domain/study.js';
import { normalizeLayout } from '../src/experiment/grid-layout.js';
import { figureSvg } from '../src/report/figures.js';
import { reportHtml } from '../src/report/export.js';
function show(kind) {
  let s = defaultStudy();
  s.weather.mode = 'sample';
  s.weather.name = 'Illustrative clear-sky day · synthetic';
  if (kind === 'rotated') {
    s = selectRacking(s, 'dual-axis');
    s.array.azimuth = 137;
    s.array.groupSize = 2;
    s.landUse.underPanelWidth = 2;
    s.landUse.perimeterBuffer = 6;
    s.crops = [
      {
        id: 'P1',
        crop: 'Lettuce',
        treatment: 'Under-row',
        replicate: '1',
        x: 0,
        y: 0,
        width: 4,
        length: 3,
        grid: { column: 10, row: 10, columns: 4, rows: 3 },
      },
    ];
    s.experimentSensors = [
      {
        id: 'S1',
        type: 'Soil temperature',
        x: 0,
        y: 0,
        z: -0.3,
        treatment: 'Under-row',
        replicate: '1',
        model: 'Test model',
        logger: 'L1',
        channel: '1',
        notes: 'Buried probe',
        grid: { column: 10, row: 10 },
      },
    ];
  }
  if (kind === 'zero') {
    s.landUse.underPanelWidth = 0;
    s.landUse.perimeterBuffer = 0;
    s.rowPair.cropSetback = 0;
    s.rowPair.maintenance = 0;
    s.array.buffer = 0;
  }
  s = normalizeLayout(s);
  document.querySelector('.figures').innerHTML = ['plan', 'profile']
    .map((view) => figureSvg(s, null, view, 'none', 'array', true, { compact: true }))
    .join('');
  document.querySelector('iframe').srcdoc = reportHtml(s, null);
}
for (const kind of ['default', 'rotated', 'zero'])
  document.getElementById(kind).onclick = () => show(kind);
show('default');
