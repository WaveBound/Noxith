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


// Inventory
let relicInventory = [];
    