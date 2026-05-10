unitDatabase.push({
    id: "enlightenedgod",
    name: "Enlightened God (Holy)",
    img: "images/units/EnlightenedGod.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "Utility",
    tags: ["Divinity", "Historic Being"],
    meta: {
        short: "Sacred",
        long: "Sacred",
        note: "Mode-based divine unit with high utility. Features 3 distinct forms."
    },
    totalCost: 90000,
    stats: {
        crit: 0,
        cdmg: 150,
        spaCap: 2.5,
        element: "Light",
        passiveDmg: 0,
    },
    upgrades: [
        { dmg: 240, spa: 6, range: 22, cost: 1800 },
        { dmg: 600, spa: 6, range: 24, cost: 3200 },
        { dmg: 1150, spa: 5.5, range: 30, cost: 7000 },
        { dmg: 1630, spa: 7, range: 32, cost: 9500 },
        { dmg: 1800, spa: 6, range: 35, cost: 14000 },
        { dmg: 2000, spa: 6, range: 40, cost: 16000 },
        { dmg: 2240, spa: 7, range: 42, cost: 18500 },
        { dmg: 2420, spa: 7, range: 46, cost: 20000 }
    ],
    modes: [
        {
            name: "Axe of Smugness",
            img: "images/units/EnlightenedGod/Axe.png",
            desc: "Deals +50% more damage based on how high Enemy HP% is. Divine Foresight gains 20% [50% on E2] Crit Rate.",
            dmg: 2420, spa: 7, range: 46,
            passiveDmg: 25
        },
        {
            name: "Cycle of Wrath",
            img: "images/units/EnlightenedGod/Wrath.png",
            desc: "Inflict Burn/Bleed. Gains +5% Damage per Bleeding/Burning enemy (up to 60% each). Deals 200% DoT Damage to Bosses.",
            dmg: 2420, spa: 7, range: 51,
            dot: 100, dotDuration: 5, bossDot: 200
        },
        {
            name: "Shield of Fear",
            img: "images/units/EnlightenedGod/Shield.png",
            desc: "Stops attacking. Reverses debuffs into buffs for allies. [Doubled on E4]",
            dmg: 0, spa: 0, range: 46
        }
    ],
    passives: [
        {
            name: "Enlightened Will",
            desc: "Buffs allied unit's by 5% Attack, Attack Speed, and Range every 60 seconds. (Cap of 20%)"
        },
        {
            name: "Divine Foresight",
            desc: "When stunned: Deal +100% extra damage on next attack. (12 Second Cooldown)"
        },
        {
            name: "Staff of the Realms",
            desc: "Gains new effects based on what weapon stance it's on."
        }
    ],
    etherealization: [
        "+10 Stat Points (E1)",
        "\"Axe of Smugness\" Crit Rate increased to 50% (E2)",
        "+10 Stat Points (E3)",
        "\"Shield of Fear\" Reversed Buffs are now doubled (E4)",
        "+10 Stat Points (E5)",
        "Increase Placement Limit by 1 (E6)",
    ]
});
