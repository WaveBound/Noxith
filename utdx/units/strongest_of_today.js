unitDatabase.push({
    // IDENTITY
    id: "the_strongest_of_today",
    name: "The Strongest of Today",
    img: "images/units/Gojo.png",
    level: 100,
    placement: 1,               // Max units placeable
    placementType: "Ground",    // "Ground", "Hill", or "Hybrid"
    role: "Utility",   // Role description shown in UI
    tags: ["Sorcerer", "Hero"],                   // e.g. ["Reaper", "Bloodline", "Ninjaverse"]

    // META (Build Guide tab)
    meta: {
        short: "Ruler",         // Best budget/quick trait
        long: "Ruler",          // Best max potential trait(s)
        note: "Ruler as unit is 1 placement."
    },

    totalCost: 79000,               // Total gold cost to max

    // BASE STATS
    stats: {
        spaCap: 5, crit: 50, cdmg: 150,             // spaCap = min SPA | cdmg 150 = standard
        dot: 0, dotDuration: 0, dotStacks: 1,       // dot = % per tick | duration = # of ticks
        element: "Light", passiveDmg: 0, passiveSpa: 0, // "Fire","Ice","Water","Dark","Light","Rose","Wind"
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 9, range: 30, cost: 3000 },   // Up 0 (Base)
        { dmg: 840, spa: 9, range: 32, cost: 4000 },   // Up 1
        { dmg: 1440, spa: 9, range: 32, cost: 6000 },   // Up 2
        { dmg: 2280, spa: 9, range: 36, cost: 9000 },   // Up 3
        { dmg: 4320, spa: 9, range: 38, cost: 12000 },  // Up 4
        { dmg: 5880, spa: 9, range: 41, cost: 20000 },  // Up 5
        { dmg: 6840, spa: 9, range: 45, cost: 25000 },  // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        { name: "Limitless Sorcerer", desc: "When an enemy enters Range: Apply 20% [40% on E2] Slow for 5s and Take +25% Damage while in this unit's Range." },
        { name: "Six Eyes", desc: "This unit is immune to Debuff effects. When a Debuff is attempted on this unit: Nullify the effect and the next attack applies Stun for 2s. Every 600 kills: Reset every Active Ability Cooldown." }
    ],

    // ABILITY
    ability: [
        {
            finalMult: 3,
            abilityName: "TS Enemy",
            noToggle: false,
            cooldown: 0,
            desc: "Active Ability: When toggled, this unit deals 3x Damage to all enemies."
        },
        {
            buffDmg: 0,
            abilityName: "Domain Expansion",
            noToggle: false,
            cooldown: 360,
            desc: "Active Ability unlocked on the final Upgrade: Inflict Timestop for 30s to all Enemies in Range. Enemies with Timestop take 150% Damage instead. Gain +1% Damage per Kill until the Ability ends."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E1
        "Limitless Sorcerer: Slow increased to 40%.", // E2
        "+10 Stat Points",          // E3
        "Gain +5% Damage per 'Sorcerer' Tag in Range.", // E4
        "+10 Stat Points",          // E5
        "Deal 3x Damage to Enemies with 'Timestop'.", // E6
    ]
});
