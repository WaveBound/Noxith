unitDatabase.push({
    // IDENTITY
    id: "mimicry_sorcerer",
    name: "Mimicry Sorcerer (Cursed Love)",
    img: "images/units/MimicrySorcerer.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "DPS / Ground",
    tags: ["Sorcerer", "Hero",],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Universal TD Optimizer's latest addition. Powerful mode-based unit."
    },

    totalCost: 66250,

    // BASE STATS
    stats: {
        spaCap: 2.5,
        crit: 0,
        cdmg: 150,
        element: "Rose",
        passiveDmg: 0
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 378, spa: 6, range: 27, cost: 1750 },   // Up 0 (Base)
        { dmg: 594, spa: 6, range: 28, cost: 5000 },   // Up 1
        { dmg: 1188, spa: 6, range: 32, cost: 7500 },  // Up 2
        { dmg: 2520, spa: 7, range: 31, cost: 12000 }, // Up 3
        { dmg: 4050, spa: 7, range: 35, cost: 15000 }, // Up 4
        { dmg: 5940, spa: 7, range: 35, cost: 25000 }, // Up 5 (Max)
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Super Speaker",
            desc: "When attacking an Enemy for the first time: Inflict Stun for 3 seconds. [E2]: 50% Chance to inflict Confusion instead."
        },
        {
            name: "Cursed Protector",
            desc: "On Upgrade 4: Summon the Cursed Lover. Cursed Lover copies this unit's Damage and Range and has a Locked SPA of 14. [E4]: Cursed Lover gets summoned on placement."
        },
        {
            name: "Mimicry Techniques",
            desc: "Choose an active technique to gain unique bonuses:\n" +
                "• Cursed Vessel: Attacks apply Bleed (25% Damage/4 ticks).\n" +
                "• Infinity Sorcerer: Enemies entering range take 15% Damage and are Slowed by 30%.\n" +
                "• Gambler Sorcerer: Missing a Crit grants +20% Crit Rate/CDmg (Resets on Crit).\n" +
                "• Judgement Sorcerer: Gain +10% Damage per hit (up to +50%) if enemy survives.\n" +
                "• Jane Juliet: Perform 3 consecutive follow-ups per attack (Stuns self for 5s)."
        }
    ],

    // ABILITY
    ability: {
        abilityName: "Synchro Clash",
        noToggle: true,
        cooldown: 60,
        desc: "When both 'Mimicry Sorcerer' and 'Jane Juliet' are fully upgraded and within each other's range: Release a dual Synchro Attack, dealing 500% of the average Damage between these two units."
    },

    // CUSTOM SUMMONS
    customSummons: [
        {
            name: "Cursed Lover",
            reqUp: 4,
            spa: 14,
            dmgMult: 1.0,
            canCrit: false,
            desc: [
                "Copies host's Damage and Range",
                "Locked SPA: 14",
                "Summoned on Upgrade 4 (E4: On Placement)"
            ],
            color: "#f472b6"
        }
    ],

    // MODES (Mimicry Options)
    modes: [
        {
            name: "Cursed Vessel",
            img: "images/units/MimicrySorcerer/CursedVessel.png",
            desc: "Attacks will apply Bleed for 25% Damage over 4 ticks.",
            dmg: 5940, spa: 7, range: 35, dot: 25, dotDuration: 4
        },
        {
            name: "Infinity Sorcerer",
            img: "images/units/MimicrySorcerer/Infinity.png",
            desc: "Enemies that enter this unit's Range take 15% Damage and are Slowed by 30% for 5s.",
            dmg: 5940, spa: 7, range: 35, passiveDmg: 15
        },
        {
            name: "Gambler Sorcerer",
            img: "images/units/MimicrySorcerer/Gambler.png",
            desc: "Every time this unit misses a Crit, gain +20% Crit Rate and +20% Crit Damage. Resets on Crit.",
            dmg: 5940, spa: 7, range: 35
        },
        {
            name: "Judgement Sorcerer",
            img: "images/units/MimicrySorcerer/Judgement.png",
            desc: "Every time this unit damages an Enemy and it stays alive, gain +10% Damage up to +50%.",
            dmg: 5940, spa: 7, range: 35, passiveDmg: 50
        },
        {
            name: "Jane Juliet",
            img: "images/units/MimicrySorcerer/JaneJuliet.png",
            desc: "Perform 3 consecutive follow-ups every Attack and get Stunned for 5s at the end of the last one.",
            dmg: 5940, spa: 2.5, range: 35, avgMult: 4.0
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E1
        "Super Speaker: 50% Chance to inflict Confusion instead.", // E2
        "+10 Stat Points",          // E3
        "Cursed Protector: Cursed Lover gets summoned on placement.", // E4
        "+10 Stat Points",          // E5
        "Mimicry: Copied Passive duration increased to 75s.", // E6
    ]
});
