import { defaultStudy } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
import { sampleWeather } from '../src/irradiance/solar.js';
import { figureSvg } from '../src/report/figures.js';
import { pngFigure, reportHtml } from '../src/report/export.js';
import { buildProjectPackage } from '../src/project/package.js';
import { persistedBrowserRecord, readWeatherSnapshot } from '../src/project/weather-storage.js';
const out = document.getElementById('results'),
  status = document.getElementById('status');
try {
  const s = defaultStudy();
  s.weather.mode = 'sample';
  s.table.wide = s.table.high = s.row.tables = s.array.rows = 1;
  Object.assign(s.analysis, { backend: 'cpu', patches: 145, interval: 15 });
  s.weather.rows = sampleWeather(s).map((w) => ({ ...w, ppfd: 0, diffusePpfd: 0 }));
  const r = await calculateDay(s),
    svg = figureSvg(s, r, 'plan', 'dli');
  if (r.openDli !== 0 || svg.includes('NaN')) throw Error('Zero DLI figure failed.');
  const png = await pngFigure(svg),
    report = reportHtml(s, r),
    pack = await buildProjectPackage(s, r);
  if (!pack.resultIncluded) throw Error('Zero DLI result was omitted from the package.');
  const record = await persistedBrowserRecord(s),
    stored = await readWeatherSnapshot(record.browserWeatherRef);
  const storageRestored = JSON.stringify(stored.rows) === JSON.stringify(s.weather.rows);
  if (!storageRestored) throw Error('Weather storage round trip failed.');
  out.textContent = JSON.stringify(
    {
      passed: true,
      backend: r.backend,
      cells: r.cells.length,
      pngBytes: png.size,
      reportBytes: report.length,
      archiveBytes: pack.archive.length,
      resultIncluded: pack.resultIncluded,
      storageRestored,
    },
    null,
    2,
  );
  status.textContent = 'Passed';
} catch (error) {
  out.textContent = JSON.stringify({ passed: false, error: error.message });
  status.textContent = 'Failed';
}
