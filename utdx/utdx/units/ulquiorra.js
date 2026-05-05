unitDatabase.push({
    id: "ulquiorra",
    name: "Ultiorra",
    img: "images/units/Ulqiorra.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Damage",
    tags: ["Peroxide", "Hollow"],
    meta: {
        short: "Ruler",
        long: "Eternal",
        note: "Standard DPS selection."
    },
    totalCost: 31760,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 0,
        passiveSpa: 5,
        element: "Dark",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 80, spa: 7, range: 15, cost: 1000 },    // Up 0 (Base)
        { dmg: 200, spa: 7, range: 15, cost: 1550 },   // Up 1
        { dmg: 315, spa: 6.5, range: 18, cost: 1980 },  // Up 2
        { dmg: 490, spa: 8, range: 25, cost: 2600 },   // Up 3 (Line AoE)
        { dmg: 675, spa: 8, range: 25, cost: 3250 },   // Up 4
        { dmg: 875, spa: 7.5, range: 28, cost: 3475 },  // Up 5
        { dmg: 940, spa: 7, range: 35, cost: 3600 },   // Up 6 (Circle AoE)
        { dmg: 1025, spa: 7, range: 35, cost: 4150 },  // Up 7
        { dmg: 1190, spa: 5.5, range: 30, cost: 4880 }, // Up 8 (Line AoE)
        { dmg: 1275, spa: 5, range: 33, cost: 5275, unlocksAbility: true } // Up 9
    ],
    ability: { buffDmg: 65, passiveSpa: 2.5, crit: 10 }
});
