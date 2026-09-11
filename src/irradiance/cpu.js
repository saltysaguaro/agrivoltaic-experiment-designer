import { moduleIntersections } from './module-bvh.js';
import { MeshBVH } from 'three-mesh-bvh';
import { Ray, DoubleSide } from 'three';
export class CpuBvhIrradianceEngine {
  constructor() {
    this.name = 'CPU MeshBVH';
    this.ray = new Ray();
  }
  async initializeGeometry(geometry) {
    this.bvh = geometry?.attributes.position.count ? new MeshBVH(geometry) : null;
    this.modules = geometry?.userData.moduleBvh;
  }
  async visibility(points, directions) {
    if (this.modules) return this.transmissionCounts(points, directions);
    const words = Math.ceil(directions.length / 32),
      bits = new Uint32Array(points.length * words);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      this.ray.origin.set(p.x, p.y, p.z + 1e-5);
      for (let j = 0; j < directions.length; j++) {
        this.ray.direction.copy(directions[j]);
        if (!this.bvh || !this.bvh.raycastFirst(this.ray, DoubleSide, 1e-5, Infinity))
          bits[i * words + (j >>> 5)] |= 1 << (j & 31);
      }
    }
    return bits;
  }
  async transmissionCounts(points, directions) {
    const counts = new Uint16Array(points.length * directions.length);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      this.ray.origin.set(p.x, p.y, p.z + 1e-5);
      for (let j = 0; j < directions.length; j++) {
        this.ray.direction.copy(directions[j]);
        counts[i * directions.length + j] = this.bvh?.raycastFirst(
          this.ray,
          DoubleSide,
          1e-5,
          Infinity,
        )
          ? 65535
          : moduleIntersections(this.modules, this.ray.origin, this.ray.direction);
      }
    }
    return counts;
  }
  cancel() {}
  dispose() {
    this.bvh = null;
  }
}
