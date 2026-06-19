// --- FEATURE FLAGS ---
const ENABLE_HOTBAR = true;
const ENABLE_LOADOUT_CLICKABLE = true;

// Data & Cache
window.customTraits = window.customTraits || [];
window.unitSpecificTraits = window.unitSpecificTraits || {};

var customTraits = window.customTraits;
var unitSpecificTraits = window.unitSpecificTraits;

const getAbilityEntry = (unit) => Array.isArray(unit?.ability) ? unit.ability[0] : unit?.ability;
const isDefaultActiveAbility = (unit) => {
    const ability = getAbilityEntry(unit);
    if (!unit?.id || !ability) return false;
    if (unit.defaultAbilityActive !== undefined) return !!unit.defaultAbilityActive;
    return !!(ability.defaultActive || ability.defaultOn || ability.enabledByDefault);
};

window.activeAbilityIds = new Set();
['phantom_captain', 'megumin', 'ancient_shinob', 'triple_threat', 'marine_hero'].forEach(id => window.activeAbilityIds.add(id));
if (typeof unitDatabase !== 'undefined') {
    unitDatabase.forEach(unit => {
        if (isDefaultActiveAbility(unit)) window.activeAbilityIds.add(unit.id);
    });
}
var activeAbilityIds = window.activeAbilityIds;
var cachedResults = {};
var unitBuildsCache = {};

var inventoryMode = false;
var disableSubStats = false;

var currentCalcUnitId = null;

// Async Rendering State
var renderQueueIndex = 0;
var renderQueueId = null;

// Pagination State
var currentPage = 1;

/**
 * Requirement: Mobile pages should contain 8 characters a page.
 * Desktop remains dynamic based on screen width.
 */
function getUnitsPerPage() {
    // Check if mobile (matches CSS media query)
    if (window.innerWidth <= 768) {
        return 10;
    }

    // Desktop logic: Calculate based on columns
    const sidebar = 260;
    const padding = 50;
    const gap = 18;
    const availableWidth = (window.innerWidth || 1200) - sidebar - padding;

    // 370 is the min-width of the cards defined in CSS
    const cols = Math.max(1, Math.floor((availableWidth + gap) / (370 + gap)));

    // Returns 2 rows worth of units (e.g., if 3 columns, returns 6)
    return cols * 2;
}

var paginatedSortedUnits = [];

// Inventory
var relicInventory = [];
var inventoryUnitTraits = {};