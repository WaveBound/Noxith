unitDatabase.push({
    id: "kenpachi",
    name: "Berserker",
    img: "images/units/Kenpachi.png",
    level: 70,
    placement: 3,
    placementType: "Hybrid",
    role: "Damage / Slow",
    tags: ["Peroxide", "Reaper", "Rage"],
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
        { dmg: 150, spa: 5, range: 20, cost: 800 },    // Up 0 (Base)
        { dmg: 225, spa: 5, range: 20, cost: 1200 },   // Up 1
        { dmg: 335, spa: 5, range: 20, cost: 1800 },   // Up 2
        { dmg: 540, spa: 6, range: 22, cost: 2400 },   // Up 3 (AoE → Cone)
        { dmg: 700, spa: 6, range: 22, cost: 3800 },   // Up 4
        { dmg: 1000, spa: 6, range: 22, cost: 5400 },  // Up 5
        { dmg: 1600, spa: 8, range: 24, cost: 8000 },  // Up 6 (AoE → Line)
        { dmg: 1750, spa: 7, range: 24, cost: 9800 },  // Up 7
        { dmg: 1900, spa: 10, range: 27, cost: 12500 }, // Up 8 (AoE → Full AoE, Gains Hybrid)
        { dmg: 2400, spa: 10, range: 27, cost: 16000 }  // Up 9
    ]
});
