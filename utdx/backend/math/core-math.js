// combineTraits moved to shared/traits/trait-backend.js

function getLevelStats(baseDmg, baseSpa, baseRange, dmgPoints, spaPoints, rangePoints) {
    const dmgMult = Math.pow(1.0045125, dmgPoints);
    const spaMult = Math.pow(0.9954875, spaPoints);
    const rangeMult = Math.pow(1.0045125, rangePoints || 0);

    return {
        dmg: baseDmg * dmgMult,
        spa: baseSpa * spaMult,
        range: baseRange * rangeMult,
        dmgMult,
        spaMult,
        rangeMult
    };
}

const checkIsBetter = (res, currentBest, optimizeFor) => {
    if (optimizeFor === 'range') {
        if (res.range > currentBest.range) return true;
        if (res.range === currentBest.range && res.total > currentBest.total) return true;
        return false;
    }
    if (optimizeFor === 'raw_dmg' || optimizeFor === 'damage') {
        if (res.dmgVal > currentBest.dmgVal) return true;
        if (res.dmgVal === currentBest.dmgVal && res.total > currentBest.total) return true;
        return false;
    }
    return res.total > currentBest.total;
};

// --- CC DETECTION UTILITY ---
// Strict whitelist of units whose primary role includes Crowd Control.
// Used to restrict Rebellious head piece to CC-capable units only.
// Units with summon-based CC (e.g. Sukuna's Ten Umbra stun) are NOT included.


window.unitHasCC = function(uStats) {
    if (!uStats) return false;
    // Check for dynamic support tags in the unit definition or tags array
    let s = "";
    if (uStats.support) s += uStats.support.toLowerCase() + ",";
    if (uStats.tags && Array.isArray(uStats.tags)) s += uStats.tags.join(',').toLowerCase();
    
    return s.includes('slow') || s.includes('stun') || s.includes('confuse') || s.includes('timestop');
};

window.unitHasTimeSnail = function(uStats) {
    if (!uStats) return false;
    return window.isUnit && (
        window.isUnit(uStats.id, 'water_god') ||
        window.isUnit(uStats.id, 'underworld_god') ||
        window.isUnit(uStats.id, 'mochi_pirate') ||
        window.isUnit(uStats.id, 'crow_shinobi')
    );
};

window.unitHasStatusEffect = function(uStats) {
    if (!uStats) return false;
    if (window.unitHasCC(uStats)) return true;
    if (window.unitHasTimeSnail(uStats)) return true;
    
    // Check native DoT stats
    if (uStats.stats && (uStats.stats.dot > 0 || uStats.stats.bossDot > 0)) return true;
    if (uStats.dot > 0 || uStats.bossDot > 0) return true;
    if (uStats.customSummons && uStats.customSummons.some(s => s.dotPct > 0)) return true;
    if (uStats.customFollowUp && uStats.customFollowUp.dotPct > 0) return true;
    if (uStats.modes && Array.isArray(uStats.modes)) {
        if (uStats.modes.some(m => m && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotPct > 0)))) return true;
    }
    
    let s = "";
    if (uStats.support) s += uStats.support.toLowerCase() + ",";
    if (uStats.tags && Array.isArray(uStats.tags)) s += uStats.tags.join(',').toLowerCase();
    
    return s.includes('freeze') || s.includes('burn') || s.includes('bleed') || s.includes('poison') || s.includes('electrified') || s.includes('slow') || s.includes('stun');
};

