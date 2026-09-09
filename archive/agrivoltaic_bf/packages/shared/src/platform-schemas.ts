import { z } from "zod";
import { sceneExportBundleSchema, sensorGridConfigSchema, skyRequestSchema } from "./schemas.js";

const motionVec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const siteLocationSchema = z.object({
  address: z.string(),
  label: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string(),
  source: z.enum(["mapbox", "manual", "stored", "fallback"]),
  region: z.string().optional(),
  country: z.string().optional(),
});

export const siteAutocompleteSuggestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  fullAddress: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string(),
  region: z.string().optional(),
  country: z.string().optional(),
});

export const hourlyWeatherSampleSchema = z.object({
  timestamp: z.string(),
  month: z.number().int().min(1).max(12),
  hourIndex: z.number().int().min(0).max(8759),
  ghi: z.number().nonnegative(),
  dni: z.number().nonnegative(),
  dhi: z.number().nonnegative(),
  sunAzDeg: z.number(),
  sunElDeg: z.number(),
});

export const annualWeatherMetadataSchema = z.object({
  source: z.enum(["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]),
  site: siteLocationSchema,
  retrievedAt: z.string(),
  timezone: z.string(),
  providerLabel: z.string().optional(),
  notes: z.array(z.string()).optional(),
  records: z.number().int().positive(),
  annualGhiWhM2: z.number().nonnegative(),
  annualDniWhM2: z.number().nonnegative(),
  annualDhiWhM2: z.number().nonnegative(),
  monthlyGhiWhM2: z.array(z.number().nonnegative()).length(12),
  monthlyDniWhM2: z.array(z.number().nonnegative()).length(12),
  monthlyDhiWhM2: z.array(z.number().nonnegative()).length(12),
  hourly: z.array(hourlyWeatherSampleSchema),
});

export const annualMotionRowSchema = z.object({
  rowId: z.string(),
  pivotOrigin: motionVec3Schema,
  axisDirection: motionVec3Schema,
  baselineAngleDeg: z.number(),
  rotatingObjectIds: z.array(z.string()),
});

export const annualMotionModelSchema = z.object({
  strategy: z.enum(["static", "row_axis_rotation"]),
  rows: z.array(annualMotionRowSchema),
});

export const annualSimulationQualityPresetSchema = z.enum(["low", "medium", "high"]);

export const sensorSelectionStateSchema = z.object({
  config: sensorGridConfigSchema,
  selectedSensorIds: z.array(z.string()),
  selectedHeightIndex: z.number().int().nonnegative(),
  simulationQualityPreset: annualSimulationQualityPresetSchema.optional(),
});

export const annualSimulationRequestSchema = z.object({
  projectName: z.string().min(1),
  site: siteLocationSchema,
  designState: z.record(z.unknown()),
  serializedConfig: z.record(z.unknown()),
  sceneExport: sceneExportBundleSchema,
  sensorConfig: sensorGridConfigSchema,
  selectedSensorIds: z.array(z.string()).optional(),
  motionModel: annualMotionModelSchema.optional(),
  skyDefaults: skyRequestSchema.partial().optional(),
  enginePreference: z.enum(["auto", "bifacial_radiance", "synthetic_local"]).optional(),
  simulationQualityPreset: annualSimulationQualityPresetSchema.optional(),
  workingDirectory: z.string().optional(),
});

export const annualJobSummarySchema = z.object({
  jobId: z.string(),
  projectName: z.string(),
  site: siteLocationSchema,
  status: z.enum(["queued", "running", "completed", "failed"]),
  phase: z.enum([
    "queued",
    "preparing_geometry",
    "acquiring_weather",
    "generating_tracker_states",
    "building_scene",
    "running_simulation",
    "post_processing",
    "completed",
    "failed",
  ]),
  progress: z.number().min(0).max(1),
  gridMode: z.enum(["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]),
  engine: z.enum(["bifacial_radiance", "synthetic_local"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  weatherSource: z.enum(["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]).optional(),
  error: z.string().optional(),
  notes: z.array(z.string()),
});

export const annualJobRecordSchema = annualJobSummarySchema.extend({
  projectRoot: z.string().optional(),
  exportPackageId: z.string().optional(),
  exportPackageRoot: z.string().optional(),
  resultPath: z.string().optional(),
  logPath: z.string().optional(),
});

export const localProjectReferenceSchema = z.object({
  name: z.string().min(1),
  rootPath: z.string().min(1),
  fileName: z.string().min(1),
});

export const localProjectSnapshotSchema = z.object({
  version: z.string().min(1),
  savedAt: z.string(),
  project: localProjectReferenceSchema,
  site: siteLocationSchema.nullish(),
  designState: z.record(z.unknown()).nullish(),
  serializedConfig: z.record(z.unknown()).nullish(),
  sensorSelection: sensorSelectionStateSchema.nullish(),
  lastJobId: z.string().nullish(),
  jobs: z.record(annualJobSummarySchema).optional(),
});

export const sensorMonthlyAggregateSchema = z.object({
  sensorId: z.string(),
  gridId: z.string(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  indices: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
  normalized: z.tuple([z.number(), z.number(), z.number()]),
  heightAboveGroundM: z.number().nonnegative(),
  monthlyIrradianceWhM2: z.array(z.number().nonnegative()).length(12),
});

export const gridMonthlyAggregateSchema = z.object({
  gridId: z.string(),
  classification: z.array(z.string()),
  dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()]),
  rowPairId: z.string(),
  bayId: z.string().optional().nullable(),
  sensors: z.array(sensorMonthlyAggregateSchema),
});

export const hourlyGridOutputReferenceSchema = z.object({
  gridId: z.string(),
  relativePath: z.string(),
  sensorCount: z.number().int().nonnegative(),
  dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()]),
  dtype: z.literal("float32"),
  sensorIds: z.array(z.string()),
});

export const hourlyOutputManifestSchema = z.object({
  format: z.literal("npy_float32"),
  records: z.number().int().positive(),
  grids: z.array(hourlyGridOutputReferenceSchema),
});

export const annualResultsDatasetSchema = z.object({
  job: annualJobSummarySchema,
  exportPackage: z.object({
    exportPackageId: z.string(),
    analysis: z.any(),
    manifest: z.any(),
    grids: z.array(z.any()),
  }),
  weather: annualWeatherMetadataSchema,
  dataResolution: z.literal("monthly_aggregate"),
  monthlyAggregates: z.array(gridMonthlyAggregateSchema),
  hourlyOutput: hourlyOutputManifestSchema.optional(),
  provenance: z.object({
    engine: z.enum(["bifacial_radiance", "synthetic_local"]),
    generatedAt: z.string(),
    notes: z.array(z.string()),
  }),
});

export const annualResultsViewRequestSchema = z.object({
  metric: z.enum(["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"]),
  heightIndex: z.number().int().min(0),
  startMonth: z.number().int().min(1).max(12),
  endMonth: z.number().int().min(1).max(12),
});

export const annualSliceCellSchema = z.object({
  sensorId: z.string(),
  gridId: z.string(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rowIndex: z.number().int().nonnegative(),
  colIndex: z.number().int().nonnegative(),
  heightIndex: z.number().int().nonnegative(),
  heightAboveGroundM: z.number().nonnegative(),
  value: z.number(),
});

export const annualGridSliceViewSchema = z.object({
  gridId: z.string(),
  rowPairId: z.string(),
  bayId: z.string().optional().nullable(),
  classifications: z.array(z.string()),
  dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()]),
  localFrame: z.object({
    origin: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    eRow: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    eCross: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    eUp: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  }).optional(),
  bounds: z.object({
    center: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    lengthRow: z.number().positive(),
    lengthCross: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  heightIndex: z.number().int().nonnegative(),
  heightAboveGroundM: z.number().nonnegative(),
  cells: z.array(annualSliceCellSchema),
  min: z.number(),
  max: z.number(),
  mean: z.number(),
});

export const annualResultsViewSchema = z.object({
  jobId: z.string(),
  metric: z.enum(["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"]),
  units: z.string(),
  heightIndex: z.number().int().nonnegative(),
  startMonth: z.number().int().min(1).max(12),
  endMonth: z.number().int().min(1).max(12),
  includedMonths: z.array(z.number().int().min(1).max(12)),
  denominatorGhiWhM2: z.number().nonnegative(),
  grids: z.array(annualGridSliceViewSchema),
  overall: z.object({
    min: z.number(),
    max: z.number(),
    mean: z.number(),
  }),
  edgeInterior: z.object({
    edgeMean: z.number(),
    interiorMean: z.number(),
    difference: z.number(),
    ratio: z.number().optional(),
  }).optional(),
});

export const annualResultsMetadataSchema = z.object({
  job: annualJobSummarySchema,
  site: siteLocationSchema,
  availableMetrics: z.array(z.enum(["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"])),
  weather: z.object({
    source: z.enum(["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]),
    providerLabel: z.string().optional(),
    notes: z.array(z.string()).optional(),
    annualGhiWhM2: z.number().nonnegative(),
    monthlyGhiWhM2: z.array(z.number().nonnegative()).length(12),
    records: z.number().int().positive(),
  }),
  designState: z.record(z.unknown()),
  exportPackageId: z.string(),
  gridMode: z.enum(["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]),
  totalGrids: z.number().int().positive(),
  gridIds: z.array(z.string()),
  availableHeightLevels: z.number().int().positive(),
  heightLevelsM: z.array(z.number().nonnegative()),
  classifications: z.array(z.string()),
});

export const clientConfigSchema = z.object({
  mapboxTokenAvailable: z.boolean(),
  mapboxPublicToken: z.string().optional(),
  nsrdbKeyAvailable: z.boolean().optional(),
  nsrdbEmailAvailable: z.boolean().optional(),
  geocoderProvider: z.literal("mapbox").optional(),
  preferredAnnualEngine: z.enum(["bifacial_radiance", "synthetic_local"]).optional(),
  bifacialPython: z.string().optional(),
  bifacialReady: z.boolean().optional(),
  backendVersion: z.string(),
  dataRoot: z.string().optional(),
});
