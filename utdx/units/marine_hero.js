unitDatabase.push({
    // IDENTITY
    id: "marine_hero",
    name: "Marine Hero (Grand Fist)",
    img: "images/units/MarineHero.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "Utility",
    tags: ["Piece", "Piece Marines"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler due to placement count"
    },

    totalCost: 88000,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 6,
        element: "Water",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 420, spa: 9, range: 24, cost: 2000 },   // Up 0 (Base)
        { dmg: 900, spa: 9, range: 25, cost: 5000 },   // Up 1
        { dmg: 1600, spa: 10, range: 28, cost: 7000 },  // Up 2
        { dmg: 2400, spa: 10, range: 30, cost: 10000 }, // Up 3
        { dmg: 3000, spa: 17, range: 33, cost: 17000 }, // Up 4
        { dmg: 3800, spa: 16, range: 35, cost: 20000 }, // Up 5
        { dmg: 5760, spa: 16, range: 37, cost: 27000 }  // Up 6
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Iron Fist",
            passiveCrit: 15,
            passiveCdmg: 100,
            desc: "On Placement:<br>• +15% Critical Rate.<br><br>On Attack:<br>• Deal 1.25x Damage to Armored and Hyper Armored enemies.<br><br>On Critical Hit:<br>• +20% Critical Damage (Cap: 60% / 100% on E6)<br>• Apply 20% Slow for 4 seconds."
        },
        {
            name: "Hero of the Marines",
            desc: "For every 'Warlord' Tag in Range:<br>• +25% Damage (Cap: 100% / 150% on E2)<br><br>Every 40s:<br>• If 'Pirate King' is in Range, Stun Pirate King for 10s.<br>• Otherwise, Stun a random 'Warlord' Tag Unit for 5s.<br><br>When a Boss is in Range:<br>• Stops attempting to Stun units in Range.<br>• Gains +100% Critical Rate.<br><br>If 'Pirate King' is in Range:<br>• Synchronize Pirate King's attack with this Unit's SPA."
        },
        {
            name: "Unbreakable Will",
            passiveDmg: 50,
            desc: "When this Unit gets Stunned:<br>• +12.5% Damage (Cap: 50%)<br>• Gain Stun Immunity for 15s.<br><br>When Damage Cap is Reached:<br>• Stun Immunity becomes permanent.<br><br>Every Attack:<br>• 5% Chance to Stun itself for 10s.<br>• Increases by 5% per non-stun attack; resets to 5% on stun."
        }
    ],

    ability: {
        abilityName: "Boss",
        passiveCrit: 100,
        desc: "Simulate a Boss being in range: Gain +100% Critical Rate and stop attempting to stun allies."
    },

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "\"Hero of the Marines\" Damage Cap increased to 150%",
        "+10 Stat Points",
        "\"Unbreakable Will\" Damage Gain increased to 25%",
        "+10 Stat Points",
        "\"Iron Fist\" Armor Damage increased to 1.3x and Critical Damage Cap increased to 100%"
    ]
});
