unitDatabase.push({
    id: "megumin",
    name: "Megumin",
    img: "images/units/Megumin.png",
    level: 70,
    placement: 1,
    placementType: "Hybrid",
    role: "Damage / Burn(Dot)",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count. Has innate 100% True Damage."
    },
    totalCost: 136000,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 50,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 0,
        element: "Fire",
        dotDuration: 10,
        trueDmg: 100
    },

    upgrades: [
        { dmg: 1000, spa: 11.5, range: 30, cost: 3000 },  // Up 0 (Base)
        { dmg: 2175, spa: 11.5, range: 35, cost: 11865 }, // Up 1
        { dmg: 3980, spa: 13, range: 38, cost: 21250 },   // Up 2
        { dmg: 5050, spa: 13.5, range: 40, cost: 28600 }, // Up 3
        { dmg: 5000, spa: 11.5, range: 45, cost: 32580 }, // Up 4
        { dmg: 7230, spa: 14, range: 50, cost: 40000 }    // Up 5
    ],
    ability: { passiveDmg: 50, passiveSpa: -50 }
});
