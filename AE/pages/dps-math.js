// Universal DPS Math Module for AE Wiki
import { relicImgByName } from "../icons/icons.js";
import { getRelicStatsByName } from "../data/relicstats.js";

export function parseNumber(val, defaultVal = 0) {
  if (val == null) return defaultVal;
  if (typeof val === "number") return val;
  const str = String(val).trim();
  if (str.includes("~")) {
    const parts = str.split("~").map((p) => p.trim());
    return parseNumber(parts[parts.length - 1], defaultVal);
  }
  const clean = str.replace(/,/g, "").replace(/%/g, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

export function getUnitBaseValues(unit) {
  if (!unit) {
    return { damage: 0, spa: 1, range: 0, critChancePercent: 0, critDamagePercent: 100, dotMultiplier: 0, dotDescription: "", dotName: "DoT", followUpInfo: null };
  }
  let damage = 0;
  let spa = 1;
  let range = 0;

  if (unit.placement && Array.isArray(unit.placement) && unit.placement.length > 0) {
    const maxTier = unit.placement[unit.placement.length - 1];
    damage = parseNumber(maxTier.damage, parseNumber(unit.stats?.damage, 0));
    spa = parseNumber(maxTier.spa, parseNumber(unit.stats?.spa, 1));
    range = parseNumber(maxTier.range, parseNumber(unit.stats?.range, 0));
  } else {
    damage = parseNumber(unit.stats?.damage, 0);
    spa = parseNumber(unit.stats?.spa, 1);
    range = parseNumber(unit.stats?.range, 0);
  }

  if (spa <= 0) spa = 1;

  const critChancePercent = parseNumber(unit.stats?.critChance, 0);
  const critDamagePercent = parseNumber(unit.stats?.critDamage, 100);

  let dotMultiplier = 0;
  let dotDescription = "";
  let dotName = "DoT";
  if (unit.statusEffects && Array.isArray(unit.statusEffects)) {
    unit.statusEffects.forEach((ef) => {
      if (ef.effect) {
        const match = ef.effect.match(/([0-9.]+)\s*x\s*Damage/i);
        if (match) {
          dotMultiplier += parseFloat(match[1]);
          dotDescription = ef.name ? `${ef.name}: ${ef.effect}` : ef.effect;
          dotName = ef.name || "DoT";
        }
      }
    });
  }

  let followUpInfo = null;
  if (unit.passives && Array.isArray(unit.passives)) {
    const found = unit.passives.find((p) => {
      const text = `${p.name || ""} ${p.desc || p.effect || ""}`.toLowerCase();
      return text.includes("follow-up") || text.includes("arcane spells") || text.includes("bats") || text.includes("summon") || text.includes("extra attack");
    });
    if (found) {
      followUpInfo = {
        name: found.name || "Passive Follow-Up",
        desc: found.desc || found.effect || "Unit unleashes additional follow-up attack ticks",
      };
    }
  }

  return { damage, spa, range, critChancePercent, critDamagePercent, dotMultiplier, dotDescription, dotName, followUpInfo };
}

function getRelicModifiers(name, unitRelicObj) {
  if (unitRelicObj && unitRelicObj.name === name && unitRelicObj.modifiers) {
    return unitRelicObj.modifiers;
  }

  const def = getRelicStatsByName(name);
  const list = [];
  if (!def || !def.stats) return list;

  def.stats.forEach((block) => {
    Object.entries(block).forEach(([key, val]) => {
      let valStr = "";
      if (typeof val === "object") {
        const minStr = String(val.min || "");
        const maxStr = String(val.max || "");
        valStr = minStr && maxStr ? `${minStr} to ${maxStr}` : (minStr || maxStr);
      } else {
        valStr = String(val);
      }
      const labelMap = {
        damage: { label: "Damage", icon: "damage" },
        spa: { label: "SPA", icon: "spa" },
        range: { label: "Range", icon: "range" },
        critChance: { label: "Crit Rate", icon: "critChance" },
        critDamage: { label: "Crit DMG", icon: "critDamage" },
        magicdamage: { label: "Magic DMG", icon: "magicdamage" },
        physicaldamage: { label: "Phys DMG", icon: "physicaldamage" },
        dotbonus: { label: "DoT DMG", icon: "dotbonus" },
      };
      const meta = labelMap[key] || { label: key, icon: "damage" };
      list.push({
        icon: meta.icon,
        label: meta.label,
        value: valStr
      });
    });
  });
  return list;
}

export function getUnitRelicList(unit) {
  const relics = [];

  const addRelic = (name, isUnitEquip, label, unitRelicObj) => {
    if (!name) return;
    const def = getRelicStatsByName(name);
    relics.push({
      name,
      image: relicImgByName(name),
      isUnitEquip,
      label,
      modifiers: getRelicModifiers(name, unitRelicObj),
      passive: def?.passive || null,
    });
  };

  if (unit.selectedDpsRelic !== undefined) {
    if (unit.selectedDpsRelic) {
      addRelic(unit.selectedDpsRelic, true, "Unit Equip", null);
    }
  } else if (unit.relic && unit.relic.name) {
    addRelic(unit.relic.name, true, "Unit Equip", unit.relic);
  } else if (unit.recommendedEquips?.unitEquip) {
    addRelic(unit.recommendedEquips.unitEquip, true, "Unit Equip", null);
  }

  if (unit.selectedDpsEquip1 !== undefined) {
    if (unit.selectedDpsEquip1) {
      addRelic(unit.selectedDpsEquip1, false, "Equip 1", null);
    }
  } else if (unit.equipment && unit.equipment[0]) {
    addRelic(unit.equipment[0].name, false, "Equip 1", unit.equipment[0]);
  } else if (unit.recommendedEquips?.equip1) {
    addRelic(unit.recommendedEquips.equip1, false, "Equip 1", null);
  }

  if (unit.selectedDpsEquip2 !== undefined) {
    if (unit.selectedDpsEquip2) {
      addRelic(unit.selectedDpsEquip2, false, "Equip 2", null);
    }
  } else if (unit.equipment && unit.equipment[1]) {
    addRelic(unit.equipment[1].name, false, "Equip 2", unit.equipment[1]);
  } else if (unit.recommendedEquips?.equip2) {
    addRelic(unit.recommendedEquips.equip2, false, "Equip 2", null);
  }

  return relics;
}

export const TRAIT_DEFINITIONS = {
  base: { id: "base", name: "Base", damageBonus: 0, spaBonus: 0, rangeBonus: 0, critChanceBonus: 0, critDamageBonus: 0, dotBonus: 0, desc: "No Trait" },
  unbound: { id: "unbound", name: "Unbound", damageBonus: 3.5, spaBonus: -0.05, rangeBonus: 0.10, critChanceBonus: 0, critDamageBonus: 0, dotBonus: 0, desc: "+350% DMG, -5% SPA, +10% RNG" },
  primordial: { id: "primordial", name: "Primordial", damageBonus: 0.35, spaBonus: -0.15, rangeBonus: 0.20, critChanceBonus: 0, critDamageBonus: 0, dotBonus: 0, desc: "+35% DMG, -15% SPA, +20% RNG" },
  forsaken: { id: "forsaken", name: "Forsaken", damageBonus: 0, spaBonus: 0, rangeBonus: 0.10, critChanceBonus: 0.35, critDamageBonus: 0.35, dotBonus: 0, desc: "+35% Crit Chance, +35% Crit DMG, +10% RNG" },
  draconic: { id: "draconic", name: "Draconic", damageBonus: 0.20, spaBonus: 0, rangeBonus: 0.10, critChanceBonus: 0, critDamageBonus: 0, dotBonus: 0.50, desc: "+20% DMG, +50% DoT DMG, +10% RNG" },
};

export function getSummonsData(unit) {
  if (!unit) return null;

  let data = unit.summons ||
    unit.summon ||
    unit.stats?.summons ||
    unit.stats?.summon ||
    unit.summonInfo ||
    unit.summonStats ||
    unit.summonConfig;

  if (!data && unit.passives && Array.isArray(unit.passives)) {
    const pass = unit.passives.find(p => p.summon || p.summons || p.summonInfo || p.summonStats);
    if (pass) {
      data = pass.summon || pass.summons || pass.summonInfo || pass.summonStats;
    }
  }

  if (!data && unit.relic) {
    data = unit.relic.summon || unit.relic.summons || unit.relic.summonInfo || unit.relic.summonStats;
  }

  if (Array.isArray(data)) {
    data = data[0];
  }

  return data;
}

export function formatDPS(num) {
  if (isNaN(num) || !isFinite(num)) return "0";
  const rounded = Math.round(num);

  if (rounded >= 1000000000) {
    const val = rounded / 1000000000;
    return val < 100 ? val.toFixed(1).replace(/\.0$/, "") + "B" : Math.round(val) + "B";
  }
  if (rounded >= 1000000) {
    const val = rounded / 1000000;
    return val < 100 ? val.toFixed(1).replace(/\.0$/, "") + "M" : Math.round(val) + "M";
  }
  if (rounded >= 1000) {
    const val = rounded / 1000;
    return val < 100 ? val.toFixed(1).replace(/\.0$/, "") + "k" : Math.round(val) + "k";
  }
  return String(rounded);
}

export function getTraitBreakdown(unit, traitKey = "base", level = 1, statMode = "0%") {
  const base = getUnitBaseValues(unit);
  const isElfMage = unit && (unit.id === "elfmageunleashed" || (unit.name && unit.name.includes("Elf Mage")));
  const isDarkMage = unit && (unit.id === "darkmagesovereign" || (unit.name && unit.name.includes("Dark Mage")));
  const isReaper = unit && (unit.id === "reaperreleased" || (unit.name && unit.name.includes("Reaper")));
  const isLadyGiant = unit && (unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant")));
  const isEighthSword = unit && (unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword")));

  // Dark Mage mode: "lightning" | "both" | "normal"
  const darkMageMode = isDarkMage
    ? (unit.darkMageMode || (unit.darkMageLightningMode === false ? "normal" : "lightning"))
    : "lightning";

  const giantForm = unit && !!unit.giantForm;
  const berserkState = unit && !!unit.berserkState;
  const demonicPresence = unit && !!unit.demonicPresence;

  let passiveSpaMult = isReaper ? -0.10 : (isLadyGiant && giantForm ? 0.25 : (isEighthSword && berserkState ? -0.10 : 0));
  let passiveCritChanceAdd = isReaper ? 0.40 : 0;
  let passiveCritDamageAdd = 0;
  let passiveDamageMult = isReaper ? 0.40 : (isLadyGiant && giantForm ? 1.25 : (isEighthSword && berserkState ? 0.20 : 0));
  let passiveRangeMult = (isLadyGiant && giantForm ? 0.50 : 0);

  if (isElfMage) {
    base.dotMultiplier = 0.50;
    base.dotName = "Mana Burn";
  } else if (isDarkMage) {
    let activeUnitEquip = "";
    if (unit.selectedDpsRelic !== undefined && unit.selectedDpsRelic !== null && unit.selectedDpsRelic !== "") {
      activeUnitEquip = unit.selectedDpsRelic;
    } else if (unit.relic && unit.relic.name) {
      activeUnitEquip = unit.relic.name;
    } else if (unit.recommendedEquips?.unitEquip) {
      activeUnitEquip = unit.recommendedEquips.unitEquip;
    }

    const hasDarkScepter = activeUnitEquip === "Dark Scepter";
    const lightningMult = hasDarkScepter ? 0.50 : 0.25;

    base.dotMultiplier = lightningMult;
    base.dotName = "Lightning Arc";
  }

  const lvl = Math.max(1, parseInt(level) || 1);
  const levelMult = Math.pow(1.0123, lvl - 1);
  const scaledBaseDamage = Math.round((base.damage || 0) * levelMult);

  const trait = TRAIT_DEFINITIONS[traitKey] || TRAIT_DEFINITIONS.base;
  const relics = getUnitRelicList(unit);

  let relicDamageMult = 0;
  let relicArchetypeDamageMult = 0;
  let relicSpaMult = 0;
  let relicRangeMult = 0;
  let relicCritChanceAdd = 0;
  let relicCritDamageAdd = 0;
  let relicDotBonus = 0;

  const unitArchetype = (unit.stats?.archetype || "").toLowerCase();
  const isBleedUnit = (base.dotName || "").toLowerCase().includes("bleed");

  relics.forEach(relic => {
    (relic.modifiers || []).forEach(mod => {
      const numbers = [...mod.value.matchAll(/([+-]?[0-9.]+)/g)].map(m => parseFloat(m[1]));
      if (numbers.length === 0) return;

      const iconLow = (mod.icon || "").toLowerCase();
      const isSpa = iconLow === "spa";

      const num = numbers.length > 1
        ? (isSpa ? Math.min(...numbers) : Math.max(...numbers))
        : numbers[0];

      if (isNaN(num)) return;
      const isPercent = mod.value.includes("%");
      const factor = isPercent ? (num / 100) : num;

      if (iconLow === "physicaldamage") {
        if (unitArchetype === "physical") relicArchetypeDamageMult += factor;
      } else if (iconLow === "magicdamage") {
        if (unitArchetype === "magic" || unitArchetype === "magical") relicArchetypeDamageMult += factor;
      } else if (iconLow === "damage") {
        relicDamageMult += factor;
      } else if (iconLow === "spa") {
        relicSpaMult += (factor < 0 ? factor : -factor);
      } else if (iconLow === "range") {
        relicRangeMult += factor;
      } else if (iconLow === "critchance") {
        relicCritChanceAdd += factor;
      } else if (iconLow === "critdamage") {
        relicCritDamageAdd += factor;
      } else if (iconLow === "dotbonus") {
        if (relic.name === "Red Finger") {
          if (isBleedUnit) relicDotBonus += factor;
        } else {
          relicDotBonus += factor;
        }
      }
    });
  });

  const hasShinigami = relics.some(r => r.name === "Shinigami Sword");
  const shinigamiActive = hasShinigami && !!unit.simulateShinigamiPassive;

  // Step 1: Base & Trait & Relic Damage
  let effDamage = scaledBaseDamage * (1 + (trait.damageBonus || 0)) * (1 + relicDamageMult) * (1 + relicArchetypeDamageMult);

  // Step 2: Z Stat & Ascension Multipliers
  if (statMode === "Z") {
    effDamage = effDamage * 1.2;
  }

  const hasAscend = unit.ascend === true || unit.ascend === 3 || unit.ascend === "3";
  if (hasAscend) {
    effDamage = effDamage * 1.15;
  }

  // Step 3: Shinigami + Unit Passives applied together AFTER Traits & Z Stats
  let totalPassiveDamageBonus = (shinigamiActive ? 0.15 : 0) + passiveDamageMult;
  if (totalPassiveDamageBonus > 0) {
    effDamage = effDamage * (1 + totalPassiveDamageBonus);
  }

  // Step 1: Base & Trait & Relic SPA
  let effSpa = (base.spa || 1) * (1 + (trait.spaBonus || 0)) * (1 + relicSpaMult);

  // Step 2: Z Stat Multiplier
  if (statMode === "Z") {
    effSpa = effSpa * 0.85;
  }

  // Step 3: Passives Applied AFTER Trait & Z Stats
  if (passiveSpaMult !== 0) {
    effSpa = effSpa * (1 + passiveSpaMult);
  }

  effSpa = Math.max(0.1, effSpa);

  let effRange = (base.range || 0) * (1 + (trait.rangeBonus || 0)) * (1 + relicRangeMult);

  if (statMode === "Z") {
    effRange = effRange * 1.15;
  }

  if (hasAscend) {
    effRange = effRange * 1.05;
  }

  if (passiveRangeMult !== 0) {
    effRange = effRange * (1 + passiveRangeMult);
  }

  const effCritChance = Math.min(1.0, ((base.critChancePercent || 0) / 100) + (trait.critChanceBonus || 0) + relicCritChanceAdd + passiveCritChanceAdd);
  const effCritDamage = ((base.critDamagePercent || 100) / 100) + (trait.critDamageBonus || 0) + relicCritDamageAdd + passiveCritDamageAdd;
  const critAvgMult = 1 + effCritChance * effCritDamage;

  const avgHitDamage = effDamage * critAvgMult;

  // Dark Mage's Lightning Arc is a passive field tick, NOT a DoT status effect.
  // Therefore, Trait DoT bonus (Draconic) and Relic DoT bonus do NOT apply.
  const effDotMult = isDarkMage
    ? (base.dotMultiplier || 0)
    : (base.dotMultiplier || 0) * (1 + (trait.dotBonus || 0)) * (1 + relicDotBonus);

  const dotDuration = 8.0;
  let dotIntervalMultiplier = Math.ceil(dotDuration / effSpa);
  let dotIntervalSPA = dotIntervalMultiplier * effSpa;
  const dotDamage = effDamage * effDotMult;

  let unitDirectDPS = 0;
  let unitDoTDPS = 0;
  let fuaBreakdowns = [];
  let fuaDps = 0;
  let singleFuaDmg = 0;
  let hasElfRelicOverride = false;

  if (isElfMage) {
    let activeUnitEquip = "";
    if (unit.selectedDpsRelic !== undefined && unit.selectedDpsRelic !== null && unit.selectedDpsRelic !== "") {
      activeUnitEquip = unit.selectedDpsRelic;
    } else if (unit.relic && unit.relic.name) {
      activeUnitEquip = unit.relic.name;
    } else if (unit.recommendedEquips?.unitEquip) {
      activeUnitEquip = unit.recommendedEquips.unitEquip;
    }

    if (!activeUnitEquip && unit.selectedDpsRelic === undefined) {
      activeUnitEquip = "Elven Battle Staff";
    }

    hasElfRelicOverride = activeUnitEquip === "Elven Battle Staff";

    const overchargeMult = 1.25;

    const baseSpellMults = hasElfRelicOverride
      ? [1.00, 1.25, 1.50]
      : [1.00, 1.00, 1.00];

    const spellNames = ["Old Magic (3 Charges)", "Eruption (5 Charges)", "Storm (7 Charges)"];
    const baseLabels = hasElfRelicOverride
      ? ["100% Base", "125% (Staff)", "150% (Staff)"]
      : ["100% Base", "100% Base", "100% Base"];

    fuaBreakdowns = baseSpellMults.map((baseM, index) => {
      const finalSpellMult = baseM * overchargeMult;
      const effectiveFollowUpDamage = effDamage * finalSpellMult;
      const averageFollowUpHit = effectiveFollowUpDamage * critAvgMult;

      const dps = averageFollowUpHit / (7 * effSpa);

      return {
        index,
        name: spellNames[index],
        baseLabel: baseLabels[index],
        baseMult: baseM,
        finalMult: finalSpellMult,
        inputDamage: effDamage,
        effectiveFollowUpDamage,
        averageFollowUpHit,
        dps
      };
    });

    fuaDps = fuaBreakdowns.reduce((sum, b) => sum + b.dps, 0);
    singleFuaDmg = fuaBreakdowns.reduce((sum, b) => sum + b.averageFollowUpHit, 0);

    dotIntervalMultiplier = 7;
    dotIntervalSPA = 7 * effSpa;
    const manaBurnDamagePerCycle = effDamage * effDotMult;
    unitDoTDPS = manaBurnDamagePerCycle / dotIntervalSPA;
    unitDirectDPS = avgHitDamage / effSpa;
  } else if (isDarkMage) {
    dotIntervalMultiplier = 1;
    dotIntervalSPA = 1.0;

    if (darkMageMode === "normal") {
      unitDirectDPS = avgHitDamage / effSpa;
      unitDoTDPS = 0;
    } else if (darkMageMode === "both") {
      unitDirectDPS = avgHitDamage / effSpa;
      unitDoTDPS = avgHitDamage * effDotMult;
    } else { // "lightning"
      unitDirectDPS = 0;
      unitDoTDPS = avgHitDamage * effDotMult;
    }
  } else if (isLadyGiant) {
    unitDirectDPS = avgHitDamage / effSpa;
    const rockMult = giantForm ? 1.25 : 1.00;
    const effectiveRockDmg = effDamage * rockMult;
    const rockAvgHit = effectiveRockDmg * critAvgMult;
    const rockDps = rockAvgHit / (4 * effSpa);

    fuaDps = rockDps;
    fuaBreakdowns = [
      {
        index: 0,
        name: `Rock Storm (${giantForm ? "Giant Form 125%" : "Base Form 100%"})`,
        inputDamage: effDamage,
        effectiveFollowUpDamage: effectiveRockDmg,
        averageFollowUpHit: rockAvgHit,
        dps: rockDps
      }
    ];
    singleFuaDmg = rockAvgHit;
  } else if (isEighthSword) {
    unitDirectDPS = avgHitDamage / effSpa;
    if (demonicPresence) {
      unitDoTDPS = avgHitDamage * 0.15;
      base.dotName = "Demonic Presence";
      dotIntervalMultiplier = 1;
      dotIntervalSPA = 1.0;
    }
  } else {
    unitDirectDPS = avgHitDamage / effSpa;
    unitDoTDPS = (base.dotMultiplier || 0) > 0 ? (dotDamage / dotIntervalSPA) : 0;

    const fuaCritMultiplier = 1 + effCritChance * effCritDamage;
    const fuaDamageScale = 1 + relicArchetypeDamageMult;
    fuaBreakdowns = Array.isArray(unit.fuaDamages)
      ? unit.fuaDamages.map((value, index) => {
        const inputDamage = parseNumber(value, 0);
        const effectiveFollowUpDamage = inputDamage * fuaDamageScale;
        const combinedHitDamage = effectiveFollowUpDamage + effDamage;
        const averageFollowUpHit = combinedHitDamage * fuaCritMultiplier;
        const dps = inputDamage > 0 ? averageFollowUpHit / (effSpa * 3) : 0;

        return {
          index,
          inputDamage,
          effectiveFollowUpDamage,
          combinedHitDamage,
          averageFollowUpHit,
          dps
        };
      })
      : [];
    fuaDps = fuaBreakdowns.reduce((total, entry) => total + entry.dps, 0);
    singleFuaDmg = fuaBreakdowns.reduce((total, entry) => total + entry.averageFollowUpHit, 0);
  }

  let summonCount = 0;
  let summonDamageMult = 0;
  let summonDamage = 0;
  let summonAvgHitDamage = 0;
  let summonDirectDPS = 0;
  let summonDoTDPS = 0;
  let totalSummonDPS = 0;
  let totalSummonDmg = 0;
  let hasSummonRelicOverride = false;

  const summonsData = getSummonsData(unit);

  if (summonsData) {
    summonCount = parseNumber(
      summonsData.countPerPlacement || summonsData.count || summonsData.spawnCount || summonsData.amount || summonsData.quantity || summonsData.limit,
      1
    );
    summonDamageMult = parseNumber(
      summonsData.baseDamageMultiplier || summonsData.damageMultiplier || summonsData.multiplier || summonsData.damage || summonsData.damageMultiplierOverride,
      1
    );

    if (summonsData.relicModifiers) {
      const activeUnitEquip = unit.selectedDpsRelic !== undefined
        ? unit.selectedDpsRelic
        : (unit.relic?.name || unit.recommendedEquips?.unitEquip);
      const match = summonsData.relicModifiers.find(m => m.relicName === activeUnitEquip);
      if (match) {
        summonDamageMult = parseNumber(match.damageMultiplierOverride || match.multiplier || match.damage, summonDamageMult);
        hasSummonRelicOverride = true;
      }
    }

    summonDamage = effDamage * summonDamageMult;
    summonAvgHitDamage = summonDamage * critAvgMult;
    summonDirectDPS = (summonAvgHitDamage * summonCount) / effSpa;

    const totalSummonDamage = summonDamage * summonCount;
    const summonsDoTDamage = totalSummonDamage * effDotMult;
    summonDoTDPS = (base.dotMultiplier || 0) > 0 ? (summonsDoTDamage / dotIntervalSPA) : 0;
    totalSummonDPS = summonDirectDPS + summonDoTDPS;
    totalSummonDmg = (summonAvgHitDamage * summonCount) + ((base.dotMultiplier || 0) > 0 ? summonsDoTDamage : 0);
  }

  const combinedDPS = unitDirectDPS + unitDoTDPS + totalSummonDPS + fuaDps;

  const singlePlacementDmg = (isDarkMage ? (darkMageMode === "lightning" ? 0 : avgHitDamage) : avgHitDamage) +
    ((base.dotMultiplier || 0) > 0 ? (isDarkMage ? (darkMageMode === "normal" ? 0 : avgHitDamage * effDotMult) : dotDamage) : 0) +
    totalSummonDmg + singleFuaDmg;

  return {
    unitName: unit.name || "Unit",
    level: lvl,
    levelMult,
    scaledBaseDamage,
    trait,
    dps: combinedDPS,
    formattedDPS: formatDPS(combinedDPS),
    singlePlacementDmg,
    totalSummonDmg,
    singleFuaDmg,
    relics,
    base,
    dotName: base.dotName,
    effDamage,
    effSpa,
    effRange,
    effCritChance,
    effCritDamage,
    critAvgMult,
    avgHitDamage,
    effDotMult,
    unitDirectDPS,
    unitDoTDPS,
    relicDamageMult,
    relicArchetypeDamageMult,
    relicSpaMult,
    relicRangeMult,
    relicCritChanceAdd,
    relicCritDamageAdd,
    relicDotBonus,
    unitArchetype,
    hasShinigami,
    shinigamiActive,
    hasAscend,
    summonCount,
    summonDamageMult,
    summonDamage,
    summonAvgHitDamage,
    summonDirectDPS,
    summonDoTDPS,
    totalSummonDPS,
    isElfMage,
    isDarkMage,
    darkMageMode,
    isReaper,
    isLadyGiant,
    giantForm,
    isEighthSword,
    berserkState,
    demonicPresence,
    passiveSpaMult,
    passiveCritChanceAdd,
    passiveCritDamageAdd,
    passiveDamageMult,
    passiveRangeMult,
    totalPassiveDamageBonus,
    hasElfRelicOverride,
    fuaDps,
    fuaDamages: unit.fuaDamages || [],
    fuaBreakdowns,
    fuaCritMultiplier: critAvgMult,
    fuaDamageScale: 1 + relicArchetypeDamageMult,
    hasSummonRelicOverride,
    dotDuration,
    dotIntervalMultiplier,
    dotIntervalSPA,
    dotDamage,
  };
}