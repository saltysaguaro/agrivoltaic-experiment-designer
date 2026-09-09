import * as THREE from "three";
import {
  DEFAULT_TILE_DIVISIONS_PER_ROW,
  MAX_GROUND_TILES,
} from "../utils/constants.js";

function createGrassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#6f9d63";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const noise = (Math.random() * 26) | 0;
    image.data[index] -= noise * 0.24;
    image.data[index + 1] -= noise * 0.14;
    image.data[index + 2] -= noise * 0.35;
  }
  ctx.putImageData(image, 0, 0);

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 4800; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#85b777" : "#4e7845";
    ctx.fillRect((Math.random() * canvas.width) | 0, (Math.random() * canvas.height) | 0, 1, 1);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function collectStops(length, step) {
  const stops = [0];
  let cursor = step;

  while (cursor < length - 1e-6) {
    stops.push(cursor);
    cursor += step;
  }

  if (length > 0) {
    const lastStop = stops[stops.length - 1];
    if (Math.abs(lastStop - length) > 1e-6) stops.push(length);
  }

  return stops;
}

function buildGridGeometry(width, depth, tileSize) {
  const positions = [];
  const xStops = collectStops(width, tileSize);
  const zStops = collectStops(depth, tileSize);
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  for (const xStop of xStops) {
    const x = xStop - halfWidth;
    positions.push(x, 0, -halfDepth, x, 0, halfDepth);
  }

  for (const zStop of zStops) {
    const z = zStop - halfDepth;
    positions.push(-halfWidth, 0, z, halfWidth, 0, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function getEffectiveTileSize(width, depth, requestedTileSize) {
  const safeRequested = Math.max(0.1, requestedTileSize);
  const widthDriven = width / MAX_GROUND_TILES;
  const depthDriven = depth / MAX_GROUND_TILES;
  return Math.max(safeRequested, widthDriven, depthDriven);
}

export class TileGrid {
  constructor() {
    this.group = new THREE.Group();
    this.showLines = false;
    this.baseTexture = createGrassTexture();
    this.baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
      map: this.baseTexture,
    });
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0x214f35,
      transparent: true,
      opacity: 0.72,
    });

    this.baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.baseMaterial);
    this.baseMesh.name = "ground-tile-field";
    this.baseMesh.userData.simulationKind = "inner_terrain";
    this.baseMesh.rotation.x = -Math.PI / 2;
    this.baseMesh.receiveShadow = true;
    this.baseMesh.renderOrder = 0;

    this.gridLines = new THREE.LineSegments(new THREE.BufferGeometry(), this.lineMaterial);
    this.gridLines.name = "ground-grid-lines";
    this.gridLines.userData.simulationKind = "ignore";
    this.gridLines.position.y = 0.018;
    this.gridLines.renderOrder = 2;
    this.gridLines.visible = false;

    this.group.add(this.baseMesh, this.gridLines);

    this.width = 1;
    this.depth = 1;
    this.tileSize = 1;
    this.rows = 1;
    this.cols = 1;
    this.originX = -0.5;
    this.originZ = -0.5;
  }

  update({ width, depth, tileSize }) {
    this.width = Math.max(0.1, width);
    this.depth = Math.max(0.1, depth);
    this.tileSize = getEffectiveTileSize(this.width, this.depth, tileSize);
    this.cols = Math.max(1, Math.ceil(this.width / this.tileSize));
    this.rows = Math.max(1, Math.ceil(this.depth / this.tileSize));
    this.originX = -this.width / 2;
    this.originZ = -this.depth / 2;

    this.baseMesh.scale.set(this.width, this.depth, 1);
    this.baseTexture.repeat.set(Math.max(1, this.width / 14), Math.max(1, this.depth / 14));

    const nextGeometry = buildGridGeometry(this.width, this.depth, this.tileSize);
    this.gridLines.geometry.dispose();
    this.gridLines.geometry = nextGeometry;
  }

  setGridVisible(visible) {
    this.gridLines.visible = this.showLines && visible;
  }

  getDescriptor() {
    return {
      rows: this.rows,
      cols: this.cols,
      tileSize: this.tileSize,
      width: this.width,
      depth: this.depth,
      groundSize: Math.max(this.width, this.depth),
      originX: this.originX,
      originZ: this.originZ,
      rowPitchTileCount: Math.max(1, Math.round(DEFAULT_TILE_DIVISIONS_PER_ROW)),
    };
  }

  worldToTile(x, z) {
    const maxX = this.originX + this.width;
    const maxZ = this.originZ + this.depth;
    if (x < this.originX || x > maxX || z < this.originZ || z > maxZ) return null;

    const col = Math.min(this.cols - 1, Math.floor((x - this.originX) / this.tileSize));
    const row = Math.min(this.rows - 1, Math.floor((z - this.originZ) / this.tileSize));
    return { row, col, index: row * this.cols + col };
  }

  tileToWorld(row, col) {
    const tileMinX = this.originX + col * this.tileSize;
    const tileMinZ = this.originZ + row * this.tileSize;
    const tileMaxX = Math.min(tileMinX + this.tileSize, this.originX + this.width);
    const tileMaxZ = Math.min(tileMinZ + this.tileSize, this.originZ + this.depth);

    return {
      x: (tileMinX + tileMaxX) / 2,
      z: (tileMinZ + tileMaxZ) / 2,
    };
  }
}
