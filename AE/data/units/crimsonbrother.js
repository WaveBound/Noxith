export const unit = {
    id: "crimsonbrother",
    name: "Crimson (Brother)",
    image: "Units/Image/CrimsonBrother.png",
    tiers: ["Exclusive"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Dark",
        archetype: "Magical",
        damage: "1,867",
        spa: "4.8",
        range: "27",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$24,850",
    },

    placement: [
        {
            upgrade: 0, damage: "301", spa: "5.7", range: "18", cost: "1,000",
            attackName: "Paint Spears",
            aoe: "Line 8.5",
            attackTime: "2.85",
            description: "Deals 1 tick in a Line AoE (Size 8.5) over 2.85s"
        },
        {
            upgrade: 1, damage: "370", spa: "5.6", range: "19", cost: "1,400",
            attackName: "Paint Spears",
            aoe: "Line 8.5",
            attackTime: "2.85",
        },
        {
            upgrade: 2, damage: "483", spa: "5.4", range: "21", cost: "1,700",
            attackName: "Paint Spears",
            aoe: "Line 8.5",
            attackTime: "2.85",
        },
        {
            upgrade: 3, damage: "670", spa: "5.3", range: "22", cost: "2,050",
            attackName: "Paint Spears",
            aoe: "Line 8.5",
            attackTime: "2.85",
        },
        {
            upgrade: 4, damage: "1,110", spa: "5.3", range: "23", cost: "2,250",
            attackName: "Paint Bombs",
            aoe: "Circle 7",
            attackTime: "2.61",
            description: "Deals 4 ticks in a Circle AoE (Size 7) over 2.61s"
        },
        {
            upgrade: 5, damage: "1,244", spa: "5.2", range: "24", cost: "2,700",
            attackName: "Paint Beam",
            aoe: "Line 5.5",
            attackTime: "3.56",
        },
        {
            upgrade: 6, damage: "1,507", spa: "5", range: "25", cost: "3,050",
            attackName: "Paint Beam",
            aoe: "Line 5.5",
            attackTime: "3.56",
        },
        {
            upgrade: 7, damage: "1,697", spa: "4.9", range: "25", cost: "3,350",
            attackName: "Paint Beam",
            aoe: "Line 5.5",
            attackTime: "3.56",
        },
        {
            upgrade: 8, damage: "1,789", spa: "4.9", range: "26", cost: "3,600",
            attackName: "Paint Beam",
            aoe: "Line 5.5",
            attackTime: "3.56",
            description: "Deals 3 ticks in a Line AoE (Size 5.5) over 3.56s"
        },
        {
            upgrade: 9, damage: "1,867", spa: "4.8", range: "27", cost: "3,750",
            attackName: "Paint Beam",
            aoe: "Line 5.5",
            attackTime: "3.56",
            description: "Unlocks Ability: Piercing Crimson"
        }
    ],

    passives: [
        {
            name: "Crimson Mark",
            desc: `On Regular Attack:<br>- Inflict enemies with Crimson Mark<br>- Crimson Marked enemies will Crimson Explode after 5 seconds dealing 15% of this unit's current damage.`,
        },
        {
            name: "Crimson Pool",
            desc: `When Crimson Explode activates:<br>- Leave a Crimson Pool on the ground for 6 seconds (Capacity: 3)<br>- Enemies walking on Crimson Pool will take 10% of this unit's current damage every 2 seconds`,
        },
    ],

    abilities: [
        {
            name: "Piercing Crimson",
            desc: `On activation:<br>- Select a point within this unit's range to fire Piercing Crimson at for 10 seconds<br>- Enemies in Piercing Crimson will:<br>  • Take 75% of this unit's damage every 1 seconds<br>  • Be inflicted with Crimson Mark<br>This unit will not Attack whilst this ability is active.`,
            cooldown: "90s CD",
        },
    ],

    recommendedEquips: {
        unitEquip: "",
        equip1: "Magic Book",
        equip2: "Shinigami Sword",
    },

    statusEffects: [
        {
            name: "Crimson Mark",
            icon: "crimsonmark",
            effect: "Inflicts Crimson Mark; explodes after 5s dealing 15% of current damage.",
            cooldown: "10s",
        },
        {
            name: "Bleed",
            icon: "bleed",
            effect: "Deals 0.65x Damage in 6 ticks over 6s",
            cooldown: "0s",
        },

    ],
};

export default unit;
