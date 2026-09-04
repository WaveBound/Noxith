export const unit = {
    id: "sandalligator",
    name: "Sand (Alligator)",
    image: "Units/Image/SandAlligator.png",
    ascend: 3,
    tiers: ["Mythic"],
    update: "Summer",

    stats: {
        recommendedTrait: "Primordial",
        element: "Terra",
        archetype: "Physical",
        damage: "1,299",
        spa: "4.5",
        range: "24",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$47,000",
    },

    placement: [
        {
            upgrade: 0, damage: "166", spa: "5.3", range: "17", cost: "1,000",
            attackName: "Sand Slash",
            aoe: "Circle 6",
            attackTime: "3.08",
            description: "Deals 1 tick in a Circle AoE (Size 6) over 3.08s"
        },
        {
            upgrade: 1, damage: "242", spa: "5.2", range: "17", cost: "1,850",
            attackName: "Sand Slash",
            aoe: "Circle 6",
            attackTime: "3.08",
        },
        {
            upgrade: 2, damage: "358", spa: "5.2", range: "18", cost: "2,350",
            attackName: "Sand Slash",
            aoe: "Circle 6",
            attackTime: "3.08",
        },
        {
            upgrade: 3, damage: "543", spa: "5", range: "19", cost: "3,100",
            attackName: "Desert Slicer",
            aoe: "Line 9",
            attackTime: "2.88",
            description: "Deals 2 ticks in a Line AoE (Size 9) over 2.88s<br>Unlocks Passive Desert Storm"
        },
        {
            upgrade: 4, damage: "666", spa: "4.9", range: "19", cost: "4,700",
            attackName: "Desert Slicer",
            aoe: "Line 9",
            attackTime: "2.88",
        },
        {
            upgrade: 5, damage: "812", spa: "4.8", range: "20", cost: "5,850",
            attackName: "Desert Slicer",
            aoe: "Line 9",
            attackTime: "2.88",
        },
        {
            upgrade: 6, damage: "965", spa: "4.7", range: "21", cost: "6,850",
            attackName: "Desert Slicer",
            aoe: "Line 9",
            attackTime: "2.88",
        },
        {
            upgrade: 7, damage: "1,083", spa: "4.7", range: "21", cost: "8,050",
            attackName: "Desert Knives",
            aoe: "Cone 75",
            attackTime: "2.12",
            description: "Deals 1 tick in a Cone AoE (Size 75) over 2.12s<br>Unlocks Passive Golden Hook"
        },
        {
            upgrade: 8, damage: "1,198", spa: "4.6", range: "23", cost: "9,350",
            attackName: "Desert Knives",
            aoe: "Cone 75",
            attackTime: "2.12",
        },
        {
            upgrade: 9, damage: "1,299", spa: "4.5", range: "24", cost: "3,900",
            attackName: "Desert Knives",
            aoe: "Cone 75",
            attackTime: "2.12",
            description: "Unlocks Ability Ground Eruption"
        },
    ],

    passives: [
        {
            name: "Desert Storm",
            desc: `On Upgrade 3:<br><b>Desert Storm</b> appears at this unit's location<br><b>Desert Storm</b> will:<br>- Increase <b>5%</b> in size every <b>1</b> seconds (Capacity: <b>100%</b>)<br>- Apply <b>Sandstorm</b> to enemies inside<br>After <b>Desert Storm</b> has been at <b>100%</b> for <b>7</b> seconds:<br>- Reset <b>Desert Storm</b> size to <b>10%</b>`,
        },
        {
            name: "Golden Hook",
            desc: `On Upgrade 7:<br>This unit's <b>Poison</b> will:<br>- Deal <b>15%</b> increased damage per tick<br>If an enemy is inside <b>Desert Storm</b> or <b>Ground Eruption</b>:<br>- <b>Poison</b> will deal <b>25%</b> increased damage per tick (Capacity: <b>150%</b>)<br>When <b>Desert Storm</b> reaches <b>20%</b> range:<br>- Apply extra stack of <b>Poison</b> while the enemy remains inside`,
        },
    ],

    abilities: [
        {
            name: "Ground Eruption",
            desc: `On Upgrade 9:<br>On activation:<br>- <b>Desert Storm</b> will increase <b>10%</b> in size every <b>1</b> seconds (Capacity: <b>100%</b>)<br>This unit will not <b>Attack</b> whilst this ability is active.<br>If <b>Ground Eruption</b> is re-triggered before <b>100%</b> range is reached:<br>- <b>Slow</b> enemies in <b>Ground Eruption</b> by <b>65%</b><br>- Deal <b>125%</b> of this unit's current damage to all enemies in range<br>If <b>Ground Eruption</b> reaches <b>100%</b> range:<br>- <b>Stun</b> enemies in <b>Ground Eruption</b> for <b>5</b> seconds<br>- Deal <b>200%</b> of this unit's current damage to all enemies in range`,
            cooldown: "100s",
        },
    ],

    recommendedEquips: {
        unitEquip: "Poison Hook",
        equip1: "Shinigami Sword",
        equip2: "Warrior's axe",
    },

    statusEffects: [
        {
            name: "Sandstorm",
            icon: "sandstorm",
            effect: "Reduces movement speed by 0.2 for 5s.",
            cooldown: "5s",
        },
        {
            name: "Poison",
            icon: "poison",
            effect: "Deals 0.3x damage in 6 ticks over 6s. Additionally deal 0.5x damage every tick",
            cooldown: "0s",
        },
    ],
};

export default unit;