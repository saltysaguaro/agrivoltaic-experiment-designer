import * as THREE from "three";

const DEBUG_GROUND_Y = 0.08;
const DEBUG_LABEL_Y = 0.18;
const DEBUG_MARKER_Y = 0.12;
const EPSILON = 1e-6;

const CARDINAL_STYLES = [
  { label: "N", direction: new THREE.Vector3(0, 0, 1), color: 0x1f6d53 },
  { label: "E", direction: new THREE.Vector3(1, 0, 0), color: 0x2a7de1 },
  { label: "S", direction: new THREE.Vector3(0, 0, -1), color: 0xd27a2f },
  { label: "W", direction: new THREE.Vector3(-1, 0, 0), color: 0x8c5d31 },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function renderOrder(object, value) {
  object.renderOrder = value;
  object.traverse?.((child) => {
    child.renderOrder = value;
    if (child.material?.isMaterial) {
      child.material.depthTest = false;
      child.material.depthWrite = false;
      child.material.toneMapped = false;
      child.material.transparent = true;
      if (child.material.opacity === undefined) {
        child.material.opacity = 1;
      }
    }
  });
  return object;
}

function createLine(points, color, opacity = 0.9) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
    }),
  );
  return renderOrder(line, 30);
}

function createDisc(position, color, radius) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 18),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.96,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.copy(position);
  return renderOrder(disc, 31);
}

function createTextSprite(text, color, size) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 252, 247, 0.94)";
  ctx.beginPath();
  ctx.roundRect(18, 34, 220, 188, 28);
  ctx.fill();

  ctx.strokeStyle = "rgba(42, 34, 22, 0.14)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(18, 34, 220, 188, 28);
  ctx.stroke();

  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.font = '700 122px "Manrope", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  }));
  sprite.scale.set(size * 1.05, size * 1.05, 1);
  return renderOrder(sprite, 32);
}

function createArrow(origin, direction, length, color, labelText) {
  const group = new THREE.Group();
  const normalized = direction.clone().normalize();
  const headLength = clamp(length * 0.14, 1.1, 2.8);
  const headWidth = clamp(length * 0.07, 0.45, 1.1);
  const arrow = new THREE.ArrowHelper(normalized, origin, length, color, headLength, headWidth);
  renderOrder(arrow, 30);
  group.add(arrow);

  if (labelText) {
    const label = createTextSprite(labelText, color, clamp(length * 0.17, 1.9, 3.3));
    label.position.copy(origin).addScaledVector(normalized, length + Math.max(headLength * 0.7, 0.9));
    label.position.y = Math.max(label.position.y, DEBUG_LABEL_Y);
    group.add(label);
  }

  return group;
}

function boxWorldCorners(mesh) {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) return [];

  const corners = [];
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        corners.push(mesh.localToWorld(new THREE.Vector3(x, y, z)));
      }
    }
  }
  return corners;
}

function firstModuleGlassMesh(systemRoot) {
  let glassMesh = null;
  systemRoot.updateWorldMatrix(true, true);
  systemRoot.traverse((object) => {
    if (glassMesh || !object.isMesh) return;
    if (object.name === "pv-module-glass" || object.userData.simulationKind === "module_glass") {
      glassMesh = object;
    }
  });
  return glassMesh;
}

function highestModuleCorner(systemRoot) {
  const mesh = firstModuleGlassMesh(systemRoot);
  if (!mesh) return null;
  const corners = boxWorldCorners(mesh);
  corners.sort((left, right) => right.y - left.y);
  return corners[0] ?? null;
}

export function computeShadowGroundHit(worldPoint, sunPosition) {
  if (!worldPoint || !sunPosition) return null;
  if (!Number.isFinite(worldPoint.y) || worldPoint.y <= EPSILON) return null;
  if (!Number.isFinite(sunPosition.y) || sunPosition.y <= EPSILON) return null;

  const shadowDirection = worldPoint.clone().sub(sunPosition);
  if (Math.abs(shadowDirection.y) <= EPSILON) return null;

  const scale = -worldPoint.y / shadowDirection.y;
  if (!Number.isFinite(scale) || scale <= 0) return null;
  return worldPoint.clone().addScaledVector(shadowDirection, scale);
}

function horizontalDirection(vector) {
  const horizontal = new THREE.Vector3(vector.x, 0, vector.z);
  if (horizontal.lengthSq() <= EPSILON) return null;
  return horizontal.normalize();
}

export function computeDirectionDebugState({ sceneSummary, systemRoot, sunPosition }) {
  const span = Math.max(sceneSummary?.arrayW ?? 0, sceneSummary?.arrayD ?? 0, 12);
  const rayLength = clamp(span * 0.42, 10, 28);
  const modulePoint = highestModuleCorner(systemRoot);
  const shadowHit = modulePoint ? computeShadowGroundHit(modulePoint, sunPosition) : null;
  const horizontalSun = horizontalDirection(sunPosition);
  const horizontalShadow = horizontalSun ? horizontalSun.clone().multiplyScalar(-1) : null;

  return {
    rayLength,
    modulePoint,
    shadowHit,
    horizontalSun,
    horizontalShadow,
  };
}

export function createDirectionDebugOverlay({ sceneSummary, systemRoot, sunPosition }) {
  const root = new THREE.Group();
  root.name = "direction-debug-overlay";

  const debug = computeDirectionDebugState({
    sceneSummary,
    systemRoot,
    sunPosition,
  });

  const origin = new THREE.Vector3(0, DEBUG_GROUND_Y, 0);
  for (const style of CARDINAL_STYLES) {
    root.add(createArrow(origin, style.direction, debug.rayLength, style.color, style.label));
  }

  if (debug.horizontalSun) {
    root.add(createArrow(
      new THREE.Vector3(0, DEBUG_GROUND_Y + 0.02, 0),
      debug.horizontalSun,
      debug.rayLength * 0.86,
      0xe3a72f,
      "Sun",
    ));
  }

  if (debug.horizontalShadow) {
    root.add(createArrow(
      new THREE.Vector3(0, DEBUG_GROUND_Y + 0.04, 0),
      debug.horizontalShadow,
      debug.rayLength * 0.86,
      0xc53a24,
      "Shadow",
    ));
  }

  if (debug.modulePoint && debug.shadowHit) {
    const start = debug.modulePoint.clone();
    const end = debug.shadowHit.clone();
    root.add(createLine([start, end], 0xfff3d6, 0.9));
    root.add(createDisc(
      new THREE.Vector3(start.x, start.y + 0.01, start.z),
      0xffdd8f,
      clamp(debug.rayLength * 0.025, 0.16, 0.34),
    ));
    root.add(createDisc(
      new THREE.Vector3(end.x, DEBUG_MARKER_Y, end.z),
      0xd02d2d,
      clamp(debug.rayLength * 0.03, 0.18, 0.38),
    ));
  }

  return root;
}
