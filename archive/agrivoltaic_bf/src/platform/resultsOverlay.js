import * as THREE from "three";

const DEFAULT_RANGE_EPSILON = 1e-9;
const DEFAULT_OPACITY = 0.72;
const DEFAULT_CELL_SIZE = 0.4;
const MIN_SLAB_THICKNESS = 0.18;
const MAX_SLAB_THICKNESS = 1.2;

const HEATMAP_STOPS = [
  { t: 0.0, color: new THREE.Color("#163b9d") },
  { t: 0.2, color: new THREE.Color("#2a7de1") },
  { t: 0.42, color: new THREE.Color("#76c8ff") },
  { t: 0.68, color: new THREE.Color("#ffe17a") },
  { t: 0.86, color: new THREE.Color("#f59f0a") },
  { t: 1.0, color: new THREE.Color("#cb3a1d") },
];

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function valueRange(view) {
  const min = Number.isFinite(view?.overall?.min) ? view.overall.min : 0;
  const max = Number.isFinite(view?.overall?.max) ? view.overall.max : min;
  if (Math.abs(max - min) < DEFAULT_RANGE_EPSILON) {
    return { min, max: min + 1 };
  }
  return { min, max };
}

function normalizedValue(value, range) {
  return clamp01((value - range.min) / Math.max(range.max - range.min, DEFAULT_RANGE_EPSILON));
}

function colorForValue(value, range) {
  const t = normalizedValue(value, range);
  for (let index = 1; index < HEATMAP_STOPS.length; index += 1) {
    const previous = HEATMAP_STOPS[index - 1];
    const next = HEATMAP_STOPS[index];
    if (t <= next.t) {
      const localT = (t - previous.t) / Math.max(next.t - previous.t, DEFAULT_RANGE_EPSILON);
      return previous.color.clone().lerp(next.color, localT);
    }
  }
  return HEATMAP_STOPS.at(-1).color.clone();
}

function toThreePosition(position) {
  return new THREE.Vector3(position.x, position.z, -position.y);
}

function toThreeDirection(vector) {
  return new THREE.Vector3(vector.x, vector.z, -vector.y).normalize();
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b);
}

function inferStep(values) {
  if (values.length < 2) return DEFAULT_CELL_SIZE;
  let minStep = Number.POSITIVE_INFINITY;
  for (let index = 1; index < values.length; index += 1) {
    const step = Math.abs(values[index] - values[index - 1]);
    if (step > DEFAULT_RANGE_EPSILON && step < minStep) {
      minStep = step;
    }
  }
  return Number.isFinite(minStep) ? minStep : DEFAULT_CELL_SIZE;
}

function inferAxisFromNeighbors(cells, rowDelta, colDelta, fallback) {
  const anchor = cells[0];
  if (!anchor) return fallback.clone();

  const match = cells.find((candidate) => (
    candidate.rowIndex === (anchor.rowIndex + rowDelta)
    && candidate.colIndex === (anchor.colIndex + colDelta)
  ));

  if (!match) {
    return fallback.clone();
  }

  const vector = toThreePosition(match.position).sub(toThreePosition(anchor.position));
  if (vector.lengthSq() < DEFAULT_RANGE_EPSILON) {
    return fallback.clone();
  }

  return vector.normalize();
}

function inferGridFrame(cells) {
  const rowAxis = inferAxisFromNeighbors(cells, 1, 0, new THREE.Vector3(1, 0, 0));
  const colAxis = inferAxisFromNeighbors(cells, 0, 1, new THREE.Vector3(0, 0, 1));
  const worldUp = new THREE.Vector3(0, 1, 0);
  const orthogonalRow = rowAxis.clone().normalize();
  const orthogonalCol = colAxis.clone()
    .sub(orthogonalRow.clone().multiplyScalar(colAxis.dot(orthogonalRow)));

  if (orthogonalCol.lengthSq() < DEFAULT_RANGE_EPSILON || Math.abs(orthogonalRow.dot(orthogonalCol.clone().normalize())) > 0.98) {
    orthogonalCol.set(0, 0, 1);
  } else {
    orthogonalCol.normalize();
  }

  const upAxis = new THREE.Vector3().crossVectors(orthogonalCol, orthogonalRow).normalize();
  if (upAxis.dot(worldUp) < 0) {
    orthogonalCol.multiplyScalar(-1);
    upAxis.multiplyScalar(-1);
  }

  return {
    rowAxis: orthogonalRow,
    colAxis: orthogonalCol,
    upAxis,
  };
}

function inferHorizontalSizes(cells) {
  const rowPositions = uniqueSorted(cells.map((cell) => cell.position.x));
  const colPositions = uniqueSorted(cells.map((cell) => cell.position.y));

  return {
    rowSize: Math.max(DEFAULT_CELL_SIZE, inferStep(rowPositions) * 0.92),
    colSize: Math.max(DEFAULT_CELL_SIZE, inferStep(colPositions) * 0.92),
  };
}

