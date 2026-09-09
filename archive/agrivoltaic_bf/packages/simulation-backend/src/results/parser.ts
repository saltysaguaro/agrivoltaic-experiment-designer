import {
  importResultsRequestSchema,
  type ImportResultsRequest,
  type ImportedSimulationResult,
  type IrradianceSample,
  type ResultFileFormat,
  type ResultFilePayload,
  type SensorGridVolume,
} from "@agrivoltaic/shared";
import {
  buildGridResult,
  summarizeArray,
  summarizeClassifications,
} from "./stats.js";

function detectFormat(file: ResultFilePayload): ResultFileFormat {
  if (file.format) return file.format;
  if (file.fileName.toLowerCase().endsWith(".json")) return "json";

  const firstLine = file.content.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const numericCount = firstLine.trim().split(/\s+/).filter(Boolean).length;
  return numericCount <= 1 ? "radianceScalar" : "radianceRGB";
}

function rgbToIrradiance(parts: number[]): number {
  const [r, g, b] = parts;
  return (0.265 * r) + (0.67 * g) + (0.065 * b);
}

function parseJsonValues(content: string): number[] {
  const parsed = JSON.parse(content) as unknown;
  if (Array.isArray(parsed)) {
    return parsed.map((value, index) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        throw new Error(`JSON result value at index ${index} is not numeric`);
      }
      return numeric;
    });
  }

  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    const values = record.values ?? record.irradiance ?? record.samples;
    if (Array.isArray(values)) {
      return values.map((value, index) => {
        const numeric = typeof value === "number"
          ? value
          : typeof value === "object" && value && "Ee" in value
            ? Number((value as { Ee: unknown }).Ee)
            : Number(value);
        if (!Number.isFinite(numeric)) {
          throw new Error(`JSON result value at index ${index} is not numeric`);
        }
        return numeric;
      });
    }
  }

  throw new Error("Could not parse JSON result payload; expected an array or an object with a values array");
}

function parseResultValues(file: ResultFilePayload): { format: ResultFileFormat; values: number[] } {
  const format = detectFormat(file);
  if (format === "json") {
    return { format, values: parseJsonValues(file.content) };
  }

  const lines = file.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const values = lines.map((line, index) => {
    const parts = line.split(/\s+/).map(Number);
    if (parts.some((value) => !Number.isFinite(value))) {
      throw new Error(`Result file ${file.fileName} contains a non-numeric line at index ${index}`);
    }

    if (format === "radianceScalar") {
      if (parts.length < 1) {
        throw new Error(`Result file ${file.fileName} contains an empty scalar line at index ${index}`);
      }
      return parts[0]!;
    }

    if (parts.length < 3) {
      throw new Error(`Result file ${file.fileName} must contain at least three columns for Radiance RGB values`);
    }

    return rgbToIrradiance(parts);
  });

  return { format, values };
}

function filenameMatchGrid(fileName: string, grids: SensorGridVolume[]): SensorGridVolume | undefined {
  const lower = fileName.toLowerCase();
  return grids.find((grid) => lower.includes(grid.gridId.toLowerCase()));
}

function appendValues(target: Map<string, number[]>, gridId: string, values: number[]): void {
  const existing = target.get(gridId) ?? [];
  existing.push(...values);
  target.set(gridId, existing);
}

