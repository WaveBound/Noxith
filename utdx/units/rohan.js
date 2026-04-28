unitDatabase.push({
    id: "rohan",
    name: "Rohan & Robot 16",
    img: "images/units/Rohan.png",
    placement: 1,
    placementType: "Ground",
    role: "Damage",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ability activates Unleashed mode."
    },
    totalCost: 70185,
    stats: {
            crit: 15,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 3,
            passiveDmg: 30,
            passiveSpa: 5,
            element: "Light",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 145, spa: 6, range: 28, cost: 1750 },   // Up 0 (Base)
            { dmg: 250, spa: 6, range: 30, cost: 2890 },   // Up 1
            { dmg: 340, spa: 6, range: 33, cost: 3200 },   // Up 2
            { dmg: 495, spa: 5.5, range: 35, cost: 3975 },  // Up 3
            { dmg: 565, spa: 5, range: 40, cost: 4650 },   // Up 4 (Splash)
            { dmg: 690, spa: 5, range: 45, cost: 5450 },   // Up 5
            { dmg: 750, spa: 5, range: 48, cost: 6900 },   // Up 6
            { dmg: 800, spa: 4.5, range: 50, cost: 7575 },  // Up 7
            { dmg: 1650, spa: 8, range: 53, cost: 8800 },   // Up 8 (Cone)
            { dmg: 1820, spa: 7.5, range: 55, cost: 10995 }, // Up 9
            { dmg: 2445, spa: 8.5, range: 58, cost: 14000 }  // Up 10 (Line AoE)
        ],
    ability: { dmg: 2445, spa: 8.5, range: 58, spaCap: 2 }
});
