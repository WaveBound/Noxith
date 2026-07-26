import { unitRelics, globalRelics } from "../data/relics.js";
import { RelicCard } from "../components/relic-card/relic-card.js";
import { renderGrid } from "../components/grid/grid.js";

export async function RelicsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page";

  const match = (r) => !filter || r.name.toLowerCase().includes(filter);
  const unit = unitRelics.filter(match);
  const global = globalRelics.filter(match);
  const total = unit.length + global.length;

  page.innerHTML = `
    <div class="page-title-row">
      <div>
        <h1>Relics</h1>
        <div class="page-subtitle">${total} relics</div>
      </div>
    </div>
  `;

  // Unit-specific relics section
  const unitSection = document.createElement("div");
  unitSection.className = "relic-section";
  unitSection.innerHTML = `<h2 class="relic-section-title">Unit Specific Relics</h2>`;
  if (unit.length) {
    unitSection.appendChild(await renderGrid(unit, RelicCard));
  } else {
    unitSection.innerHTML += `<div class="relic-section-empty">No unit-specific relics</div>`;
  }
  page.appendChild(unitSection);

  // Global relics section
  const globalSection = document.createElement("div");
  globalSection.className = "relic-section";
  globalSection.innerHTML = `<h2 class="relic-section-title">Global Relics</h2>`;
  if (global.length) {
    globalSection.appendChild(await renderGrid(global, RelicCard));
  } else {
    globalSection.innerHTML += `<div class="relic-section-empty">No global relics</div>`;
  }
  page.appendChild(globalSection);

  return page;
}
