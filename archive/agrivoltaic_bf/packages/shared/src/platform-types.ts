import type {
  ExportPackageResult,
  SceneExportBundle,
  SensorExportMode,
  SensorGridConfig,
  SkyRequest,
} from "./types.js";
import type { Vec3 } from "./math.js";

export type SiteSource = "mapbox" | "manual" | "stored" | "fallback";
export type AnnualModelingEngine = "bifacial_radiance" | "synthetic_local";
export type AnnualJobStatus = "queued" | "running" | "completed" | "failed";
export type AnnualJobPhase =
  | "queued"
  | "preparing_geometry"
  | "acquiring_weather"
  | "generating_tracker_states"
  | "building_scene"
  | "running_simulation"
  | "post_processing"
  | "completed"
  | "failed";
export type AnnualMetric =
  | "annualIrradiance"
  | "percentGHI"
  | "shadeFraction"
  | "estimatedPAR";
export type AnnualSimulationQualityPreset = "low" | "medium" | "high";

export interface SiteLocation {
  address: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: SiteSource;
  region?: string;
  country?: string;
}

export interface SiteAutocompleteSuggestion {
  id: string;
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  timezone: string;
  region?: string;
  country?: string;
}

export interface HourlyWeatherSample {
  timestamp: string;
  month: number;
  hourIndex: number;
  ghi: number;
  dni: number;
  dhi: number;
  sunAzDeg: number;
  sunElDeg: number;
}

export interface AnnualWeatherMetadata {
  source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
  site: SiteLocation;
  retrievedAt: string;
  timezone: string;
  providerLabel?: string;
  notes?: string[];
  records: number;
  annualGhiWhM2: number;
  annualDniWhM2: number;
  annualDhiWhM2: number;
  monthlyGhiWhM2: number[];
  monthlyDniWhM2: number[];
  monthlyDhiWhM2: number[];
  hourly: HourlyWeatherSample[];
}

export interface AnnualMotionRow {
  rowId: string;
  pivotOrigin: { x: number; y: number; z: number };
  axisDirection: { x: number; y: number; z: number };
  baselineAngleDeg: number;
  rotatingObjectIds: string[];
}

export interface AnnualMotionModel {
  strategy: "static" | "row_axis_rotation";
  rows: AnnualMotionRow[];
}

export interface SensorSelectionState {
  config: SensorGridConfig;
  selectedSensorIds: string[];
  selectedHeightIndex: number;
  simulationQualityPreset?: AnnualSimulationQualityPreset;
}

export interface AnnualSimulationRequest {
  projectName: string;
  site: SiteLocation;
  designState: Record<string, unknown>;
  serializedConfig: Record<string, unknown>;
  sceneExport: SceneExportBundle;
  sensorConfig: SensorGridConfig;
  selectedSensorIds?: string[];
  motionModel?: AnnualMotionModel;
  skyDefaults?: Partial<SkyRequest>;
  enginePreference?: AnnualModelingEngine | "auto";
  simulationQualityPreset?: AnnualSimulationQualityPreset;
  workingDirectory?: string;
}

export interface AnnualJobSummary {
  jobId: string;
  projectName: string;
  site: SiteLocation;
  status: AnnualJobStatus;
  phase: AnnualJobPhase;
  progress: number;
  gridMode: SensorExportMode;
  engine: AnnualModelingEngine;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  weatherSource?: AnnualWeatherMetadata["source"];
  error?: string;
  notes: string[];
}

export interface AnnualJobRecord extends AnnualJobSummary {
  projectRoot?: string;
  exportPackageId?: string;
  exportPackageRoot?: string;
  resultPath?: string;
  logPath?: string;
}

export interface LocalProjectReference {
  name: string;
  rootPath: string;
  fileName: string;
}

export interface LocalProjectSnapshot {
  version: string;
  savedAt: string;
  project: LocalProjectReference;
  site?: SiteLocation | null;
  designState?: Record<string, unknown> | null;
  serializedConfig?: Record<string, unknown> | null;
  sensorSelection?: SensorSelectionState | null;
  lastJobId?: string | null;
  jobs?: Record<string, AnnualJobSummary>;
}

