import { STAT_ICONS, ELEMENT_ICONS, ARCHETYPE_ICONS, UNIT_INFO_ICONS, STATUS_ICONS, iconImg, formatPassiveText, relicImgByName, toAbsoluteUrl } from "../../icons/icons.js";
import { traits } from "../../data/traits.js";
import { getTraitBreakdown, formatDPS } from "../../pages/dps-math.js";
import { relicStats } from "../../data/relicstats.js";
import { relics as allRelicsCatalog } from "../../data/relics.js";

// Local state storage to prevent module resolution errors
const unitSubTabMap = new Map();

function getUnitSubTab(unitId) {
  return unitSubTabMap.get(unitId) || "info";
}

function setUnitSubTab(unitId, tab) {
  unitSubTabMap.set(unitId, tab);
}

function resolveRelicImg(name) {
  if (!name) return "";
  const match = allRelicsCatalog.find(r => r.name.toLowerCase() === String(name).toLowerCase());
  if (match && match.image) return toAbsoluteUrl(match.image);
  return relicImgByName(name) || "";
}

function renderHeaderDpsSummary(unit, bd, placementCount) {
  const { unitDirectDPS, unitDoTDPS, totalSummonDPS, fuaDps, isDarkMage, isEighthSword } = bd;
  const singlePlacementDPS = unitDirectDPS + unitDoTDPS + totalSummonDPS + fuaDps;
  const finalCombinedDPS = singlePlacementDPS * placementCount;

  return `
    <div class="uip-header-dps-grid">
      <div class="uip-header-dps-card card-unit">
        <span class="uip-header-dps-val damage-highlight">${formatDPS(unitDirectDPS * placementCount)}</span>
        <span class="uip-header-dps-lbl">Unit x${placementCount}</span>
      </div>
      ${unitDoTDPS > 0 ? `
      <div class="uip-header-dps-card card-dot">
        <span class="uip-header-dps-val dot-highlight">${formatDPS(unitDoTDPS * placementCount)}</span>
        <span class="uip-header-dps-lbl">${isDarkMage || isEighthSword ? "Passive" : "DoT"} x${placementCount}</span>
      </div>` : ""}
      ${unit.summons ? `
      <div class="uip-header-dps-card card-summons">
        <span class="uip-header-dps-val summons-highlight">${formatDPS(totalSummonDPS * placementCount)}</span>
        <span class="uip-header-dps-lbl">Summons x${placementCount}</span>
      </div>` : ""}
      ${fuaDps > 0 ? `
      <div class="uip-header-dps-card card-fua">
        <span class="uip-header-dps-val crit-highlight">${formatDPS(fuaDps * placementCount)}</span>
        <span class="uip-header-dps-lbl">Follow-Up x${placementCount}</span>
      </div>` : ""}
      <div class="uip-header-dps-card card-total">
        <span class="uip-header-dps-val combined-highlight">${formatDPS(finalCombinedDPS)}</span>
        <span class="uip-header-dps-lbl">Total DPS</span>
      </div>
    </div>
  `;
}

function buildLoadoutPanel(unit) {
  const panel = document.createElement("div");
  panel.className = "loadout-panel";

  const items = [
    { title: "Relic", data: unit.relic },
    ...(unit.equipment || []).map((e, i) => ({ title: `Equip ${i + 1}`, data: e })),
  ];

  const itemsHtml = items.map(({ title, data }) => {
    if (!data) return "";

    const imgSrc = resolveRelicImg(data.name) || toAbsoluteUrl(data.image || "assets/placeholder.svg");

    const modsHtml = (data.modifiers || []).map(m => `
      <div class="loadout-mod">
        <span class="loadout-mod-icon">${STAT_ICONS[m.icon] || STAT_ICONS.damage}</span>
        <span class="loadout-mod-label">${m.label}</span>
        <span class="loadout-mod-value">${m.value}</span>
      </div>`).join("");

    let passiveHtml = "";
    if (data.passive) {
      let text = data.passive;
      text = text.replace(/<br\s*\/?>/gi, "__BR__");
      let titleText = "";
      const titleMatch = text.match(/^([^:]+):/);
      if (titleMatch) {
        titleText = titleMatch[1];
        text = text.substring(titleMatch[0].length);
      }
      text = formatPassiveText(text);
      const passiveTitle = titleText ? `<span class="loadout-dropdown-passive-title">${titleText}</span>` : "";
      passiveHtml = `
        <div class="loadout-dropdown-passive">
          <div class="loadout-dropdown-passive-label"><span class="loadout-dropdown-passive-glow">Passive:</span> ${passiveTitle}</div>
          <div class="loadout-passive-text">${text}</div>
        </div>`;
    }

    return `
      <div class="loadout-item">
        <div class="loadout-img-wrap">
          <img src="${imgSrc}" alt="${data.name || title}" onerror="this.style.display='none'" />
        </div>
        <div class="loadout-item-right">
          <div class="loadout-item-identity">
            <div class="loadout-slot">${title}</div>
            <div class="loadout-name">${data.name || "---"}</div>
          </div>
          <button type="button" class="loadout-info-btn">
            View Info
            <span class="loadout-info-btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
        </div>
        <div class="loadout-dropdown collapsed">
          <div class="loadout-dropdown-inner">
            ${modsHtml ? `<div class="loadout-mods">${modsHtml}</div>` : ""}
            ${passiveHtml}
          </div>
        </div>
      </div>`;
  }).join("");

  panel.innerHTML = `<div class="loadout-items">${itemsHtml}</div>`;

  panel.querySelectorAll(".loadout-info-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = btn.closest(".loadout-item");
      const dropdown = item.querySelector(".loadout-dropdown");
      panel.querySelectorAll(".loadout-item").forEach(other => {
        if (other === item) return;
        const od = other.querySelector(".loadout-dropdown");
        const ob = other.querySelector(".loadout-info-btn");
        if (od) od.classList.add("collapsed");
        if (ob) ob.classList.remove("active");
      });
      const isCollapsed = dropdown.classList.toggle("collapsed");
      btn.classList.toggle("active", !isCollapsed);
    });
  });

  const handleOutsideClick = (e) => {
    if (e.target.closest(".loadout-item")) return;
    if (!panel.isConnected) {
      document.removeEventListener("click", handleOutsideClick);
      return;
    }

    panel.querySelectorAll(".loadout-item").forEach(item => {
      const dropdown = item.querySelector(".loadout-dropdown");
      const btn = item.querySelector(".loadout-info-btn");
      if (dropdown && !dropdown.classList.contains("collapsed")) {
        dropdown.classList.add("collapsed");
      }
      if (btn) {
        btn.classList.remove("active");
      }
    });
  };
  document.addEventListener("click", handleOutsideClick);

  return panel;
}

