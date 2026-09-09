import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  BACKEND_VERSION,
  DEFAULT_SIMULATION_OPTIONS,
  exportPackageRequestSchema,
  type ExportPackageRequest,
  type ExportPackageResult,
  type PackageTextFile,
  type RadianceCommandSpec,
  type RadiancePackageManifest,
  type SimulationOptions,
} from "@agrivoltaic/shared";
import { buildMaterialFile, validateManifestMaterials } from "../materials/material-resolver.js";
import { resolveMaterialLibrary } from "../config/material-library.js";
import { inferSensorGridVolumes } from "../sensors/inference.js";
import { buildGendaylitCommand } from "./sky.js";
import { buildGeometryConversionPlan } from "./strategy.js";
import { hashJson } from "../utils/hash.js";

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sanitizeLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "package";
}

function commandShellLine(command: RadianceCommandSpec): string {
  const quoted = [command.program, ...command.args]
    .map((part) => `'${part.replace(/'/g, `'\\''`)}'`)
    .join(" ");
  const stdin = command.stdinRelativePath ? ` < "$ROOT/${command.stdinRelativePath}"` : "";
  const stdout = command.stdoutRelativePath ? ` > "$ROOT/${command.stdoutRelativePath}"` : "";
  return `(cd "$ROOT/${command.cwdRelative}" && ${quoted}${stdin}${stdout})`;
}

function writeablePackageFile(relativePath: string, contents: string, contentType: PackageTextFile["contentType"]): PackageTextFile {
  return {
    relativePath,
    contents,
    sha256: hashText(contents),
    contentType,
  };
}

async function writeRelativeFile(packageRoot: string, file: PackageTextFile): Promise<string> {
  const target = join(packageRoot, file.relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.contents, "utf8");
  return target;
}

function buildRtraceCommand(
  gridId: string,
  options: SimulationOptions,
): RadianceCommandSpec {
  const args = [
    "-I+",
    "-ab", `${options.ambientBounces}`,
    "-ad", `${options.ambientDivisions}`,
  ];

  if (options.ambientResolution) {
    args.push("-ar", `${options.ambientResolution}`);
  }
  if (options.ambientAccuracy !== undefined) {
    args.push("-aa", `${options.ambientAccuracy}`);
  }
  if (options.limitWeight !== undefined) {
    args.push("-lw", `${options.limitWeight}`);
  }

  args.push("../results/scene.oct");

  return {
    id: `rtrace-${gridId}`,
    program: options.irradianceBinary ?? options.binaries?.rtrace ?? "rtrace",
    args,
    cwdRelative: "radiance",
    stdinRelativePath: `sensors/${gridId}.pts`,
    stdoutRelativePath: `results/${gridId}.res`,
  };
}

export async function createExportPackage(requestInput: unknown): Promise<ExportPackageResult> {
  const request: ExportPackageRequest = exportPackageRequestSchema.parse(requestInput);
  const simulationOptions: SimulationOptions = {
    ...DEFAULT_SIMULATION_OPTIONS,
    ...request.simulationOptions,
  };
  const materialLibrary = resolveMaterialLibrary(request.materialLibrary);
  const missingMaterials = validateManifestMaterials(request.sceneExport.sceneManifest, materialLibrary);
  if (missingMaterials.length > 0) {
    throw new Error(`Manifest references undefined Radiance materials: ${missingMaterials.join(", ")}`);
  }

  const inferred = inferSensorGridVolumes(request.sceneExport.sceneManifest, request.sensorConfig);
  const packageHash = hashJson({
    geometryHash: request.sceneExport.sceneManifest.geometryHash,
    sensorConfig: request.sensorConfig,
    sky: request.sky,
    simulationOptions,
  }).slice(0, 10);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportPackageId = `${sanitizeLabel(request.packageLabel ?? request.sceneExport.sceneManifest.sceneId)}-${timestamp}-${packageHash}`;
  const packageRoot = join(request.workingDirectory ?? join(process.cwd(), ".radiance-packages"), exportPackageId);

  const geometryFiles = [...request.sceneExport.files];
  geometryFiles.push(writeablePackageFile(
    "geometry/scene-manifest.json",
    JSON.stringify(request.sceneExport.sceneManifest, null, 2),
    "application/json",
  ));

  const materialJson = JSON.stringify(materialLibrary, null, 2);
  const materialRad = buildMaterialFile(materialLibrary);
  const sensorMetadata = JSON.stringify({
    analysis: inferred.analysis,
    grids: inferred.grids,
  }, null, 2);
  const skyCommand = buildGendaylitCommand(request.sky, simulationOptions.binaries?.gendaylit ?? "gendaylit");
  const skyScript = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"',
    `(cd "$ROOT/sky" && '${skyCommand.program.replace(/'/g, `'\\''`)}' ${skyCommand.args.map((arg) => `'${arg.replace(/'/g, `'\\''`)}'`).join(" ")} > "$ROOT/sky/sky.rad")`,
    "",
  ].join("\n");
  const skyPlaceholder = [
    "# Run sky/generate-sky.sh to regenerate this file.",
    `# Planned command: ${skyCommand.program} ${skyCommand.args.join(" ")}`,
    "",
  ].join("\n");

  const geometryPlan = buildGeometryConversionPlan(request.sceneExport.sceneManifest, simulationOptions);
  const baseCommands: RadianceCommandSpec[] = [
    ...geometryPlan.commands,
    {
      id: "sky-gendaylit",
      program: skyCommand.program,
      args: skyCommand.args,
      cwdRelative: "sky",
      stdoutRelativePath: "sky/sky.rad",
    },
    {
      id: "oconv-build-octree",
      program: simulationOptions.binaries?.oconv ?? "oconv",
      args: [
        "../materials/materials.rad",
        "../sky/sky.rad",
        ...geometryPlan.geometryRadFiles.map((path) => path.replace(/^radiance\//, "")),
      ],
      cwdRelative: "radiance",
      stdoutRelativePath: "results/scene.oct",
    },
    ...inferred.grids.map((grid) => buildRtraceCommand(grid.gridId, simulationOptions)),
  ];

  const runScript = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    'ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"',
    ...baseCommands.map((command) => commandShellLine(command)),
    "",
  ].join("\n");

  const manifest: RadiancePackageManifest = {
    exportPackageId,
    sceneId: request.sceneExport.sceneManifest.sceneId,
    createdAt: new Date().toISOString(),
    packageLabel: request.packageLabel,
    sceneManifest: request.sceneExport.sceneManifest,
    sensorConfig: request.sensorConfig,
    simulationOptions,
    sky: request.sky,
    geometry: {
      files: geometryFiles.map((file) => file.relativePath),
      combinedGeometryPath: request.sceneExport.sceneManifest.combinedGeometryPath,
      metadataPath: "geometry/scene-manifest.json",
      hash: request.sceneExport.sceneManifest.geometryHash,
    },
    materials: {
      jsonPath: "materials/materials.json",
      radPath: "materials/materials.rad",
    },
    sensors: {
      mode: request.sensorConfig.mode,
      tilingStrategy: inferred.analysis.tilingStrategy,
      gridMetadataPath: "sensors/grids.json",
      pointFiles: inferred.grids.map((grid) => `sensors/${grid.gridId}.pts`),
      totalGridCount: inferred.grids.length,
      totalSensorCount: inferred.grids.reduce((sum, grid) => sum + grid.sensors.length, 0),
    },
    skyFiles: {
      jsonPath: "sky/sky-config.json",
      shellScriptPath: "sky/generate-sky.sh",
      plannedRadPath: "sky/sky.rad",
    },
    radiancePlan: {
      planPath: "radiance/plan.json",
      shellScriptPath: "radiance/run-radiance.sh",
      commands: baseCommands,
    },
    results: {
      directory: "results",
      parsedResultPath: "results/imported-results.json",
    },
    provenance: {
      exporterVersion: request.sceneExport.sceneManifest.exporterVersion,
      backendVersion: BACKEND_VERSION,
      geometryHash: request.sceneExport.sceneManifest.geometryHash,
      materialConfigHash: hashJson(materialLibrary),
      notes: inferred.notes,
    },
  };

  const filesToWrite: PackageTextFile[] = [
    ...geometryFiles,
    ...geometryPlan.generatedFiles.map((file) => ({
      ...file,
      sha256: file.sha256 || hashText(file.contents),
    })),
    writeablePackageFile("materials/materials.json", materialJson, "application/json"),
    writeablePackageFile("materials/materials.rad", materialRad, "text/plain"),
    writeablePackageFile("sensors/grids.json", sensorMetadata, "application/json"),
    ...inferred.grids.map((grid) => writeablePackageFile(`sensors/${grid.gridId}.pts`, grid.radiancePoints, "text/plain")),
    writeablePackageFile("sky/sky-config.json", JSON.stringify(request.sky, null, 2), "application/json"),
    writeablePackageFile("sky/generate-sky.sh", skyScript, "text/plain"),
    writeablePackageFile("sky/sky.rad", skyPlaceholder, "text/plain"),
    writeablePackageFile("radiance/plan.json", JSON.stringify({
      exportPackageId,
      commands: baseCommands,
    }, null, 2), "application/json"),
    writeablePackageFile("radiance/run-radiance.sh", runScript, "text/plain"),
    writeablePackageFile("manifest.json", JSON.stringify(manifest, null, 2), "application/json"),
  ];

  const generatedFiles: string[] = [];
  for (const file of filesToWrite) {
    generatedFiles.push(await writeRelativeFile(packageRoot, file));
  }

  await mkdir(join(packageRoot, "results"), { recursive: true });
  await mkdir(join(packageRoot, "logs"), { recursive: true });
  await mkdir(join(packageRoot, "radiance", "geometry"), { recursive: true });

  return {
    exportPackageId,
    packageRoot,
    manifest,
    analysis: inferred.analysis,
    grids: inferred.grids,
    generatedFiles,
  };
}
