unitDatabase.push({
    // IDENTITY
    id: "triple_threat",
    name: "Triple Threat (Unrivaled)",
    img: "images/units/TripleThreat.png",
    level: 100,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Pirate Crew", "Sword", "Piece", "Hero"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler/Astral",
        note: "Powerful wind utility unit with high boss-slaying capacity."
    },

    totalCost: 89000,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3.5,
        passiveDmg: 0,
        element: "Wind",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 200, spa: 9.0, range: 20, cost: 1500 },   // Up 0 (Base)
        { dmg: 550, spa: 9.0, range: 22, cost: 4000 },   // Up 1
        { dmg: 1150, spa: 9.0, range: 25, cost: 8500 },   // Up 2
        { dmg: 1750, spa: 9.0, range: 27, cost: 13000 },  // Up 3
        { dmg: 2650, spa: 9.0, range: 30, cost: 17000 },  // Up 4
        { dmg: 3500, spa: 9.0, range: 32, cost: 20000 },  // Up 5
        { dmg: 5200, spa: 12.0, range: 36, cost: 25000 }   // Up 6
    ],
    ability: {
        abilityName: "Boss",
        noToggle: false,
        cooldown: 0,
        desc: "Pirate Hunter active: can only target the boss, AOE size halved. Gain 50% Damage [+65% on E4], 75% Hyper Armor Damage, and 65% Crit Rate."
    },

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Nothing Happened",
            desc: "When a Unit in Range is Stunned:<br>• Reduce their stun by 50%<br><br>If the Unit has 'Piece' Tag:<br>• This unit will receive the Stun reduced by 75%"
        },
        {
            name: "King of Heck",
            passiveDmg: 50,
            passiveCdmg: 100,
            buffedByJunior: true,
            juniorIgnoreCdmg: true,
            desc: "• +50% Damage<br>• +100% Crit Damage"
        },
        {
            name: "Pirate Hunter",
            desc: "When a Boss is in Range:<br>• This unit can only target the boss and has its AOE size halved<br>• Gain 50% Damage [+65% on E4], 75% Hyper Armor Damage, and 65% Crit Rate until the Boss is no longer in Range."
        },
        {
            name: "Color of Armaments",
            desc: "This unit has a 'Haki' Charge<br>• Gain +1 Haki per Bleed tick"
        },
        {
            name: "Unrivaled Mark",
            desc: "If this unit is placed in the First Slot:<br>• 'Sword' Tag: +50% Damage, -7.5% Cost<br>• 'Piece' Tag: +25% Damage, +10% Range<br>• 'Wind' Element: +20% Damage, +5% Crit Rate (Works on self)"
        },
        {
            name: "Brutal Slashes",
            dot: 120,
            dotDuration: 7,
            canCrit: true,
            desc: "On Attack:<br>• Deal Critical Bleed for 100% Damage [120% on E6] over 7 seconds<br>• Hitting enemies with Critical Bleed triggers a Follow-up for 75% Damage (Applies Bleed too)<br>• Cooldown: 15s"
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "King of Heck Haki cost reduced to 8",
        "+10 Stat Points",
        "Boss passive buffs increased to 65%",
        "+10 Stat Points",
        "Critical Bleed damage increased to 120%"
    ]
});
