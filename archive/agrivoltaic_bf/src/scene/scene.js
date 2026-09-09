import * as THREE from "three";
import { APP_TITLE } from "../utils/constants.js";
import { createRenderer } from "./renderer.js";
import { createCamera } from "./camera.js";
import { createSceneControls } from "./controls.js";
import { createLightRig, updateSun } from "./lights.js";
import { GroundSystem } from "../ground/ground.js";
import { buildSystemAssembly } from "../systems/systemFactory.js";
import { CropSystem } from "../crops/cropSystem.js";
import { degToRad } from "../utils/math.js";
import { getSystemRotationDeg } from "../utils/orientation.js";

function makePanelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0f1b30";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#35537f";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const x = (i * canvas.width) / 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let j = 1; j < 12; j++) {
    const y = (j * canvas.height) / 12;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(255,255,255,0.16)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.04)");
  gradient.addColorStop(1, "rgba(255,255,255,0.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createMaterials() {
  const panelTexture = makePanelTexture();
  const panel = new THREE.MeshPhysicalMaterial({
    map: panelTexture,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.12,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24,
    ior: 1.45,
    reflectivity: 0.64,
  });
  panel.polygonOffset = true;
  panel.polygonOffsetFactor = -1;
  panel.polygonOffsetUnits = -1;

  return {
    panel,
    frame: new THREE.MeshStandardMaterial({
      color: 0x9ba4b7,
      roughness: 0.44,
      metalness: 0.68,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x5f6872,
      roughness: 0.68,
      metalness: 0.62,
    }),
    torqueTube: new THREE.MeshStandardMaterial({
      color: 0x747c89,
      roughness: 0.60,
      metalness: 0.68,
    }),
    bufferPrimary: new THREE.LineBasicMaterial({
      color: 0x1f6d53,
      transparent: true,
      opacity: 0.8,
    }),
    bufferSecondary: new THREE.LineBasicMaterial({
      color: 0x0ea5a4,
      transparent: true,
      opacity: 0.52,
    }),
  };
}

function clearGroup(group) {
  for (let index = group.children.length - 1; index >= 0; index--) {
    const child = group.children[index];
    group.remove(child);
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
    });
  }
}

function makeRectLine(width, depth, y, material) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const points = [
    new THREE.Vector3(-halfWidth, y, -halfDepth),
    new THREE.Vector3(halfWidth, y, -halfDepth),
    new THREE.Vector3(halfWidth, y, halfDepth),
    new THREE.Vector3(-halfWidth, y, halfDepth),
    new THREE.Vector3(-halfWidth, y, -halfDepth),
  ];
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function frameSceneToObject(camera, controls, lightRig, object, syncControlsUp) {
  const box = new THREE.Box3().setFromObject(object);
  if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) return;

  frameSceneToBounds(camera, controls, lightRig, box, undefined, undefined, syncControlsUp);
}

function frameSceneToBounds(camera, controls, lightRig, box, directionInput, upInput = new THREE.Vector3(0, 1, 0), syncControlsUp) {
  if (!box || !Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) return;

  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z, 10);
  const direction = directionInput
    ? directionInput.clone().normalize()
    : new THREE.Vector3(0.88, 0.56, 0.46).normalize();
  const distance = maxDim * 1.15 + 12;

  camera.position.copy(center).addScaledVector(direction, distance);
  if (syncControlsUp) {
    controls = syncControlsUp(upInput);
  } else {
    camera.up.copy(upInput);
  }
  controls.target.copy(center);
  controls.minDistance = 6;
  controls.maxDistance = Math.max(180, maxDim * 6.5);
  controls.update();
  updateCameraClipping(camera, controls, maxDim);

  const pad = Math.max(90, maxDim * 1.25);
  lightRig.sun.shadow.camera.left = -pad;
  lightRig.sun.shadow.camera.right = pad;
  lightRig.sun.shadow.camera.top = pad;
  lightRig.sun.shadow.camera.bottom = -pad;
  lightRig.sun.shadow.camera.updateProjectionMatrix();
}

