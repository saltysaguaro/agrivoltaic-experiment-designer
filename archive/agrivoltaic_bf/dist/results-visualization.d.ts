import type { GridClassification, ImportedSimulationResult } from "@agrivoltaic/shared";
import { Group, InstancedMesh, Points } from "three";
export interface VisualizationFilter {
    gridIds?: string[];
    classifications?: GridClassification[];
}
export interface ValueRange {
    min: number;
    max: number;
}
export interface PointCloudOptions {
    size?: number;
    range?: ValueRange;
    filter?: VisualizationFilter;
}
export interface SliceOptions {
    gridId?: string;
    axis: "row" | "cross" | "up";
    index: number;
    cellOpacity?: number;
    range?: ValueRange;
}
export declare function createSensorPointCloud(results: ImportedSimulationResult, options?: PointCloudOptions): Points;
export declare function createPerGridPointGroups(results: ImportedSimulationResult, options?: PointCloudOptions): Group;
export declare function createInstancedSensorMarkers(results: ImportedSimulationResult, options?: PointCloudOptions): InstancedMesh;
export declare function createSliceHeatmap(results: ImportedSimulationResult, options: SliceOptions): Group;
export declare function createVolumeLayerView(results: ImportedSimulationResult, axis: "row" | "cross" | "up", layerEvery?: number, filter?: VisualizationFilter): Group;
export declare function buildLegendStops(results: ImportedSimulationResult, steps?: number): Array<{
    value: number;
    color: string;
}>;
export declare function summarizeEdgeVsInterior(results: ImportedSimulationResult): string[];
