unitDatabase.push({
    id: "ancient_mage",
    name: "Ancient Mage (Slayer)",
    img: "images/units/AncientMage.png",
    level: 70,
placement: 1,
    placementType: "Ground",
    role: "Utility / Ground",
    tags: ["Sage", "Bloodline", "Hero", "Main character"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Dynamic Class System. Specialist mode maximizes DoT, while DPS mode provides the highest raw hit damage."

    },
    totalCost: 66700,
    stats: {
        spaCap: 4,
        crit: 0, cdmg: 150, dot: 60, dotDuration: 10,
        element: "Light",
        passiveDmg: 0,  // Base Experience (20)
        passiveSpa: 0,   // Base SPA buff/penalty (0 = No change)
        bossDmg: 0,
        dotBuff: 20,     // Specialist focus (+40% DoT)
        trueDmg: 50        // Specialist focus (+50% True Dmg)
    },

    upgrades: [
        { dmg: 280, spa: 8, range: 25, cost: 2300 },   // Up 0 (Base)
        { dmg: 700, spa: 8, range: 28, cost: 5800 },   // Up 1
        { dmg: 1160, spa: 8, range: 32, cost: 9600 },  // Up 2
        { dmg: 1950, spa: 8, range: 34, cost: 11500 }, // Up 3
        { dmg: 3600, spa: 8, range: 40, cost: 15000 }, // Up 4
        { dmg: 5500, spa: 8, range: 45, cost: 22500 }  // Up 5
    ],
    passives: [
        { name: "Millennia Old Experience", desc: "Every attack: Enemies take +20% Damage (Debuff) and Wind Shear (60% Dmg over 10 ticks). Specialist Mode swaps Wind Shear for Burn and increases DoT effectiveness." },
        { name: "The Last Great Mage", desc: "Gains Stun Immunity while not attacking (Always active at E4)." }
    ],
    modes: [
        {
            name: "DPS",
            img: "images/units/AncientMage/dps.png",
    level: 70,
desc: "Combat focus: +20% Dmg, +40% Slow (Penalty), +50% Boss Dmg. Applies Wind Shear (60% DoT over 10s).",
            dmg: 5500, spa: 8, range: 45, spaCap: 4,
            crit: 0, cdmg: 150, dot: 60, dotDuration: 10,
            passiveDmg: 20, passiveSpa: -40, bossDmg: 50,
            dotBuff: 0, trueDmg: 0, cooldown: 0
        },
        {
            name: "Specialist",
            img: "images/units/AncientMage/Specialist.png",
    level: 70,
desc: "Magic focus: +40% DoT, +50% True Damage. Swaps Wind Shear for Burn (60% DoT over 10s).",
            dmg: 5500, spa: 8, range: 45, spaCap: 4,
            crit: 0, cdmg: 150, dot: 60, dotDuration: 10,
            passiveDmg: 0, passiveSpa: 0, bossDmg: 0,
            dotBuff: 40, trueDmg: 50, cooldown: 0
        },
        {
            name: "Support",
            img: "images/units/AncientMage/Support.png",
    level: 70,
desc: "Blessing focus: Stop attacking to buff units in range: +15% Effect Res, +20% Crit Rate, +20% Crit Damage.",
            dmg: 0, spa: 8, range: 45, spaCap: 4,
            crit: 0, cdmg: 0, dot: 0, dotDuration: 0,
            passiveDmg: 0, passiveSpa: 0, bossDmg: 0,
            dotBuff: 0, trueDmg: 0, cooldown: 0
        },
        {
            name: "Utility",
            img: "images/units/AncientMage/Utility.png",
    level: 70,
desc: "Control focus: Attacks apply Stun (2s) and Heavy Slow (75%). If already stunned: enemies take +20% extra damage.",
            dmg: 5500, spa: 8, range: 45, spaCap: 4,
            crit: 0, cdmg: 150, dot: 0, dotDuration: 0,
            passiveDmg: 0, passiveSpa: 0, bossDmg: 0,
            dotBuff: 0, hyper: 0, cooldown: 0
        }
    ],
    etherealization: [
        "+10 Stat Points",
        "Gain +20% DOT effectiveness.",
        "+10 Stat Points",
        "The Last Great Mage: Stun Immunity is always active.",
        "+10 Stat Points",
        "Battle Adaptation: Cooldown reduced to 45s."
    ]
});
