export const unit = {
    id: "cursestudenttruelove",
    name: "Cursed Student (True Love)",
    image: "Units/Image/CursedStudentTrueLove.png",
    ascend: 3,

    stats: {
        recommendedTrait: "Primordial",
        element: "Dark",
        archetype: "Physical",
        damage: "1,482",
        spa: "7",
        range: "27",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$51,850",
    },

    placement: [
        {
            upgrade: 0, damage: "229", spa: "5", range: "20", cost: "1,250",
            attackName: "Slash",
            aoe: "Circle 6",
            attackTime: "2.01",
            description: "Deal 1 tick in a Circle AoE (Size 6) over 2.01s"
        },
        {
            upgrade: 1, damage: "335", spa: "5", range: "20", cost: "3,000",
            attackName: "Slash",
            aoe: "Circle 6",
            attackTime: "2.01",
        },
        {
            upgrade: 2, damage: "559", spa: "5.5", range: "21", cost: "3,600",
            attackName: "Black Flash",
            aoe: "Circle 9",
            attackTime: "2.4",
            description: "Deal 1 tick in a Circle AoE (Size 9) over 2.4s"
        },
        {
            upgrade: 3, damage: "741", spa: "5.3", range: "22", cost: "3,750",
            attackName: "Black Flash",
            aoe: "Circle 9",
            attackTime: "2.4",
        },
        {
            upgrade: 4, damage: "888", spa: "6", range: "24", cost: "4,750",
            attackName: "Die",
            aoe: "Cone 60",
            attackTime: "2",
            description: "Deal 2s tick in a Circle AoE (Size 9) over 2.4s"
        },
        {
            upgrade: 5, damage: "938", spa: "5.7", range: "25", cost: "6,250",
            attackName: "Die",
            aoe: "Cone 60",
            attackTime: "2",
        },
        {
            upgrade: 6, damage: "1,079", spa: "5.5", range: "26", cost: "7,750",
            attackName: "Die",
            aoe: "Cone 60",
            attackTime: "2",
        },
        {
            upgrade: 7, damage: "1,370", spa: "7", range: "27", cost: "9,750",
            attackName: "True Love",
            aoe: "Line 10",
            attackTime: "2.77",
            description: "Deal 3 ticks in a Line AoE (Size 10) over 2.77s"
        },
        {
            upgrade: 8, damage: "1,484", spa: "7", range: "27", cost: "11,750",
            attackName: "True Love",
            aoe: "Line 10",
            attackTime: "2.77",
        },
    ],

    passives: [
        {
            name: "Cursed Mimicry",
            desc: `Every 3 Regular Attack:<br>- Follow-Up with a copy of an attack of the closest unit in range<br>- The Follow-Up Attack will deal:<br>100% of this unit's current damage, plus 40% of the closest unit's current damage<br>On New Attack:<br>- The Follow-Up Attack percentage of closest unit is increased by 20%`,
        },
        {
            name: "Spirit Bats",
            desc: `Every 20 total stacks of Bleed in this unit's range:<br>- Summon a Bat Spirit at this unit's position (Capacity: 3)<br>- Bat Spirits will deal 15% of this unit's current damage per attack<br>- Bat Spirits despawn after 3 attacks`,
        },
    ],

    summons: {
        id: "batspirits",
        name: "Bat Spirits",
        countPerPlacement: 3,
        baseDamageMultiplier: 0.15,
        noShinigamiPassive: true,
        relicModifiers: [
            {
                relicName: "Promise Ring",
                damageMultiplierOverride: 0.25
            }
        ]
    },

    recommendedEquips: {
        unitEquip: "Promise Ring",
        equip1: "Shinigami Sword",
        equip2: "Red Finger",
    },

    statusEffects: [
        {
            name: "Bleed",
            icon: "bleed",
            effect: "Deals 0.65x Damage in 6 ticks over 6s",
            cooldown: "0s",
        },
    ],
};

export default unit;