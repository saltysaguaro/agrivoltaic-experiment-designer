import type { SimulationExecutionResult } from "@agrivoltaic/shared";
export type JobStatus = "queued" | "running" | "completed" | "failed";
export interface JobRecord {
    id: string;
    status: JobStatus;
    result?: SimulationExecutionResult;
    error?: string;
    createdAt: string;
}
export declare class InMemoryJobStore {
    private readonly jobs;
    create(id: string): JobRecord;
    update(id: string, patch: Partial<JobRecord>): JobRecord;
    get(id: string): JobRecord | undefined;
}
