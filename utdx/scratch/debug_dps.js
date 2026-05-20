// Mock window environment
global.window = global;
global.statConfig = {
    applyRelicDmg: true,
    applyRelicSpa: true,
    applyRelicCrit: true,
    applyRelicDot: true
};

// Load databases and functions
const fs = require('fs');
const path = require('path');

// Helper to eval file in global context
function loadFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    // Remove const/let at top level so they become global
    const modifiedCode = code
        .replace(/^(const|let) /gm, '')
        .replace(/^(window\.)/gm, '')
        .replace(/^(const|let|var) (unitDatabase|SETS|PERFECT_SUBS|MAX_SUB_STAT_VALUES|MAIN_STAT_VALS) =/gm, '$2 =')
        .replace(/function\s+([a-zA-Z0-9_]+)\s*\(/g, 'global.$1 = function(');
    eval(modifiedCode);
}

// Mock other dependencies
global.getCachedHotbarStats = () => ({ ugPresent: false });
global.isUnit = (id, target) => id === target;

// Load constants, utils, math files
global.unitDatabase = [];
loadFile(path.join(__dirname, '../backend/constants.js'));
loadFile(path.join(__dirname, '../backend/data/config.js'));
loadFile(path.join(__dirname, '../backend/utils.js'));
loadFile(path.join(__dirname, '../shared/traits/traits.js'));
loadFile(path.join(__dirname, '../shared/traits/trait-backend.js'));
loadFile(path.join(__dirname, '../shared/relics/relics.js'));
loadFile(path.join(__dirname, '../shared/relics/relic-backend.js'));
loadFile(path.join(__dirname, '../shared/passives/passive-backend.js'));
loadFile(path.join(__dirname, '../backend/math/lookups.js'));
loadFile(path.join(__dirname, '../backend/math/core-math.js'));
loadFile(path.join(__dirname, '../backend/math/context-builder.js'));
loadFile(path.join(__dirname, '../backend/math/calculations.js'));

// Load the unit
loadFile(path.join(__dirname, '../units/triple_threat.js'));

// Load build runner (contains getBenchmarkDps)
loadFile(path.join(__dirname, '../backend/math/build-runner.js'));

// Load the database
loadFile(path.join(__dirname, '../databases/db_base.js'));

// Run and debug
console.log("Unit loaded:", unitDatabase[0].name);

const dbKey = 'triple_threat';
const dbEntry = STATIC_BUILD_DB[dbKey];
if (!dbEntry) {
    console.error("No dbEntry found for triple_threat!");
    process.exit(1);
}

const perfectBuild = dbEntry.fixed[0][0];
console.dir(perfectBuild, { depth: null });

// Let's run reconstructMathData on this perfect build
const reconstructed_base_10star = reconstructMathData(perfectBuild, undefined, { isAbility: false, starMult: 2.5 });
console.log("Reconstructed BASE 10-star DPS:", reconstructed_base_10star.total);

const reconstructed_abil_10star = reconstructMathData(perfectBuild, undefined, { isAbility: true, starMult: 2.5 });
console.log("Reconstructed ABIL 10-star DPS:", reconstructed_abil_10star.total);

const benchmark = getBenchmarkDps('triple_threat', 'Ruler', 1, false);
console.log("Benchmark DPS returned:", benchmark);

// Let's run a verbose simulation of getBenchmarkDps
console.log("\n--- VERBOSE RUN (isAbility = false) ---");
const unit = unitDatabase[0];
const trait = getTraitByName('Ruler', 'triple_threat') || getTraitFast('Ruler');
const { effectiveStats, context } = buildCalculationContext(unit, trait, { isAbility: false });

console.log("Effective base stats at max level:", {
    dmg: effectiveStats.dmg,
    spa: effectiveStats.spa,
    range: effectiveStats.range,
    crit: effectiveStats.crit,
    cdmg: effectiveStats.cdmg
});

SETS.forEach(set => {
    ['dmg', 'spa', 'range', 'cm', 'cf', 'dot'].forEach(masterStat => {
        let benchStats = { set: set.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
        
        const getBestMain = (slotMains) => {
            let bestMain = 'dmg';
            let bestDps = 0;
            Object.keys(slotMains).forEach(mKey => {
                let temp = { ...benchStats, [mKey]: slotMains[mKey] };
                let res = calculateDPS(effectiveStats, temp, context);
                if (res.total > bestDps) { bestDps = res.total; bestMain = mKey; }
            });
            return bestMain;
        };
        
        const bestBodyMain = getBestMain(MAIN_STAT_VALS.body);
        const bestLegMain = getBestMain(MAIN_STAT_VALS.legs);
        
        benchStats[bestBodyMain] = (benchStats[bestBodyMain]||0) + MAIN_STAT_VALS.body[bestBodyMain];
        benchStats[bestLegMain] = (benchStats[bestLegMain]||0) + MAIN_STAT_VALS.legs[bestLegMain];
        benchStats[masterStat] = (benchStats[masterStat]||0) + MAX_SUB_STAT_VALUES[masterStat];
        
        let fillers = ['dmg', 'spa', 'range', 'cm', 'cf', 'dot'].filter(c => c !== masterStat && c !== bestBodyMain && c !== bestLegMain);
        let fillerDpsMap = fillers.map(fKey => {
            let temp = { ...benchStats, [fKey]: PERFECT_SUBS[fKey] };
            return { key: fKey, dps: calculateDPS(effectiveStats, temp, context).total };
        }).sort((a, b) => b.dps - a.dps);

        fillerDpsMap.slice(0, 3).forEach(f => benchStats[f.key] = (benchStats[f.key]||0) + PERFECT_SUBS[f.key]);

        let finalRes = calculateDPS(effectiveStats, benchStats, context);
        if (finalRes.total > 400000 || set.id === 'warlord') {
            console.log(`Set: ${set.name}, Master: ${masterStat}, Mains: [Body: ${bestBodyMain}, Legs: ${bestLegMain}]`);
            console.log(`Stats:`, benchStats);
            console.log(`DPS: ${finalRes.total}`);
        }
    });
});
