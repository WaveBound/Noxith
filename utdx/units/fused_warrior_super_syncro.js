unitDatabase.push({
    // IDENTITY
    id: "fused_warrior_super_syncro",
    name: "Fused Warrior (Super) (Syncro)",
    img: "images/units/FusedWarriorSuper.png",
    level: 70,
    placement: 2,
    placementType: "Hybrid",
    role: "DPS",
    tags: ["Super Warrior", "Hero", "Fusion"],

    // META (Build Guide / Trait Tier List)
    meta: {
        short: "Ruler",
        long: "Ruler",
        note: "Light-element Syncro unit with hybrid placement."
    },
    bugs: [
        {
            name: 'Nuh Uh Follow up',
            desc: 'Doesn\'t scale with "i Thought you would be stronger" 2x damage.'
        },
        {
            name: 'AoE Miss Chance',
            desc: 'The AoE attack is bugged and misses frequently if enemies arent in a straight path, resulting in 0 damage.'
        }
    ],

    totalCost: 142000,

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 50,
        passivecDmg: 100,
        element: "Light",
        dotDuration: 0,
        support: "",
        customFollowUp: {
            chance: 25,
            dmgMult: 2.0,
            critGated: true,
            requireCrit: true,
            label: "Nuh Uh Follow-Up (200% Dmg on Crit)"
        }
    },

    // UPGRADES
    upgrades: [
        { dmg: 19200, spa: 4.0, range: 30, cost: 142000 }
    ],

    // PASSIVES
    passives: [
        {
            name: "I thought you would be stronger",
            desc: "If an enemy has less Health than 10x this unit's Damage:<br> Do a Full AOE Follow-up for 50% Damage.<br>Otherwise: Deal 2x Damage to the enemy."
        },
        {
            name: "Nuh Uh",
            desc: "On Crit: 25% chance to Follow-up for 200% Damage."
        },
        {
            name: "He is.....Only growing stronger?",
            passiveDmg: 60,
            passivecDmg: 100,
            desc: "<br>60 seconds after placement:<br>+50% Damage, +100% Crit Damage.<br>On Crit: 25% chance to trigger a Follow-up<br>for 100% Damage and apply Confusion for 4 seconds<br>(FUA has no separate DPS cooldown; Confusion cooldown: 20s)."
        }
    ],

    // ABILITIES
    ability: [
        {
            abilityName: "x2 Damage",
            desc: "Toggle: When enemy HP > 10x this unit's Damage, deal 2x Damage to them (\"I thought you would be stronger\").",
            noToggle: false,
            cooldown: 0,
            dmgMult: 0
        },
        {
            abilityName: "Spirit Blade Stab",
            desc: "Deal 250% Damage in a large Line AOE. Apply Stun for 5 seconds. Cooldown: 30s. (Accounts for DPS: Deals 250% Dmg every 30s, can crit).",
            cooldown: 30,
            dmgMult: 2.5,
            noToggle: true
        }
    ],

    // ETHEREALIZATION
    etherealization: []
});