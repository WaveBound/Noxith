import { traits } from "../data/traits.js";
import { TraitCard } from "../components/trait-card/trait-card.js";
import { renderGrid } from "../components/grid/grid.js";

export async function TraitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page";

  const filtered = filter ? traits.filter((t) => t.name.toLowerCase().includes(filter)) : traits;

  page.innerHTML = `
    <div class="page-title-row">
      <div>
        <h1>Traits</h1>
        <div class="page-subtitle">${filtered.length} traits</div>
      </div>
    </div>
  `;

  const grid = await renderGrid(filtered, TraitCard);
  grid.classList.add("traits-grid");
  page.appendChild(grid);

  return page;
}
