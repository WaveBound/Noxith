unitDatabase.push({
    id: "stark",
    name: "Koyote",
    img: "images/units/Stark.png",
    level: 70,
    placement: 3,
    placementType: "Hybrid",
    role: "Damage",
    tags: ["Peroxide", "Hollow"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 34855,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 6,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Ice",
        dotDuration: 0,
        slowPct: 25,
        slowDuration: 5
    },

    upgrades: [
        { dmg: 90, spa: 7, range: 20, cost: 1200 },    // Up 0 (Base)
        { dmg: 145, spa: 7, range: 20, cost: 1750 },   // Up 1
        { dmg: 250, spa: 7, range: 20, cost: 2190 },   // Up 2
        { dmg: 330, spa: 7, range: 25, cost: 2800 },   // Up 3 (Circle + Hybrid)
        { dmg: 490, spa: 7, range: 25, cost: 3475 },   // Up 4
        { dmg: 540, spa: 7, range: 28, cost: 3675 },   // Up 5
        { dmg: 675, spa: 6.5, range: 30, cost: 3800 }, // Up 6
        { dmg: 775, spa: 6.5, range: 30, cost: 4350 }, // Up 7
        { dmg: 830, spa: 6.5, range: 33, cost: 4990 }, // Up 8
        { dmg: 905, spa: 6.5, range: 33, cost: 5575 }, // Up 9
        { dmg: 1050, spa: 6, range: 35, cost: 1050 }   // Up 10
    ]
});
