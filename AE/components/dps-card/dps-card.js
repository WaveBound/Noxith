import { getTraitBreakdown, formatDPS, TRAIT_DEFINITIONS, getSummonsData, getUnitRelicList } from "../../pages/dps-math.js";
import { globalRelics } from "../../data/relics.js";
import { getRelicStatsByName } from "../../data/relicstats.js";
import { relicImgByName, ELEMENT_ICONS, ARCHETYPE_ICONS, iconImg, STAT_ICONS, formatPassiveText, STATUS_ICONS, toAbsoluteUrl } from "../../icons/icons.js";
import { traits as allTraitsCatalog } from "../../data/traits.js";
import { saveUnitSetting } from "../../js/unit-settings.js";

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
  const simulateShinigamiPassive = options.simulateShinigamiPassive !== undefined
    ? options.simulateShinigamiPassive
    : (unit.simulateShinigamiPassive !== undefined ? !!unit.simulateShinigamiPassive : true);
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
  const isCrow = unit.id === "crowblackfire" || (unit.name && unit.name.includes("Crow"));
  const isVegetable = unit.id === "vegetableprince" || (unit.name && unit.name.includes("Vegetable"));
  const isBioinsect = unit.id === "bioinsectfinal" || !!unit.isBioinsectUnit;
  const isCarrot = unit.id === "carrotunleashed" || (unit.name && unit.name.includes("Carrot"));
  const isProdigy = unit.id === "prodigyrage" || (unit.name && unit.name.includes("Prodigy"));
  const isCursedImmortal = unit.id === "cursedimmortalblacksun" || (unit.name && unit.name.includes("Cursed Immortal"));

  combos.forEach(([eq1, eq2]) => {
    const mockUnit = {
      ...unit,
      ascend: unit.ascend || 0,
      selectedDpsRelic: lockedRelic || "",
      selectedDpsEquip1: eq1,
      selectedDpsEquip2: eq2,
      simulateShinigamiPassive,
      darkMageMode: unit.darkMageMode || options.darkMageMode || "lightning",
      giantForm: unit.giantForm !== undefined ? unit.giantForm : (options.giantForm !== undefined ? !!options.giantForm : false),
      berserkState: unit.berserkState !== undefined ? unit.berserkState : (options.berserkState !== undefined ? !!options.berserkState : false),
      demonicPresence: unit.demonicPresence !== undefined ? unit.demonicPresence : (options.demonicPresence !== undefined ? !!options.demonicPresence : false),
      crowEnemiesHit: options.crowEnemiesHit !== undefined ? options.crowEnemiesHit : (unit.crowEnemiesHit !== undefined ? unit.crowEnemiesHit : (isCrow ? 5 : 1)),
      caringState: isCursedImmortal ? !(options.coldState !== undefined ? !!options.coldState : !!unit.coldState) : (options.caringState !== undefined ? !!options.caringState : !!unit.caringState),
      coldState: isCursedImmortal ? (options.coldState !== undefined ? !!options.coldState : !!unit.coldState) : false,
      fuaDamages: options.fuaDamages || unit.fuaDamages || [],
      isCompMode: options.isCompMode !== undefined ? !!options.isCompMode : !!unit.isCompMode,
      royalRivalry: options.royalRivalry !== undefined ? !!options.royalRivalry : (unit.royalRivalry !== undefined ? !!unit.royalRivalry : isVegetable),
      awakenedPride: options.awakenedPride !== undefined ? !!options.awakenedPride : (unit.awakenedPride !== undefined ? !!unit.awakenedPride : isVegetable),
      carrotTransformation: options.carrotTransformation !== undefined ? !!options.carrotTransformation : (unit.carrotTransformation !== undefined ? !!unit.carrotTransformation : isCarrot),
      carrotInstantRelocation: options.carrotInstantRelocation !== undefined ? !!options.carrotInstantRelocation : (unit.carrotInstantRelocation !== undefined ? !!unit.carrotInstantRelocation : isCarrot),
      prodigyRageUnleashed: options.prodigyRageUnleashed !== undefined ? !!options.prodigyRageUnleashed : (unit.prodigyRageUnleashed !== undefined ? !!unit.prodigyRageUnleashed : isProdigy),
      prodigyFatherAndSonActive: options.prodigyFatherAndSonActive !== undefined ? !!options.prodigyFatherAndSonActive : (unit.prodigyFatherAndSonActive !== undefined ? !!unit.prodigyFatherAndSonActive : false),
      prodigyStatusEffects: options.prodigyStatusEffects !== undefined ? options.prodigyStatusEffects : (unit.prodigyStatusEffects || 0),
      crimsonAbilityActive: options.crimsonAbilityActive !== undefined ? !!options.crimsonAbilityActive : (unit.crimsonAbilityActive !== undefined ? !!unit.crimsonAbilityActive : false),
      crimsonPoolCount: options.crimsonPoolCount !== undefined ? options.crimsonPoolCount : (unit.crimsonPoolCount !== undefined ? unit.crimsonPoolCount : 3),
      bioinsectForm: options.bioinsectForm || unit.bioinsectForm || "semiperfect",
      bioinsectResetStacks: options.bioinsectResetStacks !== undefined ? options.bioinsectResetStacks : (unit.bioinsectResetStacks || 0),
      bioinsectCopiedUnitId: options.bioinsectCopiedUnitId !== undefined ? options.bioinsectCopiedUnitId : (unit.bioinsectCopiedUnitId || (isBioinsect ? "puppet" : null)),
    };

    const rawBreakdown = getTraitBreakdown(mockUnit, traitKey, targetLevel, statMode);

    let effDamage = Number(rawBreakdown.effDamage) || 0;
    let effRange = Number(rawBreakdown.effRange) || 0;
    let avgHitDamage = Number(rawBreakdown.avgHitDamage) || 0;
    let unitDirectDPS = Number(rawBreakdown.unitDirectDPS) || 0;
    let dotDamage = Number(rawBreakdown.dotDamage) || 0;
    let unitDoTDPS = Number(rawBreakdown.unitDoTDPS) || 0;
    let summonDamage = Number(rawBreakdown.summonDamage) || 0;
    let summonDirectDPS = Number(rawBreakdown.summonDirectDPS) || 0;
    let summonDoTDPS = Number(rawBreakdown.summonDoTDPS) || 0;
    let totalSummonDPS = Number(rawBreakdown.totalSummonDPS) || 0;
    let singleFuaDps = Number(rawBreakdown.fuaDps) || 0;

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

    const singlePlacementDmg = Number(rawBreakdown.singlePlacementDmg) || 0;
    const totalDmg = singlePlacementDmg * placements;

    const displayVal = mode === "dmg" ? totalDmg : finalDps;
    const formattedVal = formatDPS(displayVal);
    const unitLabel = mode === "dmg" ? "DMG" : "DPS";

    const breakdown = {
      ...rawBreakdown,
      statMode,
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

  builds.sort((a, b) => (Number(b.breakdown.displayVal) || 0) - (Number(a.breakdown.displayVal) || 0));
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

  const labels = {
    damage: "Damage",
    spa: "SPA",
    range: "Range",
    critChance: "Crit Rate",
    critDamage: "Crit Dmg",
    magicdamage: "Magic DMG",
    physicaldamage: "Phys DMG",
    dotbonus: "DoT DMG"
  };

  const modsHtml = (def.stats || []).flatMap(block =>
    Object.entries(block).map(([k, v]) => {
      const statLabel = labels[k] || k;
      const value = typeof v === "object" ? (v.max || "") : String(v);

      return `
        <div class="dps-relic-stat-pill">
          <span class="dps-relic-stat-lbl">${statLabel}</span>
          <span class="dps-relic-stat-val font-mono">${value}</span>
        </div>`;
    })
  ).join("");

  let passiveHtml = "";
  if (def.passive) {
    const formattedEffect = formatPassiveText(def.passive.desc || "");
    passiveHtml = `
      <div class="dps-relic-passive-container collapsed">
        <button type="button" class="dps-passive-toggle-btn" aria-label="Toggle passive explanation">
          <div class="dps-passive-btn-header">
            <span class="dps-passive-tag">Passive</span>
            <span class="dps-passive-name-text">${def.passive.name}</span>
          </div>
          <svg class="dps-passive-toggle-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dps-relic-passive-desc hidden">${formattedEffect}</div>
      </div>`;
  }

  return `
    <div class="dps-relic-card-box ${isUnitEquip ? "unit-equip-card" : "slot-equip-card"}">
      <div class="dps-relic-card-header">
        <div class="dps-relic-avatar-wrap">
          <img src="${imgSrc}" alt="${name}" />
        </div>
        <div class="dps-relic-info">
          <span class="dps-relic-type-badge ${isUnitEquip ? 'badge-unit' : 'badge-slot'}">${label}</span>
          <h4 class="dps-relic-title" title="${name}">${name}</h4>
        </div>
      </div>
      <div class="dps-relic-stats-grid">
        ${modsHtml}
      </div>
      ${passiveHtml}
    </div>`;
}

function openRelicPassiveModal(name, descHtml) {
  const existing = document.querySelector(".dps-passive-modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "dps-modal-backdrop dps-passive-modal-backdrop";
  backdrop.style.zIndex = "100000";

  const modal = document.createElement("div");
  modal.className = "dps-passive-modal-content";
  modal.innerHTML = `
    <div class="dps-passive-modal-header">
      <div class="dps-passive-modal-title">
        <span class="dps-passive-modal-badge">Passive</span>
        <span class="dps-relic-passive-name-modal">${name}</span>
      </div>
      <button class="dps-passive-modal-close" aria-label="Close modal">&times;</button>
    </div>
    <div class="dps-passive-modal-body">
      <div class="dps-relic-passive-desc-modal">${descHtml}</div>
    </div>
  `;

  const close = () => {
    backdrop.remove();
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  modal.querySelector(".dps-passive-modal-close").addEventListener("click", (e) => {
    e.stopPropagation();
    close();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
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
    document.removeEventListener("keydown", handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", handleKeydown);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const rawBase = breakdown.base || {};
  const hasAscend = breakdown.hasAscend;

  const isUnboundTrait = (traitName || "").toLowerCase().includes("unbound") || (breakdown.trait?.id || "").toLowerCase() === "unbound";
  const placementCount = isUnboundTrait ? 1 : (breakdown.placements || 1);

  // ── 1. DAMAGE ACCUMULATION & BUFF SEQUENCE ──
  const baseDmgLv1 = rawBase.damage || 0;
  const levelMult = breakdown.levelMult || 1;
  const traitDmgBonus = breakdown.trait?.damageBonus || 0;
  const relicDmgBonus = breakdown.relicDamageMult || 0;
  const relicArchetypeDmgBonus = breakdown.relicArchetypeDamageMult || 0;
  const totalPassiveDmgBonus = breakdown.totalPassiveDamageBonus || 0;

  let dmgAccum = baseDmgLv1;
  let dmgRowsHtml = `
    <div class="dps-breakdown-row">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">1</span>
        <span class="dps-row-lbl">Base Hit DMG (Lv. 1)</span>
      </div>
      <span class="dps-row-val font-mono">${Math.round(baseDmgLv1).toLocaleString()}</span>
    </div>
  `;

  if (levelMult > 1) {
    dmgAccum = Math.round(dmgAccum * levelMult);
    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">2</span>
          <span class="dps-row-lbl">Level 50 Base Scaling</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${levelMult.toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (traitDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + traitDmgBonus));
    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">3</span>
          <span class="dps-row-lbl">Trait DMG Bonus (${breakdown.trait?.name || traitName || "Trait"})</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + traitDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (relicDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicDmgBonus));
    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">4</span>
          <span class="dps-row-lbl">Relics Total DMG Multiplier</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + relicDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (relicArchetypeDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicArchetypeDmgBonus));
    const archRaw = (breakdown.unitArchetype || rawBase.archetype || "").toLowerCase();
    const archLabel = archRaw.includes("phys") ? "Physical" : (archRaw.includes("mag") ? "Magical" : "Archetype");
    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">5</span>
          <span class="dps-row-lbl">Relic ${archLabel} DMG Multiplier</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + relicArchetypeDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  dmgAccum = Math.round(dmgAccum * 1.20);
  dmgRowsHtml += `
    <div class="dps-breakdown-row step-indented">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">6</span>
        <span class="dps-row-lbl">Z Stat Multiplier</span>
      </div>
      <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.20</span>${dmgAccum.toLocaleString()}</span>
    </div>
  `;

  if (hasAscend) {
    dmgAccum = Math.round(dmgAccum * 1.15);
    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">7</span>
          <span class="dps-row-lbl">Ascension III Multiplier</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.15</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (totalPassiveDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + totalPassiveDmgBonus));
    const parts = [];
    if (breakdown.shinigamiActive) parts.push({ label: "Shinigami Sword", pct: "15%" });
    if (breakdown.isReaper) parts.push({ label: "Adaptation Passive", pct: "40%" });
    if (breakdown.isEighthSword && breakdown.berserkState) parts.push({ label: "The Nameless Demon (Berserk)", pct: "20%" });
    if (breakdown.isLadyGiant && breakdown.giantForm) parts.push({ label: "Size Control: Giant Form", pct: "125%" });
    if (breakdown.isBioinsect && breakdown.bioinsectResetStacks > 0) {
      const hasMechanicalWings = (breakdown.relics || []).some(r => r.name === "Mechanical Wings");
      const pctPerStack = hasMechanicalWings ? 5 : 1;
      const totalPct = pctPerStack * breakdown.bioinsectResetStacks;
      parts.push({ label: `Bio Reset (×${breakdown.bioinsectResetStacks} stacks)`, pct: `${totalPct}%` });
    }
    if (breakdown.isCarrot && breakdown.carrotTransformation) parts.push({ label: "Transformation", pct: "15%" });
    if (breakdown.isCarrot && breakdown.carrotInstantRelocation) parts.push({ label: "Instant Relocation Buff", pct: "50%" });
    if (breakdown.isProdigy && breakdown.prodigyRageUnleashed) parts.push({ label: "Rage Unleashed", pct: "25%" });
    if (breakdown.hasWarriorPole && breakdown.isTransformed) parts.push({ label: "Warrior Pole Passive", pct: "20%" });
    if (breakdown.royalRivalry) parts.push({ label: "Royal Rivalry (Max Capacity)", pct: "50%" });
    if (breakdown.awakenedPride) parts.push({ label: "Awakened Pride (Transformation)", pct: "15%" });

    dmgRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">8</span>
          <span class="dps-row-lbl">Passives &amp; Active Buffs Cumulative Multiplier</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + totalPassiveDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;

    parts.forEach(p => {
      dmgRowsHtml += `
        <div class="dps-breakdown-subrow">
          <span class="dps-subrow-bullet">↳</span>
          <span class="dps-subrow-lbl">${p.label}</span>
          <span class="dps-subrow-val font-mono color-buff">+${p.pct}</span>
        </div>
      `;
    });
  }

  // ── 2. CRIT AVERAGING & MULTIPLIER MATH ──
  const baseCritChance = rawBase.critChancePercent || 0;
  const traitCritChance = (breakdown.trait?.critChanceBonus || 0) * 100;
  const relicCritChance = (breakdown.relicCritChanceAdd || 0) * 100;
  const passiveCritChance = (breakdown.passiveCritChanceAdd || (breakdown.isReaper ? 0.40 : 0)) * 100;

  const displayCritRate = breakdown.isCarrot
    ? (breakdown.effectiveCritRate ?? breakdown.effCritChance ?? 0)
    : (breakdown.effCritChance || 0);
  const finalCritChancePercent = Math.min(100, Math.round(displayCritRate * 100));

  const baseCritDmg = rawBase.critDamagePercent ?? 50;
  const traitCritDmg = (breakdown.trait?.critDamageBonus || 0) * 100;
  const relicCritDmg = (breakdown.relicCritDamageAdd || 0) * 100;
  const passiveCritDmg = (breakdown.passiveCritDamageAdd || 0) * 100;
  const finalCritDmgPercent = Math.round((breakdown.effCritDamage || 1) * 100);

  const critBonusVal = displayCritRate * (breakdown.effCritDamage || 1);
  const critAvgMult = breakdown.critAvgMult || (1 + critBonusVal);

  let critRowsHtml = `
    <div class="dps-crit-calc-grid">
      <!-- Left: Crit Rate Stack -->
      <div class="dps-crit-subcard">
        <div class="dps-crit-subcard-title">Crit Rate Accumulator</div>
        <div class="dps-crit-subcard-rows">
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Base Rate</span>
            <span class="dps-row-val font-mono">${Math.round(baseCritChance)}%</span>
          </div>
          ${traitCritChance > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Trait (${breakdown.trait?.name || "Trait"})</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(traitCritChance)}%</span>
          </div>` : ""}
          ${relicCritChance > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Relics</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(relicCritChance)}%</span>
          </div>` : ""}
          ${passiveCritChance > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Passives</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(passiveCritChance)}%</span>
          </div>` : ""}
          ${breakdown.isCarrot ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Battle Instinct (4th-hit avg)</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round((breakdown.battleInstinctBonusCrit || 0) * 100)}%</span>
          </div>` : ""}
          <div class="dps-breakdown-row mini result-row">
            <span class="dps-row-lbl font-bold color-crit">Effective Crit Rate</span>
            <span class="dps-row-val font-mono color-crit font-bold">${finalCritChancePercent}%</span>
          </div>
        </div>
      </div>

      <!-- Right: Crit Damage Stack -->
      <div class="dps-crit-subcard">
        <div class="dps-crit-subcard-title">Crit Damage Accumulator</div>
        <div class="dps-crit-subcard-rows">
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Base Crit DMG</span>
            <span class="dps-row-val font-mono">${Math.round(baseCritDmg)}%</span>
          </div>
          ${traitCritDmg > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Trait (${breakdown.trait?.name || "Trait"})</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(traitCritDmg)}%</span>
          </div>` : ""}
          ${relicCritDmg > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Relics</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(relicCritDmg)}%</span>
          </div>` : ""}
          ${passiveCritDmg > 0 ? `
          <div class="dps-breakdown-row mini">
            <span class="dps-row-lbl">Passives</span>
            <span class="dps-row-val font-mono color-buff">+${Math.round(passiveCritDmg)}%</span>
          </div>` : ""}
          <div class="dps-breakdown-row mini result-row">
            <span class="dps-row-lbl font-bold color-crit">Final Crit DMG</span>
            <span class="dps-row-val font-mono color-crit font-bold">${finalCritDmgPercent}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formula Box -->
    <div class="dps-formula-box">
      <div class="dps-formula-line">
        <span class="dps-formula-lbl">Crit Multiplier Formula:</span>
        <span class="dps-formula-code font-mono">1.00 + (Rate &times; Crit DMG) = 1.00 + (${finalCritChancePercent}% &times; ${finalCritDmgPercent}%) = <span class="color-crit font-bold">×${critAvgMult.toFixed(2)}</span></span>
      </div>
      <div class="dps-formula-line">
        <span class="dps-formula-lbl">Average Hit Calculation:</span>
        <span class="dps-formula-code font-mono">${Math.round(breakdown.effDamage).toLocaleString()} Base &times; ${critAvgMult.toFixed(2)} Crit = <span class="color-crit font-bold">${Math.round(breakdown.avgHitDamage || 0).toLocaleString()} DMG</span></span>
      </div>
    </div>
  `;

  // ── 3. SPA MATH ACCUMULATION ──
  const baseSpa = rawBase.spa || 1;
  const traitSpaBonus = breakdown.trait?.spaBonus || 0;
  const relicSpaBonus = breakdown.relicSpaMult || 0;
  let spaAccum = baseSpa;

  let spaRowsHtml = `
    <div class="dps-breakdown-row">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">1</span>
        <span class="dps-row-lbl">Base Attack SPA</span>
      </div>
      <span class="dps-row-val font-mono">${baseSpa.toFixed(2)}s</span>
    </div>
  `;
  if (traitSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + traitSpaBonus);
    spaRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">2</span>
          <span class="dps-row-lbl">Trait SPA Reduction</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + traitSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }
  if (relicSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + relicSpaBonus);
    spaRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">3</span>
          <span class="dps-row-lbl">Relic SPA Reduction</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + relicSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }

  spaAccum = spaAccum * 0.85;
  spaRowsHtml += `
    <div class="dps-breakdown-row step-indented">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">4</span>
        <span class="dps-row-lbl">Z Stat SPA Multiplier</span>
      </div>
      <span class="dps-row-val font-mono"><span class="dps-mult-tag">×0.85</span>${spaAccum.toFixed(2)}s</span>
    </div>
  `;

  if (breakdown.isReaper) {
    spaAccum = spaAccum * 0.90;
    spaRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">5</span>
          <span class="dps-row-lbl">Critical Tempo Passive (-10% SPA)</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  } else if (breakdown.isLadyGiant && breakdown.giantForm) {
    spaAccum = spaAccum * 1.25;
    spaRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">5</span>
          <span class="dps-row-lbl">Size Control: Giant Form (+25% SPA)</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.25</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  } else if (breakdown.isEighthSword && breakdown.berserkState) {
    spaAccum = spaAccum * 0.90;
    spaRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">5</span>
          <span class="dps-row-lbl">The Nameless Demon (Berserk -10% SPA)</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }

  // ── 4. RANGE MATH ACCUMULATION ──
  const baseRng = rawBase.range || 0;
  const traitRngBonus = breakdown.trait?.rangeBonus || 0;
  const relicRngBonus = breakdown.relicRangeMult || 0;
  let rngAccum = baseRng;

  let rngRowsHtml = `
    <div class="dps-breakdown-row">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">1</span>
        <span class="dps-row-lbl">Base Attack Range</span>
      </div>
      <span class="dps-row-val font-mono">${baseRng.toFixed(1)}</span>
    </div>
  `;

  if (traitRngBonus > 0) {
    rngAccum = rngAccum * (1 + traitRngBonus);
    rngRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">2</span>
          <span class="dps-row-lbl">Trait Range Bonus</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + traitRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  if (relicRngBonus > 0) {
    rngAccum = rngAccum * (1 + relicRngBonus);
    rngRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">3</span>
          <span class="dps-row-lbl">Relics Range Bonus</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + relicRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  rngAccum = rngAccum * 1.15;
  rngRowsHtml += `
    <div class="dps-breakdown-row step-indented">
      <div class="dps-row-label-wrap">
        <span class="dps-row-num">4</span>
        <span class="dps-row-lbl">Z Stat Range Multiplier</span>
      </div>
      <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.15</span>${rngAccum.toFixed(1)}</span>
    </div>
  `;

  if (hasAscend) {
    rngAccum = rngAccum * 1.05;
    rngRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">5</span>
          <span class="dps-row-lbl">Ascension III Range Multiplier</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.05</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  if (breakdown.isLadyGiant && breakdown.giantForm) {
    rngAccum = rngAccum * 1.50;
    rngRowsHtml += `
      <div class="dps-breakdown-row step-indented">
        <div class="dps-row-label-wrap">
          <span class="dps-row-num">6</span>
          <span class="dps-row-lbl">Size Control: Giant Form (+50% Range)</span>
        </div>
        <span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.50</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  const activeFuaBreakdowns = (breakdown.fuaBreakdowns || []).filter(entry => (Number(entry.inputDamage) || 0) > 0 || (Number(entry.dps) || 0) > 0);
  const summonBreakdowns = breakdown.summonBreakdowns || [];
  const blackFireDotDmg = breakdown.isCrow ? Math.round((breakdown.effDamage || 0) * (breakdown.effDotMult || 2.0)) : 0;

  const container = document.createElement("div");
  container.className = "dps-modal-container";

  // Build Summons Panel if unit has summons
  let summonsPanel = null;
  if (summonBreakdowns.length > 0) {
    summonsPanel = document.createElement("div");
    summonsPanel.className = "dps-panel summons-panel";

    let activeSummonIdx = 0;

    function renderSummonsPanel() {
      const s = summonBreakdowns[activeSummonIdx] || {};
      const hasMultiple = summonBreakdowns.length > 1;
      const scaleMult = s.summonDamageMult ?? (breakdown.effDamage > 0 ? (s.effDamage / breakdown.effDamage) : 0);
      const sCritMult = s.critAvgMult || breakdown.critAvgMult || 1.0;

      let intermediateRowsHtml = "";
      if (s.hasOwnUpgrades) {
        let sDmgAccum = s.baseDamage || 0;
        let tRow = "", rRow = "", zRow = "", aRow = "";
        if (s.traitDmgBonus > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + s.traitDmgBonus));
          tRow = `<div class="dps-breakdown-row step-indented"><span class="dps-row-lbl">Trait DMG Bonus</span><span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + s.traitDmgBonus).toFixed(2)}</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.relicTotalDmgMult > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + s.relicTotalDmgMult));
          rRow = `<div class="dps-breakdown-row step-indented"><span class="dps-row-lbl">Relic DMG Bonus</span><span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + s.relicTotalDmgMult).toFixed(2)}</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.isZStat) {
          sDmgAccum = Math.round(sDmgAccum * 1.20);
          zRow = `<div class="dps-breakdown-row step-indented"><span class="dps-row-lbl">Z Stat Multiplier</span><span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.20</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.hasAscend) {
          sDmgAccum = Math.round(sDmgAccum * 1.15);
          aRow = `<div class="dps-breakdown-row step-indented"><span class="dps-row-lbl">Ascension III Multiplier</span><span class="dps-row-val font-mono"><span class="dps-mult-tag">×1.15</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        intermediateRowsHtml = `${tRow}${rRow}${zRow}${aRow}`;
      } else {
        intermediateRowsHtml = `
          <div class="dps-breakdown-row step-indented">
            <span class="dps-row-lbl">Summon Base Scaling</span>
            <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${scaleMult.toFixed(2)}</span>${Math.round(s.effDamage || 0).toLocaleString()}</span>
          </div>`;
      }

      const sBaseSpa = s.baseSpa || 1;
      let sSpaAccum = sBaseSpa;
      let sSpaRowsHtml = `
        <div class="dps-breakdown-row">
          <span class="dps-row-lbl">Base Summon SPA</span>
          <span class="dps-row-val font-mono">${sBaseSpa.toFixed(2)}s</span>
        </div>
      `;
      if ((s.traitSpaBonus || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + s.traitSpaBonus);
        sSpaRowsHtml += `
          <div class="dps-breakdown-row step-indented">
            <span class="dps-row-lbl">Trait SPA Multiplier</span>
            <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + s.traitSpaBonus).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span>
          </div>
        `;
      }
      if ((s.relicSpaMult || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + s.relicSpaMult);
        sSpaRowsHtml += `
          <div class="dps-breakdown-row step-indented">
            <span class="dps-row-lbl">Relic SPA Multiplier</span>
            <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${(1 + s.relicSpaMult).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span>
          </div>
        `;
      }
      if (s.isZStat) {
        sSpaAccum = sSpaAccum * 0.85;
        sSpaRowsHtml += `
          <div class="dps-breakdown-row step-indented">
            <span class="dps-row-lbl">Z Stat SPA Multiplier</span>
            <span class="dps-row-val font-mono"><span class="dps-mult-tag">×0.85</span>${sSpaAccum.toFixed(2)}s</span>
          </div>
        `;
      }

      const tabBarHtml = hasMultiple ? `
        <div class="dps-summon-tab-bar">
          ${summonBreakdowns.map((sb, i) => `
            <button type="button" class="dps-summon-tab-btn${i === activeSummonIdx ? " active" : ""}" data-idx="${i}">
              ${sb.name}
            </button>
          `).join("")}
        </div>
      ` : "";

      summonsPanel.innerHTML = `
        <div class="dps-modal-top-bar summons-top-bar">
          <div class="dps-unit-hero-info">
            <div class="dps-unit-title-stack">
              <div class="dps-modal-title-row">
                <h3 class="dps-modal-unit-name color-summons">${s.name || "Summon"} Calculations</h3>
              </div>
              <div class="dps-unit-status-chips">
                <span class="dps-status-chip">Summon Pipeline</span>
                <span class="dps-status-chip font-mono">${s.activeCount || 1} Active</span>
              </div>
            </div>
          </div>
        </div>
        ${tabBarHtml}
        <div class="dps-panel-body">
          <div class="dps-section card-summons-theme">
            <div class="dps-section-hd color-summons">1. Summon Base Hit Damage</div>
            <div class="dps-breakdown-list">
              ${s.hasOwnUpgrades ? `
                <div class="dps-breakdown-row">
                  <span class="dps-row-lbl">Base Max Upgrade DMG (Lv. 1)</span>
                  <span class="dps-row-val font-mono">${Math.round(s.rawMaxDamage || 0).toLocaleString()}</span>
                </div>
                ${s.levelMult > 1 ? `
                  <div class="dps-breakdown-row step-indented">
                    <span class="dps-row-lbl">Level 50 scaling</span>
                    <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${s.levelMult.toFixed(2)}</span>${Math.round(s.baseDamage || 0).toLocaleString()}</span>
                  </div>` : ""}
              ` : `
                <div class="dps-breakdown-row">
                  <span class="dps-row-lbl">Unit Pre-Crit Base Hit</span>
                  <span class="dps-row-val font-mono">${Math.round(breakdown.effDamage || 0).toLocaleString()}</span>
                </div>
              `}
              ${intermediateRowsHtml}
              <div class="dps-breakdown-highlight-row">
                <span class="dps-highlight-lbl color-summons">Pre-Crit Base Hit</span>
                <span class="dps-highlight-val font-mono color-summons">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="dps-section card-summons-theme">
            <div class="dps-section-hd color-summons">2. Crit Multiplier</div>
            <div class="dps-breakdown-list">
              <div class="dps-breakdown-row">
                <span class="dps-row-lbl">Pre-Crit Base Hit</span>
                <span class="dps-row-val font-mono">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-breakdown-row step-indented">
                <span class="dps-row-lbl">Crit Averaging Multiplier</span>
                <span class="dps-row-val font-mono"><span class="dps-mult-tag">×${sCritMult.toFixed(2)}</span>${Math.round(s.avgHitDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-breakdown-highlight-row">
                <span class="dps-highlight-lbl color-summons">Avg Hit DMG (with Crit)</span>
                <span class="dps-highlight-val font-mono color-summons">${Math.round(s.avgHitDamage || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="dps-section card-summons-theme">
            <div class="dps-section-hd color-summons">3. Summon SPA Calculations</div>
            <div class="dps-breakdown-list">
              ${sSpaRowsHtml}
              <div class="dps-breakdown-highlight-row">
                <span class="dps-highlight-lbl color-summons">Final Summon SPA</span>
                <span class="dps-highlight-val font-mono color-summons">${(s.effSpa || 1).toFixed(2)}s</span>
              </div>
            </div>
          </div>

          <div class="dps-section card-summons-theme">
            <div class="dps-section-hd color-summons">4. Direct Output &amp; DPS</div>
            <div class="dps-breakdown-list">
              <div class="dps-breakdown-row">
                <span class="dps-row-lbl">Summon Output (${s.activeCount || 1} active / 1 Placement)</span>
                <span class="dps-row-val font-mono">${Math.round(s.avgHitDamage || 0).toLocaleString()} &times; ${s.activeCount || 1} = ${Math.round((s.avgHitDamage || 0) * (s.activeCount || 1)).toLocaleString()}</span>
              </div>
              <div class="dps-breakdown-row step-indented">
                <span class="dps-row-lbl">Final Summon SPA</span>
                <span class="dps-row-val font-mono">${(s.effSpa || 1).toFixed(2)}s</span>
              </div>
              <div class="dps-breakdown-highlight-row">
                <span class="dps-highlight-lbl color-summons">Direct DPS (1 Placement)</span>
                <span class="dps-highlight-val font-mono color-summons">+${formatFullDPS(s.directDps)} DPS</span>
              </div>
            </div>
          </div>

          ${(s.dotDps || 0) > 0 ? `
          <div class="dps-section card-summons-theme">
            <div class="dps-section-hd color-summons">5. DoT DPS (${s.dotName || "Bleed"})</div>
            <div class="dps-breakdown-list">
              <div class="dps-breakdown-row">
                <span class="dps-row-lbl">Summon Base Hit</span>
                <span class="dps-row-val font-mono">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-breakdown-highlight-row">
                <span class="dps-highlight-lbl color-dot">DoT DPS</span>
                <span class="dps-highlight-val font-mono color-dot">+${formatFullDPS(s.dotDps)} DPS</span>
              </div>
            </div>
          </div>` : ""}
        </div>

        <!-- Sticky Summons Footer -->
        <div class="dps-panel-footer summons-panel-footer">
          <div class="dps-footer-summary-container">
            <div class="dps-footer-summary-left">
              <div class="dps-footer-stat-line">
                <span class="dps-footer-lbl">${s.name || "Summon"} DPS:</span>
                <span class="dps-footer-val font-mono color-summons">${formatFullDPS(s.dps)} DPS</span>
              </div>
              ${summonBreakdowns.length > 1 ? `
              <div class="dps-footer-sub-grid">
                <span>All Summons (1 Placement): <b class="font-mono">${formatFullDPS(breakdown.totalSummonDPS || 0)} DPS</b></span>
              </div>` : `
              <div class="dps-footer-sub-grid">
                <span>Single Placement Output</span>
              </div>`}
            </div>
            <div class="dps-footer-summary-right">
              <span class="dps-footer-total-badge color-summons">${placementCount} Placement${placementCount > 1 ? "s" : ""} Total</span>
              <div class="dps-footer-total-val font-mono color-summons" style="text-shadow: 0 0 12px rgba(45, 212, 191, 0.4);">${formatFullDPS((breakdown.totalSummonDPS || 0) * placementCount)} <span class="dps-footer-unit">DPS</span></div>
            </div>
          </div>
        </div>
      `;

      summonsPanel.querySelectorAll(".dps-summon-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          activeSummonIdx = parseInt(btn.dataset.idx, 10);
          renderSummonsPanel();
        });
      });
    }

    renderSummonsPanel();
  }

  // Build Main Breakdown Panel
  const mainPanel = document.createElement("div");
  mainPanel.className = "dps-panel main-panel mobile-active";

  const traitDefMatch = allTraitsCatalog.find(t => t.name.toLowerCase() === (breakdown.trait?.id || traitName || "").toLowerCase());
  const traitIconSrc = traitDefMatch?.image || `icons/traits/${traitName}.png`;

  mainPanel.innerHTML = `
    <!-- Top Modal Header Bar -->
    <div class="dps-modal-top-bar">
      <div class="dps-unit-hero-info">
        <div class="dps-unit-avatar-wrap">
          <img src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" onerror="this.src='assets/placeholder.svg'" />
        </div>
        <div class="dps-unit-title-stack">
          <div class="dps-modal-title-row">
            <h2 class="dps-modal-unit-name">${unit.name}</h2>
            <div class="dps-modal-trait-badge">
              <img src="${toAbsoluteUrl(traitIconSrc)}" alt="" onerror="this.style.display='none'" />
              <span>${traitName}</span>
            </div>
          </div>
          <div class="dps-unit-status-chips">
            <span class="dps-status-chip chip-level">Lv 50</span>
            <span class="dps-status-chip chip-zstat">Z Stat (1.20x DMG / 0.85x SPA / 1.15x RNG)</span>
            ${hasAscend ? `<span class="dps-status-chip chip-ascend">Ascension III (1.15x DMG / 1.05x RNG)</span>` : ""}
            ${breakdown.shinigamiActive ? `<span class="dps-status-chip chip-shinigami">Shinigami Sword Active (+15%)</span>` : ""}
          </div>
        </div>
      </div>
      <button type="button" class="dps-modal-close-btn" aria-label="Close modal">&times;</button>
    </div>

    <!-- Main Scrollable Body -->
    <div class="dps-panel-body">
      <!-- ── EQUIPPED RELICS SHOWCASE ── -->
      <div class="dps-section card-relics-theme">
        <div class="dps-section-hd">Equipped Relics</div>
        <div class="dps-relic-cards-showcase">
          ${lockedRelic ? buildDetailedRelicCard(lockedRelic, "Unit Equip", true) : ""}
          ${bestEquips.map((eq, i) => buildDetailedRelicCard(eq, `Equip Slot ${i + 1}`, false)).join("")}
        </div>
      </div>

      <!-- ── SECTION 1: DAMAGE STEP PIPELINE & BUFFS ── -->
      <div class="dps-section card-damage-theme">
        <div class="dps-section-hd color-damage">1. Damage Calculations &amp; Buff Sequence</div>
        <div class="dps-breakdown-list">
          ${dmgRowsHtml}
          <div class="dps-breakdown-highlight-row color-damage-bg">
            <span class="dps-highlight-lbl color-damage">Effective Base Hit DMG (Pre-Crit)</span>
            <span class="dps-highlight-val font-mono color-damage">${Math.round(breakdown.effDamage || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 2: CRIT CALCULATIONS & AVERAGING ── -->
      <div class="dps-section card-crit-theme">
        <div class="dps-section-hd color-crit">2. Crit Averaging &amp; Output Multiplier</div>
        <div class="dps-breakdown-list">
          ${critRowsHtml}
          <div class="dps-breakdown-highlight-row color-crit-bg">
            <span class="dps-highlight-lbl color-crit">Average Hit DMG (with Crit)</span>
            <span class="dps-highlight-val font-mono color-crit">${Math.round(breakdown.avgHitDamage || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 3: SPA CALCULATIONS ── -->
      <div class="dps-section card-spa-theme">
        <div class="dps-section-hd color-spa">3. SPA (Attack Speed) Calculations</div>
        <div class="dps-breakdown-list">
          ${spaRowsHtml}
          <div class="dps-breakdown-highlight-row color-spa-bg">
            <span class="dps-highlight-lbl color-spa">${(breakdown.isDarkMage && breakdown.darkMageMode === "lightning") || (breakdown.isCursedImmortal && (breakdown.caringState || breakdown.coldState)) ? "Aura Mode SPA" : "Final Effective SPA"}</span>
            <span class="dps-highlight-val font-mono color-spa">${(breakdown.isDarkMage && breakdown.darkMageMode === "lightning") || (breakdown.isCursedImmortal && (breakdown.caringState || breakdown.coldState)) ? "1.00s Constant" : `${(breakdown.effSpa || 1).toFixed(2)}s`}</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 4: RANGE CALCULATIONS ── -->
      <div class="dps-section card-range-theme">
        <div class="dps-section-hd color-range">4. Range Calculations</div>
        <div class="dps-breakdown-list">
          ${rngRowsHtml}
          <div class="dps-breakdown-highlight-row color-range-bg">
            <span class="dps-highlight-lbl color-range">Final Effective Range</span>
            <span class="dps-highlight-val font-mono color-range">${(breakdown.effRange || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 5: DOT & STATUS CALCULATIONS (IF ACTIVE) ── -->
      ${((rawBase.dotMultiplier || 0) > 0 || breakdown.demonicPresence || breakdown.isCrimson) ? `
      <div class="dps-section card-dot-theme">
        <div class="dps-section-hd color-dot">5. ${breakdown.isDarkMage ? "Passive Damage Calculation" : breakdown.isEighthSword ? "Demonic Presence Calculation" : breakdown.isCrow ? "Black Fire DoT Calculation" : breakdown.isCrimson ? "Crimson Status Effects & Bleed" : `DoT Calculation (${formatPassiveText(rawBase.dotName || "Status")})`}</div>
        <div class="dps-breakdown-list">
          <div class="dps-breakdown-row">
            <span class="dps-row-lbl">Status Effect</span>
            <span class="dps-row-val">${formatPassiveText(rawBase.dotName || "DoT")}</span>
          </div>
          <div class="dps-breakdown-row">
            <span class="dps-row-lbl">Base Multiplier</span>
            <span class="dps-row-val font-mono">${breakdown.isEighthSword ? "15% Current DMG (Can Crit)" : breakdown.isCrow ? "2.00x Base Hit in 12 ticks over 12s" : breakdown.isCrimson ? "Bleed: 0.65x | Explode: 15% | Pools: 10%/2s" : `${(rawBase.dotMultiplier || 0).toFixed(2)}x Base Hit`}</span>
          </div>
          ${breakdown.isEighthSword ? `
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Base Tick DMG (15% Base Hit)</span>
              <span class="dps-row-val font-mono">${Math.round(breakdown.effDamage * 0.15).toLocaleString()} DMG</span>
            </div>
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Avg Tick DMG with Crit (×${(breakdown.critAvgMult || 1).toFixed(2)})</span>
              <span class="dps-row-val font-mono color-dot">${Math.round(breakdown.avgHitDamage * 0.15).toLocaleString()} DMG</span>
            </div>
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Proc Interval</span>
              <span class="dps-row-val font-mono">1.00s</span>
            </div>
            <div class="dps-breakdown-highlight-row color-dot-bg">
              <span class="dps-highlight-lbl color-dot">Unit Passive DoT DPS</span>
              <span class="dps-highlight-val font-mono color-dot">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          ` : breakdown.isCrow ? `
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Total Black Fire DMG per unit</span>
              <span class="dps-row-val font-mono color-dot">${blackFireDotDmg.toLocaleString()} DMG</span>
            </div>
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Re-proc Interval SPA</span>
              <span class="dps-row-val font-mono">roundup(12 / ${(breakdown.effSpa || 1).toFixed(2)}s) &times; ${(breakdown.effSpa || 1).toFixed(2)}s = ${(breakdown.dotIntervalSPA || 12).toFixed(2)}s</span>
            </div>
            <div class="dps-breakdown-highlight-row color-dot-bg">
              <span class="dps-highlight-lbl color-dot">Unit Black Fire DoT DPS</span>
              <span class="dps-highlight-val font-mono color-dot">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          ` : breakdown.isCrimson ? (() => {
        const effDmg = breakdown.effDamage || 0;
        const critM = breakdown.critAvgMult || 1;
        const effSpaVal = breakdown.effSpa || 1;

        const bleedDmg = effDmg * 0.65;
        const bleedIntervalMultiplier = Math.max(1, Math.ceil(6.0 / effSpaVal));
        const bleedInterval = bleedIntervalMultiplier * effSpaVal;
        const bleedDps = bleedDmg / bleedInterval;

        const cExplodeBase = effDmg * 0.15;
        const cExplodeDmg = cExplodeBase * critM;
        const cExplodeIntervalMultiplier = Math.max(1, Math.ceil(15.0 / effSpaVal));
        const cExplodeInterval = cExplodeIntervalMultiplier * effSpaVal;
        const cExplodeDps = cExplodeDmg / cExplodeInterval;

        const poolCount = breakdown.crimsonPoolCount || 0;
        const poolBasePerPool = effDmg * 0.30;
        const poolDmgPerPool = poolBasePerPool * critM;
        const poolTotalDmg = poolCount * poolDmgPerPool;
        const poolDps = poolTotalDmg / 6.0;

        return `
              <div class="dps-breakdown-row mini" style="margin-top:4px;">
                <span class="dps-row-lbl color-damage font-bold">1. Bleed DoT</span>
                <span class="dps-row-val font-mono">+${formatFullDPS(bleedDps)} DPS</span>
              </div>
              <div class="dps-breakdown-row mini">
                <span class="dps-row-lbl color-damage font-bold">2. Crimson Explode</span>
                <span class="dps-row-val font-mono">+${formatFullDPS(cExplodeDps)} DPS</span>
              </div>
              <div class="dps-breakdown-row mini">
                <span class="dps-row-lbl color-damage font-bold">3. Crimson Pools (${poolCount}/3 active)</span>
                <span class="dps-row-val font-mono">+${formatFullDPS(poolDps)} DPS</span>
              </div>
              <div class="dps-breakdown-highlight-row color-dot-bg" style="margin-top:6px;">
                <span class="dps-highlight-lbl color-dot">Total Status Effect DPS</span>
                <span class="dps-highlight-val font-mono color-dot">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
              </div>
            `;
      })() : `
            <div class="dps-breakdown-row step-indented">
              <span class="dps-row-lbl">Interval SPA</span>
              <span class="dps-row-val font-mono">${(breakdown.dotIntervalSPA || 1).toFixed(2)}s</span>
            </div>
            <div class="dps-breakdown-highlight-row color-dot-bg">
              <span class="dps-highlight-lbl color-dot">${breakdown.isDarkMage ? "Unit Passive DPS" : "Unit DoT DPS"}</span>
              <span class="dps-highlight-val font-mono color-dot">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          `}
        </div>
      </div>` : ""}

      <!-- ── SECTION 6: FUA & FOLLOW UP CALCULATIONS (IF ACTIVE) ── -->
      ${activeFuaBreakdowns.length > 0 ? `
      <div class="dps-section card-fua-theme">
        <div class="dps-section-hd color-buff">6. ${breakdown.isCrow ? 'Illusion Status Calculations' : breakdown.isProdigy ? 'Hidden Potential Strike' : 'Follow-Up Attack Calculations (FUA)'}</div>
        <div class="dps-breakdown-list">
          ${activeFuaBreakdowns.map(entry => {
        const effSpaVal = breakdown.effSpa || 1;
        const critMult = entry.critAvgMult || breakdown.critAvgMult || 1;

        if (breakdown.isCrow || entry.isStatusEffect) {
          const storingAttacks = entry.storingAttacks || Math.ceil(12 / effSpaVal);
          const directStoredDmg = entry.directStoredDmg || (storingAttacks * (breakdown.avgHitDamage || 0));
          const dotStoredDmg = entry.dotStoredDmg || blackFireDotDmg;
          const totalStoredDmg = entry.inputDamage || (directStoredDmg + dotStoredDmg);
          const effectiveness = entry.illusionEffectiveness || 0.25;
          const baseExplosion = entry.baseExplosionDamage || (totalStoredDmg * effectiveness);
          const singleExplosionWithCrit = entry.explosionDamageWithCrit || (baseExplosion * critMult);
          const enemiesHit = entry.enemiesHit || breakdown.crowEnemiesHit || 1;
          const totalExplosionPerUnit = singleExplosionWithCrit * enemiesHit;
          const fieldExplosionDmg = totalExplosionPerUnit * placementCount;
          const cycleTime = entry.cycleTimeSeconds || (Math.ceil(22 / effSpaVal) * effSpaVal);
          const singleDps = entry.dps || (totalExplosionPerUnit / cycleTime);
          const fieldDps = singleDps * placementCount;

          return `
                <div class="dps-breakdown-row">
                  <span class="dps-row-lbl">Illusion Cycle / Window</span>
                  <span class="dps-row-val font-mono">12.0s Storing / ${cycleTime.toFixed(1)}s Cycle</span>
                </div>
                <div class="dps-breakdown-row step-indented">
                  <span class="dps-row-lbl">Stored Damage (${storingAttacks} hits + Black Fire)</span>
                  <span class="dps-row-val font-mono">${Math.round(totalStoredDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-breakdown-row step-indented">
                  <span class="dps-row-lbl">Explosion DMG (${enemiesHit} enemies &times; ${placementCount} placements)</span>
                  <span class="dps-row-val font-mono">${Math.round(fieldExplosionDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-breakdown-highlight-row color-buff-bg">
                  <span class="dps-highlight-lbl color-buff">Illusion Field DPS</span>
                  <span class="dps-highlight-val font-mono color-buff">+${formatFullDPS(fieldDps)} DPS</span>
                </div>
              `;
        }

        return `
              <div class="dps-breakdown-row">
                <span class="dps-row-lbl">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)}</span>
                <span class="dps-row-val font-mono">${Math.round(entry.averageFollowUpHit || entry.effectiveFollowUpDamage || 0).toLocaleString()} DMG</span>
              </div>
              <div class="dps-breakdown-highlight-row color-buff-bg">
                <span class="dps-highlight-lbl color-buff">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)} DPS</span>
                <span class="dps-highlight-val font-mono color-buff">+${formatFullDPS(entry.dps)} DPS</span>
              </div>
            `;
      }).join("")}
          ${!breakdown.isCrow ? `
          <div class="dps-breakdown-highlight-row color-buff-bg" style="margin-top:6px;">
            <span class="dps-highlight-lbl color-buff">Total FUA Field DPS</span>
            <span class="dps-highlight-val font-mono color-buff">+${formatFullDPS(breakdown.totalFuaDps)} DPS</span>
          </div>` : ""}
        </div>
      </div>` : ""}
    </div>

    <!-- ── ALWAYS-VISIBLE STICKY FOOTER SUMMARY ── -->
    <div class="dps-panel-footer">
      <div class="dps-footer-summary-container">
        <div class="dps-footer-summary-left">
          <div class="dps-footer-stat-line">
            <span class="dps-footer-lbl">Single Placement DPS:</span>
            <span class="dps-footer-val font-mono">${formatFullDPS(breakdown.singlePlacementDps)} DPS</span>
          </div>
          <div class="dps-footer-sub-grid">
            <span>Direct: <b class="font-mono">${formatFullDPS((breakdown.unitDirectDPS || 0) * placementCount)}</b></span>
            ${(breakdown.unitDoTDPS || 0) > 0 ? `<span>DoT: <b class="font-mono">${formatFullDPS((breakdown.unitDoTDPS || 0) * placementCount)}</b></span>` : ""}
            ${(breakdown.totalFuaDps || 0) > 0 ? `<span>FUA: <b class="font-mono">${formatFullDPS(breakdown.totalFuaDps)}</b></span>` : ""}
            ${(breakdown.totalSummonDPS || 0) > 0 ? `<span>Summons: <b class="font-mono">${formatFullDPS((breakdown.totalSummonDPS || 0) * placementCount)}</b></span>` : ""}
          </div>
        </div>
        <div class="dps-footer-summary-right">
          <span class="dps-footer-total-badge">${placementCount} Placement${placementCount > 1 ? "s" : ""} Total</span>
          <div class="dps-footer-total-val font-mono color-glow-purple">${formatFullDPS(breakdown.dps)} <span class="dps-footer-unit">${breakdown.unitLabel}</span></div>
        </div>
      </div>
    </div>
  `;

  if (summonsPanel) {
    const mobileTabs = document.createElement("div");
    mobileTabs.className = "dps-modal-mobile-tabs";
    mobileTabs.innerHTML = `
      <button type="button" class="dps-modal-mtab active" data-tab="main">Unit Breakdown</button>
      <button type="button" class="dps-modal-mtab" data-tab="summons">Summons</button>
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

  mainPanel.querySelector(".dps-modal-close-btn").addEventListener("click", close);

  backdrop.appendChild(container);
  document.body.appendChild(backdrop);

  backdrop.querySelectorAll(".dps-passive-toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const box = btn.closest(".dps-relic-passive-container");
      const desc = box.querySelector(".dps-relic-passive-desc");
      const name = box.querySelector(".dps-passive-name-text")?.textContent || "Passive";
      const descHtml = desc.innerHTML;

      if (window.innerWidth <= 850) {
        openRelicPassiveModal(name, descHtml);
      } else {
        const arrow = btn.querySelector(".dps-passive-toggle-arrow");
        const isCollapsed = desc.classList.toggle("hidden");
        arrow.classList.toggle("rotated", !isCollapsed);
      }
    });
  });
}

function getDarkMageLabel(mode) {
  if (mode === "both") return "Attack + Lightning";
  if (mode === "normal") return "Attack Only";
  return "Lightning Only (0.5x/s)";
}

export async function DpsCard(unit, options = {}) {
  const card = document.createElement("div");
  card.className = "dps-calculator-card glass-card";

  let shinigamiPassiveActive = unit.simulateShinigamiPassive !== undefined ? !!unit.simulateShinigamiPassive : true;
  unit.simulateShinigamiPassive = shinigamiPassiveActive;

  const isDarkMage = unit.id === "darkmagesovereign" || (unit.name && unit.name.includes("Dark Mage"));
  const isLadyGiant = unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant"));
  const isEighthSword = unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword"));
  const isCrow = unit.id === "crowblackfire" || (unit.name && unit.name.includes("Crow"));
  const isCrimson = unit.id === "crimsonbrother" || (unit.name && unit.name.includes("Crimson"));
  const isCursedImmortal = unit.id === "cursedimmortalblacksun" || (unit.name && unit.name.includes("Cursed Immortal"));
  const isVegetable = unit.id === "vegetableprince" || (unit.name && unit.name.includes("Vegetable"));
  const isBioinsect = unit.id === "bioinsectfinal" || !!unit.isBioinsectUnit;
  const isCarrot = unit.id === "carrotunleashed" || (unit.name && unit.name.includes("Carrot"));
  const isProdigy = unit.id === "prodigyrage" || (unit.name && unit.name.includes("Prodigy"));

  let darkMageMode = unit.darkMageMode || "lightning";
  let giantForm = unit.giantForm !== undefined ? unit.giantForm : false;
  let berserkState = unit.berserkState !== undefined ? unit.berserkState : false;
  let demonicPresence = unit.demonicPresence !== undefined ? unit.demonicPresence : false;
  let crowEnemiesHit = unit.crowEnemiesHit !== undefined ? unit.crowEnemiesHit : 5;
  let royalRivalry = isVegetable ? (unit.royalRivalry !== undefined ? !!unit.royalRivalry : true) : false;
  let awakenedPride = isVegetable ? (unit.awakenedPride !== undefined ? !!unit.awakenedPride : true) : false;
  let carrotTransformation = isCarrot ? (unit.carrotTransformation !== undefined ? !!unit.carrotTransformation : true) : false;
  let carrotInstantRelocation = isCarrot ? (unit.carrotInstantRelocation !== undefined ? !!unit.carrotInstantRelocation : true) : false;
  let isCompMode = options.isCompMode !== undefined ? !!options.isCompMode : (unit.isCompMode !== undefined ? !!unit.isCompMode : false);

  let bioinsectForm = isBioinsect ? (unit.bioinsectForm || "semiperfect") : "semiperfect";
  let bioinsectResetStacks = isBioinsect ? Math.max(0, Math.min(15, parseInt(unit.bioinsectResetStacks || 0, 10) || 0)) : 0;
  let bioinsectCopiedUnitId = isBioinsect ? (unit.bioinsectCopiedUnitId || "puppet") : "";

  if (isBioinsect && !unit.bioinsectCopiedUnitId) {
    unit.bioinsectCopiedUnitId = "puppet";
  }

  let prodigyRageUnleashed = isProdigy ? (unit.prodigyRageUnleashed !== undefined ? !!unit.prodigyRageUnleashed : true) : false;
  let prodigyFatherAndSonActive = isProdigy ? (unit.prodigyFatherAndSonActive !== undefined ? !!unit.prodigyFatherAndSonActive : false) : false;
  let prodigyStatusEffects = isProdigy ? Math.max(0, Math.min(10, parseInt(unit.prodigyStatusEffects || 0, 10) || 0)) : 0;

  if (isCrow && unit.crowEnemiesHit === undefined) unit.crowEnemiesHit = 5;
  if (isVegetable && unit.awakenedPride === undefined) unit.awakenedPride = true;
  if (isCarrot && unit.carrotTransformation === undefined) unit.carrotTransformation = true;
  if (isProdigy && unit.prodigyRageUnleashed === undefined) unit.prodigyRageUnleashed = true;

  if (isProdigy) {
    unit.prodigyRageUnleashed = prodigyRageUnleashed;
    unit.prodigyFatherAndSonActive = prodigyFatherAndSonActive;
    unit.prodigyStatusEffects = prodigyStatusEffects;
  }
  if (isBioinsect) {
    unit.bioinsectForm = bioinsectForm;
    unit.bioinsectResetStacks = bioinsectResetStacks;
    unit.bioinsectCopiedUnitId = bioinsectCopiedUnitId;
  }

  let crimsonAbilityActive = unit.crimsonAbilityActive !== undefined ? unit.crimsonAbilityActive : false;
  let crimsonPoolCount = unit.crimsonPoolCount !== undefined ? Math.max(0, Math.min(3, parseInt(unit.crimsonPoolCount, 10) || 0)) : 3;
  let coldState = isCursedImmortal ? !!unit.coldState : false;
  let caringState = isCursedImmortal ? !coldState : false;
  if (isCursedImmortal) {
    unit.coldState = coldState;
    unit.caringState = caringState;
  }

  const relicsList = getUnitRelicList(unit);
  const hasMemoryPendant = relicsList.some(r => r.name === "Memory Pendant");
  const caringVal = hasMemoryPendant ? 75 : 50;
  const coldVal = hasMemoryPendant ? 150 : 125;

  const mode = options.mode || "dps";
  const rank = options.rank || null;
  const isCursedStudent = unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student"));
  const fuaDamages = unit.fuaDamages || [0, 0, 0];
  unit.fuaDamages = fuaDamages;

  const baseStats = unit.stats || {};
  const elementClass = (baseStats.element || "neutral").toLowerCase();
  const archetypeClass = (baseStats.archetype || "physical").toLowerCase();
  const hasAscend = unit.ascend === true || unit.ascend === 3 || unit.ascend === "3";

  const elIcon = ELEMENT_ICONS[elementClass] ? iconImg(ELEMENT_ICONS[elementClass], baseStats.element) : "";
  const archIcon = ARCHETYPE_ICONS[archetypeClass] ? iconImg(ARCHETYPE_ICONS[archetypeClass], baseStats.archetype) : "";

  card.innerHTML = `
    <!-- Top Portrait Media Banner -->
    <div class="dps-card-media">
      <img class="dps-card-portrait-full" src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" onerror="this.src='assets/placeholder.svg'" />
      
      ${rank ? `<div class="dps-rank-badge ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other'}">#${rank}</div>` : ""}

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

    <!-- Optimization Container & Toggles Drawer -->
    <div class="dps-optimized-container">
      <div class="dps-options-bar">
        ${isCrow ? `
          <div class="dps-control-stepper">
            <span class="dps-stepper-lbl">Enemies:</span>
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="dps-stepper-input" id="crow-enemies-${unit.id}" value="${crowEnemiesHit}" />
          </div>
        ` : ""}
        ${isDarkMage ? `
          <button type="button" class="dps-toggle-pill active" id="darkmage-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            ${getDarkMageLabel(darkMageMode)}
          </button>
        ` : ""}
        ${isLadyGiant ? `
          <button type="button" class="dps-toggle-pill ${giantForm ? 'active' : ''}" id="giantform-toggle-${unit.id}" aria-pressed="${giantForm}">
            <span class="dps-pill-dot"></span>
            Giant Form: ${giantForm ? "On" : "Off"}
          </button>
        ` : ""}
        ${isEighthSword ? `
          <button type="button" class="dps-toggle-pill ${demonicPresence ? 'active' : ''}" id="demonic-toggle-${unit.id}" aria-pressed="${demonicPresence}">
            <span class="dps-pill-dot"></span>
            Demonic: ${demonicPresence ? "On (15%/s)" : "Off"}
          </button>
          <button type="button" class="dps-toggle-pill ${berserkState ? 'active' : ''}" id="berserk-toggle-${unit.id}" aria-pressed="${berserkState}">
            <span class="dps-pill-dot"></span>
            Berserk: ${berserkState ? "On" : "Off"}
          </button>
        ` : ""}
        ${isCursedStudent ? `
          <div class="dps-fua-toggle-wrapper">
            <button type="button" class="dps-toggle-pill dps-fua-toggle" aria-expanded="false">
              <span class="dps-fua-label">FUA:</span>
              <span class="dps-fua-summary font-mono">${fuaDamages.map(formatCompactNumber).join(" / ")}</span>
            </button>
          </div>
        ` : ""}
        ${isCrimson ? `
          <button type="button" class="dps-toggle-pill ${crimsonAbilityActive ? 'active' : ''}" id="crimson-ability-toggle-${unit.id}" aria-pressed="${crimsonAbilityActive}">
            <span class="dps-pill-dot"></span>
            Piercing: ${crimsonAbilityActive ? "On" : "Off"}
          </button>
          <button type="button" class="dps-toggle-pill active" id="crimson-pool-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Pools: ${crimsonPoolCount}/3
          </button>
        ` : ""}
        ${isCursedImmortal ? `
          <button type="button" class="dps-toggle-pill ${caringState ? 'active' : ''}" id="caring-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Caring (${caringVal}%)
          </button>
          <button type="button" class="dps-toggle-pill ${coldState ? 'active' : ''}" id="cold-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Cold (${coldVal}%)
          </button>
        ` : ""}
        ${isVegetable ? `
          <button type="button" class="dps-toggle-pill ${royalRivalry ? 'active' : ''}" id="royal-rivalry-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Rivalry: ${royalRivalry ? "On" : "Off"}
          </button>
          <button type="button" class="dps-toggle-pill ${awakenedPride ? 'active' : ''}" id="awakened-pride-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Pride: ${awakenedPride ? "On" : "Off"}
          </button>
        ` : ""}
        ${isCarrot ? `
          <button type="button" class="dps-toggle-pill ${carrotTransformation ? 'active' : ''}" id="carrot-transform-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Transform
          </button>
          <button type="button" class="dps-toggle-pill ${carrotInstantRelocation ? 'active' : ''}" id="carrot-relocation-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Relocation (+50%)
          </button>
        ` : ""}
        ${isProdigy ? `
          <div class="dps-prodigy-controls-stack">
            <div class="dps-prodigy-row">
              <button type="button" class="dps-toggle-pill ${prodigyRageUnleashed ? 'active' : ''}" id="prodigy-rage-toggle-${unit.id}">
                <span class="dps-pill-dot"></span>
                Rage (+25%)
              </button>
              <button type="button" class="dps-toggle-pill ${prodigyFatherAndSonActive ? 'active' : ''}" id="prodigy-fatherson-toggle-${unit.id}">
                <span class="dps-pill-dot"></span>
                Father & Son
              </button>
            </div>
            <div class="dps-prodigy-row">
              <div class="dps-control-stepper">
                <span class="dps-stepper-lbl">Status:</span>
                <span id="prodigy-status-badge-${unit.id}" class="dps-stepper-sub color-buff font-mono">(+${prodigyStatusEffects * 10}%)</span>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="prodigy-status-input-${unit.id}" value="${prodigyStatusEffects}" class="dps-stepper-input" />
              </div>
              <button type="button" class="dps-toggle-pill ${shinigamiPassiveActive ? 'active' : ''}" id="shinigami-toggle-${unit.id}">
                <span class="dps-pill-dot"></span>
                Shinigami (1.15x)
              </button>
            </div>
          </div>
        ` : isBioinsect ? `
          <div class="dps-prodigy-controls-stack">
            <div class="dps-prodigy-row">
              <select class="dps-bioinsect-unit-select" id="bioinsect-unit-select-${unit.id}">
                <option value="">— Select Copied Unit —</option>
              </select>
              <div class="dps-control-stepper">
                <span class="dps-stepper-lbl">Bio Reset:</span>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="bioinsect-reset-input-${unit.id}" value="${bioinsectResetStacks}" class="dps-stepper-input" />
              </div>
            </div>
            <div class="dps-prodigy-row">
              <button type="button" class="dps-toggle-pill ${bioinsectForm !== 'imperfect' ? 'active' : ''}" id="bioinsect-form-toggle-${unit.id}">
                <span class="dps-pill-dot"></span>
                Form: ${bioinsectForm.charAt(0).toUpperCase() + bioinsectForm.slice(1)}
              </button>
              <button type="button" class="dps-toggle-pill ${shinigamiPassiveActive ? 'active' : ''}" id="shinigami-toggle-${unit.id}">
                <span class="dps-pill-dot"></span>
                Shinigami (1.15x)
              </button>
            </div>
          </div>
        ` : `
          <button type="button" class="dps-toggle-pill ${shinigamiPassiveActive ? 'active' : ''}" id="shinigami-toggle-${unit.id}">
            <span class="dps-pill-dot"></span>
            Shinigami: ${shinigamiPassiveActive ? "On (1.15x)" : "Off"}
          </button>
        `}
      </div>

      <!-- Trait Leaderboard Stack -->
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
  const shinigamiToggle = card.querySelector(`#shinigami-toggle-${unit.id}`);
  const fuaToggle = card.querySelector(".dps-fua-toggle");
  const fuaToggleWrapper = card.querySelector(".dps-fua-toggle-wrapper");
  const crowEnemiesInput = card.querySelector(`#crow-enemies-${unit.id}`);
  const crimsonAbilityToggle = card.querySelector(`#crimson-ability-toggle-${unit.id}`);
  const crimsonPoolToggle = card.querySelector(`#crimson-pool-toggle-${unit.id}`);
  const caringToggle = card.querySelector(`#caring-toggle-${unit.id}`);
  const coldToggle = card.querySelector(`#cold-toggle-${unit.id}`);
  const royalRivalryToggle = card.querySelector(`#royal-rivalry-toggle-${unit.id}`);
  const awakenedPrideToggle = card.querySelector(`#awakened-pride-toggle-${unit.id}`);
  const carrotTransformToggle = card.querySelector(`#carrot-transform-toggle-${unit.id}`);
  const carrotRelocationToggle = card.querySelector(`#carrot-relocation-toggle-${unit.id}`);
  const prodigyRageToggle = card.querySelector(`#prodigy-rage-toggle-${unit.id}`);
  const prodigyFatherSonToggle = card.querySelector(`#prodigy-fatherson-toggle-${unit.id}`);
  const prodigyStatusInput = card.querySelector(`#prodigy-status-input-${unit.id}`);
  const bioinsectUnitSelect = card.querySelector(`#bioinsect-unit-select-${unit.id}`);
  const bioinsectFormToggle = card.querySelector(`#bioinsect-form-toggle-${unit.id}`);
  const bioinsectResetInput = card.querySelector(`#bioinsect-reset-input-${unit.id}`);
  let fuaEditor = null;

  const commitCrowEnemies = () => {
    if (!crowEnemiesInput) return;
    crowEnemiesInput.value = crowEnemiesInput.value.replace(/[^\d]/g, "");
    const val = Math.max(1, parseInt(crowEnemiesInput.value || "1", 10) || 1);
    crowEnemiesInput.value = String(val);
    if (crowEnemiesHit !== val) {
      crowEnemiesHit = val;
      unit.crowEnemiesHit = crowEnemiesHit;
      saveUnitSetting(unit.id, "crowEnemiesHit", crowEnemiesHit);
      window.dispatchEvent(new CustomEvent("dps-value-changed"));
      renderCalculations();
    }
  };

  crowEnemiesInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitCrowEnemies();
      crowEnemiesInput.blur();
    }
  });

  crowEnemiesInput?.addEventListener("change", commitCrowEnemies);

  demonicToggle?.addEventListener("click", () => {
    demonicPresence = !demonicPresence;
    unit.demonicPresence = demonicPresence;
    saveUnitSetting(unit.id, "demonicPresence", demonicPresence);
    demonicToggle.classList.toggle("active", demonicPresence);
    demonicToggle.innerHTML = `<span class="dps-pill-dot"></span>Demonic: ${demonicPresence ? "On (15%/s)" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  berserkToggle?.addEventListener("click", () => {
    berserkState = !berserkState;
    unit.berserkState = berserkState;
    saveUnitSetting(unit.id, "berserkState", berserkState);
    berserkToggle.classList.toggle("active", berserkState);
    berserkToggle.innerHTML = `<span class="dps-pill-dot"></span>Berserk: ${berserkState ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  giantFormToggle?.addEventListener("click", () => {
    giantForm = !giantForm;
    unit.giantForm = giantForm;
    saveUnitSetting(unit.id, "giantForm", giantForm);
    giantFormToggle.classList.toggle("active", giantForm);
    giantFormToggle.innerHTML = `<span class="dps-pill-dot"></span>Giant Form: ${giantForm ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  darkMageToggle?.addEventListener("click", () => {
    if (darkMageMode === "lightning") darkMageMode = "both";
    else if (darkMageMode === "both") darkMageMode = "normal";
    else darkMageMode = "lightning";

    unit.darkMageMode = darkMageMode;
    saveUnitSetting(unit.id, "darkMageMode", darkMageMode);
    darkMageToggle.innerHTML = `<span class="dps-pill-dot"></span>${getDarkMageLabel(darkMageMode)}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  shinigamiToggle?.addEventListener("click", () => {
    shinigamiPassiveActive = !shinigamiPassiveActive;
    unit.simulateShinigamiPassive = shinigamiPassiveActive;
    saveUnitSetting(unit.id, "simulateShinigamiPassive", shinigamiPassiveActive);
    shinigamiToggle.classList.toggle("active", shinigamiPassiveActive);
    shinigamiToggle.innerHTML = `<span class="dps-pill-dot"></span>Shinigami: ${shinigamiPassiveActive ? "On (1.15x)" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  crimsonAbilityToggle?.addEventListener("click", () => {
    crimsonAbilityActive = !crimsonAbilityActive;
    unit.crimsonAbilityActive = crimsonAbilityActive;
    saveUnitSetting(unit.id, "crimsonAbilityActive", crimsonAbilityActive);
    crimsonAbilityToggle.classList.toggle("active", crimsonAbilityActive);
    crimsonAbilityToggle.innerHTML = `<span class="dps-pill-dot"></span>Piercing: ${crimsonAbilityActive ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  caringToggle?.addEventListener("click", () => {
    if (caringState) return;
    caringState = true;
    coldState = false;
    unit.caringState = true;
    unit.coldState = false;
    saveUnitSetting(unit.id, "caringState", true);
    saveUnitSetting(unit.id, "coldState", false);

    caringToggle.classList.add("active");
    if (coldToggle) coldToggle.classList.remove("active");

    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  coldToggle?.addEventListener("click", () => {
    if (coldState) return;
    coldState = true;
    caringState = false;
    unit.coldState = true;
    unit.caringState = false;
    saveUnitSetting(unit.id, "coldState", true);
    saveUnitSetting(unit.id, "caringState", false);

    coldToggle.classList.add("active");
    if (caringToggle) caringToggle.classList.remove("active");

    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  royalRivalryToggle?.addEventListener("click", () => {
    royalRivalry = !royalRivalry;
    unit.royalRivalry = royalRivalry;
    saveUnitSetting(unit.id, "royalRivalry", royalRivalry);
    royalRivalryToggle.classList.toggle("active", royalRivalry);
    royalRivalryToggle.innerHTML = `<span class="dps-pill-dot"></span>Rivalry: ${royalRivalry ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  awakenedPrideToggle?.addEventListener("click", () => {
    awakenedPride = !awakenedPride;
    unit.awakenedPride = awakenedPride;
    saveUnitSetting(unit.id, "awakenedPride", awakenedPride);
    awakenedPrideToggle.classList.toggle("active", awakenedPride);
    awakenedPrideToggle.innerHTML = `<span class="dps-pill-dot"></span>Pride: ${awakenedPride ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  carrotTransformToggle?.addEventListener("click", () => {
    carrotTransformation = !carrotTransformation;
    unit.carrotTransformation = carrotTransformation;
    saveUnitSetting(unit.id, "carrotTransformation", carrotTransformation);
    carrotTransformToggle.classList.toggle("active", carrotTransformation);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  carrotRelocationToggle?.addEventListener("click", () => {
    carrotInstantRelocation = !carrotInstantRelocation;
    unit.carrotInstantRelocation = carrotInstantRelocation;
    saveUnitSetting(unit.id, "carrotInstantRelocation", carrotInstantRelocation);
    carrotRelocationToggle.classList.toggle("active", carrotInstantRelocation);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  prodigyRageToggle?.addEventListener("click", () => {
    prodigyRageUnleashed = !prodigyRageUnleashed;
    unit.prodigyRageUnleashed = prodigyRageUnleashed;
    saveUnitSetting(unit.id, "prodigyRageUnleashed", prodigyRageUnleashed);
    prodigyRageToggle.classList.toggle("active", prodigyRageUnleashed);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  prodigyFatherSonToggle?.addEventListener("click", () => {
    prodigyFatherAndSonActive = !prodigyFatherAndSonActive;
    unit.prodigyFatherAndSonActive = prodigyFatherAndSonActive;
    saveUnitSetting(unit.id, "prodigyFatherAndSonActive", prodigyFatherAndSonActive);
    prodigyFatherSonToggle.classList.toggle("active", prodigyFatherAndSonActive);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  const prodigyStatusBadge = card.querySelector(`#prodigy-status-badge-${unit.id}`);

  const commitProdigyStatus = () => {
    if (!prodigyStatusInput) return;
    prodigyStatusInput.value = prodigyStatusInput.value.replace(/[^\d]/g, "");
    const val = Math.max(0, Math.min(10, parseInt(prodigyStatusInput.value || "0", 10) || 0));
    prodigyStatusInput.value = String(val);
    if (prodigyStatusBadge) {
      prodigyStatusBadge.textContent = `(+${val * 10}%)`;
    }
    if (prodigyStatusEffects !== val) {
      prodigyStatusEffects = val;
      unit.prodigyStatusEffects = prodigyStatusEffects;
      saveUnitSetting(unit.id, "prodigyStatusEffects", prodigyStatusEffects);
      window.dispatchEvent(new CustomEvent("dps-value-changed"));
      renderCalculations();
    }
  };

  prodigyStatusInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitProdigyStatus();
      prodigyStatusInput.blur();
    }
  });

  prodigyStatusInput?.addEventListener("change", commitProdigyStatus);

  crimsonPoolToggle?.addEventListener("click", () => {
    crimsonPoolCount = (crimsonPoolCount + 1) % 4;
    unit.crimsonPoolCount = crimsonPoolCount;
    saveUnitSetting(unit.id, "crimsonPoolCount", crimsonPoolCount);
    crimsonPoolToggle.innerHTML = `<span class="dps-pill-dot"></span>Pools: ${crimsonPoolCount}/3`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  if (isBioinsect && bioinsectUnitSelect) {
    import("../../data/units.js").then(({ units: allUnitsForSelect }) => {
      allUnitsForSelect
        .filter(u => u.id !== unit.id)
        .forEach(u => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.textContent = u.name;
          if (u.id === bioinsectCopiedUnitId) opt.selected = true;
          bioinsectUnitSelect.appendChild(opt);
        });
      const newId = bioinsectUnitSelect.value || "puppet";
      if (unit.bioinsectCopiedUnitId !== newId) {
        unit.bioinsectCopiedUnitId = newId;
        bioinsectCopiedUnitId = newId;
        saveUnitSetting(unit.id, "bioinsectCopiedUnitId", bioinsectCopiedUnitId);
        window.dispatchEvent(new CustomEvent("dps-value-changed"));
        renderCalculations();
      }
    });

    bioinsectUnitSelect.addEventListener("change", () => {
      bioinsectCopiedUnitId = bioinsectUnitSelect.value;
      unit.bioinsectCopiedUnitId = bioinsectCopiedUnitId;
      saveUnitSetting(unit.id, "bioinsectCopiedUnitId", bioinsectCopiedUnitId);
      window.dispatchEvent(new CustomEvent("dps-value-changed"));
      renderCalculations();
    });
  }

  const BIOINSECT_FORMS = ["imperfect", "semiperfect", "perfect"];
  bioinsectFormToggle?.addEventListener("click", () => {
    const idx = (BIOINSECT_FORMS.indexOf(bioinsectForm) + 1) % BIOINSECT_FORMS.length;
    bioinsectForm = BIOINSECT_FORMS[idx];
    unit.bioinsectForm = bioinsectForm;
    saveUnitSetting(unit.id, "bioinsectForm", bioinsectForm);
    const label = bioinsectForm.charAt(0).toUpperCase() + bioinsectForm.slice(1);
    bioinsectFormToggle.innerHTML = `<span class="dps-pill-dot"></span>Form: ${label}`;
    bioinsectFormToggle.classList.toggle("active", bioinsectForm !== "imperfect");
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  bioinsectResetInput?.addEventListener("input", () => {
    bioinsectResetInput.value = bioinsectResetInput.value.replace(/[^\d]/g, "");
    bioinsectResetStacks = Math.max(0, parseInt(bioinsectResetInput.value || "0", 10) || 0);
    unit.bioinsectResetStacks = bioinsectResetStacks;
    saveUnitSetting(unit.id, "bioinsectResetStacks", bioinsectResetStacks);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  bioinsectResetInput?.addEventListener("change", () => {
    bioinsectResetInput.value = String(bioinsectResetStacks);
  });

  bioinsectResetInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); bioinsectResetInput.blur(); }
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
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
  }

  function openFuaEditor() {
    if (!fuaToggle || !fuaToggleWrapper) return;
    if (fuaEditor) {
      closeFuaEditor();
      return;
    }

    fuaEditor = document.createElement("div");
    fuaEditor.className = "dps-fua-editor";
    fuaEditor.innerHTML = `
      <div class="dps-fua-editor-title">Follow-Up Attack Damage</div>
      <div class="dps-fua-editor-grid">
        ${fuaDamages.map((value, index) => `
          <label class="dps-fua-editor-field">
            <span>Hit ${index + 1}</span>
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="dps-fua-editor-input" data-fua-index="${index}" value="${value || ""}" placeholder="0" />
          </label>
        `).join("")}
      </div>
      <div class="dps-fua-editor-note">Unbound uses Hit 1 only</div>
    `;

    fuaToggleWrapper.appendChild(fuaEditor);
    fuaToggle.setAttribute("aria-expanded", "true");

    fuaEditor.querySelectorAll(".dps-fua-editor-input").forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d]/g, "");
        const idx = Number(input.dataset.fuaIndex);
        fuaDamages[idx] = Math.max(0, Number(input.value) || 0);
        unit.fuaDamages = fuaDamages;
        saveUnitSetting(unit.id, "fuaDamages", fuaDamages);
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
      document.removeEventListener("keydown", handleKeydown);
    };

    const handleKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeydown);

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
      <div class="dps-modal-unit-standalone">
        <img class="dps-modal-unit-img-only" src="${toAbsoluteUrl(unit.image || "assets/placeholder.svg")}" alt="${unit.name}" onerror="this.src='assets/placeholder.svg'" />
      </div>

      <div class="dps-leaderboard-side">
        <div class="dps-leaderboard-header">
          <div class="dps-leaderboard-header-title">
            <div class="dps-modal-unit-row">
              <span class="dps-lh-main">${unit.name}</span>
              <span class="dps-modal-trait-badge">
                <img src="${toAbsoluteUrl(traitIconSrc)}" alt="" onerror="this.style.display='none'" />
                ${traitDef.name}
              </span>
            </div>
            <span class="dps-lh-sub">${builds.length} Relic Loadout Simulations Tested</span>
          </div>
          <button type="button" class="dps-builds-modal-close" aria-label="Close modal">&times;</button>
        </div>

        <div class="dps-builds-table-header">
          <span>Rank</span>
          <span>Loadout</span>
          <span class="col-right">${mode === "dmg" ? "DMG" : "DPS"}</span>
          <span class="col-right">Diff</span>
          <span></span>
        </div>

        <div class="dps-leaderboard-list">
          ${builds.map((build, index) => {
      const rankIdx = index + 1;
      const rankClass = rankIdx === 1 ? "rank-gold" : (rankIdx === 2 ? "rank-silver" : (rankIdx === 3 ? "rank-bronze" : ""));
      const buildVal = build.breakdown.displayVal;
      const diffPercent = topVal > 0 ? ((buildVal - topVal) / topVal) * 100 : 0;
      const diffDisplay = index === 0 ? `<span class="diff-best">BEST</span>` : `<span class="diff-loss">${diffPercent.toFixed(1)}%</span>`;

      return `
              <div class="dps-table-build-row ${rankClass}" data-build-index="${index}">
                <div class="row-rank-col">
                  <span class="rank-badge-text">#${rankIdx}</span>
                </div>
                <div class="row-relics-col">
                  <div class="dps-loadout-icons-col">${buildLoadoutIcons(build)}</div>
                </div>
                <div class="row-dps-col">
                  <span class="row-dps-val font-mono">${build.breakdown.formattedVal}</span>
                </div>
                <div class="row-diff-col font-mono">${diffDisplay}</div>
                <div class="row-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
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
        crowEnemiesHit,
        caringState,
        coldState,
        fuaDamages: getFuaDamagesForTrait(traitKey),
        mode,
        isCompMode,
        royalRivalry,
        awakenedPride,
        carrotTransformation,
        carrotInstantRelocation,
        prodigyRageUnleashed,
        prodigyFatherAndSonActive,
        prodigyStatusEffects,
        crimsonAbilityActive,
        crimsonPoolCount,
        bioinsectForm,
        bioinsectResetStacks,
        bioinsectCopiedUnitId,
      });
      return { traitKey, ...result };
    }).sort((a, b) => (Number(b.breakdown.displayVal) || 0) - (Number(a.breakdown.displayVal) || 0));

    sortedTraits.forEach(({ traitKey, breakdown, builds }) => {
      const traitDef = TRAIT_DEFINITIONS[traitKey];
      const row = document.createElement("div");
      row.className = "dps-trait-row";
      const topBuild = builds[0];

      const traitDefMatch = allTraitsCatalog.find(t => t.name.toLowerCase() === traitDef.id.toLowerCase());
      const traitIconSrc = traitDefMatch?.image || `icons/traits/${traitDef.name}.png`;

      row.innerHTML = `
        <div class="dps-trait-row-summary">
          <div class="dps-trait-header-left">
            <div class="dps-trait-icon-container" title="${traitDef.name}">
              <img class="dps-trait-icon" src="${toAbsoluteUrl(traitIconSrc)}" alt="${traitDef.name}" onerror="this.style.display='none'" />
            </div>
            <div class="dps-loadout-icons-col">${buildLoadoutIcons(topBuild)}</div>
          </div>

          <div class="dps-trait-header-right">
            <div class="dps-result-stack">
              <span class="dps-result-value font-mono">${breakdown.formattedVal}</span>
              <span class="dps-result-unit-label font-mono">${breakdown.unitLabel}</span>
            </div>
            <div class="dps-row-actions">
              <button type="button" class="dps-action-btn dps-btn-builds" aria-label="View ${traitDef.name} relic builds">
                Builds
              </button>
              <button type="button" class="dps-action-btn dps-btn-breakdown" aria-label="Open ${traitDef.name} math breakdown">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      row.querySelector(".dps-btn-builds").addEventListener("click", () => {
        openTraitBuildsModal(traitDef, builds);
      });
      row.querySelector(".dps-btn-breakdown").addEventListener("click", () => {
        openBreakdownModal(unit, traitDef.name, topBuild.breakdown, topBuild.equips, topBuild.unitRelic);
      });

      traitStack.appendChild(row);
    });
  }

  renderCalculations();

  return card;
}