export const unit = {
    id: "elfmageunleashed",
    name: "Elf Mage (Unleashed)",
    image: "Units/Image/ElfMageUnleashed.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Storm",
        archetype: "Magical",
        damage: "3,000",
        spa: "9.2",
        range: "25",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "3",
        totalCost: "$42,650",
    },

    placement: [
        {
            upgrade: 0, damage: "373", spa: "6.5", range: "18", cost: "1,000",
            attackName: "Reality Drift",
            aoe: "Circle 7",
            attackTime: "3.7",
            description: "Deal 2 ticks in a Circle AoE (Size 7) over 3.7s"
        },
        {
            upgrade: 1, damage: "584", spa: "6.4", range: "19", cost: "1,550",
            attackName: "Reality Drift",
            aoe: "Circle 7",
            attackTime: "3.7",
        },
        {
            upgrade: 2, damage: "687", spa: "6.4", range: "21", cost: "2,500",
            attackName: "Reality Drift",
            aoe: "Circle 7",
            attackTime: "3.7",
        },
        {
            upgrade: 3, damage: "770", spa: "6.2", range: "24", cost: "3,250",
            attackName: "Reality Drift",
            aoe: "Circle 7",
            attackTime: "3.7",
        },
        {
            upgrade: 4, damage: "842", spa: "6", range: "25", cost: "4,750",
            attackName: "Reality Drift",
            aoe: "Circle 7",
            attackTime: "3.7",
        },
        {
            upgrade: 5, damage: "1,418", spa: "5.8", range: "27", cost: "5,850",
            attackName: "Reality Drift",
            aoe: "Circle 9",
            attackTime: "3.7",
        },
        {
            upgrade: 6, damage: "1,482", spa: "5.7", range: "29", cost: "6,250",
            attackName: "Reality Drift",
            aoe: "Circle 9",
            attackTime: "3.7",
        },
        {
            upgrade: 7, damage: "2,775", spa: "9.5", range: "24", cost: "7,500",
            attackName: "Mana Release",
            aoe: "Full",
            attackTime: "5.43",
            description: "Deal 3 ticks in a Full AoE over 5.43s"
        },
        {
            upgrade: 8, damage: "3,000", spa: "9.2", range: "25", cost: "10,000",
            attackName: "Mana Release",
            aoe: "Full",
            attackTime: "5.43",
        },
    ],

    passives: [
        {
            name: "Arcane Magic",
            desc: `On Regular Attack:<br>- Gain 1 Arcane Charge (Capacity: 7)<br>- Charges reset after exceeding capacity`,
        },
        {
            name: "Overcharge",
            desc: `On Charge Reset:<br>- Increase Arcane Spells damage by 5% (Capacity: 5)`,
        },
        {
            name: "Arcane Spells",
            desc: `Arcane Spells are considered Follow-Up Attacks<br>At 3 Charges, cast Old Magic<br>- Line AoE at 100% current damage<br>At 5 Charges, cast Eruption<br>- Circle AoE at 100% current damage, and inflict Mana Burn<br>At 7 Charges, cast Storm<br>- Full AoE at 100% current damage`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Elven Battle Staff",
        equip1: "Magic Book",
        equip2: "Shinigami Sword",
    },
};

export default unit;