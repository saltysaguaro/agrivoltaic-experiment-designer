function resolveElement(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return document.getElementById(value);
  }
  return value;
}

function formatOpacityLabel(value) {
  return `${Math.round(value * 100)}%`;
}

export function bindSceneViewportControls({
  sceneApp,
  getState,
  exportButton,
  exportFileName = "agrivoltaic-view.png",
  opacityInput,
  opacityValue,
  presetButtons,
}) {
  const resolvedExportButton = resolveElement(exportButton);
  const resolvedOpacityInput = resolveElement(opacityInput);
  const resolvedOpacityValue = resolveElement(opacityValue);
  const resolvedPresetButtons = presetButtons
    ? [...presetButtons].map((value) => resolveElement(value)).filter(Boolean)
    : [];

  if (resolvedExportButton) {
    resolvedExportButton.addEventListener("click", () => {
      sceneApp.exportSnapshot(exportFileName);
    });
  }

  if (resolvedOpacityInput) {
    const applyOpacity = () => {
      const opacity = Math.min(1, Math.max(0, Number(resolvedOpacityInput.value) / 100));
      sceneApp.setSystemOpacity(opacity);
      if (resolvedOpacityValue) {
        resolvedOpacityValue.textContent = formatOpacityLabel(opacity);
      }
    };

    resolvedOpacityInput.addEventListener("input", applyOpacity);
    resolvedOpacityInput.addEventListener("change", applyOpacity);
    applyOpacity();
  }

  resolvedPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sceneApp.setViewPreset(getState(), button.dataset.viewPreset || "arrayOblique");
    });
  });
}
