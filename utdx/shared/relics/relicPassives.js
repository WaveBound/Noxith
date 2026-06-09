// ─── RELIC PASSIVES ──────────────────────────────────────────
// Passive definitions for sets that use { passive: "id" } in their bonus.
// Tag perks: unit gets extra bonus if it has a matching tag for the set.

// ─── PASSIVES ───────────────────────────────────────────────

const PASSIVES = {
    // === RAID / SECRET PASSIVES ===
    rebellious: {
        name: "Control Mastery",
        desc: "When this unit applies any crowd control effect, gain 30% extra damage over the next 10 seconds",
        trigger: "onCCApply",
        dmgBuff: 30,
        duration: 10
    },
    rebellious_acc: {
        name: "Form Master",
        desc: "When this unit swaps their form/mode, permanently increase that placed units damage by 5%. This can stack up to 6 times",
        trigger: "onFormSwap",
        dmgBuffPerStack: 5,
        maxStacks: 6
    },
    reanimated_ninja_acc: {
        name: "Edo Tensei",
        desc: "Every 5th attack gains DoT Damage equal to its range (1 range=1% DoT Damage) for 10 seconds (Doesnt stack)",
        trigger: "onAttackCount",
        attacksNeeded: 5,
        duration: 10
    },
    warlord: {
        name: "Warlord's Fury",
        desc: "Critical hit = +45% Damage for 20 seconds. 10s cooldown.",
        trigger: "onCrit",
        dmgBuff: 45,
        duration: 20,
        cooldown: 10
    },

    // === STORY / MYTHICAL PASSIVES ===
    sun_god_acc: {
        name: "Sun God's Blessing",
        desc: "Every 6 attacks unit gains damage buff equal to its range (1 Range = 1% Damage buff) for 7 seconds. Attacks while buff active do not count.",
        trigger: "onAttackCount",
        attacksNeeded: 6,
        duration: 7
    },
    super_roku: {
        name: "Saiyan Synergy",
        desc: "+20% DMG if unit is placed within range of a 'Saiyan' unit.",
        trigger: "conditional_range",
        conditionTag: "Saiyan",
        dmgBuff: 20
    },
    super_roku_acc: {
        name: "Stunning Blows",
        desc: "5% Chance to stun enemies on attack",
        trigger: "onAttack",
        stunChance: 5
    },
    bio_android_acc: {
        name: "Executioner",
        desc: "Deal +10% DMG to enemies under 50% HP",
        trigger: "conditional_enemy_hp",
        hpThreshold: 50,
        dmgBuff: 10
    },
    biju_acc: {
        name: "Tailed Beast Cloak",
        desc: "When a meter bar is used, Increase damage by 70% for 10 seconds (Doesn't stack)",
        trigger: "onMeterUse",
        dmgBuff: 70,
        duration: 10
    },
    great_mage: {
        name: "Elemental Mastery",
        desc: "+20% Damage for 10 seconds when this unit hits a type advantage attack (Cant Stack)",
        trigger: "onTypeAdvantageHit",
        dmgBuff: 20,
        duration: 10
    },
    great_mage_acc: {
        name: "Supreme Wizard",
        desc: "If this unit takes down a enemy it has type advantage on gain +40% damage and -20% Cooldown for 10 seconds (Not Stackable, 10 second cooldown)",
        trigger: "onTypeAdvantageKill",
        dmgBuff: 40,
        spaReduction: 20,
        duration: 10,
        cooldown: 10
    },
    sorcerer_hunter_acc: {
        name: "Heavenly Restriction",
        desc: "Units can no longer do Critical Hits with this equipped, instead they will be given 60% damage.",
        trigger: "passive",
        disableCrit: true,
        dmgBuff: 60
    },
    strongest_sorcerer: {
        name: "Limitless",
        desc: "When this unit procs a crowd control effect deal an instance of damage (30% of the unit damage stat, once per enemy)",
        trigger: "onCCProc",
        dmgInstanceScaling: 30 // 30% of unit dmg
    },
    strongest_sorcerer_acc: {
        name: "Infinite Void",
        desc: "When Timestop is applied onto an enemy, increase damage by 1% for every enemy timestopped (CAP OF 50%).",
        trigger: "onTimestop",
        dmgBuffPerEnemy: 1,
        maxDmgBuff: 50
    },
    monarch: {
        name: "Arise",
        desc: "When this unit spawns a summon or sub-tower, increase damage by +10%. (Cap of 40%)",
        trigger: "onSummon",
        dmgBuffPerSummon: 10,
        maxDmgBuff: 40,
        duration: Infinity
    },
    monarch_acc: {
        name: "Shadow Army",
        desc: "When this unit summons a summon or sub-tower, Increase damage by +10% (CAP OF 60%) until the summon or sub-tower dies",
        trigger: "onSummonAlive",
        dmgBuffPerAliveSummon: 10,
        maxDmgBuff: 60
    },
    berserk_shinigami_acc: {
        name: "Berserk Shinigami's Wrath",
        desc: "Every 5 hits gives a buff to next attack (Deals extra 20% True Damage, ignoring all resistances).",
        trigger: "onAttackCount",
        attacksNeeded: 5,
        duration: 0, // Buffs next attack only
        trueDmgBuff: 20
    },
    hokage_acc: {
        name: "Hokage's Will",
        desc: "Every 5 Attacks, Increase DoT damage by 20% for 10 seconds.",
        trigger: "onAttackCount",
        attacksNeeded: 5,
        duration: 10,
        dotBuff: 20
    },
    fused_set: {
        name: "Fused Potential",
        desc: "When the unit inflicts DoT, buff Crit DMG by 50% for 15 seconds. (7.5s Cooldown)",
        duration: 15,
        cooldown: 7.5,
        cDmgBuff: 50
    },
    fused_earrings_acc: {
        name: "Fused Earrings",
        desc: "If unit can synchro clash/fuse, in non synchro form gain 50% dmg, in synchro form gain 25% range and 15% dmg buff.",
        trigger: "passive",
        clashDmgBuff: 50,
        syncroDmgBuff: 15,
        syncroRangeBuff: 25
    },
};

