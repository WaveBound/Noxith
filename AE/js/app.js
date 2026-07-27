import { initSidebar, setActiveNav } from "../components/sidebar/sidebar.js";
import { renderHeader, setBreadcrumb } from "../components/page-header/header.js";
import { openTab, getActiveTab } from "../components/tabs/tabs.js";
import { UnitsPage } from "../pages/units-page.js";
import { TraitsPage } from "../pages/traits-page.js";
import { RelicsPage } from "../pages/relics-page.js";
import { ModesPage } from "../pages/modes-page.js";
import { HomePage } from "../pages/home-page.js";
import { DpsPage } from "../pages/dps-page.js";
import { UnitInfoPage } from "../components/unit-info/unit-info-page.js";
import { getUnitById } from "../data/units.js";
import { getItem, setItem } from "./store.js";

const SECTION_KEY = "active-section";

const state = {
  section: getItem(SECTION_KEY, "home"),
  query: "",
};

const els = {
  sidebarMount: document.getElementById("sidebar-mount"),
  headerMount: document.getElementById("header-mount"),
  subHeaderMount: document.getElementById("sub-header-mount"), // Dedicated sub-header mount
  pageContainer: document.getElementById("page-container"),
};

let renderToken = 0;

async function renderContent() {
  const myToken = ++renderToken;

  // Clear sub-header mount when navigating pages
  if (els.subHeaderMount) els.subHeaderMount.innerHTML = "";

  let content;
  if (state.section === "units") {
    const activeTab = getActiveTab();
    if (activeTab === "main" || !getUnitById(activeTab)) {
      setBreadcrumb("units");
      content = await UnitsPage(state.query);
    } else {
      const unit = getUnitById(activeTab);
      setBreadcrumb("units", unit.name);
      // Pass subHeaderMount to UnitInfoPage
      content = await UnitInfoPage(unit, null, els.subHeaderMount);
    }
  } else if (state.section === "home") {
    setBreadcrumb("home");
    content = await HomePage();
  } else if (state.section === "dps") {
    setBreadcrumb("dps");
    content = await DpsPage(state.query);
  } else {
    setBreadcrumb(state.section);

    if (state.section === "traits") {
      content = await TraitsPage(state.query);
    } else if (state.section === "relics") {
      content = await RelicsPage(state.query);
    } else {
      content = await ModesPage();
    }
  }

  if (myToken !== renderToken) return;

  els.pageContainer.innerHTML = "";
  els.pageContainer.appendChild(content);
}

function goToSection(id) {
  state.section = id;
  state.query = "";
  const input = document.getElementById("global-search");
  if (input) input.value = "";
  setItem(SECTION_KEY, id);
  setActiveNav(id);
  renderContent();
}

window.addEventListener("navigate", (e) => goToSection(e.detail.id));

window.addEventListener("open-unit", (e) => {
  openTab(e.detail.id, e.detail.activeSubTab);
  state.query = "";
  const input = document.getElementById("global-search");
  if (input) input.value = "";
  if (state.section !== "units") goToSection("units");
  else renderContent();
});

window.addEventListener("tabs-changed", () => {
  if (state.section === "units") renderContent();
});

window.addEventListener("wiki-search", (e) => {
  state.query = e.detail.query;
  if (state.section === "home" && state.query) {
    goToSection("units");
    return;
  }
  renderContent();
});

async function init() {
  await initSidebar({ mountEl: els.sidebarMount, activeId: state.section, getUnitById });
  renderHeader(els.headerMount);
  await renderContent();
}

init();