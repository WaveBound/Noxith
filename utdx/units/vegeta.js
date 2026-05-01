unitDatabase.push({
    id: "vegeta",
    name: "Fallen Prince",
    img: "images/units/Vegeta.png",
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Eternal",
        note: "Toggle Boss Stacks for max damage."
    },
    totalCost: 35115,
    stats: {
            crit: 45,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 3,
            passiveDmg: 0,
            element: "Dark",
            dotDuration: 0,
            passiveSpa: 15,
            passiveRange: 15
        },

    upgrades: [
            { dmg: 130, spa: 9.5, range: 22, cost: 1000 },  // Up 0 (Base)
            { dmg: 355, spa: 9.5, range: 22, cost: 1550 },  // Up 1
            { dmg: 515, spa: 9.5, range: 25, cost: 2600 },  // Up 2
            { dmg: 810, spa: 9, range: 30, cost: 3250 },    // Up 3
            { dmg: 1080, spa: 9, range: 30, cost: 3875 },   // Up 4
            { dmg: 1250, spa: 8.5, range: 35, cost: 4150 }, // Up 5
            { dmg: 1699, spa: 8.5, range: 38, cost: 5200 }, // Up 6
            { dmg: 1945, spa: 8, range: 40, cost: 6490 },   // Up 7 (AoE → Line)
            { dmg: 2250, spa: 8, range: 45, cost: 7000 }    // Up 8
        ],
    ability: { passiveDmg: 150 }
});
