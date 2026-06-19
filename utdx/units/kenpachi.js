unitDatabase.push({
    id: "kenpachi",
    name: "Berserker",
    img: "images/units/Kenpachi.png",
    level: 70,
    placement: 1,
    placementType: "Hybrid",
    role: "Damage / Slow",
    tags: ["Peroxide", "Reaper", "Rage", "Uncontrollable Power", "Sword"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 61700,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2.0,
        element: "Light",
        support: "Slow"
    },

    upgrades: [
        { dmg: 180, spa: 5, range: 20, cost: 800 },    // Up 0 (Base)
        { dmg: 270, spa: 5, range: 20, cost: 1200 },   // Up 1
        { dmg: 402, spa: 5, range: 20, cost: 1800 },   // Up 2
        { dmg: 648, spa: 6, range: 22, cost: 2400 },   // Up 3 (AoE → Cone)
        { dmg: 840, spa: 6, range: 22, cost: 3800 },   // Up 4
        { dmg: 1200, spa: 6, range: 22, cost: 5400 },  // Up 5
        { dmg: 1920, spa: 8, range: 24, cost: 8000 },  // Up 6 (AoE → Line)
        { dmg: 2100, spa: 7, range: 24, cost: 9800 },  // Up 7
        { dmg: 2280, spa: 10, range: 27, cost: 12500 }, // Up 8 (AoE → Full AoE, Gains Hybrid)
        { dmg: 2880, spa: 10, range: 27, cost: 16000 }  // Up 9
    ],
    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Cut Through EVERYTHING!!!",
            desc: "On Attack:<br>• Ignores 70% Elemental Restrictions on Armor/Hyperarmor."
        },
        {
            name: "Spirit Aura",
            desc: "During Attack:<br>• Slows Enemies by 20%<br>• Increases enemy damage taken by 15%."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points", // E1
        "When this unit fully depletes 10 enemies' armor or hyper armor, gain 10% Damage and Range for 3 attacks. (Max 30%)", // E2
        "+10 Stat Points", // E3
        "This unit deals 15% more damage to enemy armor and hyper armor.", // E4
        "+10 Stat Points", // E5
        "Passive Ability: Cut Through EVERYTHING!!! gains an additional 20% elemental pierce.", // E6
    ]
});
