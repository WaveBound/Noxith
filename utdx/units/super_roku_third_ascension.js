unitDatabase.push({
    // IDENTITY
    id: "super_roku_third_ascension",
    name: "Super Roku (Third Ascension)",
    img: "images/units/SuperRokuThird.png",
    level: 70,
    placement: 2,
    placementType: "Hill",
    role: "Specialist",
    tags: ["Super Warrior", "Hero"],

    // META (Build Guide / Trait Tier List)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Wind-element Hill placement variant for Super Roku."
    },

    totalCost: 73000,

    // BASE STATS
    stats: {
        crit: 10,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 25,
        element: "Wind",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES
    upgrades: [
        { dmg: 180, spa: 9, range: 24, cost: 3000 },
        { dmg: 540, spa: 9, range: 25, cost: 4000 },
        { name: "Fighter Beatdown", dmg: 1440, spa: 9, range: 28, cost: 6000 },
        { dmg: 2280, spa: 9, range: 30, cost: 9000 },
        { name: "Full Power!", dmg: 3540, spa: 9, range: 33, cost: 12000 },
        { dmg: 4560, spa: 9, range: 35, cost: 17000 },
        { name: "Dragon Fist", dmg: 6000, spa: 9, range: 37, cost: 22000 },
    ],

    // PASSIVES
    passives: [
        {
            name: "Hope of Earth",
            passiveDmg: 25,
            passiveSpa: 15,
            desc: "Every 18 seconds:<br>If there is at least one ally in Range:<br>• +5% Damage (Cap: 25%)<br>• -1% SPA (Cap: -15%)"
        },
        {
            name: "Universe Saviour",
            desc: "On placement:<br>• Automatically set Life Stocks to 1<br>Every 15 seconds:<br>• Follow-up with with the highest Critical Rate unit in Range as Damage<br>Etherealization 6:<br>• Automatically Upgrade for free every 5 Waves<br>(Follow-Up is bugged.)"
        },
        {
            name: "Not on my Watch!",
            desc: "When a Boss tries to take a Life Stock:<br>• Prevent it from being taken completely<br>• Target the strongest enemy in Range and Follow-up for 25% Damage<br>• This Passive can only be triggered once"
        }
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "+20% Buff Potency",
        "+10 Stat Points",
        "\"Universe Saviour\" Cooldown Lowered to 15 seconds.",
        "+10 Stat Points",
        "This unit will gain a free Upgrade every 5 Waves."
    ]
});