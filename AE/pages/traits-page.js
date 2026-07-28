import { traits, IS_TRAITS_PUBLISHED } from "../data/traits.js";
import { TraitCard } from "../components/trait-card/trait-card.js";
import { renderGrid } from "../components/grid/grid.js";

export async function TraitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page traits-page";

  // Self-contained, zero-dependency "Not Added Yet" screen
  if (!IS_TRAITS_PUBLISHED) {
    page.innerHTML = `
      <div class="page-title-row">
        <div>
          <h1 style="font-size:20px; font-weight:700; margin:0; color:#ffffff;">Traits</h1>
          <div class="page-subtitle" style="color:#71717a; font-size:12px; margin-top:2px;">Database under construction</div>
        </div>
      </div>

      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 52px 24px;
        margin: 30px auto;
        max-width: 500px;
        width: 100%;
        box-sizing: border-box;
        border-radius: 12px;
        background: linear-gradient(165deg, #0d0d14 0%, #050508 100%);
        border: 1px solid rgba(168, 85, 247, 0.3);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
      ">
        <div style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.35);
          color: #c084fc;
          margin-bottom: 18px;
        ">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 style="
          font-family: 'Montserrat', sans-serif !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          margin: 0 0 8px 0 !important;
          letter-spacing: -0.01em;
        ">Not Added Yet</h2>
        <p style="
          font-family: 'Montserrat', sans-serif !important;
          font-size: 13px !important;
          color: #a1a1aa !important;
          max-width: 380px;
          margin: 0 !important;
          line-height: 1.5 !important;
        ">
          The Traits database is currently under construction and will be published in a future update.
        </p>
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