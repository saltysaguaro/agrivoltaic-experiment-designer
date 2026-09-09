import * as THREE from "three";
import {
  ANNUAL_SIMULATION_QUALITY_PRESETS,
  DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET,
  resolveAnnualSimulationQualityPreset,
} from "@agrivoltaic/shared";
import { inferSensorGridVolumes } from "/packages/simulation-backend/dist/sensors/inference.js";
import { createSceneApp } from "../scene/scene.js";
import {
  createAnnualJob,
  exportRunAnywherePackage,
  saveProjectSnapshot,
} from "./apiClient.js";
import { buildAnnualSimulationPayload, buildSelectableSensorConfig } from "./sceneExport.js";
import { centeredSquareSensorIds } from "./sensorSelectionPresets.js";
import { createSelectableSensorOverlay, updateSelectableOverlayColors } from "./sensorSelectionOverlay.js";
import { bindSceneViewportControls } from "./sceneViewportControls.js";
import { designHref, jobRunHref, indexHref } from "./router.js";
import { createSessionStore } from "./sessionStore.js";
import { serializeSystemConfig } from "../app/state.js";

const DEFAULT_ACROSS_COUNT = 10;
const DEFAULT_HEIGHT_COUNT = 3;
const MIN_ACROSS_COUNT = 2;
const MAX_ACROSS_COUNT = 40;
const MIN_HEIGHT_COUNT = 1;
const MAX_HEIGHT_COUNT = 12;

const session = createSessionStore();

function clampInteger(value, minimum, maximum, fallback) {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(maximum, Math.max(minimum, numeric));
}

function buildHeightLabel(heightLevelsM, index) {
  const value = heightLevelsM[index] ?? 0;
  if (value <= 0.075) return `Near ground (${value.toFixed(2)} m)`;
  if (index === heightLevelsM.length - 1) return `Array top (${value.toFixed(2)} m)`;
  return `${value.toFixed(2)} m above ground`;
}

function middleBandSensorIds(sensors, bandWidth = 10) {
  const crossIndices = [...new Set(sensors.map((sensor) => sensor.indices[1]))].sort((a, b) => a - b);
  if (!crossIndices.length) return [];

  const width = Math.min(bandWidth, crossIndices.length);
  const start = Math.max(0, Math.floor((crossIndices.length - width) * 0.5));
  const included = new Set(crossIndices.slice(start, start + width));
  return sensors
    .filter((sensor) => included.has(sensor.indices[1]))
    .map((sensor) => sensor.id);
}

function centeredProjectedCoordinates(sensor, arraySelectionExtents) {
  const extents = arraySelectionExtents.get(sensor.arrayId);
  if (!extents) return null;
  return projectPointToArrayFrame(sensor.position, extents.frame);
}

function buildHeightLevels(grids) {
  return [...new Set(
    grids.flatMap((grid) => grid.sensors.map((sensor) => Number((sensor.position.z - grid.worldBounds.min.z).toFixed(6))))
  )].sort((a, b) => a - b);
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function boundsCorners(bounds) {
  const corners = [];
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        corners.push({ x, y, z });
      }
    }
  }
  return corners;
}

function projectPointToArrayFrame(point, frame) {
  const relativeX = point.x - frame.origin.x;
  const relativeY = point.y - frame.origin.y;
  const relativeZ = point.z - frame.origin.z;
  return {
    along: (relativeX * frame.eRow.x) + (relativeY * frame.eRow.y) + (relativeZ * frame.eRow.z),
    cross: (relativeX * frame.eCross.x) + (relativeY * frame.eCross.y) + (relativeZ * frame.eCross.z),
  };
}

function buildArraySelectionExtents(analysis) {
  return new Map((analysis?.arrays || []).map((array) => {
    const projectedCorners = boundsCorners(array.bounds).map((corner) => projectPointToArrayFrame(corner, array.localFrame));
    return [array.arrayId, {
      frame: array.localFrame,
      alongMin: Math.min(...projectedCorners.map((point) => point.along)),
      alongMax: Math.max(...projectedCorners.map((point) => point.along)),
      crossMin: Math.min(...projectedCorners.map((point) => point.cross)),
      crossMax: Math.max(...projectedCorners.map((point) => point.cross)),
    }];
  }));
}

