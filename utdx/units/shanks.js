unitDatabase.push({
    id: "shanks",
    name: "Shunks",
    img: "images/units/Shanks.png",
    placement: 3,
    placementType: "Hybrid",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 66800,
    stats: {
            crit: 0,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 2.5,
            passiveDmg: 0,
            element: "Rose",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 100, spa: 8, range: 15, cost: 800 },    // Up 0 (Base)
            { dmg: 145, spa: 8, range: 15, cost: 1200 },   // Up 1
            { dmg: 217, spa: 8, range: 15, cost: 1800 },   // Up 2
            { dmg: 290, spa: 8, range: 18, cost: 2400 },   // Up 3 (Line AoE)
            { dmg: 360, spa: 8, range: 18, cost: 3000 },   // Up 4
            { dmg: 435, spa: 8, range: 18, cost: 3600 },   // Up 5
            { dmg: 520, spa: 8, range: 21, cost: 4200 },   // Up 6
            { dmg: 600, spa: 8, range: 21, cost: 4800 },   // Up 7
            { dmg: 2000, spa: 12, range: 30, cost: 20000 }, // Up 8 (AoE + Hybrid)
            { dmg: 2200, spa: 12, range: 30, cost: 25000 }  // Up 9
        ]
});
