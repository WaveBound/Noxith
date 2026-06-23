unitDatabase.push({
    id: "king_sailor",
    name: "King Sailor",
    img: "images/units/KingSailor.png",
    level: 100,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Magi", "King", "Hero", "Uncontrollable Power"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Manipulator of Fate: +50% Dmg / -25% SPA. Baal's Lightning provides +20% non-critical Chain Lightning damage."
    },
    bugs: [
        {
            name: 'Final Upgrade — 5 Hits Instead of 2',
            desc: 'On his final upgrade, King Sailor fires <strong>5 hits</strong> instead of the intended 2, resulting in <strong>2.5× total base hit damage</strong>. Chain lightning scales off the pre-2.5× (base 2-hit) damage value, not the bugged total.'
        }
    ],
    totalCost: 91800,
    stats: {
        spaCap: 4,
        crit: 0, cdmg: 150,
        element: "Water"
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
        { name: "Manipulator of Fate", passiveDmg: 50, passiveSpa: 25, buffedByJunior: true, desc: "Gain +50% Damage and -25% Attack Speed based on shared tags with allies." },
        { name: "Baal's Lightning", desc: "Every attack chains to 5 enemies for 20% non-critical damage. Range extended by 10%." },
        { name: "Unrivaled Mark", desc: "Global Buff: Magi (+50% Dmg, -15% SPA), Uncontrollable (+30% Dmg, -10% SPA), Water (+20% Dmg, -10% SPA)." },
        { name: "King of his People", desc: " When another unit is in range: +25% Crit damage, +10% Crit chance" },
        { name: "Rukh's Judgement", passiveCrit: 20, passiveCdmg: 25, desc: "When attacking an enemy inflicted by chain lightning in the last 10s: +10% Crit Damage and +5% Crit Chance for 15s. [On E6]: both buffs increased by 15%." }
    ],
    etherealization: [
        "+10 Stat Points",
        { name: "Etherealization 2 (Crit)", desc: "E2: \"Baal's Lightning\" Chains up to 7 enemies", passiveCrit: 20 },
        "+10 Stat Points",
        "\"Baal's Lightning\" Damage increased to 20%",
        "+10 Stat Points",
        "\"Rukh's Judgement\" Buffs increased by 15% each.",
    ]
});
