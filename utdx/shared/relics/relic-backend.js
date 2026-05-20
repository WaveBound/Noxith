// ============================================================================
// RELIC-BACKEND.JS - Centralized Math for Relic Stats and Substats
// ============================================================================

window.calcRelicStats = function(relicStats, uStats, headPiece, context, traitObj, starMult, statConfig) {
    let { sBonus, tagBuffs, setPerkDmg } = window._calcSetAndTagBonuses(relicStats, uStats, headPiece, context);
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

    return { sBonus, tagBuffs, setPerkDmg, baseR_Dmg, baseR_Spa, baseR_Cm, baseR_Cf, baseR_Dot, baseR_Range };
};
// RELIC-BACKEND.JS - Centralized Math for Relic Stats and Substats
// ============================================================================

window._calcSetAndTagBonuses = function(relicStats, uStats, headPiece, context = {}) {
    let sBonus = { ...((typeof setBonuses !== 'undefined' ? setBonuses[relicStats.set] : null) || { dmg: 0, spa: 0, range: 0, cf: 0, cm: 0, dot: 0 }) };
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
    const hasCC = window.unitHasCC ? window.unitHasCC(uStats) : false;
    context.hasCC = hasCC;

    if (relicStats.set === 'rebellious_set' && hasCC) {
        // Return a flag to handle dynamic uptime in _calcHeadDynamicBuffs
        context.rebelliousCCActive = true;
    }

    const isMage = window.isUnit && (window.isUnit(uStats.id, 'ancient_mage') || window.isUnit(uStats.id, 'megumin') || window.isUnit(uStats.id, 'maid') || window.isUnit(uStats.id, 'water_god') || (uStats.name && uStats.name.includes('Mage')));

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
    
    applyTagBuff('warlord', 'Piece', { dmg: 20, spa: 5, cf: 10, dot: 20 });
    applyTagBuff('warlord', 'Villain', { dmg: 10, cm: 20, range: 15 });

    // Universal Magi Tag Buff
    if (tags.includes('Magi') && window.isUnit && !window.isUnit(uStats.id, 'king_sailor')) {
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
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else {
            const state = (window.unitModesState || {})[uStats.id];
            const isMulti = !!uStats.allowMultipleModes;
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? (uStats.id === 'jinoo_shadow_monarch' ? [0] : []) : [0]));

            const summonCountTotal = (uStats.customSummons || []).reduce((acc, s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return acc;
                
                let isEnabled = true;
                if (uStats.id === 'the_strongest_in_history') {
                    isEnabled = false;
                    if (activeModes.includes(1) && sIdx === 0) isEnabled = true;
                    if (activeModes.includes(2) && sIdx === 1) isEnabled = true;
                } else if (window.isUnit && window.isUnit(uStats.id, 'jinoo_shadow_monarch')) {
                    isEnabled = activeModes.includes(sIdx);
                    if (isEnabled) {
                        const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                            ? window.unitSystemLevels[uStats.id]
                            : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);
                        
                        if (sIdx === 1 && sysLvl < 40) isEnabled = false;
                        if (sIdx === 2 && sysLvl < 60) isEnabled = false;
                        if (sIdx === 3 && sysLvl < 80) isEnabled = false;
                        if (sIdx === 4 && sysLvl < 100) isEnabled = false;
                    }
                }

                if (!isEnabled) return acc;
                return acc + (s.count || 1);
            }, 0);
            summonCount = summonCountTotal + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

            if (window.isUnit && window.isUnit(uStats.id, 'phantom_captain') && summonCount === 0) summonCount = 9;
            if (window.isUnit && window.isUnit(uStats.id, 'gluttonous_warlord')) summonCount = (upLevel >= 6) ? 12 : 10;
        }

        if (summonCount > 0) {
            const perk = Math.min(40, summonCount * 10);
            sBonus.dmg += perk;
            setPerkDmg += perk;
        }

        if (tags.includes('Leveling')) {
            sBonus.dmg += 20;
            tagBuffs.dmg += 20;
            sBonus.bossDmg = (sBonus.bossDmg || 0) + 15;
        }
        if (tags.includes('King')) {
            sBonus.dmg += 15;
            tagBuffs.dmg += 15;
            sBonus.dot = (sBonus.dot || 0) + 20;
        }
    }

    // Mochi Set: +40% Dmg when enemy has Time Snail (works for Time Snail units)
    if (relicStats.set === 'mochi') {
        const hasTimeSnail = window.unitHasTimeSnail ? window.unitHasTimeSnail(uStats) : false;
        if (hasTimeSnail) {
            sBonus.dmg += 40;
            setPerkDmg += 40;
        }
    }

    return { sBonus, tagBuffs, setPerkDmg };
};

