unitDatabase.push({
    // IDENTITY
    id: "strongest_swordsman_hunter",
    name: "Strongest Swordsman (Hunter)",
    img: "images/units/StrongestSwordsman.png",
    level: 70,
    placement: 2,
    placementType: "Hill",
    role: "DPS",
    tags: ["Piece", "Sword", "Warlord"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Duelist/Ruler",
        note: "Top-tier Hill DPS. Excels at long-range precision and provides powerful synergies to Warlord and Piece teams."
    },

    totalCost: 72600,

    // BASE STATS
    stats: {
        spaCap: 3.5,
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        element: "Wind",
        passiveDmg: 0
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 240, spa: 12, range: 30, cost: 1600 },    // Up 0 (Base)
        { dmg: 600, spa: 12, range: 34, cost: 5000 },   // Up 1
        { dmg: 1400, spa: 11, range: 38, cost: 9000 },  // Up 2
        { dmg: 2000, spa: 11, range: 42, cost: 15000 },  // Up 3
        { dmg: 2700, spa: 10, range: 45, cost: 17000 },  // Up 4
        { dmg: 3900, spa: 10, range: 50, cost: 25000 }  // Up 5 (Max)
    ],

    // PASSIVES (displayed in unit info panel)
    passives: [
        {
            name: "Thousand Cuts",
            passiveDmg: 35,
            passiveCdmg: 50,
            desc: "<br>On Attack:<br>• Deal 5% more Damage per enemy hit.<br>• This Buff caps at 10 enemies hit.<br><br>When attacking more than 1 Armored Enemy:<br>• Deal 1.5x Damage to Armored and Hyper Armored enemies.<br><br>Every 100 Takedowns:<br>• Unlock either 'Armament Haki' or 'Observation Haki'.<br><br>Armament Haki:<br>• +35% Damage.<br>• +50% Critical Damage.<br><br>Observation Haki:<br>When no enemies are in Range:<br>• Switch to Stance One.<br>• +500% Range.<br>• -50% SPA.<br><br>Every 1 stud further the enemy is from this unit:<br>• Deal +1% Damage per stud.<br>• Attacks during 'Observation Haki' do not count toward 'Sword Stances'."
        },
        {
            name: "Sword Stances",
            passiveCrit: 20,
            passiveCdmg: 100,
            desc: "<br>• +20% Critical Rate<br>• +100% Critical Damage<br><br>• This unit has three Sword Stances and starts with Stance One on placement.<br><br>Every other Attack:<br>• Switch to the next Stance.<br>• Instantly release a Follow-up Attack.<br><br>When reaching Stance Two:<br>• +40% Damage.<br>• +15% Critical Rate.<br><br>When reaching Stance Three:<br>• +5% Critical Rate.<br>• +25% Critical Damage.<br>• These Buffs stack up to 2 times."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        "\"Sword Stances\" Cap INcreased to 4 Cycles.",
        "+10 Stat Points",
        "\"Thousand Cuts\" Cap increaed to 15%, Damage increased to 7.5% and Armor Damage increased to 1.65x.",
        "+10 Stat Points",
        "\"Sword Stances\" Damage increased to 60% and Critical Rate increased to 20%."
    ]
});