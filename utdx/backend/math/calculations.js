// ============================================================================
// CALCULATIONS.JS - Core DPS Engine (calculateDPS only)
// Depends on: backend/math/lookups.js, backend/math/core-math.js
// All other logic: lookups.js, context-builder.js, build-runner.js
// ============================================================================

// --- REAL-TIME ALLY CRIT RESOLVER (Bypasses rendering latency/dependencies) ---
window.getUnitUncappedCrit = function (slotUnit, slotIndex) {
    if (!slotUnit) return 0;

    const build = window.hotbarFilteredBuilds?.[slotUnit.id] || window.unitActiveBuilds?.[slotUnit.id];
    let crit = 0;

    if (build && build.critData) {
        // Read uncapped raw rate which ALREADY includes global buffs (Fern, Ancient Mage, etc.)
        return build.critData.rawRate || build.critData.rate || 0;
    }

    crit = slotUnit.stats?.crit || slotUnit.crit || 0;

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
                    if (isFernSelf || targets.includes(slotIndex)) {
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

    let lvStats = getLevelStats(uStats.dmg || 0, uStats.spa || 1, uStats.range || 0, dmgPoints, spaPoints, rangePoints);
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
        passiveBossDmgFromPassives,
        passiveDotFromPassives,
        passiveBreakdown
    } = window.calcPassives(uStats, context, headPiece, upgradeLevel);

    let { bossMult, traitDmgPct, traitSpaPct, traitCritRate, traitRangePct, traitDotBuff, eternalDmgBuff, eternalRangeBuff } = window.calcTraitSynergies(traitObj, uStats, wave);
    if (eternalDmgBuff > 0) passivePcent += eternalDmgBuff;

    let { sBonus, tagBuffs, setPerkDmg, baseR_Dmg, baseR_Spa, baseR_Cm, baseR_Cf, baseR_Dot, baseR_Range } = window.calcRelicStats(relicStats, uStats, headPiece, context, traitObj, starMult, statConfig);

    // Extract Head Accessory Base Stats (SPA, Range, Crit) early for math integration
    const headSetIdMap = {
        sun_god: 'sun_god', ninja: 'ninja', reaper_necklace: 'reaper_set', shadow_reaper_necklace: 'shadow_reaper',
        junior: 'ninja', biju_head: 'biju_set', rebellious_head: 'rebellious', reanimated_head: 'reanimated_ninja',
        super_roku: 'super_roku', bio_android: 'bio_android', great_mage: 'great_mage', berserk_shinigami: 'berserk_shinigami',
        hokage: 'hokage', sorcerer_hunter_spirit: 'sorcerer_hunter', strongest_sorcerer_glasses: 'strongest_sorcerer',
        monarch_cape: 'monarch', monarch_head: 'monarch', monarch: 'monarch', warlord_hat: 'warlord', fused_earrings: 'fused_set'
    };
    const mappedHeadSetId = headSetIdMap[headPiece];
    let headSpaBase = 0;
    if (mappedHeadSetId) {
        const headSetObj = (typeof SETS !== 'undefined') ? SETS.find(s => s.id === mappedHeadSetId) : null;
        if (headSetObj && headSetObj.accessory) {
            const acc = headSetObj.accessory;
            headSpaBase = acc.spa || 0;
        }
    }

    let { globalDmg, globalSpa, globalRange, globalCrit, globalCdmg, activeGlobalBuffs } = window.calcGlobalBuffs(uStats, context, headPiece);

    const tags = uStats.tags || [];

    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + globalRange + (window.isUnit(uStats.id, 'king_sailor') ? 10 : 0);
    let finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);

    let setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + globalSpa + headSpaBase;
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

    // Nursefather boss damage: stack trait-based boss multipliers (Duelist)
    // with her passive/innate boss damage.
    if (window.isUnit(uStats.id, 'nursefather_thumb')) {
        let pBoss = passiveBossDmgFromPassives || 0;
        // Fallback: Manually scan passives if the aggregator missed the key
        if (pBoss === 0 && uStats.passives) {
            uStats.passives.forEach(p => {
                if (p.bossDmg) pBoss += p.bossDmg;
                else if (p.passiveBossDmg) pBoss += p.passiveBossDmg;
                else if (p.boss) pBoss += p.boss;
            });
        }
        const nursefatherBossDmg = (uStats.bossDmg || 0) + pBoss;
        bossMult = (bossMult - 1 + nursefatherBossDmg / 100) + 1;
    } else {
        // For all other units, apply relic set bossDmg and head accessory bossDmg into bossMult
        const relicBossDmg = (sBonus.bossDmg || 0) + (headCalc.bossDmg || 0) + (uStats.bossDmg || 0) + (passiveBossDmgFromPassives || 0);
        if (relicBossDmg > 0) {
            bossMult = (bossMult - 1 + relicBossDmg / 100) + 1;
        }
    }

    let headDmgPassiveMod = headDmgPassive;
    if (headPiece === 'biju_head' && window.isUnit(uStats.id, 'triple_threat')) {
        const bgAtks = Math.floor(10 / finalSpa);
        const totalAtks = bgAtks + 1;
        const uptime = totalAtks > 0 ? (bgAtks / totalAtks) : 0;
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
        let estCritRate = Math.min(uStats.crit + traitCritRate + globalCrit + (headCalc.cf || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives, 100);
        if (window.isUnit(uStats.id, 'pirate_king')) {
            textCritRate = 40;
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
        accessoryBase: headDmgBase, // Base stats from accessory itself (e.g., S. Reaper +2.5% Dmg)
        accessoryPerk: headDmgPassiveMod, // Passive-based perks from accessory (e.g., Sun God's Blessing)
        tagBonus: (tagBuffs.dmg || 0) + headDmgTag,
        unitPassive: passivePcent,
        abilityBuff: abilityDmg,
        globalBuffs: globalDmg,
        passiveBreakdown: passiveBreakdown
    };

    // Calculate raw, uncapped crit rate first
    let rawCritRate = uStats.crit + traitCritRate + globalCrit + (headCalc.cf || 0) + baseR_Cf + (sBonus.cf || 0) + passiveCritFromPassives;
    if (window.isUnit(uStats.id, 'kirito')) {
        rawCritRate = Math.min(rawCritRate, uStats.crit);
    }
    if (window.isUnit(uStats.id, 'pirate_king')) {
        rawCritRate = 40;
    }
    if (headPiece === 'sorcerer_hunter_spirit') rawCritRate = 0;

    // --- OVERCAP CRIT RATE OPTIMIZATION ---
    // Automatically convert wasted crit rate from relic substats into crit damage.
    // 1 cf roll = 7.5%, 1 cm roll = 18%. Exchange ratio = 18/7.5 = 2.4
    let overcapCritRate = Math.max(0, rawCritRate - 100);
    let cfFromSubs = (headCalc.cf || 0) + baseR_Cf; 
    let convertibleCf = Math.min(overcapCritRate, cfFromSubs);
    let convertedCm = convertibleCf * 2.4;

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + globalCdmg + (headCalc.cm || 0) + passiveCdmgFromPassives + convertedCm;

    let finalCritRate = Math.min(rawCritRate, 100);

    if (window.isUnit(uStats.id, 'angel_born_in_hell') || window.isUnit(uStats.id, 'the_strongest_of_today') || window.isUnit(uStats.id, 'strongest_of_today')) {
        // Angel Born in Hell and Strongest of Today have a fixed 50% Crit Rate
        finalCritRate = 50;
        rawCritRate = 50;
        // Crit rate → dmg conversion is handled by "Warrior that destroys Evil" passive in passive-backend
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
    let hitDpsTotal = 0;
    let bossHitDpsTotal = 0;
    let normalHitDpsTotal = 0;

    let attackMultiplier = 1;
    let extraAttacksData = null;
    let usedSpa = finalSpa;

    const ar = window.applyAbilityAttackRate ? window.applyAbilityAttackRate(uStats, isAbility, finalSpa, 1, null) : null;
    if (ar && ar.isHandled) {
        usedSpa = ar.usedSpa;
        attackMultiplier = ar.attackMultiplier;
        extraAttacksData = ar.extraAttacksData;
        hitDpsTotal = ((avgHit / usedSpa) * placement * attackMultiplier);
        bossHitDpsTotal = ((avgHitBoss / usedSpa) * placement * attackMultiplier);
        normalHitDpsTotal = ((avgHitNormal / usedSpa) * placement * attackMultiplier);
    } else if (isFusedWarrior) {
        const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
        const followUp2Chance = (eLevel >= 2) ? 0.70 : 0.50;
        attackMultiplier = 1 + 1 + followUp2Chance;
        usedSpa = finalSpa;
        hitDpsTotal = ((avgHit / usedSpa) * placement * attackMultiplier);
        bossHitDpsTotal = ((avgHitBoss / usedSpa) * placement * attackMultiplier);
        normalHitDpsTotal = ((avgHitNormal / usedSpa) * placement * attackMultiplier);
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
        const stance2DmgBonus = (upgradeLevel >= 6) ? 60 : 40;
        const stance2CritBonus = (upgradeLevel >= 6) ? 20 : 15;
        const unbuffedDmg = finalDmgNormal;
        const unbuffedCrit = finalCritRate;
        const unbuffedCritMult = 1 + (finalCdmgStat / 100) * (unbuffedCrit / 100);
        const unbuffedAvgHit = unbuffedDmg * unbuffedCritMult;
        const buffedDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + (additiveTotal + stance2DmgBonus) / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1) * (uStats.finalMult || 1) * abilityFinalMult;
        const buffedCrit = Math.min(finalCritRate + stance2CritBonus, 100);
        const buffedCritMult = 1 + (finalCdmgStat / 100) * (buffedCrit / 100);
        const buffedAvgHit = buffedDmg * buffedCritMult;
        const totalCycleDmg = (6 * unbuffedAvgHit) + (3 * buffedAvgHit);
        avgHit = totalCycleDmg / 9;
        avgHitBoss = avgHit * bossMult;
        attackMultiplier = (totalCycleDmg / (6 * unbuffedAvgHit));
        hitDpsTotal = ((avgHit / finalSpa) * placement * 1.5); // 9 hits per 6 cycle time
        bossHitDpsTotal = hitDpsTotal * bossMult;
        normalHitDpsTotal = hitDpsTotal;
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
    } else {
        // Default logic for all other units
        if (window.isUnit(uStats.id, 'water_god') && uStats.followUp) {
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
            attackMultiplier = 1.20;
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

        hitDpsTotal = ((avgHit / usedSpa) * placement * attackMultiplier);
        bossHitDpsTotal = ((avgHitBoss / usedSpa) * placement * attackMultiplier);
        normalHitDpsTotal = ((avgHitNormal / usedSpa) * placement * attackMultiplier);
    }

    if (uStats.customFollowUp) {
        const cooldown = uStats.customFollowUp.cooldown;
        const fuaDmgMult = uStats.customFollowUp.dmgMult || 1.0;
        const fuaAnim = uStats.customFollowUp.fuaAnimation || 0;
        const fuaDotPct = uStats.customFollowUp.dotPct || 0;

        if (cooldown) {
            if (uStats.customFollowUp.nextAttack) {
                // Rule: FUA triggers on the next attack AFTER cooldown expires.
                // Effective duration of a FUA hit is SPA + fuaAnim.
                const fuaHitDuration = finalSpa + fuaAnim;

                // Smallest N such that N * SPA >= cooldown. 
                // If the FUA hit duration itself exceeds cooldown, every hit is a FUA (N=1).
                const hitsInCycle = (fuaHitDuration >= cooldown) ? 1 : Math.max(1, Math.ceil(cooldown / finalSpa));

                // Cycle duration accounts for the animation lock added to the FUA hit itself.
                const cycleDuration = (hitsInCycle * finalSpa) + fuaAnim;

                // Calculate DPS multiplier
                // One cycle has hitsInCycle normal hits (1.0 each) plus one extra Disposal FUA (dmgMult)
                const totalDmgInCycle = hitsInCycle + fuaDmgMult;

                // DPS = (Total Damage / Cycle Duration) * placement
                hitDpsTotal = ((totalDmgInCycle * avgHit) / cycleDuration) * placement;
                bossHitDpsTotal = (totalDmgInCycle * avgHitBoss / cycleDuration) * placement;
                normalHitDpsTotal = (totalDmgInCycle * avgHitNormal / cycleDuration) * placement;

                // Multiplier relative to standard shooting (avgHit / finalSpa)
                attackMultiplier = (totalDmgInCycle / cycleDuration) * finalSpa;

                // FIX: Keep card SPA matching Section 3 breakdown (finalSpa) instead of the averaged speed
                usedSpa = finalSpa;

                extraAttacksData = {
                    req: `Cycle: ${hitsInCycle} Hits (${cycleDuration.toFixed(2)}s)`,
                    hits: `${hitsInCycle} Base + ${fuaDmgMult}x FUA`,
                    extra: 0,
                    attacksNeeded: 1,
                    mult: attackMultiplier,
                    label: uStats.customFollowUp.label || "Follow-Up",
                    usedSpa: cycleDuration / totalDmgInCycle,
                    hitsInCycle,
                    totalDmgInCycle,
                    hitsMult: totalDmgInCycle / hitsInCycle,
                    cycleDuration
                };
            } else {
                // Account for time lost to FUA animation within the cooldown window (Timeline standard: 60s)
                const timeFrame = 60;
                const fuaCount = timeFrame / cooldown;
                const lockedTime = fuaCount * fuaAnim;
                const availableTime = Math.max(0, timeFrame - lockedTime);
                const normalHits = Math.round(availableTime / finalSpa); // Rounded to closest number per request

                const totalHitsDealt = normalHits + (fuaCount * fuaDmgMult);
                const windowMultiplier = totalHitsDealt / Math.max(1, normalHits);

                hitDpsTotal = (totalHitsDealt * avgHit / timeFrame) * placement;
                bossHitDpsTotal = (totalHitsDealt * avgHitBoss / timeFrame) * placement;

                // FIX: Keep card SPA matching Section 3 breakdown (finalSpa) instead of the averaged speed
                usedSpa = finalSpa;

                extraAttacksData = {
                    req: `Fixed CD: ${cooldown}s`,
                    hits: `${fuaDmgMult}x Dmg FUA`,
                    extra: 0,
                    attacksNeeded: 1,
                    mult: windowMultiplier,
                    label: uStats.customFollowUp.label || "Follow-Up",
                    usedSpa: timeFrame / totalHitsDealt
                };
            }
        } else {
            const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
            let chance = uStats.customFollowUp.chance;
            if (eLevel >= uStats.customFollowUp.eLevelReq) chance = uStats.customFollowUp.eLevelChance;

            const atkAnim = effectiveSpaCap;
            const timeIfFua = Math.max(finalSpa, atkAnim + fuaAnim);
            const timeIfNoFua = Math.max(finalSpa, atkAnim);
            const computedSpa = (chance / 100) * timeIfFua + (1 - (chance / 100)) * timeIfNoFua;
            attackMultiplier = 1 + (chance / 100) * fuaDmgMult;

            // FIX: Keep card SPA matching Section 3 breakdown (finalSpa) instead of the averaged speed
            usedSpa = finalSpa;
            hitDpsTotal = (avgHit / computedSpa) * placement * attackMultiplier;
            bossHitDpsTotal = (avgHitBoss / computedSpa) * placement * attackMultiplier;

            extraAttacksData = {
                req: `Follow-Up (${chance}%)`,
                hits: `1 + ${fuaDmgMult}x`,
                extra: (chance / 100) * fuaDmgMult,
                attacksNeeded: 1,
                mult: attackMultiplier,
                label: uStats.customFollowUp.label || "Follow-Up",
                usedSpa: computedSpa
            };
        }
    }

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

    // Identify the "Source" DoT percentage.
    // If not in base stats, look for the primary DoT value in passives.
    let baseDotVal = uStats.dot || 0;
    let passiveDotBuff = passiveDotFromPassives;

    if (baseDotVal === 0 && uStats.passives) {
        const dotSrc = uStats.passives.find(p => p.dot > 0 || p.name === "Brutal Slashes" || p.name === "Fiery Legacy");
        if (dotSrc) {
            const srcVal = dotSrc.dot || (dotSrc.name === "Brutal Slashes" ? (upgradeLevel >= 6 ? 120 : 100) : 0);
            baseDotVal = srcVal;
            // Subtract from aggregated buffs to treat this specific passive as the base source
            passiveDotBuff = Math.max(0, passiveDotBuff - srcVal);
        }
    }

    let globalDotMult = 1.0;
    if (headPiece === 'mochi_scarf' && (uStats.id === 'ace' || (window.isUnit && window.isUnit(uStats.id, 'ace')))) {
        globalDotMult *= 1.5;
    }
    if (headPiece === 'flaming_donut' && (uStats.id === 'ace' || (window.isUnit && window.isUnit(uStats.id, 'ace')))) {
        globalDotMult *= 1.5;
    }

    // Check for Godly Earrings buff (Allies gain +50% DoT)
    if (typeof window !== 'undefined' && window.CALCULATION_MODE === 'loadout' && window.hotbarState && window.hotbarState.units) {
        if (window.hotbarState.units.includes('merciless_god') && uStats.id !== 'merciless_god') {
            const mgState = window.unitModesState ? window.unitModesState['merciless_god'] : undefined;
            const mgIdx = Array.isArray(mgState) ? mgState[0] : (mgState !== undefined ? mgState : 4);
            const mgUnit = typeof window.getUnitById === 'function' ? window.getUnitById('merciless_god') : null;
            if (mgUnit && mgUnit.modes && mgUnit.modes[mgIdx]) {
                const passives = mgUnit.modes[mgIdx].passives || [];
                if (passives.some(p => p.name === 'Godly Earrings')) {
                    globalDotMult *= 1.5;
                    if (detailedBuffs) {
                        detailedBuffs.globalBuffs = (detailedBuffs.globalBuffs || 0) + 50;
                    }
                }
            }
        }
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
        const cooldown = uStats.customFollowUp.cooldown;
        const fuaDmgMult = uStats.customFollowUp.dmgMult || 1.0;
        const fuaDotPct = uStats.customFollowUp.dotPct || 0;

        let followUpDotDpsPerCycle, followUpDotDpsPerCycleBoss, followUpDotDmg, chance = 100;

        if (cooldown) {
            // DoT is 75% of FUA damage (which is 1.2x base)
            followUpDotDmg = finalDmg * fuaDmgMult * (fuaDotPct / 100);
            followUpDotDpsPerCycle = followUpDotDmg / cooldown;
            followUpDotDpsPerCycleBoss = (finalDmgBoss * fuaDmgMult * (fuaDotPct / 100)) / cooldown;
        } else {
            const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
            chance = (eLevel >= uStats.customFollowUp.eLevelReq) ? uStats.customFollowUp.eLevelChance : uStats.customFollowUp.chance;
            followUpDotDmg = finalDmg * fuaDmgMult * (fuaDotPct / 100);
            followUpDotDpsPerCycle = (followUpDotDmg * (chance / 100)) / usedSpa;
            followUpDotDpsPerCycleBoss = (finalDmgBoss * fuaDmgMult * (fuaDotPct / 100) * (chance / 100)) / usedSpa;
        }

        finalDotDps += followUpDotDpsPerCycle * placement;
        finalBossDotDps += followUpDotDpsPerCycleBoss * placement;

        if (dotBreakdown) {
            dotBreakdown.fuaDotDps = followUpDotDpsPerCycle;
            dotBreakdown.fuaDotTotalDmg = followUpDotDmg;
            dotBreakdown.fuaDotDuration = uStats.customFollowUp.dotDuration;
            dotBreakdown.fuaChance = chance;
            dotBreakdown.fuaLabel = (uStats.customFollowUp.label || "Follow-Up") + " DoT";
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

    // --- CUSTOM DEBUFF MULTIPLIERS (NON-STACKING) ---
    let finalDebuffMult = 1.0;
    let appliedDebuffs = [];
    let maxDebuffMult = 1.0;
    let maxDebuffLabel = "";

    if (traitObj.hasRadiation || uStats.hasRadiation) {
        let radPct = traitObj.radiationPct || uStats.radiationPct || 20;
        let radMult = 1 + (radPct / 100);
        if (radMult > maxDebuffMult) {
            maxDebuffMult = radMult;
            maxDebuffLabel = `Radiation (${radPct}%)`;
        }
    }

    finalDebuffMult = maxDebuffMult;
    if (maxDebuffMult > 1.0) {
        appliedDebuffs.push({ label: maxDebuffLabel, val: maxDebuffMult });
    }

    // Apply elemental and debuff multipliers to all damage channels
    const elemFinalHitDps = finalHitDps * elemMult * finalDebuffMult;
    const elemFinalDotDps = finalDotDps * elemMult * finalDebuffMult;
    const elemFinalSummonDps = finalSummonDps * elemMult * finalDebuffMult;
    const elemBossHitDps = finalBossHitDps * elemMult * finalDebuffMult;
    const elemBossDotDps = finalBossDotDps * elemMult * finalDebuffMult;

    return {
        total: (elemFinalHitDps + elemFinalDotDps + elemFinalSummonDps),
        // Boss multiplier should NOT scale custom summons (e.g., Merciless God Divine Clones).
        // Only the unit's own boss channels (hit + dot) are affected.
        // Boss multiplier should only apply to the unit's own boss hit+dot channels.
        // Target DPS displays for bosses should exclude summon DPS.
        // Boss target DPS = (Hit DPS + DoT DPS) * Boss Multiplier + Summon DPS
        // Boss Mult only affects the unit's hit+dot channels (not summons).
        bossTotal: (elemBossHitDps + elemBossDotDps) * bossMult + elemFinalSummonDps,
        bossMult: bossMult,
        hit: elemFinalHitDps,
        baseHitDps: hitDpsTotal,
        trueDmgPct,
        trueDmgVal: trueDmgVal * elemMult * finalDebuffMult,
        normalDmgVal: (normalDmgVal + chainLightningDps) * elemMult * finalDebuffMult,
        dot: elemFinalDotDps,
        summon: elemFinalSummonDps,
        summonData,
        detailedBuffs: detailedBuffs,
        spa: finalSpa, // UI now shows the actual shooting interval (respects animation cap)
        usedSpa: usedSpa, // Internal averaged SPA for math transparency
        finalSpa: finalSpa,
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
        },
        appliedDebuffs
    };
}