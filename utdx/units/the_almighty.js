unitDatabase.push({
    // IDENTITY
    id: "the_almighty",
    name: "The Almighty",
    img: "images/units/the_almighty.png",
    level: 100,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Peroxide", "Hollow Destroyer", "Villain", "King", "Sword"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Select the desired active mode. Use the Units in Range slider to scale Reishi Manipulation's Blue Burn DoT damage."
    },

    totalCost: 90000,

    // BASE STATS
    stats: {
        spaCap: 4.5,
        crit: 0,
        cdmg: 150,
        dot: 20,
        dotDuration: 5,
        element: "Water"
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 480, spa: 10.0, range: 22.0, cost: 2000 },   // Up 0 (Base)
        { dmg: 1320, spa: 10.0, range: 24.0, cost: 4500 },   // Up 1
        { dmg: 2160, spa: 10.0, range: 27.0, cost: 8500 },   // Up 2
        { dmg: 3120, spa: 10.0, range: 29.0, cost: 11000 },  // Up 3
        { dmg: 4800, spa: 14.0, range: 31.0, cost: 14000 },  // Up 4
        { dmg: 6360, spa: 14.0, range: 33.0, cost: 22000 },  // Up 5
        { dmg: 9000, spa: 14.0, range: 36.0, cost: 28000 }   // Up 6
    ],

    // SYSTEM LEVEL (Units in Range input selector)
    systemLevel: {
        label: "Units in Range",
        min: 1,
        max: 100,
        default: 15,
        controlType: "number",
        passiveName: "Reishi Manipulation"
    },

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Reishi Manipulation",
            desc: "On Attack: Apply Blue Burn for 20% Damage for every unit in Range over 5 ticks (base 20% + 20% per unit). Default is 15 units (320% DoT over 5 ticks)."
        },
        {
            name: "The Almighty",
            desc: "Use the Active Ability to switch forms. Stun immunity is always active.<br>• <b>Self Buff</b>: Gain a new Passive and transfer Stun and Debuffs to allies in Range.<br>• <b>Other Buff</b>: Gain a new Passive and transfer Stun and Debuffs from allies to itself."
        },
        {
            name: "All-Seeing Eye",
            desc: "Changes based on the selected mode: Self Buff or Other Buff."
        }
    ],

    // ABILITY / MODES
    defaultMode: 0,
    modes: [
        {
            name: "Self Buff",
            desc: "All-Seeing Eye: +150% Passive Damage, -20% Range. On Attack: Follow-up Attack for 100% Damage (FUA animation: 4.5s). On Stun/Debuff: Transfer to random ally and gain +50% Damage for 10s. Stun Immunity.",
            stats: {
                customFollowUp: {
                    chance: 100,
                    dmgMult: 1.0,
                    fuaAnimation: 4.5
                }
            }
        },
        {
            name: "Other Buff",
            desc: "All-Seeing Eye: Buff allies in Range based on the game mode (World Raid, Rift, Ultra Boss, Raid, Infinite, or Other). Stun Immunity.",
            stats: {}
        }
    ],

    ability: [
        {
            abilityName: "The Almighty (Active)",
            desc: "Toggle between Self Buff and Other Buff forms. Active Ability Cooldown: 30s.",
            noToggle: true,
            cooldown: 30
        }
    ],

    etherealization: [
        "+10 Stat Points",
        "+10 Stat Points",
        "+10 Stat Points",
        '"All-Seeing Eye" Self Buff Follow-up Damage increased to 100%.',
        "+10 Stat Points",
        '"All-Seeing Eye" Other Buff Buffs increased for every gamemode.'
    ]
});
