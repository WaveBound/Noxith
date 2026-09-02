export const unit = {
    id: "lightninggodovercharged",
    name: "Lightning God (Overcharged)",
    image: "Units/Image/LightningGodOvercharged.png",
    ascend: 0,
    tiers: ["Secret"],
    update: "Summer",

    stats: {
        recommendedTrait: "Unbound",
        element: "Storm",
        archetype: "Magical",
        damage: "2,828",
        spa: "6",
        range: "25",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$44,450",
    },

    placement: [
        {
            upgrade: 0, damage: "536", spa: "5.6", range: "17", cost: "1,050",
            attackName: "Thunder Bird",
            aoe: "Circle 8",
            attackTime: "2.8",
            description: "Deals 1 tick in a Circle AoE (Size 8) over 2.8s"
        },
        {
            upgrade: 1, damage: "718", spa: "5.6", range: "17", cost: "1,650",
            attackName: "Thunder Bird",
            aoe: "Circle 8",
            attackTime: "2.8",
        },
        {
            upgrade: 2, damage: "871", spa: "5.5", range: "19", cost: "2,250",
            attackName: "Thunder Bird",
            aoe: "Circle 8",
            attackTime: "2.8",
        },
        {
            upgrade: 3, damage: "1,034", spa: "5.4", range: "20", cost: "2,750",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
            description: "Deals 4 ticks in a Line AoE (Size 8) over 3.33s"
        },
        {
            upgrade: 4, damage: "1,200", spa: "5.4", range: "21", cost: "3,500",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
        },
        {
            upgrade: 5, damage: "1,389", spa: "5.3", range: "21", cost: "4,000",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
        },
        {
            upgrade: 6, damage: "1,549", spa: "5.3", range: "22", cost: "4,750",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
        },
        {
            upgrade: 7, damage: "2,205", spa: "6.2", range: "24", cost: "5,000",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
        },
        {
            upgrade: 8, damage: "2,434", spa: "6.1", range: "24", cost: "6,000",
            attackName: "Lightning Lance",
            aoe: "Line 8",
            attackTime: "3.33",
        },
        {
            upgrade: 9, damage: "2,606", spa: "6.1", range: "25", cost: "6,500",
            attackName: "Heaven's Wrath",
            aoe: "Full",
            attackTime: "4.25",
            description: "Deals 1 tick in a Full AoE over 4.25s"
        },
        {
            upgrade: 10, damage: "2,828", spa: "6", range: "25", cost: "7,000",
            attackName: "Heaven's Wrath",
            aoe: "Full",
            attackTime: "4.25",
        },
    ],

    passives: [
        {
            name: "Storm Charge",
            desc: `This unit has <b>Voltage Meter</b>, starting at 0.<br>Applies <b>Electricity</b> on hit to the <b>10</b> strongest enemies.<br>Every time a <b>Stun</b> is activated from <b>Electricity</b>:<br>- Increase <b>Voltage Meter</b> by <b>1</b> (Capacity: <b>60</b>)<br><br>For each point in the meter:<br>- Increase this unit's <b>Electricity</b> damage dealt by <b>5%</b>`,
        },
        {
            name: "Thundercloud",
            desc: `At <b>25 Voltage Meter</b> stacks:<br>- Summon <b>Storm Cloud</b> within this unit's range every <b>10</b> seconds<br><b>Storm Cloud</b> will:<br>- Target a random enemy within this unit's range<br>- Deal <b>25%</b> of this unit's damage in <b>5</b> range<br>If <b>Storm Cloud</b> attacks an enemy without <b>Electricity</b> applied:<br>- Apply an additional stack of <b>Electricity</b>`,
        },
        {
            name: "Tempest Discharge",
            desc: `At <b>60 Voltage Meter</b> stacks:<br>- Summon a <b>Lightning Strike</b> at this unit's position<br>- Reset <b>Voltage Meter</b><br>On <b>Lightning Strike</b>:<br>- Deal <b>100%</b> of this unit's current damage and apply <b>Electricity</b> to all enemies in this unit's range<br>- Leave <b>Electric Residue</b> on the ground that will despawn after <b>8</b> seconds<br><b>Electric Residue</b> will:<br>- Keep <b>Electricity</b> permanently active on enemy until enemy has left range or it has despawned`,
        },
        {
            name: "Molten Gold",
            desc: `Every <b>10</b> seconds:<br>- Apply <b>Golden</b> to <b>2</b> enemies in range<br><b>Golden</b> will:<br>- Stun an enemy for <b>3</b> seconds<br>- Increase chain lightning hits from <b>Electricity</b> to an additional <b>2</b> enemies`,
        },
    ],

    abilities: [
        {
            name: "Stormseeker",
            desc: `On activation:<br>- Select position in this unit's range for <b>Storm Cloud</b> to target`,
            cooldown: "1s",
        },
    ],


    recommendedEquips: {
        unitEquip: "Storm Trident",
        equip1: "Magic Book",
        equip2: "Shinigami Sword",
    },

    statusEffects: [
        {
            name: "Electricity",
            icon: "electricity",
            effect: "Stuns enemy for 1 second, On stun chain lightning hits up to 3 enemies, dealing 0.15x damage.",
            cooldown: "0",
        },
        {
            name: "Stun",
            icon: "stun",
            effect: "Prevents all actions and movement for 2s",
            cooldown: "5s",
        },
    ],
};

export default unit;