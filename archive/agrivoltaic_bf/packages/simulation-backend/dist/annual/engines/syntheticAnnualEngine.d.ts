import type { AnnualJobSummary, AnnualResultsDataset, AnnualSimulationRequest, AnnualWeatherMetadata, ExportPackageResult } from "@agrivoltaic/shared";
export declare function runSyntheticAnnualEngine(input: {
    request: AnnualSimulationRequest;
    job: AnnualJobSummary;
    exportPackage: ExportPackageResult;
    weather: AnnualWeatherMetadata;
}): Promise<AnnualResultsDataset>;
