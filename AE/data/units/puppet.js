export const unit = {
    id: "puppet",
    name: "Puppet (Telekinetic)",
    image: "Units/Image/PuppetTelekinetic.png",
    ascend: 3,

    stats: {
        recommendedTrait: "Unbound",
        element: "Light",
        archetype: "Psychic",
        damage: "5,093",
        spa: "9",
        range: "27",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$57,000",
    },

    placement: [
        {
            upgrade: 0, damage: "334", spa: "5.5", range: "20", cost: "1,000",
            attackName: "Overdrive Edition",
            aoe: "Circle 5",
            attackTime: "2.65",
            description: "Deals 3 ticks in a Circle AoE (Size 5) over 2.65s"
        },
        {
            upgrade: 1, damage: "651", spa: "5.5", range: "21", cost: "2,250",
            attackName: "Overdrive Edition",
            aoe: "Circle 5",
            attackTime: "2.65",
        },
        {
            upgrade: 2, damage: "741", spa: "4.2", range: "22", cost: "2,750",
            attackName: "Fearful Barrage",
            aoe: "Circle 6",
            attackTime: "2.98",
            description: "Deals 3 ticks in a Circle AoE (Size 6) over 2.98s"
        },
        {
            upgrade: 3, damage: "1,129", spa: "4", range: "23", cost: "3,250",
            attackName: "Fearful Barrage",
            aoe: "Circle 6",
            attackTime: "2.98",
        },
        {
            upgrade: 4, damage: "1,953", spa: "6.5", range: "24", cost: "3,750",
            attackName: "Gatling Jack",
            aoe: "Circle 8",
            attackTime: "3.11",
            description: "Deals 3 ticks in a Circle AoE (Size 8) over 3.11s"
        },
        {
            upgrade: 5, damage: "2,790", spa: "6.5", range: "24", cost: "6,250",
            attackName: "Gatling Jack",
            aoe: "Circle 8",
            attackTime: "3.11",
        },
        {
            upgrade: 6, damage: "3,065", spa: "6.3", range: "24", cost: "9,750",
            attackName: "Gatling Jack",
            aoe: "Circle 8",
            attackTime: "3.11",
        },
        {
            upgrade: 7, damage: "4,942", spa: "9.3", range: "26", cost: "12,250",
            attackName: "Rewrite Light",
            aoe: "Circle 8.5",
            attackTime: "3.8",
            description: "Deals 3 ticks in a Circle AoE (Size 8.5) over 3.8s"
        },
        {
            upgrade: 8, damage: "5,093", spa: "9", range: "27", cost: "15,750",
            attackName: "Rewrite Light",
            aoe: "Circle 8.5",
            attackTime: "3.8",
            ability: "Complete Control",
        },
    ],

    passives: [
        {
            name: "Marionette's Gaze",
            desc: `Every 15 seconds:<br>- Inflict Puppet Mark on the strongest enemy in this unit's range without Puppet Mark applied for 15 seconds<br>Puppet Marked enemies receive 20% increased incoming damage`,
        },
        {
            name: "Puppet Creation",
            desc: `When an enemy with Puppet Mark from this unit dies:<br>- Summon a Doll in front of the killed enemy (Capacity: 1)<br>- Dolls will have 150% of this unit's current damage as health`,
        },
    ],

    abilities: [
        {
            name: "Complete Control",
            cooldown: "30s CD",
            type: "Global Cooldown",
            unlocksUpgrade: 8,
            desc: `On activation:<br>- Rewind all enemies in range for 2 seconds`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Calamity's Eye",
        equip1: "Shinigami Sword",
        equip2: "Bamboo Bottle",
    },

    statusEffects: [
        {
            name: "Puppet Mark",
            icon: "puppetmark",
            effect: "Inflicts enemies with Puppet Mark for 15 seconds. Puppet Marked enemies receive 20% increased incoming damage. When an enemy with Puppet Mark dies, summons a Doll at their location.",
            cooldown: "15s",
        },
        {
            name: "Rewind",
            icon: "rewind",
            effect: "Rewinds all enemies in range for 2 seconds on ability activation.",
            cooldown: "30s",
        },
    ],
};

export default unit;