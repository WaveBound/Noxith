// ============================================================================
// CALCULATIONS.JS - Build Calculation Logic
// ============================================================================

// --- HELPERS ---

// Speed optimization: Fast lookup maps for static data
const _traitCacheMap = new Map();
const _setCacheMap = new Map();

// UPDATED: Dynamically checks Custom Traits if not found in the base cache
window.getTraitFast = (idOrName) => {
    if (!idOrName) return null;
    if (_traitCacheMap.size === 0) {
        traitsList.forEach(t => { _traitCacheMap.set(t.id, t); _traitCacheMap.set(t.name, t); });
    }
    let found = _traitCacheMap.get(idOrName);

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
    const { isAbility = false, mode = 'fixed', dmgPoints = 99, spaPoints = 0, rangePoints = 0, wave = 25, isBoss = false, headPiece = 'none', starMult = 1, rankData = null } = options;
    let traitObj = null;

    if (typeof traitIdent === 'object') traitObj = traitIdent;
    else traitObj = getTraitFast(traitIdent) || getTraitFast('ruler');

    let effectiveStats = { ...unit.stats };
    effectiveStats.id = unit.id;
    effectiveStats.placementType = unit.placementType;
    if (unit.tags) effectiveStats.tags = unit.tags;

    // --- APPLY UPGRADE STATS (Dmg/Spa/Range) ---
    const upgradeLevel = window.unitELevels ? (window.unitELevels[unit.id] || 0) : 0;

    if (unit.upgrades && unit.upgrades[upgradeLevel]) {
        const upStats = unit.upgrades[upgradeLevel];
        if (upStats.dmg) effectiveStats.dmg = upStats.dmg;
        if (upStats.spa) effectiveStats.spa = upStats.spa;
        if (upStats.range) effectiveStats.range = upStats.range;
        if (upStats.passiveDmg !== undefined) effectiveStats.passiveDmg = upStats.passiveDmg;
        if (upStats.passiveSpa !== undefined) effectiveStats.passiveSpa = upStats.passiveSpa;
        if (upStats.passiveRange !== undefined) effectiveStats.passiveRange = upStats.passiveRange;
    }
    const eLevel = window.unitELevels ? (window.unitELevels[unit.id] || 0) : 0;
    let maxPts = (unit.id === 'king_sailor') ? 129 : 99;

    if (eLevel > 0 && unit.etherealization) {
        for (let i = 0; i < eLevel; i++) {
            const upgrade = unit.etherealization[i];
            if (!upgrade) continue;
            const lowU = upgrade.toLowerCase();

            if (unit.id === 'water_god') {
                if (i === 0) {
                    effectiveStats.followUp = true;
                    effectiveStats.passiveDotBuff = (effectiveStats.passiveDotBuff || 0) + 10;
                }
            }

            if (lowU.includes('+75% damage per placement')) {
                effectiveStats.passiveDmg = (effectiveStats.passiveDmg || 0) + (75 * (unit.placement || 1));
            }
        }
    }
    options.dmgPoints = Math.min(options.dmgPoints || 0, maxPts);
    options.spaPoints = Math.min(options.spaPoints || 0, maxPts);
    options.rangePoints = Math.min(options.rangePoints || 0, maxPts);

    if (isAbility && unit.ability) Object.assign(effectiveStats, unit.ability);

    const isKiritoVR = (unit.id === 'kirito' && kiritoState.realm);
    if (unit.id === 'kirito' && isKiritoVR && kiritoState.card) { effectiveStats.dot = 200; effectiveStats.dotDuration = 4; effectiveStats.dotStacks = 1; }
    if (unit.id === 'bambietta' && typeof BAMBIETTA_MODES !== 'undefined') {
        const currentEl = bambiettaState.element || "Dark";
        const modeStats = BAMBIETTA_MODES[currentEl];
        if (modeStats) Object.assign(effectiveStats, modeStats);
    }
    if (unit.id === 'robot1718' && unit.modes) {
        const currentMode = robot1718State.mode || "Robot 17";
        const modeStats = unit.modes[currentMode];
        if (modeStats) Object.assign(effectiveStats, modeStats);
    }

    let actualPlacement = unit.placement;
    if (traitObj.limitPlace) actualPlacement = Math.min(unit.placement, traitObj.limitPlace);
    if (isAbility && unit.ability && unit.ability.limitPlace) actualPlacement = Math.min(actualPlacement, unit.ability.limitPlace);

    let suffix = isAbility ? '-ABILITY' : '-BASE';
    if (unit.id === 'kirito') { if (kiritoState.realm) suffix += '-VR'; if (kiritoState.card) suffix += '-CARD'; }
    const modeTag = (mode === 'bugged') ? '-b-' : '-f-';

    const context = { dmgPoints: options.dmgPoints, spaPoints: options.spaPoints, rangePoints: options.rangePoints, wave, isBoss, traitObj, placement: actualPlacement, isSSS: true, isVirtualRealm: isKiritoVR, headPiece, starMult, rankData, isAbility, maxPts };
    return { effectiveStats, traitObj, context, isKiritoVR, suffix, modeTag };
}

