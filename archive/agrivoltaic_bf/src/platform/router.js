export function indexHref() {
  return "/index.html";
}

export function designHref() {
  return "/design.html";
}

export function sensorLayoutHref() {
  return "/sensor-layout.html";
}

export function jobRunHref(jobId) {
  return `/model-run.html?jobId=${encodeURIComponent(jobId)}`;
}

export function resultsHref(jobId) {
  return `/results.html?jobId=${encodeURIComponent(jobId)}`;
}

export function extractJobId(pathname, routePrefix) {
  const search = new URLSearchParams(window.location.search);
  const queryJobId = search.get("jobId");
  if (queryJobId) return queryJobId;

  const prefix = routePrefix.endsWith("/") ? routePrefix : `${routePrefix}/`;
  if (!pathname.startsWith(prefix)) return null;
  const remainder = pathname.slice(prefix.length);
  return remainder.split("/")[0] || null;
}
