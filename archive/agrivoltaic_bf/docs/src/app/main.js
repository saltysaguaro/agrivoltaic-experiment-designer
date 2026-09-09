import { createBindings } from "../ui/bindings.js";
import { INPUT_SECTIONS } from "../ui/inputSchema.js";
import { createSummaryPanel } from "../ui/summaryPanel.js";
import { createStateStore } from "./state.js";
import { createSceneApp } from "../scene/scene.js";
import { createAppController } from "./events.js";

const DEFAULT_INFO_CARD_HTML = `
  <div class="panel-header">
    <div>
      <p class="eyebrow">Run Locally</p>
      <h2>Static Site Workflow</h2>
    </div>
  </div>
  <p class="section-copy">
    The app stays browser-native and import-map friendly. Serve the folder over HTTP rather than opening it with <span class="mono">file://</span>.
  </p>
  <ul class="info-list">
    <li><span class="mono">python -m http.server 8000</span></li>
    <li><span class="mono">npx http-server .</span></li>
    <li>Open <span class="mono">http://localhost:8000</span></li>
  </ul>
`;

function resolveElement(value) {
  if (!value) return null;
  if (typeof value === "string") return document.getElementById(value);
  return value;
}

function resolveElements(overrides = {}) {
  return {
    leftRail: resolveElement(overrides.leftRail) ?? document.getElementById("leftRail"),
    rightRail: resolveElement(overrides.rightRail) ?? document.getElementById("rightRail"),
    summaryGrid: resolveElement(overrides.summaryGrid) ?? document.getElementById("summaryGrid"),
    summaryNote: resolveElement(overrides.summaryNote) ?? document.getElementById("summaryNote"),
    canvas: resolveElement(overrides.canvas) ?? document.getElementById("viewportCanvas"),
    overlayTitle: resolveElement(overrides.overlayTitle) ?? document.getElementById("overlayTitle"),
    overlayBody: resolveElement(overrides.overlayBody) ?? document.getElementById("overlayBody"),
  };
}

export function mountDesignerApp(options = {}) {
  const elements = resolveElements(options.elements);
  if (!elements.leftRail || !elements.rightRail || !elements.summaryGrid || !elements.summaryNote || !elements.canvas) {
    throw new Error("Designer mount is missing required DOM elements");
  }

  const store = createStateStore(options.initialState ?? {});
  const bindings = createBindings({
    sections: options.sections ?? INPUT_SECTIONS,
    leftRail: elements.leftRail,
    rightRail: elements.rightRail,
    infoCardHtml: options.infoCardHtml ?? DEFAULT_INFO_CARD_HTML,
  });
  const summaryPanel = createSummaryPanel(
    elements.summaryGrid,
    elements.summaryNote,
    options.summaryContext,
  );
  const sceneApp = createSceneApp({
    canvas: elements.canvas,
    ...(options.sceneOptions || {}),
  });

  const controller = createAppController({
    store,
    bindings,
    summaryPanel,
    sceneApp,
    overlayElements: {
      title: elements.overlayTitle,
      body: elements.overlayBody,
    },
  });

  const unsubscribe = store.subscribe((state, meta) => {
    options.onStateChange?.(state, meta);
    options.onSceneSummary?.(sceneApp.getSceneSummary(), state, meta);
  });

  return {
    store,
    bindings,
    summaryPanel,
    sceneApp,
    controller,
    async boot() {
      await controller.boot();
      options.onReady?.({
        store,
        bindings,
        summaryPanel,
        sceneApp,
        controller,
      });
      return {
        store,
        bindings,
        summaryPanel,
        sceneApp,
        controller,
      };
    },
    destroy() {
      unsubscribe();
    },
  };
}
