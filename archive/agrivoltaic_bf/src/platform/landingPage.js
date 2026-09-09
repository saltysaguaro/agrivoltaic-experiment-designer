import { mountSiteAutocomplete } from "./mapboxAutocomplete.js";
import {
  importHpcResults,
  openProjectFolder,
  pickHpcResultsFolder,
  pickProjectFolder,
  saveProjectSnapshot,
} from "./apiClient.js";
import { createSessionStore } from "./sessionStore.js";
import { designHref, resultsHref } from "./router.js";

const session = createSessionStore();
const SITE_PRESETS = [
  {
    id: "golden-co",
    address: "Golden, Colorado, United States",
    label: "Golden, Colorado",
    latitude: 39.7555,
    longitude: -105.2211,
    timezone: "America/Denver",
    region: "Colorado",
    country: "United States",
  },
  {
    id: "tucson-az",
    address: "Tucson, Arizona, United States",
    label: "Tucson, Arizona",
    latitude: 32.2226,
    longitude: -110.9747,
    timezone: "America/Phoenix",
    region: "Arizona",
    country: "United States",
  },
  {
    id: "san-francisco-ca",
    address: "San Francisco, California, United States",
    label: "San Francisco, California",
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: "America/Los_Angeles",
    region: "California",
    country: "United States",
  },
  {
    id: "new-york-ny",
    address: "New York, New York, United States",
    label: "New York, New York",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    region: "New York",
    country: "United States",
  },
  {
    id: "austin-tx",
    address: "Austin, Texas, United States",
    label: "Austin, Texas",
    latitude: 30.2672,
    longitude: -97.7431,
    timezone: "America/Chicago",
    region: "Texas",
    country: "United States",
  },
  {
    id: "chicago-il",
    address: "Chicago, Illinois, United States",
    label: "Chicago, Illinois",
    latitude: 41.8781,
    longitude: -87.6298,
    timezone: "America/Chicago",
    region: "Illinois",
    country: "United States",
  },
];

function approximateTimezoneFromLongitude(longitude) {
  if (longitude <= -157) return "Pacific/Honolulu";
  if (longitude <= -123) return "America/Los_Angeles";
  if (longitude <= -111) return "America/Phoenix";
  if (longitude <= -101) return "America/Denver";
  if (longitude <= -85) return "America/Chicago";
  if (longitude <= -66) return "America/New_York";
  return "UTC";
}

function buildManualSite(address, latitude, longitude) {
  return {
    address,
    label: address,
    latitude,
    longitude,
    timezone: approximateTimezoneFromLongitude(longitude),
    source: "manual",
  };
}

function mapboxSuggestionToSite(site) {
  return {
    address: site.fullAddress,
    label: site.label,
    latitude: site.latitude,
    longitude: site.longitude,
    timezone: site.timezone,
    region: site.region,
    country: site.country,
    source: "mapbox",
  };
}

function presetToSite(preset) {
  return {
    address: preset.address,
    label: preset.label,
    latitude: preset.latitude,
    longitude: preset.longitude,
    timezone: preset.timezone,
    region: preset.region,
    country: preset.country,
    source: "fallback",
  };
}

function parentFolderPath(path) {
  const normalized = String(path || "").replace(/[\\/]+$/, "");
  const lastSlash = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));
  return lastSlash > 0 ? normalized.slice(0, lastSlash) : normalized;
}

async function readJsonFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

