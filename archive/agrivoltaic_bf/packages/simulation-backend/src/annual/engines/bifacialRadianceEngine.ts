import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import type {
  AnnualJobSummary,
  AnnualResultsDataset,
  AnnualSimulationRequest,
  AnnualWeatherMetadata,
  ExportPackageResult,
} from "@agrivoltaic/shared";
import { annualResultsDatasetSchema } from "@agrivoltaic/shared";
import { ensureDirectory, readJson, writeJson } from "../storage.js";

const DEFAULT_ANNUAL_PYTHON = "/opt/anaconda3/envs/irradiance/bin/python";

function bifacialRunnerPath(): string {
  return fileURLToPath(new URL("../../../python/run_bifacial_annual.py", import.meta.url));
}

function resolveRadianceBinDir(): string | undefined {
  const configured = process.env.AGRIVOLTAIC_RADIANCE_BIN_DIR?.trim();
  if (configured) return configured;

  const homeCandidate = join(homedir(), "opt", "Radiance", "bin");
  if (existsSync(homeCandidate)) return homeCandidate;
  return undefined;
}

function buildRadianceChildEnv(pythonCommand: string): NodeJS.ProcessEnv {
  const radianceBinDir = resolveRadianceBinDir();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    AGRIVOLTAIC_PYTHON: pythonCommand,
  };

  if (radianceBinDir) {
    env.AGRIVOLTAIC_RADIANCE_BIN_DIR = radianceBinDir;
    env.PATH = env.PATH ? `${radianceBinDir}:${env.PATH}` : radianceBinDir;
    const radianceRoot = dirname(radianceBinDir);
    const libDir = join(radianceRoot, "lib");
    const rayDir = join(libDir, "ray");
    const existing = (env.RAYPATH ?? "").split(":").filter(Boolean);
    const merged = [...new Set([".", libDir, rayDir, ...existing])];
    env.RAYPATH = merged.join(":");
  }

  return env;
}

export function resolveAnnualPythonCommand(): string {
  return process.env.AGRIVOLTAIC_PYTHON?.trim() || DEFAULT_ANNUAL_PYTHON;
}

export async function detectBifacialRadiance(
  pythonCommand = resolveAnnualPythonCommand(),
): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(pythonCommand, ["-c", "import bifacial_radiance, pvlib; print('ok')"]);
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

export async function runBifacialRadianceEngine(input: {
  request: AnnualSimulationRequest;
  job: AnnualJobSummary;
  exportPackage: ExportPackageResult;
  weather: AnnualWeatherMetadata;
  workingDirectory: string;
}): Promise<AnnualResultsDataset> {
  const pythonCommand = resolveAnnualPythonCommand();
  const runnerPath = bifacialRunnerPath();
  const inputPath = join(input.workingDirectory, "bifacial-input.json");
  const outputPath = join(input.workingDirectory, "bifacial-output.json");
  const runnerLogPath = join(input.workingDirectory, "logs", "bifacial-radiance-runner.log");
  const progressPath = join(input.workingDirectory, "logs", "irradiance-progress.json");
  const launchLogPath = join(input.workingDirectory, "logs", "bifacial-radiance-launch.log");
  await ensureDirectory(dirname(launchLogPath));

  await writeJson(inputPath, {
    request: input.request,
    job: input.job,
    exportPackage: {
      exportPackageId: input.exportPackage.exportPackageId,
      packageRoot: input.exportPackage.packageRoot,
      manifest: input.exportPackage.manifest,
      analysis: input.exportPackage.analysis,
      grids: input.exportPackage.grids,
    },
    weather: input.weather,
    engineConfig: {
      pythonCommand,
      radianceBinDir: resolveRadianceBinDir(),
    },
  });

  const stdoutTail: string[] = [];
  const stderrTail: string[] = [];

  function appendTail(target: string[], chunk: string) {
    target.push(chunk);
    const combined = target.join("");
    if (combined.length > 12000) {
      target.splice(0, Math.max(1, target.length - 20));
    }
  }

  await new Promise<void>((resolve, reject) => {
    const launchLog = createWriteStream(launchLogPath, { encoding: "utf8" });
    launchLog.on("error", reject);

    const child = spawn(
      pythonCommand,
      [runnerPath, "--input", inputPath, "--output", outputPath, "--log", runnerLogPath, "--progress", progressPath],
      {
        cwd: input.workingDirectory,
        env: buildRadianceChildEnv(pythonCommand),
      }
    );

    launchLog.write(`Python: ${pythonCommand}\nRunner: ${runnerPath}\nProgress: ${progressPath}\n\n`);
    child.stdout.on("data", (chunk) => {
      const text = String(chunk);
      launchLog.write(text);
      appendTail(stdoutTail, text);
    });
    child.stderr.on("data", (chunk) => {
      const text = String(chunk);
      launchLog.write(text);
      appendTail(stderrTail, text);
    });
    child.on("error", reject);
    child.on("close", async (code) => {
      await new Promise<void>((resolveClose) => {
        launchLog.end(resolveClose);
      });

      if (code !== 0) {
        const message = stderrTail.join("").trim()
          || stdoutTail.join("").trim()
          || `bifacial_radiance runner exited with code ${code}`;
        reject(new Error(message));
        return;
      }

      resolve();
    });
  });

  const dataset = await readJson<unknown>(outputPath);
  return annualResultsDatasetSchema.parse(dataset) as AnnualResultsDataset;
}

export function parseBifacialDataset(input: unknown): AnnualResultsDataset {
  return annualResultsDatasetSchema.parse(input) as AnnualResultsDataset;
}
