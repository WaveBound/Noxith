import { toAbsoluteUrl } from "../../icons/icons.js";

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

function openTraitModal(trait) {
  const existing = document.querySelector(".trait-modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "dps-modal-backdrop trait-modal-backdrop";
  document.body.style.overflow = "hidden";

  const close = () => {
    backdrop.remove();
    document.body.style.overflow = "";
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const bestUnitsHtml = (trait.bestUnits || []).map(u => `
    <span class="trait-synergy-chip">${u}</span>
  `).join("");

  const modal = document.createElement("div");
  modal.className = "trait-detail-modal glass-card";
  modal.innerHTML = `
    <div class="trait-modal-header">
      <div class="trait-modal-icon-box" style="--accent: ${trait.rarityColor || '#a855f7'}">
        <img src="${toAbsoluteUrl(trait.image)}" alt="${trait.name}" />
      </div>
      <div class="trait-modal-meta">
        <div class="trait-modal-title-row">
          <h2>${trait.name} Trait</h2>
          <span class="trait-modal-rarity-badge">${trait.rarity}</span>
        </div>
        <div class="trait-modal-sub">${trait.tag || "Stat Modifier Trait"} &middot; ${trait.dropRate || "0.1%"} Roll Odds</div>
      </div>
      <button type="button" class="dps-panel-close trait-modal-close">&times;</button>
    </div>

    <div class="trait-modal-body">
      <div class="dps-section">
        <div class="dps-section-hd">Trait Description</div>
        <p class="trait-modal-desc-text">${trait.description || "No description provided."}</p>
      </div>

      <div class="dps-section">
        <div class="dps-section-hd">Stat Modifiers</div>
        <div class="trait-modal-stats-grid">
          ${(trait.stats || []).map(st => {
    const key = st.key || Object.keys(st)[0];
    const val = st.value || st[key];
    const meta = STAT_META[key] || { label: (st.label || key).toUpperCase(), cls: "" };
    return `
              <div class="trait-modal-stat-pill">
                <span class="trait-modal-stat-lbl ${meta.cls}">${meta.label}</span>
                <span class="trait-modal-stat-val">${val}</span>
              </div>`;
  }).join("")}
        </div>
      </div>

      ${trait.bestUnits && trait.bestUnits.length > 0 ? `
      <div class="dps-section">
        <div class="dps-section-hd">Best Synergized Units</div>
        <div class="trait-synergy-list">${bestUnitsHtml}</div>
      </div>` : ""}
    </div>
  `;

  modal.querySelector(".trait-modal-close").addEventListener("click", close);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

export async function TraitCard(data) {
  const template = await loadTemplate();
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".trait-card");

  if (data.rarityColor) {
    card.style.setProperty("--trait-accent", data.rarityColor);
  }

  const img = card.querySelector('[data-role="image"]');
  img.src = toAbsoluteUrl(data.image || "assets/placeholder.svg");
  img.alt = data.name || "Trait";

  card.querySelector('[data-role="name"]').textContent = data.name || "---";
  card.querySelector('[data-role="tag"]').textContent = data.tag || `${data.rarity || "Mythic"} Trait`;
  card.querySelector('[data-role="rarity"]').textContent = data.rarity || "Mythic";
  card.querySelector('[data-role="drop"]').textContent = `${data.dropRate || "0.1%"} Rate`;
  card.querySelector('[data-role="pity"]').textContent = data.pity ? data.pity.toLocaleString() : "---";

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
      cell.className = "trait-stat-pill";
      cell.innerHTML = `
        <span class="trait-stat-label ${meta.cls}">${meta.label}</span>
        <span class="trait-stat-value">${val}</span>
      `;
      statsList.appendChild(cell);
    });
  }

  const detailBtn = card.querySelector('[data-role="detail-btn"]');
  detailBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    openTraitModal(data);
  });

  card.addEventListener("click", () => {
    openTraitModal(data);
  });

  return card;
}