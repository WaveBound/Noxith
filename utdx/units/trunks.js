unitDatabase.push({
    id: "trunks",
    name: "The Drink",
    img: "images/units/Trunks.png",
    level: 70,
    placement: 4,
    placementType: "Ground",
    role: "Damage / DoT",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Passive averages to +25% Damage."
    },
    totalCost: 41865,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 25,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 45,
        element: "Water",
        dotDuration: 5
    },

    upgrades: [
        { dmg: 85, spa: 7.5, range: 20, cost: 950 },    // Up 0 (Base)
        { dmg: 170, spa: 7.6, range: 20, cost: 1350 },  // Up 1
        { dmg: 245, spa: 7.0, range: 20, cost: 2225 },  // Up 2
        { dmg: 375, spa: 8.5, range: 25, cost: 2650 },  // Up 3
        { dmg: 500, spa: 8.5, range: 25, cost: 3050 },  // Up 4
        { dmg: 635, spa: 8.5, range: 28, cost: 3385 },  // Up 5
        { dmg: 680, spa: 6.5, range: 30, cost: 4235 },  // Up 6 (AoE → Full)
        { dmg: 740, spa: 6.0, range: 30, cost: 4235 },  // Up 7
        { dmg: 865, spa: 6.0, range: 33, cost: 4750 },  // Up 8
        { dmg: 1615, spa: 9.0, range: 40, cost: 6800 }, // Up 9 (AoE → Cone)
        { dmg: 1810, spa: 8.5, range: 45, cost: 8235 }  // Up 10
    ]
});
