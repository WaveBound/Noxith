unitDatabase.push({
    // IDENTITY
    id: "limit_breaker_prince_marked",
    name: "Limit Breaker Prince (Marked)",
    img: "images/units/LimitBreaker.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "DPS",
    tags: ["Super Warrior", "Hero"],

    // META (Build Guide / Trait Tier List)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Wind-element Ground placement DPS unit."
    },

    totalCost: 69000,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 5.5,
        passiveDmg: 0,
        element: "Wind",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES
    upgrades: [
        { dmg: 300, spa: 9, range: 22, cost: 3000 },
        { dmg: 780, spa: 9, range: 25, cost: 4000 },
        { name: "Garlic Gun", dmg: 1560, spa: 9, range: 28, cost: 6000 },
        { dmg: 2760, spa: 9, range: 30, cost: 9000 },
        { name: "Final Impact", dmg: 3900, spa: 9, range: 33, cost: 12000 },
        { dmg: 5160, spa: 9, range: 35, cost: 15000 },
        { name: "Final Explosion", dmg: 7800, spa: 14, range: 37, cost: 20000 },
    ],

    // PASSIVES
    passives: [
        {
            name: "Saiyan Prince",
            desc: "If this unit is placed next to a 'Super Warrior' Tag:<br>• +15% Damage<br>• -7.5% SPA<br><br>If the unit is 'Bulmo':<br>• +30% Damage<br>• -10% SPA<br>• +10% Income to Bulmo"
        },
        {
            name: "Indomitable Fighting Spirit",
            desc: "When an enemy leaves Range:<br>• +15% Range for 15s<br>• +20% Damage for 15s<br>• Cooldown: 30s<br><br>Etherealization 2:<br>• Follow-up for 50% Damage<br>• Follow-up Cooldown: 7s"
        },
        {
            name: "I'll put an end to this!",
            desc: "When this unit gets the last hit on an enemy:<br>• Follow-up with Attack 4<br>• Deal 100% Damage<br>• Apply Stun for 4.5 seconds"
        }
    ],

    // ABILITIES (DPS Math only)
    ability: [
        {
            abilityName: "Indomitable Fighting Spirit FUA",
            noToggle: true,
            dmgMult: 0.50,
            cooldown: 7,
            reqUp: 2
        }
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "\"Indomitable Fighting Spirit\" now does a Follow-up Attack.",
        "+10 Stat Points",
        "\"I'll put an end to this!\" Damage increased to 100% and Stun increased to 4.5s.",
        "+10 Stat Points",
        "\"Saiyan Prince\" Damage Buff increased by 5% and SPA Buff increased by 2.5%."
    ]
});