function buildUpgradesPanel(unit) {
  const panel = document.createElement("div");
  panel.className = "upgrades-table glass-card";

  const LEVEL_MULT = { 1: 1, 50: 1.82 };
  let currentLevel = 1;

  const parseNum = (str) => {
    if (str == null) return null;
    const n = Number(String(str).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const formatNum = (n) => Math.round(n).toLocaleString("en-US");
  const upgrades = (unit.placement || []);

  const rowsHtml = upgrades.map((u, i) => {
    const isPlacement = u.upgrade === 0;
    const isMax = (i === upgrades.length - 1) || (u.cost === "$0" || u.cost === "0");
    const numberLabel = isPlacement ? "Placement" : `Upgrade: ${u.upgrade}`;
    const costHtml = isMax
      ? "Max Level"
      : `${iconImg(UNIT_INFO_ICONS.yen, "Yen")} ${u.cost}`;

    const aoeHtml = u.aoe
      ? `<div class="upgrade-meta"><span class="upgrade-meta-label">AoE Type:</span> <span class="upgrade-meta-value">${u.aoe}</span></div>`
      : "";
    const atkTimeHtml = u.attackTime
      ? `<div class="upgrade-meta"><span class="upgrade-meta-label">Attack Time:</span> <span class="upgrade-meta-value">${u.attackTime}</span></div>`
      : "";

    const dmgVal = (() => {
      const n = parseNum(u.damage);
      return n != null ? formatNum(n * LEVEL_MULT[currentLevel]) : (u.damage || "");
    })();

    return `
      <div class="upgrade-row${isPlacement ? " upgrade-row-placement" : ""}">
        <div class="upgrade-header">
          <span class="upgrade-number">${numberLabel}</span>
          <span class="upgrade-cost">${costHtml}</span>
        </div>
        <div class="upgrade-attack">
          <span class="upgrade-attack-label">Attack:</span>
          <span class="upgrade-attack-name">${u.attackName || ""}</span>
        </div>
        <div class="upgrade-stats">
          <div class="upgrade-stat">
            <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.damage, "Damage")}</span>
            <span class="upgrade-stat-label">Dmg:</span>
            <span class="upgrade-stat-value" data-dmg>${dmgVal}</span>
          </div>
          <div class="upgrade-stat">
            <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.spa, "SPA")}</span>
            <span class="upgrade-stat-label">SPA:</span>
            <span class="upgrade-stat-value">${u.spa || ""}</span>
          </div>
          <div class="upgrade-stat">
            <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.range, "Range")}</span>
            <span class="upgrade-stat-label">Range:</span>
            <span class="upgrade-stat-value">${u.range || ""}</span>
          </div>
        </div>
        ${aoeHtml}
        ${atkTimeHtml}
        <div class="upgrade-desc">
          ${formatPassiveText(u.description || "")}
        </div>
      </div>`;
  }).join("");

  panel.innerHTML = `
    <div class="upgrades-box">
      <div class="panel-heading">
        <span class="panel-title">Stats</span>
        <div class="level-toggle" role="group" aria-label="Stat level">
          <button type="button" class="level-btn active" data-level="1">Lv 1</button>
          <button type="button" class="level-btn" data-level="50">Lv 50</button>
        </div>
      </div>
      <div class="upgrades-rows">
        ${rowsHtml || `<div class="traits-empty">No upgrade data</div>`}
      </div>
    </div>`;

  const buttons = panel.querySelectorAll(".level-btn");
  const dmgCells = panel.querySelectorAll("[data-dmg]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lvl = Number(btn.dataset.level);
      if (lvl === currentLevel) return;
      currentLevel = lvl;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      dmgCells.forEach((cell, idx) => {
        const n = parseNum(upgrades[idx]?.damage);
        cell.textContent = n != null ? formatNum(n * LEVEL_MULT[currentLevel]) : (upgrades[idx]?.damage || "");
      });
    });
  });

  panel._upgradesRows = panel.querySelector(".upgrades-rows");
  return panel;
}

