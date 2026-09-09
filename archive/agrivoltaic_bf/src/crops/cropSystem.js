import * as THREE from "three";
import { CROP_LIBRARY } from "./cropCatalog.js";

const MAX_PLANTS = 6000;
const BED_HEIGHT_M = 0.045;

function clearGroup(group) {
  for (let index = group.children.length - 1; index >= 0; index--) {
    const child = group.children[index];
    group.remove(child);
    child.traverse?.((node) => {
      if (!node.geometry?.userData?.shared) {
        node.geometry?.dispose?.();
      }
    });
  }
}

function hashNoise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function makePartDefinitions(crop) {
  switch (crop.form) {
    case "rosette":
      return [
        { geometry: "capsule", color: crop.stemColor, position: [0, crop.heightM * 0.12, 0], scale: [crop.widthM * 0.05, crop.heightM * 0.18, crop.widthM * 0.05] },
        { geometry: "box", color: crop.foliageColor, position: [crop.widthM * 0.22, crop.heightM * 0.14, 0], scale: [crop.widthM * 0.58, crop.heightM * 0.07, crop.widthM * 0.12], rotation: [-0.55, 0.28, 0.52] },
        { geometry: "box", color: crop.foliageColor, position: [-crop.widthM * 0.2, crop.heightM * 0.16, crop.widthM * 0.04], scale: [crop.widthM * 0.62, crop.heightM * 0.07, crop.widthM * 0.12], rotation: [-0.42, -0.34, -0.58] },
        { geometry: "box", color: crop.foliageAccent, position: [0, crop.heightM * 0.15, crop.widthM * 0.22], scale: [crop.widthM * 0.54, crop.heightM * 0.06, crop.widthM * 0.12], rotation: [-0.48, 1.1, 0.04] },
        { geometry: "box", color: crop.foliageAccent, position: [0.02, crop.heightM * 0.13, -crop.widthM * 0.18], scale: [crop.widthM * 0.5, crop.heightM * 0.06, crop.widthM * 0.1], rotation: [-0.46, -1.04, -0.06] },
        { geometry: "sphere", color: crop.foliageAccent, position: [0, crop.heightM * 0.16, 0], scale: [crop.widthM * 0.34, crop.heightM * 0.12, crop.widthM * 0.34] },
      ];
    case "crown":
      return [
        { geometry: "capsule", color: crop.stemColor, position: [0, crop.heightM * 0.28, 0], scale: [crop.widthM * 0.08, crop.heightM * 0.42, crop.widthM * 0.08] },
        { geometry: "box", color: crop.foliageColor, position: [crop.widthM * 0.18, crop.heightM * 0.34, 0], scale: [crop.widthM * 0.54, crop.heightM * 0.06, crop.widthM * 0.12], rotation: [-0.62, 0.42, 0.46] },
        { geometry: "box", color: crop.foliageColor, position: [-crop.widthM * 0.16, crop.heightM * 0.34, 0], scale: [crop.widthM * 0.56, crop.heightM * 0.06, crop.widthM * 0.12], rotation: [-0.6, -0.42, -0.46] },
        { geometry: "box", color: crop.foliageAccent, position: [0, crop.heightM * 0.38, crop.widthM * 0.18], scale: [crop.widthM * 0.58, crop.heightM * 0.06, crop.widthM * 0.12], rotation: [-0.56, 1.2, 0.08] },
        { geometry: "box", color: crop.foliageAccent, position: [0, crop.heightM * 0.38, -crop.widthM * 0.18], scale: [crop.widthM * 0.58, crop.heightM * 0.06, crop.widthM * 0.12], rotation: [-0.56, -1.2, -0.08] },
        { geometry: "sphere", color: crop.foliageColor, position: [0, crop.heightM * 0.72, 0], scale: [crop.widthM * 0.8, crop.heightM * 0.44, crop.widthM * 0.8] },
        { geometry: "sphere", color: crop.produceColor, position: [0, crop.heightM * 0.86, 0], scale: [crop.widthM * 0.42, crop.heightM * 0.18, crop.widthM * 0.42] },
      ];
    case "stalk":
      return [
        { geometry: "cylinder", color: crop.stemColor, position: [0, crop.heightM * 0.5, 0], scale: [crop.widthM * 0.15, crop.heightM, crop.widthM * 0.15] },
        { geometry: "box", color: crop.foliageColor, position: [crop.widthM * 0.2, crop.heightM * 0.34, 0], scale: [crop.widthM * 1.05, crop.heightM * 0.03, crop.widthM * 0.1], rotation: [0.18, 0.2, 0.76] },
        { geometry: "box", color: crop.foliageAccent, position: [-crop.widthM * 0.22, crop.heightM * 0.48, crop.widthM * 0.02], scale: [crop.widthM * 1.2, crop.heightM * 0.03, crop.widthM * 0.1], rotation: [-0.08, -0.18, -0.72] },
        { geometry: "box", color: crop.foliageColor, position: [crop.widthM * 0.24, crop.heightM * 0.62, -crop.widthM * 0.04], scale: [crop.widthM * 1.1, crop.heightM * 0.03, crop.widthM * 0.1], rotation: [0.12, 0.24, 0.92] },
        { geometry: "box", color: crop.foliageAccent, position: [-crop.widthM * 0.18, crop.heightM * 0.76, 0], scale: [crop.widthM * 1.05, crop.heightM * 0.03, crop.widthM * 0.1], rotation: [-0.22, -0.24, -0.94] },
        { geometry: "cone", color: crop.produceColor, position: [0, crop.heightM * 0.95, 0], scale: [crop.widthM * 0.16, crop.heightM * 0.12, crop.widthM * 0.16] },
      ];
    case "tuft":
      return [
        { geometry: "box", color: crop.foliageColor, position: [crop.widthM * 0.06, crop.heightM * 0.46, 0], scale: [crop.widthM * 0.12, crop.heightM * 0.88, crop.widthM * 0.08], rotation: [0.16, 0.22, 0.18] },
        { geometry: "box", color: crop.foliageColor, position: [-crop.widthM * 0.06, crop.heightM * 0.52, 0.01], scale: [crop.widthM * 0.12, crop.heightM * 0.92, crop.widthM * 0.08], rotation: [-0.14, -0.24, -0.14] },
        { geometry: "box", color: crop.foliageAccent, position: [0, crop.heightM * 0.5, crop.widthM * 0.04], scale: [crop.widthM * 0.1, crop.heightM * 0.84, crop.widthM * 0.08], rotation: [0.08, 0.92, 0.12] },
        { geometry: "box", color: crop.foliageAccent, position: [0, crop.heightM * 0.48, -crop.widthM * 0.04], scale: [crop.widthM * 0.1, crop.heightM * 0.82, crop.widthM * 0.08], rotation: [-0.08, -0.92, -0.12] },
        { geometry: "sphere", color: crop.produceColor, position: [0, crop.heightM * 0.92, 0], scale: [crop.widthM * 0.16, crop.heightM * 0.14, crop.widthM * 0.16] },
      ];
    case "low-mound":
      return [
        { geometry: "capsule", color: crop.stemColor, position: [0, crop.heightM * 0.14, 0], scale: [crop.widthM * 0.05, crop.heightM * 0.18, crop.widthM * 0.05] },
        { geometry: "sphere", color: crop.foliageColor, position: [-crop.widthM * 0.12, crop.heightM * 0.28, 0], scale: [crop.widthM * 0.56, crop.heightM * 0.42, crop.widthM * 0.56] },
        { geometry: "sphere", color: crop.foliageColor, position: [crop.widthM * 0.12, crop.heightM * 0.28, 0.02], scale: [crop.widthM * 0.56, crop.heightM * 0.42, crop.widthM * 0.56] },
        { geometry: "sphere", color: crop.foliageAccent, position: [0, crop.heightM * 0.2, -0.02], scale: [crop.widthM * 0.6, crop.heightM * 0.2, crop.widthM * 0.6] },
        { geometry: "sphere", color: crop.produceColor, position: [0, crop.heightM * 0.18, crop.widthM * 0.08], scale: [crop.widthM * 0.12, crop.heightM * 0.1, crop.widthM * 0.12] },
      ];
    case "bush":
    default:
      return [
        { geometry: "capsule", color: crop.stemColor, position: [0, crop.heightM * 0.28, 0], scale: [crop.widthM * 0.08, crop.heightM * 0.44, crop.widthM * 0.08] },
        { geometry: "sphere", color: crop.foliageColor, position: [-crop.widthM * 0.14, crop.heightM * 0.42, 0], scale: [crop.widthM * 0.58, crop.heightM * 0.42, crop.widthM * 0.58] },
        { geometry: "sphere", color: crop.foliageColor, position: [crop.widthM * 0.14, crop.heightM * 0.46, 0.02], scale: [crop.widthM * 0.56, crop.heightM * 0.4, crop.widthM * 0.56] },
        { geometry: "sphere", color: crop.foliageAccent, position: [0, crop.heightM * 0.68, crop.widthM * 0.02], scale: [crop.widthM * 0.62, crop.heightM * 0.22, crop.widthM * 0.62] },
        { geometry: "sphere", color: crop.produceColor, position: [-crop.widthM * 0.18, crop.heightM * 0.34, crop.widthM * 0.12], scale: [crop.widthM * 0.14, crop.widthM * 0.14, crop.widthM * 0.14] },
        { geometry: "sphere", color: crop.produceColor, position: [crop.widthM * 0.1, crop.heightM * 0.42, -crop.widthM * 0.08], scale: [crop.widthM * 0.13, crop.widthM * 0.13, crop.widthM * 0.13] },
      ];
  }
}

