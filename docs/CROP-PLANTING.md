# Crop rows and plant spacing

Spacing catalog version 2026-09-28.1; reviewed September 28, 2026.

Each bed starts with one crop row. `planting.rowCount` is independent of the bed count and receiver-grid rows. Crop rows follow the along-PV-row axis, with equal centre-to-centre spacing across the bed. Plants use an independent centre-to-centre distance along each row. Both spacings can be overridden separately and reset to the stored preset; changing crop species preserves custom values and row count.

## Default evidence

`src/data/crop-spacing.json` explicitly assigns all 426 selectable crop IDs to 95 spacing profiles: 71 entries use published crop guidance and 355 use adapted planning estimates. Each profile records metres, a source, a basis and a production-system note. This is separate from the GBIF taxonomy catalog, which does not supply agricultural spacing guidance.

- **Published crop guidance:** numerical spacings selected from a crop-specific extension table or crop calendar. These are regional production examples, not a universal agrivoltaic standard.
- **Adapted planning estimate:** related-crop analogues, derived arrangements, or assumed within-row spacing. The UI and exports identify these explicitly. An associated citation supports the reference practice, not every extrapolation. Drilled forage/grain positions and rice hills are illustrative planting stations, not a seeding-rate prescription.
- **Placeholder:** only unresolved legacy crops; 0.3 m in each direction is explicitly unverified. Selecting a catalog crop supplies its profile.

Vegetable defaults use the [Alabama Extension row/plant chart](https://www.aces.edu/blog/topics/lawn-garden/planning-for-the-home-garden/). Bed-system adaptations use [UMN production planning](https://extension.umn.edu/vegetable-growing-guides-farmers/crop-and-field-planning-tools-vegetable-farmers). Herb square layouts adapt [UGA plant spacings](https://fieldreport.caes.uga.edu/publications/B1170/herbs-in-southern-gardens/). Orchard layouts use [Mississippi State table 1](https://extension.msstate.edu/sites/default/files/publications/P3410.pdf). Tropical, density-derived and grain references are recorded alongside each profile in the data file. Each source was reviewed for this change; no claim is made that all 426 crops have individually validated agrivoltaic spacing recommendations.

Preset values, version, evidence label, explanatory note and citation are snapshotted into each bed. An imported preset snapshot and explicit numerical values survive round trips. New beds use the current catalog. User-defined values keep the source preset as context, without representing the custom numbers as source recommendations.

## Geometry and validation

Supported values: 1–100 crop rows per bed; 0.001–100 m for each spacing. These are software limits. The row-centre span `(rowCount - 1) × rowSpacing` must be smaller than bed width to keep centres inside the bed. No canopy or implement clearance is implied. Creation and the item editor reject a layout that cannot fit. Later bed/grid resizing preserves requested count and spacing and displays a fit warning rather than silently compressing the layout; row glyphs are omitted while invalid, and exports record the warning.

Planting positions per row are `max(1, floor(bedLength / plantSpacing))`, centred symmetrically. A bed shorter than the spacing holds a single centre position; this does not imply that a mature plant fits. All crop rows are drawn; when total positions exceed 200 per bed, only sampled position dots are drawn. Counts are exact for this layout rule and do not predict plant survival, yield or seeding requirements.

The same domain geometry feeds interactive and publication drawings. Crop rows/dots are display-only: they do not add scientific occluders, modify receiver cells, alter sunlight/DLI statistics or change the analysis key. Existing bed footprints and exact/cell alignment behavior are preserved. Control copies, undo, duplication and exports retain planting metadata. CSV includes explicit row count, both spacings/modes, position count, evidence, preset values and source; methods reports include the full description.
