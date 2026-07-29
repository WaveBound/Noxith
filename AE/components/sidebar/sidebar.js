// Sidebar component
// Reusable, data-driven: to add a new section, add an entry to NAV_ITEMS.
// Emits a "navigate" CustomEvent on window with { detail: { id } } when a tab is clicked.

import { getOpenTabs, getActiveTab, setActiveTab, closeTab } from "../tabs/tabs.js";
import { IS_TRAITS_PUBLISHED } from "../../data/traits.js";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
  },
  {
    id: "units",
    label: "Units",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  },
  {
    id: "dps",
    label: "DPS",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  },
  {
    id: "traits",
    label: "Traits",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3c0 5 14 5 14 10s-14 5-14 10"/><path d="M19 3c0 5-14 5-14 10s14 5 14 10"/><path d="M7 7h10M7 17h10"/></svg>`,
  },
  {
    id: "relics",
    label: "Relics",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l5 4-5 5-5-5z"/><path d="M7 6l5 5 5-5"/><path d="M12 11v9"/><path d="M8 14l4 3 4-3"/></svg>`,
  },
  {
    id: "modes",
    label: "Modes",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    badge: "soon",
  },
];

let _getUnitById = null;
let _activeSection = "units";

export async function initSidebar({ mountEl, activeId = "units", getUnitById }) {
  _getUnitById = getUnitById || (() => null);
  _activeSection = activeId;

  const html = await fetch("components/sidebar/sidebar.html").then((r) => r.text());
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const template = wrapper.querySelector("#tpl-sidebar");
  const node = template.content.cloneNode(true);

  const nav = node.querySelector("#sidebar-nav");
  const visibleNavItems = NAV_ITEMS.filter(item => item.id !== "traits" || IS_TRAITS_PUBLISHED);
  visibleNavItems.forEach((item) => {
    const el = document.createElement("button");
    el.className = "nav-item";
    el.dataset.navId = item.id;
    el.setAttribute("type", "button");
    el.innerHTML = `
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ""}
    `;
    el.addEventListener("click", () => {
      // Clicking the "Units" nav item should always return to the units
      // grid (the "main" tab) so the user can browse and open more unit
      // tabs on the left, instead of re-showing the currently active unit.
      if (item.id === "units") {
        setActiveTab("main");
      }
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id: item.id } }));
    });
    nav.appendChild(el);
  });

  mountEl.appendChild(node);
  setActiveNav(activeId);
  renderUnitTabs();

  // Re-render unit tab list whenever tabs change
  window.addEventListener("tabs-changed", () => renderUnitTabs());
  // Re-render unit tabs when the active section changes so they dim when
  // the user navigates away from the Units section.
  window.addEventListener("navigate", (e) => {
    _activeSection = e.detail.id;
    renderUnitTabs();
  });
}

export function setActiveNav(id) {
  document.querySelectorAll(".nav-item[data-nav-id]").forEach((el) => {
    el.classList.toggle("active", el.dataset.navId === id);
  });
}

// ── Unit tabs rendered inline in the sidebar ─────────────────────────────────
function renderUnitTabs() {
  const container = document.getElementById("sidebar-unit-tabs");
  const section = document.getElementById("sidebar-unit-tabs-section");
  if (!container) return;

  const openIds = getOpenTabs();
  const activeId = getActiveTab();
  const inUnitsSection = _activeSection === "units";
  container.innerHTML = "";

  if (openIds.length === 0) {
    section?.classList.add("hidden");
    return;
  }
  section?.classList.remove("hidden");

  openIds.forEach((id) => {
    const unit = _getUnitById ? _getUnitById(id) : null;
    const label = unit ? unit.name : "Unknown Unit";

    const btn = document.createElement("button");
    btn.type = "button";
    // Only highlight a unit tab as active when the user is actually in the
    // Units section. Otherwise it dims so it doesn't look "opened".
    btn.className = "nav-unit-tab" + (inUnitsSection && activeId === id ? " active" : "");
    btn.dataset.unitTabId = id;

    const unitIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;

    btn.innerHTML = `
      <span class="nav-icon nav-unit-icon">${unitIcon}</span>
      <span class="nav-unit-label">${label}</span>
      <span class="nav-unit-close" data-close-id="${id}" title="Close">
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l8 8M9 1l-8 8"/></svg>
      </span>`;

    btn.addEventListener("click", () => {
      setActiveTab(id);
      // Navigate to units section to display the unit
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id: "units" } }));
    });

    btn.querySelector(".nav-unit-close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(id);
    });

    container.appendChild(btn);
  });
}
