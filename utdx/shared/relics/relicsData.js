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
        accessory: { dmg: 2.5, spa: 0, range: 10, cRate: 5, cDmg: 5, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        location: "Raid 3: Soul Reaper",
        locationImage: "images/location/soul_reaper.png"
    },
    {
        id: "reaper_set", name: "Reaper Set", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 7.5, range: 15, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 7.5, range: 15, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        location: "Raid 3: Soul Reaper",
        locationImage: "images/location/soul_reaper.png"
    },
    {
        id: "rebellious", name: "Rebellious Shinobi", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "rebellious" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "rebellious_acc" },
        location: "Raid 2: Rogue Shinobi",
        locationImage: "images/location/rogue_shinobi.png"
    },
    {
        id: "reanimated_ninja", name: "Reanimated Ninja", rarity: "Secret", source: "Raid",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 30, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "reanimated_ninja_acc" },
        location: "Raid 2: Rogue Shinobi",
        locationImage: "images/location/rogue_shinobi.png"
    },
    {
        id: "monarch", name: "Monarch", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "monarch" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "monarch_acc" },
        location: "Raid 4: Shadow Monarch",
        locationImage: "images/location/shadow_monarch.png"
    },
    {
        id: "warlord", name: "Warlord", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "warlord" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        location: "Raid 1: Sea Warlord",
        locationImage: "images/location/sea_warlord.png"
    },
        {
        id: "fused_set", name: "Fused Warrior", rarity: "Secret", source: "Raid",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, armorDmg: 0, passive: "fused_set" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, passive: "fused_earrings_acc" },
        location: "Raid: Fused Warrior",
        locationImage: "images/location/fused_warrior.png"
    },


    // === STORY / MYTHICAL SETS ===
    {
        id: "sun_god", name: "Sun God", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Light: 10, Water: 10, Ice: 10 } },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "sun_god_acc" },
        location: "Story 7: Wano Valley",
        locationImage: "images/location/wano_valley.png"
    },
    {
        id: "laughing", name: "Laughing Captain", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 5, range: 5, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { abilityCd: -5 },
        location: "Story 7: Wano Valley",
        locationImage: "images/location/wano_valley.png"
    },
    {
        id: "ex", name: "Ex Captain", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 10, cDmg: 25, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { upgradeRefund: 5 },
        location: "Story 5: Karakura Town",
        locationImage: "images/location/karakura_town.png"
    },
    {
        id: "super_roku", name: "Super Roku", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 15, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "super_roku" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "super_roku_acc" },
        location: "Story 4: Planet Namek",
        locationImage: "images/location/planet_namek.png"
    },
    {
        id: "bio_android", name: "Bio-Android", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 5, cRate: 5, cDmg: 15, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "bio_android_acc" },
        location: "Story 4: Planet Namek",
        locationImage: "images/location/planet_namek.png"
    },
    {
        id: "biju_set", name: "Biju Set", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, meterGain: 20 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "biju_acc" },
        location: "Story 3: Leaf Village",
        locationImage: "images/location/leaf_village.png"
    },
    {
        id: "great_mage", name: "Great Mage", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 10, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "great_mage" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "great_mage_acc" },
        location: "Story 6: Clover Kingdom",
        locationImage: "images/location/clover_kingdom.png"
    },
    {
        id: "sorcerer_hunter", name: "Sorcerer Hunter", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 7.5, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 15, hyperArmor: 0, armorDmg: 0 },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "sorcerer_hunter_acc" },
        location: "Story 8: Jujutsu High",
        locationImage: "images/location/jujutsu_high.png"
    },
    {
        id: "strongest_sorcerer", name: "Strongest Sorcerer", rarity: "Mythical", source: "Story",
        bonus: { dmg: 10, spa: 0, range: 5, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "strongest_sorcerer" },
        accessory: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, passive: "strongest_sorcerer_acc" },
        location: "Story 8: Jujutsu High",
        locationImage: "images/location/jujutsu_high.png"
    },
    {
        id: "berserk_shinigami", name: "Berserk Shinigami", rarity: "Mythical", source: "Story",
        bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Dark: 10, Fire: 10, Rose: 10, Light: 10 } },
        accessory: { passive: "berserk_shinigami_acc" },
        location: "Story 5: Karakura Town",
        locationImage: "images/location/karakura_town.png"
    },
    {
        id: "hokage", name: "Hokage", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Dark: 10, Rose: 10, Fire: 10 } },
        accessory: { passive: "hokage_acc" },
        location: "Story 3: Leaf Village",
        locationImage: "images/location/leaf_village.png"
    },
    {
        id: "ninja", name: "Junior Ninja", rarity: "Mythical", source: "Story",
        bonus: { dmg: 5, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, hyperArmor: 0, armorDmg: 0, elemental: { Wind: 10 } },
        accessory: { buffReceivedMultiplier: 1.1 },
        location: "Story 1: Hidden Leaf (Beginner)",
        locationImage: "images/location/hidden_leaf.png"
    }
];

// Attach to window for non-module compatibility in index.html
window.SETS = SETS;
