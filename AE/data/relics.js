import { relicStats } from "./relicstats.js";
import { relicImgByName } from "../icons/icons.js";

function formatStatValue(v) {
  if (v == null || v === "") return "";
  if (typeof v === "object") {
    const lo = v.min || "";
    const hi = v.max || "";
    if (!lo && !hi) return "";
    if (lo && hi) return `${lo} - ${hi}`;
    return lo || hi;
  }
  return String(v);
}

function formatStatBlock(b) {
  if (!b) return "";
  const parts = [];
  const dmg = formatStatValue(b.damage);
  if (dmg) parts.push(`Damage ${dmg}`);
  const cr = formatStatValue(b.critChance);
  if (cr) parts.push(`Crit Rate ${cr}`);
  const cd = formatStatValue(b.critDamage);
  if (cd) parts.push(`Crit Dmg ${cd}`);
  const spa = formatStatValue(b.spa);
  if (spa) parts.push(`SPA ${spa}`);
  const rng = formatStatValue(b.range);
  if (rng) parts.push(`Range ${rng}`);
  const md = formatStatValue(b.magicdamage);
  if (md) parts.push(`Magic DMG ${md}`);
  const pd = formatStatValue(b.physicaldamage);
  if (pd) parts.push(`Phys DMG ${pd}`);
  return parts.join(" / ");
}

function deriveStats(r) {
  const blocks = (r.stats || []).map(formatStatBlock).filter(Boolean);
  let out = blocks.join("  |  ");
  if (r.passive) {
    out += (out ? "  —  " : "") + `${r.passive.name}: ${r.passive.desc}`;
  }
  return out || "---";
}

const UNIT_NAME_MAP = {
  "cursedstudent.js": "Cursed Student (True Love)",
  "elfmage.js": "Elf Mage (Unleashed)",
  "ShadowDivine": "Shadow Divine",
  "8thSword": "8th Sword",
  "Reaper": "Reaper (Released)",
  "Puppet": "Puppet (Telekinetic)",
  "LadyGiant": "Lady Giant",
  "StringDemon": "String Demon",
  "FlameEmperor": "Flame Emperor",
  "HollowBlaze": "Hollow Blaze",
  "SalmonSorcerer": "Salmon Sorcerer",
  "DarkMage": "Dark Mage (Sovereign)",
  "Crow": "Crow (Black Fire)",
  "Razorjaw": "Razorjaw (Hunter)",
  "CursedImmortal": "Cursed Immortal (Black Sun)",
  "VegetablePrince": "Vegetable (Prince)",
};

