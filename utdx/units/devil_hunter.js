unitDatabase.push({
    // IDENTITY
    id: "devil_hunter",
    name: "Devil Hunter",
    img: "images/units/devil_hunter.png",
    placement: 1,               // Max units placeable
    placementType: "Ground",    // "Ground", "Hill", or "Hybrid"
    role: "Damage",             // Role description shown in UI
    tags: [],                   // e.g. ["Reaper", "Bloodline", "Ninjaverse"]

    // META (Build Guide tab)
    meta: {
        short: "Trait",         // Best budget/quick trait
        long: "Trait",          // Best max potential trait(s)
        note: "Brief reasoning."
    },

    totalCost: 0,               // Total gold cost to max

    // BASE STATS
    stats: {
        spaCap: 2.5, crit: 0, cdmg: 150,             // spaCap = min SPA | cdmg 150 = standard
        dot: 0, dotDuration: 0, dotStacks: 1,       // dot = % per tick | duration = # of ticks
        element: "None", passiveDmg: 0,             // "Fire","Ice","Water","Dark","Light","Rose","Wind"
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 8.0, range: 28, cost: 0 },   // Up 0 (Base)
        { dmg: 660, spa: 8.0, range: 30, cost: 0 },   // Up 2
        { dmg: 1200, spa: 8.0, range: 32, cost: 0 },   // Up 3
        { dmg: 2160, spa: 8.0, range: 33, cost: 0 },   // Up 4
        { dmg: 3360, spa: 8.0, range: 35, cost: 0 },   // Up 5
        { dmg: 5400, spa: 8.0, range: 37, cost: 0 }    // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        { name: "Supada's Power", desc: "Gain 10% Awakening per attack. Transforms at 100%. In 'Demon Awakened' form, gain +50% Damage. Meter depletes 10% per attack." },
        { name: "Freestyle", desc: "Gain style points after 10s of constant attacking. Each rank (D to SSS) increases damage by 5%. Resets after 5s of not attacking." },
    ],

    // ABILITY
    ability: {
        buffDmg: 0,
        abilityName: "Demonic Arsenal",
        noToggle: true,
        cooldown: 10,
        desc: "Pick from multiple weapons: Devil Sword (Burn on Bleed), Twin Guns (-20% SPA), Demoncycle (Stun per DoT), Fancy Hat (+100% Dmg, costs 3,000 ¥ per attack)."
    },

    // MODES
    modes: [
        { name: "Devil Sword", img: "images/units/dante/Devil Sword.png" },
        { name: "Twin Guns", img: "images/units/dante/Twin Guns.png" },
        { name: "Demoncycle", img: "images/units/dante/Demoncycle.png" },
        { name: "Fancy Hat", img: "images/units/dante/Fancy Hat.png" }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E1
        "\"Freestyle\" increases Rating every 5 seconds.", // E2
        "+10 Stat Points",          // E3
        "\"Supada's Power\" Awakening gain increased to +20% per Attack.", // E4
        "+10 Stat Points",          // E5
        "\"Freestyle\" resets after 10 seconds.", // E6
    ]
});
