unitDatabase.push({
    id: "joyful_captain",
    name: "Joyful Captain",
    img: "images/units/JoyfulCaptain.png",
    level: 1,
    placement: 3,
    placementType: "Ground",
    role: "Utility",
    tags: ["Main Character", "Pirate Crew", "Warlord", "Piece", "Hero"],
    meta: {
        short: "Ruler",
        long: "Duelust",
        note: "Unit has 6 distinct modes with separate stats."
    },
    totalCost: 100000,

    // Default base stats (used if the engine doesn't fully override yet)
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        element: "Fire",
        dotDuration: 0
    },


    passives: [
        { name: "Default Passive", desc: "Placeholder" }
    ],

    allowMultipleModes: false,
    noPoints: true,

    systemLevel: {
        label: "Charge",
        passiveName: "Charge",
        controlType: 'slider',
        min: 1,
        max: 10,
        default: 2,
        restrictModes: [0, 1],
        thresholds: [
            { level: 1, spa: 1, passiveDmg: 45 },
            { level: 2, spa: 2, passiveDmg: 45 },
            { level: 3, spa: 3, passiveDmg: 45 },
            { level: 4, spa: 4, passiveDmg: 60 },
            { level: 5, spa: 5, passiveDmg: 75 },
            { level: 6, spa: 6, passiveDmg: 90 },
            { level: 7, spa: 7, passiveDmg: 105 },
            { level: 8, spa: 8, passiveDmg: 120 },
            { level: 9, spa: 9, passiveDmg: 135 },
            { level: 10, spa: 10, passiveDmg: 150 }
        ]
    },

    // The 6 modes
    modes: [
        {
            name: "KongGun + Conq",
            desc: "KongGun + Conqueror Haki.",
            img: "images/units/JoyfulCaptain/KongConq.png",
            stats: { spaCap: 3 },
            upgrades: [{ dmg: 10000, spa: 20, range: 60, cost: 101500, passiveSpa: 0 }],
            totalCost: 101500,
            passives: [
                {
                    name: "Charge",
                    desc: "• Gains charge when not attacking. Damage and SPA are buffed per charge level.<br>• Charge Level ranges from 1 to 10.<br>• at Level 1: +15% Damage, -95% SPA<br>• at Level 2: +30% Damage, -90% SPA<br>• each level adds +15% Damage and -5% SPA<br>• at Level 10: +150% Damage, -50% SPA"
                },
                {
                    name: "Armament",
                    desc: "• Deal 1.75x Damage to Armored and Hyper Armored enemies"
                },
                {
                    name: "Conqueror",
                    desc: "• Unleash a wave of energy every 30s that Stuns non-boss Enemies in Range for 2s"
                }
            ]
        },
        {
            name: "KongGun + Obs",
            desc: "KongGun + Observation Haki.",
            img: "images/units/JoyfulCaptain/KongObs.png",
            stats: { spaCap: 3 },
            upgrades: [{ dmg: 10000, spa: 20, range: 60, cost: 100000, passiveSpa: 0 }],
            totalCost: 100000,
            passives: [
                {
                    name: "Charge",
                    desc: "• Gains charge when not attacking. Damage and SPA are buffed per charge level.<br>• Charge Level ranges from 1 to 10.<br>• at Level 1: +15% Damage, -95% SPA<br>• at Level 2: +30% Damage, -90% SPA<br>• each level adds +15% Damage and -5% SPA<br>• at Level 10: +150% Damage, -50% SPA"
                },
                {
                    name: "Armament",
                    desc: "• Deal 1.75x Damage to Armored and Hyper Armored enemies"
                },
                {
                    name: "Observation",
                    desc: "• Dodges any attempted Stun up to 6 times<br>• Gain 1 dodge every 15 seconds<br>• Start at 0 Dodges"
                }
            ]
        },
        {
            name: "Joy Boy + Arm",
            desc: "Joy Boy + Armament Haki.",
            img: "images/units/JoyfulCaptain/JoyArm.png",
            stats: { spaCap: 3.75 },
            upgrades: [{ dmg: 15200, spa: 8, range: 62, cost: 101500 }],
            totalCost: 101500,
            passives: [
                {
                    name: "Goofing Around",
                    passiveDmg: 50,
                    desc: "• This unit will randomly switch between 3 Attack variants (cannot use the same Variant twice in a row)<br>• Pick a random number between +25% and +75%<br>• Based on the random value, buff AOE size and Damage<br><b>Variant 1</b><br>• Circle AOE, 100% Damage<br>• +25% True Damage for the duration of this Attack<br><b>Variant 2</b><br>• Circle AOE - 100% Damage<br>• Deal 15% Damage to enemies in rubber areas<br><b>Variant 3</b><br>• Full AOE - 85% Damage<br><b>Variant 4</b><br>• Circle AOE - 120% Damage<br><b>When all 4 Variants are used:</b><br>• Knock all enemies in Range back by 15 studs"
                },
                {
                    name: "Rubber Control",
                    desc: "<b>On Attack:</b><br>• Leave behind a bouncy area where this unit attacked for 15 seconds<br>• Enemies in bouncy areas will take 1.5x DoT for 10 seconds<br>• After the DoT buff ends, knock enemies back 10 studs<br><b>Every second enemies spend in bouncy areas:</b><br>• Take +5% Damage from all sources up to +30% for 15 seconds<br>• Maximum amount of bouncy areas: 2<br>• This passive does not trigger for Variant 3 of 'Goofing Around'"
                },
                {
                    name: "Armament",
                    desc: "• Deal 1.75x Damage to Armored and Hyper Armored enemies"
                }
            ]
        },
        {
            name: "Joy Boy + Obs",
            desc: "Joy Boy + Observation Haki.",
            img: "images/units/JoyfulCaptain/JoyObs.png",
            stats: { spaCap: 3.75 },
            upgrades: [{ dmg: 15200, spa: 8, range: 62, cost: 102500 }],
            totalCost: 102500,
            passives: [
                {
                    name: "Goofing Around",
                    passiveDmg: 50,
                    desc: "• This unit will randomly switch between 3 Attack variants (cannot use the same Variant twice in a row)<br>• Pick a random number between +25% and +75%<br>• Based on the random value, buff AOE size and Damage<br><b>Variant 1</b><br>• Circle AOE, 100% Damage<br>• +25% True Damage for the duration of this Attack<br><b>Variant 2</b><br>• Circle AOE - 100% Damage<br>• Deal 15% Damage to enemies in rubber areas<br><b>Variant 3</b><br>• Full AOE - 85% Damage<br><b>Variant 4</b><br>• Circle AOE - 120% Damage<br><b>When all 4 Variants are used:</b><br>• Knock all enemies in Range back by 15 studs"
                },
                {
                    name: "Rubber Control",
                    desc: "<b>On Attack:</b><br>• Leave behind a bouncy area where this unit attacked for 15 seconds<br>• Enemies in bouncy areas will take 1.5x DoT for 10 seconds<br>• After the DoT buff ends, knock enemies back 10 studs<br><b>Every second enemies spend in bouncy areas:</b><br>• Take +5% Damage from all sources up to +30% for 15 seconds<br>• Maximum amount of bouncy areas: 2<br>• This passive does not trigger for Variant 3 of 'Goofing Around'"
                },
                {
                    name: "Observation",
                    desc: "• Dodges any attempted Stun up to 6 times<br>• Gain 1 dodge every 15 seconds<br>• Start at 0 Dodges"
                }
            ]
        },
        {
            name: "Snakeman + Arm",
            desc: "Snakeman + Armament Haki.",
            img: "images/units/JoyfulCaptain/SnakeArm.png",
            stats: { spaCap: 2.5 },
            upgrades: [{ dmg: 13450, spa: 16, range: 32.5, cost: 87000 }],
            totalCost: 87000,
            passives: [
                {
                    name: "Snakeman",
                    desc: "• This unit's attack will chain to an enemies within 8 studs until the attack length exceeds 40 studs<br>• When running out of enemies to chain, retract the arms<br><b>For every 5 enemies hit:</b><br>• Gain +1 Follow-up for the next 3 attacks<br>• This unit can have a maximum of 2 active Follow-ups<br><b>If this unit's attack only hits one enemy:</b><br>• Deal 180% Damage"
                },
                {
                    name: "Armament",
                    desc: "• Deal 1.75x Damage to Armored and Hyper Armored enemies"
                },
                {
                    name: "Observation",
                    desc: "• Dodges any attempted Stun up to 6 times<br>• Gain 1 dodge every 15 seconds<br>• Start at 0 Dodges"
                },
                {
                    name: "Boomerang",
                    desc: "<b>For every enemy hit by the previous Attack:</b><br>• +10% Damage (Cap: +50%)"
                }
            ]
        },
        {
            name: "Snakeman + Conq",
            desc: "Snakeman + Conqueror Haki.",
            img: "images/units/JoyfulCaptain/SnakeConq.png",
            stats: { spaCap: 2.5 },
            upgrades: [{ dmg: 13450, spa: 16, range: 32.5, cost: 89500 }],
            totalCost: 89500,
            passives: [
                {
                    name: "Snakeman",
                    desc: "• This unit's attack will chain to an enemies within 8 studs until the attack length exceeds 40 studs<br>• When running out of enemies to chain, retract the arms<br><b>For every 5 enemies hit:</b><br>• Gain +1 Follow-up for the next 3 attacks<br>• This unit can have a maximum of 2 active Follow-ups<br><b>If this unit's attack only hits one enemy:</b><br>• Deal 180% Damage"
                },
                {
                    name: "Conqueror",
                    desc: "• Unleash a wave of energy every 30s that Stuns non-boss Enemies in Range for 2s"
                },
                {
                    name: "Observation",
                    desc: "• Dodges any attempted Stun up to 6 times<br>• Gain 1 dodge every 15 seconds<br>• Start at 0 Dodges"
                },
                {
                    name: "Boomerang",
                    desc: "<b>For every enemy hit by the previous Attack:</b><br>• +10% Damage (Cap: +50%)"
                }
            ]
        }
    ]
});
