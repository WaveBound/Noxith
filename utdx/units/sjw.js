unitDatabase.push({
    id: "sjw",
    name: "Jinoo (Monarch)",
    img: "images/units/Sjw.png",
    level: 70,
    placement: 1,
    placementType: "Hybrid",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 93300,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 5,
        passiveDmg: 25,
        element: "Dark"
    },

    upgrades: [
        { dmg: 184, spa: 4, range: 27, cost: 800 },    // Up 0 (Base)
        { dmg: 322, spa: 4, range: 27, cost: 1700 },   // Up 1
        { dmg: 506, spa: 4, range: 27, cost: 2800 },   // Up 2
        { dmg: 920, spa: 6, range: 29, cost: 3600 },   // Up 3 (Line + Hybrid)
        { dmg: 1092, spa: 6, range: 29, cost: 4400 },  // Up 4
        { dmg: 1256, spa: 6, range: 29, cost: 6000 },  // Up 5
        { dmg: 1437, spa: 6, range: 32, cost: 12000 }, // Up 6 (AoE → Circle)
        { dmg: 1725, spa: 6, range: 32, cost: 18000 }, // Up 7
        { dmg: 2185, spa: 6, range: 35, cost: 19000 }, // Up 8
        { dmg: 2875, spa: 5, range: 35, cost: 25000 }  // Up 9
    ]
});
