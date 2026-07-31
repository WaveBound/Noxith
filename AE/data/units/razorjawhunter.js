export const unit = {
    id: "razorjawhunter",
    name: "Razorjaw (Hunter)",
    image: "Units/Image/RazorJawHunter.png",
    tiers: ["Mythic"],
    ascend: 3,

    stats: {
        recommendedTrait: "Unbound",
        element: "Neutral",
        archetype: "Physical",
        damage: "1,499",
        spa: "4.7",
        range: "25",
        critChance: "15%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$43,300",
    },

    placement: [
        {
            upgrade: 0, damage: "238", spa: "5.4", range: "17", cost: "1,000",
            attackName: "Cero",
            aoe: "Line 10",
            attackTime: "2.05",
            description: "Deals 1 tick in a Line AoE (Size 10) over 2.05s"
        },
        {
            upgrade: 1, damage: "292", spa: "5.3", range: "18", cost: "1,650",
            attackName: "Cero",
            aoe: "Line 10",
        },
        {
            upgrade: 2, damage: "433", spa: "5.3", range: "18", cost: "2,550",
            attackName: "Cero",
            aoe: "Line 10",
        },
        {
            upgrade: 3, damage: "675", spa: "5.2", range: "19", cost: "3,350",
            attackName: "Cero",
            aoe: "Line 10",
        },
        {
            upgrade: 4, damage: "806", spa: "5.1", range: "20", cost: "4,600",
            attackName: "Grand Cero",
            aoe: "Line 10",
            attackTime: "3.25",
            description: "Deals 1 tick in a Line AoE (Size 10) over 3.25s"
        },
        {
            upgrade: 5, damage: "907", spa: "5", range: "21", cost: "6,000",
            attackName: "Grand Cero",
            aoe: "Line 10",
        },
        {
            upgrade: 6, damage: "1,068", spa: "5", range: "21", cost: "6,750",
            attackName: "Grand Cero",
            aoe: "Line 10",
        },
        {
            upgrade: 7, damage: "1,255", spa: "4.9", range: "23", cost: "8,050",
            attackName: "Desgarron",
            aoe: "Line 10",
            attackTime: "2.05",
            description: "Deals 3 ticks in a Line AoE (Size 10) over 2.05s"
        },
        {
            upgrade: 8, damage: "1,499", spa: "4.7", range: "25", cost: "9,350",
            attackName: "Desgarron",
            aoe: "Line 10",
            attackTime: "2.05",
            description: "Unlocks Ability: Endless Slashes"
        },
    ],

    passives: [
        {
            name: "Roar",
            desc: `Every 10 seconds:<br>- Unleash a Full AoE Roar attack dealing 35% of this unit's current damage and apply Stagger to enemies for 1 seconds<br>- For each enemy hit by this attack, this unit gains 1% Critical Chance (Capacity: 25%)`,
        },
    ],

    abilities: [
        {
            name: "Endless Slashes",
            type: "Local Cooldown",
            cooldown: "60s CD",
            desc: `On activation:<br>This unit will teleport to base, and begin slashing down the whole path.<br>- Each Slash attack will increase in damage by 10%<br>Upon hitting the enemy base, this unit will return to its original position.`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Predator's Skull",
        equip1: "Shinigami Sword",
        equip2: "Warrior's Axe",
    },

    statusEffects: [],
};
export default unit;    