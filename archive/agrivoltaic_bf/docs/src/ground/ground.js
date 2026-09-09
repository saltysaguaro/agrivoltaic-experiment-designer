import * as THREE from "three";
import { TileGrid } from "./tileGrid.js";
import { HeatmapOverlay } from "./heatmapOverlay.js";
import { DEFAULT_TILE_DIVISIONS_PER_ROW } from "../utils/constants.js";

const NORTH_ARROW_GAP_M = 3.048;
const NORTH_ARROW_COLOR = 0x214f35;
const NORTH_ARROW_LABEL_OFFSET = 0.74;

function createNorthLabelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(248, 247, 242, 0.92)";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 94, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(32, 72, 50, 0.2)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 94, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `#${NORTH_ARROW_COLOR.toString(16).padStart(6, "0")}`;
  ctx.font = '700 148px "Manrope", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", canvas.width / 2, canvas.height / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export class GroundSystem {
  constructor(scene) {
    this.tileGrid = new TileGrid();
    this.heatmap = new HeatmapOverlay(this.tileGrid);
    this.group = this.tileGrid.group;
    this.contextGroup = new THREE.Group();
    this.contextPads = [];
    this.contextMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8b289,
      roughness: 1,
      metalness: 0,
    });
    this.northArrowMaterial = new THREE.MeshStandardMaterial({
      color: NORTH_ARROW_COLOR,
      roughness: 0.74,
      metalness: 0.08,
    });
    this.northArrowLabelMaterial = new THREE.MeshBasicMaterial({
      map: createNorthLabelTexture(),
      transparent: true,
      depthWrite: false,
    });
    this.northArrowGroup = new THREE.Group();
    this.northArrowGroup.name = "ground-north-arrow";
    this.northArrowGroup.visible = false;

    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), this.northArrowLabelMaterial);
    label.name = "ground-north-arrow-label";
    label.userData.simulationKind = "north_marker";
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.03, -NORTH_ARROW_LABEL_OFFSET);
    label.renderOrder = 4;
    label.castShadow = false;
    label.receiveShadow = false;
    this.northArrowGroup.add(label);

    for (let index = 0; index < 4; index++) {
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.contextMaterial);
      pad.name = `ground-context-pad-${index + 1}`;
      pad.userData.simulationKind = "outer_terrain";
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0;
      pad.receiveShadow = true;
      pad.renderOrder = 0;
      this.contextGroup.add(pad);
      this.contextPads.push(pad);
    }

    this.group.add(this.contextGroup);
    this.contextGroup.add(this.northArrowGroup);
    this.group.add(this.heatmap.mesh);
    scene.add(this.group);
  }

  updateFromState(state, summary = null) {
    const tileSize = state.groundTileSize > 0
      ? state.groundTileSize
      : state.rowSpacing / DEFAULT_TILE_DIVISIONS_PER_ROW;
    const innerWidth = summary
      ? Math.min(state.groundSize, summary.arrayW + (2 * state.arrayEdgeBuffer))
      : state.groundSize;
    const innerDepth = summary
      ? Math.min(state.groundSize, summary.arrayD + (2 * state.arrayEdgeBuffer))
      : state.groundSize;

    this.tileGrid.update({
      width: innerWidth,
      depth: innerDepth,
      tileSize,
    });
    this.updateContextPads(state, summary);
    this.heatmap.syncToTileGrid();
    if (state.showHeatmap !== "on") {
      this.heatmap.material.opacity = 0;
      this.heatmap.mesh.visible = false;
    }
  }

  updateContextPads(state, summary) {
    if (!summary) {
      for (const pad of this.contextPads) pad.visible = false;
      this.northArrowGroup.visible = false;
      return;
    }

    const innerWidth = Math.min(state.groundSize, summary.arrayW + (2 * state.arrayEdgeBuffer));
    const innerDepth = Math.min(state.groundSize, summary.arrayD + (2 * state.arrayEdgeBuffer));
    const halfGround = state.groundSize / 2;
    const halfInnerWidth = innerWidth / 2;
    const halfInnerDepth = innerDepth / 2;

    const pads = [
      { width: state.groundSize, depth: Math.max(0, halfGround - halfInnerDepth), x: 0, z: -(halfInnerDepth + Math.max(0, halfGround - halfInnerDepth) / 2) },
      { width: state.groundSize, depth: Math.max(0, halfGround - halfInnerDepth), x: 0, z: halfInnerDepth + Math.max(0, halfGround - halfInnerDepth) / 2 },
      { width: Math.max(0, halfGround - halfInnerWidth), depth: innerDepth, x: -(halfInnerWidth + Math.max(0, halfGround - halfInnerWidth) / 2), z: 0 },
      { width: Math.max(0, halfGround - halfInnerWidth), depth: innerDepth, x: halfInnerWidth + Math.max(0, halfGround - halfInnerWidth) / 2, z: 0 },
    ];

    for (let index = 0; index < this.contextPads.length; index++) {
      const pad = this.contextPads[index];
      const config = pads[index];
      const visible = config.width > 0.01 && config.depth > 0.01;
      pad.visible = visible;
      if (!visible) continue;
      pad.scale.set(config.width, config.depth, 1);
      pad.position.set(config.x, 0, config.z);
    }

    this.updateNorthArrow(state, {
      innerWidth,
      innerDepth,
      halfGround,
    });
  }

  updateNorthArrow(state, { innerWidth, innerDepth, halfGround }) {
    const northPadDepth = Math.max(0, halfGround - (innerDepth / 2));
    const availableDepth = northPadDepth - NORTH_ARROW_GAP_M;
    const minimumDepth = 1.8;
    if (availableDepth < minimumDepth) {
      this.northArrowGroup.visible = false;
      return;
    }

    const arrowLength = Math.min(
      Math.max(2.8, availableDepth * 0.52),
      Math.max(3.6, Math.min(8, innerWidth * 0.18)),
    );
    const arrowScale = arrowLength;
    const labelCenterZ = (innerDepth / 2) + NORTH_ARROW_GAP_M + (NORTH_ARROW_LABEL_OFFSET * arrowScale);

    this.northArrowGroup.visible = true;
    this.northArrowGroup.scale.setScalar(arrowScale);
    this.northArrowGroup.position.set(0, 0, labelCenterZ);
  }

  getTileDescriptor() {
    return this.tileGrid.getDescriptor();
  }

  worldToTile(x, z) {
    return this.tileGrid.worldToTile(x, z);
  }

  tileToWorld(row, col) {
    return this.tileGrid.tileToWorld(row, col);
  }

  setGridVisible(visible) {
    this.tileGrid.setGridVisible(visible);
  }
}
