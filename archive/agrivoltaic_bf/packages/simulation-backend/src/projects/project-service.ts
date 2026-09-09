import { randomUUID } from "node:crypto";
import { copyFile, cp } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  annualJobRecordSchema,
  annualResultsDatasetSchema,
  annualSimulationRequestSchema,
  type AnnualJobSummary,
  type AnnualSimulationRequest,
  localProjectSnapshotSchema,
  type LocalProjectSnapshot,
} from "@agrivoltaic/shared";
import {
  assertSafeJobId,
  ensureDirectory,
  normalizeDirectoryPath,
  pathExists,
  readJson,
  resolveJobDirectory,
  writeJson,
} from "../annual/storage.js";

export const PROJECT_FILE_NAME = "agrivoltaic-project.json";
const PROJECT_VERSION = "1";

interface OpenProjectFolderInput {
  rootPath: string;
  projectName?: string;
}

interface SaveProjectSnapshotInput {
  rootPath: string;
  snapshot: Omit<Partial<LocalProjectSnapshot>, "project" | "jobs"> & {
    project?: Partial<LocalProjectSnapshot["project"]>;
    jobs?: Record<string, AnnualJobSummary>;
  };
}

interface ImportHpcResultsInput {
  rootPath: string;
  packageRoot: string;
  jobId?: string;
}

export interface ProjectOpenResult {
  exists: boolean;
  projectFilePath: string;
  snapshot: LocalProjectSnapshot;
}

export interface ProjectImportResult extends ProjectOpenResult {
  importedJob: AnnualJobSummary;
  jobDirectory: string;
}

function normalizePath(path: string, label = "Project folder path"): string {
  return normalizeDirectoryPath(path, label);
}

function defaultProjectName(rootPath: string, explicitName?: string): string {
  const trimmed = explicitName?.trim();
  if (trimmed) return trimmed;
  return basename(rootPath) || "Agrivoltaic Study";
}

function sanitizeProjectFolderName(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "agrivoltaic-study";
}

function resolveProjectRoot(basePath: string, projectName?: string): string {
  const normalizedBasePath = normalizePath(basePath, "Project parent folder");
  const resolvedName = defaultProjectName(normalizedBasePath, projectName);
  return join(normalizedBasePath, sanitizeProjectFolderName(resolvedName));
}

function createSnapshot(rootPath: string, projectName?: string): LocalProjectSnapshot {
  return localProjectSnapshotSchema.parse({
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    project: {
      name: defaultProjectName(rootPath, projectName),
      rootPath,
      fileName: PROJECT_FILE_NAME,
    },
    site: null,
    designState: null,
    serializedConfig: null,
    sensorSelection: null,
    lastJobId: null,
    jobs: {},
  });
}

function mergeJobs(
  existing: Record<string, AnnualJobSummary> | undefined,
  incoming: Record<string, AnnualJobSummary> | undefined,
) {
  return {
    ...(existing ?? {}),
    ...(incoming ?? {}),
  };
}

async function resolveExistingPath(rootPath: string, candidates: string[], label: string): Promise<string> {
  for (const candidate of candidates) {
    const resolved = join(rootPath, candidate);
    if (await pathExists(resolved)) {
      return resolved;
    }
  }

  throw new Error(`${label} was not found in ${rootPath}.`);
}

function importedJobId(explicitJobId?: string): string {
  const trimmed = explicitJobId?.trim();
  if (trimmed) {
    return assertSafeJobId(trimmed);
  }
  return `job-${randomUUID()}`;
}

function buildImportedJobSummary(
  jobId: string,
  request: AnnualSimulationRequest,
  dataset: {
    job: { createdAt?: string; startedAt?: string; completedAt?: string; notes?: string[]; engine?: AnnualJobSummary["engine"] };
    provenance: { generatedAt: string; engine: AnnualJobSummary["engine"] };
    weather: { source: AnnualJobSummary["weatherSource"] };
  },
): AnnualJobSummary {
  const generatedAt = dataset.provenance.generatedAt || new Date().toISOString();
  const engine = dataset.provenance.engine || dataset.job?.engine || "bifacial_radiance";
  return {
    jobId,
    projectName: request.projectName,
    site: request.site,
    status: "completed",
    phase: "completed",
    progress: 1,
    gridMode: request.sensorConfig.mode,
    engine,
    createdAt: dataset.job?.createdAt || generatedAt,
    updatedAt: generatedAt,
    startedAt: dataset.job?.startedAt,
    completedAt: dataset.job?.completedAt || generatedAt,
    weatherSource: dataset.weather.source,
    notes: [
      ...(dataset.job?.notes || []),
      "Imported completed HPC results into the local project.",
    ],
  };
}

export class ProjectService {
  async openProjectFolder(input: OpenProjectFolderInput): Promise<ProjectOpenResult> {
    const rootPath = resolveProjectRoot(input.rootPath, input.projectName);
    await ensureDirectory(rootPath);
    const projectFilePath = join(rootPath, PROJECT_FILE_NAME);
    const exists = await pathExists(projectFilePath);

    if (!exists) {
      const snapshot = createSnapshot(rootPath, input.projectName);
      await writeJson(projectFilePath, snapshot);
      return { exists: false, projectFilePath, snapshot };
    }

    const stored = localProjectSnapshotSchema.parse(await readJson<LocalProjectSnapshot>(projectFilePath));
    const snapshot = localProjectSnapshotSchema.parse({
      ...stored,
      project: {
        ...stored.project,
        rootPath,
        fileName: stored.project.fileName || PROJECT_FILE_NAME,
        name: stored.project.name || defaultProjectName(rootPath, input.projectName),
      },
    });
    return { exists: true, projectFilePath, snapshot };
  }

