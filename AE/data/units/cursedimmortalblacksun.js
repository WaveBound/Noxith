export const unit = {
    id: "cursedimmortalblacksun",
    name: "Cursed Immortal (Black Sun)",
    image: "Units/Image/CursedImmortalBlackSun.png",
    tiers: ["Mythic"],
    ascend: 3,

    stats: {
        recommendedTrait: "Unbound",
        element: "Dark",
        archetype: "Magical",
        damage: "1,146",
        spa: "2.1",
        range: "15",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$45,775",
    },

    placement: [
        {
            upgrade: 0, damage: "86", spa: "2.4", range: "15", cost: "725",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 1, damage: "147", spa: "2.4", range: "15", cost: "1,400",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 2, damage: "274", spa: "2.3", range: "15", cost: "2,050",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 3, damage: "387", spa: "2.3", range: "15", cost: "3,250",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 4, damage: "467", spa: "2.3", range: "15", cost: "4,000",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 5, damage: "618", spa: "2.2", range: "15", cost: "4,750",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 6, damage: "732", spa: "2.2", range: "15", cost: "5,750",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 7, damage: "811", spa: "2.1", range: "15", cost: "6,500",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
        {
            upgrade: 8, damage: "999", spa: "2.1", range: "15", cost: "7,750",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
            description: "Ability: Endless Slashes"
        },
        {
            upgrade: 9, damage: "1,146", spa: "2.1", range: "15", cost: "9,600",
            attackName: "Wandering",
            aoe: "Support",
            attackTime: "0.5",
        },
    ],

    passives: [
        {
            name: "Wandering Death",
            desc: `This unit does not deal or receive damage when passing through enemies. Instead, it deals damage every tick to all enemies within its aura.`,
        },
        {
            name: "Reckless Control",
            desc: `This unit has Black Magic meter, starting at 0.<br>- When Black Magic Meter is increasing this unit will be in "Caring State"<br>- When Black Magic Meter is decreasing this unit will be in "Cold state"<br>Caring state:<br>- Every 1 seconds this unit walks increases this meter by 5<br>- Deal 50% of this unit's current damage in 50% of his range<br>Cold State:<br>- Every 1 seconds this unit walks decreases this meter by 2<br>- Deal 125% of this unit's current damage in 25% of his range`,
        },
        {
            name: "State of Critical Mass",
            desc: `If this unit changes State:<br>- Increase Critical Chance by 30%`,
        },
    ],

    statusEffects: [],
};

export default unit;