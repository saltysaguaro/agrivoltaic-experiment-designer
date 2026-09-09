import type { ExportSelectionScope, SimulationMetadata } from "@agrivoltaic/shared";
import type { Object3D } from "three";
export interface SelectedSceneObject {
    object: Object3D;
    stableId: string;
    metadata: SimulationMetadata;
}
export declare function collectSelectedSimulationObjects(root: Object3D, scope?: ExportSelectionScope): SelectedSceneObject[];
export declare function buildSelectionScopeFromObjects(objects: Object3D[]): ExportSelectionScope;
