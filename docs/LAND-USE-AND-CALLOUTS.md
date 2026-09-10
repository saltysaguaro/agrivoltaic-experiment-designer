# Land-use inputs and publication drawings

The input workflow and exported drawings share one definition of each reserved ground zone. These are design reservations, not predicted shadows. They never enter the occlusion geometry, mask receiver averages, or trigger a new light calculation.

## Inputs and meanings

| Symbol | Input stage | Definition | Default / bounds |
| --- | --- | --- | --- |
| U | Row spacing | Total non-cultivated strip width centred beneath each row axis. Continuous along the row, including table gaps. Set zero to permit cultivation beneath the axis. | 1 m / 0–30 m |
| S | Row spacing | Crop setback outside each actual projected PV frame edge, including frame thickness. Uses the displayed tilt. | Existing 0.5 m / 0–5 m |
| M | Row spacing | Maintenance lane centred between adjacent row axes, including group gaps. | Existing 1 m / 0–5 m |
| B | Full array | No-crop perimeter buffer outside the design envelope: row length × (row-axis span + untilted assembly width). | 3 m / 0–20 m |
| R | Full array | Numerical receiver buffer, independently extending the sampling area from that same envelope. | Existing 3 m / 0–20 m |

U and B are independent `Study.landUse` values. Existing schema-version-1 studies acquire these defaults on import; existing crop and sensor coordinates are retained. There is no assumption that all land beneath PV must be uncultivated: U is an adjustable strip, not the full PV footprint. The buffer definition is stable as preview tilt changes. For trackers, S follows the preview pose; these planning zones do not certify swept mechanical clearance.

Reservations rotate with the array. Four rectangles form the perimeter ring, including corners. Overlapping reservations use an exact rectangle-union area, preventing double counting in the report and crop-overlap notices. Plots are not silently moved or deleted. The user reviews and adjusts any intersecting plots. Receiver means continue to include all numerical cells, including reserved ground.

## Input-phase presentation

- Stage overviews show a small set of relevant dimensions. Focusing any field switches to its engineering witness, angle arc, selected instrument/plot outline, or contextual setting note. A label/value key below the drawing carries the full explanation.
- Module witnesses follow actual rotated frame edges. U, S, M, B and R have distinct symbols. Counts mark the corresponding assembly extent. Sensor height/depth references ground; plot fields outline the selected cell-aligned rectangle.
- Weather, site coordinates, solver settings and publication metadata receive context notes rather than invented spatial measurements. Every field retains its plain-language help.
- Callouts show committed values. Short or edge-on dimensions use witness ticks and leaders without exaggerating scale. Labels update on camera motion and resize. Input focus and ordinary edits preserve pan, orbit and zoom; explicit Fit view includes the selected witness points.
- Hatched/dotted/crosshatched overlays delineate zones even through PV surfaces; dashed blue outlines identify the separate receiver boundary. They remain visible when the display grid is hidden. Profile ground zones show a central cross-section, excluding the side buffer strips that would otherwise project across the whole field.
- Editing a callout or non-spatial metadata does not rebuild map-cell meshes. The mobile drawing jump retains the selected callout.

## Publication output

The main report uses **Parameter | Value | Parameter | Value** tables grouped into PV geometry, land use, and site/calculation/results. Long definitions, source hashes, weather requests, assumptions and validation qualifications move to a two-column appendix. All methods values are retained once in this table/appendix partition; Methods CSV retains the complete two-column record.

Canonical plan, profile and oblique drawings share the zone polygons and callout model used by the interactive view. Report figures use a short caption/footer and retain the instrument key; standalone SVG/PNG figures retain visible provenance, assumptions and definitions. Figure metadata and CSV include the land-use settings. Crop tables and data CSV report intersecting reserved area.

## Verification and limits

Five focused tests cover migration/validation, unchanged occluders and receiver grids, rotated zones, buffer corners, overlap unions, centre-section profiles, actual frame-edge witnesses across all five racks, sensor depth, escaped figures and lossless report-table partitioning. The component integration test also changes U after a daily solve and confirms that results stay valid without another calculation.

Browser checks inspected module and row-stage focus callouts, default/rotated/zero-zone figures, the four-column report, and a 390 px mobile drawing with no document overflow. This is local in-app-browser verification; cross-browser print pagination and long/dense publication layouts still require qualification. No new independent physical-model validation is claimed.
