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
    }
};
