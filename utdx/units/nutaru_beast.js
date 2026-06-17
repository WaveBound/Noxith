unitDatabase.push({
    id: "nutaru_beast",
    name: "Nutaru (Beast)",
    img: "images/units/NutaruBeast.png",
    level: 70,
    placement: 2,
    placementType: "Ground",
    role: "DPS",
    tags: ["Team 7", "Ninjaverse", "Main character", "Sage", "Hero", "Bloodline"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Dynamic Attacker: Swapping to Beast Mode increases SPA Cap to 3.0 but grants massive Crit and Cycle damage."

    },
    totalCost: 71910,
    stats: {
        spaCap: 2.5,
        crit: 0, cdmg: 150, dot: 0,
        element: "Wind",
        passiveDmg: 0,
        summonStats: { attacksToSpawn: 8, maxCount: 3, dmgPct: 100, buffWindow: 0, planeA: { spa: 6, duration: 50 }, planeB: { spa: 6, duration: 50 } }
    },

    upgrades: [
        { dmg: 205, spa: 7, range: 25, cost: 2000 },    // Up 0 (Base)
        { dmg: 570, spa: 6.5, range: 28, cost: 4450 },  // Up 1
        { dmg: 800, spa: 6.5, range: 30, cost: 6750 },  // Up 2
        { dmg: 1325, spa: 9, range: 34, cost: 9560 },   // Up 3
        { dmg: 1900, spa: 8.5, range: 37, cost: 12650 },// Up 4
        { dmg: 2500, spa: 8.5, range: 42, cost: 16000 },// Up 5
        { dmg: 3300, spa: 8, range: 45, cost: 20500 }   // Up 6
    ],
    passives: [
        { name: "Shadow Clone", passiveDmg: 40, desc: "Every 8 attacks, summon a clone (Max 3) for 50s. Clones deal 100% Dmg. Gain +20% Dmg (Max 40%) when clones expire." },
        { name: "Chakra Control", desc: "+5% Chakra per attack. Auto-enters Beast Mode at 100%. Beast Mode lasts 100s." },
        { name: "Beast Cycle", desc: "Cycles: Beast Slam -> Beast Ball -> Massive Beast Ball. Completion grants +50% Damage for the mode duration." }
    ],
    ability: {
        abilityName: "Beast Mode",
        desc: `[E6] Unleash the Beast: 
• +30% Damage, +50% CDmg
• +35% Crit Rate, +50% Cycle Dmg
• SPA Cap: 3.0s
• Clones active.`,
        passiveDmg: 120, // 30 (Beast) + 40 (Clone Loss) + 50 (Cycle)
        crit: 35,
        cdmg: 200,
        spaCap: 3.0,
        summonStats: {
            attacksToSpawn: 8, maxCount: 3, dmgPct: 100, buffWindow: 0,
            planeA: { spa: 6, duration: 50 },
            planeB: { spa: 6, duration: 50 }
        }
    },
    etherealization: [
        "+10 Stat Points",
        "Shadow Clone cap increased to 3.",
        "+10 Stat Points",
        "Clones gain +25% Damage while Beast Mode is active.",
        "+10 Stat Points",
        "Beast Mode Crit Rate increased to 35%. Summons gain +60% Damage."
    ]
});
