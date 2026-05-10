unitDatabase.push({
    id: "grimjaw",
    name: "Grommjaw (Panther)",
    img: "images/units/Grimjaw.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: ["Peroxide", "Hollow"],
    meta: {
        short: "Ruler",
        long: "Eternal",
        note: "Standard DPS selection."
    },
    totalCost: 41175,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 50,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 6.67,
        passiveSpa: 4.17,
        element: "Water",
        dotDuration: 10,
        dotType: "Bleed"
    },

    upgrades: [
        { dmg: 85, spa: 7, range: 20, cost: 1300 },    // Up 0 (Base)
        { dmg: 140, spa: 7, range: 20, cost: 1850 },   // Up 1
        { dmg: 245, spa: 6.5, range: 22, cost: 2290 }, // Up 2
        { dmg: 320, spa: 6.5, range: 22, cost: 2900 }, // Up 3
        { dmg: 485, spa: 6.5, range: 22, cost: 3575 }, // Up 4
        { dmg: 545, spa: 8, range: 25, cost: 3775 },   // Up 5
        { dmg: 670, spa: 7.5, range: 25, cost: 3900 }, // Up 6
        { dmg: 870, spa: 7.5, range: 25, cost: 4450 }, // Up 7
        { dmg: 955, spa: 7.5, range: 28, cost: 5010 }, // Up 8
        { dmg: 1135, spa: 7, range: 28, cost: 5675 },  // Up 9
        { dmg: 1590, spa: 9, range: 35, cost: 6450 }   // Up 10
    ]
});
