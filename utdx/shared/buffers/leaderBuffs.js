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
                stats: { dmg: 0, costReduction: 0 } // Note: costReduction is positive representing a discount %
            },
            {
                type: "tag",
                value: "Sword",
                stats: { dmg: 0, range: 0 }
            },
            {
                type: "element",
                value: "Wind",
                stats: { dmg: 0, cRate: 0 }
            }
        ]
    }
};
