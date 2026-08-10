export const unit = {
    id: "shadowdivine",
    name: "Shadow (Divine)",
    image: "Units/Image/ShadowDivine.png",
    ascend: 0,
    tiers: ["Secret"],

    stats: {
        recommendedTrait: "Unbound",
        element: "Dark",
        archetype: "Magical",
        damage: "1,495",
        spa: "6",
        range: "29",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "2",
        totalCost: "$69,400",
    },

    placement: [
        {
            upgrade: 0, damage: "160", spa: "5.5", range: "19", cost: "1,100",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
            description: "Deals 1 tick in a Circle AoE (Size 6) over 3.98s"
        },
        {
            upgrade: 1, damage: "219", spa: "5.4", range: "20", cost: "1,650",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
        },
        {
            upgrade: 2, damage: "297", spa: "5.3", range: "22", cost: "2,500",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
        },
        {
            upgrade: 3, damage: "364", spa: "5.3", range: "23", cost: "3,650",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
            description: "On Upgrade 3:<br>- Summon a Winged Spirit at this unit's position that will circle at 50% of this unit's range<br>- Winged Spirit will deal 50% of this unit's current damage every 8 seconds in its current location and apply Stun"
        },
        {
            upgrade: 4, damage: "488", spa: "5.2", range: "24", cost: "6,000",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
        },
        {
            upgrade: 5, damage: "600", spa: "5.2", range: "25", cost: "7,250",
            attackName: "Shadow Slash",
            aoe: "Circle 6",
            attackTime: "3.98",
            description: "On Upgrade 5:<br>- Summon a Wolf Spirit at this unit's position<br>- Wolf Spirit can be upgraded independently"
        },
        {
            upgrade: 6, damage: "748", spa: "5.1", range: "26", cost: "8,250",
            attackName: "Bunny Swarm",
            aoe: "Cone 65",
            attackTime: "2.5",
            description: "Deals 2 ticks in a Cone AoE (Size 65) over 2.5s"
        },
        {
            upgrade: 7, damage: "845", spa: "5.1", range: "27", cost: "11,500",
            attackName: "Bunny Swarm",
            aoe: "Cone 65",
            attackTime: "2.5",
        },
        {
            upgrade: 8, damage: "944", spa: "5.1", range: "27", cost: "13,500",
            attackName: "Bunny Swarm",
            aoe: "Cone 65",
            attackTime: "2.5",
            description: "Ability: Shadow Realm (60s CD)<br>- Transforms the whole map into Shadow Realm<br>- Shadow Rewind all enemies in range for 50% of this unit's range<br>- Apply 25% Damage Buff to all Magical units for 30 seconds"
        },
        {
            upgrade: 9, damage: "1,393", spa: "6.2", range: "28", cost: "14,000",
            attackName: "Bunny Swarm",
            aoe: "Cone 65",
            attackTime: "2.5",
        },
        {
            upgrade: 10, damage: "1,495", spa: "6", range: "29", cost: "Maxed",
            attackName: "Bunny Swarm",
            aoe: "Cone 65",
            attackTime: "2.5",
            description: "Ability: Divine Spirit (99,999s CD)<br>- Summon Divine Spirit (Spirit General)<br>- Stun this unit for 15 seconds<br>- Divine Spirit's damage will be equal to 100% of this unit's base damage"
        },
    ],

    passives: [
        {
            name: "Winged Spirit",
            desc: `On Upgrade 3:<br>- Summon a Winged Spirit at this unit's position that will circle at 50% of this unit's range<br>- Winged Spirit will deal 50% of this unit's current damage (75% with Hexed Blade) every 8 seconds in its current location and apply Stun`,
        },
        {
            name: "Wolf Spirit",
            desc: `On Upgrade 5:<br>- Summon a Wolf Spirit at this unit's position<br>- Wolf Spirit can be upgraded independently and applies Bleed`,
        },
        {
            name: "Execution Cycle (Spirit General)",
            desc: `Every 10 seconds:<br>- Teleport to an enemy (based on priority) and apply Stun<br>On Takedown:<br>- Increase Damage by 1% (Capacity: 100%)`,
        },
    ],

    abilities: [
        {
            name: "Shadow Realm",
            cooldown: "60s CD",
            type: "Global Cooldown",
            desc: `On activation:<br>- Transform the whole map into Shadow Realm<br>Shadow Realm will:<br>- Shadow Rewind all enemies in range for 50% of this unit's range<br>- Apply 25% Damage Buff to all Magical units for 30 seconds<br>Shadow Rewind can be applied to an enemy a maximum of 2 times.`,
        },
        {
            name: "Divine Spirit",
            cooldown: "99,999s CD",
            type: "Per Player Cooldown",
            desc: `On activation:<br>- Summon Divine Spirit<br>- Stun this unit for 15 seconds<br>- Divine Spirit's damage will be equal to 100% of this unit's base damage<br>Divine Spirit cannot despawn, be killed or stunned.`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Hexed Blade",
        equip1: "Three Swords From Hell",
        equip2: "Katana",
    },

    statusEffects: [],

    summons: [
        {
            id: "wingedspirit",
            name: "Winged Spirit (Divine)",
            countPerPlacement: 1,
            globalMax: 2,
            baseDamageMultiplier: 0.50,
            intervalSPA: 8.0,
            noShinigamiPassive: true,
            attackName: "Shock",
            attackTime: "1.84s",
            aoe: "Radial 7",
            statusEffect: {
                name: "Stun",
                icon: "stun",
                effect: "Prevents all actions and movement for 2s",
                cooldown: "5s",
            },
            relicModifiers: [
                {
                    relicName: "Hexed Blade",
                    damageMultiplierOverride: 0.75,
                },
            ],
        },
        {
            id: "spiritwolf",
            name: "Spirit Wolf (Divine)",
            countPerPlacement: 1,
            globalMax: 2,
            hasOwnUpgrades: true,
            noShinigamiPassive: true,
            maxDamage: 1088,
            maxSpa: 5.5,
            range: 32,
            attackName: "Slash",
            attackTime: "2.0s",
            aoe: "Circle 10",
            statusEffect: {
                name: "Bleed",
                icon: "bleed",
                effect: "Inflicts Bleed DoT damage via Spirit Wolf",
                cooldown: "0s",
            },
            upgrades: [
                { upgrade: 0, cost: "2,000", damage: 353, spa: "6.5s", range: 25, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
                { upgrade: 1, cost: "3,250", damage: 443, spa: "6.5s", range: 25, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
                { upgrade: 2, cost: "4,500", damage: 512, spa: "6.3s", range: 27, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
                { upgrade: 3, cost: "6,250", damage: 622, spa: "6.1s", range: 28, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
                { upgrade: 4, cost: "7,000", damage: 842, spa: "5.8s", range: 30, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
                { upgrade: 5, cost: "Maxed", damage: 1088, spa: "5.5s", range: 32, attackName: "Slash", attackTime: "2.0s", aoe: "Circle 10", description: "Deals 1 tick in a Circle AoE (Size 10) over 2.0s and applies Bleed" },
            ],
        },
        {
            id: "spiritgeneral",
            name: "Spirit General (Divine)",
            countPerPlacement: 1,
            globalMax: 1,
            baseDamageMultiplier: 1.00,
            passiveDamageBonus: 1.00,
            noShinigamiPassive: true,
            baseSpa: 3.5,
            range: 10,
            attackName: "Slash",
            attackTime: "1.7s",
            aoe: "Circle 7",
            passive: "Execution Cycle (+100% Passive DMG Cap & Teleport Stun every 10s)",
        },
    ],
};

export default unit;