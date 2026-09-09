export function validateManifestMaterials(manifest, materialLibrary) {
    const known = new Set(materialLibrary.map((material) => material.name));
    const missing = new Set();
    for (const object of manifest.objects) {
        if (object.metadata.includeInSimulation && !known.has(object.radianceMaterial)) {
            missing.add(object.radianceMaterial);
        }
    }
    return [...missing].sort();
}
export function toRadianceMaterial(material) {
    const [r, g, b] = material.rgb;
    switch (material.modifier) {
        case "plastic":
            return [
                `void plastic ${material.name}`,
                "0",
                "0",
                `5 ${r} ${g} ${b} ${material.specularity ?? 0} ${material.roughness ?? 0}`,
            ].join("\n");
        case "metal":
            return [
                `void metal ${material.name}`,
                "0",
                "0",
                `5 ${r} ${g} ${b} ${material.specularity ?? 0.9} ${material.roughness ?? 0.05}`,
            ].join("\n");
        case "glass":
            return [
                `void glass ${material.name}`,
                "0",
                "0",
                `3 ${r} ${g} ${b}`,
            ].join("\n");
        case "trans":
            return [
                `void trans ${material.name}`,
                "0",
                "0",
                `7 ${r} ${g} ${b} ${material.specularity ?? 0} ${material.roughness ?? 0.1} ${material.transmissivity ?? 0.2} ${material.transmittedSpecular ?? 0}`,
            ].join("\n");
        case "glow":
            return [
                `void glow ${material.name}`,
                "0",
                "0",
                `4 ${r} ${g} ${b} 0`,
            ].join("\n");
        default:
            throw new Error(`Unsupported Radiance modifier ${String(material.modifier)}`);
    }
}
export function buildMaterialFile(materials) {
    return materials.map((material) => {
        const definition = toRadianceMaterial(material);
        return material.comment
            ? `# ${material.comment}\n${definition}`
            : definition;
    }).join("\n\n");
}
