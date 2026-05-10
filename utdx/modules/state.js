// --- FEATURE FLAGS ---
const ENABLE_HOTBAR = true;
const ENABLE_LOADOUT_CLICKABLE = true;

// Data & Cache
let customTraits = [];
let unitSpecificTraits = {};
let activeAbilityIds = new Set();
let cachedResults = {};
let unitBuildsCache = {};

let inventoryMode = false;

let currentCalcUnitId = null;

// Async Rendering State
let renderQueueIndex = 0;
let renderQueueId = null;

// Pagination State
let currentPage = 1;

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

let paginatedSortedUnits = [];

// Inventory
let relicInventory = [];