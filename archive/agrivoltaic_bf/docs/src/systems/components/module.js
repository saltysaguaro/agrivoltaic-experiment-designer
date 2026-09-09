import * as THREE from "three";

function buildModuleGeometry({ alongRow, crossSpan, thickness, orientation }) {
  if (orientation === "ground-z") {
    return {
      glass: new THREE.BoxGeometry(crossSpan, thickness, alongRow),
      frame: new THREE.BoxGeometry(crossSpan + 0.028, thickness + 0.014, alongRow + 0.028),
    };
  }

  if (orientation === "vertical-x") {
    return {
      glass: new THREE.BoxGeometry(alongRow, crossSpan, thickness),
      frame: new THREE.BoxGeometry(alongRow + 0.028, crossSpan + 0.028, thickness + 0.016),
    };
  }

  return {
    glass: new THREE.BoxGeometry(alongRow, thickness, crossSpan),
    frame: new THREE.BoxGeometry(alongRow + 0.028, thickness + 0.014, crossSpan + 0.028),
  };
}

export function createModulePrototype({ alongRow, crossSpan, thickness, orientation }, materials) {
  const geometry = buildModuleGeometry({ alongRow, crossSpan, thickness, orientation });
  const group = new THREE.Group();
  group.name = "pv-module";
  group.userData.simulationKind = "module_assembly";

  const frame = new THREE.Mesh(geometry.frame, materials.frame);
  const glass = new THREE.Mesh(geometry.glass, materials.panel);
  frame.name = "pv-module-frame";
  frame.userData.simulationKind = "module_frame";
  glass.name = "pv-module-glass";
  glass.userData.simulationKind = "module_glass";

  frame.castShadow = true;
  frame.receiveShadow = true;
  glass.castShadow = true;
  glass.receiveShadow = true;

  if (orientation === "ground-z") {
    frame.position.y = -0.004;
    glass.position.y = 0.003;
  } else if (orientation === "vertical-x") {
    frame.position.z = -0.003;
    glass.position.z = 0.002;
  } else {
    frame.position.y = -0.004;
    glass.position.y = 0.003;
  }

  group.add(frame, glass);
  return group;
}
