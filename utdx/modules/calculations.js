// ============================================================================
// CALCULATIONS.JS - Build Calculation Logic
// ============================================================================

// --- PERFORMANCE CACHING ---

let _globalHotbarStats = null;
let _lastHotbarUpdate = 0;

/**
 * Optimized lookup for team-wide synergy data (Hotbar context).
 * Prevents redundant array traversals during heavy calculation loops.
 */
function getCachedHotbarStats() {
    const now = Date.now();
    // Short-lived cache (200ms) is sufficient to optimize a single Trait Leaderboard generation
    if (_globalHotbarStats && (now - _lastHotbarUpdate < 200)) return _globalHotbarStats;

    const hotbar = window.hotbarState;
    const slots = hotbar?.slots || [];

    const stats = {
        divinityCount: 0,
        ugPresent: false,
        akPresent: false,
        jinooPresent: false,
        idsInHotbar: new Set()
    };

    slots.forEach(slot => {
        if (!slot) return;
        const baseId = slot.id.indexOf('-') === -1 ? slot.id : slot.id.split('-')[0];
        stats.idsInHotbar.add(baseId);

        if (baseId === 'underworld_god') stats.ugPresent = true;
        if (baseId === 'ant_king_savage') stats.akPresent = true;
        if (baseId === 'jinoo' || baseId === 'jinoo_shadow_monarch' || baseId === 'sjw') stats.jinooPresent = true;

        // Fast divinity stack calculation
        const sUnit = window.getUnitById(slot.id);
        if (sUnit && sUnit.tags && sUnit.tags.includes('Divinity')) {
            let count = sUnit.placement || 1;
            if (baseId === 'water_god') count = Math.max(0, count - 1);
            stats.divinityCount += count;
        }
    });

    _globalHotbarStats = stats;
    _lastHotbarUpdate = now;
    return stats;
}

/**
 * Fast unit ID matching without heavy regex or repeated splitting.
 */
function isUnit(id, target) {
    if (!id || !target) return false;
    const dashIdx = id.indexOf('-');
    if (dashIdx === -1) return id === target;
    return id.substring(0, dashIdx) === target;
}
window.isUnit = isUnit;

// --- HELPERS ---

// Speed optimization: Fast lookup maps for static data
const _traitCacheMap = new Map();
const _setCacheMap = new Map();

// UPDATED: Dynamically checks Custom Traits if not found in the base cache
window.getTraitFast = (idOrName) => {
    if (!idOrName) return null;
    const lowerSearch = idOrName.toLowerCase();

    if (_traitCacheMap.size === 0) {
        traitsList.forEach(t => {
            _traitCacheMap.set(t.id.toLowerCase(), t);
            _traitCacheMap.set(t.name.toLowerCase(), t);
        });
    }

    let found = _traitCacheMap.get(lowerSearch);

    // Fallback 1: Try splitting by space/parentheses (e.g. "Ruler (Dmg/Spa)" -> "Ruler")
    if (!found) {
        const baseName = idOrName.split(' ')[0].toLowerCase();
        found = _traitCacheMap.get(baseName);
    }

    // Fallback: Scan dynamically generated Custom Pairs
    if (!found) {
        if (typeof customTraits !== 'undefined') {
            found = customTraits.find(t => t.id === idOrName || t.name === idOrName);
        }
        if (!found && typeof unitSpecificTraits !== 'undefined') {
            for (const key in unitSpecificTraits) {
                const arr = unitSpecificTraits[key];
                if (arr) {
                    found = arr.find(t => t.id === idOrName || t.name === idOrName);
                    if (found) break;
                }
            }
        }
        // Cache the newly found Custom Trait for future fast lookups
        if (found) {
            _traitCacheMap.set(found.id, found);
            _traitCacheMap.set(found.name, found);
        }
    }
    return found;
};

const getTraitFast = window.getTraitFast;

// Polyfill older lookup functions to ensure entire app resolves Custom Traits
window.getTraitById = window.getTraitFast;
window.getTraitByName = window.getTraitFast;

const getSetFast = (name) => {
    if (_setCacheMap.size === 0) {
        SETS.forEach(s => _setCacheMap.set(s.name, s));
    }
    return _setCacheMap.get(name);
};

/**
 * UNIFIED Context Builder
 * Prepares unit stats, applies overrides (Ability, Kirito, Bambietta), resolves Traits,
 * and sets up the math context (placement, wave, points).
 * 
 * @param {Object} unit - The unit object from database
 * @param {string|Object} traitIdent - Trait ID (string) or Trait Object
 * @param {Object} options - Config options { isAbility, mode, points... }
 */
