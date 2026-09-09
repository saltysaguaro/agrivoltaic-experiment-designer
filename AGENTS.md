# Agrivoltaic Experiment Designer

## Mission and source of truth
Build a browser-only research design application for standardized agrivoltaic/PV experiments and publication methods figures. Deploy as static assets on GitHub Pages. The user's complete modeling brief is preserved in docs/modeling-brief.md.

## Frozen baseline
All original repository content except Git metadata was moved to archive/agrivoltaic_bf. It is reference-only, locally write-protected. Never edit, execute builds in, or add dependencies to this archive. archive/manifest.json records SHA-256 checksums and the copied repository commit. Git does not preserve read-only bits: npm run archive:verify checks contents and npm run archive:lock reapplies protection. Preserve the native Radiance implementation as a scientific oracle. Do not reuse the original flat state or old irradiance “sensors” as field instruments.

## Architecture and invariants
- Versioned, validated hierarchical Study schema is authoritative; dimensions in SI, coordinates east/north/up in metres.
- Domain geometry generates both interactive Three.js geometry and scientific occluders. Labels, crops, sensors and receiver graphics never occlude.
- Workflow: module → racking → table/row → row pair → array → environment → irradiance → physical sensors → crop plots → publication.
- Orthographic cameras by default; canonical plan, profile, and oblique orthographic figures with dimensions. Inputs on left, relevant graphics on right; every input has defaults.
- Racking supports fixed, single-axis, dual-axis, vertical bifacial, and raised/pergola through a pose contract.
- ReceiverGrid is numerical sampling; ExperimentSensor is a physical instrument with type, location/depth, treatment, replicate and installation metadata.
- Preferred WebGPU compute with CPU MeshBVH fallback/reference; isolate GPU APIs. Pin dependencies. Solve in a worker with cancellation.
- Normalize diffuse sky patches to DHI and direct+diffuse to GHI; conserve source interval energy at direct substeps. Empty scene shade must be zero and relative sunlight must be 100%. UI/maps/exports present relative sunlight = 100 × received daily irradiation / open-field daily GHI; blue-low/yellow-high for both sunlight and DLI. Preserve legacy numerical shade fields for compatibility.
- Perez/Reinhart sky at 145/577/2305 patches, visibility bitsets, aggregate daily sky weights by pose, IndexedDB geometry/grid/pose cache. No multi-bounce reflection in v1.
- DLI shares visibility with broadband; label broadband-derived values Estimated DLI and report PAR conversion. Accept measured PPFD where available.
- Default to automatic Open-Meteo site/date weather: ERA5 historical, labeled recent/forecast data. Preserve interval-end semantics, fractional UTC offsets, source attribution/hash and downloaded snapshots. Retain local CSV/EPW/TMY3 uploads and an explicit illustrative mode; never silently substitute sample weather after download failure. No required secret/backend.
- Inputs need plain-language info popovers. Racking selection and subsequent module/table geometry edits supply compatible clearances while retaining larger custom values. Show minimum-clearance hints and plain-language software limits; direct spacing edits remain user-controlled. Preserve camera position/target/zoom across map layers, sensor/plot edits and array-level workflow changes; only explicit view/refit actions reset framing. First entry to irradiance defaults to oblique orthographic, with transparent modules and receiver hover values.
- Prebundle worker dependencies and warm up the worker before first calculation to avoid development-time dependency reloads. Preserve navigation across page reloads.
- Invalidate numerical results after geometry/environment changes; sensor/crop edits must not rerun the solver.
- Interactive and publication views share a display-only ground grid at z = 0, labeled in figure exports; profiles show a ground line. Never include this display geometry in solver occluders.
- SVG/PNG figures, CSV, JSON, printable methods report include model assumptions, versions, weather provenance and actual backend. Never claim validation that has not run.

## Verification
Run npm test and npm run build. Scientific tests cover geometry, conservation, sky quadrature, weather validation, finite shadows, DLI, trackers, stale results and data round trips. Use Radiance comparison harness when Radiance is installed; missing oracle is a documented validation limitation, not a passing comparison. Keep docs/STATUS.md accurate.

## Delivery
Keep this a new implementation; reference the archive without importing runtime code from it. No server requirement. GitHub Pages workflow uses relative asset URLs. Do not publish to another hosting service. Work autonomously within the requested scope; no approval required for routine reversible implementation.
