import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { ProjectService } from "../packages/simulation-backend/src/projects/project-service.js";

test("ProjectService can create, save, and reopen a local project snapshot", async () => {
  const root = await mkdtemp(join(tmpdir(), "agrivoltaic-project-"));
  const service = new ProjectService();

  const created = await service.openProjectFolder({
    rootPath: root,
    projectName: "Tucson Agrivoltaic Study",
  });

  assert.equal(created.exists, false);
  assert.equal(created.snapshot.project.name, "Tucson Agrivoltaic Study");
  assert.equal(basename(created.snapshot.project.rootPath), "tucson-agrivoltaic-study");

  await service.saveProjectSnapshot({
    rootPath: created.snapshot.project.rootPath,
    snapshot: {
      project: {
        name: "Tucson Agrivoltaic Study",
      },
      site: {
        address: "Tucson, Arizona, United States",
        label: "Tucson, Arizona, United States",
        latitude: 32.2226,
        longitude: -110.9747,
        timezone: "America/Phoenix",
        source: "fallback",
      },
      designState: {
        systemType: "fixed",
        dcSizeKw: 250,
      },
      serializedConfig: {
        system: { type: "fixed" },
      },
      lastJobId: "job-123",
      jobs: {
        "job-123": {
          jobId: "job-123",
          projectName: "Tucson Agrivoltaic Study",
          site: {
            address: "Tucson, Arizona, United States",
            label: "Tucson, Arizona, United States",
            latitude: 32.2226,
            longitude: -110.9747,
            timezone: "America/Phoenix",
            source: "fallback",
          },
          status: "queued",
          phase: "queued",
          progress: 0,
          gridMode: "centerArrayGrid",
          engine: "bifacial_radiance",
          createdAt: "2026-03-16T00:00:00.000Z",
          updatedAt: "2026-03-16T00:00:00.000Z",
          notes: [],
        },
      },
    },
  });

  const reopened = await service.openProjectFolder({
    rootPath: root,
    projectName: "Tucson Agrivoltaic Study",
  });

  assert.equal(reopened.exists, true);
  assert.equal(reopened.snapshot.site?.label, "Tucson, Arizona, United States");
  assert.equal(reopened.snapshot.designState?.dcSizeKw, 250);
  assert.equal(reopened.snapshot.lastJobId, "job-123");
});