export function fitUpgradesToFour(panel) {
  const container = panel._upgradesRows;
  if (!container) return;
  const rows = Array.from(container.querySelectorAll(".upgrade-row"));
  if (rows.length <= 4) return;

  requestAnimationFrame(() => {
    const visibleRows = rows.slice(0, 4);
    const computedHeight = visibleRows.reduce((sum, row) => sum + (row.offsetHeight || 90), 0) + 24;
    if (computedHeight > 0) {
      container.style.maxHeight = `${computedHeight}px`;
    }
  });
}

function buildPassivesPanel(unit) {
  const panel = document.createElement("div");
  panel.className = "passives-table glass-card";

  const passives = unit.passives || [];
  const rowsHtml = passives.map(p => `
    <div class="passive-row">
      <div class="passive-info">
        <span class="passive-name"><span class="passive-label">Passive:</span> <span class="passive-title-text">${p.name}</span></span>
        <span class="passive-effect">${formatPassiveText(p.effect)}</span>
      </div>
    </div>`).join("");

  panel.innerHTML = `
    <div class="panel-heading">
      <span class="panel-title">Passives</span>
    </div>
    <div class="passives-rows">
      ${rowsHtml || `<div class="traits-empty">No passive data</div>`}
    </div>`;

  return panel;
}

function buildStatusEffectsPanel(unit) {
  const effects = unit.statusEffects || [];
  if (!effects || effects.length === 0) {
    return null;
  }

  const panel = document.createElement("div");
  panel.className = "status-effects-table";

  const rowsHtml = effects.map(e => {
    const iconKey = (e.icon || e.name || "bleed").toLowerCase();
    const themeClass = iconKey.includes("freeze") ? "status-card-freeze"
      : iconKey.includes("burn") ? "status-card-burn"
        : (iconKey.includes("slow") || iconKey.includes("stun") || iconKey.includes("stagger") || iconKey.includes("dismembered")) ? "status-card-stun"
          : "status-card-bleed";

    const iconSrc = STATUS_ICONS[e.icon] || STATUS_ICONS.burn || STATUS_ICONS.bleed;
    return `
      <div class="status-effect-box ${themeClass}">
        <div class="status-effect-body">
          <div class="status-effect-name">${e.name}</div>
          <div class="status-effect-tag">Status Effect</div>
          <div class="status-effect-desc">${formatPassiveText(e.effect || "")}</div>
          <div class="status-effect-cooldown">${e.cooldown || "0s"} Cooldown</div>
        </div>
        <div class="status-effect-icon">
          <img src="${toAbsoluteUrl(iconSrc)}" alt="${e.name}" onerror="this.style.display='none'" />
        </div>
      </div>`;
  }).join("");

  panel.innerHTML = `
    <div class="panel-heading">
      <span class="panel-title">Status Effects</span>
    </div>
    <div class="status-effects-rows">
      ${rowsHtml}
    </div>`;

  return panel;
}

function buildInspector(unit) {
  const panel = document.createElement("div");
  panel.className = "inspector glass-card";

  const INSPECTOR_STATS = [
    { key: "archetype", label: "Archetype", icon: "archetype", color: "#f472b6" },
    { key: "element", label: "Element", icon: "element", color: "#fb923c" },
    { key: "damage", label: "Damage", icon: "damage", color: "#f87171" },
    { key: "spa", label: "SPA", icon: "spa", color: "#60a5fa" },
    { key: "range", label: "Range", icon: "range", color: "#fbbf24" },
    { key: "critChance", label: "Crit Chance", icon: "critChance", color: "#c084fc" },
    { key: "critDamage", label: "Crit Damage", icon: "critDamage", color: "#f472b6" },
    { key: "placement", label: "Placements", icon: "placement", color: "#a78bfa" },
    { key: "totalCost", label: "Total Cost", icon: "totalCost", color: "#34d399" },
    { key: "attackType", label: "Attack Type", icon: "attackSpeed", color: "#94a3b8" },
  ];

  const statRow = ({ key, label, icon, color }) => {
    const val =
      key === "totalCost" ? unit.totalCost :
        key === "placement" ? unit.placementCount :
          unit.stats?.[key] || "";
    return `
      <div class="inspector-row">
        <span class="inspector-icon">${iconHtml(key, val, icon, color)}</span>
        <span class="inspector-label">${label}</span>
        <span class="inspector-value">${val}</span>
      </div>`;
  };

  const iconHtml = (key, val, icon, color) => {
    const v = (val || "").toString().toLowerCase();
    if (key === "element" && ELEMENT_ICONS[v]) {
      return iconImg(ELEMENT_ICONS[v], val);
    }
    if (key === "archetype" && ARCHETYPE_ICONS[v]) {
      return iconImg(ARCHETYPE_ICONS[v], val);
    }
    if (UNIT_INFO_ICONS[key]) {
      return iconImg(UNIT_INFO_ICONS[key], key);
    }
    return `<span style="color:${color}">${STAT_ICONS[icon] || ""}</span>`;
  };

  const statsHtml = INSPECTOR_STATS.map(statRow).join("");
  const tiersHtml = (unit.tiers || []).map(t => `<span class="inspector-tier">${t}</span>`).join("");

  const prefTrait = (unit.preferredTrait || "").toString().trim();
  const prefTraitDef = traits.find(t => t.name.toLowerCase() === prefTrait.toLowerCase());
  const prefTraitImg = prefTraitDef?.image ? toAbsoluteUrl(prefTraitDef.image) : "assets/placeholder.svg";

  panel.innerHTML = `
    <div class="inspector-portrait">
      <img src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" />
    </div>
    <div class="inspector-identity">
      <div class="inspector-name">${unit.name || ""}</div>
      <div class="inspector-tiers">${tiersHtml}</div>
    </div>
    <div class="inspector-preferred">
      <img class="inspector-pref-img" src="${prefTraitImg}" alt="${prefTrait}" />
      <div class="inspector-pref-text">
        <span class="inspector-pref-label">Preferred</span>
        <span class="inspector-pref-value">${prefTrait}</span>
      </div>
    </div>
    <div class="inspector-section-label">Stats</div>
    <div class="inspector-stat-group">${statsHtml}</div>`;

  return panel;
}

