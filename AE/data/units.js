import cursedStudent from "./units/cursedstudent.js";
import elfMage from "./units/elfmage.js";
import puppet from "./units/puppet.js";
import darkmagesovereign from "./units/darkmagesovereign.js";
import reaperreleased from "./units/reaperreleased.js";
import ladygiantenvy from "./units/ladygiantenvy.js";
import eighthswordberserk from "./units/8thswordberserk.js";
import shadowdivine from "./units/shadowdivine.js";
import crowblackfire from "./units/crowblackfire.js";
import razorjawhunter from "./units/razorjawhunter.js";
import crimsonbrother from "./units/crimsonbrother.js";
import cursedimmortalblacksun from "./units/cursedimmortalblacksun.js";
import vegetableprince from "./units/vegetableprince.js";
import bioinsect from "./units/bioinsect.js";
import carrotunleashed from "./units/carrotunleashed.js";
import prodigyrage from "./units/prodigyrage.js";
import thedrinkjuicebox from "./units/thedrinkjuicebox.js";
import cubert from "./units/cubert.js";

import { getRelicStatsByName } from "./relicstats.js";
import { relicImgByName } from "../icons/icons.js";

const rawUnits = [
  cursedStudent,
  elfMage,
  puppet,
  darkmagesovereign,
  reaperreleased,
  ladygiantenvy,
  eighthswordberserk,
  shadowdivine,
  crowblackfire,
  razorjawhunter,
  crimsonbrother,
  cursedimmortalblacksun,
  vegetableprince,
  bioinsect,
  carrotunleashed,
  prodigyrage,
  thedrinkjuicebox,
  cubert,
];

function formatRange(v) {
  if (v == null || v === "") return v;
  if (typeof v === "object") {
    const lo = v.min || "";
    const hi = v.max || "";
    if (!lo && !hi) return "";
    if (lo && hi) return `${lo} ~ ${hi}`;
    return lo || hi;
  }
  return v;
}

function relicStatsToModifiers(stats) {
  const iconFor = {
    damage: "damage",
    critChance: "critChance",
    critDamage: "critDamage",
    spa: "spa",
    range: "range",
    magicdamage: "magicdamage",
    physicaldamage: "physicaldamage",
  };
  const labelFor = {
    damage: "Damage",
    critChance: "Crit Chance",
    critDamage: "Crit Damage",
    spa: "SPA",
    range: "Range",
    magicdamage: "Magical DMG",
    physicaldamage: "Physical DMG",
  };
  const mods = [];
  (stats || []).forEach((block) => {
    Object.entries(block).forEach(([key, val]) => {
      if (!val) return;
      let value;
      if (typeof val === "object") {
        const lo = val.min || "";
        const hi = val.max || "";
        if (!lo && !hi) return;
        value = lo && hi ? `${lo} - ${hi}` : (lo || hi);
      } else {
        value = String(val);
      }
      mods.push({
        icon: iconFor[key] || "damage",
        label: labelFor[key] || key,
        value,
      });
    });
  });
  return mods;
}

function resolveEquip(name) {
  if (!name) return null;
  const def = getRelicStatsByName(name);
  return {
    name,
    image: relicImgByName(name),
    modifiers: def ? relicStatsToModifiers(def.stats) : [],
    passive: def && def.passive ? `${def.passive.name}: ${def.passive.desc}` : null,
  };
}

function normalize(u) {
  const s = u.stats || {};
  const equips = u.recommendedEquips || {};

  const relicDef = equips.unitEquip ? getRelicStatsByName(equips.unitEquip) : null;
  const relic = relicDef
    ? {
      name: equips.unitEquip,
      image: relicImgByName(equips.unitEquip),
      modifiers: relicStatsToModifiers(relicDef.stats),
      passive: relicDef.passive ? `${relicDef.passive.name}: ${relicDef.passive.desc}` : null,
    }
    : null;

  const equipment = [];
  if (equips.equip1) {
    const eq = resolveEquip(equips.equip1);
    if (eq) equipment.push({ slot: equipment.length, ...eq });
  }
  if (equips.equip2) {
    const eq = resolveEquip(equips.equip2);
    if (eq) equipment.push({ slot: equipment.length, ...eq });
  }

  const maxPlacement = (u.placement && Array.isArray(u.placement) && u.placement.length > 0)
    ? u.placement[u.placement.length - 1]
    : null;
  const finalAttackType = maxPlacement?.aoe || s.attackType || s.archetype || "—";

  const updateMap = {
    thedrinkjuicebox: "1.0",
    vegetableprince: "1.0",
    prodigyrage: "1.0",
    carrotunleashed: "1.0",
    bioinsect: "1.0",
    cubert: "1.0",
    darkmagesovereign: "0.5",
    razorjawhunter: "0.5",
    crowblackfire: "0.5",
  };

  const unitUpdate = updateMap[u.id] || "Release";

  return {
    id: u.id,
    name: u.name,
    update: unitUpdate,
    image: u.image || "assets/placeholder.svg",
    ascend: u.ascend || 0,
    tiers: u.tiers || [],
    preferredTrait: s.recommendedTrait || "—",
    description: "",
    statusEffects: u.statusEffects || [],
    summons: u.summons || null,
    stats: {
      damage: formatRange(s.damage),
      spa: formatRange(s.spa),
      range: formatRange(s.range),
      critChance: formatRange(s.critChance),
      critDamage: formatRange(s.critDamage),
      element: s.element,
      archetype: s.archetype,
      attackType: finalAttackType,
      maxTargets: 1,
    },
    totalCost: s.totalCost,
    placementCount: s.placementCount,
    placement: u.placement || [],
    relic,
    equipment,
    bestTraits: u.bestTraits || [],
    passives: (u.passives || []).map((p) => ({ name: p.name, effect: p.desc })),
    abilities: (u.abilities || []).map((a) => ({ name: a.name, effect: a.desc, cooldown: a.cooldown })),
    isBioinsectUnit: !!u.isBioinsectUnit,
    bioinsectCopiedUnitId: u.bioinsectCopiedUnitId || null,
    bioinsectForm: u.bioinsectForm || "imperfect",
    bioinsectResetStacks: u.bioinsectResetStacks || 0,
  };
}

export const units = rawUnits.map(normalize);

export function getUnitById(id) {
  return units.find((u) => u.id === id) || null;
}