// ─── TAG PERKS ──────────────────────────────────────────────
// If a unit has a matching tag, it gets these extra bonuses from the set.
// Each set can have multiple tag perks.

const TAG_PERKS = {
    // === RAID / SECRET TAG PERKS ===
    reaper_set: [
        { tag: "Peroxide", bonus: { dmg: 10, buffPotency: 5, cDmg: 8.5 } },
        { tag: "Reaper", bonus: { hyperArmor: 20, armorPen: 12.5, range: 15 } },
        { tag: "Rage", bonus: { cDmg: 25, cRate: 10, range: 10 } },
        { tag: "Hollow", bonus: { dmg: 12.5, spa: 7.5, range: 15 } },
    ],
    shadow_reaper: [
        { tag: "Peroxide", bonus: { armorPen: 10, hyperArmor: 15, spa: 10 } },
        { tag: "Reaper", bonus: { elementalAll: 30, spa: 12.5, dmg: -5 } },
        { tag: "Rage", bonus: { elementalAll: 15, spa: 8.5, buffPotency: 10 } },
        { tag: "Hollow", bonus: { cRate: 20, cDmg: 12.5, hyperArmor: 5 } },
    ],
    rebellious: [
        { tag: "Ninjaverse", bonus: { dmg: 0, spa: 0, range: 0, cRate: 15, cDmg: 20, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 20 } },
        { tag: "Sage", bonus: { dmg: 0, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 15, hyperArmor: 20 } },
    ],
    rebellious_acc: [
        { tag: "Bloodline", bonus: { dmg: 15, spa: 0, range: 20, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 15 } },
    ],
    warlord: [
        { tag: "Piece", bonus: { dmg: 20, spa: 5, range: 0, cRate: 10, cDmg: 0, dot: 20, bossDmg: 0, trueDmg: 0, elementalAll: 0 } },
        { tag: "Villain", bonus: { dmg: 10, spa: 0, range: 15, cRate: 0, cDmg: 20, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 0, hyperArmor: 0 } },
    ],
    monarch: [
        { tag: "Leveling", bonus: { dmg: 20, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 20, hyperArmor: 15 } },
        { tag: "King", bonus: { dmg: 15, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: 20, bossDmg: 0, trueDmg: 0 } },
    ],
    monarch_acc: [
        { tag: "Leveling", bonus: { dmg: 20, spa: 0, range: 0, cRate: 5, cDmg: 15, dot: 0, bossDmg: 0, trueDmg: 0, elementalAll: 20 } },
        { tag: "King", bonus: { dmg: 15, spa: 0, range: 0, cRate: 0, cDmg: 0, dot: -12.5, bossDmg: 0, trueDmg: 0, elementalAll: 15 } },
    ],
    fused_set: [
        { tag: "Fusion", bonus: { dmg: 10, range: 20, armorDmg: 20, hyperArmor: 20 } },
        { tag: "Super Warrior", bonus: { dmg: 20, spa: 10, cRate: 10 } },
    ],
    fused_earrings_acc: [
        { tag: "Hero", bonus: { dmg: 10, dot: 20 } },
        { tag: "Fusion", bonus: { dmg: 10, bossDmg: 25 } },
    ],
};

