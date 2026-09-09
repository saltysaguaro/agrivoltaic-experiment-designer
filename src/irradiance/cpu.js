import { MeshBVH } from 'three-mesh-bvh';
import { Ray, DoubleSide } from 'three';
export class CpuBvhIrradianceEngine {
  constructor() {
    this.name = 'CPU MeshBVH';
    this.ray = new Ray();
  }
  async initializeGeometry(geometry) {
    this.bvh = geometry ? new MeshBVH(geometry) : null;
  }
  async visibility(points, directions) {
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
  cancel() {}
  dispose() {
    this.bvh = null;
  }
}
