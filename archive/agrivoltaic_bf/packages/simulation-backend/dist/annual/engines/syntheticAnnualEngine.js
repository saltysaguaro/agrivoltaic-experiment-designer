function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function systemTypeFromRequest(request) {
    const serializedSystem = request.serializedConfig?.system;
    const serializedType = serializedSystem && typeof serializedSystem === "object"
        ? serializedSystem["type"]
        : undefined;
    return String(request.designState.systemType ?? serializedType ?? "fixed");
}
function isEdgeLike(classifications) {
    return classifications.some((classification) => classification === "corner"
        || classification === "end_of_row"
        || classification.startsWith("edge_"));
}
function monthlyExposureForSensor(sensor, monthIndex, systemType, weather, classifications) {
    const [, v, w] = sensor.normalized;
    const gapFactor = 1 - Math.abs((v * 2) - 1);
    const heightFactor = w;
    const rowEndFactor = 1 - Math.abs((sensor.normalized[0] * 2) - 1);
    const edgeBonus = isEdgeLike(classifications) ? 0.08 : 0;
    const seasonalGain = 0.85 + (0.18 * Math.cos(((monthIndex - 5.5) / 12) * Math.PI * 2));
    const ghi = weather.monthlyGhiWhM2[monthIndex] ?? 0;
    const dni = weather.monthlyDniWhM2[monthIndex] ?? 0;
    const dhi = weather.monthlyDhiWhM2[monthIndex] ?? 0;
    let directExposure = 0.24 + (0.3 * gapFactor) + (0.22 * heightFactor) + (0.04 * rowEndFactor) + edgeBonus;
    let diffuseExposure = 0.34 + (0.22 * heightFactor) + (0.08 * gapFactor) + (edgeBonus * 0.5);
    if (systemType === "sat") {
        directExposure += 0.16;
        diffuseExposure += 0.04;
    }
    else if (systemType === "raised") {
        directExposure = 0.28 + (0.12 * gapFactor) + (0.24 * heightFactor) + edgeBonus;
        diffuseExposure = 0.46 + (0.18 * heightFactor) + (0.05 * rowEndFactor);
    }
    else if (systemType === "vertical") {
        directExposure = 0.26 + (0.18 * gapFactor) + (0.12 * heightFactor) + edgeBonus;
        diffuseExposure = 0.38 + (0.14 * heightFactor) + (0.04 * rowEndFactor);
    }
    const weighted = (dni * clamp(directExposure * seasonalGain, 0.08, 1.25))
        + (dhi * clamp(diffuseExposure, 0.1, 0.95))
        + (ghi * 0.04);
    return Math.max(0, weighted);
}
function buildSensorAggregate(sensor, systemType, weather, classifications, gridHeight) {
    return {
        sensorId: sensor.id,
        gridId: sensor.gridId,
        position: sensor.position,
        indices: sensor.indices,
        normalized: sensor.normalized,
        heightAboveGroundM: Math.max(0, sensor.localPosition.z + (gridHeight * 0.5)),
        monthlyIrradianceWhM2: Array.from({ length: 12 }, (_, monthIndex) => (monthlyExposureForSensor(sensor, monthIndex, systemType, weather, classifications))),
    };
}
export async function runSyntheticAnnualEngine(input) {
    const systemType = systemTypeFromRequest(input.request);
    const monthlyAggregates = input.exportPackage.grids.map((grid) => ({
        gridId: grid.gridId,
        classification: grid.classifications,
        dimensions: grid.dimensions,
        rowPairId: grid.rowPairId,
        bayId: grid.bayId,
        sensors: grid.sensors.map((sensor) => buildSensorAggregate(sensor, systemType, input.weather, grid.classifications, grid.bounds.height)),
    }));
    return {
        job: input.job,
        exportPackage: {
            exportPackageId: input.exportPackage.exportPackageId,
            analysis: input.exportPackage.analysis,
            manifest: input.exportPackage.manifest,
            grids: input.exportPackage.grids,
        },
        weather: input.weather,
        dataResolution: "monthly_aggregate",
        monthlyAggregates,
        provenance: {
            engine: "synthetic_local",
            generatedAt: new Date().toISOString(),
            notes: [
                "Local fallback engine used monthly weather-driven aggregates rather than dense hourly-per-sensor storage.",
                "Tracker-aware behavior is approximated from the design archetype and seasonal resource shape.",
            ],
        },
    };
}
