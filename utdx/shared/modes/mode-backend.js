// ============================================================================
// MODE-BACKEND.JS - Centralized Math & Context Logic for Unit Modes
// ============================================================================

window.applyModeContext = function(unit, effectiveStats) {
    if (!unit.modes) return;

    let modeData = null;
    if (Array.isArray(unit.modes)) {
        const state = (window.unitModesState && window.unitModesState[unit.id]);
        const isMulti = !!unit.allowMultipleModes;

        if (isMulti) {
            // Multi-mode units (like Jinoo) handle their logic in customSummons loop,
            // so we don't pick a single 'default' mode here.
            modeData = null;
        } else {
            const modeIdx = (state !== undefined) ? state : 0;
            modeData = unit.modes[modeIdx];
        }
    }

    if (modeData) {
        // Apply mode stats to the effective stats with normalization
        const normalizedStats = {};
        let modePassiveObj = null;

        for (const key in modeData) {
            // Skip display-only fields
            if (['name', 'img', 'desc', 'Mode'].includes(key)) continue;

            let targetKey = key.toLowerCase();
            // Map specific keys to match engine expectations
            if (targetKey === 'dotduration') targetKey = 'dotDuration';
            else if (targetKey === 'spacap' || targetKey === 'spa cap') targetKey = 'spaCap';
            else if (targetKey === 'bossdmg') targetKey = 'bossDmg';
            else if (targetKey === 'bossdot') targetKey = 'bossDot';
            else if (targetKey === 'dotbuff') targetKey = 'dotBuff';
            else if (targetKey === 'requiresdot') targetKey = 'requiresDot';
            else if (targetKey === 'dottype') targetKey = 'dotType';

            // Attribute passive stats to the mode's name in the passives array!
            if (['passivedmg', 'passivespa', 'passivecrit', 'passivecdmg', 'truedmg'].includes(targetKey)) {
                if (!modePassiveObj) modePassiveObj = { name: modeData.name || "Mode Bonus" };
                if (targetKey === 'passivedmg') modePassiveObj.passiveDmg = modeData[key];
                if (targetKey === 'passivespa') modePassiveObj.passiveSpa = modeData[key];
                if (targetKey === 'passivecrit') modePassiveObj.passiveCrit = modeData[key];
                if (targetKey === 'passivecdmg') modePassiveObj.passiveCdmg = modeData[key];
                if (targetKey === 'truedmg') modePassiveObj.trueDmg = modeData[key];
                continue;
            }

            if (targetKey === 'passives') {
                if (!effectiveStats.passives) effectiveStats.passives = [];
                else effectiveStats.passives = [...effectiveStats.passives];

                modeData[key].forEach(p => {
                    const existing = effectiveStats.passives.find(ep => ep.name === p.name);
                    if (existing) {
                        const idx = effectiveStats.passives.indexOf(existing);
                        effectiveStats.passives[idx] = { ...existing, ...p };
                    } else {
                        effectiveStats.passives.push(p);
                    }
                });
                continue;
            }

            normalizedStats[targetKey] = modeData[key];
        }
        Object.assign(effectiveStats, normalizedStats);

        if (modePassiveObj) {
            if (!effectiveStats.passives) effectiveStats.passives = [];
            // Shallow copy so we don't permanently mutate the base unit definition
            else effectiveStats.passives = [...effectiveStats.passives];

            effectiveStats.passives.push(modePassiveObj);
        }
    }
};
