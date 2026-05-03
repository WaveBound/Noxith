unitDatabase.push({
    id: "kirito",
    name: "Kriatu",
    img: "images/units/Kirito.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Burst / Crit",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Eternal",
        virtual: "Astral",
        note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost."
    },
    totalCost: 30400,
    stats: {
        crit: 50,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        hitCount: 14,
        reqCrits: 50,
        extraAttacks: 0,
        element: "Ice"
    },

    upgrades: [
        { dmg: 80, spa: 7, range: 18, cost: 1200 },    // Up 0 (Base)
        { dmg: 150, spa: 7, range: 20, cost: 1000 },   // Up 1
        { dmg: 184, spa: 7, range: 30, cost: 1300 },   // Up 2
        { dmg: 237, spa: 6, range: 32, cost: 1800 },   // Up 3 (Circle AoE)
        { dmg: 294, spa: 6, range: 33, cost: 2200 },   // Up 4
        { dmg: 357, spa: 6, range: 33, cost: 2750 },   // Up 5
        { dmg: 453, spa: 6, range: 36, cost: 3050 },   // Up 6 (Circle AoE)
        { dmg: 567, spa: 6, range: 36, cost: 3600 },   // Up 7
        { dmg: 750, spa: 8, range: 30, cost: 6000 },   // Up 8 (Full AoE)
        { dmg: 1000, spa: 7, range: 30, cost: 7500 }   // Up 9 (Enhance Armament)
    ]
});