function buildCalculationContext(unit, traitIdent, options = {}) {
    const { isAbility = false, mode = 'fixed', dmgPoints = 99, spaPoints = 0, rangePoints = 0, wave = 25, isBoss = false, headPiece = 'none', starMult = 1, rankData = null, upgradeLevel: forcedLevel } = options;
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
    if (unit.stats && unit.stats.customFollowUp) effectiveStats.customFollowUp = unit.stats.customFollowUp;

    // Resolve Placement (limited by Trait or Ability)
    let actualPlacement = unit.placement;
    if (traitObj.limitPlace) actualPlacement = Math.min(unit.placement, traitObj.limitPlace);
    if (isAbility && unit.ability && unit.ability.limitPlace) actualPlacement = Math.min(actualPlacement, unit.ability.limitPlace);

    // Synergy: Water God + Underworld God (Placement -1)
    if (isUnit(unit.id, 'water_god')) {
        const hbStats = getCachedHotbarStats();
        if (hbStats.ugPresent) {
            actualPlacement = Math.max(1, actualPlacement - 1);
        }
    }

    // --- APPLY UPGRADE STATS (Dmg/Spa/Range) ---
    // Use the forced level if provided, otherwise the selected level from window.unitELevels, else default to MAX
    const upgradeLevel = (forcedLevel !== undefined) ? forcedLevel : ((window.unitELevels && window.unitELevels[unit.id] !== undefined)
        ? window.unitELevels[unit.id]
        : ((unit.upgrades && unit.upgrades.length > 0) ? unit.upgrades.length - 1 : 0));

    if (unit.upgrades && unit.upgrades[upgradeLevel]) {
        const upStats = unit.upgrades[upgradeLevel];
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
        const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[unit.id] !== undefined)
            ? window.unitSystemLevels[unit.id]
            : (cfg.default || cfg.max || 100);

        // Apply per-level bonuses
        if (cfg.perLevel) {
            if (cfg.perLevel.passiveDmg) {
                const passiveName = cfg.passiveName || 'System Level';
                // Find or create the passive to attribute stats
                if (!effectiveStats.passives) effectiveStats.passives = [];
                else effectiveStats.passives = [...effectiveStats.passives];
                const existing = effectiveStats.passives.find(p => p.name === passiveName);
                if (existing) {
                    const idx = effectiveStats.passives.indexOf(existing);
                    effectiveStats.passives[idx] = { ...existing, passiveDmg: (existing.passiveDmg || 0) + cfg.perLevel.passiveDmg * sysLvl };
                } else {
                    effectiveStats.passives.push({ name: passiveName, passiveDmg: cfg.perLevel.passiveDmg * sysLvl });
                }
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

    // Requirement: Points = (Level - 1) + 30
    const maxPts = ((unit.level || 1) - 1) + 30;
    options.dmgPoints = Math.min(options.dmgPoints || 0, maxPts);
    options.spaPoints = Math.min(options.spaPoints || 0, maxPts);
    options.rangePoints = Math.min(options.rangePoints || 0, maxPts);

    // --- UNIVERSAL MODES SUPPORT ---
    if (unit.modes) {
        let modeData = null;
        if (Array.isArray(unit.modes)) {
            const state = (window.unitModesState && window.unitModesState[unit.id]);
            const isMulti = !!unit.allowMultipleModes;

            if (isMulti) {
                // Multi-mode units (like Jinoo) handle their logic in customSummons loop,
                // so we don't pick a single 'default' mode here.
                modeData = null;
            } else {
                const modeIdx = (state !== undefined) ? state : 0;
                modeData = unit.modes[modeIdx];
            }
        }

        if (modeData) {
            // Apply mode stats to the effective stats with normalization
            const normalizedStats = {};
            let modePassiveObj = null;

            for (const key in modeData) {
                // Skip display-only fields
                if (['name', 'img', 'desc', 'Mode'].includes(key)) continue;

                let targetKey = key.toLowerCase();
                // Map specific keys to match engine expectations
                if (targetKey === 'dotduration') targetKey = 'dotDuration';
                else if (targetKey === 'spacap' || targetKey === 'spa cap') targetKey = 'spaCap';
                else if (targetKey === 'bossdmg') targetKey = 'bossDmg';
                else if (targetKey === 'bossdot') targetKey = 'bossDot';
                else if (targetKey === 'dotbuff') targetKey = 'dotBuff';
                else if (targetKey === 'requiresdot') targetKey = 'requiresDot';
                else if (targetKey === 'dottype') targetKey = 'dotType';

                // Attribute passive stats to the mode's name in the passives array!
                if (['passivedmg', 'passivespa', 'passivecrit', 'passivecdmg', 'truedmg'].includes(targetKey)) {
                    if (!modePassiveObj) modePassiveObj = { name: modeData.name || "Mode Bonus" };
                    if (targetKey === 'passivedmg') modePassiveObj.passiveDmg = modeData[key];
                    if (targetKey === 'passivespa') modePassiveObj.passiveSpa = modeData[key];
                    if (targetKey === 'passivecrit') modePassiveObj.passiveCrit = modeData[key];
                    if (targetKey === 'passivecdmg') modePassiveObj.passiveCdmg = modeData[key];
                    if (targetKey === 'truedmg') modePassiveObj.trueDmg = modeData[key];
                    continue;
                }

                normalizedStats[targetKey] = modeData[key];
            }
            Object.assign(effectiveStats, normalizedStats);

            if (modePassiveObj) {
                if (!effectiveStats.passives) effectiveStats.passives = [];
                // Shallow copy so we don't permanently mutate the base unit definition
                else effectiveStats.passives = [...effectiveStats.passives];

                effectiveStats.passives.push(modePassiveObj);
            }
        }
    }

    if (isAbility && unit.ability) {
        const ab = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;

        let mappedToPassive = false;
        if (ab.abilityName && effectiveStats.passives) {
            effectiveStats.passives = effectiveStats.passives.map(p => {
                if (p.name === ab.abilityName) {
                    mappedToPassive = true;
                    const newP = { ...p };
                    if (ab.buffDmg) newP.passiveDmg = (newP.passiveDmg || 0) + ab.buffDmg;
                    if (ab.buffSpa) newP.passiveSpa = (newP.passiveSpa || 0) + ab.buffSpa;
                    if (ab.passiveRange) newP.passiveRange = (newP.passiveRange || 0) + ab.passiveRange;
                    if (ab.dotBuff) newP.dot = (newP.dot || 0) + ab.dotBuff;
                    if (ab.trueDmg) newP.trueDmg = (newP.trueDmg || 0) + ab.trueDmg;
                    if (ab.passiveCrit) newP.passiveCrit = (newP.passiveCrit || 0) + ab.passiveCrit;
                    if (ab.passiveCdmg) newP.passiveCdmg = (newP.passiveCdmg || 0) + ab.passiveCdmg;
                    return newP;
                }
                return p;
            });
        }

        // Apply remaining unmapped stats to root
        const rootAb = { ...ab };
        if (mappedToPassive) {
            delete rootAb.buffDmg;
            delete rootAb.buffSpa;
            delete rootAb.passiveRange;
            delete rootAb.dotBuff;
            delete rootAb.trueDmg;
            delete rootAb.passiveCrit;
            delete rootAb.passiveCdmg;
        }
        Object.assign(effectiveStats, rootAb);
    }

    let suffix = isAbility ? '-ABILITY' : '-BASE';
    const modeTag = (mode === 'bugged') ? '-b-' : '-f-';

    const context = { dmgPoints: options.dmgPoints, spaPoints: options.spaPoints, rangePoints: options.rangePoints, wave, isBoss, traitObj, placement: actualPlacement, isSSS: true, isVirtualRealm: false, headPiece, starMult, rankData, isAbility, maxPts, upgradeLevel };
    return { effectiveStats, traitObj, context, isKiritoVR: false, suffix, modeTag };
}

function createResultEntry({ id, buildName, traitName, res, prio, mainStats, subStats, headUsed, isCustom, relicIds = null, baseRes = null }) {
    const entry = {
        id: id,
        setName: buildName.split('(')[0].trim(),
        traitName: traitName,
        dps: res.total,
        bossDps: res.bossTotal,
        dmgVal: res.dmgVal,
        spa: res.spa,
        range: res.range,
        dot: res.dot || 0,
        bossDot: res.bossTotal - res.hit - res.summon, // Approximation if needed
        dotTotal: res.dotData ? (res.dotData.nativeTotalDmg + (res.dotData.radTotalDmg || 0)) : 0,
        prio: prio,
        mainStats: mainStats,
        subStats: {
            ...subStats,
            finalCf: (res.critData ? res.critData.rate : 0),
            finalCm: (res.critData ? res.critData.cdmg : 0)
        },
        headUsed: headUsed,
        isCustom: isCustom,
        placement: res.placement
    };
    if (baseRes) {
        entry.baseStats = {
            dmgVal: baseRes.dmgVal,
            spa: baseRes.spa,
            range: baseRes.range,
            cf: (baseRes.critData ? baseRes.critData.rate : 0),
            cm: (baseRes.critData ? baseRes.critData.cdmg : 0),
            dot: baseRes.dot || 0
        };
    }
    if (relicIds) entry.relicIds = relicIds;
    return entry;
}

function calculateUnitBuilds(unit, _stats, filteredBuilds, subCandidates, headsToProcess, includeSubs, specificTraitsOnly = null, isAbilityContext = false, mode = 'fixed') {
    if (inventoryMode && relicInventory && relicInventory.length > 0) return calculateInventoryBuilds(unit, null, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs);
    window.cachedResults = window.cachedResults || {};
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) activeTraits = specificTraitsOnly;
    else { const specificTraits = unitSpecificTraits[unit.id] || []; activeTraits = [...traitsList, ...customTraits, ...specificTraits]; }

    let unitResults = [];
    const { effectiveStats: baseEffective, isKiritoVR: baseVR } = buildCalculationContext(unit, 'ruler', { isAbility: isAbilityContext });
    const hasNativeDoT = (baseEffective.dot > 0) || (baseEffective.burnMultiplier > 0) || baseVR;
    let unitSubCandidates = [...subCandidates];
    if (!hasNativeDoT) unitSubCandidates = unitSubCandidates.filter(c => c !== 'dot');
    const subsSuffix = includeSubs ? '-SUBS' : '-NOSUBS';

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return;
        const { effectiveStats, context, isKiritoVR, suffix, modeTag } = buildCalculationContext(unit, trait, { isAbility: isAbilityContext, mode: mode });
        const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
        const isDotPossible = hasNativeDoT || traitAddsDot;
        const currentCandidates = (traitAddsDot) ? subCandidates : unitSubCandidates;
        const relevantBuilds = (!isDotPossible) ? filteredBuilds.filter(b => b.bodyType !== 'dot') : filteredBuilds;

        relevantBuilds.forEach(build => {
            let relevantHeads = headsToProcess.map(h => h === 'rebellious_head' ? 'bloodline_head' : h);
            if (!isDotPossible) relevantHeads = relevantHeads.filter(h => h !== 'ninja');
            // Bloodline head works for everyone now
            // if (!window.unitHasCC(effectiveStats)) relevantHeads = relevantHeads.filter(h => h !== 'bloodline_head');

            relevantHeads.forEach(headMode => {
                const runOpt = (dmgP, spaP, rangeP, optType) => {
                    context.dmgPoints = dmgP; context.spaPoints = spaP; context.rangePoints = rangeP;
                    effectiveStats.context = context;
                    return getBestSubConfig(build, effectiveStats, includeSubs, headMode, currentCandidates, optType);
                };

                const maxPts = context.maxPts || 99;
                const cfgDmg = runOpt(maxPts, 0, 0, 'dps');
                const cfgSpa = runOpt(0, maxPts, 0, 'dps');
                const cfgRaw = runOpt(maxPts, 0, 0, 'raw_dmg');
                const cfgRange = runOpt(0, 0, 99, 'range');

                const baseId = `${unit.id}${suffix}-${trait.id}-${build.name.replace(/[^a-zA-Z0-9]/g, '')}`;
                const processResult = (config, prioStr) => {
                    const res = config.res;
                    if (isNaN(res.total)) return;

                    const fullId = `${baseId}-${prioStr}${subsSuffix}-${headMode}${modeTag}`;
                    const entry = createResultEntry({
                        id: fullId, buildName: build.name, traitName: trait.name,
                        res: res, baseRes: null, prio: prioStr,
                        mainStats: { body: build.bodyType, legs: build.legType },
                        subStats: config.assignments, headUsed: config.assignments.selectedHead,
                        isCustom: trait.isCustom
                    });
                    window.cachedResults[fullId] = entry;
                    unitResults.push(entry);
                    return entry;
                };

                const dmgEntry = processResult(cfgDmg, "dmg");
                processResult(cfgSpa, "spa");
                processResult(cfgRaw, "raw_dmg");
                processResult(cfgRange, "range");
            });
        });
    });
    unitResults.sort((a, b) => b.dps - a.dps);
    return unitResults;
}
// Inventory Mode Calculation
function calculateInventoryBuilds(unit, _stats, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs, forcedRelic = null) {
    window.cachedResults = window.cachedResults || {};

    // 1. Determine Traits List
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) {
        activeTraits = specificTraitsOnly;
    } else {
        const specificTraits = unitSpecificTraits[unit.id] || [];
        activeTraits = [...traitsList, ...customTraits, ...specificTraits];
    }

    let unitResults = [];

    // 1. Separate Inventory by Slot
    const allowHeads = headsToProcess.some(h => h !== 'none');

    let heads = allowHeads ? relicInventory.filter(r => r.slot === 'Head') : [];
    const bodies = relicInventory.filter(r => r.slot === 'Body');
    const legs = relicInventory.filter(r => r.slot === 'Legs');

    // Apply Force Logic (Relic Optimality)
    if (forcedRelic) {
        if (forcedRelic.slot === 'Head') heads = [forcedRelic];
        if (forcedRelic.slot === 'Body') bodies = [forcedRelic];
        if (forcedRelic.slot === 'Legs') legs = [forcedRelic];
    }

    // Add 'None' options
    // Only add 'None' if we aren't forcing a specific relic in that slot
    if (!forcedRelic || forcedRelic.slot !== 'Head') heads.push({ id: 'none', slot: 'Head', setKey: 'none', stars: 1, mainStat: 'none', subs: {} });
    if ((!forcedRelic || forcedRelic.slot !== 'Body') && (bodies.length === 0 || !forcedRelic)) bodies.push({ id: 'none-b', slot: 'Body', setKey: 'none', stars: 1, mainStat: null, subs: {} });
    if ((!forcedRelic || forcedRelic.slot !== 'Legs') && (legs.length === 0 || !forcedRelic)) legs.push({ id: 'none-l', slot: 'Legs', setKey: 'none', stars: 1, mainStat: null, subs: {} });

    const cfgTag = `-${allowHeads ? 'H' : 'nH'}-${includeSubs ? 'S' : 'nS'}`;

    const bestMap = new Map();

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return;

        // Use Unified Context Builder
        const { effectiveStats, context, suffix, modeTag } = buildCalculationContext(unit, trait, {
            isAbility: isAbilityContext,
            mode: mode
        });

        heads.forEach(head => {
            bodies.forEach(body => {
                legs.forEach(leg => {

                    // A. Determine Set Bonus & Star Multiplier
                    let activeSetKey = 'none';
                    let starMult = 1;

                    if (body.setKey !== 'none' && body.setKey === leg.setKey) {
                        activeSetKey = body.setKey;
                        starMult = Math.min(body.stars || 1, leg.stars || 1);
                    }

                    // B. Construct Total Stats Object (Main + Subs)
                    let totalStats = { set: activeSetKey, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
                    const addStat = (type, val) => { if (totalStats[type] !== undefined) totalStats[type] += val; };

                    const getMainVal = (relic) => {
                        let base = 0;
                        if (!relic.mainStat || relic.mainStat === 'none') return 0;
                        if (relic.slot === 'Body') base = MAIN_STAT_VALS.body[relic.mainStat] || 0;
                        if (relic.slot === 'Legs') base = MAIN_STAT_VALS.legs[relic.mainStat] || 0;
                        return base * (relic.stars || 1);
                    };

                    [body, leg].forEach(r => {
                        if (r.id.startsWith('none')) return;
                        addStat(r.mainStat, getMainVal(r));
                        if (includeSubs) Object.entries(r.subs).forEach(([k, v]) => addStat(k, v));
                    });

                    if (head.id !== 'none' && includeSubs) {
                        Object.entries(head.subs).forEach(([k, v]) => addStat(k, v));
                    }

                    // C. Run Calculation Loops (DMG, SPA, RANGE)
                    const maxPts = context.maxPts || 99;
                    const calcVariations = [
                        { id: 'dmg', dmgPts: maxPts, spaPts: 0, rangePts: 0 },
                        { id: 'spa', dmgPts: 0, spaPts: maxPts, rangePts: 0 },
                        { id: 'range', dmgPts: 0, spaPts: 0, rangePts: 99 }
                    ];

                    calcVariations.forEach(prio => {
                        // Update context for this variation
                        context.dmgPoints = prio.dmgPts;
                        context.spaPoints = prio.spaPts;
                        context.rangePoints = prio.rangePts;
                        context.headPiece = head.setKey === 'none' ? 'none' : head.setKey;
                        context.starMult = starMult;

                        effectiveStats.context = context;

                        let res = calculateDPS(effectiveStats, totalStats, context);

                        // OPTIMIZATION: Only keep the best for this Trait + Priority + Set combination
                        // This prevents results from exploding into tens of thousands of entries
                        const bestKey = `${trait.id}-${prio.id}-${activeSetKey}-${head.setKey}`;
                        const currentBest = bestMap.get(bestKey);

                        if (!currentBest || res.total > currentBest.res.total) {
                            const entryId = `${unit.id}${suffix}-${trait.id}-INV-${head.id}_${body.id}_${leg.id}${modeTag}${cfgTag}-${prio.id}`;

                            // UI Formatting
                            const formatSubs = (relic) => Object.entries(relic.subs).map(([k, v]) => ({ type: k, val: v }));
                            let subStatsUI = {
                                head: (includeSubs && head.id !== 'none') ? formatSubs(head) : null,
                                body: (includeSubs && body.id !== 'none-b') ? formatSubs(body) : null,
                                legs: (includeSubs && leg.id !== 'none-l') ? formatSubs(leg) : null,
                                selectedHead: head.setKey
                            };

                            const setName = activeSetKey !== 'none' ? SETS.find(s => s.id === activeSetKey)?.name : "Mixed Set";

                            bestMap.set(bestKey, {
                                entryId,
                                setName,
                                traitName: trait.name,
                                res,
                                prioId: prio.id,
                                bodyMain: body.mainStat,
                                legMain: leg.mainStat,
                                subStatsUI,
                                headSet: head.setKey,
                                isCustom: trait.isCustom,
                                relicIds: { head: head.id, body: body.id, legs: leg.id }
                            });
                        }
                    }); // end variation loop

                }); // end leg
            }); // end body
        }); // end head
    }); // end trait

    // Finalize Results
    bestMap.forEach(v => {
        const entry = createResultEntry({
            id: v.entryId,
            buildName: v.setName,
            traitName: v.traitName,
            res: v.res,
            prio: v.prioId,
            mainStats: { body: v.bodyMain, legs: v.legMain },
            subStats: v.subStatsUI,
            headUsed: v.headSet,
            isCustom: v.isCustom,
            relicIds: v.relicIds
        });
        window.cachedResults[v.entryId] = entry;
        unitResults.push(entry);
    });

    unitResults.sort((a, b) => b.dps - a.dps);
    return unitResults;
}

