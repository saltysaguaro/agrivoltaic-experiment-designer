export const DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET = "medium";
export const ANNUAL_SIMULATION_QUALITY_PRESETS = {
    low: {
        label: "Low",
        shortDescription: "Fast preview quality that approximates view-factor-style modeling for layout iteration.",
        runtimeHint: "Fastest runs; best for interactive design and coarse comparison studies.",
        simulationOptions: {
            ambientBounces: 1,
            ambientDivisions: 256,
            ambientResolution: 64,
            ambientAccuracy: 0.25,
            limitWeight: 0.01,
        },
    },
    medium: {
        label: "Medium",
        shortDescription: "Balanced ray tracing for design studies with materially better interreflection fidelity than low.",
        runtimeHint: "Default balance of quality and runtime for most design-stage modeling.",
        simulationOptions: {
            ambientBounces: 2,
            ambientDivisions: 2048,
            ambientResolution: 256,
            ambientAccuracy: 0.15,
            limitWeight: 0.0001,
        },
    },
    high: {
        label: "High",
        shortDescription: "Professional-grade ray tracing intended for long batch runs or HPC execution.",
        runtimeHint: "Slowest runs; appropriate when final study quality matters more than turnaround time.",
        simulationOptions: {
            ambientBounces: 4,
            ambientDivisions: 8192,
            ambientResolution: 512,
            ambientAccuracy: 0.08,
            limitWeight: 0.00002,
        },
    },
};
export function resolveAnnualSimulationQualityPreset(preset) {
    if (!preset || !(preset in ANNUAL_SIMULATION_QUALITY_PRESETS)) {
        return DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET;
    }
    return preset;
}
export function simulationOptionsForAnnualQualityPreset(preset) {
    const resolvedPreset = resolveAnnualSimulationQualityPreset(preset);
    return {
        ...ANNUAL_SIMULATION_QUALITY_PRESETS[resolvedPreset].simulationOptions,
    };
}
