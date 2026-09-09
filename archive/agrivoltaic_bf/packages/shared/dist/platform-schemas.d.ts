import { z } from "zod";
export declare const siteLocationSchema: z.ZodObject<{
    address: z.ZodString;
    label: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timezone: z.ZodString;
    source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
    region: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: "manual" | "mapbox" | "stored" | "fallback";
    timezone: string;
    latitude: number;
    longitude: number;
    address: string;
    label: string;
    region?: string | undefined;
    country?: string | undefined;
}, {
    source: "manual" | "mapbox" | "stored" | "fallback";
    timezone: string;
    latitude: number;
    longitude: number;
    address: string;
    label: string;
    region?: string | undefined;
    country?: string | undefined;
}>;
export declare const siteAutocompleteSuggestionSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    fullAddress: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timezone: z.ZodString;
    region: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    fullAddress: string;
    region?: string | undefined;
    country?: string | undefined;
}, {
    timezone: string;
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    fullAddress: string;
    region?: string | undefined;
    country?: string | undefined;
}>;
export declare const hourlyWeatherSampleSchema: z.ZodObject<{
    timestamp: z.ZodString;
    month: z.ZodNumber;
    hourIndex: z.ZodNumber;
    ghi: z.ZodNumber;
    dni: z.ZodNumber;
    dhi: z.ZodNumber;
    sunAzDeg: z.ZodNumber;
    sunElDeg: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    dni: number;
    dhi: number;
    ghi: number;
    month: number;
    hourIndex: number;
    sunAzDeg: number;
    sunElDeg: number;
}, {
    timestamp: string;
    dni: number;
    dhi: number;
    ghi: number;
    month: number;
    hourIndex: number;
    sunAzDeg: number;
    sunElDeg: number;
}>;
export declare const annualWeatherMetadataSchema: z.ZodObject<{
    source: z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>;
    site: z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>;
    retrievedAt: z.ZodString;
    timezone: z.ZodString;
    providerLabel: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    records: z.ZodNumber;
    annualGhiWhM2: z.ZodNumber;
    annualDniWhM2: z.ZodNumber;
    annualDhiWhM2: z.ZodNumber;
    monthlyGhiWhM2: z.ZodArray<z.ZodNumber, "many">;
    monthlyDniWhM2: z.ZodArray<z.ZodNumber, "many">;
    monthlyDhiWhM2: z.ZodArray<z.ZodNumber, "many">;
    hourly: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        month: z.ZodNumber;
        hourIndex: z.ZodNumber;
        ghi: z.ZodNumber;
        dni: z.ZodNumber;
        dhi: z.ZodNumber;
        sunAzDeg: z.ZodNumber;
        sunElDeg: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        dni: number;
        dhi: number;
        ghi: number;
        month: number;
        hourIndex: number;
        sunAzDeg: number;
        sunElDeg: number;
    }, {
        timestamp: string;
        dni: number;
        dhi: number;
        ghi: number;
        month: number;
        hourIndex: number;
        sunAzDeg: number;
        sunElDeg: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
    annualGhiWhM2: number;
    monthlyGhiWhM2: number[];
    records: number;
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    retrievedAt: string;
    timezone: string;
    annualDniWhM2: number;
    annualDhiWhM2: number;
    monthlyDniWhM2: number[];
    monthlyDhiWhM2: number[];
    hourly: {
        timestamp: string;
        dni: number;
        dhi: number;
        ghi: number;
        month: number;
        hourIndex: number;
        sunAzDeg: number;
        sunElDeg: number;
    }[];
    providerLabel?: string | undefined;
    notes?: string[] | undefined;
}, {
    source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
    annualGhiWhM2: number;
    monthlyGhiWhM2: number[];
    records: number;
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    retrievedAt: string;
    timezone: string;
    annualDniWhM2: number;
    annualDhiWhM2: number;
    monthlyDniWhM2: number[];
    monthlyDhiWhM2: number[];
    hourly: {
        timestamp: string;
        dni: number;
        dhi: number;
        ghi: number;
        month: number;
        hourIndex: number;
        sunAzDeg: number;
        sunElDeg: number;
    }[];
    providerLabel?: string | undefined;
    notes?: string[] | undefined;
}>;
export declare const annualMotionRowSchema: z.ZodObject<{
    rowId: z.ZodString;
    pivotOrigin: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    axisDirection: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    baselineAngleDeg: z.ZodNumber;
    rotatingObjectIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    rowId: string;
    pivotOrigin: {
        x: number;
        y: number;
        z: number;
    };
    axisDirection: {
        x: number;
        y: number;
        z: number;
    };
    baselineAngleDeg: number;
    rotatingObjectIds: string[];
}, {
    rowId: string;
    pivotOrigin: {
        x: number;
        y: number;
        z: number;
    };
    axisDirection: {
        x: number;
        y: number;
        z: number;
    };
    baselineAngleDeg: number;
    rotatingObjectIds: string[];
}>;
export declare const annualMotionModelSchema: z.ZodObject<{
    strategy: z.ZodEnum<["static", "row_axis_rotation"]>;
    rows: z.ZodArray<z.ZodObject<{
        rowId: z.ZodString;
        pivotOrigin: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        axisDirection: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        baselineAngleDeg: z.ZodNumber;
        rotatingObjectIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        rowId: string;
        pivotOrigin: {
            x: number;
            y: number;
            z: number;
        };
        axisDirection: {
            x: number;
            y: number;
            z: number;
        };
        baselineAngleDeg: number;
        rotatingObjectIds: string[];
    }, {
        rowId: string;
        pivotOrigin: {
            x: number;
            y: number;
            z: number;
        };
        axisDirection: {
            x: number;
            y: number;
            z: number;
        };
        baselineAngleDeg: number;
        rotatingObjectIds: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    rows: {
        rowId: string;
        pivotOrigin: {
            x: number;
            y: number;
            z: number;
        };
        axisDirection: {
            x: number;
            y: number;
            z: number;
        };
        baselineAngleDeg: number;
        rotatingObjectIds: string[];
    }[];
    strategy: "static" | "row_axis_rotation";
}, {
    rows: {
        rowId: string;
        pivotOrigin: {
            x: number;
            y: number;
            z: number;
        };
        axisDirection: {
            x: number;
            y: number;
            z: number;
        };
        baselineAngleDeg: number;
        rotatingObjectIds: string[];
    }[];
    strategy: "static" | "row_axis_rotation";
}>;
export declare const annualSimulationQualityPresetSchema: z.ZodEnum<["low", "medium", "high"]>;
export declare const sensorSelectionStateSchema: z.ZodObject<{
    config: z.ZodObject<{
        mode: z.ZodDefault<z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>>;
        dimensions: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        boundsMode: z.ZodDefault<z.ZodEnum<["autoInfer", "manual"]>>;
        verticalExtentMode: z.ZodDefault<z.ZodEnum<["groundToModuleUnderside", "groundToArrayTop", "customHeight"]>>;
        normalMode: z.ZodDefault<z.ZodLiteral<"upward">>;
        margins: z.ZodOptional<z.ZodObject<{
            rowPadding: z.ZodOptional<z.ZodNumber>;
            outerRowPadding: z.ZodOptional<z.ZodNumber>;
            bottomOffset: z.ZodOptional<z.ZodNumber>;
            topOffset: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        }, {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        }>>;
        explicitFrame: z.ZodOptional<z.ZodObject<{
            origin: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eRow: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eCross: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eUp: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }>>;
        explicitBounds: z.ZodOptional<z.ZodObject<{
            center: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            lengthRow: z.ZodNumber;
            lengthCross: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }>>;
        selectedArrayId: z.ZodOptional<z.ZodString>;
        selectedRowIds: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString], null>>;
        selectedBayId: z.ZodOptional<z.ZodString>;
        groundElevation: z.ZodOptional<z.ZodNumber>;
        customHeight: z.ZodOptional<z.ZodNumber>;
        fullArrayTilingStrategy: z.ZodDefault<z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>>;
        bayLengthMode: z.ZodDefault<z.ZodEnum<["tableSpanDerived", "fixedLength", "singleBay"]>>;
        fixedBayLength: z.ZodOptional<z.ZodNumber>;
        rowParallelToleranceDeg: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        dimensions: [number, number, number];
        boundsMode: "autoInfer" | "manual";
        verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
        normalMode: "upward";
        fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
        rowParallelToleranceDeg: number;
        customHeight?: number | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fixedBayLength?: number | undefined;
    }, {
        customHeight?: number | undefined;
        mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
        dimensions?: [number, number, number] | undefined;
        boundsMode?: "autoInfer" | "manual" | undefined;
        verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
        normalMode?: "upward" | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
        bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
        fixedBayLength?: number | undefined;
        rowParallelToleranceDeg?: number | undefined;
    }>;
    selectedSensorIds: z.ZodArray<z.ZodString, "many">;
    selectedHeightIndex: z.ZodNumber;
    simulationQualityPreset: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    config: {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        dimensions: [number, number, number];
        boundsMode: "autoInfer" | "manual";
        verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
        normalMode: "upward";
        fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
        rowParallelToleranceDeg: number;
        customHeight?: number | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fixedBayLength?: number | undefined;
    };
    selectedSensorIds: string[];
    selectedHeightIndex: number;
    simulationQualityPreset?: "low" | "medium" | "high" | undefined;
}, {
    config: {
        customHeight?: number | undefined;
        mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
        dimensions?: [number, number, number] | undefined;
        boundsMode?: "autoInfer" | "manual" | undefined;
        verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
        normalMode?: "upward" | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
        bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
        fixedBayLength?: number | undefined;
        rowParallelToleranceDeg?: number | undefined;
    };
    selectedSensorIds: string[];
    selectedHeightIndex: number;
    simulationQualityPreset?: "low" | "medium" | "high" | undefined;
}>;
export declare const annualSimulationRequestSchema: z.ZodObject<{
    projectName: z.ZodString;
    site: z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>;
    designState: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    serializedConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    sceneExport: z.ZodObject<{
        sceneManifest: z.ZodObject<{
            sceneId: z.ZodString;
            createdAt: z.ZodString;
            source: z.ZodLiteral<"three.js">;
            exporterVersion: z.ZodString;
            geometryFormat: z.ZodLiteral<"obj">;
            selection: z.ZodObject<{
                mode: z.ZodEnum<["selectedObjects", "selectedRows", "selectedArrays", "selectedGroups", "taggedScene"]>;
                objectIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rowIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                arrayIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                exportGroupIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            }, {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            }>;
            geometrySourceMode: z.ZodEnum<["visualMesh", "simulationMesh"]>;
            combinedGeometryPath: z.ZodString;
            geometryHash: z.ZodString;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                stableId: z.ZodString;
                sourceUuid: z.ZodOptional<z.ZodString>;
                name: z.ZodString;
                parentId: z.ZodOptional<z.ZodString>;
                parentStableId: z.ZodOptional<z.ZodString>;
                childrenStableIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                transform: z.ZodObject<{
                    position: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    rotationEuler: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    scale: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    matrixWorld: z.ZodArray<z.ZodNumber, "many">;
                }, "strip", z.ZodTypeAny, {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                }, {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                }>;
                bounds: z.ZodObject<{
                    min: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    max: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }>;
                simulationBounds: z.ZodOptional<z.ZodObject<{
                    min: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    max: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }>>;
                radianceMaterial: z.ZodString;
                simulationRole: z.ZodEnum<["pv_module", "racking", "post", "terrain", "obstacle", "crop_zone", "sensor_volume", "ignore"]>;
                metadata: z.ZodObject<{
                    includeInSimulation: z.ZodDefault<z.ZodBoolean>;
                    simulationRole: z.ZodDefault<z.ZodEnum<["pv_module", "racking", "post", "terrain", "obstacle", "crop_zone", "sensor_volume", "ignore"]>>;
                    radianceMaterial: z.ZodString;
                    castShadow: z.ZodDefault<z.ZodBoolean>;
                    receiveShadowForAnalysis: z.ZodDefault<z.ZodBoolean>;
                    simulationLOD: z.ZodOptional<z.ZodString>;
                    rowId: z.ZodOptional<z.ZodString>;
                    arrayId: z.ZodOptional<z.ZodString>;
                    bayId: z.ZodOptional<z.ZodString>;
                    exportGroupId: z.ZodOptional<z.ZodString>;
                    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    includeInSimulation: boolean;
                    simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                    radianceMaterial: string;
                    castShadow: boolean;
                    receiveShadowForAnalysis: boolean;
                    tags: string[];
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                }, {
                    radianceMaterial: string;
                    includeInSimulation?: boolean | undefined;
                    simulationRole?: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore" | undefined;
                    castShadow?: boolean | undefined;
                    receiveShadowForAnalysis?: boolean | undefined;
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                    tags?: string[] | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                childrenStableIds: string[];
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    includeInSimulation: boolean;
                    simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                    radianceMaterial: string;
                    castShadow: boolean;
                    receiveShadowForAnalysis: boolean;
                    tags: string[];
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }, {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    radianceMaterial: string;
                    includeInSimulation?: boolean | undefined;
                    simulationRole?: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore" | undefined;
                    castShadow?: boolean | undefined;
                    receiveShadowForAnalysis?: boolean | undefined;
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                    tags?: string[] | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                childrenStableIds?: string[] | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }>, "many">;
            assets: z.ZodArray<z.ZodObject<{
                objectId: z.ZodString;
                stableId: z.ZodString;
                objectName: z.ZodString;
                material: z.ZodString;
                objRelativePath: z.ZodString;
                role: z.ZodEnum<["pv_module", "racking", "post", "terrain", "obstacle", "crop_zone", "sensor_volume", "ignore"]>;
                hash: z.ZodString;
                vertexCount: z.ZodNumber;
                faceCount: z.ZodNumber;
                bounds: z.ZodObject<{
                    min: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                    max: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                        z: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        x: number;
                        y: number;
                        z: number;
                    }, {
                        x: number;
                        y: number;
                        z: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }, {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                }>;
            }, "strip", z.ZodTypeAny, {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }, {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                childrenStableIds: string[];
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    includeInSimulation: boolean;
                    simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                    radianceMaterial: string;
                    castShadow: boolean;
                    receiveShadowForAnalysis: boolean;
                    tags: string[];
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        }, {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    radianceMaterial: string;
                    includeInSimulation?: boolean | undefined;
                    simulationRole?: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore" | undefined;
                    castShadow?: boolean | undefined;
                    receiveShadowForAnalysis?: boolean | undefined;
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                    tags?: string[] | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                childrenStableIds?: string[] | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        }>;
        files: z.ZodArray<z.ZodObject<{
            relativePath: z.ZodString;
            contents: z.ZodString;
            sha256: z.ZodString;
            contentType: z.ZodEnum<["text/plain", "application/json"]>;
        }, "strip", z.ZodTypeAny, {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }, {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        sceneManifest: {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                childrenStableIds: string[];
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    includeInSimulation: boolean;
                    simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                    radianceMaterial: string;
                    castShadow: boolean;
                    receiveShadowForAnalysis: boolean;
                    tags: string[];
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        };
        files: {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }[];
    }, {
        sceneManifest: {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    radianceMaterial: string;
                    includeInSimulation?: boolean | undefined;
                    simulationRole?: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore" | undefined;
                    castShadow?: boolean | undefined;
                    receiveShadowForAnalysis?: boolean | undefined;
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                    tags?: string[] | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                childrenStableIds?: string[] | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        };
        files: {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }[];
    }>;
    sensorConfig: z.ZodObject<{
        mode: z.ZodDefault<z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>>;
        dimensions: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        boundsMode: z.ZodDefault<z.ZodEnum<["autoInfer", "manual"]>>;
        verticalExtentMode: z.ZodDefault<z.ZodEnum<["groundToModuleUnderside", "groundToArrayTop", "customHeight"]>>;
        normalMode: z.ZodDefault<z.ZodLiteral<"upward">>;
        margins: z.ZodOptional<z.ZodObject<{
            rowPadding: z.ZodOptional<z.ZodNumber>;
            outerRowPadding: z.ZodOptional<z.ZodNumber>;
            bottomOffset: z.ZodOptional<z.ZodNumber>;
            topOffset: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        }, {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        }>>;
        explicitFrame: z.ZodOptional<z.ZodObject<{
            origin: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eRow: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eCross: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eUp: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }>>;
        explicitBounds: z.ZodOptional<z.ZodObject<{
            center: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            lengthRow: z.ZodNumber;
            lengthCross: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }>>;
        selectedArrayId: z.ZodOptional<z.ZodString>;
        selectedRowIds: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString], null>>;
        selectedBayId: z.ZodOptional<z.ZodString>;
        groundElevation: z.ZodOptional<z.ZodNumber>;
        customHeight: z.ZodOptional<z.ZodNumber>;
        fullArrayTilingStrategy: z.ZodDefault<z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>>;
        bayLengthMode: z.ZodDefault<z.ZodEnum<["tableSpanDerived", "fixedLength", "singleBay"]>>;
        fixedBayLength: z.ZodOptional<z.ZodNumber>;
        rowParallelToleranceDeg: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        dimensions: [number, number, number];
        boundsMode: "autoInfer" | "manual";
        verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
        normalMode: "upward";
        fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
        rowParallelToleranceDeg: number;
        customHeight?: number | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fixedBayLength?: number | undefined;
    }, {
        customHeight?: number | undefined;
        mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
        dimensions?: [number, number, number] | undefined;
        boundsMode?: "autoInfer" | "manual" | undefined;
        verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
        normalMode?: "upward" | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
        bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
        fixedBayLength?: number | undefined;
        rowParallelToleranceDeg?: number | undefined;
    }>;
    selectedSensorIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    motionModel: z.ZodOptional<z.ZodObject<{
        strategy: z.ZodEnum<["static", "row_axis_rotation"]>;
        rows: z.ZodArray<z.ZodObject<{
            rowId: z.ZodString;
            pivotOrigin: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            axisDirection: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            baselineAngleDeg: z.ZodNumber;
            rotatingObjectIds: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }, {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        rows: {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }[];
        strategy: "static" | "row_axis_rotation";
    }, {
        rows: {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }[];
        strategy: "static" | "row_axis_rotation";
    }>>;
    skyDefaults: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        timezone: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
        dni: z.ZodOptional<z.ZodNumber>;
        dhi: z.ZodOptional<z.ZodNumber>;
        ghi: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        albedo: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string | undefined;
        latitude?: number | undefined;
        longitude?: number | undefined;
        timestamp?: string | undefined;
        dni?: number | undefined;
        dhi?: number | undefined;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }, {
        timezone?: string | undefined;
        latitude?: number | undefined;
        longitude?: number | undefined;
        timestamp?: string | undefined;
        dni?: number | undefined;
        dhi?: number | undefined;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }>>;
    enginePreference: z.ZodOptional<z.ZodEnum<["auto", "bifacial_radiance", "synthetic_local"]>>;
    simulationQualityPreset: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    workingDirectory: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    sceneExport: {
        sceneManifest: {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                childrenStableIds: string[];
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    includeInSimulation: boolean;
                    simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                    radianceMaterial: string;
                    castShadow: boolean;
                    receiveShadowForAnalysis: boolean;
                    tags: string[];
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        };
        files: {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }[];
    };
    sensorConfig: {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        dimensions: [number, number, number];
        boundsMode: "autoInfer" | "manual";
        verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
        normalMode: "upward";
        fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
        rowParallelToleranceDeg: number;
        customHeight?: number | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fixedBayLength?: number | undefined;
    };
    projectName: string;
    designState: Record<string, unknown>;
    serializedConfig: Record<string, unknown>;
    workingDirectory?: string | undefined;
    selectedSensorIds?: string[] | undefined;
    simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    motionModel?: {
        rows: {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }[];
        strategy: "static" | "row_axis_rotation";
    } | undefined;
    skyDefaults?: {
        timezone?: string | undefined;
        latitude?: number | undefined;
        longitude?: number | undefined;
        timestamp?: string | undefined;
        dni?: number | undefined;
        dhi?: number | undefined;
        ghi?: number | undefined;
        albedo?: number | undefined;
    } | undefined;
    enginePreference?: "bifacial_radiance" | "synthetic_local" | "auto" | undefined;
}, {
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    sceneExport: {
        sceneManifest: {
            source: "three.js";
            sceneId: string;
            createdAt: string;
            exporterVersion: string;
            geometryFormat: "obj";
            selection: {
                mode: "selectedObjects" | "selectedRows" | "selectedArrays" | "selectedGroups" | "taggedScene";
                objectIds?: string[] | undefined;
                rowIds?: string[] | undefined;
                arrayIds?: string[] | undefined;
                exportGroupIds?: string[] | undefined;
            };
            geometrySourceMode: "visualMesh" | "simulationMesh";
            combinedGeometryPath: string;
            geometryHash: string;
            objects: {
                simulationRole: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                radianceMaterial: string;
                id: string;
                stableId: string;
                name: string;
                transform: {
                    position: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    rotationEuler: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    scale: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    matrixWorld: number[];
                };
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                metadata: {
                    radianceMaterial: string;
                    includeInSimulation?: boolean | undefined;
                    simulationRole?: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore" | undefined;
                    castShadow?: boolean | undefined;
                    receiveShadowForAnalysis?: boolean | undefined;
                    simulationLOD?: string | undefined;
                    rowId?: string | undefined;
                    arrayId?: string | undefined;
                    bayId?: string | undefined;
                    exportGroupId?: string | undefined;
                    tags?: string[] | undefined;
                };
                sourceUuid?: string | undefined;
                parentId?: string | undefined;
                parentStableId?: string | undefined;
                childrenStableIds?: string[] | undefined;
                simulationBounds?: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                } | undefined;
            }[];
            assets: {
                stableId: string;
                bounds: {
                    min: {
                        x: number;
                        y: number;
                        z: number;
                    };
                    max: {
                        x: number;
                        y: number;
                        z: number;
                    };
                };
                objectId: string;
                objectName: string;
                material: string;
                objRelativePath: string;
                role: "pv_module" | "racking" | "post" | "terrain" | "obstacle" | "crop_zone" | "sensor_volume" | "ignore";
                hash: string;
                vertexCount: number;
                faceCount: number;
            }[];
        };
        files: {
            relativePath: string;
            contents: string;
            sha256: string;
            contentType: "text/plain" | "application/json";
        }[];
    };
    sensorConfig: {
        customHeight?: number | undefined;
        mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
        dimensions?: [number, number, number] | undefined;
        boundsMode?: "autoInfer" | "manual" | undefined;
        verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
        normalMode?: "upward" | undefined;
        margins?: {
            rowPadding?: number | undefined;
            outerRowPadding?: number | undefined;
            bottomOffset?: number | undefined;
            topOffset?: number | undefined;
        } | undefined;
        explicitFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
        explicitBounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        selectedArrayId?: string | undefined;
        selectedRowIds?: [string, string] | undefined;
        selectedBayId?: string | undefined;
        groundElevation?: number | undefined;
        fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
        bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
        fixedBayLength?: number | undefined;
        rowParallelToleranceDeg?: number | undefined;
    };
    projectName: string;
    designState: Record<string, unknown>;
    serializedConfig: Record<string, unknown>;
    workingDirectory?: string | undefined;
    selectedSensorIds?: string[] | undefined;
    simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    motionModel?: {
        rows: {
            rowId: string;
            pivotOrigin: {
                x: number;
                y: number;
                z: number;
            };
            axisDirection: {
                x: number;
                y: number;
                z: number;
            };
            baselineAngleDeg: number;
            rotatingObjectIds: string[];
        }[];
        strategy: "static" | "row_axis_rotation";
    } | undefined;
    skyDefaults?: {
        timezone?: string | undefined;
        latitude?: number | undefined;
        longitude?: number | undefined;
        timestamp?: string | undefined;
        dni?: number | undefined;
        dhi?: number | undefined;
        ghi?: number | undefined;
        albedo?: number | undefined;
    } | undefined;
    enginePreference?: "bifacial_radiance" | "synthetic_local" | "auto" | undefined;
}>;
export declare const annualJobSummarySchema: z.ZodObject<{
    jobId: z.ZodString;
    projectName: z.ZodString;
    site: z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>;
    status: z.ZodEnum<["queued", "running", "completed", "failed"]>;
    phase: z.ZodEnum<["queued", "preparing_geometry", "acquiring_weather", "generating_tracker_states", "building_scene", "running_simulation", "post_processing", "completed", "failed"]>;
    progress: z.ZodNumber;
    gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
    engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    weatherSource: z.ZodOptional<z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>>;
    error: z.ZodOptional<z.ZodString>;
    notes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    notes: string[];
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    status: "queued" | "running" | "completed" | "failed";
    createdAt: string;
    projectName: string;
    jobId: string;
    phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
    progress: number;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    engine: "bifacial_radiance" | "synthetic_local";
    updatedAt: string;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
    error?: string | undefined;
}, {
    notes: string[];
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    status: "queued" | "running" | "completed" | "failed";
    createdAt: string;
    projectName: string;
    jobId: string;
    phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
    progress: number;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    engine: "bifacial_radiance" | "synthetic_local";
    updatedAt: string;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
    error?: string | undefined;
}>;
export declare const annualJobRecordSchema: z.ZodObject<{
    jobId: z.ZodString;
    projectName: z.ZodString;
    site: z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>;
    status: z.ZodEnum<["queued", "running", "completed", "failed"]>;
    phase: z.ZodEnum<["queued", "preparing_geometry", "acquiring_weather", "generating_tracker_states", "building_scene", "running_simulation", "post_processing", "completed", "failed"]>;
    progress: z.ZodNumber;
    gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
    engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    weatherSource: z.ZodOptional<z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>>;
    error: z.ZodOptional<z.ZodString>;
    notes: z.ZodArray<z.ZodString, "many">;
} & {
    projectRoot: z.ZodOptional<z.ZodString>;
    exportPackageId: z.ZodOptional<z.ZodString>;
    exportPackageRoot: z.ZodOptional<z.ZodString>;
    resultPath: z.ZodOptional<z.ZodString>;
    logPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes: string[];
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    status: "queued" | "running" | "completed" | "failed";
    createdAt: string;
    projectName: string;
    jobId: string;
    phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
    progress: number;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    engine: "bifacial_radiance" | "synthetic_local";
    updatedAt: string;
    exportPackageId?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
    error?: string | undefined;
    projectRoot?: string | undefined;
    exportPackageRoot?: string | undefined;
    resultPath?: string | undefined;
    logPath?: string | undefined;
}, {
    notes: string[];
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    status: "queued" | "running" | "completed" | "failed";
    createdAt: string;
    projectName: string;
    jobId: string;
    phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
    progress: number;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    engine: "bifacial_radiance" | "synthetic_local";
    updatedAt: string;
    exportPackageId?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
    error?: string | undefined;
    projectRoot?: string | undefined;
    exportPackageRoot?: string | undefined;
    resultPath?: string | undefined;
    logPath?: string | undefined;
}>;
export declare const localProjectReferenceSchema: z.ZodObject<{
    name: z.ZodString;
    rootPath: z.ZodString;
    fileName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    fileName: string;
    rootPath: string;
}, {
    name: string;
    fileName: string;
    rootPath: string;
}>;
export declare const localProjectSnapshotSchema: z.ZodObject<{
    version: z.ZodString;
    savedAt: z.ZodString;
    project: z.ZodObject<{
        name: z.ZodString;
        rootPath: z.ZodString;
        fileName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        fileName: string;
        rootPath: string;
    }, {
        name: string;
        fileName: string;
        rootPath: string;
    }>;
    site: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>>>;
    designState: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    serializedConfig: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    sensorSelection: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        config: z.ZodObject<{
            mode: z.ZodDefault<z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>>;
            dimensions: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            boundsMode: z.ZodDefault<z.ZodEnum<["autoInfer", "manual"]>>;
            verticalExtentMode: z.ZodDefault<z.ZodEnum<["groundToModuleUnderside", "groundToArrayTop", "customHeight"]>>;
            normalMode: z.ZodDefault<z.ZodLiteral<"upward">>;
            margins: z.ZodOptional<z.ZodObject<{
                rowPadding: z.ZodOptional<z.ZodNumber>;
                outerRowPadding: z.ZodOptional<z.ZodNumber>;
                bottomOffset: z.ZodOptional<z.ZodNumber>;
                topOffset: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            }, {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            }>>;
            explicitFrame: z.ZodOptional<z.ZodObject<{
                origin: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    z: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    z: number;
                }, {
                    x: number;
                    y: number;
                    z: number;
                }>;
                eRow: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    z: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    z: number;
                }, {
                    x: number;
                    y: number;
                    z: number;
                }>;
                eCross: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    z: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    z: number;
                }, {
                    x: number;
                    y: number;
                    z: number;
                }>;
                eUp: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    z: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    z: number;
                }, {
                    x: number;
                    y: number;
                    z: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            }, {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            }>>;
            explicitBounds: z.ZodOptional<z.ZodObject<{
                center: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    z: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    z: number;
                }, {
                    x: number;
                    y: number;
                    z: number;
                }>;
                lengthRow: z.ZodNumber;
                lengthCross: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            }, {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            }>>;
            selectedArrayId: z.ZodOptional<z.ZodString>;
            selectedRowIds: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString], null>>;
            selectedBayId: z.ZodOptional<z.ZodString>;
            groundElevation: z.ZodOptional<z.ZodNumber>;
            customHeight: z.ZodOptional<z.ZodNumber>;
            fullArrayTilingStrategy: z.ZodDefault<z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>>;
            bayLengthMode: z.ZodDefault<z.ZodEnum<["tableSpanDerived", "fixedLength", "singleBay"]>>;
            fixedBayLength: z.ZodOptional<z.ZodNumber>;
            rowParallelToleranceDeg: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            dimensions: [number, number, number];
            boundsMode: "autoInfer" | "manual";
            verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
            normalMode: "upward";
            fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
            rowParallelToleranceDeg: number;
            customHeight?: number | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fixedBayLength?: number | undefined;
        }, {
            customHeight?: number | undefined;
            mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
            dimensions?: [number, number, number] | undefined;
            boundsMode?: "autoInfer" | "manual" | undefined;
            verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
            normalMode?: "upward" | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
            bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
            fixedBayLength?: number | undefined;
            rowParallelToleranceDeg?: number | undefined;
        }>;
        selectedSensorIds: z.ZodArray<z.ZodString, "many">;
        selectedHeightIndex: z.ZodNumber;
        simulationQualityPreset: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        config: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            dimensions: [number, number, number];
            boundsMode: "autoInfer" | "manual";
            verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
            normalMode: "upward";
            fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
            rowParallelToleranceDeg: number;
            customHeight?: number | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fixedBayLength?: number | undefined;
        };
        selectedSensorIds: string[];
        selectedHeightIndex: number;
        simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    }, {
        config: {
            customHeight?: number | undefined;
            mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
            dimensions?: [number, number, number] | undefined;
            boundsMode?: "autoInfer" | "manual" | undefined;
            verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
            normalMode?: "upward" | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
            bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
            fixedBayLength?: number | undefined;
            rowParallelToleranceDeg?: number | undefined;
        };
        selectedSensorIds: string[];
        selectedHeightIndex: number;
        simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    }>>>;
    lastJobId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jobs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        jobId: z.ZodString;
        projectName: z.ZodString;
        site: z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }>;
        status: z.ZodEnum<["queued", "running", "completed", "failed"]>;
        phase: z.ZodEnum<["queued", "preparing_geometry", "acquiring_weather", "generating_tracker_states", "building_scene", "running_simulation", "post_processing", "completed", "failed"]>;
        progress: z.ZodNumber;
        gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        startedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        weatherSource: z.ZodOptional<z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>>;
        error: z.ZodOptional<z.ZodString>;
        notes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    savedAt: string;
    project: {
        name: string;
        fileName: string;
        rootPath: string;
    };
    site?: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    } | null | undefined;
    designState?: Record<string, unknown> | null | undefined;
    serializedConfig?: Record<string, unknown> | null | undefined;
    sensorSelection?: {
        config: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            dimensions: [number, number, number];
            boundsMode: "autoInfer" | "manual";
            verticalExtentMode: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight";
            normalMode: "upward";
            fullArrayTilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            bayLengthMode: "tableSpanDerived" | "fixedLength" | "singleBay";
            rowParallelToleranceDeg: number;
            customHeight?: number | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fixedBayLength?: number | undefined;
        };
        selectedSensorIds: string[];
        selectedHeightIndex: number;
        simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    } | null | undefined;
    lastJobId?: string | null | undefined;
    jobs?: Record<string, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }> | undefined;
}, {
    version: string;
    savedAt: string;
    project: {
        name: string;
        fileName: string;
        rootPath: string;
    };
    site?: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    } | null | undefined;
    designState?: Record<string, unknown> | null | undefined;
    serializedConfig?: Record<string, unknown> | null | undefined;
    sensorSelection?: {
        config: {
            customHeight?: number | undefined;
            mode?: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid" | undefined;
            dimensions?: [number, number, number] | undefined;
            boundsMode?: "autoInfer" | "manual" | undefined;
            verticalExtentMode?: "groundToModuleUnderside" | "groundToArrayTop" | "customHeight" | undefined;
            normalMode?: "upward" | undefined;
            margins?: {
                rowPadding?: number | undefined;
                outerRowPadding?: number | undefined;
                bottomOffset?: number | undefined;
                topOffset?: number | undefined;
            } | undefined;
            explicitFrame?: {
                origin: {
                    x: number;
                    y: number;
                    z: number;
                };
                eRow: {
                    x: number;
                    y: number;
                    z: number;
                };
                eCross: {
                    x: number;
                    y: number;
                    z: number;
                };
                eUp: {
                    x: number;
                    y: number;
                    z: number;
                };
            } | undefined;
            explicitBounds?: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            } | undefined;
            selectedArrayId?: string | undefined;
            selectedRowIds?: [string, string] | undefined;
            selectedBayId?: string | undefined;
            groundElevation?: number | undefined;
            fullArrayTilingStrategy?: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid" | undefined;
            bayLengthMode?: "tableSpanDerived" | "fixedLength" | "singleBay" | undefined;
            fixedBayLength?: number | undefined;
            rowParallelToleranceDeg?: number | undefined;
        };
        selectedSensorIds: string[];
        selectedHeightIndex: number;
        simulationQualityPreset?: "low" | "medium" | "high" | undefined;
    } | null | undefined;
    lastJobId?: string | null | undefined;
    jobs?: Record<string, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }> | undefined;
}>;
export declare const sensorMonthlyAggregateSchema: z.ZodObject<{
    sensorId: z.ZodString;
    gridId: z.ZodString;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    indices: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    normalized: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    heightAboveGroundM: z.ZodNumber;
    monthlyIrradianceWhM2: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    indices: [number, number, number];
    normalized: [number, number, number];
    sensorId: string;
    heightAboveGroundM: number;
    monthlyIrradianceWhM2: number[];
}, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    indices: [number, number, number];
    normalized: [number, number, number];
    sensorId: string;
    heightAboveGroundM: number;
    monthlyIrradianceWhM2: number[];
}>;
export declare const gridMonthlyAggregateSchema: z.ZodObject<{
    gridId: z.ZodString;
    classification: z.ZodArray<z.ZodString, "many">;
    dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    rowPairId: z.ZodString;
    bayId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sensors: z.ZodArray<z.ZodObject<{
        sensorId: z.ZodString;
        gridId: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        indices: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        normalized: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        heightAboveGroundM: z.ZodNumber;
        monthlyIrradianceWhM2: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        heightAboveGroundM: number;
        monthlyIrradianceWhM2: number[];
    }, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        heightAboveGroundM: number;
        monthlyIrradianceWhM2: number[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        heightAboveGroundM: number;
        monthlyIrradianceWhM2: number[];
    }[];
    classification: string[];
    bayId?: string | null | undefined;
}, {
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        heightAboveGroundM: number;
        monthlyIrradianceWhM2: number[];
    }[];
    classification: string[];
    bayId?: string | null | undefined;
}>;
export declare const hourlyGridOutputReferenceSchema: z.ZodObject<{
    gridId: z.ZodString;
    relativePath: z.ZodString;
    sensorCount: z.ZodNumber;
    dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    dtype: z.ZodLiteral<"float32">;
    sensorIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    relativePath: string;
    gridId: string;
    dimensions: [number, number, number];
    sensorCount: number;
    dtype: "float32";
    sensorIds: string[];
}, {
    relativePath: string;
    gridId: string;
    dimensions: [number, number, number];
    sensorCount: number;
    dtype: "float32";
    sensorIds: string[];
}>;
export declare const hourlyOutputManifestSchema: z.ZodObject<{
    format: z.ZodLiteral<"npy_float32">;
    records: z.ZodNumber;
    grids: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        relativePath: z.ZodString;
        sensorCount: z.ZodNumber;
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        dtype: z.ZodLiteral<"float32">;
        sensorIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        relativePath: string;
        gridId: string;
        dimensions: [number, number, number];
        sensorCount: number;
        dtype: "float32";
        sensorIds: string[];
    }, {
        relativePath: string;
        gridId: string;
        dimensions: [number, number, number];
        sensorCount: number;
        dtype: "float32";
        sensorIds: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    grids: {
        relativePath: string;
        gridId: string;
        dimensions: [number, number, number];
        sensorCount: number;
        dtype: "float32";
        sensorIds: string[];
    }[];
    records: number;
    format: "npy_float32";
}, {
    grids: {
        relativePath: string;
        gridId: string;
        dimensions: [number, number, number];
        sensorCount: number;
        dtype: "float32";
        sensorIds: string[];
    }[];
    records: number;
    format: "npy_float32";
}>;
export declare const annualResultsDatasetSchema: z.ZodObject<{
    job: z.ZodObject<{
        jobId: z.ZodString;
        projectName: z.ZodString;
        site: z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }>;
        status: z.ZodEnum<["queued", "running", "completed", "failed"]>;
        phase: z.ZodEnum<["queued", "preparing_geometry", "acquiring_weather", "generating_tracker_states", "building_scene", "running_simulation", "post_processing", "completed", "failed"]>;
        progress: z.ZodNumber;
        gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        startedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        weatherSource: z.ZodOptional<z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>>;
        error: z.ZodOptional<z.ZodString>;
        notes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }>;
    exportPackage: z.ZodObject<{
        exportPackageId: z.ZodString;
        analysis: z.ZodAny;
        manifest: z.ZodAny;
        grids: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        exportPackageId: string;
        grids: any[];
        analysis?: any;
        manifest?: any;
    }, {
        exportPackageId: string;
        grids: any[];
        analysis?: any;
        manifest?: any;
    }>;
    weather: z.ZodObject<{
        source: z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>;
        site: z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }>;
        retrievedAt: z.ZodString;
        timezone: z.ZodString;
        providerLabel: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        records: z.ZodNumber;
        annualGhiWhM2: z.ZodNumber;
        annualDniWhM2: z.ZodNumber;
        annualDhiWhM2: z.ZodNumber;
        monthlyGhiWhM2: z.ZodArray<z.ZodNumber, "many">;
        monthlyDniWhM2: z.ZodArray<z.ZodNumber, "many">;
        monthlyDhiWhM2: z.ZodArray<z.ZodNumber, "many">;
        hourly: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodString;
            month: z.ZodNumber;
            hourIndex: z.ZodNumber;
            ghi: z.ZodNumber;
            dni: z.ZodNumber;
            dhi: z.ZodNumber;
            sunAzDeg: z.ZodNumber;
            sunElDeg: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }, {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        retrievedAt: string;
        timezone: string;
        annualDniWhM2: number;
        annualDhiWhM2: number;
        monthlyDniWhM2: number[];
        monthlyDhiWhM2: number[];
        hourly: {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }[];
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    }, {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        retrievedAt: string;
        timezone: string;
        annualDniWhM2: number;
        annualDhiWhM2: number;
        monthlyDniWhM2: number[];
        monthlyDhiWhM2: number[];
        hourly: {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }[];
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    }>;
    dataResolution: z.ZodLiteral<"monthly_aggregate">;
    monthlyAggregates: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        classification: z.ZodArray<z.ZodString, "many">;
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        rowPairId: z.ZodString;
        bayId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sensors: z.ZodArray<z.ZodObject<{
            sensorId: z.ZodString;
            gridId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            indices: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            normalized: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            heightAboveGroundM: z.ZodNumber;
            monthlyIrradianceWhM2: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }[];
        classification: string[];
        bayId?: string | null | undefined;
    }, {
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }[];
        classification: string[];
        bayId?: string | null | undefined;
    }>, "many">;
    hourlyOutput: z.ZodOptional<z.ZodObject<{
        format: z.ZodLiteral<"npy_float32">;
        records: z.ZodNumber;
        grids: z.ZodArray<z.ZodObject<{
            gridId: z.ZodString;
            relativePath: z.ZodString;
            sensorCount: z.ZodNumber;
            dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            dtype: z.ZodLiteral<"float32">;
            sensorIds: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }, {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        grids: {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }[];
        records: number;
        format: "npy_float32";
    }, {
        grids: {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }[];
        records: number;
        format: "npy_float32";
    }>>;
    provenance: z.ZodObject<{
        engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
        generatedAt: z.ZodString;
        notes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        notes: string[];
        engine: "bifacial_radiance" | "synthetic_local";
        generatedAt: string;
    }, {
        notes: string[];
        engine: "bifacial_radiance" | "synthetic_local";
        generatedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    provenance: {
        notes: string[];
        engine: "bifacial_radiance" | "synthetic_local";
        generatedAt: string;
    };
    job: {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    };
    exportPackage: {
        exportPackageId: string;
        grids: any[];
        analysis?: any;
        manifest?: any;
    };
    weather: {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        retrievedAt: string;
        timezone: string;
        annualDniWhM2: number;
        annualDhiWhM2: number;
        monthlyDniWhM2: number[];
        monthlyDhiWhM2: number[];
        hourly: {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }[];
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    };
    dataResolution: "monthly_aggregate";
    monthlyAggregates: {
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }[];
        classification: string[];
        bayId?: string | null | undefined;
    }[];
    hourlyOutput?: {
        grids: {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }[];
        records: number;
        format: "npy_float32";
    } | undefined;
}, {
    provenance: {
        notes: string[];
        engine: "bifacial_radiance" | "synthetic_local";
        generatedAt: string;
    };
    job: {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    };
    exportPackage: {
        exportPackageId: string;
        grids: any[];
        analysis?: any;
        manifest?: any;
    };
    weather: {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        retrievedAt: string;
        timezone: string;
        annualDniWhM2: number;
        annualDhiWhM2: number;
        monthlyDniWhM2: number[];
        monthlyDhiWhM2: number[];
        hourly: {
            timestamp: string;
            dni: number;
            dhi: number;
            ghi: number;
            month: number;
            hourIndex: number;
            sunAzDeg: number;
            sunElDeg: number;
        }[];
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    };
    dataResolution: "monthly_aggregate";
    monthlyAggregates: {
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            heightAboveGroundM: number;
            monthlyIrradianceWhM2: number[];
        }[];
        classification: string[];
        bayId?: string | null | undefined;
    }[];
    hourlyOutput?: {
        grids: {
            relativePath: string;
            gridId: string;
            dimensions: [number, number, number];
            sensorCount: number;
            dtype: "float32";
            sensorIds: string[];
        }[];
        records: number;
        format: "npy_float32";
    } | undefined;
}>;
export declare const annualResultsViewRequestSchema: z.ZodObject<{
    metric: z.ZodEnum<["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"]>;
    heightIndex: z.ZodNumber;
    startMonth: z.ZodNumber;
    endMonth: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    metric: "annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR";
    heightIndex: number;
    startMonth: number;
    endMonth: number;
}, {
    metric: "annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR";
    heightIndex: number;
    startMonth: number;
    endMonth: number;
}>;
export declare const annualSliceCellSchema: z.ZodObject<{
    sensorId: z.ZodString;
    gridId: z.ZodString;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    rowIndex: z.ZodNumber;
    colIndex: z.ZodNumber;
    heightIndex: z.ZodNumber;
    heightAboveGroundM: z.ZodNumber;
    value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    rowIndex: number;
    sensorId: string;
    heightAboveGroundM: number;
    heightIndex: number;
    colIndex: number;
}, {
    value: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    rowIndex: number;
    sensorId: string;
    heightAboveGroundM: number;
    heightIndex: number;
    colIndex: number;
}>;
export declare const annualGridSliceViewSchema: z.ZodObject<{
    gridId: z.ZodString;
    rowPairId: z.ZodString;
    bayId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    classifications: z.ZodArray<z.ZodString, "many">;
    dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    localFrame: z.ZodOptional<z.ZodObject<{
        origin: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        eRow: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        eCross: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        eUp: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        origin: {
            x: number;
            y: number;
            z: number;
        };
        eRow: {
            x: number;
            y: number;
            z: number;
        };
        eCross: {
            x: number;
            y: number;
            z: number;
        };
        eUp: {
            x: number;
            y: number;
            z: number;
        };
    }, {
        origin: {
            x: number;
            y: number;
            z: number;
        };
        eRow: {
            x: number;
            y: number;
            z: number;
        };
        eCross: {
            x: number;
            y: number;
            z: number;
        };
        eUp: {
            x: number;
            y: number;
            z: number;
        };
    }>>;
    bounds: z.ZodOptional<z.ZodObject<{
        center: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        lengthRow: z.ZodNumber;
        lengthCross: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    }, {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    }>>;
    heightIndex: z.ZodNumber;
    heightAboveGroundM: z.ZodNumber;
    cells: z.ZodArray<z.ZodObject<{
        sensorId: z.ZodString;
        gridId: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        rowIndex: z.ZodNumber;
        colIndex: z.ZodNumber;
        heightIndex: z.ZodNumber;
        heightAboveGroundM: z.ZodNumber;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        rowIndex: number;
        sensorId: string;
        heightAboveGroundM: number;
        heightIndex: number;
        colIndex: number;
    }, {
        value: number;
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        rowIndex: number;
        sensorId: string;
        heightAboveGroundM: number;
        heightIndex: number;
        colIndex: number;
    }>, "many">;
    min: z.ZodNumber;
    max: z.ZodNumber;
    mean: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    min: number;
    max: number;
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: string[];
    mean: number;
    heightAboveGroundM: number;
    heightIndex: number;
    cells: {
        value: number;
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        rowIndex: number;
        sensorId: string;
        heightAboveGroundM: number;
        heightIndex: number;
        colIndex: number;
    }[];
    bayId?: string | null | undefined;
    bounds?: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    } | undefined;
    localFrame?: {
        origin: {
            x: number;
            y: number;
            z: number;
        };
        eRow: {
            x: number;
            y: number;
            z: number;
        };
        eCross: {
            x: number;
            y: number;
            z: number;
        };
        eUp: {
            x: number;
            y: number;
            z: number;
        };
    } | undefined;
}, {
    min: number;
    max: number;
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: string[];
    mean: number;
    heightAboveGroundM: number;
    heightIndex: number;
    cells: {
        value: number;
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        rowIndex: number;
        sensorId: string;
        heightAboveGroundM: number;
        heightIndex: number;
        colIndex: number;
    }[];
    bayId?: string | null | undefined;
    bounds?: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    } | undefined;
    localFrame?: {
        origin: {
            x: number;
            y: number;
            z: number;
        };
        eRow: {
            x: number;
            y: number;
            z: number;
        };
        eCross: {
            x: number;
            y: number;
            z: number;
        };
        eUp: {
            x: number;
            y: number;
            z: number;
        };
    } | undefined;
}>;
export declare const annualResultsViewSchema: z.ZodObject<{
    jobId: z.ZodString;
    metric: z.ZodEnum<["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"]>;
    units: z.ZodString;
    heightIndex: z.ZodNumber;
    startMonth: z.ZodNumber;
    endMonth: z.ZodNumber;
    includedMonths: z.ZodArray<z.ZodNumber, "many">;
    denominatorGhiWhM2: z.ZodNumber;
    grids: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        rowPairId: z.ZodString;
        bayId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        classifications: z.ZodArray<z.ZodString, "many">;
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        localFrame: z.ZodOptional<z.ZodObject<{
            origin: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eRow: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eCross: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            eUp: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }, {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        }>>;
        bounds: z.ZodOptional<z.ZodObject<{
            center: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            lengthRow: z.ZodNumber;
            lengthCross: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }, {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        }>>;
        heightIndex: z.ZodNumber;
        heightAboveGroundM: z.ZodNumber;
        cells: z.ZodArray<z.ZodObject<{
            sensorId: z.ZodString;
            gridId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                z: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x: number;
                y: number;
                z: number;
            }>;
            rowIndex: z.ZodNumber;
            colIndex: z.ZodNumber;
            heightIndex: z.ZodNumber;
            heightAboveGroundM: z.ZodNumber;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }, {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }>, "many">;
        min: z.ZodNumber;
        max: z.ZodNumber;
        mean: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: string[];
        mean: number;
        heightAboveGroundM: number;
        heightIndex: number;
        cells: {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }[];
        bayId?: string | null | undefined;
        bounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        localFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
    }, {
        min: number;
        max: number;
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: string[];
        mean: number;
        heightAboveGroundM: number;
        heightIndex: number;
        cells: {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }[];
        bayId?: string | null | undefined;
        bounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        localFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
    }>, "many">;
    overall: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        mean: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        mean: number;
    }, {
        min: number;
        max: number;
        mean: number;
    }>;
    edgeInterior: z.ZodOptional<z.ZodObject<{
        edgeMean: z.ZodNumber;
        interiorMean: z.ZodNumber;
        difference: z.ZodNumber;
        ratio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        edgeMean: number;
        interiorMean: number;
        difference: number;
        ratio?: number | undefined;
    }, {
        edgeMean: number;
        interiorMean: number;
        difference: number;
        ratio?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    grids: {
        min: number;
        max: number;
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: string[];
        mean: number;
        heightAboveGroundM: number;
        heightIndex: number;
        cells: {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }[];
        bayId?: string | null | undefined;
        bounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        localFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
    }[];
    jobId: string;
    metric: "annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR";
    heightIndex: number;
    startMonth: number;
    endMonth: number;
    units: string;
    includedMonths: number[];
    denominatorGhiWhM2: number;
    overall: {
        min: number;
        max: number;
        mean: number;
    };
    edgeInterior?: {
        edgeMean: number;
        interiorMean: number;
        difference: number;
        ratio?: number | undefined;
    } | undefined;
}, {
    grids: {
        min: number;
        max: number;
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: string[];
        mean: number;
        heightAboveGroundM: number;
        heightIndex: number;
        cells: {
            value: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            rowIndex: number;
            sensorId: string;
            heightAboveGroundM: number;
            heightIndex: number;
            colIndex: number;
        }[];
        bayId?: string | null | undefined;
        bounds?: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        } | undefined;
        localFrame?: {
            origin: {
                x: number;
                y: number;
                z: number;
            };
            eRow: {
                x: number;
                y: number;
                z: number;
            };
            eCross: {
                x: number;
                y: number;
                z: number;
            };
            eUp: {
                x: number;
                y: number;
                z: number;
            };
        } | undefined;
    }[];
    jobId: string;
    metric: "annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR";
    heightIndex: number;
    startMonth: number;
    endMonth: number;
    units: string;
    includedMonths: number[];
    denominatorGhiWhM2: number;
    overall: {
        min: number;
        max: number;
        mean: number;
    };
    edgeInterior?: {
        edgeMean: number;
        interiorMean: number;
        difference: number;
        ratio?: number | undefined;
    } | undefined;
}>;
export declare const annualResultsMetadataSchema: z.ZodObject<{
    job: z.ZodObject<{
        jobId: z.ZodString;
        projectName: z.ZodString;
        site: z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }, {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        }>;
        status: z.ZodEnum<["queued", "running", "completed", "failed"]>;
        phase: z.ZodEnum<["queued", "preparing_geometry", "acquiring_weather", "generating_tracker_states", "building_scene", "running_simulation", "post_processing", "completed", "failed"]>;
        progress: z.ZodNumber;
        gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        engine: z.ZodEnum<["bifacial_radiance", "synthetic_local"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        startedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        weatherSource: z.ZodOptional<z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>>;
        error: z.ZodOptional<z.ZodString>;
        notes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }, {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    }>;
    site: z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        source: z.ZodEnum<["mapbox", "manual", "stored", "fallback"]>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }, {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    }>;
    availableMetrics: z.ZodArray<z.ZodEnum<["annualIrradiance", "percentGHI", "shadeFraction", "estimatedPAR"]>, "many">;
    weather: z.ZodObject<{
        source: z.ZodEnum<["nsrdb_tmy", "pvgis_tmy", "synthetic_fallback"]>;
        providerLabel: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        annualGhiWhM2: z.ZodNumber;
        monthlyGhiWhM2: z.ZodArray<z.ZodNumber, "many">;
        records: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    }, {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    }>;
    designState: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    exportPackageId: z.ZodString;
    gridMode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
    totalGrids: z.ZodNumber;
    gridIds: z.ZodArray<z.ZodString, "many">;
    availableHeightLevels: z.ZodNumber;
    heightLevelsM: z.ZodArray<z.ZodNumber, "many">;
    classifications: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    exportPackageId: string;
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    classifications: string[];
    gridIds: string[];
    designState: Record<string, unknown>;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    job: {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    };
    weather: {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    };
    availableMetrics: ("annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR")[];
    totalGrids: number;
    availableHeightLevels: number;
    heightLevelsM: number[];
}, {
    exportPackageId: string;
    site: {
        source: "manual" | "mapbox" | "stored" | "fallback";
        timezone: string;
        latitude: number;
        longitude: number;
        address: string;
        label: string;
        region?: string | undefined;
        country?: string | undefined;
    };
    classifications: string[];
    gridIds: string[];
    designState: Record<string, unknown>;
    gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    job: {
        notes: string[];
        site: {
            source: "manual" | "mapbox" | "stored" | "fallback";
            timezone: string;
            latitude: number;
            longitude: number;
            address: string;
            label: string;
            region?: string | undefined;
            country?: string | undefined;
        };
        status: "queued" | "running" | "completed" | "failed";
        createdAt: string;
        projectName: string;
        jobId: string;
        phase: "queued" | "completed" | "failed" | "preparing_geometry" | "acquiring_weather" | "generating_tracker_states" | "building_scene" | "running_simulation" | "post_processing";
        progress: number;
        gridMode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        engine: "bifacial_radiance" | "synthetic_local";
        updatedAt: string;
        startedAt?: string | undefined;
        completedAt?: string | undefined;
        weatherSource?: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback" | undefined;
        error?: string | undefined;
    };
    weather: {
        source: "nsrdb_tmy" | "pvgis_tmy" | "synthetic_fallback";
        annualGhiWhM2: number;
        monthlyGhiWhM2: number[];
        records: number;
        providerLabel?: string | undefined;
        notes?: string[] | undefined;
    };
    availableMetrics: ("annualIrradiance" | "percentGHI" | "shadeFraction" | "estimatedPAR")[];
    totalGrids: number;
    availableHeightLevels: number;
    heightLevelsM: number[];
}>;
export declare const clientConfigSchema: z.ZodObject<{
    mapboxTokenAvailable: z.ZodBoolean;
    mapboxPublicToken: z.ZodOptional<z.ZodString>;
    nsrdbKeyAvailable: z.ZodOptional<z.ZodBoolean>;
    nsrdbEmailAvailable: z.ZodOptional<z.ZodBoolean>;
    geocoderProvider: z.ZodOptional<z.ZodLiteral<"mapbox">>;
    preferredAnnualEngine: z.ZodOptional<z.ZodEnum<["bifacial_radiance", "synthetic_local"]>>;
    bifacialPython: z.ZodOptional<z.ZodString>;
    bifacialReady: z.ZodOptional<z.ZodBoolean>;
    backendVersion: z.ZodString;
    dataRoot: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    backendVersion: string;
    mapboxTokenAvailable: boolean;
    mapboxPublicToken?: string | undefined;
    nsrdbKeyAvailable?: boolean | undefined;
    nsrdbEmailAvailable?: boolean | undefined;
    geocoderProvider?: "mapbox" | undefined;
    preferredAnnualEngine?: "bifacial_radiance" | "synthetic_local" | undefined;
    bifacialPython?: string | undefined;
    bifacialReady?: boolean | undefined;
    dataRoot?: string | undefined;
}, {
    backendVersion: string;
    mapboxTokenAvailable: boolean;
    mapboxPublicToken?: string | undefined;
    nsrdbKeyAvailable?: boolean | undefined;
    nsrdbEmailAvailable?: boolean | undefined;
    geocoderProvider?: "mapbox" | undefined;
    preferredAnnualEngine?: "bifacial_radiance" | "synthetic_local" | undefined;
    bifacialPython?: string | undefined;
    bifacialReady?: boolean | undefined;
    dataRoot?: string | undefined;
}>;
