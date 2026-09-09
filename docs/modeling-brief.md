The best strategy is to treat `agrivoltaic-experiment-designer` as a **research design application with three independent layers**: a hierarchical parametric design model, a deterministic irradiance engine, and a publication/report layer. The existing `agrivoltaic_bf` code is a useful baseline because it already separates Three.js scene/system geometry, ground heatmaps, crops, state, shared schemas, and export/simulation logic.

The main thing I would **not** do is incrementally bolt WebGPU irradiance and more controls onto the current UI. The current state starts with whole-system/DC-capacity inputs and mixes module, racking, row spacing, crop, and visualization parameters in the same workflow.   I would refactor the domain model and workflow first, while reusing the underlying geometry code.

# 1. Target architecture

I would structure the application conceptually as:

```text
RESEARCH STUDY
│
├── Design definition
│   ├── Module
│   ├── Racking
│   ├── PV table / row
│   ├── Row pair / spacing
│   └── Full array
│
├── Environmental definition
│   ├── Site
│   ├── Weather
│   └── PAR assumptions
│
├── Irradiance engine
│   ├── WebGPU          ← preferred
│   └── CPU BVH         ← fallback + reference
│
├── Experimental design
│   ├── Physical sensors
│   └── Crops / plots / treatments
│
└── Publication output
    ├── Methods tables
    ├── Orthographic figures
    ├── Shade maps
    ├── DLI maps
    └── Reproducibility metadata
```

Three.js remains the interactive renderer, but it should **not be the data model**. The data model generates Three.js geometry; the same data model also generates the irradiance geometry, dimensions, tables, and publication figures.

That separation is critical for reproducibility.

---

# 2. Redesign the project state before redesigning the UI

The current application has one mostly flat state object containing things such as `moduleWidth`, `systemType`, `rowSpacing`, `cropBedsPerRow`, etc.

Replace that with a versioned research-study schema roughly like:

```text
Study
├── metadata
│   ├── title
│   ├── investigator
│   ├── schemaVersion
│   └── units
│
├── module
│   ├── width
│   ├── length
│   ├── thickness
│   ├── ratedPower
│   └── moduleGap
│
├── racking
│   ├── type
│   ├── tilt / tracking rules
│   ├── axisHeight
│   ├── clearance
│   └── structural geometry
│
├── table
│   ├── modulesHigh
│   ├── modulesWide
│   ├── portraitLandscape
│   └── gaps
│
├── row
│   ├── tablesPerRow
│   └── tableSpacing
│
├── rowPair
│   ├── pitch
│   ├── clearSpacing
│   └── crop/maintenance buffers
│
├── array
│   ├── rowCount
│   ├── rowGroups
│   ├── azimuth
│   └── perimeterBuffers
│
├── site
│
├── analysis
│
├── experimentSensors[]
│
├── crops[]
│
└── reportSettings
```

Keep all stored dimensions internally in SI. Unit choice should be purely display formatting.

Also add `schemaVersion` and migrations from the beginning. A paper published in 2028 should be able to reopen a 2026 study without interpretation changing silently.

---

# 3. Make geometry hierarchical

This should mirror the user's conceptual workflow.

## Step 1 — Module

The right panel shows only one module, orthographically.

Inputs:

* length
* width
* thickness
* rated DC power
* frame
* cell/module transparency if relevant
* default intermodule gap

Display:

* front elevation
* side elevation
* dimensions
* module area

No array yet.

## Step 2 — Racking

Put that module onto the chosen support system.

Racking types should be extensible:

* fixed tilt
* single-axis tracker
* dual-axis tracker
* vertical bifacial
* raised/pergola fixed
* raised/pergola tracking
* eventually custom

The baseline already has separate archetype implementations for fixed tilt, single-axis tracking, pergola, and vertical bifacial, so those files are a good starting point rather than something to discard.

Add dual-axis later through the same archetype interface rather than adding `if (dualAxis)` throughout the application.

