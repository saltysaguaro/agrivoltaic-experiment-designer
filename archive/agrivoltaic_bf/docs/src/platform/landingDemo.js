import { createSceneApp } from "../scene/scene.js";
import { DEFAULTS } from "../utils/constants.js";

export function mountLandingDemo(canvas) {
  const sceneApp = createSceneApp({ canvas });
  const demoState = {
    ...DEFAULTS,
    systemType: "fixed",
    dcSizeKw: 55,
    config: "1P",
    rowSpacing: 9.75,
    cropBedsPerRow: 3,
    cropType: "pepper",
    plantSpacingIn: 24,
    arrayEdgeBuffer: 9.144,
    cropRowBuffer: 0.3048,
    showHeatmap: "off",
    showBuffers: "off",
    groundSize: 180,
    sunAz: 215,
    sunEl: 34,
  };

  sceneApp.updateLighting(demoState);
  sceneApp.rebuildSystem(demoState);
  sceneApp.setDefaultView(demoState);
  return sceneApp;
}
