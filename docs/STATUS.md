# Implementation status

## Implemented

- Frozen 480-file baseline, SHA-256 manifest, local write protection, archive CI check; original modeling brief and new AGENTS.md.
- New hierarchical version-1 Study schema with defaults, bounds, explicit unknown-version rejection and schema round trips.
- Plain-language help on every parameter, compatible defaults when selecting racking and after later module/table changes, persistent camera state, closer orthographic framing and receiver hover values.
- Ten-step left-input/right-visualization workflow; orthographic Three.js scene; plan/profile/oblique views; responsive layout and keyboard controls.
- Fixed, single-axis, dual-axis, vertical bifacial and pergola geometry; table/row spacing, groups, supports and receiver extent.
- CPU MeshBVH and WebGPU WGSL BVH adapters; worker execution, progress, cancellation and CPU fallback.
- NOAA geometric sun; normalized Perez/Reinhart sky; daily aggregation by fixed/quantized tracker pose; bitsets and bounded IndexedDB cache.
- GHI closure and conservation; shared geometry for estimated or measured DLI; automatic Open-Meteo location/date downloads (ERA5 historical; recent/forecast explicitly labeled), imported CSV/EPW/TMY3 and optional synthetic sample; source/provenance hashing.
- Receiver-locked field layout with per-cell sensor packing/count badges, hover instrument lists, whole-cell crop plots, and actual receiver outlines in interactive/report views. Full array defaults to Orthographic.
- Mapbox address/place search with the archived public key, keyboard selection, cancellation of stale queries, atomic lat/lon updates and automatic weather refresh; longitude-estimated UTC offset is visibly labeled.
- Physical instruments including depth/orientation/treatment/replicate/logger/channel; map click placement and DLI-percentile placements.
- Crop plots and plot-level DLI statistics; grid results invalidated by scientific inputs but retained after instrument/plot edits.
- Canonical SVG figures with geometry, sensor/plot overlays, north arrow, scale, dimensions and a shared ground grid; high-resolution PNG; CSV, JSON and printable HTML methods report.
- Relative sunlight (received daily GHI fraction) in maps, receiver/plot summaries and exports; blue-low/yellow-high sunlight and DLI colors. Friendly table-count limits, explicit minimum-clearance hints and a repair action for saved layouts.
- GitHub Actions test/build/Pages deployment configuration.

## Measured verification

- 49 passing numerical/data/component tests cover schema round trips, rotated coordinates/area, finite geometry, geometric solar sanity, patch quadrature, Perez normalization, empty-field zero shade, finite shadows, energy conservation, PPFD conservation, PAR limiting values, tracker limits, stale results, weather rejection, plot statistics, escaped publication output, sunlight/CSV consistency, report ground grids, large-assembly clearance bounds, daily tracking independent of preview tilt, rotated cell snapping, plot sample membership, JSON round trips, packed-marker bounds, and Mapbox response handling.
- CPU versus Radiance: 45,990 identical rays, 9 geometric cases, **0 visibility mismatches**. Shared-weight irradiance differences were 0 W/m². Exact details: `radiance-validation.json`.
- Production build and local HTTP preview checked. All five racking types completed daily CPU calculations; canonical plan/profile/orthographic SVGs were independently rendered and visually inspected. Simulated-DOM integration tests cover a first-click calculation, dual-axis clearances through subsequent table edits, input help, and view selection through layer and sensor edits. A live Open-Meteo ERA5 response for the default site completed a 24-hour CPU calculation. A live Mapbox request with the public key and GitHub Pages referrer returned valid Tucson coordinates; simulated-DOM tests cover keyboard selection, full-array default view and receiver-locked sensor/crop additions without recalculation.
- September 10 review reran all 38 tests, the build, archive verification and the 45,990-ray Radiance harness successfully. Real in-app browser interaction completed a WebGPU daily calculation (5,123 receivers, 577 patches, 5.2 s), exercised cancellation and export generation, and inspected a 390 × 844 layout. That initial pass did not verify GPU/CPU parity or device loss; the repair verification below adds those checks. See `REVIEW-2026-09-10.md` for scope and reproductions.

