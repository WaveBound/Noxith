import { units } from "../data/units.js";
import { DpsCard, optimizeRelicsForTrait } from "../components/dps-card/dps-card.js";
import { TRAIT_DEFINITIONS } from "./dps-math.js";
import { getGlobalSetting, saveGlobalSetting } from "../js/unit-settings.js";

let currentMode = getGlobalSetting("dpsMode", "dps"); // "dps" or "dmg"
let globalCompMode = getGlobalSetting("compMode", false); // false = Non-Comp (100% Crit), true = Comp (50% Crit)

const PAGE_SIZE = 10; // Up to 2 rows of 5 cards

function calculateUnitBestStanding(unit, mode, isCompMode) {
  let maxOutput = -1;
  Object.keys(TRAIT_DEFINITIONS).filter(k => k !== "base").forEach(traitKey => {
    const res = optimizeRelicsForTrait(unit, traitKey, {
      mode,
      isCompMode,
      simulateShinigamiPassive: unit.simulateShinigamiPassive,
      darkMageMode: unit.darkMageMode,
      giantForm: unit.giantForm,
      berserkState: unit.berserkState,
      demonicPresence: unit.demonicPresence,
      crowEnemiesHit: unit.crowEnemiesHit,
      caringState: unit.caringState,
      coldState: unit.coldState,
      fuaDamages: unit.fuaDamages,
      royalRivalry: unit.royalRivalry,
      awakenedPride: unit.awakenedPride,
      carrotTransformation: unit.carrotTransformation,
      carrotInstantRelocation: unit.carrotInstantRelocation,
      prodigyRageUnleashed: unit.prodigyRageUnleashed,
      prodigyFatherAndSonActive: unit.prodigyFatherAndSonActive,
      prodigyStatusEffects: unit.prodigyStatusEffects,
      crimsonAbilityActive: unit.crimsonAbilityActive,
      crimsonPoolCount: unit.crimsonPoolCount,
      bioinsectForm: unit.bioinsectForm,
      bioinsectResetStacks: unit.bioinsectResetStacks,
      bioinsectCopiedUnitId: unit.bioinsectCopiedUnitId,
    });
    const val = mode === "dmg" ? (res.breakdown?.totalDmg || 0) : (res.breakdown?.dps || 0);
    if (val > maxOutput) maxOutput = val;
  });
  return maxOutput;
}

export async function DpsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page dps-page";

  let currentPage = 1;
  const filtered = filter ? units.filter((u) => u.name.toLowerCase().includes(filter)) : units;

  page.innerHTML = `
    <div class="dps-page-header">
      <div class="dps-mode-toggle-group">
        <span class="dps-mode-label">Mode:</span>
        <div class="dps-mode-selector">
          <button type="button" class="dps-mode-btn ${currentMode === 'dps' ? 'active' : ''}" data-mode="dps">DPS</button>
          <button type="button" class="dps-mode-btn ${currentMode === 'dmg' ? 'active' : ''}" data-mode="dmg">DMG (Per Attack)</button>
        </div>
      </div>

      <div class="dps-mode-toggle-group">
        <span class="dps-mode-label">Crit Mode:</span>
        <div class="dps-mode-selector">
          <button type="button" class="dps-mode-btn dps-comp-btn ${!globalCompMode ? 'active' : ''}" data-comp="non-comp">Non-Comp</button>
          <button type="button" class="dps-mode-btn dps-comp-btn ${globalCompMode ? 'active' : ''}" data-comp="comp">Comp Mode</button>
        </div>
      </div>

      <div class="dps-pagination-controls" id="dps-pagination-controls">
        <button type="button" class="dps-page-nav-btn" id="dps-prev-page" title="Previous Page" aria-label="Previous Page">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span class="dps-page-info" id="dps-page-info">
          <span class="dps-page-num" id="dps-current-page">1</span>
          <span class="dps-page-slash">/</span>
          <span class="dps-page-total" id="dps-total-pages">1</span>
        </span>
        <button type="button" class="dps-page-nav-btn" id="dps-next-page" title="Next Page" aria-label="Next Page">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <button type="button" class="dps-update-rankings-btn" id="dps-update-rankings-btn" title="Re-sort cards by current DPS values">
        Update Rankings
      </button>
    </div>

    <!-- Container for sorted cards -->
    <div class="dps-page-list"></div>
  `;

  const list = page.querySelector(".dps-page-list");
  const updateBtn = page.querySelector("#dps-update-rankings-btn");
  const prevBtn = page.querySelector("#dps-prev-page");
  const nextBtn = page.querySelector("#dps-next-page");
  const currentPageEl = page.querySelector("#dps-current-page");
  const totalPagesEl = page.querySelector("#dps-total-pages");

  async function renderSortedCards() {
    list.innerHTML = "";
    updateBtn.classList.remove("needs-update");
    updateBtn.textContent = "Update Rankings";

    // Calculate best standing for each unit and sort in descending order
    const evaluatedUnits = filtered.map(unit => ({
      unit,
      standing: calculateUnitBestStanding(unit, currentMode, globalCompMode)
    }));

    evaluatedUnits.sort((a, b) => b.standing - a.standing);

    const sortedUnits = evaluatedUnits.map(item => item.unit);
    const totalPages = Math.max(1, Math.ceil(sortedUnits.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageUnits = sortedUnits.slice(startIndex, startIndex + PAGE_SIZE);

    // Update pagination controls
    currentPageEl.textContent = String(currentPage);
    totalPagesEl.textContent = String(totalPages);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Render cards with active mode & global ranking index
    const cards = await Promise.all(
      pageUnits.map((u, index) => DpsCard(u, { mode: currentMode, rank: startIndex + index + 1, isCompMode: globalCompMode }))
    );
    cards.forEach(card => list.appendChild(card));
  }

  // Pagination button click listeners
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderSortedCards();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage++;
      renderSortedCards();
    }
  });

  // Mode button click listeners
  page.querySelectorAll(".dps-mode-btn[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode === currentMode) return;
      currentMode = mode;
      saveGlobalSetting("dpsMode", currentMode);

      page.querySelectorAll(".dps-mode-btn[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === currentMode));
      renderSortedCards();
    });
  });

  // Comp Mode button click listeners
  page.querySelectorAll(".dps-comp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const compVal = btn.dataset.comp === "comp";
      if (compVal === globalCompMode) return;
      globalCompMode = compVal;
      saveGlobalSetting("compMode", globalCompMode);

      page.querySelectorAll(".dps-comp-btn").forEach(b => b.classList.toggle("active", (b.dataset.comp === "comp") === globalCompMode));
      renderSortedCards();
    });
  });

  // Mark the update button as needing a re-sort when values change (but don't auto-sort)
  window.addEventListener("dps-value-changed", () => {
    updateBtn.classList.add("needs-update");
    updateBtn.textContent = "Update Rankings \u25b2";
  });

  updateBtn.addEventListener("click", () => {
    renderSortedCards();
  });

  await renderSortedCards();

  return page;
}