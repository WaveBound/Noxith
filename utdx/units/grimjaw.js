unitDatabase.push({
    id: "grimjaw",
    name: "Grommjaw (Panther)",
    img: "images/units/Grimjaw.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: ["Peroxide", "Hollow", "Sword"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Standard DPS selection."
    },
    totalCost: 41174,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 100,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Water",
        dotDuration: 5,
        dotType: "Bleed"
    },

    upgrades: [
        { dmg: 102, spa: 7, range: 20, cost: 1300 },    // Up 0 (Base)
        { dmg: 168, spa: 7, range: 20, cost: 1850 },   // Up 1
        { dmg: 294, spa: 6.5, range: 22, cost: 2290 }, // Up 2
        { dmg: 384, spa: 6.5, range: 22, cost: 2900 }, // Up 3
        { dmg: 582, spa: 6.5, range: 22, cost: 3575 }, // Up 4
        { dmg: 654, spa: 8, range: 25, cost: 3775 },   // Up 5
        { dmg: 804, spa: 7.5, range: 25, cost: 3900 }, // Up 6
        { dmg: 1044, spa: 7.5, range: 25, cost: 4450 }, // Up 7
        { dmg: 1146, spa: 7.5, range: 28, cost: 5010 }, // Up 8
        { dmg: 1362, spa: 7, range: 28, cost: 5675 },  // Up 9
        { dmg: 2040, spa: 9, range: 35, cost: 6450 }   // Up 10
    ]
});
