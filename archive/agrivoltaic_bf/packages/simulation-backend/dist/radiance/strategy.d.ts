import type { PackageTextFile, RadianceCommandSpec, SceneExportManifest, SimulationOptions } from "@agrivoltaic/shared";
export interface GeometryConversionPlan {
    geometryRadFiles: string[];
    generatedFiles: PackageTextFile[];
    commands: RadianceCommandSpec[];
}
export declare function buildGeometryConversionPlan(manifest: SceneExportManifest, options: SimulationOptions): GeometryConversionPlan;
