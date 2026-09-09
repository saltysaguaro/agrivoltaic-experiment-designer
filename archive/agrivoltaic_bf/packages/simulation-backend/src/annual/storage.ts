import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join, resolve } from "node:path";

const SAFE_JOB_ID = /^job-[a-z0-9][a-z0-9-]*$/i;

export function normalizeDirectoryPath(input: string, label = "Path"): string {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  if (trimmed.includes("\0")) {
    throw new Error(`${label} contains invalid characters.`);
  }
  return resolve(trimmed);
}

export function assertSafeJobId(jobId: string): string {
  const trimmed = String(jobId ?? "").trim();
  if (!SAFE_JOB_ID.test(trimmed)) {
    throw new Error("Job id format is invalid.");
  }
  return trimmed;
}

export function resolveDataRoot(baseDirectory?: string): string {
  return baseDirectory
    ? normalizeDirectoryPath(baseDirectory, "Data root")
    : join(process.cwd(), "local-data");
}

export function resolveJobsRoot(baseDirectory?: string): string {
  return join(resolveDataRoot(baseDirectory), "jobs");
}

export function resolveJobDirectory(jobId: string, baseDirectory?: string): string {
  return join(resolveJobsRoot(baseDirectory), assertSafeJobId(jobId));
}

export async function ensureDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await ensureDirectory(dirname(path));
  await writeFile(path, JSON.stringify(value, null, 2), "utf8");
}

export async function writeText(path: string, value: string): Promise<void> {
  await ensureDirectory(dirname(path));
  await writeFile(path, value, "utf8");
}

export async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, "utf8");
  return JSON.parse(content) as T;
}

export async function readText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}
