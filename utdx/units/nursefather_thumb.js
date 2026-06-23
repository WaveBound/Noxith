unitDatabase.push({
    // IDENTITY
    id: "nursefather_thumb",
    name: "Nursefather (Thumb)",
    img: "images/units/nursefather_thumb.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "DPS",
    tags: ["Villain", "Rage"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler/Sacred",
        long: "Sacred/Duelist",
        note: "Fire DPS focused on high sustained damage."
    },

    bugs: [
        {
            name: 'Disposal Follow-up Cooldown',
            desc: 'The "Disposal" follow-up attack incorrectly triggers every 20 seconds instead of the intended 10 seconds, even with the E2 upgrade.'
        }
    ],

    totalCost: 54000,

    // BASE STATS
    stats: {
        dmg: 210,
        spa: 9,
        range: 18,
        crit: 0,
        spaCap: 2.75,         // Set animation cap to 2.75s
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        element: "Fire",
        passiveDmg: 0,
        customFollowUp: {
            chance: 100,
            cooldown: 10,        // Base cooldown (10s)
            nextAttack: true,    // Triggers on the next attack AFTER cooldown expires
            dmgMult: 1.2,        // 120% damage
            dotPct: 75,          // 75% DoT damage
            dotDuration: 4,
            dotType: "Burn",
            fuaAnimation: 2.75,  // Adds +2.75s to host SPA during FUA hits
            label: "Disposal"
        },
        bossDmg: 0,              // Moved to passive
        support: ""
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 210, spa: 9, range: 18, cost: 3000 },       // Up 0 (Base) | Total Cost: 0 | Sword Rush
        { dmg: 600, spa: 9, range: 22, cost: 4000 },       // Up 1        | Total Cost: 4,000
        { dmg: 1500, spa: 9, range: 25, cost: 6000 },      // Up 2        | Total Cost: 10,000
        { dmg: 2700, spa: 10, range: 27, cost: 9000 },     // Up 3        | Total Cost: 19,000 | Sword Barrage
        { dmg: 4000, spa: 10, range: 30, cost: 12000 },    // Up 4        | Total Cost: 31,000
        { dmg: 5400, spa: 10, range: 37, cost: 20000 },    // Up 5        | Total Cost: 51,000
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Time to hunt",
            desc: "<br>On placement:<br>• Deals 50% more dmg to hyperarmor enemies<br>• Inflicts slow against bosses and also Deals 50% more dmg to them.<br>• Starts inflicting burn dealing 50% of damage over 4 ticks and stunning enemies for 3 seconds with every attack.",
            dot: 50,
            dotDuration: 4,
            passiveBossDmg: 50, // 1.5x Multiplier
            hyperArmor: 50,
        },
        {
            name: "You useless little $#&$!",
            desc: "On placement:<br>• Nursefather spawns The Apprentice. The Apprentice attacks on his own and follows... Damage (cd 5 secs).<br>• The Apprentice will take every stun Nursefather will recieve, after 5 attacks The Apprentice dies.<br>• When the Apprentice dies passive 'The Eye of Precognition' activates and gains yellow shining aura.<br><br>Etherealization 4:<br>• The Apprentice dies after 2 attacks"
        },
        {
            name: "The Eye of Precognition",
            desc: "<br>After The Apprentice dies:<br>• Gain 50% more dmg<br><br>When enemy attacks:<br>• Dodge and counter attack for 100%<br>• For every dodge gain 15% more dmg ( max stack 60% )<br>• Every attack gains 15% crit chance, if crit chance is 45% buff crit dmg by 15% max of 10 times<br>• Every 10 secs Nursefather activates follow up called 'Disposal'. Disposal does 120% of normal dmg and stuns for 5 seconds longer and reapplies burn for 75% dmg",
            passiveCdmg: 100,
            passiveCrit: 45,
            passiveDmg: 50,
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        { desc: "+10 Stat Points (E1)" },
        { desc: "Follow up 'Disposal' cooldown set to 10s (E2)", cooldown: 10 },
        { desc: "+10 Stat Points (E3)" },
        { desc: "The Apprentice dies after 2 attacks (E4)" },
        { desc: "+10 Stat Points (E5)" },
        { desc: "Dmg to hyper armor enemies boosted to 100% (E6)", hyperArmor: 50 }
    ]
});