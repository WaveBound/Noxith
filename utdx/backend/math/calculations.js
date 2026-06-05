// ============================================================================
// CALCULATIONS.JS - Core DPS Engine (calculateDPS only)
// Depends on: backend/math/lookups.js, backend/math/core-math.js
// All other logic: lookups.js, context-builder.js, build-runner.js
// ============================================================================

// --- REAL-TIME ALLY CRIT RESOLVER (Bypasses rendering latency/dependencies) ---
window.getUnitUncappedCrit = function(slotUnit, slotIndex) {
    if (!slotUnit) return 0;
    
    const build = window.hotbarFilteredBuilds?.[slotUnit.id] || window.unitActiveBuilds?.[slotUnit.id];
    let crit = 0;
    
    if (build && build.critData) {
        // Read uncapped raw rate to allow values over 100% for conversion
        crit = build.critData.rawRate || build.critData.rate || 0;
    } else {
        crit = slotUnit.stats?.crit || slotUnit.crit || 0;
    }
    
    const hState = window.hotbarState;
    if (hState && hState.buffState) {
        // 1. Fern (Ground) Buff
        if (hState.buffState.mageGround) {
            const uType = (slotUnit.placementType || 'Ground').toLowerCase();
            const isMatching = (uType === 'ground' || uType === 'hybrid');
            const isFernSelf = window.isUnit(slotUnit.id, 'prodigy_mage');
            if (isMatching || isFernSelf) {
                const targets = hState.fernTargets || [];
                const isFernPresent = hState.slots.some(s => s && window.isUnit(s.id, 'prodigy_mage'));
                if (isFernPresent) {
                    // FIX: Fern only receives her own buff if she is explicitly selected as a target
                    if (targets.includes(slotIndex)) {
                        crit += 45;
                    }
                }
            }
        }
        
        // 2. Ancient Mage Buff
        if (hState.buffState.ancientMage) {
            if (!window.isUnit(slotUnit.id, 'ancient_mage')) {
                crit += 20;
            }
        }
        
        // 3. King Sailor Buff
        if (hState.buffState.kingSailor || hState.buffState.ksailor) {
            if (!window.isUnit(slotUnit.id, 'king_sailor')) {
                crit += 10;
            }
        }
        
        // 4. Leader Buff (Unrivaled Mark)
        const isPotential = window.CALCULATION_MODE === 'potential';
        const leader = hState.slots[0];
        const unrivaledMarkActive = hState.buffState?.unrivaledMark || window.unrivaledMark;
        
        if (isPotential) {
            const element = String(slotUnit.element || slotUnit.stats?.element || '').toLowerCase();
            const isSelfAbh = window.isUnit(slotUnit.id, 'angel_born_in_hell');
            const isSelfTt = window.isUnit(slotUnit.id, 'triple_threat');
            
            // In Potential Mode, leaders automatically receive their own unrivaled mark crit buff by default
            if (unrivaledMarkActive || isSelfTt) {
                if (element === 'wind') crit += 5;
            }
            if (unrivaledMarkActive || isSelfAbh) {
                if (element === 'light') {
                    crit += 5;
                }
            }
        } else if (leader) {
            const element = String(slotUnit.element || slotUnit.stats?.element || '').toLowerCase();
            if (window.isUnit(leader.id, 'triple_threat') && element === 'wind') {
                crit += 5;
            }
            if (window.isUnit(leader.id, 'angel_born_in_hell') && element === 'light') {
                crit += 5;
            }
        }
    }
    
    return crit;
};

// ==========================================================
// CORE CALCULATION PIPELINE
// ==========================================================

