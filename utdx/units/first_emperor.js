unitDatabase.push({
    id: "first_emperor",
    name: "First Emperor (Greatest)",
    img: "images/units/FirstEmperor.png",
    level: 70,
    placement: 1,
    placementType: "Ground",
    role: "Specialist / Ground",
    tags: [],
    meta: {
        short: "Ruler",
        long: "Ruler",
        noz: "Attack Form: Demon art : Axe. Ruler is strictly best due to 1 placement count."
    },
    totalCost: 89500,
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 120,
        dotStacks: 1,
        spaCap: 3,
        passiveDmg: 0,
        element: "Rose",
        dotDuration: 10
    },

    upgrades: [
        { dmg: 440, spa: 7, range: 25, cost: 3000 },   // Up 0 (Base)
        { dmg: 560, spa: 7, range: 26, cost: 2500 },   // Up 1
        { dmg: 720, spa: 7, range: 26, cost: 3000 },   // Up 2
        { dmg: 905, spa: 7, range: 27, cost: 5000 },   // Up 3
        { dmg: 1155, spa: 7, range: 27, cost: 7500 },  // Up 4
        { dmg: 1690, spa: 7, range: 27, cost: 9500 },  // Up 5
        { dmg: 1600, spa: 7, range: 29, cost: 11000 }, // Up 6
        { dmg: 2000, spa: 7, range: 29, cost: 13000 }, // Up 7
        { dmg: 2600, spa: 7, range: 30, cost: 15000 }, // Up 8
        { dmg: 3200, spa: 7, range: 32, cost: 20000 }  // Up 9 (Unlocks Demon’s Arts)
    ],
    passives: [
        { name: "Guidance of the Original Monarch", desc: "Everytime First Emperor switches Demonic Arts, all Units in First Emperor's Range will perform an Attack. [On E6] Units Performing an Attack will gain 15% of First Emperor's Damage for 10 seconds." },
        { name: "Flow Disruptor", desc: "When First Emperor Attacks a Sprinter Enemy, The Enemy gets slowed by 30% for 3 seconds." },
        { name: "The King's Advantage", desc: "First Emperor deals +25% Damage to non shielded Enemies." },
        { name: "Indomitable Willpower", desc: "When First Emperor is Stunned, he resists the Stun and applies a 3 Seconds Stun on his next Attack." }
    ],
    ability: {
        abilityName: "Demonic Art Swap",
        noToggle: true,
        desc: "When First Emperor Reaches his Final Upgrade, he unlocks the Ability to Change his Demonic Art. Starts with <b class='mt-text-gold'>Blade</b>.<br><br>" +
            "<span style='display: block; margin-top: 10px;'><b class='mt-text-gold'>Blade:</b> +60% Damage (+80% on E2) for 25s on switch.</span>" +
            "<span style='display: block; margin-top: 6px;'><b class='mt-text-gold'>Axe:</b> Attacks Slow Enemies by 40% for 5s. Confusion for 3s on first hit.</span>" +
            "<span style='display: block; margin-top: 6px;'><b class='text-accent-start'>Crossbow:</b> +1000% Range, Sets Priority to Strongest. Attacks apply Stun for 2s, but -20% Attack Speed. <span class='text-dim'>[On E6: +30% Damage]</span></span>" +
            "<span style='display: block; margin-top: 6px;'><b class='mt-text-green'>Spear:</b> Attacks get rid of old Bleed and apply new Bleed (100% Damage, 120% on E2) over 10 ticks.</span>" +
            "<span style='display: block; margin-top: 6px;'><b class='text-accent-end'>Armor:</b> Sets Priority to Last and moves to Closest Path point. Confusion for 1.5s (2.5s on E4) to Non-Boss enemies walking into him. <span class='text-dim'>[On E4: deals 50% Damage to confused enemies]</span></span>"
    },
    etherealization: [
        "+10 Stat Points",
        "\"Demon Art: Blade\" Damage Buff Increased to +80%",
        "+10 Stat Points",
        "\"Demon Art: Armor\" now deals 50% Damage, Confusion Duration Increase To 2.5s",
        "+10 Stat Points",
        "\"Guidance of the Original Monarch\" Passive now Buffs Units and \"Demon Art: Crossbow\" gives +30% Damage."
    ]
});
