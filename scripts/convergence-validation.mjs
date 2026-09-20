import fs from 'node:fs/promises';
import { defaultStudy, selectRacking, VERSION } from '../src/domain/study.js';
import { calculateDay } from '../src/irradiance/engine.js';
const report = {
  createdAt: new Date().toISOString(),
  version: VERSION,
  scope:
    'CPU sensitivity on small fixed and tracking arrays at three latitudes across both hemispheres and two seasons. Each sweep changes only one setting. Differences describe convergence; they are not field accuracy or universal acceptance tolerances.',
  cases: [],
};
for (const site of [
  { name: 'Tucson', latitude: 32.22, longitude: -110.97, utcOffset: -7 },
  { name: 'Wageningen', latitude: 51.97, longitude: 5.67, utcOffset: 1 },
  { name: 'Sydney', latitude: -33.87, longitude: 151.21, utcOffset: 10 },
])
  for (const date of ['2026-06-21', '2026-12-21'])
    for (const type of ['fixed', 'single-axis', 'dual-axis']) {
      let base = defaultStudy();
      base.table.high = 1;
      base.table.wide = 3;
      base.row.tables = 1;
      base.array.rows = 2;
      base.site = { ...base.site, ...site };
      delete base.site.name;
      base.weather.mode = 'sample';
      base.analysis = {
        ...base.analysis,
        date,
        backend: 'cpu',
        resolution: 1,
        patches: 577,
        interval: 10,
      };
      base = selectRacking(base, type);
      for (const [parameter, values] of [
        ['patches', [145, 577, 2305]],
        ['interval', [15, 10, 5]],
        ['resolution', [2, 1, 0.5]],
        ...(type === 'fixed' ? [] : [['poseBin', [2, 1, 0.5]]]),
      ]) {
        const rows = [];
        for (const value of values) {
          const s = structuredClone(base);
          if (parameter !== 'poseBin') s.analysis[parameter] = value;
          const r = await calculateDay(s, () => {}, {
            diffusePoseStep: parameter === 'poseBin' ? value : 2,
          });
          rows.push({
            value,
            receivers: r.cells.length,
            meanSunlight: r.meanSunlight,
            meanDli: r.meanDli,
            seconds: r.seconds,
            timings: r.timings,
          });
        }
        const reference = rows.at(-1);
        for (const r of rows) {
          r.deltaMeanSunlight = r.meanSunlight - reference.meanSunlight;
          r.deltaMeanDli = r.meanDli - reference.meanDli;
        }
        report.cases.push({
          site: site.name,
          date,
          type,
          parameter,
          reference: reference.value,
          rows,
        });
      }
      console.log(site.name, date, type, 'complete');
    }
await fs.writeFile('docs/convergence-validation.json', JSON.stringify(report, null, 2) + '\n');
