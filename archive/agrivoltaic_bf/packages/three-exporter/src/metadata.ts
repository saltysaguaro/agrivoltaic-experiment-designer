import {
  boundsFromPoints,
  boundsSize,
  componentWiseMax,
  componentWiseMin,
  type Bounds3,
  type ExportSelectionScope,
  type SceneExportManifest,
  type SceneObjectRecord,
  type Vec3,
} from "@agrivoltaic/shared";
import type { Box3, Object3D, Vector3 } from "three";
import { Box3 as ThreeBox3, Euler, Vector3 as ThreeVector3 } from "three";
import { collectSelectedSimulationObjects } from "./selection.js";
import {
  ensureStableSimulationId,
  getStableSimulationId,
  resolveSimulationMesh,
} from "./tagging.js";

function vectorToRecord(input: Vector3): Vec3 {
  return { x: input.x, y: input.y, z: input.z };
}

function boxToBounds(box: Box3): Bounds3 {
  return {
    min: vectorToRecord(box.min),
    max: vectorToRecord(box.max),
  };
}

function emptyBounds(): Bounds3 {
  return {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  };
}

export function computeObjectBounds(object: Object3D): Bounds3 {
  const box = new ThreeBox3().setFromObject(object);
  return box.isEmpty() ? emptyBounds() : boxToBounds(box);
}

export function collectSimulationObjects(
  root: Object3D,
  scope: ExportSelectionScope = { mode: "taggedScene" },
): SceneObjectRecord[] {
  root.updateWorldMatrix(true, true);
  const selected = collectSelectedSimulationObjects(root, scope);
  const selectedIds = new Set(selected.map((entry) => entry.stableId));

  return selected.map(({ object, stableId, metadata }) => {
    const sourceBounds = computeObjectBounds(object);
    const simulationObject = resolveSimulationMesh(object);
    const simulationBounds = simulationObject === object ? undefined : computeObjectBounds(simulationObject);
    const rotation = new Euler().setFromRotationMatrix(object.matrixWorld);

    return {
      id: stableId,
      stableId,
      sourceUuid: object.uuid,
      name: object.name || stableId,
      parentId: getStableSimulationId(object.parent ?? object) !== stableId
        ? getStableSimulationId(object.parent!)
        : undefined,
      parentStableId: getStableSimulationId(object.parent ?? object) !== stableId
        ? getStableSimulationId(object.parent!)
        : undefined,
      childrenStableIds: object.children
        .map((child) => ensureStableSimulationId(child))
        .filter((childId) => selectedIds.has(childId)),
      transform: {
        position: vectorToRecord(object.getWorldPosition(new ThreeVector3())),
        rotationEuler: { x: rotation.x, y: rotation.y, z: rotation.z },
        scale: vectorToRecord(object.getWorldScale(new ThreeVector3())),
        matrixWorld: [...object.matrixWorld.elements],
      },
      bounds: sourceBounds,
      simulationBounds,
      radianceMaterial: metadata.radianceMaterial,
      simulationRole: metadata.simulationRole,
      metadata,
    };
  });
}

export function aggregateBounds(records: SceneObjectRecord[]): Bounds3 {
  if (records.length === 0) {
    return emptyBounds();
  }

  return {
    min: componentWiseMin(records.flatMap((record) => [record.bounds.min, record.bounds.max])),
    max: componentWiseMax(records.flatMap((record) => [record.bounds.min, record.bounds.max])),
  };
}

export function buildSceneManifest(input: {
  sceneId: string;
  selection: ExportSelectionScope;
  geometrySourceMode: "visualMesh" | "simulationMesh";
  combinedGeometryPath: string;
  geometryHash: string;
  objects: SceneObjectRecord[];
  assets: SceneExportManifest["assets"];
  exporterVersion: string;
}): SceneExportManifest {
  return {
    sceneId: input.sceneId,
    createdAt: new Date().toISOString(),
    source: "three.js",
    exporterVersion: input.exporterVersion,
    geometryFormat: "obj",
    selection: input.selection,
    geometrySourceMode: input.geometrySourceMode,
    combinedGeometryPath: input.combinedGeometryPath,
    geometryHash: input.geometryHash,
    objects: input.objects,
    assets: input.assets,
  };
}

export function inferRepresentativeModuleSpan(objects: SceneObjectRecord[]): number {
  const moduleObjects = objects.filter((object) => object.simulationRole === "pv_module");
  if (moduleObjects.length === 0) {
    return 0;
  }

  const spans = moduleObjects.map((object) => {
    const size = boundsSize(object.bounds);
    return Math.max(size.x, size.y);
  }).sort((a, b) => a - b);

  return spans[Math.floor(spans.length / 2)] ?? spans[0] ?? 0;
}
