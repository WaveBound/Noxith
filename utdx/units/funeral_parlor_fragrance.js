unitDatabase.push({
    // IDENTITY
    id: "funeral_parlor_fragrance",
    name: "Funeral Parlor (Fragrance)",
    img: "images/units/FuneralParlorFragrance.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "DPS",
    tags: ["Impact", "Hero", "Blazing"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },

    totalCost: 746000,

    // BASE STATS
    stats: {
        spaCap: 5,
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotDuration: 0,
        dotStacks: 1,
        element: "Fire",
        passiveDmg: 0,
        support: ""
    },

    // CUSTOM PYRO STACK CONTROL
    systemLevel: {
        label: "Pyro Stacks",
        controlType: "slider",
        min: 1,
        max: 25,
        default: 25
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 6000, spa: 15, range: 42, cost: 746000 } // Up 0 (Base)
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Blossom Blaze",
            desc: "• On Hit: Apply a Pyro Stack on enemies (Cap: 25 Pyro Stacks).<br>• Every 5 seconds: Consume one stack and deal 5,000 Damage for each stack.<br>• Etherealization 2: Stack Damage increased to 7,500.<br>• Etherealization 6: Damage applies twice (consumes only 1 stack)."
        },
        {
            name: "Burning Afterlife",
            desc: "• On Takedown: -1% SPA (Cap: -15% [increases to -25% on Etherealization 4]).<br>• For every enemy with Burn or Pyro in Range: +3% Damage (Cap: +30%)."
        },
        {
            name: "Fire for Souls",
            desc: "• When an enemy with Pyro Stacks dies in Range: 25% Chance to transfer up to 10 Pyro Stacks to nearby enemies."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "Stack Damage increased to 7,500",
        "+10 Stat Points",
        "Burning Afterlife SPA Cap increases to -25%",
        "+10 Stat Points",
        "Blossom Blaze Damage applies twice"
    ]
});
