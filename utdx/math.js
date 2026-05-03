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

const getBestSubConfig = (build, stats, includeSubs, headMode, candidates, optimizeFor = 'dps') => {
    let mode = headMode;
    if (mode === true) mode = 'auto';
    if (mode === false) mode = 'none';

    let headOptions = (mode === 'auto')
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'biju_head', 'reanimated_head']
        : (mode && mode !== 'none' ? [mode] : ['none']);

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

    // Crown Control (formerly Rebellious Shinobi): +30% Dmg on CC Application
    const hasSlow = (uStats.role && uStats.role.includes("Slow")) || (uStats.passives && uStats.passives.some(p => p.desc.includes("Slow"))) || (uStats.ability && (Array.isArray(uStats.ability) ? uStats.ability.some(a => a.desc.includes("Slow")) : uStats.ability.desc.includes("Slow")));
    const hasStun = (uStats.role && uStats.role.includes("Stun")) || (uStats.passives && uStats.passives.some(p => p.desc.includes("Stun"))) || (uStats.ability && (Array.isArray(uStats.ability) ? uStats.ability.some(a => a.desc.includes("Stun")) : uStats.ability.desc.includes("Stun")));
    const hasTimestop = (uStats.role && uStats.role.includes("Timestop")) || (uStats.passives && uStats.passives.some(p => p.desc.includes("Timestop"))) || (uStats.ability && (Array.isArray(uStats.ability) ? uStats.ability.some(a => a.desc.includes("Timestop")) : uStats.ability.desc.includes("Timestop")));
    
    const _CC_UNITS = { 'ancient_shinob': 1, 'water_god': 1, 'first_emperor': 1 };
    const hasCC = hasSlow || hasStun || hasTimestop || !!_CC_UNITS[uStats.id];
    
    if (relicStats.set === 'rebellious_set' && hasCC) {
        sBonus.dmg += 30; // +30% Dmg over next 10s (Assume high uptime for CC units)
        setPerkDmg += 30;
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
        const activeSummons = (uStats.customSummons || []).filter(s => upLevel >= (s.reqUp || 0)).length;
        const summonCount = activeSummons + (uStats.summonStats ? 1 : 0);
        
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
    }

    // Monarch Accessory Bonus (Requires Monarch Set)
    if ((headPiece === 'monarch_crown' || headPiece === 'monarch_head' || headPiece === 'monarch') && relicStats.set === 'monarch') {
        headDmgBase = 0; // No base dmg
        
        // Full Set Summon Perk (Accessory): +10% per summon, cap 60%
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        const activeSummons = (uStats.customSummons || []).filter(s => upLevel >= (s.reqUp || 0)).length;
        const summonCount = activeSummons + (uStats.summonStats ? 1 : 0);
        
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

    const enlightenedGodBuff = (typeof window !== 'undefined' && window.enlightenedGodBuffActive) ? 20 : 0;
    const enlightenedGodSpa = (typeof window !== 'undefined' && window.enlightenedGodBuffActive) ? 20 : 0;
    const bijuuBuff = (typeof window !== 'undefined' && window.bijuuLinkActive) ? 25 : 0;
    const bijuuSpa = (typeof window !== 'undefined' && window.bijuuLinkActive) ? 15 : 0;

    // King Sailor / Magi Tag Buffs
    const tags = uStats.tags || [];
    let kmDmg = 0, kmSpa = 0;

    // Magi Tag: Permanent +50% Damage, -15% SPA
    if (tags.includes('Magi')) {
        kmDmg += 50;
        kmSpa += 15;
    }

    const kingMark = (typeof window !== 'undefined' && window.kingSailorMarkActive);
    if (kingMark) {
        if (tags.includes('Uncontrollable Power')) { kmDmg += 30; kmSpa += 10; }
        else if (uStats.element === 'Water') { kmDmg += 20; kmSpa += 10; }
    }

    const isKsBuffActive = (typeof window !== 'undefined' && window.kingSailorBuffActive);
    let ksCrit = 0, ksCdmg = 0;
    if (isKsBuffActive && uStats.id !== 'king_sailor') { ksCrit = 10; ksCdmg = 20; }

    const amSupportActive = (typeof window !== 'undefined' && window.ancientMageSupportActive);
    const amCritRate = amSupportActive ? 20 : 0;
    const amCritDmg = amSupportActive ? 20 : 0;

    const mageHillBuffActive = (typeof window !== 'undefined' && window.mageHillBuffActive);
    const uType = (uStats.placementType || 'Ground').toLowerCase();
    const mageHillSpa = (mageHillBuffActive && (uType === 'hill' || uType === 'hybrid')) ? 30 : 0;

    const mageGroundBuffActive = (typeof window !== 'undefined' && window.mageGroundBuffActive);
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
    const mikuBuff = (typeof window !== 'undefined' && window.mikuBuffActive) ? 100 : 0;

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg;

    // Detailed breakdown for UI
    const detailedBuffs = {
        setBase: (sBonus.dmg || 0) - (tagBuffs.dmg || 0) - setPerkDmg,
        setPerk: setPerkDmg + headDmgPassive,
        tagBonus: (tagBuffs.dmg || 0) + headDmgTag,
        unitPassive: passivePcent,
        accessoryBase: headDmgBase,
        globalBuffs: mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg
    };

    // Junior Ninja: 1.1x Multiplier to Miku Buff and Passives (WATER GOD ONLY)
    if (headPiece === 'junior' && uStats.id === 'water_god') {
        additiveTotal = ((sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassive + headDmgTag + mikuBuff + enlightenedGodBuff + bijuuBuff + kmDmg) * 1.1;
    }

    const finalDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1);

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
        // "Every other attack does only 30% of his damage"
        // Avg = (1.0 + 0.3) / 2 = 0.65
        attackMultiplier = 0.65;
        extraAttacksData = {
            req: "Same Target",
            hits: "Avg 65% Dmg",
            extra: 0,
            attacksNeeded: 1,
            mult: 0.65,
            label: "Combo Decay"
        };
    } else if (uStats.id === 'cell' && !isAbility) {
        // Every attack has a follow-up for 50% damage.
        usedSpa = finalSpa + 1.5;
        attackMultiplier = 1.5;
        extraAttacksData = {
            req: "Follow-up hit",
            hits: "1.5x Dmg / Cycle",
            extra: 0,
            attacksNeeded: 1,
            mult: 1.5,
        };
    } else if (uStats.id === 'water_god' && uStats.followUp) {
        // Every attack fires a follow-up after one spaCap window (3.5s).
        // The full cycle = max(finalSpa, spaCap*2).
        // At cap (3.5s SPA): each hit takes 3.5s → 2 hits per 7s, always.
        // Above cap (e.g. 7.2s SPA): cycle = 7.2s with 2 hits (the 3.5s follow-up fits within the SPA gap).
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
        // Baal's Lightning: 1 tick of 20% non-critical damage.
        const tickCount = 1;
        const tickDmg = 0.20;

        attackMultiplier = 1; // Base attacks don't get multiplied here since lightning bypasses true dmg

        extraAttacksData = {
            req: "Baal's Lightning",
            hits: `1 + ${tickCount} Tick`,
            extra: tickCount * tickDmg,
            attacksNeeded: 1,
            mult: 1.20, // UI display only
            label: "Chain Lightning",
            tickDmgVal: finalDmg * tickDmg,
            avgTick: (finalDmg * tickDmg), // NO crit
            totalChain: (finalDmg * tickDmg * tickCount) // NO crit
        };
    } else if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        const avgExtraHits = (chance / 100) * uStats.customFollowUp.dmgMult;
        attackMultiplier = 1 + avgExtraHits;
        extraAttacksData = {
            req: `Follow-Up (${chance}%)`,
            hits: `1 + ${uStats.customFollowUp.dmgMult}x`,
            extra: avgExtraHits,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Shadow Emerge"
        };
    } else if (uStats.followUp) {
        attackMultiplier = 1 + (uStats.followUp / 100);
        extraAttacksData = {
            req: "N/A",
            hits: attackMultiplier,
            extra: uStats.followUp / 100,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Chain Lightning"
        };
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
    let finalHitDps = hitDpsTotal * trueDmgMult;

    // Add King Sailor's Chain Lightning DPS (NO Crit, No True Damage)
    if (uStats.id === 'king_sailor') {
        // Chain lightning does NOT crit and does NOT benefit from true damage
        const chainLightningDps = ((finalDmg * 0.20) / usedSpa) * placement;
        finalHitDps += chainLightningDps;
    }

    // Nutaru E4: Clones gain +25% Damage in Beast Mode
    const summonDmgBase = (uStats.id === 'nutaru_beast' && isAbility) ? finalDmg * 1.25 : finalDmg;

    let { summonDpsTotal, summonData } = _calcSummonDPS(uStats, summonDmgBase, finalSpa, placement);

    if (uStats.customSummons && uStats.customSummons.length > 0) {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;

        if (!summonData) summonData = {};
        summonData.isCustom = true;
        summonData.summons = [];
        let cDpsTotal = 0;

        uStats.customSummons.forEach(s => {
            if (upLevel >= s.reqUp) {
                let sDmgMult = s.dmgMult;
                if (eLevel >= 6 && s.e6DmgMult) sDmgMult = s.e6DmgMult;

                let sAvgMult = s.avgMult || 1.0;
                if (eLevel >= 6 && s.e6AvgMult) sAvgMult = s.e6AvgMult;

                let sHitDmg = finalDmg * sDmgMult;
                let sAvgDmg = sHitDmg * sAvgMult;
                let sDps = sAvgDmg / s.spa;

                cDpsTotal += sDps;
                summonData.summons.push({
                    name: s.name,
                    hitDmg: sHitDmg,
                    avgDmg: sAvgDmg,
                    spa: s.spa,
                    dps: sDps,
                    desc: s.desc,
                    color: s.color || "#ffffff"
                });
            }
        });
        summonDpsTotal += cDpsTotal;
    }

    const gearDotBonus = baseR_Dot + headDotBuff + (sBonus.dot || 0);
    const { dotDpsTotal, dotBreakdown } = _calcDoTDPS(uStats, traitObj, traitDotBuff, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult);

    let finalDotDps = dotDpsTotal;

    if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        let followUpDotDmg = avgHit * (uStats.customFollowUp.dotPct / 100);
        let followUpDotDpsPerCycle = (followUpDotDmg * uStats.customFollowUp.dotDuration * (chance / 100)) / usedSpa;
        finalDotDps += followUpDotDpsPerCycle * placement;
    }

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
        activeGlobalBuffs: {}, // Placeholder to match calculations.js structure
        mikuBuff: mikuBuff,
        enlightenedGodBuff: enlightenedGodBuff,
        enlightenedGodSpa: enlightenedGodSpa,
        bijuuBuff: bijuuBuff,
        bijuuSpa: bijuuSpa,
        kingMarkDmg: kmDmg,
        kingMarkSpa: kmSpa,
        ksCrit: ksCrit,
        ksCdmg: ksCdmg,
        passiveBuff: passivePcent + headDmgBase + headDmgPassive + headDmgTag,
        passiveSpaBuff: passiveSpaPcent,
        eternalBuff: eternalDmgBuff,
        eternalRangeBuff: eternalRangeBuff,
        totalAdditivePct: additiveTotal,
        conditionalData: uStats.burnMultiplier ? { name: "Target: Burn", val: uStats.burnMultiplier, mult: (1 + uStats.burnMultiplier / 100) } : null,
        headBuffs: { dmg: headDmgBuff, passiveDmg: headDmgPassive, tagDmg: headDmgTag, dot: headDotBuff, type: headPiece, ...headCalc },
        detailedBuffs: detailedBuffs,
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
        abilityBuff: uStats.buffDmg || 0,
        amSupportActive,
        amCritRate,
        amCritDmg,
        mageHillSpa,
        mageGroundCrit
    };
}