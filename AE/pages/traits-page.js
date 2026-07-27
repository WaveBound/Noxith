import { traits, IS_TRAITS_PUBLISHED } from "../data/traits.js";
import { TraitCard } from "../components/trait-card/trait-card.js";
import { renderGrid } from "../components/grid/grid.js";

export async function TraitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page traits-page";

  if (!IS_TRAITS_PUBLISHED) {
    page.innerHTML = `
      <div class="traits-locked-container glass-card">
        <div class="traits-locked-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 class="traits-locked-title">Traits Database Under Construction</h1>
        <p class="traits-locked-sub">The Trait Database is currently unpublished. Set <code>IS_TRAITS_PUBLISHED = true</code> in <code>data/traits.js</code> to publish it.</p>
      </div>
    `;
    return page;
  }

  let currentRarityFilter = "all";
  let searchFilter = filter.toLowerCase().trim();

  page.innerHTML = `
    <!-- Standard Page Header -->
    <div class="page-title-row">
      <div>
        <h1>Traits</h1>
        <div class="page-subtitle">${traits.length} traits &middot; click a trait to view details &amp; unit synergies</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="traits-filter-bar">
      <div class="traits-rarity-chips" id="traits-rarity-filter">
        <button type="button" class="trait-filter-btn active" data-rarity="all">All Traits</button>
        <button type="button" class="trait-filter-btn" data-rarity="Mythic">Mythic</button>
        <button type="button" class="trait-filter-btn" data-rarity="Legendary">Legendary</button>
        <button type="button" class="trait-filter-btn" data-rarity="Epic">Epic</button>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="traits-grid-container" id="traits-grid-container"></div>
  `;

  const container = page.querySelector("#traits-grid-container");

  async function renderFilteredGrid() {
    container.innerHTML = "";

    const filteredTraits = traits.filter((t) => {
      const matchesSearch = !searchFilter ||
        t.name.toLowerCase().includes(searchFilter) ||
        (t.tag && t.tag.toLowerCase().includes(searchFilter)) ||
        (t.description && t.description.toLowerCase().includes(searchFilter)) ||
        (t.stats && t.stats.some(s => (s.label || "").toLowerCase().includes(searchFilter) || (s.value || "").toLowerCase().includes(searchFilter)));

      const matchesRarity = currentRarityFilter === "all" || t.rarity.toLowerCase() === currentRarityFilter.toLowerCase();

      return matchesSearch && matchesRarity;
    });

    if (filteredTraits.length === 0) {
      container.innerHTML = `<div class="traits-empty-state">No traits match your current search/filter.</div>`;
      return;
    }

    const grid = await renderGrid(filteredTraits, TraitCard);
    grid.classList.add("traits-grid");
    container.appendChild(grid);
  }

  page.querySelectorAll(".trait-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      page.querySelectorAll(".trait-filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRarityFilter = btn.dataset.rarity;
      renderFilteredGrid();
    });
  });

  await renderFilteredGrid();

  return page;
}