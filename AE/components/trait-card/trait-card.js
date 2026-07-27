// TraitCard Component Generator

const STAT_META = {
  damage: { label: "DMG", cls: "stat-dmg" },
  spa: { label: "SPA", cls: "stat-spa" },
  range: { label: "RNG", cls: "stat-rng" },
  critChance: { label: "CRIT", cls: "stat-crit" },
  critDamage: { label: "CDMG", cls: "stat-crit" },
  dotDamage: { label: "DOT", cls: "stat-dot" },
  placement: { label: "PLACE", cls: "stat-place" },
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

  if (data.rarityColor) {
    card.style.setProperty("--trait-accent", data.rarityColor);
  }

  const img = card.querySelector('[data-role="image"]');
  img.src = data.image || "assets/placeholder.svg";
  img.alt = data.name || "Trait";

  card.querySelector('[data-role="name"]').textContent = data.name || "---";
  card.querySelector('[data-role="rarity"]').textContent = `${data.rarity || "Mythic"} Trait`;
  card.querySelector('[data-role="drop"]').textContent = `${data.dropRate || "0.1%"} Roll Rate`;
  card.querySelector('[data-role="pity"]').textContent = `${data.pity ? data.pity.toLocaleString() : "---"} Pity`;

  const descEl = card.querySelector('[data-role="desc"]');
  if (data.description) {
    descEl.textContent = data.description;
  } else {
    descEl.style.display = "none";
  }

  const statsList = card.querySelector('[data-role="stats-list"]');
  statsList.innerHTML = "";

  if (data.stats && Array.isArray(data.stats)) {
    data.stats.forEach((st) => {
      const key = st.key || Object.keys(st)[0];
      const val = st.value || st[key];
      const meta = STAT_META[key] || { label: (st.label || key).toUpperCase(), cls: "" };

      const cell = document.createElement("div");
      cell.className = "trait-card-stat";
      cell.innerHTML = `
        <span class="trait-card-stat-label ${meta.cls}">${meta.label}</span>
        <span class="trait-card-stat-value">${val}</span>
      `;
      statsList.appendChild(cell);
    });
  }

  return card;
}