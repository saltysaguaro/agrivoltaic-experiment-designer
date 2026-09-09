import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  exportPackageRequestSchema,
  importResultsRequestSchema,
  type ExportPackageRequest,
  type ImportedSimulationResult,
  type ImportResultsRequest,
  type SimulationExecutionResult,
} from "@agrivoltaic/shared";
import { createExportPackage } from "../radiance/pipeline.js";
import { importRadianceResults } from "../results/parser.js";
import { executeCommand } from "../utils/exec.js";
import { hashJson } from "../utils/hash.js";

export async function createSimulationPackage(requestInput: unknown) {
  return createExportPackage(requestInput);
}

export async function importSimulationResults(requestInput: unknown): Promise<ImportedSimulationResult> {
  const request: ImportResultsRequest = importResultsRequestSchema.parse(requestInput);
  return importRadianceResults(request);
}

export async function runSimulation(requestInput: unknown): Promise<SimulationExecutionResult> {
  const request: ExportPackageRequest = exportPackageRequestSchema.parse(requestInput);
  const packageResult = await createExportPackage({
    ...request,
    simulationOptions: {
      ...request.simulationOptions,
      outputMode: "packageAndSimulate",
    },
  });

  const simulationId = `sim-${hashJson({
    exportPackageId: packageResult.exportPackageId,
    createdAt: packageResult.manifest.createdAt,
  }).slice(0, 12)}`;
  const commandLog = [];

  for (const command of packageResult.manifest.radiancePlan.commands) {
    commandLog.push(await executeCommand(packageResult.packageRoot, command));
  }

  await writeFile(
    join(packageResult.packageRoot, "logs", "command-log.json"),
    JSON.stringify(commandLog, null, 2),
    "utf8",
  );

  const resultFiles = await Promise.all(packageResult.grids.map(async (grid) => ({
    fileName: `${grid.gridId}.res`,
    gridId: grid.gridId,
    content: await readFile(join(packageResult.packageRoot, "results", `${grid.gridId}.res`), "utf8"),
  })));

  const importedResults = importRadianceResults({
    exportPackageManifest: packageResult.manifest,
    grids: packageResult.grids,
    resultFiles,
    simulationId,
  });

  await writeFile(
    join(packageResult.packageRoot, "results", "imported-results.json"),
    JSON.stringify(importedResults, null, 2),
    "utf8",
  );

  return {
    simulationId,
    exportPackageId: packageResult.exportPackageId,
    packageRoot: packageResult.packageRoot,
    manifest: packageResult.manifest,
    analysis: packageResult.analysis,
    importedResults,
    commandLog,
  };
}
