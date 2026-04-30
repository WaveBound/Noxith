import os
import subprocess
import sys
import json
import itertools
import time
import threading
import shutil
import tempfile
from concurrent.futures import ProcessPoolExecutor, as_completed
import webview

# Force terminal to accept UTF-8 so emojis don't crash Windows console
if sys.stdout.encoding.lower() != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

REQUIRED_FILES = [
    "modules/state.js",
    "data.js",
    "modules/constants.js",
    "modules/utils.js",
    "math.js",
    "modules/calculations.js"
]

GENERATOR_SCRIPT = """
const fs = require('fs');
const os = require('os');
const { performance } = require('perf_hooks');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});

let buffConfig = {};
let outPath = 'static-database.js';
let targetUnits = []; // If empty, generate all
let threadsPerDb = os.cpus().length;

if (isMainThread) {
    buffConfig = JSON.parse(process.argv[2]);
    outPath = process.argv[3];
    const extraArgs = JSON.parse(process.argv[4]);
    targetUnits = extraArgs.targetUnits || [];
    threadsPerDb = extraArgs.threads || threadsPerDb;
} else {
    buffConfig = workerData.buffConfig;
}

// --- 1. NODE.JS POLYFILLS & MOCKS ---
global.window = global;

// Map Python configs to Window States
window.mikuActive = buffConfig.miku === '1';
window.waterGodActive = buffConfig.enlightenedgod === '1';
window.bijuuActive = buffConfig.bijuu === '1';
window.ancientMageActive = buffConfig.amage === '1';
window.kingSailorActive = buffConfig.ksailor === '1';
window.fernHillActive = buffConfig.mage === 'hill';
window.fernGroundActive = buffConfig.mage === 'ground';

global.btoa = function(str) {
    return Buffer.from(str, 'binary').toString('base64');
};
global.atob = function(str) {
    return Buffer.from(str, 'base64').toString('binary');
};

// OPTIMIZED: Only calculate Max Potential (Head + Subs)
const CONFIGS = [
    { head: true,  subs: true }
];

if (isMainThread) {
    // ==========================================
    // MAIN THREAD: Orchestration & Compression
    // ==========================================
    
    // 1. Try to load existing data
    let existingRaw = null;
    if (fs.existsSync(outPath) && targetUnits.length > 0) {
        try {
            const content = fs.readFileSync(outPath, 'utf-8');
            const match = content.match(/const RAW = (\\{.*?\\});/s);
            if (match) {
                existingRaw = JSON.parse(match[1]);
            }
        } catch (e) {
            console.error("Failed to parse existing DB:", e);
        }
    }

    const tasks = [];
    unitDatabase.forEach(u => {
        // If targetUnits is specified, only add to tasks if u.id is in it
        const isTarget = targetUnits.length === 0 || targetUnits.includes(u.id);
        if (isTarget) {
            tasks.push({ u, isCard: false });
            if(u.id === 'kirito') tasks.push({ u, isCard: true });
        }
    });

    const numCores = Math.max(1, threadsPerDb || 1);
    const chunks = Array.from({ length: Math.min(tasks.length, numCores) }, () => []);
    
    if (tasks.length > 0 && chunks.length > 0) {
        tasks.forEach((task, i) => chunks[i % chunks.length].push(task));

        let activeWorkers = 0;
        const mergedRawDb = {};

        chunks.forEach((chunk, i) => {
            if (chunk.length === 0) return;
            activeWorkers++;
            
            const worker = new Worker(__filename, { workerData: { chunk, workerId: i + 1, buffConfig } });
            
            worker.on('message', (msg) => {
                if (msg.type === 'done') {
                    Object.assign(mergedRawDb, msg.data);
                }
            });

            worker.on('error', err => {
                console.error(`Worker ${i+1} Error:`, err);
            });
            worker.on('exit', () => {
                activeWorkers--;
                if (activeWorkers === 0) finalizeDatabase(mergedRawDb);
            });
        });
    } else {
        finalizeDatabase({});
    }

    function finalizeDatabase(rawDb) {
        const MAP_PRIO = { 'dmg': 0, 'spa': 1, 'range': 2, 'raw_dmg': 3 };
        const MAP_BODY = { 'dmg': 0, 'dot': 1, 'cm': 2 };
        const MAP_LEGS = { 'dmg': 0, 'spa': 1, 'cf': 2, 'range': 3 };
        const MAP_HEAD = { 'none': 0, 'sun_god': 1, 'ninja': 2, 'reaper_necklace': 3, 'shadow_reaper_necklace': 4, 'junior': 5, 'biju_head': 6, 'rebellious_head': 7, 'reanimated_head': 8, 'mage_head': 9 };

        const stringPool = new Map();
        const stringArr = [""]; 
        const subPool = new Map();
        const subArr = [null]; 

        const encodeStr = (val) => {
            if (!val) return 0;
            const s = String(val);
            if (!stringPool.has(s)) { stringPool.set(s, stringArr.length); stringArr.push(s); }
            return stringPool.get(s);
        };

        const encodeSubs = (s) => {
            if (!s) return 0;
            const transform = (list) => (list||[]).map(i => [encodeStr(i.type), i.val]);
            const compact = [transform(s.head), transform(s.body), transform(s.legs), s.selectedHead ? encodeStr(s.selectedHead) : 0];
            const sig = JSON.stringify(compact);
            if (!subPool.has(sig)) { subPool.set(sig, subArr.length); subArr.push(compact); }
            return subPool.get(sig);
        };

        const ROW_SIZE = 18;
        const rowsToBuffer = (rows) => {
            const buffer = new ArrayBuffer(rows.length * ROW_SIZE);
            const view = new DataView(buffer);
            rows.forEach((r, i) => {
                const offset = i * ROW_SIZE;
                const meta = (MAP_PRIO[r.prio] || 0) | ((MAP_BODY[r.mainStats.body] || 0) << 2) | ((MAP_LEGS[r.mainStats.legs] || 0) << 4) | ((MAP_HEAD[r.headUsed || 'none'] || 0) << 6) | ((r.isCustom ? 1 : 0) << 10);

                view.setUint8(offset, encodeStr(r.traitName));
                view.setUint8(offset + 1, encodeStr(r.setName));
                view.setFloat32(offset + 2, r.dps || 0, true); 
                view.setUint16(offset + 6, Math.round((r.spa || 1) * 1000), true);
                view.setUint16(offset + 8, Math.round((r.range || 0) * 10), true);
                view.setUint16(offset + 10, meta, true);
                view.setUint16(offset + 12, encodeSubs(r.subStats || {}), true);
                view.setFloat32(offset + 14, r.dmgVal || 0, true);
            });
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        };

        // 2. Integration of existing data
        const FINAL_DB = {};
        
        // Helper to decompress and re-pool old data
        const reIndexUnit = (unitKey) => {
            if (!existingRaw || !existingRaw.d[unitKey]) return;
            const oldData = existingRaw.d[unitKey];
            const oldS = existingRaw.s;
            const oldP = existingRaw.p;
            
            const PRIO = ['dmg', 'spa', 'range', 'raw_dmg'];
            const BODY = ['dmg', 'dot', 'cm'];
            const LEGS = ['dmg', 'spa', 'cf', 'range'];
            const HEAD = ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'mage_head'];

            const processB64List = (list) => {
                return list.map(b64 => {
                    const bin = atob(b64);
                    const view = new DataView(new Uint8Array(bin.split('').map(c => c.charCodeAt(0))).buffer);
                    const count = view.byteLength / ROW_SIZE;
                    const rows = [];
                    for (let i = 0; i < count; i++) {
                        const off = i * ROW_SIZE;
                        const meta = view.getUint16(off + 10, true);
                        const subId = view.getUint16(off + 12, true);
                        
                        let subs = undefined;
                        if (subId !== 0) {
                            const rS = oldP[subId];
                            const mapS = (l) => l.map(x => ({ type: oldS[x[0]], val: x[1] }));
                            subs = { head: mapS(rS[0]), body: mapS(rS[1]), legs: mapS(rS[2]), selectedHead: rS[3] ? oldS[rS[3]] : undefined };
                        }
                        
                        rows.push({
                            traitName: oldS[view.getUint8(off)],
                            setName: oldS[view.getUint8(off + 1)],
                            dps: view.getFloat32(off + 2, true),
                            spa: view.getUint16(off + 6, true) / 1000,
                            range: view.getUint16(off + 8, true) / 10,
                            prio: PRIO[meta & 3],
                            mainStats: { body: BODY[(meta >> 2) & 3], legs: LEGS[(meta >> 4) & 3] },
                            headUsed: HEAD[(meta >> 6) & 15],
                            isCustom: !!((meta >> 10) & 1),
                            subStats: subs,
                            dmgVal: view.getFloat32(off + 14, true)
                        });
                    }
                    return rowsToBuffer(rows);
                });
            };

            FINAL_DB[unitKey] = {
                fixed: processB64List(oldData.fixed),
                bugged: processB64List(oldData.bugged)
            };
        };

        // Combine new and old
        // List of all units that should be in the DB
        const allPossibleKeys = new Set();
        unitDatabase.forEach(u => {
            allPossibleKeys.add(u.id);
            if(u.id === 'kirito') allPossibleKeys.add('kirito_card');
            if(u.ability) {
                allPossibleKeys.add(u.id + '_abil');
                if(u.id === 'kirito') allPossibleKeys.add('kirito_card_abil');
            }
        });

        for (const key of allPossibleKeys) {
            if (rawDb[key]) {
                // Use new data
                FINAL_DB[key] = {
                    fixed: rawDb[key].fixed.map(configRows => rowsToBuffer(configRows)),
                    bugged: rawDb[key].bugged.map(configRows => rowsToBuffer(configRows))
                };
            } else if (existingRaw && existingRaw.d[key]) {
                // Use old data (re-indexed)
                reIndexUnit(key);
            }
        }

        const payload = { s: stringArr, p: subArr, d: FINAL_DB };
        const payloadStr = JSON.stringify(payload);

        const fileContent = `(function() {
    const RAW = ${payloadStr};
    const S = RAW.s;
    const P = RAW.p;
    const D = RAW.d;

    const PRIO = ['dmg', 'spa', 'range', 'raw_dmg'];
    const BODY = ['dmg', 'dot', 'cm'];
    const LEGS = ['dmg', 'spa', 'cf', 'range'];
    const HEAD = ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'mage_head'];
    const DESC_BODY = ['Dmg', 'DoT', 'Crit Dmg'];
    const DESC_LEGS = ['Dmg', 'Spa', 'Crit Rate', 'Range'];
    const ROW_SIZE = 18;

    const decode = (b64) => {
        const bin = atob(b64);
        const len = bin.length;
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
                            const bIdx = (meta >> 2) & 3;
                            const lIdx = (meta >> 4) & 3;
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
                target[prop] = { bugged: unpackList(rawData.bugged, "b"), fixed: unpackList(rawData.fixed, "f") };
                D[prop] = null;
                return target[prop];
            }
            return undefined;
        }
    });
})();`;

        fs.writeFileSync(outPath, fileContent);
    }

} else {
    // ==========================================
    // WORKER THREAD: High Speed Math Evaluation
    // ==========================================
    process.on('uncaughtException', (err) => {
        console.error('WORKER CRITICAL ERROR:', err);
        process.exit(1);
    });
    
    const { chunk } = workerData;
    
    statConfig.applyRelicDot = true; 
    statConfig.applyRelicCrit = true; 
    
    // TEMPLATE GENERATOR: Creates all physical combinations exactly once
    const PRECALC_TEMPLATES = {};
    
    function generateTemplates(includeSubs, allowedHeads, allowDot) {
        const templates = [];
        const cands = allowDot ? ['dmg', 'spa', 'cm', 'cf', 'dot', 'range'] : ['dmg', 'spa', 'cm', 'cf', 'range'];
        const baseBuilds = globalBuilds.filter(b => allowDot || b.dot === 0);

        let strategies = [];
        if (!includeSubs) {
            strategies.push({ p: null, s: null, ratio: { p: 0, s: 0 } });
        } else {
            cands.forEach(c => strategies.push({ p: c, s: c, ratio: { p: 6, s: 0 } }));
            const pairs = [['dmg', 'cf'], ['dmg', 'spa'], ['dmg', 'range'], ['dmg', 'cm'], ['cf', 'cm'], ['spa', 'range']];
            const ratios = [{ p: 4, s: 3 }, { p: 3, s: 4 }, { p: 5, s: 2 }, { p: 2, s: 5 }];
            pairs.forEach(pair => {
                const [c1, c2] = pair;
                if (cands.includes(c1) && cands.includes(c2)) ratios.forEach(r => strategies.push({ p: c1, s: c2, ratio: r }));
            });
        }

        baseBuilds.forEach(build => {
            allowedHeads.forEach(headType => {
                if(!allowDot && headType === 'ninja') return; 

                strategies.forEach(strat => {
                    let totalStats = { ...build };
                    let currentAssignments = {};
                    
                    const applyContextualStats = (b, pieceName, mainStat, pStat, sStat, ratio) => {
                        if (!pStat) return { pStat: null, pVal: 0, sStat: null, sVal: 0 };
                        let pWeight = ratio.p; let sWeight = ratio.s; 
                        
                        if (pStat === mainStat) { sWeight = Math.min(6, sWeight + pWeight); pWeight = 0; } 
                        else if (sStat === mainStat) { pWeight = Math.min(6, pWeight + sWeight); sWeight = 0; }
                        if (pStat === mainStat && sStat === mainStat) { pWeight = 0; sWeight = 0; }

                        let pVal = 0, sVal = 0;
                        if (pWeight > 0) { pVal = PERFECT_SUBS[pStat] * pWeight; b[pStat] = (b[pStat] || 0) + pVal; }
                        if (sWeight > 0) { sVal = PERFECT_SUBS[sStat] * sWeight; b[sStat] = (b[sStat] || 0) + sVal; }

                        cands.forEach(cand => {
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

                    if (headType !== 'none') currentAssignments.head = formatAssignment(applyContextualStats(totalStats, 'head', null, strat.p, strat.s, strat.ratio));
                    currentAssignments.body = formatAssignment(applyContextualStats(totalStats, 'body', build.bodyType, strat.p, strat.s, strat.ratio));
                    currentAssignments.legs = formatAssignment(applyContextualStats(totalStats, 'legs', build.legType, strat.p, strat.s, strat.ratio));
                    currentAssignments.selectedHead = headType;

                    templates.push({ stats: totalStats, meta: { buildName: build.name, bodyType: build.bodyType, legType: build.legType, headUsed: headType, assignments: currentAssignments } });
                });
            });
        });
        return templates;
    }

    function fastCalculateUnitBuilds(unit, cfg, traitsForCalc, isAbility) {
        const upgradeLevel = (unit.upgrades && unit.upgrades.length > 0) ? unit.upgrades.length - 1 : 0;
        const { effectiveStats, isKiritoVR, suffix } = buildCalculationContext(unit, 'ruler', { isAbility, upgradeLevel });
        const hasNativeDoT = (effectiveStats.dot > 0) || (effectiveStats.burnMultiplier > 0) || isKiritoVR;

        const allowedHeads = cfg.head ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'rebellious_head', 'reanimated_head', 'mage_head'] : ['none'];
        let unitResults = [];

        traitsForCalc.forEach(trait => {
            if (trait.id === 'none') return;
            const { effectiveStats, context } = buildCalculationContext(unit, trait, { isAbility, mode: 'fixed' });
            const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
            const isDotPossible = hasNativeDoT || traitAddsDot;
            
            const templatesKey = `${cfg.subs}-${isDotPossible}-${cfg.head}`;
            let templates = PRECALC_TEMPLATES[templatesKey];
            if(!templates) {
                templates = generateTemplates(cfg.subs, allowedHeads, isDotPossible);
                PRECALC_TEMPLATES[templatesKey] = templates;
            }

            const maxPts = (unit.id === 'king_sailor') ? 129 : 99;
            const pointConfigs = [
                { prio: 'dmg', d: maxPts, s: 0, r: 0, opt: 'dps' },
                { prio: 'spa', d: 0, s: maxPts, r: 0, opt: 'dps' },
                { prio: 'range', d: 0, s: 0, r: 99, opt: 'range' },
                { prio: 'raw_dmg', d: maxPts, s: 0, r: 0, opt: 'raw_dmg' }
            ];

            pointConfigs.forEach(pc => {
                context.dmgPoints = pc.d; context.spaPoints = pc.s; context.rangePoints = pc.r;
                effectiveStats.context = context;
                
                const bestByBase = new Map(); 
                
                for(let i=0; i<templates.length; i++) {
                    const t = templates[i];
                    context.headPiece = t.meta.headUsed;
                    
                    const res = calculateDPS(effectiveStats, t.stats, context);
                    if(isNaN(res.total)) continue;
                    
                    const key = t.meta.buildName + "_" + t.meta.headUsed;
                    let currentBest = bestByBase.get(key);
                    
                    let isBetter = false;
                    if (!currentBest) isBetter = true;
                    else if (pc.opt === 'range') isBetter = (res.range > currentBest.res.range) || (res.range === currentBest.res.range && res.total > currentBest.res.total);
                    else if (pc.opt === 'raw_dmg') isBetter = (res.dmgVal > currentBest.res.dmgVal) || (res.dmgVal === currentBest.res.dmgVal && res.total > currentBest.res.total);
                    else isBetter = (res.total > currentBest.res.total);
                    
                    if (isBetter) bestByBase.set(key, { res, meta: t.meta });
                }

                bestByBase.forEach((best, MapKey) => {
                    unitResults.push({
                        setName: best.meta.buildName.split('(')[0].trim(),
                        buildName: best.meta.buildName, 
                        traitName: trait.name, 
                        dps: best.res.total, 
                        dmgVal: best.res.dmgVal,
                        spa: best.res.spa, 
                        range: best.res.range, 
                        prio: pc.prio, 
                        mainStats: { body: best.meta.bodyType, legs: best.meta.legType },
                        subStats: best.meta.assignments, 
                        headUsed: best.meta.headUsed, 
                        isCustom: trait.isCustom
                    });
                });
            });
        });
        
        return unitResults;
    }

    const workerDb = {};

    chunk.forEach((task) => {
        const { u, isCard } = task;
        let baseKey = u.id;
        if(u.id === 'kirito' && isCard) baseKey = 'kirito_card';
        
        const types = u.ability ? ['base', 'abil'] : ['base'];
        const isLaw = u.id === 'law';
        
        const sortFn = isLaw 
            ? (a, b) => {
                if (b.range !== a.range) return (b.range || 0) - (a.range || 0);
                return (b.dps || 0) - (a.dps || 0);
            }
            : (a, b) => {
                if (b.dps !== a.dps) return (b.dps || 0) - (a.dps || 0);
                return (b.dmgVal || 0) - (a.dmgVal || 0);
            };

        types.forEach(type => {
            const finalKey = (type === 'abil') ? `${baseKey}_abil` : baseKey;
            workerDb[finalKey] = { fixed: [], bugged: [] }; 

            if (u.id === 'bambietta') bambiettaState.element = "Dark"; 
            if (u.id === 'robot1718') robot1718State.mode = "Robot 17";
            if (u.id === 'kirito') { kiritoState.realm = true; kiritoState.card = isCard; }

            const traitsForCalc = [...traitsList, ...(unitSpecificTraits[u.id] || [])];
            const isAbility = (type === 'abil');

            CONFIGS.forEach(cfg => {
                const results = fastCalculateUnitBuilds(u, cfg, traitsForCalc, isAbility);

                const traitGroups = {};
                for (const res of results) {
                    if (!traitGroups[res.traitName]) traitGroups[res.traitName] = [];
                    traitGroups[res.traitName].push(res);
                }

                const guaranteedBuilds = [];
                const remainingPool = [];
                
                for (const trait in traitGroups) {
                    const list = traitGroups[trait];
                    list.sort(sortFn);
                    guaranteedBuilds.push(...list.slice(0, 8)); 
                    remainingPool.push(...list.slice(8, 100)); 
                }

                remainingPool.sort(sortFn);
                
                let finalBuilds = [...guaranteedBuilds, ...remainingPool];
                finalBuilds.sort(sortFn);
                finalBuilds = finalBuilds.slice(0, 300);

                workerDb[finalKey].fixed.push(finalBuilds);
                workerDb[finalKey].bugged.push(finalBuilds); 
            });
        });
    });

    parentPort.postMessage({ type: 'done', data: workerDb });
}
"""

