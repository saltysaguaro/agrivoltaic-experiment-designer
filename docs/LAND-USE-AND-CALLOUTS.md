# Land-use inputs and publication drawings

The input workflow and exported drawings share ground-zone definitions. These are planning areas, not predicted shadows. They never enter occlusion geometry, mask numerical receiver averages, or trigger a new light calculation.

## Linked crop spacing

| Symbol | Input stage | Definition | Default / bounds |
| --- | --- | --- | --- |
| U | Row spacing | Continuous non-cultivated strip centred beneath each row axis, including table gaps. | 1 m / 0–row pitch |
| S | Row spacing | Signed distance from the projected PV frame edge to the cropping edge, including frame thickness at the displayed tilt. Negative means crops extend beneath PV. | Derived / −projected width ÷ 2 to (pitch − projected width) ÷ 2 |
| C | Row spacing | Cropping width between neighbouring non-cultivated strips. Replaces the former maintenance-lane input. | Derived / 0–row pitch |
| B | Full array | No-crop perimeter buffer outside the design envelope: row length × (row-axis span + untilted assembly width). | 3 m / 0–20 m |
| R | Full array | Independent numerical receiver buffer extending the sampling area from the same envelope. | 3 m / 0–20 m |

The shared equations are **U + C = row pitch** and **S = (U − projected PV width) / 2**. Editing any of U, C or S updates the other two immediately. Changing module geometry, tilt, orientation or rack type preserves U and recomputes S/C; reducing pitch clamps U to pitch if necessary. Extra group aisles add cropping width, and a witness spanning one is labeled C + A with the actual combined distance. U and C share exactly the same ground edges. U = 0 permits cropping across the entire interrow gap; C = 0 removes the regular cropping gap. B remains independent.

Version-1 imports retain their existing U (or acquire its 1 m default) and normalize S/C to these equations. The obsolete independent maintenance value is discarded. Crop and sensor coordinates are retained. Trackers use the displayed pose for planning setback; these zones do not certify swept mechanical clearance. The perimeter envelope remains stable as preview tilt changes.

Zones rotate with the array. Four rectangles form the perimeter ring, including corners. Exact rectangle-union areas prevent double counting of reserved ground. Cropping zones do not count as reservation conflicts. Intersecting plots are reported without moving or deleting them. Receiver means continue to include every numerical cell.

## Input-phase presentation

- Stage overviews show a small set of relevant dimensions. Focusing an input selects its engineering witness, angle arc, instrument/plot outline or contextual note. The key beneath the drawing carries the full explanation.
- Module length/width witnesses follow the actual rotated frame edges. Dimension lines and label boxes sit outside the hardware; default framing reserves screen space for both dimensions in plan, profile and oblique views. Labels avoid the projected hardware envelope and one another.
- Complete valid numeric typing and arrow-key steps update the study, linked inputs and callouts immediately. Incomplete drafts such as a minus sign remain editable; invalid values do not enter the study. Escape restores the current accepted value.
- Labels update on camera motion and resize. Input focus, opacity and layer changes preserve pan, orbit and zoom. Explicit Fit view includes relevant witnesses.
- U uses hatching, C uses dots and B uses a separate hatch color. Interactive ground meshes use depth testing, so modules and racking appear above them. Profiles show a central ground cross-section, excluding side buffer strips.
- The clickable legend toggles modules, racking, ground zones, receiver boundaries, plots and instruments. Array views provide a panel-opacity slider to its right (wrapping below on narrow screens). These preferences are display-only.
- Irradiance has no engineering callouts. A completed calculation initially hides ground zones, receiver outlines, plots and instrument markers, leaving the light map and translucent modules/racking. Legend buttons can reveal each layer. The input panel then collapses to an icon rail and exposes map editing tools. Sensor/crop stages share analysis-layer preferences, reveal existing field items, and replace engineering callouts with selectable item outlines and editable cards. Geometry stages keep their own layer preferences. See [Field layout workspace](FIELD-LAYOUT-WORKSPACE.md).
- Site, weather, solver settings and publication metadata receive context notes rather than invented spatial measurements. Every input retains plain-language help. Callout/metadata changes do not rebuild map cells.

## Publication output

The report uses **Parameter | Value | Parameter | Value** tables grouped into PV geometry, land use and site/calculation/results. Long definitions, source hashes, weather requests, assumptions and validation qualifications use a two-column appendix. Each methods value appears once in this partition; Methods CSV retains the complete two-column record.

Canonical geometry drawings share the zone polygons and callout definitions, with ground drawn beneath hardware. Irradiance/DLI figures omit callouts and default to clean light maps. Standalone SVG/PNG exports follow the current layer visibility and opacity. Provenance, source definitions, instrument keys and crop-reservation overlaps remain available in report/figure metadata and CSV.

## Verification and limits

Regression tests cover linked edits, negative setbacks, geometry changes, clamping, import normalization, unchanged numerical keys/occluders/receivers, zone adjacency/rotation/union areas, frame-edge witnesses across all racks, module label clearance at desktop/mobile sizes in all projections, depth/opacity settings, escaped figures and lossless report-table partitioning. Component integration tests verify immediate typing/arrow updates, linked-field restoration, absent irradiance callouts, post-solve visibility defaults and toggling without another calculation.

Local browser checks include default module plan framing, a 390 × 844 mobile drawing without horizontal document overflow, signed setbacks, physical hardware above ground layers, and a completed 154-receiver synthetic CPU calculation with clean irradiance rendering and interactive cropping/opacity controls. The isolated fixtures in `validation/display.html` and `validation/layout.html` support visual review without altering saved studies. Cross-browser print pagination and dense publication layouts remain release checks. No new independent physical-model validation is implied by these display changes.
