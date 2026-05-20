// ============================================================================
// UTILS.JS - Shared Helper Functions
// ============================================================================

const format = (n) =>
    n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' :
        n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' :
            n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' :
                n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const fix1 = (n) => parseFloat((n || 0).toFixed(1));
const fix2 = (n) => parseFloat((n || 0).toFixed(2));


// Resolve stat type from key/name (Normalization for UI/CSS)
function getStatType(key) {
    if (!key) return 'dmg';
    let k = key.toLowerCase();

    // Normalize Input IDs (subDmg -> dmg)
    if (k.startsWith('sub')) k = k.substring(3);

    if (k === 'potency' || k.includes('potency')) return 'potency';
    if (k === 'elemental' || k.includes('elem')) return 'elemental';

    if (k === 'dmg' || k === 'damage') return 'dmg';
    if (k === 'spa') return 'spa';

    // FIX: Map to 'cdmg' and 'crit' for CSS/Labels
    if (k === 'cm' || k.includes('crit dmg') || k.includes('crit damage') || k === 'cdmg') return 'cdmg';
    if (k === 'cf' || k.includes('crit rate') || k.includes('crit') || k === 'crit') return 'crit';

    if (k === 'dot') return 'dot';
    if (k.includes('range') || k === 'rng') return 'range';

    return 'dmg';
}

// Helper to map UI keys back to code keys for Limits (cm/cf)
function normalizeStatKey(key) {
    const type = getStatType(key);
    // Return keys matching MAX_SUB_STAT_VALUES in constants.js
    if (type === 'cdmg') return 'cm';
    if (type === 'crit') return 'cf';
    return type;
}

// Generate HTML badge for a single stat (MAIN STAT)
function getBadgeHtml(statKeyOrName, value = null) {
    if (!statKeyOrName || statKeyOrName === 'none' || statKeyOrName === 'null') return '<span class="badge-empty">-</span>';

    const type = getStatType(statKeyOrName);

    const borderClass = `border-${type}`;
    const gradClass = `grad-${type}`;
    const label = STAT_LABELS[type] || type.toUpperCase();

    const labelHtml = `<span class="${gradClass}">${label}</span>`;

    let valueHtml = '';
    if (value !== null && !isNaN(value)) {
        valueHtml = `<span class="badge-val val-main">${fix1(value)}%</span>`;
    }

    return `<div class="badge-base ${borderClass}" onclick="event.stopPropagation(); openInfoPopup('stat_${type}')">${labelHtml}${valueHtml}</div>`;
}

// Generate HTML for multi-stat sub-stats (SUB STAT / RICH BADGE)
function getRichBadgeHtml(statsArray) {
    if (!statsArray || statsArray.length === 0) return '<span class="badge-empty">None</span>';

    // Sort logic (Priority: Dmg > Range > Spa > Others)
    const priority = { 'dmg': 1, 'damage': 1, 'range': 2, 'spa': 3 };
    statsArray.sort((a, b) => {
        const pa = priority[getStatType(a.type)] || 99;
        const pb = priority[getStatType(b.type)] || 99;
        return pa - pb;
    });

    const primaryType = getStatType(statsArray[0].type);
    const containerBorder = `border-${primaryType}`;

    const parts = statsArray.map(stat => {
        const type = getStatType(stat.type);
        const valStr = fix1(stat.val) + '%';
        const label = STAT_LABELS[type] || type;
        const textClass = `text-${type}`;
        const gradClass = `grad-${type}`;

        return `<span class="${textClass} rb-inner" onclick="event.stopPropagation(); openInfoPopup('stat_${type}')"><span class="${gradClass}">${label}</span><span class="badge-val val-sub">${valStr}</span></span>`;
    });

    return `
    <div class="badge-base ${containerBorder}">
        ${parts.join('<span class="badge-sep">|</span>')}
    </div>`;
}

function getUnitImgHtml(unit, imgClass = '', iconSizeClass = '') {
    const el = unit.stats && unit.stats.element;
    const elIcon = el ? elementIcons[el] : null;
    if (!elIcon) return `<img src="${unit.img}" class="${imgClass}">`;
    return `<div class="unit-img-wrapper"><img src="${unit.img}" class="${imgClass}"><img src="${elIcon}" class="element-icon ${iconSizeClass}"></div>`;
}

