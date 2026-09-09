// GPU-specific storage and WGSL are isolated here; CPU MeshBVH remains the reference.
const shader = `
struct Params { points:u32, directions:u32, words:u32, nodes:u32 }
@group(0) @binding(0) var<storage,read> triangles:array<vec4<f32>>;
@group(0) @binding(1) var<storage,read> nodes:array<vec4<f32>>;
@group(0) @binding(2) var<storage,read> points:array<vec4<f32>>;
@group(0) @binding(3) var<storage,read> directions:array<vec4<f32>>;
@group(0) @binding(4) var<storage,read_write> result:array<u32>;
@group(0) @binding(5) var<uniform> params:Params;
fn boxHit(o:vec3<f32>,d:vec3<f32>,lo:vec3<f32>,hi:vec3<f32>)->bool {
 var near=0.0; var far=1e20;
 for(var a=0u;a<3u;a++){if(abs(d[a])<1e-9){if(o[a]<lo[a]||o[a]>hi[a]){return false;}}else{let x=(lo[a]-o[a])/d[a];let y=(hi[a]-o[a])/d[a];near=max(near,min(x,y));far=min(far,max(x,y));}}
 return far>=near;
}
fn blocked(o:vec3<f32>,d:vec3<f32>)->bool {
 var n=0u;
 loop{if(n>=params.nodes){break;}let lo=nodes[n*3u];let hi=nodes[n*3u+1u];let escape=u32(nodes[n*3u+2u].x);
 if(!boxHit(o,d,lo.xyz,hi.xyz)){n=escape;continue;}
 let count=u32(hi.w);let start=u32(lo.w);
 for(var i=0u;i<count;i++){let a=triangles[(start+i)*3u].xyz;let e1=triangles[(start+i)*3u+1u].xyz-a;let e2=triangles[(start+i)*3u+2u].xyz-a;let h=cross(d,e2);let det=dot(e1,h);if(abs(det)<1e-8){continue;}let inv=1.0/det;let s=o-a;let u=inv*dot(s,h);if(u<0.0||u>1.0){continue;}let q=cross(s,e1);let v=inv*dot(d,q);if(v<0.0||u+v>1.0){continue;}if(inv*dot(e2,q)>1e-5){return true;}}
 n=n+1u;}
 return false;
}
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3<u32>){let index=id.x;if(index>=params.points*params.words){return;}let p=index/params.words;let word=index%params.words;var bits=0u;for(var k=0u;k<32u;k++){let j=word*32u+k;if(j<params.directions&&!blocked(points[p].xyz+vec3<f32>(0,0,1e-5),directions[j].xyz)){bits=bits|(1u<<k);}}result[index]=bits;}`;
export function packBvh(geometry) {
  if (!geometry) return { triangles: new Float32Array(4), nodes: new Float32Array(4), count: 0 };
  const pos = geometry.attributes.position,
    idx = geometry.index;
  const list = [];
  for (let i = 0; i < (idx ? idx.count : pos.count); i += 3) {
    const vertices = [];
    for (let k = 0; k < 3; k++) {
      const v = idx ? idx.getX(i + k) : i + k;
      vertices.push([pos.getX(v), pos.getY(v), pos.getZ(v)]);
    }
    list.push({
      vertices,
      center: [0, 1, 2].map((a) => vertices.reduce((n, v) => n + v[a], 0) / 3),
    });
  }
  const nodes = [],
    ordered = [];
  function build(items) {
    const index = nodes.length,
      lo = [Infinity, Infinity, Infinity],
      hi = [-Infinity, -Infinity, -Infinity];
    for (const t of items)
      for (const v of t.vertices)
        for (let a = 0; a < 3; a++) {
          lo[a] = Math.min(lo[a], v[a]);
          hi[a] = Math.max(hi[a], v[a]);
        }
    const node = { lo, hi, start: 0, count: 0, escape: 0 };
    nodes.push(node);
    if (items.length <= 8) {
      node.start = ordered.length;
      node.count = items.length;
      ordered.push(...items);
    } else {
      const axis = [0, 1, 2].sort((a, b) => hi[b] - lo[b] - (hi[a] - lo[a]))[0];
      items.sort((a, b) => a.center[axis] - b.center[axis]);
      const m = Math.floor(items.length / 2);
      build(items.slice(0, m));
      build(items.slice(m));
    }
    node.escape = nodes.length;
    return index;
  }
  build(list);
  return {
    triangles: Float32Array.from(ordered.flatMap((t) => t.vertices.flatMap((v) => [...v, 0]))),
    nodes: Float32Array.from(
      nodes.flatMap((n) => [...n.lo, n.start, ...n.hi, n.count, n.escape, 0, 0, 0]),
    ),
    count: nodes.length,
  };
}
export class WebGpuIrradianceEngine {
  static async create() {
    if (!globalThis.navigator?.gpu) throw Error('WebGPU unavailable');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw Error('No WebGPU adapter');
    const engine = new this();
    engine.device = await adapter.requestDevice();
    engine.device.lost.then(() => (engine.lost = true));
    engine.name = 'WebGPU BVH';
    const module = engine.device.createShaderModule({ code: shader });
    const info = await module.getCompilationInfo();
    if (info.messages.some((m) => m.type === 'error'))
      throw Error(
        info.messages
          .filter((m) => m.type === 'error')
          .map((m) => m.message)
          .join('; '),
      );
    engine.pipeline = await engine.device.createComputePipelineAsync({
      layout: 'auto',
      compute: { module, entryPoint: 'main' },
    });
    return engine;
  }
  buffer(data, usage = 128) {
    const b = this.device.createBuffer({
      size: Math.max(16, data.byteLength),
      usage: usage | 8,
      mappedAtCreation: true,
    });
    new Uint8Array(b.getMappedRange()).set(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    );
    b.unmap();
    return b;
  }
  async initializeGeometry(geometry) {
    this.geometryBuffers?.forEach((b) => b.destroy());
    const packed = packBvh(geometry);
    this.count = packed.count;
    this.geometryBuffers = [this.buffer(packed.triangles), this.buffer(packed.nodes)];
  }
  async visibility(points, directions) {
    if (this.lost) throw Error('WebGPU device lost');
    const words = Math.ceil(directions.length / 32),
      size = points.length * words * 4;
    if (size > this.device.limits.maxStorageBufferBindingSize)
      throw Error('GPU buffer capacity exceeded');
    const buffers = [
      ...this.geometryBuffers,
      this.buffer(Float32Array.from(points.flatMap((p) => [p.x, p.y, p.z, 0]))),
      this.buffer(Float32Array.from(directions.flatMap((p) => [p.x, p.y, p.z, 0]))),
    ];
    const output = this.device.createBuffer({ size: Math.max(16, size), usage: 128 | 4 });
    const params = this.buffer(
      new Uint32Array([points.length, directions.length, words, this.count]),
      64,
    );
    buffers.push(output, params);
    const read = this.device.createBuffer({ size: Math.max(16, size), usage: 1 | 8 });
    try {
      this.device.pushErrorScope('validation');
      const group = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
      });
      const encoder = this.device.createCommandEncoder(),
        pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, group);
      pass.dispatchWorkgroups(Math.ceil((points.length * words) / 64));
      pass.end();
      encoder.copyBufferToBuffer(output, 0, read, 0, size);
      this.device.queue.submit([encoder.finish()]);
      const error = await this.device.popErrorScope();
      if (error) throw Error(error.message);
      await read.mapAsync(1);
      return new Uint32Array(read.getMappedRange().slice(0, size));
    } finally {
      read.destroy();
      buffers.slice(2).forEach((b) => b.destroy());
    }
  }
  cancel() {
    this.dispose();
  }
  dispose() {
    this.geometryBuffers?.forEach((b) => b.destroy());
    this.device?.destroy();
  }
}
