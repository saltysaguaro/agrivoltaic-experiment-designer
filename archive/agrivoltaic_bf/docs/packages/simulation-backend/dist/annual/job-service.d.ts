import { type AnnualJobRecord, type AnnualJobSummary, type AnnualResultsDataset, type AnnualResultsMetadata, type AnnualResultsView, type ClientConfig } from "@agrivoltaic/shared";
export declare class AnnualJobService {
    private readonly jobs;
    private readonly dataRoot;
    constructor(dataRoot?: string);
    getClientConfig(): Promise<ClientConfig>;
    private buildJobRecord;
    private resolveJobDir;
    private persistJob;
    private setJob;
    private updateJob;
    createJob(requestInput: unknown): Promise<AnnualJobSummary>;
    exportRunAnywherePackage(requestInput: unknown): Promise<{
        packageRoot: string;
        exportPackageId: string;
        selectedSensorCount: number;
        weatherSource: string;
    }>;
    private runJob;
    getJobRecord(jobId: string, projectRoot?: string): Promise<AnnualJobRecord>;
    getJob(jobId: string, projectRoot?: string): Promise<AnnualJobSummary>;
    getJobLogs(jobId: string, projectRoot?: string): Promise<{
        tail: string;
        lineCount: number;
        progress: Record<string, unknown> | null;
    }>;
    getDataset(jobId: string, projectRoot?: string): Promise<AnnualResultsDataset>;
    getMetadata(jobId: string, projectRoot?: string): Promise<AnnualResultsMetadata>;
    getResultsView(jobId: string, requestInput: unknown, projectRoot?: string): Promise<AnnualResultsView>;
    exportJobBundle(jobId: string, projectRoot?: string): Promise<unknown>;
}
