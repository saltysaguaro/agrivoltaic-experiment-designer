import type { SimulationOptions } from "./types.js";
import type { AnnualSimulationQualityPreset } from "./platform-types.js";
export interface AnnualSimulationQualityPresetDefinition {
    label: string;
    shortDescription: string;
    runtimeHint: string;
    simulationOptions: Partial<SimulationOptions>;
}
export declare const DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET: AnnualSimulationQualityPreset;
export declare const ANNUAL_SIMULATION_QUALITY_PRESETS: Record<AnnualSimulationQualityPreset, AnnualSimulationQualityPresetDefinition>;
export declare function resolveAnnualSimulationQualityPreset(preset: AnnualSimulationQualityPreset | null | undefined): AnnualSimulationQualityPreset;
export declare function simulationOptionsForAnnualQualityPreset(preset: AnnualSimulationQualityPreset | null | undefined): Partial<SimulationOptions>;
