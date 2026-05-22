unitDatabase.push({
    // IDENTITY
    id: "shadow_knight",
    name: "Shadow Knight (Risen)",
    img: "images/units/ShadowKnight.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Leveling", "Sword"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Powerful wind utility unit with high boss-slaying capacity."
    },

    totalCost: 72500,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 0,
        element: "Wind",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 360, spa: 8, range: 20, cost: 3000 },   // Up 0 (Base)
        { dmg: 840, spa: 8, range: 22, cost: 6000 },   // Up 1
        { dmg: 1620, spa: 8, range: 25, cost: 8500 },   // Up 2
        { dmg: 2400, spa: 8, range: 27, cost: 12000 },  // Up 3
        { dmg: 4560, spa: 8, range: 30, cost: 18000 },  // Up 4
        { dmg: 6000, spa: 8, range: 32, cost: 25000 }  // Up 5
    ],
    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "My Liege",
            desc: "• If 'Jinno' is Placed before this unit, Place itself next to him for free.<br>• This Passive can only occur once per match and if this unit hasn't been placed yet.<br>• Whenever Jinno is Upgraded, Upgrade this unit to his Level for free.<br>• When Jinno performs an Attack and this unit isn't attacking, Follow-up for 70% Damage.<br>• Follow-up Cooldown: 15s"
        },
        {
            name: "Pirate Hunter",
            desc: "When a Boss is in Range:<br>• This unit can only target the boss and has its AOE size halved<br>• Gain 50% Damage [+65% on E4], 75% Hyper Armor Damage, and 65% Crit Rate until the Boss is no longer in Range."
        },
        {
            name: "Commander of Shadows",
            desc: "When a unit summoned by 'Jinno' dies in this unit's Range:<br>• +40% [+60% on Etherealization 6] Health to all units summoned by Jinno in this unit's Range for 15s<br>• Cooldown: 30s<br>• If this unit is summoned by 'Jinno, Shadow Monarch', every Takedown gives Jinno XP for 'The System' Passive"
        },
        {
            name: "Undying Knight",
            desc: "• Attacks from this unit apply Stun for 2 seconds.<br>When hitting a Stunned Enemy:<br>• Gain +5% Damage<br>• Cap: +40% Damage<br>When Damage Cap has been reached:<br>• Restart the Passive<br>• Next Attack will deal +75% [+100% on Etherealization 4] Damage"
        },
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "My Liege Follow-up Damage increased to 100%.",
        "+10 Stat Points",
        "Undying Knight Cap break Damage Buff increased to +100%.",
        "+10 Stat Points",
        "COmmander of Shadows Health Buff increased to 60%."
    ]
});
