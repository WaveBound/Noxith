// ============================================================================
// ABILITY-BACKEND.JS - Centralized Math & Context Logic for Abilities
// ============================================================================

window.applyAbilityContext = function (unit, effectiveStats, actualPlacement) {
    if (!unit.ability) return actualPlacement;

    const ab = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;

    if (ab.limitPlace) {
        actualPlacement = Math.min(actualPlacement, ab.limitPlace);
    }

    const passiveMappings = [
        { ability: 'buffDmg', passive: 'passiveDmg' },
        { ability: 'passiveDmg', passive: 'passiveDmg' },
        { ability: 'dmg', passive: 'passiveDmg' },
        { ability: 'buffSpa', passive: 'passiveSpa' },
        { ability: 'passiveSpa', passive: 'passiveSpa' },
        { ability: 'spa', passive: 'passiveSpa' },
        { ability: 'passiveRange', passive: 'passiveRange' },
        { ability: 'range', passive: 'passiveRange' },
        { ability: 'dotBuff', passive: 'dot' },
        { ability: 'passiveDot', passive: 'dot' },
        { ability: 'dot', passive: 'dot' },
        { ability: 'trueDmg', passive: 'trueDmg' },
        { ability: 'passiveCrit', passive: 'passiveCrit' },
        { ability: 'crit', passive: 'passiveCrit' },
        { ability: 'passiveCdmg', passive: 'passiveCdmg' },
        { ability: 'cdmg', passive: 'passiveCdmg' },
        { ability: 'passiveBossDmg', passive: 'bossDmg' },
        { ability: 'bossDmg', passive: 'bossDmg' },
        { ability: 'boss', passive: 'bossDmg' }
    ];
    const mappedAbilityKeys = new Set();

    let mappedToPassive = false;
    if (ab.abilityName && effectiveStats.passives) {
        effectiveStats.passives = effectiveStats.passives.map(p => {
            if (p.name === ab.abilityName) {
                mappedToPassive = true;
                const newP = { ...p };
                passiveMappings.forEach(({ ability, passive }) => {
                    if (ab[ability] !== undefined && ab[ability] !== null && ab[ability] !== 0) {
                        newP[passive] = (newP[passive] || 0) + ab[ability];
                        mappedAbilityKeys.add(ability);
                    }
                });
                return newP;
            }
            return p;
        });
    }

    // Apply remaining unmapped stats to root
    const rootAb = { ...ab };
    if (mappedToPassive) {
        mappedAbilityKeys.forEach(key => delete rootAb[key]);
        delete rootAb.name;
        delete rootAb.abilityName;
        delete rootAb.desc;
        delete rootAb.defaultActive;
        delete rootAb.defaultOn;
        delete rootAb.enabledByDefault;
    }
    Object.assign(effectiveStats, rootAb);

    return actualPlacement;
};

window.getAbilitySpaCap = function (unitId, isAbility, defaultCap) {
    if (isAbility && unitId === 'nutaru_beast') return 3.0;
    return defaultCap || 0.1;
};

window.getAbilityMultipliers = function (uStats, isAbility) {
    let abilityDmg = 0;
    let abilityFinalMult = 1;
    if (isAbility && uStats.ability) {
        const ab = Array.isArray(uStats.ability) ? uStats.ability[0] : uStats.ability;
        const mappedToPassive = ab.abilityName && uStats.passives && uStats.passives.some(p => p.name === ab.abilityName);
        if (ab.buffDmg && !mappedToPassive) abilityDmg = ab.buffDmg;
        if (ab.finalMult) abilityFinalMult = ab.finalMult;
    }
    return { abilityDmg, abilityFinalMult };
};

window.applyAbilityAttackRate = function (uStats, isAbility, currentSpa, currentAttackMult, currentExtraData) {
    let usedSpa = currentSpa;
    let attackMultiplier = currentAttackMult;
    let extraAttacksData = currentExtraData;
    let isHandled = false;

    if (uStats.id === 'super_roku' && isAbility) {
        attackMultiplier = 0.65;
        extraAttacksData = { req: "Same Target", hits: "Avg 65% Dmg", extra: 0, attacksNeeded: 1, mult: 0.65, label: "Combo Decay" };
        isHandled = true;
    } else if (uStats.id === 'cell' && !isAbility) {
        usedSpa = currentSpa + 1.5;
        attackMultiplier = 1.5;
        extraAttacksData = { req: "Follow-up hit", hits: "1.5x Dmg / Cycle", extra: 0, attacksNeeded: 1, mult: 1.5 };
        isHandled = true;
    } else if (uStats.id === 'rohan') {
        const probs = [0.40, 0.35, 0.30, 0.25, 0.20];
        let cumulativeProbs = [];
        let currentProb = 1.0;

        for (let i = 0; i < probs.length; i++) {
            currentProb *= probs[i];
            cumulativeProbs.push(currentProb);
        }

        const sumP = cumulativeProbs.reduce((a, b) => a + b, 0);
        const expectedAttacks = 1 + sumP;
        const expectedTime = currentSpa + (sumP * (uStats.spaCap || 3.0));
        usedSpa = expectedTime / expectedAttacks;
        attackMultiplier = 1;
        extraAttacksData = {
            req: "RNG Hits",
            hits: `${expectedAttacks.toFixed(2)} Avg Attacks`,
            extra: expectedAttacks - 1,
            attacksNeeded: 1,
            mult: 1,
            label: "Time Stop Avg"
        };
        isHandled = true;
    }

    return { usedSpa, attackMultiplier, extraAttacksData, isHandled };
};
