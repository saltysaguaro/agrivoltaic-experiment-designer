import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AnnualJobService } from "../packages/simulation-backend/src/annual/job-service.js";
import { ANNUAL_SIMULATION_QUALITY_PRESETS } from "../packages/shared/src/index.js";

test("AnnualJobService can run a local synthetic job end-to-end", async () => {
  const root = await mkdtemp(join(tmpdir(), "agrivoltaic-job-"));
  const previousEngine = process.env.AGRIVOLTAIC_ENGINE;
  const previousAllowSynthetic = process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC;
  const previousWeatherMode = process.env.AGRIVOLTAIC_WEATHER_MODE;
  process.env.AGRIVOLTAIC_ENGINE = "synthetic_local";
  process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC = "true";
  process.env.AGRIVOLTAIC_WEATHER_MODE = "synthetic";

  try {
    const service = new AnnualJobService(root);
    const job = await service.createJob({
      projectName: "Synthetic Annual Test",
      site: {
        address: "Phoenix, AZ",
        label: "Phoenix, AZ",
        latitude: 33.4484,
        longitude: -112.074,
        timezone: "America/Phoenix",
        source: "fallback",
      },
      designState: {
        systemType: "fixed",
      },
      serializedConfig: {
        system: { type: "fixed" },
      },
      sceneExport: {
        sceneManifest: {
          sceneId: "manual-scene",
          createdAt: "2026-03-14T00:00:00.000Z",
          source: "three.js",
          exporterVersion: "0.2.0",
          geometryFormat: "obj",
          selection: { mode: "taggedScene" },
          geometrySourceMode: "simulationMesh",
          combinedGeometryPath: "geometry/scene.obj",
          geometryHash: "manual-hash",
          objects: [],
          assets: [],
        },
        files: [{
          relativePath: "geometry/scene.obj",
          contents: "# empty geometry\n",
          sha256: "manual-hash",
          contentType: "text/plain",
        }],
      },
      sensorConfig: {
        mode: "centerArrayGrid",
        dimensions: [2, 2, 2],
        boundsMode: "manual",
        verticalExtentMode: "customHeight",
        normalMode: "upward",
        explicitFrame: {
          origin: { x: 0, y: 0, z: 1 },
          eRow: { x: 1, y: 0, z: 0 },
          eCross: { x: 0, y: 1, z: 0 },
          eUp: { x: 0, y: 0, z: 1 },
        },
        explicitBounds: {
          center: { x: 0, y: 0, z: 1 },
          lengthRow: 4,
          lengthCross: 4,
          height: 2,
        },
        customHeight: 2,
      },
      enginePreference: "synthetic_local",
      simulationQualityPreset: "low",
      workingDirectory: root,
    });

    let current = await service.getJob(job.jobId);
    for (let attempt = 0; attempt < 60; attempt++) {
      if (current.status === "completed" || current.status === "failed") break;
      await new Promise((resolve) => setTimeout(resolve, 50));
      current = await service.getJob(job.jobId);
    }

    assert.equal(current.status, "completed");
    assert.ok(current.notes.some((note) => note.includes("Preparing simulation geometry")));
    assert.ok(current.notes.some((note) => note.includes("Writing irradiance result artifacts")));
    assert.ok(current.notes.some((note) => note.includes("completed successfully")));
    const record = await service.getJobRecord(job.jobId);
    assert.ok(record.resultPath);
    await access(record.resultPath);
    assert.ok(record.exportPackageRoot);
    const manifest = JSON.parse(await readFile(join(record.exportPackageRoot!, "manifest.json"), "utf8"));
    assert.equal(manifest.simulationOptions.ambientBounces, ANNUAL_SIMULATION_QUALITY_PRESETS.low.simulationOptions.ambientBounces);
    assert.equal(manifest.simulationOptions.ambientDivisions, ANNUAL_SIMULATION_QUALITY_PRESETS.low.simulationOptions.ambientDivisions);
    const metadata = await service.getMetadata(job.jobId);
    assert.equal(metadata.totalGrids, 1);
    assert.deepEqual(metadata.gridIds, ["grid-manual-01"]);
    const view = await service.getResultsView(job.jobId, {
      metric: "annualIrradiance",
      heightIndex: 0,
      startMonth: 1,
      endMonth: 12,
    });
    assert.equal(view.grids.length, 1);
    assert.ok(view.overall.mean > 0);

    const restartedService = new AnnualJobService();
    const restartedJob = await restartedService.getJob(job.jobId, root);
    assert.equal(restartedJob.status, "completed");
  } finally {
    process.env.AGRIVOLTAIC_ENGINE = previousEngine;
    process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC = previousAllowSynthetic;
    process.env.AGRIVOLTAIC_WEATHER_MODE = previousWeatherMode;
  }
});

