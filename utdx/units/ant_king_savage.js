unitDatabase.push({
    id: "ant_king_savage",
    name: "Ant King (Savage)",
    img: "images/units/AntKing.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "DPS",
    tags: ["Leveling", "King"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Predatory Gluttony: Gain +30% True Damage and +30% (+50% at E6) Damage via kill-stacking. Reset after 10s without kill."

    },
    bugs: [
        {
            name: 'DoT Buff Double-Calculation',
            desc: 'Any DoT%+ buff applied to Ant King (e.g., from traits or abilities) is incorrectly calculated twice, making him stronger than intended against builds with DoT buffs.'
        },
        {
            name: 'Radiation Damage Bonus — Non-Functional',
            desc: 'Ant King\'s radiation is supposed to cause enemies to take +20% damage, but this effect does not currently work.'
        }
    ],
    totalCost: 63000,
    stats: {
        spaCap: 5.5,
        crit: 0, cdmg: 150,
        dot: 0, dotDuration: 0, dotStacks: 1,
        element: "Dark",
        passiveDmg: 0, // Max Gluttony Stacks
        trueDmg: 0,
        support: "Slow / Radiation",

        slowPct: 20, slowDuration: 6
    },

    upgrades: [
        { dmg: 250, spa: 8, range: 30, cost: 2000 }, // Up 0
        { dmg: 600, spa: 8, range: 31, cost: 5000 }, // Up 1
        { dmg: 1150, spa: 8, range: 33, cost: 7500 }, // Up 2
        { dmg: 2000, spa: 8, range: 34, cost: 9500 }, // Up 3
        { dmg: 3800, spa: 8, range: 37, cost: 14000 }, // Up 4
        { dmg: 5160, spa: 8, range: 40, cost: 25000 } // Up 5
    ],
    passives: [
        { name: "Predatory Gluttony", trueDmg: 30, passiveDmg: 50, desc: "Gain +30% True Damage. Every Kill: Gain +1% Damage (Cap +30% [+50% at E6]). Boss Kill instantly caps. Resets after 10s without getting a kill." },
        { name: "Paralyzing Venom", dot: 80, dotDuration: 6, desc: "Applies Radiation for 80% Damage over 6 ticks. Applies 15% (20% at E2) Slow while active." },
        { name: "Monarch's Devotion", desc: "When 'Jinoo' is in range: +20% Damage, +10% Range. [On E4]: Buffs all other units in range by +10% Damage." }
    ],
    ability: {
        abilityName: "Monarch's Devotion",
        desc: "Simulate 'Jinoo' presence in range: +20% Damage, +10% Range, +50% DoT Damage.",
        buffDmg: 20,
        passiveRange: 10,
        dotBuff: 50,
        hasToggle: true
    },
    etherealization: [
        "+10 Stat Points",
        "\"Paralyzing Venom\" Slow increased to 20%.",
        "+10 Stat Points",
        "\"Monarch's Devotion\" gives all units in range +10% Damage.",
        "+10 Stat Points",
        "\"Predatory Gluttony\" Damage Cap increased to +50%."
    ]
});
