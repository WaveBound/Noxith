unitDatabase.push({
    id: "Maid",
    name: "Scarlet Maid (World)",
    img: "images/units/Maid.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Damage / Support",
    tags: ["Royalty"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 80700,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3.5,
        passiveDmg: 0,
        element: "Light",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 156, spa: 4, range: 16, cost: 1400 },    // Up 0 (Base)
        { dmg: 286, spa: 4, range: 17, cost: 2600 },    // Up 1
        { dmg: 429, spa: 4, range: 18, cost: 4200 },    // Up 2
        { dmg: 715, spa: 5, range: 20, cost: 6000 },    // Up 3
        { dmg: 910, spa: 5, range: 20, cost: 6500 },    // Up 4
        { dmg: 1170, spa: 5, range: 22, cost: 7500 },   // Up 5
        { dmg: 1430, spa: 5, range: 24, cost: 8500 },   // Up 6
        { dmg: 1690, spa: 5, range: 24, cost: 10000 },  // Up 7
        { dmg: 2015, spa: 5, range: 26, cost: 12000 },  // Up 8
        { dmg: 2730, spa: 5, range: 28, cost: 22000 }   // Up 9
    ]
});
