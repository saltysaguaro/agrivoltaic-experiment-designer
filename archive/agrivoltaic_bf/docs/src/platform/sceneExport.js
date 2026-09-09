import * as THREE from "three";
import { resolveAnnualSimulationQualityPreset } from "@agrivoltaic/shared";
import {
  attachSimulationMetadata,
  buildFullArrayGridConfig,
  buildSceneExportBundle,
  ensureStableSimulationId,
  getSimulationMetadata,
} from "@agrivoltaic/three-exporter/browser";
import { getSystemRotationDeg } from "../utils/orientation.js";

const PERGOLA_FRAME_BEAM_HEIGHT_M = 0.18;
const PERGOLA_ROW_RACK_CLEARANCE_M = 0.08;
const PERGOLA_RAIL_HEIGHT_M = 0.055;
const PERGOLA_MODULE_CLAMP_GAP_M = 0.02;

function sceneIdFromProject(projectName) {
  return (projectName || "agrivoltaic-study")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "agrivoltaic-study";
}

function normalizeAnnualSimulationSite(site) {
  if (!site || typeof site !== "object") {
    return site;
  }

  const address = String(site.address ?? site.fullAddress ?? site.label ?? "").trim();
  return {
    ...site,
    address: address || String(site.label ?? ""),
    source: site.source || "stored",
  };
}

function nearestAnchor(position, layout) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const anchor of layout.anchors || []) {
    const distance = Math.hypot(position.x - anchor.x, position.z - anchor.z);
    if (distance < bestDistance) {
      best = anchor;
      bestDistance = distance;
    }
  }
  return best;
}

function moduleLocationFor(object, layout) {
  if (!layout?.anchors?.length) return {};
  const worldPosition = object.getWorldPosition(new THREE.Vector3());
  const anchor = nearestAnchor(worldPosition, layout);
  if (!anchor) return {};
  return {
    arrayId: anchor.arrayId || "array-01",
    rowId: anchor.rowId || `row-${String(anchor.row + 1).padStart(2, "0")}`,
    bayId: `bay-${String(anchor.col + 1).padStart(2, "0")}`,
    exportGroupId: anchor.rowId || `row-${String(anchor.row + 1).padStart(2, "0")}`,
  };
}

function metadataForKind(kind, object, layout) {
  const base = {
    includeInSimulation: true,
    castShadow: object.castShadow !== false,
    receiveShadowForAnalysis: object.receiveShadow !== false,
    arrayId: "array-01",
    tags: [],
  };

  if (kind === "module_glass") {
    return {
      ...base,
      simulationRole: "pv_module",
      radianceMaterial: "pv_glass",
      ...moduleLocationFor(object, layout),
    };
  }

  if (kind === "module_frame") {
    return {
      ...base,
      simulationRole: "racking",
      radianceMaterial: "pv_frame_metal",
      ...moduleLocationFor(object, layout),
    };
  }

  if (kind === "post") {
    return {
      ...base,
      simulationRole: "post",
      radianceMaterial: "steel_post",
    };
  }

  if (kind === "beam" || kind === "torque_tube" || kind === "beam_rotating") {
    return {
      ...base,
      simulationRole: "racking",
      radianceMaterial: "galvanized_racking",
      ...moduleLocationFor(object, layout),
    };
  }

  if (kind === "inner_terrain") {
    return {
      ...base,
      simulationRole: "terrain",
      radianceMaterial: "grass",
      castShadow: false,
    };
  }

  if (kind === "outer_terrain") {
    return {
      ...base,
      simulationRole: "terrain",
      radianceMaterial: "soil_dry",
      castShadow: false,
    };
  }

  if (kind === "crop_bed") {
    return {
      ...base,
      includeInSimulation: false,
      simulationRole: "ignore",
      radianceMaterial: "unassigned",
      castShadow: false,
      receiveShadowForAnalysis: false,
    };
  }

  if (kind === "north_marker" || kind === "ignore") {
    return {
      ...base,
      includeInSimulation: false,
      simulationRole: "ignore",
      radianceMaterial: "unassigned",
      castShadow: false,
      receiveShadowForAnalysis: false,
    };
  }

  return null;
}

