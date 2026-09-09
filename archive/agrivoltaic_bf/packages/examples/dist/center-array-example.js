import { buildCenterArrayGridConfig, buildExportPackageRequest, buildSceneExportBundle, } from "@agrivoltaic/three-exporter";
import { buildTaggedFixedTiltScene } from "./minimal-fixed-tilt.js";
export function buildCenterArrayExampleRequest() {
    const scene = buildTaggedFixedTiltScene();
    const sceneExport = buildSceneExportBundle(scene, {
        sceneId: "center-array-example",
        geometrySourceMode: "visualMesh",
    });
    return buildExportPackageRequest({
        sceneExport,
        sensorConfig: buildCenterArrayGridConfig({
            selectedArrayId: "array-a",
            dimensions: [25, 25, 5],
            fullArrayTilingStrategy: "rowPairSingleVolume",
        }),
        sky: {
            latitude: 35.0844,
            longitude: -106.6504,
            timezone: "America/Denver",
            timestamp: "2026-06-21T19:00:00.000Z",
            dni: 850,
            dhi: 120,
            albedo: 0.2,
        },
        packageLabel: "center-array-example",
    });
}
