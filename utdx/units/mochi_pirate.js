unitDatabase.push({
    // IDENTITY
    id: "mochi_pirate",
    name: "Mochi Pirate (Conqueror)",
    img: "images/units/MochiPirate.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Piece", "Villain"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler due to placement count, Sacred/Eternal for support use.<br><span style='color: #f87171;'>⚠️ Bugged: Does not apply Time Snail in-game, and has 0% base crit rate currently.</span>"
    },
    notice: {
        icon: '⚠️',
        text: '<strong>Notice:</strong> Mochi Pirate is bugged; he does not apply Time Snail currently / Crit Time snail enemies.',
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.15)'
    },

    totalCost: 67500,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 200,
        dot: 0,
        dotStacks: 1,
        spaCap: 5.5,
        finalMult: 2.25,
        element: "Fire",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 200, spa: 11.0, range: 20, cost: 1500 },   // Up 0 (Base)
        { dmg: 750, spa: 11.0, range: 22, cost: 3000 },   // Up 1
        { dmg: 1500, spa: 11.0, range: 25, cost: 6500 },  // Up 2
        { dmg: 2000, spa: 11.0, range: 27, cost: 8500 },  // Up 3
        { dmg: 3200, spa: 11.0, range: 30, cost: 12000 }, // Up 4
        { dmg: 4100, spa: 11.0, range: 32, cost: 16000 }, // Up 5
        { dmg: 4700, spa: 11.0, range: 34, cost: 20000 }  // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Flowing Mochi",
            desc: "On Attack:<br>• Apply a Time Snail on enemies and leaves a trail of liquid dough behind that lasts for 4 seconds [8s on E2]<br>• While enemies are affected by this dough they take guaranteed Crits from this unit"
        },
        {
            name: "Evercrush Dough",
            desc: "On Attack or when applying a Status Effect:<br>• Apply up to 6 stacks [3 on E4] per enemy<br>On full stacks:<br>• The next Attack will deal +100% [+250% on E6] Damage."
        }
    ],

    // ABILITY
    ability: null,

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "Increase duration of 'Flowing Mochi' dough on enemies to 8s",
        "+10 Stat Points",
        "Lower amount of stacks needed for 'Evercrush Dough' from 6 to 3",
        "+10 Stat Points",
        "Increase damage from 'Evercrush Dough' to 250%"
    ]
});
