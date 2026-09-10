# Review fixes — version 0.1.1

The eight defects in the September 10 review are repaired. No source in the frozen archive was changed and no deployment was performed.

| Finding | Change | Regression coverage |
|---|---|---|
| Numeric entry corruption | Keep draft text, including minus signs/decimal prefixes; commit on blur or Enter, Escape restores the value, local validation explains bounds | Character-by-character drafts, negative depth, empty/invalid commits, fractions; actual browser `-0.15` entry |
| Invalid JSON PPFD | One relational weather validator shared by the authoritative schema, CSV import, downloaded weather and solver | Invalid PPFD, missing total PPFD, broken intervals and invalid irradiance rejected across boundaries |
| Large-array export crash | Reduce extents without unbounded function arguments; release projected geometry; catch report failures; preserve SVG aspect ratio in PNG and bound raster memory | All projections and report for an accepted 24-row / 20-table design |
| Incomplete camera fit | Include rotated receiver corners, plots and installation heights/depths in explicit fitting | Buffers and negative-depth instruments remain inside the fitted view |
| Wrong methods tilt | Report effective fixed tilt, applicable tracker limit and preview pose separately; backtracking is rack-specific | Vertical = 90°, pergola = 0°, fixed = configured tilt |
| Missing standalone provenance | Shared record in CSV metadata, SVG structured metadata and visible SVG/PNG footer; label estimated DLI | Backend, input identity, weather-input hash, conversion and assumptions checked in standalone output |
| Unverifiable weather hash | Preserve source text and its digest; separately hash canonical interval tuples; verify on JSON import and calculation | JSON round trips and intentional source/interval modifications |
| Tracker-limit overshoot | Apply mechanical limits after diffuse quantization; cache final poses | Both tracker types, both signs, zero/odd/fractional limits |

Invalid older local studies are retained behind a Recover saved JSON action; automatic saving pauses until a valid study is imported, so stricter validation cannot silently overwrite research records.

The scene now retains its renderer, camera and controls. It reuses PV/support meshes until structural inputs change and only rebuilds display overlays when necessary. A real-browser screenshot comparison confirmed that a sensor-notes edit did not change any pixels in the scene.

A keyboard-accessible receiver inspector provides coordinates, light values and instrument identities. Arrow keys on the drawing select cells; placement can also be performed through the inspector, including while viewing a profile. Mobile links move directly between the controls and drawing. Projection/layer controls expose their selected state.

Publication figures include a visible numbered instrument legend. Profile markers group instruments by both receiver cell and installation depth. For more than 60 glyphs, figures use the explicit cell references in the legend instead of unreadable overlapping callouts. SVG remains preferable for very long legends; PNG raster size is bounded and the report constrains figure height for printing.

CPU calculation progress now reflects traced sky/sun directions and includes elapsed time. An explicit coarse-preview action changes sampling settings before calculation; it explains the effect on cell-based layouts. Timing output separates geometry/BVH preparation from visibility work. Scientific sampling is never silently reduced. CPU execution can still be slow for large tracking studies.

GPU allocation/initialization and dispatch errors fall back to the CPU, without writing fallback visibility under a GPU cache key. Browser storage reads have bounded waits and cache failures do not stop a calculation. The GitHub workflow verifies PRs and reserves deployment for main.

## Verification

- 49 automated tests pass, including eleven new regression tests.
- Production build, archive verification and the 45,990-ray Radiance occlusion comparison pass. Splitting Three.js core/renderer removes the former chunk-size advisory.
- Browser GPU/CPU comparisons matched all 45 cells in each of five rack designs, with zero observed Wh/DLI/relative-sunlight differences. Persistent cache reuse, actual WebGPU device destruction and simulated allocation/storage failure cases passed. See [recorded results](webgpu-validation.json).
- 44 convergence sweeps / 132 calculations cover two locations, two seasons, three rack types and sky/time/grid/pose refinements. See [measured sensitivity](convergence-validation.json).
- Browser checks verified corrected numeric entry, keyboard inspection, stable scene pixels, the publication figure footer/legend and mobile navigation at 390 × 844 with no horizontal overflow. The real PNG export decoded successfully at 3000 × 2304 and its footer was visually inspected.

These fixes do not establish independent Perez/solar/daily-energy accuracy or agreement with measured fields. No measured field dataset was supplied, pvlib is unavailable in the current Python environment, and broad hardware/browser and page-by-page print qualification remain outstanding. The application and status documentation continue to disclose these limits.