function frameSceneToPoints(camera, controls, lightRig, points, direction, upInput, syncControlsUp) {
  if (!Array.isArray(points) || !points.length) return;
  const box = new THREE.Box3();
  points.forEach((point) => box.expandByPoint(point));
  frameSceneToBounds(camera, controls, lightRig, box, direction, upInput, syncControlsUp);
}

function updateCameraClipping(camera, controls, sceneSpan = 60) {
  const targetDistance = Math.max(1, camera.position.distanceTo(controls.target));
  const normalizedSpan = Math.max(40, sceneSpan);
  const near = Math.max(0.2, Math.min(6, targetDistance / 180));
  const far = Math.max(normalizedSpan * 3.5, targetDistance + normalizedSpan * 2.6);

  if (Math.abs(camera.near - near) > 1e-3 || Math.abs(camera.far - far) > 0.5) {
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }
}

function getSceneSpan(state, summary) {
  return Math.max(
    state?.groundSize ?? 0,
    summary?.arrayW ?? 0,
    summary?.arrayD ?? 0,
    summary?.layout?.tableSpec?.stackSpan ?? 0,
    40
  );
}

function updateShadowFrustum(lightRig, summary) {
  if (!summary) return;
  const shadowSpan = Math.max(summary.arrayW, summary.arrayD, 24);
  const pad = Math.max(50, shadowSpan * 0.72 + 18);
  lightRig.sun.shadow.camera.left = -pad;
  lightRig.sun.shadow.camera.right = pad;
  lightRig.sun.shadow.camera.top = pad;
  lightRig.sun.shadow.camera.bottom = -pad;
  lightRig.sun.shadow.camera.updateProjectionMatrix();
}

const TOP_DOWN_NORTH_UP = new THREE.Vector3(0, 0, 1);

function usesEastFacingRowView(state) {
  return state?.systemType === "fixed"
    || (state?.systemType === "raised" && !state?.pergolaTracking);
}

function defaultPresetForState(state) {
  return usesEastFacingRowView(state)
    ? "rowOblique"
    : "arrayOblique";
}

function defaultObliqueDirection(state) {
  return new THREE.Vector3(0, 0.54, -0.84).normalize();
}

function eastFacingRowDirection(alongWorldAxis) {
  return alongWorldAxis.clone()
    .normalize()
    .multiplyScalar(0.84)
    .add(new THREE.Vector3(0, 0.54, 0))
    .normalize();
}

function representativeCropRow(summary) {
  const cropRows = summary?.layout?.cropRows || [];
  if (!cropRows.length) return null;
  return cropRows[Math.floor(cropRows.length * 0.5)] || null;
}

function localAxesForCropRow(cropRow) {
  if (cropRow?.orientation === "z") {
    return {
      along: new THREE.Vector3(0, 0, 1),
      cross: new THREE.Vector3(1, 0, 0),
    };
  }

  return {
    along: new THREE.Vector3(1, 0, 0),
    cross: new THREE.Vector3(0, 0, 1),
  };
}

function worldRectPoints(systemRoot, {
  center,
  alongAxis,
  crossAxis,
  alongLength,
  crossLength,
  topY,
}) {
  const points = [];
  const halfAlong = alongLength * 0.5;
  const halfCross = crossLength * 0.5;
  const heights = [0, Math.max(0, topY)];

  for (const rowScale of [-halfAlong, halfAlong]) {
    for (const crossScale of [-halfCross, halfCross]) {
      for (const y of heights) {
        const localPoint = center.clone()
          .addScaledVector(alongAxis, rowScale)
          .addScaledVector(crossAxis, crossScale);
        localPoint.y = y;
        points.push(systemRoot.localToWorld(localPoint));
      }
    }
  }

  return points;
}

function systemBounds(object) {
  const bounds = new THREE.Box3().setFromObject(object);
  if (!Number.isFinite(bounds.min.x) || !Number.isFinite(bounds.max.x)) {
    return null;
  }
  return bounds;
}

