unitDatabase.push({
    // IDENTITY
    id: "the_drink_super_rage",
    name: "The Drink (Super Rage)",
    img: "images/units/TheDrink.png",
    level: 70,
    placement: 3, // Max units placeable
    placementType: "Hybrid",
    role: "DPS",
    tags: ["Super Warrior", "Hero", "Sword"],

    // META (Build Guide tab)
    meta: {
        short: "Ruler",
        long: "Sacred/Duelist",
        note: "Powerful hybrid DPS that adapts to the battlefield via form switching."
    },
    bugs: [
        {
            name: 'Boss Damage Multiplier — Non-Functional',
            desc: 'Sword Form\'s "+100% Boss Damage" passive bonus is currently bugged and does nothing in-game. The multiplier is not applied to any damage calculations.'
        }
    ],

    totalCost: 68000, // Total gold cost to max
    defaultMode: 1, // Unit starts in Sword form (index 1)

    // BASE STATS
    stats: {
        spaCap: 4,
        crit: 0,
        cdmg: 150,
        element: "Water",
        customFollowUp: {
            chance: 20, // 100% / 5 attacks = 20% chance per attack
            dmgMult: 1.75, // 175% damage
            fuaAnimation: 6.5, // Spa cap / animation 4
            label: "Super Rage FUA (Every 5 Attacks)"
        }
    },

    // UPGRADES
    upgrades: [
        { dmg: 324, spa: 9, range: 18, cost: 3000 },
        { dmg: 804, spa: 9, range: 20, cost: 4000 },
        { dmg: 1900, spa: 9, range: 23, cost: 6000 },
        { dmg: 2900, spa: 9, range: 25, cost: 9000 },
        { dmg: 3800, spa: 9, range: 28, cost: 12000 },
        { dmg: 5400, spa: 9, range: 30, cost: 16000 },
        { dmg: 7200, spa: 9, range: 34, cost: 18000 }
    ],

    // PASSIVES
    passives: [
        {
            name: "Burning Attack",
            desc: "<br>This Passive is only active in Ki Form<br>On Attack:<br>• Apply 10% Slow for 4 seconds<br>On Takedown:<br>• Increase Slow by 2%<br>When Slow reaches 30%:<br>• Follow-up Attack for 55% Damage<br>• Apply Burn for 20% Damage over 4 ticks<br>• Apply Confusion for 3 seconds<br>• Reset the Slow ^ Buff<br>If this unit is in 'Super Rage':<br>• Slow will reset when reaching 40% instead"
        },
        {
            name: "Final Hope Slash",
            passiveDmg: 30, // Updated to reflect average of (10+20+30+40+50)/5 = 30%
            desc: "<br>This Passive is only active in Sword Form<br>Every Attack:<br>• +10% Damage<br>When +50% Damage is reached:<br>• Follow-up Attack for 150% Damage<br>• Reset the Damage ^ Buff<br>If this unit is in 'Super Rage':<br>• +100% Hyper Armor Damage during Follow-up<br>• Follow-up Damage increased to 175%"
        },
        {
            name: "Growing Rage",
            passiveDmg: 45,
            passiveSpa: 5,
            passiveRange: 10,
            desc: "<br>This unit will get stronger over time as he reaches new forms<br>Super Form<br>• Gained on this unit's final Upgrade<br>• +10% Damage<br>Beyond Super Form<br>• Gained after 150 Takedowns in Super Form<br>• +20% Damage<br>• +10% Range<br>• -5% SPA<br>Super Rage Form<br>• Gained after 200 Takedowns in Beyond Super Form<br>• +30% Damage<br>• +10% Range<br>• -5% SPA<br>When 'Super Rage Form' is reached:<br>When an enemy enters Range:<br>• +0.1% Damage<br>At +15% Damage:<br>• This unit gains Stun Immunity"
        },
        {
            name: "Form Change",
            desc: "<br>This unit can switch between Sword form and Ki form. The placement form is Ki form<br>Sword Form<br>• +100% Damage to Bosses<br>Ki Form<br>• +30% Range<br>• -20% SPA<br>• Gain Hybrid"
        }
    ],

    // MODES
    modes: [
        {
            name: "Ki-form",
            img: "images/units/TheDrink/Ki-form.png",
            desc: "Hybrid placement. Focuses on explosive energy output. Gains +30% Range and -20% SPA.",
            stats: {
                placementType: "Hybrid",
                passiveRange: 30,
                passiveSpa: -20
            }
        },
        {
            name: "Sword form",
            img: "images/units/TheDrink/Sword-form.png",
            desc: "Ground placement. Precision strikes with a divine blade. Gains +100% Boss Damage.",
            stats: {
                placementType: "Ground",
                bossDmg: 100
            }
        },
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "Loswer Takedowns needed for both Forms by 50.",
        "+10 Stat Points",
        "\"Ki Form and Sword\" Form Buffs increased.",
        "+10 Stat Points",
        "Increase Passive scaling for\"Ki Form and Sword Form\"."
    ]
});