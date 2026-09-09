import type {
  ExportSelectionScope,
  SimulationMetadata,
} from "@agrivoltaic/shared";
import type { Object3D } from "three";
import {
  ensureStableSimulationId,
  getSimulationMetadata,
} from "./tagging.js";

export interface SelectedSceneObject {
  object: Object3D;
  stableId: string;
  metadata: SimulationMetadata;
}

function matchesScope(metadata: SimulationMetadata, stableId: string, scope: ExportSelectionScope): boolean {
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

export function collectSelectedSimulationObjects(
  root: Object3D,
  scope: ExportSelectionScope = { mode: "taggedScene" },
): SelectedSceneObject[] {
  const selected: SelectedSceneObject[] = [];

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

export function buildSelectionScopeFromObjects(objects: Object3D[]): ExportSelectionScope {
  return {
    mode: "selectedObjects",
    objectIds: objects.map((object) => ensureStableSimulationId(object)),
  };
}
