import { type AnnualJobSummary, type LocalProjectSnapshot } from "@agrivoltaic/shared";
export declare const PROJECT_FILE_NAME = "agrivoltaic-project.json";
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
export declare class ProjectService {
    openProjectFolder(input: OpenProjectFolderInput): Promise<ProjectOpenResult>;
    saveProjectSnapshot(input: SaveProjectSnapshotInput): Promise<ProjectOpenResult>;
    importHpcResults(input: ImportHpcResultsInput): Promise<ProjectImportResult>;
}
export {};
