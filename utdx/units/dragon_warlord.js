unitDatabase.push({
    id: "dragon_warlord",
    name: "Dragon Warlord (Rage)",
    img: "images/units/DragonWarlord.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: ["Villain", "Piece", "Warlord"],

    meta: {
        short: "Ruler",
        long: "Duelist",
        note: "Standard DPS Selection"
    },

    totalCost: 87000,

    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 5.5,
        passiveDmg: 0,
        element: "Fire",
        dotDuration: 0,
        support: "Slow, Stun",
        customFollowUp: {
            chance: 50,          // Every other attack (1/2 = 50%)
            eLevelReq: 99,       // No etherealization upgrade for this
            eLevelChance: 50,    // Same chance at all levels
            dmgMult: 0.35,       // 35% Damage (Hybrid Form)
            fuaAnimation: 1.5,   // 1.5s follow-up animation
            label: "Dragon Assault"
        }
    },

    upgrades: [
        { dmg: 420, spa: 10.0, range: 30, cost: 2500 },     // Up 0 (Base) - Club Flip
        { dmg: 800, spa: 10.0, range: 33, cost: 4000 },     // Up 1
        { dmg: 1600, spa: 9.0, range: 37.5, cost: 7500 },   // Up 2
        { dmg: 2400, spa: 9.0, range: 40.5, cost: 11000 },  // Up 3
        { dmg: 4200, spa: 10.0, range: 43.5, cost: 17000 }, // Up 4 - Club Combo
        { dmg: 5000, spa: 10.0, range: 49.5, cost: 20000 }, // Up 5
        { dmg: 5700, spa: 10.0, range: 54, cost: 25000 }    // Up 6
    ],

    passives: [
        {
            name: "Dragon Rage",
            passiveDmg: 75,
            passiveRange: 75,
            passiveDotDmg: 35,
            passiveTrueDmg: 30,
            desc: "• This unit has a 'Rage' bar that goes up to 100 [150 on Etherealization 4]<br>• Gain +1% Rage every second, every Takedown and every Attack<br>• Every 2% Rage, gain +1% Damage and +1% Range<br><br>At 65+ Rage:<br>• Enter Hybrid Form<br>• +20% [+35% on Etherealization 2] DoT<br>• +20% [+30% on Etherealization 2] True Damage<br><br>At 100+ Rage:<br>• Gain the ability to enter Dragon Form<br><br>Dragon Form<br>• Allows the user to manually attack and control the Dragon<br>• Damage: 100% [150% on Etherealization 6]<br>• Duration: 60s [90s on Etherealization 6]<br>• When Rage is empty, this unit goes back to Normal Form"
        },
        {
            name: "Dragon Assault",
            desc: "Every other Attack:<br>• Move to the last enemy this unit attacked<br><br>Normal Form<br>• Launch a full AOE Follow-up Attack for 20% Damage<br><br>Hybrid Form<br>• Launch a full AOE Follow-up Attack for 35% Damage<br>• Apply a 25% Slow for 5 seconds to all Enemies hit<br><br>If a Boss leaves half this unit's Range:<br>• Move to the Boss position and release a Follow-up Attack"
        },
        {
            name: "Dragon Breath",
            dot: 30,
            dotDuration: 4,
            desc: "On Attack:<br><br>Normal Form<br>• Apply Burn for 30% Damage over 4 ticks<br><br>Hybrid Form<br>• Apply Burn for 30% Damage over 4 ticks<br>• Apply Stun for 1 second"
        },
        {
            name: "Conqueror of Lightning",
            desc: "When an enemy enters half this unit's Range:<br>• Launch a 'Dragon Assault' Follow-up Attack<br>• Apply Stun for 2 seconds<br>• Apply Electrified for 30% Damage over 5 ticks<br><br>When applying Burn to Electrified enemies:<br>• Remove Electrified and instantly deal 50% Damage"
        }
    ],

    etherealization: [
        "+10 Stat Points (E1)",
        "Increased DoT and True Damage buffs for each form (E2)",
        "+10 Stat Points (E3)",
        "Increased Rage cap and halved drain during Dragon Form (E4)",
        "+10 Stat Points (E5)",
        "Dragon Form Damage increased to 150% and Duration increased to 90s (E6)"
    ]
});
