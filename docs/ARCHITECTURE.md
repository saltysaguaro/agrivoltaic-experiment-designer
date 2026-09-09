# Architecture and coordinate contract

`Study` (schema version 1) holds SI values and creates every downstream representation. UI state, Three.js materials, cameras, and transient calculation progress do not enter the study definition.

- `src/domain/study.js`: schema, migrations, defaults, derived dimensions, validation and analysis identity.
- `src/domain/geometry.js`: hierarchy-aware finite module/support geometry, rack pose, coordinate transforms, and receiver grid. Internal Three.js Z is up; X east; Y north. Facing azimuth is clockwise from north. At 180°, rows run east–west and modules slope upward toward north. Origin is the centre of row-centre extents. Height means assembly centre/axis height, not low-edge clearance.
- `src/irradiance/weather-service.js`: public Open-Meteo adapter, fixed ERA5 historical selection, labeled recent/forecast output, interval-ending UTC normalization, fractional-offset day clipping, provenance and response hash.
- `src/ui/camera.js`: projected-bounds camera fit, camera snapshot/restore and rotated receiver-grid hit lookup. Camera state persists across redraws, light layers and layout edits.
- `src/irradiance`: worker-based daily integration, NOAA approximate solar position, normalized Perez 1993 skies over Reinhart patches, CPU MeshBVH, isolated WebGPU BVH adapter, visibility bitsets and bounded IndexedDB cache.
- `src/experiment`: physical field sensors and rectangular east/north crop plots; receiver-derived statistics.
- `src/report`: canonical vector figures generated from domain geometry, reproducibility tables, CSV, JSON, 3000 × 1800 PNG, and printable HTML.

## Daily integration

Weather timestamps are the **start** of intervals in local standard time. EPW and TMY3 end-of-hour labels are converted. Full 24-hour coverage is required. Date changes discard loaded weather to prevent stale date/source combinations. Automatic mode redownloads after location/date changes, deduplicates in-flight requests, aborts obsolete requests and rejects missing data without synthetic fallback. Downloaded snapshots are retained until refreshed. EPW/TMY3 match month/day to allow typical meteorological years; their source year is not treated as the study year.

GHI is authoritative. The direct horizontal energy of each interval is `(GHI − DHI) × duration`. Substeps distribute that energy proportional to positive geometric solar elevation cosine. Supplied DNI influences Perez sky clearness; discrepancies with GHI closure are disclosed. The sum of discretized diffuse contributions is normalized to DHI. Weather with positive direct energy entirely below the horizon is rejected.

Sky visibility is a receiver × direction Uint32 bitset. Fixed geometry's daily sky vector is accumulated before applying visibility; tracking sky vectors are grouped by quantized 2° poses. Direct rays use exact poses. Cache identity includes engine version, geometry, grid, sky subdivision, backend and pose. Date/weather do not invalidate the geometry cache. Sensor/crop edits do not invalidate calculation results. Changing model inputs invalidates displayed/exported results by full analysis identity.

DLI uses the same visibility. Measured PPFD with diffuse_PPFD is preferred. Without measured diffuse PPFD, Spitters' daily diffuse PAR fraction partitions measured total PPFD. With broadband-only weather, total PAR defaults to 50% of broadband energy and photon conversion defaults to 4.57 µmol/J. Daily Spitters fractions distribute PAR energy over the direct and diffuse source vectors. DLI is labeled estimated when broadband conversion is used.

## Modeling limits

All module surfaces, torque tubes and posts are opaque. No module transmission, terrain, spectral ray interactions, vegetation occlusion, reflected light, or multi-bounce transport. Posts use square cross-sections. Site elevation is retained as provenance; it does not change the geometric solar position or supplied irradiance. Trackers assume horizontal axes and flat terrain; dual-axis tables yaw about their own centres. These simplifications belong in every methods report.

WebGPU uses an independent packed binary hierarchy with stackless WGSL traversal; CPU uses pinned three-mesh-bvh. The new adapter avoids coupling scientific state to the upstream unstable GPU API. Browser capability/device errors fall back to CPU. Worker termination cancels a run. Receiver counts are limited to 20,000. IndexedDB cache retains at most approximately 64 entries; failure is nonfatal.

## Reproducibility and deployment

Study JSON bundles the weather values, source metadata and optional numerical result. Imported results are recalculated before use. Analysis and weather hashes use SHA-256. JSON schema version migration currently accepts version 1 and rejects unknown versions. UI progress is navigation state, not a claim of scientific completion.

`npm run build` creates relative-URL static assets. The GitHub workflow verifies the immutable archive, runs numerical tests, and deploys only `dist`. No cloud database, API key or server is required. Google fonts are optional; system fonts are fallbacks. GitHub Pages repository settings must use GitHub Actions as the source.
