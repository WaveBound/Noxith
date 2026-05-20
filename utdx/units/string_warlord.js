unitDatabase.push({
    id: "string_warlord",
    name: "String Warlord (Joker)",
    img: "images/units/StringWarlord.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Specialist",
    tags: ["Piece", "Warlord", "Villain"],

    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Standard DPS Selection"
    },

    totalCost: 65000,

    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 2.5,
        passiveDmg: 0,
        element: "Rose",
        dotDuration: 0,
        support: "Stun, Slow, Bleed",
        customFollowUp: {
            chance: 100 / 7,       // Every 7 attacks (stack-based counter)
            eLevelReq: 99,         // No etherealization upgrade for this
            eLevelChance: 100 / 7, // Same chance at all levels
            dmgMult: 1.6,          // 160% total (2 String Worms at 80% each)
            fuaAnimation: 2,       // 2s animation time
            label: "String Worm"
        }
    },

    upgrades: [
        { dmg: 220, spa: 9.0, range: 18, cost: 1000 },     // Up 0 (Base)
        { dmg: 480, spa: 9.0, range: 20, cost: 3500 },      // Up 1
        { dmg: 1300, spa: 9.0, range: 22, cost: 9500 },     // Up 2
        { dmg: 1800, spa: 9.0, range: 25, cost: 14000 },    // Up 3
        { dmg: 3000, spa: 10.0, range: 28, cost: 17000 },   // Up 4
        { dmg: 4200, spa: 10.0, range: 31, cost: 20000 }    // Up 5
    ],

    passives: [
        {
            name: "String Clone",
            desc: "Every attack has a <b>25%</b> chance to spawn a String Clone.<br>• If <b>3</b> attacks fail to spawn one, the <b>4th</b> attack is guaranteed.<br>• String Clone has <b>75%</b> Damage, <b>1.25x</b> SPA, and <b>100%</b> Range.<br>• String Clone lasts for <b>2</b> attacks.<br>• If this unit receives a negative effect while the clone is active, the clone takes it and disappears."
        },
        {
            name: "Birdcage",
            desc: "<b>Active Ability: Birdcage</b><br>• Opens a Birdcage with <b>100%</b> of this unit's Range for <b>60</b> seconds.<br>• Every <b>10</b> seconds, triggers String Swipe or String Stun.<br><br><b>String Swipe</b><br>• Deal <b>45%</b> Damage to all enemies in Range<br><br><b>String Stun</b><br>• Stun all enemies for <b>2.5</b> seconds<br>• Apply Bleed for <b>20%</b> Damage over <b>4</b> ticks<br>• Apply <b>15%</b> Slow for <b>4</b> seconds<br><br><b>When the Birdcage closes:</b><br>• Explodes for <b>125%</b> [<b>250%</b> on Etherealization 6] Damage.<br>• Global Cooldown: <b>120</b> seconds."
        },
        {
            name: "Off-White",
            passiveDmg: 21,
            desc: "On <b>Attack</b> or <b>Kill</b>: gain <b>1</b> String stack.<br>• Each String stack grants <b>+3%</b> [<b>+6%</b> on Etherealization 4] Damage.<br>• At <b>10</b> [<b>7</b> on Etherealization 4] stacks, consumes all strings and fires <b>2</b> String Worms at random enemies.<br>• Each String Worm deals <b>50%</b> [<b>80%</b> on Etherealization 2] Damage."
        }
    ],

    // CUSTOM SUMMONS (String Clone - spawns every 4 attacks, does 2 attacks at 75% dmg)
    customSummons: [
        {
            name: "String Clone",
            reqUp: 0,
            spa: 12.5,          // 1.25x host SPA (at max SPA 10: 10 * 1.25 = 12.5)
            dmgMult: 0.75,      // 75% of host damage
            noCrit: true,
            hostSpaLinked: true,
            hostAttackRatio: 2, // 2 attacks per 4 host attacks = 1 per 2
            isSummon: true,     // Counts as summon for Monarch Cape/Set
            desc: [
                "Spawns every 4 attacks:",
                "• 75% Damage (Non-Crit)",
                "• 1.25x SPA, 100% Range",
                "• Lasts 2 attacks"
            ],
            color: "#f97316"
        }
    ],

    etherealization: [
        "+10 Stat Points (E1)",
        "\"Off-White\" String Worm Damage increased to 80% (E2)",
        "+10 Stat Points (E3)",
        "\"Off-White\" stacks required reduced to 7. Stack Damage increased to +6% (E4)",
        "+10 Stat Points (E5)",
        "\"Birdcage\" explosion Damage increased to 250% (E6)"
    ]
});
