function meshWrapperContents(meshRelativePath) {
    return [
        "void mesh scene_mesh",
        `1 ${meshRelativePath}`,
        "0",
        "0",
        "",
    ].join("\n");
}
export function buildGeometryConversionPlan(manifest, options) {
    if (options.conversionStrategy === "obj2mesh") {
        const meshRelativePath = "radiance/geometry/scene.rtm";
        const wrapperRelativePath = "radiance/geometry/scene.rad";
        return {
            geometryRadFiles: [wrapperRelativePath],
            generatedFiles: [{
                    relativePath: wrapperRelativePath,
                    contents: meshWrapperContents("geometry/scene.rtm"),
                    sha256: "",
                    contentType: "text/plain",
                }],
            commands: [{
                    id: "geometry-obj2mesh",
                    program: options.binaries?.obj2mesh ?? "obj2mesh",
                    args: [
                        "-a",
                        "../materials/materials.rad",
                        "../geometry/scene.obj",
                        "geometry/scene.rtm",
                    ],
                    cwdRelative: "radiance",
                }],
        };
    }
    const commands = manifest.assets.map((asset) => ({
        id: `geometry-${asset.stableId}`,
        program: options.binaries?.obj2rad ?? "obj2rad",
        args: [
            `../${asset.objRelativePath}`,
        ],
        cwdRelative: "radiance",
        stdoutRelativePath: `radiance/geometry/${asset.stableId}.rad`,
    }));
    return {
        geometryRadFiles: manifest.assets.map((asset) => `radiance/geometry/${asset.stableId}.rad`),
        generatedFiles: [],
        commands,
    };
}
