import { units } from "../data/units.js";
import { UnitCard } from "../components/unit-card/unit-card.js";
import { renderGrid } from "../components/grid/grid.js";

// UnitsPage(filter) -> HTMLElement
// filter: lowercase search string, applied to unit names. Re-rendered centrally
// by app.js whenever the global search box changes, so this stays a pure function.
export async function UnitsPage(filter = "") {
  const page = document.createElement("div");
  page.className = "page";

  const filtered = filter ? units.filter((u) => u.name.toLowerCase().includes(filter)) : units;

  page.innerHTML = `
    <div class="page-title-row">
      <div>
        <h1>Units</h1>
        <div class="page-subtitle">${filtered.length} units &middot; click a unit to open its info tab</div>
      </div>
    </div>
  `;

  const grid = await renderGrid(filtered, UnitCard);
  page.appendChild(grid);

  return page;
}
