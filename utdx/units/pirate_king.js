unitDatabase.push({
    id: "pirate_king",
    name: "Pirate King (Voyage)",
    img: "images/units/PirateKing.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Utility",
    tags: ["Piece", "King", "Sword", "Warlord"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Ruler is strictly best due to placement limit."
    },
    totalCost: 99000,
    stats: {
        spaCap: 4.5,
        crit: 0, cdmg: 150,
        dot: 0, dotDuration: 0, dotStacks: 0,
        element: "Rose",
        passiveDmg: 0,
    },

    upgrades: [
        { dmg: 360, spa: 7, range: 24, cost: 0 },     // Up 0 (Base)
        { dmg: 780, spa: 7, range: 25, cost: 5000 },  // Up 1
        { dmg: 1350, spa: 7, range: 26, cost: 8000 }, // Up 2
        { dmg: 2000, spa: 8.5, range: 28, cost: 13000 }, // Up 3
        { dmg: 4400, spa: 12, range: 30, cost: 18000 }, // Up 4
        { dmg: 5000, spa: 12, range: 31, cost: 25000 }, // Up 5
        { dmg: 7200, spa: 12, range: 33, cost: 30000 }  // Up 6
    ],
    passives: [
        {
            name: "Conqueror's Coating",
            passiveCdmg: 200,
            desc: "<br>This unit has a fixed Crit Rate of 40% that cannot be increased.<br><br>After this unit is sold and placed again:<br>• Gain +20% Crit Damage [+40% at E6] (Cap: +200%).<br>• This Passive does not work if the unit is sold by the owner."
        },
        {
            name: "The Spark of the Great Era",
            desc: "<br>Placement cost is 0 and retains all upgrades after being sold.<br><br>On placement:<br>• Gain Stun Immunity for 5s<br>• Follow-up with Attack 3<br>• Apply Radiation for 50% Damage over 15 ticks<br>• Gain +100% Damage (15s cooldown)<br><br>On Attack:<br>• -25% Damage<br><br>On max Upgrade:<br>• -10% Damage<br><br>When Buff reaches 0% Damage:<br>• Use active ability to sell or upgrades reset<br><br>When sold:<br>• Auto-place first 'Piece' unit with +15% Damage [+25% at E4] (15s cooldown)<br>• If none, gain a free upgrade next placement."
        },
        {
            name: "King of the Pirates",
            desc: "When stunned:<br>• Ignore the Stun<br>• Gain +50% Damage [+65% at E2]<br>• Follow-up with Attack 2 (10s cooldown)<br><br>On Attack:<br>• Enemies drop +15% more Yen if they die in this unit's Range."
        }
    ],
    ability: {
        buffDmg: 600,
        abilityName: "Synchro Clash",
        noToggle: true,
        cooldown: 120,
        desc: "When both 'Quake Warlord' and 'Pirate King' are fully upgraded and within each other's range:<br>• Release a Synchro Attack<br>• Deal 600% of the average Damage between these two units to all enemies on the map."
    },

    etherealization: [
        "+10 Stat Points",
        "\"King of the Pirates\" Buff increased to +65%.",
        "+10 Stat Points",
        "\"The Spark of the Great Era\" Buff increased to 25%.",
        "+10 Stat Points",
        "\"Conqueror's Coating\" Crit Damage increased to +40%."
    ]
});
