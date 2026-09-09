import { mountDesignerApp } from "../app/main.js";
import { bindSceneViewportControls } from "../platform/sceneViewportControls.js";
import { INPUT_SECTIONS } from "../ui/inputSchema.js";
import {
  computeSolarPosition,
  formatTimeLabel,
  getCurrentZonedDateTime,
  resolveSiteTimeZone,
  roundMinutes,
} from "./solarPosition.js";
import {
  PUBLIC_STUDY_SENSORS_HREF,
  PUBLIC_STUDY_SETUP_HREF,
} from "./publicStudyRoutes.js";
import { createPublicStudySession } from "./publicStudySession.js";

const DEFAULT_MONTH_DAY = "06-21";
const DEFAULT_MINUTES_IN_DAY = 10 * 60;

const session = createPublicStudySession();

const INFO_CARD_HTML = `
  <div class="panel-header">
    <div>
      <p class="eyebrow">Workflow</p>
      <h2>Package export</h2>
    </div>
  </div>
  <p class="section-copy">
    Set the array here, define the sensor plan next, then export a package for local or HPC execution.
  </p>
  <ul class="info-list">
    <li>This browser session stores the selected site, layout, and sensors until export.</li>
    <li>Weather retrieval and model execution remain outside the browser.</li>
    <li>The exported package includes geometry, sensor selections, and modeling inputs.</li>
  </ul>
`;

function cloneField(field) {
  return {
    ...field,
    options: field.options ? field.options.map((option) => ({ ...option })) : undefined,
    showWhen: field.showWhen ? { ...field.showWhen } : undefined,
    showWhenAny: field.showWhenAny ? field.showWhenAny.map((rule) => ({ ...rule })) : undefined,
  };
}

function buildPublicDesignSections() {
  return INPUT_SECTIONS
    .filter((section) => section.id !== "visual")
    .map((section) => {
      const fields = section.fields
        .filter((field) => !["forceModuleCount", "forcedModuleCount"].includes(field.key))
        .map(cloneField);
      const next = {
        ...section,
        fields,
      };

      if (section.id === "system") {
        next.hint = "PV configuration";
        next.description = "Set the array type, module package, and primary mounting inputs.";
      } else if (section.id === "advanced") {
        next.title = "Advanced Layout";
        next.hint = "Orientation and row grouping";
        next.description = "Use these fields only when you need to override orientation or split rows into columns.";
      } else if (section.id === "layout") {
        next.hint = "Clearance, rows, and edge offsets";
        next.description = "Row spacing and edge offsets define the active agronomic band shown in the scene.";
      } else if (section.id === "crop") {
        next.title = "Crop Rows";
        next.hint = "Crop type and plant spacing";
        next.description = "Crop rows are generated automatically from the current array geometry.";
      }

      return next;
    });
}

function defaultDesignSolarState(site) {
  const timeZone = resolveSiteTimeZone(site);
  const nowParts = getCurrentZonedDateTime(timeZone);
  const defaultYear = String(nowParts.dateInput).slice(0, 4) || String(new Date().getFullYear());
  return {
    dateInput: `${defaultYear}-${DEFAULT_MONTH_DAY}`,
    minutesInDay: DEFAULT_MINUTES_IN_DAY,
  };
}

function normalizeDesignSolarState(savedState, site) {
  const fallback = defaultDesignSolarState(site);
  const dateInput = /^\d{4}-\d{2}-\d{2}$/.test(String(savedState?.dateInput || ""))
    ? String(savedState.dateInput)
    : fallback.dateInput;
  const minutesInDay = Number.isFinite(Number(savedState?.minutesInDay))
    ? roundMinutes(Number(savedState.minutesInDay))
    : fallback.minutesInDay;

  return {
    dateInput,
    minutesInDay,
  };
}

