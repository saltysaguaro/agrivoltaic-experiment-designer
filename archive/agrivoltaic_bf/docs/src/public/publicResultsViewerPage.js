import * as THREE from "three";
import { createSceneApp } from "../scene/scene.js";
import { bindSceneViewportControls } from "../platform/sceneViewportControls.js";
import { createResultsOverlay, buildLegendStops } from "../platform/resultsOverlay.js";
import {
  buildResultsView,
  normalizeUploadedResults,
  readJsonFile,
} from "./publicResultsData.js";
import {
  PUBLIC_SHADE_PREVIEW_HREF,
  PUBLIC_STUDY_SETUP_HREF,
} from "./publicStudyRoutes.js";

function monthOptions(select, selected) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
  select.innerHTML = "";
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = String(month);
    option.textContent = formatter.format(new Date(Date.UTC(2024, month - 1, 15)));
    option.selected = month === selected;
    select.append(option);
  }
  select.value = String(selected);
}

function metricLabel(metric) {
  switch (metric) {
    case "annualIrradiance": return "Average daily irradiance";
    case "percentGHI": return "Percent of site GHI";
    case "shadeFraction": return "Relative shade";
    case "estimatedPAR": return "Estimated PAR proxy";
    default: return metric;
  }
}

function gridModeLabel(mode) {
  switch (mode) {
    case "centerArrayGrid": return "Central Grid";
    case "centralRowGrid": return "Central Row";
    case "fullArrayGrid": return "Custom full-array layout";
    default: return mode;
  }
}

function buildHeightLabel(heightLevelsM, index) {
  const value = heightLevelsM[index] ?? 0;
  if (value <= 0.075) {
    return `Near ground (${value.toFixed(2)} m)`;
  }
  if (index === heightLevelsM.length - 1) {
    return `Array top (${value.toFixed(2)} m)`;
  }
  return `${value.toFixed(2)} m above ground`;
}

function renderLegend(container, unitsEl, legend, units) {
  container.innerHTML = "";
  unitsEl.textContent = units;

  const gradient = document.createElement("div");
  gradient.className = "legend-gradient";
  gradient.style.background = legend.gradient;
  container.append(gradient);

  const labels = document.createElement("div");
  labels.className = "legend-labels";
  legend.labels.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    labels.append(span);
  });
  container.append(labels);
}

