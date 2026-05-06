unitDatabase.push({
    // IDENTITY
    id: "jinoo_shadow_monarch",
    name: "Jinoo, Shadow Monarch",
    img: "images/units/JinooShadowMonarch.png",
    level: 100,
    placement: 1,
    placementType: "Ground",
    role: "Specialist / Ground",
    tags: ["Main Character", "Hero", "Leveling"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },

    totalCost: 116500,

    // SYSTEM LEVEL (Interactive "The System" level, 1-100)
    systemLevel: {
        label: "The System Lv.",
        passiveName: "The System",
        min: 1, max: 100, default: 100,
        perLevel: { passiveDmg: 1 },
        thresholds: [
            { level: 20, passiveSpa: 20 }
        ]
    },

    modes: [
        { name: "Shadow Legion", img: "images/units/jinoo/ShadowLegion.png", desc: "Enable Shadow Legion summon." },
        { name: "Shadow Bear", img: "images/units/jinoo/ShadowBear.png", desc: "Enable Shadow Bear summon." },
        { name: "Shadow Dragon", img: "images/units/jinoo/ShadowDragon.png", desc: "Enable Shadow Dragon summon." },
        { name: "Shadow Knight", img: "images/units/jinoo/ShadowKnight.png", desc: "Enable Shadow Knight summon." },
        { name: "Ant King", img: "images/units/jinoo/AntKing.png", desc: "Enable Ant King summon." }
    ],
    allowMultipleModes: true,
    modesLabel: "Summons",

    customSummons: [
        { name: "Shadow Legion", reqUp: 0, spa: 30, dmgMult: 0.3, count: 3, noCrit: true, color: "#8b5cf6", ui: { cost: 50, hp: 50, cd: 30 }, desc: ["Summon 3 Soldiers, each dealing 20-40% Damage ONCE", "Cost: 50 Mana | Cooldown: 30s"] },
        { name: "Shadow Bear", reqUp: 0, spa: 20, dmgMult: 0.0, noCrit: true, color: "#8b5cf6", ui: { cost: 50, hp: 300, cd: 20 }, desc: ["Tank: 300% Health, 0% Damage"] },
        { name: "Shadow Dragon", reqUp: 0, spa: 40, dmgMult: 0.8, noCrit: true, color: "#8b5cf6", ui: { cost: 80, hp: 60, cd: 40 }, desc: ["Air Unit: 80% Damage ONCE per spawn", "Cooldown: 40s"] },
        { name: "Shadow Knight", reqUp: 0, spa: 50, dmgMult: 1.5, noCrit: true, color: "#8b5cf6", ui: { cost: 120, hp: 85, cd: 50 }, desc: ["150% Damage and 2s Stun ONCE per spawn", "Cooldown: 50s"] },
        { name: "Ant King", reqUp: 0, spa: 60, dmgMult: 1.0, noCrit: true, color: "#8b5cf6", ui: { cost: 180, hp: 200, cd: 60 }, desc: ["100% Damage and 30% Bleed ONCE per spawn", "Cooldown: 60s"] }
    ],

    // BASE STATS
    stats: {
        spaCap: 6.5, crit: 0, cdmg: 150,
        dot: 0, dotDuration: 0, dotStacks: 1,
        element: "Dark", passiveDmg: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 8, range: 30, cost: 3000, spaCap: 3.5 },   // Up 0 (Base)
        { dmg: 840, spa: 9, range: 32, cost: 5500, spaCap: 3.5 },   // Up 1
        { dmg: 1440, spa: 9, range: 33, cost: 9000, spaCap: 3.5 },   // Up 2
        { dmg: 2280, spa: 9, range: 36, cost: 12000, spaCap: 4 },  // Up 3
        { dmg: 4320, spa: 9, range: 38, cost: 17000, spaCap: 4 },  // Up 4
        { dmg: 5880, spa: 9, range: 40, cost: 25000, spaCap: 4 },  // Up 5
        { dmg: 9000, spa: 13, range: 42, cost: 40000 },  // Up 6 (Max)
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Shadow Monarch",
            desc: "This unit has a Mana bar that is used for his Summoning Abilities.\n\n" +
                "Every second: Gain +3 [+5 on Etherealization 6] Mana.\n" +
                "The Active Ability allows this unit to Summon an arsenal of Shadows:\n\n" +
                "• Shadow Legion: Summon 3 Soldiers, dealing 20-40% Damage every 5s with 50% Health. Cost: 50 Mana. Cooldown: 30s.\n" +
                "• Shadow Bear ('The System' Level 40+): Has no Attack, instead has 300% Health. Cost: 50 Mana. Cooldown: 20s.\n" +
                "• Shadow Dragon ('The System' Level 60+): Deals 80% Damage every 7s with 60% Health. This Summon can only collide with Air Enemies and will fly over Ground Enemies. Cost: 80 Mana. Cooldown: 30s.\n" +
                "• Shadow Knight ('The System' Level 80+): Deal 150% Damage and 2s Stun every 6s with 85% Health. Cost: 120 Mana. Cooldown: 50s.\n" +
                "• Ant King ('The System' Level 100): Deal 100% Damage and 30% Bleed for 5s every 8s with 200% Health. Cost: 180 Mana. Cooldown: 6s."
        },
        {
            name: "Strongest Hunter",
            desc: "This unit applies a Buff to all units with the 'Leveling' tag (excluding itself).\n\n" +
                "If unit is 'Shadow Knight':\n" +
                "• +40% Damage\n" +
                "• [Etherealization 4: +50% Damage]\n\n" +
                "Otherwise:\n" +
                "• +20% Damage\n" +
                "• [Etherealization 4: +30% Damage]\n\n" +
                "• -10% Cost"
        },
        {
            name: "The System",
            desc: "This unit has a Level and XP that allows it to get stronger and unlock new Abilities.\n\n" +
                "On Attack: +50 [+75 on Etherealization 2] XP.\n" +
                "On Takedown: +100 [+150 on Etherealization 2] XP.\n\n" +
                "For every Level:\n" +
                "• +1% Damage (Cap: Level 100)\n\n" +
                "On Level 20:\n" +
                "• -20% SPA\n\n" +
                "On Level 40:\n" +
                "• Unlock Summon: Shadow Bear\n\n" +
                "On Level 60:\n" +
                "• +25% Hyper Armor Damage\n" +
                "• Unlock Summon: Shadow Dragon\n\n" +
                "On Level 80:\n" +
                "• Unlock Summon: Shadow Knight\n\n" +
                "On Level 100:\n" +
                "• Unlock Summon: Ant King"
        },
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",          // E1
        "\"The System\" XP Gain increased by 50%.", // E2
        "+10 Stat Points",          // E3
        "\"Strongest Hunter\" Damage Buff increased by 10%.", // E4
        "+10 Stat Points",          // E5
        "\"Shadow Monarch\" Mana gain increased to 5 per second.", // E6
    ]
});
