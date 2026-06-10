import os
import re
import subprocess
import sys
import json
import itertools
import time
import threading
import shutil
import tempfile
import webview

# Force terminal to accept UTF-8 so emojis don't crash Windows console
if sys.stdout.encoding.lower() != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

REQUIRED_FILES = [
    "shared/buffers/elementalSystem.js",
    "shared/buffers/leaderBuffs.js",
    "shared/buffers/unitBuffs.js",
    "shared/relics/relicStats.js",
    "shared/relics/relicsData.js",
    "shared/relics/relicPassives.js",
    "shared/traits/traitsData.js",
    "backend/data/buffs.js",
    "backend/data/config.js",
    "shared/relics/relics.js",
    "shared/traits/traits.js",
    "backend/state.js",
    "backend/constants.js",
    "backend/utils.js",
    "backend/math/lookups.js",
    "backend/math/core-math.js",
    "shared/abilities/ability-backend.js",
    "shared/modes/mode-backend.js",
    "shared/summons/summon-backend.js",
    "shared/passives/passive-backend.js",
    "shared/relics/relic-backend.js",
    "shared/traits/trait-backend.js",
    "backend/math/context-builder.js",
    "backend/math/calculations.js",
    "backend/math/build-runner.js",
]

GENERATOR_SCRIPT = """
const fs = require('fs');
const os = require('os');
const { Worker, isMainThread, parentPort } = require('worker_threads');

process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});

if (isMainThread) {
    // ==========================================
    // MAIN THREAD: Orchestration & Job Queue
    // ==========================================
    const jobFile = process.argv[2];
    const jobData = JSON.parse(fs.readFileSync(jobFile, 'utf-8'));
    const { combinations, targetUnits, threads, outDir, selectedHeads, selectedSets } = jobData;
    const targetSet = new Set(targetUnits);

    // Calculate exact total units to process for accurate progress bar
    const tasksForCounting = [];
    unitDatabase.forEach(u => {
        if (targetUnits.length === 0 || targetSet.has(u.id)) {
            tasksForCounting.push(u.name);
        }
    });

    let activeWorkers = 0;
    let jobIndex = 0;
    
    const totalJobs = combinations.length;
    const unitsPerJob = tasksForCounting.length;
    const totalTasks = totalJobs * unitsPerJob;
    let completedTasks = 0;

    // Strictly limit workers to prevent CPU thrashing (deadlocks)
    const numWorkers = Math.min(threads || os.cpus().length, totalJobs);

    function dispatchJob(worker) {
        if (jobIndex < totalJobs) {
            const combo = combinations[jobIndex++];
            worker.postMessage({ type: 'job', combo, targetUnits, outDir, selectedHeads, selectedSets });
        } else {
            worker.postMessage({ type: 'exit' });
        }
    }

    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(__filename);
        activeWorkers++;

        worker.on('message', (msg) => {
            if (msg.type === 'unit_done') {
                completedTasks++;
                const pct = (completedTasks / totalTasks) * 100;
                // Granular update per unit
                console.log(`__STATUS__:PROGRESS:${pct}:[${msg.outName}] Calcs done for ${msg.unitName}`);
            } else if (msg.type === 'done') {
                dispatchJob(worker);
            } else if (msg.type === 'log') {
                console.log(`__STATUS__:LOG:${msg.outName}:${msg.data}`);
            }
        });

        worker.on('error', err => console.error('Worker Error:', err));

        worker.on('exit', () => {
            activeWorkers--;
            if (activeWorkers === 0) {
                console.log('__STATUS__:ALL_DONE');
                process.exit(0);
            }
        });

        dispatchJob(worker);
    }
} else {
    // ==========================================
    // WORKER THREAD: High Speed Math Evaluation
    // ==========================================
    
    // --- NODE.JS POLYFILLS ---
    global.window = global;
    global.unitModesState = { 'joyful_captain': 2 }; // Fix for units with Modes. Evaluate Joyful in Joy Boy mode so SPA builds generate.
    global.hotbarState = { slots: [null, null, null, null, null, null], fernTargets: [] };
    global.unitELevels = {}; 
    global.btoa = function(str) { return Buffer.from(str, 'binary').toString('base64'); };
    global.atob = function(str) { return Buffer.from(str, 'base64').toString('binary'); };

    const CONFIGS = [ { head: true, subs: true } ];
    const PRECALC_TEMPLATES = {};

    // Add unit IDs here to re-enable range combos + range stat points for specific units
    // e.g. when support units are added: new Set(['support_unit_id', 'another_support'])

    function getDbName(combo) {
        let parts = [];
        if (combo[0] === '1') parts.push('miku');
        if (combo[1] === '1') parts.push('enlightenedgod');
        if (combo[2] === '1') parts.push('bijuu');
        if (combo[3] === '1') parts.push('amage');
        if (combo[4] === '1') parts.push('ksailor');
        
        if (combo[5] === 'hill') parts.push('magehill');
        else if (combo[5] === 'ground') parts.push('mageground');

        return parts.length === 0 ? "db_base.js" : "db_" + parts.join("_") + ".js";
    }

    function generateTemplates(includeSubs, allowedHeads, allowDot, allowedSets) {
        const templates = [];
        const cands = allowDot
            ? ['dmg', 'spa', 'cm', 'cf', 'dot']
            : ['dmg', 'spa', 'cm', 'cf'];
            
        // For S.H. Spirit head, remove crit subs since it disables crits
        const noCritCands = cands.filter(c => c !== 'cf' && c !== 'cm');

        let strategies = [];
        if (!includeSubs) {
            strategies.push({ p: null, s: null, ratio: { p: 0, s: 0 } });
        } else {
            cands.forEach(c => strategies.push({ p: c, s: c, ratio: { p: 6, s: 0 } }));
            const pairs = [['dmg', 'cf'], ['dmg', 'spa'], ['dmg', 'cm'], ['cf', 'cm'], ['dot', 'dmg'], ['dot', 'spa'], ['dot', 'cf']];
            const ratios = [{ p: 6, s: 0 }, { p: 5, s: 1 }, { p: 4, s: 2 }, { p: 3, s: 3 }, { p: 2, s: 4 }, { p: 1, s: 5 }, { p: 0, s: 6 }];
            pairs.forEach(pair => {
                const [c1, c2] = pair;
                if (cands.includes(c1) && cands.includes(c2)) ratios.forEach(r => strategies.push({ p: c1, s: c2, ratio: r }));
            });
        }

        // Separate strategies for no-crit heads (S.H. Spirit)
        let noCritStrategies = [];
        if (includeSubs) {
            noCritCands.forEach(c => noCritStrategies.push({ p: c, s: c, ratio: { p: 6, s: 0 } }));
            const noCritPairs = [['dmg', 'spa'], ['dot', 'dmg'], ['dot', 'spa']];
            const ratios = [{ p: 6, s: 0 }, { p: 5, s: 1 }, { p: 4, s: 2 }, { p: 3, s: 3 }, { p: 2, s: 4 }, { p: 1, s: 5 }, { p: 0, s: 6 }];
            noCritPairs.forEach(pair => {
                const [c1, c2] = pair;
                if (noCritCands.includes(c1) && noCritCands.includes(c2)) ratios.forEach(r => noCritStrategies.push({ p: c1, s: c2, ratio: r }));
            });
        } else {
            noCritStrategies.push({ p: null, s: null, ratio: { p: 0, s: 0 } });
        }

        const applyContextualStats = (b, pieceName, mainStat, pStat, sStat, ratio, cands) => {
            if (!pStat) return { pStat: null, pVal: 0, sStat: null, sVal: 0 };
            let pWeight = ratio.p; let sWeight = ratio.s; 
            
            if (pStat === mainStat) { sWeight = Math.min(6, sWeight + pWeight); pWeight = 0; } 
            else if (sStat === mainStat) { pWeight = Math.min(6, pWeight + sWeight); sWeight = 0; }
            if (pStat === mainStat && sStat === mainStat) {
                const fallback = cands.find(c => c !== mainStat);
                if (fallback) {
                    pStat = fallback;
                    pWeight = 6;
                    sWeight = 0;
                } else {
                    pWeight = 0; sWeight = 0;
                }
            }

            let pVal = 0, sVal = 0;
            if (pWeight > 0) { pVal = PERFECT_SUBS[pStat] * pWeight; b[pStat] = (b[pStat] || 0) + pVal; }
            if (sWeight > 0) { sVal = PERFECT_SUBS[sStat] * sWeight; b[sStat] = (b[sStat] || 0) + sVal; }

            // Fillers will be added dynamically per-unit later to prevent crit overcapping
            return { pStat, pVal, sStat, sVal };
        };

        const formatAssignment = (res) => {
            let arr = [];
            if (res.pVal > 0) arr.push({ type: res.pStat, val: res.pVal });
            if (res.sVal > 0) arr.push({ type: res.sStat, val: res.sVal });
            return arr;
        };

        const allowedCombos = new Set(['dmg_dmg', 'dmg_cf', 'dmg_spa', 'cm_dmg', 'cm_cf', 'cm_spa']);
        if (allowDot) {
            allowedCombos.add('dot_dmg');
            allowedCombos.add('dot_spa');
            allowedCombos.add('dot_cf');
        }

        const baseBuilds = globalBuilds.filter(b => {
            if (!allowedCombos.has(b.bodyType + "_" + b.legType)) return false;
            if (allowedSets && allowedSets.length > 0) {
                const splitIdx = b.name.indexOf('(');
                const setNameStr = splitIdx > 0 ? b.name.substring(0, splitIdx).trim() : b.name;
                if (!allowedSets.includes(setNameStr)) return false;
            }
            return true;
        });

        baseBuilds.forEach(build => {
            allowedHeads.forEach(headType => {
                if(!allowDot && headType === 'ninja') return; 

                const activeStrategies = (headType === 'sorcerer_hunter_spirit') ? noCritStrategies : strategies;
                const activeCands = (headType === 'sorcerer_hunter_spirit') ? noCritCands : cands;

                activeStrategies.forEach(strat => {
                    let totalStats = { ...build };
                    let currentAssignments = {};

                    if (headType !== 'none') currentAssignments.head = formatAssignment(applyContextualStats(totalStats, 'head', null, strat.p, strat.s, strat.ratio, activeCands));
                    currentAssignments.body = formatAssignment(applyContextualStats(totalStats, 'body', build.bodyType, strat.p, strat.s, strat.ratio, activeCands));
                    currentAssignments.legs = formatAssignment(applyContextualStats(totalStats, 'legs', build.legType, strat.p, strat.s, strat.ratio, activeCands));
                    currentAssignments.selectedHead = headType;

                    const splitIdx = build.name.indexOf('(');
                    let setNameStr = splitIdx > 0 ? build.name.substring(0, splitIdx).trim() : build.name;
                    if (setNameStr === "Rebellious Shinobi") setNameStr = "Rebellious Set";
                    if (setNameStr === "Reanimated Ninja") setNameStr = "Reanimated Set";
                    const cacheKeyStr = build.name + "_" + headType;

                    templates.push({ 
                        stats: totalStats, 
                        meta: { 
                            buildName: build.name, setName: setNameStr,
                            bodyType: build.bodyType, legType: build.legType, 
                            headUsed: headType, assignments: currentAssignments,
                            activeCands: activeCands,
                            key: cacheKeyStr 
                        } 
                    });
                });
            });
        });
        return templates;
    }

    function fastCalculateUnitBuilds(unit, cfg, traitsForCalc, isAbility, existingHeads, jobHeads, selectedSets) {
        const upgradeLevel = (unit.upgrades && unit.upgrades.length > 0) ? unit.upgrades.length - 1 : 0;
        const { effectiveStats, isKiritoVR, suffix } = buildCalculationContext(unit, 'ruler', { isAbility, upgradeLevel });
        const hasPassiveDoT = effectiveStats.passives && effectiveStats.passives.some(p => p.dot && p.dot > 0);
        const hasNativeDoT = (effectiveStats.dot > 0) || (effectiveStats.burnMultiplier > 0) || isKiritoVR || hasPassiveDoT;

        let allowedHeads = cfg.head ? (jobHeads && jobHeads.length > 0 ? jobHeads : ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'fused_earrings']) : ['none'];
        
        // Always include 'none' (baseline) when head calculation is enabled
        if (cfg.head && !allowedHeads.includes('none')) {
            allowedHeads = ['none', ...allowedHeads];
        }

        if (existingHeads && existingHeads.length > 0) {
            allowedHeads = allowedHeads.filter(h => h === 'none' || !existingHeads.includes(h));
        }
        // Rebellious set perk (CC) logic is now handled in math.js, so we don't need to filter the head itself by CC anymore.
        // All units can equip any head now.
        const traitGroups = {};

        const maxPts = ((unit.level || 1) - 1) + 30;

        traitsForCalc.forEach(trait => {
            if (trait.id === 'none') return;
            const { effectiveStats, context } = buildCalculationContext(unit, trait, { isAbility, mode: 'fixed' });
            const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
            const isDotPossible = hasNativeDoT || traitAddsDot;
            
            const templatesKey = `${cfg.subs}-${isDotPossible}-${cfg.head}-${(selectedSets||[]).join(',')}-${allowedHeads.join(',')}`;
            let templates = PRECALC_TEMPLATES[templatesKey];
            if(!templates) {
                templates = generateTemplates(cfg.subs, allowedHeads, isDotPossible, selectedSets);
                PRECALC_TEMPLATES[templatesKey] = templates;
            }
            
            // Filter out 'cf' candidates for units that shouldn't get them (Kirito, Gojo)
            const excludeRelicCrit = (isUnit(unit.id, 'kirito') || isUnit(unit.id, 'the_strongest_of_today') || isUnit(unit.id, 'pirate_king') || (isUnit(unit.id, 'marine_hero') && isAbility));
            let unitTemplates = templates;
            if (excludeRelicCrit) {
                unitTemplates = templates.filter(t => {
                    const h = t.meta.assignments.head || [];
                    const b = t.meta.assignments.body || [];
                    const l = t.meta.assignments.legs || [];
                    return !h.some(a => a.type === 'cf') && !b.some(a => a.type === 'cf') && !l.some(a => a.type === 'cf');
                });
            }

            const tmplLen = unitTemplates.length;
            if (!traitGroups[trait.name]) traitGroups[trait.name] = [];

            const pushBest = (map, prio) => {
                for (const best of map.values()) {
                    traitGroups[trait.name].push({
                        setName: best.meta.setName, buildName: best.meta.buildName,
                        traitName: trait.name, dps: best.res.total, dmgVal: best.res.dmgVal,
                        bossDps: best.res.bossTotal,
                        spa: best.res.spa, range: best.res.range, prio,
                        mainStats: { body: best.meta.bodyType, legs: best.meta.legType },
                        subStats: best.meta.assignments, headUsed: best.meta.headUsed,
                        isCustom: trait.isCustom
                    });
                }
            };

            try {
                // Pass 1: dmg points — track dps-best AND raw_dmg-best simultaneously (same context)
                context.dmgPoints = maxPts; context.spaPoints = 0; context.rangePoints = 0;
                effectiveStats.context = context;
                const bestDps = new Map(), bestRaw = new Map();
                for (let i = 0; i < tmplLen; i++) {
                    const t = unitTemplates[i]; context.headPiece = t.meta.headUsed;
                    let b = { ...t.stats };
                    
                    // Add fillers dynamically
                    ['head', 'body', 'legs'].forEach(piece => {
                        if (piece === 'head' && t.meta.headUsed === 'none') return;
                        let mainStat = piece === 'body' ? t.meta.bodyType : (piece === 'legs' ? t.meta.legType : null);
                        let pStat = null, sStat = null, pWeight = 0, sWeight = 0;
                        let assignment = t.meta.assignments[piece];
                        if (assignment && assignment.length > 0) {
                            pStat = assignment[0].type; pWeight = assignment[0].val / PERFECT_SUBS[pStat];
                            if (assignment.length > 1) { sStat = assignment[1].type; sWeight = assignment[1].val / PERFECT_SUBS[sStat]; }
                        }
                        
                        let activeFillers = [...t.meta.activeCands];
                        if (activeFillers.includes('cf') || activeFillers.includes('cm')) {
                            const checkRes = calculateDPS(effectiveStats, b, context);
                            if (checkRes.critData) {
                                const currentRaw = checkRes.critData.rawRate;
                                if (currentRaw >= 99.9 || checkRes.critData.rate === 0) {
                                    activeFillers = activeFillers.filter(
                                        c =>
                                            (c === 'cf' && currentRaw < 100) ||
                                            (c === 'cm' && checkRes.critData.rate > 0) ||
                                            (c !== 'cf' && c !== 'cm')
                                    );
                                }
                            }
                        }
                        
                        activeFillers.forEach(cand => {
                            if (cand === mainStat || (cand === pStat && pWeight > 0) || (cand === sStat && sWeight > 0)) return;
                            b[cand] = (b[cand] || 0) + PERFECT_SUBS[cand];
                        });
                    });

                    const res = calculateDPS(effectiveStats, b, context);
                    if (isNaN(res.total)) continue;
                    const currentScore = Math.max(res.total || 0, res.bossTotal || 0);
                    const key = t.meta.key;
                    const cd = bestDps.get(key);
                    const bestKnownScore = cd ? Math.max(cd.res.total || 0, cd.res.bossTotal || 0) : -1;
                    if (!cd || currentScore > bestKnownScore) bestDps.set(key, { res, meta: t.meta });
                    const cr = bestRaw.get(key);
                    if (!cr || res.dmgVal > cr.res.dmgVal || (res.dmgVal === cr.res.dmgVal && res.total > cr.res.total)) bestRaw.set(key, { res, meta: t.meta });
                }
                pushBest(bestDps, 'dmg');
                pushBest(bestRaw, 'raw_dmg');
            } catch (err) { console.error(`Error calculating dmg points for ${unit.id}:`, err); }

            try {
                // Pass 2: spa points
                context.dmgPoints = 0; context.spaPoints = maxPts; context.rangePoints = 0;
                effectiveStats.context = context;
                const bestSpa = new Map();
                for (let i = 0; i < tmplLen; i++) {
                    const t = unitTemplates[i]; context.headPiece = t.meta.headUsed;
                    let b = { ...t.stats };
                    
                    ['head', 'body', 'legs'].forEach(piece => {
                        if (piece === 'head' && t.meta.headUsed === 'none') return;
                        let mainStat = piece === 'body' ? t.meta.bodyType : (piece === 'legs' ? t.meta.legType : null);
                        let pStat = null, sStat = null, pWeight = 0, sWeight = 0;
                        let assignment = t.meta.assignments[piece];
                        if (assignment && assignment.length > 0) {
                            pStat = assignment[0].type; pWeight = assignment[0].val / PERFECT_SUBS[pStat];
                            if (assignment.length > 1) { sStat = assignment[1].type; sWeight = assignment[1].val / PERFECT_SUBS[sStat]; }
                        }
                        
                        let activeFillers = [...t.meta.activeCands];
                        if (activeFillers.includes('cf') || activeFillers.includes('cm')) {
                            const checkRes = calculateDPS(effectiveStats, b, context);
                            if (checkRes.critData) {
                                const currentRaw = checkRes.critData.rawRate;
                                if (currentRaw >= 99.9 || checkRes.critData.rate === 0) {
                                    activeFillers = activeFillers.filter(
                                        c =>
                                            (c === 'cf' && currentRaw < 100) ||
                                            (c === 'cm' && checkRes.critData.rate > 0) ||
                                            (c !== 'cf' && c !== 'cm')
                                    );
                                }
                            }
                        }
                        
                        activeFillers.forEach(cand => {
                            if (cand === mainStat || (cand === pStat && pWeight > 0) || (cand === sStat && sWeight > 0)) return;
                            b[cand] = (b[cand] || 0) + PERFECT_SUBS[cand];
                        });
                    });

                    const res = calculateDPS(effectiveStats, b, context);
                    if (isNaN(res.total)) continue;
                    const key = t.meta.key;
                    const c = bestSpa.get(key);
                    const currentScore = Math.max(res.total || 0, res.bossTotal || 0);
                    const bestKnownScore = c ? Math.max(c.res.total || 0, c.res.bossTotal || 0) : -1;
                    if (!c || currentScore > bestKnownScore) bestSpa.set(key, { res, meta: t.meta });
                }
                pushBest(bestSpa, 'spa');
            } catch (err) { console.error(`Error calculating spa points for ${unit.id}:`, err); }
        });
        
        return traitGroups;
    }

    function finalizeDatabase(rawDb, existingRaw, outPath, sigHeads) {
        const MAP_PRIO = { 'dmg': 0, 'spa': 1, 'raw_dmg': 2 };
        const MAP_BODY = { 'dmg': 0, 'dot': 1, 'cm': 2 };
        const MAP_LEGS = { 'dmg': 0, 'spa': 1, 'cf': 2 };
        const MAP_HEAD = { 'none': 0, 'sun_god': 1, 'ninja': 2, 'reaper_necklace': 3, 'shadow_reaper_necklace': 4, 'junior': 5, 'biju_head': 6, 'bloodline_head': 7, 'reanimated_head': 8, 'sorcerer_hunter_spirit': 9, 'strongest_sorcerer_glasses': 10, 'monarch': 11, 'warlord_hat': 12, 'mochi_scarf': 13, 'flaming_donut': 14, 'fused_earrings': 15 };

        const stringPool = new Map(); const stringArr = [""]; 
        const subPool = new Map(); const subArr = [null]; 

        // Seed pools from existing file so unchanged units' indices remain valid — no re-encode needed
        if (existingRaw) {
            for (let i = 1; i < existingRaw.s.length; i++) { stringPool.set(existingRaw.s[i], i); stringArr.push(existingRaw.s[i]); }
            for (let i = 1; i < existingRaw.p.length; i++) {
                const p = existingRaw.p[i]; if (!p) continue;
                const sig = p[0].flat().join(',') + '|' + p[1].flat().join(',') + '|' + p[2].flat().join(',') + '|' + p[3];
                subPool.set(sig, i); subArr.push(p);
            }
        }

        const encodeStr = (val) => {
            if (!val) return 0;
            const s = String(val);
            let idx = stringPool.get(s);
            if (idx === undefined) { idx = stringArr.length; stringPool.set(s, idx); stringArr.push(s); }
            return idx;
        };

        const encodeSubs = (s) => {
            if (!s) return 0;
            const transform = (list) => (list||[]).map(i => [encodeStr(i.type), i.val]);
            const compact = [transform(s.head), transform(s.body), transform(s.legs), s.selectedHead ? encodeStr(s.selectedHead) : 0];
            const sig = compact[0].flat().join(',') + '|' + compact[1].flat().join(',') + '|' + compact[2].flat().join(',') + '|' + compact[3];
            let idx = subPool.get(sig);
            if (idx === undefined) { idx = subArr.length; subPool.set(sig, idx); subArr.push(compact); }
            return idx;
        };

        const ROW_SIZE = 18;
        const rowsToBuffer = (rows) => {
            const len = rows.length;
            const buffer = new ArrayBuffer(len * ROW_SIZE);
            const view = new DataView(buffer);
            for (let i = 0; i < len; i++) {
                const r = rows[i];
                const offset = i * ROW_SIZE;
                const meta = (MAP_PRIO[r.prio] || 0) | ((MAP_BODY[r.mainStats.body] || 0) << 2) | ((MAP_LEGS[r.mainStats.legs] || 0) << 4) | ((MAP_HEAD[r.headUsed || 'none'] || 0) << 6) | ((r.isCustom ? 1 : 0) << 10);

                view.setUint8(offset, encodeStr(r.traitName));
                view.setUint8(offset + 1, encodeStr(r.setName));
                view.setFloat32(offset + 2, Math.max(r.dps || 0, r.bossDps || 0), true); 
                view.setUint16(offset + 6, Math.round((r.spa || 1) * 1000), true);
                view.setUint16(offset + 8, Math.round((r.range || 0) * 10), true);
                view.setUint16(offset + 10, meta, true);
                view.setUint16(offset + 12, encodeSubs(r.subStats || {}), true);
                view.setFloat32(offset + 14, r.dmgVal || 0, true);
            }
            return Buffer.from(buffer).toString('base64');
        };

        const FINAL_DB = {};

        const allPossibleKeys = new Set();
        unitDatabase.forEach(u => {
            allPossibleKeys.add(u.id);
            if(isUnit(u.id, 'kirito')) allPossibleKeys.add('kirito_card');
            if(u.ability) { allPossibleKeys.add(u.id + '_abil'); if(isUnit(u.id, 'kirito')) allPossibleKeys.add('kirito_card_abil'); }
        });

        for (const key of allPossibleKeys) {
            if (rawDb[key]) {
                FINAL_DB[key] = {
                    fixed: rawDb[key].fixed.map(configRows => rowsToBuffer(configRows))
                };
            } else if (existingRaw && existingRaw.d[key]) {
                FINAL_DB[key] = existingRaw.d[key]; // pools seeded above — indices still valid, no re-encode needed
                if (FINAL_DB[key].bugged) delete FINAL_DB[key].bugged;
            }
        }

        const payloadStr = JSON.stringify({ s: stringArr, p: subArr, d: FINAL_DB });
        const fileContent = `// BUILDSIG: ${sigHeads || 'all'}
(function() {
    const RAW = ${payloadStr};
    const S = RAW.s; const P = RAW.p; const D = RAW.d;
    const PRIO = ['dmg', 'spa', 'raw_dmg'];
    const BODY = ['dmg', 'dot', 'cm']; const LEGS = ['dmg', 'spa', 'cf'];
    const HEAD = ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'fused_earrings'];
    const DESC_BODY = ['Dmg', 'DoT', 'Crit Dmg']; const DESC_LEGS = ['Dmg', 'Spa', 'Crit Rate'];
    const ROW_SIZE = 18;

    const decode = (b64) => {
        const bin = atob(b64); const len = bin.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
        return new DataView(bytes.buffer);
    };

    window.STATIC_BUILD_DB = new Proxy({}, {
        get: function(target, prop) {
            if (target[prop]) return target[prop];
            if (D[prop]) {
                const rawData = D[prop];
                let unitId = prop.replace('_abil', '').replace('kirito_card', 'kirito');
                let suffix = prop.endsWith('_abil') ? "-ABILITY" : "-BASE";
                if (prop.startsWith('kirito')) { suffix += "-VR"; if (prop.includes('card')) suffix += "-CARD"; }
                const idContext = unitId + suffix;

                const unpackList = (b64List, modeCode) => {
                    const modeTag = (modeCode === 'b') ? "-b-" : "-f-";
                    return b64List.map((b64, cfgIdx) => {
                        const view = decode(b64);
                        const count = view.byteLength / ROW_SIZE;
                        const result = [];
                        const subsSuffix = "-SUBS"; 

                        for(let i=0; i<count; i++) {
                            const off = i * ROW_SIZE;
                            const meta = view.getUint16(off+10, true);
                            const bIdx = (meta >> 2) & 3; const lIdx = (meta >> 4) & 3;
                            const headUsed = HEAD[(meta >> 6) & 15];
                            const sName = S[view.getUint8(off+1)];
                            const buildNameRaw = sName + " (" + DESC_BODY[bIdx] + "/" + DESC_LEGS[lIdx] + ")";
                            
                            let subs = undefined;
                            const subId = view.getUint16(off+12, true);
                            if(subId !== 0) {
                                const rS = P[subId]; 
                                const mapS = (list) => list.map(x => ({ type: S[x[0]], val: x[1] }));
                                subs = { head: mapS(rS[0]), body: mapS(rS[1]), legs: mapS(rS[2]), selectedHead: rS[3] ? S[rS[3]] : undefined };
                            }

                            result.push({
                                id: idContext + "-" + S[view.getUint8(off)].toLowerCase() + "-" + buildNameRaw.replace(/[^a-zA-Z0-9]/g, '') + "-" + PRIO[meta & 3] + subsSuffix + "-" + headUsed + modeTag, 
                                traitName: S[view.getUint8(off)], setName: sName, dps: view.getFloat32(off+2, true), dv: view.getFloat32(off+14, true), 
                                spa: view.getUint16(off+6, true) / 1000, range: view.getUint16(off+8, true) / 10, prio: PRIO[meta & 3],
                                mainStats: { body: BODY[bIdx], legs: LEGS[lIdx] }, headUsed: headUsed, isCustom: !!((meta >> 10) & 1), subStats: subs
                            });
                        }
                        return result;
                    });
                };
                target[prop] = { fixed: unpackList(rawData.fixed, "f") };
                D[prop] = null;
                return target[prop];
            }
            return undefined;
        }
    });
})();`;

        fs.writeFileSync(outPath, fileContent);
    }

    parentPort.on('message', (msg) => {
        if (msg.type === 'exit') process.exit(0);
        if (msg.type === 'job') {
            const { combo, targetUnits, outDir, selectedHeads, selectedSets } = msg;
            const targetSet = new Set(targetUnits);
            const outName = getDbName(combo);
            const outPath = outDir + '/' + outName;

            window.mikuActive = combo[0] === '1'; 
            window.enlightenedGodActive = combo[1] === '1';
            window.bijuuActive = combo[2] === '1'; 
            window.ancientMageActive = combo[3] === '1';
            window.kingSailorActive = combo[4] === '1';
            window.fernHillActive = combo[5] === 'hill'; 
            window.fernGroundActive = combo[5] === 'ground';
            window.CALCULATION_MODE = 'potential';
 
            // Assume full modes for Sukuna for DB ranking
            window.unitModesState['the_strongest_in_history'] = [1, 2];

            statConfig.applyRelicDot = true; statConfig.applyRelicCrit = true; 

            parentPort.postMessage({ type: 'log', outName, data: 'Loading existing chunks...' });

            let existingRaw = null;
            let existingHeads = [];
            const isFullGen = targetUnits.length === 0 || targetUnits.length >= unitDatabase.length;
            if (fs.existsSync(outPath)) {
                try {
                    const content = fs.readFileSync(outPath, 'utf-8');
                    const startMarker = 'const RAW = ';
                    const startIdx = content.indexOf(startMarker);
                    if (startIdx !== -1) {
                        const sIdx = content.indexOf('const S = RAW.s;', startIdx);
                        if (sIdx !== -1) {
                            const endIdx = content.lastIndexOf(';', sIdx - 1);
                            if (endIdx > startIdx) existingRaw = JSON.parse(content.substring(startIdx + startMarker.length, endIdx).trim());
                        }
                    }
                    if (isFullGen && content.startsWith('// BUILDSIG:')) {
                        const sigLine = content.substring(0, content.indexOf('\\n'));
                        existingHeads = sigLine.replace('// BUILDSIG:', '').split(',').map(s => s.trim());
                    }
                } catch(e) {}
            }

            const tasks = [];
            unitDatabase.forEach(u => {
                if (targetUnits.length === 0 || targetSet.has(u.id)) {
                    // SMART SKIP: If Fern is the only active location buff and unit doesn't benefit, skip!
                    const fernState = combo[5];
                    const uType = (u.placementType || 'Ground').toLowerCase();
                    const hasGlobalBuffs = combo[0] === '1' || combo[1] === '1' || combo[2] === '1' || combo[3] === '1' || combo[4] === '1' || combo[6] === '1';
                    
                    if (!hasGlobalBuffs) {
                        if (fernState === 'hill' && uType === 'ground') return;
                        if (fernState === 'ground' && uType === 'hill') return;
                    }

                    tasks.push({ u });
                }
            });

            const ROW_SIZE = 18;
            const PRIO = ['dmg', 'spa', 'raw_dmg'];
            const BODY = ['dmg', 'dot', 'cm'];
            const LEGS = ['dmg', 'spa', 'cf'];
            const HEAD = ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'fused_earrings'];

            const decode = (b64) => {
                const bin = Buffer.from(b64, 'base64').toString('binary');
                const len = bin.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
                return new DataView(bytes.buffer);
            };

            const unpackBuffer = (b64) => {
                if (!existingRaw) return [];
                const view = decode(b64);
                const len = view.byteLength / ROW_SIZE;
                const result = [];
                for (let i = 0; i < len; i++) {
                    const off = i * ROW_SIZE;
                    const traitName = existingRaw.s[view.getUint8(off)];
                    const setName = existingRaw.s[view.getUint8(off + 1)];
                    const dps = view.getFloat32(off + 2, true);
                    const spa = view.getUint16(off + 6, true) / 1000;
                    const range = view.getUint16(off + 8, true) / 10;
                    const meta = view.getUint16(off + 10, true);
                    
                    const prio = PRIO[meta & 3];
                    const body = BODY[(meta >> 2) & 3];
                    const legs = LEGS[(meta >> 4) & 3];
                    const headUsed = HEAD[(meta >> 6) & 15];
                    const isCustom = !!((meta >> 10) & 1);
                    
                    const subIdx = view.getUint16(off + 12, true);
                    const subRaw = existingRaw.p[subIdx];
                    let subStats = {};
                    if (subRaw) {
                        const unpackSubsPiece = (list) => {
                            return (list || []).map(item => ({
                                type: existingRaw.s[item[0]],
                                val: item[1]
                            }));
                        };
                        subStats = {
                            head: unpackSubsPiece(subRaw[0]),
                            body: unpackSubsPiece(subRaw[1]),
                            legs: unpackSubsPiece(subRaw[2]),
                            selectedHead: subRaw[3] ? existingRaw.s[subRaw[3]] : undefined
                        };
                    }
                    
                    const dmgVal = view.getFloat32(off + 14, true);
                    
                    result.push({
                        traitName,
                        setName,
                        dps,
                        spa,
                        range,
                        prio,
                        mainStats: { body, legs },
                        headUsed,
                        isCustom,
                        subStats,
                        dmgVal
                    });
                }
                return result;
            };

            let workerDb = {};
            tasks.forEach(task => {
                const { u } = task;
                let baseKey = u.id;
                const types = u.ability ? ['base', 'abil'] : ['base'];
                const traitsForCalc = [...traitsList, ...(unitSpecificTraits[u.id] || [])];

                types.forEach(type => {
                    const finalKey = type === 'abil' ? `${baseKey}_abil` : baseKey;
                    workerDb[finalKey] = { fixed: [] }; 

                    let existingFixed = [];
                    if (existingRaw && existingRaw.d[finalKey]) {
                        const d = existingRaw.d[finalKey];
                        if (d.fixed) existingFixed = d.fixed.flatMap(b64 => unpackBuffer(b64));
                    }

                    const isAbility = type === 'abil';

                    CONFIGS.forEach(cfg => {
                        const traitGroups = fastCalculateUnitBuilds(u, cfg, traitsForCalc, isAbility, existingHeads, selectedHeads, selectedSets);
 
                        if (u.id === 'the_strongest_in_history' && cfg.subs) {
                            window.unitModesState['the_strongest_in_history'] = [1, 2];
                            const monarchTrait = traitsForCalc.find(t => t.name === 'Ruler' || t.name === 'Godly');
                            if (monarchTrait) {
                                const mBuilds = fastCalculateUnitBuilds(u, { head: true, subs: true }, [monarchTrait], isAbility, existingHeads, selectedHeads, selectedSets);
                                if (mBuilds[monarchTrait.name]) {
                                    if (!traitGroups[monarchTrait.name]) traitGroups[monarchTrait.name] = [];
                                    traitGroups[monarchTrait.name].push(...mBuilds[monarchTrait.name]);
                                }
                            }
                            window.unitModesState['the_strongest_in_history'] = [0];
                        }

                        const processGroup = (list) => {
                            const prioGroups = { dmg: [], spa: [], raw_dmg: [] };
                            for (const b of list) {
                                if (prioGroups[b.prio]) prioGroups[b.prio].push(b);
                            }
                            
                            const uniqueList = [];
                            for (const prio in prioGroups) {
                                const prioList = prioGroups[prio];
                                if (prioList.length === 0) continue;
                                
                                prioList.sort((a, b) => {
                                    const scoreA = Math.max(a.dps || 0, a.bossDps || 0);
                                    const scoreB = Math.max(b.dps || 0, b.bossDps || 0);
                                    return scoreB !== scoreA ? scoreB - scoreA : (b.dmgVal || 0) - (a.dmgVal || 0);
                                });

                                const seenKeys = new Set();
                                const comboCounts = {};
                                for (const b of prioList) {
                                    const comboKey = b.mainStats.body + "_" + b.mainStats.legs;
                                    const exactKey = b.setName + "_" + (b.headUsed || 'none') + "_" + comboKey;
                                    
                                    if (!comboCounts[comboKey]) comboCounts[comboKey] = 0;
                                    if (comboCounts[comboKey] >= 3) continue;

                                    if (!seenKeys.has(exactKey)) {
                                        uniqueList.push(b);
                                        seenKeys.add(exactKey);
                                        comboCounts[comboKey]++;
                                    }
                                }
                            }
                            return uniqueList;
                        };

                        // Pre-process new builds to reduce size drastically before merging
                        const topNewPerTrait = [];
                        for (const trait in traitGroups) {
                            topNewPerTrait.push(...processGroup(traitGroups[trait]));
                        }

                        const mergeAndReduce = (existingArr, newReduced) => {
                            const combined = existingArr.concat(newReduced);
                            const traitMap = {};
                            combined.forEach(b => {
                                if (!traitMap[b.traitName]) traitMap[b.traitName] = [];
                                traitMap[b.traitName].push(b);
                            });
                            
                            const result = [];
                            for (const trait in traitMap) {
                                result.push(...processGroup(traitMap[trait]));
                            }
                            
                            // Final stable sort for the output
                            return result.sort((a, b) => {
                                const scoreA = Math.max(a.dps || 0, a.bossDps || 0);
                                const scoreB = Math.max(b.dps || 0, b.bossDps || 0);
                                return scoreB !== scoreA ? scoreB - scoreA : (b.dmgVal || 0) - (a.dmgVal || 0);
                            });
                        };

                        let finalFixed = mergeAndReduce(existingFixed, topNewPerTrait);

                        workerDb[finalKey].fixed.push(finalFixed);
                    });
                });
                
                // Immediately notify python/UI so it ticks visually per-unit
                parentPort.postMessage({ type: 'unit_done', outName, unitName: u.name });
            });

            parentPort.postMessage({ type: 'log', outName, data: 'Writing database file to disk...' });
            finalizeDatabase(workerDb, existingRaw, outPath, selectedHeads.join(','));
            workerDb = null;
            existingRaw = null;
            if (typeof global.gc === 'function') global.gc();
            parentPort.postMessage({ type: 'done', outName });
        }
    });
}
"""

