unitDatabase.push({
    // IDENTITY
    id: "angel_born_in_hell",
    name: "Angel Born in Hell (Unrivaled)",
    img: "images/units/AngelBornInHell.png",
    level: 100,
    placement: 2,
    placementType: "Hybrid",
    role: "Utility",
    tags: ["Fusion", "Super Warrior", "Hero"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Neutral utility unit with hybrid placement."
    },
    notice: {
        icon: '⚠️',
        text: '<strong>Notice:</strong> Angel in Hell is bugged; he has a fixed 50% crit rate that cannot change, and crits work, though he is not meant to crit.',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.15)'
    },

    totalCost: 91500,

    // BASE STATS
    stats: {
        crit: 50,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        element: "None",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 150, spa: 9, range: 20, cost: 1200 },       // Up 0 (Base) | Upgrade Cost: 0 | Total with Placement: 12,000 | Lightspeed Barrage
        { dmg: 350, spa: 9, range: 22, cost: 3000 },    // Up 1        | Upgrade Cost: 3,000 | Total with Placement: 15,000
        { dmg: 950, spa: 9, range: 25, cost: 7300 },    // Up 2        | Upgrade Cost: 10,300 | Total with Placement: 22,300
        { dmg: 1500, spa: 10, range: 27, cost: 12000 }, // Up 3        | Upgrade Cost: 22,300 | Total with Placement: 34,300 | Kicking Assault
        { dmg: 2300, spa: 10, range: 30, cost: 16000 }, // Up 4        | Upgrade Cost: 38,300 | Total with Placement: 50,300
        { dmg: 4000, spa: 10, range: 34, cost: 20000 }, // Up 5        | Upgrade Cost: 58,300 | Total with Placement: 70,300
        { dmg: 9000, spa: 12, range: 40, cost: 32000 }  // Up 6        | Upgrade Cost: 90,300 | Total with Placement: 102,300 | Bang Blast
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Unrivaled Mark [Leader - Slot 1 Required]",
            desc: "Unrivaled Mark Effects:<br>For all units owned by the player:<br>• If Tag \"Fusion\" +50% Damage and 50% Crit Damage.<br>• If Tag \"Super Warrior\" +30% Damage and -10% Ability Cooldown.<br>• If Element \"Light\" +20% Damage and +5% Crit Rate."
        },
        {
            name: "Punisher Ball",
            desc: "While active:<br>• Does 200% damage in a Circle AOE that always does 100% True Damage.<br>• Changes the enemy type to a normal enemy if it has a modifier. (Cooldown of 180 seconds.)"
        },
        {
            name: "Warrior that destroys Evil",
            desc: "On Placement:<br>• This unit’s damage will increase by half of the amount of Crit Rate all allied units in his range have.<br>• (If all units in his range have a total of 150% Crit Rate, he will buff himself by +75% Damage.)"
        },
        {
            name: "Lightspeed Reflexes",
            desc: "While Attacking:<br>• When this unit is attacking, it cannot be stunned.<br>• Hitting enemies will cleanse allied towers in range of any debuff or stun done on Cooldown before being able to recleanse."
        },
        {
            name: "Purified Energy",
            desc: "On Placement:<br>• This Unit will not be able to crit, and will always do 1.1x damage no matter what their element is<br>• (no type advantage/disadvantage)"
        },
        {
            name: "Holy Aura",
            desc: "On Ally Follow-Up:<br>• This unit will give any allied units doing follow up attacks in his range +30% damage for 10 seconds.<br>• (Cooldown of 20 seconds)"
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "Holy Aura damage gain increased to 50%",
        "+10 Stat Points",
        "Warrior that destroys Evil damage gain from ally crit rate increased by double the amount",
        "+10 Stat Points",
        "Punisher Ball damage increased to 300%"
    ]
});
