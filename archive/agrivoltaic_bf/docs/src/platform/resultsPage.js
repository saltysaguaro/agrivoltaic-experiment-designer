import * as THREE from "three";
import { createSceneApp } from "../scene/scene.js";
import { getAnnualResultsMetadata, getAnnualResultsView, exportAnnualJob } from "./apiClient.js";
import { extractJobId } from "./router.js";
import { createResultsOverlay, buildLegendStops } from "./resultsOverlay.js";
import { bindSceneViewportControls } from "./sceneViewportControls.js";
import { createSessionStore } from "./sessionStore.js";

const session = createSessionStore();

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

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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

async function bootResultsPage() {
  const jobId = extractJobId(window.location.pathname, "/results");
  if (!jobId) {
    document.getElementById("resultsStatus").textContent = "Missing job ID for results.";
    return;
  }

  const projectRoot = session.getProject()?.rootPath;
  const metadata = await getAnnualResultsMetadata(jobId, projectRoot);
  const canvas = document.getElementById("resultsCanvas");
  const hoverCard = document.getElementById("resultsHoverCard");
  const sceneApp = createSceneApp({ canvas });
  const designState = metadata.designState || {};
  sceneApp.updateLighting(designState);
  sceneApp.rebuildSystem(designState);
  sceneApp.setDefaultView(designState);
  bindSceneViewportControls({
    sceneApp,
    getState: () => designState,
    exportButton: "exportResultsViewButton",
    exportFileName: `${jobId}-results-view.png`,
    opacityInput: "resultsOpacityRange",
    opacityValue: "resultsOpacityValue",
    presetButtons: document.querySelectorAll("[data-view-preset]"),
  });
  installHover(sceneApp, hoverCard);

  const metricSelect = document.getElementById("metricSelect");
  const heightSelect = document.getElementById("heightSelect");
  const startMonth = document.getElementById("startMonthSelect");
  const endMonth = document.getElementById("endMonthSelect");
  const stats = document.getElementById("resultsStats");
  const legend = document.getElementById("resultsLegend");
  const legendUnits = document.getElementById("legendUnits");
  const status = document.getElementById("resultsStatus");

  metadata.availableMetrics.forEach((metric) => {
    const option = document.createElement("option");
    option.value = metric;
    option.textContent = metricLabel(metric);
    metricSelect.append(option);
  });

  monthOptions(startMonth, 1);
  monthOptions(endMonth, 12);

  metadata.heightLevelsM.forEach((height, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = buildHeightLabel(metadata.heightLevelsM, index);
    option.selected = index === 0;
    heightSelect.append(option);
  });

  async function refreshView() {
    status.textContent = "Loading irradiance slice…";

    try {
      const view = await getAnnualResultsView(jobId, {
        metric: metricSelect.value || "annualIrradiance",
        heightIndex: Number(heightSelect.value),
        startMonth: Number(startMonth.value),
        endMonth: Number(endMonth.value),
      }, projectRoot);

      sceneApp.setVisualizationOverlay(createResultsOverlay(view, metadata.heightLevelsM));
      renderLegend(legend, legendUnits, buildLegendStops(view), view.units);
      status.textContent = `${metadata.job.projectName} • ${gridModeLabel(metadata.gridMode)} • ${metadata.weather.providerLabel || metadata.weather.source}`;

      stats.innerHTML = `
        <div><span>Displayed plane</span><strong>${buildHeightLabel(metadata.heightLevelsM, view.heightIndex)}</strong></div>
        <div><span>Metric</span><strong>${metricLabel(view.metric)}</strong></div>
        <div><span>Sampling mode</span><strong>${gridModeLabel(metadata.gridMode)}</strong></div>
        <div><span>Weather source</span><strong>${metadata.weather.providerLabel || metadata.weather.source}</strong></div>
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

      if (metadata.weather.notes?.length) {
        const note = document.createElement("div");
        note.className = "edge-summary";
        note.textContent = metadata.weather.notes.join(" ");
        stats.append(note);
      }
    } catch (error) {
      sceneApp.clearVisualizationOverlay();
      renderLegend(legend, legendUnits, { gradient: "none", labels: [] }, "");
      stats.innerHTML = "";
      status.textContent = error instanceof Error ? error.message : "Could not load slice view.";
    }
  }

  [metricSelect, heightSelect, startMonth, endMonth].forEach((el) => {
    el.addEventListener("change", refreshView);
    el.addEventListener("input", refreshView);
  });

  document.getElementById("saveResultsButton").addEventListener("click", async () => {
    downloadJson(`${jobId}-irradiance-results.json`, await exportAnnualJob(jobId, projectRoot));
  });

  await refreshView();
}

bootResultsPage().catch((error) => {
  const status = document.getElementById("resultsStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : "Could not load results.";
  }
});
