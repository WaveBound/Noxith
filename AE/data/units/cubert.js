export const unit = {
    id: "cubert",
    name: "Cubert",
    image: "Units/Image/Cubert.png",
    ascend: 0,
    tiers: ["Exclusive"],

    stats: {
        recommendedTrait: "Primordial",
        element: "Hydro",
        archetype: "Magical",
        damage: "1,490",
        spa: "5.8",
        range: "23",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "3",
        totalCost: "$47,900",
    },

    placement: [
        {
            upgrade: 0, damage: "208", spa: "4", range: "18", cost: "950",
            attackName: "Briefcase Slash",
            aoe: "Line 6",
            attackTime: "1.85",
            description: "Deals 1 hit in a Line AoE (Size 6) over 1.85s"
        },
        {
            upgrade: 1, damage: "255", spa: "3.8", range: "19", cost: "1,500",
            attackName: "Briefcase Slash",
            aoe: "Line 6",
            attackTime: "1.85",
        },
        {
            upgrade: 2, damage: "494", spa: "6.4", range: "20", cost: "2,000",
            attackName: "Knife Surprise",
            aoe: "Circle 6",
            attackTime: "4.6",
            description: "Deals 4 hits in a Circle AoE (Size 6) over 4.6s"
        },
        {
            upgrade: 3, damage: "606", spa: "6.3", range: "20", cost: "2,450",
            attackName: "Knife Surprise",
            aoe: "Circle 6",
            attackTime: "4.6",
        },
        {
            upgrade: 4, damage: "720", spa: "6.3", range: "21", cost: "3,250",
            attackName: "Knife Surprise",
            aoe: "Circle 6",
            attackTime: "4.6",
        },
        {
            upgrade: 5, damage: "791", spa: "6.2", range: "21", cost: "4,750",
            attackName: "Lighthouse Barrage",
            aoe: "Circle 6.5",
            attackTime: "4.3",
            description: "Deals 4 hits in a Circle AoE (Size 6.5) over 4.3s"
        },
        {
            upgrade: 6, damage: "932", spa: "6.1", range: "22", cost: "7,250",
            attackName: "Lighthouse Barrage",
            aoe: "Circle 6.5",
            attackTime: "4.3",
        },
        {
            upgrade: 7, damage: "1,094", spa: "6.1", range: "22", cost: "8,000",
            attackName: "Lighthouse Barrage",
            aoe: "Circle 6.5",
            attackTime: "4.3",
        },
        {
            upgrade: 8, damage: "1,307", spa: "5.9", range: "23", cost: "8,750",
            attackName: "Lighthouse Beam",
            aoe: "Circle 7",
            attackTime: "2.95",
            description: "Deals 1 hit in a Circle AoE (Size 7) over 2.95s"
        },
        {
            upgrade: 9, damage: "1,490", spa: "5.8", range: "23", cost: "9,500",
            attackName: "Lighthouse Beam",
            aoe: "Circle 7",
            attackTime: "2.95",
        },
    ],

    passives: [
        {
            name: "Cubes",
            desc: `Every <b>10</b> seconds:<br>- Gain <b>1</b> ability charge (Capacity: <b>2</b>)<br><b>Cubert Cubes</b> will deal <b>35%</b> of this unit's current damage per attack`,
        },
        {
            name: "Cube Link",
            desc: `Attached <b>Cubert Cubes</b> will:<br>- Increase Damage by <b>5%</b><br>- Increase Range by <b>3%</b><br>Bonuses stack (additively) if <b>Cubert Cubes</b> are within range of eachother`,
        },
        {
            name: "Cube Overload",
            desc: `<b>Cubert Cubes</b> has <b>Cubert Meter</b>, starting at <b>0</b>.<br>On attached unit's <b>Regular Attack</b>:<br>- Increase <b>Cubert Meter</b> by <b>1</b><br>At <b>3 Cubert Meter</b> stacks:<br>- <b>Cubert Cubes</b> will explode applying <b>Stun</b> and dealing <b>15%</b> of this unit's current damage`,
        },
    ],

    abilities: [
        {
            name: "Cube Summon",
            cooldown: "1s CD",
            type: "PerUnit Cooldown",
            desc: `On activation:<br>- Select another unit on the map to summon a <b>Cubert Cube</b><br>- Decrease <b>Cubert Meter</b> by <b>1</b><br>- Only <b>2 Cubert Cubes</b> can be active at once (per unit).<br>- Only <b>6 Cubert Cubes</b> can be active at once (globally).`,
        },
    ],

    summons: {
        id: "cubertcubes",
        name: "Cubert Cubes",
        countPerPlacement: 2,
        baseDamageMultiplier: 0.35,
        baseSpa: 1,
        attackTime: 0.85,
        relicModifiers: []
    },


    recommendedEquips: {
        equip1: "Shinigami Sword",
        equip2: "Magic Book",
    },
};

export default unit;