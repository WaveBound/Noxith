unitDatabase.push({
    id: "underworld_god",
    name: "Underworld God (Syncro)",
    img: "images/units/UnderworldGod.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "Specialist",
    tags: ["Divinity", "King"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Divine Blood converts debuffs to buffs. Eldest Brother provides up to +90% Damage via Divinity tags."
    },
    totalCost: 89400,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Wind",
        support: "Slow"
    },

    upgrades: [
        { dmg: 175, spa: 6, range: 22, cost: 1400 },   // Up 0 (Base)
        { dmg: 500, spa: 6, range: 24, cost: 3000 },   // Up 1
        { dmg: 850, spa: 5.5, range: 25, cost: 5000 },  // Up 2
        { dmg: 1100, spa: 7, range: 27, cost: 8000 },   // Up 3
        { dmg: 1350, spa: 6, range: 32, cost: 12000 },  // Up 4
        { dmg: 1450, spa: 9, range: 38, cost: 18000 },  // Up 5
        { dmg: 1850, spa: 9, range: 40, cost: 20000 },  // Up 6
        { dmg: 2200, spa: 9, range: 45, cost: 22000 },  // Up 7
        { dmg: 7500, spa: 10, range: 40, cost: 0, note: "SYNCRO DRIVE (Hybrid)" } // Up 8
    ],
    passives: [
        { name: "Divine Blood", desc: "Whenever Underworld God receives a negative buff, he converts it into a positive buff. [On E4]: These buffs last indefinitely." },
        { name: "As The Eldest Brother", passiveDmg: 90, desc: "Each unit with the 'Divinity' tag in range buffs this unit by +15% Damage, up to 60% (90% on E2)." },
        { name: "Sibling Combined Might", desc: "Passively has +35% (+60% on E6) Hyper Armor Damage. Performs a 75% Damage follow-up attack when hitting an Armored Enemy for the first time." },
        { name: "Primordial Power", passiveSpa: 15, desc: "Passively applies +20% DoT and Affliction Time. Inflicts 'Time Snail' (3s): +20% DoT Duration, 30% Slow, and -1% Attack Speed per afflicted enemy in range (max 15%)." }
    ],
    etherealization: [
        "+10 Stat Points",
        "As The Eldest Brother: Max Damage buff increased to 90%",
        "+10 Stat Points",
        "Divine Blood: Converted positive buffs now last indefinitely",
        "+10 Stat Points",
        "Sibling Combined Might: Hyper Armor Damage increased to 60%"
    ]
});
