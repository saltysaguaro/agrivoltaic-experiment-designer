import { type Bounds3, type ExportSelectionScope, type SceneExportManifest, type SceneObjectRecord } from "@agrivoltaic/shared";
import type { Object3D } from "three";
export declare function computeObjectBounds(object: Object3D): Bounds3;
export declare function collectSimulationObjects(root: Object3D, scope?: ExportSelectionScope): SceneObjectRecord[];
export declare function aggregateBounds(records: SceneObjectRecord[]): Bounds3;
export declare function buildSceneManifest(input: {
    sceneId: string;
    selection: ExportSelectionScope;
    geometrySourceMode: "visualMesh" | "simulationMesh";
    combinedGeometryPath: string;
    geometryHash: string;
    objects: SceneObjectRecord[];
    assets: SceneExportManifest["assets"];
    exporterVersion: string;
}): SceneExportManifest;
export declare function inferRepresentativeModuleSpan(objects: SceneObjectRecord[]): number;
