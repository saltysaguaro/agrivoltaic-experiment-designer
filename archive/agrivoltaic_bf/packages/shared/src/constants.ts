import type {
  SensorGridConfig,
  SensorVolumeMargins,
  SimulationOptions,
} from "./types.js";

export const EXPORTER_VERSION = "0.2.0";
export const BACKEND_VERSION = "0.2.0";
export const DEFAULT_SENSOR_DIMENSIONS: [number, number, number] = [25, 25, 5];

export const DEFAULT_SENSOR_MARGINS: SensorVolumeMargins = {
  rowPadding: 0,
  outerRowPadding: 0,
  bottomOffset: 0,
  topOffset: 0,
};

export const DEFAULT_SENSOR_CONFIG: SensorGridConfig = {
  mode: "centerArrayGrid",
  dimensions: DEFAULT_SENSOR_DIMENSIONS,
  boundsMode: "autoInfer",
  verticalExtentMode: "groundToModuleUnderside",
  normalMode: "upward",
  margins: DEFAULT_SENSOR_MARGINS,
  fullArrayTilingStrategy: "rowPairBayTiling",
  bayLengthMode: "tableSpanDerived",
  rowParallelToleranceDeg: 5,
};

export const DEFAULT_SIMULATION_OPTIONS: SimulationOptions = {
  conversionStrategy: "obj2mesh",
  outputMode: "packageOnly",
  ambientBounces: 2,
  ambientDivisions: 2048,
  ambientResolution: 256,
  ambientAccuracy: 0.15,
  limitWeight: 0.0001,
};