window._calcHeadDynamicBuffs = function(headPiece, finalSpa, finalRange, uStats, relicStats = {}, context = {}) {
    let headDmgBase = 0, headDmgPassive = 0, headDmgTag = 0, headDotBuff = 0;
    let headCalc = { type: headPiece, uptime: 1, trigger: 0, duration: 0, attacks: 0 };
    const isMage = window.isUnit && (window.isUnit(uStats.id, 'ancient_mage') || window.isUnit(uStats.id, 'megumin') || window.isUnit(uStats.id, 'maid') || window.isUnit(uStats.id, 'water_god') || (uStats.name && uStats.name.includes('Mage')));

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
        const isSasuke = uStats.id && (uStats.id.includes('sasuke') || (uStats._fileName && uStats._fileName.includes('sasuke')));
        const isTripleThreat = uStats.id && (uStats.id.includes('triple_threat') || (uStats._fileName && uStats._fileName.includes('triple_threat')));
        if (isSasuke) {
            headCalc.attacks = 3;
            headCalc.duration = 10;
            const timeToTrigger = headCalc.attacks * finalSpa;
            headCalc.uptime = Math.min(1, headCalc.duration / timeToTrigger);
            headCalc.trigger = timeToTrigger;
            headDmgPassive = 70 * headCalc.uptime;
            headCalc.type = 'biju';
        } else if (isTripleThreat) {
            headCalc.uptime = 1;
            headDmgPassive = 70;
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
        const canTimestop = window.isUnit && window.isUnit(uStats.id, 'the_strongest_of_today');
        if (canTimestop) {
            headDmgPassive = 50;
        }
        headCalc.type = 'strongest_sorcerer';
    } else if (headPiece === 'bloodline_head') {
        const isBloodline = window.isAnyUnit && window.isAnyUnit(uStats.id, ['alpha_devil', 'devil_hunter', 'ancient_mage', 'mimicry_sorcerer']);
        headDmgPassive = isBloodline ? 30 : 0;
        headCalc.type = isBloodline ? 'bloodline' : 'none';
    } else if (headPiece === 'warlord_hat') {
        headCalc.type = 'warlord';
    } else if (headPiece === 'mochi_scarf') {
        const hasStatus = window.unitHasStatusEffect ? window.unitHasStatusEffect(uStats) : false;
        // Skip scarf burn if unit already applies native Burn DoT (would not stack)
        const hasNativeDot = (uStats.dot > 0) ||
            (uStats.stats && uStats.stats.dot > 0) ||
            (uStats.passives && uStats.passives.some(p => p.dot > 0));
        if (hasStatus && !hasNativeDot) {
            headCalc.hasScarfBurn = true;
            headCalc.scarfBurnPct = 30;
            headCalc.scarfBurnDuration = 5;
        }
        headCalc.type = 'mochi_scarf';
    } else if (headPiece === 'flaming_donut') {
        const isAce = window.isUnit && window.isUnit(uStats.id, 'ace');
        if (isAce) {
            headDmgPassive = 100;
        }
        headCalc.type = 'flaming_donut';
    }

    if ((headPiece === 'monarch_cape' || headPiece === 'monarch_head' || headPiece === 'monarch') && (relicStats.set === 'monarch' || (window.isUnit && window.isUnit(uStats.id, 'gluttonous_warlord')))) {
        headDmgBase = 0; 
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        let summonCount = 0;

        if (uStats.id === 'the_strongest_in_history') {
            const state = (window.unitModesState || {})[uStats.id];
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : [0]);
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else {
            const state = (window.unitModesState || {})[uStats.id];
            const isMulti = !!uStats.allowMultipleModes;
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? (uStats.id === 'jinoo_shadow_monarch' ? [0] : []) : [0]));

            const summonCountTotal = (uStats.customSummons || []).reduce((acc, s, sIdx) => {
                if (upLevel < (s.reqUp || 0)) return acc;
                
                let isEnabled = true;
                if (uStats.id === 'the_strongest_in_history') {
                    isEnabled = false;
                    if (activeModes.includes(1) && sIdx === 0) isEnabled = true;
                    if (activeModes.includes(2) && sIdx === 1) isEnabled = true;
                } else if (uStats.id === 'jinoo_shadow_monarch') {
                    isEnabled = activeModes.includes(sIdx);
                    if (isEnabled) {
                        const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                            ? window.unitSystemLevels[uStats.id]
                            : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);
                        
                        if (sIdx === 1 && sysLvl < 40) isEnabled = false;
                        if (sIdx === 2 && sysLvl < 60) isEnabled = false;
                        if (sIdx === 3 && sysLvl < 80) isEnabled = false;
                        if (sIdx === 4 && sysLvl < 100) isEnabled = false;
                    }
                }

                if (!isEnabled) return acc;
                return acc + (s.count || 1);
            }, 0);
            summonCount = summonCountTotal + (uStats.summonStats ? (uStats.summonStats.maxCount || 1) : 0);

            if (uStats.id === 'phantom_captain' && summonCount === 0) summonCount = 9;
            if (uStats.id === 'gluttonous_warlord') summonCount = (upLevel >= 6) ? 12 : 10;
        }

        if (summonCount > 0) {
            headDmgPassive += Math.min(60, summonCount * 10);
        }

        const tags = uStats.tags || [];
        if (tags.includes('Leveling')) {
            headDmgTag += 20; 
            headCalc.cf = (headCalc.cf || 0) + 5;
            headCalc.cm = (headCalc.cm || 0) + 15;
        }
        if (tags.includes('King')) {
            headDmgTag += 15; 
            headDotBuff -= 12.5;
        }
        headCalc.type = 'monarch';
    }

    return { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc };
};
