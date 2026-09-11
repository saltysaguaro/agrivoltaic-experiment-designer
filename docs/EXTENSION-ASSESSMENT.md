# Cell transmission and period-analysis assessment

September 11, 2026. Assessed against application version 0.3.0. Historical proposal written before implementation. Version 0.4.0 now implements the area-averaged transmission route and all-day season/year analysis; see [implemented behavior and validation](TRANSMISSION-AND-PERIODS.md). The proposal below remains as design background, including alternatives that were not selected.

## Browser persistence change

`aed-study-v1` in localStorage previously contained the complete Study, including sensor locations and crop beds. The app reads this record at startup. `fieldwork-study-v1` is the older fallback key. This explains layouts reappearing on the GitHub Pages site: they are retained by that browser origin, not uploaded as studies to GitHub or stored in application cookies.

The fix strips both field-layout arrays when loading browser autosave and when writing it. A successful write also removes the obsolete key. Other study settings still persist. Explicit project import/export retains the full layout and results, and the UI now says that layouts are session-only. The existing damaged-record recovery path preserves invalid originals with autosave paused. Browser navigation remains in sessionStorage and numerical visibility caching remains in IndexedDB; neither contains sensor/bed records.

## Internal solar-cell gaps and linked transmission

The existing `module.gap` is spacing between whole modules. Its current single value is used along both table directions. It does not describe spaces between solar cells within a module. Panel display opacity is also unrelated to scientific transmission.

Internal gaps can be represented, but the current scientific model is binary: all module boxes and structural supports are opaque; CPU uses the first intersection and GPU returns a blocked/clear result. Both daily irradiation and DLI consume one-bit visibility. There is currently no optical transmission input.

Suggested inputs, in module-local coordinates before rack pose/array rotation:

- Cell columns/rows, cell dimensions, separate X and Y gaps, edge margins and opaque frame width.
- An explicit choice of fixed outer-module dimensions (derive the fitted cell dimensions) or fixed cell dimensions (derive the outer dimensions), to avoid inconsistent geometry.
- Transparent versus opaque backsheet/laminate, and broadband/PAR gap-region transmittance. An opaque backsheet makes internal gaps optically opaque.
- Derived open fraction and effective normal-incidence module transmission, with a clearly labeled measured-value override.

For an area-averaged approximation with opaque cells/frame, `effective transmission = transmitting area / outer module area × gap-region transmittance`. The two gap directions are geometrically linked through the transmitting area; their crossing area must not be counted twice. Changing gap proportions can therefore change the linked transmission, subject to the chosen dimension contract. This approximation is not a prediction of fine sunfleck patterns or oblique-angle transmission.

Two implementation routes are feasible:

1. **Area-averaged transmission:** preserve one module envelope and attenuate each intersected module once. Continue rays beyond transmitting modules so another module or an opaque support can still block them. Use separate broadband/PAR throughput when supplied. A uniform factor cannot be applied to the final shade map because rays encounter different numbers/types of objects.
2. **Resolved cell patterns:** test a ray's intersection in module-local coordinates against cells, gaps, margins and frame. A procedural cell mask could avoid creating one mesh per cell. This would need sufficiently dense spatial, time and sky sampling (and possibly within-cell sampling) to resolve small gaps without sampling artifacts. A geometry-only open-gap model with perfect transmission would retain binary visibility, but actual laminate transmission requires fractional throughput.

Avoid applying the same transmission twice for front/back faces of one thin module. Radiance's glass model already includes angular transmission/reflection; its author cautions against double-applying a separate glass correction ([Greg Ward, glass transmittance](https://discourse.radiance-online.org/t/glass-transmittance/1053)). A constant transmittance should be explicitly labeled an approximation.

This affects CPU/GPU traversal, cache types/keys, energy integration, module geometry, schema migration, methods and project exports. At 20,000 receivers and 2,305 directions, one full float32 throughput matrix is 184.4 MB (175.9 MiB), compared with 5.84 MB for the present packed bitset. Those figures are per pose and per stored throughput band; naive caching across tracker poses is unsuitable. Chunking, bounded caches and/or compact representations need measured accuracy and memory tests.

Required tests include opaque and fully transmitting limits, analytic single-module transmission, opaque support blocking, multiple-module attenuation, gaps on both axes and their crossings, oblique rays, energy bounds, separate PAR conversion, CPU/GPU agreement, stale caches, schema/export round trips and small independent Radiance transmission cases.

## Single day, season or calendar year

All three modes are feasible without a server. Suggested controls:

- Single day: the existing date picker.
- Season: start month/year and end month/year, inclusive of whole months. A November–March choice must explicitly identify the year crossing.
- Calendar year: January 1 through December 31 of the selected year, including leap day where applicable.

Open-Meteo's historical API already accepts start/end dates and hourly GHI/DHI/DNI. It labels solar radiation as a preceding-hour average ([official API documentation](https://open-meteo.com/en/docs/historical-weather-api)). The app adapter currently clips these intervals to one local-standard-time day. EPW/TMY3 imports also filter to one day, the Study weather array is capped at 1,440 intervals, and saved result validation expects one date. A year therefore needs a period-aware run/result contract rather than just a UI selector.

Proposed execution:

1. Download bounded date chunks; retain original source snapshots, attribution, interval semantics, time offsets and hashes. Validate complete daily coverage and report missing days; never silently substitute illustrative data. Future periods require explicitly representative historical/TMY data rather than a claimed annual forecast.
2. Iterate complete days in a persistent cancellable worker; reuse fixed-geometry sky visibility and bounded tracker-pose caches. Add progress by day and checkpoints/resume for long runs. The present `calculateDay` creates/disposes its engine each invocation, so reusing a long-lived backend/geometry would be an additional optimization.
3. Accumulate numeric arrays rather than hundreds of copies of all per-cell JSON objects. Retain daily/monthly summaries and make full daily receiver export an explicit size choice.
4. Export period-total irradiation in kWh/m², period-mean daily DLI in mol/m²/day, and separately labeled cumulative PAR in mol/m² if offered. Period relative sunlight must be `100 × sum(received irradiation) / sum(open-field irradiation)`, not the unweighted average of daily percentages.
5. Extend saved-project versioning, source/result hashes, invalidation, weather pinning, plot statistics and figure/report labels while preserving legacy day projects.

Tests must cover leap years, cross-year seasons, fractional UTC offsets, complete versus incomplete weather, aggregation against separate day runs, weighted sunlight, DLI units, cancellation/resume, cached/uncached equality, and period project round trips. Any representative-day speed mode must be labeled approximate and tested against all-day runs.

The browser capacity fixture measures only daily runs. It does not establish annual runtimes or the cost of a new transmitting-module model. Those should be benchmarked after implementing the corresponding computational paths.
