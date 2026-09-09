export const EXPORTER_VERSION = "0.2.0";
export const BACKEND_VERSION = "0.2.0";
export const DEFAULT_SENSOR_DIMENSIONS = [25, 25, 25];
export const DEFAULT_SENSOR_MARGINS = {
    rowPadding: 0,
    outerRowPadding: 0,
    bottomOffset: 0.05,
    topOffset: 0.05,
};
export const DEFAULT_SENSOR_CONFIG = {
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
export const DEFAULT_SIMULATION_OPTIONS = {
    conversionStrategy: "obj2mesh",
    outputMode: "packageOnly",
    ambientBounces: 2,
    ambientDivisions: 2048,
    ambientResolution: 256,
    ambientAccuracy: 0.15,
    limitWeight: 0.0001,
};
