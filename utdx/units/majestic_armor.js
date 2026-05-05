unitDatabase.push({
        id: "majestic_armor",
        name: "Majestic Armor (Syncro)",
        img: "images/units/MajesticArmor.png",
        level: 70,
        placement: 2,
        placementType: "Ground",
        role: "Damage / DoT",
        tags: ["Team 7", "Ninjaverse", "Hero", "Bloodline"],
        meta: {
                short: "Ruler",
                long: "Ruler",
                note: "High base crit and powerful dual-element DoT makes this unit an extremely efficient hybrid."

        },
        totalCost: 140910,
        stats: {
                dmg: 13000, spa: 12, range: 40, spaCap: 5,
                crit: 50, // 0 + 50 from Passive
                cdmg: 250, // 150 + 100 from Passive
                dot: 60,
                dotDuration: 6,
                dotStacks: 1,
                element: "Dark",
                passiveDmg: 0
        },

        passives: [
                { name: "Combined Might", desc: "On attack apply either black burn or wind shear for 60% over 6 ticks." },
                { name: "Unlikely Alliance", desc: "On placement gain +50% Crit rate and +100% Critical damage." }
        ]
});
