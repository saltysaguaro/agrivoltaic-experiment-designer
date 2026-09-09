# Agrivoltaic Experiment Designer

A new browser-only application for designing reproducible agrivoltaic field experiments. The original `agrivoltaic_bf` project is preserved in [`archive/agrivoltaic_bf`](archive/agrivoltaic_bf), with checksums and local read-only protection. No archived code is imported into the new application.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Everything runs locally in the browser, including worker-based irradiance calculations; automatic weather downloads use the public Open-Meteo API. Study inputs autosave on the device; download JSON to keep a durable research record.

## Workflow

1. **Module** — frame dimensions, rated power and intermodule gap.
2. **Racking** — fixed tilt, single-axis tracking, dual-axis tracking, vertical bifacial or raised/pergola; axis height and support dimensions.
3. **PV table and row** — orientation, modules across/along, tables per row and gaps.
4. **Row pair** — centre-to-centre pitch, edge clearance, crop setbacks and maintenance space.
5. **Full array** — rows, groups, aisles, facing azimuth and perimeter receiver buffer.
6. **Site and weather** — Mapbox address/place search or manual coordinates, local standard UTC offset, date, automatic Open-Meteo weather, CSV/EPW/TMY3 upload, or clearly labeled synthetic example day.
7. **Irradiance** — finite direct and diffuse occlusion, daily relative sunlight as a percentage of incoming GHI, and measured or estimated DLI.
8. **Field sensors** — click-to-place instruments, editable coordinates/depth, treatment/replicate, installation metadata, and DLI-percentile placement.
9. **Crop plots** — whole-cell crop plots aligned with the receiver grid and receiver-based mean/median/SD/range DLI and mean relative sunlight.
10. **Methods and export** — SVG/3000-pixel PNG figures, data and methods CSV, study JSON, and a printable HTML methods package with plan, profile, orthographic, relative sunlight and DLI figures.

Full array defaults to Orthographic. Views use an orthographic Three.js camera. In the oblique view, drag to pan, right-drag to orbit, and scroll to zoom. Camera pose and zoom persist through map-layer changes and field-layout edits. Hover over receiver cells for coordinates, relative sunlight, DLI and daily irradiation. Plan/profile keep orientation fixed. Dimensions use metres; coordinates are east/north/up from array centre. Instrument orientation does not change the horizontal receiver grid used for map estimates.

Relative sunlight is `100 × receiver daily irradiation / open-field daily GHI`. A value of 100% means full open-field sunlight, and 0% means none. Sunlight and DLI use blue for low values and yellow for high values. CSV exports contain `relative_sunlight_percent`; numerical JSON results retain legacy shade fields alongside sunlight for compatibility. Report figures include a ground grid at z = 0, with labeled spacing, and a ground line in profile.

Selecting racking or changing module/table geometry updates the axis height, row pitch and table gap to meet conservative clearance defaults (5 cm horizontal clearance and 25 cm below the module edge above the receiver plane). Larger existing clearances are retained. Direct height/spacing edits remain user-controlled and are checked before calculation. **Apply minimum clearances** repairs a previously saved layout. The application supports 1–20 tables per row; the field now displays this software limit. Axis height, row pitch and table-gap ranges accommodate the clearances needed by supported module/table dimensions.

## Receiver-locked field layout

Sensors snap to receiver-cell centres in plan and orthographic views. Enter a receiver column/row to move a sensor, and edit installation height/depth separately. Up to nine dots are packed within each cell; denser groups use a readable count badge. Hover over the cell to see the instrument list. Packed dots are display offsets only; reported installation coordinates remain at the cell centre. Profile views retain installation height/depth.

Crop plots start as one receiver cell and expand by whole columns and rows. Their edges follow the array orientation; plot statistics use exactly those cells. Grid indices are retained as the array, azimuth or resolution changes, and clamped to remain in bounds. Existing saved/imported field layouts are snapped when loaded. Coordinates and plot dimensions are derived from those grid selections. Light outlines mark the actual receiver boundaries in interactive and report views. This display geometry never enters the irradiance solver.

## Location search

The address input uses the archived tool's Mapbox Geocoding v5 endpoint and the same public browser key. Type at least three characters and choose a suggestion with the mouse or arrow keys/Enter. The selected result updates longitude and latitude together and refreshes automatic weather. A longitude-based UTC offset estimate is visibly marked for confirmation; it is not a timezone-boundary lookup. Manual coordinate entry remains available.

Mapbox search needs the public token's URL restrictions to permit the page being served, including local development if used. The configured GitHub Pages URL was checked successfully with a live geocoding request. The adapter is new code and imports nothing from the archived application. [Mapbox geocoding documentation](https://docs.mapbox.com/help/getting-started/geocoding/).

## Automatic site weather

Open-Meteo is the default weather source. Enter latitude, longitude, local standard UTC offset and date; entering Site & weather (or a later step) downloads hourly GHI, DNI and DHI automatically. Calculate daily light also waits for the correct site weather. Coordinate/date changes invalidate downloaded data; failures stay visible and never substitute synthetic weather silently. Choose **Illustrative clear-sky day** explicitly to work offline with example data, or **Upload my weather** for measured/site-specific data.

