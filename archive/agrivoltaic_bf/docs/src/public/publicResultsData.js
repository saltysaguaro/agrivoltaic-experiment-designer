import {
  annualResultsDatasetSchema,
  annualResultsMetadataSchema,
  annualResultsViewSchema,
  annualSimulationRequestSchema,
} from "@agrivoltaic/shared";

function expandMonthRange(startMonth, endMonth) {
  const months = [];
  let month = startMonth;
  do {
    months.push(month);
    month = month === 12 ? 1 : month + 1;
  } while (month !== ((endMonth % 12) + 1));
  return months;
}

function sumSelectedMonths(monthlyValues, includedMonths) {
  return includedMonths.reduce((sum, month) => sum + Number(monthlyValues?.[month - 1] ?? 0), 0);
}

function periodDayCount(dataset, includedMonths) {
  const hourly = dataset.weather.hourly ?? [];
  if (!hourly.length) {
    return Math.max(includedMonths.length * 30, 1);
  }

  const included = new Set(includedMonths);
  const uniqueDays = new Set(
    hourly
      .filter((sample) => included.has(sample.month))
      .map((sample) => String(sample.timestamp).slice(0, 10)),
  );
  return Math.max(uniqueDays.size, 1);
}

function summarizeNumeric(values) {
  if (!values.length) {
    return { min: 0, max: 0, mean: 0 };
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: sum / values.length,
  };
}

function convertMetric(metric, irradianceWhM2, denominatorGhiWhM2, periodDayCountValue = 365) {
  if (metric === "annualIrradiance") {
    const safeDayCount = Math.max(1, periodDayCountValue);
    return {
      value: (irradianceWhM2 / 1000) / safeDayCount,
      units: "kWh/m²/day",
    };
  }

  const availableSunPercent = denominatorGhiWhM2 > 0
    ? (irradianceWhM2 / denominatorGhiWhM2) * 100
    : 0;

  if (metric === "percentGHI") {
    return {
      value: availableSunPercent,
      units: "% of site GHI",
    };
  }

  if (metric === "shadeFraction") {
    return {
      value: Math.max(0, 100 - availableSunPercent),
      units: "% shade",
    };
  }

  return {
    value: (irradianceWhM2 / 1000) * 3.6 * 2.04,
    units: "mol/m² PAR proxy",
  };
}

function isEdgeLike(classifications = []) {
  return classifications.some((classification) => classification === "corner"
    || classification === "end_of_row"
    || String(classification).startsWith("edge_"));
}

function buildEdgeInteriorSummary(grids) {
  const edgeValues = grids
    .filter((grid) => isEdgeLike(grid.classifications))
    .flatMap((grid) => grid.cells.map((cell) => cell.value));
  const interiorValues = grids
    .filter((grid) => grid.classifications.includes("interior"))
    .flatMap((grid) => grid.cells.map((cell) => cell.value));

  if (!edgeValues.length || !interiorValues.length) {
    return undefined;
  }

  const edge = summarizeNumeric(edgeValues);
  const interior = summarizeNumeric(interiorValues);
  return {
    edgeMean: edge.mean,
    interiorMean: interior.mean,
    difference: edge.mean - interior.mean,
    ratio: interior.mean !== 0 ? edge.mean / interior.mean : undefined,
  };
}

function datasetHeightLevels(dataset) {
  return [...new Set(
    dataset.monthlyAggregates[0]?.sensors
      .map((sensor) => Number(sensor.heightAboveGroundM.toFixed(6)))
      .sort((a, b) => a - b) ?? []
  )];
}

export function buildResultsMetadata({ dataset, request }) {
  const parsedDataset = annualResultsDatasetSchema.parse(dataset);
  const parsedRequest = annualSimulationRequestSchema.parse(request);
  const heightLevelsM = datasetHeightLevels(parsedDataset);

  return annualResultsMetadataSchema.parse({
    job: parsedDataset.job,
    site: parsedDataset.job.site,
    availableMetrics: ["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"],
    weather: {
      source: parsedDataset.weather.source,
      providerLabel: parsedDataset.weather.providerLabel,
      notes: parsedDataset.weather.notes,
      annualGhiWhM2: parsedDataset.weather.annualGhiWhM2,
      monthlyGhiWhM2: parsedDataset.weather.monthlyGhiWhM2,
      records: parsedDataset.weather.records,
    },
    designState: parsedRequest.designState,
    exportPackageId: parsedDataset.exportPackage.exportPackageId,
    gridMode: parsedDataset.job.gridMode,
    totalGrids: parsedDataset.monthlyAggregates.length,
    gridIds: parsedDataset.monthlyAggregates.map((grid) => grid.gridId),
    availableHeightLevels: heightLevelsM.length || parsedDataset.monthlyAggregates[0]?.dimensions[2] || 1,
    heightLevelsM,
    classifications: [...new Set(parsedDataset.monthlyAggregates.flatMap((grid) => grid.classification))].sort(),
  });
}