function buildSolarCard(site, solarState) {
  const card = document.createElement("section");
  card.className = "panel control-card designer-solar-card";
  card.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Solar Conditions</p>
        <h2>Date & Time</h2>
      </div>
    </div>
    <p class="section-copy">Local site time controls sun position and scene lighting.</p>
    <div class="field-inline-grid">
      <div class="designer-solar-field">
        <label class="field-label" for="designerDateInput">Date</label>
        <input id="designerDateInput" class="platform-input" type="date" />
      </div>
      <div class="designer-solar-field designer-solar-field--time">
        <div class="designer-time-head">
          <label class="field-label" for="designerTimeInput">Time of day</label>
          <strong id="designerTimeDisplay">${formatTimeLabel(solarState.minutesInDay)}</strong>
        </div>
        <input id="designerTimeInput" class="range-input" type="range" min="0" max="1439" step="15" value="${solarState.minutesInDay}" />
        <div class="designer-time-scale" aria-hidden="true">
          <span>12a</span>
          <span>12p</span>
          <span>12a</span>
        </div>
      </div>
    </div>
    <p id="designerSolarStatus" class="card-hint">${site.label} • ${resolveSiteTimeZone(site)}</p>
  `;

  return {
    card,
    dateInput: card.querySelector("#designerDateInput"),
    timeInput: card.querySelector("#designerTimeInput"),
    timeDisplay: card.querySelector("#designerTimeDisplay"),
    status: card.querySelector("#designerSolarStatus"),
  };
}

async function bootPublicStudyDesignPage() {
  const site = session.getSite();
  if (!site) {
    window.location.replace(PUBLIC_STUDY_SETUP_HREF);
    return;
  }

  const continueButton = document.getElementById("openSensorWorkspaceButton");
  const app = mountDesignerApp({
    initialState: session.getDesignState() || undefined,
    sceneOptions: {
      previewMirrorEastWest: true,
    },
    sections: buildPublicDesignSections(),
    infoCardHtml: INFO_CARD_HTML,
    summaryContext: () => ({
      project: { name: session.getProjectName() },
      site,
    }),
    onStateChange(state) {
      session.setDesignState(state);
    },
  });

  continueButton?.addEventListener("click", () => {
    session.setDesignState(app.store.getState());
    window.location.assign(PUBLIC_STUDY_SENSORS_HREF);
  });

  await app.boot();
  window.requestAnimationFrame(() => {
    app.sceneApp.resize();
    app.sceneApp.setDefaultView(app.store.getState());
  });

  bindSceneViewportControls({
    sceneApp: app.sceneApp,
    getState: () => app.store.getState(),
    exportButton: "exportDesignViewButton",
    exportFileName: "agrivoltaic-irradiance-design-view.png",
    presetButtons: document.querySelectorAll("[data-view-preset]"),
  });

  const rightRail = document.getElementById("rightRail");
  const solarState = normalizeDesignSolarState(session.getDesignSolar(), site);
  const solarCard = buildSolarCard(site, solarState);
  const cropCard = rightRail?.querySelector('[data-section-id="crop"]');
  if (cropCard?.parentElement) {
    cropCard.parentElement.insertBefore(solarCard.card, cropCard);
  } else {
    rightRail?.append(solarCard.card);
  }

  function applySolarControls() {
    const timeZone = resolveSiteTimeZone(site);
    const solar = computeSolarPosition({
      latitude: Number(site.latitude),
      longitude: Number(site.longitude),
      dateInput: solarState.dateInput,
      minutesInDay: solarState.minutesInDay,
      timeZone,
    });

    solarCard.dateInput.value = solarState.dateInput;
    solarCard.timeInput.value = String(solarState.minutesInDay);
    solarCard.timeDisplay.textContent = formatTimeLabel(solarState.minutesInDay);
    solarCard.status.textContent = `${solar.localDateTimeLabel} • ${site.label}`;
    session.setDesignSolar(solarState);
    app.store.setState({
      sunAz: solar.azimuthDeg,
      sunEl: solar.apparentElevationDeg,
    });
  }

  function syncDateInput() {
    if (!solarCard.dateInput.value) return;
    solarState.dateInput = solarCard.dateInput.value;
    applySolarControls();
  }

  function syncTimeInput() {
    solarState.minutesInDay = roundMinutes(Number(solarCard.timeInput.value || DEFAULT_MINUTES_IN_DAY));
    applySolarControls();
  }

  solarCard.dateInput.addEventListener("input", syncDateInput);
  solarCard.dateInput.addEventListener("change", syncDateInput);
  solarCard.timeInput.addEventListener("input", syncTimeInput);
  solarCard.timeInput.addEventListener("change", syncTimeInput);

  const resetButton = document.querySelector('[data-action="reset"]');
  resetButton?.addEventListener("click", () => {
    window.requestAnimationFrame(() => applySolarControls());
  });

  applySolarControls();
}

bootPublicStudyDesignPage().catch((error) => {
  const summaryNote = document.getElementById("summaryNote");
  if (summaryNote) {
    summaryNote.textContent = error instanceof Error ? error.message : "Could not load the designer workspace.";
  }
});