function reconstructMathData(liteData, forcedUpgradeLevel = undefined, ctxOverrides = {}) {
    if (!liteData || !liteData.id) throw new Error("Invalid data for reconstruction");

    const unitId = liteData.id.split('-')[0];
    const unit = unitDatabase.find(u => u.id === unitId);
    if (!unit) return null;

    // 1. Identify Context from ID Tags (Support both Static ID and Live Toggle)
    const isAbility = liteData.id.includes('ABILITY') || (typeof activeAbilityIds !== 'undefined' && activeAbilityIds.has(unitId));
    const isBuggedMode = liteData.id.includes('-b-');
    const isFixedMode = liteData.id.includes('-f-');
    const isNoSubsMode = liteData.id.includes('-NOSUBS');

    // Determine Logic State based on ID (Override global state for reconstruction)
    const previousDotState = statConfig.applyRelicDot;
    const previousCritState = statConfig.applyRelicCrit;

    if (isBuggedMode) { statConfig.applyRelicDot = false; statConfig.applyRelicCrit = true; }
    else if (isFixedMode) { statConfig.applyRelicDot = true; statConfig.applyRelicCrit = true; }

    const isSpaPrio = liteData.prio === 'spa';
    const isRangePrio = liteData.prio === 'range';

    // Use a large value to allow buildCalculationContext to cap at the correct maxPts for the E-level
    let dmgPts = isSpaPrio || isRangePrio ? 0 : 999;
    let spaPts = isSpaPrio ? 999 : 0;
    let rangePts = isRangePrio ? 999 : 0;

    // Use Unified Context Builder
    // NOTE: passing traitName here, helper will resolve it
    const { effectiveStats, context } = buildCalculationContext(unit, liteData.traitName, {
        isAbility,
        dmgPoints: dmgPts,
        spaPoints: spaPts,
        rangePoints: rangePts,
        headPiece: liteData.headUsed || (liteData.subStats && liteData.subStats.selectedHead) || 'none',
        upgradeLevel: forcedUpgradeLevel
    });

    if (ctxOverrides) Object.assign(context, ctxOverrides);

    // Auto-sync hotbar buff toggles into context for hotbar units
    if (context.isHotbar && window.hotbarState && window.hotbarState.buffState) {
        Object.entries(window.hotbarState.buffState).forEach(([key, val]) => {
            if (val === true) {
                const buffConfig = (window.GLOBAL_BUFF_DATA || {})[key];
                if (buffConfig && buffConfig.stateKey) {
                    context[buffConfig.stateKey] = true;
                }
            }
        });
    }

    // Set Entry
    const setEntry = getSetFast(liteData.setName) || SETS[2];
    let totalStats = { set: setEntry.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };

    const mapStatKey = (k) => {
        if (k === 'cdmg' || k === 'crit dmg') return 'cm';
        if (k === 'crit' || k === 'crit rate') return 'cf';
        return k;
    };

    if (liteData.mainStats) {
        if (liteData.mainStats.body) { const k = mapStatKey(liteData.mainStats.body); if (MAIN_STAT_VALS.body[k]) totalStats[k] += MAIN_STAT_VALS.body[k]; }
        if (liteData.mainStats.legs) { const k = mapStatKey(liteData.mainStats.legs); if (MAIN_STAT_VALS.legs[k]) totalStats[k] += MAIN_STAT_VALS.legs[k]; }
    }

    // 1. Add explicitly stored sub-stats
    if (liteData.subStats) {
        ['head', 'body', 'legs'].forEach(slot => {
            if (liteData.subStats[slot] && Array.isArray(liteData.subStats[slot])) {
                liteData.subStats[slot].forEach(sub => {
                    if (sub.type && sub.val) {
                        const k = mapStatKey(sub.type);
                        totalStats[k] = (totalStats[k] || 0) + sub.val;
                    }
                });
            }
        });
    }

    // 2. FILL MISSING BASE STATS (Auto-fill for Static DB)
    // Only needed if we didn't have explicit substats in the liteData (older db format or static fallback)
    const addBaseFills = (slot, mainStatType) => {
        const existingTypes = new Set();
        if (liteData.subStats && liteData.subStats[slot] && Array.isArray(liteData.subStats[slot])) {
            liteData.subStats[slot].forEach(s => existingTypes.add(mapStatKey(s.type)));
        }
        const mappedMain = mapStatKey(mainStatType);

        const validCandidates = SUB_CANDIDATES.filter(c => {
            if (!statConfig.applyRelicDot && c === 'dot') return false;
            if (!statConfig.applyRelicCrit && (c === 'cm' || c === 'cf')) return false;
            return true;
        });

        validCandidates.forEach(cand => {
            if (cand === mappedMain) return;
            if (existingTypes.has(cand)) return;
            totalStats[cand] = (totalStats[cand] || 0) + PERFECT_SUBS[cand];
        });
    };

    if (!isNoSubsMode && liteData.headUsed && liteData.headUsed !== 'none') {
        addBaseFills('head', null);
    }
    if (!isNoSubsMode && liteData.mainStats) {
        addBaseFills('body', liteData.mainStats.body);
        addBaseFills('legs', liteData.mainStats.legs);
    }

    // Run Calc
    effectiveStats.context = context;
    const result = calculateDPS(effectiveStats, totalStats, context);

    // Re-attach identity info for the UI
    result.setName = liteData.setName;
    result.traitName = liteData.traitName;

    // Restore Config
    statConfig.applyRelicDot = previousDotState;
    statConfig.applyRelicCrit = previousCritState;

    return result;
}