// ─── PASSIVE MATH ───────────────────────────────────────────

function calcCritPassiveUptime(critRate, spa, duration, cooldown) {
    const totalCycle = duration + cooldown;
    const attacksDuringCooldown = Math.floor(cooldown / spa);
    const probCritInWindow = 1 - Math.pow(1 - critRate, attacksDuringCooldown);
    const uptime = (duration / totalCycle) * probCritInWindow;

    return {
        uptime: Math.round(uptime * 100 * 100) / 100,
        probCritInWindow: Math.round(probCritInWindow * 100 * 100) / 100,
        attacksDuringCooldown
    };
}

function applyPassiveBonus(passiveId, unitStats, originalUnit = null) {
    const passive = PASSIVES[passiveId];
    if (!passive) return { effectiveStats: unitStats, uptimeInfo: null };

    let effectiveStats = { ...unitStats };

    if (passiveId === "fused_earrings_acc") {
        const u = originalUnit || {};
        const unitId = u.id || "";
        const unitIdLower = unitId.toLowerCase();
        const unitNameLower = (u.name || "").toLowerCase();

        // Detect Synchro forms via Display Name or unit ID as requested (must contain "syncro" or be in the fused list)
        const isSyncro = unitNameLower.includes('(syncro)') || ['unparalleled_armor', 'majestic_armor', 'sjw'].includes(unitIdLower);
        
        // Detect Clash/Fusion capability explicitly for the requested units (Nutaru, Sasuke, etc.)
        const hasClash = ['nutaru_beast', 'ancient_shinob', 'sasuke_great_war'].includes(unitIdLower);

        if (isSyncro) {
            effectiveStats.dmg = Math.floor(effectiveStats.dmg * (1 + (passive.syncroDmgBuff || 15) / 100));
            effectiveStats.range = Math.floor(effectiveStats.range * (1 + (passive.syncroRangeBuff || 25) / 100));
        } else if (hasClash) {
            effectiveStats.dmg = Math.floor(effectiveStats.dmg * (1 + (passive.clashDmgBuff || 50) / 100));
        }
        return { 
            effectiveStats, 
            uptimeInfo: { 
                note: isSyncro ? `Syncro Form (+${passive.syncroDmgBuff}% DMG, +${passive.syncroRangeBuff}% RNG)` : 
                      (hasClash ? `Clash Potential (+${passive.clashDmgBuff}% DMG)` : "No specialized bonus applied") 
            } 
        };
    }

    if (passive.trigger === "passive") {
        if (passive.disableCrit) {
            effectiveStats.critRate = 0;
            effectiveStats.critDmg = 0;
        }
        if (passive.dmgBuff) {
            effectiveStats.dmg = Math.floor(effectiveStats.dmg * (1 + passive.dmgBuff / 100));
        }
        return { effectiveStats, uptimeInfo: { note: "Always active" } };
    }

    if (passive.trigger === "onCrit") {
        const critDecimal = (unitStats.critRate || 0) / 100;
        const uptimeInfo = calcCritPassiveUptime(critDecimal, unitStats.spa, passive.duration, passive.cooldown);
        const buffMultiplier = 1 + (passive.dmgBuff / 100) * (uptimeInfo.uptime / 100);
        effectiveStats.dmg = Math.floor(unitStats.dmg * buffMultiplier);
        return { effectiveStats, uptimeInfo };
    }

    // Handles the active toggled charge/meter bar passive
    if (passive.trigger === "onMeterUse") {
        // Typical charge build time is 5s, duration is 10s. Max uptime 66.67%
        const uptime = passive.duration / (5 + passive.duration);
        const buffMultiplier = 1 + (passive.dmgBuff / 100) * uptime;
        effectiveStats.dmg = Math.floor(unitStats.dmg * buffMultiplier);
        return {
            effectiveStats,
            uptimeInfo: {
                uptime: Math.round(uptime * 100 * 100) / 100,
                note: `Uptime-averaged active state (+${passive.dmgBuff}% DMG)`
            }
        };
    }

    if (passive.trigger === "onAttackCount") {
        const timeToProc = passive.attacksNeeded * unitStats.spa;
        const totalAttacksPerCycle = passive.attacksNeeded + (passive.duration === 0 ? 1 : 0);
        const totalCycle = passive.duration === 0
            ? totalAttacksPerCycle * unitStats.spa
            : timeToProc + passive.duration;

        const uptime = passive.duration === 0
            ? 1 / totalAttacksPerCycle
            : passive.duration / totalCycle;

        if (passive.trueDmgBuff) {
            effectiveStats.trueDmg = (unitStats.trueDmg || 0) + (passive.trueDmgBuff * uptime);
        }
        if (passive.dotBuff) {
            effectiveStats.dot = (unitStats.dot || 0) + (passive.dotBuff * uptime);
        }
        if (passiveId === "sun_god_acc") {
            const buffMultiplier = 1 + (unitStats.range / 100) * uptime;
            effectiveStats.dmg = Math.floor(unitStats.dmg * buffMultiplier);
        }
        if (passiveId === "reanimated_ninja_acc") {
            effectiveStats.dot = (unitStats.dot || 0) + (unitStats.range * uptime);
        }

        const noteMsg = passive.duration === 0
            ? `Buff active for 1 attack every ${Math.round(totalCycle * 10) / 10}s`
            : `Buff active ${passive.duration}s every ${Math.round(totalCycle * 10) / 10}s`;

        return {
            effectiveStats,
            uptimeInfo: {
                uptime: Math.round(uptime * 100 * 100) / 100,
                timeToProc: Math.round(timeToProc * 10) / 10,
                note: noteMsg
            }
        };
    }

    return { effectiveStats, uptimeInfo: null };
}

function getMatchingTagPerks(setId, unitTags) {
    const perks = TAG_PERKS[setId];
    if (!perks) return [];
    return perks.filter(perk => unitTags.includes(perk.tag));
}

// Attach variables to window for global loading in index.html
window.PASSIVES = PASSIVES;
window.TAG_PERKS = TAG_PERKS;
window.applyPassiveBonus = applyPassiveBonus;
window.getMatchingTagPerks = getMatchingTagPerks;
