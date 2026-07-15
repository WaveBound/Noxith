// ============================================================================
// CORE-MATH.JS - Optimized Greedy Sub-Stat Allocation & Stats Core
// ============================================================================

function getLevelStats(baseDmg, baseSpa, baseRange, dmgPoints, spaPoints, rangePoints) {
    const dmgMult = Math.pow(1.0045, dmgPoints);
    const spaMult = Math.pow(0.9955, spaPoints);
    const rangeMult = Math.pow(1.0045, rangePoints || 0);

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
    if (res.total > currentBest.total) return true;
    if (res.total === currentBest.total) {
        const resWasted = (res.critData && res.critData.rawRate > 100) ? res.critData.rawRate - 100 : 0;
        const bestWasted = (currentBest.critData && currentBest.critData.rawRate > 100) ? currentBest.critData.rawRate - 100 : 0;
        if (resWasted < bestWasted) return true;
    }
    return false;
};

// --- CC DETECTION UTILITY ---
window.unitHasCC = function (uStats) {
    if (!uStats) return false;
    let s = "";
    if (uStats.support) s += uStats.support.toLowerCase() + ",";
    if (uStats.tags && Array.isArray(uStats.tags)) s += uStats.tags.join(',').toLowerCase();

    return s.includes('slow') || s.includes('stun') || s.includes('confuse') || s.includes('timestop');
};

window.unitHasTimeSnail = function (uStats) {
    if (!uStats) return false;
    return window.isUnit && (
        window.isUnit(uStats.id, 'water_god') ||
        window.isUnit(uStats.id, 'underworld_god') ||
        window.isUnit(uStats.id, 'crow_shinobi')
    );
};

