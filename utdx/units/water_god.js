unitDatabase.push({
    id: "water_god",
    name: "Enlightened God",
    img: "images/units/WaterGod.png",
    placement: 3,
    placementType: "Ground",
    role: "Utility Ground",
    tags: [],
    meta: {
        short: "Ruler/Sacred",
        long: "Sacred/Fission",
        note: "God Of The Seas: +20% DoT/Affliction. Crit increases 5% per attack (Cap 30/50%). Double attack at cap."

    },
    totalCost: 72600,
    stats: {
        crit: 50,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3.5,
        passiveDmg: 0,
        element: "Water",
        dotDuration: 0
    },

    upgrades: [
        { dmg: 200, spa: 7, range: 22, cost: 1500 },  // Up 0 (Base)
        { dmg: 600, spa: 7, range: 24, cost: 3000 },  // Up 1
        { dmg: 1000, spa: 6.5, range: 25, cost: 5000 },  // Up 2
        { dmg: 1500, spa: 3, range: 28, cost: 7600 },  // Up 3
        { dmg: 1950, spa: 8, range: 28, cost: 10000 }, // Up 4
        { dmg: 2050, spa: 9, range: 25, cost: 13500 }, // Up 5
        { dmg: 2300, spa: 9, range: 26, cost: 15000 }, // Up 6
        { dmg: 2500, spa: 9, range: 30, cost: 17000 }  // Up 7
    ],
    passives: [
        { name: "God Of The Seas", desc: "Applies +20% DoT and Affliction Time (+30% at E4). Increases Crit Rate by 5% per attack up to 30% (50% at E2). Performs FuA at cap." },
        { name: "Primordial Power", desc: "Inflicts 'Time Snail' (3s): +20% DoT Duration, 30% Slow, and buffs Water God Damage by 5% per enemy effected (max +50%)." }
    ],
    ability: { buffDmg: 50, abilityName: "Primordial Wave", noToggle: true, cooldown: 60, desc: "Water God summons a Primordial Wave down The Path that deals 200% Damage to all Enemies on That Path." },
    etherealization: [
        "+10 Stat Points (E1)",
        "Crit rate cap increased to 50%\n(God Of The Seas) (E2)",
        "+10 Stat Points (E3)",
        "DoT and Affliction Time increased by 10%\n(God Of The Seas) (E4)",
        "+10 Stat Points (E5)",
        "+75% Damage per placement (E6)",
    ]
});
