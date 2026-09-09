import { type GridClassification, type LocalFrame, type SensorGridBounds, type SensorGridVolume } from "@agrivoltaic/shared";
type AxisPlacement = "boundary" | "cellCenter";
export declare function sensorVolumeWorldBounds(frame: LocalFrame, bounds: SensorGridBounds): import("@agrivoltaic/shared").Bounds3;
export interface BuildSensorGridVolumeInput {
    gridId: string;
    mode: SensorGridVolume["mode"];
    arrayId: string;
    rowPairId: string;
    bayId?: string;
    rowIds: [string, string];
    classifications: GridClassification[];
    frame: LocalFrame;
    bounds: SensorGridBounds;
    dimensions: [number, number, number];
    bayIndex: number;
    bayCount: number;
    placement?: {
        row?: AxisPlacement;
        cross?: AxisPlacement;
        up?: AxisPlacement;
    };
}
export declare function buildSensorGridVolume(input: BuildSensorGridVolumeInput): SensorGridVolume;
export {};
