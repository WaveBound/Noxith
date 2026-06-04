// ============================================================================
// PASSIVE-BACKEND.JS - Centralized Math for Passives and Global Buffs
// ============================================================================

window.calcPassives = function (uStats, context, headPiece, upgradeLevel) {
    let passivePcent = (uStats.buffDmg || 0);
    let passiveSpaPcent = 0;
    let passiveRangePcent = 0;
    let trueDmgFromPassives = 0;
    let passiveCritFromPassives = 0;
    let passiveCdmgFromPassives = 0;
    let passiveDotFromPassives = 0;
    let passiveBreakdown = [];

    if (uStats.passiveDmg) passivePcent += uStats.passiveDmg;
    if (uStats.passiveSpa) passiveSpaPcent += uStats.passiveSpa;
    if (uStats.passiveRange) passiveRangePcent += uStats.passiveRange;
    if (uStats.passiveCrit) passiveCritFromPassives += uStats.passiveCrit;
    if (uStats.passiveCdmg) passiveCdmgFromPassives += uStats.passiveCdmg;

    if (uStats.passiveDmg || uStats.passiveSpa || uStats.passiveRange || uStats.passiveCrit || uStats.passiveCdmg) {
        passiveBreakdown.push({
            name: "Unit Base (Passive)",
            dmg: uStats.passiveDmg || 0,
            spa: uStats.passiveSpa || 0,
            range: uStats.passiveRange || 0,
            crit: uStats.passiveCrit || 0,
            cdmg: uStats.passiveCdmg || 0,
            trueDmg: 0,
            dot: 0
        });
    }

    if (uStats.passives && Array.isArray(uStats.passives)) {
        uStats.passives.forEach(p => {
            let pDmg = p.passiveDmg || 0;
            let pSpa = p.passiveSpa || 0;
            let pRange = p.passiveRange || 0;
            let pTrue = p.trueDmg || 0;
            let pCrit = p.passiveCrit || 0;
            let pCdmg = p.passiveCdmg || 0;
            let pDot = p.dot || 0;
            if (p.name === "Brutal Slashes") {
                pDot = (upgradeLevel >= 6) ? 120 : 100;
            }

            if (window.isUnit && window.isUnit(uStats.id, 'underworld_god') && p.name === "As The Eldest Brother") {
                const isLoadout = (window.CALCULATION_MODE === 'loadout');
                const useHotbar = isLoadout || (context && context.isHotbar);
                const hbStats = useHotbar && typeof window.getCachedHotbarStats === 'function' ? window.getCachedHotbarStats() : { divinityCount: 0 };
                let divinityCount = hbStats.divinityCount || 0;
                if (uStats.tags && uStats.tags.includes('Divinity')) {
                    let selfCount = uStats.placement || 1;
                    if (window.isUnit && window.isUnit(uStats.id, 'water_god')) selfCount = Math.max(0, selfCount - 1);
                    divinityCount = Math.max(0, divinityCount - selfCount);
                }

                const maxBuff = (upgradeLevel >= 2) ? 90 : 60;
                pDmg = Math.min(maxBuff, divinityCount * 15);
            }

            if (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'king_sailor')) {
                if (p.name === "Manipulator of Fate") {
                    pDmg = 0;
                    pSpa = 0;

                    const ksTags = uStats.tags || ["Magi", "King", "Hero", "Uncontrollable Power"];
                    let matchPlacements = 0;
                    let mismatchPlacements = 0;

                    const hotbarSlots = window.hotbarState?.slots || [];
                    hotbarSlots.forEach((s) => {
                        if (!s) return;
                        if (s.id === uStats.id || (window.isUnit && window.isUnit(s.id, uStats.id))) return;

                        const sUnit = window.getUnitById ? window.getUnitById(s.id) : null;
                        let sPlacement = (sUnit ? sUnit.placement : s.placement) || 1;

                        const isAssistant = (sUnit?.tags && sUnit.tags.includes('Assistant')) ||
                            (s.tags && s.tags.includes('Assistant')) ||
                            (window.isUnit && window.isUnit(s.id, 'speedwagon'));

                        if (isAssistant) {
                            sPlacement = 1;
                        } else {
                            const sTraitId = (window.unitTraits && window.unitTraits[s.id]);
                            if (sTraitId) {
                                const sTrait = typeof window.getTraitFast === 'function' ? window.getTraitFast(sTraitId) : null;
                                if (sTrait && sTrait.limitPlace !== undefined) {
                                    sPlacement = Math.min(sPlacement, sTrait.limitPlace);
                                }
                            }
                        }

                        const sTags = (sUnit ? sUnit.tags : s.tags) || [];
                        const hasMatch = ksTags.some(tag => sTags.includes(tag));

                        if (hasMatch) {
                            matchPlacements += sPlacement;
                        } else {
                            mismatchPlacements += sPlacement;
                        }

                        if (window.isUnit && window.isUnit(s.id, 'phantom_captain') && sUnit?.summonStats?.maxCount) {
                            mismatchPlacements += sUnit.summonStats.maxCount;
                        }
                    });

                    pDmg = Math.min(50, matchPlacements * 10);
                    pSpa = Math.min(25, mismatchPlacements * 5);
                }
            }

            if (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'ant_king_savage')) {
                if (p.name === "Monarch's Devotion") {
                    const hotbar = window.hotbarState;
                    const jinooPresent = hotbar && hotbar.slots && hotbar.slots.some(s => s && window.isUnit && (window.isUnit(s.id, 'jinoo_shadow_monarch') || window.isUnit(s.id, 'sjw')));
                    if (jinooPresent) {
                        pDmg = 20;
                        pRange = 10;
                    } else {
                        pDmg = 0;
                        pRange = 0;
                    }
                }
            }

            if (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'marine_hero')) {
                if (p.name === "Hero of the Marines") {
                    let warlordPlacements = 0;
                    const hotbarSlots = window.hotbarState?.slots || [];
                    hotbarSlots.forEach((s) => {
                        if (!s) return;
                        if (s.id === uStats.id || (window.isUnit && window.isUnit(s.id, uStats.id))) return;

                        const sUnit = window.getUnitById ? window.getUnitById(s.id) : null;
                        const sTags = (sUnit ? sUnit.tags : s.tags) || [];
                        
                        if (sTags.includes('Warlord')) {
                            let sPlacement = (sUnit ? sUnit.placement : s.placement) || 1;
                            const sTraitId = (window.unitTraits && window.unitTraits[s.id]);
                            if (sTraitId) {
                                const sTrait = typeof window.getTraitFast === 'function' ? window.getTraitFast(sTraitId) : null;
                                if (sTrait && sTrait.limitPlace !== undefined) {
                                    sPlacement = Math.min(sPlacement, sTrait.limitPlace);
                                }
                            }
                            warlordPlacements += sPlacement;
                        }
                    });

                    const dmgPerWarlord = 25;
                    const maxCap = (upgradeLevel >= 2) ? 150 : 100;
                    pDmg = Math.min(maxCap, warlordPlacements * dmgPerWarlord);
                }
            }

            if (p.name === "Unrivaled Mark") {
                const isPotential = window.CALCULATION_MODE === 'potential';
                if (!isPotential) {
                    const hotbar = window.hotbarState;
                    if (hotbar && hotbar.slots) {
                        const slotIdx = hotbar.slots.findIndex(s => s && (s.id.split('-')[0] === uStats.id.split('-')[0]));
                        if (slotIdx !== 0) return;
                    }
                }
            }

            if (p.buffedByJunior && headPiece === 'junior') {
                pDmg *= 1.1;
                pSpa *= 1.1;
                pTrue *= 1.1;
                pCrit *= 1.1;
                if (!p.juniorIgnoreCdmg) {
                    pCdmg *= 1.1;
                }
                pDot *= 1.1;
            }

            const isKsDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'king_sailor') && (p.name === "Manipulator of Fate" || p.name === "Unrivaled Mark"));
            const isAkDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'ant_king_savage') && p.name === "Monarch's Devotion");
            const isUgDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'underworld_god') && p.name === "As The Eldest Brother");
            const isMhDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'marine_hero') && p.name === "Hero of the Marines");
            const isAbhDynamic = (window.CALCULATION_MODE === 'loadout' && window.isUnit && window.isUnit(uStats.id, 'angel_born_in_hell') && p.name === "Warrior that destroys Evil");

            if (isAbhDynamic) {
                pDmg = 0;
                let totalAlliedCrit = 0;
                const hotbarSlots = window.hotbarState?.slots || [];
                hotbarSlots.forEach(s => {
                    if (!s) return;
                    if (s.id === uStats.id || (window.isUnit && window.isUnit(s.id, uStats.id))) return;
                    
                    const build = window.hotbarFilteredBuilds?.[s.id];
                    if (build) {
                        const rate = build.subStats?.finalCf !== undefined 
                            ? build.subStats.finalCf 
                            : (build.critData?.rate !== undefined ? build.critData.rate : 0);
                        totalAlliedCrit += rate;
                    } else {
                        const sUnit = window.getUnitById ? window.getUnitById(s.id) : null;
                        if (sUnit) {
                            totalAlliedCrit += (sUnit.stats?.crit !== undefined ? sUnit.stats.crit : (sUnit.crit || 0));
                        }
                    }
                });
                const eLevel = context.rankData?.eLevel !== undefined ? context.rankData.eLevel : 6;
                const mult = (eLevel >= 4) ? 1.0 : 0.5;
                pDmg = totalAlliedCrit * mult;
            }

            if (p.name === "Pirate Hunter") {
                if (context.isBoss || context.isAbility) {
                    let bossDmgBuff = (upgradeLevel >= 4) ? 65 : 50;
                    if (headPiece === 'junior') {
                        bossDmgBuff *= 1.1;
                    }
                    pDmg += bossDmgBuff;
                    pCrit += 65;
                }
            }

            if (pDmg !== 0 || pSpa !== 0 || pRange !== 0 || pTrue !== 0 || pCrit !== 0 || pCdmg !== 0 || pDot !== 0 || isKsDynamic || isAkDynamic || isUgDynamic || isMhDynamic || isAbhDynamic) {
                passivePcent += pDmg;
                passiveSpaPcent += pSpa;
                passiveRangePcent += pRange;
                trueDmgFromPassives += pTrue;
                passiveCritFromPassives += pCrit;
                passiveCdmgFromPassives += pCdmg;
                passiveDotFromPassives += pDot;
                if (p.dotDuration && !uStats.dotDuration) uStats.dotDuration = p.dotDuration;
                passiveBreakdown.push({ name: p.name, dmg: pDmg, spa: pSpa, range: pRange, trueDmg: pTrue, crit: pCrit, cdmg: pCdmg, dot: pDot });
            }
        });
    }

    if (window.CALCULATION_MODE === 'loadout' && window.isUnit && !window.isUnit(uStats.id, 'jinoo_shadow_monarch') && !window.isUnit(uStats.id, 'sjw')) {
        const hbStats = typeof window.getCachedHotbarStats === 'function' ? window.getCachedHotbarStats() : {};
        if (hbStats.jinooPresent) {
            if (uStats.tags && uStats.tags.includes('Leveling')) {
                const jinooSlot = window.hotbarState?.slots.find(s => s && (window.isUnit(s.id, 'jinoo_shadow_monarch') || window.isUnit(s.id, 'sjw')));
                const jinooELevel = (jinooSlot && window.unitELevels && window.unitELevels[jinooSlot.id] !== undefined) ? window.unitELevels[jinooSlot.id] : 0;

                let buffDmg = 20;
                if (jinooELevel >= 4) buffDmg = 30;

                if (window.isUnit(uStats.id, 'shadow_knight')) {
                    buffDmg = (jinooELevel >= 4) ? 50 : 40;
                }

                passivePcent += buffDmg;
                passiveBreakdown.push({ name: "Shadow Legion Support", dmg: buffDmg, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
            }
        }
    }

    if (window.CALCULATION_MODE === 'loadout' && context && context.isHotbar && window.isUnit && !window.isUnit(uStats.id, 'ant_king_savage')) {
        const hbStats = typeof window.getCachedHotbarStats === 'function' ? window.getCachedHotbarStats() : {};
        if (hbStats.akPresent && hbStats.jinooPresent) {
            passivePcent += 10;
            passiveBreakdown.push({ name: "Monarch's Devotion", dmg: 10, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
        }
    }

    if (window.CALCULATION_MODE === 'loadout' && context && context.isHotbar && window.isUnit && window.isUnit(uStats.id, 'ace')) {
        const hasQuakeWarlord = window.hotbarState?.slots.some(s => s && window.isUnit(s.id, 'quake_warlord'));
        if (hasQuakeWarlord) {
            passivePcent += 40;
            passiveBreakdown.push({ name: "My Sons", dmg: 40, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
        }
    }

    if (window.CALCULATION_MODE === 'loadout' && context && context.isHotbar && window.isUnit && !window.isUnit(uStats.id, 'angel_born_in_hell')) {
        const hasABH = window.hotbarState?.slots.some(s => s && window.isUnit(s.id, 'angel_born_in_hell'));
        const doesFUA = uStats.id === 'ultimate_fused_warrior' || uStats.id === 'strongest_swordsman_hunter' || uStats.id === 'water_god' || uStats.id === 'triple_threat';
        if (hasABH && doesFUA) {
            const abhSlot = window.hotbarState.slots.find(s => s && window.isUnit(s.id, 'angel_born_in_hell'));
            const abhELevel = abhSlot ? (window.unitELevels?.[abhSlot.id] ?? 6) : 6;
            const holyAuraDmg = (abhELevel >= 2) ? 50 : 30;
            passivePcent += holyAuraDmg;
            passiveBreakdown.push({ name: "Holy Aura (ABH Buff)", dmg: holyAuraDmg, spa: 0, range: 0, trueDmg: 0, crit: 0, cdmg: 0, dot: 0 });
        }
    }

    return { passivePcent, passiveSpaPcent, passiveRangePcent, trueDmgFromPassives, passiveCritFromPassives, passiveCdmgFromPassives, passiveDotFromPassives, passiveBreakdown };
};

window.calcGlobalBuffs = function (uStats, context, headPiece) {
    let globalDmg = 0, globalSpa = 0, globalRange = 0, globalCrit = 0, globalCdmg = 0;
    let activeGlobalBuffs = {};

    if (typeof window !== 'undefined' && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            let isActive = false;
            const overrideKey = buff.id + 'Buff';

            if (buff.hideButton || (buff.id === 'ksailor' && window.isUnit && window.isUnit(uStats.id, 'king_sailor'))) {
                isActive = true; // Always evaluate hideButton buffs and King Sailor's own buff
            } else if (context[overrideKey] !== undefined) {
                isActive = context[overrideKey];
            } else if (context[buff.stateKey] !== undefined) {
                isActive = context[buff.stateKey];
            } else {
                isActive = window[buff.stateKey];
            }

            if (isActive) {
                const buffStats = buff.math(uStats, context);

                if (headPiece === 'junior' && ['miku', 'enlightenedgod', 'ksailor', 'bijuu', 'magehill'].includes(buff.id)) {
                    if (buffStats.dmg) buffStats.dmg *= 1.1;
                    if (buffStats.spa) buffStats.spa *= 1.1;
                }

                if (buffStats && Object.keys(buffStats).length > 0) {
                    activeGlobalBuffs[buff.id] = buffStats;
                    if (buffStats.dmg) globalDmg += buffStats.dmg;
                    if (buffStats.spa) globalSpa += buffStats.spa;
                    if (buffStats.range) globalRange += buffStats.range;
                    if (buffStats.crit) globalCrit += buffStats.crit;
                    if (buffStats.cdmg) globalCdmg += buffStats.cdmg;
                }
            }
        });
    }

    return { globalDmg, globalSpa, globalRange, globalCrit, globalCdmg, activeGlobalBuffs };
};
