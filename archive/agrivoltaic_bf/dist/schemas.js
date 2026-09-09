import { z } from "zod";
import { DEFAULT_SENSOR_CONFIG, DEFAULT_SIMULATION_OPTIONS } from "./constants.js";
export const vec3Schema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
});
export const boundsSchema = z.object({
    min: vec3Schema,
    max: vec3Schema,
});
export const simulationRoleSchema = z.enum([
    "pv_module",
    "racking",
    "post",
    "terrain",
    "obstacle",
    "crop_zone",
    "sensor_volume",
    "ignore",
]);
export const gridClassificationSchema = z.enum([
    "interior",
    "edge_north",
    "edge_south",
    "edge_east",
    "edge_west",
    "corner",
    "end_of_row",
    "custom",
]);
export const simulationMetadataSchema = z.object({
    includeInSimulation: z.boolean().default(true),
    simulationRole: simulationRoleSchema.default("ignore"),
    radianceMaterial: z.string().min(1),
    castShadow: z.boolean().default(true),
    receiveShadowForAnalysis: z.boolean().default(true),
    simulationLOD: z.string().optional(),
    rowId: z.string().optional(),
    arrayId: z.string().optional(),
    bayId: z.string().optional(),
    exportGroupId: z.string().optional(),
    tags: z.array(z.string()).default([]),
});
export const objectTransformSchema = z.object({
    position: vec3Schema,
    rotationEuler: vec3Schema,
    scale: vec3Schema,
    matrixWorld: z.array(z.number()),
});
export const sceneObjectRecordSchema = z.object({
    id: z.string(),
    stableId: z.string(),
    sourceUuid: z.string().optional(),
    name: z.string(),
    parentId: z.string().optional(),
    parentStableId: z.string().optional(),
    childrenStableIds: z.array(z.string()).default([]),
    transform: objectTransformSchema,
    bounds: boundsSchema,
    simulationBounds: boundsSchema.optional(),
    radianceMaterial: z.string(),
    simulationRole: simulationRoleSchema,
    metadata: simulationMetadataSchema,
});
export const exportSelectionScopeSchema = z.object({
    mode: z.enum([
        "selectedObjects",
        "selectedRows",
        "selectedArrays",
        "selectedGroups",
        "taggedScene",
    ]),
    objectIds: z.array(z.string()).optional(),
    rowIds: z.array(z.string()).optional(),
    arrayIds: z.array(z.string()).optional(),
    exportGroupIds: z.array(z.string()).optional(),
});
export const exportedGeometryAssetSchema = z.object({
    objectId: z.string(),
    stableId: z.string(),
    objectName: z.string(),
    material: z.string(),
    objRelativePath: z.string(),
    role: simulationRoleSchema,
    hash: z.string(),
    vertexCount: z.number().int().nonnegative(),
    faceCount: z.number().int().nonnegative(),
    bounds: boundsSchema,
});
export const sceneExportManifestSchema = z.object({
    sceneId: z.string(),
    createdAt: z.string(),
    source: z.literal("three.js"),
    exporterVersion: z.string(),
    geometryFormat: z.literal("obj"),
    selection: exportSelectionScopeSchema,
    geometrySourceMode: z.enum(["visualMesh", "simulationMesh"]),
    combinedGeometryPath: z.string(),
    geometryHash: z.string(),
    objects: z.array(sceneObjectRecordSchema),
    assets: z.array(exportedGeometryAssetSchema),
});
export const packageTextFileSchema = z.object({
    relativePath: z.string(),
    contents: z.string(),
    sha256: z.string(),
    contentType: z.enum(["text/plain", "application/json"]),
});
export const sceneExportBundleSchema = z.object({
    sceneManifest: sceneExportManifestSchema,
    files: z.array(packageTextFileSchema),
});
export const localFrameSchema = z.object({
    origin: vec3Schema,
    eRow: vec3Schema,
    eCross: vec3Schema,
    eUp: vec3Schema,
});
export const sensorGridBoundsSchema = z.object({
    center: vec3Schema,
    lengthRow: z.number().positive(),
    lengthCross: z.number().positive(),
    height: z.number().positive(),
});
export const sensorVolumeMarginsSchema = z.object({
    rowPadding: z.number(),
    outerRowPadding: z.number(),
    bottomOffset: z.number(),
    topOffset: z.number(),
});
export const sensorPointSchema = z.object({
    id: z.string(),
    gridId: z.string(),
    position: vec3Schema,
    localPosition: vec3Schema,
    normal: vec3Schema,
    indices: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
    normalized: z.tuple([z.number(), z.number(), z.number()]),
    rowPairId: z.string().optional(),
    bayId: z.string().optional(),
    arrayId: z.string().optional(),
});
export const sensorGridConfigSchema = z.object({
    mode: z.enum(["centerArrayGrid", "fullArrayGrid"]).default(DEFAULT_SENSOR_CONFIG.mode),
    dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()])
        .default(DEFAULT_SENSOR_CONFIG.dimensions),
    boundsMode: z.enum(["autoInfer", "manual"]).default(DEFAULT_SENSOR_CONFIG.boundsMode),
    verticalExtentMode: z.enum(["groundToModuleUnderside", "customHeight"]).default(DEFAULT_SENSOR_CONFIG.verticalExtentMode),
    normalMode: z.literal("upward").default(DEFAULT_SENSOR_CONFIG.normalMode),
    margins: sensorVolumeMarginsSchema.partial().optional(),
    explicitFrame: localFrameSchema.optional(),
    explicitBounds: sensorGridBoundsSchema.optional(),
    selectedArrayId: z.string().optional(),
    selectedRowIds: z.tuple([z.string(), z.string()]).optional(),
    selectedBayId: z.string().optional(),
    groundElevation: z.number().optional(),
    customHeight: z.number().positive().optional(),
    fullArrayTilingStrategy: z.enum(["rowPairBayTiling", "rowPairSingleVolume"]).default(DEFAULT_SENSOR_CONFIG.fullArrayTilingStrategy ?? "rowPairBayTiling"),
    bayLengthMode: z.enum(["tableSpanDerived", "fixedLength", "singleBay"]).default(DEFAULT_SENSOR_CONFIG.bayLengthMode ?? "tableSpanDerived"),
    fixedBayLength: z.number().positive().optional(),
    rowParallelToleranceDeg: z.number().positive().default(DEFAULT_SENSOR_CONFIG.rowParallelToleranceDeg ?? 5),
});
export const skyRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string(),
    timestamp: z.string().datetime(),
    dni: z.number().min(0),
    dhi: z.number().min(0),
    ghi: z.number().min(0).optional(),
    albedo: z.number().min(0).max(1).optional(),
});
export const materialDefinitionSchema = z.object({
    name: z.string(),
    modifier: z.enum(["plastic", "metal", "glass", "trans", "glow"]),
    rgb: z.tuple([z.number(), z.number(), z.number()]),
    specularity: z.number().optional(),
    roughness: z.number().optional(),
    transmissivity: z.number().optional(),
    transmittedSpecular: z.number().optional(),
    comment: z.string().optional(),
});
export const radianceBinaryOverridesSchema = z.object({
    obj2rad: z.string().optional(),
    obj2mesh: z.string().optional(),
    gendaylit: z.string().optional(),
    oconv: z.string().optional(),
    rtrace: z.string().optional(),
});
export const simulationOptionsSchema = z.object({
    conversionStrategy: z.enum(["obj2rad", "obj2mesh"]).default(DEFAULT_SIMULATION_OPTIONS.conversionStrategy),
    outputMode: z.enum(["packageOnly", "packageAndSimulate"]).default(DEFAULT_SIMULATION_OPTIONS.outputMode),
    ambientBounces: z.number().int().positive().default(DEFAULT_SIMULATION_OPTIONS.ambientBounces),
    ambientDivisions: z.number().int().positive().default(DEFAULT_SIMULATION_OPTIONS.ambientDivisions),
    ambientResolution: z.number().int().positive().optional(),
    ambientAccuracy: z.number().positive().optional(),
    limitWeight: z.number().positive().optional(),
    irradianceBinary: z.string().optional(),
    binaries: radianceBinaryOverridesSchema.optional(),
});
export const exportPackageRequestSchema = z.object({
    sceneExport: sceneExportBundleSchema,
    sensorConfig: sensorGridConfigSchema,
    sky: skyRequestSchema,
    materialLibrary: z.array(materialDefinitionSchema).optional(),
    simulationOptions: simulationOptionsSchema.partial().optional(),
    workingDirectory: z.string().optional(),
    packageLabel: z.string().optional(),
});
export const radianceCommandSpecSchema = z.object({
    id: z.string(),
    program: z.string(),
    args: z.array(z.string()),
    cwdRelative: z.string(),
    stdoutRelativePath: z.string().optional(),
    stdinRelativePath: z.string().optional(),
});
export const radianceCommandLogEntrySchema = z.object({
    id: z.string(),
    command: z.string(),
    cwd: z.string(),
    startedAt: z.string(),
    endedAt: z.string(),
    durationMs: z.number().nonnegative(),
    exitCode: z.number().int(),
    stdoutPath: z.string().optional(),
    stderrPath: z.string().optional(),
});
export const sensorGridVolumeSchema = z.object({
    gridId: z.string(),
    mode: z.enum(["centerArrayGrid", "fullArrayGrid"]),
    arrayId: z.string(),
    rowPairId: z.string(),
    bayId: z.string().optional(),
    rowIds: z.tuple([z.string(), z.string()]),
    classifications: z.array(gridClassificationSchema),
    localFrame: localFrameSchema,
    bounds: sensorGridBoundsSchema,
    worldBounds: boundsSchema,
    centroid: vec3Schema,
    dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()]),
    bayIndex: z.number().int().nonnegative(),
    bayCount: z.number().int().positive(),
    sensors: z.array(sensorPointSchema),
    radiancePoints: z.string(),
});
export const arrayDescriptorSchema = z.object({
    arrayId: z.string(),
    bounds: boundsSchema,
    centroid: vec3Schema,
    localFrame: localFrameSchema,
    rowIds: z.array(z.string()),
    rowCount: z.number().int().positive(),
});
export const rowDescriptorSchema = z.object({
    rowId: z.string(),
    arrayId: z.string(),
    moduleObjectIds: z.array(z.string()),
    centroid: vec3Schema,
    localFrame: localFrameSchema,
    bounds: boundsSchema,
    alongMin: z.number(),
    alongMax: z.number(),
    crossMin: z.number(),
    crossMax: z.number(),
    centerCross: z.number(),
    undersideZ: z.number(),
    maxZ: z.number(),
    crossDepth: z.number().nonnegative(),
    rowIndex: z.number().int().nonnegative(),
});
export const rowPairDescriptorSchema = z.object({
    rowPairId: z.string(),
    arrayId: z.string(),
    rowIds: z.tuple([z.string(), z.string()]),
    rowIndices: z.tuple([z.number().int(), z.number().int()]),
    centroid: vec3Schema,
    bounds: boundsSchema,
    centerSpacing: z.number().positive(),
    interRowGap: z.number(),
    overlapAlongRow: z.tuple([z.number(), z.number()]),
    classifications: z.array(gridClassificationSchema),
});
export const bayDescriptorSchema = z.object({
    bayId: z.string(),
    arrayId: z.string(),
    rowPairId: z.string(),
    rowIds: z.tuple([z.string(), z.string()]),
    bayIndex: z.number().int().nonnegative(),
    bayCount: z.number().int().positive(),
    center: vec3Schema,
    bounds: boundsSchema,
    spanAlongRow: z.tuple([z.number(), z.number()]),
    lengthRow: z.number().positive(),
    classifications: z.array(gridClassificationSchema),
});
export const fullArrayAnalysisSchema = z.object({
    arrays: z.array(arrayDescriptorSchema),
    rows: z.array(rowDescriptorSchema),
    rowPairs: z.array(rowPairDescriptorSchema),
    bays: z.array(bayDescriptorSchema),
    representativeGridId: z.string().optional(),
    tilingStrategy: z.enum(["rowPairBayTiling", "rowPairSingleVolume"]),
});
export const radiancePackageManifestSchema = z.object({
    exportPackageId: z.string(),
    sceneId: z.string(),
    createdAt: z.string(),
    packageLabel: z.string().optional(),
    sceneManifest: sceneExportManifestSchema,
    sensorConfig: sensorGridConfigSchema,
    simulationOptions: simulationOptionsSchema,
    sky: skyRequestSchema,
    geometry: z.object({
        files: z.array(z.string()),
        combinedGeometryPath: z.string(),
        metadataPath: z.string(),
        hash: z.string(),
    }),
    materials: z.object({
        jsonPath: z.string(),
        radPath: z.string(),
    }),
    sensors: z.object({
        mode: z.enum(["centerArrayGrid", "fullArrayGrid"]),
        tilingStrategy: z.enum(["rowPairBayTiling", "rowPairSingleVolume"]),
        gridMetadataPath: z.string(),
        pointFiles: z.array(z.string()),
        totalGridCount: z.number().int().nonnegative(),
        totalSensorCount: z.number().int().nonnegative(),
    }),
    skyFiles: z.object({
        jsonPath: z.string(),
        shellScriptPath: z.string(),
        plannedRadPath: z.string(),
    }),
    radiancePlan: z.object({
        planPath: z.string(),
        shellScriptPath: z.string(),
        commands: z.array(radianceCommandSpecSchema),
    }),
    results: z.object({
        directory: z.string(),
        parsedResultPath: z.string().optional(),
    }),
    provenance: z.object({
        exporterVersion: z.string(),
        backendVersion: z.string(),
        geometryHash: z.string(),
        materialConfigHash: z.string(),
        notes: z.array(z.string()),
    }),
});
export const exportPackageResultSchema = z.object({
    exportPackageId: z.string(),
    packageRoot: z.string(),
    manifest: radiancePackageManifestSchema,
    analysis: fullArrayAnalysisSchema,
    grids: z.array(sensorGridVolumeSchema),
    generatedFiles: z.array(z.string()),
});
export const irradianceSampleSchema = z.object({
    sensorId: z.string(),
    gridId: z.string(),
    Ee: z.number(),
    position: vec3Schema,
    normal: vec3Schema,
    indices: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
    normalized: z.tuple([z.number(), z.number(), z.number()]),
});
export const irradianceStatsSchema = z.object({
    min: z.number(),
    max: z.number(),
    mean: z.number(),
    median: z.number(),
    p05: z.number(),
    p95: z.number(),
});
export const axisSliceSummarySchema = z.object({
    axis: z.enum(["row", "cross", "up"]),
    index: z.number().int().nonnegative(),
    min: z.number(),
    max: z.number(),
    mean: z.number(),
});
export const gridResultSchema = z.object({
    gridId: z.string(),
    arrayId: z.string(),
    rowPairId: z.string(),
    bayId: z.string().optional(),
    rowIds: z.tuple([z.string(), z.string()]),
    classifications: z.array(gridClassificationSchema),
    dimensions: z.tuple([z.number().int().positive(), z.number().int().positive(), z.number().int().positive()]),
    bounds: sensorGridBoundsSchema,
    worldBounds: boundsSchema,
    centroid: vec3Schema,
    sensors: z.array(sensorPointSchema),
    irradianceResults: z.array(irradianceSampleSchema),
    stats: irradianceStatsSchema,
    slices: z.object({
        row: z.array(axisSliceSummarySchema),
        cross: z.array(axisSliceSummarySchema),
        up: z.array(axisSliceSummarySchema),
    }),
});
export const classificationSummarySchema = z.object({
    classification: gridClassificationSchema,
    gridIds: z.array(z.string()),
    sensorCount: z.number().int().nonnegative(),
    stats: irradianceStatsSchema,
});
export const arrayResultSummarySchema = z.object({
    gridCount: z.number().int().nonnegative(),
    sensorCount: z.number().int().nonnegative(),
    stats: irradianceStatsSchema,
    edgeInteriorDifference: z.number().optional(),
    edgeInteriorRatio: z.number().optional(),
});
export const importedSimulationResultSchema = z.object({
    simulationId: z.string(),
    exportPackageId: z.string(),
    mode: z.enum(["centerArrayGrid", "fullArrayGrid"]),
    tilingStrategy: z.enum(["rowPairBayTiling", "rowPairSingleVolume"]),
    grids: z.array(gridResultSchema),
    arrayStats: arrayResultSummarySchema,
    classificationStats: z.array(classificationSummarySchema),
    edgeStats: arrayResultSummarySchema.optional(),
    interiorStats: arrayResultSummarySchema.optional(),
    provenance: z.object({
        sourceFiles: z.array(z.string()),
        importedAt: z.string(),
        parserNotes: z.array(z.string()),
    }),
});
export const resultFilePayloadSchema = z.object({
    fileName: z.string(),
    content: z.string(),
    format: z.enum(["radianceRGB", "radianceScalar", "json"]).optional(),
    gridId: z.string().optional(),
});
export const importResultsRequestSchema = z.object({
    exportPackageManifest: radiancePackageManifestSchema,
    grids: z.array(sensorGridVolumeSchema),
    resultFiles: z.array(resultFilePayloadSchema).min(1),
    simulationId: z.string().optional(),
});
export const simulationExecutionResultSchema = z.object({
    simulationId: z.string(),
    exportPackageId: z.string(),
    packageRoot: z.string(),
    manifest: radiancePackageManifestSchema,
    analysis: fullArrayAnalysisSchema,
    importedResults: importedSimulationResultSchema,
    commandLog: z.array(radianceCommandLogEntrySchema),
});
