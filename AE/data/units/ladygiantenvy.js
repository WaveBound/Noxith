export const unit = {
    id: "ladygiantenvy",
    name: "Lady Giant (Envy)",
    image: "Units/Image/LadyGiantEnvy.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Primordial",
        element: "Terra",
        archetype: "Physical",
        damage: "2,860",
        spa: "10.6",
        range: "23",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "4",
        totalCost: "$30,000",
    },

    placement: [
        {
            upgrade: 0, damage: "154", spa: "5.5", range: "17", cost: "850",
            attackName: "Shockwave",
            aoe: "Cone 60",
            attackTime: "2.75",
            description: "Deals 1 tick in a Cone AoE (Size 60) over 2.75s"
        },
        {
            upgrade: 1, damage: "345", spa: "5.3", range: "19", cost: "1,300",
            attackName: "Shockwave",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 2, damage: "602", spa: "5.2", range: "21", cost: "1,750",
            attackName: "Shockwave",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 3, damage: "708", spa: "5", range: "22", cost: "2,400",
            attackName: "Shockwave",
            aoe: "Cone 60",
            attackTime: "2.75",
        },
        {
            upgrade: 4, damage: "1,211", spa: "6.5", range: "24", cost: "2,650",
            attackName: "Earth Meteor",
            aoe: "Circle 10",
            attackTime: "3.25",
            description: "Deals 4 ticks in a Circle AoE (Size 10) over 3.25s"
        },
        {
            upgrade: 5, damage: "1,296", spa: "6.3", range: "25", cost: "3,050",
            attackName: "Earth Meteor",
            aoe: "Circle 10",
            attackTime: "3.25",
        },
        {
            upgrade: 6, damage: "1,373", spa: "6.2", range: "27", cost: "3,250",
            attackName: "Earth Meteor",
            aoe: "Circle 10",
            attackTime: "3.25",
        },
        {
            upgrade: 7, damage: "2,543", spa: "10.8", range: "23", cost: "6,250",
            attackName: "Mother Earth Catastrophe",
            aoe: "Circle 20",
            attackTime: "5.12",
            description: "Deals 1 tick in a Circle AoE (Size 20) over 5.12s"
        },
        {
            upgrade: 8, damage: "2,860", spa: "10.6", range: "23", cost: "8,500",
            attackName: "Mother Earth Catastrophe",
            aoe: "Circle 20",
            attackTime: "5.12",
        },
    ],

    passives: [
        {
            name: "Stone Wall",
            desc: `Summon a Stone Wall every 15 seconds. (Capacity: 2)<br>- In Base Form: Stone Wall will have 75% of this unit's current damage as health<br>- In Giant Form: Stone Wall will have 50% of this unit's current damage as health`,
        },
        {
            name: "Rock Storm",
            desc: `On Regular Attack:<br>- Gain 1 Rock Chunk<br>At 4 Rock Chunks:<br>- Unleash a Follow-Up Attack throwing a Rock at the closest enemy in range<br>In Base Form:<br>- Rock will deal 100% of this unit's current damage<br>In Giant Form:<br>- Rock will deal 125% of this unit's current damage`,
        },
    ],

    abilities: [
        {
            name: "Size Control: Giant",
            desc: `On activation:<br>- Lady Giant alters her size to Giant Form for the next 25s:<br>- Damage is increased by 125%<br>- SPA is increased by 25%<br>- Range is increased by 50%`,
            cooldown: "60s",
        },
    ],

    recommendedEquips: {
        unitEquip: "Boulder",
        equip1: "Shinigami Sword",
        equip2: "Warrior's Axe",
    },

    statusEffects: [],
};

export default unit;