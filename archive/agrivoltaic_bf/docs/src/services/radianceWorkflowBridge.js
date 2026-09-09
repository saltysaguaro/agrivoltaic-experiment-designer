function merge(base, override) {
  return {
    ...base,
    ...(override ?? {}),
  };
}

export function serializeSystemConfig(appState) {
  return {
    systemType: appState.system?.systemType,
    dcSizeKw: appState.system?.dcSizeKw,
    moduleWidth: appState.system?.moduleWidth,
    moduleHeight: appState.system?.moduleHeight,
    rowSpacing: appState.layout?.rowSpacing,
    rowCountHint: appState.layout?.rowCountHint,
    maxTablesPerRow: appState.layout?.maxTablesPerRow,
    cropBeds: appState.crops?.cropBedCount,
    cropChoice: appState.crops?.cropChoice,
  };
}

export function buildCenterArrayWorkflowPayload(sceneExport, overrides = {}) {
  return {
    sceneExport,
    sensorConfig: merge({
      mode: "centerArrayGrid",
      dimensions: [25, 25, 5],
      boundsMode: "autoInfer",
      verticalExtentMode: "groundToModuleUnderside",
      normalMode: "upward",
      fullArrayTilingStrategy: "rowPairBayTiling",
      bayLengthMode: "tableSpanDerived",
      rowParallelToleranceDeg: 5,
    }, overrides.sensorConfig),
    sky: merge({
      latitude: 35.0844,
      longitude: -106.6504,
      timezone: "America/Denver",
      timestamp: "2026-06-21T19:00:00.000Z",
      dni: 850,
      dhi: 120,
      albedo: 0.2,
    }, overrides.sky),
    simulationOptions: merge({
      conversionStrategy: "obj2mesh",
      outputMode: "packageOnly",
      ambientBounces: 2,
      ambientDivisions: 2048,
      ambientResolution: 256,
      ambientAccuracy: 0.15,
      limitWeight: 0.0001,
    }, overrides.simulationOptions),
    packageLabel: overrides.packageLabel ?? sceneExport?.sceneManifest?.sceneId ?? "radiance-export",
  };
}

export function buildCentralRowWorkflowPayload(sceneExport, overrides = {}) {
  return {
    ...buildCenterArrayWorkflowPayload(sceneExport, overrides),
    sensorConfig: merge({
      mode: "centralRowGrid",
      dimensions: [25, 25, 5],
      boundsMode: "autoInfer",
      verticalExtentMode: "groundToModuleUnderside",
      normalMode: "upward",
      fullArrayTilingStrategy: "rowPairSingleVolume",
      bayLengthMode: "singleBay",
      rowParallelToleranceDeg: 5,
    }, overrides.sensorConfig),
  };
}

export function buildFullArrayWorkflowPayload(sceneExport, overrides = {}) {
  return {
    ...buildCenterArrayWorkflowPayload(sceneExport, overrides),
    sensorConfig: merge({
      mode: "fullArrayGrid",
      dimensions: [25, 25, 5],
      boundsMode: "autoInfer",
      verticalExtentMode: "groundToModuleUnderside",
      normalMode: "upward",
      fullArrayTilingStrategy: "rowPairSingleVolume",
      bayLengthMode: "singleBay",
      rowParallelToleranceDeg: 5,
    }, overrides.sensorConfig),
  };
}
