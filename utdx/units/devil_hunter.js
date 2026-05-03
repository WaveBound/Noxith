unitDatabase.push({
    // IDENTITY
    id: "devil_hunter",
    name: "Devil Hunter",
    img: "images/units/devil_hunter.png",
    level: 70,
placement: 3,               // Max units placeable
    placementType: "Ground",    // "Ground", "Hill", or "Hybrid"
    role: "Dps / Ground",             // Role description shown in UI
    tags: [],                   // e.g. ["Reaper", "Bloodline", "Ninjaverse"]

    // META (Build Guide tab)
    meta: {
        short: "Astral",         // Best budget/quick trait
        long: "Astral",          // Best max potential trait(s)
        note: "."
    },

    totalCost: 66500,               // Total gold cost to max

    // BASE STATS
    stats: {
        spaCap: 2.5, crit: 0, cdmg: 150,             // spaCap = min SPA | cdmg 150 = standard
        dot: 0, dotDuration: 0, dotStacks: 1,       // dot = % per tick | duration = # of ticks
        element: "Fire", passiveDmg: 0,             // "Fire","Ice","Water","Dark","Light","Rose","Wind"
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 8.0, range: 28, cost: 1900 },   // Up 0 (Base)
        { dmg: 660, spa: 8.0, range: 30, cost: 4500 },   // Up 2
        { dmg: 1200, spa: 8.0, range: 32, cost: 9100 },   // Up 3
        { dmg: 2160, spa: 8.0, range: 33, cost: 12000 },   // Up 4
        { dmg: 3360, spa: 8.0, range: 35, cost: 19000 },   // Up 5
        { dmg: 5400, spa: 8.0, range: 37, cost: 20000 }    // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        { name: "Demonic Bloodline", desc: "Every 5 attacks, gain a burst of power (+50% Damage) for the next 10 attacks (33.3% average uptime)." },
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
        {
            name: "Devil Sword",
            img: "images/units/dante/Devil Sword.png",
    level: 70,
desc: "Sword focus: Burn on Bleed mechanics.",
            dmg: 5400, spa: 8.0, range: 37, spaCap: 2.5,
            crit: 0, cdmg: 150, dot: 80, dotDuration: 10,
            passiveDmg: 68.3, passiveSpa: 0, bossDmg: 0, dotBuff: 0, hyper: 0, cooldown: 0
        },
        {
            name: "Twin Guns",
            img: "images/units/dante/Twin Guns.png",
    level: 70,
desc: "Gun focus: -20% SPA.",
            dmg: 5400, spa: 8.0, range: 37, spaCap: 3,
            crit: 0, cdmg: 150, dot: 0, dotDuration: 0,
            passiveDmg: 68.3, passiveSpa: -20, bossDmg: 0, dotBuff: 0, hyper: 0, cooldown: 0
        },
        {
            name: "Demoncycle",
            img: "images/units/dante/Demoncycle.png",
    level: 70,
desc: "Heavy focus: Stun per DoT mechanics.",
            dmg: 5400, spa: 8.0, range: 37, spaCap: 4,
            crit: 0, cdmg: 150, dot: 0, dotDuration: 0,
            passiveDmg: 68.3, passiveSpa: 0, bossDmg: 0, dotBuff: 0, hyper: 0, cooldown: 0
        },
        {
            name: "Fancy Hat",
            img: "images/units/dante/Fancy Hat.png",
    level: 70,
desc: "High risk focus: +100% Damage, costs 3,000 ¥ per attack.",
            dmg: 5400, spa: 8.0, range: 37, spaCap: 3.5,
            crit: 0, cdmg: 150, dot: 0, dotDuration: 0,
            passiveDmg: 168.3, passiveSpa: 0, bossDmg: 0, dotBuff: 0, hyper: 0, cooldown: 0
        }
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
