import { type ExportPackageRequest, type MaterialDefinition, type SceneExportBundle, type SensorGridConfig, type SimulationOptions, type SkyRequest } from "@agrivoltaic/shared";
export declare function buildExportPackageRequest(input: {
    sceneExport: SceneExportBundle;
    sensorConfig?: Partial<SensorGridConfig>;
    sky: SkyRequest;
    materialLibrary?: MaterialDefinition[];
    simulationOptions?: Partial<SimulationOptions>;
    workingDirectory?: string;
    packageLabel?: string;
}): ExportPackageRequest;
export declare function writeSceneExportBundle(bundle: SceneExportBundle, outputDirectory: string): Promise<string[]>;
