unitDatabase.push({
    // IDENTITY
    id: "alpha_devil",
    name: "Alpha Devil (Omega)",
    img: "images/units/AlphaDevil.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage / Modes",
    tags: [],

    // META (Build Guide tab)
    meta: {
        short: "Duelist/Sacred",
        long: "Duelist/Sacred",
        note: "Mode-based swordsman with varying SPA caps. Mirage Barrage and Katana offer the fastest attack speeds."
    },

    totalCost: 66500,

    // BASE STATS
    stats: {
        spaCap: 4,
        crit: 0,
        cdmg: 150,
        element: "Dark",
        passiveDmg: 33.3
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 9, range: 25, cost: 1500 },   // Up 0 (Base)
        { dmg: 660, spa: 9, range: 27, cost: 5000 },   // Up 1
        { dmg: 1200, spa: 9, range: 29, cost: 9000 },  // Up 2
        { dmg: 2160, spa: 9, range: 30, cost: 12000 }, // Up 3
        { dmg: 3360, spa: 9, range: 31, cost: 19000 }, // Up 4
        { dmg: 6000, spa: 9, range: 34, cost: 20000 }, // Up 5
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Demonic Arsenal",
            desc: "This unit has an arsenal of weapons to pick from, each with its own unique effect. The placement weapon is Katana.\n\n" +
                "• Katana: Attacking enemies with Stun applied applies Timestop for 3s. Deal 1.5x Damage vs Timestop.\n" +
                "• Demonic Gauntlets: +50% Damage, +50% SPA, -30% Range.\n" +
                "• Phantom Sword: 80% Bleed for 8 ticks vs afflicted enemies.\n" +
                "• Mirage Barrage: -80% Damage, +1,000% Range. Rapid continuous attacks."
        },
        {
            name: "Show me your motivation",
            desc: "On Crit: Toss 2 phantom swords that deal 10% Damage each every second for 10 seconds. Cooldown: 20s."
        },
        {
            name: "This is Power!",
            desc: "Motivation meter fills by 10% per attack. Once filled (100%), transforms into 'Demon Awakened' mode (+50% Damage). Meter depletes by 10% per attack until returning to base form."
        }
    ],

    // MODES (Interactive form switching)
    modes: [
        {
            name: "Katana",
            img: "images/units/AlphaDevil/Katana.png",
            desc: "Standard swordsman stance. Deal 1.5x Damage to enemies with Timestop.",
            dmg: 6000, spa: 9, range: 34, spaCap: 4,
            passiveDmg: 33.3, burnMultiplier: 50
        },
        {
            name: "Demonic Gauntlet",
            img: "images/units/AlphaDevil/Demonic_Gauntlets.png",
            desc: "Heavy strikes: +50% Damage, +50% SPA Speed, -30% Range.",
            dmg: 6000, spa: 9, range: 23.8, spaCap: 6.5,
            passiveDmg: 83.3, passiveSpa: -50
        },
        {
            name: "Phantom Sword",
            img: "images/units/AlphaDevil/Phantom_Sword.png",
            desc: "Applies 80% Bleed for 8 ticks to afflicted enemies.",
            dmg: 6000, spa: 9, range: 34, spaCap: 6,
            passiveDmg: 33.3, dot: 80, dotDuration: 8
        },
        {
            name: "Mirage Barrage",
            img: "images/units/AlphaDevil/Mirage_Barrage.png",
            desc: "-80% Damage, +1,000% Range. Rapid continuous attacks.",
            dmg: 6000, spa: 9, range: 60, spaCap: 4,
            passiveDmg: -26.7
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E1
        "Mirage Barrage loses -60% Damage instead of -80%.", // E2
        "+10 Stat Points",          // E3
        "'Awakening' meter fills up by 20% per attack.", // E4
        "+10 Stat Points",          // E5
        "Toss up to 2 phantom swords on crit with separate cooldowns.", // E6
    ]
});
