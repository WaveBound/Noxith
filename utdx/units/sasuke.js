unitDatabase.push({
    id: "sasuke",
    name: "Sasuke (Chakra)",
    img: "images/units/Sasuke.png",
    placement: 2,
    placementType: "Ground",
    role: "Damage",
    tags: ["Team 7", "Ninjaverse", "Hero", "Bloodline"],
    meta: {
        short: "Ruler",
        long: "Eternal/Sacred",
        note: "Ruler for DPS,
        Eternal/Sacred for support."
    },
    totalCost: 42400,
    stats: {
            crit: 0,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 4,
            passiveDmg: 25,
            element: "Dark"
        },

    upgrades: [
            { dmg: 125, spa: 7, range: 15, cost: 1400 },   // Up 0 (Base)
            { dmg: 250, spa: 7, range: 17, cost: 2000 },   // Up 1
            { dmg: 400, spa: 7, range: 17, cost: 2700 },   // Up 2
            { dmg: 425, spa: 9, range: 19, cost: 3100 },   // Up 3
            { dmg: 475, spa: 9, range: 19, cost: 3900 },   // Up 4
            { dmg: 560, spa: 6, range: 21, cost: 4500 },   // Up 5
            { dmg: 650, spa: 6, range: 21, cost: 4800 },   // Up 6
            { dmg: 800, spa: 6, range: 21, cost: 5800 },   // Up 7
            { dmg: 1800, spa: 7.5, range: 28, cost: 6700 }, // Up 8
            { dmg: 2175, spa: 7.5, range: 30, cost: 7500 }  // Up 9
        ]
});
