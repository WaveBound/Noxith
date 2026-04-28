unitDatabase.push({
    id: "law",
    name: "Rule (ROOM)",
    img: "images/units/Law.png",
    placement: 3,
    placementType: "Ground",
    role: "Support",
    tags: [],
    meta: {
        short: "Ruler/Sacred",
        long: "Ruler/Sacred",
        note: "Ruler/Sacred offer the most Spa%- / Rng%+"
    },
    totalCost: 85000,
    stats: {
            crit: 0,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 2,
            passiveDmg: 20,
            passiveSpa: 10,
            element: "Water",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 160, spa: 6, range: 29, cost: 1200 },    // Up 0 (Base)
            { dmg: 160, spa: 5.5, range: 30, cost: 2000 },  // Up 1
            { dmg: 400, spa: 5.5, range: 30, cost: 3400 },  // Up 2
            { dmg: 450, spa: 8, range: 25, cost: 5600 },    // Up 3
            { dmg: 550, spa: 8, range: 25, cost: 6500 },    // Up 4
            { dmg: 600, spa: 8, range: 26, cost: 8000 },    // Up 5
            { dmg: 700, spa: 5, range: 32, cost: 8500 },    // Up 6
            { dmg: 850, spa: 5, range: 35, cost: 9000 },    // Up 7
            { dmg: 1050, spa: 5, range: 38, cost: 9800 },   // Up 8
            { dmg: 1250, spa: 5, range: 40, cost: 11000 },  // Up 9
            { dmg: 1300, spa: 5, range: 42, cost: 20000 }   // Up 10
        ]
});
