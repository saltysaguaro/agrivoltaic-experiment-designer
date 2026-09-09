import {
  formatFieldValue,
  getFieldPresentation,
  parseFieldValue,
} from "../utils/units.js";
import { getAzimuthHelpText } from "../utils/orientation.js";

function createFieldElement(field) {
  const wrapper = document.createElement("div");
  wrapper.className = `field${field.full ? " field--full" : ""}${field.type === "checkbox" ? " field--checkbox" : ""}`;
  wrapper.dataset.fieldKey = field.key;

  const isSelect = field.type === "select";
  const input = document.createElement(isSelect ? "select" : "input");
  input.id = field.key;
  input.name = field.key;

  if (field.type === "number") {
    input.type = "number";
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    if (field.step !== undefined) input.step = String(field.step);
  }

  if (field.type === "checkbox") {
    input.type = "checkbox";
  }

  if (field.type === "select") {
    for (const option of field.options) {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      input.append(optionEl);
    }
  }

  let label = null;

  if (field.type === "checkbox" && field.appearance === "switch") {
    const switchRow = document.createElement("div");
    switchRow.className = "switch-row";

    label = document.createElement("div");
    label.className = "switch-label";
    label.textContent = field.label;

    const switchOptions = document.createElement("label");
    switchOptions.className = "switch-options";
    switchOptions.htmlFor = field.key;

    const switchLeft = document.createElement("span");
    switchLeft.className = "switch-option switch-option--left";
    switchLeft.textContent = "Imperial";

    const switchRight = document.createElement("span");
    switchRight.className = "switch-option switch-option--right";
    switchRight.textContent = "Metric";

    const switchControl = document.createElement("span");
    switchControl.className = "switch-control";

    const track = document.createElement("span");
    track.className = "switch-track";

    const knob = document.createElement("span");
    knob.className = "switch-knob";

    switchControl.append(input, track, knob);
    switchOptions.append(switchLeft, switchControl, switchRight);
    switchRow.append(label, switchOptions);
    wrapper.append(switchRow);
    wrapper.dataset.switch = "units";
  } else if (field.type === "checkbox") {
    const checkRow = document.createElement("label");
    checkRow.className = "checkbox-row";
    checkRow.htmlFor = field.key;

    const box = document.createElement("span");
    box.className = "checkbox-box";

    label = document.createElement("span");
    label.className = "checkbox-text";
    label.textContent = field.label;

    checkRow.append(input, box, label);
    wrapper.append(checkRow);
  } else {
    label = document.createElement("label");
    label.htmlFor = field.key;
    label.textContent = field.label;
    wrapper.append(label, input);
  }

  let unitEl = null;
  if (field.unit && !field.measurement) {
    unitEl = document.createElement("div");
    unitEl.className = "unit";
    wrapper.append(unitEl);
  }

  let helpEl = null;
  if (field.help) {
    helpEl = document.createElement("div");
    helpEl.className = "help";
    helpEl.textContent = field.help;
    wrapper.append(helpEl);
  }

  return {
    wrapper,
    input,
    label,
    unitEl,
    helpEl,
    isSwitch: field.type === "checkbox" && field.appearance === "switch",
  };
}

