unitDatabase.push({
    id: "phantom_captain",
    name: "Phantom Captain",
    img: "images/units/Phantom.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Summon / Dmg",
    tags: ["Hero"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Needs low SPA (High Speed) to maintain max 9 planes."
    },
    totalCost: 69000,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        element: "Light",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 500, spa: 15, range: 20, cost: 2500 },   // Up 0 (Base)
        { dmg: 1250, spa: 15, range: 25, cost: 7500 },  // Up 1
        { dmg: 2375, spa: 15, range: 30, cost: 13000 }, // Up 2
        { dmg: 2980, spa: 15, range: 35, cost: 19000 }, // Up 3
        { dmg: 3600, spa: 10, range: 55, cost: 27000 }  // Up 4
    ],
    summonStats: {
        maxCount: 9,
        dmgPct: 50, // 50% of Host Dmg
        // Plane Type A: Explosive
        planeA: { spa: 12, duration: 36 },
        // Plane Type B: Mounted
        planeB: { spa: 7.5, duration: 45 },
        // Buff: First 10s
        buffWindow: 10,
        buffCrit: 30, // 30% CR
        buffCdmg: 200 // 200% CDmg
    },
    ability: {
        noToggle: true
    }
});
