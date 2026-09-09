import { importResultsRequestSchema, importedSimulationResultSchema, } from "@agrivoltaic/shared";
export function buildImportResultsPayload(input) {
    return importResultsRequestSchema.parse(input);
}
export function parseImportedSimulationResult(payload) {
    return importedSimulationResultSchema.parse(payload);
}
export function groupGridIdsByClassification(result) {
    const grouped = new Map();
    for (const grid of result.grids) {
        for (const classification of grid.classifications) {
            const bucket = grouped.get(classification) ?? [];
            bucket.push(grid.gridId);
            grouped.set(classification, bucket);
        }
    }
    return grouped;
}