Historical dates use a pinned **ERA5 reanalysis** dataset. Recent dates and forecasts use Open-Meteo's forecast/recent model output, explicitly labeled in the study. Dates more than about two weeks ahead require a historical representative date or an uploaded weather file. Automatic weather is modeled regional data, not on-site measurements.

The source URL, dataset label, retrieval timestamp, selected grid coordinates, attribution, raw-response SHA-256 and normalized weather values are saved in study JSON and included in methods metadata. API radiation timestamps mark the **end of the preceding hour**; the adapter converts them to local interval starts and clips boundary hours while conserving energy, including fractional UTC offsets. Saved studies reuse their weather snapshot until location/date changes or Refresh is selected.

[Open-Meteo documentation](https://open-meteo.com/en/docs/historical-weather-api) · [API terms](https://open-meteo.com/en/terms). The public endpoint is for noncommercial use, including public research at public institutions, under usage limits; data require CC BY 4.0 attribution. Commercial deployments need a suitable service arrangement rather than embedding secret credentials in Pages.

## Weather files

Simple CSV uses `timestamp,GHI,DNI,DHI`, optionally `duration_minutes,PPFD,diffuse_PPFD`. Timestamps identify interval starts in **local standard time**, for example `2026-06-21T09:00` or `09:00`, without a timezone suffix. Duration defaults to 60 minutes. Provide contiguous full-day coverage including nighttime zeros. Units: W/m² for irradiance; µmol/m²/s for PPFD. GHI is authoritative; inconsistent DNI closure is disclosed and direct substep energy is normalized to GHI − DHI. EPW and TMY3 interval-ending timestamps are converted. Importing EPW/TMY3 also imports site coordinates and UTC offset. Changing the analysis date clears imported weather to avoid stale data.

The CSV template contains placeholder nighttime zeros throughout and **must be populated** before calculation. The synthetic clear-sky example is for trying the interface, not publication-grade meteorological data.

## Scientific implementation and validation

- CPU `three-mesh-bvh` first-hit reference and isolated WebGPU BVH compute adapter with automatic CPU fallback.
- Perez 1993 anisotropic sky, normalized over 145, 577 or 2,305 Reinhart patches.
- Daily diffuse source aggregation, binary sky-visibility bitsets and bounded IndexedDB caching.
- Direct solar integration at 5/10/15 minutes with source interval energy conservation.
- Tracking: exact direct poses, quantized 2° diffuse poses; flat-terrain single-axis backtracking.
- Shared broadband/PAR visibility. Default estimated PAR: 0.50 broadband fraction, 4.57 µmol/J, Spitters daily diffuse partition. Measured total/diffuse PPFD are supported.
- Study schema, software version, actual backend, weather SHA-256 and analysis identity are retained.

**Development model.** CPU finite occlusion matched Radiance on 45,990 rays across nine cases. This comparison uses identical geometry, rays and shared source weights. It does not independently validate the Perez source distribution, solar position, integrated daily energy, GPU execution, reflections or field agreement. Opaque modules and square posts only; flat ground; no vegetation occlusion or reflected radiation. Hardware WebGPU parity and real-browser interaction testing have not yet been performed; simulated-DOM integration tests cover first-click calculation, help and view selection. See [architecture](docs/ARCHITECTURE.md), [status](docs/STATUS.md), [comparison results](docs/radiance-validation.json), and the [original modeling brief](docs/modeling-brief.md).

## Verify

```sh
npm test
npm run build
npm run archive:verify
npm run validate:radiance  # requires rtrace and oconv on PATH
```

The Radiance harness returns a nonzero status when the tools are unavailable or comparisons fail. It writes its measured results to `docs/radiance-validation.json`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` tests and builds the application on pushes to `main`, then deploys `dist` to GitHub Pages. In repository **Settings → Pages**, choose **GitHub Actions** as the source. Relative asset URLs support `https://saltysaguaro.github.io/agrivoltaic-experiment-designer/` without a server or secret keys. Only the new application's static output is deployed; the archive stays in source control.

This checkout has not been pushed or published by the implementation task.

## Archive policy

All 480 original files are preserved with hashes in `archive/manifest.json`; `.git` remains at the repository root. Local archive files are mode 0444 and directories 0555. Git does not preserve write-protection bits, so run `npm run archive:lock` after a fresh clone. CI verifies checksums. Refer to [`AGENTS.md`](AGENTS.md) before making changes.

## Model references

- Perez et al. (1993), [All-weather model for sky luminance distribution](https://doi.org/10.1016/0038-092X(93)90017-I); coefficients and parameter conventions from [Radiance gendaymtx](https://github.com/NatLabRockies/Radiance/blob/master/src/gen/gendaymtx.c).
- Spitters et al. (1986), [Separating the diffuse and direct component of global radiation](https://doi.org/10.1016/0168-1923(86)90060-2), with the equation documented in [pvlib](https://pvlib-python.readthedocs.io/en/stable/reference/generated/pvlib.irradiance.diffuse_par_spitters.html).
- [NOAA approximate solar equations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF).
- [Three.js](https://threejs.org/) and [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh).

Attribution for the Radiance-derived coefficients is in `THIRD_PARTY_NOTICES.md`.
