import { z } from "zod";
export declare const vec3Schema: z.ZodObject<{
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
export declare const boundsSchema: z.ZodObject<{
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
export declare const simulationRoleSchema: z.ZodEnum<["pv_module", "racking", "post", "terrain", "obstacle", "crop_zone", "sensor_volume", "ignore"]>;
export declare const gridClassificationSchema: z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>;
export declare const simulationMetadataSchema: z.ZodObject<{
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
export declare const objectTransformSchema: z.ZodObject<{
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
export declare const sceneObjectRecordSchema: z.ZodObject<{
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
}>;
export declare const exportSelectionScopeSchema: z.ZodObject<{
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
export declare const exportedGeometryAssetSchema: z.ZodObject<{
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
}>;
export declare const sceneExportManifestSchema: z.ZodObject<{
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
export declare const packageTextFileSchema: z.ZodObject<{
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
}>;
export declare const sceneExportBundleSchema: z.ZodObject<{
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
export declare const localFrameSchema: z.ZodObject<{
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
}>;
export declare const sensorGridBoundsSchema: z.ZodObject<{
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
}>;
export declare const sensorVolumeMarginsSchema: z.ZodObject<{
    rowPadding: z.ZodNumber;
    outerRowPadding: z.ZodNumber;
    bottomOffset: z.ZodNumber;
    topOffset: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    rowPadding: number;
    outerRowPadding: number;
    bottomOffset: number;
    topOffset: number;
}, {
    rowPadding: number;
    outerRowPadding: number;
    bottomOffset: number;
    topOffset: number;
}>;
export declare const sensorPointSchema: z.ZodObject<{
    id: z.ZodString;
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
    localPosition: z.ZodObject<{
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
    normal: z.ZodObject<{
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
    rowPairId: z.ZodOptional<z.ZodString>;
    bayId: z.ZodOptional<z.ZodString>;
    arrayId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    id: string;
    gridId: string;
    localPosition: {
        x: number;
        y: number;
        z: number;
    };
    normal: {
        x: number;
        y: number;
        z: number;
    };
    indices: [number, number, number];
    normalized: [number, number, number];
    arrayId?: string | undefined;
    bayId?: string | undefined;
    rowPairId?: string | undefined;
}, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    id: string;
    gridId: string;
    localPosition: {
        x: number;
        y: number;
        z: number;
    };
    normal: {
        x: number;
        y: number;
        z: number;
    };
    indices: [number, number, number];
    normalized: [number, number, number];
    arrayId?: string | undefined;
    bayId?: string | undefined;
    rowPairId?: string | undefined;
}>;
export declare const sensorGridConfigSchema: z.ZodObject<{
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
export declare const skyRequestSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timezone: z.ZodString;
    timestamp: z.ZodString;
    dni: z.ZodNumber;
    dhi: z.ZodNumber;
    ghi: z.ZodOptional<z.ZodNumber>;
    albedo: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    dni: number;
    dhi: number;
    ghi?: number | undefined;
    albedo?: number | undefined;
}, {
    timezone: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    dni: number;
    dhi: number;
    ghi?: number | undefined;
    albedo?: number | undefined;
}>;
export declare const materialDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    modifier: z.ZodEnum<["plastic", "metal", "glass", "trans", "glow"]>;
    rgb: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    specularity: z.ZodOptional<z.ZodNumber>;
    roughness: z.ZodOptional<z.ZodNumber>;
    transmissivity: z.ZodOptional<z.ZodNumber>;
    transmittedSpecular: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
    rgb: [number, number, number];
    specularity?: number | undefined;
    roughness?: number | undefined;
    transmissivity?: number | undefined;
    transmittedSpecular?: number | undefined;
    comment?: string | undefined;
}, {
    name: string;
    modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
    rgb: [number, number, number];
    specularity?: number | undefined;
    roughness?: number | undefined;
    transmissivity?: number | undefined;
    transmittedSpecular?: number | undefined;
    comment?: string | undefined;
}>;
export declare const radianceBinaryOverridesSchema: z.ZodObject<{
    obj2rad: z.ZodOptional<z.ZodString>;
    obj2mesh: z.ZodOptional<z.ZodString>;
    gendaylit: z.ZodOptional<z.ZodString>;
    oconv: z.ZodOptional<z.ZodString>;
    rtrace: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    obj2rad?: string | undefined;
    obj2mesh?: string | undefined;
    gendaylit?: string | undefined;
    oconv?: string | undefined;
    rtrace?: string | undefined;
}, {
    obj2rad?: string | undefined;
    obj2mesh?: string | undefined;
    gendaylit?: string | undefined;
    oconv?: string | undefined;
    rtrace?: string | undefined;
}>;
export declare const simulationOptionsSchema: z.ZodObject<{
    conversionStrategy: z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>;
    outputMode: z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>;
    ambientBounces: z.ZodDefault<z.ZodNumber>;
    ambientDivisions: z.ZodDefault<z.ZodNumber>;
    ambientResolution: z.ZodOptional<z.ZodNumber>;
    ambientAccuracy: z.ZodOptional<z.ZodNumber>;
    limitWeight: z.ZodOptional<z.ZodNumber>;
    irradianceBinary: z.ZodOptional<z.ZodString>;
    binaries: z.ZodOptional<z.ZodObject<{
        obj2rad: z.ZodOptional<z.ZodString>;
        obj2mesh: z.ZodOptional<z.ZodString>;
        gendaylit: z.ZodOptional<z.ZodString>;
        oconv: z.ZodOptional<z.ZodString>;
        rtrace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        obj2rad?: string | undefined;
        obj2mesh?: string | undefined;
        gendaylit?: string | undefined;
        oconv?: string | undefined;
        rtrace?: string | undefined;
    }, {
        obj2rad?: string | undefined;
        obj2mesh?: string | undefined;
        gendaylit?: string | undefined;
        oconv?: string | undefined;
        rtrace?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    conversionStrategy: "obj2rad" | "obj2mesh";
    outputMode: "packageOnly" | "packageAndSimulate";
    ambientBounces: number;
    ambientDivisions: number;
    ambientResolution?: number | undefined;
    ambientAccuracy?: number | undefined;
    limitWeight?: number | undefined;
    irradianceBinary?: string | undefined;
    binaries?: {
        obj2rad?: string | undefined;
        obj2mesh?: string | undefined;
        gendaylit?: string | undefined;
        oconv?: string | undefined;
        rtrace?: string | undefined;
    } | undefined;
}, {
    conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
    outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
    ambientBounces?: number | undefined;
    ambientDivisions?: number | undefined;
    ambientResolution?: number | undefined;
    ambientAccuracy?: number | undefined;
    limitWeight?: number | undefined;
    irradianceBinary?: string | undefined;
    binaries?: {
        obj2rad?: string | undefined;
        obj2mesh?: string | undefined;
        gendaylit?: string | undefined;
        oconv?: string | undefined;
        rtrace?: string | undefined;
    } | undefined;
}>;
export declare const exportPackageRequestSchema: z.ZodObject<{
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
    sky: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        timestamp: z.ZodString;
        dni: z.ZodNumber;
        dhi: z.ZodNumber;
        ghi: z.ZodOptional<z.ZodNumber>;
        albedo: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }, {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }>;
    materialLibrary: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        modifier: z.ZodEnum<["plastic", "metal", "glass", "trans", "glow"]>;
        rgb: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        specularity: z.ZodOptional<z.ZodNumber>;
        roughness: z.ZodOptional<z.ZodNumber>;
        transmissivity: z.ZodOptional<z.ZodNumber>;
        transmittedSpecular: z.ZodOptional<z.ZodNumber>;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
        rgb: [number, number, number];
        specularity?: number | undefined;
        roughness?: number | undefined;
        transmissivity?: number | undefined;
        transmittedSpecular?: number | undefined;
        comment?: string | undefined;
    }, {
        name: string;
        modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
        rgb: [number, number, number];
        specularity?: number | undefined;
        roughness?: number | undefined;
        transmissivity?: number | undefined;
        transmittedSpecular?: number | undefined;
        comment?: string | undefined;
    }>, "many">>;
    simulationOptions: z.ZodOptional<z.ZodObject<{
        conversionStrategy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>>;
        outputMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>>;
        ambientBounces: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        ambientDivisions: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        ambientResolution: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        ambientAccuracy: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        limitWeight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        irradianceBinary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        binaries: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            obj2rad: z.ZodOptional<z.ZodString>;
            obj2mesh: z.ZodOptional<z.ZodString>;
            gendaylit: z.ZodOptional<z.ZodString>;
            oconv: z.ZodOptional<z.ZodString>;
            rtrace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        }, {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    }, {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    }>>;
    workingDirectory: z.ZodOptional<z.ZodString>;
    packageLabel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
    sky: {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    };
    materialLibrary?: {
        name: string;
        modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
        rgb: [number, number, number];
        specularity?: number | undefined;
        roughness?: number | undefined;
        transmissivity?: number | undefined;
        transmittedSpecular?: number | undefined;
        comment?: string | undefined;
    }[] | undefined;
    simulationOptions?: {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    } | undefined;
    workingDirectory?: string | undefined;
    packageLabel?: string | undefined;
}, {
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
    sky: {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    };
    materialLibrary?: {
        name: string;
        modifier: "plastic" | "metal" | "glass" | "trans" | "glow";
        rgb: [number, number, number];
        specularity?: number | undefined;
        roughness?: number | undefined;
        transmissivity?: number | undefined;
        transmittedSpecular?: number | undefined;
        comment?: string | undefined;
    }[] | undefined;
    simulationOptions?: {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    } | undefined;
    workingDirectory?: string | undefined;
    packageLabel?: string | undefined;
}>;
export declare const radianceCommandSpecSchema: z.ZodObject<{
    id: z.ZodString;
    program: z.ZodString;
    args: z.ZodArray<z.ZodString, "many">;
    cwdRelative: z.ZodString;
    stdoutRelativePath: z.ZodOptional<z.ZodString>;
    stdinRelativePath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    program: string;
    args: string[];
    cwdRelative: string;
    stdoutRelativePath?: string | undefined;
    stdinRelativePath?: string | undefined;
}, {
    id: string;
    program: string;
    args: string[];
    cwdRelative: string;
    stdoutRelativePath?: string | undefined;
    stdinRelativePath?: string | undefined;
}>;
export declare const radianceCommandLogEntrySchema: z.ZodObject<{
    id: z.ZodString;
    command: z.ZodString;
    cwd: z.ZodString;
    startedAt: z.ZodString;
    endedAt: z.ZodString;
    durationMs: z.ZodNumber;
    exitCode: z.ZodNumber;
    stdoutPath: z.ZodOptional<z.ZodString>;
    stderrPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    command: string;
    cwd: string;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    exitCode: number;
    stdoutPath?: string | undefined;
    stderrPath?: string | undefined;
}, {
    id: string;
    command: string;
    cwd: string;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    exitCode: number;
    stdoutPath?: string | undefined;
    stderrPath?: string | undefined;
}>;
export declare const sensorGridVolumeSchema: z.ZodObject<{
    gridId: z.ZodString;
    mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
    arrayId: z.ZodString;
    rowPairId: z.ZodString;
    bayId: z.ZodOptional<z.ZodString>;
    rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
    classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
    localFrame: z.ZodObject<{
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
    }>;
    bounds: z.ZodObject<{
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
    }>;
    worldBounds: z.ZodObject<{
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
    centroid: z.ZodObject<{
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
    dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    bayIndex: z.ZodNumber;
    bayCount: z.ZodNumber;
    sensors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
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
        localPosition: z.ZodObject<{
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
        normal: z.ZodObject<{
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
        rowPairId: z.ZodOptional<z.ZodString>;
        bayId: z.ZodOptional<z.ZodString>;
        arrayId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }>, "many">;
    radiancePoints: z.ZodString;
}, "strip", z.ZodTypeAny, {
    arrayId: string;
    bounds: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    };
    mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    rowIds: [string, string];
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    localFrame: {
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
    };
    worldBounds: {
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
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    bayIndex: number;
    bayCount: number;
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }[];
    radiancePoints: string;
    bayId?: string | undefined;
}, {
    arrayId: string;
    bounds: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    };
    mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    rowIds: [string, string];
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    localFrame: {
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
    };
    worldBounds: {
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
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    bayIndex: number;
    bayCount: number;
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }[];
    radiancePoints: string;
    bayId?: string | undefined;
}>;
export declare const arrayDescriptorSchema: z.ZodObject<{
    arrayId: z.ZodString;
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
    centroid: z.ZodObject<{
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
    localFrame: z.ZodObject<{
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
    }>;
    rowIds: z.ZodArray<z.ZodString, "many">;
    rowCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    arrayId: string;
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
    rowIds: string[];
    localFrame: {
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
    };
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    rowCount: number;
}, {
    arrayId: string;
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
    rowIds: string[];
    localFrame: {
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
    };
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    rowCount: number;
}>;
export declare const rowDescriptorSchema: z.ZodObject<{
    rowId: z.ZodString;
    arrayId: z.ZodString;
    moduleObjectIds: z.ZodArray<z.ZodString, "many">;
    centroid: z.ZodObject<{
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
    localFrame: z.ZodObject<{
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
    alongMin: z.ZodNumber;
    alongMax: z.ZodNumber;
    crossMin: z.ZodNumber;
    crossMax: z.ZodNumber;
    centerCross: z.ZodNumber;
    undersideZ: z.ZodNumber;
    maxZ: z.ZodNumber;
    crossDepth: z.ZodNumber;
    rowIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    rowId: string;
    arrayId: string;
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
    localFrame: {
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
    };
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    moduleObjectIds: string[];
    alongMin: number;
    alongMax: number;
    crossMin: number;
    crossMax: number;
    centerCross: number;
    undersideZ: number;
    maxZ: number;
    crossDepth: number;
    rowIndex: number;
}, {
    rowId: string;
    arrayId: string;
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
    localFrame: {
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
    };
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    moduleObjectIds: string[];
    alongMin: number;
    alongMax: number;
    crossMin: number;
    crossMax: number;
    centerCross: number;
    undersideZ: number;
    maxZ: number;
    crossDepth: number;
    rowIndex: number;
}>;
export declare const rowPairDescriptorSchema: z.ZodObject<{
    rowPairId: z.ZodString;
    arrayId: z.ZodString;
    rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
    rowIndices: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    centroid: z.ZodObject<{
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
    centerSpacing: z.ZodNumber;
    interRowGap: z.ZodNumber;
    overlapAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
}, "strip", z.ZodTypeAny, {
    arrayId: string;
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
    rowIds: [string, string];
    rowPairId: string;
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    rowIndices: [number, number];
    centerSpacing: number;
    interRowGap: number;
    overlapAlongRow: [number, number];
}, {
    arrayId: string;
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
    rowIds: [string, string];
    rowPairId: string;
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    rowIndices: [number, number];
    centerSpacing: number;
    interRowGap: number;
    overlapAlongRow: [number, number];
}>;
export declare const bayDescriptorSchema: z.ZodObject<{
    bayId: z.ZodString;
    arrayId: z.ZodString;
    rowPairId: z.ZodString;
    rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
    bayIndex: z.ZodNumber;
    bayCount: z.ZodNumber;
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
    spanAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    lengthRow: z.ZodNumber;
    classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
}, "strip", z.ZodTypeAny, {
    arrayId: string;
    bayId: string;
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
    rowIds: [string, string];
    center: {
        x: number;
        y: number;
        z: number;
    };
    lengthRow: number;
    rowPairId: string;
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    bayIndex: number;
    bayCount: number;
    spanAlongRow: [number, number];
}, {
    arrayId: string;
    bayId: string;
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
    rowIds: [string, string];
    center: {
        x: number;
        y: number;
        z: number;
    };
    lengthRow: number;
    rowPairId: string;
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    bayIndex: number;
    bayCount: number;
    spanAlongRow: [number, number];
}>;
export declare const fullArrayAnalysisSchema: z.ZodObject<{
    arrays: z.ZodArray<z.ZodObject<{
        arrayId: z.ZodString;
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
        centroid: z.ZodObject<{
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
        localFrame: z.ZodObject<{
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
        }>;
        rowIds: z.ZodArray<z.ZodString, "many">;
        rowCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
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
        rowIds: string[];
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowCount: number;
    }, {
        arrayId: string;
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
        rowIds: string[];
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowCount: number;
    }>, "many">;
    rows: z.ZodArray<z.ZodObject<{
        rowId: z.ZodString;
        arrayId: z.ZodString;
        moduleObjectIds: z.ZodArray<z.ZodString, "many">;
        centroid: z.ZodObject<{
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
        localFrame: z.ZodObject<{
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
        alongMin: z.ZodNumber;
        alongMax: z.ZodNumber;
        crossMin: z.ZodNumber;
        crossMax: z.ZodNumber;
        centerCross: z.ZodNumber;
        undersideZ: z.ZodNumber;
        maxZ: z.ZodNumber;
        crossDepth: z.ZodNumber;
        rowIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rowId: string;
        arrayId: string;
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
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        moduleObjectIds: string[];
        alongMin: number;
        alongMax: number;
        crossMin: number;
        crossMax: number;
        centerCross: number;
        undersideZ: number;
        maxZ: number;
        crossDepth: number;
        rowIndex: number;
    }, {
        rowId: string;
        arrayId: string;
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
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        moduleObjectIds: string[];
        alongMin: number;
        alongMax: number;
        crossMin: number;
        crossMax: number;
        centerCross: number;
        undersideZ: number;
        maxZ: number;
        crossDepth: number;
        rowIndex: number;
    }>, "many">;
    rowPairs: z.ZodArray<z.ZodObject<{
        rowPairId: z.ZodString;
        arrayId: z.ZodString;
        rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        rowIndices: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        centroid: z.ZodObject<{
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
        centerSpacing: z.ZodNumber;
        interRowGap: z.ZodNumber;
        overlapAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
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
        rowIds: [string, string];
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowIndices: [number, number];
        centerSpacing: number;
        interRowGap: number;
        overlapAlongRow: [number, number];
    }, {
        arrayId: string;
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
        rowIds: [string, string];
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowIndices: [number, number];
        centerSpacing: number;
        interRowGap: number;
        overlapAlongRow: [number, number];
    }>, "many">;
    bays: z.ZodArray<z.ZodObject<{
        bayId: z.ZodString;
        arrayId: z.ZodString;
        rowPairId: z.ZodString;
        rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        bayIndex: z.ZodNumber;
        bayCount: z.ZodNumber;
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
        spanAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        lengthRow: z.ZodNumber;
        classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
        bayId: string;
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
        rowIds: [string, string];
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        bayIndex: number;
        bayCount: number;
        spanAlongRow: [number, number];
    }, {
        arrayId: string;
        bayId: string;
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
        rowIds: [string, string];
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        bayIndex: number;
        bayCount: number;
        spanAlongRow: [number, number];
    }>, "many">;
    representativeGridId: z.ZodOptional<z.ZodString>;
    tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
}, "strip", z.ZodTypeAny, {
    arrays: {
        arrayId: string;
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
        rowIds: string[];
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowCount: number;
    }[];
    rows: {
        rowId: string;
        arrayId: string;
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
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        moduleObjectIds: string[];
        alongMin: number;
        alongMax: number;
        crossMin: number;
        crossMax: number;
        centerCross: number;
        undersideZ: number;
        maxZ: number;
        crossDepth: number;
        rowIndex: number;
    }[];
    rowPairs: {
        arrayId: string;
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
        rowIds: [string, string];
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowIndices: [number, number];
        centerSpacing: number;
        interRowGap: number;
        overlapAlongRow: [number, number];
    }[];
    bays: {
        arrayId: string;
        bayId: string;
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
        rowIds: [string, string];
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        bayIndex: number;
        bayCount: number;
        spanAlongRow: [number, number];
    }[];
    tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
    representativeGridId?: string | undefined;
}, {
    arrays: {
        arrayId: string;
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
        rowIds: string[];
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowCount: number;
    }[];
    rows: {
        rowId: string;
        arrayId: string;
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
        localFrame: {
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
        };
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        moduleObjectIds: string[];
        alongMin: number;
        alongMax: number;
        crossMin: number;
        crossMax: number;
        centerCross: number;
        undersideZ: number;
        maxZ: number;
        crossDepth: number;
        rowIndex: number;
    }[];
    rowPairs: {
        arrayId: string;
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
        rowIds: [string, string];
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        rowIndices: [number, number];
        centerSpacing: number;
        interRowGap: number;
        overlapAlongRow: [number, number];
    }[];
    bays: {
        arrayId: string;
        bayId: string;
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
        rowIds: [string, string];
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        rowPairId: string;
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        bayIndex: number;
        bayCount: number;
        spanAlongRow: [number, number];
    }[];
    tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
    representativeGridId?: string | undefined;
}>;
export declare const radiancePackageManifestSchema: z.ZodObject<{
    exportPackageId: z.ZodString;
    sceneId: z.ZodString;
    createdAt: z.ZodString;
    packageLabel: z.ZodOptional<z.ZodString>;
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
    simulationOptions: z.ZodObject<{
        conversionStrategy: z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>;
        outputMode: z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>;
        ambientBounces: z.ZodDefault<z.ZodNumber>;
        ambientDivisions: z.ZodDefault<z.ZodNumber>;
        ambientResolution: z.ZodOptional<z.ZodNumber>;
        ambientAccuracy: z.ZodOptional<z.ZodNumber>;
        limitWeight: z.ZodOptional<z.ZodNumber>;
        irradianceBinary: z.ZodOptional<z.ZodString>;
        binaries: z.ZodOptional<z.ZodObject<{
            obj2rad: z.ZodOptional<z.ZodString>;
            obj2mesh: z.ZodOptional<z.ZodString>;
            gendaylit: z.ZodOptional<z.ZodString>;
            oconv: z.ZodOptional<z.ZodString>;
            rtrace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        }, {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        conversionStrategy: "obj2rad" | "obj2mesh";
        outputMode: "packageOnly" | "packageAndSimulate";
        ambientBounces: number;
        ambientDivisions: number;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    }, {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    }>;
    sky: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodString;
        timestamp: z.ZodString;
        dni: z.ZodNumber;
        dhi: z.ZodNumber;
        ghi: z.ZodOptional<z.ZodNumber>;
        albedo: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }, {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    }>;
    geometry: z.ZodObject<{
        files: z.ZodArray<z.ZodString, "many">;
        combinedGeometryPath: z.ZodString;
        metadataPath: z.ZodString;
        hash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        hash: string;
        combinedGeometryPath: string;
        files: string[];
        metadataPath: string;
    }, {
        hash: string;
        combinedGeometryPath: string;
        files: string[];
        metadataPath: string;
    }>;
    materials: z.ZodObject<{
        jsonPath: z.ZodString;
        radPath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        jsonPath: string;
        radPath: string;
    }, {
        jsonPath: string;
        radPath: string;
    }>;
    sensors: z.ZodObject<{
        mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
        gridMetadataPath: z.ZodString;
        pointFiles: z.ZodArray<z.ZodString, "many">;
        totalGridCount: z.ZodNumber;
        totalSensorCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        gridMetadataPath: string;
        pointFiles: string[];
        totalGridCount: number;
        totalSensorCount: number;
    }, {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        gridMetadataPath: string;
        pointFiles: string[];
        totalGridCount: number;
        totalSensorCount: number;
    }>;
    skyFiles: z.ZodObject<{
        jsonPath: z.ZodString;
        shellScriptPath: z.ZodString;
        plannedRadPath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        jsonPath: string;
        shellScriptPath: string;
        plannedRadPath: string;
    }, {
        jsonPath: string;
        shellScriptPath: string;
        plannedRadPath: string;
    }>;
    radiancePlan: z.ZodObject<{
        planPath: z.ZodString;
        shellScriptPath: z.ZodString;
        commands: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            program: z.ZodString;
            args: z.ZodArray<z.ZodString, "many">;
            cwdRelative: z.ZodString;
            stdoutRelativePath: z.ZodOptional<z.ZodString>;
            stdinRelativePath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }, {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        shellScriptPath: string;
        planPath: string;
        commands: {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }[];
    }, {
        shellScriptPath: string;
        planPath: string;
        commands: {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }[];
    }>;
    results: z.ZodObject<{
        directory: z.ZodString;
        parsedResultPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        directory: string;
        parsedResultPath?: string | undefined;
    }, {
        directory: string;
        parsedResultPath?: string | undefined;
    }>;
    provenance: z.ZodObject<{
        exporterVersion: z.ZodString;
        backendVersion: z.ZodString;
        geometryHash: z.ZodString;
        materialConfigHash: z.ZodString;
        notes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        notes: string[];
        exporterVersion: string;
        geometryHash: string;
        backendVersion: string;
        materialConfigHash: string;
    }, {
        notes: string[];
        exporterVersion: string;
        geometryHash: string;
        backendVersion: string;
        materialConfigHash: string;
    }>;
}, "strip", z.ZodTypeAny, {
    exportPackageId: string;
    sceneId: string;
    createdAt: string;
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
    sky: {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    };
    simulationOptions: {
        conversionStrategy: "obj2rad" | "obj2mesh";
        outputMode: "packageOnly" | "packageAndSimulate";
        ambientBounces: number;
        ambientDivisions: number;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    };
    sensors: {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        gridMetadataPath: string;
        pointFiles: string[];
        totalGridCount: number;
        totalSensorCount: number;
    };
    geometry: {
        hash: string;
        combinedGeometryPath: string;
        files: string[];
        metadataPath: string;
    };
    materials: {
        jsonPath: string;
        radPath: string;
    };
    skyFiles: {
        jsonPath: string;
        shellScriptPath: string;
        plannedRadPath: string;
    };
    radiancePlan: {
        shellScriptPath: string;
        planPath: string;
        commands: {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }[];
    };
    results: {
        directory: string;
        parsedResultPath?: string | undefined;
    };
    provenance: {
        notes: string[];
        exporterVersion: string;
        geometryHash: string;
        backendVersion: string;
        materialConfigHash: string;
    };
    packageLabel?: string | undefined;
}, {
    exportPackageId: string;
    sceneId: string;
    createdAt: string;
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
    sky: {
        timezone: string;
        latitude: number;
        longitude: number;
        timestamp: string;
        dni: number;
        dhi: number;
        ghi?: number | undefined;
        albedo?: number | undefined;
    };
    simulationOptions: {
        conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
        outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
        ambientBounces?: number | undefined;
        ambientDivisions?: number | undefined;
        ambientResolution?: number | undefined;
        ambientAccuracy?: number | undefined;
        limitWeight?: number | undefined;
        irradianceBinary?: string | undefined;
        binaries?: {
            obj2rad?: string | undefined;
            obj2mesh?: string | undefined;
            gendaylit?: string | undefined;
            oconv?: string | undefined;
            rtrace?: string | undefined;
        } | undefined;
    };
    sensors: {
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        gridMetadataPath: string;
        pointFiles: string[];
        totalGridCount: number;
        totalSensorCount: number;
    };
    geometry: {
        hash: string;
        combinedGeometryPath: string;
        files: string[];
        metadataPath: string;
    };
    materials: {
        jsonPath: string;
        radPath: string;
    };
    skyFiles: {
        jsonPath: string;
        shellScriptPath: string;
        plannedRadPath: string;
    };
    radiancePlan: {
        shellScriptPath: string;
        planPath: string;
        commands: {
            id: string;
            program: string;
            args: string[];
            cwdRelative: string;
            stdoutRelativePath?: string | undefined;
            stdinRelativePath?: string | undefined;
        }[];
    };
    results: {
        directory: string;
        parsedResultPath?: string | undefined;
    };
    provenance: {
        notes: string[];
        exporterVersion: string;
        geometryHash: string;
        backendVersion: string;
        materialConfigHash: string;
    };
    packageLabel?: string | undefined;
}>;
export declare const exportPackageResultSchema: z.ZodObject<{
    exportPackageId: z.ZodString;
    packageRoot: z.ZodString;
    manifest: z.ZodObject<{
        exportPackageId: z.ZodString;
        sceneId: z.ZodString;
        createdAt: z.ZodString;
        packageLabel: z.ZodOptional<z.ZodString>;
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
        simulationOptions: z.ZodObject<{
            conversionStrategy: z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>;
            outputMode: z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>;
            ambientBounces: z.ZodDefault<z.ZodNumber>;
            ambientDivisions: z.ZodDefault<z.ZodNumber>;
            ambientResolution: z.ZodOptional<z.ZodNumber>;
            ambientAccuracy: z.ZodOptional<z.ZodNumber>;
            limitWeight: z.ZodOptional<z.ZodNumber>;
            irradianceBinary: z.ZodOptional<z.ZodString>;
            binaries: z.ZodOptional<z.ZodObject<{
                obj2rad: z.ZodOptional<z.ZodString>;
                obj2mesh: z.ZodOptional<z.ZodString>;
                gendaylit: z.ZodOptional<z.ZodString>;
                oconv: z.ZodOptional<z.ZodString>;
                rtrace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }, {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }>;
        sky: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            timestamp: z.ZodString;
            dni: z.ZodNumber;
            dhi: z.ZodNumber;
            ghi: z.ZodOptional<z.ZodNumber>;
            albedo: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }>;
        geometry: z.ZodObject<{
            files: z.ZodArray<z.ZodString, "many">;
            combinedGeometryPath: z.ZodString;
            metadataPath: z.ZodString;
            hash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }>;
        materials: z.ZodObject<{
            jsonPath: z.ZodString;
            radPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            radPath: string;
        }, {
            jsonPath: string;
            radPath: string;
        }>;
        sensors: z.ZodObject<{
            mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
            tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
            gridMetadataPath: z.ZodString;
            pointFiles: z.ZodArray<z.ZodString, "many">;
            totalGridCount: z.ZodNumber;
            totalSensorCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }>;
        skyFiles: z.ZodObject<{
            jsonPath: z.ZodString;
            shellScriptPath: z.ZodString;
            plannedRadPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }>;
        radiancePlan: z.ZodObject<{
            planPath: z.ZodString;
            shellScriptPath: z.ZodString;
            commands: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                program: z.ZodString;
                args: z.ZodArray<z.ZodString, "many">;
                cwdRelative: z.ZodString;
                stdoutRelativePath: z.ZodOptional<z.ZodString>;
                stdinRelativePath: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }>;
        results: z.ZodObject<{
            directory: z.ZodString;
            parsedResultPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            directory: string;
            parsedResultPath?: string | undefined;
        }, {
            directory: string;
            parsedResultPath?: string | undefined;
        }>;
        provenance: z.ZodObject<{
            exporterVersion: z.ZodString;
            backendVersion: z.ZodString;
            geometryHash: z.ZodString;
            materialConfigHash: z.ZodString;
            notes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }>;
    analysis: z.ZodObject<{
        arrays: z.ZodArray<z.ZodObject<{
            arrayId: z.ZodString;
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
            centroid: z.ZodObject<{
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
            localFrame: z.ZodObject<{
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
            }>;
            rowIds: z.ZodArray<z.ZodString, "many">;
            rowCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }, {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }>, "many">;
        rows: z.ZodArray<z.ZodObject<{
            rowId: z.ZodString;
            arrayId: z.ZodString;
            moduleObjectIds: z.ZodArray<z.ZodString, "many">;
            centroid: z.ZodObject<{
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
            localFrame: z.ZodObject<{
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
            alongMin: z.ZodNumber;
            alongMax: z.ZodNumber;
            crossMin: z.ZodNumber;
            crossMax: z.ZodNumber;
            centerCross: z.ZodNumber;
            undersideZ: z.ZodNumber;
            maxZ: z.ZodNumber;
            crossDepth: z.ZodNumber;
            rowIndex: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }, {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }>, "many">;
        rowPairs: z.ZodArray<z.ZodObject<{
            rowPairId: z.ZodString;
            arrayId: z.ZodString;
            rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            rowIndices: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            centroid: z.ZodObject<{
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
            centerSpacing: z.ZodNumber;
            interRowGap: z.ZodNumber;
            overlapAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }, {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }>, "many">;
        bays: z.ZodArray<z.ZodObject<{
            bayId: z.ZodString;
            arrayId: z.ZodString;
            rowPairId: z.ZodString;
            rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            bayIndex: z.ZodNumber;
            bayCount: z.ZodNumber;
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
            spanAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            lengthRow: z.ZodNumber;
            classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }, {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }>, "many">;
        representativeGridId: z.ZodOptional<z.ZodString>;
        tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
    }, "strip", z.ZodTypeAny, {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    }, {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    }>;
    grids: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        arrayId: z.ZodString;
        rowPairId: z.ZodString;
        bayId: z.ZodOptional<z.ZodString>;
        rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        localFrame: z.ZodObject<{
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
        }>;
        bounds: z.ZodObject<{
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
        }>;
        worldBounds: z.ZodObject<{
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
        centroid: z.ZodObject<{
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
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        bayIndex: z.ZodNumber;
        bayCount: z.ZodNumber;
        sensors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
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
            localPosition: z.ZodObject<{
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
            normal: z.ZodObject<{
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
            rowPairId: z.ZodOptional<z.ZodString>;
            bayId: z.ZodOptional<z.ZodString>;
            arrayId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }>, "many">;
        radiancePoints: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }>, "many">;
    generatedFiles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    exportPackageId: string;
    analysis: {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    };
    manifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }[];
    packageRoot: string;
    generatedFiles: string[];
}, {
    exportPackageId: string;
    analysis: {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    };
    manifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }[];
    packageRoot: string;
    generatedFiles: string[];
}>;
export declare const irradianceSampleSchema: z.ZodObject<{
    sensorId: z.ZodString;
    gridId: z.ZodString;
    Ee: z.ZodNumber;
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
    normal: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    normal: {
        x: number;
        y: number;
        z: number;
    };
    indices: [number, number, number];
    normalized: [number, number, number];
    sensorId: string;
    Ee: number;
}, {
    position: {
        x: number;
        y: number;
        z: number;
    };
    gridId: string;
    normal: {
        x: number;
        y: number;
        z: number;
    };
    indices: [number, number, number];
    normalized: [number, number, number];
    sensorId: string;
    Ee: number;
}>;
export declare const irradianceStatsSchema: z.ZodObject<{
    min: z.ZodNumber;
    max: z.ZodNumber;
    mean: z.ZodNumber;
    median: z.ZodNumber;
    p05: z.ZodNumber;
    p95: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    min: number;
    max: number;
    mean: number;
    median: number;
    p05: number;
    p95: number;
}, {
    min: number;
    max: number;
    mean: number;
    median: number;
    p05: number;
    p95: number;
}>;
export declare const axisSliceSummarySchema: z.ZodObject<{
    axis: z.ZodEnum<["row", "cross", "up"]>;
    index: z.ZodNumber;
    min: z.ZodNumber;
    max: z.ZodNumber;
    mean: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    min: number;
    max: number;
    mean: number;
    axis: "row" | "cross" | "up";
    index: number;
}, {
    min: number;
    max: number;
    mean: number;
    axis: "row" | "cross" | "up";
    index: number;
}>;
export declare const gridResultSchema: z.ZodObject<{
    gridId: z.ZodString;
    arrayId: z.ZodString;
    rowPairId: z.ZodString;
    bayId: z.ZodOptional<z.ZodString>;
    rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
    classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
    dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    bounds: z.ZodObject<{
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
    }>;
    worldBounds: z.ZodObject<{
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
    centroid: z.ZodObject<{
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
    sensors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
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
        localPosition: z.ZodObject<{
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
        normal: z.ZodObject<{
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
        rowPairId: z.ZodOptional<z.ZodString>;
        bayId: z.ZodOptional<z.ZodString>;
        arrayId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }>, "many">;
    irradianceResults: z.ZodArray<z.ZodObject<{
        sensorId: z.ZodString;
        gridId: z.ZodString;
        Ee: z.ZodNumber;
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
        normal: z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        Ee: number;
    }, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        Ee: number;
    }>, "many">;
    stats: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        mean: z.ZodNumber;
        median: z.ZodNumber;
        p05: z.ZodNumber;
        p95: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }>;
    slices: z.ZodObject<{
        row: z.ZodArray<z.ZodObject<{
            axis: z.ZodEnum<["row", "cross", "up"]>;
            index: z.ZodNumber;
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }>, "many">;
        cross: z.ZodArray<z.ZodObject<{
            axis: z.ZodEnum<["row", "cross", "up"]>;
            index: z.ZodNumber;
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }>, "many">;
        up: z.ZodArray<z.ZodObject<{
            axis: z.ZodEnum<["row", "cross", "up"]>;
            index: z.ZodNumber;
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }, {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        row: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        cross: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        up: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
    }, {
        row: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        cross: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        up: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    arrayId: string;
    bounds: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    };
    rowIds: [string, string];
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    worldBounds: {
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
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }[];
    irradianceResults: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        Ee: number;
    }[];
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    slices: {
        row: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        cross: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        up: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
    };
    bayId?: string | undefined;
}, {
    arrayId: string;
    bounds: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        lengthRow: number;
        lengthCross: number;
        height: number;
    };
    rowIds: [string, string];
    gridId: string;
    rowPairId: string;
    dimensions: [number, number, number];
    classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
    worldBounds: {
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
    centroid: {
        x: number;
        y: number;
        z: number;
    };
    sensors: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        id: string;
        gridId: string;
        localPosition: {
            x: number;
            y: number;
            z: number;
        };
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        arrayId?: string | undefined;
        bayId?: string | undefined;
        rowPairId?: string | undefined;
    }[];
    irradianceResults: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        gridId: string;
        normal: {
            x: number;
            y: number;
            z: number;
        };
        indices: [number, number, number];
        normalized: [number, number, number];
        sensorId: string;
        Ee: number;
    }[];
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    slices: {
        row: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        cross: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
        up: {
            min: number;
            max: number;
            mean: number;
            axis: "row" | "cross" | "up";
            index: number;
        }[];
    };
    bayId?: string | undefined;
}>;
export declare const classificationSummarySchema: z.ZodObject<{
    classification: z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>;
    gridIds: z.ZodArray<z.ZodString, "many">;
    sensorCount: z.ZodNumber;
    stats: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        mean: z.ZodNumber;
        median: z.ZodNumber;
        p05: z.ZodNumber;
        p95: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }>;
}, "strip", z.ZodTypeAny, {
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
    gridIds: string[];
    sensorCount: number;
}, {
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
    gridIds: string[];
    sensorCount: number;
}>;
export declare const arrayResultSummarySchema: z.ZodObject<{
    gridCount: z.ZodNumber;
    sensorCount: z.ZodNumber;
    stats: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        mean: z.ZodNumber;
        median: z.ZodNumber;
        p05: z.ZodNumber;
        p95: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }, {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    }>;
    edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
    edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    sensorCount: number;
    gridCount: number;
    edgeInteriorDifference?: number | undefined;
    edgeInteriorRatio?: number | undefined;
}, {
    stats: {
        min: number;
        max: number;
        mean: number;
        median: number;
        p05: number;
        p95: number;
    };
    sensorCount: number;
    gridCount: number;
    edgeInteriorDifference?: number | undefined;
    edgeInteriorRatio?: number | undefined;
}>;
export declare const importedSimulationResultSchema: z.ZodObject<{
    simulationId: z.ZodString;
    exportPackageId: z.ZodString;
    mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
    tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
    grids: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        arrayId: z.ZodString;
        rowPairId: z.ZodString;
        bayId: z.ZodOptional<z.ZodString>;
        rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        bounds: z.ZodObject<{
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
        }>;
        worldBounds: z.ZodObject<{
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
        centroid: z.ZodObject<{
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
        sensors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
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
            localPosition: z.ZodObject<{
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
            normal: z.ZodObject<{
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
            rowPairId: z.ZodOptional<z.ZodString>;
            bayId: z.ZodOptional<z.ZodString>;
            arrayId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }>, "many">;
        irradianceResults: z.ZodArray<z.ZodObject<{
            sensorId: z.ZodString;
            gridId: z.ZodString;
            Ee: z.ZodNumber;
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
            normal: z.ZodObject<{
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
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }>, "many">;
        stats: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
            median: z.ZodNumber;
            p05: z.ZodNumber;
            p95: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }>;
        slices: z.ZodObject<{
            row: z.ZodArray<z.ZodObject<{
                axis: z.ZodEnum<["row", "cross", "up"]>;
                index: z.ZodNumber;
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }>, "many">;
            cross: z.ZodArray<z.ZodObject<{
                axis: z.ZodEnum<["row", "cross", "up"]>;
                index: z.ZodNumber;
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }>, "many">;
            up: z.ZodArray<z.ZodObject<{
                axis: z.ZodEnum<["row", "cross", "up"]>;
                index: z.ZodNumber;
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }, {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        }, {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        irradianceResults: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }[];
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        slices: {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        };
        bayId?: string | undefined;
    }, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        irradianceResults: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }[];
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        slices: {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        };
        bayId?: string | undefined;
    }>, "many">;
    arrayStats: z.ZodObject<{
        gridCount: z.ZodNumber;
        sensorCount: z.ZodNumber;
        stats: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
            median: z.ZodNumber;
            p05: z.ZodNumber;
            p95: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }>;
        edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
        edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }>;
    classificationStats: z.ZodArray<z.ZodObject<{
        classification: z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>;
        gridIds: z.ZodArray<z.ZodString, "many">;
        sensorCount: z.ZodNumber;
        stats: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
            median: z.ZodNumber;
            p05: z.ZodNumber;
            p95: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
        gridIds: string[];
        sensorCount: number;
    }, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
        gridIds: string[];
        sensorCount: number;
    }>, "many">;
    edgeStats: z.ZodOptional<z.ZodObject<{
        gridCount: z.ZodNumber;
        sensorCount: z.ZodNumber;
        stats: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
            median: z.ZodNumber;
            p05: z.ZodNumber;
            p95: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }>;
        edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
        edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }>>;
    interiorStats: z.ZodOptional<z.ZodObject<{
        gridCount: z.ZodNumber;
        sensorCount: z.ZodNumber;
        stats: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            mean: z.ZodNumber;
            median: z.ZodNumber;
            p05: z.ZodNumber;
            p95: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }, {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        }>;
        edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
        edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }, {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    }>>;
    provenance: z.ZodObject<{
        sourceFiles: z.ZodArray<z.ZodString, "many">;
        importedAt: z.ZodString;
        parserNotes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        sourceFiles: string[];
        importedAt: string;
        parserNotes: string[];
    }, {
        sourceFiles: string[];
        importedAt: string;
        parserNotes: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    exportPackageId: string;
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        irradianceResults: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }[];
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        slices: {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        };
        bayId?: string | undefined;
    }[];
    mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
    provenance: {
        sourceFiles: string[];
        importedAt: string;
        parserNotes: string[];
    };
    simulationId: string;
    arrayStats: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    };
    classificationStats: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
        gridIds: string[];
        sensorCount: number;
    }[];
    edgeStats?: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    } | undefined;
    interiorStats?: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    } | undefined;
}, {
    exportPackageId: string;
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        irradianceResults: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            gridId: string;
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            sensorId: string;
            Ee: number;
        }[];
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        slices: {
            row: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            cross: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
            up: {
                min: number;
                max: number;
                mean: number;
                axis: "row" | "cross" | "up";
                index: number;
            }[];
        };
        bayId?: string | undefined;
    }[];
    mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
    tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
    provenance: {
        sourceFiles: string[];
        importedAt: string;
        parserNotes: string[];
    };
    simulationId: string;
    arrayStats: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    };
    classificationStats: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
        gridIds: string[];
        sensorCount: number;
    }[];
    edgeStats?: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    } | undefined;
    interiorStats?: {
        stats: {
            min: number;
            max: number;
            mean: number;
            median: number;
            p05: number;
            p95: number;
        };
        sensorCount: number;
        gridCount: number;
        edgeInteriorDifference?: number | undefined;
        edgeInteriorRatio?: number | undefined;
    } | undefined;
}>;
export declare const resultFilePayloadSchema: z.ZodObject<{
    fileName: z.ZodString;
    content: z.ZodString;
    format: z.ZodOptional<z.ZodEnum<["radianceRGB", "radianceScalar", "json"]>>;
    gridId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fileName: string;
    content: string;
    gridId?: string | undefined;
    format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
}, {
    fileName: string;
    content: string;
    gridId?: string | undefined;
    format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
}>;
export declare const importResultsRequestSchema: z.ZodObject<{
    exportPackageManifest: z.ZodObject<{
        exportPackageId: z.ZodString;
        sceneId: z.ZodString;
        createdAt: z.ZodString;
        packageLabel: z.ZodOptional<z.ZodString>;
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
        simulationOptions: z.ZodObject<{
            conversionStrategy: z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>;
            outputMode: z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>;
            ambientBounces: z.ZodDefault<z.ZodNumber>;
            ambientDivisions: z.ZodDefault<z.ZodNumber>;
            ambientResolution: z.ZodOptional<z.ZodNumber>;
            ambientAccuracy: z.ZodOptional<z.ZodNumber>;
            limitWeight: z.ZodOptional<z.ZodNumber>;
            irradianceBinary: z.ZodOptional<z.ZodString>;
            binaries: z.ZodOptional<z.ZodObject<{
                obj2rad: z.ZodOptional<z.ZodString>;
                obj2mesh: z.ZodOptional<z.ZodString>;
                gendaylit: z.ZodOptional<z.ZodString>;
                oconv: z.ZodOptional<z.ZodString>;
                rtrace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }, {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }>;
        sky: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            timestamp: z.ZodString;
            dni: z.ZodNumber;
            dhi: z.ZodNumber;
            ghi: z.ZodOptional<z.ZodNumber>;
            albedo: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }>;
        geometry: z.ZodObject<{
            files: z.ZodArray<z.ZodString, "many">;
            combinedGeometryPath: z.ZodString;
            metadataPath: z.ZodString;
            hash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }>;
        materials: z.ZodObject<{
            jsonPath: z.ZodString;
            radPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            radPath: string;
        }, {
            jsonPath: string;
            radPath: string;
        }>;
        sensors: z.ZodObject<{
            mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
            tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
            gridMetadataPath: z.ZodString;
            pointFiles: z.ZodArray<z.ZodString, "many">;
            totalGridCount: z.ZodNumber;
            totalSensorCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }>;
        skyFiles: z.ZodObject<{
            jsonPath: z.ZodString;
            shellScriptPath: z.ZodString;
            plannedRadPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }>;
        radiancePlan: z.ZodObject<{
            planPath: z.ZodString;
            shellScriptPath: z.ZodString;
            commands: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                program: z.ZodString;
                args: z.ZodArray<z.ZodString, "many">;
                cwdRelative: z.ZodString;
                stdoutRelativePath: z.ZodOptional<z.ZodString>;
                stdinRelativePath: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }>;
        results: z.ZodObject<{
            directory: z.ZodString;
            parsedResultPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            directory: string;
            parsedResultPath?: string | undefined;
        }, {
            directory: string;
            parsedResultPath?: string | undefined;
        }>;
        provenance: z.ZodObject<{
            exporterVersion: z.ZodString;
            backendVersion: z.ZodString;
            geometryHash: z.ZodString;
            materialConfigHash: z.ZodString;
            notes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }>;
    grids: z.ZodArray<z.ZodObject<{
        gridId: z.ZodString;
        mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        arrayId: z.ZodString;
        rowPairId: z.ZodString;
        bayId: z.ZodOptional<z.ZodString>;
        rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        localFrame: z.ZodObject<{
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
        }>;
        bounds: z.ZodObject<{
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
        }>;
        worldBounds: z.ZodObject<{
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
        centroid: z.ZodObject<{
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
        dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        bayIndex: z.ZodNumber;
        bayCount: z.ZodNumber;
        sensors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
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
            localPosition: z.ZodObject<{
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
            normal: z.ZodObject<{
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
            rowPairId: z.ZodOptional<z.ZodString>;
            bayId: z.ZodOptional<z.ZodString>;
            arrayId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }>, "many">;
        radiancePoints: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }, {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }>, "many">;
    resultFiles: z.ZodArray<z.ZodObject<{
        fileName: z.ZodString;
        content: z.ZodString;
        format: z.ZodOptional<z.ZodEnum<["radianceRGB", "radianceScalar", "json"]>>;
        gridId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName: string;
        content: string;
        gridId?: string | undefined;
        format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
    }, {
        fileName: string;
        content: string;
        gridId?: string | undefined;
        format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
    }>, "many">;
    simulationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }[];
    exportPackageManifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    resultFiles: {
        fileName: string;
        content: string;
        gridId?: string | undefined;
        format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
    }[];
    simulationId?: string | undefined;
}, {
    grids: {
        arrayId: string;
        bounds: {
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            lengthCross: number;
            height: number;
        };
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        rowIds: [string, string];
        gridId: string;
        rowPairId: string;
        dimensions: [number, number, number];
        classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
        localFrame: {
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
        };
        worldBounds: {
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
        centroid: {
            x: number;
            y: number;
            z: number;
        };
        bayIndex: number;
        bayCount: number;
        sensors: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            id: string;
            gridId: string;
            localPosition: {
                x: number;
                y: number;
                z: number;
            };
            normal: {
                x: number;
                y: number;
                z: number;
            };
            indices: [number, number, number];
            normalized: [number, number, number];
            arrayId?: string | undefined;
            bayId?: string | undefined;
            rowPairId?: string | undefined;
        }[];
        radiancePoints: string;
        bayId?: string | undefined;
    }[];
    exportPackageManifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    resultFiles: {
        fileName: string;
        content: string;
        gridId?: string | undefined;
        format?: "radianceRGB" | "radianceScalar" | "json" | undefined;
    }[];
    simulationId?: string | undefined;
}>;
export declare const simulationExecutionResultSchema: z.ZodObject<{
    simulationId: z.ZodString;
    exportPackageId: z.ZodString;
    packageRoot: z.ZodString;
    manifest: z.ZodObject<{
        exportPackageId: z.ZodString;
        sceneId: z.ZodString;
        createdAt: z.ZodString;
        packageLabel: z.ZodOptional<z.ZodString>;
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
        simulationOptions: z.ZodObject<{
            conversionStrategy: z.ZodDefault<z.ZodEnum<["obj2rad", "obj2mesh"]>>;
            outputMode: z.ZodDefault<z.ZodEnum<["packageOnly", "packageAndSimulate"]>>;
            ambientBounces: z.ZodDefault<z.ZodNumber>;
            ambientDivisions: z.ZodDefault<z.ZodNumber>;
            ambientResolution: z.ZodOptional<z.ZodNumber>;
            ambientAccuracy: z.ZodOptional<z.ZodNumber>;
            limitWeight: z.ZodOptional<z.ZodNumber>;
            irradianceBinary: z.ZodOptional<z.ZodString>;
            binaries: z.ZodOptional<z.ZodObject<{
                obj2rad: z.ZodOptional<z.ZodString>;
                obj2mesh: z.ZodOptional<z.ZodString>;
                gendaylit: z.ZodOptional<z.ZodString>;
                oconv: z.ZodOptional<z.ZodString>;
                rtrace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }, {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }, {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        }>;
        sky: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            timezone: z.ZodString;
            timestamp: z.ZodString;
            dni: z.ZodNumber;
            dhi: z.ZodNumber;
            ghi: z.ZodOptional<z.ZodNumber>;
            albedo: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }, {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        }>;
        geometry: z.ZodObject<{
            files: z.ZodArray<z.ZodString, "many">;
            combinedGeometryPath: z.ZodString;
            metadataPath: z.ZodString;
            hash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }, {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        }>;
        materials: z.ZodObject<{
            jsonPath: z.ZodString;
            radPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            radPath: string;
        }, {
            jsonPath: string;
            radPath: string;
        }>;
        sensors: z.ZodObject<{
            mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
            tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
            gridMetadataPath: z.ZodString;
            pointFiles: z.ZodArray<z.ZodString, "many">;
            totalGridCount: z.ZodNumber;
            totalSensorCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }, {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        }>;
        skyFiles: z.ZodObject<{
            jsonPath: z.ZodString;
            shellScriptPath: z.ZodString;
            plannedRadPath: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }, {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        }>;
        radiancePlan: z.ZodObject<{
            planPath: z.ZodString;
            shellScriptPath: z.ZodString;
            commands: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                program: z.ZodString;
                args: z.ZodArray<z.ZodString, "many">;
                cwdRelative: z.ZodString;
                stdoutRelativePath: z.ZodOptional<z.ZodString>;
                stdinRelativePath: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }, {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }, {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        }>;
        results: z.ZodObject<{
            directory: z.ZodString;
            parsedResultPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            directory: string;
            parsedResultPath?: string | undefined;
        }, {
            directory: string;
            parsedResultPath?: string | undefined;
        }>;
        provenance: z.ZodObject<{
            exporterVersion: z.ZodString;
            backendVersion: z.ZodString;
            geometryHash: z.ZodString;
            materialConfigHash: z.ZodString;
            notes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }, {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }, {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    }>;
    analysis: z.ZodObject<{
        arrays: z.ZodArray<z.ZodObject<{
            arrayId: z.ZodString;
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
            centroid: z.ZodObject<{
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
            localFrame: z.ZodObject<{
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
            }>;
            rowIds: z.ZodArray<z.ZodString, "many">;
            rowCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }, {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }>, "many">;
        rows: z.ZodArray<z.ZodObject<{
            rowId: z.ZodString;
            arrayId: z.ZodString;
            moduleObjectIds: z.ZodArray<z.ZodString, "many">;
            centroid: z.ZodObject<{
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
            localFrame: z.ZodObject<{
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
            alongMin: z.ZodNumber;
            alongMax: z.ZodNumber;
            crossMin: z.ZodNumber;
            crossMax: z.ZodNumber;
            centerCross: z.ZodNumber;
            undersideZ: z.ZodNumber;
            maxZ: z.ZodNumber;
            crossDepth: z.ZodNumber;
            rowIndex: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }, {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }>, "many">;
        rowPairs: z.ZodArray<z.ZodObject<{
            rowPairId: z.ZodString;
            arrayId: z.ZodString;
            rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            rowIndices: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            centroid: z.ZodObject<{
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
            centerSpacing: z.ZodNumber;
            interRowGap: z.ZodNumber;
            overlapAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }, {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }>, "many">;
        bays: z.ZodArray<z.ZodObject<{
            bayId: z.ZodString;
            arrayId: z.ZodString;
            rowPairId: z.ZodString;
            rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            bayIndex: z.ZodNumber;
            bayCount: z.ZodNumber;
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
            spanAlongRow: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            lengthRow: z.ZodNumber;
            classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }, {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }>, "many">;
        representativeGridId: z.ZodOptional<z.ZodString>;
        tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
    }, "strip", z.ZodTypeAny, {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    }, {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    }>;
    importedResults: z.ZodObject<{
        simulationId: z.ZodString;
        exportPackageId: z.ZodString;
        mode: z.ZodEnum<["centerArrayGrid", "centralRowGrid", "fullArrayGrid"]>;
        tilingStrategy: z.ZodEnum<["rowPairBayTiling", "rowPairSingleVolume", "uniformArrayGrid"]>;
        grids: z.ZodArray<z.ZodObject<{
            gridId: z.ZodString;
            arrayId: z.ZodString;
            rowPairId: z.ZodString;
            bayId: z.ZodOptional<z.ZodString>;
            rowIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            classifications: z.ZodArray<z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>, "many">;
            dimensions: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            bounds: z.ZodObject<{
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
            }>;
            worldBounds: z.ZodObject<{
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
            centroid: z.ZodObject<{
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
            sensors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
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
                localPosition: z.ZodObject<{
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
                normal: z.ZodObject<{
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
                rowPairId: z.ZodOptional<z.ZodString>;
                bayId: z.ZodOptional<z.ZodString>;
                arrayId: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }, {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }>, "many">;
            irradianceResults: z.ZodArray<z.ZodObject<{
                sensorId: z.ZodString;
                gridId: z.ZodString;
                Ee: z.ZodNumber;
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
                normal: z.ZodObject<{
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
            }, "strip", z.ZodTypeAny, {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }, {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }>, "many">;
            stats: z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
                median: z.ZodNumber;
                p05: z.ZodNumber;
                p95: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }>;
            slices: z.ZodObject<{
                row: z.ZodArray<z.ZodObject<{
                    axis: z.ZodEnum<["row", "cross", "up"]>;
                    index: z.ZodNumber;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    mean: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }>, "many">;
                cross: z.ZodArray<z.ZodObject<{
                    axis: z.ZodEnum<["row", "cross", "up"]>;
                    index: z.ZodNumber;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    mean: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }>, "many">;
                up: z.ZodArray<z.ZodObject<{
                    axis: z.ZodEnum<["row", "cross", "up"]>;
                    index: z.ZodNumber;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    mean: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }, {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            }, {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            }>;
        }, "strip", z.ZodTypeAny, {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }, {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }>, "many">;
        arrayStats: z.ZodObject<{
            gridCount: z.ZodNumber;
            sensorCount: z.ZodNumber;
            stats: z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
                median: z.ZodNumber;
                p05: z.ZodNumber;
                p95: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }>;
            edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
            edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }>;
        classificationStats: z.ZodArray<z.ZodObject<{
            classification: z.ZodEnum<["interior", "edge_north", "edge_south", "edge_east", "edge_west", "corner", "end_of_row", "custom"]>;
            gridIds: z.ZodArray<z.ZodString, "many">;
            sensorCount: z.ZodNumber;
            stats: z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
                median: z.ZodNumber;
                p05: z.ZodNumber;
                p95: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }>, "many">;
        edgeStats: z.ZodOptional<z.ZodObject<{
            gridCount: z.ZodNumber;
            sensorCount: z.ZodNumber;
            stats: z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
                median: z.ZodNumber;
                p05: z.ZodNumber;
                p95: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }>;
            edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
            edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }>>;
        interiorStats: z.ZodOptional<z.ZodObject<{
            gridCount: z.ZodNumber;
            sensorCount: z.ZodNumber;
            stats: z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                mean: z.ZodNumber;
                median: z.ZodNumber;
                p05: z.ZodNumber;
                p95: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }, {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            }>;
            edgeInteriorDifference: z.ZodOptional<z.ZodNumber>;
            edgeInteriorRatio: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }, {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        }>>;
        provenance: z.ZodObject<{
            sourceFiles: z.ZodArray<z.ZodString, "many">;
            importedAt: z.ZodString;
            parserNotes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        }, {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        exportPackageId: string;
        grids: {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }[];
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        provenance: {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        };
        simulationId: string;
        arrayStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        };
        classificationStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }[];
        edgeStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
        interiorStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
    }, {
        exportPackageId: string;
        grids: {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }[];
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        provenance: {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        };
        simulationId: string;
        arrayStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        };
        classificationStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }[];
        edgeStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
        interiorStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
    }>;
    commandLog: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        command: z.ZodString;
        cwd: z.ZodString;
        startedAt: z.ZodString;
        endedAt: z.ZodString;
        durationMs: z.ZodNumber;
        exitCode: z.ZodNumber;
        stdoutPath: z.ZodOptional<z.ZodString>;
        stderrPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        command: string;
        cwd: string;
        startedAt: string;
        endedAt: string;
        durationMs: number;
        exitCode: number;
        stdoutPath?: string | undefined;
        stderrPath?: string | undefined;
    }, {
        id: string;
        command: string;
        cwd: string;
        startedAt: string;
        endedAt: string;
        durationMs: number;
        exitCode: number;
        stdoutPath?: string | undefined;
        stderrPath?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    exportPackageId: string;
    analysis: {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    };
    manifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy: "obj2rad" | "obj2mesh";
            outputMode: "packageOnly" | "packageAndSimulate";
            ambientBounces: number;
            ambientDivisions: number;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    packageRoot: string;
    simulationId: string;
    importedResults: {
        exportPackageId: string;
        grids: {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }[];
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        provenance: {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        };
        simulationId: string;
        arrayStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        };
        classificationStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }[];
        edgeStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
        interiorStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
    };
    commandLog: {
        id: string;
        command: string;
        cwd: string;
        startedAt: string;
        endedAt: string;
        durationMs: number;
        exitCode: number;
        stdoutPath?: string | undefined;
        stderrPath?: string | undefined;
    }[];
}, {
    exportPackageId: string;
    analysis: {
        arrays: {
            arrayId: string;
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
            rowIds: string[];
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowCount: number;
        }[];
        rows: {
            rowId: string;
            arrayId: string;
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
            localFrame: {
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
            };
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            moduleObjectIds: string[];
            alongMin: number;
            alongMax: number;
            crossMin: number;
            crossMax: number;
            centerCross: number;
            undersideZ: number;
            maxZ: number;
            crossDepth: number;
            rowIndex: number;
        }[];
        rowPairs: {
            arrayId: string;
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
            rowIds: [string, string];
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            rowIndices: [number, number];
            centerSpacing: number;
            interRowGap: number;
            overlapAlongRow: [number, number];
        }[];
        bays: {
            arrayId: string;
            bayId: string;
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
            rowIds: [string, string];
            center: {
                x: number;
                y: number;
                z: number;
            };
            lengthRow: number;
            rowPairId: string;
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            bayIndex: number;
            bayCount: number;
            spanAlongRow: [number, number];
        }[];
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        representativeGridId?: string | undefined;
    };
    manifest: {
        exportPackageId: string;
        sceneId: string;
        createdAt: string;
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
        sky: {
            timezone: string;
            latitude: number;
            longitude: number;
            timestamp: string;
            dni: number;
            dhi: number;
            ghi?: number | undefined;
            albedo?: number | undefined;
        };
        simulationOptions: {
            conversionStrategy?: "obj2rad" | "obj2mesh" | undefined;
            outputMode?: "packageOnly" | "packageAndSimulate" | undefined;
            ambientBounces?: number | undefined;
            ambientDivisions?: number | undefined;
            ambientResolution?: number | undefined;
            ambientAccuracy?: number | undefined;
            limitWeight?: number | undefined;
            irradianceBinary?: string | undefined;
            binaries?: {
                obj2rad?: string | undefined;
                obj2mesh?: string | undefined;
                gendaylit?: string | undefined;
                oconv?: string | undefined;
                rtrace?: string | undefined;
            } | undefined;
        };
        sensors: {
            mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
            tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
            gridMetadataPath: string;
            pointFiles: string[];
            totalGridCount: number;
            totalSensorCount: number;
        };
        geometry: {
            hash: string;
            combinedGeometryPath: string;
            files: string[];
            metadataPath: string;
        };
        materials: {
            jsonPath: string;
            radPath: string;
        };
        skyFiles: {
            jsonPath: string;
            shellScriptPath: string;
            plannedRadPath: string;
        };
        radiancePlan: {
            shellScriptPath: string;
            planPath: string;
            commands: {
                id: string;
                program: string;
                args: string[];
                cwdRelative: string;
                stdoutRelativePath?: string | undefined;
                stdinRelativePath?: string | undefined;
            }[];
        };
        results: {
            directory: string;
            parsedResultPath?: string | undefined;
        };
        provenance: {
            notes: string[];
            exporterVersion: string;
            geometryHash: string;
            backendVersion: string;
            materialConfigHash: string;
        };
        packageLabel?: string | undefined;
    };
    packageRoot: string;
    simulationId: string;
    importedResults: {
        exportPackageId: string;
        grids: {
            arrayId: string;
            bounds: {
                center: {
                    x: number;
                    y: number;
                    z: number;
                };
                lengthRow: number;
                lengthCross: number;
                height: number;
            };
            rowIds: [string, string];
            gridId: string;
            rowPairId: string;
            dimensions: [number, number, number];
            classifications: ("interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom")[];
            worldBounds: {
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
            centroid: {
                x: number;
                y: number;
                z: number;
            };
            sensors: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                id: string;
                gridId: string;
                localPosition: {
                    x: number;
                    y: number;
                    z: number;
                };
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                arrayId?: string | undefined;
                bayId?: string | undefined;
                rowPairId?: string | undefined;
            }[];
            irradianceResults: {
                position: {
                    x: number;
                    y: number;
                    z: number;
                };
                gridId: string;
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                indices: [number, number, number];
                normalized: [number, number, number];
                sensorId: string;
                Ee: number;
            }[];
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            slices: {
                row: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                cross: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
                up: {
                    min: number;
                    max: number;
                    mean: number;
                    axis: "row" | "cross" | "up";
                    index: number;
                }[];
            };
            bayId?: string | undefined;
        }[];
        mode: "centerArrayGrid" | "centralRowGrid" | "fullArrayGrid";
        tilingStrategy: "rowPairBayTiling" | "rowPairSingleVolume" | "uniformArrayGrid";
        provenance: {
            sourceFiles: string[];
            importedAt: string;
            parserNotes: string[];
        };
        simulationId: string;
        arrayStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        };
        classificationStats: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            classification: "interior" | "edge_north" | "edge_south" | "edge_east" | "edge_west" | "corner" | "end_of_row" | "custom";
            gridIds: string[];
            sensorCount: number;
        }[];
        edgeStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
        interiorStats?: {
            stats: {
                min: number;
                max: number;
                mean: number;
                median: number;
                p05: number;
                p95: number;
            };
            sensorCount: number;
            gridCount: number;
            edgeInteriorDifference?: number | undefined;
            edgeInteriorRatio?: number | undefined;
        } | undefined;
    };
    commandLog: {
        id: string;
        command: string;
        cwd: string;
        startedAt: string;
        endedAt: string;
        durationMs: number;
        exitCode: number;
        stdoutPath?: string | undefined;
        stderrPath?: string | undefined;
    }[];
}>;
