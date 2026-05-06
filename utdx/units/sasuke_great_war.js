unitDatabase.push({
    id: "sasuke_great_war",
    name: "Sasku (Great War)",
    img: "images/units/SasukeGreatWar.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage / Debuff",
    tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "The suggested Ruler trait is intended for fusing to create Majestic Armor (Syncro)."

    },
    totalCost: 69000,
    stats: {
        spaCap: 4,
        crit: 0, cdmg: 150,
        dot: 60, dotDuration: 10, dotStacks: 1,
        element: "Dark",
        passiveDmg: 0
    },

    upgrades: [
        { dmg: 220, spa: 8, range: 23, cost: 2000 },   // Up 0 (Base)
        { dmg: 580, spa: 8, range: 26, cost: 3000 },   // Up 1
        { dmg: 950, spa: 8, range: 29, cost: 9500 },   // Up 2
        { dmg: 1680, spa: 9, range: 32, cost: 12500 }, // Up 3
        { dmg: 2450, spa: 9, range: 35, cost: 18500 }, // Up 4
        { dmg: 3000, spa: 9, range: 40, cost: 23500 }  // Up 5
    ],
    passives: [
        { name: "Spirited Cage", desc: "Stunning enemies builds charges. At full charge: +50% True Damage and Stun Immunity for 10s." },
        { name: "Clanhood", desc: "Gain +10% Damage for every 'Bloodline' tag unit in range." },
        { name: "Dimensional Warp", desc: "Execute enemies below 30% HP (40% at E2). Bosses take 300% instant damage + 3% Burn/s." },
        { name: "Pure Hatred", desc: "Enemies entering range take +15% Damage. Dark enemies are stunned for 3s." },
        { name: "Combat Arts", desc: "Almighty Push (40s CD): 200% Dmg + Push. Almighty Pull (50s CD): 5s Stun. Amenatejikara: Crit Buffs." }
    ],
    etherealization: [
        "+10 Stat Points",
        "Dimensional Warp trigger requirement increased to 40% Health.",
        "+10 Stat Points",
        "Spirited Cage charge requirement reduced to 3 stuns.",
        "+10 Stat Points",
        "Full Susanoo: Damage Bonus increased to +150%."
    ]
});
