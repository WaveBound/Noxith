import { ELEMENT_ICONS, ARCHETYPE_ICONS, iconImg, formatPassiveText, STAT_ICONS, STATUS_ICONS } from "../../icons/icons.js";
import { getUnitBaseValues, getTraitBreakdown, formatDPS, getSummonsData } from "../../pages/dps-math.js";

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
    templatePromise = fetch("components/unit-card/unit-card.html")
      .then((r) => r.text())
      .then((html) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return wrapper.querySelector("#tpl-unit-card");
      });
  }
  return templatePromise;
}

function baseDetailHtml(unit) {
  const bd = getTraitBreakdown(unit, "base");
  const { base, relics, effDamage, effSpa, effRange,
    effCritChance, effCritDamage, avgHitDamage, effDotMult, unitDirectDPS, unitDoTDPS, totalSummonDPS, dps,
    dotIntervalMultiplier, dotIntervalSPA, dotDamage } = bd;

  const summonsData = getSummonsData(unit);

  function relicDetailCard(r) {
    if (!r) return "";

    const modsHtml = (r.modifiers || []).map(m => `
      <div class="loadout-mod">
        <span class="loadout-mod-icon">${STAT_ICONS[m.icon] || STAT_ICONS.damage}</span>
        <span class="loadout-mod-label">${m.label}</span>
        <span class="loadout-mod-value">${m.value}</span>
      </div>`).join("");

    let passiveHtml = "";
    if (r.passive) {
      const formattedEffect = formatPassiveText(r.passive.effect || r.passive.desc || "");
      passiveHtml = `
        <div class="dps-relic-passive-box">
          <div class="dps-relic-passive-title">
            <span class="dps-relic-passive-glow">Passive:</span> 
            <span class="dps-relic-passive-name">${r.passive.name}</span>
          </div>
          <div class="dps-relic-passive-desc">${formattedEffect}</div>
        </div>`;
    }

    return `
      <div class="dps-relic-detail${r.isUnitEquip ? " unit-equip" : ""}">
        <img src="${r.image}" alt="${r.name}" />
        <div class="dps-relic-detail-name">${r.name}</div>
        <div class="dps-relic-detail-tag">${r.label}</div>
        <div class="loadout-mods" style="margin-top: 6px; width: 100%;">
          ${modsHtml}
        </div>
        ${passiveHtml}
      </div>`;
  }

  const relicSection = relics.length ? `
    <div class="dps-section section-relics">
      <div class="dps-section-hd">Equipped Relics</div>
      <div class="dps-relic-cards">${relics.map(relicDetailCard).join("")}</div>
    </div>` : "";

  const dotSection = base.dotMultiplier > 0 ? `
    <div class="dps-section section-dot">
      <div class="dps-section-hd">DoT Calculation</div>
      <div class="dps-table">
        <div class="dps-table-row">
          <span class="dps-table-lbl">Status Effect</span>
          <span class="dps-table-val" style="font-size:11px">${formatPassiveText(base.dotDescription || "DoT")}</span>
        </div>
        <div class="dps-table-row">
          <span class="dps-table-lbl">Effective Base Hit DMG</span>
          <span class="dps-table-val font-mono">${Math.round(effDamage).toLocaleString()}</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">&mdash; Damage x DoT Multi</span>
          <span class="dps-table-val font-mono"><span class="faint-mult">x${effDotMult.toFixed(2)}</span>${Math.round(dotDamage).toLocaleString()} DMG</span>
        </div>
        <div class="dps-table-row">
          <span class="dps-table-lbl">DoT Duration</span>
          <span class="dps-table-val font-mono">${bd.dotDuration.toFixed(1)}s</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">&mdash; Re-proc Interval SPA</span>
          <span class="dps-table-val font-mono">${dotIntervalSPA.toFixed(2)}s</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">&mdash; DoT Damage / Interval</span>
          <span class="dps-table-val font-mono"><span class="faint-mult">${Math.round(dotDamage).toLocaleString()} / ${dotIntervalSPA.toFixed(2)}s</span>${Math.round(unitDoTDPS).toLocaleString()} DPS</span>
        </div>
        <div class="dps-table-row divider"></div>
        <div class="dps-table-row primary">
          <span class="dps-table-lbl dot-highlight">DoT DPS Contribution</span>
          <span class="dps-table-val font-mono dot-highlight">+${formatDPS(unitDoTDPS)} DPS</span>
        </div>
      </div>
    </div>` : "";

  return `
    <div class="dps-summary-block">
      <div class="dps-summary-meta">
        <div class="dps-summary-avatar">
          <img src="${unit.image || "assets/placeholder.svg"}" alt="" />
        </div>
        <div>
          <div class="dps-summary-name">${unit.name || "Unit"}</div>
          <div class="dps-summary-sub">Base Calculations</div>
        </div>
      </div>
      
      <div class="dps-metric-grid">
        <div class="dps-metric-card">
          <span class="dps-metric-val damage-highlight">${formatDPS(unitDirectDPS)}</span>
          <span class="dps-metric-lbl">Unit Direct</span>
        </div>
        <div class="dps-metric-card">
          <span class="dps-metric-val dot-highlight">${formatDPS(unitDoTDPS)}</span>
          <span class="dps-metric-lbl">Unit DoT</span>
        </div>
        ${summonsData ? `
        <div class="dps-metric-card">
          <span class="dps-metric-val summons-highlight">${formatDPS(totalSummonDPS)}</span>
          <span class="dps-metric-lbl">Summons</span>
        </div>` : ""}
        <div class="dps-metric-card combined-card">
          <span class="dps-metric-val combined-highlight">${formatDPS(dps)}</span>
          <span class="dps-metric-lbl">Combined</span>
        </div>
      </div>
    </div>

    ${relicSection}

    <div class="dps-section section-damage">
      <div class="dps-section-hd">Damage Calculation</div>
      <div class="dps-table">
        <div class="dps-table-row">
          <span class="dps-table-lbl">Base Damage</span>
          <span class="dps-table-val font-mono">${base.damage.toLocaleString()}</span>
        </div>
        <div class="dps-table-row divider"></div>
        <div class="dps-table-row primary">
          <span class="dps-table-lbl damage-highlight">Effective Base Hit Damage</span>
          <span class="dps-table-val font-mono damage-highlight">${effDamage.toLocaleString("en-US", { maximumFractionDigits: 1 })}</span>
        </div>
      </div>
    </div>

    <div class="dps-section section-crit">
      <div class="dps-section-hd">Crit Averaging</div>
      <div class="dps-table">
        <div class="dps-table-row">
          <span class="dps-table-lbl crit-highlight">Base Hit (Non-Crit)</span>
          <span class="dps-table-val font-mono">${effDamage.toLocaleString("en-US", { maximumFractionDigits: 1 })}</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">Base Crit Chance</span>
          <span class="dps-table-val font-mono">${base.critChancePercent}%</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">Final Crit Rate</span>
          <span class="dps-table-val font-mono">${(effCritChance * 100).toFixed(0)}%</span>
        </div>
        <div class="dps-table-row indented">
          <span class="dps-table-lbl">CDmg Multiplier</span>
          <span class="dps-table-val font-mono">${(effCritDamage * 100).toFixed(0)}% (${effCritDamage.toFixed(2)}x)</span>
        </div>
        <div class="dps-table-row divider"></div>
        <div class="dps-table-row primary">
          <span class="dps-table-lbl crit-highlight">Avg Damage Per Hit</span>
          <span class="dps-table-val font-mono crit-highlight">${avgHitDamage.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
      </div>
    </div>

    <div class="dps-section section-spa">
      <div class="dps-section-hd">SPA Calculation</div>
      <div class="dps-table">
        <div class="dps-table-row">
          <span class="dps-table-lbl">Base SPA</span>
          <span class="dps-table-val font-mono">${base.spa}s</span>
        </div>
        <div class="dps-table-row divider"></div>
        <div class="dps-table-row primary">
          <span class="dps-table-lbl spa-highlight">Final Effective SPA</span>
          <span class="dps-table-val font-mono spa-highlight">${effSpa.toFixed(2)}s</span>
        </div>
      </div>
    </div>

    <div class="dps-section section-range">
      <div class="dps-section-hd">Range Calculation</div>
      <div class="dps-table">
        <div class="dps-table-row">
          <span class="dps-table-lbl">Base Range</span>
          <span class="dps-table-val font-mono">${base.range}</span>
        </div>
        <div class="dps-table-row divider"></div>
        <div class="dps-table-row primary">
          <span class="dps-table-lbl range-highlight">Final Effective Range</span>
          <span class="dps-table-val font-mono range-highlight">${effRange.toFixed(1)}</span>
        </div>
      </div>
    </div>

    ${dotSection}
  `;
}