test("AnnualJobService exports a portable HPC package with a runnable template job payload", async () => {
  const root = await mkdtemp(join(tmpdir(), "agrivoltaic-export-"));
  const previousWeatherMode = process.env.AGRIVOLTAIC_WEATHER_MODE;
  const previousAllowSynthetic = process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC;
  process.env.AGRIVOLTAIC_WEATHER_MODE = "synthetic";
  process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC = "true";

  try {
    const service = new AnnualJobService(root);
    const exported = await service.exportRunAnywherePackage({
      projectName: "Portable Export Test",
      site: {
        address: "Phoenix, AZ",
        label: "Phoenix, AZ",
        latitude: 33.4484,
        longitude: -112.074,
        timezone: "America/Phoenix",
        source: "fallback",
      },
      designState: {
        systemType: "fixed",
      },
      serializedConfig: {
        system: { type: "fixed" },
      },
      sceneExport: {
        sceneManifest: {
          sceneId: "portable-scene",
          createdAt: "2026-03-14T00:00:00.000Z",
          source: "three.js",
          exporterVersion: "0.2.0",
          geometryFormat: "obj",
          selection: { mode: "taggedScene" },
          geometrySourceMode: "simulationMesh",
          combinedGeometryPath: "geometry/scene.obj",
          geometryHash: "portable-hash",
          objects: [],
          assets: [],
        },
        files: [{
          relativePath: "geometry/scene.obj",
          contents: "# empty geometry\n",
          sha256: "portable-hash",
          contentType: "text/plain",
        }],
      },
      sensorConfig: {
        mode: "centerArrayGrid",
        dimensions: [2, 2, 2],
        boundsMode: "manual",
        verticalExtentMode: "customHeight",
        normalMode: "upward",
        explicitFrame: {
          origin: { x: 0, y: 0, z: 1 },
          eRow: { x: 1, y: 0, z: 0 },
          eCross: { x: 0, y: 1, z: 0 },
          eUp: { x: 0, y: 0, z: 1 },
        },
        explicitBounds: {
          center: { x: 0, y: 0, z: 1 },
          lengthRow: 4,
          lengthCross: 4,
          height: 2,
        },
        customHeight: 2,
      },
      simulationQualityPreset: "medium",
      workingDirectory: root,
    });

    const template = JSON.parse(await readFile(join(exported.packageRoot, "config", "simulation-input.template.json"), "utf8"));
    assert.equal(template.request.projectName, "Portable Export Test");
    assert.equal(template.job.engine, "bifacial_radiance");
    assert.equal(template.job.gridMode, "centerArrayGrid");
    assert.equal(template.exportPackage.packageRoot, "__PACKAGE_ROOT__");
    await access(join(exported.packageRoot, "run_irradiance_model.py"));
  } finally {
    process.env.AGRIVOLTAIC_WEATHER_MODE = previousWeatherMode;
    process.env.AGRIVOLTAIC_ALLOW_SYNTHETIC = previousAllowSynthetic;
  }
});
