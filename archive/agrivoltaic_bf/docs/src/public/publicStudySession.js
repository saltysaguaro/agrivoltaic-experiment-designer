const STORAGE_KEY = "agrivoltaic-public-study-v1";

const DEFAULT_SESSION = {
  projectName: "Agrivoltaic Irradiance Study",
  site: null,
  designState: null,
  designSolar: null,
  sensorSelection: null,
};

function normalizeSessionSite(site) {
  if (!site || typeof site !== "object") return null;
  const address = String(site.address ?? site.fullAddress ?? site.label ?? "").trim();
  return {
    ...site,
    address: address || String(site.label ?? ""),
    source: site.source || "stored",
  };
}

function safeParse(raw) {
  if (!raw) return { ...DEFAULT_SESSION };
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SESSION,
      ...parsed,
      site: normalizeSessionSite(parsed?.site),
    };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function createPublicStudySession(storage = window.localStorage) {
  function load() {
    return safeParse(storage.getItem(STORAGE_KEY));
  }

  function save(next) {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function patch(update) {
    return save({
      ...load(),
      ...update,
    });
  }

  return {
    load,
    save,
    patch,
    clear() {
      storage.removeItem(STORAGE_KEY);
      return { ...DEFAULT_SESSION };
    },
    getProjectName() {
      return load().projectName;
    },
    setProjectName(projectName) {
      return patch({ projectName: projectName || DEFAULT_SESSION.projectName });
    },
    getSite() {
      return load().site;
    },
    setSite(site) {
      return patch({ site });
    },
    getDesignState() {
      return load().designState;
    },
    setDesignState(designState) {
      return patch({ designState });
    },
    getDesignSolar() {
      return load().designSolar;
    },
    setDesignSolar(designSolar) {
      return patch({ designSolar });
    },
    getSensorSelection() {
      return load().sensorSelection;
    },
    setSensorSelection(sensorSelection) {
      return patch({ sensorSelection });
    },
  };
}
