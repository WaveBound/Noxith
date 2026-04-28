unitDatabase.push({
    id: "crow_shinobi",
    name: "Crow Shinobi",
    img: "images/units/CrowShinobi.png",
    placement: 3,
    placementType: "Hill",
    role: "DPS / Hill",
    tags: ["Ninjaverse", "Bloodline", "Hero"],
    meta: {
        short: "Ruler",
        long: "Eternal",
        note: "Powerful DoT and crowd control. Below 60% HP, Amaterasu becomes significantly more lethal."
    },
    totalCost: 68450,
    stats: {
        spaCap: 2.5,
        crit: 0, cdmg: 150, dot: 60, dotDuration: 10, dotStacks: 1,
        element: "Fire"
    },

    upgrades: [
        { dmg: 150, spa: 6, range: 29, cost: 2750 },   // Up 0 (Base)
        { dmg: 400, spa: 6, range: 33, cost: 2700 },   // Up 1
        { dmg: 835, spa: 6, range: 35, cost: 7500 },   // Up 2
        { dmg: 1165, spa: 8, range: 40, cost: 14500 }, // Up 3
        { dmg: 2530, spa: 8, range: 43, cost: 18500 }, // Up 4
        { dmg: 3050, spa: 8, range: 46, cost: 22500 }, // Up 5
    ],
    passives: [
        { name: "Elusive Crow Distraction", desc: "Every 5 attacks (4 at E2) confuses enemies for 2 seconds (3s at E2)." },
        { name: "Flame Sealing Technique", desc: "On Kill (Enemy with Black Burn): 30% chance to stun nearby enemies for 4s." },
        { name: "Amaterasu", desc: "Attacks apply Black Burn (60% Dmg over 10 ticks). Re-applying to a burning target inflicts 'Time Snail': +20% DoT/Affliction and 30% Slow. Enemies below 60% HP take 3% (6% at E6) unit damage per second until death." }
    ],
    ability: {
        abilityName: "Moon God: Counter Crash",
        desc: "Summons a meteor dealing 150% (250% at E4) damage and removes all enemy modifiers. Cooldown: 60s.",
        noToggle: true,
        cooldown: 60
    },
    etherealization: [
        "+10 Stat Points",
        "Elusive Crow: Proc at 4 attacks, 3s duration",
        "+10 Stat Points",
        "Counter Crash: Damage increased to 250%",
        "+10 Stat Points",
        "Amaterasu: Execute Burn increased to 6%"
    ]
});