// ============================================================================
// SHARED RELIC SCALING LOGIC
// ============================================================================

/**
 * Stores unscaled (1-star) value to prevent floating point drift.
 */
function trackBaseStatValue(input, currentStarMult) {
    const val = parseFloat(input.value);
    if (isNaN(val)) {
        input.removeAttribute('data-base-val');
        return;
    }
    const baseVal = val / (currentStarMult || 1);
    input.dataset.baseVal = baseVal.toFixed(6);
}

/**
 * Updates displayed value based on base value * new multiplier.
 */
function applyStarScalingToInput(input, newStarMult) {
    if (!input.dataset.baseVal && input.value !== '') {
        trackBaseStatValue(input, 1);
    }

    let rawKey = input.dataset.stat || input.id;
    const statKey = normalizeStatKey(rawKey);
    if (typeof PERFECT_SUBS !== 'undefined' && PERFECT_SUBS[statKey]) {
        input.step = PERFECT_SUBS[statKey] * newStarMult;
    }

    if (input.value === '') return;

    const base = parseFloat(input.dataset.baseVal);
    if (isNaN(base)) return;
    input.value = parseFloat((base * newStarMult).toFixed(3));
}

/**
 * Attaches scaling, clamping, and base-tracking logic to a stat input.
 */
function attachStatScaler(inputElement, getStarMultFn) {
    const updateStepAndMax = () => {
        let rawKey = inputElement.dataset.stat || inputElement.id;
        const statKey = normalizeStatKey(rawKey);
        const starMult = getStarMultFn();
        
        if (typeof PERFECT_SUBS !== 'undefined' && PERFECT_SUBS[statKey]) {
            inputElement.step = PERFECT_SUBS[statKey] * starMult;
            inputElement.min = "0";
        }
        
        const baseMaxValue = typeof MAX_SUB_STAT_VALUES !== 'undefined' ? MAX_SUB_STAT_VALUES[statKey] : undefined;
        if (baseMaxValue !== undefined) {
            inputElement.max = baseMaxValue * starMult;
        }
    };
    
    updateStepAndMax();

    // Inject custom arrows if they don't exist yet
    if (inputElement.parentElement && !inputElement.parentElement.querySelector('.custom-spinners')) {
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'custom-spinners';
        
        const upBtn = document.createElement('div');
        upBtn.className = 'custom-spin-btn';
        upBtn.innerHTML = '▲';
        upBtn.onclick = (e) => {
            e.stopPropagation();
            inputElement.stepUp();
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const downBtn = document.createElement('div');
        downBtn.className = 'custom-spin-btn';
        downBtn.innerHTML = '▼';
        downBtn.onclick = (e) => {
            e.stopPropagation();
            inputElement.stepDown();
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        };

        spinnerContainer.appendChild(upBtn);
        spinnerContainer.appendChild(downBtn);
        inputElement.parentElement.appendChild(spinnerContainer);
    }

    inputElement.oninput = () => {
        let value = parseFloat(inputElement.value);
        if (value < 0 || isNaN(value)) {
            if (value < 0) { inputElement.value = 0; value = 0; }
        }

        // Determine Stat Key (Handle 'data-stat' vs 'id')
        let rawKey = inputElement.dataset.stat || inputElement.id;
        const statKey = normalizeStatKey(rawKey);

        const baseMaxValue = typeof MAX_SUB_STAT_VALUES !== 'undefined' ? MAX_SUB_STAT_VALUES[statKey] : undefined;
        const starMult = getStarMultFn();
        const dynamicMaxValue = baseMaxValue !== undefined ? baseMaxValue * starMult : undefined;

        if (dynamicMaxValue !== undefined && value > dynamicMaxValue) {
            inputElement.value = parseFloat(dynamicMaxValue.toFixed(3));
        }

        trackBaseStatValue(inputElement, starMult);
    };

    trackBaseStatValue(inputElement, getStarMultFn());
}

// ============================================================================
// UNIFIED TRAIT RESOLUTION HELPERS
// ============================================================================

function getTraitById(traitId, unitId = null) {
    if (!traitId || traitId === 'none') return traitsList.find(t => t.id === 'none');

    // 1. Global Standard
    let t = traitsList.find(t => t.id === traitId);
    if (t) return t;

    // 2. Global Custom
    if (typeof customTraits !== 'undefined') {
        t = customTraits.find(t => t.id === traitId);
        if (t) return t;
    }

    // 3. Unit Specific
    if (unitId && typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unitId]) {
        t = unitSpecificTraits[unitId].find(t => t.id === traitId);
        if (t) return t;
    }

    return null;
}

