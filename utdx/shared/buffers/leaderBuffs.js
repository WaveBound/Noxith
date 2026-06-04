// ─── LEADER BUFFS ──────────────────────────────────────────
// Buffs provided dynamically when a unit with a specific leader passive is placed in the First Slot.

export const LEADER_BUFFS = {
    unrivaled_mark: {
        id: "unrivaled_mark",
        name: "Unrivaled Mark",
        source: "Triple Threat",
        exclusive: true, // Only applies highest priority/value buff
        subBuffs: [
            {
                type: "tag",
                value: "Piece",
                stats: { dmg: 50, costReduction: 7.5 } // Note: costReduction is positive representing a discount %
            },
            {
                type: "tag",
                value: "Sword",
                stats: { dmg: 25, range: 10 }
            },
            {
                type: "element",
                value: "Wind",
                stats: { dmg: 20, cRate: 5 }
            }
        ]
    },
    kings_mark: {
        id: "unrivaled_mark",
        name: "Unrivaled Mark",
        source: "King Sailor",
        exclusive: true,
        subBuffs: [
            {
                type: "tag",
                value: "Magi",
                stats: { dmg: 50, spa: 15 }
            },
            {
                type: "tag",
                value: "Uncontrollable Power",
                stats: { dmg: 30, spa: 10 }
            },
            {
                type: "element",
                value: "Water",
                stats: { dmg: 20, spa: 10 }
            }
        ]
    },
    angel_unrivaled_mark: {
        id: "unrivaled_mark",
        name: "Unrivaled Mark",
        source: "Angel Born in Hell",
        exclusive: true,
        subBuffs: [
            {
                type: "tag",
                value: "Fusion",
                stats: { dmg: 50, cDmg: 50 }
            },
            {
                type: "tag",
                value: "Super Warrior",
                stats: { dmg: 30, cdReduction: 10 }
            },
            {
                type: "element",
                value: "Light",
                stats: { dmg: 20, cRate: 5 }
            }
        ]
    }
};
