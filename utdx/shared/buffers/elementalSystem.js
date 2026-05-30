export const ADVANTAGES = {
    Water: ["Fire", "Wind"],
    Fire: ["Rose", "Ice"],
    Rose: ["Wind", "Water"],
    Wind: ["Ice", "Fire"],
    Ice: ["Water", "Rose"],
    Light: ["Dark"],
    Dark: ["Light"]
};

/**
 * Calculate the elemental damage multiplier.
 * 
 * @param {string} attackerElement - The element of the attacking unit.
 * @param {string} defenderElement - The element of the enemy.
 * @param {string} attackerRarity  - The rarity of the attacking unit (e.g., "Universal").
 * @param {number} elementalDmgBuffPercent - Buff from tag perks (e.g., 30 for +30% Elemental Damage).
 * @returns {number} The final damage multiplier.
 */
export function calcElementalDamageMultiplier(attackerElement, defenderElement, attackerRarity, elementalDmgBuffPercent = 0) {
    if (!attackerElement || attackerElement === "None" || !defenderElement || defenderElement === "None") {
        return 1;
    }

    // Default multipliers
    let advantageMult = 2.0;
    let disadvantageMult = 0.5;

    // Universal rarity units have boosted advantages and harsher disadvantages
    if (attackerRarity === "Universal") {
        advantageMult = 2.5;
        disadvantageMult = 0.2;
    }

    const buffMultiplier = 1 + (elementalDmgBuffPercent / 100);

    // Check if attacker has advantage
    if (ADVANTAGES[attackerElement] && ADVANTAGES[attackerElement].includes(defenderElement)) {
        return advantageMult * buffMultiplier;
    }

    // Check if attacker has disadvantage (defender has advantage over attacker)
    if (ADVANTAGES[defenderElement] && ADVANTAGES[defenderElement].includes(attackerElement)) {
        return disadvantageMult * buffMultiplier;
    }

    // Neutral
    return 1;
}

// Attach to window for non-module compatibility
if (typeof window !== 'undefined') {
    window.calcElementalDamageMultiplier = calcElementalDamageMultiplier;
    window.ADVANTAGES = ADVANTAGES;
}
