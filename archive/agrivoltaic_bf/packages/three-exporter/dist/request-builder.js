import { DEFAULT_SENSOR_CONFIG, } from "@agrivoltaic/shared";
export function buildExportPackageRequest(input) {
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
