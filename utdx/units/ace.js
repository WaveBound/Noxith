unitDatabase.push({
    id: "ace",
    name: "Spade",
    img: "images/units/Ace.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Damage / Burn(DoT)",
    tags: ["Piece"],
    meta: {
        short: "Ruler",
        long: "Ruler/Astral",
        note: "Ruler provides good dps to cost."
    },
    totalCost: 39000,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 100,
        dotStacks: 1,
        spaCap: 6,
        passiveDmg: 60,
        element: "Fire",
        dotDuration: 4
    },

    upgrades: [
        { dmg: 100, spa: 5, range: 22, cost: 1000 },   // Up 0 (Base)
        { dmg: 250, spa: 4.8, range: 24, cost: 1300 }, // Up 1
        { dmg: 360, spa: 4.5, range: 26, cost: 1750 }, // Up 2
        { dmg: 575, spa: 6, range: 28, cost: 2350 },   // Up 3
        { dmg: 750, spa: 5.8, range: 28, cost: 2900 }, // Up 4
        { dmg: 850, spa: 5.6, range: 30, cost: 3500 }, // Up 5
        { dmg: 975, spa: 5.4, range: 30, cost: 4700 }, // Up 6
        { dmg: 1000, spa: 8, range: 27, cost: 6000 },  // Up 7 (Full AoE)
        { dmg: 1100, spa: 8, range: 27, cost: 7000 },  // Up 8
        { dmg: 1250, spa: 8, range: 30, cost: 8500 }   // Up 9
    ]
});
