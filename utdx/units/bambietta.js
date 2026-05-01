unitDatabase.push({
    id: "bambietta",
    name: "Bambee",
    img: "images/units/Bambietta.png",
    placement: 3,
    placementType: "Ground",
    role: "Damage / (Support/Dot)",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Eternal",
        note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost.",
    },
    totalCost: 40000,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 0,
        element: "Dark",
        dotDuration: 0,
        hasElementSelect: true
    },

    upgrades: [
        { dmg: 60, spa: 5, range: 25, cost: 900 },     // Up 0 (Base)
        { dmg: 195, spa: 5, range: 28, cost: 1750 },   // Up 1
        { dmg: 305, spa: 4.5, range: 28, cost: 2180 }, // Up 2
        { dmg: 425, spa: 4.5, range: 30, cost: 2800 }, // Up 3
        { dmg: 580, spa: 5.5, range: 30, cost: 3950 }, // Up 4
        { dmg: 675, spa: 5.5, range: 33, cost: 5175 }, // Up 5
        { dmg: 790, spa: 5.5, range: 35, cost: 7600 }, // Up 6
        { dmg: 1050, spa: 7, range: 35, cost: 8150 },  // Up 7
        { dmg: 1230, spa: 6.5, range: 38, cost: 9980 } // Up 8
    ]
});
