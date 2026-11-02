# Irrigation and independent design grid

Implemented September 28, 2026, following [the design review](IRRIGATION-DESIGN-REVIEW.md).

In Agrivoltaic or Control, **Add irrigation units** previews a batch before applying it. **Add single irrigation unit** places an editable unit by clicking or dragging onto the field. Lines and rectangles use explicit length, width and bearing inputs rather than a freehand drawing gesture.

Supported methods: surface drip/tape, subsurface drip, individual emitters, bubblers, micro-sprinklers, fixed sprinklers, furrows, basin/flood, border irrigation, and custom points/lines/areas. Rainfed creates a treatment zone with no hardware. Moving equipment (pivot, linear move, travelling gun) can be annotated with custom geometry; swept paths and clearance checking are not modeled.

## Placement and editing

- Select beds to place a lateral per crop row, a custom number of laterals, points at planting positions, or a basin/border per bed. Emitter spacing stays independent of plant spacing.
- Repeat units with along/across count and spacing, optionally staggered. Bulk centres can keep exact metre offsets or snap to design cells. Individual toolbar placement snaps initially; the unit editor supports exact coordinates.
- Linked hardware follows bed position and array bearing, and optionally bed length/area. Crop-row changes retain existing hardware until an explicit replacement is previewed and applied. Duplication remaps copied bed links. Bed deletion offers detach/keep or delete linked units. Undo includes grid, units, zones and links.
- Edit a unit through its blue map label or Find item. Edit zone name, water source, treatment, replicate and notes under Irrigation zones / treatments. Zones can be deleted while retaining unassigned hardware.
- First initialization of Control copies hardware and zones with new IDs and remapped bed references; later edits are independent.
- Unit centres must be in the design grid. Lengths and spray radii can extend outside it; they do not imply boundary containment or PV collision checking.

## Independent grid

Entering the field designer copies current irradiance-grid settings into `designGrid`. Legacy files without this field initially use the numerical grid. **Design grid → Design cells across a PV row** switches to square cells: `side = regular PV centre-to-centre pitch / cell count`. The allowed count is 1–200; custom grids have a 200,000-cell display limit. The copied numerical layout retains its original potentially unequal aisle/boundary cells until customized.

Custom square grid edges align with the first PV row centre and extend the outer footprint by less than one cell. Wider group aisles remain square; later PV centres need not coincide with edges if the aisle width is not a multiple of the cell side. **Copy current irradiance grid** replaces placement settings explicitly. Agrivoltaic and Control may use different design detail.

Grid edits reindex in physical coordinates. Sensors snap to new cell centres, cell-based beds snap their footprint, exact bulk beds retain dimensions and location, and irrigation retains exact metre positions and bed offsets. Subsequent array geometry edits preserve field-grid indices and rotate layouts with the array. Crop light statistics use physical overlap with numerical receivers, not design-grid indices. Irradiance keys and saved results exclude placement-grid and irrigation edits. The numerical receiver boundary remains independently visible.

## Drawing and scientific scope

Blue lines/points and hatched areas share geometry between interactive views and SVG/PNG figures. Subsurface laterals are dashed and show installation depth in profiles. Nominal sprinkler circles/sectors have a separate visibility toggle. Dense emitter dots are sampled to at most 200 per lateral; physical emitter spacing is retained. Crop rows and planting dots remain green, with dense crop dots sampled separately.

Hardware defaults are editable starter dimensions, not engineered recommendations. Flow and pressure default to unknown (`null`), with user-facing L/h and kPa converted to SI m³/s and Pa. Drip line flow is per emitter; other unit flow is per head/inlet. Planned and measured flow are separate. Area grade, bund height, inlet position and intended applied depth are metadata.

There is no hydraulic network, wetting, infiltration, runoff, water-demand, uniformity, irrigation-event schedule or water-balance simulation. Spray coverage is nominal. Neither crops nor irrigation are solar occluders. Soil, wind, pressure, topography and PV interference require separate engineering assessment.

## Persistence and exports

Study schema 2 gains optional version-1 `designGrid` and empty-default version-1 irrigation collections in both fields. Missing references and hardware assigned to rainfed zones are rejected. Software limits are 500 units and 200 zones per field. Exported project JSON/ZIP retains full geometry, ratings, source metadata and bed/zone links. ZIP adds `tables/irrigation-units.csv` and `tables/irrigation-zones.csv`; the general CSV includes irrigation rows, and the printable report includes unit/zone metadata and assumptions. No event CSV is emitted because event accounting is deferred.

Browser preferences retain the design-grid setting, while field hardware, beds and sensors remain session-only until explicitly exported, matching the application's existing layout-save contract.
