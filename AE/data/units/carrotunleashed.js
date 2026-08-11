export const unit = {
    id: "carrotunleashed",
    name: "Carrot (Unleashed)",
    image: "Units/Image/CarrotUnleashed.png",
    ascend: 3,
    element: "Gale",
    archetype: "Physical",

    stats: {
        recommendedTrait: "Primordial",
        element: "Gale",
        archetype: "Physical",
        damage: "2,572",
        spa: "9.3",
        range: "25",
        critChance: "10%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$33,950",
    },

    placement: [
        {
            upgrade: 0, damage: "342", spa: "9.3", range: "19", cost: "950",
            attackName: "Spirit Blast",
            aoe: "Circle 7",
            attackTime: "3.28",
            description: "Deals 4 hits in a Circle AoE (Size 7) over 3.28s"
        },
        {
            upgrade: 1, damage: "477", spa: "9.3", range: "19", cost: "1,650",
            attackName: "Spirit Blast",
            aoe: "Circle 7",
            attackTime: "3.28",
        },
        {
            upgrade: 2, damage: "762", spa: "9.1", range: "20", cost: "2,250",
            attackName: "Spirit Blast",
            aoe: "Circle 7",
            attackTime: "3.28",
        },
        {
            upgrade: 3, damage: "1,043", spa: "8.7", range: "21", cost: "3,100",
            attackName: "Spirit Barrage",
        },
        {
            upgrade: 4, damage: "1,353", spa: "8.7", range: "22", cost: "5,000",
            attackName: "Spirit Barrage",
        },
        {
            upgrade: 5, damage: "1,865", spa: "8.3", range: "23", cost: "6,500",
            attackName: "Spirit Barrage",
        },
        {
            upgrade: 6, damage: "2,120", spa: "10", range: "23", cost: "7,000",
            attackName: "Spirit Burst",
            aoe: "Cone 65",
            attackTime: "4.9",
            description: "Deals 1 tick in a Cone AoE (Size 65) over 4.9s"
        },
        {
            upgrade: 7, damage: "2,385", spa: "9.5", range: "24", cost: "7,500",
            attackName: "Spirit Burst",
            aoe: "Cone 65",
            attackTime: "4.9",
        },
        {
            upgrade: 8, damage: "2,572", spa: "9.3", range: "25", cost: "7,500",
            attackName: "Spirit Burst",
            aoe: "Cone 65",
            attackTime: "4.9",
            ability: "Instant Relocation",
        },
    ],

    passives: [
        {
            name: "Battle Instinct",
            desc: `Every <b>4</b> non-<b>Critical Attacks</b>:<br>- Next <b>Regular Attack</b> will be a guaranteed <b>Critical Attack</b>`,
        },
        {
            name: "Limitless Warrior",
            desc: `This unit has <b>Fighting Spirit</b>, starting at 0.<br>On <b>Critical Attack</b>:<br>- Increase <b>Fighting Spirit</b> by <b>10</b><br>If this unit is <b>Debuffed</b>:<br>- Increase <b>Fighting Spirit</b> by <b>20</b><br>At <b>30 Fighting Spirit</b> stacks:<br>- Transform this unit into <b>Carrot Transformation</b><br>In <b>Carrot Transformation</b> form:<br>- Apply <b>Stagger</b> to all enemies in range<br>- This unit becomes immune to <b>Status Effects</b><br>- Increase Damage by <b>15%</b><br>- Increase Crit Damage by <b>20%</b><br>- <b>Fighting Spirit</b> will decrease by <b>1</b> every second<br>When <b>Fighting Spirit</b> is depleted:<br>- Transform back into base`,
        },
    ],

    abilities: [
        {
            name: "Instant Relocation",
            cooldown: "20s CD",
            unlocksUpgrade: 8,
            desc: `Select a unit on the map or a position within this unit's range to <b>Relocate</b> to for <b>15</b> seconds.<br>On <b>Relocate</b> to a unit:<br>- Immediately perform a <b>Follow-Up Attack</b> dealing <b>75%</b> of this unit's current damage (<b>125%</b> with Carrot's Gi)<br>- Trigger the selected unit to perform the same <b>Follow-Up Attack</b> dealing <b>75%</b> of the selected unit's current damage (<b>125%</b> with Carrot's Gi)<br>On <b>Relocate</b> to a position:<br>- Immediately perform a <b>Follow-Up Attack</b> dealing <b>75%</b> of this unit's current damage (<b>125%</b> with Carrot's Gi)<br>- Increase this unit's Damage by <b>50%</b> for <b>15</b> seconds`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Carrot's Gi",
        equip1: "",
        equip2: "",
    },
};

export default unit;
