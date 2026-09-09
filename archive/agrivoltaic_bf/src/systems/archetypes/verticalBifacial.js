import * as THREE from "three";
import { createModulePrototype } from "../components/module.js";
import { createPost } from "../components/supportPosts.js";
import { createBoxBeam } from "../components/simpleFrame.js";
import { getStackModuleCenters, getSupportLinePositions } from "../components/supportLines.js";

const POST_RADIUS_M = 0.05;
const GIRT_HEIGHT_M = 0.06;
const GIRT_DEPTH_M = 0.06;
const POST_OVERHANG_X_M = 0.12;
const BACK_RAIL_GAP_M = 0.03;

export const verticalBifacialArchetype = {
  id: "vertical",
  label: "Vertical bifacial",
  rowAxis: "x",
  buildTable({ state, tableSpec, materials }) {
    const group = new THREE.Group();
    const faceDepth = Math.max(0.18, tableSpec.moduleThickness + 0.16);
    const moduleCenterZ = faceDepth / 2;
    const supportZ = moduleCenterZ - (tableSpec.moduleThickness / 2) - BACK_RAIL_GAP_M - (GIRT_DEPTH_M / 2);
    const beamLengthX = tableSpec.tableLength + POST_OVERHANG_X_M;
    const postX = (beamLengthX / 2) - 0.04;
    const moduleCenters = getStackModuleCenters(tableSpec);
    const supportLines = getSupportLinePositions(tableSpec, { insetRatio: 0.23 });

    const moduleProto = createModulePrototype({
      alongRow: tableSpec.tableLength,
      crossSpan: tableSpec.moduleHeight,
      thickness: tableSpec.moduleThickness,
      orientation: "vertical-x",
    }, materials);

    for (const moduleCenter of moduleCenters) {
      const moduleGroup = moduleProto.clone(true);
      moduleGroup.position.set(0, state.heightM + moduleCenter, moduleCenterZ);
      group.add(moduleGroup);
    }

    for (const supportLine of supportLines) {
      const girt = createBoxBeam(beamLengthX, GIRT_HEIGHT_M, GIRT_DEPTH_M, materials.steel);
      girt.position.set(0, state.heightM + supportLine, supportZ);
      group.add(girt);
    }

    const postHeight = Math.max(
      1.2,
      state.heightM + tableSpec.stackSpan + (GIRT_HEIGHT_M / 2)
    );
    for (const x of [-postX, postX]) {
      const post = createPost(postHeight, POST_RADIUS_M, materials.steel);
      post.position.x = x;
      post.position.z = supportZ;
      group.add(post);
    }

    const capBeam = createBoxBeam(beamLengthX, GIRT_HEIGHT_M, GIRT_DEPTH_M, materials.steel);
    capBeam.position.set(0, postHeight - (GIRT_HEIGHT_M / 2), supportZ);
    group.add(capBeam);

    return group;
  },
};
