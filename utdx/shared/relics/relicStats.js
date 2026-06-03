// ─── RELIC STAT DEFINITIONS ─────────────────────────────────

export const SUB_STAT_BASES = {
    dmg: 4.0,
    spa: 1.5,
    cDmg: 4.5,
    cRate: 2.5,
    range: 2.0,
    dot: 5.0
};

export const MAIN_STAT_BASES = {
    Top: [
        { stat: "dmg", value: 70 },
        { stat: "cDmg", value: 120 },
        { stat: "dot", value: 99 },
        { stat: "hyperArmor", value: 100 }
    ],
    Bottom: [
        { stat: "range", value: 30 },
        { stat: "spa", value: 22.5 }, // spa is cooldown reduction internally
        { stat: "dmg", value: 70 },
        { stat: "cRate", value: 37.5 }
    ],
    Accessory: [
        { stat: "elementalAll", value: 30 } // Main stat on head piece is always Elemental DMG
    ]
};

/**
 * Generates a random relic with main stat, sub stats, and upgrades.
 * @param {string} pieceType - "Top", "Bottom", or "Accessory"
 * @param {string} rarity    - "Mythical" or "Secret"
 * @param {string} setId     - The ID of the relic set (e.g., "shadow_reaper")
 * @returns {Object} The generated relic data
 */
export function generateRelic(pieceType, rarity, setId) {
    // 1. Roll Stars (Only Secret Raid relics can have > 1 star)
    let stars = 1;
    let starMultiplier = 1.0;

    if (rarity === "Secret") {
        const roll = Math.random() * 100;
        if (roll <= 5) {
            stars = 3;
            starMultiplier = 1.05;
        } else if (roll <= 20) { // 5% + 15%
            stars = 2;
            starMultiplier = 1.025;
        }
    }

    // 2. Pick Main Stat
    const possibleMains = MAIN_STAT_BASES[pieceType];
    const mainStatData = possibleMains[Math.floor(Math.random() * possibleMains.length)];
    const mainStat = {
        stat: mainStatData.stat,
        value: Number((mainStatData.value * starMultiplier).toFixed(2))
    };

    // 3. Pick 5 Unique Sub Stats
    const availableSubStats = Object.keys(SUB_STAT_BASES);
    // Shuffle and pick first 5
    for (let i = availableSubStats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableSubStats[i], availableSubStats[j]] = [availableSubStats[j], availableSubStats[i]];
    }
    
    // Mythic/Secret get 5 sub stats
    const chosenSubStats = availableSubStats.slice(0, 5).map(statKey => ({
        stat: statKey,
        baseValue: SUB_STAT_BASES[statKey],
        upgrades: 0,
        value: 0
    }));

    // 4. Distribute 5 Upgrades Randomly
    const TOTAL_UPGRADES = 5;
    for (let i = 0; i < TOTAL_UPGRADES; i++) {
        const randomSubIndex = Math.floor(Math.random() * chosenSubStats.length);
        chosenSubStats[randomSubIndex].upgrades += 1;
    }

    // 5. Calculate Final Sub Stat Values
    chosenSubStats.forEach(sub => {
        // Base + (Base * Upgrades)
        const rawValue = sub.baseValue + (sub.baseValue * sub.upgrades);
        // Apply star multiplier
        sub.value = Number((rawValue * starMultiplier).toFixed(2));
    });

    return {
        setId,
        pieceType,
        rarity,
        stars,
        mainStat,
        subStats: chosenSubStats
    };
}