def get_db_name(combo):
    parts = []
    if combo[0] == '1': parts.append('miku')
    if combo[1] == '1': parts.append('enlightenedgod')
    if combo[2] == '1': parts.append('bijuu')
    if combo[3] == '1': parts.append('amage')
    if combo[4] == '1': parts.append('ksailor')
    if combo[5] == 'hill': parts.append('magehill')
    elif combo[5] == 'ground': parts.append('mageground')

    if not parts:
        return "db_base.js"
    return "db_" + "_".join(parts) + ".js"

def run_combo(args):
    """Run a single buff combination as a subprocess. Safe to call in parallel."""
    i, combo, total_runs, temp_runner, target_units, threads = args
    buff_config = {
        'miku': combo[0],
        'enlightenedgod': combo[1],
        'bijuu': combo[2],
        'amage': combo[3],
        'ksailor': combo[4],
        'mage': combo[5]
    }
    out_name = get_db_name(combo)
    out_path = os.path.join("databases", out_name)
    if not os.path.exists("databases") and os.path.exists("utdx/databases"):
        out_path = os.path.join("utdx", "databases", out_name)
        
    start_t = time.time()
    
    extra_args = {
        "targetUnits": target_units,
        "threads": threads
    }

    process = subprocess.run(
        ["node", temp_runner, json.dumps(buff_config), out_path, json.dumps(extra_args)],
        capture_output=True, text=True, encoding="utf-8"
    )

    elapsed = time.time() - start_t
    if process.returncode != 0:
        return (False, out_name, elapsed, process.stdout, process.stderr)
    return (True, out_name, elapsed, None, None)