export function tagSceneForAnnualSimulation(sceneApp) {
  const { scene, sceneSummary } = sceneApp.getSimulationContext();
  const layout = sceneSummary?.layout;

  scene.traverse((object) => {
    if (!object.isMesh || object.isInstancedMesh) return;
    const kind = object.userData.simulationKind;
    const metadata = metadataForKind(kind, object, layout);
    if (!metadata) return;
    attachSimulationMetadata(object, metadata);
  });
}

function toRadiancePosition(vector) {
  return {
    x: vector.x,
    y: -vector.z,
    z: vector.y,
  };
}

function toRadianceDirection(vector) {
  const normalized = vector.clone().normalize();
  return {
    x: normalized.x,
    y: -normalized.z,
    z: normalized.y,
  };
}

function groupAnchorsByRow(anchors = []) {
  const map = new Map();
  for (const anchor of anchors) {
    if (!map.has(anchor.rowId)) {
      map.set(anchor.rowId, []);
    }
    map.get(anchor.rowId).push(anchor);
  }
  return map;
}

function buildMotionObjects(systemRoot, rotatingKinds) {
  const rows = new Map();

  systemRoot.updateWorldMatrix(true, true);
  systemRoot.traverse((object) => {
    if (!object.isMesh) return;
    const kind = object.userData.simulationKind;
    if (!rotatingKinds.has(kind)) return;
    const metadata = getSimulationMetadata(object);
    if (!metadata?.rowId) return;
    const stableId = ensureStableSimulationId(object);
    const entry = rows.get(metadata.rowId) ?? [];
    entry.push(stableId);
    rows.set(metadata.rowId, entry);
  });

  return rows;
}

function buildTrackerMotionModel({ state, systemRoot, layout }) {
  const rotatingObjectsByRow = buildMotionObjects(systemRoot, new Set([
    "module_glass",
    "module_frame",
    "beam",
    "torque_tube",
  ]));
  if (!rotatingObjectsByRow.size) {
    return { strategy: "static", rows: [] };
  }

  const anchorGroups = groupAnchorsByRow(layout?.anchors);
  const projectedWidth = layout.tableSpec.stackSpan * Math.cos(THREE.MathUtils.degToRad(state.trackerAngleDeg));
  const rows = [];

  for (const [rowId, objectIds] of rotatingObjectsByRow.entries()) {
    const anchors = anchorGroups.get(rowId) || [];
    const anchor = anchors[0];
    if (!anchor) continue;

    const localPivot = new THREE.Vector3(
      anchor.x - (projectedWidth / 2),
      state.heightM,
      anchor.z,
    );
    const worldPivot = systemRoot.localToWorld(localPivot.clone());
    const worldAxis = new THREE.Vector3(0, 0, 1).transformDirection(systemRoot.matrixWorld);

    rows.push({
      rowId,
      pivotOrigin: toRadiancePosition(worldPivot),
      axisDirection: toRadianceDirection(worldAxis),
      baselineAngleDeg: state.trackerAngleDeg,
      rotatingObjectIds: [...new Set(objectIds)].sort(),
    });
  }

  return {
    strategy: rows.length ? "row_axis_rotation" : "static",
    rows,
  };
}