function createActionButtons(actions = []) {
  if (!actions.length) return null;

  const row = document.createElement("div");
  row.className = "action-row";

  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn${action.variant ? ` btn--${action.variant}` : ""}`;
    button.dataset.action = action.id;
    button.textContent = action.label;
    row.append(button);
  }

  return row;
}

function createSectionCard(section) {
  const card = document.createElement("section");
  card.className = "panel control-card";
  card.dataset.sectionId = section.id;

  const header = document.createElement("div");
  header.className = "panel-header";
  header.innerHTML = `
    <div>
      <p class="eyebrow">${section.hint}</p>
      <h2>${section.title}</h2>
    </div>
  `;

  card.append(header);

  if (section.description) {
    const description = document.createElement("p");
    description.className = "section-copy";
    description.textContent = section.description;
    card.append(description);
  }

  let notice = null;
  if (section.notice) {
    notice = document.createElement("div");
    notice.className = `section-notice section-notice--${section.notice.tone || "info"}`;
    notice.hidden = true;
    card.append(notice);
  }

  const grid = document.createElement("div");
  grid.className = "field-grid";
  card.append(grid);

  return { card, grid, notice };
}

function matchesShowWhen(showWhen, state) {
  if (!showWhen) return true;

  return Object.entries(showWhen).every(([key, values]) => {
    return values.includes(state[key]);
  });
}

export function createBindings({ sections, leftRail, rightRail, infoCardHtml }) {
  const inputMap = new Map();
  const wrappers = new Map();
  const actionMap = new Map();
  const sectionNoticeMap = new Map();
  let lastState = {};

  for (const section of sections) {
    const target = section.target === "right" ? rightRail : leftRail;
    const { card, grid, notice } = createSectionCard(section);
    if (notice) {
      sectionNoticeMap.set(section.id, notice);
    }

    for (const field of section.fields) {
      const element = createFieldElement(field);
      const { wrapper, input } = element;
      grid.append(wrapper);
      inputMap.set(field.key, input);
      wrappers.set(field.key, { ...element, field });
    }

    const actions = createActionButtons(section.actions);
    if (actions) {
      card.append(actions);
      for (const button of actions.querySelectorAll("[data-action]")) {
        actionMap.set(button.dataset.action, button);
      }
    }

    target.append(card);
  }

  function matchesFieldVisibility(field, state) {
    if (field.showWhenAny) {
      return field.showWhenAny.some((rule) => matchesShowWhen(rule, state));
    }
    return matchesShowWhen(field.showWhen, state);
  }

  if (infoCardHtml) {
    const infoCard = document.createElement("section");
    infoCard.className = "panel control-card";
    infoCard.innerHTML = infoCardHtml;
    rightRail.append(infoCard);
  }

  function setValues(state) {
    lastState = { ...state };
    for (const [key, meta] of wrappers.entries()) {
      const { field, input, label, unitEl, helpEl } = meta;
      const value = state[key];
      if (value === undefined || value === null) continue;
      const presentation = getFieldPresentation(field, state);

      if (label) label.textContent = presentation.label;
      if (unitEl) unitEl.textContent = presentation.unit || "";
      if (helpEl) {
        helpEl.textContent = field.key === "systemAzimuthDeg"
          ? getAzimuthHelpText(state)
          : field.help;
      }

      if (field.type === "number") {
        if (presentation.min !== undefined) input.min = String(presentation.min);
        if (presentation.max !== undefined) input.max = String(presentation.max);
        if (presentation.step !== undefined) input.step = String(presentation.step);
      }

      if (input.type === "checkbox") {
        input.checked = Boolean(value);
        if (meta.isSwitch) {
          meta.wrapper.classList.toggle("is-metric", Boolean(value));
          meta.wrapper.classList.toggle("is-imperial", !value);
        }
      } else if (field.type === "number") input.value = formatFieldValue(field, value, state);
      else input.value = String(value);
    }
  }

  function applyVisibility(state) {
    for (const { wrapper, field } of wrappers.values()) {
      wrapper.classList.toggle("is-hidden", !matchesFieldVisibility(field, state));
    }
  }

  function onFields(handler) {
    for (const [key, meta] of wrappers.entries()) {
      const { field, input } = meta;
      const emit = (event) => handler(key, input.type === "checkbox"
        ? input.checked
        : field.type === "number"
          ? parseFieldValue(field, input.value, lastState)
          : input.value, {
        commit: event.type === "change" || input.tagName === "SELECT",
      });
      input.addEventListener("input", emit);
      input.addEventListener("change", emit);
    }
  }

  function onAction(actionId, handler) {
    const button = actionMap.get(actionId);
    if (!button) return;
    button.addEventListener("click", handler);
  }

  function setSectionNotice(sectionId, { message = "", tone = "info" } = {}) {
    const notice = sectionNoticeMap.get(sectionId);
    if (!notice) return;

    notice.className = `section-notice section-notice--${tone}`;
    notice.textContent = message;
    notice.hidden = !message;
  }

  return {
    inputs: inputMap,
    setValues,
    applyVisibility,
    onFields,
    onAction,
    setSectionNotice,
  };
}
