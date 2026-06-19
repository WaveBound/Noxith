// ============================================================================
// BUILD-RUNNER.JS - Build Orchestration & Result Assembly
// Depends on: backend/math/lookups.js, backend/math/context-builder.js,
//             backend/math/core-math.js (getBestSubConfig, calculateDPS)
// ============================================================================

function isRangeRelicsEnabled() {
    return !statConfig || statConfig.applyRelicRange !== false;
}

function getActiveRelicInventory() {
    return (window && window.relicInventory && window.relicInventory.length > 0)
        ? window.relicInventory
        : (relicInventory || []);
}

function normalizeSubCandidates(candidates) {
    return [...(candidates || [])].filter(c => c && (isRangeRelicsEnabled() || c !== 'range'));
}

function filterRangeDisabledBuilds(builds) {
    if (!Array.isArray(builds)) return [];
    return isRangeRelicsEnabled() ? builds : builds.filter(b => b && b.legType !== 'range');
}

function trackOptimizerStats(event, detail = {}) {
    if (!window) return;
    window.__optimizerStats = window.__optimizerStats || { events: {}, dpsCalls: 0 };
    window.__optimizerStats.events[event] = (window.__optimizerStats.events[event] || 0) + 1;
    Object.entries(detail).forEach(([key, value]) => {
        window.__optimizerStats[key] = (window.__optimizerStats[key] || 0) + value;
    });
}

function maybeLogOptimizerStats() {
    if (!window.DEBUG_OPTIMIZER_STATS || !window.__optimizerStats) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if ((window.__optimizerStats.lastLogAt || 0) + 5000 > now) return;
    window.__optimizerStats.lastLogAt = now;
    console.info('[optimizer-stats]', window.__optimizerStats);
}

