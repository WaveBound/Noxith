unitDatabase.push({
    // IDENTITY
    id: "sharpshooter_king_trapper",
    name: "Sharpshooter King (Trapper)",
    img: "images/units/SharpshooterKingTrapper.png",
    level: 70,
    placement: 3,
    placementType: "Hybrid",
    role: "Utility",
    tags: ["Pirate Crew", "Piece", "Hero"],

    // META
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: ""
    },

    totalCost: 66100,

    // BASE STATS
    stats: {
        spaCap: 0,
        crit: 0,
        cdmg: 0,
        dot: 0,
        dotStacks: 0,
        element: "Wind",
        passiveDmg: 0
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 240, spa: 10, range: 15, cost: 1000, spaCap: 2 },       // Up 0 (Base)
        { dmg: 600, spa: 10, range: 17, cost: 3000, spaCap: 2 },    // Up 1
        { dmg: 1500, spa: 10, range: 19, cost: 5600, spaCap: 2 },   // Up 2
        { dmg: 1900, spa: 10, range: 22, cost: 8500, spaCap: 2 },    // Up 3
        { dmg: 3600, spa: 10, range: 25, cost: 12000, spaCap: 2.5 }, // Up 4
        { dmg: 4500, spa: 10, range: 27, cost: 16000, spaCap: 2.5 }, // Up 5
        { dmg: 5100, spa: 10, range: 29, cost: 20000, spaCap: 2.5 }  // Up 6
    ],

    // PASSIVES
    passives: [
        {
            name: "READY, AIM FIRE!",
            passiveDmg: 30,
            desc: "When no Enemies are in Range:<br>• Gain +10,000% Range<br>• Release a Follow-up Attack for 100% Damage<br>• (Etherealization 2: Attack deals 135% Damage)<br>• Apply Burn for 35% Damage over 6 ticks<br><br>For every Follow-up Attack:<br>• +5% Damage (Cap: +30%)<br>• Cooldown: 45s<br>• (Etherealization 4: 30s Cooldown)"
        },
        {
            name: "Pop Green Traps",
            desc: "When no Enemies are in Range:<br>• Instead of performing an Attack, this unit will plant Traps on the Path within its Range<br>• This unit can place a maximum of 3 Traps at a time<br>• (Etherealization 6: Trap cap increased to 6)<br><br>Pop Green: Fly Eater<br>• Deal 150% Damage to the Enemy that steps on this trap<br><br>Pop Green: Bamboo<br>• Deal 100% Damage to the Enemy that steps on this trap<br>• Apply Bleed for 25% Damage over 5 ticks<br>• Apply Stun for 2 seconds<br><br>Pop Green: Vines<br>• Deal 125% Damage to the Enemy that steps on this trap<br>• Deal 25% Damage to Enemies within 25 studs of the trap"
        },
        {
            name: "Trap and Go",
            desc: "• This unit gains +10% Damage per active Trap<br><br>When the Trap Cap is reached:<br>When an Enemy enters Range:<br>• Do a Follow-up Attack for 15% Damage<br>• Enemies hit will take +20% Damage until they die<br>• If the Enemy is a Boss, take +40% Damage until it dies"
        }
    ],

    // CUSTOM SUMMONS
    customSummons: [
        {
            name: "Pop Green Traps (6 Active)",
            reqUp: 0,
            spa: 10,
            dmgMult: 7.5, // 1.25 (average of 150, 125, 100) * 6 traps
            noCrit: true,
            hostSpaLinked: true,
            hostAttackRatio: 1,
            isSummon: true,
            excludeFromDps: true,
            desc: [
                "Represents the burst DPS of all 6 Traps being triggered.",
                "Average Trap Damage: 125%. Total: 750%."
            ],
            color: "#22c55e"
        }
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "\"READY, AIM FIRE!\" Follow-up Damage increased to 135%.",
        "+10 Stat Points",
        "\"READY, AIM FIRE!\" Cooldown decreased to 30s.",
        "+10 Stat Points",
        "\"Pop Green Traps\" Trap cap increased to 6."
    ]
});
