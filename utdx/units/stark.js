unitDatabase.push({
    id: "stark",
    name: "Koyote",
    img: "images/units/Stark.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Damage",
    tags: ["Peroxide", "Hollow", "Villain"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to 1 placement count."
    },
    totalCost: 47050,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 6,
        passiveDmg: 0,
        passiveSpa: 0,
        element: "Ice",
        dotDuration: 0,
    },

    upgrades: [
        { dmg: 216, spa: 4, range: 27, cost: 1500 },    // Up 0 (Base)
        { dmg: 504, spa: 4, range: 28, cost: 1850 },   // Up 1
        { dmg: 780, spa: 4, range: 29, cost: 2300 },   // Up 2
        { dmg: 960, spa: 6, range: 29, cost: 2750 },   // Up 3 (Circle + Hybrid)
        { dmg: 1260, spa: 6, range: 30, cost: 3150 },   // Up 4
        { dmg: 1500, spa: 6, range: 32, cost: 4000 },   // Up 5
        { dmg: 16440, spa: 6, range: 32, cost: 5000 }, // Up 6
        { dmg: 1800, spa: 6, range: 32, cost: 6500 }, // Up 7
        { dmg: 2400, spa: 6, range: 38, cost: 8000 }, // Up 8
        { dmg: 3360, spa: 6, range: 42, cost: 12000 } // Up 9
    ],
    passives: [
        {
            name: "Los Lobos",
            desc: "On Takedown:<br>Spawn in a Spirit Wolf for 20% [30% on Etherealized 4+] of Koyote's Dmg. [Max wolves on track: 6]"
        },
        {
            name: "Cero Metra",
            desc: "After collecting 100% Charge on<br>Soul Energy Koyote takes out Both of his Spirit Pistols<br>using his Ultimate Move 'Cero Metra' doing<br>50% Of his Dmg.<br>Upon Koyote using this ability he gets stunned for<br>30 seconds."
        },
        {
            name: "Soul Energy",
            desc: "Everytime a Spirit Wolf spawns<br>Koyote collects its Reiatsu Essence turning it into<br>2.5% Soul Energy and charging his meter."
        }
    ],
    etherealization: [
        "+10 Stat Points",
        "Increases the max Number of Spirit Wolves on the track to 7.",
        "+10 Stat Points",
        "Spirit Wolves gain a +10% Health Boost.",
        "+10 Stat Points",
        "When a Spirit Wolf Spawns it has a 30% chance to grant double Spirit Energy."
    ]

});
