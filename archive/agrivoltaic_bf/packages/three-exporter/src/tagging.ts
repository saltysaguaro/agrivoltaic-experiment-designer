import {
  simulationMetadataSchema,
  type SimulationMetadata,
} from "@agrivoltaic/shared";
import type { Object3D } from "three";

export const SIMULATION_METADATA_KEY = "simulationMetadata";
export const SIMPLIFIED_MESH_KEY = "simulationLODMeshes";
export const STABLE_ID_KEY = "simulationStableId";

const DEFAULT_METADATA: SimulationMetadata = {
  includeInSimulation: true,
  simulationRole: "ignore",
  radianceMaterial: "unassigned",
  castShadow: true,
  receiveShadowForAnalysis: true,
  tags: [],
};

function sanitizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "object";
}

export function ensureStableSimulationId(object: Object3D): string {
  const existing = object.userData[STABLE_ID_KEY];
  if (typeof existing === "string" && existing.length > 0) {
    return existing;
  }

  const base = sanitizeToken(object.name || "object");
  const fallback = object.uuid.slice(0, 8).toLowerCase();
  const stableId = `${base}-${fallback}`;
  object.userData[STABLE_ID_KEY] = stableId;
  return stableId;
}

export function getStableSimulationId(object: Object3D): string | undefined {
  const stableId = object.userData[STABLE_ID_KEY];
  return typeof stableId === "string" && stableId.length > 0 ? stableId : undefined;
}

export function attachSimulationMetadata(
  object: Object3D,
  metadata: Partial<SimulationMetadata>,
): SimulationMetadata {
  const existing = getSimulationMetadata(object) ?? DEFAULT_METADATA;
  const resolved = simulationMetadataSchema.parse({
    ...existing,
    ...metadata,
  });

  ensureStableSimulationId(object);
  object.userData[SIMULATION_METADATA_KEY] = resolved;
  return resolved;
}

export function getSimulationMetadata(object: Object3D): SimulationMetadata | undefined {
  const value = object.userData[SIMULATION_METADATA_KEY];
  if (!value) {
    return undefined;
  }

  return simulationMetadataSchema.parse(value);
}

export function attachSimulationLOD(object: Object3D, lodId: string, simulationMesh: Object3D): void {
  const map = object.userData[SIMPLIFIED_MESH_KEY] ?? {};
  map[lodId] = simulationMesh;
  object.userData[SIMPLIFIED_MESH_KEY] = map;
}

export function resolveSimulationMesh(object: Object3D): Object3D {
  const metadata = getSimulationMetadata(object);
  const lodId = metadata?.simulationLOD;
  if (!lodId) {
    return object;
  }

  const map = object.userData[SIMPLIFIED_MESH_KEY] as Record<string, Object3D> | undefined;
  return map?.[lodId] ?? object;
}