function mostRecentCompletedJob(snapshot) {
  const jobs = Object.values(snapshot?.jobs || {});
  const completed = jobs.filter((job) => job?.status === "completed");
  if (!completed.length) return null;
  return completed.sort((a, b) => {
    const timeA = Date.parse(a.completedAt || a.updatedAt || a.createdAt || 0);
    const timeB = Date.parse(b.completedAt || b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  })[0] || null;
}

function bindLandingState({ resolveTypedSite } = {}) {
  const proceedButton = document.getElementById("goToDesignButton");
  const addressInput = document.getElementById("siteAddressInput");
  const latitudeInput = document.getElementById("manualLatitude");
  const longitudeInput = document.getElementById("manualLongitude");
  const manualButton = document.getElementById("manualSiteButton");
  const siteSummary = document.getElementById("siteSummary");
  const siteLookupStatus = document.getElementById("siteLookupStatus");
  const projectNameInput = document.getElementById("landingProjectName");
  const projectFolderInput = document.getElementById("projectFolderInput");
  const browseProjectFolderButton = document.getElementById("browseProjectFolderButton");
  const useProjectFolderButton = document.getElementById("useProjectFolderButton");
  const loadProjectButton = document.getElementById("loadProjectButton");
  const importHpcResultsButton = document.getElementById("importHpcResultsButton");
  const viewExistingResultsButton = document.getElementById("viewExistingResultsButton");
  const projectFileInput = document.getElementById("projectFileInput");
  const projectStatus = document.getElementById("projectStatus");
  const projectSummary = document.getElementById("projectSummary");
  const presetButtons = [...document.querySelectorAll("[data-site-preset]")];

  let currentSite = null;
  let currentProject = null;
  let currentCompletedJob = null;

  projectNameInput.value = "Agrivoltaic Study";
  projectFolderInput.value = "";

  function syncProceedState() {
    proceedButton.disabled = !(currentProject && currentSite);
    importHpcResultsButton.disabled = !currentProject;
  }

  function updateProjectSummary(project = currentProject) {
    currentProject = project;
    if (!project) {
      projectSummary.textContent = "No project selected yet.";
      currentCompletedJob = null;
      viewExistingResultsButton.disabled = true;
      syncProceedState();
      return;
    }
    projectSummary.textContent = currentCompletedJob
      ? `${project.name} • ${project.rootPath} • results ready`
      : `${project.name} • ${project.rootPath}`;
    projectNameInput.value = project.name;
    projectFolderInput.value = parentFolderPath(project.rootPath);
    viewExistingResultsButton.disabled = !currentCompletedJob;
    syncProceedState();
  }

  function applySnapshot(snapshot) {
    session.applyProjectSnapshot(snapshot);
    currentProject = snapshot.project;
    currentSite = snapshot.site ?? currentSite;
    currentCompletedJob = mostRecentCompletedJob(snapshot);
    updateProjectSummary(currentProject);
    updateSiteSummary(currentSite);
  }

  function updateSiteSummary(site = currentSite) {
    currentSite = site;
    if (!site) {
      siteSummary.textContent = "Choose a site with Mapbox autocomplete, use a preset, or enter coordinates manually.";
      syncProceedState();
      return;
    }

    siteSummary.textContent = `${site.label} • ${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)} • ${site.timezone}`;
    syncProceedState();
  }

  async function persistProjectMetadata(site = currentSite) {
    if (!currentProject?.rootPath) return;
    const projectName = projectNameInput.value.trim() || currentProject.name;
    currentProject = {
      ...currentProject,
      name: projectName,
    };
    session.setProject(currentProject);
    session.setProjectName(projectName);
    await saveProjectSnapshot({
      rootPath: currentProject.rootPath,
      snapshot: {
        project: currentProject,
        site,
      },
    });
  }

  browseProjectFolderButton.addEventListener("click", async () => {
    browseProjectFolderButton.disabled = true;
    projectStatus.textContent = "Opening the local folder picker…";
    try {
      const result = await pickProjectFolder();
      projectFolderInput.value = result.folderPath || "";
      projectStatus.textContent = result.folderPath
        ? "Project parent folder selected."
        : "Choose a project parent folder.";
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not open the folder picker.";
    } finally {
      browseProjectFolderButton.disabled = false;
    }
  });

  useProjectFolderButton.addEventListener("click", async () => {
    const rootPath = projectFolderInput.value.trim();
    const projectName = projectNameInput.value.trim() || session.getProjectName();
    projectStatus.textContent = "Setting the project folder…";
    useProjectFolderButton.disabled = true;

    try {
      const result = await openProjectFolder({
        rootPath,
        projectName,
      });
      applySnapshot(result.snapshot);
      projectStatus.textContent = result.exists
        ? "Loaded the saved project snapshot from this project folder."
        : "Created a new project folder and saved its initial project snapshot.";
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not open the project folder.";
    } finally {
      useProjectFolderButton.disabled = false;
    }
  });

  loadProjectButton.addEventListener("click", () => projectFileInput.click());
  projectFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    projectStatus.textContent = "Loading the saved project snapshot…";

    try {
      const snapshot = await readJsonFile(file);
      applySnapshot(snapshot);
      projectStatus.textContent = "Loaded the saved project snapshot.";
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not load the selected project file.";
    } finally {
      event.target.value = "";
    }
  });

  importHpcResultsButton.addEventListener("click", async () => {
    if (!currentProject?.rootPath) {
      projectStatus.textContent = "Choose a project folder before importing HPC results.";
      return;
    }

    importHpcResultsButton.disabled = true;
    projectStatus.textContent = "Choose the completed HPC results package folder…";
    try {
      const selection = await pickHpcResultsFolder();
      if (!selection.folderPath) {
        projectStatus.textContent = "Choose a completed HPC results package folder to import.";
        return;
      }

      projectStatus.textContent = "Importing the completed HPC results into this project…";
      const result = await importHpcResults({
        rootPath: currentProject.rootPath,
        packageRoot: selection.folderPath,
      });
      applySnapshot(result.snapshot);
      currentCompletedJob = result.importedJob;
      if (!currentSite && result.importedJob?.site) {
        currentSite = result.importedJob.site;
        session.setSite(currentSite);
        updateSiteSummary(currentSite);
      }
      session.setProject(result.snapshot.project);
      session.setProjectName(result.snapshot.project.name);
      if (currentSite) {
        session.setSite(currentSite);
      }
      session.rememberJob(result.importedJob);
      projectStatus.textContent = `Imported HPC results from ${selection.folderPath}.`;
      window.location.assign(resultsHref(result.importedJob.jobId));
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not import the HPC results package.";
    } finally {
      importHpcResultsButton.disabled = !currentProject;
    }
  });

  projectNameInput.addEventListener("input", () => {
    const projectName = projectNameInput.value.trim() || "Agrivoltaic Study";
    session.setProjectName(projectName);
    if (currentProject) {
      currentProject = {
        ...currentProject,
        name: projectName,
      };
      session.setProject(currentProject);
      updateProjectSummary(currentProject);
    }
  });

  projectFolderInput.addEventListener("input", () => {
    if (currentProject) {
      currentProject = null;
      projectSummary.textContent = "No project selected yet.";
      syncProceedState();
    }
  });

  manualButton.addEventListener("click", async () => {
    const latitude = Number(latitudeInput.value);
    const longitude = Number(longitudeInput.value);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      siteSummary.textContent = "Enter numeric latitude and longitude values for manual site entry.";
      return;
    }

    const site = buildManualSite(addressInput.value.trim() || "Manual site", latitude, longitude);
    session.setSite(site);
    updateSiteSummary(site);
    try {
      await persistProjectMetadata(site);
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not update the project snapshot.";
    }
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const preset = SITE_PRESETS.find((entry) => entry.id === button.dataset.sitePreset);
      if (!preset) return;

      const site = presetToSite(preset);
      addressInput.value = preset.address;
      latitudeInput.value = preset.latitude.toFixed(4);
      longitudeInput.value = preset.longitude.toFixed(4);
      siteLookupStatus.textContent = `${preset.label} loaded from preset coordinates.`;
      session.setSite(site);
      updateSiteSummary(site);
      try {
        await persistProjectMetadata(site);
      } catch (error) {
        projectStatus.textContent = error instanceof Error ? error.message : "Could not update the project snapshot.";
      }
    });
  });

  proceedButton.addEventListener("click", async () => {
    if (!currentProject) {
      projectStatus.textContent = "Choose a project folder or load a saved project before continuing.";
      return;
    }
    if (!currentSite && addressInput.value.trim() && typeof resolveTypedSite === "function") {
      try {
        const suggestion = await resolveTypedSite();
        if (!currentSite && suggestion) {
          const site = mapboxSuggestionToSite(suggestion);
          session.setSite(site);
          updateSiteSummary(site);
        }
      } catch (error) {
        siteLookupStatus.textContent = error instanceof Error ? error.message : "Mapbox could not verify that address.";
        siteSummary.textContent = "Choose a verified Mapbox site or enter coordinates manually before opening the designer.";
        return;
      }
    }
    if (!currentSite) {
      siteSummary.textContent = "Choose a verified Mapbox site or enter coordinates manually before opening the designer.";
      return;
    }

    session.setProject(currentProject);
    session.setSite(currentSite);
    session.setProjectName(currentProject.name);

    try {
      await persistProjectMetadata(currentSite);
    } catch (error) {
      projectStatus.textContent = error instanceof Error ? error.message : "Could not update the project snapshot.";
      return;
    }

    window.location.assign(designHref());
  });

  viewExistingResultsButton.addEventListener("click", () => {
    if (!currentProject) {
      projectStatus.textContent = "Load a project before trying to visualize saved results.";
      return;
    }
    if (!currentCompletedJob?.jobId) {
      projectStatus.textContent = "This project does not have any completed modeled results yet.";
      return;
    }

    session.setProject(currentProject);
    if (currentSite) {
      session.setSite(currentSite);
    }
    session.setProjectName(currentProject.name);
    session.rememberJob(currentCompletedJob);
    window.location.assign(resultsHref(currentCompletedJob.jobId));
  });

  session.setProject(null);
  session.setSite(null);
  session.setDesignState(null);
  session.setSensorSelection(null);
  session.setProjectName("Agrivoltaic Study");

  updateProjectSummary(currentProject);
  updateSiteSummary(currentSite);

  return {
    async onSiteSelected(site) {
      session.setSite(site);
      updateSiteSummary(site);
      try {
        await persistProjectMetadata(site);
      } catch (error) {
        projectStatus.textContent = error instanceof Error ? error.message : "Could not update the project snapshot.";
      }
    },
    clearMapboxSiteSelection() {
      if (currentSite?.source !== "mapbox") return;
      session.setSite(null);
      updateSiteSummary(null);
    },
  };
}

async function bootLanding() {
  let landingState = null;
  const autocomplete = await mountSiteAutocomplete({
    input: document.getElementById("siteAddressInput"),
    suggestionsEl: document.getElementById("siteSuggestions"),
    statusEl: document.getElementById("siteLookupStatus"),
    onPendingSelection() {
      landingState?.clearMapboxSiteSelection();
    },
    onSelect(site, provider) {
      if (provider !== "mapbox") return;
      return landingState?.onSiteSelected(mapboxSuggestionToSite(site));
    },
  });
  landingState = bindLandingState({
    resolveTypedSite: autocomplete.resolveExactInput,
  });
}

bootLanding();
