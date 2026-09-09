import type { GridClassification, Vec3 } from "@agrivoltaic/shared";
export declare function edgeLabelsForAxis(axis: Vec3): {
    negative: GridClassification;
    positive: GridClassification;
};
export declare function classifyRowPairEdge(rowPairIndex: number, rowPairCount: number, crossAxis: Vec3): GridClassification[];
export declare function classifyBayEdge(bayIndex: number, bayCount: number, rowAxis: Vec3): GridClassification[];
export declare function mergeGridClassifications(rowPairEdgeLabels: GridClassification[], bayEdgeLabels: GridClassification[]): GridClassification[];
