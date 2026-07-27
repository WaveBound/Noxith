import { STAT_ICONS, ELEMENT_ICONS, ARCHETYPE_ICONS, UNIT_INFO_ICONS, STATUS_ICONS, iconImg, formatPassiveText, relicImgByName, toAbsoluteUrl } from "../../icons/icons.js";
import { traits } from "../../data/traits.js";
import { getTraitBreakdown, formatDPS } from "../../pages/dps-math.js";
import { relicStats } from "../../data/relicstats.js";
import { relics as allRelicsCatalog } from "../../data/relics.js";

const unitSubTabMap = new Map();
const activeSummonViewMap = new Map();
const activeRightPanelTabMap = new Map();
const activeDpsSubtabSummonMap = new Map();

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
        <span class="uip-header-dps-val summons-highlight">${formatDPS(totalSummonDPS)}</span>
        <span class="uip-header-dps-lbl">Summons Field</span>
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

function buildUpgradesPanel(unit, activeSummonData = null) {
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

  if (activeSummonData && !activeSummonData.hasOwnUpgrades) {
    const unlockText = activeSummonData.id === "wingedspirit"
      ? "Unlocked on Main Unit Upgrade 3"
      : activeSummonData.id === "spiritgeneral"
        ? "Unlocked on Main Unit Upgrade 10 (Divine Spirit Ability)"
        : "Unit Summon";

    const dmgText = activeSummonData.id === "wingedspirit"
      ? "50% of Unit DMG"
      : activeSummonData.id === "spiritgeneral"
        ? "100% Base DMG (+100% Execution Cycle Passive Cap)"
      : activeSummonData.id === "batspirits"
        ? "15% of Unit DMG — Despawns after 3 attacks"
      : activeSummonData.id === "mirageclone"
        ? "50% of Unit DMG"
      : activeSummonData.baseDamageMultiplier != null
        ? `${Math.round(activeSummonData.baseDamageMultiplier * 100)}% of Unit DMG`
        : "100% Unit DMG";

    const spaText = activeSummonData.id === "mirageclone"
      ? `Same as Unit (${unit.stats?.spa || "?"}s)`
      : activeSummonData.intervalSPA
        ? `${activeSummonData.intervalSPA}s`
        : activeSummonData.baseSpa
          ? `${activeSummonData.baseSpa}s`
          : `${unit.stats?.spa || "6s"}`;

    const rangeText = activeSummonData.id === "mirageclone"
      ? `Same as Unit (${unit.stats?.range || "?"})`
      : activeSummonData.range
        ? (typeof activeSummonData.range === "number" ? `${activeSummonData.range}` : activeSummonData.range)
        : "50% of Unit Range";


    panel.innerHTML = `
      <div class="upgrades-box">
        <div class="panel-heading">
          <span class="panel-title">${activeSummonData.name} Overview</span>
        </div>
        <div class="upgrade-row upgrade-row-placement" style="margin-top: 8px;">
          <div class="upgrade-header">
            <span class="upgrade-number">${unlockText}</span>
            <span class="upgrade-cost">Ability Summon</span>
          </div>
          ${activeSummonData.attackName ? `
            <div class="upgrade-attack">
              <span class="upgrade-attack-label">Attack:</span>
              <span class="upgrade-attack-name">${activeSummonData.attackName}</span>
            </div>` : ""}
          <div class="upgrade-stats">
            <div class="upgrade-stat">
              <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.damage, "Damage")}</span>
              <span class="upgrade-stat-label">Dmg Scale:</span>
              <span class="upgrade-stat-value">${dmgText}</span>
            </div>
            <div class="upgrade-stat">
              <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.spa, "SPA")}</span>
              <span class="upgrade-stat-label">SPA:</span>
              <span class="upgrade-stat-value">${spaText}</span>
            </div>
            <div class="upgrade-stat">
              <span class="upgrade-stat-icon">${iconImg(UNIT_INFO_ICONS.range, "Range")}</span>
              <span class="upgrade-stat-label">Range:</span>
              <span class="upgrade-stat-value">${rangeText}</span>
            </div>
          </div>
          ${activeSummonData.aoe ? `<div class="upgrade-meta"><span class="upgrade-meta-label">AoE Type:</span> <span class="upgrade-meta-value">${activeSummonData.aoe}</span></div>` : ""}
          ${activeSummonData.attackTime ? `<div class="upgrade-meta"><span class="upgrade-meta-label">Attack Time:</span> <span class="upgrade-meta-value">${activeSummonData.attackTime}</span></div>` : ""}
          ${activeSummonData.passive ? `<div class="upgrade-desc">${formatPassiveText(activeSummonData.passive)}</div>` : ""}
        </div>
      </div>`;
    return panel;
  }

  const upgrades = activeSummonData?.upgrades || (unit.placement || []);

  const rowsHtml = upgrades.map((u, i) => {
    const isPlacement = u.upgrade === 0;
    const isMax = (i === upgrades.length - 1) || (u.cost === "$0" || u.cost === "0" || u.cost === "Maxed");
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
        ${u.attackName ? `
          <div class="upgrade-attack">
            <span class="upgrade-attack-label">Attack:</span>
            <span class="upgrade-attack-name">${u.attackName}</span>
          </div>` : ""}
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
        ${u.description ? `<div class="upgrade-desc">${formatPassiveText(u.description)}</div>` : ""}
      </div>`;
  }).join("");

  const headerTitle = activeSummonData ? `${activeSummonData.name} Stats` : "Stats";

  panel.innerHTML = `
    <div class="upgrades-box">
      <div class="panel-heading">
        <span class="panel-title">${headerTitle}</span>
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

  // Dynamically size the scroll container to show exactly 3 rows
  // Uses requestAnimationFrame so rows are in DOM and measurable
  requestAnimationFrame(() => {
    const rowsContainer = panel.querySelector(".upgrades-rows");
    if (!rowsContainer) return;
    const rows = rowsContainer.querySelectorAll(".upgrade-row");
    const VISIBLE_ROWS = 3;
    const GAP = 8; // matches CSS gap: 8px

    // getBoundingClientRect returns VISUAL (zoomed) pixels.
    // CSS max-height is in LAYOUT pixels (before zoom).
    // Divide by zoom factor to get the correct CSS pixel value.
    const bodyZoom = parseFloat(getComputedStyle(document.body).zoom) || 1;

    if (rows.length <= VISIBLE_ROWS) {
      rowsContainer.style.maxHeight = "none";
      rowsContainer.style.overflowY = "visible";
    } else {
      let totalH = 0;
      for (let i = 0; i < VISIBLE_ROWS; i++) {
        totalH += rows[i].getBoundingClientRect().height;
        if (i < VISIBLE_ROWS - 1) totalH += GAP * bodyZoom; // gap also needs zoom correction
      }
      rowsContainer.style.maxHeight = Math.ceil(totalH / bodyZoom) + "px";
      rowsContainer.style.overflowY = "auto";
    }
  });

  return panel;
}

function buildRightPanel(unit, activeSummonData = null) {
  const panel = document.createElement("div");
  panel.className = "uip-col";

  const hasAbilities = unit.abilities && unit.abilities.length > 0 && !activeSummonData;
  let activeTab = activeRightPanelTabMap.get(unit.id) || "passives";

  function render() {
    panel.innerHTML = "";

    let passives = unit.passives || [];
    if (activeSummonData) {
      passives = [];
      if (activeSummonData.passive) {
        passives.push({ name: activeSummonData.name, effect: activeSummonData.passive });
      }
    }

    const passivesHtml = passives.map(p => `
      <div class="passive-row">
        <div class="passive-info">
          <span class="passive-name"><span class="passive-label">Passive:</span> <span class="passive-title-text">${p.name}</span></span>
          <span class="passive-effect">${formatPassiveText(p.effect || p.desc || "")}</span>
        </div>
      </div>`).join("");

    const abilitiesHtml = (unit.abilities || []).map(a => `
      <div class="passive-row">
        <div class="passive-info">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 2px;">
            <span class="passive-name"><span class="passive-label" style="background: linear-gradient(90deg, #3b82f6, #60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Ability:</span> <span class="passive-title-text">${a.name}</span></span>
            <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: #a78bfa; background: rgba(167, 139, 250, 0.12); border: 1px solid rgba(167, 139, 250, 0.25); padding: 1px 6px; border-radius: 4px;">${a.cooldown || ""}</span>
          </div>
          <span class="passive-effect">${formatPassiveText(a.desc || a.effect || "")}</span>
        </div>
      </div>`).join("");

    const rightTable = document.createElement("div");
    rightTable.className = "passives-table glass-card";

    let headerHtml = "";
    if (hasAbilities) {
      headerHtml = `
        <div class="panel-heading">
          <span class="panel-title">${activeTab === "passives" ? "Passives" : "Abilities"}</span>
          <div class="right-panel-switcher">
            <button type="button" class="right-panel-tab${activeTab === "passives" ? " active" : ""}" data-tab="passives">Passives</button>
            <button type="button" class="right-panel-tab${activeTab === "abilities" ? " active" : ""}" data-tab="abilities">Abilities</button>
          </div>
        </div>`;
    } else {
      headerHtml = `
        <div class="panel-heading">
          <span class="panel-title">${activeSummonData ? `${activeSummonData.name} Passives` : "Passives"}</span>
        </div>`;
    }

    const contentRows = (hasAbilities && activeTab === "abilities") ? abilitiesHtml : passivesHtml;

    rightTable.innerHTML = `
      ${headerHtml}
      <div class="passives-rows">
        ${contentRows || `<div class="traits-empty">No data</div>`}
      </div>`;

    panel.appendChild(rightTable);

    if (hasAbilities) {
      rightTable.querySelectorAll(".right-panel-tab").forEach(btn => {
        btn.addEventListener("click", () => {
          activeTab = btn.dataset.tab;
          activeRightPanelTabMap.set(unit.id, activeTab);
          render();
        });
      });
    }

    // Status Effects Panel
    const statusPanel = buildStatusEffectsPanel(unit, activeSummonData);
    if (statusPanel) {
      panel.appendChild(statusPanel);
    }
  }

  render();
  return panel;
}

function buildStatusEffectsPanel(unit, activeSummonData = null) {
  let effects = [];
  if (activeSummonData) {
    if (activeSummonData.statusEffect) {
      effects = [activeSummonData.statusEffect];
    }
  } else {
    effects = unit.statusEffects || [];
  }

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

function buildInspector(unit, activeSummonData = null) {
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
    let val = "";
    if (activeSummonData) {
      if (key === "damage") val = activeSummonData.maxDamage ? `${activeSummonData.maxDamage}` : "50% Unit DMG";
      else if (key === "spa") val = activeSummonData.maxSpa ? `${activeSummonData.maxSpa}s` : (activeSummonData.intervalSPA ? `${activeSummonData.intervalSPA}s` : unit.stats?.spa || "");
      else if (key === "range") val = activeSummonData.range || unit.stats?.range || "";
      else if (key === "placement") val = activeSummonData.globalMax ? `${activeSummonData.globalMax} Max` : `${activeSummonData.countPerPlacement || 1}/Placement`;
      else if (key === "attackType") val = activeSummonData.aoe || unit.stats?.attackType || "";
      else val = unit.stats?.[key] || "";
    } else {
      val = key === "totalCost" ? unit.totalCost :
        key === "placement" ? unit.placementCount :
          unit.stats?.[key] || "";
    }

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
      <div class="inspector-name">${activeSummonData ? activeSummonData.name : (unit.name || "")}</div>
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
  let activeDpsSummonId = activeDpsSubtabSummonMap.get(unit.id) || "main";

  if (isDarkMage && !unit.darkMageMode) {
    unit.darkMageMode = "lightning";
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
      dotIntervalSPA, darkMageMode, levelMult, summonBreakdowns } = bd;

    const lvlMult = levelMult || 1;
    const placementCount = parseInt(String(unit.placementCount || unit.stats?.placementCount || "1").replace(/[^0-9]/g, ""), 10) || 1;

    if (loadoutContainer) {
      loadoutContainer.innerHTML = renderHeaderDpsSummary(unit, bd, placementCount);
    }

    const rawSummons = unit.summons ? (Array.isArray(unit.summons) ? unit.summons : [unit.summons]) : null;

    let dpsSummonBarHtml = "";
    if (rawSummons && rawSummons.length > 0) {
      dpsSummonBarHtml = `
        <div class="uip-summon-selector-bar">
          <button type="button" class="uip-summon-btn main-btn${activeDpsSummonId === "main" ? " active" : ""}" data-dps-summon="main">Main Unit</button>
          ${rawSummons.map(s => `
            <button type="button" class="uip-summon-btn${activeDpsSummonId === s.id ? " active" : ""}" data-dps-summon="${s.id}">${s.name}</button>
          `).join("")}
        </div>`;
    }

    const summonsColumn = rawSummons ? `
      <div class="uip-dps-column summons-col">
        <div class="uip-dps-col-title color-summons">
          <span>Spirits &amp; Summons</span>
          <span class="uip-dps-badge summons-highlight">+${formatDPS(totalSummonDPS)} DPS</span>
        </div>
        ${(summonBreakdowns || []).map((s, idx) => {
      let calcNote = "";
      if (s.id === "spiritgeneral") {
        calcNote = "100% Base DMG × 2.00 (+100% Execution Cycle)";
      } else if (s.id === "wingedspirit") {
        calcNote = "50% Unit DMG (75% with Hexed Blade)";
      } else if (s.id === "spiritwolf") {
        calcNote = "Max Upgrade DMG (1088 base × Lvl)";
      }

      return `
            <div class="dps-section section-summons">
              <div class="dps-section-hd color-summons">${idx + 1}. ${s.name}</div>
              <div class="dps-kv-list">
                <div class="dps-kv"><span class="dps-kv-lbl">Active Field Count</span><span class="dps-kv-val font-mono">${s.activeCount} on field</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Hit Damage</span><span class="dps-kv-val font-mono">${Math.round(s.effDamage).toLocaleString()} DMG</span></div>
                ${calcNote ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Scale Rule</span><span class="dps-kv-val font-mono" style="font-size:9.5px;">${calcNote}</span></div>` : ""}
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Crit Avg Hit</span><span class="dps-kv-val font-mono">${Math.round(s.avgHitDamage).toLocaleString()} DMG</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Effective SPA</span><span class="dps-kv-val font-mono">${s.effSpa.toFixed(1)}s</span></div>
                <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">${s.name} DPS</span><span class="dps-kv-val font-mono summons-highlight">+${formatDPS(s.dps)}</span></div>
              </div>
            </div>`;
    }).join("")}
      </div>` : "";

    const singlePlacementDPS = unitDirectDPS + unitDoTDPS + totalSummonDPS + fuaDps;
    const finalCombinedDPS = singlePlacementDPS * placementCount;

    // Render active inspection target (Main Unit or active summon)
    const inspectedSummon = (activeDpsSummonId !== "main" && summonBreakdowns)
      ? summonBreakdowns.find(sb => sb.id === activeDpsSummonId)
      : null;

    const inspectedDmg = inspectedSummon ? inspectedSummon.effDamage : effDamage;
    const inspectedSpa = inspectedSummon ? inspectedSummon.effSpa : effSpa;
    const inspectedBaseDmg = inspectedSummon ? inspectedSummon.baseDamage : base.damage;
    const inspectedBaseSpa = inspectedSummon ? inspectedSummon.baseSpa : base.spa;

    container.innerHTML = `
      ${dpsSummonBarHtml}
      <div class="uip-dps-main-grid${unit.summons ? " has-summons" : " no-summons"}">
        ${summonsColumn}
        <div class="uip-dps-column main-col">
          <div class="uip-dps-col-title">
            <span>${inspectedSummon ? `${inspectedSummon.name} Calculations` : "Unit Combat Calculations"}</span>
            <div class="uip-dps-col-title-controls">
              ${isDarkMage ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${(unit.darkMageMode || "lightning") === "lightning" ? " active" : ""}" data-darkmage-mode="lightning">Lightning Only</button>
                  <button type="button" class="uip-dps-lvl-btn${unit.darkMageMode === "both" ? " active" : ""}" data-darkmage-mode="both">Normal + Lightning</button>
                  <button type="button" class="uip-dps-lvl-btn${unit.darkMageMode === "normal" ? " active" : ""}" data-darkmage-mode="normal">Normal Only</button>
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
                    <div class="dps-kv"><span class="dps-kv-lbl">Base Hit</span><span class="dps-kv-val font-mono">${Math.round(inspectedBaseDmg).toLocaleString()}</span></div>
                    ${currentLevel > 1 ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Lvl 50 <span class="faint-mult">(${lvlMult.toFixed(2)}x)</span></span><span class="dps-kv-val font-mono">${Math.round(scaledBaseDamage).toLocaleString()}</span></div>` : ""}
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x1.20)</span></span><span class="dps-kv-val font-mono">${Math.round(inspectedDmg).toLocaleString()}</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl damage-highlight">Effective DMG</span><span class="dps-kv-val font-mono damage-highlight">${Math.round(inspectedDmg).toLocaleString()}</span></div>
                  </div>
                </div>
                <div class="dps-section section-spa">
                  <div class="dps-section-hd">SPA</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base</span><span class="dps-kv-val font-mono">${inspectedBaseSpa.toFixed(1)}s</span></div>
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x0.85)</span></span><span class="dps-kv-val font-mono">${inspectedSpa.toFixed(2)}s</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl spa-highlight">Final SPA</span><span class="dps-kv-val font-mono spa-highlight">${inspectedSpa.toFixed(2)}s</span></div>
                  </div>
                </div>
                <div class="dps-section section-range">
                  <div class="dps-section-hd">Range</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base</span><span class="dps-kv-val font-mono">${base.range.toFixed(1)}</span></div>
                    ${currentStatMode === "Z" ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">— Z Stat <span class="faint-mult">(x1.15)</span></span><span class="dps-kv-val font-mono">${(base.range * 1.15).toFixed(1)}</span></div>` : ""}
                    <div class="dps-kv primary"><span class="dps-kv-lbl range-highlight">Final</span><span class="dps-kv-val font-mono range-highlight">${effRange.toFixed(1)}</span></div>
                  </div>
                </div>
              </div>

              <div class="uip-dps-cards-row secondary-stats-row single-card">
                <div class="dps-section section-crit">
                  <div class="dps-section-hd">Crit Averaging</div>
                  <div class="dps-kv-list">
                    <div class="dps-kv"><span class="dps-kv-lbl">Base Rate / Mult</span><span class="dps-kv-val font-mono">${base.critChancePercent}% / ${base.critDamagePercent}%</span></div>
                    <div class="dps-kv"><span class="dps-kv-lbl">Final Rate / Mult</span><span class="dps-kv-val font-mono">${Math.min(100, (effCritChance * 100)).toFixed(0)}% / ${(effCritDamage * 100).toFixed(0)}% <span class="faint-mult">→ x${critAvgMult.toFixed(2)} avg</span></span></div>
                    <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">Avg Hit DMG</span><span class="dps-kv-val font-mono crit-highlight">${Math.round(inspectedSummon ? inspectedSummon.avgHitDamage : avgHitDamage).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="uip-dps-subcol">
              <div class="dps-section section-damage placement-total-card">
                <div class="dps-section-hd">Placement DPS Total</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Single Placement DPS</span><span class="dps-kv-val font-mono">${Math.round(singlePlacementDPS).toLocaleString()} DPS</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Unit Direct DPS x placements</span><span class="dps-kv-val font-mono">${Math.round(unitDirectDPS).toLocaleString()} x ${placementCount} = ${Math.round(unitDirectDPS * placementCount).toLocaleString()}</span></div>
                  ${unit.summons ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">Summons Total Field DPS</span><span class="dps-kv-val font-mono">+${Math.round(totalSummonDPS).toLocaleString()} DPS</span></div>` : ""}
                  <div class="dps-kv primary"><span class="dps-kv-lbl combined-highlight">Total Field DPS</span><span class="dps-kv-val font-mono combined-highlight">${Math.round(finalCombinedDPS).toLocaleString()} DPS</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll(".uip-summon-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeDpsSummonId = btn.dataset.dpsSummon;
        activeDpsSubtabSummonMap.set(unit.id, activeDpsSummonId);
        render();
      });
    });

    container.querySelectorAll(".uip-dps-lvl-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.lvl) {
          currentLevel = parseInt(btn.dataset.lvl, 10);
          render();
        } else if (btn.dataset.statMode) {
          currentStatMode = btn.dataset.statMode;
          render();
        } else if (btn.dataset.darkmageMode) {
          unit.darkMageMode = btn.dataset.darkmageMode;
          render();
        }
      });
    });
  }

  render();
  return container;
}