## Step 3 — PV table / row element

Build the repeated module assembly.

Show:

* module orientation
* 1P/2P/etc.
* modules along row/table
* module gaps
* torque tube
* post/rack locations
* total projected width
* total length

## Step 4 — Two adjacent rows

This should be a dedicated step because it is the most important agrivoltaic spatial relationship.

Show a large **orthographic cross-section**.

Inputs:

* row pitch
* edge-to-edge clearance
* crop setback
* maintenance zone
* tracker maximum rotation
* backtracking rules
* height

This step should visually answer:

> “What usable experimental/agronomic space exists between these two rows?”

## Step 5 — Full system

Only now ask:

* number of rows
* row length / number of tables
* array groups
* aisle gaps
* perimeter buffers
* system azimuth

Show both:

* plan/nadir view
* standardized profile view

The existing code already has row- and array-level nadir view concepts, although it currently uses a perspective camera.

---

# 4. Switch to orthographic rendering early

The baseline currently creates a `PerspectiveCamera`.

Replace the primary designer camera with `OrthographicCamera`.

I would support standardized view modes:

```text
Module front
Module profile

Rack/profile
Rack/front

Row plan
Row profile

Row-pair profile

Array plan
Array profile

Irradiance plan

Experiment plan
```

Pan and zoom remain enabled.

Rotation should be disabled in the standardized views. Optionally provide an **Inspect in 3D** button that temporarily switches to an oblique/orbit view, but it should not be the primary design representation.

This has a second benefit: the interactive view starts looking like the eventual Methods figure immediately.

---

# 5. Separate rendering geometry from scientific geometry

This is essential.

Three.js can render:

* glass effects,
* textures,
* frame bevels,
* labels,
* crops,
* sensor icons.

The irradiance engine should receive only:

```text
Occluding geometry
├── PV module surfaces
├── frames
├── torque tubes
├── posts
└── other structures
```

Not:

```text
sensor icons
labels
dimension arrows
heatmap
crop graphics
ground visualization grid
```

The existing exporter is already moving in the right direction: it triangulates Three.js meshes, applies world transforms, and exports the real finite scene geometry.

Create a dedicated:

```text
SimulationGeometryBuilder
```

that produces a merged indexed `BufferGeometry` directly in memory.

Do not serialize to OBJ just to feed it back into the browser solver.

---

# 6. Make the analysis grid distinct from physical sensors

This is an important architectural change.

The existing application uses the concept of “sensors” partly to mean irradiance calculation points/grids.

For the new application these must be different concepts.

### `ReceiverGrid`

Invisible numerical sampling locations used to calculate:

* irradiance
* shade
* DLI

Potentially tens or hundreds of thousands of points.

### `ExperimentSensor`

A physical instrument that the researcher intends to install:

```text
PAR sensor
pyranometer
soil moisture
soil temperature
soil moisture + temperature
air temperature / RH
weather station
anemometer
rain gauge
leaf temperature
custom
```

Each physical sensor should have:

* ID
* type
* X/Y/Z
* depth if below ground
* orientation if relevant
* treatment/replicate
* row-relative position
* manufacturer/model, optional
* logger/channel, optional
* notes

That distinction will prevent major design problems later.

---

# 7. Irradiance engine architecture

Use one API:

```text
IrradianceEngine

initializeGeometry()
calculateDay()
calculateInstant()
cancel()
dispose()
```

with two implementations:

```text
WebGpuIrradianceEngine
CpuBvhIrradianceEngine
```

Runtime selection:

```text
navigator.gpu available?
        │
       yes
        ↓
      WebGPU
        │
        └─ failure → CPU BVH

no ───────────────→ CPU BVH
```

WebGPU is appropriate here because it provides general-purpose GPU compute and can operate from Web Workers. GitHub Pages supplies HTTPS, satisfying WebGPU's secure-context requirement. ([MDN Web Docs][1])

