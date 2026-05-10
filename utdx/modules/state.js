// ============================================================================
// STATE.JS - Global Application State
// ============================================================================

// --- FEATURE FLAGS ---
const ENABLE_HOTBAR = false; // Set to true to enable the hotbar, false to hide it
const ENABLE_LOADOUT_CLICKABLE = false; // Set to false to disable Loadout mode switching

// Data & Cache
let customTraits = [];
let unitSpecificTraits = {};
let activeAbilityIds = new Set();
let cachedResults = {};
let unitBuildsCache = {};

let inventoryMode = false; // Toggle state for Inventory calculation

let currentCalcUnitId = null;

// Async Rendering State
let renderQueueIndex = 0;
let renderQueueId = null;

// Pagination State
let currentPage = 1;
function getUnitsPerPage() {
    const sidebar = 260;
    const padding = 50;
    const gap = 18;
    const availableWidth = (window.innerWidth || 1200) - sidebar - padding;
    const cols = Math.max(1, Math.floor((availableWidth + gap) / (370 + gap)));
    return cols * 2;
}
let paginatedSortedUnits = []; // Full sorted list, shared across pagination functions


// Inventory
let relicInventory = [];
