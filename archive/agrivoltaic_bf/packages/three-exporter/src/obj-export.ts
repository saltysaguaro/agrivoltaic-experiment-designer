import {
  EXPORTER_VERSION,
  type ExportSelectionScope,
  type ExportedGeometryAsset,
  type GeometrySourceMode,
  type PackageTextFile,
  type SceneExportBundle,
} from "@agrivoltaic/shared";
import type { BufferAttribute, BufferGeometry, Mesh, Object3D } from "three";
import {
  BufferGeometry as ThreeBufferGeometry,
  Matrix3,
  Vector3,
} from "three";
import { buildSceneManifest, collectSimulationObjects } from "./metadata.js";
import { collectSelectedSimulationObjects } from "./selection.js";
import { resolveSimulationMesh } from "./tagging.js";

function hashString(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function ensureTriangulatedGeometry(geometry: BufferGeometry): BufferGeometry {
  let working = geometry;
  if (working.index) {
    working = working.toNonIndexed();
  } else {
    working = working.clone();
  }

  if (!working.getAttribute("normal")) {
    working.computeVertexNormals();
  }

  return working;
}

function formatVertex(values: [number, number, number]): string {
  return `v ${values[0].toFixed(6)} ${values[1].toFixed(6)} ${values[2].toFixed(6)}`;
}

function formatNormal(values: [number, number, number]): string {
  return `vn ${values[0].toFixed(6)} ${values[1].toFixed(6)} ${values[2].toFixed(6)}`;
}

function formatFace(indices: [number, number, number]): string {
  return `f ${indices[0]}//${indices[0]} ${indices[1]}//${indices[1]} ${indices[2]}//${indices[2]}`;
}

function formatIndexedFace(vertexIndices: [number, number, number], normalIndices: [number, number, number]): string {
  return `f ${vertexIndices[0]}//${normalIndices[0]} ${vertexIndices[1]}//${normalIndices[1]} ${vertexIndices[2]}//${normalIndices[2]}`;
}

function exportMeshGeometry(mesh: Mesh, stableId: string, materialName: string): {
  perObjectText: string;
  vertexCount: number;
  faceCount: number;
  positions: string[];
  normals: string[];
  faces: string[];
} {
  const sourceGeometry = mesh.geometry as BufferGeometry;
  const geometry = ensureTriangulatedGeometry(sourceGeometry);
  const position = geometry.getAttribute("position") as BufferAttribute | undefined;
  const normal = geometry.getAttribute("normal") as BufferAttribute | undefined;

  if (!position || !normal) {
    throw new Error(`Mesh ${stableId} is missing exportable position/normal attributes`);
  }

  const world = mesh.matrixWorld.clone();
  const normalMatrix = new Matrix3().getNormalMatrix(world);
  const vertex = new Vector3();
  const worldNormal = new Vector3();
  const positions: string[] = [];
  const normals: string[] = [];

  for (let index = 0; index < position.count; index++) {
    vertex.set(position.getX(index), position.getY(index), position.getZ(index)).applyMatrix4(world);
    positions.push(formatVertex([vertex.x, vertex.y, vertex.z]));

    worldNormal
      .set(normal.getX(index), normal.getY(index), normal.getZ(index))
      .applyMatrix3(normalMatrix)
      .normalize();
    normals.push(formatNormal([worldNormal.x, worldNormal.y, worldNormal.z]));
  }

  const faceCount = Math.floor(position.count / 3);
  const faces = Array.from({ length: faceCount }, (_, faceIndex) => {
    const offset = (faceIndex * 3) + 1;
    return formatFace([offset, offset + 1, offset + 2]);
  });

  const lines = [
    `o ${stableId}`,
    `g ${stableId}`,
    `usemtl ${materialName}`,
    ...positions,
    ...normals,
    ...faces,
    "",
  ];

  return {
    perObjectText: `${lines.join("\n")}\n`,
    vertexCount: position.count,
    faceCount,
    positions,
    normals,
    faces,
  };
}

function isMeshObject(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

export interface BuildSceneExportBundleOptions {
  sceneId: string;
  selection?: ExportSelectionScope;
  geometrySourceMode?: GeometrySourceMode;
}

export function buildSceneExportBundle(
  root: Object3D,
  options: BuildSceneExportBundleOptions,
): SceneExportBundle {
  const selection = options.selection ?? { mode: "taggedScene" };
  const geometrySourceMode = options.geometrySourceMode ?? "simulationMesh";
  const selectedEntries = collectSelectedSimulationObjects(root, selection);
  const assets: ExportedGeometryAsset[] = [];
  const files: PackageTextFile[] = [];
  const combinedLines: string[] = [];

  let globalVertexOffset = 0;
  let globalNormalOffset = 0;

  for (const entry of selectedEntries) {
    const candidate = geometrySourceMode === "simulationMesh"
      ? resolveSimulationMesh(entry.object)
      : entry.object;

    if (!isMeshObject(candidate)) {
      continue;
    }

    const geometryExport = exportMeshGeometry(candidate, entry.stableId, entry.metadata.radianceMaterial);
    const objectRelativePath = `geometry/objects/${entry.stableId}.obj`;
    files.push({
      relativePath: objectRelativePath,
      contents: geometryExport.perObjectText,
      sha256: hashString(geometryExport.perObjectText),
      contentType: "text/plain",
    });

    combinedLines.push(`o ${entry.stableId}`);
    combinedLines.push(`g ${entry.metadata.exportGroupId ?? entry.stableId}`);
    combinedLines.push(`usemtl ${entry.metadata.radianceMaterial}`);
    combinedLines.push(...geometryExport.positions);
    combinedLines.push(...geometryExport.normals);

    for (let faceIndex = 0; faceIndex < geometryExport.faceCount; faceIndex++) {
      const offset = faceIndex * 3;
      combinedLines.push(formatIndexedFace(
        [
          globalVertexOffset + offset + 1,
          globalVertexOffset + offset + 2,
          globalVertexOffset + offset + 3,
        ],
        [
          globalNormalOffset + offset + 1,
          globalNormalOffset + offset + 2,
          globalNormalOffset + offset + 3,
        ],
      ));
    }
    combinedLines.push("");

    assets.push({
      objectId: entry.stableId,
      stableId: entry.stableId,
      objectName: entry.object.name || entry.stableId,
      material: entry.metadata.radianceMaterial,
      objRelativePath: objectRelativePath,
      role: entry.metadata.simulationRole,
      hash: hashString(geometryExport.perObjectText),
      vertexCount: geometryExport.vertexCount,
      faceCount: geometryExport.faceCount,
      bounds: collectSimulationObjects(root, {
        mode: "selectedObjects",
        objectIds: [entry.stableId],
      })[0]?.bounds ?? {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
      },
    });

    globalVertexOffset += geometryExport.vertexCount;
    globalNormalOffset += geometryExport.vertexCount;
  }

  const combinedObjText = `${combinedLines.join("\n")}\n`;
  const combinedGeometryPath = "geometry/scene.obj";
  const geometryHash = hashString(combinedObjText);
  files.push({
    relativePath: combinedGeometryPath,
    contents: combinedObjText,
    sha256: geometryHash,
    contentType: "text/plain",
  });

  const manifest = buildSceneManifest({
    sceneId: options.sceneId,
    selection,
    geometrySourceMode,
    combinedGeometryPath,
    geometryHash,
    objects: collectSimulationObjects(root, selection),
    assets,
    exporterVersion: EXPORTER_VERSION,
  });

  return {
    sceneManifest: manifest,
    files,
  };
}