export function buildDPSBreakdownSubtab(unit, loadoutContainer = null) {
  let currentLevel = 1;
  let currentStatMode = "0%";
  const isDarkMage = unit.id === "darkmagesovereign" || (unit.name && unit.name.includes("Dark Mage"));
  const isLadyGiant = unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant"));
  const isEighthSword = unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword"));

  if (isDarkMage && !unit.darkMageMode) {
    unit.darkMageMode = "lightning";
  }
  if (isLadyGiant && unit.giantForm === undefined) {
    unit.giantForm = false;
  }
  if (isEighthSword) {
    if (unit.demonicPresence === undefined) unit.demonicPresence = false;
    if (unit.berserkState === undefined) unit.berserkState = false;
  }

  const container = document.createElement("div");
  container.className = "uip-dps-compact-wrapper";

  unit.followUpInputsRaw = unit.followUpInputsRaw || ["", "", ""];
  unit.followUpInputs = unit.followUpInputs || [0, 0, 0];

  function render() {
    const baseUnitMock = {
      ...unit,
      selectedDpsRelic: "",
      selectedDpsEquip1: "",
      selectedDpsEquip2: "",
    };

    const bd = getTraitBreakdown(baseUnitMock, "base", currentLevel, currentStatMode);
    const { base, effDamage, effSpa, effRange,
      effCritChance, effCritDamage, critAvgMult, avgHitDamage, effDotMult,
      unitDirectDPS, unitDoTDPS, totalSummonDPS, fuaDps, scaledBaseDamage,
      summonCount, summonDamageMult, summonDamage, summonDirectDPS, summonDoTDPS,
      dotIntervalSPA, isElfMage, fuaBreakdowns, isReaper, giantForm, berserkState, demonicPresence, darkMageMode } = bd;

    const placementCount = parseInt(String(unit.placementCount || unit.stats?.placementCount || "1").replace(/[^0-9]/g, ""), 10) || 1;
    const isCursedStudent = unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student"));

    if (loadoutContainer) {
      loadoutContainer.innerHTML = renderHeaderDpsSummary(unit, bd, placementCount);
    }

    const cycleDuration = 7 * effSpa;
    let followupSectionHtml = "";

    if (isCursedStudent) {
      let totalFollowUpDPS = 0;
      const individualRows = [];
      unit.followUpInputs.forEach((val, idx) => {
        if (val > 0) {
          const fuAvgHit = (val * critAvgMult) + avgHitDamage;
          const fuDpsVal = fuAvgHit / (effSpa * 3);
          totalFollowUpDPS += fuDpsVal;
          individualRows.push(`<div class="dps-kv followup-result-row"><span class="dps-kv-lbl">P${idx + 1} <span class="faint-mult">(${val.toLocaleString()} + ${Math.round(avgHitDamage).toLocaleString()}) × crit / ${(effSpa * 3).toFixed(2)}s</span></span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(fuDpsVal)}</span></div>`);
        }
      });

      followupSectionHtml = `
        <div class="dps-section section-followup">
          <div class="dps-section-hd">Follow-Up Mimicry</div>
          <div class="dps-kv-list">
            <div class="followup-inputs">
              <input type="text" inputmode="numeric" pattern="[0-9]*" class="uip-followup-input" data-idx="0" placeholder="P1 Copied DMG" value="${unit.followUpInputsRaw[0]}" />
              <input type="text" inputmode="numeric" pattern="[0-9]*" class="uip-followup-input" data-idx="1" placeholder="P2 Copied DMG" value="${unit.followUpInputsRaw[1]}" />
              <input type="text" inputmode="numeric" pattern="[0-9]*" class="uip-followup-input" data-idx="2" placeholder="P3 Copied DMG" value="${unit.followUpInputsRaw[2]}" />
            </div>
            ${individualRows.join("")}
            <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">Total Follow-Up DPS</span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(totalFollowUpDPS)}</span></div>
          </div>
        </div>`;
    } else if (isElfMage && fuaBreakdowns && fuaBreakdowns.length > 0) {
      const spellRows = fuaBreakdowns.map(b => {
        const rawSpellDmg = Math.round(b.effectiveFollowUpDamage);
        const formattedSpellName = formatPassiveText(b.name);
        const note = b.name.includes("Eruption") ? ` &middot; ${formatPassiveText("Mana Burn")}` : "";
        return `
          <div class="uip-spell-row">
            <div class="uip-spell-main">
              <span class="uip-spell-name">${formattedSpellName}</span>
              <span class="uip-spell-dps font-mono crit-highlight">+${formatDPS(b.dps)} DPS</span>
            </div>
            <div class="uip-spell-meta">
              <span><b>100% Base &times; 1.25 (Overcharge) = 125% DMG</b> (${rawSpellDmg.toLocaleString()} DMG${note})</span>
              <span>&bull;</span>
              <span>Every ${(7 * effSpa).toFixed(1)}s</span>
            </div>
          </div>
        `;
      }).join("");

      followupSectionHtml = `
        <div class="dps-section section-followup">
          <div class="dps-section-hd color-crit">Arcane Spells (Follow-Up Attacks)</div>
          <div class="uip-spells-container">
            ${spellRows}
            <div class="dps-kv primary" style="margin-top: 4px;"><span class="dps-kv-lbl crit-highlight">Total Arcane Spells DPS</span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(fuaDps)} DPS</span></div>
          </div>
        </div>`;
    } else if (isLadyGiant && fuaBreakdowns && fuaBreakdowns.length > 0) {
      const rockEntry = fuaBreakdowns[0];
      followupSectionHtml = `
        <div class="dps-section section-followup">
          <div class="dps-section-hd color-crit">Rock Storm (Follow-Up Attack)</div>
          <div class="dps-kv-list">
            <div class="dps-kv"><span class="dps-kv-lbl">Frequency</span><span class="dps-kv-val font-mono">1 Rock / 4 Regular Attacks (${(4 * effSpa).toFixed(2)}s)</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— ${formatPassiveText("Rock")} Scale</span><span class="dps-kv-val font-mono">${giantForm ? "125% DMG (Giant Form)" : "100% DMG (Base Form)"}</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Rock Hit DMG</span><span class="dps-kv-val font-mono">${Math.round(rockEntry.averageFollowUpHit).toLocaleString()} DMG</span></div>
            <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">Rock Storm DPS</span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(fuaDps)} DPS</span></div>
          </div>
        </div>`;
    }

    const singlePlacementDPS = unitDirectDPS + unitDoTDPS + totalSummonDPS + fuaDps;
    const finalCombinedDPS = singlePlacementDPS * placementCount;

    const summonsColumn = unit.summons ? `
      <div class="uip-dps-column summons-col">
        <div class="uip-dps-col-title color-summons">
          <span>${unit.summons.name} Breakdown</span>
          <span class="uip-dps-badge summons-highlight">+${formatDPS(totalSummonDPS)} DPS</span>
        </div>
        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">1. Summon Damage</div>
          <div class="dps-kv-list">
            <div class="dps-kv"><span class="dps-kv-lbl">Base Damage</span><span class="dps-kv-val font-mono">${scaledBaseDamage.toLocaleString()}</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Summon Scale <span class="faint-mult">(x${summonDamageMult.toFixed(2)})</span></span><span class="dps-kv-val font-mono">${Math.round(summonDamage).toLocaleString()}</span></div>
            <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">Damage</span><span class="dps-kv-val font-mono summons-highlight">${Math.round(summonDamage).toLocaleString()}</span></div>
          </div>
        </div>
        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">2. Output &amp; Direct DPS</div>
          <div class="dps-kv-list">
            <div class="dps-kv"><span class="dps-kv-lbl">Summon Output</span><span class="dps-kv-val font-mono">${Math.round(summonDamage).toLocaleString()} &times; ${summonCount} = ${Math.round(summonDamage * summonCount).toLocaleString()}</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Unit SPA</span><span class="dps-kv-val font-mono">${effSpa.toFixed(2)}s</span></div>
            <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">Direct DPS <span class="faint-mult">(${Math.round(summonDamage * summonCount).toLocaleString()} / ${effSpa.toFixed(2)}s)</span></span><span class="dps-kv-val font-mono summons-highlight">+${formatDPS(summonDirectDPS)}</span></div>
          </div>
        </div>
        ${base.dotMultiplier > 0 ? `
        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">3. Summons DoT (${formatPassiveText(base.dotName || "Status")})</div>
          <div class="dps-kv-list">
            <div class="dps-kv"><span class="dps-kv-lbl">Status</span><span class="dps-kv-val">${formatPassiveText(base.dotName)}</span></div>
            <div class="dps-kv"><span class="dps-kv-lbl">Summon Output</span><span class="dps-kv-val font-mono">${Math.round(summonDamage * summonCount).toLocaleString()}</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— ${formatPassiveText(base.dotName || "Status")} Scale <span class="faint-mult">(x${effDotMult.toFixed(2)})</span></span><span class="dps-kv-val font-mono">${Math.round(summonDamage * summonCount * effDotMult).toLocaleString()} DMG</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— ${formatPassiveText(base.dotName || "Status")} SPA</span><span class="dps-kv-val font-mono">${dotIntervalSPA.toFixed(2)}s</span></div>
            <div class="dps-kv primary"><span class="dps-kv-lbl dot-highlight">DoT DPS <span class="faint-mult">(${Math.round(summonDamage * summonCount * effDotMult).toLocaleString()} / ${dotIntervalSPA.toFixed(2)}s)</span></span><span class="dps-kv-val font-mono dot-highlight">+${formatDPS(summonDoTDPS)}</span></div>
          </div>
        </div>` : ""}
      </div>` : "";

    const intermediateBaseDmg = currentStatMode === "Z" ? scaledBaseDamage * 1.2 : scaledBaseDamage;
    const intermediateSpa = currentStatMode === "Z" ? base.spa * 0.85 : base.spa;

    container.innerHTML = `
      <div class="uip-dps-main-grid${unit.summons ? " has-summons" : " no-summons"}">
        ${summonsColumn}
        <div class="uip-dps-column main-col">
          <div class="uip-dps-col-title">
            <span>Unit Combat Calculations</span>
            <div class="uip-dps-col-title-controls">
              ${isDarkMage ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${(unit.darkMageMode || "lightning") === "lightning" ? " active" : ""}" data-darkmage-mode="lightning">Lightning Only</button>
                  <button type="button" class="uip-dps-lvl-btn${unit.darkMageMode === "both" ? " active" : ""}" data-darkmage-mode="both">Attack + Lightning</button>
                  <button type="button" class="uip-dps-lvl-btn${unit.darkMageMode === "normal" ? " active" : ""}" data-darkmage-mode="normal">Attack Only</button>
                </div>
              ` : ""}
              ${isLadyGiant ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${unit.giantForm ? " active" : ""}" data-giant-mode="on">Giant Form: On</button>
                  <button type="button" class="uip-dps-lvl-btn${!unit.giantForm ? " active" : ""}" data-giant-mode="off">Giant Form: Off</button>
                </div>
              ` : ""}
              ${isEighthSword ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${unit.demonicPresence ? " active" : ""}" data-demonic-mode="on">Demonic Presence: On</button>
                  <button type="button" class="uip-dps-lvl-btn${!unit.demonicPresence ? " active" : ""}" data-demonic-mode="off">Off</button>
                </div>
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${unit.berserkState ? " active" : ""}" data-berserk-mode="on">Berserk: On</button>
                  <button type="button" class="uip-dps-lvl-btn${!unit.berserkState ? " active" : ""}" data-berserk-mode="off">Off</button>
                </div>
              ` : ""}
              <div class="uip-dps-level-picker">
                <button type="button" class="uip-dps-lvl-btn${currentLevel === 1 ? " active" : ""}" data-lvl="1">Lv. 1</button>
                <button type="button" class="uip-dps-lvl-btn${currentLevel === 50 ? " active" : ""}" data-lvl="50">Lv. 50</button>
              </div>
              <div class="uip-dps-stat-mode-picker">
                <button type="button" class="uip-dps-lvl-btn${currentStatMode === "0%" ? " active" : ""}" data-stat-mode="0%">0% Stat</button>
                <button type="button" class="uip-dps-lvl-btn${currentStatMode === "Z" ? " active" : ""}" data-stat-mode="Z">Z Stat</button>
              </div>
            </div>
          </div>

          <div class="uip-dps-split-columns">
            <div class="uip-dps-subcol">
              <div class="uip-dps-cards-row primary-stats-row">
                <div class="dps-section section-damage">
                  <div class="dps-section-hd">Damage</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base Hit</span><span class="dps-kv-val font-mono">${base.damage.toLocaleString()}</span></div>
                    ${currentLevel > 1 ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Lvl 50 <span class="faint-mult">(${bd.levelMult.toFixed(2)}x)</span></span><span class="dps-kv-val font-mono">${scaledBaseDamage.toLocaleString()}</span></div>` : ""}
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x1.20)</span></span><span class="dps-kv-val font-mono">${Math.round(scaledBaseDamage * 1.2).toLocaleString()}</span></div>` : ""}
                    ${isReaper ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Adaptation <span class="faint-mult">(+40% DMG)</span></span><span class="dps-kv-val font-mono">${Math.round(intermediateBaseDmg * 1.40).toLocaleString()}</span></div>` : ""}
                    ${isLadyGiant && giantForm ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Giant Form <span class="faint-mult">(+125% DMG)</span></span><span class="dps-kv-val font-mono">${Math.round(intermediateBaseDmg * 2.25).toLocaleString()}</span></div>` : ""}
                    ${isEighthSword && berserkState ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Berserk State <span class="faint-mult">(+20% DMG)</span></span><span class="dps-kv-val font-mono">${Math.round(intermediateBaseDmg * 1.20).toLocaleString()}</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl damage-highlight">Effective DMG</span><span class="dps-kv-val font-mono damage-highlight">${Math.round(effDamage).toLocaleString()}</span></div>
                  </div>
                </div>
                <div class="dps-section section-spa">
                  <div class="dps-section-hd">SPA</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base</span><span class="dps-kv-val font-mono">${base.spa.toFixed(2)}s</span></div>
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x0.85)</span></span><span class="dps-kv-val font-mono">${(base.spa * 0.85).toFixed(2)}s</span></div>` : ""}
                    ${isReaper ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Critical Tempo <span class="faint-mult">(-10% SPA)</span></span><span class="dps-kv-val font-mono">${(intermediateSpa * 0.90).toFixed(2)}s</span></div>` : ""}
                    ${isLadyGiant && giantForm ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Giant Form <span class="faint-mult">(+25% SPA time)</span></span><span class="dps-kv-val font-mono">${(intermediateSpa * 1.25).toFixed(2)}s</span></div>` : ""}
                    ${isEighthSword && berserkState ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Berserk State <span class="faint-mult">(-10% SPA)</span></span><span class="dps-kv-val font-mono">${(intermediateSpa * 0.90).toFixed(2)}s</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl spa-highlight">${isDarkMage && darkMageMode === "lightning" ? "Disabled in Lightning Mode" : "Final"}</span><span class="dps-kv-val font-mono spa-highlight">${isDarkMage && darkMageMode === "lightning" ? "1.0s Ticks" : effSpa.toFixed(2) + "s"}</span></div>
                  </div>
                </div>
                <div class="dps-section section-range">
                  <div class="dps-section-hd">Range</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base</span><span class="dps-kv-val font-mono">${base.range.toFixed(1)}</span></div>
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x1.15)</span></span><span class="dps-kv-val font-mono">${(base.range * 1.15).toFixed(1)}</span></div>` : ""}
                    ${isLadyGiant && giantForm ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Giant Form <span class="faint-mult">(+50% Range)</span></span><span class="dps-kv-val font-mono">${((currentStatMode === "Z" ? base.range * 1.15 : base.range) * 1.50).toFixed(1)}</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl range-highlight">Final</span><span class="dps-kv-val font-mono range-highlight">${effRange.toFixed(1)}</span></div>
                  </div>
                </div>
              </div>

              <div class="uip-dps-cards-row secondary-stats-row${(base.dotMultiplier > 0 || demonicPresence) ? " has-dot" : " single-card"}">
                <div class="dps-section section-crit">
                  <div class="dps-section-hd">Crit Averaging</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base Rate / Mult</span><span class="dps-kv-val font-mono">${base.critChancePercent}% / ${base.critDamagePercent}%</span></div>
                    ${isReaper ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Adaptation <span class="faint-mult">(+40% Crit Rate)</span></span><span class="dps-kv-val font-mono">+40% Rate</span></div>` : ""}
                    <div class="dps-kv"><span class="dps-kv-lbl">Final Rate / Mult</span><span class="dps-kv-val font-mono">${Math.min(100, (effCritChance * 100)).toFixed(0)}% / ${(effCritDamage * 100).toFixed(0)}% <span class="faint-mult">→ x${critAvgMult.toFixed(2)} avg</span></span></div>
                    <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">Avg Hit DMG</span><span class="dps-kv-val font-mono crit-highlight">${Math.round(avgHitDamage).toLocaleString()}</span></div>
                  </div>
                </div>
                ${(base.dotMultiplier > 0 || demonicPresence) ? `
                <div class="dps-section section-dot">
                  <div class="dps-section-hd">${isDarkMage ? "Passive Damage Calculation" : isEighthSword ? "Demonic Presence Calculation" : `DoT Calculation (${formatPassiveText(base.dotName || "Status")})`}</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Effect</span><span class="dps-kv-val">${formatPassiveText(base.dotName)}</span></div>
                    <div class="dps-kv"><span class="dps-kv-lbl">Effective DMG</span><span class="dps-kv-val font-mono">${Math.round(effDamage).toLocaleString()}</span></div>
                    ${isElfMage ? `
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Inflicted By</span><span class="dps-kv-val font-mono">${formatPassiveText("Eruption")} (1 cast / 7 attacks)</span></div>
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— ${formatPassiveText("Mana Burn")} DMG <span class="faint-mult">(50% over 8s)</span></span><span class="dps-kv-val font-mono dot-highlight">${Math.round(effDamage * effDotMult).toLocaleString()} DMG</span></div>
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Cycle Duration</span><span class="dps-kv-val font-mono"><span class="faint-mult">7 &times; ${effSpa.toFixed(2)}s =</span> ${cycleDuration.toFixed(2)}s</span></div>
                    ` : isEighthSword ? `
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Demonic Presence <span class="faint-mult">(15% Avg Hit/s)</span></span><span class="dps-kv-val font-mono dot-highlight">${Math.round(avgHitDamage * 0.15).toLocaleString()} DMG</span></div>
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Interval</span><span class="dps-kv-val font-mono">1.0s</span></div>
                    ` : `
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Scale <span class="faint-mult">(x${effDotMult.toFixed(2)})</span></span><span class="dps-kv-val font-mono">${Math.round(effDamage * effDotMult).toLocaleString()} DMG</span></div>
                      <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Interval</span><span class="dps-kv-val font-mono">${dotIntervalSPA.toFixed(2)}s</span></div>
                    `}
                    <div class="dps-kv primary"><span class="dps-kv-lbl dot-highlight">${isDarkMage || isEighthSword ? "Passive DPS" : "DoT DPS"}</span><span class="dps-kv-val font-mono dot-highlight">+${formatDPS(unitDoTDPS)}</span></div>
                  </div>
                </div>` : ""}
              </div>
            </div>

            <div class="uip-dps-subcol">
              ${followupSectionHtml}

              <div class="dps-section section-damage placement-total-card">
                <div class="dps-section-hd">Placement DPS Total</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Single Placement DPS</span><span class="dps-kv-val font-mono">${Math.round(singlePlacementDPS).toLocaleString()} DPS</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Unit Direct DPS x placements</span><span class="dps-kv-val font-mono">${Math.round(unitDirectDPS).toLocaleString()} x ${placementCount} = ${Math.round(unitDirectDPS * placementCount).toLocaleString()}</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">${isDarkMage || isEighthSword ? "Passive DPS x placements" : "DoT DPS x placements"}</span><span class="dps-kv-val font-mono">${Math.round(unitDoTDPS).toLocaleString()} x ${placementCount} = ${Math.round(unitDoTDPS * placementCount).toLocaleString()}</span></div>
                  ${unit.summons ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">Summons DPS x placements</span><span class="dps-kv-val font-mono">${Math.round(totalSummonDPS).toLocaleString()} x ${placementCount} = ${Math.round(totalSummonDPS * placementCount).toLocaleString()}</span></div>` : ""}
                  ${fuaDps > 0 ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">Follow-Up DPS x placements</span><span class="dps-kv-val font-mono">${Math.round(fuaDps).toLocaleString()} x ${placementCount} = ${Math.round(fuaDps * placementCount).toLocaleString()}</span></div>` : ""}
                  <div class="dps-kv primary"><span class="dps-kv-lbl combined-highlight">Total Field DPS</span><span class="dps-kv-val font-mono combined-highlight">${Math.round(finalCombinedDPS).toLocaleString()} DPS</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll(".uip-dps-lvl-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.lvl) {
          const lvl = parseInt(btn.dataset.lvl, 10);
          if (lvl !== currentLevel) {
            currentLevel = lvl;
            render();
          }
        } else if (btn.dataset.statMode) {
          const mode = btn.dataset.statMode;
          if (mode !== currentStatMode) {
            currentStatMode = mode;
            render();
          }
        } else if (btn.dataset.darkmageMode) {
          unit.darkMageMode = btn.dataset.darkmageMode;
          render();
        } else if (btn.dataset.giantMode) {
          unit.giantForm = btn.dataset.giantMode === "on";
          render();
        } else if (btn.dataset.demonicMode) {
          unit.demonicPresence = btn.dataset.demonicMode === "on";
          render();
        } else if (btn.dataset.berserkMode) {
          unit.berserkState = btn.dataset.berserkMode === "on";
          render();
        }
      });
    });

    if (isCursedStudent) {
      container.querySelectorAll(".uip-followup-input").forEach(input => {
        input.addEventListener("input", () => {
          const idx = parseInt(input.dataset.idx, 10);
          const caretStart = input.selectionStart;
          const caretEnd = input.selectionEnd;

          unit.followUpInputsRaw[idx] = input.value;
          unit.followUpInputs[idx] = parseFloat(input.value) || 0;

          render();

          const nextInput = container.querySelector(`.uip-followup-input[data-idx="${idx}"]`);
          if (nextInput) {
            nextInput.focus();
            try {
              nextInput.setSelectionRange(caretStart, caretEnd);
            } catch (e) { }
          }
        });
      });
    }
  }

  render();
  return container;
}

