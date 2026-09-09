import * as THREE from "three";
import { degToRad } from "../../utils/math.js";
import { createModulePrototype } from "../components/module.js";
import { createPost } from "../components/supportPosts.js";
import { createTorqueTube } from "../components/torqueTube.js";
import { createBeamBetween, createBoxBeam } from "../components/simpleFrame.js";
import { getStackModuleCenters, getSupportLinePositions } from "../components/supportLines.js";

const TORQUE_TUBE_RADIUS_M = 0.08;
const POST_RADIUS_M = 0.06;
const MOUNT_ARM_THICKNESS_M = 0.045;
const MODULE_CLAMP_GAP_M = 0.02;
const RAIL_HEIGHT_M = 0.05;
const RAIL_WIDTH_M = 0.05;
const RAIL_OVERHANG_Z_M = 0.16;

export const singleAxisTrackerArchetype = {
  id: "sat",
  label: "Single-axis tracker",
  rowAxis: "z",
  buildTable({ state, tableSpec, materials }) {
    const group = new THREE.Group();
    const trackerAngle = degToRad(state.trackerAngleDeg);
    const projectedWidth = tableSpec.stackSpan * Math.cos(trackerAngle);
    const moduleCenters = getStackModuleCenters(tableSpec, { centered: true });
    const supportLines = getSupportLinePositions(tableSpec, {
      centered: true,
      insetRatio: 0.23,
    });
    const railLengthZ = tableSpec.tableLength + RAIL_OVERHANG_Z_M;
    const railCenterY = TORQUE_TUBE_RADIUS_M + MOUNT_ARM_THICKNESS_M + (RAIL_HEIGHT_M / 2);
    const moduleCenterY = railCenterY + (RAIL_HEIGHT_M / 2) + MODULE_CLAMP_GAP_M + (tableSpec.moduleThickness / 2);
    const postZ = (railLengthZ / 2) - 0.28;
    const strutZ = Math.max(0.03, Math.min(Math.abs(postZ) * 0.72, railLengthZ * 0.22));

    const trackerGroup = new THREE.Group();
    trackerGroup.position.set(-(projectedWidth / 2), state.heightM, 0);
    trackerGroup.rotation.z = trackerAngle;
    group.add(trackerGroup);

    const moduleProto = createModulePrototype({
      alongRow: tableSpec.tableLength,
      crossSpan: tableSpec.moduleHeight,
      thickness: tableSpec.moduleThickness,
      orientation: "ground-z",
    }, materials);

    for (const moduleCenter of moduleCenters) {
      const moduleGroup = moduleProto.clone(true);
      moduleGroup.position.set(moduleCenter, moduleCenterY, 0);
      trackerGroup.add(moduleGroup);
    }

    const torqueTube = createTorqueTube(railLengthZ, TORQUE_TUBE_RADIUS_M, materials.torqueTube);
    trackerGroup.add(torqueTube);

    for (const supportLine of supportLines) {
      const rail = createBoxBeam(RAIL_WIDTH_M, RAIL_HEIGHT_M, railLengthZ, materials.steel);
      rail.position.set(supportLine, railCenterY, 0);
      trackerGroup.add(rail);

      for (const z of [-strutZ, strutZ]) {
        trackerGroup.add(createBeamBetween(
          new THREE.Vector3(0, TORQUE_TUBE_RADIUS_M * 0.2, z),
          new THREE.Vector3(supportLine, railCenterY - (RAIL_HEIGHT_M / 2), z),
          MOUNT_ARM_THICKNESS_M,
          materials.steel
        ));
      }
    }

    const postHeight = Math.max(1.1, state.heightM - TORQUE_TUBE_RADIUS_M);
    for (const z of [-postZ, postZ]) {
      const post = createPost(postHeight, POST_RADIUS_M, materials.steel);
      post.position.x = -(projectedWidth / 2);
      post.position.z = z;
      group.add(post);
    }

    return group;
  },
};
