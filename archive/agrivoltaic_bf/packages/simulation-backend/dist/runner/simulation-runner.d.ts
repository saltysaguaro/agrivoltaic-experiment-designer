import { type ImportedSimulationResult, type SimulationExecutionResult } from "@agrivoltaic/shared";
export declare function createSimulationPackage(requestInput: unknown): Promise<import("@agrivoltaic/shared").ExportPackageResult>;
export declare function importSimulationResults(requestInput: unknown): Promise<ImportedSimulationResult>;
export declare function runSimulation(requestInput: unknown): Promise<SimulationExecutionResult>;
