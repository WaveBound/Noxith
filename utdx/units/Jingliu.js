unitDatabase.push({
    id: "Jingliu",
    name: "Jangluu",
    img: "images/units/Jingliu.png",
    placement: 3,
    placementType: "Hill",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Eternal/Sacred",
        note: "Eternal provides highest DPS Potential,
        Ruler provides good dps to cost."
    },
    totalCost: 33725,
    stats: {
            crit: 50,
            cdmg: 200,
            dot: 0,
            dotStacks: 1,
            spaCap: 3,
            passiveDmg: 35,
            element: "Ice",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 80, spa: 4.5, range: 20, cost: 1200 },   // Up 0 (Base)
            { dmg: 185, spa: 4.5, range: 20, cost: 1750 },  // Up 1
            { dmg: 310, spa: 4, range: 23, cost: 2190 },    // Up 2
            { dmg: 495, spa: 4, range: 23, cost: 2800 },    // Up 3
            { dmg: 685, spa: 5.5, range: 25, cost: 3475 },  // Up 4
            { dmg: 880, spa: 5.5, range: 25, cost: 3675 },  // Up 5
            { dmg: 1035, spa: 5.5, range: 28, cost: 3800 }, // Up 6
            { dmg: 1290, spa: 5.5, range: 28, cost: 4350 }, // Up 7
            { dmg: 1550, spa: 6.5, range: 35, cost: 4910 }, // Up 8
            { dmg: 1700, spa: 6, range: 40, cost: 5575 }    // Up 9
        ]
});