function createResultEntry({ id, buildName, traitName, res, prio, mainStats, subStats, headUsed, isCustom, relicIds = null, baseRes = null }) {
    const entry = {
        id: id,
        setName: buildName.split('(')[0].trim(),
        traitName: traitName,
        dps: res.total,
        dmgVal: res.dmgVal,
        spa: res.spa,
        range: res.range,
        dot: res.dot || 0,
        dotTotal: res.dotData ? (res.dotData.nativeTotalDmg + (res.dotData.radTotalDmg || 0)) : 0,
        prio: prio,
        mainStats: mainStats,
        subStats: {
            ...subStats,
            finalCf: (res.critData ? res.critData.rate : 0),
            finalCm: (res.critData ? res.critData.cdmg : 0)
        },
        headUsed: headUsed,
        isCustom: isCustom
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

function calculateUnitBuilds(unit, _stats, filteredBuilds, subCandidates, headsToProcess, includeSubs, specificTraitsOnly = null, isAbilityContext = false, mode = 'fixed', isMaxPotential = false) {
    if (inventoryMode && relicInventory && relicInventory.length > 0) return calculateInventoryBuilds(unit, null, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs);
    window.cachedResults = window.cachedResults || {};
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) activeTraits = specificTraitsOnly;
    else { const specificTraits = unitSpecificTraits[unit.id] || []; activeTraits = [...traitsList, ...customTraits, ...specificTraits]; }

    let unitResults = [];
    const { effectiveStats: baseEffective, isKiritoVR: baseVR } = buildCalculationContext(unit, 'ruler', { isAbility: isAbilityContext, isMaxPotential });
    const hasNativeDoT = (baseEffective.dot > 0) || (baseEffective.burnMultiplier > 0) || baseVR;
    let unitSubCandidates = [...subCandidates];
    if (!hasNativeDoT) unitSubCandidates = unitSubCandidates.filter(c => c !== 'dot');
    const subsSuffix = includeSubs ? '-SUBS' : '-NOSUBS';

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return;
        const { effectiveStats, context, isKiritoVR, suffix, modeTag } = buildCalculationContext(unit, trait, { isAbility: isAbilityContext, mode: mode, isMaxPotential });
        const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
        const isDotPossible = hasNativeDoT || traitAddsDot;
        const currentCandidates = (traitAddsDot) ? subCandidates : unitSubCandidates;
        const relevantBuilds = (!isDotPossible) ? filteredBuilds.filter(b => b.bodyType !== 'dot') : filteredBuilds;

        relevantBuilds.forEach(build => {
            let relevantHeads = headsToProcess;
            if (!isDotPossible) relevantHeads = headsToProcess.filter(h => h !== 'ninja');

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

                const eLevel = window.unitELevels[unit.id] || 0;
                let baseContext = null;
                const upgradeMax = (unit.upgrades) ? unit.upgrades.length - 1 : 0;
                if (eLevel < upgradeMax) {
                    // Pre-calculate Next Level context for comparison
                    const savedLevel = window.unitELevels[unit.id] || 0;
                    window.unitELevels[unit.id] = savedLevel + 1;
                    const bCtx = buildCalculationContext(unit, trait, { isAbility: isAbilityContext, mode: mode, isMaxPotential });
                    window.unitELevels[unit.id] = savedLevel;
                    baseContext = bCtx;
                }

                const baseId = `${unit.id}${suffix}-${trait.id}-${build.name.replace(/[^a-zA-Z0-9]/g, '')}`;
                const processResult = (config, prioStr) => {
                    const res = config.res;
                    if (isNaN(res.total)) return;

                    let bRes = null;
                    if (baseContext) {
                        const bEff = baseContext.effectiveStats;
                        const bCtx = baseContext.context;
                        // For base comparison, use same assignments but base stats
                        const bOut = calculateDPS(bEff, trait, config.assignments, bCtx);
                        bRes = bOut;
                    }

                    const fullId = `${baseId}-${prioStr}${subsSuffix}-${headMode}${modeTag}`;
                    const entry = createResultEntry({
                        id: fullId, buildName: build.name, traitName: trait.name,
                        res: res, baseRes: bRes, prio: prioStr,
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

                        const uniqueCombId = `${head.id}_${body.id}_${leg.id}`;
                        const id = `${unit.id}${suffix}-${trait.id}-INV-${uniqueCombId}${modeTag}${cfgTag}-${prio.id}`;

                        // UI Formatting
                        const formatSubs = (relic) => Object.entries(relic.subs).map(([k, v]) => ({ type: k, val: v }));
                        let subStatsUI = {
                            head: (includeSubs && head.id !== 'none') ? formatSubs(head) : null,
                            body: (includeSubs && body.id !== 'none-b') ? formatSubs(body) : null,
                            legs: (includeSubs && leg.id !== 'none-l') ? formatSubs(leg) : null,
                            selectedHead: head.setKey
                        };

                        const setName = activeSetKey !== 'none' ? SETS.find(s => s.id === activeSetKey)?.name : "Mixed Set";

                        const entry = createResultEntry({
                            id: id,
                            buildName: setName,
                            traitName: trait.name,
                            res: res,
                            prio: prio.id,
                            mainStats: { body: body.mainStat, legs: leg.mainStat },
                            subStats: subStatsUI,
                            headUsed: head.setKey,
                            isCustom: trait.isCustom,
                            relicIds: { head: head.id, body: body.id, legs: leg.id }
                        });

                        window.cachedResults[id] = entry;
                        unitResults.push(entry);
                    }); // end variation loop

                }); // end leg
            }); // end body
        }); // end head
    }); // end trait

    unitResults.sort((a, b) => b.dps - a.dps);
    return unitResults;
}

function reconstructMathData(liteData) {
    if (!liteData || !liteData.id) throw new Error("Invalid data for reconstruction");

    const unitId = liteData.id.split('-')[0];
    const unit = unitDatabase.find(u => u.id === unitId);
    if (!unit) return null;

    // 1. Identify Context from ID Tags
    const isAbility = liteData.id.includes('ABILITY');
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
        headPiece: liteData.headUsed || (liteData.subStats && liteData.subStats.selectedHead) || 'none'
    });

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