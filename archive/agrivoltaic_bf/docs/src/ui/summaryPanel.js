import { roundTo } from "../utils/math.js";
import { formatDimensions, formatLength, formatPlantSpacing } from "../utils/units.js";

function createSummaryCard({ label, value, subvalue = "" }) {
  const card = document.createElement("div");
  card.className = "summary-card";
  card.innerHTML = `
    <div class="summary-card__label">${label}</div>
    <div class="summary-card__value">${value}</div>
    ${subvalue ? `<div class="summary-card__subvalue">${subvalue}</div>` : ""}
  `;
  return card;
}

export function createSummaryPanel(gridEl, noteEl, getContext = () => ({})) {
  function render({ state, sceneSummary }) {
    const { project, site } = getContext() || {};
    const cropWidthValue = sceneSummary.cropSummary.cropRowWidth > 0
      ? formatLength(sceneSummary.cropSummary.cropRowWidth, state, { decimalsMetric: 2, decimalsImperial: 1 })
      : "Not available";
    const cropWidthDetail = sceneSummary.cropSummary.mode === "under-canopy"
      ? `Canopy strip ${formatLength(sceneSummary.rowPitch, state, { decimalsMetric: 2, decimalsImperial: 1 })} minus ${formatLength(state.cropRowBuffer * 2, state, { decimalsMetric: 2, decimalsImperial: 1 })} edge setbacks`
      : sceneSummary.cropSummary.interRowGap > 0
        ? `Open gap ${formatLength(sceneSummary.cropSummary.interRowGap, state, { decimalsMetric: 2, decimalsImperial: 1 })} minus ${formatLength(state.cropRowBuffer * 2, state, { decimalsMetric: 2, decimalsImperial: 1 })} buffers`
        : "No inter-row crop corridor available";

    const cards = [
      project ? {
        label: "Project",
        value: project.name,
        subvalue: project.rootPath,
      } : null,
      site ? {
        label: "Site",
        value: site.label,
        subvalue: `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)} • ${site.timezone}`,
      } : null,
      {
        label: "System archetype",
        value: sceneSummary.systemLabel,
        subvalue: `${state.config} table recipe`,
      },
      {
        label: "Modules required",
        value: sceneSummary.moduleCount.toLocaleString(),
        subvalue: sceneSummary.checkerboardExpanded
          ? `${sceneSummary.tablesNeeded.toLocaleString()} canopy positions`
          : `${sceneSummary.tablesNeeded.toLocaleString()} tables`,
      },
      {
        label: "Rows",
        value: sceneSummary.rowCount.toLocaleString(),
        subvalue: state.rowColumnCount > 1
          ? `${sceneSummary.tablesPerRow.toLocaleString()}${sceneSummary.checkerboardExpanded ? " positions" : " tables"} / row • ${state.rowColumnCount.toLocaleString()} row columns`
          : `${sceneSummary.tablesPerRow.toLocaleString()}${sceneSummary.checkerboardExpanded ? " positions" : " tables"} / row`,
      },
      {
        label: "Array footprint",
        value: formatDimensions(sceneSummary.arrayW, sceneSummary.arrayD, state),
        subvalue: `Row pitch ${formatLength(sceneSummary.rowPitch, state, { decimalsMetric: 1, decimalsImperial: 1 })}`,
      },
      {
        label: "Crop row width",
        value: cropWidthValue,
        subvalue: cropWidthDetail,
      },
      {
        label: "Crop layout",
        value: `${sceneSummary.cropSummary.plantedBedsPerRow.toLocaleString()} planted / ${sceneSummary.cropSummary.cropBedsPerRow.toLocaleString()} requested beds`,
        subvalue: `${sceneSummary.cropSummary.cropRowsAvailable.toLocaleString()} crop rows • ${sceneSummary.cropSummary.cropLabel} • ${formatPlantSpacing(state.plantSpacingIn, state)} spacing • ${roundTo(sceneSummary.cropSummary.plantCount, 0).toLocaleString()} plants${sceneSummary.cropSummary.bedConstraintActive ? " • constrained by crop width" : ""}`,
      },
    ].filter(Boolean);

    gridEl.replaceChildren(...cards.map(createSummaryCard));
    noteEl.textContent = sceneSummary.note;
  }

  return { render };
}
