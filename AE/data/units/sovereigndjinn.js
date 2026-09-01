export const unit = {
    id: "sovereigndjinn",
    name: "Sovereign (Djinn)",
    image: "Units/Image/SovereignDjinn.png",
    ascend: 0,
    tiers: ["Secret"],
    update: "Summer",

    stats: {
        recommendedTrait: "Unbound",
        element: "Storm",
        archetype: "Physical",
        damage: "3,072",
        spa: "4",
        range: "26",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$43,200",
    },

    placement: [
        {
            upgrade: 0, damage: "584", spa: "4.7", range: "17", cost: "950",
            attackName: "Lightning Blade",
            aoe: "Circle 10",
            attackTime: "2.55",
            description: "Deals 1 tick in a Circle AoE (Size 10) over 2.55s"
        },
        {
            upgrade: 1, damage: "792", spa: "4.7", range: "17", cost: "1,300",
            attackName: "Lightning Blade",
            aoe: "Circle 10",
            attackTime: "2.55",
        },
        {
            upgrade: 2, damage: "1,037", spa: "4.6", range: "19", cost: "1,950",
            attackName: "Lightning Release",
            aoe: "Line 9",
            attackTime: "3.15",
            description: "Deals 2 ticks in a Line AoE (Size 9) over 3.15s"
        },
        {
            upgrade: 3, damage: "1,306", spa: "4.6", range: "20", cost: "2,500",
            attackName: "Lightning Release",
            aoe: "Line 9",
            attackTime: "3.15",
        },
        {
            upgrade: 4, damage: "1,650", spa: "4.5", range: "21", cost: "3,250",
            attackName: "Lightning Release",
            aoe: "Line 9",
            attackTime: "3.15",
        },
        {
            upgrade: 5, damage: "1,962", spa: "4.5", range: "21", cost: "4,000",
            attackName: "Lightning Release",
            aoe: "Line 9",
            attackTime: "3.15",
        },
        {
            upgrade: 6, damage: "2,227", spa: "4.5", range: "22", cost: "4,500",
            attackName: "Lightning Release",
            aoe: "Line 9",
            attackTime: "3.15",
        },
        {
            upgrade: 7, damage: "2,503", spa: "4.3", range: "24", cost: "5,250",
            attackName: "Thunder Strike from Heaven",
            aoe: "Circle 11.5",
            attackTime: "2.35",
            description: "Deals 1 tick in a Circle AoE (Size 11.5) over 2.35s"
        },
        {
            upgrade: 8, damage: "2,746", spa: "4.2", range: "24", cost: "6,000",
            attackName: "Thunder Strike from Heaven",
            aoe: "Circle 11.5",
            attackTime: "2.35",
        },
        {
            upgrade: 9, damage: "2,924", spa: "4.1", range: "26", cost: "6,500",
            attackName: "Lightning Charged Beam",
            aoe: "Line 10",
            attackTime: "2.1",
            description: "Deals 4 ticks in a Line AoE (Size 10) over 2.1s"
        },
        {
            upgrade: 10, damage: "3,072", spa: "4", range: "26", cost: "7,000",
            attackName: "Lightning Charged Beam",
            aoe: "Line 10",
            attackTime: "2.1",
        },
    ],

    passives: [
        {
            name: "Djinn Combination",
            desc: `When no Boss is in this unit's range:<br>- Lightning Djinn is active<br>When a Boss is in this unit's range:<br>- Nine Tailed Fox Djinn is active<br>- Does not deactivate Lightning Djinn`,
        },
        {
            name: "Lightning Djinn",
            desc: `While active:<br>- Each attack creates 5 chains<br>- Each chain deals 25% of this unit's current damage<br>- Chains bounce between enemies<br>If there are fewer than 5 enemies:<br>- Chains bounce between the existing enemies<br>If there's only 1 enemy:<br>- All chains hit the same enemy`,
        },
        {
            name: "Nine Tailed Fox Djinn",
            desc: `While active:<br>- Increase Damage by 50%<br>- Attacks apply Freeze<br>- This unit auto targets the boss<br>After Freeze effect wears off:<br>- Permanently slow the enemy by 15% (Can't stack)`,
        },
        {
            name: "Djinn's Judgment",
            desc: `Every 7 seconds summon a Lightning Strike on the strongest enemy in this unit's range:<br>- Lightning Strike deals 75% of this unit's damage<br>- Lightning Strike will chain between 3 enemies<br>- Each chain deals 20% of this unit's current damage<br>- Each chain will also apply Freeze`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Lightning Dagger",
        equip1: "Shinigami Sword",
        equip2: "Katana",
    },

    statusEffects: [
        {
            name: "Freeze",
            icon: "freeze",
            effect: "Applies Freeze during Nine Tailed Fox Djinn and with Lightning Strike chains.",
            cooldown: "5",
        },
        {
            name: "Slow",
            icon: "slow",
            effect: "Permanently slows enemies by 15% after Freeze wears off (Can't stack).",
            cooldown: "0",
        },
    ],
};

export default unit;
