import express from "express";
import type { Request, Response } from "express";
import type { Express } from "express";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  createSimulationPackage,
  importSimulationResults,
  runSimulation,
} from "../runner/simulation-runner.js";
import { InMemoryJobStore } from "../runner/job-store.js";
import { AnnualJobService } from "../annual/job-service.js";
import {
  MAPBOX_NOT_CONFIGURED_MESSAGE,
  MapboxNotConfiguredError,
  MapboxResolutionError,
  resolveSitePlace,
  searchSitePlaces,
} from "../site/mapbox.js";
import { ProjectService } from "../projects/project-service.js";
import { normalizeDirectoryPath } from "../annual/storage.js";

export const STATIC_PAGES = new Map<string, string>([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/design.html", "design.html"],
  ["/public-visualizer.html", "public-visualizer.html"],
  ["/sensor-layout.html", "sensor-layout.html"],
  ["/model-run.html", "model-run.html"],
  ["/results.html", "results.html"],
  ["/3D_visualizer.html", "3D_visualizer.html"],
]);

export const STATIC_FILES = new Map<string, string>([
  ["/platform.css", "platform.css"],
  ["/public-visualizer.css", "public-visualizer.css"],
  ["/public-visualizer.config.js", "public-visualizer.config.js"],
  ["/styles.css", "styles.css"],
]);

export const PUBLIC_STATIC_DIRS = [
  "/src",
  "/packages/shared/dist",
  "/packages/three-exporter/dist",
  "/packages/simulation-backend/dist",
  "/node_modules/three",
  "/node_modules/zod",
] as const;

export function isTrustedLocalOrigin(origin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  return hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname === "127.0.0.1"
    || hostname === "0.0.0.0"
    || hostname === "::1";
}

