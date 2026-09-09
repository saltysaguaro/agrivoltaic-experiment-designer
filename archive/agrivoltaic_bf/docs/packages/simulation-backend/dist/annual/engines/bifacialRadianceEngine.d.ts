import type { AnnualJobSummary, AnnualResultsDataset, AnnualSimulationRequest, AnnualWeatherMetadata, ExportPackageResult } from "@agrivoltaic/shared";
export declare function resolveAnnualPythonCommand(): string;
export declare function detectBifacialRadiance(pythonCommand?: string): Promise<boolean>;
export declare function runBifacialRadianceEngine(input: {
    request: AnnualSimulationRequest;
    job: AnnualJobSummary;
    exportPackage: ExportPackageResult;
    weather: AnnualWeatherMetadata;
    workingDirectory: string;
}): Promise<AnnualResultsDataset>;
export declare function parseBifacialDataset(input: unknown): AnnualResultsDataset;
