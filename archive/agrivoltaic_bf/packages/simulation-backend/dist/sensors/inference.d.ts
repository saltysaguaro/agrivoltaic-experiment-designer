import { type FullArrayAnalysis, type SceneExportManifest, type SensorGridConfig, type SensorGridVolume } from "@agrivoltaic/shared";
export interface InferredSensorGrids {
    analysis: FullArrayAnalysis;
    grids: SensorGridVolume[];
    notes: string[];
}
export declare function inferSensorGridVolumes(manifest: SceneExportManifest, configInput?: Partial<SensorGridConfig>): InferredSensorGrids;