function openDPSModal(unit) {
  const bd = getTraitBreakdown(unit, "base");
  const { base, summonCount, summonDamageMult, summonDamage, summonDirectDPS, summonDoTDPS, totalSummonDPS, effDamage, effSpa, effDotMult, dotIntervalSPA } = bd;

  const summonsData = getSummonsData(unit);

  const backdrop = document.createElement("div");
  backdrop.className = "dps-modal-backdrop";

  document.body.style.overflow = "hidden";

  const closeAndClean = () => {
    backdrop.remove();
    document.body.style.overflow = "";
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeAndClean();
  });

  const container = document.createElement("div");
  container.className = "dps-modal-container";

  if (summonsData) {
    const summonsPanel = document.createElement("div");
    summonsPanel.className = "dps-panel summons-panel";
    summonsPanel.innerHTML = `
      <div class="dps-panel-header">
        <div class="dps-panel-header-text">
          <div class="dps-panel-title color-summons">${summonsData.name || "Summons"} Breakdown</div>
          <div class="dps-panel-sub">Step-by-Step Calculations (Same SPA as Unit)</div>
        </div>
      </div>
      <div class="dps-panel-body">
        <div class="dps-section section-summons" style="margin-top:0;">
          <div class="dps-section-hd color-summons">1. Summon Damage</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Base DMG</span>
              <span class="dps-table-val font-mono">${Math.round(bd.scaledBaseDamage).toLocaleString()}</span>
            </div>
            ${bd.hasSummonRelicOverride ? `
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Relic Override</span>
                <span class="dps-table-val font-mono summons-highlight"><span class="faint-mult">x${summonDamageMult.toFixed(2)}</span>${Math.round(summonDamage).toLocaleString()}</span>
              </div>
            ` : `
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Summon Scale</span>
                <span class="dps-table-val font-mono"><span class="faint-mult">x${summonDamageMult.toFixed(2)}</span>${Math.round(summonDamage).toLocaleString()}</span>
              </div>
            `}
            <div class="dps-table-row primary">
              <span class="dps-table-lbl summons-highlight">Damage</span>
              <span class="dps-table-val font-mono summons-highlight">${Math.round(summonDamage).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">2. Output &amp; Direct DPS</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Summon Output</span>
              <span class="dps-table-val font-mono">${Math.round(summonDamage).toLocaleString()} &times; ${summonCount} = ${Math.round(summonDamage * summonCount).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Unit SPA</span>
              <span class="dps-table-val font-mono">${effSpa.toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl summons-highlight">Direct DPS</span>
              <span class="dps-table-val font-mono summons-highlight">+${formatDPS(summonDirectDPS)}</span>
            </div>
          </div>
        </div>

        ${base.dotMultiplier > 0 ? `
        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">3. Summons DoT (${formatPassiveText(base.dotName || "Status")})</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Summon Output</span>
              <span class="dps-table-val font-mono">${Math.round(summonDamage * summonCount).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; ${formatPassiveText(base.dotName || "DoT")} Scale</span>
              <span class="dps-table-val font-mono"><span class="faint-mult">x${effDotMult.toFixed(2)}</span>${Math.round(summonDamage * summonCount * effDotMult).toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; ${formatPassiveText(base.dotName || "DoT")} SPA</span>
              <span class="dps-table-val font-mono">${dotIntervalSPA.toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl dot-highlight">DoT DPS</span>
              <span class="dps-table-val font-mono dot-highlight">+${formatDPS(summonDoTDPS)}</span>
            </div>
          </div>
        </div>` : ""}
      </div>

      <div class="dps-panel-footer summons-footer">
        <div class="dps-summary-block" style="border-color: rgba(45, 212, 191, 0.25); background: rgba(45, 212, 191, 0.05); margin: 0;">
          <div class="dps-table-row primary">
            <span class="dps-table-lbl color-summons">Total Summons DPS</span>
            <span class="dps-table-val font-mono summons-highlight">${formatDPS(totalSummonDPS)} DPS</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(summonsPanel);
  }

  const mainPanel = document.createElement("div");
  mainPanel.className = "dps-panel main-panel";
  mainPanel.innerHTML = `
    <div class="dps-panel-header">
      <div class="dps-panel-header-text">
        <div class="dps-panel-title">${unit.name || "Unit"} — DPS Breakdown</div>
        <div class="dps-panel-sub">Base Stats & Calculations</div>
      </div>
      <button class="dps-panel-close" id="dp-close">✕</button>
    </div>
    <div class="dps-panel-body" id="dp-body">
      ${baseDetailHtml(unit)}
    </div>
  `;

  mainPanel.querySelector("#dp-close").addEventListener("click", closeAndClean);
  container.appendChild(mainPanel);

  backdrop.appendChild(container);
  document.body.appendChild(backdrop);
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
  card.querySelector('[data-role="trait"]').textContent = data.preferredTrait || data.trait || "---";
  const ascendChip = card.querySelector('[data-role="ascend"]');
  const hasAscend = data.ascend === true || data.ascend === 3 || data.ascend === "3";
  ascendChip.hidden = !hasAscend;

  const elKey = (stats.element || "neutral").toString().toLowerCase();
  const archKey = (stats.archetype || "physical").toString().toLowerCase();

  // Dynamically assign element & archetype theme classes so border/bg match DPS calculator badges
  const elEl = card.querySelector('[data-role="element"]');
  elEl.className = `unit-card-element element-${elKey}`;
  elEl.innerHTML = ELEMENT_ICONS[elKey]
    ? `${iconImg(ELEMENT_ICONS[elKey], stats.element)}<span class="unit-card-badge-text">${stats.element}</span>`
    : (stats.element || "—");

  const archEl = card.querySelector('[data-role="archetype"]');
  archEl.className = `unit-card-archetype archetype-${archKey}`;
  archEl.innerHTML = ARCHETYPE_ICONS[archKey]
    ? `${iconImg(ARCHETYPE_ICONS[archKey], stats.archetype)}<span class="unit-card-badge-text">${stats.archetype}</span>`
    : (stats.archetype || "—");

  card.querySelector('[data-role="damage"]').textContent = stats.damage || "—";
  card.querySelector('[data-role="spa"]').textContent = stats.spa || "—";
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