import {
  importResultsRequestSchema,
  importedSimulationResultSchema,
  type ImportResultsRequest,
  type ImportedSimulationResult,
  type RadiancePackageManifest,
  type ResultFilePayload,
  type SensorGridVolume,
} from "@agrivoltaic/shared";

export function buildImportResultsPayload(input: {
  exportPackageManifest: RadiancePackageManifest;
  grids: SensorGridVolume[];
  resultFiles: ResultFilePayload[];
  simulationId?: string;
}): ImportResultsRequest {
  return importResultsRequestSchema.parse(input);
}

export function parseImportedSimulationResult(payload: unknown): ImportedSimulationResult {
  return importedSimulationResultSchema.parse(payload);
}

export function groupGridIdsByClassification(result: ImportedSimulationResult): Map<string, string[]> {
  const grouped = new Map<string, string[]>();
  for (const grid of result.grids) {
    for (const classification of grid.classifications) {
      const bucket = grouped.get(classification) ?? [];
      bucket.push(grid.gridId);
      grouped.set(classification, bucket);
    }
  }
  return grouped;
}
