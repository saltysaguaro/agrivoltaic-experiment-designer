# Bifacial monthly and annual browser performance

Measured September 11, 2026, application version 0.4.0. These are actual browser-worker calculations, not extrapolations from a single day. [Primary recorded observations](bifacial-period-performance.json) and [CPU follow-up](bifacial-period-performance-cpu.json) accompany the repeatable fixture at `validation/period-performance.html`.

## Results

All cases enabled bifacial transmission. The monthly period is June 2024, including all 30 days; annual calculations include all 366 days of 2024. Default sky resolution is 577 patches with 10-minute direct integration. Times include worker calculation and checkpoint/result transfer, but exclude weather download, worker module loading, full application drawing and export.

| Modules | Receivers | Rack / requested engine | Full month | Full year |
| ---: | ---: | --- | ---: | ---: |
| 96 | 735 | Fixed / CPU | 1.42 s | 12.85 s |
| 96 | 735 | Fixed / WebGPU | 4.11 s | 43.91 s |
| 250 | 5,040 | Fixed / WebGPU | 37.38 s | Stopped at 120 s: 171/366 days |
| 250 | 5,040 | Fixed / CPU | 83.25 s | Stopped at 120 s: 45/366 days |
| 2,000 | 19,068 | Fixed / WebGPU | 81.47 s | Stopped at 120 s: 51/366 days |
| 48,000 | 19,152 | Fixed / WebGPU | 114.30 s | Not run |
| 250 | 1,044 | Single-axis / WebGPU | 24.84 s | Stopped at 120 s: 181/366 days |

At **2,305 sky patches**, the 250-module / 5,040-receiver fixed WebGPU month took **40.66 s**, compared with 37.38 s at 577 patches. This is one measured pair, not a general scaling law.

The 96-module WebGPU warm repeats took 4.12 s for the month and 56.09 s for the year, versus 4.11 s and 43.91 s cold. Repeating a run did not guarantee a speedup; these are single observations, with no confidence interval or controlled thermal/background-load study.

A timeout means the benchmark deliberately terminated an unfinished worker. It is **not** a browser crash, failed scientific calculation, maximum supported system size, or measured full-year duration. Larger annual runs may finish with more time; these tests do not establish how long all of them require.

## Practical implications

- **Small grid:** CPU was faster for the 96-module / 735-receiver case, including its complete year. Selecting CPU reference is a reasonable choice for similar small studies on this tested browser.
- **Denser grid:** WebGPU was faster at 250 modules / 5,040 receivers. The monthly CPU run took about 2.2 times as long. The small-case CPU advantage should not be generalized to large receiver grids.
- **Near the receiver cap:** A full month completed with 19,068 receivers and 2,000 modules, and with 19,152 receivers and the schema maximum of 48,000 modules. This establishes numerical completion for those cases, not responsive editing/rendering/exporting at maximum size.
- **Annual work needs more time:** Dense and tracking annual cases exceeded two minutes. Coarser numerical receivers and lower sky resolution are available accuracy/performance tradeoffs; users should check spatial and sky convergence for their study.
- **No new universal cap follows from these measurements.** The existing 20,000-receiver and 48,000-module limits remain. Module count, receiver count, rack motion, sky resolution, source period and cache behavior all affect runtime.

## Cache and responsiveness observations

This fixture uses the application's actual `getCached` / `putCached` implementation, including IndexedDB, the 4 MiB per-entry admission limit and bounded memory cache. Each cold case starts with an empty numerical cache in the dedicated benchmark origin; days within the period may reuse visibility normally. It does not use the more generous unbounded cache of the earlier daily-only performance fixture.

The 735-receiver / 577-patch count matrix was **848,190 bytes**, below the admission limit: the month had one miss and 29 hits; the year had one miss and 365 hits. The 5,040-receiver matrix was **5,816,160 bytes**, above the limit: the month had 30 misses, 30 skipped writes and zero hits. The maximum-array matrix was **22,101,408 bytes**, also skipped. The smaller tracker matrix was **1,204,776 bytes** and its monthly run recorded 33 misses and 813 hits across changing poses.

These counters identify a material scaling boundary: increasing receiver count can eliminate across-day diffuse-visibility reuse. They do not isolate how much elapsed time each component consumes. Source inspection also confirms that the current period engine creates/disposes a daily compute engine, and GPU dispatch overhead can outweigh benefits on small grids. Reusing engines across days and revisiting large-matrix caching are candidates for future measured optimization; no solver optimization was made in this task.

For the 48,000-module monthly worker run, a main-page heartbeat scheduled every 50 ms had a 51.10 ms 95th-percentile interval and 53.10 ms maximum across 2,285 samples. This supports responsiveness of the minimal benchmark page during that solve. It does not measure camera interaction, receiver-map rendering or large publication output. Browser-reported page JS heap is a limited proxy; peak total browser/worker/GPU memory and out-of-memory capacity were not measured.

## Numerical checks and scope

The harness invokes the ordinary saved-result validator after each completed run; validation time is excluded from the timing. The retained primary observations include explicit passing validation for the monthly GPU cases, including the largest system and fine-sky case. Both small CPU and GPU results were also compared receiver by receiver: the month matched exactly; annual maximum differences were **5.16825 Wh/m²** (0.00517 kWh/m²) of period irradiation, **0.000103 mol/m²/day** DLI and **0.000271 percentage points** of relative sunlight. These comparisons share the model's solar and sky implementation and do not establish independent field accuracy.

Broadband effective module transmission was **11.7529%**, and PAR transmission **10.4470%**: 6 × 12 fitted cells, 20 mm internal X gaps, 10 mm Y gaps, 10 mm opaque perimeter, and laminate broadband/PAR factors 0.9/0.8. Outer dimensions remained 1.134 × 2.278 m. This exercises the area-averaged module-transmission path; it does not model cell-gap sunflecks or electrical bifacial yield.

Synthetic Tucson weather uses latitude 32.22°, longitude −110.97° and UTC −7. No Open-Meteo download speed, measured-weather performance, multiple years or other climate/rack combinations were tested here. The model and tests were not changed to improve timings.

## Environment, evidence and reproduction

The real in-app Chromium browser reported Chrome 152 on macOS, 12 logical processors and 32 GiB device memory. The queried WebGPU adapter reported vendor `apple`, architecture `metal-3`, and no fallback adapter; the exposed description/device strings were blank. This is not an independent hardware inventory. The earlier daily benchmark identified an Apple M2 Pro through WebGL, but this run did not independently query that chip label. No cross-browser or low-memory-device qualification is implied.

Run `npm run dev -- --port 5175 --strictPort`, open `http://127.0.0.1:5175/validation/period-performance.html`, choose a suite, and select **Run period benchmarks**. Port 5175 is deliberately separate from the normal application origin: the fixture clears only its numerical visibility database before each cold case. It never reads or writes sensor/crop layouts. A fresh worker starts each case, and cases are sequential. The standard suite has twelve cases and two warm repeats; the CPU follow-up has two cases. Each solve has a 120-second budget and can also be stopped manually. Data are displayed as JSON, retained in benchmark session storage, and available through **Download results**.

The primary JSON is a compact transcription of fields retained in browser-tool observations; its attempted complete download was not retained. Fields not captured are omitted, rather than reconstructed as measurements. In particular, GPU table labels identify the requested engine with CPU fallback permitted; the complete baseline observations confirm `WebGPU BVH`, and large-case progress also reported WebGPU. The CPU follow-up retains its full displayed report. Neither file is a statistical performance dataset.
