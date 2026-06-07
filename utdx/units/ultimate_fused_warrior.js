unitDatabase.push({
    // IDENTITY
    id: "ultimate_fused_warrior",
    name: "Ultimate Fused Warrior",
    img: "images/units/UltimateFusedWarrior.png",
    level: 100,
    placement: 2,
    placementType: "Ground",
    role: "Damage",
    tags: ["Super Warrior", "Hero", "Fusion", "Divinity"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Wind DPS with a powerful damage-over-time ability."
    },

    totalCost: 107000,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4.5,
        passiveDmg: 0,
        element: "Wind",
        dotDuration: 0,
        support: "",
        customFollowUp: {
            dotPct: 70,
            dotDuration: 5,
            dotType: "Ionized",
            fuaAnimation: 4.5,
            label: "Fused Godly Might"
        }
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 420, spa: 8, range: 25, cost: 2000 },       // Up 0 (Base) | Total Cost: 0 | Effortless Kick
        { dmg: 960, spa: 8, range: 27, cost: 5500 },    // Up 1        | Total Cost: 5,500
        { dmg: 1600, spa: 8, range: 29, cost: 9500 },   // Up 2        | Total Cost: 15,000 | Energy Ball
        { dmg: 2400, spa: 8, range: 32, cost: 13000 },  // Up 3        | Total Cost: 28,000
        { dmg: 3800, spa: 8, range: 35, cost: 17000 },  // Up 4        | Total Cost: 45,000
        { dmg: 6000, spa: 18, range: 35, cost: 25000 }, // Up 5        | Total Cost: 70,000 | Godly Punch
        { dmg: 10000, spa: 18, range: 37, cost: 35000 } // Up 6        | Total Cost: 105,000 | Beam Sword
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Does that hurt?",
            desc: "<br>On Crit:<br>• Apply Ionized for 70% Damage over 5 ticks"
        },
        {
            name: "Final Energy Wave",
            desc: "• Use the Active Ability to release a massive Line AOE Attack that you can manually Aim<br>• Deal 20% Damage per second for 20 seconds<br>• Active Ability Cooldown: 140s"
        },
        {
            name: "Taunting Counter",
            desc: "When a Stun or Debuff is attempted on this unit:<br>• Ignore the Stun and/or Debuff<br>• Release a Counter Attack for 50% Damage at the Strongest enemy in Range<br>• +50% Damage for 30 seconds"
        },
        {
            name: "Fused Godly Might",
            desc: "Every Attack:<br>• Follow-up for 100% Damage<br>• 50% Chance to trigger the Follow-up Attack a second time"
        }
    ],

    // ABILITY
    ability: {
        abilityName: "Fused Devastation",
        noToggle: true,
        cooldown: 140,
        desc: "On Attack:<br>• Deal 20% of damage per second for 20 seconds [30% at E6]"
    },

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "Fused Godly Might third follow-up chance increased to 70%",
        "+10 Stat Points",
        "Taunting Counter damage increased to 80%",
        "+10 Stat Points",
        "Ability Damage increased to 30%"
    ]
});
