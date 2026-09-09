# Agrivoltaic Visualizer

Agrivoltaic Visualizer is a local-first agrivoltaic modeling and visualization platform for exploring photovoltaic system layouts, crop-space relationships, and annual irradiance conditions. The browser application uses a shared three.js scene as the geometry source of truth, while the backend packages that geometry for sensor inference, weather acquisition, Radiance-based export, and annual simulation workflows.

The repository now supports two complementary modes:

- the full local application for project management, weather retrieval, annual modeling, and results storage
- public browser tools for shade preview, study-bundle authoring, and uploaded results review

The project is organized around a practical agrivoltaic workflow:

- choose a site
- build a conceptual 3D array layout
- define sensor coverage
- run an annual irradiance study
- review seasonal and height-slice results in the browser

## Core capabilities

### 3D agrivoltaic layout design

The design interface provides a realtime three.js configurator for agrivoltaic PV layouts. The scene updates immediately as layout parameters change, and the same geometry is reused downstream for export and analysis.

Supported system archetypes:

- fixed tilt
- single-axis tracker
- raised / pergola
- vertical bifacial

Key design inputs include:

- DC system size
- table configuration
- module dimensions
- tilt or tracker angle
- array azimuth
- height / clearance
- row spacing
- row-column grouping
- crop row buffers and edge buffers

### Crop-space and ground relationship modeling

The scene is built for agrivoltaic interpretation rather than PV geometry alone. The app tracks:

- array footprint
- inter-row openings
- crop-row width
- crop-bed placement
- edge and planting buffers

This makes it possible to compare how different mounting styles change the available plantable corridor beneath or between PV rows.

### Sensor selection and export preparation

After the design stage, the app opens a sensor-layout workflow that can infer sampling volumes from the current scene. This supports:

- representative center-array sampling
- central-row sampling
- full-array repeated sampling across adjacent row pairs

The export pipeline packages scene geometry, materials, sensor definitions, and metadata for local or portable analysis workflows.

### Annual irradiance modeling

The local backend supports annual irradiance studies driven by real geometry and weather inputs. The user-facing annual workflow is built around:

- site selection and geocoding
- weather acquisition
- sensor-grid generation
- export of Radiance-ready geometry
- `bifacial_radiance`-based annual simulation
- storage of job artifacts and result datasets

The current implementation is designed for local execution on a workstation with Python and Radiance installed.

### Results review

The results interface is designed for agrivoltaic interpretation rather than raw file inspection. It supports:

- annual totals
- wrapped seasonal month ranges
- height slices
- edge versus interior comparisons
- irradiance, shade-fraction, and related derived views

### Public browser tools

The same geometry and sensor logic also drive a browser-only toolkit for lightweight sharing and remote prep work:

- a public shade preview for date, hour, and location-based shadow inspection
- a public study builder that captures site, design state, and selected sensors into a portable study bundle
- a public results viewer that visualizes uploaded result bundles or completed-package JSON files without requiring the local backend

## Application flow

### Landing page

The landing page is the local project entry point. It handles:

- project folder selection
- project snapshot loading
- site selection
- Mapbox-backed address lookup

### Design page

The design page is the main three.js configurator. It is used to:

- select the system archetype
- edit layout geometry
- review computed summary metrics
- save the current design state
- launch the sensor layout or modeling workflow

### Sensor layout page

The sensor layout page derives analysis coverage from the current scene geometry and prepares the study configuration used for annual jobs.

### Run page

The run page tracks asynchronous annual job progress, logs, and backend execution state.

### Results page

The results page visualizes completed annual datasets and supports comparison across months, heights, and sensor groupings.

## Architecture

### Frontend

The frontend is a multi-page browser application built directly from HTML, CSS, and ES modules.

Important frontend areas:

