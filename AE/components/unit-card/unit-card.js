import { ELEMENT_ICONS, ARCHETYPE_ICONS, iconImg } from "../../icons/icons.js";

const RARITY_COLORS = {
  Secret: "rarity-secret",
  Mythic: "rarity-mythic",
  Legendary: "rarity-legendary",
  Epic: "rarity-epic",
  Rare: "rarity-rare",
};

let templatePromise = null;

async function loadTemplate() {
  if (!templatePromise) {
    templatePromise = fetch("components/unit-card/unit-card.html?v=" + Date.now())
      .then((r) => r.text())
      .then((html) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return wrapper.querySelector("#tpl-unit-card");
      });
  }
  return templatePromise;
}

export async function UnitCard(data) {
  const template = await loadTemplate();
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".unit-card");

  const rarity = (data.tiers && data.tiers[0]) || null;
  if (rarity && RARITY_COLORS[rarity]) {
    card.classList.add(RARITY_COLORS[rarity]);
  }

  const img = card.querySelector('[data-role="image"]');
  img.src = data.image || "assets/placeholder.svg";
  img.alt = data.name || "Unit placeholder";

  const stats = data.stats || {};

  card.querySelector('[data-role="name"]').textContent = data.name || "---";

  const traitText = data.preferredTrait || data.trait || "---";
  card.querySelector('[data-role="trait"]').textContent = `Preferred: ${traitText}`;

  const ascendChip = card.querySelector('[data-role="ascend"]');
  const hasAscend = data.ascend === true || data.ascend === 3 || data.ascend === "3";
  if (ascendChip) {
    ascendChip.hidden = !hasAscend;
  }

  const elKey = (stats.element || "neutral").toString().toLowerCase();
  const archKey = (stats.archetype || "physical").toString().toLowerCase();

  const elEl = card.querySelector('[data-role="element"]');
  elEl.className = `unit-card-element element-${elKey}`;
  elEl.innerHTML = ELEMENT_ICONS[elKey]
    ? `${iconImg(ELEMENT_ICONS[elKey], stats.element)}<span class="unit-card-badge-text">${stats.element}</span>`
    : `<span class="unit-card-badge-text">${stats.element || "—"}</span>`;

  const archEl = card.querySelector('[data-role="archetype"]');
  archEl.className = `unit-card-archetype archetype-${archKey}`;
  archEl.innerHTML = ARCHETYPE_ICONS[archKey]
    ? `${iconImg(ARCHETYPE_ICONS[archKey], stats.archetype)}<span class="unit-card-badge-text">${stats.archetype}</span>`
    : `<span class="unit-card-badge-text">${stats.archetype || "—"}</span>`;

  card.querySelector('[data-role="damage"]').textContent = stats.damage || "—";
  card.querySelector('[data-role="spa"]').textContent = stats.spa ? `${stats.spa}s` : "—";
  card.querySelector('[data-role="range"]').textContent = stats.range || "—";

  card.addEventListener("click", (e) => {
    if (e.target.closest('[data-role="breakdown-btn"]')) {
      return;
    }
    window.dispatchEvent(new CustomEvent("open-unit", { detail: { id: data.id } }));
  });

  const btn = card.querySelector('[data-role="breakdown-btn"]');
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("open-unit", { detail: { id: data.id, activeSubTab: "dps" } }));
    });
  }

  return card;
}