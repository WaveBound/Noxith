unitDatabase.push({
    id: "sharpshooter",
    name: "Sharpshooter",
    img: "images/units/Sharpshooter.png",
    level: 70,
placement: 2,
    placementType: "Hill",
    role: "Damage / Support",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Toggle Ability for Sniper Mode (Global Range)."
    },
    totalCost: 57560,
    stats: {
            crit: 0,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 3.5,
            element: "Fire",
            dotDuration: 0,
            passiveDmg: 125, // Normal Mode: 2.25x Dmg
            passiveSpa: 0
        },

    upgrades: [
            { dmg: 130, spa: 5, range: 25, cost: 1750 },   // Up 0 (Base)
            { dmg: 205, spa: 5, range: 28, cost: 2300 },   // Up 1
            { dmg: 355, spa: 6.5, range: 30, cost: 3900 },  // Up 2
            { dmg: 470, spa: 6, range: 35, cost: 4950 },   // Up 3
            { dmg: 685, spa: 7.5, range: 38, cost: 6010 },  // Up 4
            { dmg: 815, spa: 7.5, range: 38, cost: 7250 },  // Up 5
            { dmg: 970, spa: 6.5, range: 40, cost: 8980 },  // Up 6
            { dmg: 1065, spa: 6.5, range: 43, cost: 10355 }, // Up 7
            { dmg: 1145, spa: 6, range: 45, cost: 12065 }   // Up 8
        ],
    ability: {
            passiveDmg: 10,  // Sniper Mode: 1.1x Dmg
            passiveSpa: 10,  // Sniper Mode: 0.9x SPA (10% reduction)
            range: 120  // Sniper Mode: 200 Range
        }
});
