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
    tilt = Math.round(tilt / 2) * 2;
    yaw = Math.round(yaw / 2) * 2;
  }
  return { tilt, yaw, key: `${tilt.toFixed(4)}:${yaw.toFixed(4)}` };
}
export function buildGeometry(s, scope = 'array', pose = getPose(s)) {
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
    length = tables * tableLength + (tables - 1) * s.row.tableGap;
  const yaw = rad(pose.yaw),
    pu = u.clone().multiplyScalar(Math.cos(yaw)).addScaledVector(v, Math.sin(yaw)),
    pv = v.clone().multiplyScalar(Math.cos(yaw)).addScaledVector(u, -Math.sin(yaw));
  const cv = pv
      .clone()
      .multiplyScalar(Math.cos(rad(pose.tilt)))
      .addScaledVector(up, Math.sin(rad(pose.tilt))),
    normal = new THREE.Vector3().crossVectors(pu, cv).normalize();
  const rotation = new THREE.Matrix4().makeBasis(pu, cv, normal);
  const moduleMaterial = new THREE.MeshStandardMaterial({
    color: 0x315f69,
    metalness: 0.3,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x87968f,
    metalness: 0.5,
    roughness: 0.5,
  });
  function box(size, position, rot, kind) {
    const g = new THREE.BoxGeometry(...size),
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
    for (let t = 0; t < tables; t++) {
      const cx = -length / 2 + tableLength / 2 + t * (tableLength + s.row.tableGap);
      const center = localToWorld(s, cx, cy, scope === 'module' ? 0 : s.racking.height);
      for (let j = 0; j < high; j++)
        for (let i = 0; i < wide; i++) {
          const p = center
            .clone()
            .addScaledVector(pu, -tableLength / 2 + d.along / 2 + i * (d.along + s.module.gap))
            .addScaledVector(cv, -width / 2 + d.cross / 2 + j * (d.cross + s.module.gap));
          box([d.along, d.cross, s.module.thickness], p, rotation, 'module');
        }
      if (scope !== 'module') {
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
  }
  group.updateMatrixWorld(true);
  group.userData = { length, width, span, rowOffsets: rowOffsets.map((x) => x - span / 2), scope };
  return group;
}
export function simulationGeometry(group) {
  const parts = [];
  group.traverse((o) => {
    if (o.isMesh && ['module', 'post', 'tube'].includes(o.userData.kind))
      parts.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
  });
  if (!parts.length) return null;
  const result = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return result;
}
export function disposeGroup(group) {
  const mats = new Set();
  group.traverse((o) => {
    o.geometry?.dispose();
    if (o.material) mats.add(o.material);
  });
  mats.forEach((m) => m.dispose());
}
export function receiverGridSpec(s) {
  const d = dimensions(s),
    nx = Math.ceil(d.footprintX / s.analysis.resolution),
    ny = Math.ceil(d.footprintY / s.analysis.resolution),
    dx = d.footprintX / nx,
    dy = d.footprintY / ny;
  return { nx, ny, dx, dy, width: d.footprintX, height: d.footprintY, azimuth: s.array.azimuth };
}
export function receiverGrid(s) {
  const grid = receiverGridSpec(s),
    { nx, ny, dx, dy } = grid;
  const points = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const x = -grid.width / 2 + (i + 0.5) * dx,
        y = -grid.height / 2 + (j + 0.5) * dy,
        p = localToWorld(s, x, y, s.analysis.receiverHeight);
      points.push({ x: p.x, y: p.y, z: p.z, lx: x, ly: y });
    }
  return { ...grid, points };
}
