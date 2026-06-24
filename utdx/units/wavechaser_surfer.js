unitDatabase.push({
    // IDENTITY
    id: "wavechaser_surfer",
    name: "Wavechaser (Surfer)",
    img: "images/units/WavechaserSurfer.png", // User will do image
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Specialist",
    tags: ["Impage", "Hero", "Mag"],

    // META
    meta: {
        short: "Duelist/Ruler",
        long: "Duelist/Sacred",
        note: "Water Specialist unit."
    },

    totalCost: 615000, // User will update stats

    // BASE STATS
    stats: {
        crit: 25,
        cdmg: 40,
        dot: 0,
        dotStacks: 1,
        spaCap: 3.5,
        element: "Water",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES
    upgrades: [
        { name: "Cooling Treatment", dmg: 264, spa: 8, range: 21, cost: 1000 },
        { name: "Cooling Treatment", dmg: 780, spa: 8, range: 22, cost: 2500 },
        { name: "Cooling Treatment", dmg: 1320, spa: 8, range: 25, cost: 4000 },
        { name: "Batter Up!", dmg: 1920, spa: 9, range: 28, cost: 8000 },
        { name: "Batter Up!", dmg: 2400, spa: 9, range: 35, cost: 12000 },
        { name: "Boomsharka-laka", dmg: 3840, spa: 10, range: 36, cost: 16000 },
        { name: "Boomsharka-laka!", dmg: 5760, spa: 10, range: 36, cost: 18000 }
    ],

    // PASSIVES
    passives: [
        {
            name: "Soaking in Freshwater",
            desc: "On Attack:<br>Apply Soaked for 7.5s<br>When applying Soaked:<br>Enemies take +15% Damage<br>Enemies are slowed by 35%"
        },
        {
            name: "Wavebreaker's Instinct",
            passiveCdmg: 40,
            passiveCrit: 15,
            desc: "When hitting an enemy with Soaked:<br>Follow-up with Attack 2<br>On Takedown with Soaked:<br>+0.5% Critical Damage (Cap: +25%)<br>+0.25% Critical Rate (Cap: +15%)"
        },
        {
            name: "Nightsoul Transmission",
            passiveDmg: 30,
            passiveRange: 15,
            passiveSpa: -10,
            desc: "On Takedown:<br>Gain +5% 'Nightsoul' Charge<br>On full 'Nightsoul':<br>Enter 'Nightsoul Form' for 30 seconds<br>+30% Damage, +15% Range, -10% SPA.<br>During 'Nightsoul Form':<br>Deal 2x Damage to enemies with Burn.<br>'Nightsoul Form' Cooldown: 45s"
        },
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "\"Wavebreaker's Instinct\" Critical Damage Cap increased to +40% and Critical Rate Cap increased to +25%.",
        "+10 Stat Points",
        "\"Soaking in Freshwater\" Soaked Slow increased to 50% and Damage increased to +20%.",
        "+10 Stat Points",
        "\"Nightsoul Transmission\" Cooldown reduced to 30s and Gain increased to 10%."
    ]
});
