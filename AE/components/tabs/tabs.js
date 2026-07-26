// Persistent tab system for the Units section.
// Open unit tabs are stored in localStorage so they restore automatically
// when the page is refreshed or the browser is reopened.

import { getItem, setItem } from "../../js/store.js";

const STORAGE_KEY = "open-unit-tabs"; // array of unit ids
const ACTIVE_KEY = "active-unit-tab"; // "main" or a unit id
const SUBTAB_KEY = "unit-subtabs"; // map of unitId -> "info" | "dps"

let openIds = getItem(STORAGE_KEY, []);
let activeId = getItem(ACTIVE_KEY, "main");
let subTabs = getItem(SUBTAB_KEY, {});

function persist() {
  setItem(STORAGE_KEY, openIds);
  setItem(ACTIVE_KEY, activeId);
  setItem(SUBTAB_KEY, subTabs);
}

export function getOpenTabs() {
  return [...openIds];
}

export function getActiveTab() {
  return activeId;
}

export function getUnitSubTab(unitId) {
  return subTabs[unitId] || "info";
}

export function setUnitSubTab(unitId, subTab) {
  subTabs[unitId] = subTab;
  persist();
  window.dispatchEvent(new CustomEvent("tabs-changed"));
}

export function openTab(unitId, subTab = "info") {
  if (!openIds.includes(unitId)) openIds.push(unitId);
  activeId = unitId;
  subTabs[unitId] = subTab || "info";
  persist();
  window.dispatchEvent(new CustomEvent("tabs-changed"));
}

export function closeTab(unitId) {
  openIds = openIds.filter((id) => id !== unitId);
  delete subTabs[unitId];
  if (activeId === unitId) activeId = "main";
  persist();
  window.dispatchEvent(new CustomEvent("tabs-changed"));
}

export function setActiveTab(id) {
  activeId = id;
  if (id !== "main" && !subTabs[id]) {
    subTabs[id] = "info";
  }
  persist();
  window.dispatchEvent(new CustomEvent("tabs-changed"));
}

/**
 * Renders the tab bar into mountEl.
 * getUnitById: function(id) -> unit data object, used to resolve tab labels.
 */
export function renderTabBar(mountEl, getUnitById) {
  mountEl.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "tab-bar";

  const mainTab = buildTab({ id: "main", label: "Units", closable: false });
  bar.appendChild(mainTab);

  openIds.forEach((id) => {
    const unit = getUnitById(id);
    const label = unit ? unit.name : "Unknown Unit";
    bar.appendChild(buildTab({ id, label, closable: true }));
  });

  mountEl.appendChild(bar);
}

function buildTab({ id, label, closable }) {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "tab-item" + (activeId === id ? " active" : "");
  tab.dataset.tabId = id;

  const text = document.createElement("span");
  text.textContent = label;
  tab.appendChild(text);

  if (closable) {
    const close = document.createElement("span");
    close.className = "tab-close";
    close.innerHTML = `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l8 8M9 1l-8 8"/></svg>`;
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(id);
    });
    tab.appendChild(close);
  }

  tab.addEventListener("click", () => setActiveTab(id));
  return tab;
}