const getBestSubConfig = (build, stats, includeSubs, headMode, candidates, optimizeFor = 'dps') => {
    let mode = headMode;
    if (mode === true) mode = 'auto';
    if (mode === false) mode = 'none';

    let headOptions = (mode === 'auto')
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut']
        : (mode && mode !== 'none' ? [mode] : ['none']);

    // Filter bloodline_head for non-CC units - REMOVED restriction
    // if (!window.unitHasCC(stats)) {
    //     headOptions = headOptions.filter(h => h !== 'rebellious_head');
    // }

    let globalBestRes = { total: -1, range: -1 };
    let globalBestAssignments = {};
    let globalBestHead = 'none';

    const applyContextualStats = (b, pieceName, mainStat, pStat, sStat, ratio) => {
        let pWeight = ratio.p;
        let sWeight = ratio.s;

        if (pStat === mainStat) { sWeight = Math.min(6, sWeight + pWeight); pWeight = 0; }
        else if (sStat === mainStat) { pWeight = Math.min(6, pWeight + sWeight); sWeight = 0; }
        if (pStat === mainStat && sStat === mainStat) { pWeight = 0; sWeight = 0; }

        let pVal = 0, sVal = 0;
        if (pWeight > 0) { pVal = PERFECT_SUBS[pStat] * pWeight; b[pStat] = (b[pStat] || 0) + pVal; }
        if (sWeight > 0) { sVal = PERFECT_SUBS[sStat] * sWeight; b[sStat] = (b[sStat] || 0) + sVal; }

        candidates.forEach(cand => {
            if (cand === mainStat || (cand === pStat && pWeight > 0) || (cand === sStat && sWeight > 0)) return;
            b[cand] = (b[cand] || 0) + PERFECT_SUBS[cand];
        });
        return { pStat, pVal, sStat, sVal };
    };

    const formatAssignment = (res) => {
        let arr = [];
        if (res.pVal > 0) arr.push({ type: res.pStat, val: res.pVal });
        if (res.sVal > 0) arr.push({ type: res.sStat, val: res.sVal });
        return arr;
    };

    headOptions.forEach(headType => {
        const actualIncludeHead = (headType !== 'none');
        stats.context.headPiece = headType;

        if (!includeSubs) {
            let res = calculateDPS(stats, build, stats.context);
            res.totalStats = build;
            if (checkIsBetter(res, globalBestRes, optimizeFor)) {
                globalBestRes = res; globalBestAssignments = {}; globalBestHead = headType;
            }
            return;
        }

        // If this head disables crits, remove crit subs from candidates
        const activeCandidates = (headType === 'sorcerer_hunter_spirit')
            ? candidates.filter(c => c !== 'cf' && c !== 'cm')
            : candidates;

        let strategies = [];
        activeCandidates.forEach(c => strategies.push({ p: c, s: c, ratio: { p: 6, s: 0 } }));
        const pairs = [['dmg', 'cf'], ['dmg', 'spa'], ['dmg', 'range'], ['dmg', 'cm'], ['cf', 'cm'], ['spa', 'range']];
        const ratios = [{ p: 4, s: 3 }, { p: 3, s: 4 }, { p: 5, s: 2 }, { p: 2, s: 5 }];

        pairs.forEach(pair => {
            const [c1, c2] = pair;
            if (!activeCandidates.includes(c1) || !activeCandidates.includes(c2)) return;
            ratios.forEach(r => strategies.push({ p: c1, s: c2, ratio: r }));
        });

        strategies.forEach(strat => {
            let testBuild = { dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
            if (build.bodyType) testBuild[build.bodyType] = (testBuild[build.bodyType] || 0) + (MAIN_STAT_VALS.body[build.bodyType] || 0);
            if (build.legType) testBuild[build.legType] = (testBuild[build.legType] || 0) + (MAIN_STAT_VALS.legs[build.legType] || 0);

            let currentAssignments = {};
            if (actualIncludeHead) {
                const res = applyContextualStats(testBuild, 'head', null, strat.p, strat.s, strat.ratio);
                currentAssignments.head = formatAssignment(res);
            }
            const resBody = applyContextualStats(testBuild, 'body', build.bodyType, strat.p, strat.s, strat.ratio);
            currentAssignments.body = formatAssignment(resBody);
            const resLegs = applyContextualStats(testBuild, 'legs', build.legType, strat.p, strat.s, strat.ratio);
            currentAssignments.legs = formatAssignment(resLegs);

            let res = calculateDPS(stats, testBuild, stats.context);
            res.totalStats = testBuild;

            if (checkIsBetter(res, globalBestRes, optimizeFor)) {
                globalBestRes = res;
                globalBestHead = headType;
                globalBestAssignments = currentAssignments;
                globalBestAssignments.selectedHead = headType;
            }
        });
    });

    globalBestAssignments.selectedHead = globalBestHead;
    return { res: globalBestRes, desc: "", assignments: globalBestAssignments };
};

// Relic math migrated to shared/relics/relic-backend.js

function _calcSummonDPS(uStats, finalDmg, finalSpa, placement) {
    if (!uStats.summonStats) return { summonDpsTotal: 0, summonData: null };
    const s = uStats.summonStats;
    const planeBaseDmg = finalDmg * (s.dmgPct / 100);
    const calcPlaneTypeDPS = (typeStats) => {
        if (!typeStats) return 0;
        const attacksPerLife = Math.floor(typeStats.duration / typeStats.spa) + 1;
        let totalDamageOverLife = 0;
        for (let i = 0; i < attacksPerLife; i++) {
            const time = i * typeStats.spa;
            let isBuffed = time < s.buffWindow;
            let pMult = (1 + ((isBuffed ? s.buffCdmg : 150) / 100) * ((isBuffed ? s.buffCrit : 0) / 100));
            totalDamageOverLife += planeBaseDmg * pMult;
        }
        return totalDamageOverLife / typeStats.duration;
    };
    const dpsA = calcPlaneTypeDPS(s.planeA);
    const dpsB = calcPlaneTypeDPS(s.planeB);
    const avgOnePlaneDps = (dpsA + dpsB) / 2;
    const avgDuration = ((s.planeA?.duration || 0) + (s.planeB?.duration || 0)) / 2;
    const attacksToSpawn = s.attacksToSpawn || 1;
    const actualCount = Math.min(avgDuration / (finalSpa * attacksToSpawn), s.maxCount);
    return { summonDpsTotal: (avgOnePlaneDps * actualCount) * placement, summonData: { count: actualCount, max: s.maxCount, avgPlaneDps: avgOnePlaneDps, hostSpa: finalSpa, avgDuration: avgDuration, dpsA: dpsA, dpsB: dpsB } };
}

function _calcDoTDPS(uStats, traitObj, traitDotBonus, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult, finalDmgBoss = undefined, avgCritMultBoss = undefined) {
    let dotDpsTotal = 0;
    let bossDotDpsTotal = 0;
    let dotCritMult = isVirtualRealm ? avgCritMult : 1;
    let dotCritMultBoss = isVirtualRealm ? (avgCritMultBoss || avgCritMult) : 1;

    // DoT can Crit logic
    let dotCanCrit = false;
    if (uStats.passives && uStats.passives.some(p => p.canCrit === true)) dotCanCrit = true;
    if (uStats.modes && typeof window !== 'undefined' && window.unitModesState) {
        const state = window.unitModesState[uStats.id] !== undefined ? window.unitModesState[uStats.id] : 0;
        const activeModes = Array.isArray(state) ? state : [state];
        activeModes.forEach(idx => {
            if (uStats.modes[idx] && uStats.modes[idx].canCrit === true) dotCanCrit = true;
        });
    }

    if (dotCanCrit) {
        dotCritMult = avgCritMult;
        dotCritMultBoss = avgCritMultBoss || avgCritMult;
    }

    const traitMultiplier = 1 + (traitDotBonus / 100);
    const gearMultiplier = 1 + (gearDotBonus / 100);

    let dotBreakdown = {
        nativeDps: 0,
        bossNativeDps: 0,
        radDps: 0,
        base: uStats.dot,
        traitBonus: traitDotBonus,
        gearBonus: gearDotBonus,
        traitMult: traitMultiplier,
        gearMult: gearMultiplier,
        critMult: dotCritMult,
        nativeInterval: 0,
        nativeTotalDmg: 0,
        radInterval: 0,
        radTotalDmg: 0,
        isMultiHit: false
    };
    
    if (uStats.requiresDot && window.CALCULATION_MODE === 'loadout') {
        const hotbar = window.hotbarState;
        let requirementMet = false;
        if (hotbar && hotbar.slots) {
            hotbar.slots.forEach(s => {
                if (!s || requirementMet) return;
                const sBaseId = s.id.split('-')[0];
                const uBaseId = uStats.id.split('-')[0];
                if (sBaseId === uBaseId) return;
                const sUnit = window.getUnitById(s.id);
                if (!sUnit) return;
                if (sUnit.stats) {
                    if (sUnit.stats.dotType === uStats.requiresDot && sUnit.stats.dot > 0) requirementMet = true;
                    if (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === uStats.requiresDot) requirementMet = true;
                }
                const modeIdx = (window.unitModesState && window.unitModesState[sUnit.id]);
                if (sUnit.modes && modeIdx !== undefined && sUnit.modes[modeIdx]) {
                    const activeMode = sUnit.modes[modeIdx];
                    if (activeMode.dotType === uStats.requiresDot && (activeMode.dot > 0)) requirementMet = true;
                    if (activeMode.customFollowUp && activeMode.customFollowUp.dotType === uStats.requiresDot) requirementMet = true;
                }
            });
        }
        if (!requirementMet) {
            dotBreakdown.inactive = true;
            dotBreakdown.requirement = uStats.requiresDot;
            return { dotDpsTotal: 0, bossDotDpsTotal: 0, dotBreakdown };
        }
    }

    const canStack = (traitObj.allowDotStack || traitObj.allowPlacementStack);
    if (uStats.dot > 0 || uStats.bossDot > 0) {
        // Normal Dot
        let normalTickPct = uStats.dot * traitMultiplier * gearMultiplier;
        let normalTotalDmg = finalDmg * (normalTickPct / 100) * dotCritMult;
        
        // Boss Dot (Defaults to normal dot if bossDot is not specified)
        let bossBasePct = uStats.bossDot || uStats.dot;
        let bossTickPct = bossBasePct * traitMultiplier * gearMultiplier;
        const actualFinalDmgBoss = finalDmgBoss !== undefined ? finalDmgBoss : finalDmg;
        let bossTotalDmg = actualFinalDmgBoss * (bossTickPct / 100) * dotCritMultBoss;

        const duration = uStats.dotDuration || 0;
        const interval = canStack ? finalSpa : (duration > 0 ? Math.ceil(duration / finalSpa) * finalSpa : finalSpa);
        
        dotBreakdown.nativeTotalDmg = normalTotalDmg; 
        dotBreakdown.nativeInterval = interval; 
        dotBreakdown.nativeDps = normalTotalDmg / interval;
        dotBreakdown.bossNativeDps = bossTotalDmg / interval;
    }

    if (traitObj.hasRadiation) {
        const radPct = (traitObj.radiationPct || 20) * traitMultiplier * gearMultiplier;
        const totalRadDmg = finalDmg * (radPct / 100);
        dotBreakdown.radTotalDmg = totalRadDmg;
        dotBreakdown.radInterval = 10; 
        dotBreakdown.radDps = totalRadDmg / 10;
    }

    dotDpsTotal = (dotBreakdown.nativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);
    bossDotDpsTotal = (dotBreakdown.bossNativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);

    return { dotDpsTotal, bossDotDpsTotal, dotBreakdown };
}
