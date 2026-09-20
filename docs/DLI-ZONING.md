# Zoned DLI

The Irradiance inputs include **Number of DLI zones** (1–10; default 5). After a calculation, select **Zoned DLI** beside Relative sunlight and Estimated DLI. Start with 3–5 zones for exploratory sensor and crop-bed placement. Changing the zone count reuses the current light results; it neither changes the numerical analysis key nor runs the solver. The preference is retained in saved studies and project packages, and older studies default to five.

## Classification

Area-weighted natural breaks minimizes squared differences in DLI within classes. It is preferable here to equal-count quantiles, which can split very similar light levels, or equal-width intervals, which can leave classes empty and miss clusters. The classification uses each receiver's daily DLI, or its mean daily DLI across the complete selected season/year. Irradiance totals are not substituted for mean daily DLI.

For bounded browser cost, assign values to 256 equal-width buckets spanning the observed minimum and maximum, retaining their exact area-weighted first and second moments. A deterministic dynamic program finds the optimal contiguous partition of occupied buckets. This is a histogram approximation to natural breaks: it optimizes over bucket boundaries, not all distinct raw DLI values. Runtime is O(N + K × 256²), where N is receiver count and K is requested zone count. No dependencies, extra ray tracing, spatial smoothing or worker calculation are needed. Classification is cached by result identity and count for shared use by maps and exports.

Cell area weights include the varying widths of row-aligned aisle and perimeter cells. The classification covers the complete receiver footprint including its buffer. IDs increase from low to high DLI. Breaks lie midway between the observed values on either side of a class boundary, with the lower class including its upper boundary. Equal values always share a class. The effective count is capped by occupied histogram buckets; uniform light, including zero light and the full-sun control field, has one class. The legend reports the actual count, observed range, area-weighted mean and percentage of receiver area for each class. Breaks and method are retained in provenance; CSV adds a `dli_zone` column for numerical receivers. Project packages and methods reports include a zoned plan figure; selected SVG/PNG exports use the same classifications and discrete colors.

## Interpretation for experiments

Natural breaks describes numerical light contrasts, not biological importance or statistical significance. Every requested extra class can subdivide a smooth gradient, even if its DLI differences are very small. Check the numeric ranges and means, measured light, and crop-specific response information when selecting treatments. A season-average map can also conceal differences in seasonal timing; it does not establish that cells have similar daily time series.

Zones can have disconnected cells and need not have equal areas or enough space for every bed. Use repeated locations within zones, inspect a proposed bed's light variation, and consider edge effects and other field gradients. No automatic sensor or crop placement is performed. Classification reflects the receiver sampling resolution: a single cell-centre sample is not a cell average. Multiple samples per cell can reduce sensitivity to small local shadows but require recalculation.

Breaks adapt to each map, period and requested count; the same color or zone number on separate maps is not an absolute DLI treatment. Use the numerical ranges when comparing designs, dates or the control field. Fixed, crop-specific thresholds could be a later option when the research question supplies defensible cutoffs.

## Verification (September 20, 2026)

Tests cover clustered values, ties, uniform/zero/empty data, invalid inputs, exact agreement with exhaustive weighted partitions on small fixtures, unequal cell areas, narrow ranges, deterministic 20,000-cell maps, migration, stable analysis keys, legend updates without a new solve, and figure/CSV/project consistency. A local Node benchmark of 25 uncached 20,000-cell classifications with ten zones measured a 2.61 ms median and 12.38 ms maximum; these are local measurements, not device-independent performance guarantees.

Method background: [Esri data classification guidance](https://pro.arcgis.com/en/pro-app/3.0/help/mapping/layer-properties/data-classification-methods.htm).
