function combineTraits(t1, t2) {
    if (t1.id === 'none' && t2.id === 'none') return t1;
    if (t1.id === 'none') return t2;
    if (t2.id === 'none') return t1;

    const compound = (v1, v2) => {
        const d1 = (v1 || 0) / 100;
        const d2 = (v2 || 0) / 100;
        return ((1 + d1) * (1 + d2) - 1) * 100;
    };

    const compoundReduction = (v1, v2) => {
        const r1 = (v1 || 0) / 100;
        const r2 = (v2 || 0) / 100;
        return (1 - (1 - r1) * (1 - r2)) * 100;
    };

    let combined = {
        id: t1.id + "+" + t2.id,
        name: `${t1.name} + ${t2.name}`,
        isCustom: true,
        subTraits: [t1, t2],

        dmg: compound(t1.dmg, t2.dmg),
        spa: compoundReduction(t1.spa, t2.spa),
        range: compound(t1.range, t2.range),
        bossDmg: compound(t1.bossDmg, t2.bossDmg),

        critRate: (t1.critRate || 0) + (t2.critRate || 0),
        dotBuff: (t1.dotBuff || 0) + (t2.dotBuff || 0),

        isEternal: t1.isEternal || t2.isEternal,
        hasRadiation: t1.hasRadiation || t2.hasRadiation,
        radiationPct: (t1.radiationPct || 0) + (t2.radiationPct || 0),
        radiationDuration: Math.max(t1.radiationDuration || 0, t2.radiationDuration || 0),
        afflictionDuration: (t1.afflictionDuration || 0) + (t2.afflictionDuration || 0),
        dmgDebuff: (t1.dmgDebuff || 0) + (t2.dmgDebuff || 0),
        isAfflictionBugged: t1.isAfflictionBugged || t2.isAfflictionBugged,
        isDotBugged: t1.isDotBugged || t2.isDotBugged,
        isDebuffBugged: t1.isDebuffBugged || t2.isDebuffBugged,

        allowDotStack: t1.allowDotStack || t2.allowDotStack,
        allowPlacementStack: t1.allowPlacementStack || t2.allowPlacementStack,

        relicBuff: (t1.relicBuff ? t1.relicBuff - 1 : 0) + (t2.relicBuff ? t2.relicBuff - 1 : 0) + 1,

        limitPlace: (t1.limitPlace && t2.limitPlace) ? Math.min(t1.limitPlace, t2.limitPlace) : (t1.limitPlace || t2.limitPlace),

        costReduction: (t1.costReduction || 0) + (t2.costReduction || 0)
    };

    if (combined.relicBuff === 1) combined.relicBuff = undefined;
    return combined;
}

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

