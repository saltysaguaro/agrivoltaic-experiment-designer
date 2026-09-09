import { mountDesignerApp } from "../app/main.js";
import { serializeSystemConfig } from "../app/state.js";
import { saveProjectSnapshot } from "./apiClient.js";
import { indexHref, sensorLayoutHref } from "./router.js";
import { bindSceneViewportControls } from "./sceneViewportControls.js";
import { createSessionStore } from "./sessionStore.js";

const session = createSessionStore();

function nextPaint() {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

async function persistProjectSnapshot({ project, site, state, includeDesignState, jobs, lastJobId, sensorSelection }) {
  const snapshot = session.buildProjectSnapshot({
    project,
    site,
    designState: includeDesignState ? state : undefined,
    serializedConfig: includeDesignState ? serializeSystemConfig(state) : undefined,
    sensorSelection,
    lastJobId,
    jobs,
  });
  const result = await saveProjectSnapshot({
    rootPath: project.rootPath,
    snapshot,
  });
  session.applyProjectSnapshot(result.snapshot);
  return result.snapshot;
}

async function bootDesignPage() {
  const project = session.getProject();
  if (!project?.rootPath) {
    window.location.replace(indexHref());
    return;
  }

  const initialState = session.getDesignState() || undefined;
  const app = mountDesignerApp({
    initialState,
    sceneOptions: {
      previewMirrorEastWest: true,
    },
    infoCardHtml: "",
    summaryContext: () => ({
      project: session.getProject(),
      site: session.getSite(),
    }),
    onStateChange(state) {
      session.setDesignState(state);
    },
  });
  await app.boot();

  bindSceneViewportControls({
    sceneApp: app.sceneApp,
    getState: () => app.store.getState(),
    exportButton: "exportDesignViewButton",
    exportFileName: "agrivoltaic-design-view.png",
    presetButtons: document.querySelectorAll("[data-view-preset]"),
  });

  const runButton = document.getElementById("openModelDialogButton");
  const saveProjectButton = document.getElementById("saveProjectButton");
  const launchOverlay = document.getElementById("modelLaunchOverlay");
  const launchText = document.getElementById("modelLaunchText");

  function setLaunchOverlay(message, visible) {
    if (launchText) {
      launchText.textContent = message;
    }
    if (launchOverlay) {
      launchOverlay.hidden = !visible;
    }
  }

  saveProjectButton.addEventListener("click", async () => {
    const state = app.store.getState();
    const originalLabel = saveProjectButton.textContent;
    saveProjectButton.disabled = true;
    saveProjectButton.textContent = "Saving…";
    try {
      await persistProjectSnapshot({
        project: session.getProject(),
        site: session.getSite(),
        state,
        includeDesignState: true,
        sensorSelection: session.getSensorSelection(),
      });
      saveProjectButton.textContent = "Saved";
      window.setTimeout(() => {
        saveProjectButton.textContent = originalLabel;
        saveProjectButton.disabled = false;
      }, 900);
    } catch {
      saveProjectButton.textContent = "Save Failed";
      window.setTimeout(() => {
        saveProjectButton.textContent = originalLabel;
        saveProjectButton.disabled = false;
      }, 1400);
    }
  });

  runButton.addEventListener("click", async () => {
    runButton.disabled = true;
    try {
      const state = app.store.getState();
      const currentProject = session.getProject();
      const currentSite = session.getSite();
      if (!currentSite) {
        throw new Error("Choose a site on the landing page before opening sensor selection.");
      }

      setLaunchOverlay("Saving the current design so the sensor layout can be configured on top of this exact geometry.", true);
      await nextPaint();
      await persistProjectSnapshot({
        project: currentProject,
        site: currentSite,
        state,
        includeDesignState: true,
        sensorSelection: session.getSensorSelection(),
      });

      setLaunchOverlay("Opening the sensor selection workspace for this design.", true);
      await nextPaint();
      window.location.assign(sensorLayoutHref());
    } catch (error) {
      setLaunchOverlay("", false);
      runButton.disabled = false;
      const summaryNote = document.getElementById("summaryNote");
      if (summaryNote) {
        summaryNote.textContent = error instanceof Error ? error.message : "Could not open the sensor selection workspace.";
      }
    }
  });
}

bootDesignPage();
