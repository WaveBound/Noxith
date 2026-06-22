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
    notice: {
        icon: '🔥',
        text: '<strong>Notice:</strong> DoT restarts duration if attacked again. DPS is calculated as 1 continuous tick per second.',
        color: '#60a5fa',
        bg: 'rgba(96, 165, 250, 0.08)',
        border: 'rgba(96, 165, 250, 0.15)'
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
            desc: "<br>On Attack:<br>Apply Burn for 150% Damage over 9 ticks.<br>Burn from this unit can Crit."
        },
        {
            name: "Will of Fire",
            desc: "<br>When a Boss spawns:<br>+15% Damage, -10% SPA, and +5% Range.<br>When inflicting Burn to a Boss,<br>the Burn lasts 2 ticks longer."
        },
        {
            name: "Defying Flames",
            desc: "<br>When an enemy with Burn dies:<br>Apply Critical Burn to nearby enemies.<br>When attacking an enemy with Burn:<br>Reset the duration of Burn."
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