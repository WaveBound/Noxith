export const unit = {
    id: "darkmagesovereign",
    name: "Dark Mage (Sovereign)",
    image: "Units/Image/DarkMageSovereign.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Hydro",
        archetype: "Magical",
        damage: "1,822",
        spa: "5.4",
        range: "26",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$65,100",
    },

    placement: [
        {
            upgrade: 0, damage: "280", spa: "6", range: "22", cost: "1,500",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
            description: "Deals 1 tick in a Circle AoE (Size 12) over 2.5s"
        },
        {
            upgrade: 1, damage: "415", spa: "5.8", range: "22", cost: "2,400",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 2, damage: "675", spa: "5.8", range: "23", cost: "3,550",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 3, damage: "864", spa: "5.7", range: "24", cost: "4,200",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 4, damage: "1,034", spa: "5.6", range: "24", cost: "6,950",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 5, damage: "1,144", spa: "5.6", range: "25", cost: "7,750",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 6, damage: "1,393", spa: "5.5", range: "25", cost: "11,750",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 7, damage: "1,456", spa: "5.4", range: "26", cost: "13,250",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
        {
            upgrade: 8, damage: "1,822", spa: "5.4", range: "26", cost: "13,750",
            attackName: "Elemental Weapons",
            aoe: "Circle 12",
            attackTime: "2.5",
        },
    ],

    passives: [
        {
            name: "Magic Cycle",
            desc: `After 8 Regular Attacks, this unit will cycle:<br>- Attack 1 (Ice Magic) - Circle AoE (Size: 12)<br>- Attack 2 (Lightning Magic) - Cone AoE (Size: 55)`,
        },
        {
            name: "Lightning Orbs",
            desc: `On switching to Lightning Magic:<br>- Summon an Arc of Lightning on the path inside of this unit's range<br>- Enemies that are touching Arc of Lightning will take 25% of this unit's current damage every 1 second`,
        },
        {
            name: "Ice Barrage",
            desc: `On switching to Ice Magic:<br>- This unit gains Freeze on attack<br>On Regular Attack:<br>- Gain 1 stack of Frostbite per enemy hit (Capacity: 20)<br>At 20 Frostbite stacks:<br>- This unit's next attack against enemies inflicted with Freeze will shatter, unfreezing them and dealing 10% additional damage in a small AoE (5 range)`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Dark Scepter",
        equip1: "Shinigami Sword",
        equip2: "Magic Book",
    },

    statusEffects: [
        {
            name: "Freeze",
            icon: "freeze",
            effect: "Freezes enemies hit during Ice Magic cycle",
            cooldown: "5s",
        },
    ],
};

export default unit;