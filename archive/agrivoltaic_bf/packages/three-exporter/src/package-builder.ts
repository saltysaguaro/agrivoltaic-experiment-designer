import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  type PackageTextFile,
  type SceneExportBundle,
} from "@agrivoltaic/shared";
import { buildExportPackageRequest } from "./request-builder.js";

export async function writeSceneExportBundle(bundle: SceneExportBundle, outputDirectory: string): Promise<string[]> {
  const writtenFiles: string[] = [];

  async function writeTextFile(file: PackageTextFile): Promise<void> {
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
