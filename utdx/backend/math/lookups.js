// ============================================================================
// LOOKUPS.JS - Fast Lookup Utilities & Synergy Cache
// Depends on: backend/data/traits.js, backend/data/relics.js
// ============================================================================

// --- PERFORMANCE CACHING ---

let _globalHotbarStats = null;
let _lastHotbarUpdate = 0;

/**
 * Optimized lookup for team-wide synergy data (Hotbar context).
 * Prevents redundant array traversals during heavy calculation loops.
 */
function getCachedHotbarStats() {
    const now = Date.now();
    // Short-lived cache (200ms) is sufficient to optimize a single Trait Leaderboard generation
    if (_globalHotbarStats && (now - _lastHotbarUpdate < 200)) return _globalHotbarStats;

    const hotbar = window.hotbarState;
    const slots = hotbar?.slots || [];

    const stats = {
        divinityCount: 0,
        ugPresent: false,
        akPresent: false,
        jinooPresent: false,
        idsInHotbar: new Set()
    };

    slots.forEach(slot => {
        if (!slot) return;
        const baseId = slot.id.indexOf('-') === -1 ? slot.id : slot.id.split('-')[0];
        stats.idsInHotbar.add(baseId);

        if (baseId === 'underworld_god') stats.ugPresent = true;
        if (baseId === 'ant_king_savage') stats.akPresent = true;
        if (baseId === 'jinoo' || baseId === 'jinoo_shadow_monarch' || baseId === 'sjw') stats.jinooPresent = true;

        // Fast divinity stack calculation
        const sUnit = window.getUnitById(slot.id);
        if (sUnit && sUnit.tags && sUnit.tags.includes('Divinity')) {
            let count = sUnit.placement || 1;
            if (baseId === 'water_god') count = Math.max(0, count - 1);
            stats.divinityCount += count;
        }
    });

    _globalHotbarStats = stats;
    _lastHotbarUpdate = now;
    return stats;
}

// Expose for use by context-builder and calculateDPS
window.getCachedHotbarStats = getCachedHotbarStats;

/**
 * Fast unit ID matching without heavy regex or repeated splitting.
 */
function isUnit(id, target) {
    if (!id || !target) return false;
    const dashIdx = id.indexOf('-');
    if (dashIdx === -1) return id === target;
    return id.substring(0, dashIdx) === target;
}
window.isUnit = isUnit;

/**
 * isAnyUnit — checks if a unit ID matches any target in an array.
 */
window.isAnyUnit = function(id, targets) {
    return targets.some(t => isUnit(id, t));
};

// --- TRAIT & SET CACHE MAPS ---

// Speed optimization: Fast lookup maps for static data
const _traitCacheMap = new Map();
window._traitCacheMap = _traitCacheMap;

const _setCacheMap = new Map();
window._setCacheMap = _setCacheMap;

// UPDATED: Dynamically checks Custom Traits if not found in the base cache
window.getTraitFast = (idOrName) => {
    if (!idOrName) return null;
    const lowerSearch = idOrName.toLowerCase();

    if (_traitCacheMap.size === 0) {
        traitsList.forEach(t => {
            _traitCacheMap.set(t.id.toLowerCase(), t);
            _traitCacheMap.set(t.name.toLowerCase(), t);
        });
    }

    let found = _traitCacheMap.get(lowerSearch);

    // Fallback 1: Scan dynamically generated Custom Pairs
    if (!found) {
        if (typeof window.customTraits !== 'undefined') {
            found = window.customTraits.find(t => t.id === idOrName || t.name === idOrName);
        }
        if (!found && typeof window.unitSpecificTraits !== 'undefined') {
            for (const key in window.unitSpecificTraits) {
                const arr = window.unitSpecificTraits[key];
                if (arr) {
                    found = arr.find(t => t.id === idOrName || t.name === idOrName);
                    if (found) break;
                }
            }
        }
    }

    // Fallback 2: Try splitting by space/parentheses (e.g. "Ruler (Dmg/Spa)" -> "Ruler")
    if (!found) {
        const baseName = idOrName.split(' ')[0].toLowerCase();
        found = _traitCacheMap.get(baseName);
    }

    // Cache the newly found Custom Trait for future fast lookups
    if (found) {
        _traitCacheMap.set(found.id, found);
        _traitCacheMap.set(found.name, found);
    }

    return found;
};

const getTraitFast = window.getTraitFast;

// Polyfill older lookup functions to ensure entire app resolves Custom Traits
window.getTraitById = window.getTraitFast;
window.getTraitByName = window.getTraitFast;

const getSetFast = (name) => {
    if (!name) return null;
    const cleanName = name.replace(/\s*set\b/gi, '').replace('_set', '').trim().toLowerCase();
    
    if (_setCacheMap.size === 0) {
        SETS.forEach(s => {
            _setCacheMap.set(s.name.toLowerCase(), s);
            _setCacheMap.set(s.id.toLowerCase(), s);
            _setCacheMap.set(s.name.replace(/\s*set\b/gi, '').replace('_set', '').trim().toLowerCase(), s);
        });
    }
    return _setCacheMap.get(cleanName);
};
window.getSetFast = getSetFast;