function createResultEntry({ id, buildName, traitName, res, prio, mainStats, subStats, headUsed, isCustom, relicIds = null, baseRes = null, stars = 1 }) {
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
        dotTotal: res.dotData ? (
            (res.dotData.nativeTotalDmg || 0) +
            (res.dotData.radTotalDmg || 0) +
            (res.dotData.fuaDotTotalDmg || 0) +
            (res.dotData.scarfBurnTotalDmg || 0)
        ) : 0,
        prio: prio,
        mainStats: mainStats,
        subStats: {
            ...subStats,
            finalCf: (res.critData ? res.critData.rate : 0),
            finalCm: (res.critData ? res.critData.cdmg : 0)
        },
        headUsed: headUsed,
        isCustom: isCustom,
        placement: res.placement,
        stars: stars
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

function calculateUnitBuilds(unit, _stats, filteredBuilds, subCandidates, headsToProcess, includeSubs, specificTraitsOnly = null, isAbilityContext = false, mode = 'fixed', isHotbar = false, ignoreInventory = false) {
    const inventory = getActiveRelicInventory();
    if (window.inventoryMode) {
        console.debug('[INVENTORY-MODE-DIAG] calculateUnitBuilds entry', {
            unitId: unit?.id,
            inventoryMode: window.inventoryMode,
            inventoryLength: inventory.length,
            ignoreInventory,
            slotCounts: {
                head: inventory.filter(r => r.slot === 'Head').length,
                body: inventory.filter(r => r.slot === 'Body').length,
                legs: inventory.filter(r => r.slot === 'Legs').length
            }
        });
    }
    if (!ignoreInventory && window.inventoryMode && inventory.length > 0) {
        console.debug('[INVENTORY-MODE-DIAG] routing to calculateInventoryBuilds', { unitId: unit?.id, inventoryLength: inventory.length });
        return calculateInventoryBuilds(unit, null, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs, null, isHotbar);
    }
    if (window.inventoryMode && (ignoreInventory || inventory.length === 0)) {
        console.debug('[INVENTORY-MODE-DIAG] skipping inventory routing', { unitId: unit?.id, ignoreInventory, inventoryLength: inventory.length });
    }
    window.cachedResults = window.cachedResults || {};
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) activeTraits = specificTraitsOnly;
    else { const specificTraits = unitSpecificTraits[unit.id] || []; activeTraits = [...traitsList, ...customTraits, ...specificTraits]; }

    let unitResults = [];
    const { effectiveStats: baseEffective, isKiritoVR: baseVR } = buildCalculationContext(unit, 'ruler', { isAbility: isAbilityContext });
    const hasNativeDoT = (baseEffective.dot > 0) || (baseEffective.burnMultiplier > 0) || baseVR;
    let unitSubCandidates = normalizeSubCandidates(subCandidates);
    if (!hasNativeDoT) unitSubCandidates = unitSubCandidates.filter(c => c !== 'dot');
    const subsSuffix = includeSubs ? '-SUBS' : '-NOSUBS';
    const relevantBuilds = filterRangeDisabledBuilds(filteredBuilds);
    const relevantHeads = [...(headsToProcess || [])].map(h => h === 'rebellious_head' ? 'bloodline_head' : h);

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return;
        const { effectiveStats, context, isKiritoVR, suffix, modeTag } = buildCalculationContext(unit, trait, { isAbility: isAbilityContext, mode: mode, isHotbar: isHotbar });
        const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
        const isDotPossible = hasNativeDoT || traitAddsDot;
        const currentCandidates = normalizeSubCandidates((traitAddsDot) ? subCandidates : unitSubCandidates);
        const traitBuilds = (!isDotPossible) ? relevantBuilds.filter(b => b.bodyType !== 'dot') : relevantBuilds;
        const priorityRuns = [];
        const maxPts = context.maxPts || 99;
        priorityRuns.push(
            { dmgP: maxPts, spaP: 0, rangeP: 0, optType: 'dps' },
            { dmgP: 0, spaP: maxPts, rangeP: 0, optType: 'dps' },
            { dmgP: maxPts, spaP: 0, rangeP: 0, optType: 'raw_dmg' }
        );
        if (isRangeRelicsEnabled()) priorityRuns.push({ dmgP: 0, spaP: 0, rangeP: maxPts, optType: 'range' });
        if (traitBuilds.length === 0) return;

        trackOptimizerStats('calculateUnitBuilds.trait', {
            traits: 1,
            builds: traitBuilds.length,
            heads: relevantHeads.length,
            candidates: currentCandidates.length,
            dpsCallBudget: traitBuilds.length * relevantHeads.length * priorityRuns.length * (includeSubs ? Math.max(1, currentCandidates.length * 15 + 1) : 1)
        });

        traitBuilds.forEach(build => {
            let headsForBuild = relevantHeads;
            if (!isDotPossible) headsForBuild = relevantHeads.filter(h => h !== 'ninja' && h !== 'mochi_scarf' && h !== 'flaming_donut' && h !== 'panther_claws');
            if (headsForBuild.length === 0) return;

            headsForBuild.forEach(headMode => {
                const runOpt = (dmgP, spaP, rangeP, optType) => {
                    context.dmgPoints = dmgP; context.spaPoints = spaP; context.rangePoints = rangeP;
                    context.isHotbar = isHotbar;
                    effectiveStats.context = context;
                    return getBestSubConfig(build, effectiveStats, includeSubs, headMode, currentCandidates, optType);
                };

                const runCfg = (optType) => priorityRuns.find(r => r.optType === optType) || null;
                const cfgDps = runCfg('dps');
                const rawCfg = runCfg('raw_dmg');
                const cfgDmg = runOpt(cfgDps.dmgP, cfgDps.spaP, cfgDps.rangeP, 'dps');
                const cfgSpa = runOpt(0, maxPts, 0, 'dps');
                const cfgRaw = runOpt(rawCfg.dmgP, rawCfg.spaP, rawCfg.rangeP, 'raw_dmg');
                const rangeCfg = runCfg('range');
                const cfgRange = rangeCfg ? runOpt(rangeCfg.dmgP, rangeCfg.spaP, rangeCfg.rangeP, 'range') : null;

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

                processResult(cfgDmg, "dmg");
                processResult(cfgSpa, "spa");
                processResult(cfgRaw, "raw_dmg");
                if (cfgRange) processResult(cfgRange, "range");
            });
        });
    });
    unitResults.sort((a, b) => b.dps - a.dps);
    trackOptimizerStats('calculateUnitBuilds.complete', { units: 1, results: unitResults.length });
    maybeLogOptimizerStats();
    return unitResults;
}

