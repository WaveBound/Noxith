export const unit = {
    id: "stringdemonawakened",
    name: "String Demon (Awakened)",
    image: "Units/Image/StringDemonAwakened.png",
    ascend: 3,
    tiers: ["Mythic"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Neutral",
        archetype: "Magical",
        damage: "2,379",
        spa: "6",
        range: "27",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$58,000",
    },

    placement: [
        {
            upgrade: 0, damage: "442", spa: "6", range: "18", cost: "1,050",
            attackName: "Thread: Claw",
            aoe: "Cone 55",
            attackTime: "2.8",
            description: "Deals 4 hits in a Cone AoE (Size 55) over 2.8s"
        },
        {
            upgrade: 1, damage: "587", spa: "6", range: "19", cost: "1,950",
            attackName: "Thread: Claw",
            aoe: "Cone 55",
            attackTime: "2.8",
        },
        {
            upgrade: 2, damage: "832", spa: "5.5", range: "21", cost: "2,750",
            attackName: "Thread: Claw",
            aoe: "Cone 55",
            attackTime: "2.8",
        },
        {
            upgrade: 3, damage: "1,311", spa: "5.5", range: "21", cost: "3,750",
            attackName: "Thread: Claw",
            aoe: "Cone 55",
            attackTime: "2.8",
        },
        {
            upgrade: 4, damage: "1,336", spa: "5", range: "23", cost: "4,750",
            attackName: "Thread: Enclosure",
            aoe: "Circle 9",
            attackTime: "2.2",
            description: "Deals 1 tick in a Circle AoE (Size 9) over 2.2s"
        },
        {
            upgrade: 5, damage: "1,397", spa: "4.8", range: "24", cost: "6,250",
            attackName: "Thread: Enclosure",
            aoe: "Circle 9",
            attackTime: "2.2",
        },
        {
            upgrade: 6, damage: "1,491", spa: "4.6", range: "24", cost: "6,750",
            attackName: "Thread: Enclosure",
            aoe: "Circle 9",
            attackTime: "2.2",
        },
        {
            upgrade: 7, damage: "2,128", spa: "6.2", range: "25", cost: "8,750",
            attackName: "Thread: Celestial Ammunition",
            aoe: "Circle 10",
            attackTime: "3.28",
            description: "Deals 4 ticks in a Circle AoE (Size 10) over 3.28s"
        },
        {
            upgrade: 8, damage: "2,274", spa: "6.1", range: "26", cost: "9,750",
            attackName: "Thread: Celestial Ammunition",
            aoe: "Circle 10",
            attackTime: "3.28",
        },
        {
            upgrade: 9, damage: "2,379", spa: "6", range: "27", cost: "12,250",
            attackName: "Thread: Celestial Ammunition",
            aoe: "Circle 10",
            attackTime: "3.28",
        },
    ],

    passives: [
        {
            name: "Cocoon of Carnage",
            desc: `Every 6 Regular Attacks will Cocoon the enemies hit:<br>- Enemies are either stunned for 10 hits, or 5 seconds<br>If the Cocoon is broken after 10 hits:<br>- Deal 100% of this unit's current damage<br>If the Cocoon is not broken before 5 seconds:<br>- Cocoon despawns`,
        },
        {
            name: "String Sync",
            desc: `When the nearest unit in this unit's range performs a Regular Attack:<br>- Attach a String to nearest unit (Capacity: 3)<br>On this unit Regular Attack:<br>- Units with String will perform a Follow-Up Attack dealing 100% of this unit's damage and breaking the String attachment<br>- After String breaks, it cannot be reapplied for 15s`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Webbed Fruit",
        equip1: "Shinigami Sword",
        equip2: "Magic Book",
    },
};

export default unit;