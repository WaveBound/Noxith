const unitDatabase = [];
const _originalPush = unitDatabase.push;
unitDatabase.push = function (unit) {
    // 1. Browser: Grab the filename from the currently loading <script> tag
    if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
        const parts = document.currentScript.src.split('/');
        unit._fileName = parts[parts.length - 1].replace('.js', '');
    }
    // 2. Python Generator: Grab the filename from the injected global variable
    else if (typeof global !== 'undefined' && global.__currentUnitFile) {
        unit._fileName = global.__currentUnitFile;
    }

    // Dynamic Balance: Reduce all dotDurations by 1 tick/second
    (function() {
        const changes = new Map();

        const findAndReduce = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
                obj.forEach(item => findAndReduce(item));
                return;
            }
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey === 'dotduration' && typeof obj[key] === 'number') {
                        const oldDur = obj[key];
                        if (oldDur > 0) {
                            const newDur = oldDur - 1;
                            obj[key] = newDur;
                            changes.set(oldDur, newDur);
                        }
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        findAndReduce(obj[key]);
                    }
                }
            }
        };

        const updateStrings = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
                obj.forEach((item, idx) => {
                    if (typeof item === 'string') {
                        obj[idx] = replaceText(item);
                    } else {
                        updateStrings(item);
                    }
                });
                return;
            }
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (typeof obj[key] === 'string') {
                        obj[key] = replaceText(obj[key]);
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        updateStrings(obj[key]);
                    }
                }
            }
        };

        const replaceText = (text) => {
            let newText = text;
            changes.forEach((newDur, oldDur) => {
                newText = newText
                    .replace(new RegExp(`\\b${oldDur}\\s*ticks\\b`, 'gi'), `${newDur} ticks`)
                    .replace(new RegExp(`\\b${oldDur}\\s*seconds\\b`, 'gi'), `${newDur} seconds`)
                    .replace(new RegExp(`over ${oldDur} ticks`, 'gi'), `over ${newDur} ticks`)
                    .replace(new RegExp(`over ${oldDur} seconds`, 'gi'), `over ${newDur} seconds`);
            });
            return newText;
        };

        findAndReduce(unit);
        if (changes.size > 0) {
            updateStrings(unit);
        }
    })();

    return _originalPush.call(this, unit);
};
// ============================================================================
// UNIT FILE MANIFEST
// To add a new unit: add its filename to this array. That's it.
// ============================================================================
const UNIT_FILES = [
    'sukuna.js',
    'Jingliu.js',
    'Maid.js',
    'ace.js',
    'akainu.js',
    'ancient_mage.js',
    'ancient_shinob.js',
    'ant_king_savage.js',
    'cell.js',
    'crow_shinobi.js',
    'esdeath.js',
    'first_emperor.js',
    'genos.js',
    'grimjaw.js',
    'harribel.js',
    'ichigo.js',
    'kenpachi.js',
    'king_sailor.js',
    'kirito.js',
    'law.js',
    'majestic_armor.js',
    'megumin.js',
    'mob.js',
    'nutaru_beast.js',
    'phantom_captain.js',
    'prodigy_mage.js',
    'ragna.js',
    'rohan.js',
    'sasuke.js',
    'sasuke_great_war.js',
    'shanks.js',
    'sharpshooter.js',
    'sjw.js',
    'stark.js',
    'super_roku.js',
    'trunks.js',
    'ulquiorra.js',
    'underworld_god.js',
    'unparalleled_armor.js',
    'vegeta.js',
    'water_god.js',
    'devil_hunter.js',
    'strongest_of_today.js',
    'alpha_devil.js',
    'mimicry_sorcerer.js',
    'jinoo_shadow_monarch.js',
    'enlightened_god.js',
    'triple_threat.js',
    'mochi_pirate.js',
    'joyful_captain.js',
    'gluttonous_warlord.js',
    'quake_warlord.js'
];

// Resolves after every unit script has loaded (or errored).
// init.js waits on this before calling initApp().
window.__unitsReady = new Promise(function (resolve) {
    let remaining = UNIT_FILES.length;
    if (remaining === 0) { resolve(); return; }

    function done() { if (--remaining === 0) resolve(); }

    UNIT_FILES.forEach(function (file) {
        const s = document.createElement('script');
        s.src = 'units/' + file;
        s.onload = done;
        s.onerror = done; // count errors so we never hang
        document.head.appendChild(s);
    });
});
