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
const _CC_UNIT_IDS = {
    'ancient_shinob': 1,    // Confuse + Stun (Ancient Techniques)
    'water_god': 1,         // Slow
    'first_emperor': 1,     // Slow + Stun + Confuse
    'ancient_mage': 1,      // Stun + Slow
    'prodigy_mage': 1,      // Slow + Stun
    'crow_shinobi': 1,      // Confuse + Stun + Slow
    'strongest_of_today': 1, // Slow + Stun + Timestop (Gojo)
    'devil_hunter': 1,      // Stun
    'alpha_devil': 1,       // Stun + Timestop
    'mimicry_sorcerer': 1,  // Stun + Slow
    'kenpachi': 1,          // Slow
    'ant_king_savage': 1,   // Slow (Paralyzing Venom)
    'underworld_god': 1,    // Slow (Primordial Power)
    'unparalleled_armor': 1, // Stun + Confuse (Power of ancient shinobi)
};

window.unitHasCC = function(uStats) {
    if (!uStats) return false;
    return !!_CC_UNIT_IDS[uStats.id];
};

const getBestSubConfig = (build, stats, includeSubs, headMode, candidates, optimizeFor = 'dps') => {
    let mode = headMode;
    if (mode === true) mode = 'auto';
    if (mode === false) mode = 'none';

    let headOptions = (mode === 'auto')
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch']
        : (mode && mode !== 'none' ? [mode] : ['none']);

    // Filter rebellious_head for non-CC units
    if (!window.unitHasCC(stats)) {
        headOptions = headOptions.filter(h => h !== 'rebellious_head');
    }

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

    const _MAGE_UNITS = { 'ancient_mage': 1, 'megumin': 1, 'maid': 1, 'water_god': 1 };
    const isMage = !!_MAGE_UNITS[uStats.id] || (uStats.name && uStats.name.includes('Mage'));

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
    if (tags.includes('Magi')) {
        sBonus.dmg = (sBonus.dmg || 0) + 50;
        sBonus.spa = (sBonus.spa || 0) + 15;
        tagBuffs.dmg = (tagBuffs.dmg || 0) + 50;
        tagBuffs.spa = (tagBuffs.spa || 0) + 15;
    }

    // Monarch Dynamic Bonus (Set)
    if (relicStats.set === 'monarch') {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        let summonCount = 0;

        if (uStats.id === 'the_strongest_in_history') {
            const state = (window.unitModesState || {})[uStats.id];
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : [0]);
            // Only Perfect Curse (1) and Adaptive Curse (2) count as summons for Monarch (+10% each)
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else {
            const activeSummons = (uStats.customSummons || []).filter((s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return false;
                return true;
            }).length;
            summonCount = activeSummons + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

            if (uStats.id === 'phantom_captain' && summonCount === 0) summonCount = 9;
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
    const _MAGE_IDS = { 'ancient_mage': 1, 'megumin': 1, 'maid': 1, 'water_god': 1 };
    const isMage = !!_MAGE_IDS[uStats.id] || (uStats.name && uStats.name.includes('Mage'));

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
        const canTimestop = (uStats.id === 'the_strongest_of_today');
        if (canTimestop) {
            headDmgPassive = 50;
        }
        headCalc.type = 'strongest_sorcerer';
    } else if (headPiece === 'rebellious_head' && context.hasCC) {
        // Rebellious Shinobi Accessory: 5% dmg per mode swap, up to 6 stacks (30%)
        // Restricted to CC units per request
        headDmgPassive = 30;
        headCalc.type = 'rebellious';

        // Full Set CC Perk: +30% Dmg for 10s when CC is applied
        if (context.rebelliousCCActive) {
            headCalc.attacks = 1; // Applied on CC (usually every attack for CC units)
            headCalc.duration = 10;
            const buffedAttacks = Math.floor(headCalc.duration / finalSpa);
            const totalCycleAttacks = headCalc.attacks + buffedAttacks;
            headCalc.uptime = totalCycleAttacks > 0 ? buffedAttacks / totalCycleAttacks : 0;
            headCalc.trigger = headCalc.attacks * finalSpa;
            headDmgPassive += 30 * headCalc.uptime;
            headCalc.ccBonus = 30 * headCalc.uptime;
            headCalc.type = 'rebellious_cc';
        }
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
            const activeSummons = (uStats.customSummons || []).filter((s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return false;
                return true;
            }).length;
            summonCount = activeSummons + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

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

    const canStack = (traitObj.allowDotStack || traitObj.allowPlacementStack);
    if (uStats.dot > 0) {
        const nativeTickPct = uStats.dot * traitMultiplier * gearMultiplier;
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

    // Assuming context.wave is available if traitObj.isEternal is true, or needs to be passed.
    // For now, let's assume it's handled upstream or passed in uStats if needed.
    // if (traitObj.isEternal) { const waveCap = Math.min(wave, 12); eternalDmgBuff = waveCap * 5; passivePcent += eternalDmgBuff; eternalRangeBuff = waveCap * 2.5; }

    const enlightenedGodBuff = (typeof window !== 'undefined' && window.enlightenedGodActive) ? 20 : 0;
    const enlightenedGodSpa = (typeof window !== 'undefined' && window.enlightenedGodActive) ? 20 : 0;
    const bijuuBuff = (typeof window !== 'undefined' && window.bijuuActive) ? 25 : 0;
    const bijuuSpa = (typeof window !== 'undefined' && window.bijuuActive) ? 15 : 0;

    // King Sailor / Magi Tag Buffs
    const tags = uStats.tags || [];
    let kmDmg = 0, kmSpa = 0;

    // Magi Tag: Permanent +50% Damage, -15% SPA
    if (tags.includes('Magi')) {
        kmDmg += 50;
        kmSpa += 15;
    }

    const kingMark = (typeof window !== 'undefined' && window.kingSailorActive);
    if (kingMark) {
        if (tags.includes('Uncontrollable Power')) { kmDmg += 30; kmSpa += 10; }
        else if (uStats.element === 'Water') { kmDmg += 20; kmSpa += 10; }
    }

    const isKsBuffActive = (typeof window !== 'undefined' && window.kingSailorActive);
    let ksCrit = 0, ksCdmg = 0;
    if (isKsBuffActive && uStats.id !== 'king_sailor') { ksCrit = 10; ksCdmg = 20; }

    const amSupportActive = (typeof window !== 'undefined' && window.ancientMageActive);
    const amCritRate = amSupportActive ? 20 : 0;
    const amCritDmg = amSupportActive ? 20 : 0;

    const mageHillBuffActive = (typeof window !== 'undefined' && window.fernHillActive);
    const uType = (uStats.placementType || 'Ground').toLowerCase();
    const mageHillSpa = (mageHillBuffActive && (uType === 'hill' || uType === 'hybrid')) ? 30 : 0;

    const mageGroundBuffActive = (typeof window !== 'undefined' && window.fernGroundActive);
    const mageGroundCrit = (mageGroundBuffActive && (uType === 'ground' || uType === 'hybrid')) ? 45 : 0;

    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + enlightenedGodBuff + (bijuuBuff > 0 ? 25 : 0) + (uStats.id === 'king_sailor' ? 10 : 0);
    const finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);

    const setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + enlightenedGodSpa + bijuuSpa + kmSpa + mageHillSpa;


    // Nutaru (Beast) dynamic SPA Cap override
    const effectiveSpaCap = (isAbility && uStats.id === 'nutaru_beast') ? 3.0 : (uStats.spaCap || 0.1);

    const spaAfterRelic = lvStats.spa * (1 - traitSpaPct / 100) * (1 - baseR_Spa / 100);
    const rawFinalSpa = spaAfterRelic * (1 - setAndPassiveSpa / 100);
    const finalSpa = Math.max(rawFinalSpa, effectiveSpaCap);

    const { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc } = _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats, relicStats, context);
    const mikuBuff = (typeof window !== 'undefined' && window.mikuActive) ? 100 : 0;

    let abilityDmg = 0;
    if (isAbility && uStats.ability) {
        const ab = Array.isArray(uStats.ability) ? uStats.ability[0] : uStats.ability;
        if (ab.buffDmg) abilityDmg = ab.buffDmg;
    }

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg + abilityDmg;

    // Detailed breakdown for UI
    const detailedBuffs = {
        setBase: (sBonus.dmg || 0) - (tagBuffs.dmg || 0) - setPerkDmg,
        setPerk: setPerkDmg + headDmgPassive,
        tagBonus: (tagBuffs.dmg || 0) + headDmgTag,
        unitPassive: passivePcent,
        abilityBuff: abilityDmg,
        accessoryBase: headDmgBase,
        globalBuffs: mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg
    };

    // Junior Ninja: 1.1x Multiplier to Miku Buff and Passives (WATER GOD ONLY)
    if (headPiece === 'junior' && uStats.id === 'water_god') {
        additiveTotal = ((sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg) * 1.1;
    }

    const finalDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.finalMult || 1) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1);

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + amCritDmg + ksCdmg;

    // Kirito and Gojo are hard-capped to their base crit rate (50%) and cannot receive buffs or relic stats
    let finalCritRate = Math.min(uStats.crit + traitCritRate + amCritRate + ksCrit + mageGroundCrit + baseR_Cf + (sBonus.cf || 0), 100);

    if (uStats.id === 'kirito' || uStats.id === 'the_strongest_of_today') {
        finalCritRate = Math.min(finalCritRate, uStats.crit);
    }

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

        // Time sequence: Initial hit (finalSpa) + Chained hits (spaCap)
        const expectedTime = finalSpa + (sumP * (uStats.spaCap || 3.0));

        // Effective SPA for the sequence
        usedSpa = expectedTime / expectedAttacks;

        // Damage weights: Robot (1.04x base only) + 5th Chain (+50% dmg)
        const robotMult = (!isAbility) ? 1.04 : 1.0;
        const fifthChainProb = cumulativeProbs[4];
        const dmgSumFactor = (1 + sumP + (fifthChainProb * 0.5));
        const avgDmgMult = dmgSumFactor / expectedAttacks;

        attackMultiplier = expectedAttacks;
        extraAttacksData = { type: 'Rohan (Chain)', expectedAttacks, expectedTime, avgDmgMult, robotMult };
    } else if (uStats.id === 'alpha_devil') {
        // Phantom Swords: 2 swords, 10% dmg/tick, 10 ticks, 20s Cooldown. Can Crit.
        const swordCount = 2;
        const swordDmgPct = 0.10;
        const swordTicks = 10;
        const swordCooldown = 20;

        // Average DPS = (Count * Ticks * DmgPct * avgHit) / Cooldown
        const avgSwordDps = (swordCount * swordTicks * swordDmgPct * avgHit) / swordCooldown;

        // Integrate into attackMultiplier for consistency
        attackMultiplier = 1 + (avgSwordDps * usedSpa / avgHit);
        extraAttacksData = { type: 'Phantom Swords (Crit)', hits: swordCount, mult: attackMultiplier };
    }

    const { summonDpsTotal, summonData } = _calcSummonDPS(uStats, finalDmg, finalSpa, placement);
    const { dotDpsTotal, dotBreakdown } = _calcDoTDPS(uStats, traitObj, traitDotBuff, baseR_Dot + (sBonus.dot || 0) + headDotBuff, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult);

    const hitDps = (avgHit / usedSpa) * placement * attackMultiplier;
    const totalDps = hitDps + (summonDpsTotal || 0) + (dotDpsTotal || 0);

    return {
        total: totalDps,
        hit: hitDps,
        summon: summonDpsTotal,
        dot: dotDpsTotal,
        dmgVal: finalDmg,
        spa: finalSpa,
        range: finalRange,
        critRate: finalCritRate,
        cdmg: finalCdmgStat,
        summonData,
        dotBreakdown,
        buffs: detailedBuffs,
        headPiece,
        relicStats,
        extraAttacksData
    };
}