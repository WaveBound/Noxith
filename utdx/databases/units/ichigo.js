unitDatabase.push({
    id: "ichigo",
    name: "Ichiko (Rage)",
    img: "images/units/Ichigo.png",
    placement: 1,
    placementType: "Ground",
    role: "Damage",
    tags: ["Peroxide", "Reaper", "Rage", "Hollow"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 111880,
    stats: {
            crit: 15,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 7,
            passiveDmg: 50,
            passiveSpa: 0,
            element: "Dark",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 180, spa: 5.5, range: 25, cost: 1750 },   // Up 0 (Base)
            { dmg: 255, spa: 5.5, range: 25, cost: 2250 },   // Up 1
            { dmg: 365, spa: 5.0, range: 25, cost: 3000 },   // Up 2
            { dmg: 570, spa: 7.0, range: 20, cost: 5800 },   // Up 3 (AoE → Line)
            { dmg: 730, spa: 7.0, range: 20, cost: 8205 },   // Up 4
            { dmg: 1300, spa: 6.5, range: 22, cost: 10750 }, // Up 5
            { dmg: 1900, spa: 6.5, range: 22, cost: 12150 }, // Up 6 (AoE → Line continues)
            { dmg: 2150, spa: 7.5, range: 28, cost: 14400 }, // Up 7
            { dmg: 2400, spa: 7.5, range: 28, cost: 16000 }, // Up 8
            { dmg: 2850, spa: 8.0, range: 35, cost: 18250 }, // Up 9
            { dmg: 3000, spa: 8.0, range: 38, cost: 19325 }  // Up 10
        ]
});
