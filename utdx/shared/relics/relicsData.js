// ─── RELIC SETS ─────────────────────────────────────────────
// Full set only — builds always use a complete set (Body + Legs).
// All bonuses: dmg, spa, range, cRate, cDmg, dot, bossDmg, trueDmg
// Passive-based sets reference relicPassives.js via: { passive: "passiveId" }
// rarity: "Mythical" or "Secret" — Secret = stars active (1★ base, 2★ x1.025, 3★ x1.05)
// source: "Raid" or "Story" for Body/Legs
// accessory: head piece set bonus (Accessory is always from Virtual Realm)
// Tag perks are handled in relicPassives.js

const SETS = [
    // === RAID / SECRET SETS ===
    {
        id: "shadow_reaper", name: "Shadow Reaper", rarity: "Secret", source: "Raid",
        bonus: { dmg: 2.5, spa: 0, range: 10, cRate: 5, cDmg: 5, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 2.5, spa: 0, range: 10, cRate: 5, cDmg: 5, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 }
    },
    {
        id: "reaper_set", name: "Reaper Set", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 7.5, range: 15, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 7.5, range: 15, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 }
    },
    {
        id: "rebellious", name: "Rebellious Shinobi", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "rebellious" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "rebellious_acc" }
    },
    {
        id: "reanimated_ninja", name: "Reanimated Ninja", rarity: "Secret", source: "Raid",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 30, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "reanimated_ninja_acc" }
    },
    {
        id: "monarch", name: "Monarch", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "monarch" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "monarch_acc" }
    },
    {
        id: "warlord", name: "Warlord", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "warlord" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 }
    },

    // === STORY / MYTHICAL SETS ===
    {
        id: "sun_god", name: "Sun God", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Light: 10, Water: 10, Ice: 10 } },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "sun_god_acc" }
    },
    {
        id: "laughing", name: "Laughing Captain", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 5, range: 5, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { abilityCd: -5 }
    },
    {
        id: "ex", name: "Ex Captain", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 10, cDmg: 25, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { upgradeRefund: 5 }
    },
    {
        id: "super_roku", name: "Super Roku", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 15, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "super_roku" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "super_roku_acc" }
    },
    {
        id: "bio_android", name: "Bio-Android", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 5, range: 5, cRate: 5, cDmg: 15, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "bio_android_acc" }
    },
    {
        id: "biju_set", name: "Biju Set", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, meterGain: 20 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "biju_acc" }
    },
    {
        id: "great_mage", name: "Great Mage", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 10, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "great_mage" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "great_mage_acc" }
    },
    {
        id: "sorcerer_killer", name: "Sorcerer Killer", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 7.5, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 15, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "sorcerer_killer_acc" }
    },
    {
        id: "strongest_sorcerer", name: "Strongest Sorcerer", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 5, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "strongest_sorcerer" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "strongest_sorcerer_acc" }
    },
    {
        id: "berserk_shinigami", name: "Berserk Shinigami", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Dark: 10, Fire: 10, Rose: 10, Light: 10 } },
        accessory: { passive: "berserk_shinigami_acc" }
    },
    {
        id: "hokage", name: "Hokage", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Dark: 10, Rose: 10, Fire: 10 } },
        accessory: { passive: "hokage_acc" }
    },
    {
        id: "ninja", name: "Junior Ninja", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Wind: 10 } },
        accessory: { buffReceivedMultiplier: 1.1 }
    }
];

// Attach to window for non-module compatibility in index.html
window.SETS = SETS;