const rawRelics = [
  {
    id: "relic-predators-skull",
    name: "Predator's Skull",
    image: relicImgByName("Predator's Skull"),
    unitEquip: "Razorjaw (Hunter)",
  },
  {
    id: "relic-memory-pendant",
    name: "Memory Pendant",
    image: relicImgByName("Memory Pendant"),
    unitEquip: "Cursed Immortal (Black Sun)",
  },
  {
    id: "relic-illusion-crow",
    name: "Illusion Crow",
    image: relicImgByName("Illusion Crow"),
    unitEquip: "Crow (Black Fire)",
  },
  {
    id: "relic-dark-scepter",
    name: "Dark Scepter",
    image: relicImgByName("Dark Scepter"),
    unitEquip: "Dark Mage (Sovereign)",
  },
  {
    id: "relic-promise-ring",
    name: "Promise Ring",
    image: relicImgByName("Promise Ring"),
    unitEquip: "Cursed Student (True Love)",
  },
  {
    id: "relic-elven-battle-staff",
    name: "Elven Battle Staff",
    image: relicImgByName("Elven Battle Staff"),
    unitEquip: "Elf Mage (Unleashed)",
  },
  {
    id: "relic-pirates-slingshot",
    name: "Pirate's Slingshot",
    image: relicImgByName("Pirate's Slingshot"),
  },
  {
    id: "relic-elf-suitcase",
    name: "Elf Suitcase",
    image: relicImgByName("Elf Suitcase"),
  },
  {
    id: "relic-raid-cape",
    name: "Raid Cape",
    image: relicImgByName("Raid Cape"),
  },
  {
    id: "relic-bamboo-bottle",
    name: "Bamboo Bottle",
    image: relicImgByName("Bamboo Bottle"),
  },
  {
    id: "relic-magic-orb",
    name: "Magic Orb",
    image: relicImgByName("Magic Orb"),
  },
  {
    id: "relic-soul-splitter",
    name: "Soul Splitter",
    image: relicImgByName("Soul Splitter"),
  },
  {
    id: "relic-dragon-hilt",
    name: "Dragon Hilt",
    image: relicImgByName("Dragon Hilt"),
  },
  {
    id: "relic-kunai",
    name: "Kunai",
    image: relicImgByName("Kunai"),
  },
  {
    id: "relic-enhanced-katana",
    name: "Enhanced Katana",
    image: relicImgByName("Enhanced Katana"),
  },
  {
    id: "relic-three-swords-from-hell",
    name: "Three Swords From Hell",
    image: relicImgByName("Three Swords From Hell"),
  },
  {
    id: "relic-shinigami-sword",
    name: "Shinigami Sword",
    image: relicImgByName("Shinigami Sword"),
  },
  {
    id: "relic-staff-of-chaos",
    name: "Staff of Chaos",
    image: relicImgByName("Staff of Chaos"),
  },
  {
    id: "relic-warriors-axe",
    name: "Warrior's Axe",
    image: relicImgByName("Warrior's Axe"),
  },
  {
    id: "relic-katana",
    name: "Katana",
    image: relicImgByName("Katana"),
  },
  {
    id: "relic-accursed-equipment",
    name: "Accursed Equipment",
    image: relicImgByName("Accursed Equipment"),
  },
  {
    id: "relic-red-finger",
    name: "Red Finger",
    image: relicImgByName("Red Finger"),
  },
  {
    id: "relic-magic-book",
    name: "Magic Book",
    image: relicImgByName("Magic Book"),
  },
  {
    id: "relic-hexed-blade",
    name: "Hexed Blade",
    image: relicImgByName("Hexed Blade"),
    unitEquip: "Shadow Divine",
  },
  {
    id: "relic-hair-bells",
    name: "Hair Bells",
    image: relicImgByName("Hair Bells"),
    unitEquip: "8th Sword",
  },
  {
    id: "relic-spirit-of-the-moonblade",
    name: "Spirit of the Moonblade",
    image: relicImgByName("Spirit of the Moonblade"),
    unitEquip: "Reaper",
  },
  {
    id: "relic-calamitys-eye",
    name: "Calamity's Eye",
    image: relicImgByName("Calamity's Eye"),
    unitEquip: "Puppet (Telekinetic)",
  },
  {
    id: "relic-boulder",
    name: "Boulder",
    image: relicImgByName("Boulder"),
    unitEquip: "Lady Giant",
  },
  {
    id: "relic-webbed-fruit",
    name: "Webbed Fruit",
    image: relicImgByName("Webbed Fruit"),
    unitEquip: "String Demon",
  },
  {
    id: "relic-emperors-attire",
    name: "Emperor's Attire",
    image: relicImgByName("Emperor's Attire"),
    unitEquip: "Flame Emperor",
  },
  {
    id: "relic-hells-flower",
    name: "Hell's Flower",
    image: relicImgByName("Hell's Flower"),
    unitEquip: "Hollow Blaze",
  },
  {
    id: "relic-technique-amplifier",
    name: "Technique Amplifier",
    image: relicImgByName("Technique Amplifier"),
    unitEquip: "Salmon Sorcerer",
  },
  {
    id: "relic-royal-gi",
    name: "Royal Gi",
    image: relicImgByName("Royal Gi"),
    unitEquip: "Vegetable (Prince)",
  },
];

rawRelics.forEach((r) => {
  const def = relicStats[r.name];
  if (def) {
    r.stats = def.stats;
    r.passive = def.passive;
  }
});

export const relics = rawRelics.map((r) => {
  const resolvedUnitName = UNIT_NAME_MAP[r.unitEquip] || r.unitEquip;
  return {
    ...r,
    unitEquip: resolvedUnitName,
    derivedStats: deriveStats(r),
    location: resolvedUnitName ? `Unit Equip: ${resolvedUnitName}` : "Any unit",
  };
});

export const unitRelics = relics.filter((r) => r.unitEquip);
export const globalRelics = relics.filter((r) => !r.unitEquip);