export function createSimulationServer(): Express {
  const app = express();
  app.disable("x-powered-by");
  const jobs = new InMemoryJobStore();
  const annualJobs = new AnnualJobService();
  const projects = new ProjectService();
  const rootDir = fileURLToPath(new URL("../../../../", import.meta.url));

  function queryProjectRoot(req: Request): string | undefined {
    return typeof req.query.projectRoot === "string" && req.query.projectRoot.trim()
      ? normalizeDirectoryPath(req.query.projectRoot, "Project root")
      : undefined;
  }

  async function pickFolder(prompt: string): Promise<string> {
    if (process.platform !== "darwin") {
      throw new Error("Folder browsing is currently implemented for macOS local runs. Enter the path manually on this platform.");
    }

    return new Promise((resolve, reject) => {
      const child = spawn("osascript", [
        "-e",
        `POSIX path of (choose folder with prompt "${prompt.replace(/"/g, "\\\"")}")`,
      ]);
      const stdout: string[] = [];
      const stderr: string[] = [];

      child.stdout.on("data", (chunk) => stdout.push(String(chunk)));
      child.stderr.on("data", (chunk) => stderr.push(String(chunk)));
      child.on("error", (error) => reject(error));
      child.on("close", (code) => {
        if (code !== 0) {
          const message = stderr.join("").trim() || "Folder selection was cancelled.";
          reject(new Error(message));
          return;
        }
        const folderPath = stdout.join("").trim();
        if (!folderPath) {
          reject(new Error("Folder selection was cancelled."));
          return;
        }
        resolve(folderPath);
      });
    });
  }

  app.use(express.json({ limit: "80mb" }));
  app.use((req: Request, res: Response, next) => {
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
    res.header("Vary", "Origin");
    res.header("X-Content-Type-Options", "nosniff");
    res.header("Referrer-Policy", "no-referrer");
    res.header("Cross-Origin-Resource-Policy", "same-origin");

    if (origin) {
      if (!isTrustedLocalOrigin(origin)) {
        res.status(403).json({ error: "Cross-origin requests are limited to local origins." });
        return;
      }
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/api/config/client", async (_req: Request, res: Response) => {
    res.status(200).json(await annualJobs.getClientConfig());
  });

  app.get("/api/site/autocomplete", async (req: Request, res: Response) => {
    const query = String(req.query.q ?? "").trim();
    const token = process.env.MAPBOX_ACCESS_TOKEN?.trim() ?? "";

    if (!query) {
      res.status(200).json({ suggestions: [], provider: "mapbox" });
      return;
    }
    if (!token) {
      res.status(503).json({ error: MAPBOX_NOT_CONFIGURED_MESSAGE });
      return;
    }

    try {
      const result = await searchSitePlaces(query, {
        accessToken: token,
        limit: 5,
      });
      res.status(200).json({
        suggestions: result.suggestions,
        provider: result.provider,
      });
    } catch (error) {
      res.status(error instanceof MapboxNotConfiguredError ? 503 : 502).json({
        error: error instanceof Error ? error.message : "Address lookup failed",
      });
    }
  });

  app.get("/api/site/resolve", async (req: Request, res: Response) => {
    const query = String(req.query.q ?? "").trim();
    const token = process.env.MAPBOX_ACCESS_TOKEN?.trim() ?? "";

    if (!token) {
      res.status(503).json({ error: MAPBOX_NOT_CONFIGURED_MESSAGE });
      return;
    }
    if (!query) {
      res.status(400).json({ error: "Enter an address or place name to verify with Mapbox." });
      return;
    }

    try {
      const result = await resolveSitePlace(query, {
        accessToken: token,
      });
      res.status(200).json({
        suggestion: result.suggestion,
        provider: result.provider,
      });
    } catch (error) {
      const statusCode = error instanceof MapboxResolutionError ? 404 : 502;
      res.status(statusCode).json({
        error: error instanceof Error ? error.message : "Address verification failed",
      });
    }
  });

  app.post("/api/jobs/annual", async (req: Request, res: Response) => {
    try {
      const job = await annualJobs.createJob(req.body);
      res.status(202).json(job);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown annual job error",
      });
    }
  });

  app.post("/api/jobs/export-run-anywhere", async (req: Request, res: Response) => {
    try {
      const result = await annualJobs.exportRunAnywherePackage(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not export the run-anywhere package",
      });
    }
  });

  app.post("/api/projects/open", async (req: Request, res: Response) => {
    try {
      const project = await projects.openProjectFolder({
        rootPath: String(req.body?.rootPath ?? ""),
        projectName: typeof req.body?.projectName === "string" ? req.body.projectName : undefined,
      });
      res.status(200).json(project);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not open the project folder",
      });
    }
  });

  app.post("/api/projects/pick-folder", async (_req: Request, res: Response) => {
    try {
      const folderPath = await pickFolder("Select the project parent folder");
      res.status(200).json({ folderPath });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not choose a project folder",
      });
    }
  });

  app.post("/api/projects/pick-hpc-folder", async (_req: Request, res: Response) => {
    try {
      const folderPath = await pickFolder("Select the completed HPC results package folder");
      res.status(200).json({ folderPath });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not choose the HPC results folder",
      });
    }
  });

  app.post("/api/projects/save", async (req: Request, res: Response) => {
    try {
      const result = await projects.saveProjectSnapshot({
        rootPath: String(req.body?.rootPath ?? ""),
        snapshot: typeof req.body?.snapshot === "object" && req.body.snapshot !== null
          ? req.body.snapshot
          : {},
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not save the project snapshot",
      });
    }
  });

  app.post("/api/projects/import-hpc-results", async (req: Request, res: Response) => {
    try {
      const result = await projects.importHpcResults({
        rootPath: String(req.body?.rootPath ?? ""),
        packageRoot: String(req.body?.packageRoot ?? ""),
        jobId: typeof req.body?.jobId === "string" ? req.body.jobId : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not import HPC results",
      });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await annualJobs.getJob(jobId, queryProjectRoot(req));
      res.status(200).json(job);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : "Job not found",
      });
    }
  });

  app.get("/api/jobs/:id/status", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await annualJobs.getJob(jobId, queryProjectRoot(req));
      res.status(200).json(job);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : "Job not found",
      });
    }
  });

  app.get("/api/jobs/:id/logs", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const logs = await annualJobs.getJobLogs(jobId, queryProjectRoot(req));
      res.status(200).json(logs);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : "Job logs not found",
      });
    }
  });

  app.get("/api/jobs/:id/results/metadata", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const metadata = await annualJobs.getMetadata(jobId, queryProjectRoot(req));
      res.status(200).json(metadata);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : "Result metadata not found",
      });
    }
  });

  app.get("/api/jobs/:id/results/view", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const view = await annualJobs.getResultsView(jobId, {
        metric: String(req.query.metric ?? "annualIrradiance"),
        heightIndex: Number(req.query.heightIndex ?? 0),
        startMonth: Number(req.query.startMonth ?? 1),
        endMonth: Number(req.query.endMonth ?? 12),
      }, queryProjectRoot(req));
      res.status(200).json(view);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not build results view",
      });
    }
  });

  app.get("/api/jobs/:id/export", async (req: Request, res: Response) => {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const bundle = await annualJobs.exportJobBundle(jobId, queryProjectRoot(req));
      res.status(200).json(bundle);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : "Export bundle not found",
      });
    }
  });

  app.post("/export-package", async (req: Request, res: Response) => {
    try {
      const result = await createSimulationPackage(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown export-package error",
      });
    }
  });

  app.post("/simulate", async (req: Request, res: Response) => {
    try {
      const result = await runSimulation(req.body);
      const record = jobs.create(result.simulationId);
      jobs.update(record.id, { status: "completed", result });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown simulation error",
      });
    }
  });

  app.post("/import-results", async (req: Request, res: Response) => {
    try {
      const result = await importSimulationResults(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown import-results error",
      });
    }
  });

  app.post("/simulation/run", async (req: Request, res: Response) => {
    const id = `job-${Date.now()}`;
    jobs.create(id);
    res.status(202).json({ simulationId: id, status: "queued" });

    runSimulation(req.body)
      .then((result) => jobs.update(id, { status: "completed", result }))
      .catch((error) => jobs.update(id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
  });

  app.get("/simulation/:id/status", (req: Request, res: Response) => {
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = jobs.get(jobId);
    if (!record) {
      res.status(404).json({ error: "Simulation not found" });
      return;
    }

    res.status(200).json({
      simulationId: record.id,
      status: record.status,
      error: record.error,
    });
  });

  app.get("/simulation/:id/result", (req: Request, res: Response) => {
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = jobs.get(jobId);
    if (!record) {
      res.status(404).json({ error: "Simulation not found" });
      return;
    }

    if (!record.result) {
      res.status(202).json({
        simulationId: record.id,
        status: record.status,
      });
      return;
    }

    res.status(200).json(record.result);
  });

  app.use(PUBLIC_STATIC_DIRS[0], express.static(join(rootDir, "src"), { index: false }));
  app.use(
    PUBLIC_STATIC_DIRS[1],
    express.static(join(rootDir, "packages", "shared", "dist"), { index: false }),
  );
  app.use(
    PUBLIC_STATIC_DIRS[2],
    express.static(join(rootDir, "packages", "three-exporter", "dist"), { index: false }),
  );
  app.use(
    PUBLIC_STATIC_DIRS[3],
    express.static(join(rootDir, "packages", "simulation-backend", "dist"), { index: false }),
  );
  app.use(
    PUBLIC_STATIC_DIRS[4],
    express.static(join(rootDir, "node_modules", "three"), { index: false }),
  );
  app.use(
    PUBLIC_STATIC_DIRS[5],
    express.static(join(rootDir, "node_modules", "zod"), { index: false }),
  );

  for (const [route, fileName] of STATIC_PAGES) {
    app.get(route, (_req: Request, res: Response) => {
      res.sendFile(join(rootDir, fileName));
    });
  }

  for (const [route, fileName] of STATIC_FILES) {
    app.get(route, (_req: Request, res: Response) => {
      res.sendFile(join(rootDir, fileName));
    });
  }

  app.get("/design", (_req: Request, res: Response) => {
    res.redirect(302, "/design.html");
  });

  app.get("/public-visualizer", (_req: Request, res: Response) => {
    res.redirect(302, "/public-visualizer.html");
  });

  app.get("/model/run/:id", (_req: Request, res: Response) => {
    res.sendFile(join(rootDir, "model-run.html"));
  });

  app.get("/results/:id", (_req: Request, res: Response) => {
    res.sendFile(join(rootDir, "results.html"));
  });

  return app;
}