  async saveProjectSnapshot(input: SaveProjectSnapshotInput): Promise<ProjectOpenResult> {
    const rootPath = normalizePath(input.rootPath);
    await ensureDirectory(rootPath);
    const projectFilePath = join(rootPath, PROJECT_FILE_NAME);
    const existing = await pathExists(projectFilePath)
      ? localProjectSnapshotSchema.parse(await readJson<LocalProjectSnapshot>(projectFilePath))
      : createSnapshot(rootPath, input.snapshot.project?.name);

    const snapshot = localProjectSnapshotSchema.parse({
      ...existing,
      ...input.snapshot,
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      project: {
        ...existing.project,
        ...input.snapshot.project,
        rootPath,
        fileName: PROJECT_FILE_NAME,
        name: defaultProjectName(rootPath, input.snapshot.project?.name ?? existing.project.name),
      },
      site: input.snapshot.site === undefined ? existing.site : input.snapshot.site,
      designState: input.snapshot.designState === undefined ? existing.designState : input.snapshot.designState,
      serializedConfig: input.snapshot.serializedConfig === undefined
        ? existing.serializedConfig
        : input.snapshot.serializedConfig,
      sensorSelection: input.snapshot.sensorSelection === undefined
        ? existing.sensorSelection
        : input.snapshot.sensorSelection,
      lastJobId: input.snapshot.lastJobId === undefined ? existing.lastJobId : input.snapshot.lastJobId,
      jobs: mergeJobs(existing.jobs, input.snapshot.jobs),
    });

    await writeJson(projectFilePath, snapshot);
    return { exists: true, projectFilePath, snapshot };
  }

  async importHpcResults(input: ImportHpcResultsInput): Promise<ProjectImportResult> {
    const rootPath = normalizePath(input.rootPath);
    const packageRoot = normalizePath(input.packageRoot, "HPC results package folder");
    const requestPath = await resolveExistingPath(packageRoot, [
      "config/request.json",
      "request.json",
    ], "Export request");
    const resultSourcePath = await resolveExistingPath(packageRoot, [
      "results/irradiance-results.json",
      "irradiance-results.json",
      "results/annual-results.json",
      "annual-results.json",
      "bifacial-output.json",
    ], "Irradiance results dataset");

    const request = annualSimulationRequestSchema.parse(await readJson<AnnualSimulationRequest>(requestPath));
    const dataset = annualResultsDatasetSchema.parse(await readJson(resultSourcePath));
    const jobId = importedJobId(input.jobId);
    const jobDirectory = resolveJobDirectory(jobId, rootPath);
    const resultsDirectory = join(jobDirectory, "results");
    const logsDirectory = join(jobDirectory, "logs");
    await ensureDirectory(resultsDirectory);
    await ensureDirectory(logsDirectory);

    const resultPath = join(resultsDirectory, "irradiance-results.json");
    await copyFile(resultSourcePath, resultPath);

    const weatherSourcePath = await resolveExistingPath(packageRoot, [
      "weather/weather.json",
      "weather.json",
    ], "Weather metadata").catch(() => null);
    if (weatherSourcePath) {
      await copyFile(weatherSourcePath, join(jobDirectory, "weather.json"));
    } else {
      await writeJson(join(jobDirectory, "weather.json"), dataset.weather);
    }

    const runnerLogPath = join(logsDirectory, "bifacial-radiance-runner.log");
    const runnerLogSource = await resolveExistingPath(packageRoot, [
      "results/irradiance-runner.log",
      "logs/bifacial-radiance-runner.log",
    ], "Runner log").catch(() => null);
    if (runnerLogSource) {
      await copyFile(runnerLogSource, runnerLogPath);
    }

    const progressSourcePath = await resolveExistingPath(packageRoot, [
      "results/irradiance-progress.json",
      "logs/irradiance-progress.json",
    ], "Runner progress").catch(() => null);
    if (progressSourcePath) {
      await copyFile(progressSourcePath, join(logsDirectory, "irradiance-progress.json"));
    }

    const hourlySourceDirectory = join(packageRoot, "results", "hourly-irradiance");
    if (await pathExists(hourlySourceDirectory)) {
      await cp(hourlySourceDirectory, join(resultsDirectory, "hourly-irradiance"), { recursive: true });
    }

    await writeJson(join(jobDirectory, "request.json"), request);

    const summary = buildImportedJobSummary(jobId, request, dataset);
    const record = annualJobRecordSchema.parse({
      ...summary,
      projectRoot: rootPath,
      exportPackageId: dataset.exportPackage.exportPackageId,
      exportPackageRoot: packageRoot,
      resultPath,
      logPath: await pathExists(runnerLogPath) ? runnerLogPath : undefined,
    });
    await writeJson(join(jobDirectory, "job.json"), record);

    const project = await this.saveProjectSnapshot({
      rootPath,
      snapshot: {
        jobs: {
          [summary.jobId]: summary,
        },
        lastJobId: summary.jobId,
      },
    });

    return {
      ...project,
      importedJob: summary,
      jobDirectory,
    };
  }
}
