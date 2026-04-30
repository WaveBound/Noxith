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
    const { isAbility = false, mode = 'fixed', dmgPoints = 99, spaPoints = 0, rangePoints = 0, wave = 25, isBoss = false, headPiece = 'none', starMult = 1, rankData = null, upgradeLevel: forcedLevel } = options;
    let traitObj = null;

    if (typeof traitIdent === 'object') traitObj = traitIdent;
    else traitObj = getTraitFast(traitIdent) || getTraitFast('ruler');

    let effectiveStats = { ...unit.stats };
    effectiveStats.id = unit.id;
    effectiveStats.placementType = unit.placementType;
    if (unit.tags) effectiveStats.tags = unit.tags;

    // Resolve Placement (limited by Trait or Ability)
    let actualPlacement = unit.placement;
    if (traitObj.limitPlace) actualPlacement = Math.min(unit.placement, traitObj.limitPlace);
    if (isAbility && unit.ability && unit.ability.limitPlace) actualPlacement = Math.min(actualPlacement, unit.ability.limitPlace);

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
    }

    // --- APPLY PASSIVES / ETHEREALIZATION ---
    // All etherealization effects are treated as active passives
    if (unit.etherealization) {
        unit.etherealization.forEach((upgrade, i) => {
            if (!upgrade) return;
            const lowU = upgrade.toLowerCase();

            if (unit.id === 'water_god' && i === 0) {
                effectiveStats.followUp = true;
                effectiveStats.passiveDotBuff = (effectiveStats.passiveDotBuff || 0) + 10;
            }

            if (lowU.includes('+75% damage per placement')) {
                effectiveStats.passiveDmg = (effectiveStats.passiveDmg || 0) + (75 * (actualPlacement || 1));
            }
        });
    }

    let maxPts = (unit.id === 'king_sailor') ? 129 : 99;
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

    let suffix = isAbility ? '-ABILITY' : '-BASE';
    if (unit.id === 'kirito') { if (kiritoState.realm) suffix += '-VR'; if (kiritoState.card) suffix += '-CARD'; }
    const modeTag = (mode === 'bugged') ? '-b-' : '-f-';

    const context = { dmgPoints: options.dmgPoints, spaPoints: options.spaPoints, rangePoints: options.rangePoints, wave, isBoss, traitObj, placement: actualPlacement, isSSS: true, isVirtualRealm: isKiritoVR, headPiece, starMult, rankData, isAbility, maxPts, upgradeLevel };
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