export function buildResultsView({ dataset, metric, heightIndex, startMonth, endMonth }) {
  const parsedDataset = annualResultsDatasetSchema.parse(dataset);
  const includedMonths = expandMonthRange(startMonth, endMonth);
  const denominatorGhiWhM2 = sumSelectedMonths(parsedDataset.weather.monthlyGhiWhM2, includedMonths);
  const selectedDayCount = periodDayCount(parsedDataset, includedMonths);
  const exportGridMap = new Map(parsedDataset.exportPackage.grids.map((grid) => [grid.gridId, grid]));

  const grids = parsedDataset.monthlyAggregates.map((grid) => {
    const exportGrid = exportGridMap.get(grid.gridId);
    const sliceSensors = grid.sensors.filter((sensor) => sensor.indices[2] === heightIndex);
    const cells = sliceSensors.map((sensor) => {
      const irradianceWhM2 = sumSelectedMonths(sensor.monthlyIrradianceWhM2, includedMonths);
      return {
        sensorId: sensor.sensorId,
        gridId: grid.gridId,
        position: sensor.position,
        rowIndex: sensor.indices[0],
        colIndex: sensor.indices[1],
        heightIndex: sensor.indices[2],
        heightAboveGroundM: sensor.heightAboveGroundM,
        value: convertMetric(metric, irradianceWhM2, denominatorGhiWhM2, selectedDayCount).value,
      };
    });
    const summary = summarizeNumeric(cells.map((cell) => cell.value));

    return {
      gridId: grid.gridId,
      rowPairId: grid.rowPairId,
      bayId: grid.bayId ?? undefined,
      classifications: grid.classification,
      dimensions: grid.dimensions,
      localFrame: exportGrid?.localFrame,
      bounds: exportGrid?.bounds,
      heightIndex,
      heightAboveGroundM: sliceSensors[0]?.heightAboveGroundM ?? 0,
      cells,
      min: summary.min,
      max: summary.max,
      mean: summary.mean,
    };
  }).filter((grid) => grid.cells.length > 0);

  const allValues = grids.flatMap((grid) => grid.cells.map((cell) => cell.value));
  const overall = summarizeNumeric(allValues);
  const units = convertMetric(metric, 0, denominatorGhiWhM2, selectedDayCount).units;

  return annualResultsViewSchema.parse({
    jobId: parsedDataset.job.jobId,
    metric,
    units,
    heightIndex,
    startMonth,
    endMonth,
    includedMonths,
    denominatorGhiWhM2,
    grids,
    overall,
    edgeInterior: buildEdgeInteriorSummary(grids),
  });
}

export async function readJsonFile(file) {
  return JSON.parse(await file.text());
}

export function normalizeUploadedResults(files) {
  if (!files.length) {
    throw new Error("Choose an exported results bundle or the completed package JSON files first.");
  }

  const parsedEntries = files.map((entry) => ({
    file: entry,
    payload: entry.payload,
  }));

  const bundleEntry = parsedEntries.find((entry) => entry.payload?.metadata && entry.payload?.dataset);
  if (bundleEntry) {
    const metadata = annualResultsMetadataSchema.parse(bundleEntry.payload.metadata);
    const dataset = annualResultsDatasetSchema.parse(bundleEntry.payload.dataset);
    return {
      metadata,
      dataset,
      request: null,
      sourceLabel: bundleEntry.file.name,
    };
  }

  const datasetEntry = parsedEntries.find((entry) => {
    try {
      annualResultsDatasetSchema.parse(entry.payload);
      return true;
    } catch {
      return false;
    }
  });
  const requestEntry = parsedEntries.find((entry) => {
    try {
      annualSimulationRequestSchema.parse(entry.payload);
      return true;
    } catch {
      return false;
    }
  });

  if (!datasetEntry || !requestEntry) {
    throw new Error(
      "Upload either one exported results bundle JSON, or both `irradiance-results.json` and `request.json` from a completed package.",
    );
  }

  const dataset = annualResultsDatasetSchema.parse(datasetEntry.payload);
  const request = annualSimulationRequestSchema.parse(requestEntry.payload);
  return {
    metadata: buildResultsMetadata({ dataset, request }),
    dataset,
    request,
    sourceLabel: `${datasetEntry.file.name} + ${requestEntry.file.name}`,
  };
}
