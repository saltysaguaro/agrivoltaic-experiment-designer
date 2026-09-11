# Bifacial cell gaps and day/season/year analysis

Implemented in version 0.4.0, September 11, 2026. Study schema 2 migrates schema-1 designs with opaque modules and single-day defaults. No deployment was performed as part of this implementation.

## Module controls and optical contract

Select **Bifacial · transmitting cell gaps** to expose cell columns/rows, internal X/Y gaps, opaque perimeter width, and separate broadband/PAR laminate transmittance (0–1). Monofacial selection hides these controls and returns to opaque modules. X runs across the module's width and Y along its length, before portrait/landscape orientation and racking pose. Outer module dimensions stay fixed; fitted cell dimensions are derived and impossible fits rejected. The module preview shows the cell grid.

With width W, length L, perimeter m, columns nx, rows ny and gaps gx/gy:

- Cell width = `(W − 2m − (nx − 1)gx) / nx`.
- Cell length = `(L − 2m − (ny − 1)gy) / ny`.
- Gap area = `(W − 2m)(L − 2m) − nx × ny × cell width × cell length`.
- Effective module transmission = `gap area / (W × L) × laminate transmittance`.

Gap crossings are counted once. Cells and perimeter are opaque. Rays receive the effective transmission once for each module envelope they intersect; an opaque post or torque tube stops them. Broadband and PAR share intersection counts but can have different attenuation. A bifacial choice does not itself guarantee transparency: zero laminate values model an opaque backsheet. Display opacity remains unrelated to irradiance.

This is an **area-averaged optical approximation**. It does not resolve individual cell-gap sunflecks, angle-dependent glass transmission, electrical bifacial yield, spectral transport, reflections or vegetation shading. The preview's cell pattern is not a cell-resolved solver mesh. Methods and project exports disclose the approximation and all optical inputs.

## Period controls, weather and results

- **Single day:** one local-standard-time date.
- **Season:** starting year and inclusive start/end months. If the end month is earlier, the period continues into the next year; November 2025–March is November 1, 2025 through March 31, 2026.
- **Calendar year:** January 1–December 31, including February 29 in leap years.

Every date is simulated. Automatic weather downloads use bounded chunks of up to 31 days with separate historical/recent sources, complete local-day coverage, original response text/URLs and hashes. CSV needs dated timestamps for periods; EPW/TMY3 use month/day matching. Missing dates, incomplete days and unavailable future weather are errors. Representative or illustrative weather must be chosen explicitly. A TMY file without February 29 cannot supply a leap-year analysis.

Per-cell irradiation is summed across the period. Relative sunlight is `100 × sum(received irradiation) / sum(open-field GHI)`, so it is energy weighted. DLI and open-field DLI are **mean daily** values over all selected days. Polar-night days contribute zero energy; an entirely dark period cannot yield a relative-sunlight result. Daily and monthly tables summarize receiver-area means, with period totals for irradiation. Full daily values at every receiver are not retained. ZIP projects include these summaries, dated weather and the aggregate receiver map.

The worker emits a checkpoint after each completed day. Cancel stops calculation and pending weather downloads; Resume uses completed days while the page stays open. Checkpoints are not persisted or exported. Geometry, weather and optical edits invalidate results/resume identity; field sensor/crop edits do not.

## Browser limits

The existing 20,000 numerical-receiver cap remains. Periods are limited to 366 days. A transmitting visibility matrix uses two bytes per receiver/direction: about 92.2 MB at 20,000 receivers and 2,305 patches, before geometry, renderer, worker and result overhead. GPU dispatches batch 256 receivers, but the complete count array still occupies memory. Cache entries above 4 MiB are skipped; memory cache is capped at 32 MiB/16 entries. Daily engines are currently recreated, with bounded visibility-cache reuse across days. Large tracking or annual designs can therefore be much slower than small fixed arrays.

[Earlier daily performance measurements](BROWSER-PERFORMANCE.md) used opaque version-0.3.0 geometry. They do not establish annual/transmission maximum capacity. Follow-up [monthly/annual bifacial performance tests](BIFACIAL-PERIOD-PERFORMANCE.md) now include realistic receiver grids and maximum module count. Neither those bounded tests nor the small-case timings below establish universal browser limits or guaranteed runtimes.

## Verification actually performed

- **81 automated tests pass.** Added tests cover schema migration and cell fitting, crossing areas, oblique/edge/corner intersections, multiple-module attenuation and opaque supports, independent broadband/PAR conservation, leap and cross-year calendars, period aggregation and checkpoint resume, full-year polar-night handling, fractional-offset weather chunks, missing dates, hashes, dated CSV, project round trips and period report labeling.
- **Actual browser CPU/WebGPU parity:** five racking types, 45 receivers each, transmitting modules, separate broadband/PAR factors. Maximum per-receiver Wh, DLI and relative-sunlight differences were zero. Explicit centre/edge/corner/support intersection counts also matched. Raw evidence: [transmission-period-validation.json](transmission-period-validation.json); repeatable fixture: `validation/extensions.html`.
- **Full leap-year browser worker:** all 366 days and 12 monthly summaries on a one-receiver transmitting CPU fixture completed in 2.120 s and passed saved-result validation. This tiny case is not an annual capacity benchmark.
- **Live interface:** selected bifacial construction, changed X gaps and observed linked transmission and the module pattern; selected a November–March cross-year season and a calendar year. A complete February 2025 run with 96 modules, 84 receivers, 145 patches, 15-minute integration and synthetic weather finished using WebGPU in 1.3 s. The heatmap, period/DLI labels and exported methods report were inspected. Python's ZIP reader found no CRC errors and independently verified all 14 file hashes in the 15-file exported project. This report inspection exposed a legacy opaque-module label, now corrected with a regression assertion. The browser-exported calculation was also restored and validated in Node. Synthetic weather is rounded to micro-W/m² precision so inconsequential cross-runtime math-library differences do not invalidate its weather hash.
- **Independent scalar transmission comparison:** installed Radiance 5.3, 32 rays across one/two module planes, scalar transmittances 0/0.2/0.8/1, missed modules and opaque supports. Maximum absolute throughput difference was 1.11e−16. `npm run validate:transmission`; [raw evidence](transmission-radiance-validation.json). This tests a deliberately simple constant-transmission contract, not cell-resolved optics or independent daily irradiance.
- **Original opaque Radiance oracle:** 45,990 rays, nine geometric cases, zero visibility mismatches. Build and 480-file frozen archive verification pass.

Large annual arrays, multi-device memory pressure, broad browser accessibility/printing, independent sky/solar/period integration and measured-field comparisons remain validation limitations.