const getBestSubConfig = (build, stats, includeSubs, headMode, candidates, optimizeFor = 'dps') => {
    let mode = headMode;
    if (mode === true) mode = 'auto';
    if (mode === false) mode = 'none';

    let headOptions = (mode === 'auto')
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch']
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

function _calcSetAndTagBonuses(relicStats, uStats, headPiece, context = {}) {
    let sBonus = { ...(setBonuses[relicStats.set] || setBonuses.none) };
    let tagBuffs = { dmg: 0, spa: 0, cm: 0, cf: 0, range: 0, dot: 0 };
    let setPerkDmg = 0;

    if (headPiece === 'reaper_necklace') {
        if (relicStats.set !== 'reaper_set') { sBonus.spa = (sBonus.spa || 0) + 7.5; sBonus.range = (sBonus.range || 0) + 15; }
    } else if (headPiece === 'shadow_reaper_necklace') {
        if (relicStats.set !== 'shadow_reaper') { sBonus.dmg = (sBonus.dmg || 0) + 2.5; sBonus.range = (sBonus.range || 0) + 10; sBonus.cf = (sBonus.cf || 0) + 5; sBonus.cm = (sBonus.cm || 0) + 5; }
    }

    const unitElement = uStats.element || "None";
    const tags = uStats.tags || [];

    if (relicStats.set === 'ninja' && ["Dark", "Rose", "Fire"].includes(unitElement)) sBonus.dmg += 10;
    else if (relicStats.set === 'sun_god' && ["Ice", "Light", "Water"].includes(unitElement)) sBonus.dmg += 10;

    // Rebellious Shinobi: +30% Dmg on CC Application (uses shared CC utility)
    const hasCC = window.unitHasCC(uStats);
    context.hasCC = hasCC;

    if (relicStats.set === 'rebellious_set' && hasCC) {
        // Return a flag to handle dynamic uptime in _calcHeadDynamicBuffs
        context.rebelliousCCActive = true;
    }

    const isMage = window.isUnit(uStats.id, 'ancient_mage') || window.isUnit(uStats.id, 'megumin') || window.isUnit(uStats.id, 'maid') || window.isUnit(uStats.id, 'water_god') || (uStats.name && uStats.name.includes('Mage'));

    // Great Mage: +20% Dmg on Type Advantage Hit (Uptime ~90%)
    if (relicStats.set === 'great_mage' && isMage) {
        sBonus.dmg += 18;
        setPerkDmg += 18;
    }

    const applyTagBuff = (bonusName, tagName, stats) => {
        if (relicStats.set === bonusName && tags.includes(tagName)) {
            for (let k in stats) {
                sBonus[k] = (sBonus[k] || 0) + stats[k];
                tagBuffs[k] = (tagBuffs[k] || 0) + stats[k];
            }
        }
    };

    applyTagBuff('shadow_reaper', 'Peroxide', { spa: 10 });
    applyTagBuff('shadow_reaper', 'Reaper', { dmg: 25, spa: 12.5 });
    applyTagBuff('shadow_reaper', 'Rage', { dmg: 15, spa: 8.5, dot: 10 });
    applyTagBuff('shadow_reaper', 'Hollow', { cf: 20, cm: 12.5 });
    applyTagBuff('reaper_set', 'Peroxide', { dmg: 10, dot: 5, cm: 8.5 });
    applyTagBuff('reaper_set', 'Reaper', { range: 15 });
    applyTagBuff('reaper_set', 'Rage', { cm: 25, cf: 10, range: 10 });
    applyTagBuff('reaper_set', 'Hollow', { dmg: 12.5, spa: 7.5, range: 15 });

    // NEW SET TAG PERKS
    applyTagBuff('rebellious_set', 'Ninjaverse', { cf: 15, cm: 20 });
    applyTagBuff('rebellious_set', 'Sage', {}); // Element and Hyperarmor ignored per request
    applyTagBuff('rebellious_set', 'Bloodline', { dmg: 15, range: 20 });

    // Universal Magi Tag Buff
    // (King Sailor is excluded because he gets this natively via his unit passives)
    if (tags.includes('Magi') && !window.isUnit(uStats.id, 'king_sailor')) {
        sBonus.dmg = (sBonus.dmg || 0) + 50;
        sBonus.spa = (sBonus.spa || 0) + 15;
        tagBuffs.dmg = (tagBuffs.dmg || 0) + 50;
        tagBuffs.spa = (tagBuffs.spa || 0) + 15;
    }

    // Monarch Dynamic Bonus (Set)
    if (relicStats.set === 'monarch') {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        let summonCount = 0;

        if (window.isUnit(uStats.id, 'the_strongest_in_history')) {
            const state = (window.unitModesState || {})[uStats.id];
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : [0]);
            // Only Perfect Curse (1) and Adaptive Curse (2) count as summons for Monarch (+10% each)
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else {
            const state = (window.unitModesState || {})[uStats.id];
            const isMulti = !!uStats.allowMultipleModes;
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? (uStats.id === 'jinoo_shadow_monarch' ? [0] : []) : [0]));

            const summonCountTotal = (uStats.customSummons || []).reduce((acc, s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return acc;
                if (!activeModes.includes(sIdx)) return acc;

                // Requirement: System Level gating for Jinoo
                if (window.isUnit(uStats.id, 'jinoo_shadow_monarch')) {
                    const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                        ? window.unitSystemLevels[uStats.id]
                        : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);
                    
                    if (sIdx === 1 && sysLvl < 40) return acc;
                    if (sIdx === 2 && sysLvl < 60) return acc;
                    if (sIdx === 3 && sysLvl < 80) return acc;
                    if (sIdx === 4 && sysLvl < 100) return acc;
                }

                return acc + (s.count || 1);
            }, 0);
            summonCount = summonCountTotal + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

            if (window.isUnit(uStats.id, 'phantom_captain') && summonCount === 0) summonCount = 9;
        }


        if (summonCount > 0) {
            const perk = Math.min(40, summonCount * 10);
            sBonus.dmg += perk;
            setPerkDmg += perk;
        }

        // Full Set Tag Perks (Top & Bottom)
        if (tags.includes('Leveling')) {
            sBonus.dmg += 20; // +20% Damage
            tagBuffs.dmg += 20;
            sBonus.bossDmg = (sBonus.bossDmg || 0) + 15; // +15% Hyper armor Damage
        }
        if (tags.includes('King')) {
            sBonus.dmg += 15; // +15% Damage
            tagBuffs.dmg += 15;
            sBonus.dot = (sBonus.dot || 0) + 20; // +20% DoT
        }
    }

    return { sBonus, tagBuffs, setPerkDmg };
}


