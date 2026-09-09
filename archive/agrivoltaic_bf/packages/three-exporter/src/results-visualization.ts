import type {
  GridResult,
  GridClassification,
  ImportedSimulationResult,
  IrradianceSample,
} from "@agrivoltaic/shared";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  SphereGeometry,
  Vector3,
} from "three";

export interface VisualizationFilter {
  gridIds?: string[];
  classifications?: GridClassification[];
}

export interface ValueRange {
  min: number;
  max: number;
}

export interface PointCloudOptions {
  size?: number;
  range?: ValueRange;
  filter?: VisualizationFilter;
}

export interface SliceOptions {
  gridId?: string;
  axis: "row" | "cross" | "up";
  index: number;
  cellOpacity?: number;
  range?: ValueRange;
}

function inferValueRange(results: ImportedSimulationResult): ValueRange {
  const values = results.grids.flatMap((grid) => grid.irradianceResults.map((sample) => sample.Ee));
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function colorForValue(value: number, range: ValueRange): Color {
  const denom = Math.max(range.max - range.min, 1e-9);
  const t = Math.min(1, Math.max(0, (value - range.min) / denom));
  return new Color().setRGB(
    Math.max(0, Math.min(1, (t - 0.15) * 1.9)),
    Math.max(0, Math.min(1, 1.1 - Math.abs((t - 0.5) * 2.2))),
    Math.max(0, Math.min(1, (0.78 - t) * 1.55)),
  );
}

function matchesFilter(grid: GridResult, filter?: VisualizationFilter): boolean {
  if (!filter) return true;
  if (filter.gridIds && !filter.gridIds.includes(grid.gridId)) return false;
  if (filter.classifications && !grid.classifications.some((entry) => filter.classifications?.includes(entry))) {
    return false;
  }
  return true;
}

function collectSamples(results: ImportedSimulationResult, filter?: VisualizationFilter): IrradianceSample[] {
  return results.grids
    .filter((grid) => matchesFilter(grid, filter))
    .flatMap((grid) => grid.irradianceResults);
}

export function createSensorPointCloud(
  results: ImportedSimulationResult,
  options: PointCloudOptions = {},
): Points {
  const samples = collectSamples(results, options.filter);
  const range = options.range ?? inferValueRange(results);
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];

  for (const sample of samples) {
    positions.push(sample.position.x, sample.position.y, sample.position.z);
    const color = colorForValue(sample.Ee, range);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const points = new Points(geometry, new PointsMaterial({
    size: options.size ?? 0.15,
    vertexColors: true,
  }));
  points.name = "radiance-sensor-points";
  return points;
}

export function createPerGridPointGroups(
  results: ImportedSimulationResult,
  options: PointCloudOptions = {},
): Group {
  const range = options.range ?? inferValueRange(results);
  const root = new Group();
  root.name = "radiance-grid-points";

  for (const grid of results.grids) {
    if (!matchesFilter(grid, options.filter)) {
      continue;
    }

    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    for (const sample of grid.irradianceResults) {
      positions.push(sample.position.x, sample.position.y, sample.position.z);
      const color = colorForValue(sample.Ee, range);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    const points = new Points(geometry, new PointsMaterial({
      size: options.size ?? 0.15,
      vertexColors: true,
    }));
    points.name = grid.gridId;
    points.userData.gridId = grid.gridId;
    points.userData.classifications = grid.classifications;
    root.add(points);
  }

  return root;
}

export function createInstancedSensorMarkers(
  results: ImportedSimulationResult,
  options: PointCloudOptions = {},
): InstancedMesh {
  const samples = collectSamples(results, options.filter);
  const range = options.range ?? inferValueRange(results);
  const mesh = new InstancedMesh(
    new SphereGeometry(options.size ?? 0.08, 10, 10),
    new MeshBasicMaterial({ vertexColors: true }),
    samples.length,
  );

  const matrix = new Matrix4();
  const position = new Vector3();
  samples.forEach((sample, index) => {
    position.set(sample.position.x, sample.position.y, sample.position.z);
    matrix.makeTranslation(position.x, position.y, position.z);
    mesh.setMatrixAt(index, matrix);
    mesh.setColorAt(index, colorForValue(sample.Ee, range));
  });
  mesh.name = "radiance-instanced-sensors";
  return mesh;
}

function getGridOrThrow(results: ImportedSimulationResult, gridId?: string): GridResult {
  const grid = gridId
    ? results.grids.find((entry) => entry.gridId === gridId)
    : results.grids[0];
  if (!grid) {
    throw new Error(`Could not resolve grid ${gridId ?? "(first grid)"}`);
  }
  return grid;
}

export function createSliceHeatmap(
  results: ImportedSimulationResult,
  options: SliceOptions,
): Group {
  const grid = getGridOrThrow(results, options.gridId);
  const range = options.range ?? inferValueRange(results);
  const axisIndex = options.axis === "row" ? 0 : options.axis === "cross" ? 1 : 2;
  const group = new Group();
  group.name = `slice-${grid.gridId}-${options.axis}-${options.index}`;
  group.userData.gridId = grid.gridId;

  const cellRow = grid.bounds.lengthRow / grid.dimensions[0];
  const cellCross = grid.bounds.lengthCross / grid.dimensions[1];
  const cellUp = grid.bounds.height / grid.dimensions[2];

  for (const sample of grid.irradianceResults) {
    if (sample.indices[axisIndex] !== options.index) continue;

    const color = colorForValue(sample.Ee, range);
    let geometry: PlaneGeometry;
    const pivot = new Object3D();

    if (options.axis === "up") {
      geometry = new PlaneGeometry(cellRow, cellCross);
      pivot.position.set(sample.position.x, sample.position.y, sample.position.z);
      pivot.rotateX(-Math.PI / 2);
    } else if (options.axis === "row") {
      geometry = new PlaneGeometry(cellCross, cellUp);
      pivot.position.set(sample.position.x, sample.position.y, sample.position.z);
      pivot.rotateY(Math.PI / 2);
    } else {
      geometry = new PlaneGeometry(cellRow, cellUp);
      pivot.position.set(sample.position.x, sample.position.y, sample.position.z);
    }

    const mesh = new InstancedMesh(
      geometry,
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: options.cellOpacity ?? 0.78,
        side: 2,
      }),
      1,
    );
    const matrix = new Matrix4()
      .compose(pivot.position, pivot.quaternion, new Vector3(1, 1, 1));
    mesh.setMatrixAt(0, matrix);
    mesh.userData.gridId = grid.gridId;
    mesh.userData.classifications = grid.classifications;
    group.add(mesh);
  }

  return group;
}

