// TraitCard(data) -> HTMLElement
// data: { id, name, image, rarity, rarityColor, dropRate, pity, stats }

// Maps stat key -> { label, cssClass } for the compact stat strip.
// Label colors mirror the unit card palette (no red "negative" coloring).
const STAT_META = {
  damage: { label: "DMG", cls: "stat-dmg" },
  spa: { label: "SPA", cls: "stat-spa" },
  range: { label: "RNG", cls: "stat-rng" },
  critChance: { label: "CRIT", cls: "stat-crit" },
  critDamage: { label: "CDMG", cls: "stat-crit" },
  dotDamage: { label: "DOT", cls: "stat-dot" },
  placement: { label: "PLACE", cls: "stat-place" },
};

// Maps rarity tier name -> accent border class (matches unit card).
const RARITY_CLASSES = {
  Mythic: "rarity-mythic",
  Legendary: "rarity-legendary",
  Epic: "rarity-epic",
  Rare: "rarity-rare",
  Secret: "rarity-secret",
};

let templatePromise = null;

async function loadTemplate() {
  if (!templatePromise) {
    templatePromise = fetch("components/trait-card/trait-card.html?v=" + Date.now())
      .then((r) => r.text())
      .then((html) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return wrapper.querySelector("#tpl-trait-card");
      });
  }
  return templatePromise;
}

export async function TraitCard(data) {
  const template = await loadTemplate();
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".trait-card");

  // Rarity class + accent color variable
  if (data.rarity && RARITY_CLASSES[data.rarity]) {
    card.classList.add(RARITY_CLASSES[data.rarity]);
  }
  if (data.rarityColor) {
    card.style.setProperty("--trait-accent", data.rarityColor);
  }

  const img = card.querySelector('[data-role="image"]');
  img.src = data.image || "assets/placeholder.svg";
  img.alt = data.name || "Trait placeholder";

  card.querySelector('[data-role="name"]').textContent = data.name || "---";
  card.querySelector('[data-role="rarity"]').textContent = data.rarity || "---";
  card.querySelector('[data-role="drop"]').textContent = data.dropRate || "---";

  // Compact stat strip — small label + value cells
  const statsList = card.querySelector('[data-role="stats-list"]');
  statsList.innerHTML = "";
  if (data.stats && Array.isArray(data.stats)) {
    data.stats.forEach((block) => {
      Object.entries(block).forEach(([key, val]) => {
        if (val == null || val === "") return;
        const meta = STAT_META[key] || { label: key, cls: "" };
        const cell = document.createElement("div");
        cell.className = "trait-card-stat";
        cell.innerHTML = `
          <span class="trait-card-stat-label ${meta.cls}">${meta.label}</span>
          <span class="trait-card-stat-value ${meta.cls}">${val}</span>
        `;
        statsList.appendChild(cell);
      });
    });
  }

  return card;
}
