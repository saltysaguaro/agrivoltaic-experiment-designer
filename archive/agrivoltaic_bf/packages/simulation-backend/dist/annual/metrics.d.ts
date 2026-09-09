import type { AnnualGridSliceView, AnnualMetric, AnnualResultsView } from "@agrivoltaic/shared";
export declare function convertMetric(metric: AnnualMetric, irradianceWhM2: number, denominatorGhiWhM2: number, periodDayCount?: number): {
    value: number;
    units: string;
};
export declare function summarizeNumeric(values: readonly number[]): {
    min: number;
    max: number;
    mean: number;
};
export declare function buildEdgeInteriorSummary(grids: readonly AnnualGridSliceView[]): AnnualResultsView["edgeInterior"];
