import {
  BUFFER_KEYS,
  DISPLAY_ONLY_KEYS,
  GROUND_ONLY_KEYS,
  HEATMAP_KEYS,
  LIGHT_UPDATE_KEYS,
  STRUCTURAL_KEYS,
} from "../utils/constants.js";
import { debounce } from "../utils/math.js";
import { serializeSystemConfig } from "./state.js";
import {
  applySimulationResults,
  describeSimulationStatus,
  requestSimulation,
} from "../services/simulationService.js";

function hasOnlyKeys(changedKeys, keys) {
  return changedKeys.length > 0 && changedKeys.every((key) => keys.has(key));
}

export function createAppController({
  store,
  bindings,
  summaryPanel,
  sceneApp,
  overlayElements,
}) {
  let lastSimulationResults = null;

  function renderOverlay(sceneSummary) {
    if (!overlayElements?.title || !overlayElements?.body || !sceneSummary) return;
    overlayElements.title.textContent = sceneSummary.title;
    overlayElements.body.textContent = `${sceneSummary.subtitle} • Orbit: drag • Zoom: scroll • Pan: right-drag`;
  }

  async function syncHeatmap(state) {
    if (state.showHeatmap !== "on") {
      lastSimulationResults = null;
      sceneApp.clearIrradianceGrid();
      return;
    }

    const config = serializeSystemConfig(state);
    const descriptor = sceneApp.getTileDescriptor();
    const results = await requestSimulation(config, descriptor);
    lastSimulationResults = results;
    applySimulationResults(sceneApp.getGroundSystem(), results);
  }

  function renderSummary(state, sceneSummary) {
    summaryPanel.render({
      state,
      sceneSummary,
      simulationStatus: describeSimulationStatus(state, lastSimulationResults),
    });

    const cropSummary = sceneSummary?.cropSummary;
    let cropWarning = "";
    if (cropSummary) {
      if (cropSummary.cropRowsAvailable === 0 || cropSummary.cropRowWidth <= 0) {
        cropWarning = "No plantable crop row is available with the current row spacing and crop row buffer.";
      } else if (cropSummary.bedConstraintActive) {
        cropWarning = `Only ${cropSummary.plantedBedsPerRow} of ${cropSummary.cropBedsPerRow} requested crop beds fit within the available crop row.`;
      }
    }
    bindings.setSectionNotice("crop", {
      message: cropWarning,
      tone: "warning",
    });
  }

  const debouncedRebuild = debounce(async (state, meta = {}) => {
    sceneApp.updateLighting(state);
    const sceneSummary = sceneApp.rebuildSystem(state);
    renderOverlay(sceneSummary);
    if (state.showHeatmap === "on") {
      await syncHeatmap(state);
    } else {
      lastSimulationResults = null;
      sceneApp.clearIrradianceGrid();
    }
    renderSummary(state, sceneSummary);

    if (meta.refit) sceneApp.fitViewAll();
    if (meta.defaultView) sceneApp.setDefaultView(state);
  }, 40);

  store.subscribe(async (state, meta = {}) => {
    const changedKeys = meta.changedKeys || [];

    if (!changedKeys.length) {
      debouncedRebuild(state, meta);
      return;
    }

    if (hasOnlyKeys(changedKeys, LIGHT_UPDATE_KEYS)) {
      sceneApp.updateLighting(state);
      if (state.showHeatmap === "on") {
        await syncHeatmap(state);
      }
      const summary = sceneApp.getSceneSummary();
      if (summary) renderSummary(state, summary);
      return;
    }

    if (hasOnlyKeys(changedKeys, GROUND_ONLY_KEYS)) {
      sceneApp.updateGround(state);
      const summary = sceneApp.getSceneSummary();
      if (summary) {
        if (state.showHeatmap === "on") await syncHeatmap(state);
        renderSummary(state, summary);
      }
      return;
    }

    if (hasOnlyKeys(changedKeys, BUFFER_KEYS)) {
      const summary = sceneApp.getSceneSummary();
      sceneApp.updateBuffers(state, summary);
      if (summary) renderSummary(state, summary);
      return;
    }

    if (hasOnlyKeys(changedKeys, DISPLAY_ONLY_KEYS)) {
      const summary = sceneApp.getSceneSummary();
      if (summary) renderSummary(state, summary);
      return;
    }

    if (hasOnlyKeys(changedKeys, HEATMAP_KEYS) && !changedKeys.some((key) => STRUCTURAL_KEYS.has(key))) {
      sceneApp.updateGround(state);
      if (state.showHeatmap === "on") {
        await syncHeatmap(state);
      } else {
        lastSimulationResults = null;
        sceneApp.clearIrradianceGrid();
      }
      const summary = sceneApp.getSceneSummary();
      if (summary) renderSummary(state, summary);
      return;
    }

    debouncedRebuild(state, meta);
  });

  bindings.onFields((key, value, meta = {}) => {
    const nextState = store.setState({ [key]: value });
    if (meta.commit) {
      bindings.setValues(nextState);
    }
    bindings.applyVisibility(nextState);
  });

  bindings.onAction("reset", () => {
    const nextState = store.reset({ defaultView: true });
    bindings.setValues(nextState);
    bindings.applyVisibility(nextState);
  });

  bindings.onAction("fit", () => {
    sceneApp.fitViewAll();
  });

  bindings.onAction("export", () => {
    sceneApp.exportSnapshot();
  });

  window.addEventListener("resize", () => sceneApp.resize());

  async function boot() {
    const state = store.getState();
    bindings.setValues(state);
    bindings.applyVisibility(state);
    sceneApp.updateLighting(state);
    const sceneSummary = sceneApp.rebuildSystem(state);
    if (state.showHeatmap === "on") {
      await syncHeatmap(state);
    }
    sceneApp.setDefaultView(state);
    renderOverlay(sceneSummary);
    renderSummary(state, sceneSummary);
  }

  store.subscribe((state, meta) => {
    if (meta.changedKeys?.includes("systemType")) {
      bindings.setValues(state);
    }
    bindings.applyVisibility(state);
  });

  return {
    boot,
  };
}