function assignValuesToGrids(
  grids: SensorGridVolume[],
  files: ResultFilePayload[],
  notes: string[],
): Map<string, number[]> {
  const valuesByGrid = new Map<string, number[]>();
  const unmatched: Array<{ file: ResultFilePayload; values: number[] }> = [];

  for (const file of files) {
    const parsed = parseResultValues(file);
    const explicitGrid = file.gridId
      ? grids.find((grid) => grid.gridId === file.gridId)
      : filenameMatchGrid(file.fileName, grids);

    if (explicitGrid) {
      appendValues(valuesByGrid, explicitGrid.gridId, parsed.values);
      notes.push(`Mapped ${file.fileName} to ${explicitGrid.gridId} using ${file.gridId ? "explicit gridId" : "filename matching"}.`);
      continue;
    }

    unmatched.push({ file, values: parsed.values });
  }

  const unassignedGrids = grids.filter((grid) => !valuesByGrid.has(grid.gridId));
  if (unmatched.length === 0) {
    return valuesByGrid;
  }

  if (unmatched.length === 1) {
    const [single] = unmatched;
    const totalExpected = unassignedGrids.reduce((sum, grid) => sum + grid.sensors.length, 0);
    if (unassignedGrids.length === 1 && single!.values.length === unassignedGrids[0]!.sensors.length) {
      appendValues(valuesByGrid, unassignedGrids[0]!.gridId, single!.values);
      notes.push(`Mapped ${single!.file.fileName} to ${unassignedGrids[0]!.gridId} because only one grid remained.`);
      return valuesByGrid;
    }

    if (single!.values.length === totalExpected) {
      let cursor = 0;
      for (const grid of unassignedGrids) {
        const nextCursor = cursor + grid.sensors.length;
        appendValues(valuesByGrid, grid.gridId, single!.values.slice(cursor, nextCursor));
        cursor = nextCursor;
      }
      notes.push(`Split ${single!.file.fileName} sequentially across ${unassignedGrids.length} grids.`);
      return valuesByGrid;
    }
  }

  if (unmatched.length === unassignedGrids.length) {
    const sortedFiles = [...unmatched].sort((a, b) => a.file.fileName.localeCompare(b.file.fileName));
    const sortedGrids = [...unassignedGrids].sort((a, b) => a.gridId.localeCompare(b.gridId));
    sortedFiles.forEach((entry, index) => {
      appendValues(valuesByGrid, sortedGrids[index]!.gridId, entry.values);
      notes.push(`Mapped ${entry.file.fileName} to ${sortedGrids[index]!.gridId} by sorted order.`);
    });
    return valuesByGrid;
  }

  throw new Error("Could not associate result files with sensor grids; provide gridId values or filenames containing the grid IDs");
}

function samplesForGrid(grid: SensorGridVolume, values: number[]): IrradianceSample[] {
  if (values.length !== grid.sensors.length) {
    throw new Error(`Grid ${grid.gridId} expected ${grid.sensors.length} values but received ${values.length}`);
  }

  return grid.sensors.map((sensor, index) => ({
    sensorId: sensor.id,
    gridId: grid.gridId,
    Ee: values[index]!,
    position: sensor.position,
    normal: sensor.normal,
    indices: sensor.indices,
    normalized: sensor.normalized,
  }));
}

export function importRadianceResults(requestInput: unknown): ImportedSimulationResult {
  const request: ImportResultsRequest = importResultsRequestSchema.parse(requestInput);
  const notes: string[] = [];
  const valuesByGrid = assignValuesToGrids(request.grids, request.resultFiles, notes);
  const gridResults = request.grids.map((grid) => buildGridResult(grid, samplesForGrid(grid, valuesByGrid.get(grid.gridId) ?? [])));
  const summary = summarizeArray(gridResults);

  return {
    simulationId: request.simulationId ?? `import-${request.exportPackageManifest.exportPackageId}`,
    exportPackageId: request.exportPackageManifest.exportPackageId,
    mode: request.exportPackageManifest.sensors.mode,
    tilingStrategy: request.exportPackageManifest.sensors.tilingStrategy,
    grids: gridResults,
    arrayStats: summary.arrayStats,
    classificationStats: summarizeClassifications(gridResults),
    edgeStats: summary.edgeStats,
    interiorStats: summary.interiorStats,
    provenance: {
      sourceFiles: request.resultFiles.map((file) => file.fileName),
      importedAt: new Date().toISOString(),
      parserNotes: notes,
    },
  };
}