window.unitHasStatusEffect = function (uStats) {
    if (!uStats) return false;
    if (window.unitHasCC(uStats)) return true;
    if (window.unitHasTimeSnail(uStats)) return true;

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
    if (mode === 'none') mode = 'none';

    let headOptions = (mode === 'auto')
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'ultiorras_wings', 'berserks_cleave', 'panther_claws', 'fused_earrings', 'koyotes_sword', 'phantom_stealer_head', 'almighty_accessory']
        : (mode && mode !== 'none' ? [mode] : ['none']);

    let globalBestRes = { total: -1, range: -1 };
    let globalBestAssignments = {};
    let globalBestHead = 'none';

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

        // --- GREEDY PIECE-INDIVIDUAL SUB-STAT ALLOCATION ENGINE ---
        const pieces = [];
        if (actualIncludeHead) pieces.push({ name: 'head', main: null, subs: {}, maxSubs: 5, upgrades: 5 });
        pieces.push({ name: 'body', main: build.bodyType, subs: {}, maxSubs: 5, upgrades: 5 });
        pieces.push({ name: 'legs', main: build.legType, subs: {}, maxSubs: 5, upgrades: 5 });

        let activeCandidates = [...candidates];
        if (headType === 'sorcerer_hunter_spirit') {
            activeCandidates = activeCandidates.filter(c => c !== 'cf' && c !== 'cm');
        }

        const buildRelicStats = () => {
            const rStats = { set: build.set || build.setName, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
            const starMult = stats.context.starMult || 1;
            if (build.bodyType) rStats[build.bodyType] += (MAIN_STAT_VALS.body[build.bodyType] || 0) * starMult;
            if (build.legType) rStats[build.legType] += (MAIN_STAT_VALS.legs[build.legType] || 0) * starMult;

            pieces.forEach(p => {
                const hStarMult = p.name === 'head' ? (stats.context.headStarMult || starMult) : starMult;
                Object.entries(p.subs).forEach(([k, rolls]) => {
                    rStats[k] += rolls * PERFECT_SUBS[k] * hStarMult;
                });
            });
            return rStats;
        };

        const getEffectiveCritCap = () => {
            if (window.isUnit(stats.id, 'pirate_king')) return 40;
            if (headType === 'sorcerer_hunter_spirit') return 0;
            if (window.isUnit(stats.id, 'angel_born_in_hell')) {
                return 0;
            }
            if (window.isUnit(stats.id, 'the_strongest_of_today') || window.isUnit(stats.id, 'strongest_of_today')) {
                return 50;
            }
            if (window.isUnit(stats.id, 'kirito')) return stats.crit || 0;
            return 100;
        };

        const baseResForCritCap = calculateDPS(stats, buildRelicStats(), stats.context);
        const baseCritCap = getEffectiveCritCap();
        const baseEffectiveCritRate = Math.min(baseResForCritCap.critData?.rate ?? 0, baseCritCap);
        const baseFinalCritRate = baseResForCritCap.critData?.rate ?? 0;
        const baseRawCritRate = baseResForCritCap.critData?.rawRate ?? 0;
        const seedCritRate = baseEffectiveCritRate < baseCritCap;
        if (window.DEBUG_CRIT_OVERFLOW) {
            console.debug('[CRIT-DIAG] optimizer seed crit', {
                unitId: stats.id,
                headType,
                set: build.set || build.setName,
                optimizeFor,
                baseRawCritRate,
                baseFinalCritRate,
                seedCritRate
            });
        }

        pieces.forEach(p => {
            activeCandidates.forEach(cand => {
                if (cand === p.main) return;
                if (cand === 'cf' && !seedCritRate) return;
                p.subs[cand] = 1;
            });
        });

        const totalUpgrades = pieces.reduce((sum, p) => sum + p.upgrades, 0);

        for (let step = 0, governor = 0; step < totalUpgrades && governor < 100; governor++) {
            let bestUpgrade = null;
            let bestScore = -Infinity;
            let fallbackUpgrade = null;

            for (let pIdx = 0; pIdx < pieces.length; pIdx++) {
                const p = pieces[pIdx];
                if (p.upgrades <= 0) continue;

                const currentRStats = buildRelicStats();
                const currentCritRes = calculateDPS(stats, currentRStats, stats.context);
                const currentCritCap = getEffectiveCritCap();
                const currentEffectiveCritRate = Math.min(currentCritRes.critData?.rate ?? 0, currentCritCap);
                const currentRawCritRate = currentCritRes.critData?.rawRate ?? 0;

                if (window.DEBUG_CRIT_OVERFLOW && currentEffectiveCritRate >= currentCritCap) {
                    console.debug('[CRIT-DIAG] optimizer sees capped effective crit; crit subs should be skipped', {
                        unitId: stats.id,
                        headType,
                        set: build.set || build.setName,
                        piece: p.name,
                        currentRawCritRate,
                        currentEffectiveCritRate,
                        currentCritCap,
                        step,
                        optimizeFor
                    });
                }

                for (let cIdx = 0; cIdx < activeCandidates.length; cIdx++) {
                    const cand = activeCandidates[cIdx];
                    if (cand === p.main) continue;
                    if ((p.subs[cand] || 0) >= 6) continue; // max 6 rolls per stat (1 base + 5 upgrades)
                    if (cand === 'cf' && currentEffectiveCritRate >= currentCritCap) continue;

                    p.subs[cand] = (p.subs[cand] || 0) + 1;
                    const rStats = buildRelicStats();
                    const res = calculateDPS(stats, rStats, stats.context);
                    p.subs[cand]--;

                    const candidateCritCap = getEffectiveCritCap();
                    const candidateEffectiveCritRate = Math.min(res.critData?.rate ?? 0, candidateCritCap);
                    if (cand === 'cf' && candidateEffectiveCritRate >= candidateCritCap) {
                        if (window.DEBUG_CRIT_OVERFLOW) {
                            console.debug('[CRIT-DIAG] candidate crit roll reaches effective cap', {
                                unitId: stats.id,
                                headType,
                                set: build.set || build.setName,
                                piece: p.name,
                                candidate: cand,
                                rawRate: res.critData.rawRate,
                                finalRate: res.critData.rate,
                                effectiveRate: candidateEffectiveCritRate,
                                candidateCritCap,
                                step,
                                optimizeFor
                            });
                        }
                    }

                    const score = optimizeFor === 'range' ? res.range :
                        (optimizeFor === 'raw_dmg' || optimizeFor === 'damage' ? res.dmgVal : res.total);

                    if (score > bestScore) {
                        bestScore = score;
                        bestUpgrade = { pieceIndex: pIdx, candidate: cand };
                    }
                    if (!fallbackUpgrade) fallbackUpgrade = { pieceIndex: pIdx, candidate: cand };
                }
            }

            const chosenUpgrade = bestUpgrade || fallbackUpgrade;
            if (chosenUpgrade) {
                const p = pieces[chosenUpgrade.pieceIndex];
                p.subs[chosenUpgrade.candidate] = (p.subs[chosenUpgrade.candidate] || 0) + 1;
                p.upgrades--;
                step++;
            } else {
                break;
            }
        }

        const finalRStats = buildRelicStats();
        const finalRes = calculateDPS(stats, finalRStats, stats.context);
        const finalCritCap = getEffectiveCritCap();
        const finalEffectiveCritRate = Math.min(finalRes.critData?.rate ?? 0, finalCritCap);
        if (window.DEBUG_CRIT_OVERFLOW && finalEffectiveCritRate > finalCritCap) {
            console.warn('[CRIT-DIAG] optimizer produced effective crit > 100', {
                unitId: stats.id,
                headType,
                set: build.set || build.setName,
                optimizeFor,
                rawRate: finalRes.critData.rawRate,
                finalRate: finalRes.critData.rate,
                effectiveRate: finalEffectiveCritRate,
                relicStats: finalRStats
            });
        }
        finalRes.totalStats = finalRStats;

        if (checkIsBetter(finalRes, globalBestRes, optimizeFor)) {
            globalBestRes = finalRes;
            globalBestHead = headType;

            const formatPieceAssignment = (p) => {
                const hStarMult = p.name === 'head' ? (stats.context.headStarMult || stats.context.starMult || 1) : (stats.context.starMult || 1);
                return Object.entries(p.subs)
                    .filter(([k, rolls]) => rolls > 1) // only show stats that received upgrades (base-only rolls are fillers)
                    .map(([k, rolls]) => ({
                        type: k,
                        val: rolls * PERFECT_SUBS[k] * hStarMult
                    }));
            };

            globalBestAssignments = {
                head: actualIncludeHead ? formatPieceAssignment(pieces.find(p => p.name === 'head')) : null,
                body: formatPieceAssignment(pieces.find(p => p.name === 'body')),
                legs: formatPieceAssignment(pieces.find(p => p.name === 'legs')),
                selectedHead: headType
            };
        }
    });

    globalBestAssignments.selectedHead = globalBestHead;
    return { res: globalBestRes, desc: "", assignments: globalBestAssignments };
};

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