export function createSceneApp({ canvas, previewMirrorEastWest = false }) {
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe7ece5);
  scene.fog = new THREE.Fog(0xe7ece5, 150, 620);

  const camera = createCamera();
  let controls = createSceneControls(camera, canvas);
  const lightRig = createLightRig(scene);
  const materials = createMaterials();
  const groundSystem = new GroundSystem(scene);
  const cropSystem = new CropSystem(scene);
  const systemRoot = new THREE.Group();
  const bufferRoot = new THREE.Group();
  const visualizationOverlayRoot = new THREE.Group();
  systemRoot.name = "system-root";
  bufferRoot.name = "buffer-root";
  visualizationOverlayRoot.name = "results-overlay-root";
  scene.add(systemRoot);
  scene.add(bufferRoot);
  scene.add(visualizationOverlayRoot);

  let currentSceneSummary = null;
  let currentState = null;
  let currentSystemOpacity = 1;

  function syncControlsUp(upInput = new THREE.Vector3(0, 1, 0)) {
    const nextUp = upInput.clone().normalize();
    const target = controls.target.clone();
    const minDistance = controls.minDistance;
    const maxDistance = controls.maxDistance;

    controls.dispose();
    camera.up.copy(nextUp);
    camera.updateMatrixWorld();
    controls = createSceneControls(camera, canvas);
    controls.target.copy(target);
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    return controls;
  }

  function resetCameraTransform() {
    camera.scale.set(1, 1, 1);
    syncControlsUp(new THREE.Vector3(0, 1, 0));
  }

  function resize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    if (width < 2 || height < 2) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function updateLighting(state) {
    updateSun(lightRig, previewMirrorEastWest
      ? { ...state, previewMirrorEastWest: true }
      : state);
  }

  function updateGround(state) {
    currentState = state;
    groundSystem.updateFromState(state, currentSceneSummary);
    controls.maxDistance = Math.max(180, getSceneSpan(state, currentSceneSummary) * 6);
    updateCameraClipping(camera, controls, getSceneSpan(state, currentSceneSummary));
  }

  function updateBuffers(state, summary) {
    clearGroup(bufferRoot);
    if (state.showBuffers !== "on" || !summary) return;

    const edgeWidth = summary.arrayW + (2 * state.arrayEdgeBuffer);
    const edgeDepth = summary.arrayD + (2 * state.arrayEdgeBuffer);
    bufferRoot.add(makeRectLine(edgeWidth, edgeDepth, 0.05, materials.bufferPrimary));
  }

  function rebuildSystem(state) {
    currentState = state;
    clearGroup(systemRoot);
    const assembly = buildSystemAssembly(state, materials);
    systemRoot.add(assembly.group);
    systemRoot.rotation.y = degToRad(getSystemRotationDeg(state));

    groundSystem.updateFromState(state, {
      arrayW: assembly.layout.arrayW,
      arrayD: assembly.layout.arrayD,
    });
    const cropSummary = cropSystem.update(state, {
      archetype: assembly.archetype,
      layout: assembly.layout,
      arrayW: assembly.layout.arrayW,
      arrayD: assembly.layout.arrayD,
    });
    cropSystem.group.rotation.y = degToRad(getSystemRotationDeg(state));

    currentSceneSummary = {
      title: `${APP_TITLE} — ${assembly.archetype.label}`,
      subtitle: `${assembly.layout.moduleCount.toLocaleString()} modules • ${assembly.layout.tablesNeeded.toLocaleString()}${assembly.layout.checkerboardExpanded ? " canopy positions" : " tables"} • ${assembly.layout.rowCount.toLocaleString()} rows`,
      systemLabel: assembly.archetype.label,
      moduleCount: assembly.layout.moduleCount,
      canopyPositionCount: assembly.layout.canopyPositionCount,
      checkerboardExpanded: assembly.layout.checkerboardExpanded,
      tablesNeeded: assembly.layout.tablesNeeded,
      tablesPerRow: assembly.layout.tablesPerRow,
      rowCount: assembly.layout.rowCount,
      rowPitch: assembly.layout.rowPitch,
      arrayW: assembly.layout.arrayW,
      arrayD: assembly.layout.arrayD,
      note: "Minimal conceptual geometry only. Annual irradiance overlays are shown through dedicated sensor heatmaps rather than a legacy ground tile lattice.",
      archetype: assembly.archetype,
      layout: assembly.layout,
      cropSummary,
    };

    controls.maxDistance = Math.max(180, getSceneSpan(state, currentSceneSummary) * 6);
    updateShadowFrustum(lightRig, currentSceneSummary);
    updateBuffers(state, currentSceneSummary);
    setSystemOpacity(currentSystemOpacity);
    updateCameraClipping(camera, controls, getSceneSpan(state, currentSceneSummary));
    return currentSceneSummary;
  }

  function setDefaultView(state) {
    if (!currentSceneSummary) return;
    setViewPreset(state, defaultPresetForState(state));
  }

  function fitViewAll() {
    resetCameraTransform();
    frameSceneToObject(camera, controls, lightRig, systemRoot, syncControlsUp);
  }

  function setViewPreset(state, preset = "arrayOblique") {
    if (!currentSceneSummary) return;
    resetCameraTransform();

    const bounds = systemBounds(systemRoot);
    if (!bounds) {
      frameSceneToObject(camera, controls, lightRig, systemRoot, syncControlsUp);
      return;
    }

    const topY = Math.max(0.5, bounds.max.y);
    const cropRow = representativeCropRow(currentSceneSummary);

    if (preset === "rowOblique" && cropRow) {
      const axes = localAxesForCropRow(cropRow);
      const alongLength = Math.min(
        cropRow.alongLength || currentSceneSummary.layout.tableSpec.tableLength,
        currentSceneSummary.layout.tableSpec.tableLength
          + (Math.max(0, Math.min(currentSceneSummary.tablesPerRow, 6) - 1) * currentSceneSummary.layout.tableSpan),
      );
      const crossLength = Math.max(
        currentSceneSummary.layout.crossAxisFootprint * 2.25,
        (cropRow.interRowGap || cropRow.width || currentSceneSummary.layout.crossAxisFootprint) * 1.35,
      );
      const alongWorld = axes.along.clone().transformDirection(systemRoot.matrixWorld);
      const direction = usesEastFacingRowView(state)
        ? eastFacingRowDirection(alongWorld)
        : alongWorld.clone()
          .multiplyScalar(-0.84)
          .add(new THREE.Vector3(0, 0.54, 0))
          .normalize();
      frameSceneToPoints(camera, controls, lightRig, worldRectPoints(systemRoot, {
        center: new THREE.Vector3(cropRow.centerX, 0, cropRow.centerZ),
        alongAxis: axes.along,
        crossAxis: axes.cross,
        alongLength,
        crossLength,
        topY,
      }), direction, undefined, syncControlsUp);
      updateCameraClipping(camera, controls, Math.max(alongLength, crossLength, topY * 1.6));
      return;
    }

    if (preset === "rowNadir" && cropRow) {
      const axes = localAxesForCropRow(cropRow);
      const alongLength = Math.min(
        cropRow.alongLength || currentSceneSummary.layout.tableSpec.tableLength,
        currentSceneSummary.layout.tableSpec.tableLength
          + (Math.max(0, Math.min(currentSceneSummary.tablesPerRow, 6) - 1) * currentSceneSummary.layout.tableSpan),
      );
      const crossLength = Math.max(
        currentSceneSummary.layout.crossAxisFootprint * 2.25,
        (cropRow.interRowGap || cropRow.width || currentSceneSummary.layout.crossAxisFootprint) * 1.35,
      );
      frameSceneToPoints(camera, controls, lightRig, worldRectPoints(systemRoot, {
        center: new THREE.Vector3(cropRow.centerX, 0, cropRow.centerZ),
        alongAxis: axes.along,
        crossAxis: axes.cross,
        alongLength,
        crossLength,
        topY,
      }), new THREE.Vector3(0, 1, 0), TOP_DOWN_NORTH_UP, syncControlsUp);
      updateCameraClipping(camera, controls, Math.max(alongLength, crossLength, topY * 1.6));
      return;
    }

    const arrayWidth = currentSceneSummary.arrayW + (2 * (state?.arrayEdgeBuffer ?? 0));
    const arrayDepth = currentSceneSummary.arrayD + (2 * (state?.arrayEdgeBuffer ?? 0));
    const arrayPoints = worldRectPoints(systemRoot, {
      center: new THREE.Vector3(0, 0, 0),
      alongAxis: new THREE.Vector3(1, 0, 0),
      crossAxis: new THREE.Vector3(0, 0, 1),
      alongLength: arrayWidth,
      crossLength: arrayDepth,
      topY,
    });

    frameSceneToPoints(
      camera,
      controls,
      lightRig,
      arrayPoints,
      preset === "arrayNadir" ? new THREE.Vector3(0, 1, 0) : defaultObliqueDirection(state),
      preset === "arrayNadir"
        ? TOP_DOWN_NORTH_UP
        : undefined,
      syncControlsUp,
    );
    updateCameraClipping(camera, controls, Math.max(arrayWidth, arrayDepth, topY * 2));
  }

  function setSystemOpacity(opacity = 1) {
    currentSystemOpacity = Math.min(1, Math.max(0, opacity));
    const transparent = currentSystemOpacity < 0.999;
    const visible = currentSystemOpacity > 0.001;

    systemRoot.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.visible = visible;
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.forEach((material) => {
        if (!material?.isMaterial) return;
        if (material.userData.baseOpacity === undefined) {
          material.userData.baseOpacity = material.opacity ?? 1;
          material.userData.baseTransparent = Boolean(material.transparent);
          material.userData.baseDepthWrite = material.depthWrite !== false;
        }

        material.opacity = material.userData.baseOpacity * currentSystemOpacity;
        material.transparent = transparent || material.userData.baseTransparent;
        material.depthWrite = transparent ? false : material.userData.baseDepthWrite;
        material.needsUpdate = true;
      });
    });
  }

  function exportSnapshot(fileName = "agrivoltaic-layout.png") {
    const gridWasVisible = groundSystem.tileGrid.gridLines.visible;
    groundSystem.setGridVisible(false);
    renderer.render(scene, camera);
    const anchor = document.createElement("a");
    anchor.download = fileName;
    anchor.href = renderer.domElement.toDataURL("image/png");
    anchor.click();
    groundSystem.setGridVisible(gridWasVisible);
  }

  function applyIrradianceGrid(gridData) {
    groundSystem.heatmap.setTileValues(gridData);
  }

  function clearIrradianceGrid() {
    groundSystem.heatmap.clearTileValues();
  }

  function clearVisualizationOverlay() {
    clearGroup(visualizationOverlayRoot);
  }

  function setVisualizationOverlay(object3D) {
    clearVisualizationOverlay();
    if (object3D) {
      visualizationOverlayRoot.add(object3D);
    }
  }

  function renderFrame() {
    controls.update();
    updateCameraClipping(camera, controls, getSceneSpan(currentState, currentSceneSummary));
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  }

  resize();
  renderFrame();

  return {
    resize,
    updateLighting,
    updateGround,
    updateBuffers,
    rebuildSystem,
    fitViewAll,
    setDefaultView,
    setViewPreset,
    exportSnapshot,
    setSystemOpacity,
    applyIrradianceGrid,
    clearIrradianceGrid,
    clearVisualizationOverlay,
    setVisualizationOverlay,
    getTileDescriptor: () => groundSystem.getTileDescriptor(),
    getGroundSystem: () => groundSystem,
    getSceneSummary: () => currentSceneSummary,
    getScene: () => scene,
    getSystemRoot: () => systemRoot,
    getVisualizationOverlayRoot: () => visualizationOverlayRoot,
    getRenderContext: () => ({
      scene,
      camera,
      renderer,
      canvas: renderer.domElement,
      overlayRoot: visualizationOverlayRoot,
    }),
    getCropSystem: () => cropSystem,
    getSimulationContext: () => ({
      scene,
      systemRoot,
      groundSystem,
      cropSystem,
      sceneSummary: currentSceneSummary,
      state: currentState,
    }),
  };
}
