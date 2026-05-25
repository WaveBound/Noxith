unitDatabase.push({
    // IDENTITY
    id: "revolutionary_chief_syncro",
    name: "Revolutionary Chief (Syncro)",
    img: "images/units/RevolutionaryChiefSyncro.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Damage",
    tags: ["Piece", "Blazing"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Relies heavily on critical burn ticks to maximize damage output."
    },

    totalCost: 95400,

    // BASE STATS
    stats: {
        spaCap: 3.5,
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotDuration: 0,
        dotStacks: 1,
        element: "Fire",
        passiveDmg: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 14400, spa: 10.0, range: 35, cost: 95400},// Up 0 (Base)
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Fiery Legacy",
            dot: 150,
            dotDuration: 9,
            canCrit: true,
            desc: "On Attack: Apply Burn for 150% Damage over 9 ticks. Burn from this unit can Crit."
        },
        {
            name: "Will of Fire",
            desc: "When a Boss spawns: +15% Damage, -10% SPA, and +5% Range. When inflicting Burn to a Boss, the Burn lasts 2 ticks longer."
        },
        {
            name: "Defying Flames",
            desc: "When an enemy with Burn dies: Apply Critical Burn to nearby enemies. When attacking an enemy with Burn: Reset the duration of Burn."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "",
        "+10 Stat Points",
        "",
        "+10 Stat Points",
        "",
    ]
});