function buildPergolaTrackingMotionModel({ state, systemRoot, layout }) {
  const rotatingObjectsByRow = buildMotionObjects(systemRoot, new Set([
    "module_glass",
    "module_frame",
    "beam_rotating",
  ]));
  if (!rotatingObjectsByRow.size) {
    return { strategy: "static", rows: [] };
  }

  const anchorGroups = groupAnchorsByRow(layout?.anchors);
  const modulePlaneY = state.heightM
    + PERGOLA_FRAME_BEAM_HEIGHT_M
    + PERGOLA_ROW_RACK_CLEARANCE_M
    + (PERGOLA_RAIL_HEIGHT_M / 2)
    + PERGOLA_MODULE_CLAMP_GAP_M
    + (layout.tableSpec.moduleThickness / 2);
  const rows = [];

  for (const [rowId, objectIds] of rotatingObjectsByRow.entries()) {
    const anchors = anchorGroups.get(rowId) || [];
    const anchor = anchors[0];
    if (!anchor) continue;

    const localPivot = new THREE.Vector3(0, modulePlaneY, anchor.z);
    const worldPivot = systemRoot.localToWorld(localPivot.clone());
    const worldAxis = new THREE.Vector3(1, 0, 0).transformDirection(systemRoot.matrixWorld);

    rows.push({
      rowId,
      pivotOrigin: toRadiancePosition(worldPivot),
      axisDirection: toRadianceDirection(worldAxis),
      baselineAngleDeg: state.trackerAngleDeg,
      rotatingObjectIds: [...new Set(objectIds)].sort(),
    });
  }

  return {
    strategy: rows.length ? "row_axis_rotation" : "static",
    rows,
  };
}

function buildAnnualMotionModel({ state, sceneApp }) {
  const { systemRoot, sceneSummary } = sceneApp.getSimulationContext();
  const layout = sceneSummary?.layout;
  if (!layout) {
    return { strategy: "static", rows: [] };
  }

  const rotationDeg = getSystemRotationDeg(state);
  if (Math.abs(systemRoot.rotation.y - THREE.MathUtils.degToRad(rotationDeg)) > 1e-6) {
    systemRoot.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
    systemRoot.updateWorldMatrix(true, true);
  }

  if (state.systemType === "sat") {
    return buildTrackerMotionModel({ state, systemRoot, layout });
  }

  if (state.systemType === "raised" && state.pergolaTracking) {
    return buildPergolaTrackingMotionModel({ state, systemRoot, layout });
  }

  return { strategy: "static", rows: [] };
}

function buildRadianceExportRoot(scene) {
  const root = new THREE.Group();
  root.name = "radiance-export-root";
  scene.children.forEach((child) => {
    root.add(child.clone(true));
  });

  // Convert three.js Y-up geometry into the Radiance/Z-up conventions used by the backend.
  root.rotation.x = Math.PI / 2;
  root.updateWorldMatrix(true, true);
  return root;
}

export function buildAnnualSimulationPayload({
  projectName,
  projectRoot,
  site,
  sceneApp,
  designState,
  serializedConfig,
  sensorConfig,
  selectedSensorIds,
  simulationQualityPreset,
}) {
  tagSceneForAnnualSimulation(sceneApp);
  const motionModel = buildAnnualMotionModel({
    state: designState,
    sceneApp,
  });
  const sceneExport = buildSceneExportBundle(buildRadianceExportRoot(sceneApp.getScene()), {
    sceneId: sceneIdFromProject(projectName),
    selection: { mode: "taggedScene" },
    geometrySourceMode: "simulationMesh",
  });

  return {
    projectName,
    site: normalizeAnnualSimulationSite(site),
    designState,
    serializedConfig,
    workingDirectory: projectRoot || undefined,
    sceneExport,
    motionModel,
    enginePreference: "bifacial_radiance",
    sensorConfig,
    selectedSensorIds,
    simulationQualityPreset: resolveAnnualSimulationQualityPreset(simulationQualityPreset),
  };
}

export function buildSelectableSensorConfig(overrides = {}) {
  return buildFullArrayGridConfig({
    dimensions: [10, 10, 3],
    fullArrayTilingStrategy: "uniformArrayGrid",
    verticalExtentMode: "groundToArrayTop",
    ...overrides,
  });
}
