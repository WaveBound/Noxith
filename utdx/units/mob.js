unitDatabase.push({
    id: "mob",
    name: "Psycho (100%)",
    img: "images/units/Mob.png",
    level: 70,
    placement: 3,
    placementType: "Hybrid",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Standard DPS selection."
    },
    totalCost: 56900,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 20,
        dotStacks: 1,
        spaCap: 5.5,
        passiveDmg: 0,
        element: "Rose",
        dotDuration: 4
    },

    upgrades: [
        { dmg: 120, spa: 5, range: 15, cost: 1000 },   // Up 0 (Base)
        { dmg: 247, spa: 5, range: 18, cost: 1500 },   // Up 1
        { dmg: 500, spa: 5, range: 20, cost: 2500 },   // Up 2
        { dmg: 670, spa: 5, range: 22, cost: 3700 },   // Up 3
        { dmg: 750, spa: 5, range: 25, cost: 4500 },   // Up 4
        { dmg: 850, spa: 8, range: 20, cost: 6500 },   // Up 5 (Full AoE)
        { dmg: 980, spa: 8, range: 20, cost: 7200 },   // Up 6
        { dmg: 1100, spa: 8, range: 20, cost: 8000 },  // Up 7
        { dmg: 1450, spa: 7, range: 30, cost: 10000 }, // Up 8 (Circle + Hybrid)
        { dmg: 1800, spa: 6.5, range: 30, cost: 12000 } // Up 9
    ]
});
