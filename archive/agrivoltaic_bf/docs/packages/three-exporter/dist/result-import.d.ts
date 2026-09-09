import { type ImportResultsRequest, type ImportedSimulationResult, type RadiancePackageManifest, type ResultFilePayload, type SensorGridVolume } from "@agrivoltaic/shared";
export declare function buildImportResultsPayload(input: {
    exportPackageManifest: RadiancePackageManifest;
    grids: SensorGridVolume[];
    resultFiles: ResultFilePayload[];
    simulationId?: string;
}): ImportResultsRequest;
export declare function parseImportedSimulationResult(payload: unknown): ImportedSimulationResult;
export declare function groupGridIdsByClassification(result: ImportedSimulationResult): Map<string, string[]>;