function calculateDPS(uStats, relicStats, context) {
    const { dmgPoints, spaPoints, rangePoints, wave, isBoss, traitObj, placement, isSSS, headPiece, isVirtualRealm, starMult, isAbility, upgradeLevel, defenderElement } = context;

    let lvStats = getLevelStats(uStats.dmg, uStats.spa, uStats.range || 0, dmgPoints, spaPoints, rangePoints);
    let rDmg = 0, rSpa = 0, rRange = 0;
    if (context.rankData) { rDmg = context.rankData.dmg || 0; rSpa = context.rankData.spa || 0; rRange = context.rankData.range || 0; }
    else if (isSSS) { rDmg = 20; rSpa = 8; rRange = 20; }
    if (rDmg !== 0) lvStats.dmg *= (1 + rDmg / 100);
    if (rSpa !== 0) lvStats.spa *= (1 - rSpa / 100);
    if (rRange !== 0) lvStats.range *= (1 + rRange / 100);

    let {
        passivePcent,
        passiveSpaPcent,
        passiveRangePcent,
        trueDmgFromPassives,
        passiveCritFromPassives,
        passiveCdmgFromPassives,
        passiveDotFromPassives,
        passiveBreakdown
    } = window.calcPassives(uStats, context, headPiece, upgradeLevel);

    let { bossMult, traitDmgPct, traitSpaPct, traitCritRate, traitRangePct, traitDotBuff, eternalDmgBuff, eternalRangeBuff } = window.calcTraitSynergies(traitObj, uStats, wave);
    if (eternalDmgBuff > 0) passivePcent += eternalDmgBuff;

    let { sBonus, tagBuffs, setPerkDmg, baseR_Dmg, baseR_Spa, baseR_Cm, baseR_Cf, baseR_Dot, baseR_Range } = window.calcRelicStats(relicStats, uStats, headPiece, context, traitObj, starMult, statConfig);
    let { globalDmg, globalSpa, globalRange, globalCrit, globalCdmg, activeGlobalBuffs } = window.calcGlobalBuffs(uStats, context, headPiece);

    // Apply Junior Ninja 1.1x Multiplier to Passives & Tags BEFORE values are consumed by totals
    if (headPiece === 'junior') {
        if (tagBuffs.dmg) {
            const extraTagDmg = tagBuffs.dmg * 0.1;
            tagBuffs.dmg += extraTagDmg;
            sBonus.dmg = (sBonus.dmg || 0) + extraTagDmg;
        }
        if (tagBuffs.spa) {
            const extraTagSpa = tagBuffs.spa * 0.1;
            tagBuffs.spa += extraTagSpa;
            sBonus.spa = (sBonus.spa || 0) + extraTagSpa;
        }
    }

    const tags = uStats.tags || [];

    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + globalRange + (window.isUnit(uStats.id, 'king_sailor') ? 10 : 0);
    let finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);

    let setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + globalSpa;
    let warlordSpa = 0;

    if (headPiece === 'warlord_hat') {
        const isPotential = (typeof window !== 'undefined') ? (window.CALCULATION_MODE === 'potential') : true;
        let spaReduction = 10;
        if (!isPotential && typeof window !== 'undefined') {
            let otherPlacements = 0;
            const hotbarSlots = window.hotbarState?.slots || [];
            hotbarSlots.forEach(s => {
                if (!s) return;
                if (s.id === uStats.id || isUnit(s.id, uStats.id)) return;
                const sUnit = window.getUnitById(s.id);
                let sPlacement = (sUnit ? sUnit.placement : s.placement) || 1;
                otherPlacements += sPlacement;
            });
            spaReduction = Math.min(10, otherPlacements * 2);
        }
        warlordSpa = spaReduction;
        setAndPassiveSpa += spaReduction;
    }

    // Dynamic SPA Cap override
    const effectiveSpaCap = window.getAbilitySpaCap ? window.getAbilitySpaCap(uStats.id, isAbility, uStats.spaCap) : (uStats.spaCap || 0.1);

    const spaAfterRelic = lvStats.spa * (1 - traitSpaPct / 100) * (1 - baseR_Spa / 100);
    const rawFinalSpa = spaAfterRelic * (1 - setAndPassiveSpa / 100);
    let finalSpa = Math.max(rawFinalSpa, effectiveSpaCap);

    if (window.isUnit(uStats.id, 'joyful_captain')) {
        const activeModeIdx = (typeof window !== 'undefined' && window.unitModesState && window.unitModesState['joyful_captain'] !== undefined) ? window.unitModesState['joyful_captain'] : 0;
        if (activeModeIdx === 0 || activeModeIdx === 1) {
            const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels['joyful_captain'] !== undefined) ? window.unitSystemLevels['joyful_captain'] : 10;
            finalSpa = Math.max(Number(sysLvl), effectiveSpaCap);
        }
    }

    const { headDmgBase, headDmgPassive, headDmgTag, headDotBuff, headCalc } = window._calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats, relicStats, context);

    if (headCalc && headCalc.range) {
        finalRange *= (1 + headCalc.range / 100);
    }

    // Apply relic set bossDmg and head accessory bossDmg into bossMult (computed early from traits only)
    const relicBossDmg = (sBonus.bossDmg || 0) + (headCalc.bossDmg || 0);
    if (relicBossDmg > 0) {
        bossMult = (bossMult - 1 + relicBossDmg / 100) + 1;
    }

    let headDmgPassiveMod = headDmgPassive;
    if (headPiece === 'biju_head' && window.isUnit(uStats.id, 'triple_threat')) {
        const buffedAtks = Math.floor(10 / finalSpa);
        const totalAtks = buffedAtks + 1;
        const uptime = totalAtks > 0 ? (buffedAtks / totalAtks) : 0;
        headDmgPassiveMod = headDmgPassive * uptime;

        if (headCalc) {
            headCalc.uptime = uptime;
            headCalc.dmg = headDmgPassiveMod;
            headCalc.trigger = finalSpa;
        }
    }

    const { abilityDmg, abilityFinalMult } = window.getAbilityMultipliers ? window.getAbilityMultipliers(uStats, isAbility) : { abilityDmg: 0, abilityFinalMult: 1 };

    // --- SYNERGY CHECKS (e.g. requiresDot) ---
    if (uStats.requiresDot && window.CALCULATION_MODE === 'loadout') {
        const hotbar = window.hotbarState;
        let met = false;
        if (hotbar && hotbar.slots) {
            met = hotbar.slots.some(s => {
                if (!s || s.id.split('-')[0] === uStats.id.split('-')[0]) return false;
                const sUnit = window.getUnitById(s.id);
                if (!sUnit) return false;

                if (sUnit.stats && sUnit.stats.dotType === uStats.requiresDot && (sUnit.stats.dot > 0 || (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === uStats.requiresDot))) return true;

                const sMode = (window.unitModesState && window.unitModesState[sUnit.id]) || 0;
                if (sUnit.modes && sUnit.modes[sMode]) {
                    const m = sUnit.modes[sMode];
                    if (m.dotType === uStats.requiresDot && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotType === uStats.requiresDot))) return true;
                }
                return false;
            });
        }

        if (!met) {
            uStats.dot = 0;
        }
    }

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBase + headDmgPassiveMod + headDmgTag + globalDmg + abilityDmg;

    // Failsafe identity tracker for Ultimate Fused Warrior
    const isFusedWarrior = window.isUnit(uStats.id, 'ultimate_fused_warrior') || window.isUnit(uStats.id, 'fused_warrior') || (uStats.id && uStats.id.toLowerCase().includes('fused'));

    // --- WARLORD DYNAMIC SET BONUS ---
    let warlordData = null;
    if (relicStats.set === 'warlord') {
        let estCritRate = Math.min(uStats.crit + traitCritRate + globalCrit + (headCalc.crit || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives, 100);
        if (window.isUnit(uStats.id, 'pirate_king')) {
            estCritRate = 40;
        }
        if (headPiece === 'sorcerer_hunter_spirit') {
            estCritRate = 0;
        }
        if (estCritRate > 0) {
            const attacksToCrit = Math.max(1, 1 / (estCritRate / 100));
            const timeToTrigger = attacksToCrit * finalSpa;
            const p = estCritRate / 100;
            const N = 10 / finalSpa;
            const pFail = Math.pow(1 - p, N);

            let uptime, cycleTime, expectedActive, expectedUnbuffed;
            if (pFail === 0) {
                uptime = 1;
                cycleTime = 10 + finalSpa;
                expectedActive = cycleTime;
                expectedUnbuffed = 0;
            } else {
                const subCycleActive = 10 + timeToTrigger * (1 - pFail);
                expectedActive = subCycleActive / pFail;
                expectedUnbuffed = timeToTrigger;
                cycleTime = expectedActive + expectedUnbuffed;
                uptime = expectedActive / cycleTime;
            }

            const warlordDmg = 45 * uptime * (starMult || 1);
            additiveTotal += warlordDmg;
            setPerkDmg += warlordDmg;
            warlordData = {
                critRate: estCritRate,
                attacksToCrit,
                timeToTrigger,
                refreshChance: 1 - pFail,
                cycleTime,
                uptime,
                dmg: warlordDmg,
                starMult: starMult || 1
            };
        }
    }

    // Detailed breakdown for UI
    const detailedBuffs = {
        setBase: (sBonus.dmg || 0) - (tagBuffs.dmg || 0) - (relicStats.set === 'great_mage' ? 18 : 0) - (relicStats.set === 'monarch' ? setPerkDmg : 0),
        setPerk: setPerkDmg,
        accessoryPerk: headDmgPassiveMod,
        tagBonus: (tagBuffs.dmg || 0) + headDmgTag,
        unitPassive: passivePcent,
        abilityBuff: abilityDmg,
        accessoryBase: headDmgBase,
        globalBuffs: globalDmg,
        passiveBreakdown: passiveBreakdown
    };

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + globalCdmg + (headCalc.cm || 0) + passiveCdmgFromPassives;
    
    // Calculate raw, uncapped crit rate first
    let rawCritRate = uStats.crit + traitCritRate + globalCrit + (headCalc.cf || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives;
    if (window.isUnit(uStats.id, 'kirito') || window.isUnit(uStats.id, 'the_strongest_of_today')) {
        rawCritRate = Math.min(rawCritRate, uStats.crit);
    }
    if (window.isUnit(uStats.id, 'pirate_king')) {
        rawCritRate = 40;
    }
    if (headPiece === 'sorcerer_hunter_spirit') rawCritRate = 0;

    let finalCritRate = Math.min(rawCritRate, 100);

    if (window.isUnit(uStats.id, 'angel_born_in_hell')) {
        // Angel Born in Hell has a fixed 50% Crit Rate (bugged behavior)
        finalCritRate = 50;
        rawCritRate = 50;

        // Converts crit rate of other hotbar units into a dmg bonus, accounting for placements and allowing over 100%
        let otherCritRateSum = 0;
        if (typeof window !== 'undefined' && window.hotbarState?.slots) {
            window.hotbarState.slots.forEach((slot, slotIdx) => {
                if (!slot) return;
                const baseId = slot.id.split('-')[0];
                if (baseId === 'angel_born_in_hell') return;
                
                const sUnit = window.getUnitById ? window.getUnitById(slot.id) : null;
                if (!sUnit) return;
                
                // Use the real-time uncapped helper to resolve Fern (Ground) and other active buffs
                const critRate = window.getUnitUncappedCrit(sUnit, slotIdx);
                const placementVal = sUnit.placement || 1;
                otherCritRateSum += (critRate * placementVal);
            });
        }

        // Include other placements of himself if placement > 1 (they each have a fixed 50% crit rate)
        if (placement > 1) {
            otherCritRateSum += (placement - 1) * 50;
        }

        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        const conversionMultiplier = (eLevel >= 4) ? 1.0 : 0.5;
        const critRateToDmgBonus = otherCritRateSum * conversionMultiplier;

        if (critRateToDmgBonus > 0) {
            additiveTotal += critRateToDmgBonus;
            detailedBuffs.unitPassive = (detailedBuffs.unitPassive || 0) + critRateToDmgBonus;
            passiveBreakdown.push({
                name: `Purified Energy (Allied Crit Rate to Dmg)`,
                dmg: critRateToDmgBonus,
                spa: 0,
                range: 0,
                trueDmg: 0,
                crit: 0,
                cdmg: 0
            });
        }
    }

    // Apply "Does it Hurt?" 1.3x multiplier to final damage for Ultimate Fused Warrior
    let fusedMult = 1.0;
    if (isFusedWarrior) {
        fusedMult = 1.3;
    }

    let finalDmgNormal = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * abilityFinalMult;
    let finalDmg = finalDmgNormal;
    let finalDmgBoss = finalDmgNormal;

    let finalCritRateBoss = finalCritRate;
    if (window.isUnit(uStats.id, 'marine_hero')) {
        finalCritRateBoss = Math.min(finalCritRateBoss + 100, 100);
    }
    let finalCdmgStatBoss = finalCdmgStat;

    // Apply Heavenly Restriction / No Crits check here to override ALL crits, even Angel Born in Hell & Marine Hero
    if (headCalc && headCalc.noCrits) {
        finalCritRate = 0;
        finalCritRateBoss = 0;
        rawCritRate = 0;
    }

    let avgCritMult = (1 + ((finalCdmgStat / 100) * (finalCritRate / 100)));
    let avgCritMultBoss = (1 + ((finalCdmgStatBoss / 100) * (finalCritRateBoss / 100)));
    let avgHit = finalDmg * avgCritMult;
    let avgHitBoss = finalDmgBoss * avgCritMultBoss;
    let avgHitNormal = finalDmgNormal * avgCritMult;

    // --- SPECIAL ATTACK RATE LOGIC ---
    let attackMultiplier = 1;
    let extraAttacksData = null;
    let usedSpa = finalSpa;

    const ar = window.applyAbilityAttackRate ? window.applyAbilityAttackRate(uStats, isAbility, finalSpa, 1, null) : null;
    if (ar && ar.isHandled) {
        usedSpa = ar.usedSpa;
        attackMultiplier = ar.attackMultiplier;
        extraAttacksData = ar.extraAttacksData;
    } else if (isFusedWarrior) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        const followUp2Chance = (eLevel >= 2) ? 0.70 : 0.50;
        
        // Attack: 1x, Guaranteed Follow-up: 1x, 50%/70% chance second Follow-up: 1x
        // Average multiplier: 1 + 1 + chance = 2.5x (or 2.7x at E2+)
        attackMultiplier = 1 + 1 + followUp2Chance;
        usedSpa = finalSpa;
        
        extraAttacksData = {
            req: "Guaranteed Follow-ups",
            hits: `1 + 1 + ${(followUp2Chance * 100).toFixed(0)}% chance`,
            extra: 1 + followUp2Chance,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Fused Godly Might",
            usedSpa: usedSpa
        };
    } else if (window.isUnit(uStats.id, 'strongest_swordsman_hunter')) {
        // --- DUAL-STATE EVALUATION FOR STRONGEST SWORDSMAN ---
        // Stance 1 & 3 (6 attacks): Base damage, Base crit rate
        // Stance 2 (3 attacks): +60% Damage (+40% if E0-E5), +20% Crit Rate (+15% if E0-E5)
        const stance2DmgBonus = (upgradeLevel >= 6) ? 60 : 40;
        const stance2CritBonus = (upgradeLevel >= 6) ? 20 : 15;

        // Unbuffed state hits
        const unbuffedDmg = finalDmgNormal;
        const unbuffedCrit = finalCritRate;
        const unbuffedCritMult = 1 + (finalCdmgStat / 100) * (unbuffedCrit / 100);
        const unbuffedAvgHit = unbuffedDmg * unbuffedCritMult;

        // Buffed state hits (Stance 2)
        const buffedDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + (additiveTotal + stance2DmgBonus) / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * abilityFinalMult * fusedMult;
        const buffedCrit = Math.min(finalCritRate + stance2CritBonus, 100);
        const buffedCritMult = 1 + (finalCdmgStat / 100) * (buffedCrit / 100);
        const buffedAvgHit = buffedDmg * buffedCritMult;

        // Overall cycle math: 6 unbuffed attacks + 3 buffed attacks
        const totalCycleDmg = (6 * unbuffedAvgHit) + (3 * buffedAvgHit);

        // Equivalent multipliers to align with core game engine's single-value output
        avgHit = totalCycleDmg / 9; // Weighted hit average
        avgHitBoss = avgHit * bossMult;
        avgHitNormal = avgHit;

        // Output effective attack multiplier (1.5x attacks * weighted stance damage ratio)
        attackMultiplier = (totalCycleDmg / (6 * unbuffedAvgHit));

        extraAttacksData = {
            req: "Sword Stances",
            hits: `9 Attacks / Cycle (1.5x rate)`,
            extra: attackMultiplier - 1,
            attacksNeeded: 2,
            mult: attackMultiplier,
            label: "Sword Stances Follow-up",
            unbuffedHitVal: unbuffedAvgHit,
            buffedHitVal: buffedAvgHit,
            unbuffedHitRaw: unbuffedDmg,
            buffedHitRaw: buffedDmg,
            unbuffedCrit: unbuffedCrit,
            buffedCrit: buffedCrit
        };
    } else if (window.isUnit(uStats.id, 'water_god') && uStats.followUp) {
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
    } else if (window.isUnit(uStats.id, 'king_sailor')) {
        const tickCount = 1;
        const tickDmg = 0.20;
        attackMultiplier = 1;
        extraAttacksData = {
            req: "Baal's Lightning",
            hits: `1 + ${tickCount} Tick`,
            extra: tickCount * tickDmg,
            attacksNeeded: 1,
            mult: 1.20,
            label: "Chain Lightning",
            tickDmgVal: finalDmg * tickDmg,
            avgTick: (finalDmg * tickDmg),
            totalChain: (finalDmg * tickDmg * tickCount)
        };
    } else if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        const atkAnim = uStats.spaCap || 0.1;
        const fuaAnim = uStats.customFollowUp.fuaAnimation || 0;

        const timeIfFua = Math.max(finalSpa, atkAnim + fuaAnim);
        const timeIfNoFua = Math.max(finalSpa, atkAnim);
        usedSpa = (chance / 100) * timeIfFua + (1 - (chance / 100)) * timeIfNoFua;

        const avgExtraHits = (chance / 100) * uStats.customFollowUp.dmgMult;
        attackMultiplier = 1 + avgExtraHits;
        extraAttacksData = {
            req: `Follow-Up (${chance}%)`,
            hits: `1 + ${uStats.customFollowUp.dmgMult}x`,
            extra: avgExtraHits,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Shadow Emerge",
            usedSpa: usedSpa
        };
    } else if (window.isUnit(uStats.id, 'alpha_devil')) {
        const swordCount = 2;
        const swordDmgPct = 0.10;
        const swordTicks = 10;
        const swordCooldown = 20;

        const avgSwordDps = (swordCount * swordTicks * swordDmgPct * avgHit) / swordCooldown;

        attackMultiplier = 1 + (avgSwordDps * usedSpa / avgHit);
        extraAttacksData = {
            req: "Phantom Swords (On Crit)",
            hits: `${swordCount} Swords / 20s`,
            extra: avgSwordDps * usedSpa / avgHit,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Show me your motivation",
            swordDps: avgSwordDps
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
    let bossHitDpsTotal = ((avgHitBoss / usedSpa) * placement * attackMultiplier);
    let normalHitDpsTotal = ((avgHitNormal / usedSpa) * placement * attackMultiplier);

    if (isFusedWarrior && isAbility) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        const abilityDmgPct = (eLevel >= 6) ? 0.30 : 0.20;
        
        const abilityAvgHit = finalDmg * abilityDmgPct * avgCritMult;
        const abilityAvgHitBoss = finalDmgBoss * abilityDmgPct * avgCritMultBoss;
        
        const abilityDps = (abilityAvgHit / 1.0) * placement;
        const abilityDpsBoss = (abilityAvgHitBoss / 1.0) * placement;
        
        hitDpsTotal += abilityDps;
        bossHitDpsTotal += abilityDpsBoss;
    }

    let tripleThreatFuaDmgNormal = finalDmgNormal;
    if (window.isUnit(uStats.id, 'triple_threat')) {
        const fuaAdditiveTotal = additiveTotal - 25;
        tripleThreatFuaDmgNormal = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * Math.max(0, 1 + fuaAdditiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * abilityFinalMult;

        const fuaAvgHit = tripleThreatFuaDmgNormal * avgCritMult;
        const fuaAvgHitBoss = tripleThreatFuaDmgNormal * avgCritMultBoss;

        const followUpDps = (fuaAvgHit / 15) * placement;
        const followUpDpsBoss = (fuaAvgHitBoss / 15) * placement;
        hitDpsTotal += followUpDps;
        bossHitDpsTotal += followUpDpsBoss;
    }

    let trueDmgPct = ((uStats.trueDmg || 0) + trueDmgFromPassives);
    if (relicStats.set === 'sorcerer_hunter') {
        trueDmgPct += 15;
    }

    const trueDmgVal = hitDpsTotal * (trueDmgPct / 100);
    const normalDmgVal = hitDpsTotal * (1 - trueDmgPct / 100);
    let finalHitDps = hitDpsTotal;
    let finalBossHitDps = bossHitDpsTotal;

    let chainLightningDps = 0;
    if (window.isUnit(uStats.id, 'king_sailor')) {
        chainLightningDps = ((finalDmg * 0.20) / usedSpa) * placement;
        finalHitDps += chainLightningDps;
        finalBossHitDps += ((finalDmgBoss * 0.20) / usedSpa) * placement;
    }

    let { summonDpsTotal, summonData } = _calcSummonDPS(uStats, finalDmg, finalSpa, placement);

    if (uStats.customSummons && uStats.customSummons.length > 0 && typeof window.calcCustomSummons === 'function') {
        const upLevel = context.upgradeLevel !== undefined ? context.upgradeLevel : 6;
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        const summonsResult = window.calcCustomSummons(uStats, upLevel, eLevel, finalDmg, finalSpa);

        if (summonsResult.summonData) {
            if (!summonData) summonData = {};
            summonData.isCustom = true;
            summonData.summons = summonsResult.summonData.summons;
            summonDpsTotal += summonsResult.summonDpsTotal;
        }
    }

    const gearDotBonus = baseR_Dot + headDotBuff + (sBonus.dot || 0);

    // Separate base DoT percentage from passive/ability buffs
    const passiveDots = (uStats.passives || []).map(p => p.dot || 0);
    let baseDotVal = uStats.dot || 0;
    let passiveDotBuff = 0;

    if (baseDotVal > 0) {
        passiveDotBuff = passiveDots.reduce((a, b) => a + b, 0);
    } else if (passiveDots.length > 0) {
        const maxDot = Math.max(...passiveDots, 0);
        let foundBase = false;
        baseDotVal = maxDot;
        passiveDotBuff = passiveDots.reduce((a, b) => {
            if (b === maxDot && !foundBase) {
                foundBase = true;
                return a;
            }
            return a + b;
        }, 0);
    }

    if (uStats.dotBuff) {
        passiveDotBuff += uStats.dotBuff;
    }

    let globalDotMult = 1.0;
    if (headPiece === 'mochi_scarf' && (uStats.id === 'ace' || (window.isUnit && window.isUnit(uStats.id, 'ace')))) {
        globalDotMult *= 1.5;
    }
    if (headPiece === 'flaming_donut' && (uStats.id === 'ace' || (window.isUnit && window.isUnit(uStats.id, 'ace')))) {
        globalDotMult *= 1.5;
    }

    const { dotDpsTotal, bossDotDpsTotal, dotBreakdown } = _calcDoTDPS(
        { ...uStats, dot: baseDotVal, isBoss: context.isBoss },
        traitObj,
        traitDotBuff,
        gearDotBonus,
        finalDmg,
        finalSpa,
        placement,
        isVirtualRealm,
        avgCritMult,
        finalDmgBoss,
        avgCritMultBoss,
        passiveDotBuff,
        globalDotMult
    );

    let finalDotDps = dotDpsTotal;
    let finalBossDotDps = bossDotDpsTotal;

    if (isFusedWarrior) {
        const traitMultiplier = 1 + (traitDotBuff / 100);
        const gearMultiplier = 1 + (gearDotBonus / 100);
        const dotPct = 70 * traitMultiplier * gearMultiplier;
        
        // Ionized DoT is 70% of the unit's damage over 5 seconds (5 ticks)
        const ionizedDotDmg = finalDmg * (dotPct / 100);
        const ionizedDotDmgBoss = finalDmgBoss * (dotPct / 100);
        
        // Triggers only when a crit is landed: multiply average DoT DPS by the critical rate (0.0 to 1.0)
        // Since DoT does not crit, base damage is ionizedDotDmg, and we apply it based on finalCritRate chance.
        const critChance = finalCritRate / 100;
        const critChanceBoss = finalCritRateBoss / 100;
        
        const baseDotDps = (ionizedDotDmg / 5) * critChance;
        const baseDotDpsBoss = (ionizedDotDmgBoss / 5) * critChanceBoss;
        
        const fuaDotDps = baseDotDps * placement;
        const fuaDotDpsBoss = baseDotDpsBoss * placement;
        
        finalDotDps += fuaDotDps;
        finalBossDotDps += fuaDotDpsBoss;
        
        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = fuaDotDps / placement;
            dotBreakdown.fuaDotTotalDmg = ionizedDotDmg;
            dotBreakdown.fuaDotDuration = 5;
            dotBreakdown.fuaChance = finalCritRate; // Display the crit chance as the apply chance
            dotBreakdown.fuaLabel = "Ionized DoT (On Crit)";
        }
    }

    if (window.isUnit(uStats.id, 'triple_threat')) {
        const traitMultiplier = 1 + (traitDotBuff / 100);
        const gearMultiplier = 1 + (gearDotBonus / 100);
        const bleedPct = ((upgradeLevel >= 6) ? 120 : 100) * traitMultiplier * gearMultiplier;

        const fuaDotDmg = tripleThreatFuaDmgNormal * (bleedPct / 100);
        const fuaDotDmgBoss = tripleThreatFuaDmgNormal * (bleedPct / 100);

        const canStack = !!traitObj.allowDotStack;
        const fuaDotDps = canStack ? ((fuaDotDmg / 15) * placement) : 0;
        const fuaDotDpsBoss = canStack ? ((fuaDotDmgBoss / 15) * placement) : 0;

        finalDotDps += fuaDotDps;
        finalBossDotDps += fuaDotDpsBoss;

        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = fuaDotDps / placement;
            dotBreakdown.fuaDotTotalDmg = fuaDotDmg;
            dotBreakdown.fuaChance = 100;
            dotBreakdown.fuaLabel = "Brutal Slashes Follow-Up (15s Cooldown)";
        }
    }

    if (uStats.customFollowUp) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        let chance = uStats.customFollowUp.chance;
        if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

        let dotPct = uStats.customFollowUp.dotPct || 0;
        let followUpDotDmg = finalDmg * (dotPct / 100);
        let followUpDotDmgBoss = finalDmgBoss * (dotPct / 100);
        let followUpDotDpsPerCycle = (followUpDotDmg * (chance / 100)) / usedSpa;
        let followUpDotDpsPerCycleBoss = (followUpDotDmgBoss * (chance / 100)) / usedSpa;

        finalDotDps += followUpDotDpsPerCycle * placement;
        finalBossDotDps += followUpDotDpsPerCycleBoss * placement;

        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = followUpDotDpsPerCycle;
            dotBreakdown.fuaDotTotalDmg = followUpDotDmg;
            dotBreakdown.fuaDotDuration = uStats.customFollowUp.dotDuration;
            dotBreakdown.fuaChance = chance;
            dotBreakdown.fuaLabel = "Shadow Emerge (FUA)";
        }
    }

    const finalSummonDps = summonDpsTotal;

    if (headPiece === 'mochi_scarf' && headCalc.hasScarfBurn) {
        const scarfBurnPct = headCalc.scarfBurnPct || 30;
        const scarfBurnDuration = headCalc.scarfBurnDuration || 5;
        const scarfBurnDmg = finalDmg * (scarfBurnPct / 100);
        const scarfBurnDmgBoss = finalDmgBoss * (scarfBurnPct / 100);

        const canStack = !!traitObj.allowDotStack;
        const scarfInterval = canStack ? finalSpa : Math.max(finalSpa, Math.ceil(scarfBurnDuration / finalSpa) * finalSpa);

        const scarfBurnDps = (scarfBurnDmg / scarfInterval) * (canStack ? placement : 1);
        const scarfBurnDpsBoss = (scarfBurnDmgBoss / scarfInterval) * (canStack ? placement : 1);

        finalDotDps += scarfBurnDps;
        finalBossDotDps += scarfBurnDpsBoss;

        if (dotBreakdown) {
            dotBreakdown.scarfBurnDps = scarfBurnDps / (canStack ? placement : 1);
            dotBreakdown.scarfBurnLabel = "Mochi Scarf Burn";
            dotBreakdown.scarfBurnTotalDmg = scarfBurnDmg;
            dotBreakdown.scarfBurnDuration = scarfBurnDuration;
            dotBreakdown.scarfInterval = scarfInterval;
        }
    }

    // --- ELEMENTAL DAMAGE SYSTEM ---
    const elementalDmgBuff = (sBonus.elementalAll || 0) + (headCalc.elementalAll || 0);
    const attackerElement = uStats.element || "None";
    const attackerRarity = uStats.rarity || "Mythical";
    let elemMult = (typeof window !== 'undefined' && window.calcElementalDamageMultiplier)
        ? window.calcElementalDamageMultiplier(attackerElement, defenderElement || "None", attackerRarity, elementalDmgBuff)
        : 1;
    if (uStats.id === 'angel_born_in_hell') {
        elemMult = 1.1;
    }

    // Apply elemental multiplier to all damage channels
    const elemFinalHitDps = finalHitDps * elemMult;
    const elemFinalDotDps = finalDotDps * elemMult;
    const elemFinalSummonDps = finalSummonDps * elemMult;
    const elemBossHitDps = finalBossHitDps * elemMult;
    const elemBossDotDps = finalBossDotDps * elemMult;

    return {
        total: (elemFinalHitDps + elemFinalDotDps + elemFinalSummonDps),
        bossTotal: (elemBossHitDps + elemBossDotDps + elemFinalSummonDps) * bossMult,
        hit: elemFinalHitDps,
        baseHitDps: hitDpsTotal,
        trueDmgPct,
        trueDmgVal,
        normalDmgVal: normalDmgVal + chainLightningDps,
        dot: elemFinalDotDps,
        summon: elemFinalSummonDps,
        summonData,
        detailedBuffs: detailedBuffs,
        spa: usedSpa,
        spaCap: effectiveSpaCap,
        range: finalRange,
        passiveRange: (uStats.passiveRange || 0) + eternalRangeBuff,
        dmgVal: finalDmg,
        bossDmgVal: finalDmgNormal,
        lvStats,
        traitBuffs: { dmg: traitDmgPct, spa: traitSpaPct, range: traitRangePct },
        traitObj,
        relicBuffs: { dmg: baseR_Dmg, spa: baseR_Spa, dot: baseR_Dot, range: baseR_Range, cf: baseR_Cf, cm: baseR_Cm },
        totalSetStats: sBonus,
        tagBuffs,
        activeGlobalBuffs,
        detailedBuffs,
        passiveBuff: passivePcent + headDmgBase + headDmgPassive + headDmgTag + abilityDmg,
        passiveSpaBuff: passiveSpaPcent,
        eternalBuff: eternalDmgBuff,
        eternalRangeBuff: eternalRangeBuff,
        totalAdditivePct: additiveTotal,
        conditionalData: uStats.burnMultiplier ? { name: "Target: Burn", val: uStats.burnMultiplier, mult: (1 + uStats.burnMultiplier / 100) } : (uStats.finalMult > 1 ? { name: uStats.id === 'mochi_pirate' ? "Evercrush Dough" : "Raw Multiplier", val: 0, mult: uStats.finalMult } : null),
        headBuffs: { dmg: headDmgBase + headDmgPassiveMod + headDmgTag, headBase: headDmgBase, passiveDmg: headDmgPassiveMod, tagDmg: headDmgTag, dot: headDotBuff, type: headPiece, warlordSpa, ...headCalc },
        dotData: dotBreakdown,
        critData: { rate: finalCritRate, rawRate: rawCritRate, cdmg: finalCdmgStat, baseCdmg: uStats.cdmg, relicCmPct: baseR_Cm, setCm: sBonus.cm, totalCmBuff: (sBonus.cm || 0) + baseR_Cm, preRelicCdmg: uStats.cdmg, avgMult: avgCritMult },
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
        abilityBuff: (uStats.buffDmg || 0) + abilityDmg,
        warlordData,
        relicStats,
        upgradeLevel: context.upgradeLevel !== undefined ? context.upgradeLevel : 6,
        elementalData: {
            attackerElement,
            defenderElement: defenderElement || "None",
            attackerRarity,
            elementalDmgBuff,
            multiplier: elemMult
        }
    };
}