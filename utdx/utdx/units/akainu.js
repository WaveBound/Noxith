unitDatabase.push({
    id: "akainu",
    name: "Akainu",
    img: "images/units/Akainu.png",
    level: 70,
    placement: 3,
    placementType: "Hybrid",
    role: "Support / Damage",
    tags: [],
    meta: {
        short: "Eternal/Sacred",
        long: "Eternal/Sacred",
        note: "Eternal/Sacred offer the the best dps + support performance."
    },
    totalCost: 27150,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 60,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Fire",
        dotDuration: 7
    },

    upgrades: [
        { dmg: 150, spa: 7, range: 20, cost: 1000 },   // Up 0 (Base)
        { dmg: 300, spa: 7, range: 22, cost: 1600 },   // Up 1
        { dmg: 400, spa: 6, range: 24, cost: 2000 },   // Up 2
        { dmg: 500, spa: 8, range: 23, cost: 2500 },   // Up 3 (Circle AoE)
        { dmg: 640, spa: 8, range: 24, cost: 3000 },   // Up 4
        { dmg: 700, spa: 7, range: 27, cost: 3400 },   // Up 5
        { dmg: 830, spa: 7, range: 30, cost: 3900 },   // Up 6
        { dmg: 950, spa: 8, range: 33, cost: 4500 },   // Up 7 (Line AoE + Hybrid)
        { dmg: 1100, spa: 7, range: 37, cost: 5250 }   // Up 8
    ]
});