function getInventoryFallbackTrait(unit) {
    if (!unit) return null;

    const preferredNames = [
        unit.meta?.short,
        unit.meta?.long,
        'ruler'
    ]
        .flatMap(v => String(v || '').split('/'))
        .map(v => v.trim())
        .filter(Boolean);

    const allTraits = [...(traitsList || []), ...(customTraits || []), ...((unitSpecificTraits && unitSpecificTraits[unit.id]) || [])];
    const normalize = v => String(v || '').toLowerCase().trim();

    for (const preferred of preferredNames) {
        const preferredLower = normalize(preferred);
        const trait = (typeof getTraitFast === 'function' ? getTraitFast(preferred) : null)
            || allTraits.find(t => normalize(t.id) === preferredLower || normalize(t.name) === preferredLower);

        if (trait && trait.id !== 'none') return trait;
    }

    return null;
}

// Inventory Mode Calculation
function calculateInventoryBuilds(unit, _stats, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs, forcedRelic = null, isHotbar = false) {
    window.cachedResults = window.cachedResults || {};
    const inventory = getActiveRelicInventory();

    // 1. Determine Traits List
    let activeTraits = [];
    let assignedTraitId = null;

    // First, check if a specific trait was requested by the caller (like Loadout fallback or Custom calc)
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly) && specificTraitsOnly.length > 0) {
        activeTraits = specificTraitsOnly;
    }
    else {
        // If not explicitly requested, determine what trait to use
        if (window.CALCULATION_MODE === 'loadout' && window.unitTraits && window.unitTraits[unit.id]) {
            assignedTraitId = window.unitTraits[unit.id];
        } else {
            assignedTraitId = (typeof window.getInventoryAssignedTrait === 'function') ? window.getInventoryAssignedTrait(unit.id) : ((window.inventoryUnitTraits || {})[unit.id] || null);
        }

        if (assignedTraitId) {
            const specificTraits = unitSpecificTraits[unit.id] || [];
            const allTraits = [...traitsList, ...customTraits, ...specificTraits];
            const assignedTrait = allTraits.find(t => t.id === assignedTraitId || t.name === assignedTraitId);
            if (assignedTrait && assignedTrait.id !== 'none') {
                activeTraits = [assignedTrait];
            }
        }
    }

    if (activeTraits.length === 0) {
        const fallbackTrait = getInventoryFallbackTrait(unit);
        if (fallbackTrait) {
            activeTraits = [fallbackTrait];
            console.debug('[INVENTORY-MODE-DIAG] calculateInventoryBuilds using fallback trait', {
                unitId: unit?.id,
                assignedTraitId,
                fallbackTraitId: fallbackTrait.id,
                fallbackTraitName: fallbackTrait.name,
                source: unit?.meta?.short || unit?.meta?.long || 'ruler'
            });
        } else {
            console.debug('[INVENTORY-MODE-DIAG] calculateInventoryBuilds returned no trait', {
                unitId: unit?.id,
                assignedTraitId,
                forcedRelicId: forcedRelic?.id || null,
                inventoryUnitTraits: window.inventoryUnitTraits || {}
            });
            return [];
        }
    }

    let unitResults = [];

    // 1. Separate Inventory by Slot
    const allowHeads = Array.isArray(headsToProcess) && headsToProcess.some(h => h !== 'none');
    if (!isRangeRelicsEnabled() && forcedRelic?.slot === 'Legs' && (forcedRelic.mainStat === 'range' || forcedRelic.subs?.range)) {
        console.debug('[INVENTORY-MODE-DIAG] calculateInventoryBuilds rejected range legs', { unitId: unit?.id, forcedRelic });
        return [];
    }

    let heads = allowHeads ? inventory.filter(r => r.slot === 'Head') : [];
    const bodies = inventory.filter(r => r.slot === 'Body');
    let legs = inventory.filter(r => r.slot === 'Legs');
    if (!isRangeRelicsEnabled()) {
        legs = legs.filter(r => r.mainStat !== 'range' && !(r.subs && r.subs.range));
    }

    console.debug('[INVENTORY-MODE-DIAG] calculateInventoryBuilds starting', {
        unitId: unit?.id,
        assignedTraitId,
        activeTraits: activeTraits.map(t => t.id || t.name),
        inventoryLength: inventory.length,
        slotCounts: {
            head: heads.length,
            body: bodies.length,
            legs: legs.length
        },
        allowHeads,
        includeSubs,
        forcedRelicId: forcedRelic?.id || null
    });

    // Apply Force Logic (Relic Optimality)
    if (forcedRelic) {
        if (forcedRelic.slot === 'Head') heads = [forcedRelic];
        if (forcedRelic.slot === 'Body') bodies = [forcedRelic];
        if (forcedRelic.slot === 'Legs') legs = [forcedRelic];
    }

    // Add 'None' options
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
            mode: mode,
            isHotbar: isHotbar
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
                    const addStat = (type, val) => { if (type === 'range' && !isRangeRelicsEnabled()) return; if (totalStats[type] !== undefined) totalStats[type] += val; };

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
                        ...(isRangeRelicsEnabled() ? [{ id: 'range', dmgPts: 0, spaPts: 0, rangePts: maxPts }] : [])
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
                        trackOptimizerStats('calculateDPS.inventory', { dpsCalls: 1 });

                        // OPTIMIZATION: Only keep the best for this Trait + Priority + Set combination
                        const bestKey = `${trait.id}-${prio.id}-${activeSetKey}-${head.setKey}`;
                        const currentBest = bestMap.get(bestKey);

                        if (!currentBest || window.checkIsBetter(res, currentBest.res, prio.id)) {
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
                                relicIds: { head: head.id, body: body.id, legs: leg.id },
                                stars: starMult
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
            relicIds: v.relicIds,
            stars: v.stars
        });
        window.cachedResults[v.entryId] = entry;
        unitResults.push(entry);
    });

    unitResults.sort((a, b) => b.dps - a.dps);
    const top = unitResults[0];
    console.debug('[INVENTORY-MODE-DIAG] calculateInventoryBuilds finished', {
        unitId: unit?.id,
        resultCount: unitResults.length,
        topDps: top?.dps || 0,
        topSet: top?.setName || null,
        topTrait: top?.traitName || null,
        topRelicIds: top?.relicIds || null
    });
    trackOptimizerStats('calculateInventoryBuilds.complete', { units: 1, results: unitResults.length });
    maybeLogOptimizerStats();
    return unitResults;
}

