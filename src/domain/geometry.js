import { receiverSpec, cellLocal } from './receiver-grid.js';
import { moduleOptics } from './optics.js';
import { packModuleBvh } from '../irradiance/module-bvh.js';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { dimensions } from './study.js';
export const rad = (d) => (d * Math.PI) / 180;
export function axes(s) {
  const a = rad(s.array.azimuth);
  return {
    u: new THREE.Vector3(-Math.cos(a), Math.sin(a), 0),
    v: new THREE.Vector3(-Math.sin(a), -Math.cos(a), 0),
  };
}
export function localToWorld(s, x, y, z = 0) {
  const { u, v } = axes(s);
  return u
    .multiplyScalar(x)
    .addScaledVector(v, y)
    .add(new THREE.Vector3(0, 0, z));
}
export function worldToLocal(s, x, y) {
  const { u, v } = axes(s);
  return { x: x * u.x + y * u.y, y: x * v.x + y * v.y };
}
export function getPose(s, sun = null, quantize = false) {
  let tilt = s.racking.type === 'vertical' ? 90 : s.racking.type === 'pergola' ? 0 : s.racking.tilt,
    yaw = 0;
  const { u, v } = axes(s);
  if (sun && s.racking.type === 'single-axis') {
    tilt = (Math.atan2(-sun.dot(v), sun.z) * 180) / Math.PI;
    if (s.racking.backtracking) {
      const ratio = s.rowPair.pitch / dimensions(s).width;
      const cos = ratio * Math.cos(rad(tilt));
      if (cos < 1) tilt -= (Math.sign(tilt) * Math.acos(Math.max(0, cos)) * 180) / Math.PI;
    }
    tilt = Math.max(-s.racking.limit, Math.min(s.racking.limit, tilt));
  }
  if (sun && s.racking.type === 'dual-axis') {
    tilt = Math.min(s.racking.limit, (Math.acos(Math.max(0, sun.z)) * 180) / Math.PI);
    yaw = (Math.atan2(sun.dot(u), -sun.dot(v)) * 180) / Math.PI;
  }
  if (quantize && ['single-axis', 'dual-axis'].includes(s.racking.type)) {
    const bin = typeof quantize === 'number' ? quantize : 2;
    tilt = Math.round(tilt / bin) * bin;
    tilt = Math.max(
      s.racking.type === 'dual-axis' ? 0 : -s.racking.limit,
      Math.min(s.racking.limit, tilt),
    );
    yaw = Math.round(yaw / bin) * bin;
  }
  return { tilt, yaw, key: `${tilt.toFixed(4)}:${yaw.toFixed(4)}` };
}
export function createModuleMaterial(s, scope, textures = true) {
  const moduleMaterial = new THREE.MeshStandardMaterial({
    color: 0x315f69,
    metalness: 0.3,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  if (textures && (scope === 'module' || s.racking.type === 'vertical') && s.module.bifacial) {
    const o = moduleOptics(s.module),
      w = 512,
      h = 1024,
      data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const u = (x + 0.5) / w,
          v = (y + 0.5) / h;
        const px = (s.table.orientation === 'portrait' ? u : v) * s.module.width;
        const py = (s.table.orientation === 'portrait' ? v : u) * s.module.length;
        const frame =
          px < o.margin ||
          px > s.module.width - o.margin ||
          py < o.margin ||
          py > s.module.length - o.margin;
        const gap =
          !frame &&
          ((px - o.margin) % (o.cellWidth + o.gapX) > o.cellWidth ||
            (py - o.margin) % (o.cellLength + o.gapY) > o.cellLength);
        const c = frame ? [105, 115, 120] : gap ? [196, 225, 224] : [38, 72, 96];
        data.set([...c, 255], (y * w + x) * 4);
      }
    const texture = new THREE.DataTexture(data, w, h);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    moduleMaterial.map = texture;
    moduleMaterial.color.set(0xffffff);
  }
  return moduleMaterial;
}
export function buildGeometry(s, scope = 'array', pose = getPose(s), { textures = true } = {}) {
  const d = dimensions(s),
    { u, v } = axes(s),
    up = new THREE.Vector3(0, 0, 1);
  const group = new THREE.Group();
  const rowCount =
    scope === 'pair'
      ? 2
      : ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(scope)
        ? s.array.rows
        : 1;
  const simple = scope === 'module' || scope === 'racking';
  const high = simple ? 1 : s.table.high,
    wide = simple ? 1 : s.table.wide,
    tables = simple ? 1 : s.row.tables;
  const width = high * d.cross + (high - 1) * s.module.gap,
    tableLength = wide * d.along + (wide - 1) * s.module.gap,
    rowLength = tables * tableLength + (tables - 1) * s.row.tableGap,
    stagger = rowCount > 1 ? d.stagger : 0,
    length = rowLength + stagger;
  const yaw = rad(pose.yaw),
    pu = u.clone().multiplyScalar(Math.cos(yaw)).addScaledVector(v, Math.sin(yaw)),
    pv = v.clone().multiplyScalar(Math.cos(yaw)).addScaledVector(u, -Math.sin(yaw));
  const cv = pv
      .clone()
      .multiplyScalar(Math.cos(rad(pose.tilt)))
      .addScaledVector(up, Math.sin(rad(pose.tilt))),
    normal = new THREE.Vector3().crossVectors(pu, cv).normalize();
  const rotation = new THREE.Matrix4().makeBasis(pu, cv, normal);
  const moduleMaterial = createModuleMaterial(s, scope, textures);
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x87968f,
    metalness: 0.5,
    roughness: 0.5,
  });
  const geometries = new Map();
  function box(size, position, rot, kind) {
    const key = size.join(':');
    if (!geometries.has(key)) geometries.set(key, new THREE.BoxGeometry(...size));
    const g = geometries.get(key),
      mesh = new THREE.Mesh(g, kind === 'module' ? moduleMaterial : steelMaterial);
    if (rot) mesh.setRotationFromMatrix(rot);
    mesh.position.copy(position);
    mesh.userData.kind = kind;
    group.add(mesh);
  }
  const rowOffsets = Array.from(
    { length: rowCount },
    (_, i) => i * s.rowPair.pitch + Math.floor(i / s.array.groupSize) * s.array.aisle,
  );
  const span = rowOffsets.at(-1) || 0;
  for (let r = 0; r < rowCount; r++) {
    const cy = rowOffsets[r] - span / 2;
    const rowShift = ((r % 2) - 0.5) * stagger;
    const columnCenters = [];
    for (let t = 0; t < tables; t++) {
      const cx = -rowLength / 2 + tableLength / 2 + t * (tableLength + s.row.tableGap) + rowShift;
      const center = localToWorld(s, cx, cy, scope === 'module' ? 0 : s.racking.height);
      for (let i = 0; i < wide; i++)
        columnCenters.push(cx - tableLength / 2 + d.along / 2 + i * (d.along + s.module.gap));
      for (let j = 0; j < high; j++)
        for (let i = 0; i < wide; i++) {
          const p = center
            .clone()
            .addScaledVector(pu, -tableLength / 2 + d.along / 2 + i * (d.along + s.module.gap))
            .addScaledVector(cv, -width / 2 + d.cross / 2 + j * (d.cross + s.module.gap));
          box([d.along, d.cross, s.module.thickness], p, rotation, 'module');
        }
      if (scope !== 'module' && s.racking.type !== 'vertical') {
        box(
          [tableLength, 0.1, 0.1],
          center.clone().addScaledVector(normal, -0.08),
          rotation,
          'tube',
        );
        for (const a of s.racking.type === 'dual-axis' ? [0] : [-0.32, 0.32]) {
          const p = localToWorld(s, cx + a * tableLength, cy, s.racking.height / 2);
          box([s.racking.postSize, s.racking.postSize, s.racking.height], p, null, 'post');
        }
      }
    }
    if (scope !== 'module' && s.racking.type === 'vertical') {
      // A continuous fence: outer posts flank the modules, and neighboring
      // columns (including table boundaries) share one upright in their gap.
      const positions = [columnCenters[0] - d.along / 2 - s.racking.postSize / 2];
      for (let i = 1; i < columnCenters.length; i++)
        positions.push((columnCenters[i - 1] + columnCenters[i]) / 2);
      positions.push(columnCenters.at(-1) + d.along / 2 + s.racking.postSize / 2);
      const postHeight = s.racking.height + width / 2;
      for (const x of positions)
        box(
          [s.racking.postSize, s.racking.postSize, postHeight],
          localToWorld(s, x, cy, postHeight / 2),
          null,
          'post',
        );
    }
  }
  group.updateMatrixWorld(true);
  group.userData = {
    length,
    rowLength,
    rowShifts: rowOffsets.map((_, r) => ((r % 2) - 0.5) * stagger),
    width,
    span,
    rowOffsets: rowOffsets.map((x) => x - span / 2),
    scope,
    transmitting:
      s.module.bifacial && (moduleOptics(s.module).broadband > 0 || moduleOptics(s.module).par > 0),
  };
  return group;
}
export function simulationGeometry(group) {
  const parts = [],
    boxes = [];
  group.traverse((o) => {
    if (!o.isMesh || !['module', 'post', 'tube'].includes(o.userData.kind)) return;
    if (group.userData.transmitting && o.userData.kind === 'module') {
      const e = o.matrixWorld.elements,
        p = o.geometry.parameters;
      boxes.push([
        e[12],
        e[13],
        e[14],
        0,
        e[0],
        e[1],
        e[2],
        p.width / 2,
        e[4],
        e[5],
        e[6],
        p.height / 2,
        e[8],
        e[9],
        e[10],
        p.depth / 2,
      ]);
    } else parts.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
  });
  if (!parts.length && !boxes.length) return null;
  const result = parts.length
    ? mergeGeometries(parts)
    : new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([], 3));
  if (group.userData.transmitting) result.userData.moduleBvh = packModuleBvh(boxes);
  parts.forEach((p) => p.dispose());
  return result;
}
export function disposeGroup(group) {
  const mats = new Set(),
    geometries = new Set();
  group.traverse((o) => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.isInstancedMesh) o.dispose();
    if (o.material) mats.add(o.material);
  });
  geometries.forEach((g) => g.dispose());
  mats.forEach((m) => {
    m.map?.dispose();
    m.dispose();
  });
}
export function receiverGridSpec(s) {
  return receiverSpec(s, dimensions(s));
}

export function receiverGrid(s) {
  const grid = receiverGridSpec(s),
    { nx, ny, dx, dy } = grid;
  if (grid.exceeded)
    throw Error('This grid exceeds 20,000 receivers. Reduce dimensions or increase spacing.');
  const points = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const { x, y } = cellLocal(grid, i, j),
        p = localToWorld(s, x, y, s.analysis.receiverHeight);
      points.push({ x: p.x, y: p.y, z: p.z, lx: x, ly: y });
    }
  return { ...grid, points };
}
