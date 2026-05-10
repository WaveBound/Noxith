unitDatabase.push({
    id: "ragna",
    name: "Dragon Guy",
    img: "images/units/Ragna.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Burst",
    tags: ["Main Character", "Hero"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 75700,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 12,
        element: "Ice"
    },

    upgrades: [
        { dmg: 260, spa: 8, range: 23, cost: 2200 },   // Up 0 (Base)
        { dmg: 320, spa: 8, range: 24, cost: 2800 },   // Up 1
        { dmg: 440, spa: 8, range: 24, cost: 3800 },   // Up 2
        { dmg: 480, spa: 7.5, range: 27, cost: 5200 },  // Up 3
        { dmg: 580, spa: 7.5, range: 27, cost: 6700 },  // Up 4
        { dmg: 700, spa: 7.5, range: 28, cost: 8500 },  // Up 5
        { dmg: 750, spa: 7, range: 29, cost: 9500 },   // Up 6 (Line AoE)
        { dmg: 900, spa: 7, range: 29, cost: 11000 },  // Up 7
        { dmg: 1200, spa: 9, range: 30, cost: 12000 }, // Up 8 (Circle AoE)
        { dmg: 1500, spa: 7, range: 35, cost: 14000, unlocksAbility: true } // Up 9
    ],
    ability: { dmg: 3600, spa: 15, passiveDmg: 72, }
});
