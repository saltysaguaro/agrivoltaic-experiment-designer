import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
// @ts-ignore JS app module used directly in tests.
import { createStateStore, sanitizeState } from "../src/app/state.js";
// @ts-ignore JS app module used directly in tests.
import { DEFAULTS, SYSTEM_PRESETS } from "../src/utils/constants.js";
// @ts-ignore JS app module used directly in tests.
import { computeArrayLayout } from "../src/utils/layout.js";
// @ts-ignore JS app module used directly in tests.
import { buildSystemAssembly, getArchetype } from "../src/systems/systemFactory.js";
// @ts-ignore JS app module used directly in tests.
import { getSystemRotationDeg } from "../src/utils/orientation.js";

function testMaterials() {
  const material = new THREE.MeshStandardMaterial();
  return {
    panel: material,
    frame: material,
    steel: material,
    torqueTube: material,
    bufferPrimary: new THREE.LineBasicMaterial(),
    bufferSecondary: new THREE.LineBasicMaterial(),
  };
}

function buildWorldAssembly(stateInput: Record<string, unknown>) {
  const state = sanitizeState(stateInput);
  const assembly = buildSystemAssembly(state, testMaterials());
  const root = new THREE.Group();
  root.add(assembly.group);
  root.rotation.y = THREE.MathUtils.degToRad(getSystemRotationDeg(state));
  root.updateMatrixWorld(true);
  return { state, layout: assembly.layout, root };
}

function firstModuleNormal(root: THREE.Object3D) {
  let glass: THREE.Object3D | null = null;
  root.traverse((object: THREE.Object3D) => {
    if (!glass && object.name === "pv-module-glass") {
      glass = object;
    }
  });

  assert.ok(glass);
  const moduleGlass = glass as THREE.Mesh;
  moduleGlass.geometry.computeBoundingBox();
  const bounds = moduleGlass.geometry.boundingBox!;
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const quaternion = moduleGlass.getWorldQuaternion(new THREE.Quaternion());
  const localFaceNormal = size.z < size.y
    ? new THREE.Vector3(0, 0, 1)
    : new THREE.Vector3(0, 1, 0);
  return localFaceNormal.applyQuaternion(quaternion).normalize();
}

function rowDirection(root: THREE.Object3D, layout: { anchors: Array<{ row: number; col: number; x: number; z: number }> }) {
  const firstRow = layout.anchors[0]?.row;
  const rowAnchors = layout.anchors
    .filter((anchor: { row: number }) => anchor.row === firstRow)
    .sort((left: { col: number }, right: { col: number }) => left.col - right.col);

  assert.ok(rowAnchors.length >= 2);

  const start = new THREE.Vector3(rowAnchors[0].x, 0, rowAnchors[0].z).applyMatrix4(root.matrixWorld);
  const end = new THREE.Vector3(rowAnchors[1].x, 0, rowAnchors[1].z).applyMatrix4(root.matrixWorld);
  return end.sub(start).normalize();
}

test("designer defaults to a 55 kW DC system", () => {
  const store = createStateStore();
  const state = store.getState();

  assert.equal(DEFAULTS.dcSizeKw, 55);
  assert.equal(state.dcSizeKw, 55);
  assert.equal(SYSTEM_PRESETS.fixed.dcSizeKw, 55);
  assert.equal(SYSTEM_PRESETS.sat.dcSizeKw, 55);
  assert.equal(SYSTEM_PRESETS.raised.dcSizeKw, 55);
  assert.equal(SYSTEM_PRESETS.vertical.dcSizeKw, 55);
});

test("pergola tracking toggles convert azimuth between surface and row-axis conventions", () => {
  const store = createStateStore({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
    systemAzimuthDeg: 210,
    pergolaTracking: false,
  });

  store.setState({ pergolaTracking: true });
  assert.equal(store.getState().systemAzimuthDeg, 120);

  store.setState({ pergolaTracking: false });
  assert.equal(store.getState().systemAzimuthDeg, 210);
});

test("switching away from pergola restores non-pergola row defaults", () => {
  const store = createStateStore({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
  });

  store.setState({ systemType: "fixed" });
  assert.equal(store.getState().rowCountHint, 0);
  assert.equal(store.getState().maxTablesPerRow, 25);

  store.setState({ systemType: "vertical" });
  assert.equal(store.getState().rowCountHint, 0);
  assert.equal(store.getState().maxTablesPerRow, 25);
});

test("pergola crop rows stay within the canopy footprint and use one planting line per row", () => {
  const state = sanitizeState({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
    rowSpacing: 9.144,
    cropRowBuffer: 0.3048,
  });
  const layout = computeArrayLayout(state, getArchetype("raised"));

  assert.ok(layout.cropRows.length > 0);
  assert.equal(layout.cropRows.length, layout.rowCount);
  assert.equal(
    Number(layout.cropRows[0]!.width.toFixed(6)),
    Number((layout.crossAxisFootprint - (state.cropRowBuffer * 2)).toFixed(6)),
  );
  assert.equal(layout.cropRows[0]!.bedCountOverride, 1);
});

