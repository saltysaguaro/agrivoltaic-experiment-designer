import { DEFAULT_SENSOR_CONFIG, EPSILON, addVec3, angleBetweenDeg, averageVec3, boundsCenter, boundsCorners, boundsFromPoints, boundsSize, crossVec3, mergeBounds, midpoint, projectPointToAxis, safeNormalizeVec3, scaleVec3, } from "@agrivoltaic/shared";
import { classifyBayEdge, classifyRowPairEdge, mergeGridClassifications, } from "./classification.js";
function median(values) {
    if (values.length === 0)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.5)] ?? sorted[0] ?? 0;
}
function simulationBoundsFor(record) {
    return record.simulationBounds ?? record.bounds;
}
function defaultArrayId(record) {
    return record.metadata.arrayId ?? "array-1";
}
function dominantHorizontalAxis(points) {
    if (points.length <= 1) {
        return { x: 1, y: 0, z: 0 };
    }
    const center = averageVec3(points);
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (const point of points) {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        xx += dx * dx;
        xy += dx * dy;
        yy += dy * dy;
    }
    if (Math.abs(xy) < EPSILON && Math.abs(xx - yy) < EPSILON) {
        return { x: 1, y: 0, z: 0 };
    }
    const trace = xx + yy;
    const determinant = (xx * yy) - (xy * xy);
    const root = Math.sqrt(Math.max(0, ((trace * trace) * 0.25) - determinant));
    const lambda = (trace * 0.5) + root;
    const axis = Math.abs(xy) > EPSILON
        ? { x: xy, y: lambda - xx, z: 0 }
        : xx >= yy
            ? { x: 1, y: 0, z: 0 }
            : { x: 0, y: 1, z: 0 };
    return safeNormalizeVec3(axis, { x: 1, y: 0, z: 0 });
}
function dominantHorizontalAxisFromBounds(bounds) {
    const size = boundsSize(bounds);
    return Math.abs(size.x) >= Math.abs(size.y)
        ? { x: 1, y: 0, z: 0 }
        : { x: 0, y: 1, z: 0 };
}
function averageAlignedAxes(axes, fallback) {
    if (axes.length === 0) {
        return fallback;
    }
    const reference = axes[0] ?? fallback;
    const alignedAxes = axes.map((axis) => alignAxis(axis, reference));
    const averageAxis = averageVec3(alignedAxes);
    return alignAxis(safeNormalizeVec3(averageAxis, fallback), fallback);
}
function groupedHorizontalAxis(records, centroids, keySelector, fallback) {
    const groups = new Map();
    records.forEach((record, index) => {
        const key = keySelector(record);
        if (!key)
            return;
        const group = groups.get(key) ?? [];
        group.push(centroids[index]);
        groups.set(key, group);
    });
    const axes = [...groups.values()]
        .filter((points) => points.length > 1)
        .map((points) => dominantHorizontalAxis(points));
    if (axes.length === 0) {
        return null;
    }
    return averageAlignedAxes(axes, fallback);
}
function inferArrayRowAxis(records, boundsList, centroids) {
    const centroidAxis = dominantHorizontalAxis(centroids);
    const explicitRowAxis = groupedHorizontalAxis(records, centroids, (record) => record.metadata.rowId, centroidAxis);
    if (explicitRowAxis) {
        return explicitRowAxis;
    }
    const explicitBayCrossAxis = groupedHorizontalAxis(records, centroids, (record) => record.metadata.bayId, { x: -centroidAxis.y, y: centroidAxis.x, z: 0 });
    if (explicitBayCrossAxis) {
        const eUp = { x: 0, y: 0, z: 1 };
        const rowAxis = crossVec3(explicitBayCrossAxis, eUp);
        return alignAxis(safeNormalizeVec3(rowAxis, centroidAxis), centroidAxis);
    }
    const moduleAxisVotes = records.map((record, index) => {
        const axis = dominantHorizontalAxisFromBounds(boundsList[index]);
        return axis;
    });
    const averageAxis = {
        x: moduleAxisVotes.reduce((sum, axis) => sum + axis.x, 0),
        y: moduleAxisVotes.reduce((sum, axis) => sum + axis.y, 0),
        z: 0,
    };
    if (Math.abs(averageAxis.x) > EPSILON || Math.abs(averageAxis.y) > EPSILON) {
        return safeNormalizeVec3(averageAxis, centroidAxis);
    }
    return centroidAxis;
}
function alignAxis(axis, reference) {
    const dot = (axis.x * reference.x) + (axis.y * reference.y) + (axis.z * reference.z);
    return dot < 0 ? scaleVec3(axis, -1) : axis;
}
function projectBounds(bounds, origin, eRow, eCross) {
    const corners = boundsCorners(bounds);
    const alongValues = corners.map((corner) => projectPointToAxis(corner, origin, eRow));
    const crossValues = corners.map((corner) => projectPointToAxis(corner, origin, eCross));
    const alongMin = Math.min(...alongValues);
    const alongMax = Math.max(...alongValues);
    const crossMin = Math.min(...crossValues);
    const crossMax = Math.max(...crossValues);
    return {
        alongMin,
        alongMax,
        crossMin,
        crossMax,
        centerAlong: (alongMin + alongMax) * 0.5,
        centerCross: (crossMin + crossMax) * 0.5,
        spanAlong: alongMax - alongMin,
        spanCross: crossMax - crossMin,
    };
}
function groupByRow(modules, config) {
    const allHaveRowIds = modules.every((module) => Boolean(module.record.metadata.rowId));
    if (allHaveRowIds) {
        const grouped = new Map();
        for (const module of modules) {
            const rowId = module.record.metadata.rowId;
            const bucket = grouped.get(rowId) ?? [];
            bucket.push(module);
            grouped.set(rowId, bucket);
        }
        return [...grouped.entries()].map(([rowId, groupedModules]) => ({
            rowId,
            modules: groupedModules,
        }));
    }
    const sorted = [...modules].sort((a, b) => a.centerCross - b.centerCross);
    const tolerance = Math.max(median(sorted.map((module) => module.spanCross)) * 0.8, 0.2);
    const rows = [];
    let current = [];
    let centerCross = 0;
    sorted.forEach((module, index) => {
        if (index === 0) {
            current = [module];
            centerCross = module.centerCross;
            return;
        }
        if (Math.abs(module.centerCross - centerCross) <= tolerance) {
            current.push(module);
            centerCross = current.reduce((sum, entry) => sum + entry.centerCross, 0) / current.length;
            return;
        }
        rows.push({
            rowId: `row-${String(rows.length + 1).padStart(2, "0")}`,
            modules: current,
        });
        current = [module];
        centerCross = module.centerCross;
    });
    if (current.length > 0) {
        rows.push({
            rowId: `row-${String(rows.length + 1).padStart(2, "0")}`,
            modules: current,
        });
    }
    return rows;
}
function representativeModuleSpan(modules) {
    const spans = modules
        .map((module) => module.spanAlong)
        .filter((span) => span > EPSILON)
        .sort((a, b) => a - b);
    return spans[Math.floor(spans.length * 0.5)] ?? 0;
}
function bayBoundsFromSpan(input) {
    const rowVectors = [input.alongMin, input.alongMax];
    const crossVectors = [input.crossMin, input.crossMax];
    const zValues = [input.zMin, input.zMax];
    const corners = [];
    for (const along of rowVectors) {
        for (const cross of crossVectors) {
            for (const z of zValues) {
                corners.push(addVec3(addVec3(addVec3(input.origin, scaleVec3(input.eRow, along)), scaleVec3(input.eCross, cross)), { x: 0, y: 0, z }));
            }
        }
    }
    return boundsFromPoints(corners);
}
function buildDerivedBaySpans(overlapAlongRow, modules, config) {
    const overlapLength = overlapAlongRow[1] - overlapAlongRow[0];
    if (overlapLength <= EPSILON) {
        return [];
    }
    if (config.bayLengthMode === "singleBay") {
        return [{ spanAlongRow: overlapAlongRow }];
    }
    const explicitBayLength = config.bayLengthMode === "fixedLength"
        ? config.fixedBayLength
        : representativeModuleSpan(modules);
    const targetBayLength = explicitBayLength && explicitBayLength > EPSILON
        ? explicitBayLength
        : overlapLength;
    const bayCount = Math.max(1, Math.ceil(overlapLength / targetBayLength));
    const segmentLength = overlapLength / bayCount;
    return Array.from({ length: bayCount }, (_, index) => {
        const start = overlapAlongRow[0] + (segmentLength * index);
        const end = overlapAlongRow[0] + (segmentLength * (index + 1));
        return {
            spanAlongRow: [start, end],
        };
    });
}
function buildBayDescriptors(array, rows, rowModules, config) {
    if (rows.length < 2) {
        return [];
    }
    const bays = [];
    const rowPairCount = rows.length - 1;
    const useSingleBay = config.fullArrayTilingStrategy === "rowPairSingleVolume"
        || config.bayLengthMode === "singleBay";
    rows.slice(0, -1).forEach((row, index) => {
        const nextRow = rows[index + 1];
        const rowPairId = `row-pair-${array.arrayId}-${String(index + 1).padStart(2, "0")}`;
        const overlapAlongRow = [
            Math.max(row.alongMin, nextRow.alongMin),
            Math.min(row.alongMax, nextRow.alongMax),
        ];
        if (overlapAlongRow[1] - overlapAlongRow[0] <= EPSILON) {
            throw new Error(`Rows ${row.rowId} and ${nextRow.rowId} do not overlap along the row axis`);
        }
        const rowPairEdgeLabels = classifyRowPairEdge(index, rowPairCount, array.localFrame.eCross);
        const modules = [
            ...(rowModules.get(row.rowId) ?? []),
            ...(rowModules.get(nextRow.rowId) ?? []),
        ];
        const baySpans = useSingleBay
            ? [{ spanAlongRow: overlapAlongRow }]
            : modules.every((module) => Boolean(module.bayId))
                ? [...new Map(modules.map((module) => [
                        module.bayId,
                        modules.filter((candidate) => candidate.bayId === module.bayId),
                    ])).entries()]
                    .sort((a, b) => {
                    const centerA = median(a[1].map((entry) => entry.centerAlong));
                    const centerB = median(b[1].map((entry) => entry.centerAlong));
                    return centerA - centerB;
                })
                    .map(([, grouped]) => ({
                    spanAlongRow: [
                        Math.max(overlapAlongRow[0], Math.min(...grouped.map((entry) => entry.alongMin))),
                        Math.min(overlapAlongRow[1], Math.max(...grouped.map((entry) => entry.alongMax))),
                    ],
                }))
                    .filter((span) => span.spanAlongRow[1] - span.spanAlongRow[0] > EPSILON)
                : buildDerivedBaySpans(overlapAlongRow, modules, config);
        const bayCount = Math.max(1, baySpans.length);
        baySpans.forEach((span, bayIndex) => {
            const bayEdgeLabels = classifyBayEdge(bayIndex, bayCount, array.localFrame.eRow);
            const classifications = mergeGridClassifications(rowPairEdgeLabels, bayEdgeLabels);
            const centerAlong = (span.spanAlongRow[0] + span.spanAlongRow[1]) * 0.5;
            const centerCross = (row.centerCross + nextRow.centerCross) * 0.5;
            const center = addVec3(addVec3(array.localFrame.origin, scaleVec3(array.localFrame.eRow, centerAlong)), scaleVec3(array.localFrame.eCross, centerCross));
            const crossMin = Math.min(row.crossMin, nextRow.crossMin);
            const crossMax = Math.max(row.crossMax, nextRow.crossMax);
            bays.push({
                bayId: `bay-${rowPairId}-${String(bayIndex + 1).padStart(2, "0")}`,
                arrayId: array.arrayId,
                rowPairId,
                rowIds: [row.rowId, nextRow.rowId],
                bayIndex,
                bayCount,
                center,
                bounds: bayBoundsFromSpan({
                    origin: array.localFrame.origin,
                    eRow: array.localFrame.eRow,
                    eCross: array.localFrame.eCross,
                    alongMin: span.spanAlongRow[0],
                    alongMax: span.spanAlongRow[1],
                    crossMin,
                    crossMax,
                    zMin: Math.min(row.bounds.min.z, nextRow.bounds.min.z),
                    zMax: Math.max(row.bounds.max.z, nextRow.bounds.max.z),
                }),
                spanAlongRow: span.spanAlongRow,
                lengthRow: span.spanAlongRow[1] - span.spanAlongRow[0],
                classifications,
            });
        });
    });
    return bays;
}
function inferArrayContext(arrayId, records, config) {
    const recordBounds = records.map((record) => simulationBoundsFor(record));
    const centroids = recordBounds.map((bounds) => boundsCenter(bounds));
    const eRow = inferArrayRowAxis(records, recordBounds, centroids);
    const eUp = { x: 0, y: 0, z: 1 };
    const eCross = safeNormalizeVec3(crossVec3(eUp, eRow), { x: 0, y: 1, z: 0 });
    const arrayBounds = mergeBounds(recordBounds);
    const arrayOrigin = boundsCenter(arrayBounds);
    const projectedModules = records.map((record) => {
        const bounds = simulationBoundsFor(record);
        return {
            record,
            bounds,
            centroid: boundsCenter(bounds),
            bayId: record.metadata.bayId,
            ...projectBounds(bounds, arrayOrigin, eRow, eCross),
        };
    });
    const groupedRows = groupByRow(projectedModules, config);
    const rowModules = new Map(groupedRows.map((entry) => [entry.rowId, entry.modules]));
    const rows = groupedRows
        .map(({ rowId, modules }) => {
        const rowBounds = mergeBounds(modules.map((module) => module.bounds));
        const rowCenters = modules.map((module) => module.centroid);
        const rowAxis = alignAxis(modules.length > 1
            ? dominantHorizontalAxis(rowCenters)
            : dominantHorizontalAxisFromBounds(rowBounds), eRow);
        const angle = angleBetweenDeg(rowAxis, eRow);
        const tolerance = config.rowParallelToleranceDeg ?? DEFAULT_SENSOR_CONFIG.rowParallelToleranceDeg ?? 5;
        if (angle > tolerance) {
            throw new Error(`Row ${rowId} deviates from the inferred array axis by ${angle.toFixed(2)} degrees`);
        }
        const projection = projectBounds(rowBounds, arrayOrigin, eRow, eCross);
        const centroid = boundsCenter(rowBounds);
        return {
            rowId,
            arrayId,
            moduleObjectIds: modules.map((module) => module.record.stableId),
            centroid,
            localFrame: {
                origin: centroid,
                eRow,
                eCross,
                eUp,
            },
            bounds: rowBounds,
            alongMin: projection.alongMin,
            alongMax: projection.alongMax,
            crossMin: projection.crossMin,
            crossMax: projection.crossMax,
            centerCross: projection.centerCross,
            undersideZ: Math.min(...modules.map((module) => module.bounds.min.z)),
            maxZ: Math.max(...modules.map((module) => module.bounds.max.z)),
            crossDepth: projection.spanCross,
            rowIndex: 0,
        };
    })
        .sort((a, b) => a.centerCross - b.centerCross)
        .map((row, rowIndex) => ({ ...row, rowIndex }));
    const array = {
        arrayId,
        bounds: arrayBounds,
        centroid: arrayOrigin,
        localFrame: {
            origin: arrayOrigin,
            eRow,
            eCross,
            eUp,
        },
        rowIds: rows.map((row) => row.rowId),
        rowCount: rows.length,
    };
    const rowPairs = rows.slice(0, -1).map((row, index) => {
        const nextRow = rows[index + 1];
        const overlapAlongRow = [
            Math.max(row.alongMin, nextRow.alongMin),
            Math.min(row.alongMax, nextRow.alongMax),
        ];
        if (overlapAlongRow[1] - overlapAlongRow[0] <= EPSILON) {
            throw new Error(`Rows ${row.rowId} and ${nextRow.rowId} do not overlap along the row axis`);
        }
        return {
            rowPairId: `row-pair-${arrayId}-${String(index + 1).padStart(2, "0")}`,
            arrayId,
            rowIds: [row.rowId, nextRow.rowId],
            rowIndices: [row.rowIndex, nextRow.rowIndex],
            centroid: midpoint(row.centroid, nextRow.centroid),
            bounds: mergeBounds([row.bounds, nextRow.bounds]),
            centerSpacing: nextRow.centerCross - row.centerCross,
            interRowGap: nextRow.crossMin - row.crossMax,
            overlapAlongRow,
            classifications: classifyRowPairEdge(index, Math.max(rows.length - 1, 1), array.localFrame.eCross),
        };
    });
    return {
        array,
        rows,
        rowPairs,
        bays: buildBayDescriptors(array, rows, rowModules, config),
    };
}
export function inferFullArrayAnalysis(manifest, configInput = {}) {
    const config = {
        ...DEFAULT_SENSOR_CONFIG,
        ...configInput,
    };
    const modules = manifest.objects
        .filter((record) => record.metadata.includeInSimulation)
        .filter((record) => record.simulationRole === "pv_module");
    if (modules.length < 2) {
        throw new Error("Sensor analysis requires at least two tagged pv_module objects");
    }
    const groupedByArray = new Map();
    for (const module of modules) {
        const arrayId = defaultArrayId(module);
        if (config.selectedArrayId && config.selectedArrayId !== arrayId) {
            continue;
        }
        const bucket = groupedByArray.get(arrayId) ?? [];
        bucket.push(module);
        groupedByArray.set(arrayId, bucket);
    }
    if (config.selectedArrayId && !groupedByArray.has(config.selectedArrayId)) {
        throw new Error(`Could not resolve selected array ${config.selectedArrayId}`);
    }
    const arrays = [];
    const rows = [];
    const rowPairs = [];
    const bays = [];
    for (const [arrayId, records] of groupedByArray.entries()) {
        const inferred = inferArrayContext(arrayId, records, config);
        arrays.push(inferred.array);
        rows.push(...inferred.rows);
        rowPairs.push(...inferred.rowPairs);
        bays.push(...inferred.bays);
    }
    if (rows.length < 2 || bays.length === 0) {
        throw new Error("Could not infer any valid adjacent row pairs for sensor placement");
    }
    return {
        arrays,
        rows,
        rowPairs,
        bays,
        tilingStrategy: config.fullArrayTilingStrategy ?? DEFAULT_SENSOR_CONFIG.fullArrayTilingStrategy ?? "rowPairBayTiling",
    };
}
