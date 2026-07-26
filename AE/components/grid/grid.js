// Generic, reusable grid renderer.
// items: array of data objects
// cardFactory: (item) => HTMLElement | Promise<HTMLElement>  -- e.g. UnitCard, TraitCard, RelicCard

export async function renderGrid(items, cardFactory) {
  const grid = document.createElement("div");
  grid.className = "entity-grid";
  const cards = await Promise.all(items.map((item) => cardFactory(item)));
  cards.forEach((card) => grid.appendChild(card));
  return grid;
}
