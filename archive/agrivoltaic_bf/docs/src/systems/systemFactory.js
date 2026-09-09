import * as THREE from "three";
import { computeArrayLayout } from "../utils/layout.js";
import { fixedTiltArchetype } from "./archetypes/fixedTilt.js";
import { singleAxisTrackerArchetype } from "./archetypes/singleAxisTracker.js";
import { pergolaArchetype } from "./archetypes/pergola.js";
import { verticalBifacialArchetype } from "./archetypes/verticalBifacial.js";

const ARCHETYPES = {
  fixed: fixedTiltArchetype,
  sat: singleAxisTrackerArchetype,
  raised: pergolaArchetype,
  vertical: verticalBifacialArchetype,
};

export function getArchetype(systemType) {
  return ARCHETYPES[systemType] || fixedTiltArchetype;
}

export function buildSystemAssembly(state, materials) {
  const archetype = getArchetype(state.systemType);
  const layout = computeArrayLayout(state, archetype);

  if (typeof archetype.buildAssembly === "function") {
    return {
      group: archetype.buildAssembly({
        state,
        layout,
        materials,
      }),
      archetype,
      layout,
    };
  }

  const group = new THREE.Group();
  const usesAnchorSensitivePattern = state.systemType === "raised" && state.pergolaCheckerboard;

  if (usesAnchorSensitivePattern) {
    for (const anchor of layout.anchors) {
      const table = archetype.buildTable({
        state,
        tableSpec: layout.tableSpec,
        materials,
        anchor,
      });
      table.position.set(anchor.x, 0, anchor.z);
      group.add(table);
    }
  } else {
    const tablePrototype = archetype.buildTable({
      state,
      tableSpec: layout.tableSpec,
      materials,
      anchor: layout.anchors[0] || { row: 0, col: 0 },
    });

    for (const anchor of layout.anchors) {
      const table = tablePrototype.clone(true);
      table.position.set(anchor.x, 0, anchor.z);
      group.add(table);
    }
  }

  return {
    group,
    archetype,
    layout,
  };
}