function reconstructMathData(liteData, forcedUpgradeLevel = undefined) {
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
        headPiece: liteData.headUsed || (liteData.subStats && liteData.subStats.selectedHead) || 'none',
        upgradeLevel: forcedUpgradeLevel
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

// ==========================================================
// CORE CALCULATION PIPELINE
// ==========================================================

function calculateDPS(uStats, relicStats, context) {
    const { dmgPoints, spaPoints, rangePoints, wave, isBoss, traitObj, placement, isSSS, headPiece, isVirtualRealm, starMult, isAbility } = context;

    let lvStats = getLevelStats(uStats.dmg, uStats.spa, uStats.range || 0, dmgPoints, spaPoints, rangePoints);
    let rDmg = 0, rSpa = 0, rRange = 0;
    if (context.rankData) { rDmg = context.rankData.dmg || 0; rSpa = context.rankData.spa || 0; rRange = context.rankData.range || 0; }
    else if (isSSS) { rDmg = 20; rSpa = 8; rRange = 20; }
    if (rDmg !== 0) lvStats.dmg *= (1 + rDmg / 100);
    if (rSpa !== 0) lvStats.spa *= (1 - rSpa / 100);
    if (rRange !== 0) lvStats.range *= (1 + rRange / 100);

    let passivePcent = (uStats.passiveDmg || 0) + (uStats.buffDmg || 0), passiveSpaPcent = uStats.passiveSpa || 0;

    const totalBossDmg = (uStats.bossDmg || 0) + (traitObj.bossDmg || 0);
    let traitDmgPct = traitObj.dmg + (totalBossDmg && isBoss ? totalBossDmg : 0), traitSpaPct = traitObj.spa;
    let traitCritRate = traitObj.critRate || 0, traitRangePct = traitObj.range || 0, traitDotBuff = traitObj.dotBuff || 0;

    let eternalDmgBuff = 0, eternalRangeBuff = 0;
    if (traitObj.isEternal) { const waveCap = Math.min(wave, 12); eternalDmgBuff = waveCap * 5; passivePcent += eternalDmgBuff; eternalRangeBuff = waveCap * 2.5; }

    let { sBonus, tagBuffs } = _calcSetAndTagBonuses(relicStats, uStats, headPiece);
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
            if (window[buff.stateKey]) {
                const buffStats = buff.math(uStats);
                activeGlobalBuffs[buff.id] = buffStats;
                if (buffStats.dmg) globalDmg += buffStats.dmg;
                if (buffStats.spa) globalSpa += buffStats.spa;
                if (buffStats.range) globalRange += buffStats.range;
                if (buffStats.crit) globalCrit += buffStats.crit;
                if (buffStats.cdmg) globalCdmg += buffStats.cdmg;
            }
        });
    }

    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + globalRange + (uStats.id === 'king_sailor' ? 10 : 0);
    const finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);

    const setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + globalSpa;

    // Great Mage Accessory: -20% SPA (Uptime ~60% from kill trigger)
    const mageSpaMult = (headPiece === 'mage_head') ? 0.88 : 1; // -20% * 0.6 uptime

    // Nutaru (Beast) dynamic SPA Cap override
    const effectiveSpaCap = (isAbility && uStats.id === 'nutaru_beast') ? 3.0 : (uStats.spaCap || 0.1);

    const spaAfterRelic = lvStats.spa * (1 - traitSpaPct / 100) * (1 - baseR_Spa / 100) * mageSpaMult;
    const rawFinalSpa = spaAfterRelic * (1 - setAndPassiveSpa / 100);
    const finalSpa = Math.max(rawFinalSpa, effectiveSpaCap);

    const { headDmgBuff, headDotBuff, headCalc } = _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats);

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBuff + globalDmg;

    // Junior Ninja: 1.1x Multiplier to all additive buffs (WATER GOD ONLY)
    if (headPiece === 'junior' && uStats.id === 'water_god') {
        additiveTotal = ((sBonus.dmg || 0) + passivePcent + headDmgBuff + globalDmg) * 1.1;
    }

    const finalDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1);

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + globalCdmg;
    let finalCritRate = Math.min(uStats.crit + traitCritRate + globalCrit + ((uStats.id === 'kirito') ? 0 : (baseR_Cf + (sBonus.cf || 0))), 100);
    if (headPiece === 'sorcerer_hunter_spirit') finalCritRate = 0;

    const avgCritMult = (1 + ((finalCdmgStat / 100) * (finalCritRate / 100)));
    const avgHit = finalDmg * avgCritMult;

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
        const tickCount = 5;
        const tickDmg = 0.20;
        attackMultiplier = 1 + (tickCount * tickDmg);
        extraAttacksData = {
            req: "Baal's Lightning",
            hits: `1 + ${tickCount} Ticks`,
            extra: tickCount * tickDmg,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Chain Lightning",
            tickDmgVal: finalDmg * tickDmg,
            avgTick: (finalDmg * tickDmg) * avgCritMult,
            totalChain: (finalDmg * tickDmg * tickCount) * avgCritMult
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

    // Sorcerer Hunter Set Perk: 1.15x True Damage
    let trueDmgMult = 1;
    if (relicStats.set === 'sorcerer_hunter') {
        trueDmgMult = 1.15;
    }
    const finalHitDps = hitDpsTotal * trueDmgMult;

    const summonDmgBase = (uStats.id === 'nutaru_beast' && isAbility) ? finalDmg * 1.25 : finalDmg;
    const { summonDpsTotal, summonData } = _calcSummonDPS(uStats, summonDmgBase, finalSpa, placement);

    const gearDotBonus = baseR_Dot + headDotBuff + (sBonus.dot || 0);
    const { dotDpsTotal, dotBreakdown } = _calcDoTDPS(uStats, traitObj, traitDotBuff, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult);

    const finalDotDps = dotDpsTotal;
    const finalSummonDps = summonDpsTotal;

    return {
        total: (finalHitDps + finalDotDps + finalSummonDps),
        hit: finalHitDps,
        baseHitDps: hitDpsTotal,
        trueDmgMult,
        dot: finalDotDps,
        summon: finalSummonDps,
        summonData,
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
        passiveBuff: passivePcent + headDmgBuff,
        passiveSpaBuff: passiveSpaPcent,
        eternalBuff: eternalDmgBuff,
        eternalRangeBuff: eternalRangeBuff,
        totalAdditivePct: additiveTotal,
        conditionalData: uStats.burnMultiplier ? { name: "Target: Burn", val: uStats.burnMultiplier, mult: (1 + uStats.burnMultiplier / 100) } : null,
        headBuffs: { dmg: headDmgBuff, dot: headDotBuff, type: headPiece, ...headCalc },
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
        abilityBuff: uStats.buffDmg || 0
    };
}