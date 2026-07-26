// --- START OF FILE _template.js ---

export const unit = {
    id: "unit-XX",
    name: "Unit Name",
    image: "Units/Image/UnitName.png",

    stats: {
        recommendedTrait: "Trait Name",
        element: "Neutral",
        archetype: "Magical",
        damage: "0",
        spa: "0",
        range: "0",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "1",
        totalCost: "$0",
    },

    placement: [
        { upgrade: 1, damage: "0", spa: "0", range: "0", cost: "$0", attackName: "Attack Name", description: "Attack description goes here." },
        { upgrade: 2, damage: "0", spa: "0", range: "0", cost: "$0", attackName: "Attack Name", description: "Attack description goes here." },
        { upgrade: 3, damage: "0", spa: "0", range: "0", cost: "$0", attackName: "Attack Name", description: "Attack description goes here." },
        { upgrade: 4, damage: "0", spa: "0", range: "0", cost: "$0", attackName: "Attack Name", description: "Attack description goes here." },
    ],

    passives: [
        { name: "Passive Name", desc: "Description of passive" },
    ],

    summons: {
        name: "Summon Name",
        countPerPlacement: 3,
        baseDamageMultiplier: 0.15,
        relicModifiers: [
            {
                relicName: "Unit Equip Name",
                damageMultiplierOverride: 0.25
            }
        ]
    },

    recommendedEquips: {
        unitEquip: "Unit Equip Name",
        equip1: "Equip 1 Name",
        equip2: "Equip 2 Name",
    },
};

export default unit;