The CPU implementation should use `three-mesh-bvh` and `raycastFirst`/first-hit logic. The library explicitly supports accelerated ray intersection and worker-side BVH construction. ([GitHub][2])

---

# 8. One dependency issue should be addressed immediately

The copied project's `package.json` currently uses Three.js `^0.161.0`.

The new official `three-mesh-bvh/webgpu` `BVHComputeData` API requires **Three.js r185 or newer**, and its authors currently mark that WebGPU API as unstable.

Therefore I would make an early infrastructure milestone:

> **Upgrade Three.js deliberately to ≥ r185 and pin Three.js + three-mesh-bvh together.**

Do this before the large UI rewrite.

Add render/geometry regression tests first so you can tell what the Three upgrade changes.

Then place all GPU-specific `three-mesh-bvh` usage behind your `WebGpuIrradianceEngine`. Because its WebGPU API is explicitly unstable, nothing outside that adapter should know about it.

---

# 9. Optimize specifically for your outputs

You do **not** need hourly irradiance maps to obtain daily shade and DLI.

This is the biggest optimization in the entire project.

## Diffuse radiation

Use a Perez sky divided into discrete patches.

I would offer:

* Preview: 145 patches
* **Standard: 577 patches**
* High: 2,305 patches

Radiance's `gendaymtx` similarly uses Perez all-weather sky patches; its default is 145 and Reinhart subdivision can increase this to 2,305. ([Radiance Online][3])

For each ground receiver, calculate which sky patches are visible.

Because your first implementation has opaque structures:

```text
visible / blocked
```

is binary.

So **do not store a Float32 coefficient for every receiver × sky patch**.

Store a bitset.

For 100,000 receivers × 577 directions:

```text
Float32 matrix ≈ 231 MB
binary bitset  ≈   7 MB
```

That's a major improvement for browser memory and IndexedDB caching.

---

# 10. Aggregate the sky before applying it to the ground

Because you care about daily quantities:

For each day first calculate the integrated energy originating from each sky patch:

```text
daily broadband sky patch energy[p]
daily PAR sky patch energy[p]
```

Then apply the visibility bitset once.

Conceptually:

```text
WEATHER TIMESTEPS
      ↓
Perez skies
      ↓
sum by sky direction
      ↓
one daily sky vector
      ↓
visibility matrix
      ↓
daily diffuse energy everywhere
```

Instead of:

```text
24 or 288 separate full ground maps
```

This should make the diffuse calculation extremely fast.

---

# 11. Handle direct solar radiation separately

Direct shadows change continuously with sun position.

For each ground point:

```text
receiver ───────────► sun

does finite array geometry intersect ray?
```

If yes, direct beam is blocked.

For hourly weather I would nevertheless use smaller solar-position steps—perhaps a 5–15 minute configurable interval—because an hourly hard shadow can alias badly around PV edges.

But preserve energy:

```text
hourly direct-beam energy
          ↓
divide/weight across solar substeps
          ↓
visibility at each substep
          ↓
sum
```

Therefore subdividing time improves shadow geometry **without inventing extra solar energy**.

---

# 12. Guarantee that the open-field answer equals GHI

This is a very important numerical requirement.

For every weather timestep, construct the sky such that:

```text
horizontal direct
+
horizontal diffuse
=
GHI
```

exactly within numerical tolerance.

Similarly, normalize the discrete Perez sky so:

$$
\sum_p E_{diffuse,p}=DHI
$$

for an unobstructed horizontal receiver.

Then:

$$
\text{daily shade}(x)
=
100
\left[
1-
\frac{H_\text{ground}(x)}
{H_\text{open}}
\right]
$$

with:

$$
H_\text{open}=\int GHI(t)\,dt
$$

An empty scene must therefore produce:

```text
0.000% shade
```

everywhere.

That should be an automated test.

---

# 13. DLI should reuse exactly the same geometry

Do not ray trace twice.

The visibility is wavelength-independent for opaque panels/racking.

