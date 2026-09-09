import { ensureStableSimulationId, getSimulationMetadata, } from "./tagging.js";
function matchesScope(metadata, stableId, scope) {
    switch (scope.mode) {
        case "taggedScene":
            return true;
        case "selectedObjects":
            return Boolean(scope.objectIds?.includes(stableId));
        case "selectedRows":
            return Boolean(metadata.rowId && scope.rowIds?.includes(metadata.rowId));
        case "selectedArrays":
            return Boolean(metadata.arrayId && scope.arrayIds?.includes(metadata.arrayId));
        case "selectedGroups":
            return Boolean(metadata.exportGroupId && scope.exportGroupIds?.includes(metadata.exportGroupId));
        default:
            return false;
    }
}
export function collectSelectedSimulationObjects(root, scope = { mode: "taggedScene" }) {
    const selected = [];
    root.traverse((node) => {
        const metadata = getSimulationMetadata(node);
        if (!metadata?.includeInSimulation) {
            return;
        }
        const stableId = ensureStableSimulationId(node);
        if (!matchesScope(metadata, stableId, scope)) {
            return;
        }
        selected.push({ object: node, stableId, metadata });
    });
    return selected;
}
export function buildSelectionScopeFromObjects(objects) {
    return {
        mode: "selectedObjects",
        objectIds: objects.map((object) => ensureStableSimulationId(object)),
    };
}
