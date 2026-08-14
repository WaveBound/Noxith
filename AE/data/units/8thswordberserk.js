export const unit = {
    id: "8thswordberserk",
    name: "8th Sword (Berserk)",
    image: "Units/Image/8thSwordBerserk.png",
    tiers: ["Secret"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Neutral",
        archetype: "Physical",
        damage: "3,794",
        spa: "8.4",
        range: "23",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$92,800",
    },

    placement: [
        {
            upgrade: 0, damage: "183", spa: "4.7", range: "16", cost: "2,000",
            attackName: "Thunderclap Cut",
            aoe: "Line 10",
            attackTime: "1.7",
            description: "Deals 1 tick in a Line AoE (Size 10) over 1.7s"
        },
        {
            upgrade: 1, damage: "309", spa: "4.5", range: "17", cost: "2,750",
            attackName: "Thunderclap Cut",
            aoe: "Line 10",
            attackTime: "1.7",
        },
        {
            upgrade: 2, damage: "472", spa: "3.8", range: "19", cost: "4,000",
            attackName: "Thunderclap Cut",
            aoe: "Line 10",
            attackTime: "1.7",
        },
        {
            upgrade: 3, damage: "566", spa: "3.6", range: "20", cost: "5,750",
            attackName: "Thunderclap Cut",
            aoe: "Line 10",
            attackTime: "1.7",
        },
        {
            upgrade: 4, damage: "676", spa: "3.6", range: "22", cost: "7,100",
            attackName: "Unrestrained Rampage",
            aoe: "Circle 9",
            attackTime: "3.06",
            description: "Deals 2 ticks in a Circle AoE (Size 9) over 3.06s"
        },
        {
            upgrade: 5, damage: "801", spa: "3.5", range: "22", cost: "8,550",
            attackName: "Unrestrained Rampage",
            aoe: "Circle 9",
            attackTime: "3.06",
        },
        {
            upgrade: 6, damage: "1,587", spa: "6.5", range: "23", cost: "9,250",
            attackName: "Skyward Slash",
            aoe: "Cone 60",
            attackTime: "2.15",
            description: "Deals 1 tick in a Cone AoE (Size 60) over 2.15s"
        },
        {
            upgrade: 7, damage: "1,869", spa: "6.4", range: "24", cost: "9,900",
            attackName: "Skyward Slash",
            aoe: "Cone 60",
            attackTime: "2.15",
        },
        {
            upgrade: 8, damage: "2,129", spa: "6.3", range: "24", cost: "12,750",
            attackName: "Skyward Slash",
            aoe: "Cone 60",
            attackTime: "2.15",
        },
        {
            upgrade: 9, damage: "3,163", spa: "8.5", range: "22", cost: "14,250",
            attackName: "Way of the Sword",
            aoe: "Full",
            attackTime: "6.2",
            description: "Deals 3 ticks in a Full AoE over 6.2s"
        },
        {
            upgrade: 10, damage: "3,794", spa: "8.4", range: "23", cost: "16,500",
            attackName: "Way of the Sword",
            aoe: "Full",
            attackTime: "6.2",
        },
    ],

    passives: [
        {
            name: "Demonic Presence",
            desc: `Enemies within 40% of this unit's range will take 5% of this unit's current damage every 1 seconds.`,
        },
        {
            name: "Savage Rebound",
            desc: `When this unit is stunned:<br>- Immediately Cleanse the stun<br>- Follow-Up Attack (Thunderclap Cut) at 100% of this unit's current damage<br>All of this unit's Follow-Up Attacks apply Dismembered to enemies`,
        },
        {
            name: "Dismemberer's Rush",
            desc: `When an enemy in range goes below 10% health:<br>- Follow-Up Attack (Unrestrained Rampage) at 100% of this unit's current damage`,
        },
        {
            name: "The Nameless Demon",
            desc: `After 25 Takedowns this unit will enter Berserk State for 15 seconds:<br>- Increase DMG by 20%<br>- Decrease SPA by 10%<br>- Apply Dismembered on every Attack`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Hair Bells",
        equip1: "Shinigami Sword",
        equip2: "Warrior Pole",
    },

    statusEffects: [
        {
            name: "Dismembered",
            icon: "dismembered",
            effect: "Permanently reduces movement speed by 0.15.",
            cooldown: "9,999s",
        },
    ],
};

export default unit;