You simply apply another source vector:

```text
same direct visibility
same sky visibility
        │
        ├── broadband weights → Wh/m² → percent shade
        │
        └── PAR weights       → PPFD → DLI
```

There should be two DLI data modes.

### Preferred

User provides measured/modelled PAR or PPFD data.

### Default

Estimate PAR from broadband weather data.

A sensible default is to implement the published Spitters diffuse-PAR relationship, which pvlib explicitly exposes for agrivoltaic applications. ([Pvlib Python][4])

When broadband data are being converted rather than actual PAR being supplied, label the output:

**Estimated DLI**

and include the conversion method in the Methods report.

pvlib's own agrivoltaic example emphasizes that broadband radiation and PAR are different quantities and gives an approximate broadband→PAR workflow rather than treating them as interchangeable. ([Pvlib Python][5])

---

# 14. Weather must also be browser-first

Because this is GitHub Pages, do not design the core workflow around a secret NSRDB API key.

Use:

1. upload TMY3
2. upload EPW
3. upload a simple CSV containing timestamp/GHI/DNI/DHI
4. bundled sample weather data
5. optionally public browser-callable weather APIs
6. optionally user-supplied API credentials stored only locally

The study should retain the weather source and preferably a hash of the weather data.

That makes a published experiment reproducible even if an external API later changes.

---

# 15. Cache the expensive geometry work

Use IndexedDB.

Cache key should include:

```text
engine version
geometry hash
receiver-grid hash
sky-patch scheme
tracker pose
```

For example:

```text
irr-v2:
sha256(geometry):
grid-0.25m:
reinhart-577:
fixed
```

Then changing:

* date
* weather
* crop
* sensor layout
* report settings

does **not** require recomputing sky visibility.

Only actual structural geometry changes invalidate the BVH/visibility cache.

---

# 16. Tracking deserves a pose abstraction

Do not make the irradiance engine know what a “single-axis tracker” is.

Give every racking system:

```text
getPose(time, solarPosition)
```

Fixed system:

```text
always same transform
```

SAT:

```text
one rotation angle
```

Dual-axis:

```text
two rotations
```

For diffuse calculations cache quantized poses.

For SAT, for example:

```text
-60°
-58°
...
0°
...
+58°
+60°
```

The expensive diffuse visibility matrix is then reused whenever a tracker returns to the same angle bin.

Direct-beam geometry can use the exact pose.

Dual-axis can use the same abstraction with a two-angle cache.

---

# 17. Build physical sensor placement *after* the irradiance result

This is where the application becomes much more scientifically useful than a generic PV designer.

Once the heatmap exists, expose tools such as:

### Manual placement

Click/drop a sensor.

### Row-relative placement

```text
2.0 m east of Row 3 centerline
0.15 m depth
```

### Light-treatment placement

For example:

```text
Place PAR sensors near:
10th percentile DLI
25th percentile DLI
median DLI
75th percentile DLI
90th percentile DLI
```

### Spatial treatments

```text
edge
interior
under module
between rows
near post
control outside array
```

### Replicate

Generate matched replicate positions across rows.

That directly supports standardized experimental designs.

---

# 18. Crop placement should also consume the DLI map

Likewise, crop placement comes **after** irradiance.

Researchers should be able to draw:

* crop rows
* beds
* plots
* blocks
* treatments
* control areas

and immediately receive:

```text
mean DLI
median DLI
DLI SD
min/max
mean shade %
shade variability
```

for every experimental plot.

That is far more useful than drawing individual plants.

Individual plants can remain an optional visualization.

---

# 19. Publication output should not just be Three.js screenshots

For the final Methods output, I would generate **canonical SVG figures**.

Three.js should remain the interactive visualization.

But publication drawings should come from the underlying dimensions/coordinates:

### Figure 1 — Array plan

* orthographic
* north arrow
* scale bar
* row numbers
* array dimensions
* crop plots
* physical sensors

