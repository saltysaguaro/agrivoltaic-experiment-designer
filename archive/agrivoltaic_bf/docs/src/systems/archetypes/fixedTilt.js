import * as THREE from "three";
import { degToRad } from "../../utils/math.js";
import { createModulePrototype } from "../components/module.js";
import { createPost } from "../components/supportPosts.js";
import { createBeamBetween, createBoxBeam } from "../components/simpleFrame.js";
import { getStackModuleCenters, getSupportLinePositions } from "../components/supportLines.js";

const SUPPORT_BEAM_THICKNESS_M = 0.08;
const RAIL_HEIGHT_M = 0.055;
const RAIL_DEPTH_M = 0.055;
const MODULE_CLAMP_GAP_M = 0.02;
const RAIL_OVERHANG_X_M = 0.12;
const POST_RADIUS_M = 0.055;

export const fixedTiltArchetype = {
  id: "fixed",
  label: "Fixed tilt",
  rowAxis: "x",
  buildTable({ state, tableSpec, materials }) {
    const group = new THREE.Group();
    const tiltRad = degToRad(state.tiltDeg);
    const projectedDepth = tableSpec.stackSpan * Math.cos(tiltRad);
    const southSupportY = state.heightM;
    const northSupportY = southSupportY + (tableSpec.stackSpan * Math.sin(tiltRad));
    const modulePlaneY = southSupportY + (RAIL_HEIGHT_M / 2) + MODULE_CLAMP_GAP_M + (tableSpec.moduleThickness / 2);
    const railCenterY = -((tableSpec.moduleThickness / 2) + MODULE_CLAMP_GAP_M + (RAIL_HEIGHT_M / 2));
    const beamLengthX = tableSpec.tableLength + RAIL_OVERHANG_X_M;
    const supportX = (beamLengthX / 2) - (SUPPORT_BEAM_THICKNESS_M / 2);
    const moduleCenters = getStackModuleCenters(tableSpec);
    const supportLines = getSupportLinePositions(tableSpec, { insetRatio: 0.23 });

    const pivot = new THREE.Group();
    pivot.position.y = modulePlaneY;
    pivot.rotation.x = -tiltRad;
    group.add(pivot);

    const moduleProto = createModulePrototype({
      alongRow: tableSpec.tableLength,
      crossSpan: tableSpec.moduleHeight,
      thickness: tableSpec.moduleThickness,
      orientation: "ground-x",
    }, materials);

    for (const moduleCenter of moduleCenters) {
      const moduleGroup = moduleProto.clone(true);
      moduleGroup.position.set(0, 0, moduleCenter);
      pivot.add(moduleGroup);
    }

    for (const supportLine of supportLines) {
      const rail = createBoxBeam(beamLengthX, RAIL_HEIGHT_M, RAIL_DEPTH_M, materials.steel);
      rail.position.set(0, railCenterY, supportLine);
      pivot.add(rail);
    }

    for (const x of [-supportX, supportX]) {
      group.add(createBeamBetween(
        new THREE.Vector3(x, southSupportY, 0),
        new THREE.Vector3(x, northSupportY, projectedDepth),
        SUPPORT_BEAM_THICKNESS_M,
        materials.steel
      ));
    }

    const southTie = createBoxBeam(beamLengthX, SUPPORT_BEAM_THICKNESS_M, SUPPORT_BEAM_THICKNESS_M, materials.steel);
    southTie.position.set(0, southSupportY, 0);
    group.add(southTie);

    const northTie = createBoxBeam(beamLengthX, SUPPORT_BEAM_THICKNESS_M, SUPPORT_BEAM_THICKNESS_M, materials.steel);
    northTie.position.set(0, northSupportY, projectedDepth);
    group.add(northTie);

    const southPostHeight = Math.max(0.7, southSupportY - (SUPPORT_BEAM_THICKNESS_M / 2));
    const northPostHeight = Math.max(0.8, northSupportY - (SUPPORT_BEAM_THICKNESS_M / 2));

    for (const x of [-supportX, supportX]) {
      const southPost = createPost(southPostHeight, POST_RADIUS_M, materials.steel);
      southPost.position.x = x;
      southPost.position.z = 0;
      group.add(southPost);

      const northPost = createPost(northPostHeight, POST_RADIUS_M, materials.steel);
      northPost.position.x = x;
      northPost.position.z = projectedDepth;
      group.add(northPost);
    }

    return group;
  },
};
