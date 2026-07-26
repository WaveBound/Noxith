import { getTraitBreakdown, formatDPS, TRAIT_DEFINITIONS, getSummonsData } from "../../pages/dps-math.js";
import { globalRelics } from "../../data/relics.js";
import { getRelicStatsByName } from "../../data/relicstats.js";
import { relicImgByName, ELEMENT_ICONS, ARCHETYPE_ICONS, iconImg, STAT_ICONS, formatPassiveText, STATUS_ICONS, toAbsoluteUrl } from "../../icons/icons.js";
import { traits as allTraitsCatalog } from "../../data/traits.js";

const formatFullDPS = (value) => Math.round(Number(value) || 0).toLocaleString();
const formatCompactNumber = (value) => {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 100_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 100_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(Math.round(num));
};

if (!document.getElementById("dps-card-css-link")) {
  const link = document.createElement("link");
  link.id = "dps-card-css-link";
  link.rel = "stylesheet";
  link.href = "components/dps-card/dps-card.css";
  document.head.appendChild(link);
}

export function optimizeRelicsForTrait(unit, traitKey, options = {}) {
  const lockedRelic = unit.relic?.name || unit.recommendedEquips?.unitEquip || null;
  const candidates = globalRelics.map(r => r.name);
  const targetLevel = 50;
  const statMode = "Z";
  const simulateShinigamiPassive = !!options.simulateShinigamiPassive;
  const mode = options.mode || "dps";

  const defaultPlacements = parseInt(String(unit.placementCount || unit.stats?.placementCount || "1").replace(/[^0-9]/g, "")) || 1;
  const placements = traitKey === "unbound" ? 1 : defaultPlacements;

  const builds = [];

  const combos = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      if (candidates[i] === lockedRelic || candidates[j] === lockedRelic) continue;
      combos.push([candidates[i], candidates[j]]);
    }
  }

  const isCursedStudent = unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student"));

  combos.forEach(([eq1, eq2]) => {
    const mockUnit = {
      ...unit,
      ascend: unit.ascend || 0,
      selectedDpsRelic: lockedRelic || "",
      selectedDpsEquip1: eq1,
      selectedDpsEquip2: eq2,
      simulateShinigamiPassive,
      darkMageMode: unit.darkMageMode || options.darkMageMode || "lightning",
      giantForm: unit.giantForm !== undefined ? unit.giantForm : !!options.giantForm,
      berserkState: unit.berserkState !== undefined ? unit.berserkState : !!options.berserkState,
      demonicPresence: unit.demonicPresence !== undefined ? unit.demonicPresence : !!options.demonicPresence,
      fuaDamages: options.fuaDamages || []
    };

    const rawBreakdown = getTraitBreakdown(mockUnit, traitKey, targetLevel, statMode);

    let effDamage = rawBreakdown.effDamage;
    let effRange = rawBreakdown.effRange;
    let avgHitDamage = rawBreakdown.avgHitDamage;
    let unitDirectDPS = rawBreakdown.unitDirectDPS;
    let dotDamage = rawBreakdown.dotDamage;
    let unitDoTDPS = rawBreakdown.unitDoTDPS;
    let summonDamage = rawBreakdown.summonDamage;
    let summonDirectDPS = rawBreakdown.summonDirectDPS;
    let summonDoTDPS = rawBreakdown.summonDoTDPS;
    let totalSummonDPS = rawBreakdown.totalSummonDPS;
    let singleFuaDps = rawBreakdown.fuaDps || 0;

    let singleDps = unitDirectDPS + unitDoTDPS + totalSummonDPS + singleFuaDps;
    let finalDps = 0;
    let totalFuaDps = 0;

    if (isCursedStudent && Array.isArray(options.fuaDamages) && options.fuaDamages.length > 0) {
      let basePlacementDps = unitDirectDPS + unitDoTDPS + totalSummonDPS;
      totalFuaDps = singleFuaDps;
      finalDps = (basePlacementDps * placements) + totalFuaDps;
    } else {
      totalFuaDps = singleFuaDps * placements;
      finalDps = singleDps * placements;
    }

    const singlePlacementDmg = rawBreakdown.singlePlacementDmg;
    const totalDmg = singlePlacementDmg * placements;

    const displayVal = mode === "dmg" ? totalDmg : finalDps;
    const formattedVal = formatDPS(displayVal);
    const unitLabel = mode === "dmg" ? "DMG" : "DPS";

    const breakdown = {
      ...rawBreakdown,
      effDamage,
      effRange,
      avgHitDamage,
      unitDirectDPS,
      unitDoTDPS,
      dotDamage,
      summonDamage,
      summonDirectDPS,
      summonDoTDPS,
      totalSummonDPS,
      singlePlacementDps: singleDps,
      singleFuaDps,
      totalFuaDps,
      dps: finalDps,
      totalDmg,
      singlePlacementDmg,
      displayVal,
      formattedVal,
      formattedDPS: formattedVal,
      unitLabel,
      placements
    };

    builds.push({
      unitRelic: lockedRelic,
      equips: [eq1, eq2],
      breakdown
    });
  });

  builds.sort((a, b) => b.breakdown.displayVal - a.breakdown.displayVal);
  const best = builds[0] || { equips: [], breakdown: null };

  return {
    bestEquips: best.equips,
    breakdown: best.breakdown,
    builds,
    lockedRelic,
    hasAscend: best.breakdown?.hasAscend,
    placements
  };
}

