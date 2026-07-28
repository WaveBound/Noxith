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
  const simulateShinigamiPassive = options.simulateShinigamiPassive !== undefined
    ? options.simulateShinigamiPassive
    : !!unit.simulateShinigamiPassive;
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
      crowEnemiesHit: options.crowEnemiesHit !== undefined ? options.crowEnemiesHit : (unit.crowEnemiesHit || 1),
      fuaDamages: options.fuaDamages || unit.fuaDamages || []
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
          <div class="dps-passive-btn-header">
            <span class="dps-relic-passive-glow">Passive:</span> 
            <span class="dps-relic-passive-name">${def.passive.name}</span>
          </div>
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

  const rawBase = breakdown.base || {};
  const hasAscend = breakdown.hasAscend;

  const isUnboundTrait = (traitName || "").toLowerCase().includes("unbound") || (breakdown.trait?.id || "").toLowerCase() === "unbound";
  const placementCount = isUnboundTrait ? 1 : (breakdown.placements || 1);

  // ── 1. DAMAGE MATH ACCUMULATOR & STEP SEQUENCE ──
  const baseDmgLv1 = rawBase.damage || 0;
  const levelMult = breakdown.levelMult || 1;

  const traitDmgBonus = breakdown.trait?.damageBonus || 0;
  const relicDmgBonus = breakdown.relicDamageMult || 0;
  const relicArchetypeDmgBonus = breakdown.relicArchetypeDamageMult || 0;
  const totalPassiveDmgBonus = breakdown.totalPassiveDamageBonus || 0;

  let dmgAccum = baseDmgLv1;
  let dmgRowsHtml = `
    <div class="dps-table-row">
      <span class="dps-table-lbl">Base Hit DMG (Lv. 1)</span>
      <span class="dps-table-val font-mono">${Math.round(baseDmgLv1).toLocaleString()}</span>
    </div>
  `;

  if (levelMult > 1) {
    dmgAccum = Math.round(dmgAccum * levelMult);
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Level 50 Scaling</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${levelMult.toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (traitDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + traitDmgBonus));
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait DMG Multiplier (${breakdown.trait?.name || "Trait"})</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (relicDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicDmgBonus));
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic DMG Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (relicArchetypeDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + relicArchetypeDmgBonus));
    const archLabel = (breakdown.unitArchetype || "Archetype").charAt(0).toUpperCase() + (breakdown.unitArchetype || "Archetype").slice(1);
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic ${archLabel} DMG Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicArchetypeDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  dmgAccum = Math.round(dmgAccum * 1.20);
  dmgRowsHtml += `
    <div class="dps-table-row indented">
      <span class="dps-table-lbl">&mdash; Z Stat Multiplier</span>
      <span class="dps-table-val font-mono"><span class="faint-mult">x1.20</span>${dmgAccum.toLocaleString()}</span>
    </div>
  `;

  if (hasAscend) {
    dmgAccum = Math.round(dmgAccum * 1.15);
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Ascension III Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.15</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  if (totalPassiveDmgBonus > 0) {
    dmgAccum = Math.round(dmgAccum * (1 + totalPassiveDmgBonus));
    const parts = [];
    if (breakdown.shinigamiActive) parts.push("Shinigami +15%");
    if (breakdown.isReaper) parts.push("Adaptation +40%");
    if (breakdown.isEighthSword && breakdown.berserkState) parts.push("Berserk +20%");
    if (breakdown.isLadyGiant && breakdown.giantForm) parts.push("Giant Form +125%");
    const labelText = parts.length > 0 ? parts.join(" + ") : "Passives";
    dmgRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Passives &amp; Buffs (${labelText})</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + totalPassiveDmgBonus).toFixed(2)}</span>${dmgAccum.toLocaleString()}</span>
      </div>
    `;
  }

  // ── 2. CRIT AVERAGING MATH & STEP SEQUENCE ──
  const baseCritChance = rawBase.critChancePercent || 0;
  const traitCritChance = (breakdown.trait?.critChanceBonus || 0) * 100;
  const relicCritChance = (breakdown.relicCritChanceAdd || 0) * 100;
  const passiveCritChance = (breakdown.passiveCritChanceAdd || (breakdown.isReaper ? 0.40 : 0)) * 100;
  const finalCritChancePercent = Math.min(100, Math.round((breakdown.effCritChance || 0) * 100));

  const baseCritDmg = rawBase.critDamagePercent || 100;
  const traitCritDmg = (breakdown.trait?.critDamageBonus || 0) * 100;
  const relicCritDmg = (breakdown.relicCritDamageAdd || 0) * 100;
  const passiveCritDmg = (breakdown.passiveCritDamageAdd || 0) * 100;
  const finalCritDmgPercent = Math.round((breakdown.effCritDamage || 1) * 100);

  const critBonusVal = (breakdown.effCritChance || 0) * (breakdown.effCritDamage || 1);
  const critAvgMult = breakdown.critAvgMult || (1 + critBonusVal);

  let critRowsHtml = `
    <div class="dps-table-row">
      <span class="dps-table-lbl">Base Crit Chance</span>
      <span class="dps-table-val font-mono">${Math.round(baseCritChance)}%</span>
    </div>
  `;
  if (traitCritChance > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait Crit Chance (${breakdown.trait?.name})</span>
        <span class="dps-table-val font-mono">+${Math.round(traitCritChance)}%</span>
      </div>
    `;
  }
  if (relicCritChance > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic Crit Chance</span>
        <span class="dps-table-val font-mono">+${Math.round(relicCritChance)}%</span>
      </div>
    `;
  }
  if (passiveCritChance > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Passive Crit Chance</span>
        <span class="dps-table-val font-mono">+${Math.round(passiveCritChance)}%</span>
      </div>
    `;
  }
  critRowsHtml += `
    <div class="dps-table-row primary" style="margin-bottom: 6px;">
      <span class="dps-table-lbl crit-highlight">Final Crit Rate</span>
      <span class="dps-table-val font-mono crit-highlight">${finalCritChancePercent}%</span>
    </div>

    <div class="dps-table-row">
      <span class="dps-table-lbl">Base Crit DMG</span>
      <span class="dps-table-val font-mono">${Math.round(baseCritDmg)}%</span>
    </div>
  `;
  if (traitCritDmg > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait Crit DMG (${breakdown.trait?.name})</span>
        <span class="dps-table-val font-mono">+${Math.round(traitCritDmg)}%</span>
      </div>
    `;
  }
  if (relicCritDmg > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic Crit DMG</span>
        <span class="dps-table-val font-mono">+${Math.round(relicCritDmg)}%</span>
      </div>
    `;
  }
  if (passiveCritDmg > 0) {
    critRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Passive Crit DMG</span>
        <span class="dps-table-val font-mono">+${Math.round(passiveCritDmg)}%</span>
      </div>
    `;
  }
  critRowsHtml += `
    <div class="dps-table-row primary" style="margin-bottom: 6px;">
      <span class="dps-table-lbl crit-highlight">Final Crit DMG</span>
      <span class="dps-table-val font-mono crit-highlight">${finalCritDmgPercent}%</span>
    </div>

    <div class="dps-table-row divider"></div>
    <div class="dps-table-row indented">
      <span class="dps-table-lbl">&mdash; Crit Bonus (Crit Rate &times; Crit DMG)</span>
      <span class="dps-table-val font-mono">${finalCritChancePercent}% &times; ${finalCritDmgPercent}% = +${(critBonusVal * 100).toFixed(1)}%</span>
    </div>
    <div class="dps-table-row indented">
      <span class="dps-table-lbl">&mdash; Average Hit Multiplier</span>
      <span class="dps-table-val font-mono">1.00 + ${critBonusVal.toFixed(2)} = <span class="faint-mult">x${critAvgMult.toFixed(2)}</span></span>
    </div>
    <div class="dps-table-row primary">
      <span class="dps-table-lbl damage-highlight">Average Hit DMG (${Math.round(breakdown.effDamage).toLocaleString()} &times; ${critAvgMult.toFixed(2)})</span>
      <span class="dps-table-val font-mono damage-highlight">${Math.round(breakdown.avgHitDamage || 0).toLocaleString()}</span>
    </div>
  `;

  // ── 3. SPA MATH ACCUMULATOR & STEP SEQUENCE ──
  const baseSpa = rawBase.spa || 1;
  const traitSpaBonus = breakdown.trait?.spaBonus || 0;
  const relicSpaBonus = breakdown.relicSpaMult || 0;
  let spaAccum = baseSpa;

  let spaRowsHtml = `
    <div class="dps-table-row">
      <span class="dps-table-lbl">Base SPA</span>
      <span class="dps-table-val font-mono">${baseSpa.toFixed(2)}s</span>
    </div>
  `;
  if (traitSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + traitSpaBonus);
    spaRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait SPA Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }
  if (relicSpaBonus !== 0) {
    spaAccum = spaAccum * (1 + relicSpaBonus);
    spaRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic SPA Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicSpaBonus).toFixed(2)}</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }

  spaAccum = spaAccum * 0.85;
  spaRowsHtml += `
    <div class="dps-table-row indented">
      <span class="dps-table-lbl">&mdash; Z Stat SPA Multiplier</span>
      <span class="dps-table-val font-mono"><span class="faint-mult">x0.85</span>${spaAccum.toFixed(2)}s</span>
    </div>
  `;

  if (breakdown.isReaper) {
    spaAccum = spaAccum * 0.90;
    spaRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Critical Tempo Passive (-10% SPA)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  } else if (breakdown.isLadyGiant && breakdown.giantForm) {
    spaAccum = spaAccum * 1.25;
    spaRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Size Control: Giant (+25% SPA time)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.25</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  } else if (breakdown.isEighthSword && breakdown.berserkState) {
    spaAccum = spaAccum * 0.90;
    spaRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; The Nameless Demon (Berserk -10% SPA)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x0.90</span>${spaAccum.toFixed(2)}s</span>
      </div>
    `;
  }

  // ── 4. RANGE MATH ACCUMULATOR & STEP SEQUENCE ──
  const baseRng = rawBase.range || 0;
  const traitRngBonus = breakdown.trait?.rangeBonus || 0;
  const relicRngBonus = breakdown.relicRangeMult || 0;
  let rngAccum = baseRng;

  let rngRowsHtml = `
    <div class="dps-table-row">
      <span class="dps-table-lbl">Base Range</span>
      <span class="dps-table-val font-mono">${baseRng.toFixed(1)}</span>
    </div>
  `;

  if (traitRngBonus > 0) {
    rngAccum = rngAccum * (1 + traitRngBonus);
    rngRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Trait Range Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + traitRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  if (relicRngBonus > 0) {
    rngAccum = rngAccum * (1 + relicRngBonus);
    rngRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Relic Range Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + relicRngBonus).toFixed(2)}</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  rngAccum = rngAccum * 1.15;
  rngRowsHtml += `
    <div class="dps-table-row indented">
      <span class="dps-table-lbl">&mdash; Z Stat Range Multiplier</span>
      <span class="dps-table-val font-mono"><span class="faint-mult">x1.15</span>${rngAccum.toFixed(1)}</span>
    </div>
  `;

  if (hasAscend) {
    rngAccum = rngAccum * 1.05;
    rngRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Ascension III Range Multiplier</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.05</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  if (breakdown.isLadyGiant && breakdown.giantForm) {
    rngAccum = rngAccum * 1.50;
    rngRowsHtml += `
      <div class="dps-table-row indented">
        <span class="dps-table-lbl">&mdash; Size Control: Giant (+50% Range)</span>
        <span class="dps-table-val font-mono"><span class="faint-mult">x1.50</span>${rngAccum.toFixed(1)}</span>
      </div>
    `;
  }

  const activeFuaBreakdowns = (breakdown.fuaBreakdowns || []).filter(entry => (Number(entry.inputDamage) || 0) > 0 || (Number(entry.dps) || 0) > 0);

  const container = document.createElement("div");
  container.className = "dps-modal-container";

  const summonBreakdowns = breakdown.summonBreakdowns || [];

  let summonsPanel = null;
  if (summonBreakdowns.length > 0) {
    summonsPanel = document.createElement("div");
    summonsPanel.className = "dps-panel summons-panel";

    let activeSummonIdx = 0;

    function renderSummonsPanel() {
      const s = summonBreakdowns[activeSummonIdx] || {};
      const hasMultiple = summonBreakdowns.length > 1;
      const scaleMult = breakdown.effDamage > 0 ? (s.effDamage / breakdown.effDamage) : 0;
      const critMult = s.critAvgMult || breakdown.critAvgMult || 1.0;

      // Summon Hit DMG Breakdown
      let intermediateRowsHtml = "";
      if (s.hasOwnUpgrades) {
        let sDmgAccum = s.baseDamage || 0;
        let tRow = "", rRow = "", zRow = "", aRow = "";
        if (s.traitDmgBonus > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + s.traitDmgBonus));
          tRow = `<div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Trait DMG Multiplier</span><span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + s.traitDmgBonus).toFixed(2)}</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.relicTotalDmgMult > 0) {
          sDmgAccum = Math.round(sDmgAccum * (1 + s.relicTotalDmgMult));
          rRow = `<div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Relic DMG Multiplier</span><span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + s.relicTotalDmgMult).toFixed(2)}</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.isZStat) {
          sDmgAccum = Math.round(sDmgAccum * 1.20);
          zRow = `<div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Z Stat Multiplier</span><span class="dps-table-val font-mono"><span class="faint-mult">x1.20</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        if (s.hasAscend) {
          sDmgAccum = Math.round(sDmgAccum * 1.15);
          aRow = `<div class="dps-table-row indented"><span class="dps-table-lbl">&mdash; Ascension III Multiplier</span><span class="dps-table-val font-mono"><span class="faint-mult">x1.15</span>${sDmgAccum.toLocaleString()}</span></div>`;
        }
        intermediateRowsHtml = `${tRow}${rRow}${zRow}${aRow}`;
      } else {
        intermediateRowsHtml = `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Summon Base Scale</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">&times;${scaleMult.toFixed(2)}</span>${Math.round(s.effDamage || 0).toLocaleString()}</span>
          </div>`;
      }

      // ── SUMMON SPA MATH BREAKDOWN STEP SEQUENCE ──
      const sBaseSpa = s.baseSpa || 1;
      let sSpaAccum = sBaseSpa;
      let sSpaRowsHtml = `
        <div class="dps-table-row">
          <span class="dps-table-lbl">Base Summon SPA</span>
          <span class="dps-table-val font-mono">${sBaseSpa.toFixed(2)}s</span>
        </div>
      `;
      if ((s.traitSpaBonus || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + s.traitSpaBonus);
        sSpaRowsHtml += `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Trait SPA Multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + s.traitSpaBonus).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span>
          </div>
        `;
      }
      if ((s.relicSpaMult || 0) !== 0) {
        sSpaAccum = sSpaAccum * (1 + s.relicSpaMult);
        sSpaRowsHtml += `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Relic SPA Multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x${(1 + s.relicSpaMult).toFixed(2)}</span>${sSpaAccum.toFixed(2)}s</span>
          </div>
        `;
      }
      if (s.isZStat) {
        sSpaAccum = sSpaAccum * 0.85;
        sSpaRowsHtml += `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">&mdash; Z Stat SPA Multiplier</span>
            <span class="dps-table-val font-mono"><span class="faint-mult">x0.85</span>${sSpaAccum.toFixed(2)}s</span>
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
        <div class="dps-panel-header">
          <div class="dps-panel-header-text">
            <div class="dps-panel-title color-summons">${s.name || "Summon"} Breakdown</div>
            <div class="dps-panel-sub">Step-by-Step Calculations</div>
          </div>
        </div>
        ${tabBarHtml}
        <div class="dps-panel-body">
          <div class="dps-section section-summons" style="margin-top:0;">
            <div class="dps-section-hd color-summons">1. Base Hit Damage</div>
            <div class="dps-table">
              ${s.hasOwnUpgrades ? `
                <div class="dps-table-row">
                  <span class="dps-table-lbl">Base Max Upgrade DMG (Lv. 1)</span>
                  <span class="dps-table-val font-mono">${Math.round(s.rawMaxDamage || 0).toLocaleString()}</span>
                </div>
                ${s.levelMult > 1 ? `
                  <div class="dps-table-row indented">
                    <span class="dps-table-lbl">&mdash; Level 50 scaling</span>
                    <span class="dps-table-val font-mono"><span class="faint-mult">x${s.levelMult.toFixed(2)}</span>${Math.round(s.baseDamage || 0).toLocaleString()}</span>
                  </div>` : ""}
              ` : `
                <div class="dps-table-row">
                  <span class="dps-table-lbl">Unit Effective DMG (pre-crit)</span>
                  <span class="dps-table-val font-mono">${Math.round(breakdown.effDamage || 0).toLocaleString()}</span>
                </div>
              `}
              ${intermediateRowsHtml}
              <div class="dps-table-row primary">
                <span class="dps-table-lbl summons-highlight">Pre-Crit Base Hit</span>
                <span class="dps-table-val font-mono summons-highlight">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="dps-section section-summons">
            <div class="dps-section-hd color-summons">2. Crit Averaging</div>
            <div class="dps-table">
              <div class="dps-table-row">
                <span class="dps-table-lbl">Base Hit DMG</span>
                <span class="dps-table-val font-mono">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Crit Multiplier</span>
                <span class="dps-table-val font-mono"><span class="faint-mult">x${critMult.toFixed(2)}</span>${Math.round(s.avgHitDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-table-row primary">
                <span class="dps-table-lbl summons-highlight">Avg Hit DMG (with Crit)</span>
                <span class="dps-table-val font-mono summons-highlight">${Math.round(s.avgHitDamage || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="dps-section section-summons">
            <div class="dps-section-hd color-summons">3. Summon SPA Calculations</div>
            <div class="dps-table">
              ${sSpaRowsHtml}
              <div class="dps-table-row primary">
                <span class="dps-table-lbl summons-highlight">Final Summon SPA</span>
                <span class="dps-table-val font-mono summons-highlight">${(s.effSpa || 1).toFixed(2)}s</span>
              </div>
            </div>
          </div>

          <div class="dps-section section-summons">
            <div class="dps-section-hd color-summons">4. Direct Output &amp; DPS</div>
            <div class="dps-table">
              <div class="dps-table-row">
                <span class="dps-table-lbl">Summon Output (${s.activeCount || 1} active)</span>
                <span class="dps-table-val font-mono">${Math.round(s.avgHitDamage || 0).toLocaleString()} &times; ${s.activeCount || 1} = ${Math.round((s.avgHitDamage || 0) * (s.activeCount || 1)).toLocaleString()}</span>
              </div>
              <div class="dps-table-row indented">
                <span class="dps-table-lbl">&mdash; Final Summon SPA</span>
                <span class="dps-table-val font-mono">${(s.effSpa || 1).toFixed(2)}s</span>
              </div>
              <div class="dps-table-row primary">
                <span class="dps-table-lbl summons-highlight">Direct DPS</span>
                <span class="dps-table-val font-mono summons-highlight">+${formatFullDPS(s.directDps)} DPS</span>
              </div>
            </div>
          </div>

          ${(s.dotDps || 0) > 0 ? `
          <div class="dps-section section-summons">
            <div class="dps-section-hd color-summons">5. DoT DPS (${s.dotName || "Bleed"})</div>
            <div class="dps-table">
              <div class="dps-table-row">
                <span class="dps-table-lbl">Summon Base Hit</span>
                <span class="dps-table-val font-mono">${Math.round(s.effDamage || 0).toLocaleString()}</span>
              </div>
              <div class="dps-table-row primary">
                <span class="dps-table-lbl dot-highlight">DoT DPS</span>
                <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(s.dotDps)} DPS</span>
              </div>
            </div>
          </div>` : ""}
        </div>

        <div class="dps-panel-footer summons-footer">
          <div class="dps-summary-block" style="border-color: rgba(45, 212, 191, 0.25); background: rgba(45, 212, 191, 0.05); margin: 0;">
            <div class="dps-table-row">
              <span class="dps-table-lbl color-summons">${s.name || "Summon"} DPS</span>
              <span class="dps-table-val font-mono summons-highlight">${formatFullDPS(s.dps)} DPS</span>
            </div>
            <div class="dps-table-row divider"></div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl combined-highlight">All Summons Total</span>
              <span class="dps-table-val font-mono combined-highlight">${formatFullDPS((breakdown.totalSummonDPS || 0) * placementCount)} DPS</span>
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

  const mainPanel = document.createElement("div");
  mainPanel.className = "dps-panel main-panel mobile-active";

  const blackFireDotDmg = breakdown.isCrow ? Math.round((breakdown.effDamage || 0) * (breakdown.effDotMult || 2.0)) : 0;

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
          ${dmgRowsHtml}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl damage-highlight">Effective Base Hit DMG</span>
            <span class="dps-table-val font-mono damage-highlight">${Math.round(breakdown.effDamage || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="dps-section section-crit">
        <div class="dps-section-hd" style="color: var(--purple-strong);">Crit Averaging &amp; Multipliers</div>
        <div class="dps-table">
          ${critRowsHtml}
        </div>
      </div>

      <div class="dps-section section-spa">
        <div class="dps-section-hd">SPA Calculations</div>
        <div class="dps-table">
          ${spaRowsHtml}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl spa-highlight">${breakdown.isDarkMage && breakdown.darkMageMode === "lightning" ? "Disabled in Lightning Mode" : "Final Effective SPA"}</span>
            <span class="dps-table-val font-mono spa-highlight">${breakdown.isDarkMage && breakdown.darkMageMode === "lightning" ? "1.0s Constant" : (breakdown.effSpa || 1).toFixed(2) + "s"}</span>
          </div>
        </div>
      </div>

      <div class="dps-section section-range">
        <div class="dps-section-hd">Range Calculations</div>
        <div class="dps-table">
          ${rngRowsHtml}
          <div class="dps-table-row primary">
            <span class="dps-table-lbl range-highlight">Final Effective Range</span>
            <span class="dps-table-val font-mono range-highlight">${(breakdown.effRange || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      ${((rawBase.dotMultiplier || 0) > 0 || breakdown.demonicPresence) ? `
      <div class="dps-section section-dot">
        <div class="dps-section-hd color-dot">${breakdown.isDarkMage ? "Passive Damage Calculation" : breakdown.isEighthSword ? "Demonic Presence Calculation" : breakdown.isCrow ? "Black Fire DoT Calculation" : `DoT Calculation (${formatPassiveText(rawBase.dotName || "Status")})`}</div>
        <div class="dps-table">
          <div class="dps-table-row">
            <span class="dps-table-lbl">Effect</span>
            <span class="dps-table-val">${formatPassiveText(rawBase.dotName)}</span>
          </div>
          <div class="dps-table-row">
            <span class="dps-table-lbl">Base Multiplier</span>
            <span class="dps-table-val font-mono">${breakdown.isEighthSword ? "15% Current DMG (Can Crit)" : breakdown.isCrow ? "2.00x Base Hit in 12 ticks over 12s" : (rawBase.dotMultiplier || 0).toFixed(2) + "x Base Hit"}</span>
          </div>
          ${breakdown.isEighthSword ? `
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Base Tick DMG (15% Current DMG)</span>
              <span class="dps-table-val font-mono">${Math.round(breakdown.effDamage * 0.15).toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Avg Tick DMG with Crit (x${(breakdown.critAvgMult || 1).toFixed(2)})</span>
              <span class="dps-table-val font-mono dot-highlight">${Math.round(breakdown.avgHitDamage * 0.15).toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Interval SPA</span>
              <span class="dps-table-val font-mono">1.00s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl dot-highlight">Unit Passive DPS</span>
              <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          ` : breakdown.isCrow ? `
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Total Black Fire DMG per unit</span>
              <span class="dps-table-val font-mono dot-highlight">${blackFireDotDmg.toLocaleString()} DMG</span>
            </div>
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Re-proc Interval SPA</span>
              <span class="dps-table-val font-mono">roundup(12 / ${(breakdown.effSpa || 1).toFixed(2)}s) &times; ${(breakdown.effSpa || 1).toFixed(2)}s = ${(breakdown.dotIntervalSPA || 12).toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl dot-highlight">Unit Black Fire DoT DPS (${blackFireDotDmg.toLocaleString()} &divide; ${(breakdown.dotIntervalSPA || 12).toFixed(2)}s)</span>
              <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          ` : `
            <div class="dps-table-row indented">
              <span class="dps-table-lbl">&mdash; Interval SPA</span>
              <span class="dps-table-val font-mono">${(breakdown.dotIntervalSPA || 1).toFixed(2)}s</span>
            </div>
            <div class="dps-table-row primary">
              <span class="dps-table-lbl dot-highlight">${breakdown.isDarkMage ? "Unit Passive DPS" : "Unit DoT DPS"}</span>
              <span class="dps-table-val font-mono dot-highlight">+${formatFullDPS(breakdown.unitDoTDPS)} DPS</span>
            </div>
          `}
        </div>
      </div>` : ""}

      ${activeFuaBreakdowns.length > 0 ? `
      <div class="dps-section section-damage">
        <div class="dps-section-hd" style="color: ${breakdown.isCrow ? '#e71a10' : 'var(--purple-strong)'};">
          ${breakdown.isCrow ? 'Status Effect Calculations (Illusion)' : 'Follow-Up Attack Calculations (FUA)'}
        </div>
        <div class="dps-table">
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
                <div class="dps-table-row">
                  <span class="dps-table-lbl">Illusion Storing Window / SPA</span>
                  <span class="dps-table-val font-mono">12.0s Storing / ${effSpaVal.toFixed(2)}s SPA</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Attacks in 12s Storing Window</span>
                  <span class="dps-table-val font-mono">roundup(12 / ${effSpaVal.toFixed(2)}s) = ${storingAttacks} attacks</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Stored Direct DMG per unit (incl. Crits)</span>
                  <span class="dps-table-val font-mono">${storingAttacks} &times; ${Math.round(breakdown.avgHitDamage || 0).toLocaleString()} = ${Math.round(directStoredDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Stored Black Fire DoT DMG per unit</span>
                  <span class="dps-table-val font-mono">${Math.round(dotStoredDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Total Stored DMG per unit</span>
                  <span class="dps-table-val font-mono">${Math.round(totalStoredDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Base Explosion Conversion (${Math.round(effectiveness * 100)}%)</span>
                  <span class="dps-table-val font-mono">${Math.round(baseExplosion).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Crit Multiplier</span>
                  <span class="dps-table-val font-mono"><span class="faint-mult">x${critMult.toFixed(2)}</span>${Math.round(singleExplosionWithCrit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Target Scaling (${enemiesHit} enemies hit)</span>
                  <span class="dps-table-val font-mono">${Math.round(singleExplosionWithCrit).toLocaleString()} &times; ${enemiesHit} = ${Math.round(totalExplosionPerUnit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Total Field Explosion (${placementCount} placements)</span>
                  <span class="dps-table-val font-mono">${Math.round(totalExplosionPerUnit).toLocaleString()} &times; ${placementCount} = ${Math.round(fieldExplosionDmg).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Total Cycle Window</span>
                  <span class="dps-table-val font-mono">roundup(22 / ${effSpaVal.toFixed(2)}s) &times; ${effSpaVal.toFixed(2)}s = ${cycleTime.toFixed(1)}s</span>
                </div>
                <div class="dps-table-row primary" style="margin-bottom: 8px;">
                  <span class="dps-table-lbl damage-highlight">Illusion Field DPS (${Math.round(fieldExplosionDmg).toLocaleString()} &divide; ${cycleTime.toFixed(1)}s)</span>
                  <span class="dps-table-val font-mono damage-highlight">+${formatFullDPS(fieldDps)} DPS</span>
                </div>
              `;
    }

    if (entry.isElfSpell) {
      const spellInterval = entry.cycleInterval || (7 * effSpaVal);
      return `
                <div class="dps-table-row">
                  <span class="dps-table-lbl">${formatPassiveText(entry.name)}</span>
                  <span class="dps-table-val font-mono">${Math.round(entry.averageFollowUpHit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Unit Effective Base DMG</span>
                  <span class="dps-table-val font-mono">${Math.round(entry.inputDamage).toLocaleString()}</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Spell Scaling Multiplier</span>
                  <span class="dps-table-val font-mono"><span class="faint-mult">x${entry.finalMult.toFixed(2)}</span>${Math.round(entry.effectiveFollowUpDamage).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Crit Multiplier</span>
                  <span class="dps-table-val font-mono"><span class="faint-mult">x${critMult.toFixed(2)}</span>${Math.round(entry.averageFollowUpHit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Spell Cycle SPA (7 attacks)</span>
                  <span class="dps-table-val font-mono">7 &times; ${effSpaVal.toFixed(2)}s = ${spellInterval.toFixed(2)}s</span>
                </div>
                <div class="dps-table-row primary" style="margin-bottom: 8px;">
                  <span class="dps-table-lbl damage-highlight">${formatPassiveText(entry.name)} DPS</span>
                  <span class="dps-table-val font-mono damage-highlight">+${formatFullDPS(entry.dps)} DPS</span>
                </div>
              `;
    }

    if (entry.isMimicryFua) {
      const fuaInterval = entry.intervalSpa || (3 * effSpaVal);
      return `
                <div class="dps-table-row">
                  <span class="dps-table-lbl">${entry.name}</span>
                  <span class="dps-table-val font-mono">${Math.round(entry.averageFollowUpHit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Copied Unit DMG</span>
                  <span class="dps-table-val font-mono">${Math.round(entry.inputDamage).toLocaleString()}</span>
                </div>
                ${(entry.relicArchetypeDamageMult || 0) > 0 ? `
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Relic Archetype DMG Multiplier</span>
                  <span class="dps-table-val font-mono"><span class="faint-mult">x${entry.fuaDamageScale.toFixed(2)}</span>${Math.round(entry.effectiveFollowUpDamage).toLocaleString()} DMG</span>
                </div>` : ""}
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; + Unit Base Hit DMG</span>
                  <span class="dps-table-val font-mono">+${Math.round(entry.effDamage).toLocaleString()} = ${Math.round(entry.combinedHitDamage).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Crit Multiplier</span>
                  <span class="dps-table-val font-mono"><span class="faint-mult">x${critMult.toFixed(2)}</span>${Math.round(entry.averageFollowUpHit).toLocaleString()} DMG</span>
                </div>
                <div class="dps-table-row indented">
                  <span class="dps-table-lbl">&mdash; Mimicry SPA Interval (3 attacks)</span>
                  <span class="dps-table-val font-mono">3 &times; ${effSpaVal.toFixed(2)}s = ${fuaInterval.toFixed(2)}s</span>
                </div>
                <div class="dps-table-row primary" style="margin-bottom: 8px;">
                  <span class="dps-table-lbl damage-highlight">${entry.name} DPS</span>
                  <span class="dps-table-val font-mono damage-highlight">+${formatFullDPS(entry.dps)} DPS</span>
                </div>
              `;
    }

    return `
              <div class="dps-table-row">
                <span class="dps-table-lbl">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)}</span>
                <span class="dps-table-val font-mono">${formatFullDPS(entry.effectiveFollowUpDamage || entry.inputDamage)}</span>
              </div>
              <div class="dps-table-row primary" style="margin-bottom: 8px;">
                <span class="dps-table-lbl damage-highlight">${formatPassiveText(entry.name || `FUA ${entry.index + 1}`)} DPS</span>
                <span class="dps-table-val font-mono damage-highlight">+${formatFullDPS(entry.dps)} DPS</span>
              </div>
            `;
  }).join("")}
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
            <span class="dps-table-lbl">Unit Direct DPS &times; ${placementCount} placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.unitDirectDPS)} &times; ${placementCount} = ${formatFullDPS((breakdown.unitDirectDPS || 0) * placementCount)} DPS</span>
          </div>
          ${(breakdown.unitDoTDPS || 0) > 0 ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">${breakdown.isDarkMage || breakdown.isEighthSword ? "Passive DPS" : breakdown.isCrow ? "Black Fire DoT" : "DoT DPS"} &times; ${placementCount} placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.unitDoTDPS)} &times; ${placementCount} = ${formatFullDPS((breakdown.unitDoTDPS || 0) * placementCount)} DPS</span>
          </div>` : ""}
          ${(breakdown.singleFuaDps || 0) > 0 ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">${breakdown.isCrow ? "Illusion Status DPS" : "Follow-Up DPS"} &times; ${placementCount} placements</span>
            <span class="dps-table-val font-mono">${formatFullDPS(breakdown.singleFuaDps)} &times; ${placementCount} = ${formatFullDPS((breakdown.totalFuaDps || 0))} DPS</span>
          </div>` : ""}
          ${(breakdown.totalSummonDPS || 0) > 0 ? `
          <div class="dps-table-row indented">
            <span class="dps-table-lbl">Summons Total Field DPS</span>
            <span class="dps-table-val font-mono">+${formatFullDPS((breakdown.totalSummonDPS || 0) * placementCount)} DPS</span>
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

  let shinigamiPassiveActive = !!unit.simulateShinigamiPassive;
  const isDarkMage = unit.id === "darkmagesovereign" || (unit.name && unit.name.includes("Dark Mage"));
  const isLadyGiant = unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant"));
  const isEighthSword = unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword"));
  const isCrow = unit.id === "crowblackfire" || (unit.name && unit.name.includes("Crow"));

  let darkMageMode = unit.darkMageMode || "lightning";
  let giantForm = unit.giantForm !== undefined ? unit.giantForm : false;
  let berserkState = unit.berserkState !== undefined ? unit.berserkState : false;
  let demonicPresence = unit.demonicPresence !== undefined ? unit.demonicPresence : false;
  let crowEnemiesHit = unit.crowEnemiesHit || 1;

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
        ${isCrow ? `
          <div class="dps-crow-target-picker" style="display:inline-flex; align-items:center; gap:4px; margin-right:auto; background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:4px; border:1px solid var(--border);">
            <span style="font-size:7.5px; font-weight:700; color:var(--muted);">Enemies:</span>
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="dps-crow-enemies-input" id="crow-enemies-${unit.id}" value="${crowEnemiesHit}" style="width:28px; height:18px; text-align:center; font-size:9px; font-weight:800; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:3px; color:#fff;" />
          </div>
        ` : ""}
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
          <div class="dps-fua-toggle-wrapper">
            <button type="button" class="dps-fua-toggle" aria-expanded="false">
              <span class="dps-fua-label">FUA</span>
              <span class="dps-fua-summary">${fuaDamages.map(formatCompactNumber).join(" / ")}</span>
            </button>
          </div>
        ` : ""}
        <button type="button" class="dps-shinigami-toggle${shinigamiPassiveActive ? ' active' : ''}" aria-pressed="${shinigamiPassiveActive}">
          Shinigami Passive: ${shinigamiPassiveActive ? "On (1.15x)" : "Off"}
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
  const fuaToggleWrapper = card.querySelector(".dps-fua-toggle-wrapper");
  const crowEnemiesInput = card.querySelector(`#crow-enemies-${unit.id}`);
  let fuaEditor = null;

  const commitCrowEnemies = () => {
    if (!crowEnemiesInput) return;
    crowEnemiesInput.value = crowEnemiesInput.value.replace(/[^\d]/g, "");
    const val = Math.max(1, parseInt(crowEnemiesInput.value || "1", 10) || 1);
    crowEnemiesInput.value = String(val);
    if (crowEnemiesHit !== val) {
      crowEnemiesHit = val;
      unit.crowEnemiesHit = crowEnemiesHit;
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

  crowEnemiesInput?.addEventListener("change", () => {
    commitCrowEnemies();
  });

  demonicToggle?.addEventListener("click", () => {
    demonicPresence = !demonicPresence;
    unit.demonicPresence = demonicPresence;
    demonicToggle.classList.toggle("active", demonicPresence);
    demonicToggle.setAttribute("aria-pressed", String(demonicPresence));
    demonicToggle.textContent = `Demonic Presence: ${demonicPresence ? "On (15%/s)" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  berserkToggle?.addEventListener("click", () => {
    berserkState = !berserkState;
    unit.berserkState = berserkState;
    berserkToggle.classList.toggle("active", berserkState);
    berserkToggle.setAttribute("aria-pressed", String(berserkState));
    berserkToggle.textContent = `Berserk: ${berserkState ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  giantFormToggle?.addEventListener("click", () => {
    giantForm = !giantForm;
    unit.giantForm = giantForm;
    giantFormToggle.classList.toggle("active", giantForm);
    giantFormToggle.setAttribute("aria-pressed", String(giantForm));
    giantFormToggle.textContent = `Giant Form: ${giantForm ? "On" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  darkMageToggle?.addEventListener("click", () => {
    if (darkMageMode === "lightning") darkMageMode = "both";
    else if (darkMageMode === "both") darkMageMode = "normal";
    else darkMageMode = "lightning";

    unit.darkMageMode = darkMageMode;
    darkMageToggle.textContent = getDarkMageLabel(darkMageMode);
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
    renderCalculations();
  });

  shinigamiToggle?.addEventListener("click", () => {
    shinigamiPassiveActive = !shinigamiPassiveActive;
    unit.simulateShinigamiPassive = shinigamiPassiveActive;
    shinigamiToggle.classList.toggle("active", shinigamiPassiveActive);
    shinigamiToggle.setAttribute("aria-pressed", String(shinigamiPassiveActive));
    shinigamiToggle.textContent = `Shinigami Passive: ${shinigamiPassiveActive ? "On (1.15x)" : "Off"}`;
    window.dispatchEvent(new CustomEvent("dps-value-changed"));
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

    fuaToggleWrapper.appendChild(fuaEditor);
    fuaToggle.setAttribute("aria-expanded", "true");

    fuaEditor.querySelectorAll(".dps-fua-editor-input").forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d]/g, "");
        const idx = Number(input.dataset.fuaIndex);
        fuaDamages[idx] = Math.max(0, Number(input.value) || 0);
        unit.fuaDamages = fuaDamages;
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
      const diffPercent = topVal > 0 ? ((buildVal - topVal) / topVal) * 100 : 0;
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
        crowEnemiesHit,
        fuaDamages: getFuaDamagesForTrait(traitKey),
        mode
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