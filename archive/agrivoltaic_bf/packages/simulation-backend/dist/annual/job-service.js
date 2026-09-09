import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANNUAL_SIMULATION_QUALITY_PRESETS, annualJobRecordSchema, annualResultsDatasetSchema, annualResultsMetadataSchema, annualResultsViewRequestSchema, annualSimulationRequestSchema, resolveAnnualSimulationQualityPreset, simulationOptionsForAnnualQualityPreset, } from "@agrivoltaic/shared";
import { BACKEND_VERSION } from "@agrivoltaic/shared";
import { createExportPackage } from "../radiance/pipeline.js";
import { resolveMaterialLibrary } from "../config/material-library.js";
import { buildEdgeInteriorSummary, convertMetric, summarizeNumeric } from "./metrics.js";
import { expandMonthRange, sumSelectedMonths } from "./months.js";
import { ensureDirectory, pathExists, readJson, readText, resolveDataRoot, resolveJobDirectory, writeJson, writeText } from "./storage.js";
import { acquireAnnualWeather } from "./weather.js";
import { detectBifacialRadiance, resolveAnnualPythonCommand, runBifacialRadianceEngine, } from "./engines/bifacialRadianceEngine.js";
import { runSyntheticAnnualEngine } from "./engines/syntheticAnnualEngine.js";
function defaultSkyForSite(request) {
    return {
        latitude: request.site.latitude,
        longitude: request.site.longitude,
        timezone: request.site.timezone,
        timestamp: `${new Date().getUTCFullYear()}-06-21T19:00:00.000Z`,
        dni: 850,
        dhi: 140,
        ghi: 930,
        albedo: 0.2,
        ...request.skyDefaults,
    };
}
function summarizeJob(record) {
    return {
        jobId: record.jobId,
        projectName: record.projectName,
        site: record.site,
        status: record.status,
        phase: record.phase,
        progress: record.progress,
        gridMode: record.gridMode,
        engine: record.engine,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        weatherSource: record.weatherSource,
        error: record.error,
        notes: record.notes,
    };
}
function appendNotes(record, ...notes) {
    return [...record.notes, ...notes];
}
function buildPortableJobSummary(request, weatherSource) {
    const createdAt = nowIso();
    return {
        jobId: `job-${randomUUID()}`,
        projectName: request.projectName,
        site: request.site,
        status: "queued",
        phase: "queued",
        progress: 0,
        gridMode: request.sensorConfig.mode,
        engine: "bifacial_radiance",
        createdAt,
        updatedAt: createdAt,
        weatherSource,
        notes: [
            "Portable run-anywhere irradiance package exported for external execution.",
        ],
    };
}
async function selectEngine(preference) {
    const envPreference = process.env.AGRIVOLTAIC_ENGINE;
    const desired = preference && preference !== "auto"
        ? preference
        : envPreference ?? "bifacial_radiance";
    if (desired === "synthetic_local") {
        if (process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC !== "true") {
            throw new Error("Synthetic irradiance modeling is disabled for the real app. "
                + "Use bifacial_radiance or set AGRIVOLTAIC_ALLOW_SYNTHETIC=true only for tests.");
        }
        return "synthetic_local";
    }
    const pythonCommand = resolveAnnualPythonCommand();
    const available = await detectBifacialRadiance(pythonCommand);
    if (!available) {
        throw new Error(`bifacial_radiance is required for irradiance modeling, but it is not importable from ${pythonCommand}. `
            + "Install bifacial_radiance and pvlib in that environment or set AGRIVOLTAIC_PYTHON to the correct interpreter.");
    }
    return "bifacial_radiance";
}
function nowIso() {
    return new Date().toISOString();
}
function sensorPointsText(grid) {
    return `${grid.sensors.map((sensor) => (`${sensor.position.x.toFixed(6)} ${sensor.position.y.toFixed(6)} ${(sensor.position.z + 0.05).toFixed(6)} `
        + `${sensor.normal.x.toFixed(6)} ${sensor.normal.y.toFixed(6)} ${sensor.normal.z.toFixed(6)}`)).join("\n")}\n`;
}
function filterGridsBySelection(grids, selectedSensorIds) {
    if (!selectedSensorIds?.length) {
        return grids;
    }
    const selected = new Set(selectedSensorIds);
    const filtered = grids
        .map((grid) => {
        const sensors = grid.sensors.filter((sensor) => selected.has(sensor.id));
        if (!sensors.length) {
            return null;
        }
        return {
            ...grid,
            sensors,
            radiancePoints: sensorPointsText({
                ...grid,
                sensors,
            }),
        };
    })
        .filter(Boolean);
    if (!filtered.length) {
        throw new Error("No selected sensors matched the inferred sensor lattice. Return to sensor layout and choose at least one sensor.");
    }
    return filtered;
}
function applySensorSelectionToExportPackage(exportPackage, selectedSensorIds) {
    const filteredGrids = filterGridsBySelection(exportPackage.grids, selectedSensorIds);
    if (filteredGrids === exportPackage.grids) {
        return exportPackage;
    }
    return {
        ...exportPackage,
        grids: filteredGrids,
        manifest: {
            ...exportPackage.manifest,
            sensors: {
                ...exportPackage.manifest.sensors,
                totalGridCount: filteredGrids.length,
                totalSensorCount: filteredGrids.reduce((sum, grid) => sum + grid.sensors.length, 0),
                pointFiles: filteredGrids.map((grid) => `sensors/${grid.gridId}.pts`),
            },
        },
    };
}
function runAnywhereReadme(request, weatherSource, sensorCount) {
    const qualityPreset = resolveAnnualSimulationQualityPreset(request.simulationQualityPreset);
    const qualityDefinition = ANNUAL_SIMULATION_QUALITY_PRESETS[qualityPreset];
    const simulationOptions = simulationOptionsForAnnualQualityPreset(qualityPreset);
    return `# Run-Anywhere Irradiance Package

This package was exported from the agrivoltaic design app and contains the exact geometry, materials, selected sensor layout, and weather data used for modeling.

## Contents

- \`geometry/\`, \`materials/\`, \`radiance/\`, \`sensors/\`: Radiance-ready package assets
- \`weather/weather.json\`: 8760 weather data used for this run
- \`config/request.json\`: original design/config payload
- \`config/selected-sensors.json\`: selected sensor IDs for this study
- \`config/simulation-input.template.json\`: portable runner input template
- \`scripts/run_bifacial_annual.py\`: traced irradiance runner used by the app
- \`run_irradiance_model.py\`: wrapper that resolves local paths and launches the runner

## Selected Study

- Project: ${request.projectName}
- Site: ${request.site.label}
- Weather source: ${weatherSource}
- Selected sensors: ${sensorCount}
- Quality preset: ${qualityDefinition.label}
- Radiance settings: -ab ${simulationOptions.ambientBounces} -ad ${simulationOptions.ambientDivisions} -ar ${simulationOptions.ambientResolution} -aa ${simulationOptions.ambientAccuracy} -lw ${simulationOptions.limitWeight}

## Python Setup

1. Create and activate a Python environment.
2. Install:
   - \`bifacial_radiance\`
   - \`pvlib\`
   - \`pandas\`
   - \`numpy\`
3. Ensure Radiance CLI binaries are on \`PATH\` and \`RAYPATH\` is configured.

Example:

\`\`\`bash
python -m pip install --upgrade pip
python -m pip install bifacial_radiance pvlib pandas numpy
export AGRIVOLTAIC_RADIANCE_BIN_DIR="/path/to/Radiance/bin"
export PATH="$AGRIVOLTAIC_RADIANCE_BIN_DIR:$PATH"
export RAYPATH=".:/path/to/Radiance/lib"
\`\`\`

## Running

\`\`\`bash
python run_irradiance_model.py
\`\`\`

## Importing Back Into The App

- Copy the completed package back to the machine running the app.
- On the landing page, open the target project and use \`Import HPC Results\`.
- Select this package folder to register the completed run and open the results visualizer.

## Changing Weather or Location

- Replace \`weather/weather.json\` with a compatible 8760 weather payload.
- Update \`config/request.json\` if you want the site metadata to match the new weather file.
- The geometry and selected sensors can remain unchanged.
`;
}
function periodDayCount(dataset, includedMonths) {
    const hourly = dataset.weather.hourly ?? [];
    if (!hourly.length) {
        return Math.max(includedMonths.length * 30, 1);
    }
    const uniqueDays = new Set(hourly
        .filter((sample) => includedMonths.includes(sample.month))
        .map((sample) => String(sample.timestamp).slice(0, 10)));
    return Math.max(uniqueDays.size, 1);
}
export class AnnualJobService {
    jobs = new Map();
    dataRoot;
    constructor(dataRoot) {
        this.dataRoot = resolveDataRoot(dataRoot);
    }
    async getClientConfig() {
        const bifacialPython = resolveAnnualPythonCommand();
        const bifacialReady = await detectBifacialRadiance(bifacialPython);
        const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN?.trim() ?? "";
        const mapboxPublicToken = mapboxToken.startsWith("pk.") ? mapboxToken : undefined;
        return {
            mapboxTokenAvailable: Boolean(mapboxToken),
            mapboxPublicToken,
            nsrdbKeyAvailable: Boolean(process.env.NSRDB_API_KEY
                || process.env.AGRIVOLTAIC_NSRDB_API_KEY
                || process.env.NREL_API_KEY),
            nsrdbEmailAvailable: Boolean(process.env.NSRDB_EMAIL
                || process.env.AGRIVOLTAIC_CONTACT_EMAIL
                || process.env.NREL_EMAIL),
            geocoderProvider: mapboxToken ? "mapbox" : undefined,
            preferredAnnualEngine: "bifacial_radiance",
            bifacialReady,
            backendVersion: BACKEND_VERSION,
        };
    }
    buildJobRecord(request, engine) {
        const createdAt = nowIso();
        const qualityPreset = resolveAnnualSimulationQualityPreset(request.simulationQualityPreset);
        return annualJobRecordSchema.parse({
            jobId: `job-${randomUUID()}`,
            projectName: request.projectName,
            site: request.site,
            status: "queued",
            phase: "queued",
            progress: 0,
            gridMode: request.sensorConfig.mode,
            engine,
            projectRoot: request.workingDirectory?.trim() || undefined,
            createdAt,
            updatedAt: createdAt,
            notes: [
                "Local irradiance modeling job created.",
                `Requested simulation quality preset: ${ANNUAL_SIMULATION_QUALITY_PRESETS[qualityPreset].label}.`,
            ],
        });
    }
    resolveJobDir(jobId, projectRoot) {
        return resolveJobDirectory(jobId, projectRoot || this.dataRoot);
    }
    async persistJob(record) {
        const jobDir = this.resolveJobDir(record.jobId, record.projectRoot);
        await ensureDirectory(jobDir);
        await writeJson(join(jobDir, "job.json"), record);
    }
    setJob(record) {
        this.jobs.set(record.jobId, record);
        return record;
    }
    async updateJob(jobId, patch) {
        const current = await this.getJobRecord(jobId);
        const next = annualJobRecordSchema.parse({
            ...current,
            ...patch,
            updatedAt: nowIso(),
        });
        this.jobs.set(jobId, next);
        await this.persistJob(next);
        return next;
    }
    async createJob(requestInput) {
        const request = annualSimulationRequestSchema.parse(requestInput);
        const engine = await selectEngine(request.enginePreference);
        const record = this.buildJobRecord(request, engine);
        this.setJob(record);
        await this.persistJob(record);
        this.runJob(record.jobId, request).catch(async (error) => {
            const latest = await this.getJobRecord(record.jobId).catch(() => record);
            await this.updateJob(record.jobId, {
                status: "failed",
                phase: "failed",
                progress: 1,
                completedAt: nowIso(),
                error: error instanceof Error ? error.message : "Unknown irradiance simulation failure",
                notes: appendNotes(latest, "Job failed during background execution."),
            });
        });
        return summarizeJob(record);
    }
    async exportRunAnywherePackage(requestInput) {
        const request = annualSimulationRequestSchema.parse(requestInput);
        const qualityPreset = resolveAnnualSimulationQualityPreset(request.simulationQualityPreset);
        const exportRoot = join(request.workingDirectory?.trim() || this.dataRoot, "exports");
        const weather = await acquireAnnualWeather(request.site);
        const exportPackage = applySensorSelectionToExportPackage(await createExportPackage({
            sceneExport: request.sceneExport,
            sensorConfig: request.sensorConfig,
            sky: defaultSkyForSite(request),
            workingDirectory: exportRoot,
            packageLabel: `${request.projectName}-run-anywhere`,
            materialLibrary: resolveMaterialLibrary(),
            simulationOptions: {
                outputMode: "packageOnly",
                conversionStrategy: "obj2rad",
                ...simulationOptionsForAnnualQualityPreset(qualityPreset),
            },
        }), request.selectedSensorIds);
        await ensureDirectory(exportPackage.packageRoot);
        await ensureDirectory(join(exportPackage.packageRoot, "config"));
        await ensureDirectory(join(exportPackage.packageRoot, "weather"));
        await ensureDirectory(join(exportPackage.packageRoot, "scripts"));
        await ensureDirectory(join(exportPackage.packageRoot, "results"));
        await writeJson(join(exportPackage.packageRoot, "manifest.json"), exportPackage.manifest);
        await writeJson(join(exportPackage.packageRoot, "sensors", "grids.json"), {
            analysis: exportPackage.analysis,
            grids: exportPackage.grids,
        });
        await Promise.all(exportPackage.grids.map((grid) => writeText(join(exportPackage.packageRoot, "sensors", `${grid.gridId}.pts`), grid.radiancePoints)));
        const selectedSensorCount = exportPackage.grids.reduce((sum, grid) => sum + grid.sensors.length, 0);
        const portableJob = buildPortableJobSummary(request, weather.source);
        const portableInput = {
            request: {
                ...request,
                workingDirectory: "__PACKAGE_ROOT__",
            },
            job: portableJob,
            exportPackage: {
                exportPackageId: exportPackage.exportPackageId,
                packageRoot: "__PACKAGE_ROOT__",
                manifest: exportPackage.manifest,
                analysis: exportPackage.analysis,
                grids: exportPackage.grids,
            },
            weather,
        };
        const runnerSource = await readFile(fileURLToPath(new URL("../../python/run_bifacial_annual.py", import.meta.url)), "utf8");
        const wrapperSource = `#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "config" / "simulation-input.template.json"
INPUT_PATH = ROOT / "config" / "simulation-input.runtime.json"
OUTPUT_PATH = ROOT / "results" / "irradiance-results.json"
LOG_PATH = ROOT / "results" / "irradiance-runner.log"
PROGRESS_PATH = ROOT / "results" / "irradiance-progress.json"
RUNNER = ROOT / "scripts" / "run_bifacial_annual.py"
WEATHER_PATH = ROOT / "weather" / "weather.json"

payload = json.loads(TEMPLATE.read_text("utf8"))
payload["request"]["workingDirectory"] = str(ROOT)
payload["exportPackage"]["packageRoot"] = str(ROOT)
payload["weather"] = json.loads(WEATHER_PATH.read_text("utf8"))

if "--weather" in sys.argv:
    weather_index = sys.argv.index("--weather")
    weather_path = Path(sys.argv[weather_index + 1]).resolve()
    payload["weather"] = json.loads(weather_path.read_text("utf8"))

INPUT_PATH.write_text(json.dumps(payload, indent=2), "utf8")

command = [
    sys.executable,
    str(RUNNER),
    "--input", str(INPUT_PATH),
    "--output", str(OUTPUT_PATH),
    "--log", str(LOG_PATH),
    "--progress", str(PROGRESS_PATH),
]
subprocess.run(command, check=True)
print(f"Irradiance results written to {OUTPUT_PATH}")
`;
        await writeJson(join(exportPackage.packageRoot, "config", "request.json"), request);
        await writeJson(join(exportPackage.packageRoot, "config", "selected-sensors.json"), {
            selectedSensorIds: request.selectedSensorIds ?? [],
            selectedSensorCount,
        });
        await writeJson(join(exportPackage.packageRoot, "config", "simulation-input.template.json"), portableInput);
        await writeJson(join(exportPackage.packageRoot, "weather", "weather.json"), weather);
        await writeText(join(exportPackage.packageRoot, "scripts", "run_bifacial_annual.py"), runnerSource);
        await writeText(join(exportPackage.packageRoot, "run_irradiance_model.py"), wrapperSource);
        await writeText(join(exportPackage.packageRoot, "requirements.txt"), "bifacial_radiance\npvlib\npandas\nnumpy\n");
        await writeText(join(exportPackage.packageRoot, "README.md"), runAnywhereReadme(request, weather.providerLabel ?? weather.source, selectedSensorCount));
        return {
            packageRoot: exportPackage.packageRoot,
            exportPackageId: exportPackage.exportPackageId,
            selectedSensorCount,
            weatherSource: weather.providerLabel ?? weather.source,
        };
    }
    async runJob(jobId, request) {
        const qualityPreset = resolveAnnualSimulationQualityPreset(request.simulationQualityPreset);
        const jobDir = this.resolveJobDir(jobId, request.workingDirectory?.trim());
        await ensureDirectory(jobDir);
        await writeJson(join(jobDir, "request.json"), request);
        const runnerLogPath = join(jobDir, "logs", "bifacial-radiance-runner.log");
        let record = await this.updateJob(jobId, {
            status: "running",
            phase: "preparing_geometry",
            progress: 0.08,
            startedAt: nowIso(),
            logPath: runnerLogPath,
            notes: appendNotes(await this.getJobRecord(jobId), "Preparing simulation geometry and Radiance package."),
        });
        const exportPackage = applySensorSelectionToExportPackage(await createExportPackage({
            sceneExport: request.sceneExport,
            sensorConfig: request.sensorConfig,
            sky: defaultSkyForSite(request),
            workingDirectory: jobDir,
            packageLabel: request.projectName,
            materialLibrary: resolveMaterialLibrary(),
            simulationOptions: {
                outputMode: "packageOnly",
                conversionStrategy: "obj2rad",
                ...simulationOptionsForAnnualQualityPreset(qualityPreset),
            },
        }), request.selectedSensorIds);
        record = await this.updateJob(jobId, {
            exportPackageId: exportPackage.exportPackageId,
            exportPackageRoot: exportPackage.packageRoot,
            phase: "acquiring_weather",
            progress: 0.22,
            notes: appendNotes(record, `Geometry packaged with ${exportPackage.grids.reduce((sum, grid) => sum + grid.sensors.length, 0)} selected sensors. Acquiring 8760 weather data.`, `Radiance tracing quality preset resolved to ${ANNUAL_SIMULATION_QUALITY_PRESETS[qualityPreset].label}.`),
        });
        const weather = await acquireAnnualWeather(request.site);
        await writeJson(join(jobDir, "weather.json"), weather);
        record = await this.updateJob(jobId, {
            phase: "generating_tracker_states",
            progress: 0.38,
            weatherSource: weather.source,
            notes: appendNotes(record, `Weather source: ${weather.providerLabel ?? weather.source}.`, ...(weather.notes ?? [])),
        });
        record = await this.updateJob(jobId, {
            phase: "building_scene",
            progress: 0.52,
            notes: appendNotes(record, `Selected engine: ${record.engine}.`),
        });
        let dataset;
        if (record.engine === "bifacial_radiance") {
            record = await this.updateJob(jobId, {
                phase: "running_simulation",
                progress: 0.68,
                notes: appendNotes(record, "Launching bifacial_radiance irradiance workflow."),
            });
            dataset = await runBifacialRadianceEngine({
                request,
                job: summarizeJob(await this.getJobRecord(jobId)),
                exportPackage,
                weather,
                workingDirectory: jobDir,
            });
        }
        else {
            record = await this.updateJob(jobId, {
                phase: "running_simulation",
                progress: 0.68,
                notes: appendNotes(record, "Running local synthetic irradiance workflow."),
            });
            dataset = await runSyntheticAnnualEngine({
                request,
                job: summarizeJob(await this.getJobRecord(jobId)),
                exportPackage,
                weather,
            });
        }
        record = await this.updateJob(jobId, {
            phase: "post_processing",
            progress: 0.9,
            notes: appendNotes(record, "Writing irradiance result artifacts."),
        });
        const resultPath = join(jobDir, "irradiance-results.json");
        await writeJson(resultPath, dataset);
        await this.updateJob(jobId, {
            status: "completed",
            phase: "completed",
            progress: 1,
            completedAt: nowIso(),
            resultPath,
            notes: appendNotes(record, "Irradiance simulation completed successfully."),
        });
    }
    async getJobRecord(jobId, projectRoot) {
        const cached = this.jobs.get(jobId);
        if (cached)
            return cached;
        const candidateRoots = [...new Set([
                projectRoot?.trim(),
                this.dataRoot,
            ].filter(Boolean))];
        for (const root of candidateRoots) {
            const recordPath = join(this.resolveJobDir(jobId, root), "job.json");
            if (!(await pathExists(recordPath))) {
                continue;
            }
            const record = annualJobRecordSchema.parse(await readJson(recordPath));
            this.jobs.set(jobId, record);
            return record;
        }
        throw new Error(`Job ${jobId} was not found`);
    }
    async getJob(jobId, projectRoot) {
        return summarizeJob(await this.getJobRecord(jobId, projectRoot));
    }
    async getJobLogs(jobId, projectRoot) {
        const record = await this.getJobRecord(jobId, projectRoot);
        const jobDir = this.resolveJobDir(jobId, record.projectRoot ?? projectRoot);
        const runnerLogPath = record.logPath || join(jobDir, "logs", "bifacial-radiance-runner.log");
        const launchLogPath = join(jobDir, "logs", "bifacial-radiance-launch.log");
        const progressPath = join(jobDir, "logs", "irradiance-progress.json");
        const chunks = [];
        if (await pathExists(runnerLogPath)) {
            chunks.push(await readText(runnerLogPath));
        }
        if (await pathExists(launchLogPath)) {
            chunks.push(await readText(launchLogPath));
        }
        const lines = chunks
            .flatMap((chunk) => chunk.split(/\r?\n/))
            .filter((line) => line.trim().length > 0);
        return {
            tail: lines.slice(-160).join("\n"),
            lineCount: lines.length,
            progress: await pathExists(progressPath)
                ? await readJson(progressPath)
                : null,
        };
    }
    async getDataset(jobId, projectRoot) {
        const record = await this.getJobRecord(jobId, projectRoot);
        if (!record.resultPath) {
            throw new Error(`Job ${jobId} does not have completed results yet`);
        }
        return annualResultsDatasetSchema.parse(await readJson(record.resultPath));
    }
    async getMetadata(jobId, projectRoot) {
        const record = await this.getJobRecord(jobId, projectRoot);
        const dataset = await this.getDataset(jobId, projectRoot);
        const heightLevelsM = [...new Set(dataset.monthlyAggregates[0]?.sensors
                .map((sensor) => Number(sensor.heightAboveGroundM.toFixed(6)))
                .sort((a, b) => a - b) ?? [])];
        return annualResultsMetadataSchema.parse({
            job: dataset.job,
            site: dataset.job.site,
            availableMetrics: ["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"],
            weather: {
                source: dataset.weather.source,
                providerLabel: dataset.weather.providerLabel,
                notes: dataset.weather.notes,
                annualGhiWhM2: dataset.weather.annualGhiWhM2,
                monthlyGhiWhM2: dataset.weather.monthlyGhiWhM2,
                records: dataset.weather.records,
            },
            designState: annualSimulationRequestSchema.parse(await readJson(join(this.resolveJobDir(jobId, record.projectRoot ?? projectRoot), "request.json"))).designState,
            exportPackageId: dataset.exportPackage.exportPackageId,
            gridMode: dataset.job.gridMode,
            totalGrids: dataset.monthlyAggregates.length,
            gridIds: dataset.monthlyAggregates.map((grid) => grid.gridId),
            availableHeightLevels: heightLevelsM.length || dataset.monthlyAggregates[0]?.dimensions[2] || 5,
            heightLevelsM,
            classifications: [...new Set(dataset.monthlyAggregates.flatMap((grid) => grid.classification))].sort(),
        });
    }
    async getResultsView(jobId, requestInput, projectRoot) {
        const request = annualResultsViewRequestSchema.parse(requestInput);
        const dataset = await this.getDataset(jobId, projectRoot);
        const includedMonths = expandMonthRange(request.startMonth, request.endMonth);
        const denominatorGhiWhM2 = sumSelectedMonths(dataset.weather.monthlyGhiWhM2, includedMonths);
        const selectedDayCount = periodDayCount(dataset, includedMonths);
        const selectedGrids = dataset.monthlyAggregates;
        const exportGridMap = new Map(dataset.exportPackage.grids.map((grid) => [grid.gridId, grid]));
        const grids = selectedGrids.map((grid) => {
            const exportGrid = exportGridMap.get(grid.gridId);
            const sliceSensors = grid.sensors.filter((sensor) => sensor.indices[2] === request.heightIndex);
            const cells = grid.sensors
                .filter((sensor) => sensor.indices[2] === request.heightIndex)
                .map((sensor) => {
                const irradianceWhM2 = sumSelectedMonths(sensor.monthlyIrradianceWhM2, includedMonths);
                return {
                    sensorId: sensor.sensorId,
                    gridId: grid.gridId,
                    position: sensor.position,
                    rowIndex: sensor.indices[0],
                    colIndex: sensor.indices[1],
                    heightIndex: sensor.indices[2],
                    heightAboveGroundM: sensor.heightAboveGroundM,
                    value: convertMetric(request.metric, irradianceWhM2, denominatorGhiWhM2, selectedDayCount).value,
                };
            });
            const summary = summarizeNumeric(cells.map((cell) => cell.value));
            const heightAboveGroundM = sliceSensors[0]?.heightAboveGroundM ?? 0;
            return {
                gridId: grid.gridId,
                rowPairId: grid.rowPairId,
                bayId: grid.bayId ?? undefined,
                classifications: grid.classification,
                dimensions: grid.dimensions,
                localFrame: exportGrid?.localFrame,
                bounds: exportGrid?.bounds,
                heightIndex: request.heightIndex,
                heightAboveGroundM,
                cells,
                min: summary.min,
                max: summary.max,
                mean: summary.mean,
            };
        }).filter((grid) => grid.cells.length > 0);
        const allValues = grids.flatMap((grid) => grid.cells.map((cell) => cell.value));
        const overall = summarizeNumeric(allValues);
        const units = convertMetric(request.metric, 0, denominatorGhiWhM2, selectedDayCount).units;
        return {
            jobId,
            metric: request.metric,
            units,
            heightIndex: request.heightIndex,
            startMonth: request.startMonth,
            endMonth: request.endMonth,
            includedMonths,
            denominatorGhiWhM2,
            grids,
            overall,
            edgeInterior: buildEdgeInteriorSummary(grids),
        };
    }
    async exportJobBundle(jobId, projectRoot) {
        const dataset = await this.getDataset(jobId, projectRoot);
        const metadata = await this.getMetadata(jobId, projectRoot);
        return {
            metadata,
            dataset,
        };
    }
}
