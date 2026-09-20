import fs from 'node:fs/promises';
import { defaultStudy, selectRacking, VERSION } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
const report = {
  createdAt: new Date().toISOString(),
  version: VERSION,
  scope:
    'Dense 384-module winter arrays in both hemispheres, opaque and transmitting modules. One, four and nine samples per receiver; differences from nine samples are sensitivity observations, not accuracy bounds.',
  cases: [],
};
for (const south of [false, true])
  for (const bifacial of [false, true]) {
    let s = defaultStudy();
    s.weather.mode = 'sample';
    Object.assign(
      s.site,
      south
        ? { latitude: -33.87, longitude: 151.21, utcOffset: 10 }
        : { latitude: 51.97, longitude: 5.67, utcOffset: 1 },
    );
    Object.assign(s.table, { wide: 8, high: 2 });
    s.row.tables = 3;
    s.array.rows = 8;
    s = selectRacking(s, 'single-axis');
    s.module.bifacial = bifacial;
    Object.assign(s.analysis, {
      date: south ? '2026-06-21' : '2026-12-21',
      backend: 'cpu',
      patches: 145,
      interval: 15,
      resolution: 3,
      gridAlignment: 'spacing',
    });
    const rows = [];
    for (const samplesPerCell of [1, 4, 9]) {
      s.analysis.samplesPerCell = samplesPerCell;
      const r = await calculateDay(s);
      rows.push({
        samplesPerCell,
        receivers: r.cells.length,
        meanSunlight: r.meanSunlight,
        meanDli: r.meanDli,
        seconds: r.seconds,
      });
    }
    for (const r of rows) {
      r.deltaMeanSunlight = r.meanSunlight - rows.at(-1).meanSunlight;
      r.deltaMeanDli = r.meanDli - rows.at(-1).meanDli;
    }
    report.cases.push({
      hemisphere: south ? 'south' : 'north',
      bifacial,
      date: s.analysis.date,
      rows,
    });
    console.log(report.cases.at(-1));
  }
await fs.writeFile(
  'docs/sampling-convergence-validation.json',
  JSON.stringify(report, null, 2) + '\n',
);