function sizesFromGridMetadata(grid) {
  if (!grid?.bounds || !grid?.dimensions) return null;
  const rowSize = grid.dimensions[0] > 1
    ? grid.bounds.lengthRow / grid.dimensions[0]
    : grid.bounds.lengthRow;
  const colSize = grid.dimensions[1] > 1
    ? grid.bounds.lengthCross / grid.dimensions[1]
    : grid.bounds.lengthCross;
  return {
    rowSize: Math.max(DEFAULT_CELL_SIZE, rowSize * 0.92),
    colSize: Math.max(DEFAULT_CELL_SIZE, colSize * 0.92),
  };
}

function slabThicknessForLevel(heightLevelsM, heightIndex) {
  if (!Array.isArray(heightLevelsM) || !heightLevelsM.length) {
    return 0.32;
  }

  const current = heightLevelsM[heightIndex] ?? heightLevelsM[0] ?? 0;
  const previous = heightLevelsM[heightIndex - 1];
  const next = heightLevelsM[heightIndex + 1];
  const neighbors = [previous, next].filter((value) => Number.isFinite(value));

  if (!neighbors.length) {
    return 0.32;
  }

  const nearestSpacing = Math.min(...neighbors.map((value) => Math.abs(value - current)));
  return Math.min(MAX_SLAB_THICKNESS, Math.max(MIN_SLAB_THICKNESS, nearestSpacing * 0.92));
}

function formatLegendValue(value) {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function createGridMesh(grid, range, heightLevelsM) {
  const cells = grid.cells ?? [];
  if (!cells.length) return null;

  const rowAxis = grid.localFrame ? toThreeDirection(grid.localFrame.eRow) : inferGridFrame(cells).rowAxis;
  const colAxis = grid.localFrame ? toThreeDirection(grid.localFrame.eCross) : inferGridFrame(cells).colAxis;
  const upAxis = grid.localFrame ? toThreeDirection(grid.localFrame.eUp) : inferGridFrame(cells).upAxis;
  const sizeMetadata = sizesFromGridMetadata(grid);
  const { rowSize, colSize } = sizeMetadata ?? inferHorizontalSizes(cells);
  const slabThickness = slabThicknessForLevel(heightLevelsM, grid.heightIndex);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: DEFAULT_OPACITY,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
  mesh.name = `annual-grid-${grid.gridId}`;
  mesh.frustumCulled = false;
  mesh.renderOrder = 18;

  const matrix = new THREE.Matrix4();
  const basis = new THREE.Matrix4();
  const scaledRow = new THREE.Vector3();
  const scaledUp = new THREE.Vector3();
  const scaledCol = new THREE.Vector3();
  const color = new THREE.Color();

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const position = toThreePosition(cell.position);
    if (grid.heightIndex === 0) {
      position.y += 0.01;
    }
    scaledRow.copy(rowAxis).multiplyScalar(rowSize);
    scaledUp.copy(upAxis).multiplyScalar(slabThickness);
    scaledCol.copy(colAxis).multiplyScalar(colSize);

    basis.makeBasis(scaledRow, scaledUp, scaledCol);
    matrix.copy(basis);
    matrix.setPosition(position);
    mesh.setMatrixAt(index, matrix);

    color.copy(colorForValue(cell.value, range));
    mesh.setColorAt(index, color);
  }

  if (mesh.instanceMatrix) {
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();

  mesh.userData.cells = cells;
  mesh.userData.units = grid.units;
  mesh.userData.gridId = grid.gridId;
  mesh.userData.heightIndex = grid.heightIndex;
  mesh.userData.heightAboveGroundM = grid.heightAboveGroundM;

  return mesh;
}

export function createResultsOverlay(view, heightLevelsM = []) {
  const root = new THREE.Group();
  root.name = "annual-results-overlay";

  if (!view?.grids?.length) {
    return root;
  }

  const range = valueRange(view);
  for (const grid of view.grids) {
    const mesh = createGridMesh(
      { ...grid, units: view.units },
      range,
      heightLevelsM,
    );
    if (mesh) {
      root.add(mesh);
    }
  }

  return root;
}

export function buildLegendStops(view, steps = 6) {
  const range = valueRange(view);
  const samples = Array.from({ length: steps }, (_, index) => {
    const t = steps <= 1 ? 0 : index / (steps - 1);
    const value = range.min + ((range.max - range.min) * t);
    return {
      value,
      color: colorForValue(value, range).getStyle(),
    };
  });

  return {
    gradient: `linear-gradient(90deg, ${samples.map((sample) => sample.color).join(", ")})`,
    labels: samples.map((sample) => formatLegendValue(sample.value)),
  };
}