export function createVolumeLayerView(
  results: ImportedSimulationResult,
  axis: "row" | "cross" | "up",
  layerEvery = 4,
  filter?: VisualizationFilter,
): Group {
  const root = new Group();
  root.name = `volume-layers-${axis}`;

  for (const grid of results.grids) {
    if (!matchesFilter(grid, filter)) continue;
    const axisIndex = axis === "row" ? 0 : axis === "cross" ? 1 : 2;
    const layerCount = grid.dimensions[axisIndex];
    for (let index = 0; index < layerCount; index += layerEvery) {
      root.add(createSliceHeatmap(results, {
        gridId: grid.gridId,
        axis,
        index,
        cellOpacity: 0.28,
      }));
    }
  }

  return root;
}

export function buildLegendStops(
  results: ImportedSimulationResult,
  steps = 6,
): Array<{ value: number; color: string }> {
  const range = inferValueRange(results);
  return Array.from({ length: steps }, (_, index) => {
    const t = steps === 1 ? 0 : index / (steps - 1);
    const value = range.min + ((range.max - range.min) * t);
    const color = colorForValue(value, range).getStyle();
    return { value, color };
  });
}

export function summarizeEdgeVsInterior(results: ImportedSimulationResult): string[] {
  const lines = [
    `Total grids: ${results.arrayStats.gridCount}`,
    `Total sensors: ${results.arrayStats.sensorCount}`,
    `Whole-array mean: ${results.arrayStats.stats.mean.toFixed(2)} W/m2`,
  ];

  if (results.edgeStats) {
    lines.push(`Edge mean: ${results.edgeStats.stats.mean.toFixed(2)} W/m2`);
  }
  if (results.interiorStats) {
    lines.push(`Interior mean: ${results.interiorStats.stats.mean.toFixed(2)} W/m2`);
  }
  if (results.arrayStats.edgeInteriorDifference !== undefined) {
    lines.push(`Edge-interior difference: ${results.arrayStats.edgeInteriorDifference.toFixed(2)} W/m2`);
  }
  if (results.arrayStats.edgeInteriorRatio !== undefined) {
    lines.push(`Edge/interior ratio: ${results.arrayStats.edgeInteriorRatio.toFixed(3)}`);
  }

  return lines;
}
