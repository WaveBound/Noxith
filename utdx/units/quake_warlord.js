unitDatabase.push({
    id: "quake_warlord",
    name: "Quake Warlord (Destroyer)",
    img: "images/units/QuakeWarlord.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Damage",
    tags: ["Piece", "Warlord"],
    meta: {
        short: "Ruler",
        long: "Duelist/Eternal",
        note: "Pond Overlord: High Water AoE damage. Buffs all other Warlord units on the field."
    },
    bugs: [
        {
            name: 'Miku Ability Debuff Calculation',
            desc: 'This unit incorrectly counts Miku\'s ability as a debuff, giving him an unintended +50% damage boost.'
        }
    ],

    totalCost: 73000,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 3.0,
        passiveDmg: 0,
        element: "Water",
        dotDuration: 0,
        support: "Slow, Stun",
        finalMult: 1.4, // Raw +40% damage multiplier to units
        customFollowUp: {
            chance: 20,          // Every 5th attack (1/5 = 20%)
            eLevelReq: 99,       // No etherealization upgrade for this
            eLevelChance: 20,    // Same chance at all levels
            dmgMult: 3.5,        // +250% bonus (350% total)
            dotPct: 0,           // Explicitly no DoT for Quake Warlord's FUA
            fuaAnimation: 0,     // No extra animation delay
            label: "The Strongest Man"
        }
    },
    upgrades: [
        { dmg: 240, spa: 10.0, range: 16, cost: 1500 },  // Up 0 (Base)
        { dmg: 600, spa: 10.0, range: 18, cost: 4500 },  // Up 1
        { dmg: 1300, spa: 10.0, range: 20, cost: 10000 },  // Up 2 - Quake Slash
        { dmg: 2000, spa: 10.0, range: 23, cost: 14000 },  // Up 3
        { dmg: 4000, spa: 12.0, range: 26, cost: 19000 }, // Up 4 - Earthquake
        { dmg: 6000, spa: 12.0, range: 29, cost: 24000 }  // Up 5 - Active
    ],
    passives: [
        {
            name: "Power To Destroy The World",
            desc: "• Deal 350% Damage to all enemies on the map<br>• Apply Quake Stun to all enemies for 15 seconds<br>• (Quake Stun: separate affliction, stackable with Stun)<br>• Enemies hit take +50% Damage until death<br>• One-time Use"
        },
        {
            name: "My Sons",
            desc: "When a 'Piece' Tag unit is debuffed:<br>• +50% Damage for 30 seconds<br><br>When any other unit is debuffed:<br>• +30% Damage for 20 seconds<br>• (Etherealization 4: Both buffs increased by 20%)<br><br>When 'Spade' is in Range:<br>• +40% Damage to Spade"
        },
        {
            name: "The Strongest Man",
            desc: "Every Attack:<br>• Apply Stun for 3 seconds<br><br>If attacking an Enemy with Stun:<br>• Deal +40% Damage (Raw Damage Multiplier)<br>• 30% Damage is stored for 5 attacks (150% Damage)<br>• (Etherealization 2: 50% Damage is stored, up to 250%)<br><br>When 5 attacks have been stored:<br>• Do an attack 2 Follow-up for the amount of stored Damage (+250% / 350% total, can Crit)"
        },
        {
            name: "Conqueror's Clash",
            passiveCrit: 40,
            desc: "Every Follow-up Attack:<br>• +10% Crit Rate (Cap: +40%)<br>• (Etherealization 6: +20% Crit Rate)<br><br>When a Boss enters Range:<br>• Follow-up with Attack 3<br>• Deal +100% Critical Damage<br>• Apply Stun for 4 seconds<br><br>On Crit<br>• Apply 40% Slow for 5 seconds"
        }
    ],
    ability: {
        abilityName: "Power To Destroy The World",
        noToggle: true,
        desc: "• Deal 350% Damage to all enemies on the map<br>• Apply Quake Stun to all enemies for 15 seconds<br>• (Quake Stun: separate affliction, stackable with Stun)<br>• Enemies hit take +50% Damage until death<br>• One-time Use"
    },
    etherealization: [
        "+10 Stat Points (E1)",
        "Increase damage stored by 'The Strongest Man' to 50% (E2)",
        "+10 Stat Points (E3)",
        "Increase 'My Sons' buffs by +20% each (E4)",
        "+10 Stat Points (E5)",
        "Conqueror's Clash: +20% Crit Rate (E6)",
    ]
});
