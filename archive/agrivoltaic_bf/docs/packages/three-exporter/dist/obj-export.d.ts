import { type ExportSelectionScope, type GeometrySourceMode, type SceneExportBundle } from "@agrivoltaic/shared";
import type { Object3D } from "three";
export interface BuildSceneExportBundleOptions {
    sceneId: string;
    selection?: ExportSelectionScope;
    geometrySourceMode?: GeometrySourceMode;
}
export declare function buildSceneExportBundle(root: Object3D, options: BuildSceneExportBundleOptions): SceneExportBundle;
