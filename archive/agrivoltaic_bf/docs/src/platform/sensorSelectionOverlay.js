import * as THREE from "three";

const SCALE_FACTOR = 0.74;
const MIN_SIZE = 0.18;
const SENSOR_BOX_OPACITY = 0.5;

function toThreePosition(position) {
  return new THREE.Vector3(position.x, position.z, -position.y);
}

function toThreeDirection(vector) {
  return new THREE.Vector3(vector.x, vector.z, -vector.y).normalize();
}

function cellSize(length, count) {
  if (count <= 1) return length;
  return length / count;
}

function createGridMesh(grid, heightIndex, selectedSensorIds) {
  const cells = (grid.sensors || []).filter((sensor) => sensor.indices[2] === heightIndex);
  if (!cells.length) return null;

  const rowAxis = toThreeDirection(grid.localFrame.eRow);
  const crossAxis = toThreeDirection(grid.localFrame.eCross);
  const upAxis = toThreeDirection(grid.localFrame.eUp);
  const rowSize = Math.max(MIN_SIZE, cellSize(grid.bounds.lengthRow, grid.dimensions[0]) * SCALE_FACTOR);
  const crossSize = Math.max(MIN_SIZE, cellSize(grid.bounds.lengthCross, grid.dimensions[1]) * SCALE_FACTOR);
  const upSize = Math.max(
    MIN_SIZE,
    (grid.dimensions[2] > 1 ? grid.bounds.height / (grid.dimensions[2] - 1) : grid.bounds.height) * SCALE_FACTOR,
  );

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: SENSOR_BOX_OPACITY,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
  mesh.frustumCulled = false;
  mesh.renderOrder = 16;

  const matrix = new THREE.Matrix4();
  const basis = new THREE.Matrix4();
  const scaledRow = new THREE.Vector3();
  const scaledUp = new THREE.Vector3();
  const scaledCross = new THREE.Vector3();
  const color = new THREE.Color();

  const cellRecords = cells.map((cell, index) => {
    const position = toThreePosition(cell.position);
    if (heightIndex === 0) {
      position.y += 0.012;
    }

    scaledRow.copy(rowAxis).multiplyScalar(rowSize);
    scaledUp.copy(upAxis).multiplyScalar(upSize);
    scaledCross.copy(crossAxis).multiplyScalar(crossSize);

    basis.makeBasis(scaledRow, scaledUp, scaledCross);
    matrix.copy(basis);
    matrix.setPosition(position);
    mesh.setMatrixAt(index, matrix);

    const selected = selectedSensorIds.has(cell.id);
    color.set(selected ? "#d94c46" : "#101010");
    mesh.setColorAt(index, color);

    return {
      ...cell,
      _selected: selected,
      _positionThree: position,
      _rowSize: rowSize,
      _crossSize: crossSize,
      _upSize: upSize,
    };
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
  mesh.material.opacity = SENSOR_BOX_OPACITY;
  mesh.userData.cells = cellRecords;
  mesh.userData.heightIndex = heightIndex;
  mesh.userData.gridId = grid.gridId;
  return mesh;
}

export function createSelectableSensorOverlay(grids, heightIndex, selectedSensorIds) {
  const root = new THREE.Group();
  root.name = "sensor-selection-overlay";
  const visibleCells = [];

  for (const grid of grids) {
    const mesh = createGridMesh(grid, heightIndex, selectedSensorIds);
    if (!mesh) continue;
    for (const cell of mesh.userData.cells) {
      visibleCells.push(cell);
    }
    root.add(mesh);
  }

  root.userData.visibleCells = visibleCells;
  return root;
}

export function updateSelectableOverlayColors(overlayRoot, selectedSensorIds) {
  overlayRoot.traverse((child) => {
    if (!child.isInstancedMesh || !child.userData.cells) return;
    const color = new THREE.Color();
    child.userData.cells.forEach((cell, index) => {
      const selected = selectedSensorIds.has(cell.id);
      cell._selected = selected;
      color.set(selected ? "#d94c46" : "#101010");
      child.setColorAt(index, color);
    });
    if (child.instanceColor) {
      child.instanceColor.needsUpdate = true;
    }
  });
}

export function buildSelectionLegend() {
  return {
    unselected: {
      label: "Available sensor",
      color: "rgba(16, 16, 16, 0.18)",
    },
    selected: {
      label: "Selected for modeling",
      color: "rgba(217, 76, 70, 0.5)",
    },
  };
}
