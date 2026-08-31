import { relicImgByName } from "../icons/icons.js";
import { getRelicStatsByName } from "../data/relicstats.js";
import { units as allUnits } from "../data/units.js";

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

  let attackTime = 0;

  if (unit.placement && Array.isArray(unit.placement) && unit.placement.length > 0) {
    const maxTier = unit.placement[unit.placement.length - 1];
    damage = parseNumber(maxTier.damage, parseNumber(unit.stats?.damage, 0));
    spa = parseNumber(maxTier.spa, parseNumber(unit.stats?.spa, 1));
    range = parseNumber(maxTier.range, parseNumber(unit.stats?.range, 0));
    attackTime = parseNumber(maxTier.attackTime, 0);
  } else {
    damage = parseNumber(unit.stats?.damage, 0);
    spa = parseNumber(unit.stats?.spa, 1);
    range = parseNumber(unit.stats?.range, 0);
    attackTime = parseNumber(unit.stats?.attackTime, 0);
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

  return { damage, spa, range, attackTime, critChancePercent, critDamagePercent, dotMultiplier, dotDescription, dotName, followUpInfo };
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

  const isBioinsect = unit.id === "bioinsectfinal" || !!unit.isBioinsectUnit;
  if (isBioinsect) {
    const form = unit.bioinsectForm || "semiperfect";
    if (form === "imperfect" || unit._bioinsectSuppressSummon) {
      return null;
    }
  }

  if (unit._bioinsectSuppressSummon) return null;

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
  const isDarkMage = unit && (
    unit.id === "darkmagesovereign" ||
    (unit.name && unit.name.toLowerCase().includes("dark mage"))
  );
  const isReaper = unit && (unit.id === "reaperreleased" || (unit.name && unit.name.includes("Reaper")));
  const isLadyGiant = unit && (unit.id === "ladygiantenvy" || (unit.name && unit.name.includes("Lady Giant")));
  const isEighthSword = unit && (unit.id === "8thswordberserk" || (unit.name && unit.name.includes("8th Sword")));
  const isCrow = unit && (unit.id === "crowblackfire" || (unit.name && unit.name.includes("Crow")));
  const isCursedStudent = unit && (unit.id === "cursestudenttruelove" || (unit.name && unit.name.includes("Cursed Student")));
  const isCrimson = unit && (unit.id === "crimsonbrother" || (unit.name && unit.name.includes("Crimson")));
  const isCursedImmortal = unit && (unit.id === "cursedimmortalblacksun" || (unit.name && unit.name.includes("Cursed Immortal")));
  const isRazorjaw = unit && (unit.id === "razorjawhunter" || (unit.name && unit.name.includes("Razorjaw")));
  const isVegetable = unit && (unit.id === "vegetableprince" || (unit.name && unit.name.includes("Vegetable")));
  const isBioinsect = unit && (unit.id === "bioinsectfinal" || !!unit.isBioinsectUnit);
  const isCarrot = unit && (unit.id === "carrotunleashed" || (unit.name && unit.name.includes("Carrot")));
  const isProdigy = unit && (unit.id === "prodigyrage" || (unit.name && unit.name.includes("Prodigy")));
  const isHeadCaptain = unit && (unit.id === "headcaptainchar" || (unit.name && unit.name.includes("Head Captain")));

  const darkMageMode = isDarkMage
    ? (unit.darkMageMode || (unit.darkMageLightningMode === false ? "normal" : "lightning"))
    : "lightning";

  const headCaptainBurningEnemies = isHeadCaptain ? (unit.headCaptainBurningEnemies !== undefined ? Math.max(0, Math.min(30, parseInt(unit.headCaptainBurningEnemies, 10) || 0)) : 30) : 30;
  const headCaptainBurnStacks = isHeadCaptain ? (unit.headCaptainBurnStacks !== undefined ? Math.max(1, Math.min(10, parseInt(unit.headCaptainBurnStacks, 10) || 1)) : 1) : 1;

  const giantForm = unit && !!unit.giantForm;
  const berserkState = unit && !!unit.berserkState;
  const demonicPresence = unit && !!unit.demonicPresence;
  const crimsonAbilityActive = unit && !!unit.crimsonAbilityActive;
  const crimsonPoolCount = unit ? (unit.crimsonPoolCount !== undefined ? Math.max(0, Math.min(3, parseInt(unit.crimsonPoolCount, 10) || 0)) : 3) : 3;
  const coldState = isCursedImmortal ? !!unit.coldState : false;
  const caringState = isCursedImmortal ? !coldState : (unit && !!unit.caringState);
  const royalRivalry = isVegetable ? (unit.royalRivalry !== undefined ? !!unit.royalRivalry : true) : false;
  const awakenedPride = isVegetable ? (unit.awakenedPride !== undefined ? !!unit.awakenedPride : true) : false;
  const carrotTransformation = isCarrot ? (unit.carrotTransformation !== undefined ? !!unit.carrotTransformation : true) : false;
  const carrotInstantRelocation = isCarrot ? (unit.carrotInstantRelocation !== undefined ? !!unit.carrotInstantRelocation : true) : false;
  const isCompMode = unit ? !!unit.isCompMode : false;
  const bioinsectForm = isBioinsect ? (unit.bioinsectForm || "semiperfect") : "semiperfect";
  const bioinsectResetStacks = isBioinsect ? Math.max(0, parseInt(unit.bioinsectResetStacks || 0, 10) || 0) : 0;

  if (isBioinsect && !unit.bioinsectCopiedUnitId) {
    unit.bioinsectCopiedUnitId = "puppet";
  }

  const prodigyRageUnleashed = isProdigy ? (unit.prodigyRageUnleashed !== undefined ? !!unit.prodigyRageUnleashed : true) : false;
  const prodigyStatusEffects = isProdigy ? Math.max(0, Math.min(10, parseInt(unit.prodigyStatusEffects || 0, 10) || 0)) : 0;
  const prodigyFatherAndSonActive = isProdigy ? !!unit.prodigyFatherAndSonActive : false;

  let passiveSpaMult = isReaper ? -0.10 : (isLadyGiant && giantForm ? 0.25 : (isEighthSword && berserkState ? -0.10 : 0));
  let passiveCritChanceAdd = isReaper ? 0.40 : (isCursedImmortal ? 0.30 : (isRazorjaw ? 0.25 : 0));
  let passiveCritDamageAdd = isCarrot && carrotTransformation ? 0.20 : 0;
  let passiveDamageMult = isReaper ? 0.40 : (isLadyGiant && giantForm ? 1.25 : (isEighthSword && berserkState ? 0.20 : (isCarrot && carrotTransformation ? 0.15 : (isProdigy && prodigyRageUnleashed ? 0.25 : 0))));
  let passiveRangeMult = (isLadyGiant && giantForm ? 0.50 : (isCursedImmortal && caringState ? -0.50 : (isCursedImmortal && coldState ? -0.75 : 0)));

  if (isCarrot && carrotInstantRelocation) {
    passiveDamageMult += 0.50;
  }
  if (isBioinsect) {
    passiveRangeMult += 0.30;

    if (bioinsectResetStacks > 0) {
      const relics = getUnitRelicList(unit);
      const hasMechanicalWings = relics.some(r => r.name === "Mechanical Wings");
      const dmgPerStack = hasMechanicalWings ? 0.05 : 0.01;
      passiveDamageMult += bioinsectResetStacks * dmgPerStack;
      passiveRangeMult += Math.min(0.15, bioinsectResetStacks * 0.01);
    }
  }

  if (isVegetable) {
    if (royalRivalry) {
      passiveDamageMult += 0.50;
      passiveCritChanceAdd += 0.50;
      passiveCritDamageAdd += 0.30;
    }
    if (awakenedPride) {
      passiveDamageMult += 0.15;
      passiveCritChanceAdd += 0.20;
      passiveCritDamageAdd += 0.35;
    }
  }

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
  } else if (isCrow) {
    base.dotMultiplier = 2.0;
    base.dotName = "Black Fire";
  } else if (isHeadCaptain) {
    base.dotMultiplier = 0.50;
    base.dotName = "Burn";
  }

  if (isBioinsect) {
    const copiedId = unit.bioinsectCopiedUnitId;
    const copiedUnit = copiedId ? allUnits.find(u => u.id === copiedId) : null;
    if (copiedUnit) {
      const copiedBase = getUnitBaseValues(copiedUnit);
      base.damage = copiedBase.damage * 0.5;
    } else {
      base.damage = 0;
    }
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

  let effDamage = scaledBaseDamage * (1 + (trait.damageBonus || 0)) * (1 + relicDamageMult) * (1 + relicArchetypeDamageMult);

  if (statMode === "Z") {
    effDamage = effDamage * 1.2;
  }

  const hasAscend = unit.ascend === true || unit.ascend === 3 || unit.ascend === "3";
  if (hasAscend) {
    effDamage = effDamage * 1.15;
  }

  const hasWarriorPole = relics.some(r => r.name === "Warrior Pole");
  const isTransformed = (isCarrot && carrotTransformation) ||
    (isVegetable) ||
    (isBioinsect && bioinsectForm !== "imperfect") ||
    (isProdigy && prodigyRageUnleashed) ||
    (isEighthSword && berserkState);

  let totalPassiveDamageBonus = (shinigamiActive ? 0.15 : 0) + (hasWarriorPole && isTransformed ? 0.20 : 0) + passiveDamageMult;
  // summonBaseEffDamage: scales with trait, flat relic damage, Z stat, and ascend
  // but NOT relic archetype bonus and NOT passive/buff totals (Shinigami, Bio Reset, etc.)
  let summonBaseEffDamage = scaledBaseDamage * (1 + (trait.damageBonus || 0)) * (1 + relicDamageMult);
  if (statMode === "Z") summonBaseEffDamage *= 1.2;
  if (hasAscend) summonBaseEffDamage *= 1.15;
  // Capture effDamage before any passive/shinigami buffs — used for summons that should not scale with these
  const prePassiveEffDamage = summonBaseEffDamage;
  const preShinigamiEffDamage = effDamage * (passiveDamageMult > 0 ? (1 + passiveDamageMult) : 1);
  if (totalPassiveDamageBonus > 0) {
    effDamage = effDamage * (1 + totalPassiveDamageBonus);
  }

  let effSpa = (base.spa || 1) * (1 + (trait.spaBonus || 0)) * (1 + relicSpaMult);

  if (statMode === "Z") {
    effSpa = effSpa * 0.85;
  }

  if (passiveSpaMult !== 0) {
    effSpa = effSpa * (1 + passiveSpaMult);
  }

  const mainAttackTime = parseNumber(base.attackTime, 0);
  if (mainAttackTime > 0) {
    effSpa = Math.max(mainAttackTime, effSpa);
  } else {
    effSpa = Math.max(0.1, effSpa);
  }

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

  const baseCritRate = ((base.critChancePercent || 0) / 100);
  const baseCritDamage = isCompMode ? 0.50 : 1.00;
  const rawCritChance = Math.min(1.0, baseCritRate + (trait.critChanceBonus || 0) + relicCritChanceAdd + passiveCritChanceAdd);
  const effCritChance = isCompMode ? (rawCritChance >= 0.25 ? rawCritChance : 0) : rawCritChance;
  const effCritDamage = baseCritDamage + (trait.critDamageBonus || 0) + relicCritDamageAdd + passiveCritDamageAdd;

  const battleInstinctBonusCrit = isCarrot ? 0.25 * (1 - effCritChance) : 0;
  const effectiveCritRate = isCarrot ? Math.min(1.0, (0.75 * effCritChance) + 0.25) : effCritChance;
  const critAvgMult = 1 + effectiveCritRate * effCritDamage;

  const avgHitDamage = effDamage * critAvgMult;

  let effDotMult = isDarkMage
    ? (base.dotMultiplier || 0)
    : (base.dotMultiplier || 0) * (1 + (trait.dotBonus || 0)) * (1 + relicDotBonus);

  let dotDuration = 8.0;
  let dotIntervalMultiplier = Math.ceil(dotDuration / effSpa);
  let dotIntervalSPA = dotIntervalMultiplier * effSpa;
  let dotDamage = effDamage * effDotMult;

  if (isCrow) {
    dotDuration = 12.0;
    dotIntervalMultiplier = Math.ceil(12.0 / effSpa);
    dotIntervalSPA = dotIntervalMultiplier * effSpa;
  } else if (isHeadCaptain) {
    const burnBaseMult = base.dotMultiplier || 0.50;
    const burnRangeBonusMult = 1 + (headCaptainBurningEnemies * 0.05);
    const burnTraitRelicMult = 1 + (trait.dotBonus || 0) + relicDotBonus;
    const singleStackBurnDmg = effDamage * burnBaseMult * burnRangeBonusMult * burnTraitRelicMult;
    dotDamage = singleStackBurnDmg * headCaptainBurnStacks;
    effDotMult = burnBaseMult * burnRangeBonusMult * burnTraitRelicMult * headCaptainBurnStacks;
    dotDuration = 4.0;
    dotIntervalMultiplier = Math.max(1, Math.ceil(4.0 / effSpa));
    dotIntervalSPA = dotIntervalMultiplier * effSpa;
  }

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
      const cycleInterval = 7 * effSpa;
      const dps = averageFollowUpHit / cycleInterval;

      return {
        index,
        name: spellNames[index],
        baseLabel: baseLabels[index],
        baseMult: baseM,
        finalMult: finalSpellMult,
        inputDamage: effDamage,
        effectiveFollowUpDamage,
        averageFollowUpHit,
        cycleInterval,
        critAvgMult,
        dps,
        isElfSpell: true
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

    const lightningDpsVal = avgHitDamage * effDotMult;

    if (darkMageMode === "normal") {
      unitDirectDPS = avgHitDamage / effSpa;
      unitDoTDPS = 0;
    } else if (darkMageMode === "both") {
      unitDirectDPS = avgHitDamage / effSpa;
      unitDoTDPS = lightningDpsVal;
    } else {
      unitDirectDPS = 0;
      unitDoTDPS = lightningDpsVal;
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
  } else if (isCrow) {
    unitDirectDPS = avgHitDamage / effSpa;

    const blackFireDotDamage = effDamage * effDotMult;
    unitDoTDPS = blackFireDotDamage / dotIntervalSPA;

    let activeUnitEquip = "";
    if (unit.selectedDpsRelic !== undefined && unit.selectedDpsRelic !== null && unit.selectedDpsRelic !== "") {
      activeUnitEquip = unit.selectedDpsRelic;
    } else if (unit.relic && unit.relic.name) {
      activeUnitEquip = unit.relic.name;
    } else if (unit.recommendedEquips?.unitEquip) {
      activeUnitEquip = unit.recommendedEquips.unitEquip;
    }

    const hasIllusionCrow = activeUnitEquip === "Illusion Crow";
    const illusionEffectiveness = hasIllusionCrow ? 0.50 : 0.25;

    const enemiesHit = Math.max(1, parseInt(unit.crowEnemiesHit !== undefined ? unit.crowEnemiesHit : 5, 10) || 5);
    const storingAttacks = Math.ceil(12.0 / effSpa);

    const directStoredDmg = storingAttacks * avgHitDamage;
    const dotStoredDmg = blackFireDotDamage;
    const totalStoredDmg = directStoredDmg + dotStoredDmg;

    const baseExplosionDamage = totalStoredDmg * illusionEffectiveness;
    const explosionDamageWithCrit = baseExplosionDamage * critAvgMult;
    const totalExplosionPerUnit = explosionDamageWithCrit * enemiesHit;

    const cycleAttacks = Math.ceil(22.0 / effSpa);
    const cycleTimeSeconds = cycleAttacks * effSpa;
    const illusionDpsVal = totalExplosionPerUnit / cycleTimeSeconds;

    fuaDps = illusionDpsVal;
    fuaBreakdowns = [
      {
        index: 0,
        name: `Illusion Explosion (${hasIllusionCrow ? "50% Relic" : "25% Base"})`,
        inputDamage: totalStoredDmg,
        effectiveFollowUpDamage: totalExplosionPerUnit,
        averageFollowUpHit: totalExplosionPerUnit,
        baseExplosionDamage,
        explosionDamageWithCrit,
        critAvgMult,
        storingAttacks,
        directStoredDmg,
        dotStoredDmg,
        illusionEffectiveness,
        enemiesHit,
        cycleAttacks,
        cycleTimeSeconds,
        dps: illusionDpsVal,
        isStatusEffect: true
      }
    ];
    singleFuaDmg = totalExplosionPerUnit;
  } else if (isCursedImmortal) {
    const hasMemoryPendant = relics.some(r => r.name === "Memory Pendant");
    const caringScale = hasMemoryPendant ? 0.75 : 0.50;
    const coldScale = hasMemoryPendant ? 1.50 : 1.25;
    if (caringState) {
      unitDirectDPS = (avgHitDamage * caringScale) / 1.0;
      effSpa = 1.0;
    } else if (coldState) {
      unitDirectDPS = (avgHitDamage * coldScale) / 1.0;
      effSpa = 1.0;
    } else {
      unitDirectDPS = avgHitDamage / effSpa;
    }
  } else if (isCrimson) {
    if (crimsonAbilityActive) {
      unitDirectDPS = (effDamage * 0.75 * critAvgMult) / 1.0;
    } else {
      unitDirectDPS = avgHitDamage / effSpa;
    }

    const crimsonExplodeDmg = effDamage * 0.15 * critAvgMult;
    const crimsonExplodeInterval = Math.max(1, Math.ceil(15.0 / effSpa) * effSpa);
    const crimsonExplodeDps = crimsonExplodeDmg / crimsonExplodeInterval;

    const crimsonPoolDps = (crimsonPoolCount * 0.30 * effDamage * critAvgMult) / 6.0;

    const bleedScale = 0.65 * (1 + (trait.dotBonus || 0)) * (1 + relicDotBonus);
    const bleedDmg = effDamage * bleedScale;
    const bleedInterval = Math.max(1, Math.ceil(6.0 / effSpa) * effSpa);
    const bleedDps = bleedDmg / bleedInterval;

    unitDoTDPS = crimsonExplodeDps + crimsonPoolDps + bleedDps;

    base.dotName = "Crimson & Bleed";
  } else if (isRazorjaw) {
    unitDirectDPS = avgHitDamage / effSpa;
    unitDoTDPS = (base.dotMultiplier || 0) > 0 ? (dotDamage / dotIntervalSPA) : 0;

    const roarInterval = 10;
    const roarDmg = effDamage * 0.35;
    const roarAvgHit = roarDmg * critAvgMult;
    const roarDps = roarAvgHit / roarInterval;

    fuaDps = roarDps;
    fuaBreakdowns = [
      {
        index: 0,
        name: "Roar (Every 10s)",
        inputDamage: effDamage,
        effectiveFollowUpDamage: roarDmg,
        averageFollowUpHit: roarAvgHit,
        roarInterval,
        critAvgMult,
        dps: roarDps,
        isTimedFua: true
      }
    ];
    singleFuaDmg = roarAvgHit;
  } else if (isBioinsect) {
    unitDirectDPS = avgHitDamage / effSpa;
    unitDoTDPS = 0;

    if (bioinsectForm === "imperfect") {
      unit._bioinsectSuppressSummon = true;
    } else {
      unit._bioinsectSuppressSummon = false;
    }
  } else if (isCarrot) {
    unitDoTDPS = 0;

    if (carrotInstantRelocation) {
      const hasCarrotGi = relics.some(r => r.name === "Carrot's Gi");
      const fuaMult = hasCarrotGi ? 1.25 : 0.75;
      const fuaInterval = 20;
      const relocationFuaDmg = effDamage * fuaMult;
      const relocationAvgHit = relocationFuaDmg * critAvgMult;

      const animTime = base.attackTime > 0 ? base.attackTime : 4.9;
      const totalCycleTime = fuaInterval + animTime;
      const directAttacksPerCycle = fuaInterval / effSpa;
      const totalDirectDamageInCycle = directAttacksPerCycle * avgHitDamage;
      unitDirectDPS = totalDirectDamageInCycle / totalCycleTime;

      const relocationDps = relocationAvgHit / totalCycleTime;

      fuaDps = relocationDps;
      fuaBreakdowns = [
        {
          index: 0,
          name: `Instant Relocation FUA (${hasCarrotGi ? "125% Carrot's Gi" : "75% Base"})`,
          inputDamage: effDamage,
          effectiveFollowUpDamage: relocationFuaDmg,
          averageFollowUpHit: relocationAvgHit,
          relocationInterval: fuaInterval,
          animTime,
          totalCycleTime,
          critAvgMult,
          dps: relocationDps,
          isTimedFua: true
        }
      ];
      singleFuaDmg = relocationAvgHit;
    } else {
      unitDirectDPS = avgHitDamage / effSpa;
    }
  } else if (isProdigy) {
    unitDoTDPS = 0;

    const hasMentorsCape = relics.some(r => r.name === "Mentors Cape");
    let prodigyFuaMult = 0.25;
    let prodigyFuaAttacksNeeded = 4;

    if (prodigyRageUnleashed) {
      prodigyFuaMult = 0.75;
      prodigyFuaAttacksNeeded = 3;
    } else if (hasMentorsCape) {
      prodigyFuaMult = 0.50;
      prodigyFuaAttacksNeeded = 3;
    }

    const prodigyFuaInterval = prodigyFuaAttacksNeeded * effSpa;
    const prodigyFuaRawDmg = effDamage * prodigyFuaMult;
    const prodigyFuaAvgHit = prodigyFuaRawDmg * critAvgMult;
    const prodigyFuaDps = prodigyFuaAvgHit / prodigyFuaInterval;

    let fatherSonDps = 0;
    let fatherSonAvgHit = 0;
    if (prodigyFatherAndSonActive) {
      const fatherSonRawDmg = effDamage * 0.75;
      fatherSonAvgHit = fatherSonRawDmg * critAvgMult;
      fatherSonDps = fatherSonAvgHit / 1.0;
    }

    const statusDmgBonus = prodigyStatusEffects * 0.10;
    const statusDmgMult = 1 + statusDmgBonus;

    unitDirectDPS = (avgHitDamage * statusDmgMult) / effSpa;

    fuaDps = (prodigyFuaDps + fatherSonDps) * statusDmgMult;
    fuaBreakdowns = [
      {
        index: 0,
        name: `Prodigy FUA (${prodigyRageUnleashed ? "75% Rage Unleashed" : hasMentorsCape ? "50% Mentors Cape" : "25% Base"} every ${prodigyFuaAttacksNeeded} attacks)`,
        inputDamage: effDamage,
        effectiveFollowUpDamage: prodigyFuaRawDmg,
        averageFollowUpHit: prodigyFuaAvgHit * statusDmgMult,
        intervalSpa: prodigyFuaInterval,
        critAvgMult,
        dps: prodigyFuaDps * statusDmgMult,
      }
    ];

    if (prodigyFatherAndSonActive) {
      fuaBreakdowns.push({
        index: 1,
        name: `Father and Son Spirit Energy (75%/s)`,
        inputDamage: effDamage,
        effectiveFollowUpDamage: effDamage * 0.75,
        averageFollowUpHit: fatherSonAvgHit * statusDmgMult,
        intervalSpa: 1.0,
        critAvgMult,
        dps: fatherSonDps * statusDmgMult,
        isAbility: true
      });
    }
    singleFuaDmg = fuaBreakdowns.reduce((sum, b) => sum + b.averageFollowUpHit, 0);
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
        const attacksNeeded = (effSpa * 3 < 15) ? 4 : 3;
        const intervalSpa = effSpa * attacksNeeded;
        const dps = inputDamage > 0 ? averageFollowUpHit / intervalSpa : 0;

        return {
          index,
          name: isCursedStudent ? `Unit ${index + 1} Mimicry FUA` : `FUA ${index + 1}`,
          inputDamage,
          fuaDamageScale,
          relicArchetypeDamageMult,
          effectiveFollowUpDamage,
          effDamage,
          combinedHitDamage,
          averageFollowUpHit,
          critAvgMult: fuaCritMultiplier,
          intervalSpa,
          attacksNeeded,
          dps,
          isMimicryFua: isCursedStudent
        };
      })
      : [];
    fuaDps = fuaBreakdowns.reduce((total, entry) => total + entry.dps, 0);
    singleFuaDmg = fuaBreakdowns.reduce((total, entry) => total + entry.averageFollowUpHit, 0);
  }

  // ── Multi-Summon Calculation Engine (Direct DPS + DoT DPS) ──
  let totalSummonDPS = 0;
  let totalSummonDmg = 0;
  let summonCount = 0;
  let summonDamageMult = 0;
  let summonDamage = 0;
  let summonAvgHitDamage = 0;
  let summonDirectDPS = 0;
  let summonDoTDPS = 0;
  let hasSummonRelicOverride = false;

  const rawSummons = getSummonsData(unit);
  const summonBreakdowns = [];

  if (rawSummons) {
    const list = Array.isArray(rawSummons) ? rawSummons : [rawSummons];

    list.forEach((sData, sIndex) => {
      let singlePlacementCount = sData.countPerPlacement || 1;
      let mult = sData.baseDamageMultiplier || 1.0;

      if (sData.relicModifiers) {
        const activeUnitEquip = unit.selectedDpsRelic !== undefined
          ? unit.selectedDpsRelic
          : (unit.relic?.name || unit.recommendedEquips?.unitEquip);
        const match = sData.relicModifiers.find(m => m.relicName === activeUnitEquip);
        if (match) {
          mult = match.damageMultiplierOverride || match.multiplier || mult;
          hasSummonRelicOverride = true;
        }
      }

      if (sData.passiveDamageBonus) {
        mult *= (1 + sData.passiveDamageBonus);
      }

      let sEffDmg = 0;
      let baseSummonDmg = 0;

      if (sData.hasOwnUpgrades && sData.maxDamage) {
        baseSummonDmg = sData.maxDamage * levelMult;
        sEffDmg = baseSummonDmg * (1 + (trait.damageBonus || 0)) * (1 + relicDamageMult + relicArchetypeDamageMult);
        if (statMode === "Z") sEffDmg *= 1.20;
        if (hasAscend) sEffDmg *= 1.15;
      } else {
        // noShinigamiPassive means the summon should not benefit from any passive buffs
        // (Shinigami Sword passive AND Bio Reset stacks, etc.) — use the clean pre-passive base
        const baseDmgForSummon = sData.noShinigamiPassive ? prePassiveEffDamage : effDamage;
        baseSummonDmg = scaledBaseDamage * mult;
        sEffDmg = baseDmgForSummon * mult;
      }

      let baseSummonSpa = sData.intervalSPA || sData.maxSpa || sData.baseSpa || (base.spa || 6);
      let sAttackTime = parseNumber(sData.attackTime, 0);
      let sEffSpa = baseSummonSpa * (1 + (trait.spaBonus || 0)) * (1 + relicSpaMult);
      if (statMode === "Z") sEffSpa *= 0.85;

      if (sAttackTime > 0) {
        sEffSpa = Math.max(sAttackTime, sEffSpa);
      } else {
        sEffSpa = Math.max(0.1, sEffSpa);
      }

      const sAvgHit = sEffDmg * critAvgMult;
      const sSinglePlacementDps = (sAvgHit * singlePlacementCount) / sEffSpa;

      const appliesBleed = (sData.status && sData.status.toLowerCase().includes("bleed")) ||
        (sData.statusEffect && sData.statusEffect.name && sData.statusEffect.name.toLowerCase().includes("bleed")) ||
        (base.dotName && base.dotName.toLowerCase().includes("bleed"));

      let sDoTDps = 0;
      let sDotScale = 0;
      let sDotDmg = 0;
      if (appliesBleed) {
        const baseBleedScale = base.dotMultiplier || 0.65;
        sDotScale = baseBleedScale * (1 + (trait.dotBonus || 0)) * (1 + relicDotBonus);
        sDotDmg = sEffDmg * sDotScale;
        sDoTDps = (sDotDmg * singlePlacementCount) / (dotIntervalSPA || 9.1);
      }

      const sTotalDps = sSinglePlacementDps + sDoTDps;

      totalSummonDPS += sTotalDps;
      totalSummonDmg += sAvgHit * singlePlacementCount;

      if (sIndex === 0) {
        summonCount = singlePlacementCount;
        summonDamageMult = mult;
        summonDamage = sEffDmg;
        summonAvgHitDamage = sAvgHit;
        summonDirectDPS = sSinglePlacementDps;
        summonDoTDPS = sDoTDps;
      }

      const traitDmgBonus = trait.damageBonus || 0;
      const relicTotalDmgMult = relicDamageMult + relicArchetypeDamageMult;
      const isZStat = statMode === "Z";

      summonBreakdowns.push({
        id: sData.id,
        name: sData.name || sData.id || "Summon",
        activeCount: singlePlacementCount,
        hasOwnUpgrades: !!sData.hasOwnUpgrades,
        rawMaxDamage: sData.maxDamage || 0,
        levelMult,
        baseDamage: baseSummonDmg,
        summonDamageMult: mult,
        traitDmgBonus,
        relicTotalDmgMult,
        isZStat,
        hasAscend,
        effDamage: sEffDmg,
        baseSpa: baseSummonSpa,
        traitSpaBonus: trait.spaBonus || 0,
        relicSpaMult,
        effSpa: sEffSpa,
        critAvgMult,
        effCritChance,
        effCritDamage,
        avgHitDamage: sAvgHit,
        directDps: sSinglePlacementDps,
        dotDps: sDoTDps,
        dotScale: sDotScale,
        dotDamage: sDotDmg,
        dotIntervalSPA: dotIntervalSPA || 9.1,
        dotName: base.dotName || "Bleed",
        dps: sTotalDps,
        passiveNote: sData.passive || ""
      });
    });
  }

  const combinedDPS = unitDirectDPS + unitDoTDPS + totalSummonDPS + fuaDps;

  const directHitDmg = (isDarkMage && darkMageMode === "lightning") ? 0 : avgHitDamage;
  const dotDmgVal = (base.dotMultiplier || 0) > 0
    ? (isDarkMage ? (darkMageMode === "normal" ? 0 : effDamage * effDotMult) : dotDamage)
    : (isEighthSword && demonicPresence ? avgHitDamage * 0.15 : 0);

  const singlePlacementDmg = directHitDmg + dotDmgVal + totalSummonDmg;

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
    rawCritChance,
    effCritChance,
    effCritDamage,
    critAvgMult,
    avgHitDamage,
    effDotMult,
    unitDirectDPS,
    unitDoTDPS,
    totalPassiveDamageBonus,
    passiveDamageMult,
    passiveSpaMult,
    passiveRangeMult,
    passiveCritChanceAdd,
    passiveCritDamageAdd,
    relicDamageMult,
    relicArchetypeDamageMult,
    relicSpaMult,
    relicRangeMult,
    relicCritChanceAdd,
    relicCritDamageAdd,
    relicDotBonus,
    shinigamiActive,
    hasWarriorPole,
    isTransformed,
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
    summonBreakdowns,
    isElfMage,
    isDarkMage,
    darkMageMode,
    isReaper,
    isLadyGiant,
    giantForm,
    isEighthSword,
    berserkState,
    demonicPresence,
    isCrow,
    crowEnemiesHit: unit.crowEnemiesHit !== undefined ? unit.crowEnemiesHit : 5,
    isCrimson,
    crimsonAbilityActive: isCrimson ? crimsonAbilityActive : false,
    crimsonPoolCount: isCrimson ? crimsonPoolCount : 0,
    isCursedImmortal,
    caringState,
    coldState,
    isRazorjaw,
    isVegetable,
    royalRivalry,
    awakenedPride,
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
    isBioinsect,
    bioinsectForm,
    bioinsectResetStacks,
    bioinsectCopiedUnitId: unit.bioinsectCopiedUnitId || null,
    isCarrot,
    carrotTransformation,
    carrotInstantRelocation,
    isProdigy,
    prodigyRageUnleashed,
    prodigyStatusEffects: isProdigy ? prodigyStatusEffects : 0,
    prodigyStatusDmgMult: isProdigy ? (1 + prodigyStatusEffects * 0.10) : 1,
    isHeadCaptain,
    headCaptainBurningEnemies,
    headCaptainBurnStacks,
    effectiveCritRate,
    battleInstinctBonusCrit,
  };
}