### Figure 2 — Array cross-section

* PV height
* tilt
* row pitch
* module dimensions
* crop zone
* sensor locations

### Figure 3 — Relative shade

* plan-view heatmap
* fixed legend
* system outline
* sensors
* scale bar

### Figure 4 — DLI

Same standardized format.

### Figure 5 — Experimental design

* crop treatments
* sensor types
* replicate labels

SVG gives publication-quality vector lines/text. The heatmap itself can be an embedded raster layer inside the SVG while dimensions, outlines, sensors, labels and scale bars remain vector.

Also export:

* SVG
* high-resolution PNG
* CSV
* project JSON
* printable HTML

Then use print CSS so the browser itself can generate a PDF with **Print → Save as PDF**, remaining fully GitHub-Pages-compatible.

---

# 20. Generate Methods tables automatically

At minimum:

**Table: PV module**

| Variable          | Value |
| ----------------- | ----: |
| Module dimensions |     … |
| Rated power       |     … |
| Orientation       |     … |

**Table: racking**

Tilt, axis height, tracking method, rotation limit, backtracking, etc.

**Table: array**

Rows, tables/row, pitch, azimuth, footprint, buffers.

**Table: irradiance model**

This one is particularly important:

```text
Solver: WebGPU BVH
Fallback: CPU MeshBVH
Sky model: Perez
Sky subdivision: Reinhart 577
Direct integration interval: 10 min
Receiver resolution: 0.25 m
Weather source: ...
PAR model: ...
Reflection model: none / ...
Software version: ...
```

**Table: physical sensors**

Sensor ID, type, coordinates, row-relative position, height/depth.

**Table: crop plots**

Plot ID, crop, treatment, area, mean DLI, mean shade.

This substantially improves reproducibility.

---

# 21. Keep Radiance as your scientific oracle

Do not throw away the existing native solver.

The copied architecture already contains a real Radiance workflow using the actual finite Three.js geometry and `rtrace`.

It should become the **validation system**, not the production Pages solver.

Construct automated reference cases:

```text
single module

one finite row

two rows

4 × 5 array

array corner

array edge

array center

vertical bifacial

single-axis tracking

pergola
```

For each compare:

```text
WebGPU
CPU BVH
Radiance
```

for:

* direct irradiance
* diffuse irradiance
* daily irradiation
* percent shade
* DLI-derived values

This is how you establish whether you actually need reflected radiation or a denser sky discretization.

---

# 22. Start without multi-bounce reflection

For version 1 of the browser solver I would model:

**direct sun + anisotropic diffuse sky + complete finite 3D occlusion**

but not multi-bounce reflection.

Then compare against Radiance.

If the difference is scientifically significant, add a second-order correction later.

That is much better than beginning with a complex path tracer before knowing whether reflection matters enough for your output variables.

The report should explicitly state whether reflected irradiance is included.

---

# 23. Recommended implementation order

I would execute the project in this sequence:

| Phase  | Work                                        | Exit criterion                           |
| ------ | ------------------------------------------- | ---------------------------------------- |
| **0**  | Freeze baseline + regression tests          | Current designer reproducible            |
| **1**  | Upgrade Three.js + add `three-mesh-bvh`     | Existing geometry still correct          |
| **2**  | Versioned hierarchical study schema         | No UI depends on old flat state          |
| **3**  | Orthographic workflow                       | Module → rack → row → pair → array works |
| **4**  | Receiver grid + weather + solar/Perez layer | Open field exactly reproduces GHI        |
| **5**  | CPU BVH scientific reference                | Correct finite 3D daily shade            |
| **6**  | WebGPU compute backend                      | Same output as CPU within tolerance      |
| **7**  | DLI/PAR layer                               | Daily DLI maps                           |
| **8**  | IndexedDB visibility caching                | Repeated runs avoid ray tracing          |
| **9**  | Sensor placement                            | Physical experimental sensors            |
| **10** | Crop/plot placement                         | Plot-level DLI/shade statistics          |
| **11** | Publication report                          | SVG figures + tables + print report      |
| **12** | Radiance validation suite                   | Quantified error/convergence             |

