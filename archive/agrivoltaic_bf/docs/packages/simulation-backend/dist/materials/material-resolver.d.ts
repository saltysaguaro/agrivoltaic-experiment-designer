import type { MaterialDefinition, SceneExportManifest } from "@agrivoltaic/shared";
export declare function validateManifestMaterials(manifest: SceneExportManifest, materialLibrary: MaterialDefinition[]): string[];
export declare function toRadianceMaterial(material: MaterialDefinition): string;
export declare function buildMaterialFile(materials: MaterialDefinition[]): string;