export async function UnitInfoPage(unit, overrideSubTab = null) {
  let activeSubTab = overrideSubTab || "info";
  setUnitSubTab(unit.id, activeSubTab);

  let activeSummonView = activeSummonViewMap.get(unit.id) || "main";

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

  function renderUnitInfoView() {
    contentArea.innerHTML = "";

    const rawSummons = unit.summons ? (Array.isArray(unit.summons) ? unit.summons : [unit.summons]) : [];

    let selectorBarHtml = "";
    if (rawSummons.length > 0) {
      selectorBarHtml = `
        <div class="uip-summon-selector-bar">
          <button type="button" class="uip-summon-btn main-btn${activeSummonView === "main" ? " active" : ""}" data-summon-id="main">Main Unit</button>
          ${rawSummons.map(s => `
            <button type="button" class="uip-summon-btn${activeSummonView === s.id ? " active" : ""}" data-summon-id="${s.id}">${s.name}</button>
          `).join("")}
        </div>`;
    }

    const activeSummonData = activeSummonView !== "main" ? rawSummons.find(s => s.id === activeSummonView) : null;

    const body = document.createElement("div");
    body.className = "uip-body";

    const main = document.createElement("div");
    main.className = "uip-main-side-by-side";

    const rightCol = buildRightPanel(unit, activeSummonData);

    const upgradesPanel = buildUpgradesPanel(unit, activeSummonData);
    main.appendChild(upgradesPanel);
    main.appendChild(rightCol);

    body.appendChild(main);
    body.appendChild(buildInspector(unit, activeSummonData));

    if (selectorBarHtml) {
      const wrapDiv = document.createElement("div");
      wrapDiv.innerHTML = selectorBarHtml;
      contentArea.appendChild(wrapDiv.firstElementChild);

      contentArea.querySelectorAll(".uip-summon-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          activeSummonView = btn.dataset.summonId;
          activeSummonViewMap.set(unit.id, activeSummonView);
          renderUnitInfoView();
        });
      });
    }

    contentArea.appendChild(body);
  }

  function switchTab(target) {
    activeSubTab = target;
    setUnitSubTab(unit.id, activeSubTab);

    subnav.querySelectorAll(".uip-subtab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.subtab === activeSubTab);
    });

    loadoutContainer.innerHTML = "";

    if (activeSubTab === "dps") {
      contentArea.innerHTML = "";
      const dpsBody = buildDPSBreakdownSubtab(unit, loadoutContainer);
      contentArea.appendChild(dpsBody);
    } else {
      loadoutContainer.appendChild(buildLoadoutPanel(unit));
      renderUnitInfoView();
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