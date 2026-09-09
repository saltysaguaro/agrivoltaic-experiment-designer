import * as THREE from "three";
import { samplePalette } from "../utils/colors.js";
import { clamp } from "../utils/math.js";

function normalizeGridData(data, rows, cols) {
  if (!data) return new Array(rows * cols).fill(null);

  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data.flat();
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.values)) return data.values;

  return new Array(rows * cols).fill(null);
}

export class HeatmapOverlay {
  constructor(tileGrid) {
    this.tileGrid = tileGrid;
    this.palette = "sunrise";
    this.range = { min: 0, max: 1000 };
    this.values = [];

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.024;
    this.mesh.renderOrder = 4;
    this.mesh.visible = false;
  }

  syncToTileGrid() {
    const descriptor = this.tileGrid.getDescriptor();
    this.canvas.width = descriptor.cols;
    this.canvas.height = descriptor.rows;
    this.mesh.scale.set(descriptor.width, descriptor.depth, 1);
    this.mesh.position.set(
      descriptor.originX + descriptor.width / 2,
      0.024,
      descriptor.originZ + descriptor.depth / 2
    );
    this.texture.needsUpdate = true;
    this.mesh.visible = this.material.opacity > 0;
    if (this.values.length) this.redraw();
  }

  setColorScale(min, max, palette = "sunrise") {
    this.range = { min, max };
    this.palette = palette;
    if (this.values.length) this.redraw();
  }

  setTileValues(data) {
    const descriptor = this.tileGrid.getDescriptor();
    this.values = normalizeGridData(data, descriptor.rows, descriptor.cols);
    if (data?.meta?.min !== undefined && data?.meta?.max !== undefined) {
      this.range = { min: data.meta.min, max: data.meta.max };
    }
    if (data?.meta?.palette) this.palette = data.meta.palette;
    this.redraw();
  }

  clearTileValues() {
    this.values = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.material.opacity = 0;
    this.mesh.visible = false;
    this.texture.needsUpdate = true;
  }

  redraw() {
    if (!this.canvas.width || !this.canvas.height) return;

    const { min, max } = this.range;
    const image = this.ctx.createImageData(this.canvas.width, this.canvas.height);

    for (let row = 0; row < this.canvas.height; row++) {
      for (let col = 0; col < this.canvas.width; col++) {
        const sourceIndex = row * this.canvas.width + col;
        const value = this.values[sourceIndex];
        const alpha = value == null ? 0 : 0.7;
        const t = value == null ? 0 : clamp((value - min) / Math.max(1e-6, max - min), 0, 1);
        const css = samplePalette(this.palette, t, alpha);
        const match = css.match(/rgba\(([^)]+)\)/);
        if (!match) continue;
        const [r, g, b, a] = match[1].split(",").map(Number);
        const targetIndex = ((this.canvas.height - row - 1) * this.canvas.width + col) * 4;
        image.data[targetIndex] = r;
        image.data[targetIndex + 1] = g;
        image.data[targetIndex + 2] = b;
        image.data[targetIndex + 3] = Math.round((a ?? alpha) * 255);
      }
    }

    this.ctx.putImageData(image, 0, 0);
    this.material.opacity = 0.85;
    this.mesh.visible = true;
    this.texture.needsUpdate = true;
  }

  worldToTile(x, z) {
    return this.tileGrid.worldToTile(x, z);
  }

  tileToWorld(row, col) {
    return this.tileGrid.tileToWorld(row, col);
  }
}
