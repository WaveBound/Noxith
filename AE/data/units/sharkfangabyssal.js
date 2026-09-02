export const unit = {
    id: "sharkfangabyssal",
    name: "Sharkfang (Abyssal)",
    image: "Units/Image/SharkfangAbyssal.png",
    ascend: 3,
    tiers: ["Mythic"],
    update: "Summer",

    stats: {
        recommendedTrait: "Unbound",
        element: "Hydro",
        archetype: "Physical",
        damage: "1,567",
        spa: "5.6",
        range: "25",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$37,000",
    },

    placement: [
        {
            upgrade: 0, damage: "245", spa: "6.2", range: "20", cost: "900",
            attackName: "Water Whip",
            aoe: "Line 8",
            attackTime: "2.95",
            description: "Deals 1 tick in a Line AoE (Size 8) over 2.95s"
        },
        {
            upgrade: 1, damage: "406", spa: "6.1", range: "20", cost: "1,550",
            attackName: "Water Whip",
            aoe: "Line 8",
            attackTime: "2.95",
        },
        {
            upgrade: 2, damage: "552", spa: "6", range: "21", cost: "2,150",
            attackName: "Water Whip",
            aoe: "Line 8",
            attackTime: "2.95",
        },
        {
            upgrade: 3, damage: "735", spa: "6", range: "22", cost: "2,900",
            attackName: "Water Whip",
            aoe: "Line 8",
            attackTime: "2.95",
        },
        {
            upgrade: 4, damage: "922", spa: "5.9", range: "22", cost: "3,950",
            attackName: "Water Blast",
            aoe: "Circle 8",
            attackTime: "3.87",
            description: "Deals 1 tick in a Circle AoE (Size 8) over 3.87s"
        },
        {
            upgrade: 5, damage: "1,087", spa: "5.8", range: "23", cost: "4,650",
            attackName: "Water Blast",
            aoe: "Circle 8",
            attackTime: "3.87",
        },
        {
            upgrade: 6, damage: "1,243", spa: "5.8", range: "24", cost: "5,700",
            attackName: "Water Blast",
            aoe: "Circle 8",
            attackTime: "3.87",
        },
        {
            upgrade: 7, damage: "1,398", spa: "5.6", range: "25", cost: "6,850",
            attackName: "Blasting Downpour",
            aoe: "Circle 10.5",
            attackTime: "3.3",
            description: "Deals 1 tick in a Circle AoE (Size 10.5) over 3.3s"
        },
        {
            upgrade: 8, damage: "1,567", spa: "5.6", range: "25", cost: "8,350",
            attackName: "Blasting Downpour",
            aoe: "Circle 10.5",
            attackTime: "3.3",
        },
    ],

    passives: [
        {
            name: "Waterfall",
            desc: `Every <b>12</b> seconds:<br>- Summon <b>Waterfall</b> at the end of this unit's range moving towards spawn<br><b>Waterfall</b> will:<br>- <b>Slow</b> enemies hit by <b>35%</b><br>- Deal <b>15%</b> of this unit's current damage`,
        },
        {
            name: "Boiling Waters",
            desc: `When <b>Waterfall</b> or <b>Tidal Wave</b> despawn:<br>- Summon <b>Vapor Cloud</b> at that location for <b>5</b> seconds<br>While an enemy is inside of <b>Vapor Cloud</b>:<br>- Apply <b>Burn</b><br>- <b>Burn</b> from <b>Vapor Cloud</b> can stack<br>- Deal <b>15%</b> of this unit's current damage every <b>1</b> seconds`,
        },
    ],

    abilities: [
        {
            name: "Tidal Wave",
            desc: `On activation:<br>- Summon <b>2</b> instances of <b>Tidal Wave</b> from the end of this unit's range moving towards enemy spawn<br><b>Tidal Wave</b> will:<br>- Apply <b>Rewind</b> to enemies hit for <b>10</b> distance<br>- Deal <b>50%</b> of this unit's current damage`,
            cooldown: "25s",
        },
    ],

    recommendedEquips: {
        unitEquip: "Tideblade",
        equip1: "Shinigami Sword",
        equip2: "Katana",
    },

    statusEffects: [
        {
            name: "Slow",
            icon: "slow",
            effect: "Slows enemies hit by Waterfall by 35%.",
            cooldown: "5s",
        },
        {
            name: "Burn",
            icon: "burn",
            effect: "Deals 0.55x Damage in 4 ticks over 4s",
            cooldown: "0",
        },
        {
            name: "Rewind",
            icon: "rewind",
            effect: "Pushes back enemies hit by 10 distance towards spawn.",
            cooldown: "10s",
        },
    ],
};

export default unit;