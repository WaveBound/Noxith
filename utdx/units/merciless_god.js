unitDatabase.push({
    // IDENTITY
    id: "merciless_god",
    name: "Merciless God",
    img: "images/units/MercilessGod.png",
    level: 100,
    placement: 3,
    placementType: "Hybrid",
    role: "Utility",
    tags: ["Fusion", "Divinity", "Rage", "Super Warrior", "Villain"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Universal Utility: features 6 distinct modes specializing in different stat distributions. No charge-up time required."
    },

    totalCost: 115000,
    defaultMode: 4, // Ensure starting on 2-0-5 (index 4)

    // BASE STATS
    stats: {
        dmg: 0,
        spa: 1,
        range: 0,
        spaCap: 1,
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        element: "Rose",
        passiveDmg: 0
    },

    allowMultipleModes: false,
    noPoints: true, // Multi-mode units often use fixed stats per mode

    // MODES
    modes: [
        {
            name: "5-2-0",
            desc: "Focus: Absolute Damage & Clone Army. Uses 'Divine Replication' to scale massive damage from a single placement.",
            img: "images/units/MercilessGod/5-2-0.png",
            limitPlace: 1, // Enforce 1 placement
            upgrades: [{ dmg: 8250, spa: 12, range: 64, cost: 100000, spaCap: 7 }],
            stats: {
                dot: 100, dotDuration: 7, dotType: "Ionized/Bleed", dotBuff: 30
            },
            customSummons: [
                {
                    name: "Divine Clones (4.83 Avg)",
                    reqUp: 0,
                    spa: 14,
                    dmgMult: 0.75, // 50% Base * 1.5x vs Ionized enemies
                    dotPct: 20,
                    dotDuration: 8,
                    dotType: "Bleed",
                    noCrit: true,
                    count: 4.83,   // 4 (Capped 10s spawns) + 0.83 (Avg 5th hit spawns)
                    desc: [
                        "• Clones deal 50% Dmg (75% vs Ionized enemies)",
                        "• Apply Bleed: 20% Dmg over 8 ticks",
                        "• Standard Cap: 4. Scythe of Sorrow triggers spawn over cap."
                    ],
                    color: "#f472b6"
                }
            ],
            passives: [
                { name: "Super Pink Beam", desc: "<br>Ability (90s CD): Release global Line AOE for 200% Damage. Divine Clones deal 200% Damage during this attack." },
                { name: "Godly Earrings", desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.", dotBuff: 30 },
                { name: "Scythe of Sorrow", desc: "<br>• Attacks apply Ionized (70%/7 ticks).<br>• Every 5th Attack: Summon 2 Clones for 25s (Bypasses Cap).<br>• Clones deal 1.5x Multiplier to Ionized enemies." },
                { name: "Divine Replication", desc: "<br>• Limited to 1 Placement.<br>• Gain +100% Damage for every unused placement (+200% Total).<br>• Every 10s: Summon a Clone (45s duration, Max 4)." },
                { name: "Godly Energy", desc: "<br>Attacks apply Bleed for 30% Damage over 6 ticks." }
            ]
        },
        {
            name: "5-0-2",
            desc: "Focus: Boss Slaying & Execution. Inherits Divine Replication damage and clone mechanics.",
            img: "images/units/MercilessGod/5-0-2.png",
            limitPlace: 1, // Enforce 1 placement
            upgrades: [{ dmg: 8800, spa: 12, range: 64, cost: 104000, spaCap: 7 }],
            totalCost: 115000,
            stats: {
                dot: 100, dotDuration: 7, dotType: "Ionized/Bleed", dotBuff: 30
            },
            customSummons: [
                {
                    name: "Divine Clones (4.83 Avg)",
                    reqUp: 0,
                    spa: 14,
                    dmgMult: 0.75,
                    dotPct: 20,
                    dotDuration: 8,
                    dotType: "Bleed",
                    noCrit: true,
                    count: 4.83,
                    desc: [
                        "• Clones deal 50% Dmg (75% vs Ionized enemies)",
                        "• Apply Bleed: 20% Dmg over 8 ticks",
                        "• Standard Cap: 4. Scythe of Sorrow triggers spawn over cap."
                    ],
                    color: "#f472b6"
                }
            ],
            passives: [
                {
                    name: "Divine Sentence",
                    desc: "<br>Instantly kill non-boss enemies under 40% HP (20% for Bosses)."
                },
                {
                    name: "Godly Earrings",
                    desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.",
                    dotBuff: 30
                },
                {
                    name: "Super Pink Beam",
                    desc: "<br>Ability (90s CD): Release global Line AOE for 200% Damage. Divine Clones deal 200% Damage during this attack."
                },
                {
                    name: "Scythe of Sorrow",
                    desc: "<br>• Attacks apply Ionized (70%/7 ticks).<br>• Every 5th Attack: Summon 2 Clones for 25s (Bypasses Cap).<br>• Clones deal 1.5x Multiplier to Ionized enemies."
                },
                {
                    name: "Divine Replication",
                    desc: "<br>• Limited to 1 Placement.<br>• Gain +100% Damage for every unused placement (+200% Total).<br>• Every 10s: Summon a Clone (45s duration, Max 4)."
                }
            ]
        },
        {
            name: "2-5-0",
            desc: "Focus: Hybrid Damage & Debuffs. Features 'Dual Assault' follow-ups and dual-status applications.",
            img: "images/units/MercilessGod/2-5-0.png",
            upgrades: [{ dmg: 10000, spa: 16, range: 58, cost: 80000, spaCap: 4 }],
            stats: {
                dot: 30, dotDuration: 6, dotType: "Bleed", dotBuff: 30,
                support: "Slow, Confusion", slowPct: 40, slowDuration: 8
            },
            customFollowUp: {
                chance: 100,
                cooldown: 10,
                nextAttack: true,
                dmgMult: 1.4,        // 140% Dmg
                fuaAnimation: 4, // 4s animation lock (like Nursefather)
                dotPct: 0,          // Dual Assault deals hit damage only
                label: "Dual Assault"
            },
            passives: [
                {
                    name: "Dual Assault",
                    desc: "<br>Every 10 seconds, the next attack triggers a Follow-up for 140% Damage."
                },
                {
                    name: "Divine Judgement",
                    desc: "<br>• Apply 40% Slow (8s) or Confusion (5s).<br>• If enemy is already afflicted: apply Burn (75%/10 ticks) and Radiation (50%/10 ticks)."
                },
                {
                    name: "Godly Earrings",
                    desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.", dotBuff: 30
                },
                {
                    name: "Divine Replication",
                    desc: "<br>Unique: Only one Merciless God with the Top Path (5-x-x) can be active at a time."
                }
            ]
        },
        {
            name: "0-5-2",
            desc: "Focus: Heavy Support & Crowd Control. Combined slowing, stunning, and confusion with Dual Assault follow-ups.",
            img: "images/units/MercilessGod/0-5-2.png",
            upgrades: [{ dmg: 10000, spa: 16, range: 57, cost: 85000, spaCap: 4 }],
            stats: {
                dot: 30, dotDuration: 6, dotType: "Bleed", dotBuff: 30,
                support: "Slow, Confusion, Stun", slowPct: 40, slowDuration: 8, stunDuration: 2
            },
            customFollowUp: {
                chance: 100,
                cooldown: 10,
                nextAttack: true,
                dmgMult: 1.4,        // 140% Dmg
                fuaAnimation: 4, // 4s animation lock (like Nursefather)
                dotPct: 0,          // Dual Assault deals hit damage only
                label: "Dual Assault"
            },
            passives: [
                {
                    name: "Dual Assault",
                    desc: "<br>Every 10 seconds, the next attack triggers a Follow-up for 140% Damage."
                },
                {
                    name: "Divine Judgement",
                    desc: "<br>• Apply 40% Slow (8s) or Confusion (5s).<br>• If enemy is already afflicted: apply Burn (75%/10 ticks) and Radiation (50%/10 ticks)."
                },
                {
                    name: "Godly Earrings",
                    desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.", dotBuff: 30
                },
                {
                    name: "Godly Energy",
                    desc: "<br>Attacks apply Bleed for 30% Damage over 6 ticks."
                },
                {
                    name: "Godly Rage",
                    desc: "<br>Every attack applies Stun for 2 seconds."
                }
            ]
        },
        {
            name: "2-0-5",
            desc: "Focus: Extreme Burst & Crowd Control. Features 'Unstable Divinity' cycle and permanent marking mechanics.",
            img: "images/units/MercilessGod/2-0-5.png",
            upgrades: [{ dmg: 12000, spa: 10, range: 61, cost: 116000, spaCap: 5 }],
            stats: {
                dot: 30, dotDuration: 6, dotType: "Bleed",
                dotBuff: 30,
                support: "Stun, Mark", stunDuration: 2,
                passiveDmg: 123.33, // Avg Unstable (133.33) + Max Mark (100)
                passiveSpa: 11,     // Avg Unstable speedup (2/3 of 30%)
                passiveRange: 11,   // Avg Unstable range increase (2/3 of 30%)
                hyperArmor: 66.67   // Avg Unstable hyper armor dmg
            },
            passives: [
                {
                    name: "Unstable Divinity",
                    desc: "<br>Every 30 seconds:<br>• Enter 'Unstable State' for 60 seconds<br><br>During 'Unstable State':<br>• +100% Hyper Armor Damage<br>• +200% Damage<br>• -30% SPA<br>• +30% Range<br>• Gain Stun Immunity<br><br>When 'Unstable State' ends:<br>• +40% SPA for 20 seconds<br>• -40% Range for 20 seconds<br>• -45% Damage for 20 seconds"
                },
                {
                    name: "Godly Rage",
                    desc: "<br>Every attack applies Stun for 2 seconds."
                },
                {
                    name: "Godly Earrings",
                    desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.",
                    dotBuff: 30
                },
                {
                    name: "Corrupted Manifestation",
                    desc: "<br>• Every Attack marks enemies permanently.<br>• For every marked enemy in range: +20% Damage (Cap: +100%).<br>• On death: Deal 30% Damage to surrounding enemies and mark unmarked targets hit."
                },
                {
                    name: "Infinite God Domain",
                    desc: "<br>Ability (One-time): One-time use global attack.<br>• Apply 30s Stun to all enemies on map.<br>• Enemies take +20% Damage until death.<br>• Deal 10% Damage per second for 30s."
                },
                {
                    name: "Divine Replication",
                    desc: "<br>Unique: Only one Merciless God with the Top Path (5-x-x) can be active at a time."
                },
                {
                    name: "Godly Energy",
                    desc: "<br>On Attack: Apply Bleed for 30% Damage over 6 ticks."
                }
            ]
        },
        {
            name: "0-2-5",
            desc: "Focus: Global Utility & DoT Scaling. Features 'Unstable Divinity' cycles and Godly Earring support for allies.",
            img: "images/units/MercilessGod/0-2-5.png",
            upgrades: [{ dmg: 12000, spa: 10, range: 61, cost: 117000, spaCap: 5 }],
            stats: {
                dotBuff: 30,
                support: "Stun, Mark", stunDuration: 2,
                passiveDmg: 123.33, // Avg Unstable (133.33) + Max Mark (100)
                passiveSpa: 11,     // Avg Unstable speedup (2/3 of 30%)
                passiveRange: 11,   // Avg Unstable range increase (2/3 of 30%)
                hyperArmor: 66.67,   // Avg Unstable hyper armor dmg
            },
            passives: [
                {
                    name: "Unstable Divinity",
                    desc: "<br>Every 30 seconds:<br>• Enter 'Unstable State' for 60 seconds<br><br>During 'Unstable State':<br>• +100% Hyper Armor Damage<br>• +200% Damage<br>• -30% SPA<br>• +30% Range<br>• Gain Stun Immunity<br><br>When 'Unstable State' ends:<br>• +40% SPA for 20 seconds<br>• -40% Range for 20 seconds<br>• -45% Damage for 20 seconds"
                },
                {
                    name: "Godly Rage",
                    desc: "<br>Every attack applies Stun for 2 seconds."
                },
                {
                    name: "Corrupted Manifestation",
                    desc: "<br>• Every Attack marks enemies permanently.<br>• For every marked enemy in range: +20% Damage (Cap: +100%).<br>• On death: Deal 30% Damage to surrounding enemies and mark unmarked targets hit."
                },
                {
                    name: "Infinite God Domain",
                    desc: "<br>Ability (One-time): One-time use global attack.<br>• Apply 30s Stun to all enemies on map.<br>• Enemies take +20% Damage until death.<br>• Deal 10% Damage per second for 30s."
                },
                {
                    name: "Godly Earrings",
                    desc: "<br>• This unit gains +30% DoT Damage.<br>• Allies in range gain +50% DoT Damage.", dotBuff: 30
                },
                {
                    name: "God's Eye",
                    desc: "<br>When no enemies are in range, increase Range by +10,000%."
                }
            ]
        }
    ],

    passives: [],

    ability: {
        abilityName: "Merciless Collapse",
        desc: "Release a burst of divine energy, dealing 500% damage to all enemies on the map and applying a 3s Stun.",
        cooldown: 180,
        noToggle: true
    },

    etherealization: [
        { desc: "+10 Stat Points (E1)" },
        { desc: "" },
        { desc: "+10 Stat Points (E3)" },
        { desc: "" },
        { desc: "+10 Stat Points (E5)" },
        { desc: "" }
    ]
});