import { type ArrayResultSummary, type AxisSliceSummary, type ClassificationSummary, type GridClassification, type GridResult, type IrradianceSample, type IrradianceStats, type SensorGridVolume } from "@agrivoltaic/shared";
export declare function computeIrradianceStats(samples: readonly IrradianceSample[]): IrradianceStats;
export declare function computeGridSlices(samples: readonly IrradianceSample[]): {
    row: AxisSliceSummary[];
    cross: AxisSliceSummary[];
    up: AxisSliceSummary[];
};
export declare function buildGridResult(grid: SensorGridVolume, samples: IrradianceSample[]): GridResult;
export declare function isEdgeLikeClassification(classification: GridClassification): boolean;
export declare function isEdgeLikeGrid(grid: Pick<GridResult, "classifications">): boolean;
export declare function summarizeClassifications(gridResults: GridResult[]): ClassificationSummary[];
export declare function summarizeArray(gridResults: GridResult[]): {
    arrayStats: {
        edgeInteriorDifference: number | undefined;
        edgeInteriorRatio: number | undefined;
        gridCount: number;
        sensorCount: number;
        stats: IrradianceStats;
    };
    edgeStats: ArrayResultSummary | undefined;
    interiorStats: ArrayResultSummary | undefined;
};
