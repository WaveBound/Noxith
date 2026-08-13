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
  const { unitDirectDPS, unitDoTDPS, totalSummonDPS, fuaDps, isDarkMage, isEighthSword, isCrow } = bd;
  const singlePlacementDPS = (unitDirectDPS || 0) + (unitDoTDPS || 0) + (totalSummonDPS || 0) + (fuaDps || 0);
  const finalCombinedDPS = singlePlacementDPS * placementCount;

  return `
    <div class="uip-header-dps-grid">
      <div class="uip-header-dps-card card-unit">
        <span class="uip-header-dps-val damage-highlight">${formatDPS((unitDirectDPS || 0) * placementCount)}</span>
        <span class="uip-header-dps-lbl">Unit x${placementCount}</span>
      </div>
      ${(unitDoTDPS || 0) > 0 ? `
      <div class="uip-header-dps-card card-dot">
        <span class="uip-header-dps-val dot-highlight">${formatDPS((unitDoTDPS || 0) * placementCount)}</span>
        <span class="uip-header-dps-lbl">${isDarkMage || isEighthSword ? "Passive" : isCrow ? "Black Fire" : "DoT"} x${placementCount}</span>
      </div>` : ""}
      ${unit.summons ? `
      <div class="uip-header-dps-card card-summons">
        <span class="uip-header-dps-val summons-highlight">${formatDPS(totalSummonDPS || 0)}</span>
        <span class="uip-header-dps-lbl">Summons Field</span>
      </div>` : ""}
      ${(fuaDps || 0) > 0 ? `
      <div class="uip-header-dps-card card-fua">
        <span class="uip-header-dps-val crit-highlight">${formatDPS((fuaDps || 0) * placementCount)}</span>
        <span class="uip-header-dps-lbl">${isCrow ? "Illusion" : "Follow-Up"} x${placementCount}</span>
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

  panel.querySelectorAll(".loadout-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.closest(".loadout-dropdown")) return;
      e.stopPropagation();

      const dropdown = item.querySelector(".loadout-dropdown");
      const btn = item.querySelector(".loadout-info-btn");

      panel.querySelectorAll(".loadout-item").forEach(other => {
        if (other === item) return;
        const od = other.querySelector(".loadout-dropdown");
        const ob = other.querySelector(".loadout-info-btn");
        if (od) od.classList.add("collapsed");
        if (ob) ob.classList.remove("active");
        other.classList.remove("active");
      });

      const isCollapsed = dropdown.classList.toggle("collapsed");
      item.classList.toggle("active", !isCollapsed);
      if (btn) btn.classList.toggle("active", !isCollapsed);

      // Smart edge detection: prevents overflowing off both left AND right screen edges
      if (!isCollapsed && dropdown) {
        const rect = item.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const dropdownWidth = dropdown.offsetWidth || 230;

        const overflowRight = (rect.left + dropdownWidth) > (screenWidth - 16);
        const overflowLeft = (rect.right - dropdownWidth) < 16;

        // Only open to the left if it overflows on the right AND has room on the left
        if (overflowRight && !overflowLeft) {
          dropdown.style.left = "auto";
          dropdown.style.right = "0";
        } else {
          dropdown.style.left = "0";
          dropdown.style.right = "auto";
        }
      }
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

  requestAnimationFrame(() => {
    const rowsContainer = panel.querySelector(".upgrades-rows");
    if (!rowsContainer) return;
    const rows = rowsContainer.querySelectorAll(".upgrade-row");
    const VISIBLE_ROWS = 3;
    const GAP = 8;

    if (rows.length <= VISIBLE_ROWS) {
      rowsContainer.style.maxHeight = "none";
      rowsContainer.style.overflowY = "visible";
    } else {
      let totalH = 0;
      for (let i = 0; i < VISIBLE_ROWS; i++) {
        totalH += (rows[i].offsetHeight || 92);
        if (i < VISIBLE_ROWS - 1) totalH += GAP;
      }
      rowsContainer.style.maxHeight = `${totalH}px`;
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
            <span class="passive-name"><span class="passive-label" style="background: linear-gradient(90deg, #a855f7, #c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Ability:</span> <span class="passive-title-text">${a.name}</span></span>
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
    const themeClass = iconKey.includes("illusion") ? "status-card-illusion"
      : iconKey.includes("blackfire") || iconKey.includes("black fire") ? "status-card-blackfire"
        : iconKey.includes("freeze") ? "status-card-freeze"
          : iconKey.includes("burn") ? "status-card-burn"
            : (iconKey.includes("slow") || iconKey.includes("stun") || iconKey.includes("stagger") || iconKey.includes("dismembered") || iconKey.includes("thedrinkmark") || iconKey.includes("drink mark") || iconKey.includes("puppetmark") || iconKey.includes("puppet mark")) ? "status-card-stun"
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
      else if (key === "critDamage") val = "100%";
      else val = unit.stats?.[key] || "";
    } else {
      val = key === "totalCost" ? unit.totalCost :
        key === "placement" ? unit.placementCount :
        key === "critDamage" ? "100%" :
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
  const isLadyGiant = unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant"));
  const isEighthSword = unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword"));
  const isCursedStudent = unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student"));
  const isElfMage = unit.id === "elfmageunleashed" || (unit.name && unit.name.includes("Elf Mage"));
  const isCrow = unit.id === "crowblackfire" || (unit.name && unit.name.includes("Crow"));
  const isCrimson = unit.id === "crimsonbrother" || (unit.name && unit.name.includes("Crimson"));
  const isCursedImmortal = unit.id === "cursedimmortalblacksun" || (unit.name && unit.name.includes("Cursed Immortal"));
  const isRazorjaw = unit.id === "razorjawhunter" || (unit.name && unit.name.includes("Razorjaw"));

  let activeDpsSummonId = activeDpsSubtabSummonMap.get(unit.id) || "main";

  if (isDarkMage && !unit.darkMageMode) {
    unit.darkMageMode = "lightning";
  }

  if (isCursedImmortal && unit.coldState === undefined) {
    unit.coldState = false;  // Default: Caring State
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
      coldState: isCursedImmortal ? !!unit.coldState : false,
      caringState: isCursedImmortal ? !unit.coldState : false,
    };

    const bd = getTraitBreakdown(baseUnitMock, "base", currentLevel, currentStatMode);
    const { base, effDamage, effSpa, effRange,
      effCritChance, effCritDamage, critAvgMult, avgHitDamage, effDotMult,
      unitDirectDPS, unitDoTDPS, totalSummonDPS, fuaDps, scaledBaseDamage,
      dotIntervalSPA, darkMageMode, levelMult, summonBreakdowns, fuaBreakdowns, giantForm, berserkState, demonicPresence,
      relicDamageMult, relicArchetypeDamageMult, relicSpaMult, relicRangeMult,
      totalPassiveDamageBonus, passiveSpaMult, passiveRangeMult, shinigamiActive, hasAscend, unitArchetype,
      caringState, coldState } = bd;

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

    let followupSectionHtml = "";

    if (isCursedStudent) {
      let totalFollowUpDPS = 0;
      const individualRows = [];
      unit.followUpInputs.forEach((val, idx) => {
        if (val > 0) {
          const fuAvgHit = (val * critAvgMult) + avgHitDamage;
          const fuDpsVal = fuAvgHit / (effSpa * 3);
          totalFollowUpDPS += fuDpsVal;
          individualRows.push(`<div class="dps-kv followup-result-row"><span class="dps-kv-lbl">P${idx + 1} <span class="faint-mult">(${val.toLocaleString()} + ${Math.round(avgHitDamage).toLocaleString()}) &times; crit / ${(effSpa * 3).toFixed(2)}s</span></span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(fuDpsVal)}</span></div>`);
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
    } else if (isCursedImmortal) {
      const hasMemoryPendant = false; // base calc (no relic selected in this view)
      const caringScale = 0.50;
      const coldScale = 1.25;
      const activeState = unit.coldState ? "Cold" : "Caring";
      const activeScale = unit.coldState ? coldScale : caringScale;
      const inactiveScale = unit.coldState ? caringScale : coldScale;
      const inactiveState = unit.coldState ? "Caring" : "Cold";
      followupSectionHtml = `
        <div class="dps-section section-followup">
          <div class="dps-section-hd" style="color: ${unit.coldState ? "#60a5fa" : "#f97316"}">${activeState} State (Active)</div>
          <div class="dps-kv-list">
            <div class="dps-kv"><span class="dps-kv-lbl">Tick Rate</span><span class="dps-kv-val font-mono">Every 1s walked</span></div>
            <div class="dps-kv"><span class="dps-kv-lbl">${activeState} State Scale</span><span class="dps-kv-val font-mono">${(activeScale * 100).toFixed(0)}% DMG per tick (1s interval)</span></div>
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Effective Tick DMG</span><span class="dps-kv-val font-mono">${Math.round(effDamage * activeScale).toLocaleString()} DMG</span></div>
            <div class="dps-kv primary"><span class="dps-kv-lbl ${unit.coldState ? "damage-highlight" : "crit-highlight"}">${activeState} State DPS (${(activeScale * 100).toFixed(0)}% / 1s)</span><span class="dps-kv-val font-mono ${unit.coldState ? "damage-highlight" : "crit-highlight"}">${formatDPS(unitDirectDPS)} DPS</span></div>
            <div class="dps-kv" style="margin-top:6px;opacity:0.55;"><span class="dps-kv-lbl">${inactiveState} State (inactive)</span><span class="dps-kv-val font-mono">${(inactiveScale * 100).toFixed(0)}% DMG / 1s → ${formatDPS((effDamage * inactiveScale))} DPS</span></div>
            <div class="dps-kv" style="opacity:0.55;"><span class="dps-kv-lbl">Range Modifier</span><span class="dps-kv-val font-mono">${unit.coldState ? "-75% (Cold: 25% of range)" : "-50% (Caring: 50% of range)"}</span></div>
          </div>
        </div>`;
    } else if (fuaBreakdowns && fuaBreakdowns.length > 0) {
      const fuaRowsHtml = fuaBreakdowns.map(entry => {
        const title = formatPassiveText(entry.name || `FUA ${entry.index + 1}`);
        const fuaBase = entry.effectiveFollowUpDamage || entry.inputDamage;
        const avgHit = entry.averageFollowUpHit || (fuaBase * (entry.critAvgMult || critAvgMult));
        const interval = entry.roarInterval || entry.cycleInterval || entry.intervalSpa || (effSpa * 3);
        const calcDps = entry.dps;
        const pct = entry.inputDamage > 0 ? Math.round((fuaBase / entry.inputDamage) * 100) : 0;
        const formulaText = pct > 0 ? ` (${pct}% of ${Math.round(entry.inputDamage).toLocaleString()})` : "";

        return `
          <div class="dps-section section-fua-entry" style="margin-bottom: 8px;">
            <div class="dps-section-hd color-crit">${title}</div>
            <div class="dps-kv-list">
              <div class="dps-kv"><span class="dps-kv-lbl">Base FUA Strike DMG${formulaText}</span><span class="dps-kv-val font-mono">${Math.round(fuaBase).toLocaleString()} DMG</span></div>
              <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Crit Avg Hit <span class="faint-mult">(×${(entry.critAvgMult || critAvgMult).toFixed(2)})</span></span><span class="dps-kv-val font-mono">${Math.round(avgHit).toLocaleString()} DMG</span></div>
              <div class="dps-kv faint-nested"><span class="dps-kv-lbl">FUA Cooldown / Interval</span><span class="dps-kv-val font-mono">${Number(interval).toFixed(2)}s</span></div>
              <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">${title} DPS (${Math.round(avgHit).toLocaleString()} &divide; ${Number(interval).toFixed(1)}s)</span><span class="dps-kv-val font-mono crit-highlight">+${formatDPS(calcDps)} DPS</span></div>
            </div>
          </div>
        `;
      }).join("");

      followupSectionHtml = `
        <div class="dps-section section-followup" style="background: transparent; border: none; padding: 0; box-shadow: none;">
          ${fuaRowsHtml}
        </div>`;
    }

    const summonsColumn = rawSummons ? `
      <div class="uip-dps-column summons-col">
        <div class="uip-dps-col-title color-summons">
          <span>Spirits &amp; Summons</span>
          <span class="uip-dps-badge summons-highlight">+${formatDPS(totalSummonDPS)} DPS</span>
        </div>
        ${(summonBreakdowns || []).map((s, idx) => {
      return `
            <div class="dps-section section-summons">
              <div class="dps-section-hd color-summons">${idx + 1}. ${s.name}</div>
              <div class="dps-kv-list">
                <div class="dps-kv"><span class="dps-kv-lbl">Active Field Count</span><span class="dps-kv-val font-mono">${s.activeCount} on field</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Hit Damage</span><span class="dps-kv-val font-mono">${Math.round(s.effDamage).toLocaleString()} DMG</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Crit Avg Hit</span><span class="dps-kv-val font-mono">${Math.round(s.avgHitDamage).toLocaleString()} DMG</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Effective SPA</span><span class="dps-kv-val font-mono">${(s.effSpa || 1).toFixed(1)}s</span></div>
                <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">${s.name} DPS</span><span class="dps-kv-val font-mono summons-highlight">+${formatDPS(s.dps)}</span></div>
              </div>
            </div>`;
    }).join("")}
      </div>` : "";

    const singlePlacementDPS = (unitDirectDPS || 0) + (unitDoTDPS || 0) + (totalSummonDPS || 0) + (fuaDps || 0);
    const finalCombinedDPS = singlePlacementDPS * placementCount;

    const inspectedSummon = (activeDpsSummonId !== "main" && summonBreakdowns)
      ? summonBreakdowns.find(sb => sb.id === activeDpsSummonId || sb.name === activeDpsSummonId || String(sb.id).toLowerCase() === String(activeDpsSummonId).toLowerCase())
      : null;

    const inspectedDmg = inspectedSummon ? inspectedSummon.effDamage : effDamage;
    const inspectedSpa = inspectedSummon ? inspectedSummon.effSpa : effSpa;
    const inspectedBaseDmg = inspectedSummon ? inspectedSummon.baseDamage : base.damage;
    const inspectedBaseSpa = inspectedSummon ? (inspectedSummon.baseSpa || 1) : (base.spa || 1);

    // ── DYNAMIC MATH STEPS ACCUMULATION ──
    let dmgRowsHtml = "";
    if (inspectedSummon) {
      if (inspectedSummon.hasOwnUpgrades) {
        let sDmgAccum = inspectedSummon.rawMaxDamage || 0;
        dmgRowsHtml += `
          <div class="dps-kv"><span class="dps-kv-lbl">Base Max Upgrade DMG (Lv. 1)</span><span class="dps-kv-val font-mono">${Math.round(sDmgAccum).toLocaleString()}</span></div>
        `;
        if (inspectedSummon.levelMult > 1) {
          sDmgAccum = Math.round(sDmgAccum * inspectedSummon.levelMult);
          dmgRowsHtml += `
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Level Scaling</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${inspectedSummon.levelMult.toFixed(2)}</span>${Math.round(sDmgAccum).toLocaleString()}</span></div>
          `;
        }
        if (inspectedSummon.traitDmgBonus > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + inspectedSummon.traitDmgBonus));
          dmgRowsHtml += `
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Trait DMG Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + inspectedSummon.traitDmgBonus).toFixed(2)}</span>${Math.round(sDmgAccum).toLocaleString()}</span></div>
          `;
        }
        if (inspectedSummon.relicTotalDmgMult > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + inspectedSummon.relicTotalDmgMult));
          dmgRowsHtml += `
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic DMG Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + inspectedSummon.relicTotalDmgMult).toFixed(2)}</span>${Math.round(sDmgAccum).toLocaleString()}</span></div>
          `;
        }
        if (inspectedSummon.isZStat) {
          sDmgAccum = Math.round(sDmgAccum * 1.20);
          dmgRowsHtml += `
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Z Stat Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x1.20</span>${Math.round(sDmgAccum).toLocaleString()}</span></div>
          `;
        }
        if (inspectedSummon.hasAscend) {
          sDmgAccum = Math.round(sDmgAccum * 1.15);
          dmgRowsHtml += `
            <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Ascension III Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x1.15</span>${Math.round(sDmgAccum).toLocaleString()}</span></div>
          `;
        }
      } else {
        const scaleMult = effDamage > 0 ? (inspectedSummon.effDamage / effDamage) : 0;
        dmgRowsHtml += `
          <div class="dps-kv"><span class="dps-kv-lbl">Main Unit DMG</span><span class="dps-kv-val font-mono">${Math.round(effDamage).toLocaleString()}</span></div>
          <div class="dps-kv faint-nested">
            <span class="dps-kv-lbl">Summon Scale Multiplier</span>
            <span class="dps-kv-val font-mono"><span class="faint-mult">&times;${scaleMult.toFixed(2)}</span>${Math.round(inspectedSummon.effDamage || 0).toLocaleString()}</span>
          </div>
        `;
      }
      dmgRowsHtml += `
        <div class="dps-kv primary"><span class="dps-kv-lbl damage-highlight">Effective DMG</span><span class="dps-kv-val font-mono damage-highlight">${Math.round(inspectedSummon.effDamage || 0).toLocaleString()}</span></div>
      `;
    } else {
      let dmgAccum = base.damage || 0;
      dmgRowsHtml += `
        <div class="dps-kv"><span class="dps-kv-lbl">Base Hit</span><span class="dps-kv-val font-mono">${Math.round(base.damage || 0).toLocaleString()}</span></div>
      `;
      if (lvlMult > 1) {
        dmgAccum = Math.round(dmgAccum * lvlMult);
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Lvl 50 <span class="faint-mult">(${lvlMult.toFixed(2)}x)</span></span><span class="dps-kv-val font-mono">${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      if (relicDamageMult > 0) {
        dmgAccum = Math.round(dmgAccum * (1 + relicDamageMult));
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic DMG Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + relicDamageMult).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      if (relicArchetypeDamageMult > 0) {
        dmgAccum = Math.round(dmgAccum * (1 + relicArchetypeDamageMult));
        const archLabel = (unitArchetype || "Archetype").charAt(0).toUpperCase() + (unitArchetype || "Archetype").slice(1);
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic ${archLabel} DMG Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + relicArchetypeDamageMult).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      if (currentStatMode === "Z") {
        dmgAccum = Math.round(dmgAccum * 1.20);
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Z Stat <span class="faint-mult">(x1.20)</span></span><span class="dps-kv-val font-mono">${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      if (hasAscend) {
        dmgAccum = Math.round(dmgAccum * 1.15);
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Ascension III <span class="faint-mult">(x1.15)</span></span><span class="dps-kv-val font-mono">${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      if (totalPassiveDamageBonus > 0) {
        dmgAccum = Math.round(dmgAccum * (1 + totalPassiveDamageBonus));
        const parts = [];
        if (shinigamiActive) parts.push("Shinigami +15%");
        if (bd.isReaper) parts.push("Adaptation +40%");
        if (bd.isEighthSword && berserkState) parts.push("Berserk +20%");
        if (bd.isLadyGiant && giantForm) parts.push("Giant Form +125%");
        if (bd.isBioinsect && bd.bioinsectResetStacks > 0) {
          const hasMechanicalWings = (bd.equips || []).includes("Mechanical Wings") || bd.unitRelic === "Mechanical Wings";
          const resetPct = bd.bioinsectResetStacks * (hasMechanicalWings ? 5 : 1);
          parts.push(`Bio Reset +${resetPct}%`);
        }
        const labelText = parts.length > 0 ? parts.join(" + ") : "Passives";
        dmgRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Passives (${labelText})</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + totalPassiveDamageBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span></div>
        `;
      }
      dmgRowsHtml += `
        <div class="dps-kv primary"><span class="dps-kv-lbl damage-highlight">Effective DMG</span><span class="dps-kv-val font-mono damage-highlight">${Math.round(effDamage || 0).toLocaleString()}</span></div>
      `;
    }

    let spaRowsHtml = "";
    if (inspectedSummon) {
      let sSpaAccum = inspectedSummon.baseSpa || 1;
      spaRowsHtml += `
        <div class="dps-kv"><span class="dps-kv-lbl">Base Summon SPA</span><span class="dps-kv-val font-mono">${sSpaAccum.toFixed(2)}s</span></div>
      `;
      if ((inspectedSummon.traitSpaBonus || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + inspectedSummon.traitSpaBonus);
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Trait SPA Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + inspectedSummon.traitSpaBonus).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span></div>
        `;
      }
      if ((inspectedSummon.relicSpaMult || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + inspectedSummon.relicSpaMult);
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic SPA Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + inspectedSummon.relicSpaMult).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span></div>
        `;
      }
      if (inspectedSummon.isZStat) {
        sSpaAccum = sSpaAccum * 0.85;
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Z Stat SPA Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x0.85</span>${sSpaAccum.toFixed(2)}s</span></div>
        `;
      }
      spaRowsHtml += `
        <div class="dps-kv primary"><span class="dps-kv-lbl spa-highlight">Final SPA</span><span class="dps-kv-val font-mono spa-highlight">${(inspectedSummon.effSpa || 1).toFixed(2)}s</span></div>
      `;
    } else {
      let spaAccum = base.spa || 1;
      spaRowsHtml += `
        <div class="dps-kv"><span class="dps-kv-lbl">Base SPA</span><span class="dps-kv-val font-mono">${spaAccum.toFixed(2)}s</span></div>
      `;
      if (relicSpaMult !== 0) {
        spaAccum = spaAccum * (1 + relicSpaMult);
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic SPA Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + relicSpaMult).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span></div>
        `;
      }
      if (currentStatMode === "Z") {
        spaAccum = spaAccum * 0.85;
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Z Stat <span class="faint-mult">(x0.85)</span></span><span class="dps-kv-val font-mono">${spaAccum.toFixed(2)}s</span></div>
        `;
      }
      if (passiveSpaMult !== 0) {
        spaAccum = spaAccum * (1 + passiveSpaMult);
        const parts = [];
        if (bd.isReaper) parts.push("Reaper -10%");
        if (bd.isLadyGiant && giantForm) parts.push("Giant Form +25%");
        if (bd.isEighthSword && berserkState) parts.push("Berserk -10%");
        const labelText = parts.length > 0 ? parts.join(" + ") : "Passives";
        spaRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Passives (${labelText})</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + passiveSpaMult).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span></div>
        `;
      }
      spaRowsHtml += `
        <div class="dps-kv primary"><span class="dps-kv-lbl spa-highlight">Final SPA</span><span class="dps-kv-val font-mono spa-highlight">${Math.max(0.1, effSpa).toFixed(2)}s</span></div>
      `;
    }

    let rangeRowsHtml = "";
    if (inspectedSummon) {
      rangeRowsHtml += `
        <div class="dps-kv"><span class="dps-kv-lbl">Base Range</span><span class="dps-kv-val font-mono">${(base.range || 0).toFixed(1)}</span></div>
        <div class="dps-kv primary"><span class="dps-kv-lbl range-highlight">Final Range</span><span class="dps-kv-val font-mono range-highlight">${(effRange || 0).toFixed(1)}</span></div>
      `;
    } else {
      let rangeAccum = base.range || 0;
      rangeRowsHtml += `
        <div class="dps-kv"><span class="dps-kv-lbl">Base Range</span><span class="dps-kv-val font-mono">${rangeAccum.toFixed(1)}</span></div>
      `;
      if (relicRangeMult !== 0) {
        rangeAccum = rangeAccum * (1 + relicRangeMult);
        rangeRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Relic Range Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + relicRangeMult).toFixed(2)}</span>${rangeAccum.toFixed(1)}</span></div>
        `;
      }
      if (currentStatMode === "Z") {
        rangeAccum = rangeAccum * 1.15;
        rangeRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Z Stat <span class="faint-mult">(x1.15)</span></span><span class="dps-kv-val font-mono">${rangeAccum.toFixed(1)}</span></div>
        `;
      }
      if (hasAscend) {
        rangeAccum = rangeAccum * 1.05;
        rangeRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Ascension III <span class="faint-mult">(x1.05)</span></span><span class="dps-kv-val font-mono">${rangeAccum.toFixed(1)}</span></div>
        `;
      }
      if (passiveRangeMult !== 0) {
        rangeAccum = rangeAccum * (1 + passiveRangeMult);
        const parts = [];
        if (bd.isLadyGiant && giantForm) parts.push("Giant Form +50%");
        const labelText = parts.length > 0 ? parts.join(" + ") : "Passives";
        rangeRowsHtml += `
          <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Passives (${labelText})</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(1 + passiveRangeMult).toFixed(2)}</span>${rangeAccum.toFixed(1)}</span></div>
        `;
      }
      rangeRowsHtml += `
        <div class="dps-kv primary"><span class="dps-kv-lbl range-highlight">Final Range</span><span class="dps-kv-val font-mono range-highlight">${(effRange || 0).toFixed(1)}</span></div>
      `;
    }

    let splitColumnsHtml = "";
    if (inspectedSummon) {
      splitColumnsHtml = `
        <div class="uip-dps-split-columns">
          <div class="uip-dps-subcol">
            <div class="uip-dps-cards-row primary-stats-row">
              <div class="dps-section section-damage">
                <div class="dps-section-hd">Damage</div>
                <div class="dps-kv-list">
                  ${dmgRowsHtml}
                </div>
              </div>
              <div class="dps-section section-spa">
                <div class="dps-section-hd">SPA</div>
                <div class="dps-kv-list">
                  ${spaRowsHtml}
                </div>
              </div>
            </div>
            <div class="uip-dps-cards-row secondary-stats-row${(inspectedSummon.dotDps || 0) > 0 ? " has-dot" : " single-card"}">
              <div class="dps-section section-crit">
                <div class="dps-section-hd">Crit Averaging</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Base Hit DMG</span><span class="dps-kv-val font-mono">${Math.round(inspectedSummon.effDamage || 0).toLocaleString()}</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Crit Multiplier</span><span class="dps-kv-val font-mono"><span class="faint-mult">x${(inspectedSummon.critAvgMult || critAvgMult || 1.0).toFixed(2)}</span>${Math.round(inspectedSummon.avgHitDamage || 0).toLocaleString()}</span></div>
                  <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">Avg Hit DMG (with Crit)</span><span class="dps-kv-val font-mono summons-highlight">${Math.round(inspectedSummon.avgHitDamage || 0).toLocaleString()}</span></div>
                </div>
              </div>
              ${(inspectedSummon.dotDps || 0) > 0 ? `
              <div class="dps-section section-dot">
                <div class="dps-section-hd">DoT Calculation (${inspectedSummon.dotName || "Bleed"})</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Summon Base Hit</span><span class="dps-kv-val font-mono">${Math.round(inspectedSummon.effDamage || 0).toLocaleString()}</span></div>
                  <div class="dps-kv primary"><span class="dps-kv-lbl dot-highlight">DoT DPS</span><span class="dps-kv-val font-mono dot-highlight">+${formatDPS(inspectedSummon.dotDps)} DPS</span></div>
                </div>
              </div>` : ""}
            </div>
          </div>
          <div class="uip-dps-subcol">
            <div class="dps-section section-damage">
              <div class="dps-section-hd">Direct Output &amp; DPS</div>
              <div class="dps-kv-list">
                <div class="dps-kv"><span class="dps-kv-lbl">Summon Output (${inspectedSummon.activeCount || 1} active)</span><span class="dps-kv-val font-mono">${Math.round(inspectedSummon.avgHitDamage || 0).toLocaleString()} &times; ${inspectedSummon.activeCount || 1} = ${Math.round((inspectedSummon.avgHitDamage || 0) * (inspectedSummon.activeCount || 1)).toLocaleString()}</span></div>
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Final Summon SPA</span><span class="dps-kv-val font-mono">${(inspectedSummon.effSpa || 1).toFixed(2)}s</span></div>
                <div class="dps-kv primary"><span class="dps-kv-lbl summons-highlight">Direct DPS</span><span class="dps-kv-val font-mono summons-highlight">+${formatDPS(inspectedSummon.directDps)} DPS</span></div>
              </div>
            </div>

            <div class="dps-section section-damage placement-total-card">
              <div class="dps-section-hd">${inspectedSummon.name || "Summon"} DPS Total</div>
              <div class="dps-kv-list">
                <div class="dps-kv"><span class="dps-kv-lbl">Single Placement Summon DPS</span><span class="dps-kv-val font-mono">${formatDPS(inspectedSummon.dps)} DPS</span></div>
                <div class="dps-kv primary"><span class="dps-kv-lbl combined-highlight">All Summons Total (${placementCount} placements)</span><span class="dps-kv-val font-mono combined-highlight">+${formatDPS(inspectedSummon.dps * placementCount)} DPS</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      splitColumnsHtml = `
        <div class="uip-dps-split-columns">
          <div class="uip-dps-subcol">
            <div class="uip-dps-cards-row primary-stats-row">
              <div class="dps-section section-damage">
                <div class="dps-section-hd">Damage</div>
                <div class="dps-kv-list">
                  ${dmgRowsHtml}
                </div>
              </div>
              <div class="dps-section section-spa">
                <div class="dps-section-hd">SPA</div>
                <div class="dps-kv-list">
                  ${spaRowsHtml}
                </div>
              </div>
              <div class="dps-section section-range">
                <div class="dps-section-hd">Range</div>
                <div class="dps-kv-list">
                  ${rangeRowsHtml}
                </div>
              </div>
            </div>

            <div class="uip-dps-cards-row secondary-stats-row${(unitDoTDPS || 0) > 0 ? " has-dot" : " single-card"}">
              <div class="dps-section section-crit">
                <div class="dps-section-hd">Crit Averaging</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Base Rate / Mult</span><span class="dps-kv-val font-mono">${base.critChancePercent}% / ${base.critDamagePercent}%</span></div>
                  <div class="dps-kv"><span class="dps-kv-lbl">Final Rate / Mult</span><span class="dps-kv-val font-mono">${Math.min(100, ((effCritChance || 0) * 100)).toFixed(0)}% / ${((effCritDamage || 1) * 100).toFixed(0)}% <span class="faint-mult">→ x${(critAvgMult || 1).toFixed(2)} avg</span></span></div>
                  <div class="dps-kv primary"><span class="dps-kv-lbl crit-highlight">Avg Hit DMG</span><span class="dps-kv-val font-mono crit-highlight">${Math.round(inspectedSummon ? inspectedSummon.avgHitDamage : avgHitDamage).toLocaleString()}</span></div>
                </div>
              </div>

              ${(unitDoTDPS || 0) > 0 ? `
              <div class="dps-section section-dot">
                <div class="dps-section-hd">${isCrow ? "Black Fire Calculation" : "DoT Calculation"}</div>
                <div class="dps-kv-list">
                  <div class="dps-kv"><span class="dps-kv-lbl">Effect</span><span class="dps-kv-val">${formatPassiveText(base.dotName)}</span></div>
                  <div class="dps-kv"><span class="dps-kv-lbl">Total DoT Scale</span><span class="dps-kv-val font-mono">${isCrow ? "2.00x Base Hit" : (effDotMult || 0).toFixed(2) + "x"}</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Total DoT DMG</span><span class="dps-kv-val font-mono dot-highlight">${Math.round(effDamage * (isCrow ? 2.0 : (effDotMult || 0))).toLocaleString()} DMG</span></div>
                  <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Duration &amp; Interval</span><span class="dps-kv-val font-mono">${isCrow ? `12s / ${(dotIntervalSPA || 12).toFixed(2)}s re-proc` : `${(bd.dotDuration || 8).toFixed(1)}s / ${(dotIntervalSPA || 1).toFixed(2)}s`}</span></div>
                  <div class="dps-kv primary"><span class="dps-kv-lbl dot-highlight">DoT DPS</span><span class="dps-kv-val font-mono dot-highlight">+${formatDPS(unitDoTDPS)} DPS</span></div>
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
                <div class="dps-kv faint-nested"><span class="dps-kv-lbl">Unit Direct DPS x placements</span><span class="dps-kv-val font-mono">${Math.round(unitDirectDPS || 0).toLocaleString()} x ${placementCount} = ${Math.round((unitDirectDPS || 0) * placementCount).toLocaleString()}</span></div>
                ${(unitDoTDPS || 0) > 0 ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">${isCrow ? "Black Fire DoT x placements" : "DoT DPS x placements"}</span><span class="dps-kv-val font-mono">${Math.round(unitDoTDPS).toLocaleString()} x ${placementCount} = ${Math.round(unitDoTDPS * placementCount).toLocaleString()}</span></div>` : ""}
                ${(fuaDps || 0) > 0 ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">${isCrow ? "Illusion DPS x placements" : "Follow-Up DPS x placements"}</span><span class="dps-kv-val font-mono">${Math.round(fuaDps).toLocaleString()} x ${placementCount} = ${Math.round(fuaDps * placementCount).toLocaleString()}</span></div>` : ""}
                ${unit.summons ? `<div class="dps-kv faint-nested"><span class="dps-kv-lbl">Summons Total Field DPS</span><span class="dps-kv-val font-mono">+${Math.round(totalSummonDPS || 0).toLocaleString()} DPS</span></div>` : ""}
                <div class="dps-kv primary"><span class="dps-kv-lbl combined-highlight">Total Field DPS</span><span class="dps-kv-val font-mono combined-highlight">${Math.round(finalCombinedDPS).toLocaleString()} DPS</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

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
              ${isCrimson ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${unit.crimsonAbilityActive ? " active" : ""}" data-crimson-ability="on">Piercing Crimson: On</button>
                  <button type="button" class="uip-dps-lvl-btn${!unit.crimsonAbilityActive ? " active" : ""}" data-crimson-ability="off">Off</button>
                </div>
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn active" data-crimson-pools-cycle="true">Pools: ${unit.crimsonPoolCount !== undefined ? unit.crimsonPoolCount : 3}/3</button>
                </div>
              ` : ""}
              ${isCursedImmortal ? `
                <div class="uip-dps-stat-mode-picker">
                  <button type="button" class="uip-dps-lvl-btn${!unit.coldState ? " active" : ""}" data-cursed-state="caring">Caring State</button>
                  <button type="button" class="uip-dps-lvl-btn${unit.coldState ? " active" : ""}" data-cursed-state="cold">Cold State</button>
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
 
          ${splitColumnsHtml}
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
        } else if (btn.dataset.giantMode) {
          unit.giantForm = btn.dataset.giantMode === "on";
          render();
        } else if (btn.dataset.demonicMode) {
          unit.demonicPresence = btn.dataset.demonicMode === "on";
          render();
        } else if (btn.dataset.berserkMode) {
          unit.berserkState = btn.dataset.berserkMode === "on";
          render();
        } else if (btn.dataset.crimsonAbility) {
          unit.crimsonAbilityActive = btn.dataset.crimsonAbility === "on";
          render();
        } else if (btn.dataset.crimsonPoolsCycle) {
          const currentCount = unit.crimsonPoolCount !== undefined ? unit.crimsonPoolCount : 3;
          unit.crimsonPoolCount = (currentCount + 1) % 4;
          render();
        } else if (btn.dataset.cursedState) {
          unit.coldState = btn.dataset.cursedState === "cold";
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

export async function UnitInfoPage(unit, overrideSubTab = null, subHeaderMount = null) {
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

  // Mount header directly into subHeaderMount if provided, otherwise append to page wrap
  if (subHeaderMount) {
    subHeaderMount.innerHTML = "";
    subHeaderMount.appendChild(stickyHeader);
  } else {
    wrap.appendChild(stickyHeader);
  }

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