- `src/app/`: state, events, and mount logic for the designer
- `src/scene/`: shared three.js scene, camera, lighting, controls, and rendering
- `src/systems/`: system archetypes and assembly logic
- `src/ground/`: ground grid and heatmap overlays
- `src/crops/`: crop-space and planting geometry
- `src/platform/`: page controllers, session helpers, routing, and browser-side platform logic
- `src/public/`: public Pages controllers, browser-side Mapbox lookup, public study bundling, and uploaded-results helpers

### Shared packages

`packages/shared/` contains common schemas, constants, math helpers, and platform contracts used by both the frontend and backend.

`packages/three-exporter/` contains scene export, tagging, selection, metadata, and result-import helpers.

### Backend

`packages/simulation-backend/` provides:

- the local Express server
- project storage
- site lookup integration
- annual job orchestration
- weather acquisition
- Radiance export assembly
- sensor inference
- result parsing and aggregation

## Repository layout

```text
.
├── index.html
├── design.html
├── sensor-layout.html
├── model-run.html
├── results.html
├── public-visualizer.html
├── public-study-builder.html
├── public-study-design.html
├── public-study-sensors.html
├── public-results-viewer.html
├── src/
│   ├── app/
│   ├── crops/
│   ├── ground/
│   ├── platform/
│   ├── public/
│   ├── scene/
│   ├── systems/
│   ├── ui/
│   └── utils/
├── packages/
│   ├── shared/
│   ├── simulation-backend/
│   ├── three-exporter/
│   └── examples/
├── scripts/
├── tests/
└── docs/
```

## Requirements

The local annual-modeling workflow depends on:

- Node.js 20 or newer
- `pnpm` 10
- Python with `bifacial_radiance` and `pvlib`
- Radiance CLI tools on `PATH`

Optional integrations:

- Mapbox token for site autocomplete
- NSRDB credentials for weather retrieval

## Local setup

Install JavaScript dependencies and build the workspace:

```bash
corepack enable
corepack pnpm install
corepack pnpm build
```

Set the runtime environment as needed:

```bash
export MAPBOX_ACCESS_TOKEN="your_mapbox_token_here"
export NSRDB_API_KEY="your_nrel_api_key_here"
export NSRDB_EMAIL="your_email@example.com"
export AGRIVOLTAIC_PYTHON="/path/to/python"
export AGRIVOLTAIC_RADIANCE_BIN_DIR="/path/to/Radiance/bin"
```

Start the local backend:

```bash
corepack pnpm start:backend
```

Then open:

