import * as THREE from "three";
import { degToRad } from "../../utils/math.js";
import { createModulePrototype } from "../components/module.js";
import { createPost } from "../components/supportPosts.js";
import { createBeamBetween, createBoxBeam } from "../components/simpleFrame.js";
import { getStackModuleCenters, getSupportLinePositions } from "../components/supportLines.js";

const FRAME_BEAM_HEIGHT_M = 0.18;
const FRAME_BEAM_DEPTH_M = 0.16;
const ROW_BEAM_HEIGHT_M = 0.1;
const ROW_BEAM_DEPTH_M = 0.1;
const RAIL_HEIGHT_M = 0.055;
const RAIL_DEPTH_M = 0.055;
const MODULE_CLAMP_GAP_M = 0.02;
const ROW_RACK_CLEARANCE_M = 0.08;
const FRAME_OVERHANG_X_M = 0.35;
const FRAME_OVERHANG_Z_M = 0.42;
const POST_RADIUS_M = 0.075;
const BRACKET_THICKNESS_M = 0.065;

function uniqueSortedAnchors(anchors, key) {
  return Array.from(
    new Map(anchors.map((anchor) => [anchor[key], anchor])).values()
  ).sort((a, b) => a[key] - b[key]);
}

function buildRowAnchorMap(anchors) {
  const rowMap = new Map();

  for (const anchor of anchors) {
    if (!rowMap.has(anchor.row)) rowMap.set(anchor.row, []);
    rowMap.get(anchor.row).push(anchor);
  }

  for (const rowAnchors of rowMap.values()) {
    rowAnchors.sort((a, b) => a.col - b.col);
  }

  return rowMap;
}

function bracketPositions(frameWidth) {
  const maxSpanPerBracket = 8;
  const supportCount = Math.max(2, Math.ceil(frameWidth / maxSpanPerBracket) + 1);
  const halfWidth = frameWidth / 2;
  return Array.from({ length: supportCount }, (_, index) => {
    const t = supportCount === 1 ? 0.5 : index / (supportCount - 1);
    return -halfWidth + (t * frameWidth);
  });
}