export interface SensorMonthlyAggregate {
  sensorId: string;
  gridId: string;
  position: { x: number; y: number; z: number };
  indices: [number, number, number];
  normalized: [number, number, number];
  heightAboveGroundM: number;
  monthlyIrradianceWhM2: number[];
}

export interface GridMonthlyAggregate {
  gridId: string;
  classification: string[];
  dimensions: [number, number, number];
  rowPairId: string;
  bayId?: string | null;
  sensors: SensorMonthlyAggregate[];
}

export interface HourlyGridOutputReference {
  gridId: string;
  relativePath: string;
  sensorCount: number;
  dimensions: [number, number, number];
  dtype: "float32";
  sensorIds: string[];
}

export interface HourlyOutputManifest {
  format: "npy_float32";
  records: number;
  grids: HourlyGridOutputReference[];
}

export interface AnnualResultsDataset {
  job: AnnualJobSummary;
  exportPackage: Pick<ExportPackageResult, "exportPackageId" | "analysis" | "manifest" | "grids">;
  weather: AnnualWeatherMetadata;
  dataResolution: "monthly_aggregate";
  monthlyAggregates: GridMonthlyAggregate[];
  hourlyOutput?: HourlyOutputManifest;
  provenance: {
    engine: AnnualModelingEngine;
    generatedAt: string;
    notes: string[];
  };
}

export interface AnnualPeriodSelection {
  startMonth: number;
  endMonth: number;
}

export interface AnnualResultsViewRequest {
  metric: AnnualMetric;
  heightIndex: number;
  startMonth: number;
  endMonth: number;
}

export interface AnnualSliceCell {
  sensorId: string;
  gridId: string;
  position: { x: number; y: number; z: number };
  rowIndex: number;
  colIndex: number;
  heightIndex: number;
  heightAboveGroundM: number;
  value: number;
}

export interface AnnualGridSliceView {
  gridId: string;
  rowPairId: string;
  bayId?: string | null;
  classifications: string[];
  dimensions: [number, number, number];
  localFrame?: {
    origin: Vec3;
    eRow: Vec3;
    eCross: Vec3;
    eUp: Vec3;
  };
  bounds?: {
    center: Vec3;
    lengthRow: number;
    lengthCross: number;
    height: number;
  };
  heightIndex: number;
  heightAboveGroundM: number;
  cells: AnnualSliceCell[];
  min: number;
  max: number;
  mean: number;
}

export interface AnnualResultsView {
  jobId: string;
  metric: AnnualMetric;
  units: string;
  heightIndex: number;
  startMonth: number;
  endMonth: number;
  includedMonths: number[];
  denominatorGhiWhM2: number;
  grids: AnnualGridSliceView[];
  overall: {
    min: number;
    max: number;
    mean: number;
  };
  edgeInterior?: {
    edgeMean: number;
    interiorMean: number;
    difference: number;
    ratio?: number;
  };
}

export interface AnnualResultsMetadata {
  job: AnnualJobSummary;
  site: SiteLocation;
  availableMetrics: AnnualMetric[];
  weather: Pick<AnnualWeatherMetadata, "source" | "providerLabel" | "notes" | "annualGhiWhM2" | "monthlyGhiWhM2" | "records">;
  designState: Record<string, unknown>;
  exportPackageId: string;
  gridMode: SensorExportMode;
  totalGrids: number;
  gridIds: string[];
  availableHeightLevels: number;
  heightLevelsM: number[];
  classifications: string[];
}

export interface ClientConfig {
  mapboxTokenAvailable: boolean;
  mapboxPublicToken?: string;
  nsrdbKeyAvailable?: boolean;
  nsrdbEmailAvailable?: boolean;
  geocoderProvider?: "mapbox";
  preferredAnnualEngine?: AnnualModelingEngine;
  bifacialPython?: string;
  bifacialReady?: boolean;
  backendVersion: string;
  dataRoot?: string;
}