- [http://localhost:8787](http://localhost:8787)

## GitHub Pages build and deployment

The repository includes a browser-only public toolchain that is published directly from `docs/`. The generated `docs/` tree is not a cache or scratch directory. It is the checked-in deployment artifact that GitHub Pages serves.

Public Pages entrypoints:

- `public-visualizer.html` -> `docs/index.html`
- `public-study-builder.html` -> `docs/public-study-builder.html`
- `public-study-design.html` -> `docs/public-study-design.html`
- `public-study-sensors.html` -> `docs/public-study-sensors.html`
- `public-results-viewer.html` -> `docs/public-results-viewer.html`

The Pages build also copies the browser-loaded modules into:

- `docs/src/`
- `docs/packages/`
- shared public stylesheets and config files in `docs/`

That means a GitHub update must include both:

- source edits under the normal repo paths such as `src/`, `packages/`, and the public HTML files
- the regenerated `docs/` output created from those same sources

### How the Pages build works

- `corepack pnpm build` builds the workspace packages and then regenerates `docs/`
- `corepack pnpm build:pages` refreshes only the static public Pages output
- `scripts/build-public-pages.mjs` clears the copied `docs/src` and `docs/packages` trees on each run so stale browser modules do not survive between releases
- `docs/.nojekyll` is written automatically so GitHub Pages serves the copied directories as-is

### Local verification for GitHub Pages

After changing anything that affects the public tools, run:

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Then serve the repository root with a static file server so `/docs` resolves exactly the way GitHub Pages will:

```bash
python3 -m http.server 8000
```

Open and verify:

- `http://localhost:8000/docs/`
- `http://localhost:8000/docs/public-study-builder.html`
- `http://localhost:8000/docs/public-study-design.html`
- `http://localhost:8000/docs/public-study-sensors.html`
- `http://localhost:8000/docs/public-results-viewer.html`

Recommended release checks for the public tools:

- shade preview loads, site lookup works, and `Export PNG` downloads successfully
- designer opens from the public study flow and the preset views behave as expected
- sensor page starts with no sensors selected and the preset selection buttons work at the current height
- `Download Work Package` produces a study bundle JSON
- uploaded-results viewer opens example output without console errors

### GitHub repository update checklist

1. Run `corepack pnpm lint`, `corepack pnpm test`, and `corepack pnpm build`.
2. Review the diff and confirm the regenerated `docs/` files match the intended source changes.
3. Commit both the source changes and the updated `docs/` deployment artifact.
4. Push the branch to GitHub.
5. In GitHub, open `Settings -> Pages`.
6. Set `Source` to `Deploy from a branch`.
7. Select the publishing branch and the `/docs` folder.
8. Save and wait for the Pages deployment to finish.
9. Open the published site and re-check each public page listed above.

### GitHub Pages safety notes

- Do not place backend-only secrets in the public config or copied `docs/` files.
- `MAPBOX_ACCESS_TOKEN` used by the public browser tools must be a browser-safe public token.
- The local annual-modeling backend, Radiance binaries, weather downloads, and `bifacial_radiance` execution are not part of GitHub Pages deployment.
- If a public tool changes and `docs/` is not regenerated before pushing, GitHub Pages can serve stale JavaScript even when the source tree looks correct.

## Runtime and data notes

- The browser app relies on the backend for project storage, routing, site lookup, and annual jobs.
- Local job outputs are written under `local-data/jobs/<jobId>/`.
- `local-data/` is ignored by Git and is intended for local study artifacts only.
- The backend stores job metadata, requests, weather data, logs, and result files for each run.

## Useful scripts

- `corepack pnpm build`: build all workspace packages and regenerate the static public-page output
- `corepack pnpm build:pages`: regenerate the static public-page output only
- `corepack pnpm study:package -- ./path/to/study-bundle.json --out ./local-data`: turn a public study bundle into a local run-anywhere package
- `corepack pnpm lint`: run TypeScript checks
- `corepack pnpm test`: run the automated test suite
- `corepack pnpm dev:backend`: start the backend from source with `tsx`
- `corepack pnpm start:backend`: start the built backend

## Tests

The test suite covers:

- annual job creation and result handling
- sensor-grid inference
- Mapbox normalization and lookup helpers
- material and export validation
- month-range expansion and annual metrics
- project persistence
- results import
- routing and security behavior
- public solar-position calculations

## Public study handoff

- Public study bundles contain the browser-authored site, design state, scene export, motion model, and selected sensors.
- They do not contain weather data or executed results.
- The local helper `corepack pnpm study:package -- ./path/to/study-bundle.json` converts that bundle into the existing run-anywhere package format and acquires weather locally.
- Completed annual results can be reviewed either in the local app or in the public results viewer by uploading the exported bundle JSON or the completed package JSON files.

## Publishing notes for recent public-tool changes

- The preview visualizations now use a preview-only east-west compensation so the public shadow path matches cardinal expectations without changing the exported `bifacial_radiance` workflow.
- Top-down preset views keep north at the top while preserving the corrected shadow direction in the public preview tools.
- Sensor preset buttons now default to the current height, with explicit `... at All Heights` variants for multi-height selection.
- The sensor pages now load with no sensors selected by default.
- Cross-row full-array sensor spacing is interpreted center-to-center from one array row to the next.
- Public snapshot buttons are labeled `Export PNG` consistently across the public tools.

## Open repository decision

- Choose a license before making the repository public
