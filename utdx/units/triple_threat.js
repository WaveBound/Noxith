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
        short: "Eternal/Sacred",
        long: "Eternal/Sacred",
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

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Nothing Happened",
            desc: "When a Unit in Range is Stunned:<br>• Reduce their stun by 50%<br><br>If the Unit has 'Piece' Tag:<br>• This unit will receive the Stun reduced by 75%"
        },
        {
            name: "King of Heck",
            desc: "While active:<br>• -10 Haki [-8 on E2] per Attack (~3%)<br>• +50% Damage<br>• +100% Crit Damage<br><br>When Haki reaches below 10:<br>• Automatically disable this Ability<br>• Stun this unit for 10s<br>• Disable 'Pirate Hunter' for 30s<br><br><i>Lasts for 37 attacks when maxed.</i>"
        },
        {
            name: "Pirate Hunter",
            desc: "When a Boss is in Range:<br>• This unit can only target the boss and has its AOE size halved<br>• Gain 50% Damage [+65% on E4], 75% Hyper Armor Damage, and 50% Crit Rate until the Boss is no longer in Range.<br>• <b>Disables 'King of Heck' while active.</b>"
        },
        {
            name: "Color of Armaments",
            desc: "This unit has a 'Haki' Charge<br>• Gain +1 Haki per Bleed tick<br>• This unit cannot gain Haki while 'King of Heck' is active"
        },
        {
            name: "Unrivaled Mark",
            passiveDmg: 50,
            desc: "If this unit is placed in the First Slot:<br>• Gain +50% Damage"
        },
        {
            name: "Brutal Slashes",
            dot: 120,
            dotDuration: 7,
            canCrit: true,
            desc: "On Attack:<br>• Deal Critical Bleed for 100% Damage [120% on E6] over 7 seconds<br>• Hitting enemies with Critical Bleed triggers a Follow-up for 75% Damage (Applies Bleed too)<br>• Cooldown: 15s"
        }
    ],

    // ABILITY
    ability: {
        abilityName: "King of Heck",
        buffDmg: 50,
        passiveCdmg: 100,
        cooldown: 0,
        desc: "While active:<br>• -10 Haki per Attack (~3%)<br>• +50% Damage<br>• +100% Crit Damage<br><br>When Haki reaches below 10:<br>• Automatically disable this Ability<br>• Stun this unit for 10s<br>• Disable 'Pirate Hunter' for 30s"
    },

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