test("ProjectService can import completed HPC results into a project job", async () => {
  const root = await mkdtemp(join(tmpdir(), "agrivoltaic-project-import-"));
  const packageRoot = await mkdtemp(join(tmpdir(), "agrivoltaic-hpc-package-"));
  const service = new ProjectService();

  const created = await service.openProjectFolder({
    rootPath: root,
    projectName: "Imported HPC Study",
  });

  const request = {
    projectName: "Imported HPC Study",
    site: {
      address: "Tucson, Arizona, United States",
      label: "Tucson, Arizona, United States",
      latitude: 32.2226,
      longitude: -110.9747,
      timezone: "America/Phoenix",
      source: "fallback",
    },
    designState: {
      systemType: "fixed",
      dcSizeKw: 250,
    },
    serializedConfig: {
      system: { type: "fixed" },
    },
    sceneExport: {
      sceneManifest: {
        sceneId: "imported-scene",
        createdAt: "2026-03-25T00:00:00.000Z",
        source: "three.js",
        exporterVersion: "0.2.0",
        geometryFormat: "obj",
        selection: { mode: "taggedScene" },
        geometrySourceMode: "simulationMesh",
        combinedGeometryPath: "geometry/scene.obj",
        geometryHash: "imported-hash",
        objects: [],
        assets: [],
      },
      files: [{
        relativePath: "geometry/scene.obj",
        contents: "# empty geometry\n",
        sha256: "imported-hash",
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
    selectedSensorIds: ["sensor-1"],
    simulationQualityPreset: "medium",
    enginePreference: "bifacial_radiance",
    workingDirectory: created.snapshot.project.rootPath,
  };

  const dataset = {
    job: {
      jobId: "job-exported-hpc",
      projectName: "Imported HPC Study",
      site: request.site,
      status: "completed",
      phase: "completed",
      progress: 1,
      gridMode: "centerArrayGrid",
      engine: "bifacial_radiance",
      createdAt: "2026-03-25T00:00:00.000Z",
      updatedAt: "2026-03-25T01:00:00.000Z",
      startedAt: "2026-03-25T00:05:00.000Z",
      completedAt: "2026-03-25T01:00:00.000Z",
      weatherSource: "nsrdb_tmy",
      notes: ["Portable run completed on the HPC."],
    },
    exportPackage: {
      exportPackageId: "pkg-import-1",
      analysis: {},
      manifest: {},
      grids: [{
        gridId: "grid-manual-01",
        rowPairId: "row-pair-01",
        classifications: ["interior"],
        dimensions: [2, 2, 2],
      }],
    },
    weather: {
      source: "nsrdb_tmy",
      site: request.site,
      retrievedAt: "2026-03-25T00:00:00.000Z",
      timezone: "America/Phoenix",
      providerLabel: "NSRDB GOES TMY",
      records: 8760,
      annualGhiWhM2: 1200,
      annualDniWhM2: 800,
      annualDhiWhM2: 400,
      monthlyGhiWhM2: Array(12).fill(100),
      monthlyDniWhM2: Array(12).fill(60),
      monthlyDhiWhM2: Array(12).fill(40),
      hourly: [{
        timestamp: "2026-01-01T00:00:00.000Z",
        month: 1,
        hourIndex: 0,
        ghi: 0,
        dni: 0,
        dhi: 0,
        sunAzDeg: 0,
        sunElDeg: -10,
      }],
    },
    dataResolution: "monthly_aggregate",
    monthlyAggregates: [{
      gridId: "grid-manual-01",
      classification: ["interior"],
      dimensions: [2, 2, 2],
      rowPairId: "row-pair-01",
      sensors: [{
        sensorId: "sensor-1",
        gridId: "grid-manual-01",
        position: { x: 0, y: 0, z: 1 },
        indices: [0, 0, 0],
        normalized: [0, 0, 0],
        heightAboveGroundM: 0.5,
        monthlyIrradianceWhM2: Array(12).fill(10),
      }],
    }],
    provenance: {
      engine: "bifacial_radiance",
      generatedAt: "2026-03-25T01:00:00.000Z",
      notes: ["Imported dataset fixture."],
    },
  };

  await mkdir(join(packageRoot, "config"), { recursive: true });
  await mkdir(join(packageRoot, "weather"), { recursive: true });
  await mkdir(join(packageRoot, "results"), { recursive: true });
  await writeFile(join(packageRoot, "config", "request.json"), JSON.stringify(request, null, 2), "utf8");
  await writeFile(join(packageRoot, "weather", "weather.json"), JSON.stringify(dataset.weather, null, 2), "utf8");
  await writeFile(join(packageRoot, "results", "irradiance-results.json"), JSON.stringify(dataset, null, 2), "utf8");
  await writeFile(join(packageRoot, "results", "irradiance-runner.log"), "Imported HPC runner log\n", "utf8");

  const imported = await service.importHpcResults({
    rootPath: created.snapshot.project.rootPath,
    packageRoot,
    jobId: "job-hpc-import-001",
  });

  assert.equal(imported.importedJob.jobId, "job-hpc-import-001");
  assert.equal(imported.snapshot.lastJobId, "job-hpc-import-001");
  assert.equal(imported.snapshot.jobs?.["job-hpc-import-001"]?.status, "completed");

  const record = JSON.parse(await readFile(join(imported.jobDirectory, "job.json"), "utf8"));
  assert.equal(record.resultPath, join(imported.jobDirectory, "results", "irradiance-results.json"));

  const copiedDataset = JSON.parse(await readFile(join(imported.jobDirectory, "results", "irradiance-results.json"), "utf8"));
  assert.equal(copiedDataset.exportPackage.exportPackageId, "pkg-import-1");
});
