// ============================================================================
// RELIC-BACKEND.JS - Centralized Math for Relic Stats and Substats
// ============================================================================

window.calcRelicStats = function(relicStats, uStats, headPiece, context, traitObj, starMult, statConfig) {
    let { sBonus, tagBuffs, setPerkDmg } = window._calcSetAndTagBonuses(relicStats, uStats, headPiece, context);
    if (starMult && starMult !== 1) { for (let key in sBonus) { if (typeof sBonus[key] === 'number') sBonus[key] *= starMult; } }

    const getRelicStat = (stat, apply) => (apply && relicStats) ? (relicStats[stat] || 0) : 0;
    let baseR_Dmg = getRelicStat('dmg', statConfig.applyRelicDmg), baseR_Spa = getRelicStat('spa', statConfig.applyRelicSpa);
    let baseR_Cm = getRelicStat('cm', statConfig.applyRelicCrit), baseR_Cf = relicStats ? (relicStats.cf || 0) : 0;
    let baseR_Dot = getRelicStat('dot', statConfig.applyRelicDot), baseR_Range = relicStats ? (relicStats.range || 0) : 0;

    if (traitObj && traitObj.relicBuff) {
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

window._calcSetAndTagBonuses = function(relicStats, uStats, headPiece, context = {}) {
    let sBonus = { dmg: 0, spa: 0, range: 0, cf: 0, cm: 0, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 0, hyperArmor: 0, armorPen: 0, buffPotency: 0, activeTags: [] };
    let tagBuffs = { dmg: 0, spa: 0, cm: 0, cf: 0, range: 0, dot: 0, elementalAll: 0, hyperArmor: 0 };
    let setPerkDmg = 0;

    const activeSetId = (relicStats && relicStats.set) ? relicStats.set : 'none';

    const setObj = (activeSetId !== 'none' && typeof SETS !== 'undefined') ? SETS.find(s => s.id === activeSetId) : null;
    if (setObj && setObj.bonus) {
        const b = setObj.bonus;
        sBonus.dmg = b.dmg || 0;
        sBonus.spa = b.spa || 0;
        sBonus.range = b.range || 0;
        sBonus.cf = b.cRate || 0;
        sBonus.cm = b.cDmg || 0;
        sBonus.dot = b.dot || 0;
        sBonus.bossDmg = b.bossDmg || 0;
        sBonus.trueDmg = b.trueDmg || 0;
        sBonus.hyperArmor = b.hyperArmor || 0;
        sBonus.armorDmg = b.armorDmg || 0;
        
        // Handle set elemental bonus if matching attacker element
        const unitElement = uStats ? (uStats.element || "None") : "None";
        if (b.elemental && b.elemental[unitElement]) {
            sBonus.dmg += b.elemental[unitElement];
        }
    }

    // Accessory raw stats if wearing accessory from another set
    const headSetIdMap = {
        reaper_necklace: 'reaper_set',
        shadow_reaper_necklace: 'shadow_reaper',
        junior: 'ninja',
        biju_head: 'biju_set',
        rebellious: 'rebellious',
        rebellious_head: 'rebellious',
        bloodline_head: 'rebellious',
        reanimated_head: 'reanimated_ninja',
        super_roku: 'super_roku',
        bio_android: 'bio_android',
        great_mage: 'great_mage',
        berserk_shinigami: 'berserk_shinigami',
        hokage: 'hokage',
        sorcerer_hunter_spirit: 'sorcerer_hunter',
        strongest_sorcerer_glasses: 'strongest_sorcerer',
        monarch: 'monarch',
        monarch_cape: 'monarch',
        monarch_head: 'monarch',
        warlord_hat: 'warlord',
        sun_god: 'sun_god',
        ninja: 'ninja',
        fused_earrings: 'fused_set'
    };

    const mappedHeadSetId = headSetIdMap[headPiece];
    if (mappedHeadSetId && activeSetId !== mappedHeadSetId) {
        const headSetObj = (typeof SETS !== 'undefined') ? SETS.find(s => s.id === mappedHeadSetId) : null;
        if (headSetObj && headSetObj.accessory) {
            const acc = headSetObj.accessory;
            // Base accessory stats are now handled exclusively in _calcHeadDynamicBuffs
            // to ensure correct UI attribution and prevent double-counting.
        }
    }

    const tags = uStats ? (uStats.tags || []) : [];

    // --- TAG PERKS ENGINE ---
    // Logic: Only check sets that the unit is currently wearing (Set or Accessory).
    const setsToCheck = [activeSetId];
    
    if (mappedHeadSetId && mappedHeadSetId !== activeSetId) {
        // Exclude accessories that handle their own specific perks in _calcHeadDynamicBuffs to prevent double-dipping
        if (headPiece !== 'fused_earrings' && headPiece !== 'monarch' && headPiece !== 'monarch_cape' && headPiece !== 'monarch_head' && headPiece !== 'rebellious' && headPiece !== 'rebellious_head' && headPiece !== 'bloodline_head') {
            setsToCheck.push(mappedHeadSetId);
        }
    }

    // Failsafe: Prevent checking sets like 'rebellious' if neither the set nor accessory is equipped.
    // This stops units like Majestic Armor from pulling tag perks from sets they aren't using.
    if (typeof TAG_PERKS !== 'undefined') {
        for (let setId in TAG_PERKS) {
            if (!setsToCheck.includes(setId)) {
                // Do not evaluate this set's tag perks
            }
        }
    }

    setsToCheck.forEach(setId => {
        const perks = (typeof TAG_PERKS !== 'undefined') ? TAG_PERKS[setId] : null;
        if (perks) {
            perks.forEach(perk => {
                if (tags.includes(perk.tag)) {
                    const b = perk.bonus || {};
                    sBonus.dmg += b.dmg || 0;
                    sBonus.spa += b.spa || 0;
                    sBonus.range += b.range || 0;
                    sBonus.cf += b.cRate || 0;
                    sBonus.cm += b.cDmg || 0;
                    sBonus.dot += b.dot || 0;
                    sBonus.bossDmg += b.bossDmg || 0;
                    sBonus.trueDmg += b.trueDmg || 0;
                    sBonus.elementalAll = (sBonus.elementalAll || 0) + (b.elementalAll || 0);
                    sBonus.hyperArmor += b.hyperArmor || 0;
                    sBonus.armorPen = (sBonus.armorPen || 0) + (b.armorPen || 0);
                    sBonus.buffPotency = (sBonus.buffPotency || 0) + (b.buffPotency || 0);

                    tagBuffs.dmg += b.dmg || 0;
                    tagBuffs.spa += b.spa || 0;
                    tagBuffs.range += b.range || 0;
                    tagBuffs.cf += b.cRate || 0;
                    tagBuffs.cm += b.cDmg || 0;
                    tagBuffs.dot += b.dot || 0;
                    tagBuffs.elementalAll = (tagBuffs.elementalAll || 0) + (b.elementalAll || 0);
                    tagBuffs.hyperArmor += b.hyperArmor || 0;
                    sBonus.activeTags.push(perk.tag); // Track active tags
                }
            });
        }
    });

    // Hardcoded CC check for Rebellious
    const hasCC = window.unitHasCC ? window.unitHasCC(uStats) : false;
    context.hasCC = hasCC;
    if (activeSetId === 'rebellious' && hasCC) {
        context.rebelliousCCActive = true;
    }

    // Great Mage set type advantage hit bonus (kept for dynamic Mage compatibility)
    const isMage = uStats && window.isUnit && (window.isUnit(uStats.id, 'ancient_mage') || window.isUnit(uStats.id, 'megumin') || window.isUnit(uStats.id, 'maid') || window.isUnit(uStats.id, 'water_god') || (uStats.name && uStats.name.includes('Mage')));
    if (activeSetId === 'great_mage' && isMage) {
        sBonus.dmg += 18;
        setPerkDmg += 18;
    }

    // Universal Magi Tag Buff (generic, non-relic logic)
    if (tags.includes('Magi') && uStats && window.isUnit && !window.isUnit(uStats.id, 'king_sailor')) {
        sBonus.dmg = (sBonus.dmg || 0) + 50;
        sBonus.spa = (sBonus.spa || 0) + 15;
        tagBuffs.dmg = (tagBuffs.dmg || 0) + 50;
        tagBuffs.spa = (tagBuffs.spa || 0) + 15;
    }

    // Monarch Dynamic Placements/Summon Bonus
    if (activeSetId === 'monarch') {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        let summonCount = 0;

        if (uStats && uStats.id === 'the_strongest_in_history') {
            const state = (window.unitModesState || {})[uStats.id];
            const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : [0]);
            summonCount = activeModes.filter(m => m === 1 || m === 2).length;
        } else if (uStats) {
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

        // Apply Monarch passive dynamically based on trigger configuration
        const monPassiveObj = (typeof PASSIVES !== 'undefined') ? PASSIVES.monarch : null;
        if (summonCount > 0 && monPassiveObj) {
            const perk = Math.min(monPassiveObj.maxDmgBuff, summonCount * monPassiveObj.dmgBuffPerSummon);
            sBonus.dmg += perk;
            setPerkDmg += perk;
        }
    }

    // Mochi Set fallback (keeps compatibility if old set used)
    if (activeSetId === 'mochi') {
        const hasTimeSnail = window.unitHasTimeSnail ? window.unitHasTimeSnail(uStats) : false;
        if (hasTimeSnail) {
            sBonus.dmg += 40;
            setPerkDmg += 40;
        }
    }

    // Fused Warrior Set logic
    if (activeSetId === 'fused_set') {
        // 2-Piece Passive: Crit DMG on DoT (Averaged Uptime: 15 / 22.5 = 66.7%)
        if (uStats && (uStats.dot > 0 || (uStats.stats && uStats.stats.dot > 0))) {
            const uptime = 15 / (15 + 7.5);
            sBonus.cm += 50 * uptime;
        }
    }

    return { sBonus, tagBuffs, setPerkDmg };
};

window._calcHeadDynamicBuffs = function(headPiece, finalSpa, finalRange, uStats, relicStats = {}, context = {}) {
    let headDmgBase = 0, headDmgPassive = 0, headDmgTag = 0, headDotBuff = 0, headCfTag = 0, headCmTag = 0;
    let headCalc = { type: headPiece, uptime: 1, trigger: 0, duration: 0, attacks: 0, cf: 0, cm: 0, elementalAll: 0, hyperArmor: 0, activeTags: [] };
    
    // Map of headPiece ID to Set ID
    const headSetIdMap = {
        sun_god: 'sun_god',
        ninja: 'ninja',
        reaper_necklace: 'reaper_set',
        shadow_reaper_necklace: 'shadow_reaper',
        junior: 'ninja',
        biju_head: 'biju_set',
        rebellious: 'rebellious',
        rebellious_head: 'rebellious',
        bloodline_head: 'rebellious',
        reanimated_head: 'reanimated_ninja',
        super_roku: 'super_roku',
        bio_android: 'bio_android',
        great_mage: 'great_mage',
        berserk_shinigami: 'berserk_shinigami',
        hokage: 'hokage',
        sorcerer_hunter_spirit: 'sorcerer_hunter',
        strongest_sorcerer_glasses: 'strongest_sorcerer',
        monarch: 'monarch',
        monarch_cape: 'monarch',
        monarch_head: 'monarch',
        warlord_hat: 'warlord',
        fused_earrings: 'fused_set'
    };

    const mappedSetId = headSetIdMap[headPiece];
    let passiveId = null;

    if (mappedSetId) {
        const setObj = (typeof SETS !== 'undefined') ? SETS.find(s => s.id === mappedSetId) : null;
        if (setObj && setObj.accessory) {
            const acc = setObj.accessory;
            headDmgBase = acc.dmg || 0;
            headCalc.spa = acc.spa || 0;
            headCalc.range = acc.range || 0;
            headCalc.cf = acc.cRate || 0;
            headCalc.cm = acc.cDmg || 0;
            headDotBuff = acc.dot || 0;
            headCalc.hyperArmor = acc.hyperArmor || 0;
            headCalc.elementalAll = (acc.elementalAll || 0) + 30;
            
            passiveId = acc.passive;
        }
    }

    // Apply accessory passive if defined
    if (passiveId && typeof applyPassiveBonus === 'function') {
        const uCrit = uStats ? (uStats.crit || 0) : 0;
        const uCDmg = uStats ? (uStats.cdmg || 0) : 0;
        
        const unitStatsSim = {
            dmg: 1000,
            spa: finalSpa,
            range: finalRange,
            critRate: uCrit,
            critDmg: uCDmg,
            trueDmg: 0,
            dot: 0
        };

        const isSasuke = uStats && uStats.id && (uStats.id.includes('sasuke') || (uStats._fileName && uStats._fileName.includes('sasuke')));
        const isTripleThreat = uStats && uStats.id && (uStats.id.includes('triple_threat') || (uStats._fileName && uStats._fileName.includes('triple_threat')));
        
        if (passiveId === 'biju_acc') {
            // ONLY works on specific charged attack units
            const isBijuAllowed = uStats && uStats.id && (
                uStats.id.includes('triple_threat') || 
                uStats.id === 'alpha_devil' ||
                uStats.id === 'devil_hunter' ||
                (uStats._fileName && uStats._fileName.includes('triple_threat'))
            );

            if (!isBijuAllowed) {
                headDmgPassive = 0;
                headCalc.type = 'biju';
            } else if (uStats && (uStats.id.includes('triple_threat') || (uStats._fileName && uStats._fileName.includes('triple_threat')))) {
                headCalc.uptime = 1;
                headDmgPassive = 70;
                headCalc.type = 'biju';
            } else {
                // Alpha Devil and Devil Hunter
                // 5 attacks to charge → 10 buffed attacks → repeat
                const chargeAttacks = 5;
                const buffedAttacks = 10;
                const totalCycle = chargeAttacks + buffedAttacks; // 15 attacks
                const uptime = buffedAttacks / totalCycle; // 10/15 ≈ 0.6667

                headCalc.attacks = chargeAttacks;
                headCalc.duration = buffedAttacks;
                headCalc.uptime = uptime;
                headCalc.trigger = chargeAttacks * finalSpa;
                headCalc.note = `Charged: ${chargeAttacks} atks to fill → ${buffedAttacks} buffed atks (Biju active)`;
                headDmgPassive = 70 * uptime;
                headCalc.type = 'biju';
            }
        } else {
            const passRes = window.applyPassiveBonus(passiveId, unitStatsSim, uStats);
            const eff = passRes.effectiveStats;
            if (eff.dmg !== unitStatsSim.dmg) {
                headDmgPassive = ((eff.dmg / unitStatsSim.dmg) - 1) * 100;
            }
            if (eff.range !== unitStatsSim.range) {
                headCalc.range = (headCalc.range || 0) + (((eff.range / unitStatsSim.range) - 1) * 100);
            }
            if (eff.trueDmg) {
                headCalc.trueDmg = eff.trueDmg;
            }
            if (eff.critRate === 0 && unitStatsSim.critRate > 0) {
                headCalc.noCrits = true;
            }
            if (eff.dot) {
                headDotBuff += eff.dot;
            }
            if (passRes.uptimeInfo) {
                headCalc.uptime = passRes.uptimeInfo.uptime !== undefined ? passRes.uptimeInfo.uptime / 100 : 1;
                headCalc.trigger = passRes.uptimeInfo.timeToProc || 0;
                headCalc.note = passRes.uptimeInfo.note;
            }
            if (passiveId.endsWith('_acc')) {
                headCalc.type = passiveId.replace('_acc', '');
            } else {
                headCalc.type = passiveId;
            }
        }
    }

    const tags = uStats ? (uStats.tags || []) : [];

    if (headPiece === 'junior') {
        headDmgBase = 0; headCalc.type = 'junior'; headCalc.multiplier = 1.1;
    } else if (headPiece === 'sorcerer_hunter_spirit') {
        headCalc.type = 'sorcerer_hunter';
        headCalc.noCrits = true;
    } else if (headPiece === 'strongest_sorcerer_glasses') {
        const canTimestop = uStats && window.isUnit && window.isUnit(uStats.id, 'the_strongest_of_today');
        if (canTimestop) {
            headDmgPassive = 50;
        }
        headCalc.type = 'strongest_sorcerer';
    } else if (headPiece === 'bloodline_head') {
        const isBloodline = uStats && window.isAnyUnit && window.isAnyUnit(uStats.id, ['alpha_devil', 'devil_hunter', 'ancient_mage', 'mimicry_sorcerer']);
        headDmgPassive = isBloodline ? 30 : 0;
        headCalc.type = isBloodline ? 'bloodline' : 'none';
    } else if (headPiece === 'mochi_scarf') {
        const hasStatus = window.unitHasStatusEffect ? window.unitHasStatusEffect(uStats) : false;
        const hasNativeDot = uStats && ((uStats.dot > 0) ||
            (uStats.stats && uStats.stats.dot > 0) ||
            (uStats.passives && uStats.passives.some(p => p.dot > 0)));
        if (hasStatus && !hasNativeDot) {
            headCalc.hasScarfBurn = true;
            headCalc.scarfBurnPct = 30;
            headCalc.scarfBurnDuration = 5;
        }
        headCalc.type = 'mochi_scarf';
    } else if (headPiece === 'flaming_donut') {
        const isAce = uStats && window.isUnit && window.isUnit(uStats.id, 'ace');
        if (isAce) {
            headDmgPassive = 100;
        }
        headCalc.type = 'flaming_donut';
    }

    if (uStats && (headPiece === 'monarch_cape' || headPiece === 'monarch_head' || headPiece === 'monarch') && (relicStats && (relicStats.set === 'monarch' || (window.isUnit && window.isUnit(uStats.id, 'gluttonous_warlord'))))) {
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

        const hStarMult = context.headStarMult || context.starMult || 1;
        const monAccPassiveObj = (typeof PASSIVES !== 'undefined') ? PASSIVES.monarch_acc : null;
        if (summonCount > 0 && monAccPassiveObj) {
            headDmgPassive += Math.min(monAccPassiveObj.maxDmgBuff, summonCount * monAccPassiveObj.dmgBuffPerAliveSummon) * hStarMult;
        }

        const monAccPerks = (typeof TAG_PERKS !== 'undefined') ? TAG_PERKS.monarch_acc : null;
        if (monAccPerks) {
            monAccPerks.forEach(perk => {
                if (tags.includes(perk.tag)) {
                    const b = perk.bonus || {};
                    headDmgTag += b.dmg || 0;
                    headCalc.cf += b.cRate || 0;
                    headCalc.cm += b.cDmg || 0;
                    headDotBuff += b.dot || 0;
                    headCalc.activeTags.push(perk.tag);
                    headCfTag += b.cRate || 0;
                    headCmTag += b.cDmg || 0;
                }
            });
        }
        headCalc.type = 'monarch';
    }

    // Rebellious Head Piece specialized tag perks (Bloodline)
    if (mappedSetId === 'rebellious') {
        const rebAccPerks = (typeof TAG_PERKS !== 'undefined') ? TAG_PERKS.rebellious_acc : null;
        if (rebAccPerks) {
            rebAccPerks.forEach(perk => {
                if (tags.includes(perk.tag)) {
                    const b = perk.bonus || {};
                    headDmgTag += b.dmg || 0;
                    headCalc.cf += b.cRate || 0;
                    headCalc.cm += b.cDmg || 0;
                    headDotBuff += b.dot || 0;
                    if (b.range) headCalc.range = (headCalc.range || 0) + b.range;
                    headCalc.elementalAll = (headCalc.elementalAll || 0) + (b.elementalAll || 0);
                    headCalc.activeTags.push(perk.tag);
                    headCfTag += b.cRate || 0;
                    headCmTag += b.cDmg || 0;
                }
            });
        }
        
        if (headCalc.type === 'none') headCalc.type = 'rebellious';
    }

    // Fused Earrings accessory tag perks
    if (headPiece === 'fused_earrings') {
        const fusionAccPerks = (typeof TAG_PERKS !== 'undefined') ? TAG_PERKS.fused_earrings_acc : null;
        if (fusionAccPerks) {
            fusionAccPerks.forEach(perk => {
                if (tags.includes(perk.tag)) {
                    const b = perk.bonus || {};
                    headDmgTag += b.dmg || 0;
                    headCalc.cf += b.cRate || 0;
                    headCalc.cm += b.cDmg || 0;
                    headDotBuff += b.dot || 0;
                    headCalc.bossDmg = (headCalc.bossDmg || 0) + (b.bossDmg || 0);
                    headCalc.activeTags.push(perk.tag);
                }
            });
        }

        headCalc.type = 'fused_earrings';
    }

    return { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc };
};