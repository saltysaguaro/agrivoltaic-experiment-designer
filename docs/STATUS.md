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

- 38 passing numerical/data/component tests cover schema round trips, rotated coordinates/area, finite geometry, geometric solar sanity, patch quadrature, Perez normalization, empty-field zero shade, finite shadows, energy conservation, PPFD conservation, PAR limiting values, tracker limits, stale results, weather rejection, plot statistics, escaped publication output, sunlight/CSV consistency, report ground grids, large-assembly clearance bounds, daily tracking independent of preview tilt, rotated cell snapping, plot sample membership, JSON round trips, packed-marker bounds, and Mapbox response handling.
- CPU versus Radiance: 45,990 identical rays, 9 geometric cases, **0 visibility mismatches**. Shared-weight irradiance differences were 0 W/m². Exact details: `radiance-validation.json`.
- Production build and local HTTP preview checked. All five racking types completed daily CPU calculations; canonical plan/profile/orthographic SVGs were independently rendered and visually inspected. Simulated-DOM integration tests cover a first-click calculation, dual-axis clearances through subsequent table edits, input help, and view selection through layer and sensor edits. A live Open-Meteo ERA5 response for the default site completed a 24-hour CPU calculation. A live Mapbox request with the public key and GitHub Pages referrer returned valid Tucson coordinates; simulated-DOM tests cover keyboard selection, full-array default view and receiver-locked sensor/crop additions without recalculation. No real-browser screenshot/click or hardware WebGPU testing was performed.

## Remaining scientific release gates

1. Execute GPU-versus-CPU parity on real WebGPU devices and test device loss, memory limits, and browser storage behavior.
2. Independently compare Perez sky source weights, solar position, daily irradiation, shade and DLI with Radiance/pvlib and measured field cases. Current Radiance check isolates occlusion only.
3. Quantify sky/grid/time/pose convergence for representative locations, seasons and tracker configurations; establish acceptance tolerances appropriate to publication use.
4. Browser interaction/accessibility/print-layout QA across desktop, mobile and Safari/Firefox/Chromium.
5. Extend schema migrations when introducing version 2; current migration intentionally rejects unknown versions.

## Deliberate v1 simplifications

Horizontal receivers, flat terrain, square posts, opaque module boxes, idealized rack structures, no frame-specific optical material model, no reflected radiation or plant shading. Dual-axis tables are rectangular and yaw about their centres. Rectangular crop plots align with receiver cells and the array axes. No arbitrary plot polygons, automatic row-relative replicate generator, electrical yield solver, annual simulation, or multi-bounce optics. Site elevation is metadata rather than an atmospheric correction. JSON exports are the portable research record; local browser storage is a convenience.

These limitations must remain visible in methods documentation. Building/exporting a figure does not imply scientific validation.