function reconstructMathData(liteData, forcedUpgradeLevel = undefined, ctxOverrides = {}) {
    if (!liteData || !liteData.id) throw new Error("Invalid data for reconstruction");

    const unitIdPart = liteData.id.split('-')[0];
    let unit = unitDatabase.find(u => u.id === unitIdPart);

    // Robust alias resolution for Merciless God and other Syncro units
    if (!unit && unitIdPart.includes('merciless_god')) unit = unitDatabase.find(u => u.id === 'merciless_god');

    if (!unit) return null;

    // 1. Identify Context from ID Tags
    const isAbility = liteData.id.includes('ABILITY') || (typeof activeAbilityIds !== 'undefined' && activeAbilityIds.has(unitIdPart));
    const isBuggedMode = liteData.id.includes('-b-');
    const isFixedMode = liteData.id.includes('-f-');
    const isNoSubsMode = liteData.id.includes('-NOSUBS') || (typeof disableSubStats !== 'undefined' && disableSubStats) || (typeof window !== 'undefined' && window.disableSubStats);

    const previousDotState = statConfig.applyRelicDot;
    const previousCritState = statConfig.applyRelicCrit;

    if (isBuggedMode) { statConfig.applyRelicDot = false; statConfig.applyRelicCrit = true; }
    else if (isFixedMode) { statConfig.applyRelicDot = true; statConfig.applyRelicCrit = true; }

    const isSpaPrio = liteData.prio === 'spa';
    const isRangePrio = liteData.prio === 'range';

    let extractedModeIdx = ctxOverrides.forcedModeIdx ?? ctxOverrides.activeModeIdx;
    if (isFixedMode) extractedModeIdx = parseInt(liteData.id.split('-f-')[1]) || 0;
    else if (isBuggedMode) extractedModeIdx = parseInt(liteData.id.split('-b-')[1]) || 0;
    if (extractedModeIdx === undefined) extractedModeIdx = unit.defaultMode ?? 0;

    // For multi-mode units, if the reconstruction is requested for a specific UI mode, prioritize that over the saved build's mode tag
    if (unit.modes && ctxOverrides.activeModeIdx !== undefined) extractedModeIdx = ctxOverrides.activeModeIdx;

    let dmgPts = isSpaPrio || isRangePrio ? 0 : 999;
    let spaPts = isSpaPrio ? 999 : 0;
    let rangePts = isRangePrio ? 999 : 0;

    // Use Unified Context Builder
    const traitForContext = ctxOverrides.traitOverride || liteData.traitName;
    const { effectiveStats, context } = buildCalculationContext(unit, traitForContext, {
        isAbility,
        dmgPoints: dmgPts,
        spaPoints: spaPts,
        rangePoints: rangePts,
        headPiece: liteData.headUsed || (liteData.subStats && liteData.subStats.selectedHead) || 'none',
        upgradeLevel: forcedUpgradeLevel,
        starMult: liteData.stars || 1,
        forcedModeIdx: extractedModeIdx,
        isHotbar: ctxOverrides.isHotbar || false
    });

    if (ctxOverrides) Object.assign(context, ctxOverrides);

    // Redundant sync removed; buildCalculationContext now handles this natively.

    // Set Entry
    const setEntry = getSetFast(liteData.setName) || { id: 'none', name: 'None', bonus: {} };
    let totalStats = { set: setEntry.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };

    const mapStatKey = (k) => {
        if (k === 'cdmg' || k === 'crit dmg') return 'cm';
        if (k === 'crit' || k === 'crit rate') return 'cf';
        return k;
    };

    const starMult = liteData.stars || 1;
    if (liteData.mainStats) {
        if (liteData.mainStats.body) { const k = mapStatKey(liteData.mainStats.body); if (MAIN_STAT_VALS.body[k]) totalStats[k] += MAIN_STAT_VALS.body[k] * starMult; }
        if (liteData.mainStats.legs) { const k = mapStatKey(liteData.mainStats.legs); if (MAIN_STAT_VALS.legs[k]) totalStats[k] += MAIN_STAT_VALS.legs[k] * starMult; }
    }

    // 1. Add explicitly stored sub-stats (only if not in No Substats mode)
    if (!isNoSubsMode && liteData.subStats) {
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
    const addBaseFills = (slot, mainStatType) => {
        const existingTypes = new Set();
        if (liteData.subStats && liteData.subStats[slot] && Array.isArray(liteData.subStats[slot])) {
            liteData.subStats[slot].forEach(s => existingTypes.add(mapStatKey(s.type)));
        }
        const mappedMain = mapStatKey(mainStatType);

        const validCandidates = normalizeSubCandidates(SUB_CANDIDATES).filter(c => {
            if (!statConfig.applyRelicDot && c === 'dot') return false;
            if (!statConfig.applyRelicCrit && (c === 'cm' || c === 'cf')) return false;
            return true;
        });

        // SMART FILL: Prune 'cf' from filler if baseline (main stats + set) is already crit capped.
        let fillCandidates = [...validCandidates];
        if (fillCandidates.includes('cf')) {
            const tempRes = calculateDPS(effectiveStats, totalStats, context);
            if (tempRes.critData && tempRes.critData.rawRate >= 100) {
                fillCandidates = fillCandidates.filter(c => c !== 'cf');
            }
        }

        fillCandidates.forEach(cand => {
            if (cand === mappedMain) return;
            if (existingTypes.has(cand)) return;
            totalStats[cand] = (totalStats[cand] || 0) + (PERFECT_SUBS[cand] * starMult);
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

    result.setName = liteData.setName;
    result.traitName = typeof traitForContext === 'string' ? traitForContext : traitForContext.name;

    // Restore Config
    statConfig.applyRelicDot = previousDotState;
    statConfig.applyRelicCrit = previousCritState;

    return result;
}

window.calculateUnitBuilds = calculateUnitBuilds;
window.calculateInventoryBuilds = calculateInventoryBuilds;
window.reconstructMathData = reconstructMathData;
window.createResultEntry = createResultEntry;
window.getOptimizerStats = () => window.__optimizerStats || null;
window.flushOptimizerStats = maybeLogOptimizerStats;
window.isRangeRelicsEnabled = isRangeRelicsEnabled;
window.normalizeSubCandidates = normalizeSubCandidates;

window.getBenchmarkDps = function (unitId, traitName, starMult, isAbility) {
    const cacheKey = `${unitId}_${traitName}_${starMult}_${isAbility}`;
    if (window.benchmarkDpsCache && window.benchmarkDpsCache[cacheKey]) return window.benchmarkDpsCache[cacheKey];

    const unit = typeof getUnitById === 'function' ? getUnitById(unitId) : unitDatabase.find(u => u.id === unitId);
    if (!unit) return 0;

    const trait = getTraitByName(traitName, unitId) || getTraitFast(traitName);

    const { effectiveStats, context } = buildCalculationContext(unit, trait || traitName, {
        isAbility: isAbility
    });

    let maxScore = 0;
    const candidates = normalizeSubCandidates(['dmg', 'spa', 'range', 'cm', 'cf', 'dot']).filter(c => {
        if (c === 'dot' && !statConfig.applyRelicDot) return false;
        if ((c === 'cm' || c === 'cf') && !statConfig.applyRelicCrit) return false;
        return true;
    });

    SETS.forEach(set => {
        candidates.forEach(masterStat => {
            let benchStats = { set: set.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };

            const getBestMain = (slotMains) => {
                let bestMain = 'dmg';
                let bestDps = 0;
                Object.keys(slotMains).forEach(mKey => {
                    let temp = { ...benchStats, [mKey]: slotMains[mKey] * starMult };
                    let res = calculateDPS(effectiveStats, temp, context);
                    if (res.total > bestDps) { bestDps = res.total; bestMain = mKey; }
                });
                return bestMain;
            };

            const bestBodyMain = getBestMain(MAIN_STAT_VALS.body);
            const bestLegMain = getBestMain(MAIN_STAT_VALS.legs);

            benchStats[bestBodyMain] = (benchStats[bestBodyMain] || 0) + MAIN_STAT_VALS.body[bestBodyMain] * starMult;
            benchStats[bestLegMain] = (benchStats[bestLegMain] || 0) + MAIN_STAT_VALS.legs[bestLegMain] * starMult;

            benchStats[masterStat] = (benchStats[masterStat] || 0) + MAX_SUB_STAT_VALUES[masterStat] * starMult;

            let fillers = candidates.filter(c => c !== masterStat && c !== bestBodyMain && c !== bestLegMain);
            let fillerDpsMap = fillers.map(fKey => {
                let temp = { ...benchStats, [fKey]: PERFECT_SUBS[fKey] * starMult };
                return { key: fKey, dps: calculateDPS(effectiveStats, temp, context).total };
            }).sort((a, b) => b.dps - a.dps);

            fillerDpsMap.slice(0, 3).forEach(f => benchStats[f.key] = (benchStats[f.key] || 0) + PERFECT_SUBS[f.key] * starMult);

            let finalBenchRes = calculateDPS(effectiveStats, benchStats, context);
            if (finalBenchRes.total > maxScore) maxScore = finalBenchRes.total;
        });
    });

    if (!window.benchmarkDpsCache) window.benchmarkDpsCache = {};
    window.benchmarkDpsCache[cacheKey] = maxScore;
    return maxScore;
};