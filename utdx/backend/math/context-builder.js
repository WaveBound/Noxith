// ============================================================================
// CONTEXT-BUILDER.JS - Unified Unit Stat Context Builder
// Depends on: backend/math/lookups.js
// ============================================================================

/**
 * UNIFIED Context Builder
 * Prepares unit stats, applies overrides (Ability, modes, upgrades, passives, etherealization),
 * resolves Traits, and sets up the math context (placement, wave, points).
 *
 * @param {Object} unit - The unit object from database
 * @param {string|Object} traitIdent - Trait ID (string) or Trait Object
 * @param {Object} options - Config options { isAbility, mode, points... }
 */
function buildCalculationContext(unit, traitIdent, options = {}) {
    const { isAbility = false, mode = 'fixed', dmgPoints = 99, spaPoints = 0, rangePoints = 0, wave = 25, isBoss = false, headPiece = 'none', starMult = 1, headStarMult = 1, rankData = null, upgradeLevel: forcedLevel, isHotbar = false, forcedModeIdx = undefined } = options;
    let traitObj = null;

    if (typeof traitIdent === 'object') traitObj = traitIdent;
    else traitObj = getTraitFast(traitIdent) || getTraitFast('ruler');

    let effectiveStats = { ...unit.stats };
    effectiveStats.id = unit.id;
    effectiveStats.placementType = unit.placementType;
    if (unit.tags) effectiveStats.tags = unit.tags;
    if (unit.customSummons) effectiveStats.customSummons = unit.customSummons;
    if (unit.summonStats) effectiveStats.summonStats = unit.summonStats;
    if (unit.passives) effectiveStats.passives = unit.passives;
    if (unit.stats && unit.stats.customFollowUp) effectiveStats.customFollowUp = { ...unit.stats.customFollowUp };

    const state = (forcedModeIdx !== undefined) ? forcedModeIdx : (window.unitModesState && window.unitModesState[unit.id]);
    const activeMode = (state !== undefined) ? (Array.isArray(state) ? state[0] : state) : 0;
    const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;

    // Apply mode-specific stat overrides (like spaCap)
    if (modeObj && modeObj.stats) {
        for (let key in modeObj.stats) {
            effectiveStats[key] = modeObj.stats[key];
        }
    }
    if (modeObj && modeObj.passives) effectiveStats.passives = [...effectiveStats.passives, ...modeObj.passives];
    if (modeObj && modeObj.customSummons) effectiveStats.customSummons = modeObj.customSummons;
    if (modeObj && modeObj.customFollowUp) effectiveStats.customFollowUp = { ...modeObj.customFollowUp };

    // Resolve Placement (calculated after mode overrides to respect mode-specific limits)
    let actualPlacement = modeObj?.placement || modeObj?.limitPlace || unit.placement || 1;
    if (traitObj.limitPlace) actualPlacement = Math.min(actualPlacement, traitObj.limitPlace);

    // Synergy: Water God + Underworld God (Placement -1)
    if (isUnit(unit.id, 'water_god')) {
        const hbStats = getCachedHotbarStats();
        if (hbStats.ugPresent) {
            actualPlacement = Math.max(1, actualPlacement - 1);
        }
    }

    const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unit.upgrades && unit.upgrades.length > 0 ? unit.upgrades : null);

    // --- APPLY UPGRADE STATS (Dmg/Spa/Range) ---
    // Use the forced level if provided, otherwise the selected level from window.unitELevels, else default to MAX
    const upgradeLevel = (forcedLevel !== undefined) ? forcedLevel : ((window.unitELevels && window.unitELevels[unit.id] !== undefined)
        ? window.unitELevels[unit.id]
        : (upgradesArr ? upgradesArr.length - 1 : 0));

    if (upgradesArr) {
        const targetLevel = Math.min(upgradeLevel, upgradesArr.length - 1);
        const upStats = upgradesArr[targetLevel];
        if (upStats.dmg) effectiveStats.dmg = upStats.dmg;
        if (upStats.spa) effectiveStats.spa = upStats.spa;
        if (upStats.range) effectiveStats.range = upStats.range;
        if (upStats.passiveDmg !== undefined) effectiveStats.passiveDmg = upStats.passiveDmg;
        if (upStats.passiveSpa !== undefined) effectiveStats.passiveSpa = upStats.passiveSpa;
        if (upStats.passiveRange !== undefined) effectiveStats.passiveRange = upStats.passiveRange;
        if (upStats.spaCap !== undefined) effectiveStats.spaCap = upStats.spaCap;
    }

    // --- APPLY PASSIVES / ETHEREALIZATION ---
    // All etherealization effects are treated as active passives
    if (unit.etherealization) {
        unit.etherealization.forEach((upgrade, i) => {
            if (i >= upgradeLevel) return; // Only apply upgrades UP TO current E-level
            if (!upgrade) return;

            // Handle Object-based upgrades (Direct Stat Injection)
            if (typeof upgrade === 'object') {
                if (upgrade.passiveDmg) effectiveStats.passiveDmg = (effectiveStats.passiveDmg || 0) + upgrade.passiveDmg;
                if (upgrade.passiveSpa) effectiveStats.passiveSpa = (effectiveStats.passiveSpa || 0) + upgrade.passiveSpa;
                if (upgrade.passiveCrit) effectiveStats.passiveCrit = (effectiveStats.passiveCrit || 0) + upgrade.passiveCrit;
                if (upgrade.passiveCdmg) effectiveStats.passiveCdmg = (effectiveStats.passiveCdmg || 0) + upgrade.passiveCdmg;
                if (upgrade.dotBuff) effectiveStats.dotBuff = (effectiveStats.dotBuff || 0) + upgrade.dotBuff;
                if (upgrade.passiveRange) effectiveStats.passiveRange = (effectiveStats.passiveRange || 0) + upgrade.passiveRange;
                if (upgrade.trueDmg) effectiveStats.trueDmg = (effectiveStats.trueDmg || 0) + upgrade.trueDmg;
                if (upgrade.extraPlacement) effectiveStats.extraPlacement = (effectiveStats.extraPlacement || 0) + upgrade.extraPlacement;
                if (upgrade.followUp) effectiveStats.followUp = upgrade.followUp;
                if (upgrade.fuaDmgMult || upgrade.cooldown || upgrade.dotPct || upgrade.dotDuration) {
                    effectiveStats.customFollowUp = { ...(effectiveStats.customFollowUp || {}) };
                    if (upgrade.fuaDmgMult) effectiveStats.customFollowUp.dmgMult = upgrade.fuaDmgMult;
                    if (upgrade.cooldown) effectiveStats.customFollowUp.cooldown = upgrade.cooldown;
                    if (upgrade.dotPct) effectiveStats.customFollowUp.dotPct = upgrade.dotPct;
                    if (upgrade.dotDuration) effectiveStats.customFollowUp.dotDuration = upgrade.dotDuration;
                }
                return;
            }

            // Handle String-based upgrades (Legacy/Auto-parsing)
            const lowU = upgrade.toLowerCase();

            // Special Case: Water God
            if (isUnit(unit.id, 'water_god') && i === 0) {
                effectiveStats.followUp = true;
            }

            // Special Case: Underworld God + Water God Divinity Stack Fix
            // "Water god placement - 1"
            if (isUnit(unit.id, 'underworld_god')) {
                // We apply the logic in the calculateDPS loop instead of here to ensure it's dynamic
            }

            // Special Case: Damage per placement
            if (lowU.includes('+75% damage per placement')) {
                const totalPlacement = (unit.placement || 1) + (effectiveStats.extraPlacement || 0);
                effectiveStats.passiveDmg = (effectiveStats.passiveDmg || 0) + (75 * totalPlacement);
            }

            if (lowU.includes('+1 placement')) {
                effectiveStats.extraPlacement = (effectiveStats.extraPlacement || 0) + 1;
            }

            // --- GENERIC STAT PARSER ---
            // Matches patterns like "+20% Damage", "Gain 10% Crit Rate", etc.
            // Skips strings that look like mechanic descriptions (e.g., "increased to", "instead of")
            const isDescription = lowU.includes('instead of') || lowU.includes('increased to');
            const valueMatch = lowU.match(/([+-]\d+)%/); // Requires explicit + or -
            const gainMatch = lowU.match(/(?:gain|increase|plus)\s*(\d+)%/); // Matches "Gain 10%"

            if (!isDescription && (valueMatch || gainMatch) && !lowU.includes('per placement')) {
                const val = valueMatch ? parseInt(valueMatch[1]) : parseInt(gainMatch[1]);

                if (lowU.includes('damage') || lowU.includes('dmg') || lowU.includes('atk')) {
                    effectiveStats.passiveDmg = (effectiveStats.passiveDmg || 0) + val;
                }
                if (lowU.includes('spa') || lowU.includes('attack speed') || lowU.includes(' as ')) {
                    effectiveStats.passiveSpa = (effectiveStats.passiveSpa || 0) + val;
                }
                if (lowU.includes('crit rate') || lowU.includes('crit %') || lowU.includes(' crit ')) {
                    effectiveStats.passiveCrit = (effectiveStats.passiveCrit || 0) + val;
                }
                if (lowU.includes('crit damage') || lowU.includes('crit dmg') || lowU.includes('cdmg')) {
                    effectiveStats.passiveCdmg = (effectiveStats.passiveCdmg || 0) + val;
                }
                if (lowU.includes('dot') || lowU.includes('bleed') || lowU.includes('burn')) {
                    effectiveStats.dotBuff = (effectiveStats.dotBuff || 0) + val;
                }
                if (lowU.includes('range')) {
                    effectiveStats.passiveRange = (effectiveStats.passiveRange || 0) + val;
                }
                if (lowU.includes('true dmg') || lowU.includes('true damage')) {
                    effectiveStats.trueDmg = (effectiveStats.trueDmg || 0) + val;
                }
            }
        });
    }

    // --- SYSTEM LEVEL SUPPORT (e.g. Jinoo's "The System") ---
    if (unit.systemLevel) {
        const cfg = unit.systemLevel;
        let activeModeIdx = 0;
        if (unit.modes && Array.isArray(unit.modes)) {
            const state = (typeof window !== 'undefined' && window.unitModesState && window.unitModesState[unit.id]);
            activeModeIdx = (state !== undefined) ? state : 0;
        }
        if (!cfg.restrictModes || cfg.restrictModes.includes(activeModeIdx)) {
            const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[unit.id] !== undefined)
                ? window.unitSystemLevels[unit.id]
                : (cfg.default || cfg.max || 100);

            if (unit.id === 'joyful_captain' && cfg.passiveName === 'Charge') {
                const passiveName = 'Charge';
                if (!effectiveStats.passives) effectiveStats.passives = [];
                else if (!Array.isArray(effectiveStats.passives)) effectiveStats.passives = [...effectiveStats.passives];
                effectiveStats.passives = effectiveStats.passives.filter(p => p.name !== passiveName);

                // Uncapped SPA is exactly equal to the charge slider level (sysLvl)
                // Capped SPA is Math.max(sysLvl, 3)
                const computedSpa = Math.max(Number(sysLvl), 3);
                const passiveSpa = 0; // Handled absolutely below
                const passiveDmg = 15 * computedSpa;

                effectiveStats.passives.push({
                    name: passiveName,
                    passiveSpa: passiveSpa,
                    passiveDmg: passiveDmg
                });
            } else {
                // Apply per-level bonuses
                if (cfg.perLevel) {
                    const passiveName = cfg.passiveName || 'System Level';
                    if (!effectiveStats.passives) effectiveStats.passives = [];
                    else effectiveStats.passives = [...effectiveStats.passives];

                    const existing = effectiveStats.passives.find(p => p.name === passiveName);
                    let updated = existing ? { ...existing } : { name: passiveName };

                    for (let statKey in cfg.perLevel) {
                        const val = cfg.perLevel[statKey] * sysLvl;
                        updated[statKey] = (updated[statKey] || 0) + val;
                    }

                    if (existing) {
                        const idx = effectiveStats.passives.indexOf(existing);
                        effectiveStats.passives[idx] = updated;
                    } else {
                        effectiveStats.passives.push(updated);
                    }
                }

                // Apply threshold bonuses
                if (cfg.thresholds) {
                    cfg.thresholds.forEach(t => {
                        if (sysLvl >= t.level) {
                            const passiveName = cfg.passiveName || 'System Level';
                            if (!effectiveStats.passives) effectiveStats.passives = [];
                            else if (!Array.isArray(effectiveStats.passives)) effectiveStats.passives = [...effectiveStats.passives];
                            const existing = effectiveStats.passives.find(p => p.name === passiveName);
                            if (existing) {
                                const idx = effectiveStats.passives.indexOf(existing);
                                const updated = { ...effectiveStats.passives[idx] };
                                if (t.passiveSpa) updated.passiveSpa = (updated.passiveSpa || 0) + t.passiveSpa;
                                if (t.passiveDmg) updated.passiveDmg = (updated.passiveDmg || 0) + t.passiveDmg;
                                effectiveStats.passives[idx] = updated;
                            } else {
                                const newP = { name: passiveName };
                                if (t.passiveSpa) newP.passiveSpa = t.passiveSpa;
                                if (t.passiveDmg) newP.passiveDmg = t.passiveDmg;
                                effectiveStats.passives.push(newP);
                            }
                        }
                    });
                }
            }
        }
    }

    // Requirement: Points = (Level - 1) + 30
    const maxPts = unit.noPoints ? 0 : (((unit.level || 1) - 1) + 30);
    options.dmgPoints = Math.min(options.dmgPoints || 0, maxPts);
    options.spaPoints = Math.min(options.spaPoints || 0, maxPts);
    options.rangePoints = Math.min(options.rangePoints || 0, maxPts);

    // --- UNIVERSAL MODES SUPPORT ---
    if (typeof window.applyModeContext === 'function') {
        window.applyModeContext(unit, effectiveStats);
    }

    if (isAbility && unit.ability && typeof window.applyAbilityContext === 'function') {
        actualPlacement = window.applyAbilityContext(unit, effectiveStats, actualPlacement);
    }

    let suffix = isAbility ? '-ABILITY' : '-BASE';
    const modeTag = (mode === 'bugged') ? `-b-${activeMode}` : `-f-${activeMode}`;

    const context = { mode, dmgPoints: options.dmgPoints, spaPoints: options.spaPoints, rangePoints: options.rangePoints, wave, isBoss, traitObj, placement: actualPlacement, isSSS: true, isVirtualRealm: false, headPiece, starMult, headStarMult: options.headStarMult || starMult, rankData, isAbility, maxPts, upgradeLevel, isHotbar };
    return { effectiveStats, traitObj, context, isKiritoVR: false, suffix, modeTag };
}

window.buildCalculationContext = buildCalculationContext;
