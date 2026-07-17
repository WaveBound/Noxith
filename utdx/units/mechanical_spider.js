unitDatabase.push({
    // IDENTITY
    id: "mechanical_spider",
    name: "Mechanical Spider",
    img: "images/units/MechanicalSpider.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Specialist",
    tags: ["Hero", "Main Character", "Fusion"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Wind DPS with a powerful damage-over-time ability."
    },

    totalCost: 127616,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4.5,
        passiveDmg: 0,
        element: "Light",
        dotDuration: 0,
        support: "",
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 30000, spa: 15, range: 30, cost: 125616 }
    ],

    // PASSIVES (displayed in unit info panel)
    // PASSIVES
    passives: [
        {
            name: "Mechanical Legs",
            desc: "After every Attack:<br>• Perform a Follow-up Attack dealing 80% (100% at E6) True Damage.<br>• Deal +20% (+30% at E6) Damage to enemies with at least 1 Nanotech stack."
        },
        {
            name: "Nanotechnology",
            desc: "On Attack:<br>• Apply +1 Nanotech stack for 10 seconds.<br>• At 1 Stack: Deal 5% Damage per second.<br>• At 2 Stacks: Deal 10% Damage per second & enemies take +10% Damage from all sources.<br>• At 3 Stacks: Deal 15% Damage per second & enemies take +15% Damage from all sources.<br>• At 4 Stacks: Deal 20% Damage per second & enemies take +25% Damage from all sources.<br>• At 5 Stacks: Deal 25% Damage per second & enemies take +40% Damage from all sources & Slows enemies by 20%."
        },
        {
            name: "Spider-Senses", passiveDmg: 150,
            desc: "On attempted Stun:<br>• Always Dodge the Stun.<br>• Gains +25% Damage per dodge (Cap: +100% [+150% at E2]).<br>• Counter Attack the strongest enemy in Range with 50% (70% at E4) True Damage (Counter Cooldown: 25s [10s at E4]).",
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        '"Spider-Senses" Damage Cap increased to +150%.',
        "+10 Stat Points",
        '"Spider-Senses" Counter Cooldown reduced to 10s and True Damage increased to +70%',
        "+10 Stat Points",
        '"Mechanical Legs" True Damage increased to +100% and +30% for enemies with Nanotech.'
    ]
});
