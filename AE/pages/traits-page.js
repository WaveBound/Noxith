import { traits, IS_TRAITS_PUBLISHED } from "../data/traits.js";
import { TraitCard } from "../components/trait-card/trait-card.js";
import { renderGrid } from "../components/grid/grid.js";
import { ComingSoon } from "../components/coming-soon/coming-soon.js";

export async function TraitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page traits-page";

  if (!IS_TRAITS_PUBLISHED) {
    page.innerHTML = `
      <div class="page-title-row">
        <div>
          <h1>Traits</h1>
          <div class="page-subtitle">Database under construction</div>
        </div>
      </div>
    `;
    page.appendChild(
      ComingSoon({
        title: "Not Added Yet",
        message: "The Traits database is currently under construction and will be available soon."
      })
    );
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