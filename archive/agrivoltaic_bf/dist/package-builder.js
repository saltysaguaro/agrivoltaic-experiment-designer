import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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
export async function writeSceneExportBundle(bundle, outputDirectory) {
    const writtenFiles = [];
    async function writeTextFile(file) {
        const targetPath = join(outputDirectory, file.relativePath);
        await mkdir(dirname(targetPath), { recursive: true });
        await writeFile(targetPath, file.contents, "utf8");
        writtenFiles.push(targetPath);
    }
    for (const file of bundle.files) {
        await writeTextFile(file);
    }
    const manifestPath = join(outputDirectory, "geometry", "scene-manifest.json");
    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, JSON.stringify(bundle.sceneManifest, null, 2), "utf8");
    writtenFiles.push(manifestPath);
    return writtenFiles;
}
