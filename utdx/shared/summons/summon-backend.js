// ============================================================================
// SUMMON-BACKEND.JS - Centralized Math & Logic for Unit Custom Summons
// ============================================================================

window.calcCustomSummons = function(uStats, upLevel, eLevel, finalDmg, hostFinalSpa) {
    if (!uStats.customSummons || !Array.isArray(uStats.customSummons)) {
        return { summonData: null, summonDpsTotal: 0 };
    }

    let summonData = {
        baseDmg: finalDmg,
        summons: []
    };
    let summonDpsTotal = 0;

    const state = (typeof window !== 'undefined' && window.unitModesState) ? window.unitModesState[uStats.id] : undefined;
    const isMulti = !!uStats.allowMultipleModes;
    const activeModes = Array.isArray(state) ? state : (state !== undefined ? [state] : (isMulti ? [] : [0]));

    uStats.customSummons.forEach((s, sIdx) => {
        if (upLevel >= s.reqUp) {
            // Check if this summon is enabled by the current mode
            let isEnabled = true;
            if (uStats.id === 'the_strongest_in_history') {
                isEnabled = false;
                if (activeModes.includes(1) && sIdx === 0) isEnabled = true;
                if (activeModes.includes(2) && sIdx === 1) isEnabled = true;
            } else if (uStats.id === 'jinoo_shadow_monarch') {
                isEnabled = activeModes.includes(sIdx);
                // System Level requirements
                const sysLvl = (typeof window !== 'undefined' && window.unitSystemLevels && window.unitSystemLevels[uStats.id] !== undefined)
                    ? window.unitSystemLevels[uStats.id]
                    : (uStats.systemLevel ? (uStats.systemLevel.default || 100) : 100);

                if (sIdx === 1 && sysLvl < 40) isEnabled = false;
                if (sIdx === 2 && sysLvl < 60) isEnabled = false;
                if (sIdx === 3 && sysLvl < 80) isEnabled = false;
                if (sIdx === 4 && sysLvl < 100) isEnabled = false;
            }

            if (!isEnabled) return;
            let sDmgMult = s.dmgMult;
            if (eLevel >= 6 && s.e6DmgMult) sDmgMult = s.e6DmgMult;

            // Requirement: Summons with HP contribute to DPS (0.5 hp = 50% dmg)
            if (uStats.id === 'jinoo_shadow_monarch' && s.ui && s.ui.hp) {
                sDmgMult += (s.ui.hp / 100);
            }

            let sAvgMult = s.noCrit ? 1.0 : (s.avgMult || 1.0);
            if (!s.noCrit && eLevel >= 6 && s.e6AvgMult) sAvgMult = s.e6AvgMult;

            let sHitDmg = finalDmg * sDmgMult;
            let sAvgDmg = sHitDmg * sAvgMult;
            let effectiveSpa = s.spa;
            if (s.hostSpaLinked && hostFinalSpa) {
                effectiveSpa = hostFinalSpa * (s.hostAttackRatio || 1);
                if (uStats.id === 'gluttonous_warlord') {
                    effectiveSpa = Math.max(5.0, effectiveSpa);
                }
            }
            let sDps = (sAvgDmg / effectiveSpa) * (s.count || 1);

            if (!s.excludeFromDps) {
                summonDpsTotal += sDps;
            }
            summonData.summons.push({
                name: s.name,
                hitDmg: sHitDmg,
                avgDmg: sAvgDmg,
                avgMult: sAvgMult,
                spa: effectiveSpa,
                dps: sDps,
                count: s.count || 1,
                isNoCrit: !!s.noCrit,
                desc: s.desc,
                color: s.color || "#ffffff"
            });
        }
    });

    return { summonData, summonDpsTotal };
};
