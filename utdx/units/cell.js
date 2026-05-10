unitDatabase.push({
    id: "cell",
    name: "Bio-Android (Imperfect)",
    img: "images/units/Cell.png",
    level: 70,
    placement: 1,
    placementType: "Hybrid",
    role: "Damage / Summon",
    tags: ["Villain"],
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Imperfect Form base. Toggle for True Form available at Max Upgrade."
    },
    totalCost: 59110,
    stats: {
        baseName: "Imperfect Form",
        crit: 0,
        cdmg: 150,
        dot: 0,
        spaCap: 4.1,
        passiveDmg: 70,
        element: "Wind"
    },

    upgrades: [
        { dmg: 115, spa: 7.5, range: 25, cost: 1000 },  // Up 0 (Base)
        { dmg: 280, spa: 7.0, range: 25, cost: 1800 },  // Up 1
        { dmg: 475, spa: 7.0, range: 25, cost: 2700 },  // Up 2
        { dmg: 625, spa: 6.5, range: 25, cost: 3680 },  // Up 3
        { dmg: 795, spa: 6.5, range: 30, cost: 4150 },  // Up 4
        { dmg: 980, spa: 6.5, range: 30, cost: 5700 },  // Up 5
        { dmg: 1085, spa: 6.0, range: 35, cost: 6150 }, // Up 6
        { dmg: 1790, spa: 8.5, range: 38, cost: 6980 }, // Up 7 (Becomes Hybrid)
        { dmg: 1860, spa: 8.0, range: 40, cost: 8350 }, // Up 8
        { dmg: 2695, spa: 10.0, range: 45, cost: 8850 }, // Up 9
        { dmg: 3000, spa: 9.5, range: 48, cost: 9750, unlocksAbility: true }   // Up 10
    ],
    ability: {
        abilityName: "True Form",
        dmg: 3225, spa: 10, spaCap: 2.5, range: 43,
        passiveDmg: 50,
        summonStats: {
            attacksToSpawn: 3, maxCount: 3, dmgPct: 50, buffWindow: 0,
            planeA: { spa: 7.5, duration: 30 },
            planeB: { spa: 7.5, duration: 30 }
        }
    }
});
