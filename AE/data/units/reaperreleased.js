export const unit = {
    id: "reaperreleased",
    name: "Reaper (Released)",
    image: "Units/Image/ReaperReleased.png",
    ascend: 3,

    stats: {
        recommendedTrait: "Unbound",
        element: "Light",
        archetype: "Physical",
        damage: "1,058",
        spa: "6",
        range: "21",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$35,600",
    },

    placement: [
        {
            upgrade: 0, damage: "119", spa: "4.6", range: "16", cost: "700",
            attackName: "Slash",
            aoe: "Cone 40",
            attackTime: "2.07",
            description: "Deal 1 tick in a Cone AoE (Size 40) over 2.07s"
        },
        {
            upgrade: 1, damage: "153", spa: "4.4", range: "16", cost: "1,000",
            attackName: "Slash",
            aoe: "Cone 40",
            attackTime: "2.07",
        },
        {
            upgrade: 2, damage: "194", spa: "4.2", range: "18", cost: "1,600",
            attackName: "Slash",
            aoe: "Cone 40",
            attackTime: "2.07",
        },
        {
            upgrade: 3, damage: "262", spa: "4.6", range: "18", cost: "2,050",
            attackName: "Hallowed Crescent",
            aoe: "Line 7",
            attackTime: "1.57",
            description: "Deal 3 ticks in a Line AoE (Size 7) over 1.57s"
        },
        {
            upgrade: 4, damage: "298", spa: "4.6", range: "18", cost: "2,500",
            attackName: "Hallowed Crescent",
            aoe: "Line 7",
            attackTime: "1.57",
        },
        {
            upgrade: 5, damage: "501", spa: "6.7", range: "19", cost: "2,750",
            attackName: "Hallowed Moon",
            aoe: "Circle 7",
            attackTime: "3.25",
            description: "Deal 1 tick in a Circle AoE (Size 7) over 3.25s"
        },
        {
            upgrade: 6, damage: "663", spa: "6.5", range: "21", cost: "3,250",
            attackName: "Hallowed Moon",
            aoe: "Circle 7",
            attackTime: "3.25",
        },
        {
            upgrade: 7, damage: "814", spa: "6.4", range: "21", cost: "4,750",
            attackName: "Vow of Loyalty",
            aoe: "Line 12",
            attackTime: "2.88",
            description: "Deal 1 tick in a Line AoE (Size 12) over 2.88s"
        },
        {
            upgrade: 8, damage: "942", spa: "6.2", range: "21", cost: "7,250",
            attackName: "Vow of Loyalty",
            aoe: "Line 12",
            attackTime: "2.88",
        },
        {
            upgrade: 9, damage: "1,058", spa: "6", range: "21", cost: "9,750",
            attackName: "Vow of Loyalty",
            aoe: "Line 12",
            attackTime: "2.88",
        },
    ],

    passives: [
        {
            name: "Adaptation",
            desc: `This unit gains permanent Buffs after attacking different enemy types:<br>For each enemy type attacked:<br>- Increase Damage by 5%<br>- Increase Critical Chance by 5%`,
        },
        {
            name: "Critical Tempo",
            desc: `On Critical Attack:<br>- Decrease SPA by 5% for 20s (Capacity: 15%)`,
        },
        {
            name: "Mirage Swap",
            desc: `When this unit is stunned and a Mirage Clone exists:<br>- Immediately Cleanse the stun<br>- Swap positions with Mirage Clone`,
        },
    ],

    abilities: [
        {
            name: "Mirage Step",
            desc: `On activation:<br>- This unit can Relocate anywhere within its range:<br>On Relocation create a Mirage Clone with 50% of this unit's base damage`,
            cooldown: "35s",
        },
    ],

    summons: {
        id: "mirageclone",
        name: "Mirage Clone",
        countPerPlacement: 1,
        baseDamageMultiplier: 0.50,
        passive: "Mirage Clone attacks at the same SPA and range as the main unit, dealing 50% of this unit's base damage.",
    },

    recommendedEquips: {
        unitEquip: "Spirit of the Moonblade",
        equip1: "Shinigami Sword",
        equip2: "Red Finger",
    },

    statusEffects: [],
};

export default unit;