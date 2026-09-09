const STORAGE_KEY = "agrivoltaic-platform-session-v1";

const DEFAULT_SESSION = {
  projectName: "Agrivoltaic Study",
  project: null,
  site: null,
  designState: null,
  sensorSelection: null,
  lastJobId: null,
  jobs: {},
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

function normalizeSessionJob(job) {
  if (!job || typeof job !== "object") return job;
  if (!Object.prototype.hasOwnProperty.call(job, "site")) return job;
  return {
    ...job,
    site: normalizeSessionSite(job.site),
  };
}

function normalizeSession(session) {
  return {
    ...DEFAULT_SESSION,
    ...session,
    site: normalizeSessionSite(session?.site),
    jobs: Object.fromEntries(
      Object.entries(session?.jobs || {}).map(([jobId, job]) => [jobId, normalizeSessionJob(job)])
    ),
  };
}

function safeParse(raw) {
  if (!raw) return { ...DEFAULT_SESSION };
  try {
    return normalizeSession(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function createSessionStore(storage = window.localStorage) {
  function load() {
    return safeParse(storage.getItem(STORAGE_KEY));
  }

  function save(next) {
    const normalized = normalizeSession(next);
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function patch(update) {
    const next = {
      ...load(),
      ...update,
    };
    return save(next);
  }

  return {
    load,
    save,
    patch,
    getProject() {
      return load().project;
    },
    setProject(project) {
      return patch({
        project,
        projectName: project?.name || load().projectName,
      });
    },
    applyProjectSnapshot(snapshot) {
      if (!snapshot?.project) return load();
      const current = load();
      const next = {
        ...current,
        projectName: snapshot.project.name || current.projectName,
        project: snapshot.project,
        site: Object.prototype.hasOwnProperty.call(snapshot, "site") ? snapshot.site : current.site,
        designState: Object.prototype.hasOwnProperty.call(snapshot, "designState") ? snapshot.designState : current.designState,
        sensorSelection: Object.prototype.hasOwnProperty.call(snapshot, "sensorSelection") ? snapshot.sensorSelection : current.sensorSelection,
        lastJobId: Object.prototype.hasOwnProperty.call(snapshot, "lastJobId") ? snapshot.lastJobId : current.lastJobId,
        jobs: {
          ...current.jobs,
          ...(snapshot.jobs || {}),
        },
      };
      return save(next);
    },
    buildProjectSnapshot(overrides = {}) {
      const session = load();
      const project = overrides.project || session.project;
      if (!project?.rootPath) {
        throw new Error("Choose a project folder before saving the project.");
      }
      return {
        version: "1",
        savedAt: new Date().toISOString(),
        project: {
          name: project.name || session.projectName,
          rootPath: project.rootPath,
          fileName: project.fileName || "agrivoltaic-project.json",
        },
        site: Object.prototype.hasOwnProperty.call(overrides, "site") ? overrides.site : session.site,
        designState: Object.prototype.hasOwnProperty.call(overrides, "designState") ? overrides.designState : session.designState,
        serializedConfig: overrides.serializedConfig,
        sensorSelection: Object.prototype.hasOwnProperty.call(overrides, "sensorSelection") ? overrides.sensorSelection : session.sensorSelection,
        lastJobId: Object.prototype.hasOwnProperty.call(overrides, "lastJobId") ? overrides.lastJobId : session.lastJobId,
        jobs: {
          ...session.jobs,
          ...(overrides.jobs || {}),
        },
      };
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
    getSensorSelection() {
      return load().sensorSelection;
    },
    setSensorSelection(sensorSelection) {
      return patch({ sensorSelection });
    },
    getProjectName() {
      return load().projectName;
    },
    setProjectName(projectName) {
      return patch({ projectName });
    },
    getLastJobId() {
      return load().lastJobId;
    },
    rememberJob(job) {
      const session = load();
      session.jobs[job.jobId] = job;
      session.lastJobId = job.jobId;
      return save(session);
    },
  };
}