function getTraitByName(traitName, unitId = null) {
    if (!traitName) return null;

    // 1. Global Standard
    let t = traitsList.find(t => t.name === traitName);
    if (t) return t;

    // 2. Global Custom
    if (typeof customTraits !== 'undefined') {
        t = customTraits.find(t => t.name === traitName);
        if (t) return t;
    }

    // 3. Unit Specific
    if (unitId && typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unitId]) {
        t = unitSpecificTraits[unitId].find(t => t.name === traitName);
        if (t) return t;
    }

    // 4. Dynamic Reconstruction (Fix for Static DB / Missing Custom Traits)
    if (traitName.includes(' + ')) {
        const parts = traitName.split(' + ');
        if (parts.length === 2 && typeof window.combineTraits === 'function') {
            const t1 = getTraitByName(parts[0], unitId);
            const t2 = getTraitByName(parts[1], unitId);
            if (t1 && t2) return window.combineTraits(t1, t2);
        }
    }

    return null;
}

// ============================================================================
// UNIT REFERENCE HELPERS (Uses Map-based caching for performance)
// ============================================================================

window.unitMap = new Map();

/** Internal helper to ensure the unitMap is populated */
function _ensureUnitMap() {
    if (window.unitMap.size === 0 && typeof unitDatabase !== 'undefined' && unitDatabase.length > 0) {
        unitDatabase.forEach(u => {
            window.unitMap.set(u.id, u);
            if (u._fileName) window.unitMap.set(u._fileName, u);
        });
    }
}

/** Gets the unit object by ID (O(1)) */
window.getUnitById = function (id) {
    if (!id) return null;
    _ensureUnitMap();
    return window.unitMap.get(id) || unitDatabase.find(u => u.id === id);
};

/** Gets the current unit.id by passing the JS filename (e.g. 'water_god') */
window.getUnitId = function (fileName) {
    if (!fileName) return null;
    _ensureUnitMap();
    const unit = window.unitMap.get(fileName);
    if (unit) return unit.id;
    
    // Fallback search
    if (typeof unitDatabase !== 'undefined') {
        const found = unitDatabase.find(u => u._fileName === fileName || u.id === fileName);
        if (found) {
            window.unitMap.set(found.id, found);
            if (found._fileName) window.unitMap.set(found._fileName, found);
            return found.id;
        }
    }
    return fileName;
};

/** Checks if a unit matches a filename. Usage: if (isUnit(uStats.id, 'water_god')) */
window.isUnit = function (currentId, fileName) {
    if (!currentId) return false;
    const baseId = currentId.split('-')[0];
    return baseId === window.getUnitId(fileName);
};

/** Checks if a unit matches ANY filename in an array. */
window.isAnyUnit = function (currentId, fileNamesArray) {
    if (!currentId || !fileNamesArray) return false;
    const baseId = currentId.split('-')[0];
    return fileNamesArray.some(fName => baseId === window.getUnitId(fName));
};

/** Gets the permanent JS filename from a dynamic unit ID. Useful for UI mappings. */
window.getFileName = function (currentId) {
    if (!currentId) return "";
    _ensureUnitMap();
    const unit = window.unitMap.get(currentId);
    if (unit && unit._fileName) return unit._fileName;
    
    // Fallback search
    if (typeof unitDatabase !== 'undefined') {
        const found = unitDatabase.find(u => u.id === currentId);
        if (found && found._fileName) return found._fileName;
    }
    return currentId;
};