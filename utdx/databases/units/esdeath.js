unitDatabase.push({
    id: "esdeath",
    name: "Ice Empress",
    img: "images/units/Esdeath.png",
    placement: 1,
    placementType: "Ground",
    role: "Damage / Support",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Passive avg 37.5% Dmg (Cycles 0-75%). Ruler is strictly best due to 1 placement count."
    },
    totalCost: 92890,
    stats: {
            crit: 0,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 3,
            passiveDmg: 37.5,
            element: "Ice",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 120, spa: 6, range: 25, cost: 1500 },     // Up 0 (Base)
            { dmg: 265, spa: 6, range: 28, cost: 2150 },     // Up 1
            { dmg: 470, spa: 5.5, range: 30, cost: 3000 },   // Up 2
            { dmg: 695, spa: 7, range: 35, cost: 6600 },     // Up 3
            { dmg: 870, spa: 7, range: 35, cost: 7290 },     // Up 4
            { dmg: 1050, spa: 7, range: 38, cost: 8750 },    // Up 5
            { dmg: 1190, spa: 6.5, range: 40, cost: 9870 },  // Up 6
            { dmg: 1265, spa: 6.5, range: 40, cost: 11100 }, // Up 7
            { dmg: 1400, spa: 6.5, range: 45, cost: 12900 }, // Up 8
            { dmg: 1765, spa: 8, range: 45, cost: 13730 },   // Up 9
            { dmg: 1975, spa: 8.5, range: 50, cost: 16000 }  // Up 10
        ]
});
