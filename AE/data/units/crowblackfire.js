export const unit = {
    id: "crowblackfire",
    name: "Crow (Black Fire)",
    image: "Units/Image/CrowBlackFire.png",
    tiers: ["Secret"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Flame",
        archetype: "Magical",
        damage: "1,800",
        spa: "5.7",
        range: "29",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$78,450",
    },

    placement: [
        {
            upgrade: 0, damage: "231", spa: "5.3", range: "19", cost: "1,400",
            attackName: "Scorching Wave",
            aoe: "Circle 7",
            attackTime: "2.34",
            description: "Deals 1 tick in a Circle AoE (Size 7) over 2.34s"
        },
        {
            upgrade: 1, damage: "302", spa: "5.2", range: "19", cost: "2,700",
            attackName: "Scorching Wave",
            aoe: "Circle 7",
        },
        {
            upgrade: 2, damage: "432", spa: "5.2", range: "20", cost: "3,050",
            attackName: "Scorching Wave",
            aoe: "Circle 7",
        },
        {
            upgrade: 3, damage: "701", spa: "5.1", range: "21", cost: "4,700",
            attackName: "Scorching Wave",
            aoe: "Circle 7",
        },
        {
            upgrade: 4, damage: "945", spa: "6.4", range: "24", cost: "6,250",
            attackName: "Shadow Blaze",
            aoe: "Circle 10",
            attackTime: "3.75",
            description: "Deals 3 ticks in a Circle AoE (Size 10) over 3.75s"
        },
        {
            upgrade: 5, damage: "1,164", spa: "6.3", range: "24", cost: "7,500",
            attackName: "Shadow Blaze",
            aoe: "Circle 10",
        },
        {
            upgrade: 6, damage: "1,223", spa: "6.3", range: "24", cost: "8,250",
            attackName: "Shadow Blaze",
            aoe: "Circle 10",
        },
        {
            upgrade: 7, damage: "1,335", spa: "6.2", range: "26", cost: "9,350",
            attackName: "Hellfire Drop",
            aoe: "Circle 12",
        },
        {
            upgrade: 8, damage: "1,502", spa: "6.1", range: "28", cost: "10,250",
            attackName: "Hellfire Drop",
            aoe: "Circle 12",
        },
        {
            upgrade: 9, damage: "1,667", spa: "5.8", range: "28", cost: "12,250",
            attackName: "Wraith Slash",
            aoe: "Cone 65",
            attackTime: "2.7",
            description: "Deals 3 ticks in a Cone AoE (Size 65) over 2.7s"
        },
        {
            upgrade: 10, damage: "1,800", spa: "5.7", range: "29", cost: "12,750",
            attackName: "Wraith Slash",
            aoe: "Cone 65",
        },
    ],

    passives: [
        {
            name: "Crow's Illusion",
            desc: `On Regular Attack:<br>Apply Illusion for 12 seconds`,
        },
        {
            name: "Broken Mind",
            desc: `While an enemy is in Illusion state:<br>- Store all damage taken from this unit<br>When Illusion expires:<br>- Deal stored damage at 25% effectiveness in a small AoE (2 range)`,
        },
        {
            name: "Searing Flames",
            desc: `- Black Fire damage shields every tick<br>- Enemies with shields within this unit's range gain a stack of Black Fire`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Illusion Crow",
        equip1: "Shinigami Sword",
        equip2: "Magic Book",
    },

    statusEffects: [
        {
            name: "Illusion",
            icon: "illusion",
            effect: "Stores all damage dealt by Crow and explodes at 25% effectiveness when expired.",
            cooldown: "10s",
        },
        {
            name: "Black Fire",
            icon: "blackfire",
            effect: "Deals 2x damage in 12 ticks over 12s. Damages enemy shields every tick.",
            cooldown: "0s",
        },
    ],
};

export default unit;