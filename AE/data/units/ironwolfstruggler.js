export const unit = {
    id: "ironwolfstruggler",
    name: "Iron Wolf (Struggler)",
    image: "Units/Image/IronWolfStruggler.png",
    ascend: 0,
    tiers: ["Secret"],
    update: "2.5",

    stats: {
        recommendedTrait: "Unbound",
        element: "Dark",
        archetype: "Physical",
        damage: "3,231",
        spa: "6.9",
        range: "26",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "1",
        totalCost: "$57,350",
    },

    placement: [
        {
            upgrade: 0, damage: "358", spa: "4.5", range: "19", cost: "1,500",
            attackName: "False Cannon",
            aoe: "Cone 60",
            attackTime: "1.45",
            description: "Deals 1 tick in a Cone AoE (Size 60) over 1.45s",
        },
        {
            upgrade: 1, damage: "461", spa: "4.4", range: "20", cost: "1,850",
            attackName: "False Cannon",
            aoe: "Cone 60",
            attackTime: "1.45",
        },
        {
            upgrade: 2, damage: "585", spa: "4.4", range: "20", cost: "2,650",
            attackName: "False Cannon",
            aoe: "Cone 60",
            attackTime: "1.45",
        },
        {
            upgrade: 3, damage: "700", spa: "4.3", range: "21", cost: "3,250",
            attackName: "False Cannon",
            aoe: "Cone 60",
            attackTime: "1.45",
        },
        {
            upgrade: 4, damage: "844", spa: "4.3", range: "21", cost: "4,000",
            attackName: "False Cannon",
            aoe: "Cone 60",
            attackTime: "1.45",
        },
        {
            upgrade: 5, damage: "1,555", spa: "6.6", range: "22", cost: "5,500",
            attackName: "Sword Slam",
            aoe: "Cone 60",
            attackTime: "2.75",
            description: "Deals 1 tick in a Cone AoE (Size 60) over 2.75s",
        },
        {
            upgrade: 6, damage: "1,893", spa: "6.5", range: "23", cost: "6,000",
            attackName: "Sword Slam",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 7, damage: "2,350", spa: "6.5", range: "23", cost: "6,500",
            attackName: "Sword Slam",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 8, damage: "2,985", spa: "6.4", range: "24", cost: "7,500",
            attackName: "Sword Slam",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 9, damage: "2,529", spa: "7", range: "25", cost: "9,000",
            attackName: "Rampaging Impact",
            aoe: "Full",
            attackTime: "4.1",
            description: "Deals 6 ticks in a Full AoE over 4.1s",
        },
        {
            upgrade: 10, damage: "3,231", spa: "6.9", range: "26", cost: "9,600",
            attackName: "Rampaging Impact",
            aoe: "Full",
            attackTime: "4.1",
        },
    ],

    passives: [
        {
            name: "Sacrificial Brand",
            desc: `Each hit of an attack from this unit will apply <b>Bleed</b><br><br>Every hit from a <b>Regular Attack</b> from this unit will:<br>- Deal the remaining total damage of all <b>Bleed</b> stacks on the enemy instantly as <b>True Damage</b><br>- Remove all <b>Bleed</b> stacks on the enemy`,
        },
        {
            name: "Crimson Spill",
            desc: `When an enemy that have been inflicted with <b>Bleed</b> at least <b>1</b> time dies:<br>- Leave <b>1</b> <b>Crimson Spill</b> on the ground for <b>6</b> seconds<br><br><b>Crimson Spill</b> will apply <b>1</b> stack of <b>Bleed</b> every <b>3</b> seconds.<br>Only <b>2</b> non-permanent <b>Crimson Spill</b> may exist at a time.`,
        },
        {
            name: "Feeding Ground",
            desc: `If 2 <b>Crimson Spill</b> overlap, they will combine into 1 <b>Crimson Spill</b>.<br><br>Each time <b>Crimson Spill</b> combines:<br>- Add <b>4</b> seconds to its despawn timer<br>- Increase its radius by <b>15%</b><br><br>When a <b>Crimson Spill</b> combines <b>10</b> times:<br>- The <b>Crimson Spill</b> becomes permanent<br><br>Permanent <b>Crimson Spill</b>'s cannot combine.<br>Only <b>2</b> permanent <b>Crimson Spill</b> may exist at a time.`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Demonslayer",
        equip1: "Shinigami Sword",
        equip2: "Katana",
    },

    statusEffects: [
        {
            name: "Bleed",
            icon: "bleed",
            effect: "Deals 0.65x damage in 6 ticks over 6s.",
            cooldown: "0",
        },
    ],
};

export default unit;