test("pergola crop rows align directly beneath the canopy rows", () => {
  const state = sanitizeState({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
    rowSpacing: 9.144,
    pergolaRackGap: 1.5,
    cropRowBuffer: 0.3048,
  });
  const layout = computeArrayLayout(state, getArchetype("raised"));
  const rowCenters = Array.from(
    new Set<number>(layout.anchors.map((anchor: { z: number }) => Number(anchor.z.toFixed(6)))),
  ).sort((a: number, b: number) => a - b);
  const cropCenters = layout.cropRows.map((cropRow: { centerZ: number }) => Number(cropRow.centerZ.toFixed(6)));

  assert.equal(SYSTEM_PRESETS.raised.pergolaCheckerboard, true);
  assert.ok(rowCenters.length > 1);
  assert.deepEqual(cropCenters, rowCenters);
  assert.ok(layout.arrayD < state.rowSpacing * layout.rowCount);
});

test("public pergola preset lays out the 55 kW canopy as 10 rows of 10 modules", () => {
  const state = sanitizeState({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
    dcSizeKw: 55,
    moduleW: 550,
    forceModuleCount: false,
  });
  const layout = computeArrayLayout(state, getArchetype("raised"));
  const visibleModulesPerRow = Array.from({ length: layout.rowCount }, (_, rowIndex) => {
    return layout.anchors.filter((anchor: { row: number; col: number }) => {
      return anchor.row === rowIndex && ((anchor.col + rowIndex) % 2 === 0);
    }).length;
  });

  assert.equal(layout.moduleCount, 100);
  assert.equal(layout.cropRows.length, 10);
  assert.equal(layout.canopyPositionCount, 200);
  assert.equal(layout.rowCount, 10);
  assert.equal(layout.tablesPerRow, 20);
  assert.equal(SYSTEM_PRESETS.raised.rowCountHint, 10);
  assert.equal(SYSTEM_PRESETS.raised.maxTablesPerRow, 20);
  assert.deepEqual(visibleModulesPerRow, [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
});

test("default vertical preset keeps the row-axis-aligned footprint consistent", () => {
  const state = sanitizeState({
    ...SYSTEM_PRESETS.vertical,
    systemType: "vertical",
  });
  const layout = computeArrayLayout(state, getArchetype("vertical"));

  assert.equal(layout.rowCount, 4);
  assert.equal(layout.tablesPerRow, 25);
  assert.equal(getSystemRotationDeg(state), -90);
  assert.ok(layout.arrayW > layout.arrayD);
  assert.ok(layout.cropRows.every((row: { orientation: string }) => row.orientation === "x"));
});

test("vertical bifacial keeps the same footprint orientation when tables per row are reduced", () => {
  const state = sanitizeState({
    ...SYSTEM_PRESETS.vertical,
    systemType: "vertical",
    maxTablesPerRow: 10,
  });
  const layout = computeArrayLayout(state, getArchetype("vertical"));

  assert.equal(getSystemRotationDeg(state), -90);
  assert.equal(layout.tablesPerRow, 10);
  assert.ok(layout.arrayD > layout.arrayW);
  assert.ok(layout.cropRows.every((row: { orientation: string }) => row.orientation === "x"));
});

test("default fixed tilt geometry faces south in world space", () => {
  const { root, state } = buildWorldAssembly({
    ...SYSTEM_PRESETS.fixed,
    systemType: "fixed",
  });
  const normal = firstModuleNormal(root);

  assert.equal(getSystemRotationDeg(state), 0);
  assert.ok(normal.y > 0.85);
  assert.ok(normal.z < -0.3);
  assert.ok(Math.abs(normal.x) < 0.05);
});

test("default pergola geometry faces south in world space", () => {
  const { root, state } = buildWorldAssembly({
    ...SYSTEM_PRESETS.raised,
    systemType: "raised",
    pergolaTracking: false,
  });
  const normal = firstModuleNormal(root);

  assert.equal(getSystemRotationDeg(state), 0);
  assert.ok(normal.y > 0.8);
  assert.ok(normal.z < -0.35);
  assert.ok(Math.abs(normal.x) < 0.05);
});

test("default tracker rows run north-south in world space", () => {
  const { layout, root } = buildWorldAssembly({
    ...SYSTEM_PRESETS.sat,
    systemType: "sat",
  });
  const direction = rowDirection(root, layout);

  assert.ok(Math.abs(direction.z) > 0.95);
  assert.ok(Math.abs(direction.x) < 0.05);
});

test("default vertical bifacial rows run north-south in world space", () => {
  const { layout, root } = buildWorldAssembly({
    ...SYSTEM_PRESETS.vertical,
    systemType: "vertical",
  });
  const direction = rowDirection(root, layout);

  assert.ok(Math.abs(direction.z) > 0.95);
  assert.ok(Math.abs(direction.x) < 0.05);
});
