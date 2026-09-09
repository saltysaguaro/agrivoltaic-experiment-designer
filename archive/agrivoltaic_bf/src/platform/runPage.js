import { getAnnualJobLogs, getAnnualJobStatus } from "./apiClient.js";
import { designHref, extractJobId, resultsHref } from "./router.js";
import { createSessionStore } from "./sessionStore.js";

const session = createSessionStore();

function labelForPhase(phase) {
  switch (phase) {
    case "preparing_geometry": return "Preparing export geometry";
    case "acquiring_weather": return "Acquiring TMY weather";
    case "generating_tracker_states": return "Generating tracker and solar states";
    case "building_scene": return "Building irradiance analysis scene";
    case "running_simulation": return "Running irradiance model locally";
    case "post_processing": return "Post-processing irradiance results";
    case "completed": return "Irradiance model complete";
    case "failed": return "Irradiance model failed";
    default: return "Queued";
  }
}

function labelForGridMode(mode) {
  switch (mode) {
    case "centerArrayGrid": return "Central Grid";
    case "centralRowGrid": return "Central Row";
    case "fullArrayGrid": return "Custom full-array layout";
    default: return mode;
  }
}

function labelForWeatherSource(source) {
  switch (source) {
    case "nsrdb_tmy": return "NSRDB GOES TMY";
    case "pvgis_tmy": return "PVGIS TMY";
    case "synthetic_fallback": return "Synthetic fallback weather";
    default: return source || "pending";
  }
}

function formatDuration(startIso, endIso = new Date().toISOString()) {
  if (!startIso) return "pending";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "pending";

  const totalSeconds = Math.max(0, Math.round((end - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

async function bootRunPage() {
  const jobId = extractJobId(window.location.pathname, "/model/run");
  const title = document.getElementById("runPageTitle");
  const detail = document.getElementById("runPageDetail");
  const progressBar = document.getElementById("runProgressBar");
  const meta = document.getElementById("runMeta");
  const resultsButton = document.getElementById("openResultsButton");
  const backButton = document.getElementById("returnDesignButton");
  const logOutput = document.getElementById("runLogOutput");
  const logStatus = document.getElementById("runLogStatus");

  if (!jobId) {
    title.textContent = "Missing job ID";
    detail.textContent = "Return to the design page and launch the model again.";
    backButton.href = designHref();
    return;
  }

  backButton.href = designHref();
  resultsButton.href = resultsHref(jobId);

  async function refreshLogs(job) {
    try {
      const payload = await getAnnualJobLogs(jobId, session.getProject()?.rootPath);
      if (logOutput) {
        logOutput.textContent = payload.tail || "No log output yet.";
        logOutput.scrollTop = logOutput.scrollHeight;
      }
      if (logStatus) {
        const progress = payload.progress;
        if (progress && typeof progress === "object") {
          const completed = Number(progress.completed ?? 0);
          const total = Number(progress.total ?? 0);
          const message = typeof progress.message === "string" ? progress.message : "Runner progress is available.";
          logStatus.textContent = total > 0 ? `${message} (${completed}/${total})` : message;
          if (job?.phase === "running_simulation" && Number.isFinite(total) && total > 0) {
            const runnerFraction = Math.max(0, Math.min(1, completed / total));
            const visualProgress = 0.68 + (0.22 * runnerFraction);
            progressBar.style.width = `${Math.round(Math.max(job.progress, visualProgress) * 100)}%`;
          }
        } else {
          logStatus.textContent = payload.lineCount > 0 ? `Showing the latest ${payload.lineCount} log lines.` : "Waiting for the local runner to start.";
        }
      }
    } catch (error) {
      if (logStatus) {
        logStatus.textContent = error instanceof Error ? error.message : "Could not load model output.";
      }
    }
  }

  async function refresh() {
    try {
      const job = await getAnnualJobStatus(jobId, session.getProject()?.rootPath);
      title.textContent = labelForPhase(job.phase);
      detail.textContent = job.error || job.notes?.at(-1) || `Project: ${job.projectName}`;
      progressBar.style.width = `${Math.round(job.progress * 100)}%`;
      meta.innerHTML = `
        <div><span>Site</span><strong>${job.site.label}</strong></div>
        <div><span>Grid mode</span><strong>${labelForGridMode(job.gridMode)}</strong></div>
        <div><span>Engine</span><strong>${job.engine}</strong></div>
        <div><span>Weather</span><strong>${labelForWeatherSource(job.weatherSource)}</strong></div>
        <div><span>Created</span><strong>${new Date(job.createdAt).toLocaleString()}</strong></div>
        <div><span>Started</span><strong>${job.startedAt ? new Date(job.startedAt).toLocaleString() : "pending"}</strong></div>
        <div><span>Elapsed</span><strong>${job.status === "completed" ? formatDuration(job.startedAt, job.completedAt) : formatDuration(job.startedAt)}</strong></div>
        <div><span>Total model time</span><strong>${job.completedAt ? formatDuration(job.startedAt, job.completedAt) : "pending"}</strong></div>
        <div><span>Status</span><strong>${job.status}</strong></div>
      `;
      await refreshLogs(job);

      if (job.status === "completed") {
        resultsButton.hidden = false;
        detail.textContent = `Irradiance outputs are ready for 3D review. Total model time: ${formatDuration(job.startedAt, job.completedAt)}.`;
        return true;
      }

      if (job.status === "failed") {
        resultsButton.hidden = true;
        detail.textContent = job.error || "The model failed. Review the message and try again from the design page.";
        return true;
      }

      return false;
    } catch (error) {
      title.textContent = "Could not load job status";
      detail.textContent = error instanceof Error ? error.message : "Unknown status error";
      if (logStatus) {
        logStatus.textContent = detail.textContent;
      }
      return true;
    }
  }

  const done = await refresh();
  if (done) return;

  const interval = window.setInterval(async () => {
    const finished = await refresh();
    if (finished) {
      window.clearInterval(interval);
    }
  }, 2500);
}

bootRunPage();