// ==========================================================
// CORE CALCULATION PIPELINE
// ==========================================================

function calculateDPS(uStats, relicStats, context) {
    const { dmgPoints, spaPoints, rangePoints, wave, isBoss, traitObj, placement, isSSS, headPiece, isVirtualRealm, starMult, isAbility, upgradeLevel } = context;

    let lvStats = getLevelStats(uStats.dmg, uStats.spa, uStats.range || 0, dmgPoints, spaPoints, rangePoints);
    let rDmg = 0, rSpa = 0, rRange = 0;
    if (context.rankData) { rDmg = context.rankData.dmg || 0; rSpa = context.rankData.spa || 0; rRange = context.rankData.range || 0; }
    else if (isSSS) { rDmg = 20; rSpa = 8; rRange = 20; }
    if (rDmg !== 0) lvStats.dmg *= (1 + rDmg / 100);
    if (rSpa !== 0) lvStats.spa *= (1 - rSpa / 100);
    if (rRange !== 0) lvStats.range *= (1 + rRange / 100);

    let passivePcent = (uStats.buffDmg || 0);
    let passiveSpaPcent = 0;
    let passiveRangePcent = 0;
    let trueDmgFromPassives = 0;
    let passiveCritFromPassives = 0;
    let passiveCdmgFromPassives = 0;
    let passiveDotFromPassives = 0;
    let passiveBreakdown = [];

    if (uStats.passiveDmg) passivePcent += uStats.passiveDmg;
    if (uStats.passiveSpa) passiveSpaPcent += uStats.passiveSpa;
    if (uStats.passiveRange) passiveRangePcent += uStats.passiveRange;
    if (uStats.passiveCrit) passiveCritFromPassives += uStats.passiveCrit;
    if (uStats.passiveCdmg) passiveCdmgFromPassives += uStats.passiveCdmg;

    // Attribute root-level passives to breakdown
    if (uStats.passiveDmg || uStats.passiveSpa || uStats.passiveRange || uStats.passiveCrit || uStats.passiveCdmg) {
        passiveBreakdown.push({
            name: "Unit Base (Passive)",
            dmg: uStats.passiveDmg || 0,
            spa: uStats.passiveSpa || 0,
            range: uStats.passiveRange || 0,
            crit: uStats.passiveCrit || 0,
            cdmg: uStats.passiveCdmg || 0,
            trueDmg: 0,
            dot: 0
        });
    }

    if (uStats.passives && Array.isArray(uStats.passives)) {
        uStats.passives.forEach(p => {
            let pDmg = p.passiveDmg || 0;
            let pSpa = p.passiveSpa || 0;
            let pRange = p.passiveRange || 0;
            let pTrue = p.trueDmg || 0;
            let pCrit = p.passiveCrit || 0;
            let pCdmg = p.passiveCdmg || 0;
            let pDot = p.dot || 0;
            if (p.name === "Brutal Slashes") {
                pDot = (upgradeLevel >= 6) ? 120 : 100;
            }

            if (isUnit(uStats.id, 'underworld_god') && p.name === "As The Eldest Brother") {
                const hbStats = getCachedHotbarStats();
                // EXCLUDE SELF: Divinity count already includes self, so we subtract 
                // the divinity value of this specific unit to get "other divinity"
                let divinityCount = hbStats.divinityCount;
                if (uStats.tags && uStats.tags.includes('Divinity')) {
                    let selfCount = uStats.placement || 1;
                    if (isUnit(uStats.id, 'water_god')) selfCount = Math.max(0, selfCount - 1);
                    divinityCount = Math.max(0, divinityCount - selfCount);
                }

                const maxBuff = (context.upgradeLevel >= 2) ? 90 : 60;
                pDmg = Math.min(maxBuff, divinityCount * 15);
            }

            // SPECIAL: King Sailor Loadout Mode Overrides
            if (window.CALCULATION_MODE === 'loadout' && isUnit(uStats.id, 'king_sailor')) {
                if (p.name === "Manipulator of Fate") {
                    pDmg = 0;
                    pSpa = 0;

                    const hbStats = getCachedHotbarStats();
                    if (!hbStats.idsInHotbar.has('king_sailor')) {
                        pDmg = 0;
                        pSpa = 0;
                    } else {
                        const ksTags = uStats.tags || ["Magi", "King", "Hero", "Uncontrollable Power"];
                        let matchPlacements = 0;
                        let mismatchPlacements = 0;

                        const hotbarSlots = window.hotbarState?.slots || [];
                        hotbarSlots.forEach((s) => {
                            if (!s) return;
                            // Skip King Sailor himself
                            if (s.id === uStats.id || isUnit(s.id, uStats.id)) return;

                            const sUnit = window.getUnitById(s.id);

                            // Determine placement for this slot
                            let sPlacement = (sUnit ? sUnit.placement : s.placement) || 1;

                            // Check for Assistant tag or specific assistant units
                            const isAssistant = (sUnit?.tags && sUnit.tags.includes('Assistant')) ||
                                (s.tags && s.tags.includes('Assistant')) ||
                                isUnit(s.id, 'speedwagon') || isUnit(s.id, 'bulma');

                            // RULE: Assistants only count as 1 placement for King Sailor
                            if (isAssistant) {
                                sPlacement = 1;
                            } else {
                                const sTraitId = (window.unitTraits && window.unitTraits[s.id]);
                                if (sTraitId) {
                                    const sTrait = getTraitFast(sTraitId);
                                    if (sTrait && sTrait.limitPlace !== undefined) {
                                        sPlacement = Math.min(sPlacement, sTrait.limitPlace);
                                    }
                                }
                            }

                            const sTags = (sUnit ? sUnit.tags : s.tags) || [];
                            const hasMatch = ksTags.some(tag => sTags.includes(tag));

                            if (hasMatch) {
                                matchPlacements += sPlacement;
                            } else {
                                mismatchPlacements += sPlacement;
                            }

                            // User request: Phantom Captain planes count as placements for King Sailor (tagless = mismatch)
                            if (isUnit(s.id, 'phantom_captain') && sUnit?.summonStats?.maxCount) {
                                mismatchPlacements += sUnit.summonStats.maxCount;
                            }
                        });

                        // 10% DMG per matching placement, 5% SPA per mismatching placement
                        pDmg = Math.min(50, matchPlacements * 10);
                        pSpa = Math.min(25, mismatchPlacements * 5);
                    }
                }
            }

            // SPECIAL: Ant King (Savage) - Monarch's Devotion in Loadout Mode
            if (window.CALCULATION_MODE === 'loadout' && window.isUnit(uStats.id, 'ant_king_savage')) {
                if (p.name === "Monarch's Devotion") {
                    const hotbar = window.hotbarState;
                    const jinooPresent = hotbar && hotbar.slots && hotbar.slots.some(s => s && (window.isUnit(s.id, 'jinoo_shadow_monarch') || window.isUnit(s.id, 'sjw')));
                    if (jinooPresent) {
                        pDmg = 20;
                        pRange = 10;
                    } else {
                        pDmg = 0;
                        pRange = 0;
                    }
                }
            }


            // Conditional Logic: Unrivaled Mark only applies if in Slot 1 (Leader)
            if (p.name === "Unrivaled Mark") {
                const isPotential = window.CALCULATION_MODE === 'potential';
                if (!isPotential) {
                    const hotbar = window.hotbarState;
                    if (hotbar && hotbar.slots) {
                        const slotIdx = hotbar.slots.findIndex(s => s && (s.id === uStats.id || s.id.split('-')[0] === uStats.id));
                        if (slotIdx !== 0) return; // Skip if not leader
                    }
                }
            }

            if (p.buffedByJunior && headPiece === 'junior') {
                pDmg *= 1.1;
                pSpa *= 1.1;
                pTrue *= 1.1;
                pCrit *= 1.1;
                pCdmg *= 1.1;
                pDot *= 1.1;
            }

            const isKsDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit(uStats.id, 'king_sailor') && (p.name === "Manipulator of Fate" || p.name === "Unrivaled Mark"));
            const isAkDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit(uStats.id, 'ant_king_savage') && p.name === "Monarch's Devotion");
            const isUgDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit(uStats.id, 'underworld_god') && p.name === "As The Eldest Brother");

            if (p.name === "Pirate Hunter" && (context.isBoss || (typeof window !== 'undefined' && window.ttBossActive))) {
                const bossDmgBuff = (upgradeLevel >= 4) ? 65 : 50;
                pDmg += bossDmgBuff;
                pCrit += 50;
            }

            if (pDmg !== 0 || pSpa !== 0 || pRange !== 0 || pTrue !== 0 || pCrit !== 0 || pCdmg !== 0 || pDot !== 0 || isKsDynamic || isAkDynamic || isUgDynamic) {
                passivePcent += pDmg;
                passiveSpaPcent += pSpa;
                passiveRangePcent += pRange;
                trueDmgFromPassives += pTrue;
                passiveCritFromPassives += pCrit;
                passiveCdmgFromPassives += pCdmg;
                passiveDotFromPassives += pDot;
                if (p.dotDuration && !uStats.dotDuration) uStats.dotDuration = p.dotDuration;
                passiveBreakdown.push({ name: p.name, dmg: pDmg, spa: pSpa, range: pRange, trueDmg: pTrue, crit: pCrit, cdmg: pCdmg, dot: pDot });
            }
        });
    }

    // STRONGEST HUNTER: Team buff from Jinoo (Shadow Monarch) to Leveling units
    if (window.CALCULATION_MODE === 'loadout' && !isUnit(uStats.id, 'jinoo_shadow_monarch') && !isUnit(uStats.id, 'sjw')) {
        const hbStats = getCachedHotbarStats();
        if (hbStats.jinooPresent) {
            if (uStats.tags && uStats.tags.includes('Leveling')) {
                // Find Jinoo's E-level to determine buff strength
                const jinooSlot = window.hotbarState?.slots.find(s => s && (isUnit(s.id, 'jinoo_shadow_monarch') || isUnit(s.id, 'sjw')));
                const jinooELevel = (jinooSlot && window.unitELevels && window.unitELevels[jinooSlot.id] !== undefined) ? window.unitELevels[jinooSlot.id] : 0;

                let buffDmg = 20;
                if (jinooELevel >= 4) buffDmg = 30;

                // Shadow Knight specific buff
                if (isUnit(uStats.id, 'shadow_knight')) {
                    buffDmg = (jinooELevel >= 4) ? 50 : 40;
                }

                passivePcent += buffDmg;
                passiveBreakdown.push({ name: "Strongest Hunter", dmg: buffDmg, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
            }
        }
    }

    // MONARCH'S DEVOTION: Team buff from Ant King (Savage) when Jinoo is in loadout
    if (window.CALCULATION_MODE === 'loadout' && !isUnit(uStats.id, 'ant_king_savage')) {
        const hbStats = getCachedHotbarStats();
        if (hbStats.akPresent && hbStats.jinooPresent) {
            passivePcent += 10;
            passiveBreakdown.push({ name: "Monarch's Devotion", dmg: 10, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
        }
    }

    const totalBossDmg = (uStats.bossDmg || 0) + (traitObj.bossDmg || 0);
    const bossMult = 1 + (totalBossDmg / 100);
    let traitDmgPct = traitObj.dmg;
    let traitSpaPct = traitObj.spa;
    let traitCritRate = traitObj.critRate || 0, traitRangePct = traitObj.range || 0, traitDotBuff = (traitObj.dotBuff || 0) + (uStats.dotBuff || 0);

    let eternalDmgBuff = 0, eternalRangeBuff = 0;
    if (traitObj.isEternal) { const waveCap = Math.min(wave, 12); eternalDmgBuff = waveCap * 5; passivePcent += eternalDmgBuff; eternalRangeBuff = waveCap * 2.5; }

    let { sBonus, tagBuffs, setPerkDmg } = _calcSetAndTagBonuses(relicStats, uStats, headPiece, context);
    if (starMult && starMult !== 1) { for (let key in sBonus) { if (typeof sBonus[key] === 'number') sBonus[key] *= starMult; } }

    const getRelicStat = (stat, apply) => apply ? relicStats[stat] : 0;
    let baseR_Dmg = getRelicStat('dmg', statConfig.applyRelicDmg), baseR_Spa = getRelicStat('spa', statConfig.applyRelicSpa);
    let baseR_Cm = getRelicStat('cm', statConfig.applyRelicCrit), baseR_Cf = relicStats.cf;
    let baseR_Dot = getRelicStat('dot', statConfig.applyRelicDot), baseR_Range = relicStats.range || 0;

    if (traitObj.relicBuff) {
        const mult = traitObj.relicBuff;
        baseR_Dmg = ((1 + baseR_Dmg / 100) * mult - 1) * 100;
        baseR_Range = ((1 + baseR_Range / 100) * mult - 1) * 100;
        baseR_Spa *= mult;
        baseR_Cm *= mult;
        baseR_Dot *= mult;
        baseR_Cf *= mult;
    }

    // --- DYNAMIC GLOBAL BUFF AGGREGATOR ---
    let globalDmg = 0, globalSpa = 0, globalRange = 0, globalCrit = 0, globalCdmg = 0;
    let activeGlobalBuffs = {};

    if (typeof window !== 'undefined' && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            // Priority: context override -> global window state
            let isActive = false;
            const overrideKey = buff.id + 'Buff'; // e.g. mikuBuff

            if (context[overrideKey] !== undefined) {
                isActive = context[overrideKey];
            } else if (context[buff.stateKey] !== undefined) {
                isActive = context[buff.stateKey];
            } else {
                isActive = window[buff.stateKey];
            }


            if (isActive) {
                const buffStats = buff.math(uStats, context);

                // JUNIOR NINJA 1.1x Multiplier for specific global buffs (Dmg/SPA based)
                if (headPiece === 'junior' && ['miku', 'enlightenedgod', 'ksailor', 'bijuu', 'magehill'].includes(buff.id)) {
                    if (buffStats.dmg) buffStats.dmg *= 1.1;
                    if (buffStats.spa) buffStats.spa *= 1.1;
                }

                activeGlobalBuffs[buff.id] = buffStats;
                if (buffStats.dmg) globalDmg += buffStats.dmg;
                if (buffStats.spa) globalSpa += buffStats.spa;
                if (buffStats.range) globalRange += buffStats.range;
                if (buffStats.crit) globalCrit += buffStats.crit;
                if (buffStats.cdmg) globalCdmg += buffStats.cdmg;
            }
        });

    }

    // Apply Junior Ninja 1.1x Multiplier to Passives & Tags BEFORE values are consumed by totals
    if (headPiece === 'junior') {
        if (tagBuffs.dmg) {
            const extraTagDmg = tagBuffs.dmg * 0.1;
            tagBuffs.dmg += extraTagDmg;
            sBonus.dmg = (sBonus.dmg || 0) + extraTagDmg;
        }
        if (tagBuffs.spa) {
            const extraTagSpa = tagBuffs.spa * 0.1;
            tagBuffs.spa += extraTagSpa;
            sBonus.spa = (sBonus.spa || 0) + extraTagSpa;
        }
    }

    const tags = uStats.tags || [];



    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + globalRange + (uStats.id === 'king_sailor' ? 10 : 0);
    const finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);

    let setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + globalSpa;
    let warlordSpa = 0;

    if (headPiece === 'warlord_hat') {
        const isPotential = (typeof window !== 'undefined') ? (window.CALCULATION_MODE === 'potential') : true;
        let spaReduction = 10;
        if (!isPotential && typeof window !== 'undefined') {
            let otherPlacements = 0;
            const hotbarSlots = window.hotbarState?.slots || [];
            hotbarSlots.forEach(s => {
                if (!s) return;
                if (s.id === uStats.id || isUnit(s.id, uStats.id)) return;
                const sUnit = window.getUnitById(s.id);
                let sPlacement = (sUnit ? sUnit.placement : s.placement) || 1;
                otherPlacements += sPlacement;
            });
            spaReduction = Math.min(10, otherPlacements * 2);
        }
        warlordSpa = spaReduction;
        setAndPassiveSpa += spaReduction;
    }


    // Nutaru (Beast) dynamic SPA Cap override
    const effectiveSpaCap = (isAbility && uStats.id === 'nutaru_beast') ? 3.0 : (uStats.spaCap || 0.1);

    const spaAfterRelic = lvStats.spa * (1 - traitSpaPct / 100) * (1 - baseR_Spa / 100);
    const rawFinalSpa = spaAfterRelic * (1 - setAndPassiveSpa / 100);
    const finalSpa = Math.max(rawFinalSpa, effectiveSpaCap);

    const { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc } = _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats, relicStats, context);

    let abilityDmg = 0;
    let abilityFinalMult = 1;
    if (isAbility && uStats.ability) {
        const ab = Array.isArray(uStats.ability) ? uStats.ability[0] : uStats.ability;
        const mappedToPassive = ab.abilityName && uStats.passives && uStats.passives.some(p => p.name === ab.abilityName);
        if (ab.buffDmg && !mappedToPassive) abilityDmg = ab.buffDmg;
        if (ab.finalMult) abilityFinalMult = ab.finalMult;
    }

    // --- SYNERGY CHECKS (e.g. requiresDot) ---
    // Only enforce in Loadout mode; Potential mode assumes synergy is always met
    if (uStats.requiresDot && window.CALCULATION_MODE === 'loadout') {
        const hotbar = window.hotbarState;
        let met = false;
        if (hotbar && hotbar.slots) {
            met = hotbar.slots.some(s => {
                if (!s || s.id.split('-')[0] === uStats.id.split('-')[0]) return false;
                const sUnit = window.getUnitById(s.id);
                if (!sUnit) return false;

                // 1. Check base unit for the required DoT
                if (sUnit.stats && sUnit.stats.dotType === uStats.requiresDot && (sUnit.stats.dot > 0 || (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === uStats.requiresDot))) return true;

                // 2. Check current mode of the unit
                const sMode = (window.unitModesState && window.unitModesState[sUnit.id]) || 0;
                if (sUnit.modes && sUnit.modes[sMode]) {
                    const m = sUnit.modes[sMode];
                    if (m.dotType === uStats.requiresDot && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotType === uStats.requiresDot))) return true;
                }
                return false;
            });
        }

        // If not met in Loadout mode (or potential mode if we want strict logic), zero the DoT
        if (!met) {
            uStats.dot = 0;
        }
    }

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + globalDmg + abilityDmg;

    // --- WARLORD DYNAMIC SET BONUS ---
    let warlordData = null;
    if (relicStats.set === 'warlord') {
        // Estimate final crit rate to determine trigger time
        const estCritRate = Math.min(uStats.crit + traitCritRate + globalCrit + (headCalc.crit || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives, 100);
        if (estCritRate > 0) {
            const attacksToCrit = Math.max(1, 1 / (estCritRate / 100));
            const timeToTrigger = attacksToCrit * finalSpa;
            const cycleTime = timeToTrigger + 20 + 10;
            const uptime = 20 / cycleTime;
            const warlordDmg = 45 * uptime;
            additiveTotal += warlordDmg;
            setPerkDmg += warlordDmg; // Add to UI display
            warlordData = {
                critRate: estCritRate,
                attacksToCrit,
                timeToTrigger,
                cycleTime,
                uptime,
                dmg: warlordDmg
            };
        }
    }

    // Detailed breakdown for UI
    const detailedBuffs = {
        setBase: (sBonus.dmg || 0) - (tagBuffs.dmg || 0) - (relicStats.set === 'great_mage' ? 18 : 0) - (relicStats.set === 'monarch' ? setPerkDmg : 0),
        setPerk: setPerkDmg + headDmgPassive,
        tagBonus: (tagBuffs.dmg || 0) + headDmgTag,
        unitPassive: passivePcent,
        abilityBuff: abilityDmg,
        accessoryBase: headDmgBase,
        globalBuffs: globalDmg,
        passiveBreakdown: passiveBreakdown
    };



    const finalDmgNormal = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * abilityFinalMult;
    let finalDmg = finalDmgNormal;
    let finalDmgBoss = finalDmgNormal;

    if (uStats.id === 'triple_threat') {
        const bossDmgBuff = (upgradeLevel >= 4) ? 65 : 50;
        const additiveTotalBoss = (sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + globalDmg + bossDmgBuff; // +Boss Dmg, disables King of Heck abilityDmg
        finalDmgBoss = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotalBoss / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * 1;
    }

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + globalCdmg + (headCalc.cdmg || 0) + passiveCdmgFromPassives;
    let finalCritRate = Math.min(uStats.crit + traitCritRate + globalCrit + (headCalc.crit || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives, 100);
    if (uStats.id === 'kirito' || uStats.id === 'the_strongest_of_today') {
        finalCritRate = Math.min(finalCritRate, uStats.crit);
    }

    if (headPiece === 'sorcerer_hunter_spirit') finalCritRate = 0;

    let finalCritRateBoss = finalCritRate;
    if (uStats.id === 'triple_threat') {
        finalCritRateBoss = Math.min(finalCritRate + 50, 100); // +50% Boss Crit Rate
    }

    let finalCdmgStatBoss = finalCdmgStat;
    if (uStats.id === 'triple_threat' && isAbility) {
        finalCdmgStatBoss = finalCdmgStat - 100; // Disables King of Heck +100% CDmg against Bosses
    }

    const avgCritMult = (1 + ((finalCdmgStat / 100) * (finalCritRate / 100)));
    const avgCritMultBoss = (1 + ((finalCdmgStatBoss / 100) * (finalCritRateBoss / 100)));
    const avgHit = finalDmg * avgCritMult;
    const avgHitBoss = finalDmgBoss * avgCritMultBoss;
    const avgHitNormal = finalDmgNormal * avgCritMult;

    // --- SPECIAL ATTACK RATE LOGIC ---
    let attackMultiplier = 1;
    let extraAttacksData = null;
    let usedSpa = finalSpa;

    if (uStats.id === 'rohan') {
        const probs = [0.40, 0.35, 0.30, 0.25, 0.20];
        let cumulativeProbs = [];
        let currentProb = 1.0;

        for (let i = 0; i < probs.length; i++) {
            currentProb *= probs[i];
            cumulativeProbs.push(currentProb);
        }

        const sumP = cumulativeProbs.reduce((a, b) => a + b, 0);
        const expectedAttacks = 1 + sumP;
        const expectedTime = finalSpa + (sumP * (uStats.spaCap || 3.0));
        usedSpa = expectedTime / expectedAttacks;

        const robotMult = (!isAbility) ? 1.04 : 1.0;
        const fifthChainProb = cumulativeProbs[4];
        const dmgSumFactor = (1 + sumP + (fifthChainProb * 0.5));
        const avgDmgMult = dmgSumFactor / expectedAttacks;

        attackMultiplier = avgDmgMult * robotMult;
        extraAttacksData = {
            req: (!isAbility) ? "Robot (5th Atk) + Chain" : "Chain Condition",
            hits: `Avg ${expectedAttacks.toFixed(2)} Hits/Seq`,
            extra: expectedAttacks - 1,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Rohan Mechanics"
        };
    } else if (uStats.id === 'super_roku' && isAbility) {
        attackMultiplier = 0.65;
        extraAttacksData = { req: "Same Target", hits: "Avg 65% Dmg", extra: 0, attacksNeeded: 1, mult: 0.65, label: "Combo Decay" };
    } else if (uStats.id === 'cell' && !isAbility) {
        usedSpa = finalSpa + 1.5;
        attackMultiplier = 1.5;
        extraAttacksData = { req: "Follow-up hit", hits: "1.5x Dmg / Cycle", extra: 0, attacksNeeded: 1, mult: 1.5 };
    } else if (uStats.id === 'water_god' && uStats.followUp) {
        usedSpa = Math.max(finalSpa, effectiveSpaCap * 2);
        attackMultiplier = 2;
        extraAttacksData = {
            req: "Per-attack Follow-up",
            hits: `2 hits / cycle (cap: ${effectiveSpaCap}s × 2 = ${effectiveSpaCap * 2}s min)`,
            extra: 1,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: `Water God Follow-up (${effectiveSpaCap}s window)`
        };
    } else if (uStats.id === 'king_sailor') {
        const tickCount = 1;
        const tickDmg = 0.20;
        attackMultiplier = 1; // Base attacks don't get multiplied here since lightning bypasses true dmg
        extraAttacksData = {
            req: "Baal's Lightning",
            hits: `1 + ${tickCount} Tick`,
            extra: tickCount * tickDmg,
            attacksNeeded: 1,
            mult: 1.20, // For UI display only
            label: "Chain Lightning",
            tickDmgVal: finalDmg * tickDmg,
            avgTick: (finalDmg * tickDmg), // NO crit
            totalChain: (finalDmg * tickDmg * tickCount) // NO crit
        };
    } else if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        const atkAnim = uStats.spaCap || 0.1;
        const fuaAnim = uStats.customFollowUp.fuaAnimation || 0;

        // Cycle time accounting for animation delay (Poseidon-style)
        // If FUA triggers, the cycle is capped by (atkAnim + fuaAnim)
        const timeIfFua = Math.max(finalSpa, atkAnim + fuaAnim);
        const timeIfNoFua = Math.max(finalSpa, atkAnim);
        usedSpa = (chance / 100) * timeIfFua + (1 - (chance / 100)) * timeIfNoFua;

        const avgExtraHits = (chance / 100) * uStats.customFollowUp.dmgMult;
        attackMultiplier = 1 + avgExtraHits;
        extraAttacksData = {
            req: `Follow-Up (${chance}%)`,
            hits: `1 + ${uStats.customFollowUp.dmgMult}x`,
            extra: avgExtraHits,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Shadow Emerge",
            usedSpa: usedSpa // Store for math rendering
        };
    } else if (uStats.id === 'alpha_devil') {
        // Phantom Swords: 2 swords, 10% dmg/tick, 10 ticks, 20s Cooldown. Can Crit.
        const swordCount = 2;
        const swordDmgPct = 0.10;
        const swordTicks = 10;
        const swordCooldown = 20;

        // Average DPS = (Count * Ticks * DmgPct * avgHit) / Cooldown
        const avgSwordDps = (swordCount * swordTicks * swordDmgPct * avgHit) / swordCooldown;

        attackMultiplier = 1 + (avgSwordDps * usedSpa / avgHit);
        extraAttacksData = {
            req: "Phantom Swords (On Crit)",
            hits: `${swordCount} Swords / 20s`,
            extra: avgSwordDps * usedSpa / avgHit,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Show me your motivation",
            swordDps: avgSwordDps
        };
    } else if (uStats.followUp) {
        attackMultiplier = 1 + (uStats.followUp / 100);
        extraAttacksData = { req: "N/A", hits: attackMultiplier, extra: uStats.followUp / 100, attacksNeeded: 1, mult: attackMultiplier, label: "Chain Lightning" };
    } else if (uStats.reqCrits && uStats.hitCount) {
        const critsPerAttack = uStats.hitCount * (finalCritRate / 100);
        if (critsPerAttack > 0) {
            const attacksToTrigger = uStats.reqCrits / critsPerAttack;
            attackMultiplier = 1 + (uStats.extraAttacks / attacksToTrigger);
            extraAttacksData = { req: uStats.reqCrits, hits: uStats.hitCount, extra: uStats.extraAttacks, attacksNeeded: attacksToTrigger, mult: attackMultiplier };
        }
    }

    let hitDpsTotal = ((avgHit / usedSpa) * placement * attackMultiplier);
    let bossHitDpsTotal = ((avgHitBoss / usedSpa) * placement * attackMultiplier);
    let normalHitDpsTotal = ((avgHitNormal / usedSpa) * placement * attackMultiplier);

    if (uStats.id === 'triple_threat') {
        const followUpDps = ((0.75 * avgHit) / 15) * placement;
        const followUpDpsBoss = ((0.75 * avgHitBoss) / 15) * placement;
        hitDpsTotal += followUpDps;
        bossHitDpsTotal += followUpDpsBoss;
    }

    // True Damage Conversion Logic (No longer a multiplier)
    let trueDmgPct = ((uStats.trueDmg || 0) + trueDmgFromPassives);
    if (relicStats.set === 'sorcerer_hunter') {
        trueDmgPct += 15;
    }

    const trueDmgVal = hitDpsTotal * (trueDmgPct / 100);
    const normalDmgVal = hitDpsTotal * (1 - trueDmgPct / 100);
    let finalHitDps = hitDpsTotal;
    let finalBossHitDps = bossHitDpsTotal;

    // Add King Sailor's Chain Lightning DPS (NO Crit, No True Damage)
    let chainLightningDps = 0;
    if (uStats.id === 'king_sailor') {
        chainLightningDps = ((finalDmg * 0.20) / usedSpa) * placement;
        finalHitDps += chainLightningDps;
        finalBossHitDps += ((finalDmgBoss * 0.20) / usedSpa) * placement;
    }

    let { summonDpsTotal, summonData } = _calcSummonDPS(uStats, finalDmg, finalSpa, placement);

    if (uStats.customSummons && uStats.customSummons.length > 0) {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;

        if (!summonData) summonData = {};
        summonData.isCustom = true;
        summonData.summons = [];
        let cDpsTotal = 0;

        const state = (window.unitModesState || {})[uStats.id];
        const isMulti = !!uStats.allowMultipleModes;
        const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? (uStats.id === 'jinoo_shadow_monarch' ? [0] : []) : [0]));

        uStats.customSummons.forEach((s, sIdx) => {
            if (upLevel >= s.reqUp) {
                // Check if this summon is enabled by the current mode (for Sukuna)
                let isEnabled = true;
                if (uStats.id === 'the_strongest_in_history') {
                    isEnabled = false;
                    if (activeModes.includes(1) && sIdx === 0) isEnabled = true;
                    if (activeModes.includes(2) && sIdx === 1) isEnabled = true;
                } else if (uStats.id === 'jinoo_shadow_monarch') {
                    isEnabled = activeModes.includes(sIdx);
                    // System Level requirements
                    const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                        ? window.unitSystemLevels[uStats.id]
                        : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);

                    if (sIdx === 1 && sysLvl < 40) isEnabled = false;
                    if (sIdx === 2 && sysLvl < 60) isEnabled = false;
                    if (sIdx === 3 && sysLvl < 80) isEnabled = false;
                    if (sIdx === 4 && sysLvl < 100) isEnabled = false;
                }

                if (!isEnabled) return;
                let sDmgMult = s.dmgMult;
                if (eLevel >= 6 && s.e6DmgMult) sDmgMult = s.e6DmgMult;

                // Requirement: Summons with HP contribute to DPS (0.5 hp = 50% dmg)
                if (uStats.id === 'jinoo_shadow_monarch' && s.ui && s.ui.hp) {
                    sDmgMult += (s.ui.hp / 100);
                }

                let sAvgMult = s.noCrit ? 1.0 : (s.avgMult || 1.0);
                if (!s.noCrit && eLevel >= 6 && s.e6AvgMult) sAvgMult = s.e6AvgMult;

                let sHitDmg = finalDmg * sDmgMult;
                let sAvgDmg = sHitDmg * sAvgMult;
                let sDps = (sAvgDmg / s.spa) * (s.count || 1);

                cDpsTotal += sDps;
                summonData.summons.push({
                    name: s.name,
                    hitDmg: sHitDmg,
                    avgDmg: sAvgDmg,
                    avgMult: sAvgMult,
                    spa: s.spa,
                    dps: sDps,
                    count: s.count || 1,
                    isNoCrit: !!s.noCrit,
                    desc: s.desc,
                    color: s.color || "#ffffff"
                });
            }
        });
        summonDpsTotal += cDpsTotal;
    }

    const gearDotBonus = baseR_Dot + headDotBuff + (sBonus.dot || 0);
    const { dotDpsTotal, bossDotDpsTotal, dotBreakdown } = _calcDoTDPS({ ...uStats, dot: (uStats.dot || 0) + passiveDotFromPassives, isBoss: context.isBoss }, traitObj, traitDotBuff, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult, finalDmgBoss, avgCritMultBoss);

    let finalDotDps = dotDpsTotal;
    let finalBossDotDps = bossDotDpsTotal;

    if (uStats.id === 'triple_threat') {
        const traitMultiplier = 1 + (traitDotBuff / 100);
        const gearMultiplier = 1 + (gearDotBonus / 100);
        const bleedPct = ((upgradeLevel >= 6) ? 120 : 100) * traitMultiplier * gearMultiplier;

        // Follow-up is a Critical Bleed: always multiplies by avgCritMult
        const fuaDotDmg = finalDmg * (bleedPct / 100) * avgCritMult;
        const fuaDotDmgBoss = finalDmgBoss * (bleedPct / 100) * avgCritMultBoss;

        // Only added to DPS if trait allows DoT stacking (e.g. Astral)
        const canStack = !!traitObj.allowDotStack;
        const fuaDotDps = canStack ? ((fuaDotDmg / 15) * placement) : 0;
        const fuaDotDpsBoss = canStack ? ((fuaDotDmgBoss / 15) * placement) : 0;

        finalDotDps += fuaDotDps;
        finalBossDotDps += fuaDotDpsBoss;

        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = fuaDotDps / placement;
            dotBreakdown.fuaDotTotalDmg = fuaDotDmg;
            dotBreakdown.fuaChance = 100;
            dotBreakdown.fuaLabel = "Brutal Slashes Follow-Up (15s Cooldown)";
        }
    }

    if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        // FUA DoT: dotPct is TOTAL bleed damage (not per-tick), DoT doesn't crit so use finalDmg
        let followUpDotDmg = finalDmg * (uStats.customFollowUp.dotPct / 100);
        let followUpDotDmgBoss = finalDmgBoss * (uStats.customFollowUp.dotPct / 100);
        let followUpDotDpsPerCycle = (followUpDotDmg * (chance / 100)) / usedSpa;
        let followUpDotDpsPerCycleBoss = (followUpDotDmgBoss * (chance / 100)) / usedSpa;

        finalDotDps += followUpDotDpsPerCycle * placement;
        finalBossDotDps += followUpDotDpsPerCycleBoss * placement;

        // Add to breakdown for UI rendering
        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = followUpDotDpsPerCycle;
            dotBreakdown.fuaDotTotalDmg = followUpDotDmg;
            dotBreakdown.fuaDotDuration = uStats.customFollowUp.dotDuration;
            dotBreakdown.fuaChance = chance;
            dotBreakdown.fuaLabel = "Shadow Emerge (FUA)";
        }
    }

    const finalSummonDps = summonDpsTotal;

    return {
        total: (finalHitDps + finalDotDps + finalSummonDps),
        bossTotal: (finalHitDps + finalDotDps + finalSummonDps) * bossMult,
        hit: finalHitDps,
        baseHitDps: hitDpsTotal,
        trueDmgPct,
        trueDmgVal,
        normalDmgVal: normalDmgVal + chainLightningDps,
        dot: finalDotDps,
        summon: finalSummonDps,
        summonData,
        detailedBuffs: detailedBuffs,
        spa: usedSpa,
        spaCap: effectiveSpaCap,
        range: finalRange,
        passiveRange: (uStats.passiveRange || 0) + eternalRangeBuff,
        dmgVal: finalDmg,
        lvStats,
        traitBuffs: { dmg: traitDmgPct, spa: traitSpaPct, range: traitRangePct },
        traitObj,
        relicBuffs: { dmg: baseR_Dmg, spa: baseR_Spa, dot: baseR_Dot, range: baseR_Range, cf: baseR_Cf, cm: baseR_Cm },
        totalSetStats: sBonus,
        tagBuffs,
        activeGlobalBuffs,
        detailedBuffs,
        passiveBuff: passivePcent + headDmgBase + headDmgPassive + headDmgTag + abilityDmg,
        passiveSpaBuff: passiveSpaPcent,
        eternalBuff: eternalDmgBuff,
        eternalRangeBuff: eternalRangeBuff,
        totalAdditivePct: additiveTotal,
        conditionalData: uStats.burnMultiplier ? { name: "Target: Burn", val: uStats.burnMultiplier, mult: (1 + uStats.burnMultiplier / 100) } : null,
        headBuffs: { dmg: headDmgBase + headDmgPassive + headDmgTag, headBase: headDmgBase, passiveDmg: headDmgPassive, tagDmg: headDmgTag, dot: headDotBuff, type: headPiece, warlordSpa, ...headCalc },
        dotData: dotBreakdown,
        critData: { rate: finalCritRate, cdmg: finalCdmgStat, baseCdmg: uStats.cdmg, relicCmPct: baseR_Cm, setCm: sBonus.cm, totalCmBuff: (sBonus.cm || 0) + baseR_Cm, preRelicCdmg: uStats.cdmg, avgMult: avgCritMult },
        placement,
        isSSS,
        rawFinalSpa,
        spaAfterRelic,
        setAndPassiveSpa,
        baseStats: uStats,
        dmgPoints: context.dmgPoints,
        spaPoints: context.spaPoints,
        rangePoints: context.rangePoints,
        singleUnitDoT: dotDpsTotal / (traitObj.allowDotStack || traitObj.allowPlacementStack ? placement : 1),
        hasStackingDoT: traitObj.allowDotStack || traitObj.allowPlacementStack,
        extraAttacks: extraAttacksData,
        abilityBuff: (uStats.buffDmg || 0) + abilityDmg,
        warlordData
    };
}