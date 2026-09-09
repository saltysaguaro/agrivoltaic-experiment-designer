import { addVec3, boundsFromPoints, scaleVec3, } from "@agrivoltaic/shared";
const RADIANCE_TRACE_OFFSET_M = 0.05;
function axisOffsets(length, count, placement = "boundary") {
    if (count <= 1) {
        return [0];
    }
    if (placement === "cellCenter") {
        const step = length / count;
        return Array.from({ length: count }, (_, index) => (-length * 0.5) + (step * 0.5) + (index * step));
    }
    const step = length / (count - 1);
    return Array.from({ length: count }, (_, index) => (-length * 0.5) + (index * step));
}
function combine(frame, rowOffset, crossOffset, upOffset) {
    return addVec3(addVec3(addVec3(frame.origin, scaleVec3(frame.eRow, rowOffset)), scaleVec3(frame.eCross, crossOffset)), scaleVec3(frame.eUp, upOffset));
}
export function sensorVolumeWorldBounds(frame, bounds) {
    const halfRow = bounds.lengthRow * 0.5;
    const halfCross = bounds.lengthCross * 0.5;
    const halfUp = bounds.height * 0.5;
    const rowOffsets = [-halfRow, halfRow];
    const crossOffsets = [-halfCross, halfCross];
    const upOffsets = [-halfUp, halfUp];
    const corners = [];
    for (const rowOffset of rowOffsets) {
        for (const crossOffset of crossOffsets) {
            for (const upOffset of upOffsets) {
                corners.push(combine(frame, rowOffset, crossOffset, upOffset));
            }
        }
    }
    return boundsFromPoints(corners);
}
export function buildSensorGridVolume(input) {
    const [nx, ny, nz] = input.dimensions;
    const rowPlacement = input.placement?.row ?? "boundary";
    const crossPlacement = input.placement?.cross ?? "boundary";
    const upPlacement = input.placement?.up ?? "boundary";
    const rowOffsets = axisOffsets(input.bounds.lengthRow, nx, rowPlacement);
    const crossOffsets = axisOffsets(input.bounds.lengthCross, ny, crossPlacement);
    const upOffsets = axisOffsets(input.bounds.height, nz, upPlacement);
    const sensors = [];
    const lines = [];
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            for (let k = 0; k < nz; k++) {
                const position = combine(input.frame, rowOffsets[i], crossOffsets[j], upOffsets[k]);
                const sensor = {
                    id: `${input.gridId}-sensor-${i}-${j}-${k}`,
                    gridId: input.gridId,
                    position,
                    localPosition: {
                        x: rowOffsets[i],
                        y: crossOffsets[j],
                        z: upOffsets[k],
                    },
                    normal: input.frame.eUp,
                    indices: [i, j, k],
                    normalized: [
                        rowPlacement === "cellCenter"
                            ? (i + 0.5) / nx
                            : nx > 1 ? i / (nx - 1) : 0.5,
                        crossPlacement === "cellCenter"
                            ? (j + 0.5) / ny
                            : ny > 1 ? j / (ny - 1) : 0.5,
                        upPlacement === "cellCenter"
                            ? (k + 0.5) / nz
                            : nz > 1 ? k / (nz - 1) : 0.5,
                    ],
                    rowPairId: input.rowPairId,
                    bayId: input.bayId,
                    arrayId: input.arrayId,
                };
                sensors.push(sensor);
                const radiancePosition = addVec3(position, scaleVec3(input.frame.eUp, RADIANCE_TRACE_OFFSET_M));
                lines.push([
                    radiancePosition.x.toFixed(6),
                    radiancePosition.y.toFixed(6),
                    radiancePosition.z.toFixed(6),
                    input.frame.eUp.x.toFixed(6),
                    input.frame.eUp.y.toFixed(6),
                    input.frame.eUp.z.toFixed(6),
                ].join(" "));
            }
        }
    }
    return {
        gridId: input.gridId,
        mode: input.mode,
        arrayId: input.arrayId,
        rowPairId: input.rowPairId,
        bayId: input.bayId,
        rowIds: input.rowIds,
        classifications: input.classifications,
        localFrame: input.frame,
        bounds: input.bounds,
        worldBounds: sensorVolumeWorldBounds(input.frame, input.bounds),
        centroid: input.frame.origin,
        dimensions: input.dimensions,
        bayIndex: input.bayIndex,
        bayCount: input.bayCount,
        sensors,
        radiancePoints: `${lines.join("\n")}\n`,
    };
}
