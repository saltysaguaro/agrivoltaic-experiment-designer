import { approximateTimezoneFromLongitude } from "./solarPosition.js";
import { mountPublicSiteLookup, normalizeConfiguredSite } from "./publicMapbox.js";
import { applyStudyBundleToSession, parsePublicStudyBundle } from "./publicStudyBundle.js";
import {
  PUBLIC_RESULTS_VIEWER_HREF,
  PUBLIC_STUDY_DESIGN_HREF,
} from "./publicStudyRoutes.js";
import { createPublicStudySession } from "./publicStudySession.js";

const session = createPublicStudySession();

const SITE_PRESETS = [
  {
    id: "golden-co",
    label: "Golden, Colorado",
    address: "Golden, Colorado, United States",
    fullAddress: "Golden, Colorado, United States",
    latitude: 39.7555,
    longitude: -105.2211,
    timezone: "America/Denver",
    region: "Colorado",
    regionCode: "US-CO",
    country: "United States",
    countryCode: "us",
    timezoneApproximate: false,
  },
  {
    id: "tucson-az",
    label: "Tucson, Arizona",
    address: "Tucson, Arizona, United States",
    fullAddress: "Tucson, Arizona, United States",
    latitude: 32.2226,
    longitude: -110.9747,
    timezone: "America/Phoenix",
    region: "Arizona",
    regionCode: "US-AZ",
    country: "United States",
    countryCode: "us",
    timezoneApproximate: false,
  },
  {
    id: "fresno-ca",
    label: "Fresno, California",
    address: "Fresno, California, United States",
    fullAddress: "Fresno, California, United States",
    latitude: 36.7378,
    longitude: -119.7871,
    timezone: "America/Los_Angeles",
    region: "California",
    regionCode: "US-CA",
    country: "United States",
    countryCode: "us",
    timezoneApproximate: false,
  },
];

function buildManualSite(address, latitude, longitude) {
  const label = address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  return {
    address: label,
    label,
    fullAddress: label,
    latitude,
    longitude,
    timezone: approximateTimezoneFromLongitude(longitude),
    timezoneApproximate: true,
    region: "",
    regionCode: "",
    country: "",
    countryCode: "",
    source: "manual",
  };
}

function readJsonFile(file) {
  return file.text().then((text) => JSON.parse(text));
}

async function bootPublicStudySetupPage() {
  const projectNameInput = document.getElementById("publicProjectName");
  const addressInput = document.getElementById("publicSiteAddressInput");
  const suggestionsEl = document.getElementById("publicSiteSuggestions");
  const lookupStatusEl = document.getElementById("publicSiteLookupStatus");
  const siteSummaryEl = document.getElementById("publicSiteSummary");
  const latitudeInput = document.getElementById("publicManualLatitude");
  const longitudeInput = document.getElementById("publicManualLongitude");
  const manualButton = document.getElementById("publicManualSiteButton");
  const continueButton = document.getElementById("publicGoToDesignButton");
  const loadBundleButton = document.getElementById("publicLoadBundleButton");
  const bundleFileInput = document.getElementById("publicBundleFileInput");
  const projectStatus = document.getElementById("publicStudyStatus");
  const resultsViewerLink = document.getElementById("publicResultsViewerLink");
  const presetButtons = [...document.querySelectorAll("[data-public-site-preset]")];

  let currentSite = normalizeConfiguredSite(session.getSite() || window.AGRIVOLTAIC_PUBLIC_CONFIG?.defaultSite);
  let hasExplicitSite = Boolean(session.getSite());

  function syncSiteSummary() {
    if (!currentSite || !hasExplicitSite) {
      siteSummaryEl.textContent = "Choose a site with address search, a preset, or manual coordinates.";
      continueButton.disabled = true;
      return;
    }

    siteSummaryEl.textContent = `${currentSite.label} • ${currentSite.latitude.toFixed(4)}, ${currentSite.longitude.toFixed(4)} • ${currentSite.timezone}`;
    continueButton.disabled = false;
  }

  function commitSite(site) {
    currentSite = normalizeConfiguredSite(site);
    hasExplicitSite = true;
    session.setSite({
      ...currentSite,
      source: site.source || "mapbox",
    });
    addressInput.value = currentSite.fullAddress || currentSite.label;
    syncSiteSummary();
  }

  function setStatus(message) {
    projectStatus.textContent = message;
  }

  projectNameInput.value = session.getProjectName();
  if (currentSite?.fullAddress && hasExplicitSite) {
    addressInput.value = currentSite.fullAddress;
  }
  syncSiteSummary();

  if (resultsViewerLink) {
    resultsViewerLink.href = PUBLIC_RESULTS_VIEWER_HREF;
  }

  projectNameInput.addEventListener("input", () => {
    session.setProjectName(projectNameInput.value.trim() || "Agrivoltaic Irradiance Study");
  });

  await mountPublicSiteLookup({
    input: addressInput,
    suggestionsEl,
    statusEl: lookupStatusEl,
    token: window.AGRIVOLTAIC_PUBLIC_CONFIG?.mapboxToken || "",
    onSelect(site) {
      commitSite({
        ...site,
        source: "mapbox",
      });
      setStatus("Site saved.");
    },
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = SITE_PRESETS.find((entry) => entry.id === button.dataset.publicSitePreset);
      if (!preset) return;
      commitSite({
        ...preset,
        source: "fallback",
      });
      setStatus(`${preset.label} loaded.`);
    });
  });

  manualButton.addEventListener("click", () => {
    const latitude = Number(latitudeInput.value);
    const longitude = Number(longitudeInput.value);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setStatus("Enter numeric latitude and longitude values.");
      return;
    }
    commitSite(buildManualSite(addressInput.value.trim(), latitude, longitude));
    setStatus("Manual coordinates saved.");
  });

  loadBundleButton.addEventListener("click", () => bundleFileInput.click());
  bundleFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Loading work package...");

    try {
      const bundle = parsePublicStudyBundle(await readJsonFile(file));
      applyStudyBundleToSession(session, bundle);
      projectNameInput.value = bundle.request.projectName;
      commitSite(bundle.request.site);
      session.setDesignState(bundle.request.designState);
      session.setSensorSelection(bundle.sensorSelection);
      setStatus("Work package loaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load that work package.");
    } finally {
      event.target.value = "";
    }
  });

  continueButton.addEventListener("click", () => {
    if (!hasExplicitSite) {
      setStatus("Choose a site before opening the designer.");
      return;
    }
    session.setProjectName(projectNameInput.value.trim() || "Agrivoltaic Irradiance Study");
    window.location.assign(PUBLIC_STUDY_DESIGN_HREF);
  });
}

bootPublicStudySetupPage().catch((error) => {
  const status = document.getElementById("publicStudyStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : "Could not load the designer setup page.";
  }
});