export async function UnitInfoPage(unit, overrideSubTab = null) {
  let activeSubTab = overrideSubTab || "info";
  setUnitSubTab(unit.id, activeSubTab);

  const wrap = document.createElement("div");
  wrap.className = "page unit-info-page";

  const header = document.createElement("div");
  header.className = "uip-header";

  const headerLeft = document.createElement("div");
  headerLeft.className = "uip-header-left";
  const tiersHtml = (unit.tiers || []).map(t => `<span class="uip-tier">${t}</span>`).join("");
  headerLeft.innerHTML = `
    <div class="uip-avatar">
      <img src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" />
    </div>
    <div class="uip-meta">
      <h1 class="uip-name">${unit.name || ""}</h1>
      <div class="uip-tags">${tiersHtml}<span class="uip-trait-tag">${unit.preferredTrait || ""}</span></div>
    </div>`;
  header.appendChild(headerLeft);

  const loadoutContainer = document.createElement("div");
  loadoutContainer.className = "uip-header-right";
  header.appendChild(loadoutContainer);

  const subnav = document.createElement("div");
  subnav.className = "uip-subnav";
  subnav.innerHTML = `
    <button type="button" class="uip-subtab-btn${activeSubTab === "info" ? " active" : ""}" data-subtab="info">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12"></line>
        <line x1="12" y1="11" x2="12"></line>
        <circle cx="12" cy="7" r="0.8" fill="currentColor"></circle>
      </svg>
      <span>Unit Info</span>
    </button>
    <button type="button" class="uip-subtab-btn${activeSubTab === "dps" ? " active" : ""}" data-subtab="dps">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span>DPS Breakdown</span>
    </button>
  `;

  const stickyHeader = document.createElement("div");
  stickyHeader.className = "uip-sticky-header";
  stickyHeader.appendChild(header);
  stickyHeader.appendChild(subnav);

  wrap.appendChild(stickyHeader);

  const contentArea = document.createElement("div");
  contentArea.className = "uip-content-area";
  wrap.appendChild(contentArea);

  function switchTab(target) {
    activeSubTab = target;
    setUnitSubTab(unit.id, activeSubTab);

    subnav.querySelectorAll(".uip-subtab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.subtab === activeSubTab);
    });

    loadoutContainer.innerHTML = "";
    contentArea.innerHTML = "";

    if (activeSubTab === "dps") {
      const dpsBody = buildDPSBreakdownSubtab(unit, loadoutContainer);
      contentArea.appendChild(dpsBody);
    } else {
      loadoutContainer.appendChild(buildLoadoutPanel(unit));

      const body = document.createElement("div");
      body.className = "uip-body";

      const main = document.createElement("div");
      main.className = "uip-main-side-by-side";

      const rightCol = document.createElement("div");
      rightCol.className = "uip-col";
      rightCol.appendChild(buildPassivesPanel(unit));

      const statusPanel = buildStatusEffectsPanel(unit);
      if (statusPanel) {
        rightCol.appendChild(statusPanel);
      }

      const upgradesPanel = buildUpgradesPanel(unit);
      main.appendChild(upgradesPanel);
      main.appendChild(rightCol);

      body.appendChild(main);
      body.appendChild(buildInspector(unit));
      contentArea.appendChild(body);

      fitUpgradesToFour(upgradesPanel);
    }
  }

  subnav.querySelectorAll(".uip-subtab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.dataset.subtab;
      if (target !== activeSubTab) {
        switchTab(target);
      }
    });
  });

  switchTab(activeSubTab);

  return wrap;
}