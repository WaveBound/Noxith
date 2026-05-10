unitDatabase.push({
    id: "ancient_shinob",
    name: "Ancient Shinobi",
    img: "images/units/AncientShinob.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "DPS",
    tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Reanimation triples damage but forces 1 placement. Samurai Technique (E2) adds burst damage."
    },
    totalCost: 96450,
    stats: {
        spaCap: 4,
        crit: 0,
        cdmg: 150,
        passiveDmg: 0, // 30% (The Wisest) + 20% (Ancient Techniques Debuff)
        dot: 12.5,     // 25% Burn every other attack = 12.5% avg
        dotDuration: 6,
        dotStacks: 1,
        element: "Water",
        support: "Stun, Confuse"
    },

    upgrades: [
        { dmg: 310, spa: 8, range: 26, cost: 2750 },   // Up 0
        { dmg: 820, spa: 7.5, range: 31, cost: 5300 }, // Up 1
        { dmg: 1230, spa: 7.5, range: 35, cost: 7700 }, // Up 2
        { dmg: 2945, spa: 10, range: 40, cost: 15000 }, // Up 3
        { dmg: 5875, spa: 15, range: 44, cost: 18900 }, // Up 4
        { dmg: 6200, spa: 14.5, range: 48, cost: 23400 }, // Up 5
        { dmg: 14250, spa: 25, range: 45, cost: 23400, unlocksAbility: true } // Up 6
    ],
    passives: [
        { name: "The Wisest", passiveDmg: 30, desc: "Every 5s gain +2% Damage (+5% at E4). Max: 30%." },
        { name: "Ancient Techniques of Old", desc: "Alternating attacks. Atk 1: Confuse (2s). Atk 2: Burn (25% Dmg over 6s). Enemies hit take +20% Damage." },
        { name: "Samurai Technique", passiveDmg: 15, desc: "[E2] Gain +15% Damage for 15s upon use. Changes Dmg 7500 -> 14250, Spa 14.5 -> 25." },
        { name: "Weapon Proficiency", desc: "Stun Immunity. Every 5 attacks cycles weapons (modifiers ignored in DPS calc)." }
    ],
    ability: {
        abilityName: "Reanimation",
        desc: "Removes all placements and sets limit to 1. Re-Place Bonus: +150% Damage (+200% total at E6).",
        passiveDmg: 200, // +200% on top of 100% base = 300% (35,250 dmg)
        limitPlace: 1
    },
    etherealization: [
        "+10 Stat Points",
        "\"Samurai Technique\" Passive adds +15% Damage for 15s.",
        "+10 Stat Points",
        "\"The Wisest\" Passive Buff increased to +5%.",
        "+10 Stat Points",
        "\"Reanimation\" Damage increased to +200%."
    ]
});
