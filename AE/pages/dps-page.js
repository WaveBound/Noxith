import { units } from "../data/units.js";
import { DpsCard, optimizeRelicsForTrait } from "../components/dps-card/dps-card.js";
import { TRAIT_DEFINITIONS } from "./dps-math.js";

let currentMode = "dps"; // "dps" or "dmg"

function calculateUnitBestStanding(unit, mode) {
  let maxOutput = -1;
  Object.keys(TRAIT_DEFINITIONS).filter(k => k !== "base").forEach(traitKey => {
    const res = optimizeRelicsForTrait(unit, traitKey, {
      mode,
      simulateShinigamiPassive: unit.simulateShinigamiPassive,
      darkMageMode: unit.darkMageMode,
      giantForm: unit.giantForm,
      berserkState: unit.berserkState,
      demonicPresence: unit.demonicPresence,
      crowEnemiesHit: unit.crowEnemiesHit,
      fuaDamages: unit.fuaDamages
    });
    const val = mode === "dmg" ? (res.breakdown?.totalDmg || 0) : (res.breakdown?.dps || 0);
    if (val > maxOutput) maxOutput = val;
  });
  return maxOutput;
}

export async function DpsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page dps-page";

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
      <button type="button" class="dps-update-rankings-btn" id="dps-update-rankings-btn" title="Re-sort cards by current DPS values">
        Update Rankings
      </button>
    </div>

    <!-- Container for sorted cards -->
    <div class="dps-page-list"></div>
  `;

  const list = page.querySelector(".dps-page-list");
  const updateBtn = page.querySelector("#dps-update-rankings-btn");

  async function renderSortedCards() {
    list.innerHTML = "";
    updateBtn.classList.remove("needs-update");
    updateBtn.textContent = "Update Rankings";

    // Calculate best standing for each unit and sort in descending order
    const evaluatedUnits = filtered.map(unit => ({
      unit,
      standing: calculateUnitBestStanding(unit, currentMode)
    }));

    evaluatedUnits.sort((a, b) => b.standing - a.standing);

    const sortedUnits = evaluatedUnits.map(item => item.unit);

    // Render cards with active mode & ranking index
    const cards = await Promise.all(
      sortedUnits.map((u, index) => DpsCard(u, { mode: currentMode, rank: index + 1 }))
    );
    cards.forEach(card => list.appendChild(card));
  }

  // Mode button click listeners
  page.querySelectorAll(".dps-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode === currentMode) return;
      currentMode = mode;

      page.querySelectorAll(".dps-mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === currentMode));
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