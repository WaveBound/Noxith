unitDatabase.push({
        id: "unparalleled_armor",
        name: "Unparalleled Armor (Syncro)",
        img: "images/units/UnparalleledArmor.png",
        level: 70,
        placement: 1,
        placementType: "Ground",
        role: "Damage / Buffer",
        tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"],
        meta: {
                short: "Ruler",
                long: "Ruler",
                note: "Global Buffer: Bijuu Link (Toggle) provides massive scaling to all units."

        },
        totalCost: 168360,
        stats: {
                dmg: 24000, spa: 12, range: 35, spaCap: 4,
                crit: 0, cdmg: 150, dot: 0,
                element: "Water", passiveDmg: 0, trueDmg: 0
        },

        passives: [
                { name: "Unparalleled Combination", desc: "On placement gain +60% Hyper Armor Damage." },
                { name: "Bijuu Link", desc: "Energy overflows to allies in range, giving them glowing red cloaks (+25% Dmg, +25% Range, -15% SPA)." },
                { name: "Power of ancient shinobi", desc: "On attack apply either stun or confuse for 3 seconds." }
        ]
});
