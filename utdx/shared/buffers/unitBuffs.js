// ─── GLOBAL UNIT BUFFS ─────────────────────────────────────
// These are globally toggleable buffs applied to units.
// spa is stored as a positive number internally to represent cooldown reduction in %

export const GLOBAL_UNIT_BUFFS = {
    miku: {
        id: "miku",
        name: "Miku",
        stats: { dmg: 100 }
    },
    enlightened_god: {
        id: "enlightened_god",
        name: "Enlightened God",
        stats: { dmg: 20, spa: 20 }
    },
    bijuu_link: {
        id: "bijuu_link",
        name: "Bijuu Link",
        stats: { dmg: 25, range: 25, spa: 15 }
    },
    ancient_mage: {
        id: "ancient_mage",
        name: "Ancient Mage",
        stats: { cRate: 20, cDmg: 20 }
    },
    king_sailor: {
        id: "king_sailor",
        name: "King Sailor",
        stats: { cRate: 10, cDmg: 25 }
    },
    fern_hill: {
        id: "fern_hill",
        name: "Fern (Hill)",
        stats: { spa: 30 },
        restriction: "Hill"
    },
    fern_ground: {
        id: "fern_ground",
        name: "Fern (Ground)",
        stats: { cRate: 45 },
        restriction: "Ground"
    }
};