class GeneratorApp:
    def __init__(self):
        self.is_running = False
        self.units = []
        self._load_units()
        self.window = None 
        self.temp_dir = None
        self.process = None

    def _load_units(self):
        units_dir = 'units'
        if not os.path.exists(units_dir): units_dir = os.path.join('utdx', 'units')
        
        if os.path.exists(units_dir):
            for u_file in sorted(os.listdir(units_dir)):
                if u_file.endswith('.js'):
                    path = os.path.join(units_dir, u_file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            uid = (re.search(r"id:\s*['\"](.*?)['\"]", content) or [None, u_file.replace('.js', '')])[1]
                            uname = (re.search(r"name:\s*['\"](.*?)['\"]", content) or [None, uid])[1]
                            uimg = (re.search(r"img:\s*['\"](.*?)['\"]", content) or [None, ""])[1]
                            self.units.append({"id": str(uid), "name": str(uname), "img": str(uimg)})
                    except: continue

    def get_units(self): return self.units

    def start_generation(self, selected_units, threads, mode='all', buffs=None, selected_heads=None, selected_sets=None):
        if self.is_running: return "Already running"
        self.is_running = True
        threading.Thread(target=self._run_logic, args=(selected_units, threads, mode, buffs, selected_heads, selected_sets), daemon=True).start()
        return "Started"

    def stop_generation(self):
        self.is_running = False
        if self.process:
            try: self.process.kill()
            except: pass
            self.process = None

    def cleanup_on_close(self):
        self.stop_generation()
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)
            self.temp_dir = None

    def run_headless(self, selected_units, threads, mode='all', buffs=None, selected_heads=None, selected_sets=None):
        try:
            print("Preparing highly optimized build scripts...")
            
            combined_js_parts = [
                "if (typeof window === 'undefined') { global.window = global; }\n",
                "if (typeof document === 'undefined') { global.document = { createElement: () => ({}), head: { appendChild: () => {} } }; }\n",
                "global.unitDatabase = global.unitDatabase || []; global.unitSpecificTraits = global.unitSpecificTraits || {};\n",
            ]
            
            for filename in REQUIRED_FILES:
                file_path = filename
                if not os.path.exists(file_path):
                    if filename.startswith("utdx/"): file_path = filename[5:]
                    elif os.path.exists(os.path.join("utdx", filename)): file_path = os.path.join("utdx", filename)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        # Strip ES module exports for standard Node execution context
                        content = re.sub(r'\bexport\s+const\b', 'const', content)
                        content = re.sub(r'\bexport\s+function\b', 'function', content)
                        content = re.sub(r'\bexport\s+default\b', '', content)
                        content = re.sub(r'\bexport\s*\{[^}]*\}\s*;?', '', content)
                        combined_js_parts.append(content + "\n")

            # Expose library constants to global/window once all are defined to avoid TDZ errors
            combined_js_parts.append("""
if (typeof window !== 'undefined') {
    if (typeof ADVANTAGES !== 'undefined') window.ADVANTAGES = ADVANTAGES;
    if (typeof LEADER_BUFFS !== 'undefined') window.LEADER_BUFFS = LEADER_BUFFS;
    if (typeof GLOBAL_UNIT_BUFFS !== 'undefined') window.GLOBAL_UNIT_BUFFS = GLOBAL_UNIT_BUFFS;
    if (typeof SUB_STAT_BASES !== 'undefined') window.SUB_STAT_BASES = SUB_STAT_BASES;
    if (typeof MAIN_STAT_BASES !== 'undefined') window.MAIN_STAT_BASES = MAIN_STAT_BASES;
    if (typeof generateRelic !== 'undefined') window.generateRelic = generateRelic;
}
""")
            
            units_dir = 'units' if os.path.exists('units') else os.path.join('utdx', 'units')
            if os.path.exists(units_dir):
                for u_file in sorted(os.listdir(units_dir)):
                    if u_file.endswith('.js'):
                        clean_name = u_file.replace('.js', '')
                        combined_js_parts.append(f"global.__currentUnitFile = '{clean_name}';\n")
                        with open(os.path.join(units_dir, u_file), "r", encoding="utf-8") as f: combined_js_parts.append(f.read() + "\n")

            combined_js_parts.append(GENERATOR_SCRIPT)
            combined_js = "".join(combined_js_parts)
            temp_runner = os.path.join(self.temp_dir, "db_runner.cjs")
            with open(temp_runner, "w", encoding="utf-8") as f: f.write(combined_js)

            # --- DYNAMIC COMBO GENERATION ---
            def get_states(b_key, default_vals=['0', '1']):
                if mode != 'custom' or not buffs: return default_vals
                cfg = buffs.get(b_key, {'permute': True, 'force': False})
                if cfg.get('force'): 
                    return ['1'] if default_vals == ['0', '1'] else ['hill']
                if cfg.get('permute'): return default_vals
                return [default_vals[0]]

            b_miku = get_states('miku')
            b_enlightened = get_states('enlightenedgod')
            b_bijuu = get_states('bijuu')
            b_amage = get_states('amage')
            b_ksailor = get_states('ksailor')
            b_fern = get_states('fern', ['none', 'hill', 'ground'])

            all_combos = list(itertools.product(b_miku, b_enlightened, b_bijuu, b_amage, b_ksailor, b_fern))
            db_dir = "databases" if os.path.exists("databases") else os.path.join("utdx", "databases")
            os.makedirs(db_dir, exist_ok=True)

            # Helper for name calculation (same logic as Node)
            def get_name(c):
                p = []
                if c[0] == '1': p.append('miku')
                if c[1] == '1': p.append('enlightenedgod')
                if c[2] == '1': p.append('bijuu')
                if c[3] == '1': p.append('amage')
                if c[4] == '1': p.append('ksailor')
                if c[5] == 'hill': p.append('magehill')
                elif c[5] == 'ground': p.append('mageground')
                return "db_base.js" if not p else "db_" + "_".join(p) + ".js"

            if mode == 'missing':
                combinations = []
                for c in all_combos:
                    fpath = os.path.join(db_dir, get_name(c))
                    # If specific units are selected, we MUST run the combo to merge them into the file
                    if selected_units:
                        combinations.append(c)
                    elif not os.path.exists(fpath):
                        combinations.append(c)
                    else:
                        try:
                            with open(fpath, "r", encoding="utf-8") as f:
                                first_lines = "".join([f.readline() for _ in range(5)])
                                if "// BUILDSIG:" not in first_lines or "flaming_donut" not in first_lines or "fused_earrings" not in first_lines:
                                    combinations.append(c)
                        except Exception:
                            combinations.append(c)
            else:
                combinations = all_combos

            if not combinations:
                print("All databases already exist. Nothing to generate.")
                self.is_running = False
                return

            if selected_heads is None:
                selected_heads = ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'fused_earrings']
            if selected_sets is None:
                selected_sets = ['Junior Ninja', 'Sun God', 'Laughing Captain', 'Ex Captain', 'Shadow Reaper', 'Reaper Set', 'Super Roku', 'Bio-Android', 'Biju Set', 'Rebellious Set', 'Reanimated Set', 'Great Mage', 'Sorcerer Hunter', 'Strongest Sorcerer', 'Monarch', 'Warlord', 'Mochi', 'Fused Warrior']

            job_data = {
                "combinations": combinations,
                "targetUnits": [str(u) for u in selected_units],
                "threads": int(threads),
                "outDir": db_dir,
                "selectedHeads": selected_heads,
                "selectedSets": selected_sets
            }
            job_file = os.path.join(self.temp_dir, "job.json")
            with open(job_file, "w", encoding="utf-8") as f: json.dump(job_data, f)

            overall_start = time.time()
            self.process = subprocess.Popen(["node", "--expose-gc", temp_runner, job_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")

            def read_err():
                for line in self.process.stderr:
                    print(f"Node Error: {line.strip()}")
            threading.Thread(target=read_err, daemon=True).start()

            for line in self.process.stdout:
                line = line.strip()
                if line.startswith("__STATUS__:"):
                    parts = line.split(":", 3)
                    if len(parts) >= 3:
                        msg_type = parts[1]
                        if msg_type == "PROGRESS":
                            pct = float(parts[2])
                            msg = parts[3] if len(parts) > 3 else ""
                            print(f"Progress: {pct:.1f}% - {msg}")
                        elif msg_type == "LOG":
                            out_name = parts[2]
                            msg = parts[3] if len(parts) > 3 else ""
                            print(f"[{out_name}] {msg}")
                        elif msg_type == "ALL_DONE":
                            print("Finalizing saving process...")
                            break

            self.process.wait()
            print(f"Generation completed in {time.time() - overall_start:.2f} seconds.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            self.is_running = False

    def _run_logic(self, selected_units, threads, mode='all', buffs=None, selected_heads=None, selected_sets=None):
        try:
            self.window.evaluate_js("updateStatus('Preparing highly optimized build scripts...')")
            
            combined_js_parts = [
                "if (typeof window === 'undefined') { global.window = global; }\n",
                "if (typeof document === 'undefined') { global.document = { createElement: () => ({}), head: { appendChild: () => {} } }; }\n",
                "global.unitDatabase = global.unitDatabase || []; global.unitSpecificTraits = global.unitSpecificTraits || {};\n",
            ]
            
            for filename in REQUIRED_FILES:
                file_path = filename
                if not os.path.exists(file_path):
                    if filename.startswith("utdx/"): file_path = filename[5:]
                    elif os.path.exists(os.path.join("utdx", filename)): file_path = os.path.join("utdx", filename)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        # Strip ES module exports for standard Node execution context
                        content = re.sub(r'\bexport\s+const\b', 'const', content)
                        content = re.sub(r'\bexport\s+function\b', 'function', content)
                        content = re.sub(r'\bexport\s+default\b', '', content)
                        content = re.sub(r'\bexport\s*\{[^}]*\}\s*;?', '', content)
                        combined_js_parts.append(content + "\n")

            # Expose library constants to global/window once all are defined to avoid TDZ errors
            combined_js_parts.append("""
if (typeof window !== 'undefined') {
    if (typeof ADVANTAGES !== 'undefined') window.ADVANTAGES = ADVANTAGES;
    if (typeof LEADER_BUFFS !== 'undefined') window.LEADER_BUFFS = LEADER_BUFFS;
    if (typeof GLOBAL_UNIT_BUFFS !== 'undefined') window.GLOBAL_UNIT_BUFFS = GLOBAL_UNIT_BUFFS;
    if (typeof SUB_STAT_BASES !== 'undefined') window.SUB_STAT_BASES = SUB_STAT_BASES;
    if (typeof MAIN_STAT_BASES !== 'undefined') window.MAIN_STAT_BASES = MAIN_STAT_BASES;
    if (typeof generateRelic !== 'undefined') window.generateRelic = generateRelic;
}
""")
            
            units_dir = 'units' if os.path.exists('units') else os.path.join('utdx', 'units')
            if os.path.exists(units_dir):
                for u_file in sorted(os.listdir(units_dir)):
                    if u_file.endswith('.js'):
                        clean_name = u_file.replace('.js', '')
                        combined_js_parts.append(f"global.__currentUnitFile = '{clean_name}';\n")
                        with open(os.path.join(units_dir, u_file), "r", encoding="utf-8") as f: combined_js_parts.append(f.read() + "\n")

            combined_js_parts.append(GENERATOR_SCRIPT)
            combined_js = "".join(combined_js_parts)
            temp_runner = os.path.join(self.temp_dir, "db_runner.cjs")
            with open(temp_runner, "w", encoding="utf-8") as f: f.write(combined_js)

            # --- DYNAMIC COMBO GENERATION ---
            def get_states(b_key, default_vals=['0', '1']):
                if mode != 'custom' or not buffs: return default_vals
                cfg = buffs.get(b_key, {'permute': True, 'force': False})
                if cfg.get('force'): 
                    return ['1'] if default_vals == ['0', '1'] else ['hill'] # Simplified for Fern example if needed, but Fern is special
                if cfg.get('permute'): return default_vals
                return [default_vals[0]] # Return '0' or 'none'

            b_miku = get_states('miku')
            b_enlightened = get_states('enlightenedgod')
            b_bijuu = get_states('bijuu')
            b_amage = get_states('amage')
            b_ksailor = get_states('ksailor')
            b_fern = get_states('fern', ['none', 'hill', 'ground'])

            all_combos = list(itertools.product(b_miku, b_enlightened, b_bijuu, b_amage, b_ksailor, b_fern))
            db_dir = "databases" if os.path.exists("databases") else os.path.join("utdx", "databases")
            os.makedirs(db_dir, exist_ok=True)

            # Helper for name calculation (same logic as Node)
            def get_name(c):
                p = []
                if c[0] == '1': p.append('miku')
                if c[1] == '1': p.append('enlightenedgod')
                if c[2] == '1': p.append('bijuu')
                if c[3] == '1': p.append('amage')
                if c[4] == '1': p.append('ksailor')
                if c[5] == 'hill': p.append('magehill')
                elif c[5] == 'ground': p.append('mageground')
                return "db_base.js" if not p else "db_" + "_".join(p) + ".js"

            if mode == 'missing':
                combinations = []
                for c in all_combos:
                    fpath = os.path.join(db_dir, get_name(c))
                    if selected_units:
                        combinations.append(c)
                    elif not os.path.exists(fpath):
                        combinations.append(c)
                    else:
                        try:
                            with open(fpath, "r", encoding="utf-8") as f:
                                first_lines = "".join([f.readline() for _ in range(5)])
                                if "// BUILDSIG:" not in first_lines or "flaming_donut" not in first_lines or "fused_earrings" not in first_lines:
                                    combinations.append(c)
                        except Exception:
                            combinations.append(c)
            else:
                combinations = all_combos

            if not combinations:
                self.window.evaluate_js("updateStatus('All databases already exist. Nothing to generate.')")
                self.window.evaluate_js("updateProgress(100, 'Done')")
                self.is_running = False
                return

            job_data = {
                "combinations": combinations,
                "targetUnits": [str(u) for u in selected_units],
                "threads": int(threads),
                "outDir": db_dir,
                "selectedHeads": selected_heads,
                "selectedSets": selected_sets
            }
            job_file = os.path.join(self.temp_dir, "job.json")
            with open(job_file, "w", encoding="utf-8") as f: json.dump(job_data, f)

            overall_start = time.time()
            self.process = subprocess.Popen(["node", "--expose-gc", temp_runner, job_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")

            def read_err():
                for line in self.process.stderr:
                    err_msg = line.strip()
                    self.window.evaluate_js(f"updateStatus({json.dumps('Node Error: ' + err_msg)})")
                    print(f"Node Error: {err_msg}")
            threading.Thread(target=read_err, daemon=True).start()

            for line in self.process.stdout:
                if not self.is_running: break
                line = line.strip()
                if line.startswith("__STATUS__:"):
                    parts = line.split(":", 3)
                    if len(parts) >= 3:
                        msg_type = parts[1]
                        if msg_type == "PROGRESS":
                            pct = float(parts[2])
                            msg = parts[3] if len(parts) > 3 else ""
                            self.window.evaluate_js(f"updateProgress({pct}, {json.dumps(msg)})")
                        elif msg_type == "LOG":
                            out_name = parts[2]
                            msg = parts[3] if len(parts) > 3 else ""
                            self.window.evaluate_js(f"updateStatus({json.dumps('[' + out_name + '] ' + msg)})")
                        elif msg_type == "ALL_DONE":
                            self.window.evaluate_js(f"updateProgress(100.0, 'Finalizing saving process...')")
                            break

            self.process.wait()
            if self.is_running: self.window.evaluate_js(f"onComplete({time.time() - overall_start})")
        except Exception as e:
            if self.is_running: 
                self.window.evaluate_js(f"alert({json.dumps('Error: ' + str(e))})")
        finally:
            self.is_running = False
            self.process = None

HTML = """
<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0d0d12;
            --card-bg: #16161d;
            --accent: #a855f7;
            --text: #f8fafc;
            --text-dim: #94a3b8;
        }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 100vh; }
        header { padding: 20px 40px; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(168, 85, 247, 0.2); display: flex; justify-content: space-between; align-items: center; z-index: 100; }
        .title h1 { margin: 0; font-size: 1.5rem; color: var(--accent); }
        .title p { margin: 5px 0 0; font-size: 0.85rem; color: var(--text-dim); }
        .main-container { flex: 1; display: flex; overflow: hidden; }
        .sidebar { width: 300px; padding: 20px; background: rgba(15, 23, 42, 0.4); border-right: 1px solid rgba(168, 85, 247, 0.1); display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
        .unit-grid { flex: 1; padding: 25px; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px; overflow-y: auto; align-content: start; }
        .unit-card { background: var(--card-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .unit-card:hover { transform: translateY(-5px); background: rgba(51, 65, 85, 0.9); border-color: var(--accent); }
        .unit-card.selected { border-color: var(--accent); background: rgba(56, 189, 248, 0.1); box-shadow: 0 0 20px rgba(56, 189, 248, 0.15); }
        .unit-card.selected::after { content: '✓'; position: absolute; top: -8px; right: -8px; background: var(--accent); color: #0f172a; width: 24px; height: 24px; border-radius: 50%; font-size: 14px; line-height: 24px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .unit-img { width: 80px; height: 80px; background: #000; border-radius: 12px; background-size: cover; background-position: center; border: 2px solid rgba(255,255,255,0.1); }
        .unit-name { font-size: 0.85rem; font-weight: 600; color: var(--text); text-shadow: 0 2px 4px rgba(0,0,0,0.3); text-align: center; line-height: 1.2; }
        .control-group { display: flex; flex-direction: column; gap: 8px; }
        .control-group label { font-size: 0.85rem; color: var(--text-dim); }
        input[type="number"], select, input[type="text"] { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 8px; border-radius: 6px; outline: none; }
        select option { background: #1e293b; color: white; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        .btn { background: var(--accent); color: var(--bg); border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn:hover { opacity: 0.9; transform: scale(1.02); }
        .btn:disabled { background: var(--text-dim); cursor: not-allowed; }
        .btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
        .progress-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.9); display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
        .progress-bar-container { width: 400px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        #progress-fill { height: 100%; background: var(--accent); width: 0%; transition: width 0.1s linear; }
        #progress-status { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 5px; }
        #progress-log { font-size: 0.8rem; color: var(--accent); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    </style>
</head>
<body>
    <header>
        <div class="title">
            <h1>Database Generator</h1>
            <p>Select units to re-calculate or update</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline" onclick="selectAll(true)">Select All</button>
            <button class="btn btn-outline" onclick="selectAll(false)">Clear</button>
            <button id="start-btn" class="btn" onclick="start()">Start Generation</button>
        </div>
    </header>
    <div class="main-container">
        <div class="sidebar">
            <div class="control-group">
                <label>CPU Worker Threads</label>
                <input type="number" id="threads" value="8" min="1" max="64">
                <small style="color: var(--text-dim); font-size: 0.7rem;">Matches your physical CPU cores for max speed</small>
            </div>
            <div class="control-group">
                <label>Generation Mode</label>
                <select id="gen-mode" style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 8px; border-radius: 6px; outline: none;" onchange="toggleBuffSelect()">
                    <option value="all">Generate All Combos</option>
                    <option value="missing" selected>Missing Files Only (Fastest)</option>
                    <option value="custom">Custom Buff Selection</option>
                </select>
            </div>
            <div class="control-group">
                <label>Relic Sets to Include</label>
                <input type="text" id="set-search" placeholder="Search sets..." onkeyup="renderGearSelection()" style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 6px 10px; border-radius: 6px; outline: none; font-size: 0.75rem; margin-bottom: 5px;">
                <div id="set-selection" style="max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 4px;"><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;" onclick="toggleAllGear('.set-cb', true)">All</button><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;" onclick="toggleAllGear('.set-cb', false)">None</button></div>
            </div>
            <div class="control-group">
                <label>Head Pieces to Include</label>
                <input type="text" id="head-search" placeholder="Search heads..." onkeyup="renderGearSelection()" style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 6px 10px; border-radius: 6px; outline: none; font-size: 0.75rem; margin-bottom: 5px;">
                <div id="head-selection" style="max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 4px;"><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;" onclick="toggleAllGear('.head-cb', true)">All</button><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;" onclick="toggleAllGear('.head-cb', false)">None</button></div>
            </div>
            <div id="buff-selection" style="display: none; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                    <span style="font-size: 0.7rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Buff Name</span>
                    <span style="font-size: 0.6rem; color: var(--accent); font-weight: 700; text-align: center; line-height: 1;">PERMUTE<br>(On/Off)</span>
                    <span style="font-size: 0.6rem; color: #f472b6; font-weight: 700; text-align: center; line-height: 1;">FORCE<br>(Always On)</span>
                </div>
                <div id="buff-list" style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- Row Template -->
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">Miku</span>
                        <input type="checkbox" data-buff="miku" data-type="permute" checked style="justify-self: center;">
                        <input type="checkbox" data-buff="miku" data-type="force" style="justify-self: center;">
                    </div>
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">Enlightened God</span>
                        <input type="checkbox" data-buff="enlightenedgod" data-type="permute" checked style="justify-self: center;">
                        <input type="checkbox" data-buff="enlightenedgod" data-type="force" style="justify-self: center;">
                    </div>
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">Bijuu</span>
                        <input type="checkbox" data-buff="bijuu" data-type="permute" checked style="justify-self: center;">
                        <input type="checkbox" data-buff="bijuu" data-type="force" style="justify-self: center;">
                    </div>
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">Ancient Mage</span>
                        <input type="checkbox" data-buff="amage" data-type="permute" checked style="justify-self: center;">
                        <input type="checkbox" data-buff="amage" data-type="force" style="justify-self: center;">
                    </div>
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">King Sailor</span>
                        <input type="checkbox" data-buff="ksailor" data-type="permute" checked style="justify-self: center;">
                        <input type="checkbox" data-buff="ksailor" data-type="force" style="justify-self: center;">
                    </div>
                    <div class="buff-row" style="display: grid; grid-template-columns: 1fr 60px 60px; gap: 10px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text);">Fern (Hill/Ground)</span>
                        <input type="checkbox" data-buff="fern" data-type="permute" checked style="justify-self: center;">
                        <span style="font-size: 0.7rem; color: var(--text-dim); text-align: center;">N/A</span>
                    </div>
                </div>
            </div>
            <div style="margin-top: auto; padding: 15px; background: rgba(56, 189, 248, 0.05); border-radius: 8px;">
                <span style="font-size: 0.8rem; color: var(--accent);">Tip</span>
                <p style="font-size: 0.75rem; color: var(--text-dim); margin: 5px 0;">If files exist, only selected units will be recalculated. Others will be merged rapidly.</p>
            </div>
        </div>
        <div class="unit-grid" id="unit-grid"></div>
    </div>
    
    <div class="progress-overlay" id="overlay">
        <h2 id="progress-title">Generating Databases...</h2>
        <div class="progress-bar-container"><div id="progress-fill"></div></div>
        <div id="progress-status">0.0%</div>
        <div id="progress-log">Initializing ultra-fast multi-core mapping...</div>
        <button id="stop-gen-btn" class="btn" style="margin-top: 30px; background: #ef4444; color: white;" onclick="stopGeneration()">Stop Generating</button>
    </div>

    <script>
        let units = []; let selected = new Set();
        const relicSets = ['Junior Ninja', 'Sun God', 'Laughing Captain', 'Ex Captain', 'Shadow Reaper', 'Reaper Set', 'Super Roku', 'Bio-Android', 'Biju Set', 'Rebellious Set', 'Reanimated Set', 'Great Mage', 'Sorcerer Hunter', 'Strongest Sorcerer', 'Monarch', 'Warlord', 'Mochi', 'Fused Warrior'];
        const headPieces = ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'fused_earrings'];
        let selectedSets = new Set(relicSets);
        let selectedHeads = new Set(headPieces);
        
        window.addEventListener('pywebviewready', async () => {
            units = await pywebview.api.get_units();
            renderUnits();
            renderGearSelection();
        });
        
        function renderUnits() {
            document.getElementById('unit-grid').innerHTML = units.map(u => `
                <div class="unit-card ${selected.has(u.id) ? 'selected' : ''}" onclick="toggleUnit('${u.id}')">
                    <div class="unit-img" style="background-image: url('${u.img}')"></div>
                    <span class="unit-name">${u.name}</span>
                </div>
            `).join('');
        }
        
        function renderGearSelection() {
            document.getElementById('set-selection').innerHTML = relicSets.map(s => `<div style="display: flex; gap: 8px; font-size: 0.75rem;"><input type="checkbox" class="set-cb" value="${s}" checked> <span>${s}</span></div>`).join('');
            document.getElementById('head-selection').innerHTML = headPieces.map(h => `<div style="display: flex; gap: 8px; font-size: 0.75rem;"><input type="checkbox" class="head-cb" value="${h}" checked> <span>${h.replace(/_/g, ' ').toUpperCase()}</span></div>`).join('');
        }
        
        function toggleAllGear(selector, val) {
            document.querySelectorAll(selector).forEach(i => i.checked = val);
        }

        function toggleAllGear(selector, val) {
            document.querySelectorAll(selector).forEach(i => i.checked = val);
        }

        function toggleBuffSelect() {
            document.getElementById('buff-selection').style.display = document.getElementById('gen-mode').value === 'custom' ? 'block' : 'none';
        }
        
        function toggleUnit(id) { selected.has(id) ? selected.delete(id) : selected.add(id); renderUnits(); }
        function selectAll(val) { val ? units.forEach(u => selected.add(u.id)) : selected.clear(); renderUnits(); }
        
        function start() {
            const mode = document.getElementById('gen-mode').value;
            const buffs = {};
            const finalHeads = Array.from(document.querySelectorAll('.head-cb:checked')).map(cb => cb.value);
            const finalSets = Array.from(document.querySelectorAll('.set-cb:checked')).map(cb => cb.value);

            document.querySelectorAll('#buff-selection input[type="checkbox"]').forEach(i => {
                const b = i.getAttribute('data-buff');
                const t = i.getAttribute('data-type');
                if (!buffs[b]) buffs[b] = { permute: false, force: false };
                buffs[b][t] = i.checked;
            });

            document.getElementById('overlay').style.display = 'flex';
            document.getElementById('progress-title').innerText = 'Generating Databases...';
            document.getElementById('progress-log').innerText = 'Starting Node.js workers...';
            document.getElementById('stop-gen-btn').style.display = 'block';
            
            pywebview.api.start_generation(Array.from(selected), document.getElementById('threads').value, mode, buffs, finalHeads, finalSets);
        }

        function stopGeneration() {
            pywebview.api.stop_generation();
            document.getElementById('progress-log').innerText = 'Stopping...';
            document.getElementById('stop-gen-btn').style.display = 'none';
        }
        
        function updateProgress(percent, log) {
            document.getElementById('progress-fill').style.width = percent + '%';
            document.getElementById('progress-status').innerText = percent.toFixed(1) + '%';
            if (log) document.getElementById('progress-log').innerText = log;
        }

        function updateStatus(msg) { document.getElementById('progress-log').innerText = msg; }
        
        function onComplete(time) {
            document.getElementById('progress-title').innerText = 'Generation Complete!';
            document.getElementById('progress-log').innerText = 'Successfully finished in ' + time.toFixed(2) + 's';
            document.getElementById('start-btn').innerText = 'Start Again';
            document.getElementById('stop-gen-btn').style.display = 'none';
            setTimeout(() => {
                document.getElementById('overlay').style.display = 'none';
                document.getElementById('progress-fill').style.width = '0%';
                document.getElementById('progress-status').innerText = '0.0%';
            }, 3000);
        }
    </script>
</body>
</html>
"""

def main():
    try: subprocess.run(["node", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("❌ Error: Node.js is required to run this script.")
        sys.exit(1)

    app = GeneratorApp()
    app.temp_dir = tempfile.mkdtemp(prefix="utd_generator_")
    
    img_src = "images" if os.path.exists("images") else "utdx/images" if os.path.exists("utdx/images") else None
    if img_src:
        abs_img_src = os.path.abspath(img_src)
        img_link = os.path.join(app.temp_dir, "images")
        try:
            os.symlink(abs_img_src, img_link)
        except (OSError, NotImplementedError):
            # Symlinks unavailable (e.g. Windows without dev mode) — copy async so startup isn't blocked
            threading.Thread(target=shutil.copytree, args=(abs_img_src, img_link), daemon=True).start()

    if "--headless" in sys.argv or "headless" in sys.argv:
        # Run headless with all units selected, 4 threads, and all mode
        selected_units = [u["id"] for u in app.get_units()]
        app.run_headless(selected_units=selected_units, threads=4, mode="all")
        # Cleanup temp directory
        if app.temp_dir and os.path.exists(app.temp_dir):
            shutil.rmtree(app.temp_dir, ignore_errors=True)
    else:
        gui_path = os.path.join(app.temp_dir, "index.html")
        with open(gui_path, "w", encoding="utf-8") as f: f.write(HTML)
        
        window = webview.create_window('UTD Database Generator', url=gui_path, width=1000, height=750)
        app.window = window
        window.expose(app.get_units, app.start_generation, app.stop_generation)
        window.events.closed += app.cleanup_on_close
        
        webview.start()

if __name__ == "__main__":
    main()