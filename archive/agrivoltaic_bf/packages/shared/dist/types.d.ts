import type { Bounds3, Vec3 } from "./math.js";
export type SimulationRole = "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
export type GeometryFormat = "obj";
export type GeometrySourceMode = "visualMesh" | "simulationMesh";
export type ExportSelectionMode = "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
export type SensorExportMode = "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
export type SensorBoundsMode = "autoInfer" | "manual";
export type VerticalExtentMode = "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
export type SensorNormalMode = "upward";
export type FullArrayTilingStrategy = "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
export type BayLengthMode = "tableSpanDerived" | "fixedLength" | "singleBay";
export type RadianceConversionStrategyName = "obj2rad" | "obj2mesh";
export type PackageOutputMode = "packageOnly" | "packageAndSimulate";
export type ResultFileFormat = "radianceRGB" | "radianceScalar" | "json";
export type GridClassification = "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
export interface SimulationMetadata {
    includeInSimulation: boolean;
    simulationRole: SimulationRole;
    radianceMaterial: string;
    castShadow: boolean;
    receiveShadowForAnalysis: boolean;
    simulationLOD?: string;
    rowId?: string;
    arrayId?: string;
    bayId?: string;
    exportGroupId?: string;
    tags: string[];
}
export interface ObjectTransform {
    position: Vec3;
    rotationEuler: Vec3;
    scale: Vec3;
    matrixWorld: number[];
}
export interface SceneObjectRecord {
    id: string;
    stableId: string;
    sourceUuid?: string;
    name: string;
    parentId?: string;
    parentStableId?: string;
    childrenStableIds: string[];
    transform: ObjectTransform;
    bounds: Bounds3;
    simulationBounds?: Bounds3;
    radianceMaterial: string;
    simulationRole: SimulationRole;
    metadata: SimulationMetadata;
}
export interface ExportSelectionScope {
    mode: ExportSelectionMode;
    objectIds?: string[];
    rowIds?: string[];
    arrayIds?: string[];
    exportGroupIds?: string[];
}
export interface ExportedGeometryAsset {
    objectId: string;
    stableId: string;
    objectName: string;
    material: string;
    objRelativePath: string;
    role: SimulationRole;
    hash: string;
    vertexCount: number;
    faceCount: number;
    bounds: Bounds3;
}
export interface SceneExportManifest {
    sceneId: string;
    createdAt: string;
    source: "three.js";
    exporterVersion: string;
    geometryFormat: GeometryFormat;
    selection: ExportSelectionScope;
    geometrySourceMode: GeometrySourceMode;
    combinedGeometryPath: string;
    geometryHash: string;
    objects: SceneObjectRecord[];
    assets: ExportedGeometryAsset[];
}
export interface PackageTextFile {
    relativePath: string;
    contents: string;
    sha256: string;
    contentType: "text/plain" | "application/json";
}
export interface SceneExportBundle {
    sceneManifest: SceneExportManifest;
    files: PackageTextFile[];
}
export interface LocalFrame {
    origin: Vec3;
    eRow: Vec3;
    eCross: Vec3;
    eUp: Vec3;
}
export interface SensorGridBounds {
    center: Vec3;
    lengthRow: number;
    lengthCross: number;
    height: number;
}
export interface SensorVolumeMargins {
    rowPadding: number;
    outerRowPadding: number;
    bottomOffset: number;
    topOffset: number;
}
export interface SensorPoint {
    id: string;
    gridId: string;
    position: Vec3;
    localPosition: Vec3;
    normal: Vec3;
    indices: [number, number, number];
    normalized: [number, number, number];
    rowPairId?: string;
    bayId?: string;
    arrayId?: string;
}
export interface ArrayDescriptor {
    arrayId: string;
    bounds: Bounds3;
    centroid: Vec3;
    localFrame: LocalFrame;
    rowIds: string[];
    rowCount: number;
}
export interface RowDescriptor {
    rowId: string;
    arrayId: string;
    moduleObjectIds: string[];
    centroid: Vec3;
    localFrame: LocalFrame;
    bounds: Bounds3;
    alongMin: number;
    alongMax: number;
    crossMin: number;
    crossMax: number;
    centerCross: number;
    undersideZ: number;
    maxZ: number;
    crossDepth: number;
    rowIndex: number;
}
export interface RowPairDescriptor {
    rowPairId: string;
    arrayId: string;
    rowIds: [string, string];
    rowIndices: [number, number];
    centroid: Vec3;
    bounds: Bounds3;
    centerSpacing: number;
    interRowGap: number;
    overlapAlongRow: [number, number];
    classifications: GridClassification[];
}
export interface BayDescriptor {
    bayId: string;
    arrayId: string;
    rowPairId: string;
    rowIds: [string, string];
    bayIndex: number;
    bayCount: number;
    center: Vec3;
    bounds: Bounds3;
    spanAlongRow: [number, number];
    lengthRow: number;
    classifications: GridClassification[];
}
export interface FullArrayAnalysis {
    arrays: ArrayDescriptor[];
    rows: RowDescriptor[];
    rowPairs: RowPairDescriptor[];
    bays: BayDescriptor[];
    representativeGridId?: string;
    tilingStrategy: FullArrayTilingStrategy;
}
export interface SensorGridVolume {
    gridId: string;
    mode: SensorExportMode;
    arrayId: string;
    rowPairId: string;
    bayId?: string;
    rowIds: [string, string];
    classifications: GridClassification[];
    localFrame: LocalFrame;
    bounds: SensorGridBounds;
    worldBounds: Bounds3;
    centroid: Vec3;
    dimensions: [number, number, number];
    bayIndex: number;
    bayCount: number;
    sensors: SensorPoint[];
    radiancePoints: string;
}
export interface SensorGridConfig {
    mode: SensorExportMode;
    dimensions: [number, number, number];
    boundsMode: SensorBoundsMode;
    verticalExtentMode: VerticalExtentMode;
    normalMode: SensorNormalMode;
    margins?: Partial<SensorVolumeMargins>;
    explicitFrame?: LocalFrame;
    explicitBounds?: SensorGridBounds;
    selectedArrayId?: string;
    selectedRowIds?: [string, string];
    selectedBayId?: string;
    groundElevation?: number;
    customHeight?: number;
    fullArrayTilingStrategy?: FullArrayTilingStrategy;
    bayLengthMode?: BayLengthMode;
    fixedBayLength?: number;
    rowParallelToleranceDeg?: number;
}
export interface SkyRequest {
    latitude: number;
    longitude: number;
    timezone: string;
    timestamp: string;
    dni: number;
    dhi: number;
    ghi?: number;
    albedo?: number;
}
export interface MaterialDefinition {
    name: string;
    modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
    rgb: [number, number, number];
    specularity?: number;
    roughness?: number;
    transmissivity?: number;
    transmittedSpecular?: number;
    comment?: string;
}
export interface RadianceBinaryOverrides {
    obj2rad?: string;
    obj2mesh?: string;
    gendaylit?: string;
    oconv?: string;
    rtrace?: string;
}
export interface SimulationOptions {
    conversionStrategy: RadianceConversionStrategyName;
    outputMode: PackageOutputMode;
    ambientBounces: number;
    ambientDivisions: number;
    ambientResolution?: number;
    ambientAccuracy?: number;
    limitWeight?: number;
    irradianceBinary?: string;
    binaries?: RadianceBinaryOverrides;
}
export interface ExportPackageRequest {
    sceneExport: SceneExportBundle;
    sensorConfig: SensorGridConfig;
    sky: SkyRequest;
    materialLibrary?: MaterialDefinition[];
    simulationOptions?: Partial<SimulationOptions>;
    workingDirectory?: string;
    packageLabel?: string;
}
export interface RadianceCommandSpec {
    id: string;
    program: string;
    args: string[];
    cwdRelative: string;
    stdoutRelativePath?: string;
    stdinRelativePath?: string;
}
export interface RadianceCommandLogEntry {
    id: string;
    command: string;
    cwd: string;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    exitCode: number;
    stdoutPath?: string;
    stderrPath?: string;
}
export interface RadiancePackageManifest {
    exportPackageId: string;
    sceneId: string;
    createdAt: string;
    packageLabel?: string;
    sceneManifest: SceneExportManifest;
    sensorConfig: SensorGridConfig;
    simulationOptions: SimulationOptions;
    sky: SkyRequest;
    geometry: {
        files: string[];
        combinedGeometryPath: string;
        metadataPath: string;
        hash: string;
    };
    materials: {
        jsonPath: string;
        radPath: string;
    };
    sensors: {
        mode: SensorExportMode;
        tilingStrategy: FullArrayTilingStrategy;
        gridMetadataPath: string;
        pointFiles: string[];
        totalGridCount: number;
        totalSensorCount: number;
    };
    skyFiles: {
        jsonPath: string;
        shellScriptPath: string;
        plannedRadPath: string;
    };
    radiancePlan: {
        planPath: string;
        shellScriptPath: string;
        commands: RadianceCommandSpec[];
    };
    results: {
        directory: string;
        parsedResultPath?: string;
    };
    provenance: {
        exporterVersion: string;
        backendVersion: string;
        geometryHash: string;
        materialConfigHash: string;
        notes: string[];
    };
}
export interface ExportPackageResult {
    exportPackageId: string;
    packageRoot: string;
    manifest: RadiancePackageManifest;
    analysis: FullArrayAnalysis;
    grids: SensorGridVolume[];
    generatedFiles: string[];
}
export interface IrradianceSample {
    sensorId: string;
    gridId: string;
    Ee: number;
    position: Vec3;
    normal: Vec3;
    indices: [number, number, number];
    normalized: [number, number, number];
}
export interface IrradianceStats {
    min: number;
    max: number;
    mean: number;
    median: number;
    p05: number;
    p95: number;
}
export interface AxisSliceSummary {
    axis: "row" | "cross" | "up";
    index: number;
    min: number;
    max: number;
    mean: number;
}
export interface GridResult {
    gridId: string;
    arrayId: string;
    rowPairId: string;
    bayId?: string;
    rowIds: [string, string];
    classifications: GridClassification[];
    dimensions: [number, number, number];
    bounds: SensorGridBounds;
    worldBounds: Bounds3;
    centroid: Vec3;
    sensors: SensorPoint[];
    irradianceResults: IrradianceSample[];
    stats: IrradianceStats;
    slices: {
        row: AxisSliceSummary[];
        cross: AxisSliceSummary[];
        up: AxisSliceSummary[];
    };
}
export interface ClassificationSummary {
    classification: GridClassification;
    gridIds: string[];
    sensorCount: number;
    stats: IrradianceStats;
}
export interface ArrayResultSummary {
    gridCount: number;
    sensorCount: number;
    stats: IrradianceStats;
    edgeInteriorDifference?: number;
    edgeInteriorRatio?: number;
}
export interface ImportedSimulationResult {
    simulationId: string;
    exportPackageId: string;
    mode: SensorExportMode;
    tilingStrategy: FullArrayTilingStrategy;
    grids: GridResult[];
    arrayStats: ArrayResultSummary;
    classificationStats: ClassificationSummary[];
    edgeStats?: ArrayResultSummary;
    interiorStats?: ArrayResultSummary;
    provenance: {
        sourceFiles: string[];
        importedAt: string;
        parserNotes: string[];
    };
}
export interface ResultFilePayload {
    fileName: string;
    content: string;
    format?: ResultFileFormat;
    gridId?: string;
}
export interface ImportResultsRequest {
    exportPackageManifest: RadiancePackageManifest;
    grids: SensorGridVolume[];
    resultFiles: ResultFilePayload[];
    simulationId?: string;
}
export interface SimulationExecutionResult {
    simulationId: string;
    exportPackageId: string;
    packageRoot: string;
    manifest: RadiancePackageManifest;
    analysis: FullArrayAnalysis;
    importedResults: ImportedSimulationResult;
    commandLog: RadianceCommandLogEntry[];
}
