// ============================================================================
// STATE.JS - Global Application State
// ============================================================================

// --- FEATURE FLAGS ---
const ENABLE_HOTBAR = false; // Set to true to enable the hotbar, false to hide it

// Data & Cache
let customTraits = [];
let unitSpecificTraits = {};
let activeAbilityIds = new Set();
let cachedResults = {};
let unitBuildsCache = {};

let inventoryMode = false; // Toggle state for Inventory calculation

const kiritoState = {
    realm: true,
    card: false
};

const bambiettaState = {
    element: "Dark"
};

const robot1718State = {
    mode: "Robot 17"
};

window.ancientMageState = {
    mode: "DPS"
};

let currentCalcUnitId = null;

// Async Rendering State
let renderQueueIndex = 0;
let renderQueueId = null;

// Pagination State
let currentPage = 1;
function getUnitsPerPage() {
    // Grid uses minmax(370px, 1fr) with 18px gap, sidebar is 260px
    const sidebar = 260;
    const padding = 40;
    const gap = 18;
    const availableWidth = (window.innerWidth || 1200) - sidebar - padding;
    const cols = Math.max(1, Math.floor((availableWidth + gap) / (370 + gap)));
    // Always show exactly 2 full rows
    return cols * 2;
}
let paginatedSortedUnits = []; // Full sorted list, shared across pagination functions


// Inventory
let relicInventory = [];