Although WebGPU is the **preferred production engine**, I would implement the CPU engine first or in parallel as a correctness reference. That dramatically reduces the difficulty of debugging GPU shaders. The user still experiences WebGPU-first behavior.

---

# 24. Proposed new source structure

Something along these lines would fit the existing project cleanly:

```text
src/
├── domain/
│   ├── studySchema.js
│   ├── defaults.js
│   ├── migrations.js
│   └── derivedGeometry.js
│
├── workflow/
│   ├── workflow.js
│   └── steps/
│       ├── module.js
│       ├── racking.js
│       ├── row.js
│       ├── rowPair.js
│       ├── array.js
│       ├── environment.js
│       ├── irradiance.js
│       ├── sensors.js
│       ├── crops.js
│       └── report.js
│
├── irradiance/
│   ├── engine.js
│   ├── worker.js
│   ├── geometry.js
│   ├── receiverGrid.js
│   ├── solar.js
│   ├── weather.js
│   ├── par.js
│   ├── sky/
│   │   ├── patches.js
│   │   └── perez.js
│   ├── webgpu/
│   │   └── engine.js
│   ├── cpu/
│   │   └── engine.js
│   └── cache.js
│
├── experiment/
│   ├── sensors.js
│   └── crops.js
│
└── report/
    ├── figures.js
    ├── tables.js
    └── report.js
```

The existing `src/systems`, `src/ground`, and Three.js infrastructure can be progressively migrated rather than rewritten wholesale.

---

## The most important design decision

The core scientific data flow should ultimately be:

```text
PARAMETRIC STUDY DEFINITION
           │
           ▼
      EXACT GEOMETRY
           │
      ┌────┴────┐
      │         │
 THREE.JS    SIMULATION
 renderer      mesh
      │         │
      │         ▼
      │    WebGPU / BVH
      │         │
      │    ┌────┴─────┐
      │    │          │
      │ shade        DLI
      │    │          │
      └────┴────┬─────┘
                ▼
       EXPERIMENT DESIGN
        sensors + crops
                │
                ▼
       PUBLICATION REPORT
```

That creates a much stronger project than converting the existing designer into an orthographic UI and subsequently attaching an irradiance calculation. **The study definition becomes the single source of truth**, and visualization, computation, experimental layout, and publication outputs become different views of that same object.

The first concrete engineering move I would make is therefore **not the WebGPU shader**. It would be: lock down the hierarchical `Study` schema, upgrade the Three.js/BVH stack, and refactor the existing geometry builders so they can produce module → rack → row → row pair → full-array representations independently. Once that is stable, the WebGPU/BVH engine has a clean geometry contract to consume.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"
[2]: https://github.com/gkjohnson/three-mesh-bvh "https://github.com/gkjohnson/three-mesh-bvh"
[3]: https://www.radiance-online.org/cgi-bin/viewcvs.cgi/ray/doc/man/man1/gendaymtx.1?pathrev=MAIN&revision=1.18&view=markup "https://www.radiance-online.org/cgi-bin/viewcvs.cgi/ray/doc/man/man1/gendaymtx.1?pathrev=MAIN&revision=1.18&view=markup"
[4]: https://pvlib-python.readthedocs.io/en/stable/reference/generated/pvlib.irradiance.diffuse_par_spitters.html "https://pvlib-python.readthedocs.io/en/stable/reference/generated/pvlib.irradiance.diffuse_par_spitters.html"
[5]: https://pvlib-python.readthedocs.io/en/v0.14.0/gallery/agrivoltaics/plot_diffuse_PAR_Spitters_relationship.html "https://pvlib-python.readthedocs.io/en/v0.14.0/gallery/agrivoltaics/plot_diffuse_PAR_Spitters_relationship.html"
