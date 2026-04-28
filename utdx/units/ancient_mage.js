unitDatabase.push({
    id: "ancient_mage",
    name: "Ancient Mage (Slayer)",
    img: "images/units/AncientMage.png",
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
        passiveDmg: 20,  // Base Experience (20)
        passiveSpa: 0,
        bossDmg: 0,
        dotBuff: 40,     // Specialist focus (+40% DoT)
        hyper: 50        // Specialist focus (+50% True Dmg)
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
    ability: {
        abilityName: "DPS",
        desc: "Combat focus: +20% Dmg, -40% Atk Speed, +50% Boss Dmg. Applies Wind Shear (60% DoT over 10s).",
        passiveDmg: 40,  // Base Experience (20) + DPS (20)
        passiveSpa: -40, // Atk Speed Penalty
        bossDmg: 50,     // Boss Killer
        dotBuff: 0,      // Reset Specialist buff
        hyper: 0,        // Reset Specialist buff
        cooldown: 60
    },
    modes: {
        "DPS": { desc: "Combat focus: +20% Dmg, -40% Atk Speed, +50% Boss Dmg. Applies Wind Shear (60% DoT over 10s)." },
        "Specialist": { desc: "Magic focus: +40% DoT, +50% True Damage. Swaps Wind Shear for Burn (60% DoT over 10s)." },
        "Support": { desc: "Stop attacking and buffs units in range: +15% Effect Res, +20% Crit Damage, +20% Crit Rate. When buffed unit attacks: Follow-up attack (Follow Up Cooldown: 30s)." },
        "Utility": { desc: "Attack apply stun for 2s. If already stunned: Enemies will take +20% damage (cannot apply multiple times). Apply slow (75% Speed for 5s)." }
    },
    etherealization: [
        "+10 Stat Points",
        "Gain +20% DOT effectiveness.",
        "+10 Stat Points",
        "The Last Great Mage: Stun Immunity is always active.",
        "+10 Stat Points",
        "Battle Adaptation: Cooldown reduced to 45s."
    ]
});
