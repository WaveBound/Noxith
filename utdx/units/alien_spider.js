unitDatabase.push({
    // IDENTITY
    id: "alien_spider",
    name: "Alien Spider",
    img: "images/units/AlienSpider.png",
    level: 70,
    placement: 3,
    placementType: "Ground",
    role: "DPS",
    tags: ["Hero", "Main Character", "Fusion", "Uncontrollable Power"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Wind DPS with a powerful damage-over-time ability."
    },

    totalCost: 125616,

    // ENEMIES IN RANGE (Symbiotic Web Trap): +10% Dmg, +10% Range, -1% SPA per enemy
    // Cap: 10 enemies (15 at E6). Default to 1 enemy in range.
    systemLevel: {
        label: "Enemies in Range",
        controlType: "number",
        min: 0,
        max: 15,
        default: 1,
        passiveName: "Symbiotic Web Trap"
    },

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4.5,
        passiveDmg: 0,
        element: "Dark",
        dotDuration: 0,
        support: "",
    },

    // UPGRADES (dmg, spa, range, cost per level)
    upgrades: [
        { dmg: 27600, spa: 12, range: 35, cost: 125616 }
    ],

    // PASSIVES (displayed in unit info panel)
    // PASSIVES
    passives: [
        {
            name: "We are One",
            desc: "On Hit:<br>• Deal a second instance of 50% (70% at E2) Damage.<br>• Apply Biomass permanently. Biomass enemies take +50% Damage from Dark units.<br>• When attacking an enemy with Biomass that wasn't inflicted by this unit: Follow-up Attack for 75% Damage (doesn't apply Biomass)."
        },
        {
            name: "Symbiotic Web Trap",
            desc: "On Takedown:<br>• Enemies leave a Web Trap for 6 seconds.<br>• When an enemy walks over a Web Trap: Apply Stun for 1.5s (3s at E4), Tethered (reducing movement by 30% [45% at E4] permanently), and apply Biomass permanently.<br>• For every Biomass / Tethered enemy in Range: +10% Damage, +10% Range, -1% SPA (Cap: 10 [15 at E6] enemies)."
        },
        {
            name: "Symbiotic Spider-Senses",
            desc: "On attempted Stun:<br>• Dodge the Stun.<br>• Release a Full AOE Counter Attack for 135% Damage."
        }
    ],

    // ETHEREALIZATION (E1-E6 upgrade descriptions)
    etherealization: [
        "+10 Stat Points",
        '"We are One" second Damage instance increased to 70%',
        "+10 Stat Points",
        '"Symbiotic Web Trap" Stun increased to 3s, Slow increased to 45%',
        "+10 Stat Points",
        '"Symbiotic Web Trap" Enemy Cap increased to 15 Enemies.'
    ]
});
