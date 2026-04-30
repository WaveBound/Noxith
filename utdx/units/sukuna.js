unitDatabase.push({
    // IDENTITY
    id: "the_strongest_in_history",
    name: "The Strongest in History",
    img: "images/units/UnitName.png",
    placement: 1,               // Max units placeable
    placementType: "Ground",    // "Ground", "Hill", or "Hybrid"
    role: "Damage",             // Role description shown in UI
    tags: ["Sorcerer", "Villain", "King"],                   // e.g. ["Reaper", "Bloodline", "Ninjaverse"]

    // META (Build Guide tab)
    meta: {
        short: "Ruler",         // Best budget/quick trait
        long: "Ruler",          // Best max potential trait(s)
        note: "Massive DPS with DoT damage and 1 placement limitation."
    },

    totalCost: 117500,               // Total gold cost to max

    // BASE STATS
    stats: {
        spaCap: 3, crit: 0, cdmg: 150,             // spaCap = min SPA | cdmg 150 = standard
        dot: 15, dotDuration: 3, dotStacks: 1,       // dot = % per tick | duration = # of ticks
        element: "Dark", passiveDmg: 50,             // "Fire","Ice","Water","Dark","Light","Rose","Wind"
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 0, spa: 6.6, range: 37, cost: 3000 },   // Up 0 (Base)
        { dmg: 0, spa: 6.6, range: 41, cost: 6000 },   // Up 1
        { dmg: 0, spa: 6.6, range: 47, cost: 9500 },   // Up 2
        { dmg: 0, spa: 6.6, range: 50, cost: 14000 },   // Up 3
        { dmg: 0, spa: 6.6, range: 54, cost: 20000 },   // Up 4
        { dmg: 0, spa: 6.6, range: 59, cost: 30000 },   // Up 5
        { dmg: 6650, spa: 9, range: 63, cost: 35000 },   // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        { name: "Shadow Emerge", desc: "On each attack, if the enemy hit is marked by 'The Shadows': 45% chance (E2: 70%) to trigger a Follow-Up Attack dealing 100% Damage and inflicting Bleed for 15% Damage over 3 ticks. Each Follow-Up Attack permanently grants +5% Damage (cap: +50%)." },
        { name: "The Shadows", desc: "Every attack permanently marks the enemy hit and increases their Damage Taken based on total marked enemies in range — 1–10: +15%, 11–20: +20%, 21+: +25%. At 21+ marked enemies, both Ten Umbra summons may be placed simultaneously and enemies are Slowed by 10%.<br><br>E4: 26+ marked enemies increases Damage Taken to +35%, Stuns all marked enemies for 0.5s (cooldown of 30s), Slows by 15%, and reduces all mark thresholds by 5. Every 20 marked enemies defeated triggers a random Ten Umbra summon attack." },
        { name: "Adaptive Wheel", desc: "Once activated, this unit gains permanent immunity to Stun and debuffs after 60 seconds from first application. (E6: Ability is automatically activated upon placement.)" }
    ],

    ability: [
        {
            buffDmg: 0,
            abilityName: "Domain Expansion",
            noToggle: true,
            cooldown: 300,
            desc: "Every 0.5s, deals 20% Damage to all enemies in range. Enemies hit are Slowed by 20% and take +20% increased Damage from all sources for the duration. When the ability ends, this unit is Stunned for 10s. Boss Exception: If a Boss is hit, the stun is cancelled and this unit instead casts Fire Arrow — dealing 300% Damage in a circular AoE and applying Burn (50% Damage over 10 ticks).",
        },
        {
            buffDmg: 0,
            abilityName: "Ten Umbra",
            noToggle: true,
            cooldown: 0,
            desc: "PERFECT CURSE (Unlocks at Upgrade 4): Summons a tower that copies 50% of this unit's Damage and Range (E6: 65%) with a fixed SPA of 12. On each attack, randomly applies one of the following: Stun 5 enemies in range for 3s, 40% Bleed for 6s, 20% Radiation with +15% increased damage taken for 6s, or buff nearby allies with +10% Damage, +10% Range, and -5% SPA for 6s.<br><br>ADAPTIVE CURSE (Unlocks at Max Upgrade): Summons a tower that copies 100% of this unit's Damage and Range with a fixed SPA of 12. Gains the Adaptive Wheel passive — any immunity this tower acquires is also applied to The Strongest in History. Every 5 attacks (E6: every 3 attacks), casts World Cutting Slash, dealing 150% Damage in a 180° cone AoE."
        },
    ],

    // ETHEREALIZATION (E0-E5 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E0
        "Shadow Emerge follow up chance increased to 70%.",      // E1
        "+10 Stat Points",          // E2
        "The Shadows passive becomes enhanced (Check Passive description).",      // E3
        "+10 Stat Points",          // E4
        "Ten Umbra ability becomes enhanced (Check Passive description).",      // E5
    ]
})