export const pergolaArchetype = {
  id: "raised",
  label: "Pergola / raised",
  rowAxis: "x",
  crossAxisAnchorMode: "center",
  buildAssembly({ state, layout, materials }) {
    const group = new THREE.Group();
    if (!layout.anchors.length) return group;

    const tiltRad = degToRad(state.tiltDeg);
    const rackAngleRad = state.pergolaTracking ? degToRad(state.trackerAngleDeg) : tiltRad;
    const moduleCenters = getStackModuleCenters(layout.tableSpec, { centered: true });
    const supportLines = getSupportLinePositions(layout.tableSpec, {
      centered: true,
      insetRatio: 0.23,
    });
    const rowAnchorMap = buildRowAnchorMap(layout.anchors);
    const rowAnchors = uniqueSortedAnchors(layout.anchors, "row");

    const frameWidth = layout.arrayW + (2 * FRAME_OVERHANG_X_M);
    const frameDepth = layout.arrayD + (2 * FRAME_OVERHANG_Z_M);
    const frameHalfWidth = frameWidth / 2;
    const frameHalfDepth = frameDepth / 2;
    const postHeight = state.heightM + (FRAME_BEAM_HEIGHT_M / 2);
    const frameBeamCenterY = state.heightM + (FRAME_BEAM_HEIGHT_M / 2);
    const frameTopY = state.heightM + FRAME_BEAM_HEIGHT_M;
    const rowBeamWidth = frameWidth - FRAME_BEAM_DEPTH_M;
    const modulePlaneY = frameTopY + ROW_RACK_CLEARANCE_M + (RAIL_HEIGHT_M / 2) + MODULE_CLAMP_GAP_M + (layout.tableSpec.moduleThickness / 2);
    const railCenterLocalY = -((layout.tableSpec.moduleThickness / 2) + MODULE_CLAMP_GAP_M + (RAIL_HEIGHT_M / 2));
    const bracketXs = bracketPositions(rowBeamWidth - 0.35);

    const moduleProto = createModulePrototype({
      alongRow: layout.tableSpec.tableLength,
      crossSpan: layout.tableSpec.moduleHeight,
      thickness: layout.tableSpec.moduleThickness,
      orientation: "ground-x",
    }, materials);

    const southFrameBeam = createBoxBeam(frameWidth, FRAME_BEAM_HEIGHT_M, FRAME_BEAM_DEPTH_M, materials.steel);
    southFrameBeam.position.set(0, frameBeamCenterY, -frameHalfDepth);
    group.add(southFrameBeam);

    const northFrameBeam = createBoxBeam(frameWidth, FRAME_BEAM_HEIGHT_M, FRAME_BEAM_DEPTH_M, materials.steel);
    northFrameBeam.position.set(0, frameBeamCenterY, frameHalfDepth);
    group.add(northFrameBeam);

    const westFrameBeam = createBeamBetween(
      new THREE.Vector3(-frameHalfWidth, frameBeamCenterY, -frameHalfDepth),
      new THREE.Vector3(-frameHalfWidth, frameBeamCenterY, frameHalfDepth),
      FRAME_BEAM_DEPTH_M,
      materials.steel
    );
    group.add(westFrameBeam);

    const eastFrameBeam = createBeamBetween(
      new THREE.Vector3(frameHalfWidth, frameBeamCenterY, -frameHalfDepth),
      new THREE.Vector3(frameHalfWidth, frameBeamCenterY, frameHalfDepth),
      FRAME_BEAM_DEPTH_M,
      materials.steel
    );
    group.add(eastFrameBeam);

    for (const [x, z] of [
      [-frameHalfWidth, -frameHalfDepth],
      [frameHalfWidth, -frameHalfDepth],
      [-frameHalfWidth, frameHalfDepth],
      [frameHalfWidth, frameHalfDepth],
    ]) {
      const post = createPost(postHeight, POST_RADIUS_M, materials.steel);
      post.position.x = x;
      post.position.z = z;
      group.add(post);
    }

    for (const rowAnchor of rowAnchors) {
      const rowCenterZ = rowAnchor.z;

      const rowBeam = createBoxBeam(rowBeamWidth, ROW_BEAM_HEIGHT_M, ROW_BEAM_DEPTH_M, materials.steel);
      rowBeam.position.set(0, frameTopY - (ROW_BEAM_HEIGHT_M / 2), rowCenterZ);
      group.add(rowBeam);

      const rackPivot = new THREE.Group();
      rackPivot.position.set(0, modulePlaneY, rowCenterZ);
      rackPivot.rotation.x = -rackAngleRad;
      group.add(rackPivot);

      for (const supportLine of supportLines) {
        const rail = createBoxBeam(rowBeamWidth, RAIL_HEIGHT_M, RAIL_DEPTH_M, materials.steel);
        rail.userData.simulationKind = "beam_rotating";
        rail.position.set(0, railCenterLocalY, supportLine);
        rackPivot.add(rail);
      }

      const rowColumns = rowAnchorMap.get(rowAnchor.row) || [];
      for (const columnAnchor of rowColumns) {
        for (let moduleIndex = 0; moduleIndex < moduleCenters.length; moduleIndex++) {
          const gridRowIndex = (rowAnchor.row * layout.tableSpec.count) + moduleIndex;
          if (state.pergolaCheckerboard && ((columnAnchor.col + gridRowIndex) % 2 === 1)) {
            continue;
          }

          const moduleGroup = moduleProto.clone(true);
          moduleGroup.position.set(columnAnchor.x, 0, moduleCenters[moduleIndex]);
          rackPivot.add(moduleGroup);
        }
      }

      for (const bracketX of bracketXs) {
        const basePoint = new THREE.Vector3(
          bracketX,
          frameTopY,
          rowCenterZ
        );

        const southRailPoint = new THREE.Vector3(
          bracketX,
          railCenterLocalY - (RAIL_HEIGHT_M / 2),
          supportLines[0]
        ).applyAxisAngle(new THREE.Vector3(1, 0, 0), -rackAngleRad).add(
          new THREE.Vector3(0, modulePlaneY, rowCenterZ)
        );

        const northRailPoint = new THREE.Vector3(
          bracketX,
          railCenterLocalY - (RAIL_HEIGHT_M / 2),
          supportLines[supportLines.length - 1]
        ).applyAxisAngle(new THREE.Vector3(1, 0, 0), -rackAngleRad).add(
          new THREE.Vector3(0, modulePlaneY, rowCenterZ)
        );

        group.add(createBeamBetween(basePoint, southRailPoint, BRACKET_THICKNESS_M, materials.steel));
        group.add(createBeamBetween(basePoint, northRailPoint, BRACKET_THICKNESS_M, materials.steel));
      }
    }

    return group;
  },
};
