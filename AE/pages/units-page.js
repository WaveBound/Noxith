import { units } from "../data/units.js";
import { UnitCard } from "../components/unit-card/unit-card.js";
import { ELEMENT_ICONS, ARCHETYPE_ICONS, iconImg } from "../icons/icons.js";

// Persist filters across search typing or re-renders
let selectedElement = "all";
let selectedArchetype = "all";
let selectedUpdate = "all";
let currentPage = 1;

const PAGE_SIZE = 14; // Exactly 2 rows of 7 units

const ELEMENTS = [
  { id: "all", label: "All Elements" },
  { id: "hydro", label: "Hydro" },
  { id: "flame", label: "Flame" },
  { id: "terra", label: "Terra" },
  { id: "gale", label: "Gale" },
  { id: "storm", label: "Storm" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "neutral", label: "Neutral" },
];

const ARCHETYPES = [
  { id: "all", label: "All Archetypes" },
  { id: "physical", label: "Physical" },
  { id: "magical", label: "Magical" },
  { id: "psychic", label: "Psychic" },
];

const UPDATES = [
  { id: "all", label: "All" },
  { id: "1.0", label: "Update 1.0" },
  { id: "0.5", label: "Update 0.5" },
  { id: "Release", label: "Release" },
];

export async function UnitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page units-page";

  const activeElementObj = ELEMENTS.find((e) => e.id === selectedElement) || ELEMENTS[0];
  const activeArchetypeObj = ARCHETYPES.find((a) => a.id === selectedArchetype) || ARCHETYPES[0];

  const elementTriggerIcon =
    selectedElement !== "all" && ELEMENT_ICONS[selectedElement]
      ? iconImg(ELEMENT_ICONS[selectedElement], activeElementObj.label)
      : "";

  const archetypeTriggerIcon =
    selectedArchetype !== "all" && ARCHETYPE_ICONS[selectedArchetype]
      ? iconImg(ARCHETYPE_ICONS[selectedArchetype], activeArchetypeObj.label)
      : "";

  page.innerHTML = `
    <div class="page-title-row">
      <div>
        <h1>Units</h1>
        <div class="page-subtitle" id="units-page-subtitle">Showing units &middot; click a unit to open its info tab</div>
      </div>
    </div>

    <div class="units-page-header">
      <!-- Update Filter (Inline Buttons) -->
      <div class="units-filter-group">
        <span class="units-filter-label">Update:</span>
        <div class="units-filter-selector" id="update-filter-selector">
          ${UPDATES.map(
            (u) =>
              `<button type="button" class="units-filter-btn ${selectedUpdate === u.id ? "active" : ""}" data-update="${u.id}">${u.label}</button>`
          ).join("")}
        </div>
      </div>

      <!-- Element Popout Dropdown -->
      <div class="units-filter-group units-popout-group" id="element-popout-group">
        <span class="units-filter-label">Element:</span>
        <button type="button" class="units-popout-trigger ${selectedElement !== "all" ? "has-filter" : ""}" id="element-popout-trigger">
          ${elementTriggerIcon}
          <span id="element-trigger-text">${activeElementObj.label}</span>
          <span class="units-popout-arrow">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </button>
        <div class="units-popout-menu" id="element-popout-menu">
          ${ELEMENTS.map((el) => {
            const iconHtml = el.id !== "all" && ELEMENT_ICONS[el.id] ? iconImg(ELEMENT_ICONS[el.id], el.label) : "";
            return `<button type="button" class="units-popout-item ${selectedElement === el.id ? "active" : ""}" data-element="${el.id}">${iconHtml}<span>${el.label}</span></button>`;
          }).join("")}
        </div>
      </div>

      <!-- Archetype Popout Dropdown -->
      <div class="units-filter-group units-popout-group" id="archetype-popout-group">
        <span class="units-filter-label">Archetype:</span>
        <button type="button" class="units-popout-trigger ${selectedArchetype !== "all" ? "has-filter" : ""}" id="archetype-popout-trigger">
          ${archetypeTriggerIcon}
          <span id="archetype-trigger-text">${activeArchetypeObj.label}</span>
          <span class="units-popout-arrow">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </button>
        <div class="units-popout-menu" id="archetype-popout-menu">
          ${ARCHETYPES.map((arch) => {
            const iconHtml = arch.id !== "all" && ARCHETYPE_ICONS[arch.id] ? iconImg(ARCHETYPE_ICONS[arch.id], arch.label) : "";
            return `<button type="button" class="units-popout-item ${selectedArchetype === arch.id ? "active" : ""}" data-archetype="${arch.id}">${iconHtml}<span>${arch.label}</span></button>`;
          }).join("")}
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="units-pagination-controls" id="units-pagination-controls">
        <button type="button" class="units-page-nav-btn" id="units-prev-page" title="Previous Page" aria-label="Previous Page">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span class="units-page-info" id="units-page-info">
          <span class="units-page-num" id="units-current-page">1</span>
          <span class="units-page-slash">/</span>
          <span class="units-page-total" id="units-total-pages">1</span>
        </span>
        <button type="button" class="units-page-nav-btn" id="units-next-page" title="Next Page" aria-label="Next Page">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>

    <!-- 7-column grid layout (2 rows of 7 units) -->
    <div class="units-page-list" id="units-page-list"></div>
  `;

  const listContainer = page.querySelector("#units-page-list");
  const subtitleEl = page.querySelector("#units-page-subtitle");
  const prevBtn = page.querySelector("#units-prev-page");
  const nextBtn = page.querySelector("#units-next-page");
  const currentPageEl = page.querySelector("#units-current-page");
  const totalPagesEl = page.querySelector("#units-total-pages");

  // Element Popout Elements
  const elTrigger = page.querySelector("#element-popout-trigger");
  const elMenu = page.querySelector("#element-popout-menu");

  // Archetype Popout Elements
  const archTrigger = page.querySelector("#archetype-popout-trigger");
  const archMenu = page.querySelector("#archetype-popout-menu");

  function getFilteredUnits() {
    return units.filter((u) => {
      // Search filter
      if (filter && !u.name.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      // Element filter
      if (selectedElement !== "all") {
        const uEl = (u.stats?.element || "").toLowerCase();
        if (uEl !== selectedElement.toLowerCase()) return false;
      }
      // Archetype filter
      if (selectedArchetype !== "all") {
        const uArch = (u.stats?.archetype || "").toLowerCase();
        if (uArch !== selectedArchetype.toLowerCase()) return false;
      }
      // Update filter
      if (selectedUpdate !== "all") {
        if (u.update !== selectedUpdate) return false;
      }
      return true;
    });
  }

  async function renderPage() {
    const filtered = getFilteredUnits();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageUnits = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    // Update pagination controls & subtitle
    currentPageEl.textContent = String(currentPage);
    totalPagesEl.textContent = String(totalPages);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || filtered.length === 0;

    subtitleEl.innerHTML = `${filtered.length} unit${filtered.length === 1 ? "" : "s"} found &middot; click a unit to open its info tab`;

    listContainer.innerHTML = "";
    if (pageUnits.length === 0) {
      listContainer.innerHTML = `
        <div class="units-empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div>No units match the selected filters.</div>
        </div>
      `;
    } else {
      const cards = await Promise.all(pageUnits.map((u) => UnitCard(u)));
      cards.forEach((card) => listContainer.appendChild(card));
    }
  }

  // Prev / Next listeners
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });

  nextBtn.addEventListener("click", () => {
    const filtered = getFilteredUnits();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  });

  // Update filter buttons
  page.querySelectorAll("#update-filter-selector .units-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.update;
      if (val === selectedUpdate) return;
      selectedUpdate = val;
      page.querySelectorAll("#update-filter-selector .units-filter-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.update === selectedUpdate);
      });
      currentPage = 1;
      renderPage();
    });
  });

  // Popout Toggle Handlers
  function closeAllPopouts() {
    elTrigger.classList.remove("open");
    elMenu.classList.remove("open");
    archTrigger.classList.remove("open");
    archMenu.classList.remove("open");
  }

  elTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = elMenu.classList.contains("open");
    closeAllPopouts();
    if (!isOpen) {
      elTrigger.classList.add("open");
      elMenu.classList.add("open");
    }
  });

  archTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = archMenu.classList.contains("open");
    closeAllPopouts();
    if (!isOpen) {
      archTrigger.classList.add("open");
      archMenu.classList.add("open");
    }
  });

  // Close menus when clicking outside
  document.addEventListener("click", closeAllPopouts);

  // Element popout item selection
  page.querySelectorAll("#element-popout-menu .units-popout-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = btn.dataset.element;
      selectedElement = val;

      const obj = ELEMENTS.find((x) => x.id === val) || ELEMENTS[0];
      const icon = val !== "all" && ELEMENT_ICONS[val] ? iconImg(ELEMENT_ICONS[val], obj.label) : "";

      elTrigger.innerHTML = `
        ${icon}
        <span id="element-trigger-text">${obj.label}</span>
        <span class="units-popout-arrow">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
      `;
      elTrigger.classList.toggle("has-filter", val !== "all");

      page.querySelectorAll("#element-popout-menu .units-popout-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.element === selectedElement);
      });

      closeAllPopouts();
      currentPage = 1;
      renderPage();
    });
  });

  // Archetype popout item selection
  page.querySelectorAll("#archetype-popout-menu .units-popout-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = btn.dataset.archetype;
      selectedArchetype = val;

      const obj = ARCHETYPES.find((x) => x.id === val) || ARCHETYPES[0];
      const icon = val !== "all" && ARCHETYPE_ICONS[val] ? iconImg(ARCHETYPE_ICONS[val], obj.label) : "";

      archTrigger.innerHTML = `
        ${icon}
        <span id="archetype-trigger-text">${obj.label}</span>
        <span class="units-popout-arrow">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
      `;
      archTrigger.classList.toggle("has-filter", val !== "all");

      page.querySelectorAll("#archetype-popout-menu .units-popout-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.archetype === selectedArchetype);
      });

      closeAllPopouts();
      currentPage = 1;
      renderPage();
    });
  });

  await renderPage();

  return page;
}
