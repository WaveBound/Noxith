unitDatabase.push({
    id: "ulquiorra",
    name: "Ultiorra (Oblivion)",
    img: "images/units/Ulqiorra.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Damage",
    tags: ["Peroxide", "Hollow", "Villain"],
    meta: {
        short: "Ruler",
        long: "Duelist/Sacred",
        note: "Standard DPS selection."
    },
    totalCost: 31760,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Dark",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 96, spa: 7, range: 15, cost: 1000 },    // Up 0 (Base)
        { dmg: 240, spa: 7, range: 15, cost: 1550 },   // Up 1
        { dmg: 378, spa: 6.5, range: 18, cost: 1980 },  // Up 2
        { dmg: 588, spa: 8, range: 25, cost: 2600 },   // Up 3 (Line AoE)
        { dmg: 810, spa: 8, range: 25, cost: 3250 },   // Up 4
        { dmg: 1050, spa: 7.5, range: 28, cost: 3475 },  // Up 5
        { dmg: 1128, spa: 7, range: 35, cost: 3600 },   // Up 6 (Circle AoE)
        { dmg: 1230, spa: 7, range: 35, cost: 4150 },  // Up 7
        { dmg: 1428, spa: 5.5, range: 30, cost: 4880 }, // Up 8 (Line AoE)
        { dmg: 1530, spa: 5, range: 33, cost: 5275, unlocksAbility: true } // Up 9
    ],
    ability: [
        { abilityName: "Resurrect", name: "Resurrect", passiveDmg: 75, passiveSpa: 5, passiveCrit: 20, passiveRange: 10 },
        { abilityName: "Relampago", name: "Relampago", abilityGated: true, globalCooldown: true, dmgMult: 3, eDmgMult: 4, cooldown: 45, reqUp: 9 }
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "No Collateral Damage",
            desc: "Passive: No Collateral<br>• The first time an enemy leaves this unit's range, gain -5% SPA for 10 seconds.<br>• During this window, Range is increased by +30."
        },
        {
            name: "Spirit Energy",
            desc: "On Attack:<br>• Gains +2.5% [+5% on Etherealization 2] Spirit Energy.<br>• Resurrect can only be used when Spirit Energy is at 100%.<br><br>Charge:<br>• Gain +0.2% [+0.5% on Etherealization 4] Damage per Spirit Energy charge (up to +20% [+50% on Etherealization 4] at 100%)."
        },
        {
            name: "Resurrect",
            desc: "Passive Ability: I'll show you what true despair is...<br>• When Spirit Energy reaches 100%:<br>• Transforms into Resurrect state.<br>• While in this state: +15% DMG, -2.5% SPA, +10% Crit Chance, +10% Range.<br>• Spirit Energy drains by 2% every 2 seconds until it reaches 0, then returns to Normal."
        },
        {
            name: "Unpredictable Despair",
            desc: "Passive: Unpredictable Despair<br>• First time an enemy enters range: 25% chance to trigger one of the following:<br>• Stun 1.5s, +10% Speed (3s), -5% HP.<br>• Confused for 3s (walk backward)."
        },
        {
            name: "Relampago",
            desc: "Active Ability: Relampago<br>• When in Resurrect state:<br>• Unlock active ability 'Relampago'<br>• Ultiorra unlocks a Nuke dealing 300% [400% on Etherealization 6] of his Total Damage [GLOBAL CD: 45s]"
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "Increase Spirit Energy Meter to +5% per attack",
        "+10 Stat Points",
        "Gain +0.5% DMG per Spirit Energy charge",
        "+10 Stat Points",
        "Increase Relampago damage to 400%."
    ]
});