function spacingInchesToMeters(value) {
  return value * 0.0254;
}

function computeBedCenters(start, end, bedCount) {
  if (bedCount <= 0 || end <= start) return [];
  const width = end - start;
  return Array.from({ length: bedCount }, (_, index) => {
    return start + ((index + 0.5) / bedCount) * width;
  });
}

function fitCropBeds(cropRow, crop, requestedBeds) {
  if (cropRow.width <= 0) return [];
  const minUsableWidth = crop.widthM * 1.05;
  if (cropRow.width < minUsableWidth) return [];

  const maxBedsByPitch = Math.max(1, Math.floor(cropRow.width / crop.bedPitchM));
  const bedCount = Math.max(0, Math.min(requestedBeds, maxBedsByPitch));
  if (!bedCount) return [];

  const start = cropRow.orientation === "z"
    ? cropRow.centerX - cropRow.width / 2
    : cropRow.centerZ - cropRow.width / 2;
  const end = start + cropRow.width;
  return computeBedCenters(start, end, bedCount);
}

export class CropSystem {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = "crop-system";
    this.materials = new Map();
    this.geometries = {
      capsule: new THREE.CapsuleGeometry(0.5, 1, 4, 8),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
      sphere: new THREE.SphereGeometry(0.5, 10, 10),
      cone: new THREE.ConeGeometry(0.5, 1, 8),
      box: new THREE.BoxGeometry(1, 1, 1),
    };
    for (const geometry of Object.values(this.geometries)) {
      geometry.userData.shared = true;
    }
    this.bedMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a6846,
      roughness: 0.96,
      metalness: 0,
    });
    this.bedHighlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xa47b4f,
      roughness: 0.84,
      metalness: 0,
    });
    this.zoneLineMaterial = new THREE.LineBasicMaterial({
      color: 0x5d7d44,
      transparent: true,
      opacity: 0.82,
    });
    scene.add(this.group);
  }

  getMaterial(color) {
    if (!this.materials.has(color)) {
      this.materials.set(color, new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        metalness: 0.04,
      }));
    }
    return this.materials.get(color);
  }

  update(state, sceneSummary) {
    clearGroup(this.group);

    const cropRows = sceneSummary?.layout?.cropRows || [];
    const crop = CROP_LIBRARY[state.cropType] || CROP_LIBRARY.tomato;
    const requestedBedsPerRow = cropRows[0]?.bedCountOverride ?? state.cropBedsPerRow;
    const cropSummary = {
      cropRowWidth: 0,
      interRowGap: 0,
      cropRowsAvailable: 0,
      cropBedsPerRow: requestedBedsPerRow,
      plantedBedsPerRow: 0,
      cropLabel: crop.label,
      plantCount: 0,
      bedConstraintActive: false,
      mode: cropRows[0]?.mode || "inter-row",
    };

    if (!sceneSummary || !cropRows.length) return cropSummary;

    const spacingM = spacingInchesToMeters(state.plantSpacingIn);
    const positions = [];
    const rowLayouts = [];
    let totalPotentialPlants = 0;

    for (const cropRow of cropRows) {
      cropSummary.interRowGap = Math.max(cropSummary.interRowGap, cropRow.interRowGap);
      cropSummary.cropRowWidth = Math.max(cropSummary.cropRowWidth, cropRow.width);
      const bedTarget = cropRow.bedCountOverride ?? state.cropBedsPerRow;
      const bedCenters = fitCropBeds(cropRow, crop, bedTarget);
      if (cropRow.width <= 0 || !bedCenters.length) {
        if (cropRow.width > 0 && bedTarget > 0) {
          cropSummary.bedConstraintActive = true;
        }
        continue;
      }

      cropSummary.cropRowsAvailable += 1;
      cropSummary.cropBedsPerRow = Math.max(cropSummary.cropBedsPerRow, bedTarget);
      cropSummary.plantedBedsPerRow = Math.max(cropSummary.plantedBedsPerRow, bedCenters.length);
      cropSummary.bedConstraintActive ||= bedCenters.length < bedTarget;
      this.group.add(this.createCropZoneOutline(cropRow));
      for (const bed of this.createCropBedStrips(cropRow, bedCenters)) this.group.add(bed);

      const alongMargin = Math.max(0.4, crop.widthM * 0.55);
      const alongLength = Math.max(0, cropRow.alongLength - (2 * alongMargin));
      const nominalCount = alongLength <= 0 ? 1 : Math.floor(alongLength / spacingM) + 1;
      const sampleCount = Math.max(1, nominalCount);
      totalPotentialPlants += bedCenters.length * sampleCount;
      rowLayouts.push({ cropRow, bedCenters, alongMargin, alongLength, sampleCount });
    }

    const sampleEvery = Math.max(1, Math.ceil(totalPotentialPlants / MAX_PLANTS));
    let candidateIndex = 0;

    for (const rowLayout of rowLayouts) {
      for (const bedCenter of rowLayout.bedCenters) {
        for (let index = 0; index < rowLayout.sampleCount; index++) {
          const shouldPlace = candidateIndex % sampleEvery === 0;
          if (shouldPlace) {
            const t = rowLayout.sampleCount === 1 ? 0.5 : index / (rowLayout.sampleCount - 1);
            const along = rowLayout.cropRow.alongStart + rowLayout.alongMargin + (rowLayout.alongLength * t);
            if (rowLayout.cropRow.orientation === "z") {
              positions.push({ x: bedCenter, z: along, y: BED_HEIGHT_M, seed: candidateIndex + (rowLayout.cropRow.index * 97) });
            } else {
              positions.push({ x: along, z: bedCenter, y: BED_HEIGHT_M, seed: candidateIndex + (rowLayout.cropRow.index * 97) });
            }
          }
          candidateIndex += 1;
          if (positions.length >= MAX_PLANTS) break;
        }
        if (positions.length >= MAX_PLANTS) break;
      }
      if (positions.length >= MAX_PLANTS) break;
    }

    cropSummary.plantCount = positions.length;
    if (!positions.length) return cropSummary;

    const parts = makePartDefinitions(crop);
    const dummy = new THREE.Object3D();
    const partTransforms = parts.map((part) => {
      const object = new THREE.Object3D();
      object.position.fromArray(part.position);
      object.scale.fromArray(part.scale);
      if (part.rotation) object.rotation.set(...part.rotation);
      object.updateMatrix();
      return object.matrix.clone();
    });

    parts.forEach((part, partIndex) => {
      const mesh = new THREE.InstancedMesh(
        this.geometries[part.geometry],
        this.getMaterial(part.color),
        positions.length
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      for (let index = 0; index < positions.length; index++) {
        const plant = positions[index];
        const variation = 0.88 + (hashNoise(plant.seed) * 0.26);
        const yaw = hashNoise(plant.seed + 13.37) * Math.PI * 2;
        const leanX = (hashNoise(plant.seed + 2.14) - 0.5) * 0.1;
        const leanZ = (hashNoise(plant.seed + 5.71) - 0.5) * 0.1;
        dummy.position.set(plant.x, plant.y, plant.z);
        dummy.rotation.set(leanX, yaw, leanZ);
        dummy.scale.setScalar(variation);
        dummy.updateMatrix();
        dummy.matrix.multiply(partTransforms[partIndex]);
        mesh.setMatrixAt(index, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      this.group.add(mesh);
    });

    return cropSummary;
  }

  createCropZoneOutline(cropRow) {
    const halfWidth = cropRow.orientation === "z" ? cropRow.width / 2 : cropRow.alongLength / 2;
    const halfDepth = cropRow.orientation === "z" ? cropRow.alongLength / 2 : cropRow.width / 2;
    const points = [
      new THREE.Vector3(-halfWidth, 0, -halfDepth),
      new THREE.Vector3(halfWidth, 0, -halfDepth),
      new THREE.Vector3(halfWidth, 0, halfDepth),
      new THREE.Vector3(-halfWidth, 0, halfDepth),
    ];
    const outline = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), this.zoneLineMaterial);
    outline.position.set(cropRow.centerX, BED_HEIGHT_M + 0.01, cropRow.centerZ);
    return outline;
  }

  createCropBedStrips(cropRow, bedCenters) {
    return bedCenters.map((bedCenter) => {
      const stripSpan = cropRow.width / Math.max(3, bedCenters.length * 1.6);
      const width = cropRow.orientation === "z" ? Math.max(stripSpan, 0.16) : cropRow.alongLength;
      const depth = cropRow.orientation === "z" ? cropRow.alongLength : Math.max(stripSpan, 0.16);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(width, BED_HEIGHT_M, depth), this.bedMaterial);
      strip.name = "crop-bed";
      strip.userData.simulationKind = "crop_bed";
      strip.castShadow = true;
      strip.receiveShadow = true;
      strip.position.set(
        cropRow.orientation === "z" ? bedCenter : cropRow.centerX,
        BED_HEIGHT_M / 2,
        cropRow.orientation === "z" ? cropRow.centerZ : bedCenter
      );
      const highlight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, BED_HEIGHT_M * 0.18, depth * 0.82), this.bedHighlightMaterial);
      highlight.position.y = BED_HEIGHT_M * 0.22;
      strip.add(highlight);
      return strip;
    });
  }
}