function buildDetailedRelicCard(name, label, isUnitEquip) {
  const def = getRelicStatsByName(name);
  const imgSrc = relicImgByName(name);
  if (!def) return "";

  const labels = { damage: "Damage", spa: "SPA", range: "Range", critChance: "Crit Rate", critDamage: "Crit Dmg", magicdamage: "Magic DMG", physicaldamage: "Phys DMG", dotbonus: "DoT DMG" };
  const iconKeys = { damage: "damage", spa: "spa", range: "range", critChance: "critChance", critDamage: "critDamage", magicdamage: "magicdamage", physicaldamage: "physicaldamage" };

  const modsHtml = (def.stats || []).flatMap(block =>
    Object.entries(block).map(([k, v]) => {
      const label = labels[k] || k;
      const icon = iconKeys[k] || "damage";
      const value = typeof v === "object" ? (v.max || "") : String(v);

      return `
        <div class="loadout-mod">
          <span class="loadout-mod-icon">${STAT_ICONS[icon] || STAT_ICONS.damage}</span>
          <span class="loadout-mod-label">${label}</span>
          <span class="loadout-mod-value">${value}</span>
        </div>`;
    })
  ).join("");

  let passiveHtml = "";
  if (def.passive) {
    const formattedEffect = formatPassiveText(def.passive.desc || "");
    passiveHtml = `
      <div class="dps-relic-passive-box collapsed">
        <button type="button" class="dps-passive-toggle-btn">
          <span class="dps-relic-passive-glow">Passive:</span> 
          <span class="dps-relic-passive-name">${def.passive.name}</span>
          <svg class="dps-passive-toggle-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dps-relic-passive-desc hidden">${formattedEffect}</div>
      </div>`;
  }

  return `
    <div class="dps-relic-detail${isUnitEquip ? " unit-equip" : ""}">
      <img src="${imgSrc}" alt="${name}" />
      <div class="dps-relic-detail-name">${name}</div>
      <div class="dps-relic-detail-tag">${label}</div>
      <div class="loadout-mods" style="margin-top: 6px; width: 100%;">
        ${modsHtml}
      </div>
      ${passiveHtml}
    </div>`;
}

