unitDatabase.push({
    id: "super_roku",
    name: "Super Roku",
    img: "images/units/SuperRoku.png",
    placement: 2,
    placementType: "Hill",
    role: "Damage",
    tags: ["Saiyan"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Toggle Same Enemy for boss DPS calculation."
    },
    totalCost: 50250,
    stats: {
            crit: 10,
            cdmg: 150,
            dot: 0,
            dotStacks: 1,
            spaCap: 4,
            passiveDmg: 25,
            element: "Light",
            dotDuration: 0
        },

    upgrades: [
            { dmg: 64, spa: 4.5, range: 20, cost: 1250 },   // Up 0 (Base)
            { dmg: 205, spa: 4.5, range: 22, cost: 1850 },  // Up 1
            { dmg: 242, spa: 4, range: 22, cost: 2925 },    // Up 2
            { dmg: 505, spa: 6, range: 25, cost: 4240 },    // Up 3
            { dmg: 735, spa: 6, range: 25, cost: 5200 },    // Up 4
            { dmg: 822, spa: 5.5, range: 25, cost: 5725 },  // Up 5
            { dmg: 1195, spa: 7.5, range: 30, cost: 6055 }, // Up 6
            { dmg: 1425, spa: 7.5, range: 33, cost: 6275 }, // Up 7
            { dmg: 1630, spa: 6.5, range: 35, cost: 7730 }, // Up 8
            { dmg: 1950, spa: 6.5, range: 41, cost: 9000 }  // Up 9
        ],
    ability: {}
});
