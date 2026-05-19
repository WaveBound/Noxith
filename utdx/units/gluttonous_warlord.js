unitDatabase.push({
    id: "gluttonous_warlord",
    name: "Gluttonous Warlord (Despair)",
    img: "images/units/GluttonousWarlord.png",
    level: 100,
    placement: 2,
    placementType: "Hill",
    role: "Specialist",
    tags: ["Villain", "Piece", "Warlord"],

    meta: {
        short: "",
        long: "",
        note: ""
    },

    totalCost: 79000,

    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        element: "Rose",
        dotDuration: 0,
        support: ""
    },

    upgrades: [
        { dmg: 360, spa: 10.0, range: 23, cost: 2500 },    // Up 0 (Base)
        { dmg: 720, spa: 10.0, range: 25, cost: 4000 },    // Up 1
        { dmg: 1700, spa: 10.0, range: 29, cost: 7500 },   // Up 2
        { dmg: 2200, spa: 10.0, range: 32, cost: 10000 },  // Up 3
        { dmg: 4200, spa: 10.0, range: 35, cost: 15000 },  // Up 4
        { dmg: 4800, spa: 10.0, range: 37, cost: 18000 },  // Up 5
        { dmg: 5600, spa: 10.0, range: 40, cost: 22000 }   // Up 6
    ],

    passives: [
        {
            name: "Soul Harvest",
            passiveDmg: 25,
            desc: "Every Takedown within Range:<br>• Summon a Gluttonous Ghost with 10% Health<br>• This unit can summon up to 10 Ghosts at a time<br>• Gain +1% Damage (Cap: +25%)<br><br>For every enemy in Range:<br>If the enemy's Health is lower than this unit's Damage:<br>• Take 2% Damage while in Range"
        },
        {
            name: "Your Fear is now my Strength",
            desc: "Every 12 seconds:<br>• Stun all Units in Range for 3 seconds<br><br>For each stunned unit:<br>• +2.5% Damage per Unit for 10s<br>• +1% Range per Unit for 10s<br>• (Etherealization 2: buffs above will last for 20s)"
        },
        {
            name: "Ethereal Life Force",
            desc: "When there is an active Boss:<br>• Use the Active Ability to summon a Giant Gluttonous Ghost<br>• The Ghost will have 250% Damage as Health and will spawn at the start of the Path<br>• This Ability can be used once per match"
        },
        {
            name: "Special Companions",
            desc: "On Final Upgrade:<br>• Spawn Flame Cloud and Lightning Cloud as sub-towers next to this unit<br><br>Flame Cloud:<br>• Every 1st and 3rd Attack this unit does, do a Follow-Up<br>• Deal 75% Damage (Non-Crit) and apply Burn for 25% Damage over 5s<br><br>Lightning Cloud:<br>• Every 2nd and 3rd Attack this unit does, do a Follow-Up<br>• Deal 75% Damage (Non-Crit) and apply Electrified for 25% Damage over 5s"
        },
        {
            name: "Eternal Despair",
            desc: "When a Ghost summon dies:<br>• Apply Black Burn for 25% Damage over 5 ticks to nearby enemies<br>• Do a Follow-up Attack for 50% Damage<br>• (Etherealization 6: Follow-up deals 100% Damage)<br><br>Etherealization 4:<br>• Applying Stun also applies Black Burn for 25% Damage over 5 ticks"
        }
    ],

    // CUSTOM SUMMONS (Flame Cloud & Lightning Cloud - triggered by host attacks)
    customSummons: [
        {
            name: "Flame Cloud",
            reqUp: 6,
            spa: 10,       // Fires 2 out of every 3 host attacks (hostSpa * 3/2)
            dmgMult: 0.75,
            dotPct: 25,
            dotDuration: 5,
            dotType: "Burn",
            noCrit: true,
            hostSpaLinked: true,  // SPA scales with host's final SPA
            hostAttackRatio: 1.5, // fires every 1.5 host attacks on average (2 of 3)
            desc: [
                "Every 1st and 3rd host attack:",
                "• 75% Damage (Non-Crit)",
                "• Burn: 25% Damage over 5s"
            ],
            color: "#f97316"
        },
        {
            name: "Lightning Cloud",
            reqUp: 6,
            spa: 10,       // Fires 2 out of every 3 host attacks (hostSpa * 3/2)
            dmgMult: 0.75,
            dotPct: 25,
            dotDuration: 5,
            dotType: "Electrified",
            noCrit: true,
            hostSpaLinked: true,
            hostAttackRatio: 1.5,
            desc: [
                "Every 2nd and 3rd host attack:",
                "• 75% Damage (Non-Crit)",
                "• Electrified: 25% Damage over 5s"
            ],
            color: "#facc15"
        }
    ],

    etherealization: [
        "+10 Stat Points",
        "\"Your Fear is now my Strength\" Duration increased to 20s.",
        "+10 Stat Points",
        "When applying Stun, inflict Black Burn on enemies.",
        "+10 Stat Points",
        "\"Eternal Despair\" Follow-up Damage increased to 100%."
    ]
});
