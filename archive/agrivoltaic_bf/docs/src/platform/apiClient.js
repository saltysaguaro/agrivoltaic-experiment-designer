function resolveApiBaseUrl() {
  const override = window.localStorage.getItem("agrivoltaic-api-base");
  if (override) return override.replace(/\/+$/, "");
  if (window.location.port === "8787") return window.location.origin;
  return "http://localhost:8787";
}

async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(`${resolveApiBaseUrl()}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(
      `Could not reach the local backend at ${resolveApiBaseUrl()}. Start it with \`corepack pnpm start:backend\` and try again.`
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function getClientConfig() {
  return requestJson("/api/config/client");
}

export function openProjectFolder(payload) {
  return requestJson("/api/projects/open", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function pickProjectFolder() {
  return requestJson("/api/projects/pick-folder", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function pickHpcResultsFolder() {
  return requestJson("/api/projects/pick-hpc-folder", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function saveProjectSnapshot(payload) {
  return requestJson("/api/projects/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function importHpcResults(payload) {
  return requestJson("/api/projects/import-hpc-results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function autocompleteSite(query) {
  return requestJson(`/api/site/autocomplete?q=${encodeURIComponent(query)}`);
}

export function resolveSite(query) {
  return requestJson(`/api/site/resolve?q=${encodeURIComponent(query)}`);
}

export function createAnnualJob(payload) {
  return requestJson("/api/jobs/annual", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function exportRunAnywherePackage(payload) {
  return requestJson("/api/jobs/export-run-anywhere", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function withProjectRoot(path, projectRoot) {
  if (!projectRoot) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}projectRoot=${encodeURIComponent(projectRoot)}`;
}

export function getAnnualJob(jobId, projectRoot) {
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}`, projectRoot));
}

export function getAnnualJobStatus(jobId, projectRoot) {
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}/status`, projectRoot));
}

export function getAnnualJobLogs(jobId, projectRoot) {
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}/logs`, projectRoot));
}

export function getAnnualResultsMetadata(jobId, projectRoot) {
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}/results/metadata`, projectRoot));
}

export function getAnnualResultsView(jobId, params, projectRoot) {
  const query = new URLSearchParams();
  query.set("metric", params.metric);
  query.set("heightIndex", String(params.heightIndex));
  query.set("startMonth", String(params.startMonth));
  query.set("endMonth", String(params.endMonth));
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}/results/view?${query.toString()}`, projectRoot));
}

export function exportAnnualJob(jobId, projectRoot) {
  return requestJson(withProjectRoot(`/api/jobs/${encodeURIComponent(jobId)}/export`, projectRoot));
}