function sensorConfigCounts(config) {
  const dimensions = config?.dimensions || [];
  return {
    acrossCount: clampInteger(
      dimensions[1],
      MIN_ACROSS_COUNT,
      MAX_ACROSS_COUNT,
      DEFAULT_ACROSS_COUNT,
    ),
    heightCount: clampInteger(
      dimensions[2],
      MIN_HEIGHT_COUNT,
      MAX_HEIGHT_COUNT,
      DEFAULT_HEIGHT_COUNT,
    ),
  };
}

function normalizeSelectableSensorConfig(config, edgePaddingM = 0) {
  const { acrossCount, heightCount } = sensorConfigCounts(config);
  return buildSelectableSensorConfig({
    ...config,
    dimensions: [acrossCount, acrossCount, heightCount],
    margins: {
      ...(config?.margins || {}),
      rowPadding: edgePaddingM,
      outerRowPadding: edgePaddingM,
    },
  });
}

async function bootSensorLayoutPage() {
  const project = session.getProject();
  const site = session.getSite();
  const designState = session.getDesignState();
  if (!project?.rootPath || !designState) {
    window.location.replace(project?.rootPath ? designHref() : indexHref());
    return;
  }

  const savedSelection = session.getSensorSelection();
  const sensorPaddingM = Math.max(0, Number(designState.arrayEdgeBuffer) || 0);
  let sensorConfig = normalizeSelectableSensorConfig(savedSelection?.config, sensorPaddingM);
  const sceneApp = createSceneApp({
    canvas: document.getElementById("sensorLayoutCanvas"),
  });
  sceneApp.updateLighting(designState);
  sceneApp.rebuildSystem(designState);
  sceneApp.setDefaultView(designState);

  const heightSelect = document.getElementById("sensorHeightSelect");
  const acrossCountInput = document.getElementById("sensorAcrossCountInput");
  const heightCountInput = document.getElementById("sensorHeightCountInput");
  const selectionStats = document.getElementById("sensorSelectionStats");
  const selectionInfo = document.getElementById("sensorSelectionInfo");
  const status = document.getElementById("sensorLayoutStatus");
  const hoverCard = document.getElementById("sensorSelectionHoverCard");
  const runButton = document.getElementById("runModelButton");
  const exportButton = document.getElementById("exportParametersButton");
  const resetButton = document.getElementById("resetSensorSelectionButton");
  const qualityHint = document.getElementById("simulationQualityHint");
  const qualityButtons = [...document.querySelectorAll("[data-quality-preset]")];

  const selectedSensorIds = new Set();
  let simulationQualityPreset = resolveAnnualSimulationQualityPreset(
    savedSelection?.simulationQualityPreset || DEFAULT_ANNUAL_SIMULATION_QUALITY_PRESET,
  );
  let grids = [];
  let allSensors = [];
  let allSensorIds = new Set();
  let sensorAnalysis = null;
  let arraySelectionExtents = new Map();
  let heightLevelsM = [];
  let currentHeightIndex = Math.max(0, savedSelection?.selectedHeightIndex ?? 0);
  let currentOverlay = null;

  const { acrossCount, heightCount } = sensorConfigCounts(sensorConfig);
  acrossCountInput.value = String(acrossCount);
  heightCountInput.value = String(heightCount);

  bindSceneViewportControls({
    sceneApp,
    getState: () => designState,
    exportButton: "exportSensorViewButton",
    exportFileName: "agrivoltaic-sensor-layout-view.png",
    opacityInput: "sensorOpacityRange",
    opacityValue: "sensorOpacityValue",
    presetButtons: document.querySelectorAll("[data-view-preset]"),
  });

  function visibleCells() {
    return currentOverlay?.userData?.visibleCells || [];
  }

  function buildPayload(selectedIds = []) {
    if (!site) {
      throw new Error("Choose and save a site on the landing page before running irradiance modeling.");
    }
    return buildAnnualSimulationPayload({
      projectName: project.name || session.getProjectName() || "Agrivoltaic Study",
      projectRoot: project.rootPath,
      site,
      sceneApp,
      designState,
      serializedConfig: serializeSystemConfig(designState),
      sensorConfig,
      selectedSensorIds: selectedIds,
      simulationQualityPreset,
    });
  }

  async function persistSelectionSnapshot({ jobs, lastJobId } = {}) {
    const snapshot = session.buildProjectSnapshot({
      project,
      site,
      designState,
      serializedConfig: serializeSystemConfig(designState),
      sensorSelection: {
        config: sensorConfig,
        selectedSensorIds: [...selectedSensorIds],
        selectedHeightIndex: currentHeightIndex,
        simulationQualityPreset,
      },
      jobs,
      lastJobId,
    });
    const result = await saveProjectSnapshot({
      rootPath: project.rootPath,
      snapshot,
    });
    session.applyProjectSnapshot(result.snapshot);
  }

  const schedulePersistSelection = debounce(() => {
    persistSelectionSnapshot().catch(() => {});
  }, 500);

  function refreshHeightOptions() {
    heightSelect.innerHTML = "";
    heightLevelsM.forEach((_, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = buildHeightLabel(heightLevelsM, index);
      option.selected = index === currentHeightIndex;
      heightSelect.append(option);
    });
    heightSelect.value = String(currentHeightIndex);
  }

  function refreshSummary() {
    const currentHeightSensors = allSensors.filter((sensor) => sensor.indices[2] === currentHeightIndex);
    const currentHeightSelected = currentHeightSensors.filter((sensor) => selectedSensorIds.has(sensor.id)).length;
    const totalSelected = selectedSensorIds.size;
    const sensorsInsideArray = allSensors.filter(sensorWithinArray);
    const { acrossCount: activeAcrossCount, heightCount: activeHeightCount } = sensorConfigCounts(sensorConfig);
    const qualityDefinition = ANNUAL_SIMULATION_QUALITY_PRESETS[simulationQualityPreset];

    selectionStats.innerHTML = `
      <div><span>Visible height</span><strong>${buildHeightLabel(heightLevelsM, currentHeightIndex)}</strong></div>
      <div><span>Selected at this height</span><strong>${currentHeightSelected}</strong></div>
      <div><span>Total selected sensors</span><strong>${totalSelected}</strong></div>
      <div><span>Total available sensors</span><strong>${allSensors.length}</strong></div>
    `;

    selectionInfo.innerHTML = `
      <div><span>Project</span><strong>${project.name}</strong></div>
      <div><span>Site</span><strong>${site?.label || "Manual site"}</strong></div>
      <div><span>Sensor lattice</span><strong>${activeAcrossCount} center-to-center per row pitch × dynamic along-row × ${activeHeightCount} heights</strong></div>
      <div><span>Height extent</span><strong>Near ground to top of array</strong></div>
      <div><span>Coverage</span><strong>${sensorPaddingM > 0 ? "Full array plus farming buffer" : "Full array footprint"}</strong></div>
      <div><span>Sensors inside array</span><strong>${sensorsInsideArray.length}</strong></div>
      <div><span>Simulation quality</span><strong>${qualityDefinition.label}</strong></div>
      <div><span>Selection behavior</span><strong>Click to toggle • Use presets for bulk selection</strong></div>
    `;
  }

  function refreshQualityControls() {
    const qualityDefinition = ANNUAL_SIMULATION_QUALITY_PRESETS[simulationQualityPreset];
    qualityButtons.forEach((button) => {
      const active = button.dataset.qualityPreset === simulationQualityPreset;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (qualityHint) {
      qualityHint.textContent = `${qualityDefinition.shortDescription} ${qualityDefinition.runtimeHint}`;
    }
  }

  function refreshOverlay() {
    currentOverlay = createSelectableSensorOverlay(grids, currentHeightIndex, selectedSensorIds);
    sceneApp.setVisualizationOverlay(currentOverlay);
    refreshSummary();
    status.textContent = `Showing ${visibleCells().length.toLocaleString()} available sensors at ${buildHeightLabel(heightLevelsM, currentHeightIndex)}.`;
  }

  function rebuildSensorLattice() {
    const inferred = inferSensorGridVolumes(buildPayload().sceneExport.sceneManifest, sensorConfig);
    sensorAnalysis = inferred.analysis;
    arraySelectionExtents = buildArraySelectionExtents(sensorAnalysis);
    grids = inferred.grids;
    allSensors = grids.flatMap((grid) => grid.sensors);
    allSensorIds = new Set(allSensors.map((sensor) => sensor.id));
    heightLevelsM = buildHeightLevels(grids);

    [...selectedSensorIds].forEach((sensorId) => {
      if (!allSensorIds.has(sensorId)) {
        selectedSensorIds.delete(sensorId);
      }
    });

    currentHeightIndex = Math.min(currentHeightIndex, Math.max(0, heightLevelsM.length - 1));
    refreshHeightOptions();
    refreshOverlay();
  }

  function setSelected(sensorIds, mode = "replace") {
    if (mode === "replace") {
      selectedSensorIds.clear();
    }
    for (const sensorId of sensorIds) {
      if (allSensorIds.has(sensorId)) {
        selectedSensorIds.add(sensorId);
      }
    }
    if (currentOverlay) {
      updateSelectableOverlayColors(currentOverlay, selectedSensorIds);
    }
    refreshSummary();
    schedulePersistSelection();
  }

  function toggleSensor(sensorId) {
    if (selectedSensorIds.has(sensorId)) {
      selectedSensorIds.delete(sensorId);
    } else if (allSensorIds.has(sensorId)) {
      selectedSensorIds.add(sensorId);
    }
    if (currentOverlay) {
      updateSelectableOverlayColors(currentOverlay, selectedSensorIds);
    }
    refreshSummary();
    schedulePersistSelection();
  }

  function sensorsAtCurrentHeight() {
    return allSensors.filter((sensor) => sensor.indices[2] === currentHeightIndex);
  }

  function sensorWithinArray(sensor) {
    const extents = arraySelectionExtents.get(sensor.arrayId);
    if (!extents) return false;
    const projected = projectPointToArrayFrame(sensor.position, extents.frame);
    const epsilon = 1e-6;
    return projected.along >= (extents.alongMin - epsilon)
      && projected.along <= (extents.alongMax + epsilon)
      && projected.cross >= (extents.crossMin - epsilon)
      && projected.cross <= (extents.crossMax + epsilon);
  }

  function applyPreset(preset) {
    if (preset === "all") {
      setSelected(sensorsAtCurrentHeight().map((sensor) => sensor.id));
      return;
    }

    if (preset === "allHeights") {
      setSelected(allSensors.map((sensor) => sensor.id));
      return;
    }

    if (preset === "withinArray") {
      setSelected(sensorsAtCurrentHeight().filter(sensorWithinArray).map((sensor) => sensor.id));
      return;
    }

    if (preset === "withinArrayAllHeights") {
      setSelected(allSensors.filter(sensorWithinArray).map((sensor) => sensor.id));
      return;
    }

    if (preset === "middleRow") {
      setSelected(middleBandSensorIds(sensorsAtCurrentHeight()));
      return;
    }

    if (preset === "middleRowAllHeights") {
      setSelected(middleBandSensorIds(allSensors));
      return;
    }

    if (preset === "centerSquare") {
      setSelected(centeredSquareSensorIds(sensorsAtCurrentHeight(), {
        span: sensorConfigCounts(sensorConfig).acrossCount,
        project: (sensor) => centeredProjectedCoordinates(sensor, arraySelectionExtents),
      }));
      return;
    }

    if (preset === "centerSquareAllHeights") {
      setSelected(centeredSquareSensorIds(allSensors, {
        span: sensorConfigCounts(sensorConfig).acrossCount,
        project: (sensor) => centeredProjectedCoordinates(sensor, arraySelectionExtents),
      }));
    }
  }

  function applyGridInputs() {
    const nextAcrossCount = clampInteger(
      acrossCountInput.value,
      MIN_ACROSS_COUNT,
      MAX_ACROSS_COUNT,
      DEFAULT_ACROSS_COUNT,
    );
    const nextHeightCount = clampInteger(
      heightCountInput.value,
      MIN_HEIGHT_COUNT,
      MAX_HEIGHT_COUNT,
      DEFAULT_HEIGHT_COUNT,
    );

    acrossCountInput.value = String(nextAcrossCount);
    heightCountInput.value = String(nextHeightCount);

    const previousConfig = JSON.stringify(sensorConfig.dimensions);
    sensorConfig = normalizeSelectableSensorConfig({
      ...sensorConfig,
      dimensions: [nextAcrossCount, nextAcrossCount, nextHeightCount],
    }, sensorPaddingM);
    if (JSON.stringify(sensorConfig.dimensions) === previousConfig) {
      return;
    }

    rebuildSensorLattice();
    schedulePersistSelection();
  }

  rebuildSensorLattice();
  refreshQualityControls();
  schedulePersistSelection();

  heightSelect.addEventListener("change", () => {
    currentHeightIndex = Number(heightSelect.value);
    refreshOverlay();
    schedulePersistSelection();
  });

  [acrossCountInput, heightCountInput].forEach((input) => {
    input.addEventListener("change", applyGridInputs);
    input.addEventListener("input", applyGridInputs);
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  qualityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextPreset = resolveAnnualSimulationQualityPreset(button.dataset.qualityPreset);
      if (nextPreset === simulationQualityPreset) {
        return;
      }
      simulationQualityPreset = nextPreset;
      refreshQualityControls();
      refreshSummary();
      status.textContent = `Simulation quality set to ${ANNUAL_SIMULATION_QUALITY_PRESETS[simulationQualityPreset].label}.`;
      schedulePersistSelection();
    });
  });

  resetButton?.addEventListener("click", () => {
    selectedSensorIds.clear();
    if (currentOverlay) {
      updateSelectableOverlayColors(currentOverlay, selectedSensorIds);
    }
    refreshSummary();
    status.textContent = "Cleared all selected sensors.";
    schedulePersistSelection();
  });

  const { camera, canvas, overlayRoot } = sceneApp.getRenderContext();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function hideHover() {
    hoverCard.hidden = true;
  }

  function updateHover(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(overlayRoot.children, true);
    const hit = intersections.find((entry) => typeof entry.instanceId === "number");
    if (!hit || hit.instanceId === undefined) {
      hideHover();
      return;
    }
    const cell = hit.object.userData.cells?.[hit.instanceId];
    if (!cell) {
      hideHover();
      return;
    }
    hoverCard.hidden = false;
    hoverCard.style.left = `${event.clientX - rect.left + 18}px`;
    hoverCard.style.top = `${event.clientY - rect.top + 18}px`;
    hoverCard.innerHTML = `
      <strong>${selectedSensorIds.has(cell.id) ? "Selected" : "Available"}</strong>
      <div>${buildHeightLabel(heightLevelsM, currentHeightIndex)}</div>
      <div>Grid: ${cell.gridId}</div>
      <div>Point: ${cell.indices[0] + 1}, ${cell.indices[1] + 1}</div>
    `;
  }

  canvas.addEventListener("pointermove", (event) => {
    updateHover(event);
  });
  canvas.addEventListener("pointerleave", hideHover);

  canvas.addEventListener("click", (event) => {
    const point = canvasPoint(event);
    pointer.x = (point.x / point.width) * 2 - 1;
    pointer.y = -((point.y / point.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(overlayRoot.children, true);
    const hit = intersections.find((entry) => typeof entry.instanceId === "number");
    const cell = hit?.object?.userData?.cells?.[hit.instanceId];
    if (cell) {
      toggleSensor(cell.id);
    }
  });

  runButton.addEventListener("click", async () => {
    if (!selectedSensorIds.size) {
      status.textContent = "Select at least one sensor before running the model.";
      return;
    }
    runButton.disabled = true;
    status.textContent = "Saving the sensor plan and creating the irradiance job…";
    try {
      const payload = buildPayload([...selectedSensorIds]);
      await persistSelectionSnapshot();
      const job = await createAnnualJob(payload);
      session.rememberJob(job);
      await persistSelectionSnapshot({
        jobs: { [job.jobId]: job },
        lastJobId: job.jobId,
      });
      window.location.assign(jobRunHref(job.jobId));
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Could not create the irradiance job.";
      runButton.disabled = false;
    }
  });

  exportButton.addEventListener("click", async () => {
    if (!selectedSensorIds.size) {
      status.textContent = "Select at least one sensor before exporting the run-anywhere package.";
      return;
    }
    exportButton.disabled = true;
    status.textContent = "Exporting the run-anywhere irradiance package for this geometry, weather, and sensor plan…";
    try {
      const payload = buildPayload([...selectedSensorIds]);
      await persistSelectionSnapshot();
      const result = await exportRunAnywherePackage(payload);
      status.textContent = `Run-anywhere package saved to ${result.packageRoot}.`;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Could not export the run-anywhere package.";
    } finally {
      exportButton.disabled = false;
    }
  });
}

bootSensorLayoutPage().catch((error) => {
  const status = document.getElementById("sensorLayoutStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : "Could not load the sensor layout.";
  }
});
