unitDatabase.push({
    id: "prodigy_mage",
    name: "Prodigy Mage",
    img: "images/units/ProdigyMage.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "Support",
    tags: ["Hero"],
    meta: {
        short: "Fission/Sacred",
        long: "Fission/Sacred",
        note: "Battle Dominant: Applies powerful Slow and Wind Shear DoT. Party's Tactician allows flexible buffs for Hill or Ground allies."
    },
    totalCost: 46200,
    stats: {
        spaCap: 3,
        crit: 0, cdmg: 150,
        dot: 0, dotDuration: 0, dotStacks: 0,
        element: "Rose",
        passiveDmg: 0,
        support: "Slow, Stun"
    },

    upgrades: [
        { dmg: 175, spa: 6, range: 26, cost: 1200 },   // Up 0 (Base)
        { dmg: 400, spa: 6, range: 28, cost: 2000 },   // Up 1
        { dmg: 800, spa: 6, range: 30, cost: 3000 },   // Up 2
        { dmg: 1250, spa: 6, range: 38, cost: 5000 },  // Up 3
        { dmg: 1600, spa: 6, range: 40, cost: 8000 },  // Up 4
        { dmg: 1925, spa: 6, range: 41, cost: 12000 }, // Up 5
        { dmg: 2450, spa: 6, range: 44, cost: 15000 }  // Up 6
    ],
    passives: [
        { name: "Battle Dominant", desc: "Every attack: apply slow (30% Speed for 5s). [E4]: Attacking slowed units applies Stun for 2.5s." },
        { name: "Travel Buddies", desc: "If Ancient Mage is in Range: -20% Attack Speed.<br>If Dragon Slayer is in range: +25% Range.<br>[E2]: Buffs increased by 5%." }
    ],
    ability: {
        abilityName: "Party’s Tactician",
        noToggle: true,
        desc: "Select any unit in range to ally with.<br>Hill Unit Selected: -30% Attack Speed on Both units.<br>Ground Unit Selected: +45% Crit Rate On Both Units."
    },
    etherealization: [
        "+10 Stat Points",
        "\"Travel Buddies\" Passive Buff Increased by 5% each.",
        "+10 Stat Points",
        "Attacking Slowed enemies applies Stun for 2.5s.",
        "+10 Stat Points",
        "Upgrade Cost decreased by 20%."
    ]
});
