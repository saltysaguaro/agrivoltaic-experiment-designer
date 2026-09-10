import * as THREE from 'three';
import { axes, localToWorld } from '../domain/geometry.js';
import { zoneStyles } from '../domain/land-use.js';

// Display-only ground meshes. Depth testing keeps them beneath physical hardware.
export function landMeshes(study, zones, profile = false) {
  const group = new THREE.Group(),
    textures = new Map();
  const textureFor = (kind) => {
    if (textures.has(kind)) return textures.get(kind);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = kind === 'cropping' ? '#e0edd4' : '#f6eee5';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = ctx.fillStyle = zoneStyles[kind].color;
    ctx.lineWidth = 2;
    if (kind === 'cropping')
      for (let x = 8; x < 64; x += 16)
        for (let y = 8; y < 64; y += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
    else
      for (let i = -64; i < 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 64, 64);
        ctx.stroke();
      }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    textures.set(kind, texture);
    return texture;
  };
  const { u } = axes(study);
  for (const z of zones) {
    const holder = new THREE.Group();
    holder.userData.layer = z.kind;
    group.add(holder);
    if (profile) {
      if (z.x0 > 0 || z.x1 < 0) continue;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          localToWorld(study, 0, z.y0, 0.03),
          localToWorld(study, 0, z.y1, 0.03),
        ]),
        new THREE.LineBasicMaterial({ color: zoneStyles[z.kind].color }),
      );
      holder.add(line);
      continue;
    }
    const texture = textureFor(z.kind).clone();
    texture.repeat.set((z.x1 - z.x0) / 2, (z.y1 - z.y0) / 2);
    texture.needsUpdate = true;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(z.x1 - z.x0, z.y1 - z.y0),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.copy(localToWorld(study, (z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, 0.025));
    mesh.rotation.z = Math.atan2(u.y, u.x);
    mesh.renderOrder = 1;
    const rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({
        color: zoneStyles[z.kind].color,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    rim.renderOrder = 2;
    mesh.add(rim);
    holder.add(mesh);
  }
  // Clones retain their canvas source; the temporary base textures own no GPU allocation.
  textures.forEach((t) => t.dispose());
  return group;
}
export function applyDisplayLayers(group, overlay, layers, opacity) {
  for (const o of group.children) {
    const module = o.userData.kind === 'module';
    o.visible = module ? layers.modules && opacity > 0 : layers.supports;
    if (module) {
      o.material.transparent = opacity < 1;
      o.material.opacity = opacity;
      o.material.depthWrite = opacity === 1;
      o.renderOrder = 100;
      o.traverse((child) => {
        if (child !== o && child.material) {
          child.renderOrder = 101;
          child.material.opacity = opacity * 0.7;
          child.material.depthWrite = false;
        }
      });
    }
  }
  overlay?.traverse((o) => {
    if (o.userData.layer) o.visible = layers[o.userData.layer] !== false;
  });
}
