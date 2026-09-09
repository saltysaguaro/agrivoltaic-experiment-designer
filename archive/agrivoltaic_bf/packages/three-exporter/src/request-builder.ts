import {
  DEFAULT_SENSOR_CONFIG,
  type ExportPackageRequest,
  type MaterialDefinition,
  type SceneExportBundle,
  type SensorGridConfig,
  type SimulationOptions,
  type SkyRequest,
} from "@agrivoltaic/shared";

export function buildExportPackageRequest(input: {
  sceneExport: SceneExportBundle;
  sensorConfig?: Partial<SensorGridConfig>;
  sky: SkyRequest;
  materialLibrary?: MaterialDefinition[];
  simulationOptions?: Partial<SimulationOptions>;
  workingDirectory?: string;
  packageLabel?: string;
}): ExportPackageRequest {
  return {
    sceneExport: input.sceneExport,
    sensorConfig: {
      ...DEFAULT_SENSOR_CONFIG,
      ...input.sensorConfig,
    },
    sky: input.sky,
    materialLibrary: input.materialLibrary,
    simulationOptions: input.simulationOptions,
    workingDirectory: input.workingDirectory,
    packageLabel: input.packageLabel,
  };
}