function openBreakdownModal(unit, traitName, breakdown, bestEquips, lockedRelic) {
  const existing = document.querySelector(".dps-modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "dps-modal-backdrop";
  document.body.style.overflow = "hidden";

  const close = () => {
    backdrop.remove();
    document.body.style.overflow = "";
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const rawBase = breakdown.base;
  const hasAscend = breakdown.hasAscend;

  const baseDmg = breakdown.scaledBaseDamage;
  const traitDmgBonus = breakdown.trait.damageBonus || 0;
  const relicDmgBonus = breakdown.relicDamageMult || 0;
  const relicArchetypeDmgBonus = breakdown.relicArchetypeDamageMult || 0;

  let dmgAccum = baseDmg;

  let traitDmgRowHtml = "";
  if (traitDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + traitDmgBonus));
    traitDmgRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait DMG multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>`;
  }

  let relicDmgRowHtml = "";
  if (relicDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicDmgBonus));
    relicDmgRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic DMG multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>`;
  }

  let relicArchetypeDmgRowHtml = "";
  if (relicArchetypeDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicArchetypeDmgBonus));
    const archLabel = (breakdown.unitArchetype || "Archetype").charAt(0).toUpperCase() + (breakdown.unitArchetype || "Archetype").slice(1);
    relicArchetypeDmgRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic ${archLabel} DMG multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicArchetypeDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>`;
  }

  const dmgAfterZ = Math.round(dmgAccum * 1.2);
  const dmgAfterAscension = hasAscend ? Math.round(dmgAfterZ * 1.15) : dmgAfterZ;
  dmgAccum = dmgAfterAscension;

  let combinedPassiveRowHtml = "";
  if (breakdown.totalPassiveDamageBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + breakdown.totalPassiveDamageBonus));
    const parts = [];
    if (breakdown.shinigamiActive) parts.push("Shinigami +15%");
    if (breakdown.isReaper) parts.push("Adaptation +40%");
    if (breakdown.isEighthSword && breakdown.berserkState) parts.push("Berserk +20%");
    if (breakdown.isLadyGiant && breakdown.giantForm) parts.push("Giant Form +125%");

    const labelText = parts.length > 0 ? parts.join(" & ") : "Passives";
    combinedPassiveRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Global &amp; Passives (${labelText})</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + breakdown.totalPassiveDamageBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>`;
  }

  const baseSpa = rawBase.spa;
  const traitSpaBonus = breakdown.trait.spaBonus || 0;
  const relicSpaBonus = breakdown.relicSpaMult || 0;

  let spaAccum = baseSpa;

  let traitSpaRowHtml = "";
  if (traitSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + traitSpaBonus);
    traitSpaRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait SPA multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>`;
  }

  let relicSpaRowHtml = "";
  if (relicSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + relicSpaBonus);
    relicSpaRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic SPA multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>`;
  }

  const spaAfterZ = spaAccum * 0.85;
  spaAccum = spaAfterZ;

  let reaperSpaRowHtml = "";
  if (breakdown.isReaper) {
    spaAccum = spaAccum * 0.90;
    reaperSpaRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Critical Tempo Passive (-10% SPA)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>`;
  } else if (breakdown.isLadyGiant && breakdown.giantForm) {
    spaAccum = spaAccum * 1.25;
    reaperSpaRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Size Control: Giant (+25% SPA time)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.25</span>${spaAccum.toFixed(2)}s</span>
      </div>`;
  } else if (breakdown.isEighthSword && breakdown.berserkState) {
    spaAccum = spaAccum * 0.90;
    reaperSpaRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; The Nameless Demon (Berserk -10% SPA)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>`;
  }

  const baseRng = rawBase.range;
  const traitRngBonus = breakdown.trait.rangeBonus || 0;
  const relicRngBonus = breakdown.relicRangeMult || 0;

  let rngAccum = baseRng;

  let traitRngRowHtml = "";
  if (traitRngBonus > 0) {
    rngAccum = baseRng * (1 + traitRngBonus);
    traitRngRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait Range multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>`;
  }

  let relicRngRowHtml = "";
  if (relicRngBonus > 0) {
    relicRngRowHtml = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic Range multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>`;
  }

  const rngAfterZ = rngAccum * 1.15;
  const rngAfterAscension = rngAfterZ * 1.05;
  let finalRng = rngAfterAscension;
  let ladyGiantRangeRow = "";
  if (breakdown.isLadyGiant && breakdown.giantForm) {
    finalRng = finalRng * 1.50;
    ladyGiantRangeRow = `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Size Control: Giant (+50% Range)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.50</span>${finalRng.toFixed(1)}</span>
      </div>`;
  }

  const activeFuaBreakdowns = (breakdown.fuaBreakdowns || []).filter(entry => entry.inputDamage > 0 || entry.dps > 0);

  const container = document.createElement("div");
  container.className = "dps-modal-container";

  const summonsData = getSummonsData(unit);

  let summonsPanel = null;
  if (summonsData) {
    summonsPanel = document.createElement("div");
    summonsPanel.className = "dps-panel summons-panel";

    const traitDotMult = 1 + (breakdown.trait.dotBonus || 0);
    const relicDotMult = 1 + (breakdown.relicDotBonus || 0);

    summonsPanel.innerHTML = `
      <div class="dps-panel-header">
        <div class="dps-panel-header-text">
          <div class="dps-panel-title color-summons">${summonsData.name || "Summons"} Breakdown</div>
          <div class="dps-panel-sub">Step-by-Step Calculations</div>
        </div>
      </div>
      <div class="dps-panel-body">
        <div class="dps-section section-summons" style="margin-top:0;">
          <div class="dps-section-hd color-summons">1. Summon Damage</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Effective Unit DMG (pre-crit)</span>
              <span class="dps-table-val font-mono">${Math.round(breakdown.effDamage).toLocaleString()}</span>
            </div>
            ${breakdown.hasSummonRelicOverride ? `
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Relic Override</span>
                <span class="dps-table-val font-mono summons-highlight"><span class="faint-mult">x${breakdown.summonDamageMult.toFixed(2)}</span>${Math.round(breakdown.summonDamage).toLocaleString()}</span>
              </div>
            ` : `
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Summon Scale</span>
                <span class="dps-table-val font-mono"><span class="faint-mult">x${breakdown.summonDamageMult.toFixed(2)}</span>${Math.round(breakdown.summonDamage).toLocaleString()}</span>
              </div>
            `}
            <div class="dps-table-row primary">
              <span class="dps-table-lbl summons-highlight">Damage</span>
              <span class="dps-table-val font-mono summons-highlight">${Math.round(breakdown.summonDamage).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">2. Output &amp; Direct DPS</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Summon Output</span>
              <span class="dps-table-val font-mono">${Math.round(breakdown.summonDamage).toLocaleString()} &times; ${breakdown.summonCount} = ${Math.round(breakdown.summonDamage * breakdown.summonCount).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Crit average multiplier</span>
              <span class="dps-table-val font-mono">x${breakdown.critAvgMult.toFixed(2)}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Average hit incl. crits</span>
              <span class="dps-table-val font-mono">${Math.round(breakdown.summonAvgHitDamage || breakdown.summonDamage).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Unit SPA</span>
              <span class="dps-table-val font-mono">${breakdown.effSpa.toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl summons-highlight">Direct DPS</span>
              <span class="dps-table-val font-mono summons-highlight">+${formatFullDPS(breakdown.summonDirectDPS)} DPS</span>
            </div>
          </div>
        </div>

        ${rawBase.dotMultiplier > 0 ? `
        <div class="dps-section section-summons">
          <div class="dps-section-hd color-summons">3. Summons DoT (${formatPassiveText(rawBase.dotName || "Status")})</div>
          <div class="dps-table">
            <div class="dps-table-row">
              <span class="dps-table-lbl">Status</span>
              <span class="dps-table-val font-mono">${formatPassiveText(rawBase.dotName)}</span>
            </div>
            <div class="dps-table-row">
              <span class="dps-table-lbl">Summon Output</span>
              <span class="dps-table-val font-mono">${Math.round(breakdown.summonDamage * breakdown.summonCount).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Base ${formatPassiveText(rawBase.dotName || "DoT")} Scale</span>
              <span class="dps-table-val font-mono">${rawBase.dotMultiplier.toFixed(2)}x</span>
            </div>
            ${breakdown.trait.dotBonus > 0 ? `
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Trait DoT Multiplier (${breakdown.trait.name})</span>
              <span class="dps-table-val font-mono">x${traitDotMult.toFixed(2)}</span>
            </div>` : ""}
            ${breakdown.relicDotBonus > 0 ? `
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Relic DoT Multiplier</span>
              <span class="dps-table-val font-mono">x${relicDotMult.toFixed(2)}</span>
            </div>` : ""}
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Total DoT Scale (${rawBase.dotMultiplier.toFixed(2)} &times; ${traitDotMult.toFixed(2)} &times; ${relicDotMult.toFixed(2)})</span>
              <span class="dps-table-val font-mono dot-highlight">x${breakdown.effDotMult.toFixed(2)} &rarr; ${Math.round(breakdown.summonDamage * breakdown.summonCount * breakdown.effDotMult).toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; ${formatPassiveText(rawBase.dotName || "DoT")} SPA</span>
              <span class="dps-table-val font-mono">${breakdown.dotIntervalSPA.toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl dot-highlight">DoT DPS</span>
              <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(breakdown.summonDoTDPS)} DPS</span>
            </div>
          </div>
        </div>` : ""}
      </div>

      <div class="dps-panel-footer summons-footer">
        <div class="dps-summary-block" style="border-color: rgba(45, 212, 191, 0.25); background: rgba(45, 212, 191, 0.05); margin: 0;">
          <div class="dps-table-row">
            <span class="dps-table-lbl color-summons">Single Summon DPS</span>
            <span class="dps-table-val font-mono summons-highlight">${formatFullDPS(breakdown.totalSummonDPS)} DPS</span>
          </div>
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Placement multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x${breakdown.placements}</span>${formatFullDPS(breakdown.totalSummonDPS * breakdown.placements)} DPS</span>
          </div>
          <div class="dps-table-row divider"></div>
          <div class="dps-table-row primary">
            <span class="dps-table-lbl combined-highlight">Total Summons DPS</span>
            <span class="dps-table-val font-mono combined-highlight">${formatFullDPS(breakdown.totalSummonDPS * breakdown.placements)} DPS</span>
          </div>
        </div>
      </div>
    `;
  }

  const mainPanel = document.createElement("div");
  mainPanel.className = "dps-panel main-panel mobile-active";

  const traitDotMult = 1 + (breakdown.trait.dotBonus || 0);
  const relicDotMult = 1 + (breakdown.relicDotBonus || 0);

  mainPanel.innerHTML = `
    <div class="dps-panel-header">
      <div class="dps-panel-header-text">
        <div class="dps-panel-title">${unit.name} &middot; ${traitName} Breakdown</div>
        <div class="dps-panel-sub">Z Stat${hasAscend ? " & Ascension III" : ""} Active</div>
      </div>
      <button class="dps-panel-close">X</button>
    </div>
    <div class="dps-panel-body">
      <div class="dps-section">
        <div class="dps-section-hd">Equipped Relics</div>
        <div class="dps-relic-cards" style="display: flex; gap: 8px;">
          ${lockedRelic ? buildDetailedRelicCard(lockedRelic, "Unit Equip", true) : ""}
          ${bestEquips.map(eq => buildDetailedRelicCard(eq, "Equip Slot", false)).join("")}
        </div>
      </div>

      <div class="dps-section section-damage">
        <div class="dps-section-hd">Damage Calculations</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Base scaled level 50 DMG</span>
            <span class="dps-table-val font-mono">${Math.round(breakdown.scaledBaseDamage).toLocaleString()}</span>
          </div>
          ${traitDmgRowHtml}
          ${relicDmgRowHtml}
          ${relicArchetypeDmgRowHtml}
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Z Stat multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x1.20</span>${Math.round(dmgAfterZ).toLocaleString()}</span>
          </div>
          ${hasAscend ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Ascension III multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x1.15</span>${Math.round(dmgAfterAscension).toLocaleString()}</span>
          </div>` : ""}
          ${combinedPassiveRowHtml}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl damage-highlight">Effective Base Hit DMG</span>
            <span class="dps-table-val font-mono damage-highlight">${Math.round(breakdown.effDamage).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="dps-section section-spa">
        <div class="dps-section-hd">SPA Calculations</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Base SPA</span>
            <span class="dps-table-val font-mono">${rawBase.spa}s</span>
          </div>
          ${traitSpaRowHtml}
          ${relicSpaRowHtml}
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Z Stat SPA multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x0.85</span>${spaAfterZ.toFixed(2)}s</span>
          </div>
          ${reaperSpaRowHtml}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl spa-highlight">${breakdown.isDarkMage && breakdown.darkMageMode === "lightning" ? "Disabled in Lightning Mode" : "Final Effective SPA"}</span>
            <span class="dps-table-val font-mono spa-highlight">${breakdown.isDarkMage && breakdown.darkMageMode === "lightning" ? "1.0s Constant" : breakdown.effSpa.toFixed(2) + "s"}</span>
          </div>
        </div>
      </div>

      <div class="dps-section section-range">
        <div class="dps-section-hd">Range Calculations</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Base Range</span>
            <span class="dps-table-val font-mono">${rawBase.range}</span>
          </div>
          ${traitRngRowHtml}
          ${relicRngRowHtml}
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Z Stat Range multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x1.15</span>${rngAfterZ.toFixed(1)}</span>
          </div>
          ${hasAscend ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Ascension III Range multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x1.05</span>${rngAfterAscension.toFixed(1)}</span>
          </div>` : ""}
          ${ladyGiantRangeRow}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl range-highlight">Final Effective Range</span>
            <span class="dps-table-val font-mono range-highlight">${breakdown.effRange.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div class="dps-section section-damage">
        <div class="dps-section-hd" style="color: var(--purple-strong);">Crit Averaging</div>
        <div class="dps-table">
          <div class="dps-table-row"><span class="dps-table-lbl">Base Rate / Mult</span><span class="dps-table-val font-mono">${Math.round(breakdown.base.critChancePercent)}% / ${Math.round(breakdown.base.critDamagePercent)}%</span></div>
          ${breakdown.isReaper ? `
          <div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Adaptation Passive (+40% Crit Rate)</span><span class="dps-table-val font-mono">+40% Rate</span></div>` : ""}
          <div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Trait Crit Rate / DMG</span><span class="dps-table-val font-mono">+${Math.round((breakdown.trait.critChanceBonus || 0) * 100)}% / +${Math.round((breakdown.trait.critDamageBonus || 0) * 100)}%</span></div>
          <div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Relic Crit Rate / DMG</span><span class="dps-table-val font-mono">+${Math.round((breakdown.relicCritChanceAdd || 0) * 100)}% / +${Math.round((breakdown.relicCritDamageAdd || 0) * 100)}%</span></div>
          <div class="dps-table-row"><span class="dps-table-lbl">Final Rate / Mult</span><span class="dps-table-val font-mono">${Math.round(breakdown.effCritChance * 100)}% / ${Math.round(breakdown.effCritDamage * 100)}% <span class="faint-mult">&rarr; x${breakdown.critAvgMult.toFixed(2)} avg</span></span></div>
          <div class="dps-table-row primary"><span class="dps-table-lbl damage-highlight">Avg Hit DMG</span><span class="dps-table-val font-mono damage-highlight">${Math.round(breakdown.avgHitDamage).toLocaleString()}</span></div>
        </div>
      </div>

      ${(rawBase.dotMultiplier > 0 || breakdown.demonicPresence) ? `
      <div class="dps-section section-dot">
        <div class="dps-section-hd color-dot">${breakdown.isDarkMage ? "Passive Damage Calculation" : breakdown.isEighthSword ? "Demonic Presence Calculation" : `DoT Calculation (${formatPassiveText(rawBase.dotName || "Status")})`}</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Effect</span>
            <span class="dps-table-val">${formatPassiveText(rawBase.dotName)}</span>
          </div>
          <div class="dps-table-row">
            <span class="dps-table-lbl">Base Multiplier</span>
            <span class="dps-table-val font-mono">${breakdown.isEighthSword ? "15% Avg Hit" : rawBase.dotMultiplier.toFixed(2) + "x Base Hit"}</span>
          </div>
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Interval SPA</span>
            <span class="dps-table-val font-mono">${breakdown.dotIntervalSPA.toFixed(2)}s</span>
          </div>
          <div class="dps-table-row primary">
            <span class="dps-table-lbl dot-highlight">${breakdown.isDarkMage || breakdown.isEighthSword ? "Unit Passive DPS" : "Unit DoT DPS"}</span>
            <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
          </div>
        </div>
      </div>` : ""}

      ${breakdown.isElfMage ? `
      <div class="dps-section section-damage">
        <div class="dps-section-hd color-crit">Arcane Spells (Follow-Up Attacks)</div>
        <div class="dps-table">
          ${breakdown.fuaBreakdowns.map(b => `
            <div class="dps-table-row">
              <span class="dps-table-lbl">${formatPassiveText(b.name)}</span>
              <span class="dps-table-val font-mono"><span class="faint-mult">(${Math.round(b.finalMult * 100)}% DMG)</span> ${Math.round(b.effectiveFollowUpDamage).toLocaleString()}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Crit Avg Hit</span>
              <span class="dps-table-val font-mono"><span class="faint-mult">x${breakdown.critAvgMult.toFixed(2)}</span>${Math.round(b.averageFollowUpHit).toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Frequency</span>
              <span class="dps-table-val font-mono"><span class="faint-mult">1 cast / (7 &times; ${breakdown.effSpa.toFixed(2)}s) =</span> ${(7 * breakdown.effSpa).toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl crit-highlight">${formatPassiveText(b.name)} DPS (1 Unit)</span>
              <span class="dps-table-val font-mono crit-highlight">+${formatFullDPS(b.dps)} DPS</span>
            </div>
          `).join("")}
          <div class="dps-table-row divider"></div>
          <div class="dps-table-row primary">
            <span class="dps-table-lbl combined-highlight">Arcane Spells DPS (Per Unit)</span>
            <span class="dps-table-val font-mono combined-highlight">+${formatFullDPS(breakdown.singleFuaDps)} DPS</span>
          </div>
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Field Arcane DPS (${formatFullDPS(breakdown.singleFuaDps)} &times; ${breakdown.placements} placements)</span>
            <span class="dps-table-val font-mono combined-highlight">+${formatFullDPS(breakdown.totalFuaDps)} DPS</span>
          </div>
        </div>
      </div>` : activeFuaBreakdowns.length > 0 ? `
      <div class="dps-section section-damage">
        <div class="dps-section-hd" style="color: var(--purple-strong);">FUA Calculations</div>
        <div class="dps-table">
          ${activeFuaBreakdowns.map(entry => `
            <div class="dps-table-row">
              <span class="dps-table-lbl">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)}</span>
              <span class="dps-table-val font-mono">${formatFullDPS(entry.effectiveFollowUpDamage || entry.inputDamage)}</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Crit Average Hit</span>
              <span class="dps-table-val font-mono">${formatFullDPS(entry.averageFollowUpHit)}</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl damage-highlight">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)} DPS</span>
              <span class="dps-table-val font-mono damage-highlight">+${formatFullDPS(entry.dps)} DPS</span>
            </div>
          `).join("")}
          <div class="dps-table-row divider"></div>
          <div class="dps-table-row primary">
            <span class="dps-table-lbl combined-highlight">Total FUA DPS</span>
            <span class="dps-table-val font-mono combined-highlight">+${formatFullDPS(breakdown.totalFuaDps)} DPS</span>
          </div>
        </div>
      </div>` : ""}

      <div class="dps-section dps-formula-total">
        <div class="dps-section-hd">Placement DPS Total</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Single Placement DPS</span>
            <span class="dps-table-val font-mono dps-placement-single">${formatFullDPS(breakdown.singlePlacementDps)} DPS</span>
          </div>
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">Unit Direct DPS &times; placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.unitDirectDPS)} &times; ${breakdown.placements} = ${formatFullDPS(breakdown.unitDirectDPS * breakdown.placements)}</span>
          </div>
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">${breakdown.isDarkMage || breakdown.isEighthSword ? "Passive DPS &times; placements" : "DoT DPS &times; placements"}</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.unitDoTDPS)} &times; ${breakdown.placements} = ${formatFullDPS(breakdown.unitDoTDPS * breakdown.placements)}</span>
          </div>
          ${breakdown.summonCount > 0 ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">Summons DPS &times; placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.totalSummonDPS)} &times; ${breakdown.placements} = ${formatFullDPS(breakdown.totalSummonDPS * breakdown.placements)}</span>
          </div>` : ""}
          ${breakdown.totalFuaDps > 0 ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">Follow-Up DPS &times; placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.singleFuaDps)} &times; ${breakdown.placements} = ${formatFullDPS(breakdown.totalFuaDps)}</span>
          </div>` : ""}
          <div class="dps-table-row primary total-row">
            <span class="dps-table-lbl combined-highlight">Total Field DPS</span>
            <span class="dps-table-val font-mono combined-highlight">${formatFullDPS(breakdown.dps)} DPS</span>
          </div>
        </div>
      </div>
    </div>
  `;

  if (summonsPanel) {
    const mobileTabs = document.createElement("div");
    mobileTabs.className = "dps-modal-mobile-tabs";
    mobileTabs.innerHTML = `
      <button type="button" class="dps-modal-mtab active" data-tab="main">Unit Breakdown</button>
      <button type="button" class="dps-modal-mtab" data-tab="summons">${summonsData.name || "Summons"}</button>
    `;

    container.appendChild(mobileTabs);
    container.appendChild(summonsPanel);
    container.appendChild(mainPanel);

    mobileTabs.querySelectorAll(".dps-modal-mtab").forEach(btn => {
      btn.addEventListener("click", () => {
        mobileTabs.querySelectorAll(".dps-modal-mtab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.dataset.tab;
        if (target === "main") {
          mainPanel.classList.add("mobile-active");
          summonsPanel.classList.remove("mobile-active");
        } else {
          summonsPanel.classList.add("mobile-active");
          mainPanel.classList.remove("mobile-active");
        }
      });
    });
  } else {
    container.appendChild(mainPanel);
  }

  mainPanel.querySelector(".dps-panel-close").addEventListener("click", close);

  backdrop.appendChild(container);
  document.body.appendChild(backdrop);

  backdrop.querySelectorAll(".dps-passive-toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const box = btn.closest(".dps-relic-passive-box");
      const desc = box.querySelector(".dps-relic-passive-desc");
      const arrow = btn.querySelector(".dps-passive-toggle-arrow");

      const isCollapsed = desc.classList.toggle("hidden");
      arrow.classList.toggle("rotated", !isCollapsed);
    });
  });
}

function getDarkMageLabel(mode) {
  if (mode === "both") return "Mode: Attack + Lightning";
  if (mode === "normal") return "Mode: Attack Only";
  return "Mode: Lightning Only (0.5x/s)";
}

export async function DpsCard(unit, options = {}) {
  const card = document.createElement("div");
  card.className = "dps-calculator-card glass-card";
  let shinigamiPassiveActive = false;
  const isDarkMage = unit.id === "darkmagesovereign" || (unit.name && unit.name.includes("Dark Mage"));
  const isLadyGiant = unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant"));
  const isEighthSword = unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword"));

  let darkMageMode = unit.darkMageMode || "lightning";
  let giantForm = unit.giantForm !== undefined ? unit.giantForm : false;
  let berserkState = unit.berserkState !== undefined ? unit.berserkState : false;
  let demonicPresence = unit.demonicPresence !== undefined ? unit.demonicPresence : false;

  const mode = options.mode || "dps";
  const rank = options.rank || null;
  const isCursedStudent = unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student"));
  const fuaDamages = [0, 0, 0];

  const baseStats = unit.stats || {};
  const elementClass = (baseStats.element || "neutral").toLowerCase();
  const archetypeClass = (baseStats.archetype || "physical").toLowerCase();
  const hasAscend = unit.ascend === true || unit.ascend === 3 || unit.ascend === "3";

  const elIcon = ELEMENT_ICONS[elementClass] ? iconImg(ELEMENT_ICONS[elementClass], baseStats.element) : "";
  const archIcon = ARCHETYPE_ICONS[archetypeClass] ? iconImg(ARCHETYPE_ICONS[archetypeClass], baseStats.archetype) : "";

  card.innerHTML = `
    <div class="dps-card-media">
      <img class="dps-card-portrait-full" src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" onerror="this.src='assets/placeholder.svg'" />
      
      ${rank ? `<div class="dps-rank-badge ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''}">#${rank}</div>` : ""}

      <div class="dps-card-portrait-meta">
        <span class="dps-portrait-badge element-${elementClass}">${elIcon} <span class="dps-badge-txt">${baseStats.element || "No Element"}</span></span>
        <span class="dps-portrait-badge archetype-${archetypeClass}">${archIcon} <span class="dps-badge-txt">${baseStats.archetype || "Physical"}</span></span>
      </div>

      <div class="dps-card-nameplate-overlay">
        <h2 class="dps-card-title">${unit.name}</h2>
        <div class="dps-card-meta-chips">
          <span class="dps-mini-chip">Lv 50</span>
          <span class="dps-mini-chip">Z Stat</span>
          ${hasAscend ? `<span class="dps-mini-chip ascend-chip">Ascended 3</span>` : ""}
        </div>
      </div>
    </div>

    <div class="dps-optimized-container">
      <div class="dps-options-row">
        ${isDarkMage ? `
          <button type="button" class="dps-shinigami-toggle active" id="darkmage-toggle-${unit.id}">
            ${getDarkMageLabel(darkMageMode)}
          </button>
        ` : ""}
        ${isLadyGiant ? `
          <button type="button" class="dps-shinigami-toggle ${giantForm ? 'active' : ''}" id="giantform-toggle-${unit.id}" aria-pressed="${giantForm}">
            Giant Form: ${giantForm ? "On" : "Off"}
          </button>
        ` : ""}
        ${isEighthSword ? `
          <button type="button" class="dps-shinigami-toggle ${demonicPresence ? 'active' : ''}" id="demonic-toggle-${unit.id}" aria-pressed="${demonicPresence}">
            Demonic Presence: ${demonicPresence ? "On (15%/s)" : "Off"}
          </button>
          <button type="button" class="dps-shinigami-toggle ${berserkState ? 'active' : ''}" id="berserk-toggle-${unit.id}" aria-pressed="${berserkState}">
            Berserk: ${berserkState ? "On" : "Off"}
          </button>
        ` : ""}
        ${isCursedStudent ? `
          <button type="button" class="dps-fua-toggle" aria-expanded="false">
            <span class="dps-fua-label">FUA</span>
            <span class="dps-fua-summary">0 / 0 / 0</span>
          </button>
        ` : ""}
        <button type="button" class="dps-shinigami-toggle" aria-pressed="false">
          Shinigami Passive: Off
        </button>
      </div>
      <div class="dps-trait-stack" id="trait-stack-${unit.id}"></div>
    </div>
  `;

  const portrait = card.querySelector(".dps-card-media");
  portrait.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("open-unit", { detail: { id: unit.id, activeSubTab: "info" } }));
  });

  const traitStack = card.querySelector(`#trait-stack-${unit.id}`);
  const darkMageToggle = card.querySelector(`#darkmage-toggle-${unit.id}`);
  const giantFormToggle = card.querySelector(`#giantform-toggle-${unit.id}`);
  const demonicToggle = card.querySelector(`#demonic-toggle-${unit.id}`);
  const berserkToggle = card.querySelector(`#berserk-toggle-${unit.id}`);
  const shinigamiToggle = card.querySelector(".dps-shinigami-toggle:not([id])");
  const fuaToggle = card.querySelector(".dps-fua-toggle");
  let fuaEditor = null;

  demonicToggle?.addEventListener("click", () => {
    demonicPresence = !demonicPresence;
    unit.demonicPresence = demonicPresence;
    demonicToggle.classList.toggle("active", demonicPresence);
    demonicToggle.setAttribute("aria-pressed", String(demonicPresence));
    demonicToggle.textContent = `Demonic Presence: ${demonicPresence ? "On (15%/s)" : "Off"}`;
    renderCalculations();
  });

  berserkToggle?.addEventListener("click", () => {
    berserkState = !berserkState;
    unit.berserkState = berserkState;
    berserkToggle.classList.toggle("active", berserkState);
    berserkToggle.setAttribute("aria-pressed", String(berserkState));
    berserkToggle.textContent = `Berserk: ${berserkState ? "On" : "Off"}`;
    renderCalculations();
  });

  giantFormToggle?.addEventListener("click", () => {
    giantForm = !giantForm;
    unit.giantForm = giantForm;
    giantFormToggle.classList.toggle("active", giantForm);
    giantFormToggle.setAttribute("aria-pressed", String(giantForm));
    giantFormToggle.textContent = `Giant Form: ${giantForm ? "On" : "Off"}`;
    renderCalculations();
  });

  darkMageToggle?.addEventListener("click", () => {
    if (darkMageMode === "lightning") darkMageMode = "both";
    else if (darkMageMode === "both") darkMageMode = "normal";
    else darkMageMode = "lightning";

    unit.darkMageMode = darkMageMode;
    darkMageToggle.textContent = getDarkMageLabel(darkMageMode);
    renderCalculations();
  });

  shinigamiToggle?.addEventListener("click", () => {
    shinigamiPassiveActive = !shinigamiPassiveActive;
    shinigamiToggle.classList.toggle("active", shinigamiPassiveActive);
    shinigamiToggle.setAttribute("aria-pressed", String(shinigamiPassiveActive));
    shinigamiToggle.textContent = `Shinigami Passive: ${shinigamiPassiveActive ? "On (1.15x)" : "Off"}`;
    renderCalculations();
  });

  function updateFuaSummary() {
    if (!fuaToggle) return;
    fuaToggle.querySelector(".dps-fua-summary").textContent = fuaDamages.map(formatCompactNumber).join(" / ");
  }

  function closeFuaEditor() {
    if (!fuaEditor) return;
    fuaEditor.remove();
    fuaEditor = null;
    fuaToggle?.setAttribute("aria-expanded", "false");
  }

  function openFuaEditor() {
    if (!fuaToggle) return;
    if (fuaEditor) {
      closeFuaEditor();
      return;
    }

    fuaEditor = document.createElement("div");
    fuaEditor.className = "dps-fua-editor";
    fuaEditor.innerHTML = `
      <div class="dps-fua-editor-title">FUA Damage</div>
      <div class="dps-fua-editor-grid">
        ${fuaDamages.map((value, index) => `
          <label class="dps-fua-editor-field">
            <span>Unit ${index + 1}</span>
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="dps-fua-editor-input" data-fua-index="${index}" value="${value || ""}" placeholder="0" aria-label="Follow-up damage ${index + 1}" />
          </label>
        `).join("")}
      </div>
      <div class="dps-fua-editor-note">Unbound uses FUA 1 only</div>
    `;

    const rect = fuaToggle.getBoundingClientRect();
    fuaEditor.style.left = `${Math.max(8, rect.left)}px`;
    fuaEditor.style.top = `${rect.bottom + 6}px`;
    document.body.appendChild(fuaEditor);
    fuaToggle.setAttribute("aria-expanded", "true");

    fuaEditor.querySelectorAll(".dps-fua-editor-input").forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d]/g, "");
        fuaDamages[Number(input.dataset.fuaIndex)] = Math.max(0, Number(input.value) || 0);
        updateFuaSummary();
        renderCalculations();
      });
    });

    fuaEditor.querySelector(".dps-fua-editor-input")?.focus();
  }

  fuaToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    openFuaEditor();
  });

  document.addEventListener("click", (e) => {
    if (!fuaEditor) return;
    if (fuaEditor.contains(e.target) || fuaToggle?.contains(e.target)) return;
    closeFuaEditor();
  });

  updateFuaSummary();

  function buildLoadoutIcons(build) {
    return `
      ${build.unitRelic ? `
        <div class="dps-relic-icon-wrap locked" data-relic-name="Unit Equip: ${build.unitRelic}" aria-label="Unit Equip: ${build.unitRelic}">
          <img src="${relicImgByName(build.unitRelic)}" alt="${build.unitRelic}" />
        </div>
      ` : ""}
      ${build.equips.map(eqName => `
        <div class="dps-relic-icon-wrap" data-relic-name="${eqName}" aria-label="${eqName}">
          <img src="${relicImgByName(eqName)}" alt="${eqName}" />
        </div>
      `).join("")}
    `;
  }

  function getFuaDamagesForTrait(traitKey) {
    return traitKey === "unbound" ? fuaDamages.slice(0, 1) : fuaDamages;
  }

  function openTraitBuildsModal(traitDef, builds) {
    const existing = document.querySelector(".dps-modal-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "dps-modal-backdrop";
    document.body.style.overflow = "hidden";

    const close = () => {
      backdrop.remove();
      document.body.style.overflow = "";
    };

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    const traitDefMatch = allTraitsCatalog.find(t => t.name.toLowerCase() === traitDef.id.toLowerCase());
    const traitIconSrc = traitDefMatch?.image || `icons/traits/${traitDef.name}.png`;
    const topBuild = builds[0];
    const topVal = topBuild?.breakdown?.displayVal || 1;

    const panel = document.createElement("div");
    panel.className = "dps-builds-modal-v2";
    panel.innerHTML = `
      <!-- Left Side: Standalone Unit Image -->
      <div class="dps-modal-unit-standalone">
        <img class="dps-modal-unit-img-only" src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" onerror="this.src='assets/placeholder.svg'" />
      </div>

      <!-- Right Side: Clean Leaderboard Table -->
      <div class="dps-leaderboard-side">
        <div class="dps-leaderboard-header">
          <div class="dps-leaderboard-header-title">
            <div class="dps-modal-unit-row">
              <span class="dps-lh-main">${unit.name}</span>
              <span class="dps-modal-trait-badge">
                <img src="${toAbsoluteUrl(traitIconSrc)}" alt="" onerror="this.style.display='none'" />
                ${traitDef.name} Trait
              </span>
            </div>
            <span class="dps-lh-sub">${builds.length} Combinations Simulated</span>
          </div>
          <button type="button" class="dps-builds-modal-close" aria-label="Close modal">&times;</button>
        </div>

        <div class="dps-builds-table-header">
          <span>Rank</span>
          <span>Relics</span>
          <span class="col-right">${mode === "dmg" ? "DMG" : "DPS"}</span>
          <span class="col-right">Diff</span>
          <span></span>
        </div>

        <div class="dps-leaderboard-list">
          ${builds.map((build, index) => {
      const rank = index + 1;
      const rankClass = rank === 1 ? "rank-gold" : "";
      const buildVal = build.breakdown.displayVal;
      const diffPercent = ((buildVal - topVal) / topVal) * 100;
      const diffDisplay = index === 0 ? `<span class="diff-best">BEST</span>` : `<span class="diff-loss">${diffPercent.toFixed(1)}%</span>`;

      return `
              <div class="dps-table-build-row ${rankClass}" data-build-index="${index}">
                <div class="row-rank-col">
                  <span class="rank-badge-text">#${rank}</span>
                </div>
                <div class="row-relics-col">
                  <div class="dps-loadout-icons-col">${buildLoadoutIcons(build)}</div>
                </div>
                <div class="row-dps-col">
                  <span class="row-dps-val">${build.breakdown.formattedVal}</span>
                </div>
                <div class="row-diff-col">${diffDisplay}</div>
                <div class="row-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </div>
    `;

    panel.querySelector(".dps-builds-modal-close").addEventListener("click", close);

    panel.querySelectorAll(".dps-table-build-row").forEach(rowEl => {
      rowEl.addEventListener("click", () => {
        const build = builds[Number(rowEl.dataset.buildIndex)];
        openBreakdownModal(unit, traitDef.name, build.breakdown, build.equips, build.unitRelic);
      });
    });

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
  }

  function renderCalculations() {
    traitStack.innerHTML = "";

    const sortedTraits = Object.keys(TRAIT_DEFINITIONS).filter(traitKey => traitKey !== "base").map(traitKey => {
      const result = optimizeRelicsForTrait(unit, traitKey, {
        simulateShinigamiPassive: shinigamiPassiveActive,
        darkMageMode,
        giantForm,
        berserkState,
        demonicPresence,
        fuaDamages: getFuaDamagesForTrait(traitKey),
        mode
      });
      return { traitKey, ...result };
    }).sort((a, b) => b.breakdown.displayVal - a.breakdown.displayVal);

    sortedTraits.forEach(({ traitKey, breakdown, builds }) => {
      const traitDef = TRAIT_DEFINITIONS[traitKey];
      const row = document.createElement("div");
      row.className = "dps-trait-row";
      const topBuild = builds[0];

      const traitDefMatch = allTraitsCatalog.find(t => t.name.toLowerCase() === traitDef.id.toLowerCase());
      const traitIconSrc = traitDefMatch?.image || `icons/traits/${traitDef.name}.png`;

      row.innerHTML = `
        <div class="dps-trait-row-summary">
          <div class="dps-trait-info-col">
            <div class="dps-row-trait-header">
              <img class="dps-row-trait-icon" src="${toAbsoluteUrl(traitIconSrc)}" alt="${traitDef.name}" title="${traitDef.name}" onerror="this.style.display='none'" />
              <div class="dps-loadout-icons-col">${buildLoadoutIcons(topBuild)}</div>
            </div>
          </div>

          <div class="dps-trait-result-col">
            <div class="dps-result-val-stack">
              <span class="dps-result-val">${breakdown.formattedVal}<span class="dps-result-unit">${breakdown.unitLabel}</span></span>
            </div>
            <button type="button" class="dps-view-builds-btn" aria-label="View ${traitDef.name} builds">
              Builds
            </button>
            <button type="button" class="dps-expand-trigger" aria-label="Open top build breakdown">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/></svg>
            </button>
          </div>
        </div>
      `;

      row.querySelector(".dps-view-builds-btn").addEventListener("click", () => {
        openTraitBuildsModal(traitDef, builds);
      });
      row.querySelector(".dps-expand-trigger").addEventListener("click", () => {
        openBreakdownModal(unit, traitDef.name, topBuild.breakdown, topBuild.equips, topBuild.unitRelic);
      });

      traitStack.appendChild(row);
    });
  }

  renderCalculations();

  return card;
}