## September 10 fixes (version 0.1.1)

- All eight recorded code defects are fixed: draft-based numeric commits, shared weather validation, bounded SVG extent reductions, complete display-fit bounds, effective rack parameters in methods, standalone provenance, retained source text plus canonical weather-input hashes, and constrained tracker pose bins.
- Added eleven regression tests. Valid Study version 1 records remain loadable; invalid saved records are preserved behind a recovery action with automatic saving paused; legacy weather without source text is explicitly labeled unavailable. New CSV/EPW/TMY3/Open-Meteo imports retain their original text and both hashes. Large snapshots can exceed localStorage capacity; JSON remains the portable record and the UI reports storage failures.
- Persistent renderer/camera/controls and reusable structural meshes; field metadata edits leave the drawing unchanged. Keyboard receiver inspector/placement, selected-state announcements, mobile jump links, visible sensor legends with depth-aware profile grouping, elapsed/work-weighted progress, an explicit coarse preview, and PR verification are implemented.
- Real browser checks verified `-0.15` keyboard entry, arrow-key receiver inspection, unchanged scene pixels during a notes edit, and a 390 px mobile drawing jump with no horizontal overflow. A generated publication figure and its provenance/legend were visually inspected; the PNG path produced and decoded a 3000 × 2304 image with the correct aspect ratio. Changed sample inputs and viewport were restored.
- Actual WebGPU versus CPU daily results matched at every receiver for five small rack designs (45 cells each). Persistent cache reuse in separate workers, actual device destruction, simulated allocation failure and simulated storage failure preserved results. Maximum observed Wh, DLI and relative-sunlight differences were zero. See `webgpu-validation.json`; this is one browser/runtime, not a broad hardware qualification.
- `validate:convergence` completed 44 sweeps / 132 CPU daily calculations: Tucson and Wageningen, June and December, fixed/single-axis/dual-axis racks, and sky/time/grid/pose settings. Largest receiver-area mean sunlight differences from each sweep's finest reference: sky 0.0511 percentage points; direct time 0.1878; grid 0.5932; pose bins 0.0016. These are small synthetic-array sensitivity measurements, not per-cell error bounds or publication acceptance criteria. See `convergence-validation.json`.
- Tests, production build, archive verification and Radiance comparison pass. Three.js core and renderer use separate production chunks; the build completes without the former size advisory. No deployment was performed.

## Remaining scientific release gates

1. Extend the passing browser GPU/CPU and failure checks to representative large arrays, additional devices/browsers and actual memory-pressure limits. GPU vendor/hardware acceleration were not independently identified.
2. Independently compare Perez sky source weights, solar position, daily irradiation, shade and DLI with Radiance/pvlib and measured field cases. Current Radiance check isolates occlusion only.
3. Extend the recorded sky/grid/time/pose sweeps to representative field geometries and measured weather; establish per-cell and publication acceptance tolerances. Existing sweeps report sensitivity only.
4. Browser interaction/accessibility/print-layout QA across desktop, mobile and Safari/Firefox/Chromium.
5. Extend schema migrations when introducing version 2; current migration intentionally rejects unknown versions.

## Deliberate v1 simplifications

Horizontal receivers, flat terrain, square posts, opaque module boxes, idealized rack structures, no frame-specific optical material model, no reflected radiation or plant shading. Dual-axis tables are rectangular and yaw about their centres. Rectangular crop plots align with receiver cells and the array axes. No arbitrary plot polygons, automatic row-relative replicate generator, electrical yield solver, annual simulation, or multi-bounce optics. Site elevation is metadata rather than an atmospheric correction. JSON exports are the portable research record; local browser storage is a convenience.

These limitations must remain visible in methods documentation. Building/exporting a figure does not imply scientific validation.
