# Bounded browser capacity measurements

Recorded September 11, 2026 with application version 0.3.0. Raw downloaded evidence: [browser-performance.json](browser-performance.json). Reproduce with `npm run dev`, open `/validation/performance.html`, and choose **Run bounded benchmarks**. The fixture is local validation, not part of the production build.

Newer tests of bifacial monthly and annual calculations are recorded in [Bifacial period performance](BIFACIAL-PERIOD-PERFORMANCE.md). The daily measurements below retain their original version-0.3.0 scope.

## Environment and scope

Real Codex in-app Chromium browser, reported Chrome 152 on macOS. WebGL reported `ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)`. Browser-reported logical concurrency was 12 and device memory was 32 GiB; these are exposed browser values, not an independent hardware inventory. The WebGPU adapter itself was not separately identified. All GPU-labeled completed solves reported the actual backend `WebGPU BVH`, with no CPU fallback warning.

Every solve used synthetic Tucson weather for June 21, 2026, a complete daily calculation, and 10-minute direct steps. Sky resolution was 577 patches except for the explicitly labeled 2,305-patch case. Geometry uses ordinary full-sized modules, with clearances repaired through the domain contract. Grid spacing varies to stay below the current 20,000-receiver cap.

The harness starts a fresh worker for each case/backend, waits for imports to finish, runs without cached visibility, and repeats once using the same worker's in-memory visibility cache. Engine setup/geometry/irradiance integration are included in solver time; page loading, worker module imports, network weather downloads, full React rendering and exporting are excluded. The warm cache retains all poses for that case, which is more generous than the production cache's entry limits for dual-axis trackers. No persistent visibility cache or user study storage is touched.

Cases are sequential and have a 30-second per-solve termination budget. This is a bounded probe, not a search for browser crashes or memory exhaustion. A preliminary run was interrupted by the development server reloading after formatting; only the subsequent complete run is archived here. There was one completed cold/warm pair per non-timeout case, not a statistical performance study.

## Fixed arrays

| Modules | Receivers | Nominal grid spacing | Receiver area | WebGPU cold / warm | CPU cold / warm |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250 | 5,040 | 0.572 m | 0.164 ha | 0.196 / 0.138 s | 4.253 / 0.504 s |
| 2,000 | 19,068 | 0.772 m | 1.131 ha | 0.549 / 0.362 s | 22.604 / 2.406 s |
| 10,000 | 19,136 | 1.307 m | 3.247 ha | 0.998 / 0.759 s | Stopped at 30 s / not run |
| 48,000 | 19,152 | 2.819 m | 15.099 ha | 3.309 / 2.911 s | Stopped at 30 s / not run |

The 48,000-module case uses 24 rows × 20 tables × 100 modules, the schema maximum. It demonstrates a daily fixed-array GPU solve at that count on this machine, not responsive operation of every UI/export action at that count. The CPU timeouts are unfinished calculations rather than failures or measured completion times.

## Tracking and sky detail

| Case | Receivers | WebGPU cold / warm |
| --- | ---: | ---: |
| Single-axis, 250 modules, 577 patches | 5,040 | 2.696 / 1.383 s |
| Dual-axis, 250 modules, 577 patches | 5,100 | 5.569 / 1.947 s |
| Fixed, 2,000 modules, 2,305 patches | 19,068 | 1.278 / 0.550 s |

Warm runs reused 26 single-axis and 72 dual-axis diffuse poses. Current production caching is bounded differently, so these warm tracker times are not promised production cache times. Large trackers and CPU tracker performance were not tested here.

Across 18 completed solves, every returned Wh, DLI and sunlight value was finite. The only calculation warnings were the expected synthetic-weather disclosure. Two CPU cases were terminated by the budget. A 50 ms main-page heartbeat never exceeded 52 ms during measured solves, supporting worker responsiveness in this minimal fixture; it is not a full UI latency measurement. Browser warning/error logs were empty. Per-cell CPU/GPU parity was not computed by this performance harness; see the separate existing parity validation.

## Drawing probe

The fixture builds the application's domain module/support meshes and renders a 1,000 × 650 orthographic WebGL scene, pixel ratio 1, for 30 frames after the first render. It excludes React, receiver heatmaps, field labels, land-use layers and figure generation.

| Modules | Draw calls | Geometry build | First render submission | Median frame | 95th-percentile frame |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 250 | 325 | 6.3 ms | 18.1 ms | 8.3 ms | 8.5 ms |
| 2,000 | 2,300 | 21.3 ms | 59.0 ms | 8.3 ms | 8.7 ms |
| 10,000 | 10,300 | 63.6 ms | 212.2 ms | 33.2 ms | 41.7 ms |

Frame pacing was about 120 fps for the smaller scenes and 30 fps for the 10,000-module scene. These are frame intervals in this browser, not isolated GPU execution times. The entire 48,000-module drawing was deliberately not probed.

## Practical interpretation

- GPU acceleration makes large fixed daily cases feasible within the existing receiver cap on this machine. Geometry construction accounted for 2.78 s of the 3.31 s largest cold GPU solve, identifying a useful optimization target.
- CPU fallback can materially change waiting time, especially near the receiver cap. Coarser receivers and fewer sky patches should remain available, with explicit accuracy tradeoffs.
- Drawing can become the bottleneck even when the solver is fast. Module/support instancing or geometry batching is a candidate to test before promising fluid large-array editing.
- Module count alone is an insufficient capacity indicator: receiver count, pose count, sky subdivision, time step, cache behavior and hardware all matter.
- Keep the current limits until broader devices, full UI/export workflows, sustained workloads, memory pressure, large trackers and numerical parity at large scale are measured. This run supplies no universal maximum, annual runtime guarantee or performance claim for transmitting cell models.
