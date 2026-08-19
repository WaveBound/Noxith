export const unit = {
    id: "thedrinkjuicebox",
    name: "The Drink (Juicebox)",
    image: "Units/Image/TheDrinkJuicebox.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Primordial",
        element: "Hydro",
        archetype: "Physical",
        damage: "1,372",
        spa: "5.2",
        range: "24",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "3",
        totalCost: "$33,950",
    },

    placement: [
        {
            upgrade: 0, damage: "235", spa: "5.6", range: "17", cost: "1,200",
            attackName: "Energy Bomb",
            aoe: "Circle 8.5",
            attackTime: "3.4",
            description: "Deals 1 hit in a Circle AoE (Size 8.5) over 3.4s"
        },
        {
            upgrade: 1, damage: "397", spa: "5.5", range: "19", cost: "2,000",
            attackName: "Energy Bomb",
            aoe: "Circle 8.5",
            attackTime: "3.4",
        },
        {
            upgrade: 2, damage: "631", spa: "5.5", range: "21", cost: "2,750",
            attackName: "Energy Bullets",
            aoe: "Circle 8.5",
            attackTime: "4",
            description: "Deals 4 hits in a Circle AoE (Size 8.5) over 4s"
        },
        {
            upgrade: 3, damage: "779", spa: "5.4", range: "21", cost: "3,500",
            attackName: "Energy Bullets",
            aoe: "Circle 8.5",
            attackTime: "4",
        },
        {
            upgrade: 4, damage: "930", spa: "5.4", range: "22", cost: "4,250",
            attackName: "Energy Bullets",
            aoe: "Circle 8.5",
            attackTime: "4",
        },
        {
            upgrade: 5, damage: "1,154", spa: "5.3", range: "23", cost: "5,250",
            attackName: "Slashing Barrage",
            aoe: "Circle 9.5",
            attackTime: "3.5",
            description: "Deals 1 tick in a Circle AoE (Size 9.5) over 3.5s"
        },
        {
            upgrade: 6, damage: "1,286", spa: "5.3", range: "24", cost: "6,500",
            attackName: "Slashing Barrage",
            aoe: "Circle 9.5",
            attackTime: "3.5",
        },
        {
            upgrade: 7, damage: "1,372", spa: "5.2", range: "24", cost: "8,500",
            attackName: "Slashing Barrage",
            aoe: "Circle 9.5",
            attackTime: "3.5",
            ability: "Golden Ascension",
        },
    ],

    passives: [
        {
            name: "Precision Slash",
            desc: `Every <b>6 Regular Attack</b>:<br>- Inflict enemies with <b>The Drink Mark</b> for <b>15</b> seconds<br><b>The Drink Mark</b> will:<br>- Increase all <b>Follow-Up Attack</b> damage by <b>10%</b><br>- Apply a <b>Physical</b> weakness at <b>10%</b>`,
        },
        {
            name: "Quick Assist",
            desc: `When a <b>Follow-Up Attack</b> happens in this unit's range (Cooldown: <b>8</b>s):<br>- <b>Follow-Up Attack</b> at <b>150%</b> of this unit's current damage<br>- Apply <b>Precision Slash</b>`,
        },
        {
            name: "Perfected Strikes",
            desc: `On applying <b>The Drink Mark</b> during <b>The Drink Transformation</b>:<br>- All <b>Follow-Up Attacks</b> from this unit will critically strike and deal <b>15%</b> increased critical damage`,
        },
    ],

    abilities: [
        {
            name: "Golden Ascension",
            cooldown: "120s CD",
            unlocksUpgrade: 7,
            desc: `On activation:<br>- This unit will transform into <b>The Drink Transformation</b> for <b>60</b> seconds<br>- Decreases <b>Precision Slash</b> attacks required by <b>1</b><br>- Increases <b>Quick Assist Follow-Up Attack</b> damage by <b>15%</b><br>- Decrease SPA by <b>10%</b><br>- Increase RNG by <b>10%</b>`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Pointy Straw",
        equip1: "Shinigami Sword",
        equip2: "Warrior Pole",
    },

    statusEffects: [
        {
            name: "The Drink Mark",
            icon: "thedrinkmark",
            effect: "Inflicts enemies with The Drink Mark for 15s. Increases Follow-Up Attack damage by 10% and applies Physical weakness at 10%.",
            cooldown: "10s",
        },
    ],
};

export default unit;