function _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats, relicStats = {}, context = {}) {
    let headDmgBase = 0, headDmgPassive = 0, headDmgTag = 0, headDotBuff = 0;
    let headCalc = { type: headPiece, uptime: 1, trigger: 0, duration: 0, attacks: 0 };
    const isMage = window.isUnit(uStats.id, 'ancient_mage') || window.isUnit(uStats.id, 'megumin') || window.isUnit(uStats.id, 'maid') || window.isUnit(uStats.id, 'water_god') || (uStats.name && uStats.name.includes('Mage'));

    if (headPiece === 'sun_god') {
        headCalc.attacks = 6; headCalc.duration = 7;
        const buffedAttacks = Math.floor(headCalc.duration / finalSpa);
        const totalCycleAttacks = headCalc.attacks + buffedAttacks;
        headCalc.uptime = totalCycleAttacks > 0 ? buffedAttacks / totalCycleAttacks : 0;
        headCalc.trigger = headCalc.attacks * finalSpa;
        headDmgBase = finalRange * headCalc.uptime;
    } else if (headPiece === 'ninja') {
        headCalc.attacks = 5; headCalc.duration = 10;
        const timeToTrigger = headCalc.attacks * finalSpa;
        headCalc.trigger = timeToTrigger;
        headCalc.uptime = headCalc.duration / (headCalc.duration + timeToTrigger);
        headDotBuff += 20 * headCalc.uptime;
    } else if (headPiece === 'reaper_necklace') {
        headDmgBase = 0; headCalc.type = 'reaper';
    } else if (headPiece === 'shadow_reaper_necklace') {
        headDmgBase = 0; headCalc.type = 'shadow_reaper';
    } else if (headPiece === 'junior') {
        headDmgBase = 0; headCalc.type = 'junior'; headCalc.multiplier = 1.1;
    } else if (headPiece === 'biju_head') {
        // Sasuke Units: +70% Dmg (Trigger: 3 attacks, Duration: 10s, non-stacking)
        if (uStats.id && (uStats.id.includes('sasuke') || (uStats._fileName && uStats._fileName.includes('sasuke')))) {
            headCalc.attacks = 3;
            headCalc.duration = 10;
            const timeToTrigger = headCalc.attacks * finalSpa;
            headCalc.uptime = Math.min(1, headCalc.duration / timeToTrigger);
            headCalc.trigger = timeToTrigger;
            headDmgPassive = 70 * headCalc.uptime;
            headCalc.type = 'biju';
        }
    } else if (headPiece === 'reanimated_head') {
        headCalc.attacks = 5; headCalc.duration = 10;
        const buffedAttacks = Math.floor(headCalc.duration / finalSpa);
        const totalCycleAttacks = headCalc.attacks + buffedAttacks;
        headCalc.uptime = totalCycleAttacks > 0 ? buffedAttacks / totalCycleAttacks : 0;
        headCalc.trigger = headCalc.attacks * finalSpa;
        headDotBuff += finalRange * headCalc.uptime;
        headCalc.type = 'reanimated';
    } else if (headPiece === 'sorcerer_hunter_spirit') {
        headDmgBase = 60; headCalc.type = 'sorcerer_hunter';
        headCalc.noCrits = true;
    } else if (headPiece === 'strongest_sorcerer_glasses') {
        // Strongest Sorcerer Glasses: +50% Damage vs Timestopped enemies (Assume 100% uptime for Gojo/Sukuna in Domain)
        const canTimestop = window.isUnit(uStats.id, 'the_strongest_of_today');
        if (canTimestop) {
            headDmgPassive = 50;
        }
        headCalc.type = 'strongest_sorcerer';
    } else if (headPiece === 'bloodline_head') {
        const isBloodline = window.isAnyUnit(uStats.id, ['alpha_devil', 'devil_hunter', 'ancient_mage', 'mimicry_sorcerer']);
        headDmgPassive = isBloodline ? 30 : 0;
        headCalc.type = isBloodline ? 'bloodline' : 'none';
    }

    // Monarch Cape Accessory Bonus (Requires Monarch Set)
    if ((headPiece === 'monarch_cape' || headPiece === 'monarch_head' || headPiece === 'monarch') && relicStats.set === 'monarch') {
        headDmgBase = 0; // No base dmg

        // Full Set Summon Perk (Accessory): +10% per summon, cap 60%
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        let summonCount = 0;

        if (uStats.id === 'the_strongest_in_history') {
            const state = (window.unitModesState || {})[uStats.id];
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : [0]);
            // Only Perfect Curse (1) and Adaptive Curse (2) count as summons
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else {
            const state = (window.unitModesState || {})[uStats.id];
            const isMulti = !!uStats.allowMultipleModes;
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? (uStats.id === 'jinoo_shadow_monarch' ? [0] : []) : [0]));

            const summonCountTotal = (uStats.customSummons || []).reduce((acc, s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return acc;
                if (!activeModes.includes(sIdx)) return acc;

                // Requirement: System Level gating for Jinoo
                if (uStats.id === 'jinoo_shadow_monarch') {
                    const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                        ? window.unitSystemLevels[uStats.id]
                        : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);
                    
                    if (sIdx === 1 && sysLvl < 40) return acc;
                    if (sIdx === 2 && sysLvl < 60) return acc;
                    if (sIdx === 3 && sysLvl < 80) return acc;
                    if (sIdx === 4 && sysLvl < 100) return acc;
                }

                return acc + (s.count || 1);
            }, 0);
            summonCount = summonCountTotal + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

            if (uStats.id === 'phantom_captain' && summonCount === 0) summonCount = 9;
        }


        if (summonCount > 0) {
            headDmgPassive += Math.min(60, summonCount * 10);
        }

        // Full Set Tag Perks (Accessory)
        const tags = uStats.tags || [];
        if (tags.includes('Leveling')) {
            headDmgTag += 20; // +20% Dmg
            headCalc.cf = (headCalc.cf || 0) + 5;
            headCalc.cm = (headCalc.cm || 0) + 15;
        }
        if (tags.includes('King')) {
            headDmgTag += 15; // +15% Dmg
            headDotBuff -= 12.5;
        }
        headCalc.type = 'monarch';
    }

    return { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc };
}

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

