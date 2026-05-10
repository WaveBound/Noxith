unitDatabase.push({
    id: "genos",
    name: "Cyborg",
    img: "images/units/Genos.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "DoT / Damage",
    tags: ["Android", "Hero"],
    meta: {
        short: "Ruler",
        long: "Eternal/Sacred",
        note: "Standard DPS Selection."
    },
    totalCost: 26900,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 14,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 0,
        element: "Fire",
        burnMultiplier: 45
    },

    upgrades: [
        { dmg: 50, spa: 4, range: 25, cost: 700 },     // Up 0 (Base)
        { dmg: 115, spa: 4, range: 25, cost: 800 },    // Up 1
        { dmg: 200, spa: 4, range: 25, cost: 1400 },   // Up 2
        { dmg: 350, spa: 4, range: 25, cost: 2000 },   // Up 3
        { dmg: 500, spa: 4, range: 25, cost: 2500 },   // Up 4
        { dmg: 600, spa: 4, range: 28, cost: 2750 },   // Up 5
        { dmg: 720, spa: 4, range: 28, cost: 3000 },   // Up 6
        { dmg: 800, spa: 4, range: 30, cost: 3500 },   // Up 7
        { dmg: 950, spa: 4, range: 32, cost: 5000, unlocksAbility: true }, // Up 8 (Gains Nuke Blast Ability)
        { dmg: 1200, spa: 4, range: 32, cost: 5250 }   // Up 9
    ],
    ability: { abilityName: "Nuke Blast", passiveDmg: 75 }
});