function installHover(sceneApp, hoverCard) {
  const { camera, canvas, overlayRoot } = sceneApp.getRenderContext();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  raycaster.params.InstancedMesh = { threshold: 0.25 };

  function hideHover() {
    hoverCard.hidden = true;
  }

  function onPointerMove(event) {
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
    const units = hit.object.userData.units;
    if (!cell) {
      hideHover();
      return;
    }

    hoverCard.hidden = false;
    hoverCard.style.left = `${event.clientX - rect.left + 18}px`;
    hoverCard.style.top = `${event.clientY - rect.top + 18}px`;
    hoverCard.innerHTML = `
      <strong>${cell.value.toFixed(2)} ${units}</strong>
      <div>Height: ${cell.heightAboveGroundM.toFixed(2)} m</div>
      <div>Grid: ${cell.gridId}</div>
      <div>Point: ${cell.rowIndex + 1}, ${cell.colIndex + 1}</div>
    `;
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", hideHover);
}

async function bootPublicResultsViewerPage() {
  const fileInput = document.getElementById("publicResultsFilesInput");
  const loadButton = document.getElementById("publicResultsLoadButton");
  const uploadHint = document.getElementById("publicResultsUploadHint");
  const sourceSummary = document.getElementById("publicResultsSourceSummary");
  const metricSelect = document.getElementById("metricSelect");
  const heightSelect = document.getElementById("heightSelect");
  const startMonth = document.getElementById("startMonthSelect");
  const endMonth = document.getElementById("endMonthSelect");
  const stats = document.getElementById("resultsStats");
  const legend = document.getElementById("resultsLegend");
  const legendUnits = document.getElementById("legendUnits");
  const status = document.getElementById("resultsStatus");
  const hoverCard = document.getElementById("resultsHoverCard");
  const shadePreviewLink = document.getElementById("publicResultsShadePreviewLink");
  const studyBuilderLink = document.getElementById("publicResultsStudyBuilderLink");

  if (shadePreviewLink) shadePreviewLink.href = PUBLIC_SHADE_PREVIEW_HREF;
  if (studyBuilderLink) studyBuilderLink.href = PUBLIC_STUDY_SETUP_HREF;

  const sceneApp = createSceneApp({
    canvas: document.getElementById("resultsCanvas"),
  });
  bindSceneViewportControls({
    sceneApp,
    getState: () => loadedMetadata?.designState || {},
    exportButton: "exportResultsViewButton",
    exportFileName: "agrivoltaic-results-view.png",
    opacityInput: "resultsOpacityRange",
    opacityValue: "resultsOpacityValue",
    presetButtons: document.querySelectorAll("[data-view-preset]"),
  });
  installHover(sceneApp, hoverCard);

  let loadedDataset = null;
  let loadedMetadata = null;

  function setControlsDisabled(disabled) {
    [metricSelect, heightSelect, startMonth, endMonth].forEach((el) => {
      el.disabled = disabled;
    });
  }

  function populateControls(metadata) {
    metricSelect.innerHTML = "";
    metadata.availableMetrics.forEach((metric) => {
      const option = document.createElement("option");
      option.value = metric;
      option.textContent = metricLabel(metric);
      metricSelect.append(option);
    });

    monthOptions(startMonth, 1);
    monthOptions(endMonth, 12);

    heightSelect.innerHTML = "";
    metadata.heightLevelsM.forEach((height, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = buildHeightLabel(metadata.heightLevelsM, index);
      option.selected = index === 0;
      heightSelect.append(option);
    });
  }

  async function refreshView() {
    if (!loadedDataset || !loadedMetadata) {
      return;
    }

    status.textContent = "Loading irradiance slice…";

    try {
      const view = buildResultsView({
        dataset: loadedDataset,
        metric: metricSelect.value || "annualIrradiance",
        heightIndex: Number(heightSelect.value || 0),
        startMonth: Number(startMonth.value || 1),
        endMonth: Number(endMonth.value || 12),
      });

      sceneApp.setVisualizationOverlay(createResultsOverlay(view, loadedMetadata.heightLevelsM));
      renderLegend(legend, legendUnits, buildLegendStops(view), view.units);
      status.textContent = `${loadedMetadata.job.projectName} • ${gridModeLabel(loadedMetadata.gridMode)} • ${loadedMetadata.weather.providerLabel || loadedMetadata.weather.source}`;

      stats.innerHTML = `
        <div><span>Displayed plane</span><strong>${buildHeightLabel(loadedMetadata.heightLevelsM, view.heightIndex)}</strong></div>
        <div><span>Metric</span><strong>${metricLabel(view.metric)}</strong></div>
        <div><span>Sampling mode</span><strong>${gridModeLabel(loadedMetadata.gridMode)}</strong></div>
        <div><span>Weather source</span><strong>${loadedMetadata.weather.providerLabel || loadedMetadata.weather.source}</strong></div>
        <div><span>Min</span><strong>${view.overall.min.toFixed(2)} ${view.units}</strong></div>
        <div><span>Mean</span><strong>${view.overall.mean.toFixed(2)} ${view.units}</strong></div>
        <div><span>Max</span><strong>${view.overall.max.toFixed(2)} ${view.units}</strong></div>
        <div><span>Site GHI denominator</span><strong>${(view.denominatorGhiWhM2 / 1000).toFixed(2)} kWh/m²</strong></div>
        <div><span>Grids shown</span><strong>${view.grids.length}</strong></div>
      `;

      if (view.edgeInterior) {
        const edgeCard = document.createElement("div");
        edgeCard.className = "edge-summary";
        edgeCard.textContent = `Edge mean ${view.edgeInterior.edgeMean.toFixed(2)} ${view.units} • Interior mean ${view.edgeInterior.interiorMean.toFixed(2)} ${view.units} • Difference ${view.edgeInterior.difference.toFixed(2)} ${view.units}`;
        stats.append(edgeCard);
      }

      if (loadedMetadata.weather.notes?.length) {
        const note = document.createElement("div");
        note.className = "edge-summary";
        note.textContent = loadedMetadata.weather.notes.join(" ");
        stats.append(note);
      }
    } catch (error) {
      sceneApp.clearVisualizationOverlay();
      renderLegend(legend, legendUnits, { gradient: "none", labels: [] }, "");
      stats.innerHTML = "";
      status.textContent = error instanceof Error ? error.message : "Could not load slice view.";
    }
  }

  async function loadSelectedFiles(fileList) {
    const files = [...fileList];
    if (!files.length) {
      status.textContent = "Choose an exported results bundle or the completed package JSON files first.";
      return;
    }

    status.textContent = "Reading uploaded files…";

    try {
      const parsedEntries = await Promise.all(files.map(async (file) => ({
        file,
        payload: await readJsonFile(file),
      })));
      const loaded = normalizeUploadedResults(parsedEntries);
      loadedDataset = loaded.dataset;
      loadedMetadata = loaded.metadata;

      sceneApp.updateLighting(loadedMetadata.designState || {});
      sceneApp.rebuildSystem(loadedMetadata.designState || {});
      sceneApp.setDefaultView(loadedMetadata.designState || {});

      populateControls(loadedMetadata);
      setControlsDisabled(false);
      sourceSummary.textContent = `Loaded ${loaded.sourceLabel}`;
      uploadHint.textContent = "Upload a new bundle at any time to replace the current dataset.";
      await refreshView();
    } catch (error) {
      loadedDataset = null;
      loadedMetadata = null;
      setControlsDisabled(true);
      sceneApp.clearVisualizationOverlay();
      status.textContent = error instanceof Error ? error.message : "Could not read those results files.";
    } finally {
      fileInput.value = "";
    }
  }

  setControlsDisabled(true);
  monthOptions(startMonth, 1);
  monthOptions(endMonth, 12);

  loadButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (event) => {
    await loadSelectedFiles(event.target.files || []);
  });

  [metricSelect, heightSelect, startMonth, endMonth].forEach((el) => {
    el.addEventListener("change", refreshView);
    el.addEventListener("input", refreshView);
  });
}

bootPublicResultsViewerPage().catch((error) => {
  const status = document.getElementById("resultsStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : "Could not load the results viewer.";
  }
});
