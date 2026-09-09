import { createBoxBeam } from "./simpleFrame.js";

export function createTwinRails({ length, spread, axis = "x", offset = -0.1, thickness = 0.06 }, material) {
  const rails = [];

  if (axis === "z") {
    const railGeometry = { width: thickness, height: thickness, depth: length };
    const west = createBoxBeam(railGeometry.width, railGeometry.height, railGeometry.depth, material);
    const east = createBoxBeam(railGeometry.width, railGeometry.height, railGeometry.depth, material);
    west.position.set(-spread / 2, offset, 0);
    east.position.set(spread / 2, offset, 0);
    rails.push(west, east);
  } else {
    const railGeometry = { width: length, height: thickness, depth: thickness };
    const south = createBoxBeam(railGeometry.width, railGeometry.height, railGeometry.depth, material);
    const north = createBoxBeam(railGeometry.width, railGeometry.height, railGeometry.depth, material);
    south.position.set(0, offset, spread / 2);
    north.position.set(0, offset, -spread / 2);
    rails.push(south, north);
  }

  return rails;
}