function _calcDoTDPS(uStats, traitObj, traitDotBonus, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult) {
    let dotDpsTotal = 0;
    const dotCritMult = isVirtualRealm ? avgCritMult : 1;

    // REFINED LOGIC: Base % * (1 + Trait/100) * (1 + Gear/100)
    const traitMultiplier = 1 + (traitDotBonus / 100);
    const gearMultiplier = 1 + (gearDotBonus / 100);

    let dotBreakdown = {
        nativeDps: 0,
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
    
    // --- REQUIREMENT CHECK (LOADOUT MODE) ---
    // If a unit requires a specific DoT type (e.g. Devil Hunter needs Bleed), check the team.
    if (uStats.requiresDot && window.CALCULATION_MODE === 'loadout') {
        const hotbar = window.hotbarState;
        let requirementMet = false;

        if (hotbar && hotbar.slots) {
            hotbar.slots.forEach(s => {
                if (!s || requirementMet) return;
                
                // Get the base unit ID to avoid self-checking
                const sBaseId = s.id.split('-')[0];
                const uBaseId = uStats.id.split('-')[0];
                if (sBaseId === uBaseId) return;

                const sUnit = window.getUnitById(s.id);
                if (!sUnit) return;

                // 1. Check base stats (including follow-ups like Sukuna)
                if (sUnit.stats) {
                    if (sUnit.stats.dotType === uStats.requiresDot && sUnit.stats.dot > 0) requirementMet = true;
                    if (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === uStats.requiresDot) requirementMet = true;
                }
                
                // 2. Check active mode (including modes like Alpha Devil: Phantom Sword)
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
            return { dotDpsTotal: 0, dotBreakdown };
        }
    }

    const canStack = (traitObj.allowDotStack || traitObj.allowPlacementStack);
    if (uStats.dot > 0) {
        let basePct = uStats.dot;
        if (uStats.isBoss && uStats.bossDot) basePct = uStats.bossDot;
        
        const nativeTickPct = basePct * traitMultiplier * gearMultiplier;
        const totalNativeDmg = finalDmg * (nativeTickPct / 100) * dotCritMult;
        const duration = uStats.dotDuration || 0;
        const interval = canStack ? finalSpa : (duration > 0 ? Math.ceil(duration / finalSpa) * finalSpa : finalSpa);
        dotBreakdown.nativeTotalDmg = totalNativeDmg; dotBreakdown.nativeInterval = interval; dotBreakdown.nativeDps = totalNativeDmg / interval;
    }

    if (traitObj.hasRadiation) {
        const radPct = (traitObj.radiationPct || 20) * traitMultiplier * gearMultiplier;
        const totalRadDmg = finalDmg * (radPct / 100);
        dotBreakdown.radTotalDmg = totalRadDmg;
        dotBreakdown.radInterval = 10; // Standard Radiation interval
        dotBreakdown.radDps = totalRadDmg / 10;
    }

    dotDpsTotal = (dotBreakdown.nativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);
    return { dotDpsTotal, dotBreakdown };
}
