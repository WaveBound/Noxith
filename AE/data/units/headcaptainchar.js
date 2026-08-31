export const unit = {
    id: "headcaptainchar",
    name: "Head Captain (Char)",
    image: "Units/Image/HeadCaptainChar.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Flame",
        archetype: "Physical",
        damage: "939",
        spa: "5.2",
        range: "26",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$31,000",
    },

    placement: [
        {
            upgrade: 0, damage: "130", spa: "5.6", range: "20", cost: "750",
            attackName: "Blazing Swing",
            aoe: "Circle 7",
            attackTime: "2.2",
            description: "Deal 1 tick in a Circle AoE (Size 7) over 2.2s",
        },
        {
            upgrade: 1, damage: "167", spa: "5.5", range: "20", cost: "1,300",
            attackName: "Blazing Swing",
            aoe: "Circle 7",
            attackTime: "2.2",
        },
        {
            upgrade: 2, damage: "271", spa: "5.5", range: "21", cost: "1,800",
            attackName: "Blazing Swing",
            aoe: "Circle 7",
            attackTime: "2.2",
        },
        {
            upgrade: 3, damage: "404", spa: "5.4", range: "22", cost: "2,400",
            attackName: "Blazing Swing",
            aoe: "Circle 7",
            attackTime: "2.2",
            description: "Unlocks Passive East",
        },
        {
            upgrade: 4, damage: "503", spa: "5.4", range: "23", cost: "3,300",
            attackName: "Blazing Swing",
            aoe: "Circle 7",
            attackTime: "2.2",
        },
        {
            upgrade: 5, damage: "620", spa: "5.3", range: "24", cost: "3,900",
            attackName: "Flaming Column",
            aoe: "Circle 11",
            attackTime: "3.35",
            description: "Deal 1 tick in a Circle AoE (Size 11) over 3.35s",
        },
        {
            upgrade: 6, damage: "744", spa: "5.3", range: "24", cost: "4,800",
            attackName: "Flaming Column",
            aoe: "Circle 11",
            attackTime: "3.35",
        },
        {
            upgrade: 7, damage: "868", spa: "5.2", range: "26", cost: "5,175",
            attackName: "Solar Ravine",
            aoe: "Cone 65",
            attackTime: "2.7",
            description: "Deal 1 tick in a Cone AoE (Size 65) over 2.7s<br>Unlocks Passive South",
        },
        {
            upgrade: 8, damage: "939", spa: "5.2", range: "26", cost: "7,000",
            attackName: "Solar Ravine",
            aoe: "Cone 65",
            attackTime: "2.7",
            description: "Unlocks Ability North",
        },
    ],

    passives: [
        {
            name: "Passive East",
            desc: `On Upgrade 3:<br>When an enemy enters this unit's range:<br>- Apply Burn<br>If the enemy entering this unit's range has a Shield:<br>- Apply an additional stack of Burn that can Pierce`,
        },
        {
            name: "Passive West",
            desc: `Burn applied by this unit can stack infinitely.<br>Burn deals 5% more damage for each stack of Burn on enemies within this unit's range (Capacity: 150%)`,
        },
        {
            name: "Passive South",
            desc: `On Upgrade 7:<br>On Takedown within this unit's range:<br>- Transform the enemy into a Skeleton (Capacity: 3)<br>Each Skeleton will act as a Path Trap:<br>- When touched by an enemy, deal 25% of this unit's current damage<br>- Explode and apply Burn to enemies within 3 range<br>Each Skeleton summoned will:<br>- Increase this unit's damage by 5%`,
        },
    ],

    abilities: [
        {
            name: "North",
            cooldown: "120s CD",
            type: "Per Player Cooldown",
            desc: `On activation:<br>- Deal 200% of this unit's current damage to all enemies in range<br>- Deal an additional 100% damage divided among all enemies in range`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Fiery Staff",
        equip1: "",
        equip2: "",
    },

    statusEffects: [
        {
            name: "Burn",
            icon: "burn",
            effect: "Deals 0.5x Damage in 4 ticks over 4s",
            cooldown: "0s",
        },
    ],
};

export default unit;
