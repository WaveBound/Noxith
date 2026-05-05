unitDatabase.push({
    id: "harribel",
    name: "Tierabel",
    img: "images/units/Harribel.png",
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
    totalCost: 30990,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Water",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 100, spa: 6, range: 20, cost: 700 },     // Up 0 (Base)
        { dmg: 310, spa: 6, range: 20, cost: 1150 },    // Up 1
        { dmg: 480, spa: 6, range: 25, cost: 1775 },    // Up 2
        { dmg: 620, spa: 6, range: 25, cost: 2250 },    // Up 3
        { dmg: 760, spa: 7, range: 28, cost: 2925 },    // Up 4 (Line AoE)
        { dmg: 885, spa: 7, range: 28, cost: 3475 },    // Up 5
        { dmg: 990, spa: 6.5, range: 28, cost: 3800 },  // Up 6
        { dmg: 1115, spa: 6.5, range: 28, cost: 4350 }, // Up 7
        { dmg: 1490, spa: 8.5, range: 30, cost: 4990 }, // Up 8 (Circle AoE)
        { dmg: 1560, spa: 8.5, range: 30, cost: 5575 }  // Up 9
    ],
    ability: { buffDmg: 35, buffDuration: 80, spaCap: 4, hasToggle: true }
});