class GeneratorApp:
    def __init__(self):
        self.is_running = False
        self.units = []
        self._load_units()
        self.window = None 
        self.executor = None
        self.temp_dir = None

    def _load_units(self):
        # Extract units for the UI
        units_dir = 'units'
        if not os.path.exists(units_dir):
            units_dir = os.path.join('utdx', 'units')
        
        if os.path.exists(units_dir):
            for u_file in sorted(os.listdir(units_dir)):
                if u_file.endswith('.js'):
                    path = os.path.join(units_dir, u_file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            import re
                            id_match = re.search(r"id:\s*['\"](.*?)['\"]", content)
                            name_match = re.search(r"name:\s*['\"](.*?)['\"]", content)
                            img_match = re.search(r"img:\s*['\"](.*?)['\"]", content)
                            
                            uid = id_match.group(1) if id_match else u_file.replace('.js', '')
                            uname = name_match.group(1) if name_match else uid
                            uimg = img_match.group(1) if img_match else ""
                            
                            self.units.append({"id": str(uid), "name": str(uname), "img": str(uimg)})
                    except:
                        continue

    def get_units(self):
        return self.units

    def start_generation(self, selected_units, threads, parallel):
        if self.is_running:
            return "Already running"
        
        self.is_running = True
        try:
            thr = int(threads)
            par = int(parallel)
            sel = [str(u) for u in selected_units]
            threading.Thread(target=self._run_logic, args=(sel, thr, par), daemon=True).start()
        except Exception as e:
            self.is_running = False
            return str(e)
        return "Started"

    def stop(self):
        self.is_running = False
        if self.executor:
            # Shutdown executor immediately and cancel pending tasks
            self.executor.shutdown(wait=False, cancel_futures=True)
            self.executor = None
        
        # Cleanup temporary directory
        if self.temp_dir and os.path.exists(self.temp_dir):
            try: shutil.rmtree(self.temp_dir, ignore_errors=True)
            except: pass

    def _run_logic(self, selected_units, threads, parallel):
        try:
            # 1. Prepare combined JS
            # Polyfills to make Node.js act like a browser for the game logic
            combined_js = "// NODE.JS POLYFILLS\nif (typeof window === 'undefined') { global.window = global; }\n"
            combined_js += "if (typeof document === 'undefined') {\n"
            combined_js += "  global.document = { createElement: () => ({}), head: { appendChild: () => {} } };\n"
            combined_js += "}\n\n"
            
            # Ensure these variables exist without causing SyntaxErrors if they are in files
            combined_js += "global.unitDatabase = global.unitDatabase || [];\n"
            combined_js += "global.unitSpecificTraits = global.unitSpecificTraits || {};\n"
            combined_js += "global.bambiettaState = global.bambiettaState || {element:'Dark'};\n"
            combined_js += "global.robot1718State = global.robot1718State || {mode:'Robot 17'};\n"
            combined_js += "global.kiritoState = global.kiritoState || {realm:true, card:false};\n"
            
            for filename in REQUIRED_FILES:
                file_path = filename
                if not os.path.exists(file_path):
                    if filename.startswith("utdx/"):
                        alt_path = filename[5:]
                        if os.path.exists(alt_path): file_path = alt_path
                    elif os.path.exists(os.path.join("utdx", filename)):
                        file_path = os.path.join("utdx", filename)
                
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        combined_js += f.read() + "\n"
            
            units_dir = 'units'
            if not os.path.exists(units_dir): units_dir = os.path.join('utdx', 'units')
            if os.path.exists(units_dir):
                for u_file in sorted(os.listdir(units_dir)):
                    if u_file.endswith('.js'):
                        with open(os.path.join(units_dir, u_file), "r", encoding="utf-8") as f:
                            combined_js += f.read() + "\n"

            combined_js += GENERATOR_SCRIPT
            # Write the runner to the temp directory instead of the workspace
            temp_runner = os.path.join(self.temp_dir, "db_runner.js")
            with open(temp_runner, "w", encoding="utf-8") as f:
                f.write(combined_js)

            # 2. Combinations
            combinations = list(itertools.product(
                ['0', '1'], ['0', '1'], ['0', '1'], ['0', '1'], ['0', '1'],
                ['none', 'hill', 'ground']
            ))
            total_runs = len(combinations)
            
            db_dir = "databases"
            if not os.path.exists("utdx") and os.path.exists("modules"): db_dir = "databases"
            elif os.path.exists("utdx"): db_dir = os.path.join("utdx", "databases")
            os.makedirs(db_dir, exist_ok=True)

            overall_start = time.time()
            args_list = [(i, combo, total_runs, temp_runner, selected_units, threads) for i, combo in enumerate(combinations)]

            completed = 0
            self.executor = ProcessPoolExecutor(max_workers=parallel)
            futures = {self.executor.submit(run_combo, args): args for args in args_list}
            
            for future in as_completed(futures):
                if not self.is_running: break
                try:
                    success, out_name, elapsed, stdout, stderr = future.result()
                    completed += 1
                    progress = (completed / total_runs) * 100
                    self.window.evaluate_js(f"updateProgress({progress}, '{out_name}')")
                    if not success:
                        self.window.evaluate_js(f"alert('Failed on {out_name}')")
                        break
                except Exception:
                    break

            if os.path.exists(temp_runner):
                os.remove(temp_runner)
            
            if self.is_running:
                self.window.evaluate_js(f"onComplete({time.time() - overall_start})")
        except Exception as e:
            if self.is_running:
                self.window.evaluate_js(f"alert('Error: {str(e)}')")
        finally:
            self.is_running = False
            if self.executor:
                self.executor.shutdown(wait=False, cancel_futures=True)
                self.executor = None

HTML = """
<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --accent: #38bdf8;
            --text: #f8fafc;
            --text-dim: #94a3b8;
        }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        header {
            padding: 20px 40px;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }
        .title h1 { margin: 0; font-size: 1.5rem; color: var(--accent); }
        .title p { margin: 5px 0 0; font-size: 0.85rem; color: var(--text-dim); }
        
        .main-container {
            flex: 1;
            display: flex;
            overflow: hidden;
        }
        
        .sidebar {
            width: 300px;
            padding: 20px;
            background: rgba(30, 41, 59, 0.3);
            border-right: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .unit-grid {
            flex: 1;
            padding: 25px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 20px;
            overflow-y: auto;
            align-content: start;
        }
        
        .unit-card {
            background: var(--card-bg);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .unit-card:hover { 
            transform: translateY(-5px); 
            background: rgba(51, 65, 85, 0.9);
            border-color: var(--accent);
        }
        .unit-card.selected { 
            border-color: var(--accent); 
            background: rgba(56, 189, 248, 0.1);
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.15); 
        }
        .unit-card.selected::after {
            content: '✓';
            position: absolute;
            top: -8px; right: -8px;
            background: var(--accent);
            color: #0f172a;
            width: 24px; height: 24px;
            border-radius: 50%;
            font-size: 14px; line-height: 24px; font-weight: 800;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .unit-img {
            width: 80px; height: 80px;
            background: #000;
            border-radius: 12px;
            background-size: cover;
            background-position: center;
            border: 2px solid rgba(255,255,255,0.1);
        }
        .unit-name { 
            font-size: 0.85rem; 
            font-weight: 600; 
            color: var(--text); 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 1.2;
        }

        .control-group { display: flex; flex-direction: column; gap: 8px; }
        .control-group label { font-size: 0.85rem; color: var(--text-dim); }
        input[type="number"] {
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(255,255,255,0.1);
            color: var(--text);
            padding: 8px;
            border-radius: 6px;
            outline: none;
        }
        
        .btn {
            background: var(--accent);
            color: var(--bg);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn:hover { opacity: 0.9; transform: scale(1.02); }
        .btn:disabled { background: var(--text-dim); cursor: not-allowed; }
        
        .btn-outline {
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
        }
        
        .progress-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.9);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .progress-bar-container {
            width: 400px;
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        #progress-fill {
            height: 100%;
            background: var(--accent);
            width: 0%;
            transition: width 0.3s;
        }
        #progress-status { font-size: 0.9rem; color: var(--text-dim); }
        #progress-log { font-size: 0.8rem; color: var(--accent); margin-top: 10px; }
        
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
                <label>Threads per DB</label>
                <input type="number" id="threads" value="8" min="1" max="64">
                <small style="color: var(--text-dim); font-size: 0.7rem;">Internal worker threads for Node.js</small>
            </div>
            <div class="control-group">
                <label>Parallel DBs</label>
                <input type="number" id="parallel" value="4" min="1" max="16">
                <small style="color: var(--text-dim); font-size: 0.7rem;">Simultaneous database files generating</small>
            </div>
            <div style="margin-top: auto; padding: 15px; background: rgba(56, 189, 248, 0.05); border-radius: 8px;">
                <span style="font-size: 0.8rem; color: var(--accent);">Tip</span>
                <p style="font-size: 0.75rem; color: var(--text-dim); margin: 5px 0;">If files exist, only selected units will be recalculated. Others will be merged from the existing data.</p>
            </div>
        </div>
        <div class="unit-grid" id="unit-grid">
            <!-- Units injected here -->
        </div>
    </div>
    
    <div class="progress-overlay" id="overlay">
        <h2 id="progress-title">Generating Databases...</h2>
        <div class="progress-bar-container">
            <div id="progress-fill"></div>
        </div>
        <div id="progress-status">0 / 96 (0%)</div>
        <div id="progress-log">Initializing...</div>
    </div>

    <script>
        let units = [];
        let selected = new Set();
        
        window.addEventListener('pywebviewready', async () => {
            units = await pywebview.api.get_units();
            renderUnits();
        });
        
        function renderUnits() {
            const grid = document.getElementById('unit-grid');
            grid.innerHTML = units.map(u => `
                <div class="unit-card ${selected.has(u.id) ? 'selected' : ''}" onclick="toggleUnit('${u.id}')">
                    <div class="unit-img" style="background-image: url('${u.img}')"></div>
                    <span class="unit-name">${u.name}</span>
                </div>
            `).join('');
        }
        
        function toggleUnit(id) {
            if (selected.has(id)) selected.delete(id);
            else selected.add(id);
            renderUnits();
        }
        
        function selectAll(val) {
            if (val) units.forEach(u => selected.add(u.id));
            else selected.clear();
            renderUnits();
        }
        
        function start() {
            const threads = document.getElementById('threads').value;
            const parallel = document.getElementById('parallel').value;
            const selectedList = Array.from(selected);
            
            document.getElementById('overlay').style.display = 'flex';
            pywebview.api.start_generation(selectedList, threads, parallel);
        }
        
        function updateProgress(percent, log) {
            document.getElementById('progress-fill').style.width = percent + '%';
            document.getElementById('progress-status').innerText = Math.round(percent) + '%';
            document.getElementById('progress-log').innerText = 'Completed: ' + log;
        }
        
        function onComplete(time) {
            document.getElementById('progress-title').innerText = 'Generation Complete!';
            document.getElementById('progress-log').innerText = 'Successfully finished in ' + time.toFixed(2) + 's';
            document.getElementById('start-btn').innerText = 'Start Again';
            setTimeout(() => {
                document.getElementById('overlay').style.display = 'none';
                document.getElementById('progress-fill').style.width = '0%';
                document.getElementById('progress-status').innerText = '0%';
            }, 3000);
        }
    </script>
</body>
</html>
"""

def main():
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("❌ Error: Node.js is required to run this script.")
        sys.exit(1)

    app = GeneratorApp()
    
    # Create a temporary directory for all UI assets and runners
    app.temp_dir = tempfile.mkdtemp(prefix="utd_generator_")
    
    # Copy images to temp folder so they can be read with relative paths
    img_src = "images"
    if not os.path.exists(img_src) and os.path.exists("utdx/images"):
        img_src = "utdx/images"
    
    if os.path.exists(img_src):
        try:
            shutil.copytree(img_src, os.path.join(app.temp_dir, "images"))
        except Exception as e:
            print(f"⚠️ Warning: Could not copy images to temp folder: {e}")

    # Write HTML to temp folder
    gui_path = os.path.join(app.temp_dir, "index.html")
    with open(gui_path, "w", encoding="utf-8") as f:
        f.write(HTML)
    
    window = webview.create_window(
        'UTD Database Generator', 
        url=gui_path, 
        width=1000, 
        height=750
    )
    app.window = window
    
    # Expose functions directly
    window.expose(app.get_units, app.start_generation)
    
    # Ensure cleanup on window close
    window.events.closed += app.stop
    
    webview.start()

if __name__ == "__main__":
    main()