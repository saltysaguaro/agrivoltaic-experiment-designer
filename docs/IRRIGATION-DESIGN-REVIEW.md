# Irrigation designer review

Reviewed September 28, 2026. This review preceded implementation. The first layout release is now documented in [IRRIGATION.md](IRRIGATION.md); no water-balance model is implemented. Crop-row implementation is separate. Recommendations below distinguish published agricultural considerations from application design decisions.

## Recommendation

Add **Irrigation** beside **Add crop beds** and **Add sensors** in both Agrivoltaic and Control workspaces. Use three geometry types—line, point, area—with irrigation-specific forms. Model a line as one lateral or furrow, a point as one head/emitter, and an area as one basin/border. Keep an irrigation treatment/zone separate from its delivery hardware. A generic sensor-style point cannot faithfully describe all three.

Initial scope should cover surface drip/tape, subsurface drip, individual emitters/bubblers, micro-sprinklers, fixed sprinklers, furrows, and basin/border irrigation. Offer rainfed/no irrigation as a treatment with no hardware. Record custom methods in an explicitly named custom unit. Center-pivot, linear-move and travelling-gun equipment need swept paths and clearance checks; defer their dedicated editors, allowing an annotated custom footprint initially.

## Agricultural considerations

FAO distinguishes localized drip, sprinkler, and surface methods; soil infiltration, slope, wind, crop, water quality, supply and maintenance influence selection. Surface irrigation itself includes basin, border and furrow systems. Therefore the selector should expose those distinctions rather than one ambiguous “flood” setting. [FAO, choosing an irrigation method](https://www.fao.org/4/s8684e/s8684e08.htm)

Drip delivery comprises supply lines, laterals and emitters; emitter spacing is an irrigation choice and should not automatically equal plant spacing. Localized wetting depends on the soil and discharge, so drawing a wetting radius from emitter flow alone would imply unsupported physics. [FAO, drip irrigation](https://www.fao.org/4/s8684e/s8684e07.htm)

PV changes where rainfall reaches soil. Module-edge runoff, erosion and collection/storage are relevant to irrigation planning; a light map does not determine this redistribution. Rainwater collection should be optional source metadata in the initial irrigation designer, with gutter routing and rainfall redistribution reserved for a separate feature. [Fraunhofer ISE, agrivoltaics guideline, §5.5](https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/APV-Guideline.pdf)

## Options and controls

The following geometry, controls and placement behavior are proposed software design choices.

| Method | Unit and drawing | Method-specific inputs | Bulk placement |
| --- | --- | --- | --- |
| Surface drip / tape | Lateral line with sampled emitter marks | Lateral length; emitter spacing, offset and rated flow; tubing model; line offset from crop row | Select beds; one lateral per crop row initially; editable laterals per bed and offsets |
| Subsurface drip | Dashed lateral line | Drip inputs plus burial depth | Same as surface drip; profile includes installation depth |
| Point drip / bubbler | Individual point | Rated flow, model, installation height; optional plant/bed link | Repeat at planting stations or on an editable grid |
| Micro-sprinkler / fixed sprinkler | Head plus nominal sector or circle | Height; rated flow and pressure; nominal radius; arc and bearing; nozzle/model | Rectangular or staggered array; explicit along/across spacing and count |
| Furrow | Directional line | Length, inlet, direction, grade, depth/width, nominal inlet flow | Repeat between crop rows or at user-defined spacing |
| Basin / border / flood | Bounded irrigated area plus inlet | Bounds, basin vs. border subtype, grade, bund height, inlet location/flow, intended applied depth | One area per selected bed or a user-selected rectangle; merge only explicitly |
| Custom | User-selected point, line or area | Name, geometry, optional rated flow and notes | Repeat using the corresponding geometry tool |
| Rainfed / no irrigation | Treatment label only | Treatment, replicate, notes | Assign to selected beds; no dummy hardware |

All units share a stable ID, field, method, zone ID, treatment, replicate, installation status, manufacturer/model and notes. Store coordinates and lengths in metres, pressure in pascals and flow in cubic metres per second. Display practical entry units (L/h, kPa) with explicit conversions. Separate rated values from measured flow; distinguish unknown from zero.

## Interaction

- **Add individual irrigation unit:** choose method, then place a point, draw a line, or define a rectangle. Edit using the existing select/move/duplicate/delete/undo conventions.
- **Add irrigation units:** choose method, select target beds or an area, set count/spacing/offset, then inspect a preview with total units, total lateral length and any fit warnings before applying once. Preserve existing units. Use initial software limits of 500 units per field and 200 visible emitter marks per lateral; those are application limits, not agricultural recommendations.
- **Bed-linked drip:** default to one lateral per crop row; let users choose one or several laterals per bed, independent lateral spacing, or free placement. Preserve a bed ID plus local offsets. Linked units follow bed movement and rotation. Editing crop count previews proposed new/deleted laterals and requires Apply; changing plant spacing never silently changes emitters. Deleting a bed offers explicit delete-linked-units or detach behavior.
- **Location precision:** physical irrigation geometry needs sub-cell offsets. Use receiver cells as anchors, retaining metre offsets; provide snap-to-cell and snap-to-crop-row placement. Bed/receiver boundaries stay authoritative for crop layouts. Do not round irrigation lines to numerical sampling-cell size.
- **Control:** copy units and zone assignments on first initialization, remap bed links to copied control-bed IDs, and allow independent edits afterward. Duplication also remaps links; imports validate missing references.
- **Layers and figures:** use blue solid/dashed lines, distinct head symbols, and hatched surface-irrigation areas. Toggle hardware and nominal coverage separately. Label coverage as nominal; show depth in profiles, and label flow as rated/measured. Keep camera framing across edits.

## Water accounting and scope

Use optional zone-level events: date/time, duration, operating units and planned/measured volume or applied depth. Do not create an implied watering schedule or assign a universal flow/pressure automatically. Geometry gets editable starter dimensions; equipment ratings stay “not specified” until entered. These are safer defaults than an apparently engineered design.

For complete rated inputs, a later version can report nominal delivery as `flow × duration` and nominal depth as `volume / specified treatment area`. Such arithmetic is not infiltration, hydraulic performance, application uniformity, crop water demand or water savings. Overlapping sprinkler sectors must not double-count unique coverage area. A rainfed zone has no delivery events; unspecified irrigation is not rainfed.

First release should provide layout and experimental metadata only. Do not add irrigation glyphs to solar occluders or invalidate numerical irradiance results when irrigation edits occur. A future physical infrastructure model would require explicit geometry and validation. Do not infer water requirements from DLI, apply automatic shade-based irrigation reductions, or claim PV collision avoidance from a plan drawing.

## Integration and acceptance criteria

Add versioned `irrigationUnits` and `irrigationZones` collections to Study and Control with empty defaults for legacy imports. Use a Zod discriminated union so a sprinkler cannot carry a furrow-only geometry. Persist bed/zone references, source metadata and units in JSON/ZIP. Export separate unit, zone and event CSV tables plus a methods table and shared SVG/PNG geometry.

Acceptance tests should cover legacy migration, every method, finite values and sensible geometry, unit conversions, bulk atomicity/limits, references after duplicate/delete/control-copy/import, whole-group undo, rotated and resized arrays, exact offsets independent of grid resolution, exports, and unchanged irradiance keys. Browser checks should cover individual and bulk placement, keyboard editing, layer toggles, mobile layout and retained cameras. Water-model validation is out of scope until a water model exists.

Recommended delivery order: (1) common schema, layers and editing; (2) bed-linked drip and individual emitters; (3) sprinkler heads and nominal coverage; (4) furrow and basin/border areas; (5) optional event accounting. This keeps the common model capable of supporting all requested styles from the start.
