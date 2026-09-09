import { z } from "zod";
import {
  annualSimulationRequestSchema,
  sensorSelectionStateSchema,
} from "@agrivoltaic/shared";

const publicStudyBundleSchema = z.object({
  format: z.literal("agrivoltaic-study-bundle"),
  version: z.literal(1),
  createdAt: z.string(),
  request: annualSimulationRequestSchema,
  sensorSelection: sensorSelectionStateSchema,
});

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function slugifyLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "agrivoltaic-study";
}

export function buildPublicStudyBundle({ request, sensorSelection }) {
  return publicStudyBundleSchema.parse({
    format: "agrivoltaic-study-bundle",
    version: 1,
    createdAt: new Date().toISOString(),
    request,
    sensorSelection,
  });
}

export function parsePublicStudyBundle(value) {
  if (value?.format === "agrivoltaic-study-bundle") {
    return publicStudyBundleSchema.parse(value);
  }

  const request = annualSimulationRequestSchema.parse(value);
  return publicStudyBundleSchema.parse({
    format: "agrivoltaic-study-bundle",
    version: 1,
    createdAt: new Date().toISOString(),
    request,
    sensorSelection: {
      config: request.sensorConfig,
      selectedSensorIds: request.selectedSensorIds ?? [],
      selectedHeightIndex: 0,
      simulationQualityPreset: request.simulationQualityPreset,
    },
  });
}

export function applyStudyBundleToSession(session, bundle) {
  session.save({
    projectName: bundle.request.projectName,
    site: bundle.request.site,
    designState: bundle.request.designState,
    sensorSelection: bundle.sensorSelection,
  });
}

export function downloadPublicStudyBundle(bundle, explicitName) {
  const fallbackName = `${slugifyLabel(bundle.request.projectName)}-study-bundle.json`;
  downloadJson(explicitName || fallbackName, bundle);
}
