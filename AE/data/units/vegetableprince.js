export const unit = {
    id: "vegetableprince",
    name: "Vegetable (Prince)",
    image: "Units/Image/VegetablePrince.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Light",
        archetype: "Magical",
        damage: "1,932",
        spa: "5.5",
        range: "28",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$48,750",
    },

    placement: [
        {
            upgrade: 0, damage: "267", spa: "6.3", range: "17", cost: "1,650",
            attackName: "Warrior's Strike",
            aoe: "Circle 6",
            attackTime: "5.17",
            description: "Deals 2 hits in a Circle AoE (Size 6) over 5.17s"
        },
        {
            upgrade: 1, damage: "419", spa: "6.3", range: "18", cost: "2,150",
            attackName: "Warrior's Strike",
            aoe: "Circle 6",
            attackTime: "5.17",
        },
        {
            upgrade: 2, damage: "621", spa: "6.2", range: "20", cost: "2,700",
            attackName: "Warrior's Strike",
            aoe: "Circle 6",
            attackTime: "5.17",
        },
        {
            upgrade: 3, damage: "862", spa: "6.2", range: "21", cost: "3,500",
            attackName: "Warrior's Strike",
            aoe: "Circle 6",
            attackTime: "5.17",
        },
        {
            upgrade: 4, damage: "1,031", spa: "5.9", range: "22", cost: "4,000",
            attackName: "Blue Flash",
            aoe: "Circle 8",
            attackTime: "5.44",
            description: "Deals 4 ticks in a Circle AoE (Size 8) over 5.44s"
        },
        {
            upgrade: 5, damage: "1,255", spa: "5.8", range: "23", cost: "4,500",
            attackName: "Blue Flash",
            aoe: "Circle 8",
            attackTime: "5.44",
        },
        {
            upgrade: 6, damage: "1,401", spa: "5.8", range: "23", cost: "5,750",
            attackName: "Blue Flash",
            aoe: "Circle 8",
            attackTime: "5.44",
        },
        {
            upgrade: 7, damage: "1,654", spa: "5.7", range: "24", cost: "6,500",
            attackName: "Blue Flash",
            aoe: "Circle 8",
            attackTime: "5.44",
        },
        {
            upgrade: 8, damage: "1,779", spa: "5.5", range: "26", cost: "8,000",
            attackName: "Super Energy Flash",
            aoe: "Circle 9",
            attackTime: "4.61",
            description: "Deals 4 ticks in a Circle AoE (Size 9) over 4.61s"
        },
        {
            upgrade: 9, damage: "1,932", spa: "5.5", range: "28", cost: "10,000",
            attackName: "Super Energy Flash",
            aoe: "Circle 9",
            attackTime: "4.61",
        },
    ],

    passives: [
        {
            name: "Prince's Pursuit",
            desc: `Enemies that leave this unit's range will take 10% of its current damage.`,
        },
        {
            name: "Royal Rivalry",
            desc: `For every Regular Attack from another unit in this unit's range:<br>- Increase this unit's damage by 5% (Capacity: 50%)<br>For every Critical Attack from another unit in this unit's range:<br>- Increase this unit's critical chance by 10% (Capacity: 50%)<br>For every Follow-Up Attack from another unit in this unit's range:<br>- Increase this unit's critical damage by 10% (Capacity: 30%)`,
        },
        {
            name: "Awakened Pride",
            desc: `This unit has Patience, starting at 100.<br>On Takedowns within this unit's range:<br>- Decrease Patience by 5<br>If another unit Transforms within this unit's range:<br>- Instantly empty Patience<br>- Increase the transformed unit's damage by 15%<br>When Patience is emptied:<br>- Transform this unit into Vegetable Transformation<br>- Increase Damage by 15%<br>- Increase Critical Damage by 35%<br>- Increase Critical Chance by 20%`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Royal Gi",
        equip1: "Shinigami Sword",
        equip2: "Magic Book",
    },
};

export default unit;
