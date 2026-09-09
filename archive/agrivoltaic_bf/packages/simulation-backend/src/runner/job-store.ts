import type { SimulationExecutionResult } from "@agrivoltaic/shared";

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface JobRecord {
  id: string;
  status: JobStatus;
  result?: SimulationExecutionResult;
  error?: string;
  createdAt: string;
}

export class InMemoryJobStore {
  private readonly jobs = new Map<string, JobRecord>();

  create(id: string): JobRecord {
    const record: JobRecord = {
      id,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(id, record);
    return record;
  }

  update(id: string, patch: Partial<JobRecord>): JobRecord {
    const current = this.jobs.get(id);
    if (!current) {
      throw new Error(`Unknown simulation job ${id}`);
    }

    const next = { ...current, ...patch };
    this.jobs.set(id, next);
    return next;
  }

  get(id: string): JobRecord | undefined {
    return this.jobs.get(id);
  }
}
