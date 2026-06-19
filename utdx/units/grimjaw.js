unitDatabase.push({
    id: "grimjaw",
    name: "Grommjaw (Panther)",
    img: "images/units/Grimjaw.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: ["Peroxide", "Hollow", "Sword"],
    meta: {
        short: "Ruler",
        long: "Astral",
        note: "Duelist/Ruler overall as astral is bugged."
    },
    totalCost: 41174,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 50,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Water",
        dotDuration: 10,
        dotType: "Bleed"
    },

    upgrades: [
        { dmg: 102, spa: 7, range: 20, cost: 1300 },    // Up 0 (Base)
        { dmg: 168, spa: 7, range: 20, cost: 1850 },   // Up 1
        { dmg: 294, spa: 6.5, range: 22, cost: 2290 }, // Up 2
        { dmg: 384, spa: 6.5, range: 22, cost: 2900 }, // Up 3
        { dmg: 582, spa: 6.5, range: 22, cost: 3575 }, // Up 4
        { dmg: 654, spa: 8, range: 25, cost: 3775 },   // Up 5
        { dmg: 804, spa: 7.5, range: 25, cost: 3900 }, // Up 6
        { dmg: 1044, spa: 7.5, range: 25, cost: 4450 }, // Up 7
        { dmg: 1146, spa: 7.5, range: 28, cost: 5010 }, // Up 8
        { dmg: 1362, spa: 7, range: 28, cost: 5675 },  // Up 9
        { dmg: 2040, spa: 9, range: 35, cost: 6450 }   // Up 10
    ],

    // PASSIVES
    passives: [
        {
            name: "Enhanced Hierro",
            desc: "On Attack:<br>• Applies Bleed for 30% Damage over 10 ticks.<br>• When Bleed is applied, enemies take +20% Damage until they die."
        },
        {
            name: "Unchained Frenzy",
            passiveDmg: 30,
            passiveSpa: 15,
            desc: "<br>Every 6 attacks [5 attacks on Etherealization 2]: enter Frenzy for 10s. Cooldown: 20s.<br><br>While Frenzied:<br>• +20% Damage, capped at +30%.<br>• -15% SPA, capped at 15%.<br><br>DPS math uses the average 50% uptime from the 10s duration / 20s cooldown."
        },
        {
            name: "Spirited Fighter",
            desc: "At the start of every wave:<br>• Gain 7.5% Spirit Bar."
        },
        {
            name: "Soul Panther",
            desc: "Requires Spirit Bar to reach 100%, then transforms into Soul Panther Mode and resets the bar.<br><br>While in Soul Panther Mode:<br>• Attacks apply Panther Mark for 15s, once per enemy.<br>• Marked enemies take +10% Damage from Grimjaw.<br>• When Panther Mark expires, it explodes in a small AOE for 5% of Grimjaw's Damage."
        }
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "Increases Spirit Gains by 7.5%",
        "+10 Stat Points",
        "Increases “\Panther Mark Explosion\” DMG To 30% OF Grimmjaw DMG",
        "+10 Stat Points",
        "Bleed Now does 50% of total DMG"
    ]
});