function _calcDoTDPS(uStats, traitObj, traitDotBonus, relicDotBonus, externalDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult, finalDmgBoss = undefined, avgCritMultBoss = undefined, passiveDotBuff = 0, globalDotMult = 1, globalDotBonus = 0) {
    let dotDpsTotal = 0;
    let bossDotDpsTotal = 0;
    let dotCritMult = isVirtualRealm ? avgCritMult : 1;
    let dotCritMultBoss = isVirtualRealm ? (avgCritMultBoss || avgCritMult) : 1;

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
    
    const bugMult = (uStats.id && (uStats.id === 'ant_king_savage' || (window.isUnit && window.isUnit(uStats.id, 'ant_king_savage')))) ? 2 : 1;
    
    const traitMult = 1 + ((traitDotBonus || 0) / 100);
    const relicMult = 1 + ((relicDotBonus || 0) / 100);
    const externalMult = 1 + (((externalDotBonus || 0) * bugMult) / 100);
    const globalMult = 1 + ((globalDotBonus || 0) / 100);
    const passiveMult = 1 + ((passiveDotBuff || 0) / 100);
    
    const combinedMultiplier = traitMult * relicMult * externalMult * globalMult * passiveMult * (globalDotMult || 1);

    let dotBreakdown = {
        nativeDps: 0,
        bossNativeDps: 0,
        radDps: 0,
        base: uStats.dot,
        traitBonus: traitDotBonus,
        relicBonus: relicDotBonus,
        externalDotBonus: externalDotBonus,
        globalDotBonus: globalDotBonus,
        traitMult: traitMult,
        relicMult: relicMult,
        externalMult: externalMult,
        globalMult: globalMult,
        passiveMult: passiveMult,
        globalDotMult: globalDotMult,
        passiveBonus: passiveDotBuff,
        combinedMultiplier: combinedMultiplier,
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
        let normalTickPct = uStats.dot * combinedMultiplier;
        let normalTotalDmg = finalDmg * (normalTickPct / 100) * dotCritMult;

        let bossBasePct = uStats.bossDot || uStats.dot;
        let bossTickPct = bossBasePct * combinedMultiplier;
        const actualFinalDmgBoss = finalDmgBoss !== undefined ? finalDmgBoss : finalDmg;
        let bossTotalDmg = actualFinalDmgBoss * (bossTickPct / 100) * dotCritMultBoss;

        const duration = uStats.dotDuration || 0;
        let interval = canStack ? finalSpa : (duration > 0 ? Math.ceil(duration / finalSpa) * finalSpa : finalSpa);
        const isChief = uStats.id === 'revolutionary_chief_syncro' || (window.isUnit && window.isUnit(uStats.id, 'revolutionary_chief_syncro'));
        if (isChief) {
            interval = 9.0;
        }
        
        // For The Almighty in Self Buff mode, FUA triggers DoT as well.
        // His 5s duration DoT goes off entirely every attack cycle because FUA triggers it,
        // so the effective DoT interval is finalSpa (4.5s) rather than 9s.
        if (window.isUnit && window.isUnit(uStats.id, 'the_almighty')) {
            const activeMode = (window.unitModesState && window.unitModesState['the_almighty'] !== undefined)
                ? (Array.isArray(window.unitModesState['the_almighty']) ? window.unitModesState['the_almighty'][0] : window.unitModesState['the_almighty'])
                : 0;
            if (activeMode === 0) {
                interval = finalSpa;
            }
        }

        dotBreakdown.nativeTotalDmg = normalTotalDmg;
        dotBreakdown.nativeInterval = interval;
        dotBreakdown.nativeDps = normalTotalDmg / interval;
        dotBreakdown.bossNativeDps = bossTotalDmg / interval;
    }

    if (traitObj.hasRadiation || uStats.hasRadiation) {
        let baseRadPct = 0;
        let baseRadInterval = 10;
        if (traitObj.hasRadiation) {
            baseRadPct += (traitObj.radiationPct || 20);
        }
        if (uStats.hasRadiation) {
            baseRadPct += (uStats.radiationPct || 15);
            if (uStats.radiationDuration) baseRadInterval = uStats.radiationDuration;
        }

        const radPct = baseRadPct * combinedMultiplier;
        const totalRadDmg = finalDmg * (radPct / 100) * dotCritMult;
        dotBreakdown.radTotalDmg = totalRadDmg;
        dotBreakdown.radInterval = baseRadInterval;
        dotBreakdown.radDps = totalRadDmg / baseRadInterval;
    }

    dotDpsTotal = (dotBreakdown.nativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);
    bossDotDpsTotal = (dotBreakdown.bossNativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);

    return { dotDpsTotal, bossDotDpsTotal, dotBreakdown };
}

window.getLevelStats = getLevelStats;
window.checkIsBetter = checkIsBetter;
window.getBestSubConfig = getBestSubConfig;
window._calcSummonDPS = _calcSummonDPS;
window._calcDoTDPS = _calcDoTDPS;
