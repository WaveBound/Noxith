unitDatabase.push({
    id: "king_sailor",
    name: "King Sailor",
    img: "images/units/KingSailor.png",
    level: 100,
    placement: 2,
    placementType: "Ground",
    role: "Utility / Ground",
    tags: ["Magi", "King", "Hero", "Uncontrollable Power"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Manipulator of Fate: +50% Dmg / -25% SPA. Baal's Lightning provides +20% non-critical Chain Lightning damage."
    },
    totalCost: 91800,
    stats: {
        spaCap: 4,
        crit: 20, cdmg: 175,
        element: "Water", passiveDmg: 50, passiveSpa: 25
    },

    upgrades: [
        { dmg: 280, spa: 10, range: 25, cost: 2800 }, // Up 0
        { dmg: 650, spa: 10, range: 27, cost: 6000 }, // Up 1
        { dmg: 1050, spa: 10, range: 30, cost: 9500 }, // Up 2
        { dmg: 1500, spa: 10, range: 33, cost: 13500 }, // Up 3
        { dmg: 2120, spa: 10, range: 36, cost: 18000 }, // Up 4
        { dmg: 2575, spa: 10, range: 40, cost: 20000 }, // Up 5
        { dmg: 7650, spa: 15, range: 45, cost: 22000 } // Up 6
    ],
    passives: [
        { name: "Manipulator of Fate", desc: "Gain +50% Damage and -25% Attack Speed based on shared tags with allies." },
        { name: "Baal's Lightning", desc: "Every attack chains to 5 enemies for 20% non-critical damage. Range extended by 10%." },
        { name: "Unrivaled Mark", desc: "Global Buff: Magi (+50% Dmg, -15% SPA), Uncontrollable (+30% Dmg, -10% SPA), Water (+20% Dmg, -10% SPA)." },
        { name: "Rukh's Judgement", desc: "When attacking an enemy inflicted by chain lightning in the last 10s: +10% Crit Damage and +5% Crit Chance for 15s. [On E6]: both buffs increased by 15%." }
    ],
    etherealization: [
        "+10 Stat Points",
        "\"Baal's Lightning\" Chains up to 7 enemies",
        "+10 Stat Points",
        "\"Baal's Lightning\" Damage increased to 20%",
        "+10 Stat Points",
        "\"Rukh's Judgement\" Buffs increased by 15% each.",
    ]
});
