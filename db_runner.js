// ============================================================================
// STATE.JS - Global Application State
// ============================================================================

// Data & Cache
let customTraits = [];
let unitSpecificTraits = {};
let activeAbilityIds = new Set(['phantom_captain', 'megumin', 'ancient_shinob']);
let cachedResults = {};
let unitBuildsCache = {};

// Mode & Configuration
let currentGuideMode = 'current';
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

const ancientMageState = {
    mode: "DPS"
};

// Caches for performance optimization
let guideUnitSelection = new Set(['all']); // Persistent selection for Guide view
let tempGuideUnitSet = new Set(['all']);   // Temporary selection inside Config Modal
let tempGuideTrait = 'auto';

let currentCalcUnitId = null;

// Async Rendering State
let renderQueueIndex = 0;
let renderQueueId = null;

// Inventory
let relicInventory = [];
// ============================================================================
// DATA.JS - Static Data & Configuration
// ============================================================================

const GAME_STATE = {
    BUG_DOT_RELICS: false,  // Set to true if Relic DoT is currently broken/ignored in-game
    BUG_CRIT_RELICS: false  // Set to true if Relic Crit is currently broken (Fixed in v2.4)
};

const SUPER_ROKU_NEARBY = false; // Toggle: +20% Damage if placed within range of a "Saiyan unit"

const statConfig = {
    applyRelicDmg: true,
    applyRelicSpa: true,
    applyRelicCrit: !GAME_STATE.BUG_CRIT_RELICS,
    applyRelicDot: !GAME_STATE.BUG_DOT_RELICS
};

const PERFECT_SUBS = {
    dmg: 4, spa: 1.5, cm: 4.5, cf: 2.5, dot: 5, range: 2
};

const SUB_CANDIDATES = ['dmg', 'spa', 'cm', 'cf', 'dot', 'range'];

const SUB_NAMES = {
    dmg: "Dmg", spa: "SPA", cm: "Crit Dmg", cf: "Crit Rate", dot: "DoT", range: "Range"
};

const patchNotesData = [
    {
        version: "v5.0",
        date: "Apr 25, 2026",
        changes: [
            { type: "System", text: "<b>Unit Types:</b> Added 'Ground' and 'Hill' types to all units." },
            { type: "Buff", text: "<b>Fern Buffs:</b> Fern(Hill) and Fern(Ground) now only apply to their respective unit types." },
            { type: "Math", text: "<b>Builds:</b> Builds now automatically adjust when using any buff abilities." },
            { type: "Fix", text: "<b>Buff Switch:</b> You Can No Longer Enable Mage(Hill) And Mage(Ground) At The Same Time" }
        ]
    },
    {
        version: "v4.9",
        date: "Apr 22, 2026",
        changes: [
            { type: "Unit", text: "<b>New Unit:</b> Added <b>Ant King (Savage)</b> with stacking damage and radiation passives." },
            { type: "Balance", text: "<b>Ant King:</b> Includes toggleable 'Monarch's Devotion' for pairing with Jinoo." }
        ]
    },
    {
        version: "v4.8",
        date: "Apr 18, 2026",
        changes: [
            { type: "Unit", text: "<b>New Units:</b> Added <b>Majestic Armor, Unparalleled Armor, Ancient Shinob, King Sailor, Ancient Mage, Sasuke (Great War)</b>, and <b>Crow Shinobi</b>." },
            { type: "UI", text: "<b>Fix:</b> Removed the mobile menu button from the desktop view." },
            { type: "Math", text: "<b>DPS Breakdown:</b> Enhanced the breakdown to show the currently applied Relic Set bonus." },
            { type: "Math", text: "<b>Source Totals:</b> Added a new 'Source Totals' dashboard to the DPS breakdown for better visibility into buff origins." }
        ]
    },
    {
        version: "v4.7",
        date: "Apr 17, 2026",
        changes: [
            { type: "UI", text: "<b>UI Rework:</b> Major redesign of the dashboard and unit cards for better navigation." },
            { type: "Unit", text: "<b>New Unit:</b> Added <b>Underworld God (Syncro)</b>." },
            { type: "QoL", text: "<b>DPS Breakdown:</b> Added a quick-access button to view full unit passive descriptions directly from the math log." }
        ]
    },
    {
        version: "v4.6",
        date: "Apr 14, 2026",
        changes: [
            { type: "Fix", text: "<b>Relic DoT:</b> Enabled by default for all calculations (Bugged Relic toggle removed)." },
            { type: "Fix", text: "<b>Wizard Trait:</b> Re-enabled the +30% DoT Bonus functional logic." },
            { type: "Trait", text: "<b>Fission:</b> Updated description to include the +20% Radiation damage bonus." }
        ]
    },
    {
        version: "v4.5",
        date: "Feb 03, 2026",
        changes: [
            { type: "Math", text: "<b>Artificer:</b> Corrected the formula for how Artificer's relic stat bonus is calculated." }
        ]
    },
    {
        version: "v4.4",
        date: "Feb 02, 2026",
        changes: [
            { type: "Unit", text: "<b>New Units:</b> Added <b>Rohan & Robot</b>, <b>Cell</b>, <b>Trunks</b>, and <b>Vegeta</b>." },
            { type: "Item", text: "<b>New Relic Sets:</b> Added <b>Super Roku</b> and <b>Bio-Android</b> sets." }
        ]
    },
    {
        version: "v4.3",
        date: "Jan 30, 2026",
        changes: [
            { type: "Feature", text: "<b>Trait Tier List:</b> Added 'Virtual Realm' category to the global tier list and individual unit guides." },
            { type: "Unit", text: "<b>Kirito:</b> Added specific trait recommendation (Astral) for Virtual Realm mode." }
        ]
    },
    {
        version: "v4.2",
        date: "Jan 29, 2026",
        changes: [
            { type: "Feature", text: "<b>Trait Tier List:</b> Added a global view to see all unit trait recommendations in a tier list format, sorted by DPS potential." },
            { type: "UI", text: "<b>Trait Guide:</b> Updated the visual style of trait suggestions. Now uses high-quality images with rainbow borders." },
            { type: "Balance", text: "<b>Ace:</b> Updated Infinite Mode recommendations to prioritize Ruler." },
            { type: "Fix", text: "<b>Visuals:</b> Fixed image scaling for Mob and Shanks in the tier list view." }
        ]
    },
    {
        version: "v4.1",
        date: "Jan 29, 2026",
        changes: [
            { type: "Feature", text: "<b>Miku Buff:</b> Added a global toggle to apply Miku's +100% Damage Buff to all calculations." },
            { type: "UI", text: "<b>Breakdown Label:</b> Renamed 'Set Bonus + Passive + Abilities' to 'Buff Data' in the calculation breakdown for clarity." }
        ]
    },
    {
        version: "v4.0",
        date: "Jan 20, 2026",
        changes: [
            { type: "QoL", text: "<b>Calculator Persistence:</b> Changing Sets, Traits, or Main Stats in the Custom Relic Modal/Add Relic Modal no longer resets your manually entered Sub-Stat values." },
            { type: "UI", text: "<b>Mobile Comparison:</b> Redesigned the Compare Modal for mobile devices. It now displays units as stacked cards for better readability." },
            { type: "System", text: "<b>Feedback Form:</b> Added a Discord Username field to the Feedback/Report modal so we can follow up on specific issues." }
        ]
    },
    {
        version: "v3.9",
        date: "Jan 19, 2026",
        changes: [
            { type: "UI", text: "<b>Modals:</b> Updated all popups to have a consistent look and feel. Also stopped text from highlighting randomly when you're just clicking buttons." },
            { type: "Feature", text: "<b>Custom Pairs/Configure View:</b> You can select multiple specific units at once." },
            { type: "Fix", text: "<b>Mobile Fixes:</b> The menu button now properly hides when you open a window, plus some other small visual cleanups." }
        ]
    },
    {
        version: "v3.8",
        date: "Jan 17, 2026",
        changes: [
            { type: "UI", text: "<b>DPS Breakdown:</b> Added Range Breakdown box." },
            { type: "Fix", text: "<b>DoT Logic:</b> Fixed DoT calculations." },
            { type: "Fix", text: "<b>Range Math:</b> Fixed an issue where Range Scaling Points (99 pts) were not being applied in the breakdown view." },
            { type: "Math", text: "<b>Fission:</b> Updated Fission calculations." },
            { type: "Buff", text: "<b>Sacred:</b> Now provides <b>-15% Total Cost</b> reduction." },
            { type: "Fix", text: "<b>Set Stacking:</b> Fixed Set Bonus stacking logic for Reaper/Shadow Reaper necklaces." },
            { type: "Math", text: "<b>Eternal:</b> Range bonus is now additive with Passives/Sets instead of multiplicative." }
        ]
    },
    {
        version: "v3.7",
        date: "Jan 16, 2026",
        changes: [
            { type: "Feature", text: "<b>Relic Inventory:</b> You can now save your actual in-game relics to a persistent inventory tab." },
            { type: "Feature", text: "<b>Inventory Calculation:</b> Toggle 'Inventory Mode' to calculate the best build using ONLY the items you own." },
            { type: "Fix", text: "<b>Range Priority:</b> Fixed logic where Range Optimization was incorrectly applying Damage Level Scaling points." }
        ]
    },
    {
        version: "v3.6",
        date: "Jan 15, 2026",
        changes: [
            { type: "Units", text: "<b>Unit Update:</b> Added Phantom Captain And Sharpshooter" }
        ]
    },
    {
        version: "v3.5",
        date: "Jan 13, 2026",
        changes: [
            { type: "Ui", text: "<b>Mobile:</b> Added a mobile menu toggle button and improved responsive layout." },
            { type: "Feature", text: "<b>Efficiency Score:</b> Added an 'Efficiency' metric to all builds. This displays <b>DPS per Cost</b> (Efficiency), helping to identify the most economic builds." },
            { type: "Fix", text: "<b>Bambietta Logic:</b> Fixed the Element Selector. Switching elements now instantly recalculates stats and updates the build list correctly." }
        ]
    },
    {
        version: "v3.4",
        date: "Jan 12, 2026",
        changes: [
            { type: "System", text: "<b>Header Popup/PopDown:</b> Implemented a Button To Close/Open The Header." },
            { type: "Ui", text: "<b>Build Guide Tab:</b> Changed The Cards To Look Like The Ones In Unit Database And Removed Miku/Support/Other DPS Cards." }
        ]
    },
    {
        version: "v3.3",
        date: "Jan 11, 2026",
        changes: [
            { type: "System", text: "<b>Static Database Engine:</b> Implemented a pre-calculated build database. Page load times are now drastically faster." },
            { type: "Fix", text: "<b>Filter Logic:</b> Changing filters (Set, Head, Prio) no longer triggers a full recalculation. Lists now filter instantly without reloading." }
        ]
    },
    {
        version: "v3.2",
        date: "Jan 10, 2026",
        changes: [
            { type: "Fix", text: "<b>Comparison Fix:</b> Resolved an issue where builds with slightly higher DPS (e.g., using S. Reaper Head) were hiding viable alternatives (e.g., Sun God Head) from the list." },
            { type: "Feature", text: "<b>Star Multipliers:</b> Individual star level selectors added to each gear piece (Head, Body, Legs) in custom calculator." },
            { type: "Bugfix", text: "<b>Calculator Fixes:</b> Resolved star multiplier application and visibility logic errors." }
        ]
    },
    {
        version: "v3.1",
        date: "Jan 08, 2026",
        changes: [
            { type: "Feature", text: "<b>Meta Comparison:</b> Added visual bar charts and % difference to the Compare Modal." },
            { type: "Refactor", text: "<b>Game State Logic:</b> Centralized bug tracking. Toggling 'Bugged Relics' now accurately reflects current patch status." }
        ]
    },
    {
        version: "v3.0",
        date: "Jan 06, 2026",
        changes: [
            { type: "UI", text: "<b>Custom Calculator Rework:</b> New visual 'Gear Card' dashboard for easier build creation." },
            { type: "QoL", text: "<b>Auto-Fill Logic:</b> Sub-stats in calculator now auto-fill to perfect values based on relic type." }
        ]
    },
    {
        version: "v2.9",
        date: "Jan 02, 2026",
        changes: [
            { type: "ITEM", text: "Added <b>Reaper Necklace</b> (-7.5% SPA, +15% Range)." },
            { type: "ITEM", text: "Added <b>Shadow Reaper Necklace</b> (+2.5% Dmg, +10% Range, +5% Crit Rate, +5% Crit Dmg)." }
        ]
    }
];

const guideData = [
    {
        unit: "Miku",
        img: "",
        current: { trait: "Buff Potency", set: "Any", main: "Buff Potency", sub: "Buff Potency" },
        fixed: { trait: "Buff Potency", set: "Any", main: "Buff Potency", sub: "Buff Potency" }
    },
    {
        unit: "Supports",
        img: "",
        current: { trait: "Spa / Range", set: "Laughing / Swift", main: "Spa / Range", sub: "Spa / Rng / Dmg" },
        fixed: { trait: "Spa / Range", set: "Laughing / Swift", main: "Spa / Range", sub: "Spa / Rng" }
    },
    {
        unit: "Other DPS",
        img: "",
        current: { trait: "Damage > Spa", set: "Laughing / Ninja", main: "Damage > Spa", sub: "Crit Rate / Spa" },
        fixed: { trait: "Dependent on Kit", set: "Laughing Captain", main: "Dependent", sub: "Crit Rate" }
    },
    { unit: "Ace", img: "images/units/Ace.png", isCalculated: true },
    { unit: "SJW", img: "images/units/Sjw.png", isCalculated: true },
    { unit: "Sasuke", img: "images/units/Sasuke.png", isCalculated: true },
    { unit: "Kirito", img: "images/units/Kirito.png", isCalculated: true },
    { unit: "Kenpachi", img: "images/units/Kenpachi.png", isCalculated: true },
    { unit: "Ragna", img: "images/units/Ragna.png", isCalculated: true },
    { unit: "Mob", img: "images/units/Mob.png", isCalculated: true },
    { unit: "Shanks", img: "images/units/Shanks.png", isCalculated: true },
    { unit: "Genos", img: "images/units/Genos.png", isCalculated: true },
    { unit: "Water God (Primordial)", img: "images/units/WaterGod.png", isCalculated: true },
    { unit: "First Emperor", img: "images/units/FirstEmperor.png", isCalculated: true },
    { unit: "ancient_shinob", img: "images/units/AncientShinob.png", isCalculated: true },
    { unit: "underworld_god", img: "images/units/UnderworldGod.png", isCalculated: true },
    { unit: "majestic_armor", img: "images/units/MajesticArmor.png", isCalculated: true },
    { unit: "unparalleled_armor", img: "images/units/UnparalleledArmor.png", isCalculated: true },
    { unit: "sasuke_great_war", img: "images/units/SasukeGreatWar.png", isCalculated: true },
    { unit: "nutaru_beast", img: "images/units/NutaruBeast.png", isCalculated: true },
    { unit: "Crow Shinobi", img: "images/units/CrowShinobi.png", isCalculated: true },
    { unit: "ant_king_savage", img: "images/units/AntKing.png", isCalculated: true },
    { unit: "prodigy_mage", img: "images/units/ProdigyMage.png", isCalculated: true }
];

const BAMBIETTA_MODES = {
    "Water": { element: "Water", dot: 0, desc: "Slow", dotDuration: 0 },
    "Wind": { element: "Wind", dot: 50, dotDuration: 5, desc: "Windsheer" },
    "Rose": { element: "Rose", dot: 50, dotDuration: 5, desc: "Bleed" },
    "Fire": { element: "Fire", dot: 50, dotDuration: 5, desc: "Burn" },
    "Light": { element: "Light", dot: 50, dotDuration: 5, desc: "Radiation" },
    "Dark": { element: "Dark", dot: 0, desc: "Stun", dotDuration: 0 },
    "Ice": { element: "Ice", dot: 0, desc: "Freeze", dotDuration: 0 }
};

const setBonuses = {
    laughing: { dmg: 5, spa: 5, cf: 0, cm: 0, range: 0 },
    ninja: { dmg: 5, spa: 0, cf: 0, cm: 0, range: 0 },
    sun_god: { dmg: 5, spa: 0, cf: 0, cm: 0, range: 0 },
    ex: { dmg: 0, spa: 0, cf: 10, cm: 25, range: 0 },
    shadow_reaper: { dmg: 2.5, spa: 0, cf: 5, cm: 5, range: 10 },
    reaper_set: { dmg: 0, spa: 7.5, cf: 0, cm: 0, range: 15 },
    super_roku: { dmg: 10, spa: 0, cf: 15, cm: 0, range: 0 },
    bio_android: { dmg: 10, spa: 5, cf: 5, cm: 15, range: 5 },
    biju_set: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 0 },
    rebellious_set: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 },
    reanimated_ninja: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 0, dot: 30 },
    great_mage: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 10 },
    none: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }
};

const BODY_DMG = { dmg: 60, dot: 0, cm: 0, desc: "Dmg", type: "dmg" };
const BODY_DOT = { dmg: 0, dot: 75, cm: 0, desc: "DoT", type: "dot" };
const BODY_CDMG = { dmg: 0, dot: 0, cm: 120, desc: "Crit Dmg", type: "cm" };

const LEG_DMG = { dmg: 60, spa: 0, desc: "Dmg", type: "dmg" };
const LEG_SPA = { dmg: 0, spa: 22.5, desc: "Spa", type: "spa" };
const LEG_CRIT = { dmg: 0, spa: 0, desc: "Crit Rate", type: "cf", cf: 37.5 };
const LEG_RANGE = { dmg: 0, spa: 0, desc: "Range", type: "range", range: 30 };

const SETS = [
    { id: "ninja", name: "Junior Ninja", bonus: { dmg: 5, spa: 0, cm: 0 } },
    { id: "sun_god", name: "Sun God", bonus: { dmg: 5, spa: 0, cm: 0 } },
    { id: "laughing", name: "Laughing Captain", bonus: { dmg: 5, spa: 5, cm: 0 } },
    { id: "ex", name: "Ex Captain", bonus: { dmg: 0, spa: 0, cm: 25, cf: 10 } },
    { id: "shadow_reaper", name: "Shadow Reaper", bonus: { dmg: 2.5, range: 10, cf: 5, cm: 5 } },
    { id: "reaper_set", name: "Reaper Set", bonus: { spa: 7.5, range: 15 } },
    { id: "super_roku", name: "Super Roku", bonus: { dmg: 10, cf: 15 } },
    { id: "bio_android", name: "Bio-Android", bonus: { dmg: 10, spa: 5, range: 5, cf: 5, cm: 15 } },
    { id: "biju_set", name: "Biju Set", bonus: { dmg: 10 } },
    { id: "rebellious_set", name: "Rebellious Shinobi", bonus: { dmg: 0 } },
    { id: "reanimated_ninja", name: "Reanimated Ninja", bonus: { dmg: 10, dot: 30 } },
    { id: "great_mage", name: "Great Mage", bonus: { range: 10 } }
];

const globalBuilds = SETS.flatMap(set =>
    [BODY_DMG, BODY_DOT, BODY_CDMG].flatMap(body =>
        [LEG_DMG, LEG_SPA, LEG_CRIT, LEG_RANGE].map(leg => ({
            name: `${set.name} (${body.desc}/${leg.desc})`,
            set: set.id,
            dmg: body.dmg + leg.dmg,
            spa: leg.spa,
            dot: body.dot,
            cm: body.cm,
            cf: (body.cf || 0) + (leg.cf || 0),
            range: (leg.range || 0),
            bodyType: body.type,
            legType: leg.type
        }))
    )
);

const traitsList = [
    { id: "ruler", name: "Ruler", dmg: 200, spa: 20, range: 30, desc: "+200% Dmg, Limit 1", limitPlace: 1 },
    { id: "fission", name: "Fission", dmg: 15, spa: 15, range: 25, hasRadiation: true, radiationPct: 20, desc: "+15% Dmg/SPA, +25% Range, radiation causes enemies to take +20% Dmg" },
    { id: "eternal", name: "Eternal", dmg: 0, spa: 20, range: 0, desc: "-20% SPA, +Dmg/Rng/Wave", isEternal: true },
    { id: "sacred", name: "Sacred", dmg: 25, spa: 10, range: 25, desc: "+25% Dmg, -10% SPA, -15% Cost", costReduction: 15 },
    { id: "astral", name: "Astral", dmg: 0, spa: 20, range: 15, desc: "DoT Stacks (All Units)", allowDotStack: true },
    { id: "wizard", name: "Wizard", dmg: 0, spa: 15, range: 20, desc: "+30% DoT, -15% SPA", dotBuff: 30 },
    { id: "artificer", name: "Artificer", dmg: 0, spa: 0, range: 0, desc: "+15% Relic Stats", relicBuff: 1.15 },
    { id: "duelist", name: "Duelist", dmg: 0, spa: 0, range: 0, desc: "+Crit/Boss Dmg", critRate: 25, bossDmg: 35 },
    { id: "none", name: "None", dmg: 0, spa: 0, range: 0, desc: "No buffs" }
];

const elementIcons = {
    "Water": "images/elements/Water.png",
    "Fire": "images/elements/Fire.png",
    "Light": "images/elements/Light.png",
    "Dark": "images/elements/Dark.png",
    "Ice": "images/elements/Ice.png",
    "Rose": "images/elements/Rose.png"
};

const unitDatabase = [
    {
        id: "Maid", name: "Scarlet Maid", role: "Damage / Support",
        img: "images/units/Maid.png",
        totalCost: 76000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 2950, spa: 5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3.5, passiveDmg: 0, element: "Light", dotDuration: 0, range: 28 }
    },
    {
        id: "sjw", name: "Jinoo (Monarch)", role: "Damage",
        img: "images/units/Sjw.png",
        totalCost: 93000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 3350, spa: 5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 5, passiveDmg: 25, element: "Dark", range: 35 }
    },
    {
        id: "ragna", name: "Dragon Guy", role: "Burst / Hybrid",
        img: "images/units/Ragna.png",
        totalCost: 72000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 1800, spa: 9, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 12, element: "Ice", range: 35 },
        ability: { dmg: 3600, spa: 15, passiveDmg: 72, }
    },
    {
        id: "kirito", name: "Kriatu", role: "Burst / Crit",
        img: "images/units/Kirito.png",
        totalCost: 31000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", virtual: "Astral", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { dmg: 1200, spa: 7, crit: 50, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 4, hitCount: 14, reqCrits: 50, extraAttacks: 0, element: "Ice", range: 30 }
    },
    {
        id: "genos", name: "Cyborg", role: "DoT / Damage",
        img: "images/units/Genos.png",
        totalCost: 31760,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Standard DPS Selection." },
        stats: { dmg: 1440, spa: 5.5, crit: 0, cdmg: 150, dot: 14, dotStacks: 1, spaCap: 4, passiveDmg: 0, element: "Fire", range: 32, burnMultiplier: 45 },
        ability: { passiveDmg: 75 }
    },
    {
        id: "kenpachi", name: "Berserker", role: "Damage / Slow",
        img: "images/units/Kenpachi.png",
        totalCost: 31760,
        placement: 3, tags: ["Peroxide", "Reaper", "Rage"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 2875, spa: 10, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2.0, element: "Light", range: 27 }
    },
    {
        id: "sasuke", name: "Sasuke (Chakra)", role: "Damage",
        img: "images/units/Sasuke.png",
        totalCost: 40000,
        placement: 2, tags: ["Team 7", "Ninjaverse", "Hero", "Bloodline"], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Ruler for DPS, Eternal/Sacred for support." },
        stats: { dmg: 2450, spa: 6.75, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 4, passiveDmg: 25, element: "Dark", range: 28 }
    },
    {
        id: "mob", name: "Psycho (100%)", role: "Damage",
        img: "images/units/Mob.png",
        totalCost: 31000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Standard DPS selection." },
        stats: { dmg: 2600, spa: 6.5, crit: 0, cdmg: 150, dot: 20, dotStacks: 1, spaCap: 5.5, passiveDmg: 0, element: "Rose", dotDuration: 4, range: 35 }
    },
    {
        id: "shanks", name: "Shunks", role: "Damage",
        img: "images/units/Shanks.png",
        totalCost: 40000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 2750, spa: 12, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2.5, passiveDmg: 0, element: "Rose", dotDuration: 0, range: 30 }
    },
    {
        id: "law", name: "Rule (Room)", role: "Support",
        img: "images/units/Law.png",
        totalCost: 33725,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler/Sacred", long: "Ruler/Sacred", note: "Ruler/Sacred offer the most Spa%- / Rng%+" },
        stats: { dmg: 1300, spa: 5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2, passiveDmg: 20, passiveSpa: 10, element: "Water", dotDuration: 0, range: 31.5 }
    },
    {
        id: "akainu", name: "Akainu", role: "Support / Damage",
        img: "images/units/Akainu.png",
        totalCost: 31760,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Eternal/Sacred", long: "Eternal/Sacred", note: "Eternal/Sacred offer the the best dps + support performance." },
        stats: { dmg: 1100, spa: 5, crit: 0, cdmg: 150, dot: 60, dotStacks: 1, spaCap: 2, passiveDmg: 0, passiveSpa: 0, element: "Fire", dotDuration: 7, range: 37 }
    },
    {
        id: "ichigo", name: "Ichiko (Rage)", role: "Damage",
        img: "images/units/Ichigo.png",
        totalCost: 108000,
        placement: 1, tags: ["Peroxide", "Reaper", "Rage", "Hollow"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 3000, spa: 8, crit: 15, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 7, passiveDmg: 50, passiveSpa: 0, element: "Dark", dotDuration: 0, range: 38 }
    },
    {
        id: "grimjaw", name: "Grommjaw", role: "Damage",
        img: "images/units/Grimjaw.png",
        totalCost: 31760,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { dmg: 1590, spa: 9, crit: 0, cdmg: 150, dot: 50, dotStacks: 1, spaCap: 3, passiveDmg: 6.67, passiveSpa: 4.17, element: "Water", dotDuration: 10, range: 35 }
    },
    {
        id: "stark", name: "Koyote", role: "Damage",
        img: "images/units/Stark.png",
        totalCost: 42000,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 2800, spa: 6, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 6, passiveDmg: 0, passiveSpa: 0, element: "Ice", dotDuration: 0, range: 42 }
    },
    {
        id: "ulquiorra", name: "Ultiorra", role: "Damage",
        img: "images/units/Ulqiorra.png",
        totalCost: 40000,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { dmg: 1275, spa: 5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2, passiveDmg: 0, passiveSpa: 5, element: "Dark", dotDuration: 0, range: 37 },
        ability: { buffDmg: 65, passiveSpa: 2.5, crit: 10 }
    },
    {
        id: "harribel", name: "Tierabel", role: "Damage",
        img: "images/units/Harribel.png",
        totalCost: 31760,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { dmg: 1490, spa: 8.5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2, passiveDmg: 0, passiveSpa: 0, element: "Water", dotDuration: 0, range: 30 },
        ability: { buffDmg: 35, buffDuration: 80, spaCap: 4, hasToggle: true }
    },
    {
        id: "ace", name: "Spade", role: "Damage / Burn(DoT)",
        img: "images/units/Ace.png",
        totalCost: 39000,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler/Astral", note: "Ruler provides good dps to cost." },
        stats: { dmg: 1500, spa: 9, crit: 0, cdmg: 150, dot: 100, dotStacks: 1, spaCap: 6, passiveDmg: 60, element: "Fire", dotDuration: 4, range: 30 }
    },
    {
        id: "Jingliu", name: "Jangluu", role: "Damage",
        img: "images/units/Jingliu.png",
        totalCost: 33725,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { dmg: 1700, spa: 6, crit: 50, cdmg: 200, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 35, element: "Ice", dotDuration: 0, range: 40 }
    },
    {
        id: "megumin", name: "Migumen", role: "Damage / Burn(Dot)",
        img: "images/units/Megumin.png",
        totalCost: 136000,
        placement: 1, tags: [], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 8750, spa: 14, crit: 0, cdmg: 150, dot: 50, dotStacks: 1, spaCap: 4, passiveDmg: 0, element: "Fire", dotDuration: 10, range: 50 },
        ability: { passiveDmg: 50, passiveSpa: -50 }
    },
    {
        id: "bambietta", name: "Bambee", role: "Damage / (Support/Dot)",
        img: "images/units/Bambietta.png",
        totalCost: 40000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { dmg: 1250, spa: 6.5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 2, passiveDmg: 0, element: "Dark", dotDuration: 0, range: 38, hasElementSelect: true }
    },
    {
        id: "esdeath", name: "Ice Empress", role: "Damage / Support",
        img: "images/units/Esdeath.png",
        totalCost: 92000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Passive avg 37.5% Dmg (Cycles 0-75%). Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 1975, spa: 7.5, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 37.5, element: "Ice", dotDuration: 0, range: 50 }
    },
    {
        id: "phantom_captain", name: "Phantom Captain", role: "Summon / Dmg",
        img: "images/units/Phantom.png",
        totalCost: 68000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Needs low SPA (High Speed) to maintain max 9 planes." },
        stats: { dmg: 3600, spa: 10, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 0, element: "Light", dotDuration: 0, range: 55 },
        ability: {
            summonStats: {
                maxCount: 9,
                dmgPct: 50, // 50% of Host Dmg
                // Plane Type A: Explosive
                planeA: { spa: 12, duration: 36 },
                // Plane Type B: Mounted
                planeB: { spa: 7.5, duration: 45 },
                // Buff: First 10s
                buffWindow: 10,
                buffCrit: 30, // 30% CR
                buffCdmg: 200 // 200% CDmg
            }
        }
    },
    {
        id: "sharpshooter", name: "Sharpshooter", role: "Damage / Support",
        img: "images/units/Sharpshooter.png",
        totalCost: 68000,
        placement: 2, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler", note: "Toggle Ability for Sniper Mode (Global Range)." },
        stats: {
            dmg: 1450, spa: 6, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3.5,
            element: "Fire", dotDuration: 0, range: 50,
            passiveDmg: 125, // Normal Mode: 2.25x Dmg
            passiveSpa: 0
        },
        ability: {
            passiveDmg: 10,  // Sniper Mode: 1.1x Dmg
            passiveSpa: 10,  // Sniper Mode: 0.9x SPA (10% reduction)
            range: 120  // Sniper Mode: 200 Range
        }
    },
    {
        id: "rohan", name: "Rohan & Robot 16", role: "Damage",
        img: "images/units/Rohan.png",
        totalCost: 54000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ability activates Unleashed mode." },
        stats: { dmg: 1820, spa: 7.5, crit: 15, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 30, passiveSpa: 5, element: "Light", dotDuration: 0, range: 55 },
        ability: { dmg: 2445, spa: 8.5, range: 58, spaCap: 2 }
    },
    {
        id: "cell", name: "Bio-Android (Imperfect)", role: "Damage / Summon",
        img: "images/units/Cell.png",
        totalCost: 56000,
        placement: 1, tags: ["Bio-Android"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count. Base form is True Form. Toggle for Perfect Form (Summon)." },
        stats: {
            baseName: "True Form",
            dmg: 3250, spa: 10, crit: 0, cdmg: 150, dot: 0, spaCap: 4.1,
            passiveDmg: 70, element: "Wind", range: 43
        },
        ability: {
            abilityName: "Perfect Form",
            dmg: 3025, spa: 9.5, spaCap: 2.5, range: 43,
            passiveDmg: 50,
            summonStats: {
                attacksToSpawn: 3, maxCount: 3, dmgPct: 50, buffWindow: 0,
                planeA: { spa: 7.5, duration: 30 },
                planeB: { spa: 7.5, duration: 30 }
            }
        }
    },
    {
        id: "vegeta", name: "Fallen Prince", role: "Damage",
        img: "images/units/Vegeta.png",
        totalCost: 35112,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Toggle Boss Stacks for max damage." },
        stats: { dmg: 2275, spa: 8, crit: 45, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3, passiveDmg: 0, passiveSpa: 15, passiveRange: 15, element: "Dark", dotDuration: 0, range: 44 },
        ability: { passiveDmg: 150 }
    },
    {
        id: "super_roku", name: "Super Roku", role: "Damage",
        img: "images/units/SuperRoku.png",
        totalCost: 48000,
        placement: 2, tags: ["Saiyan"], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler", note: "Toggle Same Enemy for boss DPS calculation." },
        stats: { dmg: 1950, spa: 6.5, crit: 10, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 4, passiveDmg: 25, element: "Light", dotDuration: 0, range: 41 },
        ability: {}
    },
    {
        id: "trunks", name: "The Drink", role: "Damage / DoT",
        img: "images/units/Trunks.png",
        totalCost: 40000,
        placement: 4, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Passive averages to +25% Damage." },
        stats: { dmg: 1810, spa: 8.5, crit: 0, cdmg: 150, dot: 25, dotStacks: 1, spaCap: 2, passiveDmg: 45, element: "Water", dotDuration: 5, range: 45 },
    },
    {
        id: "water_god", name: "Enlightened God", role: "Utility Ground",
        img: "images/units/WaterGod.png",
        totalCost: 72600,
        placement: 3, tags: [], placementType: "Ground",
        meta: {
            short: "Ruler/Sacred",
            long: "Sacred/Fission",
            note: "God Of The Seas: +20% DoT/Affliction. Crit increases 5% per attack (Cap 30/50%). Double attack at cap."
        },
        stats: { dmg: 2500, spa: 9, crit: 50, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 3.5, passiveDmg: 0, element: "Water", dotDuration: 0, range: 30, followUp: true },
        ability: { buffDmg: 50, abilityName: "Primordial Wave", noToggle: true, cooldown: 60, desc: "Water God summons a Primordial Wave down The Path that deals 200% Damage to all Enemies on That Path." },
        passives: [
            { name: "God Of The Seas", desc: "Applies +20% DoT and Affliction Time (+30% at E4). Increases Crit Rate by 5% per attack up to 30% (50% at E2). Performs FuA at cap." },
            { name: "Primordial Power", desc: "Inflicts 'Time Snail' (3s): +20% DoT Duration, 30% Slow, and buffs Water God Damage by 5% per enemy effected (max +50%)." }
        ],
        etherealization: [
            "+10 Stat Points",
            "Crit rate cap increased to 50%<br>(God Of The Seas)",
            "+10 Stat Points",
            "DoT and Affliction Time increased by 10%<br>(God Of The Seas)",
            "+10 Stat Points",
            "+75% Damage per placement"
        ]
    },
    {
        id: "first_emperor", name: "First Emperor (Greatest)", role: "Specialist / Ground",
        img: "images/units/FirstEmperor.png",
        totalCost: 89500,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", noz: "Attack Form: Demon art : Axe. Ruler is strictly best due to 1 placement count." },
        stats: { dmg: 3200, spa: 7, crit: 0, cdmg: 150, dot: 120, dotStacks: 1, spaCap: 3, passiveDmg: 0, element: "Rose", dotDuration: 10, range: 32 },
        passives: [
            { name: "Guidance of the Original Monarch", desc: "Everytime First Emperor switches Demonic Arts, all Units in First Emperor's Range will perform an Attack. [On E6] Units Performing an Attack will gain 15% of First Emperor's Damage for 10 seconds." },
            { name: "Flow Disruptor", desc: "When First Emperor Attacks a Sprinter Enemy, The Enemy gets slowed by 30% for 3 seconds." },
            { name: "The King's Advantage", desc: "First Emperor deals +25% Damage to non shielded Enemies." },
            { name: "Indomitable Willpower", desc: "When First Emperor is Stunned, he resists the Stun and applies a 3 Seconds Stun on his next Attack." }
        ],
        ability: {
            abilityName: "Demonic Art Swap",
            noToggle: true,
            desc: "When First Emperor Reaches his Final Upgrade, he unlocks the Ability to Change his Demonic Art. Starts with <b class='mt-text-gold'>Blade</b>.<br><br>" +
                "<span style='display: block; margin-top: 10px;'><b class='mt-text-gold'>Blade:</b> +60% Damage (+80% on E2) for 25s on switch.</span>" +
                "<span style='display: block; margin-top: 6px;'><b class='mt-text-orange'>Axe:</b> Attacks Slow Enemies by 40% for 5s. Confusion for 3s on first hit.</span>" +
                "<span style='display: block; margin-top: 6px;'><b class='text-accent-start'>Crossbow:</b> +1000% Range, Sets Priority to Strongest. Attacks apply Stun for 2s, but -20% Attack Speed. <span class='text-dim'>[On E6: +30% Damage]</span></span>" +
                "<span style='display: block; margin-top: 6px;'><b class='mt-text-green'>Spear:</b> Attacks get rid of old Bleed and apply new Bleed (100% Damage, 120% on E2) over 10 ticks.</span>" +
                "<span style='display: block; margin-top: 6px;'><b class='text-accent-end'>Armor:</b> Sets Priority to Last and moves to Closest Path point. Confusion for 1.5s (2.5s on E4) to Non-Boss enemies walking into him. <span class='text-dim'>[On E4: deals 50% Damage to confused enemies]</span></span>"
        },
        etherealization: [
            "+10 Stat Points",
            "\"Demon Art: Blade\" Damage Buff Increased to +80%",
            "+10 Stat Points",
            "\"Demon Art: Armor\" now deals 50% Damage, Confusion Duration Increase To 2.5s",
            "+10 Stat Points",
            "\"Guidance of the Original Monarch\" Passive now Buffs Units and \"Demon Art: Crossbow\" gives +30% Damage."
        ]
    },
    {
        id: "underworld_god",
        name: "Underworld God",
        role: "(Specialist)/Ground",
        img: "images/units/UnderworldGod.png",
        totalCost: 89400,
        placement: 2,
        tags: ["Divinity"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Divine Blood converts debuffs to buffs. Eldest Brother provides up to +90% Damage via Divinity tags." },
        stats: { dmg: 7500, spa: 10, crit: 0, cdmg: 150, dot: 0, dotStacks: 1, spaCap: 4, passiveDmg: 90, passiveSpa: 15, element: "Wind", range: 40 },
        passives: [
            { name: "Divine Blood", desc: "Whenever Underworld God receives a negative buff, he converts it into a positive buff. [On E4]: These buffs last indefinitely." },
            { name: "As The Eldest Brother", desc: "Each unit with the 'Divinity' tag in range buffs this unit by +15% Damage, up to 60% (90% on E2)." },
            { name: "Sibling Combined Might", desc: "Passively has +35% (+60% on E6) Hyper Armor Damage. Performs a 75% Damage follow-up attack when hitting an Armored Enemy for the first time." },
            { name: "Primordial Power", desc: "Passively applies +20% DoT and Affliction Time. Inflicts 'Time Snail' (3s): +20% DoT Duration, 30% Slow, and +1% Attack Speed per afflicted enemy in range (max 15%)." }
        ],
        etherealization: [
            "+10 Stat Points",
            "As The Eldest Brother: Max Damage buff increased to 90%",
            "+10 Stat Points",
            "Divine Blood: Converted positive buffs now last indefinitely",
            "+10 Stat Points",
            "Sibling Combined Might: Hyper Armor Damage increased to 60%"
        ]
    },
    {
        id: "ancient_shinob",
        name: "Ancient Shinobi",
        role: "DPS / Ground",
        img: "images/units/AncientShinob.png",
        totalCost: 96450,
        placement: 3,
        tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Reanimation triples damage but forces 1 placement. Samurai Technique (E2) adds burst damage." },
        stats: {
            dmg: 11750,
            spa: 25,
            range: 45,
            spaCap: 5,
            crit: 0,
            cdmg: 150,
            passiveDmg: 50, // 30% (The Wisest) + 20% (Ancient Techniques Debuff)
            dot: 12.5,     // 25% Burn every other attack = 12.5% avg
            dotDuration: 6,
            dotStacks: 1,
            element: "Water"
        },
        ability: {
            abilityName: "Reanimation",
            desc: "Removes all placements and sets limit to 1. Re-Place Bonus: +150% Damage (+200% total at E6).",
            passiveDmg: 200, // +200% on top of 100% base = 300% (35,250 dmg)
            limitPlace: 1
        },
        passives: [
            { name: "The Wisest", desc: "Every 5s gain +2% Damage (+5% at E4). Max: 30%." },
            { name: "Ancient Techniques of Old", desc: "Alternating attacks. Atk 1: Confuse (2s). Atk 2: Burn (25% Dmg over 6s). Enemies hit take +20% Damage." },
            { name: "Samurai Technique", desc: "[E2] Gain +15% Damage for 15s upon use." },
            { name: "Weapon Proficiency", desc: "Stun Immunity. Every 5 attacks cycles weapons (modifiers ignored in DPS calc)." }
        ],
        etherealization: [
            "+10 Stat Points",
            "\"Samurai Technique\" Passive adds +15% Damage for 15s.",
            "+10 Stat Points",
            "\"The Wisest\" Passive Buff increased to +5%.",
            "+10 Stat Points",
            "\"Reanimation\" Damage increased to +200%."
        ]
    },
    {
        id: "majestic_armor",
        name: "Majestic Armor (Syncro)",
        role: "Damage / DoT",
        img: "images/units/MajesticArmor.png",
        totalCost: 140910,
        placement: 2,
        tags: ["Team 7", "Ninjaverse", "Hero", "Bloodline"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "High base crit and powerful dual-element DoT makes this unit an extremely efficient hybrid."
        },
        stats: {
            dmg: 13000, spa: 12, range: 40, spaCap: 5,
            crit: 50, // 0 + 50 from Passive
            cdmg: 250, // 150 + 100 from Passive
            dot: 60,
            dotDuration: 6,
            dotStacks: 1,
            element: "Dark",
            passiveDmg: 0
        },
        passives: [
            { name: "Combined Might", desc: "On attack apply either black burn or wind shear for 60% over 6 ticks." },
            { name: "Unlikely Alliance", desc: "On placement gain +50% Crit rate and +100% Critical damage." }
        ]
    },
    {
        id: "unparalleled_armor",
        name: "Unparalleled Armor (Syncro)",
        role: "Damage / Buffer",
        img: "images/units/UnparalleledArmor.png",
        totalCost: 168360,
        placement: 1,
        tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "Global Buffer: Bijuu Link (Toggle) provides massive scaling to all units."
        },
        stats: {
            dmg: 24000, spa: 12, range: 35, spaCap: 4,
            crit: 0, cdmg: 150, dot: 0,
            element: "Water", passiveDmg: 0, hyper: 60
        },
        passives: [
            { name: "Unparalleled Combination", desc: "On placement gain +60% Hyper Armor Damage." },
            { name: "Bijuu Link", desc: "Energy overflows to allies in range, giving them glowing red cloaks (+25% Dmg, +25% Range, -15% SPA)." },
            { name: "Power of ancient shinobi", desc: "On attack apply either stun or confuse for 3 seconds." }
        ]
    },
    {
        id: "sasuke_great_war",
        name: "Sasku (Great War)",
        role: "Damage / Debuff",
        img: "images/units/SasukeGreatWar.png",
        totalCost: 69000,
        placement: 3,
        tags: ["Sage", "Bloodline", "Villain", "Ninjaverse"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "The suggested Ruler trait is intended for fusing to create Majestic Armor (Syncro)."
        },
        stats: {
            dmg: 3000, spa: 9, range: 40, spaCap: 4,
            crit: 0, cdmg: 150,
            dot: 60, dotDuration: 10, dotStacks: 1,
            element: "Dark",
            passiveDmg: 50 // Avg: Clanhood (20%) + Spirited Cage (15%) + Hatred (15%)
        },
        passives: [
            { name: "Spirited Cage", desc: "Stunning enemies builds charges. At full charge: +50% True Damage and Stun Immunity for 10s." },
            { name: "Clanhood", desc: "Gain +10% Damage for every 'Bloodline' tag unit in range." },
            { name: "Dimensional Warp", desc: "Execute enemies below 30% HP (40% at E2). Bosses take 300% instant damage + 3% Burn/s." },
            { name: "Pure Hatred", desc: "Enemies entering range take +15% Damage. Dark enemies are stunned for 3s." },
            { name: "Combat Arts", desc: "Almighty Push (40s CD): 200% Dmg + Push. Almighty Pull (50s CD): 5s Stun. Amenatejikara: Crit Buffs." }
        ],
        etherealization: [
            "+10 Stat Points",
            "Dimensional Warp trigger requirement increased to 40% Health.",
            "+10 Stat Points",
            "Spirited Cage charge requirement reduced to 3 stuns.",
            "+10 Stat Points",
            "Full Susanoo: Damage Bonus increased to +150%."
        ]
    },
    {
        id: "king_sailor",
        name: "King Sailor",
        role: "Utility / Ground",
        img: "images/units/KingSailor.png",
        totalCost: 91800,
        placement: 2,
        tags: ["Magi", "King", "Hero", "Uncontrollable Power"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Manipulator of Fate: +50% Dmg / -25% SPA. Baal's Lightning provides +20% Follow-up damage." },
        stats: {
            dmg: 6325, spa: 15, range: 45, spaCap: 4,
            crit: 20, cdmg: 175, followUp: 20,
            element: "Water", passiveDmg: 50, passiveSpa: 25
        },
        passives: [
            { name: "Manipulator of Fate", desc: "Gain +50% Damage and -25% Attack Speed based on shared tags with allies." },
            { name: "Baal's Lightning", desc: "Every attack chains to 7 enemies for 20% damage (E4). Range extended by 10%." },
            { name: "Unrivaled Mark", desc: "Global Buff: Magi (+50% Dmg, -15% SPA), Uncontrollable (+30% Dmg, -10% SPA), Water (+20% Dmg, -10% SPA)." },
            { name: "Rukh's Judgement", desc: "When attacking an enemy inflicted by chain lightning in the last 10s: +10% Crit Damage and +5% Crit Chance for 15s. [On E6]: both buffs increased by 15%." }
        ],
        etherealization: [
            "+10 Stat Points",
            "\"Baal's Lightning\" Chains up to 7 enemies",
            "+10 Stat Points",
            "\"Baal's Lightning\" Damage increased to 20%",
            "+10 Stat Points",
            "\"Rukh's Judgement\" Buffs increased by 15% each."
        ]
    },
    {
        id: "nutaru_beast",
        name: "Nutaru (Beast)",
        role: "DPS / Ground",
        img: "images/units/NutaruBeast.png",
        totalCost: 71910,
        placement: 2,
        tags: ["Team 7", "Ninjaverse", "Main character", "Sage", "Hero", "Bloodline"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "Dynamic Attacker: Swapping to Beast Mode increases SPA Cap to 3.0 but grants massive Crit and Cycle damage."
        },
        stats: {
            dmg: 3300, spa: 8, range: 45, spaCap: 2.5,
            crit: 0, cdmg: 150, dot: 0,
            element: "Wind",
            passiveDmg: 40 // Average uptime for clone disappearance buff
        },
        ability: {
            abilityName: "Beast Mode",
            desc: "[E6] Unleash the Beast: +30% Dmg, +50% CDmg, +35% Crit Rate, +50% Cycle Dmg. SPA Cap: 3.0s. Clones deal 25% more Damage.",
            passiveDmg: 120, // 30 (Beast) + 40 (Clone Loss) + 50 (Cycle)
            crit: 35,
            cdmg: 200,
            spaCap: 3.0,
            summonStats: {
                attacksToSpawn: 8, maxCount: 3, dmgPct: 75, buffWindow: 0,
                planeA: { spa: 8, duration: 20 },
                planeB: { spa: 8, duration: 20 }
            }
        },
        passives: [
            { name: "Shadow Clone", desc: "Every 8 attacks, summon a clone (Max 3 at E2) for 20s. Clones deal 75% Dmg. Gain +20% Dmg (Max 40%) when clones expire." },
            { name: "Chakra Control", desc: "+5% Chakra per attack. Auto-enters Beast Mode at 100%. Beast Mode lasts 100s." },
            { name: "Beast Cycle", desc: "Cycles: Beast Slam -> Beast Ball -> Massive Beast Ball. Completion grants +50% Damage for the mode duration." }
        ],
        etherealization: [
            "+10 Stat Points",
            "Shadow Clone cap increased to 3.",
            "+10 Stat Points",
            "Clones gain +25% Damage while Beast Mode is active.",
            "+10 Stat Points",
            "Beast Mode Crit Rate increased to 35%. Summons gain +60% Damage."
        ]
    },
    {
        id: "crow_shinobi",
        name: "Crow Shinobi",
        role: "DPS / Hill",
        img: "images/units/CrowShinobi.png",
        totalCost: 68450,
        placement: 3,
        tags: ["Ninjaverse", "Bloodline", "Hero"], placementType: "Hill",
        meta: {
            short: "Ruler",
            long: "Eternal",
            note: "Powerful DoT and crowd control. Below 60% HP, Amaterasu becomes significantly more lethal."
        },
        stats: {
            dmg: 3050, spa: 8, range: 46, spaCap: 2.5,
            crit: 0, cdmg: 150, dot: 60, dotDuration: 10, dotStacks: 1,
            element: "Fire"
        },
        passives: [
            { name: "Elusive Crow Distraction", desc: "Every 5 attacks (4 at E2) confuses enemies for 2 seconds (3s at E2)." },
            { name: "Flame Sealing Technique", desc: "On Kill (Enemy with Black Burn): 30% chance to stun nearby enemies for 4s." },
            { name: "Amaterasu", desc: "Attacks apply Black Burn (60% Dmg over 10 ticks). Re-applying to a burning target inflicts 'Time Snail': +20% DoT/Affliction and 30% Slow. Enemies below 60% HP take 3% (6% at E6) unit damage per second until death." }
        ],
        ability: {
            abilityName: "Moon God: Counter Crash",
            desc: "Summons a meteor dealing 150% (250% at E4) damage and removes all enemy modifiers. Cooldown: 60s.",
            noToggle: true,
            cooldown: 60
        },
        etherealization: [
            "+10 Stat Points",
            "Elusive Crow: Proc at 4 attacks, 3s duration",
            "+10 Stat Points",
            "Counter Crash: Damage increased to 250%",
            "+10 Stat Points",
            "Amaterasu: Execute Burn increased to 6%"
        ]
    },
    {
        id: "ancient_mage",
        name: "Ancient Mage (Slayer)",
        role: "Utility / Ground",
        img: "images/units/AncientMage.png",
        totalCost: 66700,
        placement: 1,
        tags: ["Sage", "Bloodline", "Hero", "Main character"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "Dynamic Class System. Specialist mode maximizes DoT, while DPS mode provides the highest raw hit damage."
        },
        stats: {
            dmg: 5500, spa: 8, range: 45, spaCap: 4,
            crit: 0, cdmg: 150, dot: 60, dotDuration: 10,
            element: "Light",
            passiveDmg: 20,  // Base Experience (20)
            passiveSpa: 0,
            bossDmg: 0,
            dotBuff: 40,     // Specialist focus (+40% DoT)
            hyper: 50        // Specialist focus (+50% True Dmg)
        },
        modes: {
            "DPS": { desc: "Combat focus: +20% Dmg, -40% Atk Speed, +50% Boss Dmg. Applies Wind Shear (60% DoT over 10s)." },
            "Specialist": { desc: "Magic focus: +40% DoT, +50% True Damage. Swaps Wind Shear for Burn (60% DoT over 10s)." },
            "Support": { desc: "Stop attacking and buffs units in range: +15% Effect Res, +20% Crit Damage, +20% Crit Rate. When buffed unit attacks: Follow-up attack (Follow Up Cooldown: 30s)." },
            "Utility": { desc: "Attack apply stun for 2s. If already stunned: Enemies will take +20% damage (cannot apply multiple times). Apply slow (75% Speed for 5s)." }
        },
        passives: [
            { name: "Millennia Old Experience", desc: "Every attack: Enemies take +20% Damage (Debuff) and Wind Shear (60% Dmg over 10 ticks). Specialist Mode swaps Wind Shear for Burn and increases DoT effectiveness." },
            { name: "The Last Great Mage", desc: "Gains Stun Immunity while not attacking (Always active at E4)." }
        ],
        ability: {
            abilityName: "DPS",
            desc: "Combat focus: +20% Dmg, -40% Atk Speed, +50% Boss Dmg. Applies Wind Shear (60% DoT over 10s).",
            passiveDmg: 40,  // Base Experience (20) + DPS (20)
            passiveSpa: -40, // Atk Speed Penalty
            bossDmg: 50,     // Boss Killer
            dotBuff: 0,      // Reset Specialist buff
            hyper: 0,        // Reset Specialist buff
            cooldown: 60
        },
        etherealization: [
            "+10 Stat Points",
            "Gain +20% DOT effectiveness.",
            "+10 Stat Points",
            "The Last Great Mage: Stun Immunity is always active.",
            "+10 Stat Points",
            "Battle Adaptation: Cooldown reduced to 45s."
        ]
    },
    {
        id: "prodigy_mage",
        name: "Prodigy Mage",
        role: "Support / Hill",
        img: "images/units/ProdigyMage.png",
        totalCost: 46200,
        placement: 3,
        tags: ["Hero"], placementType: "Hill",
        meta: {
            short: "Sacred/Eternal",
            long: "Sacred/Eternal",
            note: "Battle Dominant: Applies powerful Slow and Wind Shear DoT. Party's Tactician allows flexible buffs for Hill or Ground allies."
        },
        stats: {
            dmg: 2450, spa: 6, range: 44, spaCap: 3,
            crit: 0, cdmg: 150,
            dot: 0, dotDuration: 0, dotStacks: 0,
            element: "Rose",
            passiveDmg: 0
        },
        passives: [
            { name: "Battle Dominant", desc: "Every attack: apply slow (30% Speed for 5s). [E4]: Attacking slowed units applies Stun for 2.5s." },
            { name: "Travel Buddies", desc: "If Ancient Mage is in Range: -20% Attack Speed.<br>If Dragon Slayer is in range: +25% Range.<br>[E2]: Buffs increased by 5%." }
        ],
        ability: {
            abilityName: "Party’s Tactician",
            noToggle: true,
            desc: "Select any unit in range to ally with.<br>Hill Unit Selected: -30% Attack Speed on Both units.<br>Ground Unit Selected: +45% Crit Rate On Both Units."
        },
        etherealization: [
            "+10 Stat Points",
            "\"Travel Buddies\" Passive Buff Increased by 5% each.",
            "+10 Stat Points",
            "Attacking Slowed enemies applies Stun for 2.5s.",
            "+10 Stat Points",
            "Upgrade Cost decreased by 20%."
        ]
    },
    {
        id: "ant_king_savage",
        name: "Ant King (Savage)",
        role: "DPS / Ground",
        img: "images/units/AntKing.png",
        totalCost: 63000,
        placement: 2,
        tags: ["Leveling", "King"], placementType: "Ground",
        meta: {
            short: "Ruler",
            long: "Ruler",
            note: "Predatory Gluttony: Gain +30% True Damage and +30% (+50% at E6) Damage via kill-stacking. Reset after 10s without kill."
        },
        stats: {
            dmg: 4300, spa: 8, range: 40, spaCap: 5.5,
            crit: 0, cdmg: 150,
            dot: 80, dotDuration: 6, dotStacks: 1,
            element: "Dark",
            passiveDmg: 50, // Max Gluttony Stacks
            hyper: 30       // True Damage
        },
        passives: [
            { name: "Predatory Gluttony", desc: "Gain +30% True Damage. Every Kill: Gain +1% Damage (Cap +30% [+50% at E6]). Boss Kill instantly caps. Resets after 10s without getting a kill." },
            { name: "Paralyzing Venom", desc: "Applies Radiation for 80% Damage over 6 ticks. Applies 15% (20% at E2) Slow while active." },
            { name: "Monarch's Devotion", desc: "When 'Jinoo' is in range: +20% Damage, +10% Range. [On E4]: Buffs all other units in range by +10% Damage." }
        ],
        ability: {
            abilityName: "Monarch's Devotion",
            desc: "Simulate 'Jinoo' presence in range: +20% Damage, +10% Range.",
            buffDmg: 20,
            passiveRange: 10,
            hasToggle: true
        },
        etherealization: [
            "+10 Stat Points",
            "\"Paralyzing Venom\" Slow increased to 20%.",
            "+10 Stat Points",
            "\"Monarch's Devotion\" gives all units in range +10% Damage.",
            "+10 Stat Points",
            "\"Predatory Gluttony\" Damage Cap increased to +50%."
        ]
    }
];

const creditsData = [
    { role: "Owner", name: "xKing.", id: "xking.", userId: "347578773857632258", pfp: "images/pfp/xking.png", type: "owner" },
    { role: "Helper", name: "xAuroraFlare", id: "xauroraflare", userId: "216293393888837632", pfp: "images/pfp/xauroraflare.gif", type: "helper" }
];
const MAIN_STAT_VALS = {
    body: { dmg: 60, dot: 75, cm: 120 },
    legs: { dmg: 60, spa: 22.5, cf: 37.5, range: 30 },
    // Visual values for Head (Math engine ignores these currently)
    head: { potency: 45, elemental: 30 } 
};

// CSS Class Mapping
const STAT_CODE_TO_CLASS = {
    dmg:   'border-dmg',
    spa:   'border-spa',
    cdmg:  'border-cdmg',
    crit:  'border-crit',
    dot:   'border-dot',
    range: 'border-range',
    potency: 'border-potency',
    elemental: 'border-elemental',
    meter: 'border-custom',
    hyper: 'border-red'
};

const STAT_LABELS = {
    dmg: 'Dmg', spa: 'SPA', cdmg: 'Crit Dmg', crit: 'Crit Rate', dot: 'DoT', range: 'Range',
    potency: 'Potency', elemental: 'Elem Dmg', // New Labels
    cm: 'Crit Dmg', cf: 'Crit Rate',
    meter: 'Meter Gain', hyper: 'Hyper Dmg'
};

// Assuming a max of 6 rolls for each sub-stat
const MAX_SUB_STAT_VALUES = {
    dmg: 24,    // 4 * 6
    spa: 9,     // 1.5 * 6
    cm: 27,     // 4.5 * 6
    cf: 15,     // 2.5 * 6
    dot: 30,    // 5 * 6
    range: 12   // 2 * 6
};

// Stat Name Mappings
const NAME_TO_CODE = {
    "Dmg": "dmg", "Damage": "dmg",
    "SPA": "spa",
    "Crit Dmg": "cm", "Crit Damage": "cm",
    "Crit Rate": "cf", "Crit": "cf", 
    "DoT": "dot", 
    "Range": "range",
    "Potency": "potency", "Buff Potency": "potency",
    "Elemental Dmg": "elemental", "Elem Dmg": "elemental", "Elemental": "elemental"
};

// Info Definitions for Popups
const infoDefinitions = {
    'stat_dmg': {
        title: "Damage (Dmg)",
        formula: `<span class="ip-var">Damage</span>`,
        desc: "Increases the base damage dealt per hit."
    },
    'stat_spa': {
        title: "Seconds Per Attack (SPA)",
        formula: `<span class="ip-var">Seconds Per Attack</span>`,
        desc: "Reduces the time between attacks. Lower is better/faster."
    },
    'stat_cdmg': {
        title: "Critical Damage (CDmg)",
        formula: `<span class="ip-var">Critical Damage</span>`,
        desc: "The multiplier applied to damage when a Critical Hit occurs."
    },
    'stat_crit': {
        title: "Critical Rate (Crit)",
        formula: `<span class="ip-var">Critical Rate</span>`,
        desc: "The percentage chance to land a Critical Hit."
    },
    'stat_dot': {
        title: "Damage Over Time (DoT)",
        formula: `<span class="ip-var">Damage Over Time</span>`,
        desc: "Increases damage dealt by status effects (Burn, Bleed, etc)."
    },
    'stat_range': {
        title: "Range (Rng)",
        formula: `<span class="ip-var">Range</span>`,
        desc: "Increases the radius of the unit's attack."
    },
    'stat_potency': {
        title: "Potency",
        formula: `<span class="ip-var">Ignored</span>`,
        desc: "Increases Buff Potency by up to 45%."
    },
    'stat_elemental': {
        title: "Elemental Damage",
        formula: `<span class="ip-var">Ignored (Bugged)</span>`,
        desc: "Intended to increase damage matching the unit's element. <br><strong class='text-red'>Currently bugged in-game and does nothing.</strong>"
    },
    'level_scale': {
        title: "Level Scaling Formula",
        formula: `
        <span class="ip-var">Dmg</span> = <span class="ip-var">Base</span> * (1.0045125 ^ <span class="ip-var">Lv</span>)<br>
        <span class="ip-var">SPA</span> = <span class="ip-var">Base</span> * (0.9954875 ^ <span class="ip-var">Lv</span>)<br>
        <span class="ip-var">Range</span> = <span class="ip-var">Base</span> * (1.0045125 ^ <span class="ip-var">Lv</span>)
        `,
        desc: "Damage <b>and Range</b> increase exponentially by approx <span class='text-white'>0.45%</span> per level.<br>SPA decreases by approx <span class='text-white'>0.45%</span> per level.<br><br><b>SSS Rank:</b> Adds a flat multiplier (<span class='ip-num'>x1.2</span> Dmg/Rng, <span class='ip-num'>x0.92</span> SPA) applied <i>after</i> level scaling."
    },
    'trait_logic': {
        title: "Trait Multipliers",
        formula: `<span class="ip-var">Combined</span> = (1 + <span class="ip-var">T1</span>%) * (1 + <span class="ip-var">T2</span>%)`,
        desc: "Traits are direct multipliers to your Base Stats.<br><br><b>Double Traits:</b> When using a Custom Pair, the traits are <b>Compounded</b> (multiplied together), not just added.<br><i>Example:</i> A <span class='ip-num'>+200%</span> Trait (x3.0) and a <span class='ip-num'>+15%</span> Trait (x1.15) result in a <b class='text-white'>x3.45</b> total multiplier (+245%), making double traits extremely powerful."
    },
    'relic_multi': {
        title: "Relic Stat Logic",
        formula: `<span class="ip-hl">Sum</span> (<span class="ip-var">MainStats</span> + <span class="ip-var">SubStats</span>)`,
        desc: "Relic Stats are additive with each other, but <b>Multiplicative</b> to Base Stats and Set Bonuses.<br>They are calculated in their own separate bucket."
    },
    'tag_logic': {
        title: "Additive Bucket",
        formula: `<span class="ip-var">SetBase</span> + <span class="ip-var">TagBuffs</span> + <span class="ip-var">Passive</span>`,
        desc: "<b>Set Bonuses</b>, <b>Unit Passives</b>, and <b>Ability Buffs</b> are all <b>Additive</b> with each other.<br>They are summed together before multiplying the base damage."
    },
    'spa_calc': {
        title: "SPA (Speed) Calculation",
        formula: `<span class="ip-var">Base</span> * <span class="ip-hl">LvScale</span> * (1 - <span class="ip-var">Trait</span>%) * (1 - <span class="ip-var">Relic</span>%)`,
        desc: "Speed reductions are calculated in stages.<br>1. <b>Traits</b> are multiplicative reductions (stronger).<br>2. <b>Relics/Sets</b> are additive reductions (summed together first).<br>3. <b>Cap:</b> The final value cannot go lower than the unit's specific SPA Cap."
    },
    'sungod_passive': {
        title: "Sun God Head Passive",
        formula: `<span class="ip-var">Cycle</span> = <span class="ip-num">7s</span> + (6 * <span class="ip-var">SPA</span>)`,
        desc: "The Sun God Head grants a temporary Damage % Buff equal to your total Range.<br><br><b>Trigger:</b> Every 6 Attacks.<br><b>Duration:</b> 7 Seconds.<br><br>Because the buff must expire before the counter restarts, 100% uptime is impossible."
    },
    'ninja_passive': {
        title: "Junior Ninja Head Passive",
        formula: `<span class="ip-var">Cycle</span> = <span class="ip-num">10s</span> + (5 * <span class="ip-var">SPA</span>)`,
        desc: "The Junior Ninja Head grants <span class='ip-num'>+20%</span> Damage over Time (DoT) effectiveness.<br><br>Because the buff must expire before the counter restarts, 100% uptime is impossible."
    },
    'crit_avg': {
        title: "Crit Averaging",
        formula: `<span class="ip-var">AvgHit</span> = <span class="ip-var">Base</span> * (1 + (<span class="ip-var">Rate</span>% * <span class="ip-var">CDmg</span>%))`,
        desc: "Since Crits are probabilistic, we calculate the <b>Average Damage</b> per hit over a long period.<br><br><b>Crit Rate:</b> Hard capped at 100%.<br><b>Crit Dmg:</b> Base 150% + Additions."
    },
    'dot_logic': {
        title: "Damage Over Time (DoT)",
        formula: `<span class="ip-var">Total</span> = (<span class="ip-var">Hit</span> * <span class="ip-var">Tick</span>%) * <span class="ip-var">Stacks</span>`,
        desc: "<b>Tick %:</b> The percentage of the hit damage dealt per tick.<br><b>Stacks:</b> How many times the DoT applies.<br><b>Time Basis:</b> We convert total DoT damage into DPS by dividing by the time it takes to apply (SPA)."
    },
    'attack_rate': {
        title: "Attack Rate & Multi-Hit",
        formula: `<span class="ip-var">Mult</span> = 1 + (<span class="ip-var">Extra</span> / <span class="ip-var">Needed</span>)`,
        desc: "Used for units like Kirito who trigger extra attacks upon critting.<br>If a unit hits multiple times per 'Attack Cycle' (SPA), we multiply the final DPS to account for the extra hits generated per second."
    },
    'efficiency': {
        title: "Cost Efficiency (DPS per Yen)",
        formula: `<span class="ip-var">Score</span> = <span class="ip-var">Total DPS</span> / <span class="ip-var">Total Cost</span>`,
        desc: "This metric shows how much Damage Per Second you get for every <b>1 Yen</b> spent.<br><br><b>Total Cost</b> includes:<br>1. Deployment Cost<br>2. Max Upgrade Cost<br>3. Multiplied by Unit Placement Limit (e.g., x3 units).<br><br>A higher number means the unit is more economic."
    },
    'chain_logic': {
        title: "Chain Attack Mechanic",
        formula: `<span class="ip-var">AvgSPA</span> = Σ (<span class="ip-var">Time</span> * <span class="ip-var">Prob</span>)`,
        desc: "Rohan has a chance to 'Chain' (reset) his attack timer early at fixed intervals.<br><br><b>Interval:</b> Every 3s (Base) or 2s (Ability).<br><b>Probabilities:</b> 40% → 35% → 30% → 25% → 20%.<br><br>If the Chain triggers, the attack happens immediately. If it fails, it waits for the next interval or the natural SPA."
    }
};
// ============================================================================
// UTILS.JS - Shared Helper Functions
// ============================================================================

const format = (n) => 
    n >= 1e9 ? (n/1e9).toFixed(2) + 'B' : 
    n >= 1e6 ? (n/1e6).toFixed(2) + 'M' : 
    n >= 1e3 ? (n/1e3).toFixed(1) + 'k' : 
    n.toLocaleString(undefined, {maximumFractionDigits:0});

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
        const fmtVal = Number.isInteger(value) ? value : value.toFixed(1);
        valueHtml = `<span class="badge-val val-main">${fmtVal}%</span>`;
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
        const valStr = stat.val.toFixed(1) + '%';
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
    const base = parseFloat(input.dataset.baseVal);
    if (isNaN(base)) return;
    input.value = parseFloat((base * newStarMult).toFixed(3));
}

/**
 * Attaches scaling, clamping, and base-tracking logic to a stat input.
 */
function attachStatScaler(inputElement, getStarMultFn) {
    inputElement.oninput = () => {
        let value = parseFloat(inputElement.value);
        if (value < 0 || isNaN(value)) {
             if(value < 0) { inputElement.value = 0; value = 0; }
        }

        // Determine Stat Key (Handle 'data-stat' vs 'id')
        let rawKey = inputElement.dataset.stat || inputElement.id;
        const statKey = normalizeStatKey(rawKey);
        
        const baseMaxValue = MAX_SUB_STAT_VALUES[statKey];
        const starMult = getStarMultFn();
        const dynamicMaxValue = baseMaxValue * starMult;

        if (baseMaxValue !== undefined && value > dynamicMaxValue) {
            inputElement.value = dynamicMaxValue.toFixed(3);
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
        if (parts.length === 2 && typeof combineTraits === 'function') {
            const t1 = getTraitByName(parts[0], unitId);
            const t2 = getTraitByName(parts[1], unitId);
            if (t1 && t2) return combineTraits(t1, t2);
        }
    }

    return null;
}
function combineTraits(t1, t2) {
    if (t1.id === 'none' && t2.id === 'none') return t1;
    if (t1.id === 'none') return t2;
    if (t2.id === 'none') return t1;

    const compound = (v1, v2) => {
        const d1 = (v1 || 0) / 100;
        const d2 = (v2 || 0) / 100;
        return ((1 + d1) * (1 + d2) - 1) * 100;
    };

    const compoundReduction = (v1, v2) => {
        const r1 = (v1 || 0) / 100;
        const r2 = (v2 || 0) / 100;
        return (1 - (1 - r1) * (1 - r2)) * 100;
    };

    let combined = {
        id: t1.id + "+" + t2.id,
        name: `${t1.name} + ${t2.name}`,
        isCustom: true,
        subTraits: [t1, t2], 
        
        dmg: compound(t1.dmg, t2.dmg),
        spa: compoundReduction(t1.spa, t2.spa),
        range: compound(t1.range, t2.range),
        bossDmg: compound(t1.bossDmg, t2.bossDmg),
        
        critRate: (t1.critRate || 0) + (t2.critRate || 0),
        dotBuff: (t1.dotBuff || 0) + (t2.dotBuff || 0),

        isEternal: t1.isEternal || t2.isEternal,
        hasRadiation: t1.hasRadiation || t2.hasRadiation,
        radiationPct: (t1.radiationPct || 0) + (t2.radiationPct || 0),
        radiationDuration: Math.max(t1.radiationDuration || 0, t2.radiationDuration || 0),
        afflictionDuration: (t1.afflictionDuration || 0) + (t2.afflictionDuration || 0),
        dmgDebuff: (t1.dmgDebuff || 0) + (t2.dmgDebuff || 0),
        isAfflictionBugged: t1.isAfflictionBugged || t2.isAfflictionBugged,
        isDotBugged: t1.isDotBugged || t2.isDotBugged,
        isDebuffBugged: t1.isDebuffBugged || t2.isDebuffBugged,
        
        allowDotStack: t1.allowDotStack || t2.allowDotStack,
        allowPlacementStack: t1.allowPlacementStack || t2.allowPlacementStack,

        relicBuff: (t1.relicBuff ? t1.relicBuff - 1 : 0) + (t2.relicBuff ? t2.relicBuff - 1 : 0) + 1,
        
        limitPlace: (t1.limitPlace && t2.limitPlace) ? Math.min(t1.limitPlace, t2.limitPlace) : (t1.limitPlace || t2.limitPlace),

        costReduction: (t1.costReduction || 0) + (t2.costReduction || 0)
    };

    if(combined.relicBuff === 1) combined.relicBuff = undefined;
    return combined;
}

function getLevelStats(baseDmg, baseSpa, baseRange, dmgPoints, spaPoints, rangePoints) {
    const dmgMult = Math.pow(1.0045125, dmgPoints);
    const spaMult = Math.pow(0.9954875, spaPoints);
    const rangeMult = Math.pow(1.0045125, rangePoints || 0);
    
    return { 
        dmg: baseDmg * dmgMult, 
        spa: baseSpa * spaMult, 
        range: baseRange * rangeMult, 
        dmgMult, 
        spaMult,
        rangeMult
    };
}

const checkIsBetter = (res, currentBest, optimizeFor) => {
    if (optimizeFor === 'range') {
        if (res.range > currentBest.range) return true;
        if (res.range === currentBest.range && res.total > currentBest.total) return true;
        return false;
    }
    if (optimizeFor === 'raw_dmg' || optimizeFor === 'damage') {
        if (res.dmgVal > currentBest.dmgVal) return true;
        if (res.dmgVal === currentBest.dmgVal && res.total > currentBest.total) return true;
        return false;
    }
    return res.total > currentBest.total;
};

const getBestSubConfig = (build, stats, includeSubs, headMode, candidates, optimizeFor = 'dps') => {
    let mode = headMode;
    if (mode === true) mode = 'auto';
    if (mode === false) mode = 'none';

    let headOptions = (mode === 'auto') 
        ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'biju_head', 'reanimated_head'] 
        : (mode && mode !== 'none' ? [mode] : ['none']);
    
    let globalBestRes = { total: -1, range: -1 };
    let globalBestAssignments = {}; 
    let globalBestHead = 'none';

    const applyContextualStats = (b, pieceName, mainStat, pStat, sStat, ratio) => {
        let pWeight = ratio.p; 
        let sWeight = ratio.s; 
        
        if (pStat === mainStat) { sWeight = Math.min(6, sWeight + pWeight); pWeight = 0; } 
        else if (sStat === mainStat) { pWeight = Math.min(6, pWeight + sWeight); sWeight = 0; }
        if (pStat === mainStat && sStat === mainStat) { pWeight = 0; sWeight = 0; }

        let pVal = 0, sVal = 0;
        if (pWeight > 0) { pVal = PERFECT_SUBS[pStat] * pWeight; b[pStat] = (b[pStat] || 0) + pVal; }
        if (sWeight > 0) { sVal = PERFECT_SUBS[sStat] * sWeight; b[sStat] = (b[sStat] || 0) + sVal; }

        candidates.forEach(cand => {
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

    headOptions.forEach(headType => {
        const actualIncludeHead = (headType !== 'none');
        stats.context.headPiece = headType;

        if (!includeSubs) {
            let res = calculateDPS(stats, build, stats.context);
            res.totalStats = build;
            if(checkIsBetter(res, globalBestRes, optimizeFor)) {
                globalBestRes = res; globalBestAssignments = {}; globalBestHead = headType;
            }
            return;
        }

        let strategies = [];
        candidates.forEach(c => strategies.push({ p: c, s: c, ratio: { p: 6, s: 0 } }));
        const pairs = [['dmg', 'cf'], ['dmg', 'spa'], ['dmg', 'range'], ['dmg', 'cm'], ['cf', 'cm'], ['spa', 'range']];
        const ratios = [{ p: 4, s: 3 }, { p: 3, s: 4 }, { p: 5, s: 2 }, { p: 2, s: 5 }];

        pairs.forEach(pair => {
            const [c1, c2] = pair;
            if (!candidates.includes(c1) || !candidates.includes(c2)) return;
            ratios.forEach(r => strategies.push({ p: c1, s: c2, ratio: r }));
        });

        strategies.forEach(strat => {
            let testBuild = { ...build };
            let currentAssignments = {};
            if (actualIncludeHead) {
                const res = applyContextualStats(testBuild, 'head', null, strat.p, strat.s, strat.ratio);
                currentAssignments.head = formatAssignment(res);
            }
            const resBody = applyContextualStats(testBuild, 'body', build.bodyType, strat.p, strat.s, strat.ratio);
            currentAssignments.body = formatAssignment(resBody);
            const resLegs = applyContextualStats(testBuild, 'legs', build.legType, strat.p, strat.s, strat.ratio);
            currentAssignments.legs = formatAssignment(resLegs);

            let res = calculateDPS(stats, testBuild, stats.context);
            res.totalStats = testBuild;

            if (checkIsBetter(res, globalBestRes, optimizeFor)) {
                globalBestRes = res;
                globalBestHead = headType;
                globalBestAssignments = currentAssignments;
                globalBestAssignments.selectedHead = headType;
            }
        });
    });

    globalBestAssignments.selectedHead = globalBestHead;
    return { res: globalBestRes, desc: "", assignments: globalBestAssignments };
};

function _calcSetAndTagBonuses(relicStats, uStats, headPiece) {
    let sBonus = { ...(setBonuses[relicStats.set] || setBonuses.none) };
    let tagBuffs = { dmg: 0, spa: 0, cm: 0, cf: 0, range: 0, dot: 0 };
    
    if (headPiece === 'reaper_necklace') {
        if (relicStats.set !== 'reaper_set') { sBonus.spa = (sBonus.spa || 0) + 7.5; sBonus.range = (sBonus.range || 0) + 15; }
    } else if (headPiece === 'shadow_reaper_necklace') {
        if (relicStats.set !== 'shadow_reaper') { sBonus.dmg = (sBonus.dmg || 0) + 2.5; sBonus.range = (sBonus.range || 0) + 10; sBonus.cf = (sBonus.cf || 0) + 5; sBonus.cm = (sBonus.cm || 0) + 5; }
    }

    const unitElement = uStats.element || "None";
    const tags = uStats.tags || [];

    if (relicStats.set === 'ninja' && ["Dark", "Rose", "Fire"].includes(unitElement)) sBonus.dmg += 10;
    else if (relicStats.set === 'sun_god' && ["Ice", "Light", "Water"].includes(unitElement)) sBonus.dmg += 10;

    // Rebellious Shinobi: +30% Dmg on CC Application (Uptime ~75% for CC units)
    const hasCC = (uStats.role && (uStats.role.includes("Slow") || uStats.role.includes("Debuff"))) || 
                  ['ancient_shinob', 'water_god', 'first_emperor'].includes(uStats.id);
    if (relicStats.set === 'rebellious_set' && hasCC) {
        sBonus.dmg += 22.5; 
    }

    const isMage = ['ancient_mage', 'megumin', 'maid', 'water_god'].includes(uStats.id) || (uStats.name && uStats.name.includes('Mage'));

    // Great Mage: +20% Dmg on Type Advantage Hit (Uptime ~90%)
    if (relicStats.set === 'great_mage' && isMage) {
        sBonus.dmg += 18;
    }

    const applyTagBuff = (bonusName, tagName, stats) => {
         if (relicStats.set === bonusName && tags.includes(tagName)) {
             for(let k in stats) { sBonus[k] = (sBonus[k] || 0) + stats[k]; tagBuffs[k] = (tagBuffs[k] || 0) + stats[k]; }
         }
    };

    applyTagBuff('shadow_reaper', 'Peroxide', { spa: 10 });
    applyTagBuff('shadow_reaper', 'Reaper', { dmg: 25, spa: 12.5 });
    applyTagBuff('shadow_reaper', 'Rage', { dmg: 15, spa: 8.5, dot: 10 });
    applyTagBuff('shadow_reaper', 'Hollow', { cf: 20, cm: 12.5 });
    applyTagBuff('reaper_set', 'Peroxide', { dmg: 10, dot: 5, cm: 8.5 });
    applyTagBuff('reaper_set', 'Reaper', { range: 15 });
    applyTagBuff('reaper_set', 'Rage', { cm: 25, cf: 10, range: 10 });
    applyTagBuff('reaper_set', 'Hollow', { dmg: 12.5, spa: 7.5, range: 15 });

    // NEW SET TAG PERKS
    applyTagBuff('rebellious_set', 'Ninjaverse', { cf: 15, cm: 20 });
applyTagBuff('rebellious_set', 'Bloodline', { dmg: 15, range: 20 });
    return { sBonus, tagBuffs };
}

function _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats) {
    let headDmgBuff = 0, headDotBuff = 0;
    let headCalc = { type: headPiece, uptime: 1, trigger: 0, duration: 0, attacks: 0 };
    const isMage = ['ancient_mage', 'megumin', 'maid', 'water_god'].includes(uStats.id) || (uStats.name && uStats.name.includes('Mage'));

    if (headPiece === 'sun_god') {
        headCalc.attacks = 6; headCalc.duration = 7;
        const buffedAttacks = Math.floor(headCalc.duration / finalSpa);
        const totalCycleAttacks = headCalc.attacks + buffedAttacks;
        headCalc.uptime = totalCycleAttacks > 0 ? buffedAttacks / totalCycleAttacks : 0;
        headCalc.trigger = headCalc.attacks * finalSpa;
        headDmgBuff += finalRange * headCalc.uptime;
    } else if (headPiece === 'ninja') {
        headCalc.attacks = 5; headCalc.duration = 10;
        const timeToTrigger = headCalc.attacks * finalSpa;
        headCalc.trigger = timeToTrigger;
        headCalc.uptime = headCalc.duration / (headCalc.duration + timeToTrigger);
        headDotBuff += 20 * headCalc.uptime;
    } else if (headPiece === 'reaper_necklace') {
        headDmgBuff = 20; headCalc.type = 'reaper';
    } else if (headPiece === 'shadow_reaper_necklace') {
        headDmgBuff = 25; headCalc.type = 'shadow_reaper';
    } else if (headPiece === 'junior') {
        headDmgBuff = 0; headCalc.type = 'junior'; headCalc.multiplier = 1.1;
    } else if (headPiece === 'biju_head') {
        // Sasuke Units: +70% Dmg (Trigger: 3 attacks, Duration: 10s, non-stacking)
        if (uStats.id && uStats.id.includes('sasuke')) {
            headCalc.attacks = 3; 
            headCalc.duration = 10;
            const timeToTrigger = headCalc.attacks * finalSpa;
            headCalc.uptime = Math.min(1, headCalc.duration / timeToTrigger);
            headCalc.trigger = timeToTrigger;
            headDmgBuff = 70 * headCalc.uptime;
            headCalc.type = 'biju';
        } else {
            headDmgBuff = 0;
        }
    } else if (headPiece === 'rebellious_head') {
        headDmgBuff = 30; headCalc.type = 'rebellious';
    } else if (headPiece === 'reanimated_head') {
        headCalc.attacks = 5; headCalc.duration = 10;
        const buffedAttacks = Math.floor(headCalc.duration / finalSpa);
        const totalCycleAttacks = headCalc.attacks + buffedAttacks;
        headCalc.uptime = totalCycleAttacks > 0 ? buffedAttacks / totalCycleAttacks : 0;
        headCalc.trigger = headCalc.attacks * finalSpa;
        headDotBuff += finalRange * headCalc.uptime;
        headCalc.type = 'reanimated';
    } else if (headPiece === 'mage_head') {
        if (isMage) {
            headDmgBuff = 24; headCalc.type = 'great_mage';
        }
    }
    return { headDmgBuff, headDotBuff, headCalc };
}

function _calcSummonDPS(uStats, finalDmg, finalSpa, placement) {
    if (!uStats.summonStats) return { summonDpsTotal: 0, summonData: null };
    const s = uStats.summonStats;
    const planeBaseDmg = finalDmg * (s.dmgPct / 100);
    const calcPlaneTypeDPS = (typeStats) => {
        if (!typeStats) return 0;
        const attacksPerLife = Math.floor(typeStats.duration / typeStats.spa) + 1;
        let totalDamageOverLife = 0;
        for (let i = 0; i < attacksPerLife; i++) {
            const time = i * typeStats.spa;
            let isBuffed = time < s.buffWindow;
            let pMult = (1 + ((isBuffed ? s.buffCdmg : 150)/100) * ((isBuffed ? s.buffCrit : 0)/100));
            totalDamageOverLife += planeBaseDmg * pMult;
        }
        return totalDamageOverLife / typeStats.duration; 
    };
    const dpsA = calcPlaneTypeDPS(s.planeA);
    const dpsB = calcPlaneTypeDPS(s.planeB);
    const avgOnePlaneDps = (dpsA + dpsB) / 2;
    const avgDuration = ((s.planeA?.duration || 0) + (s.planeB?.duration || 0)) / 2;
    const attacksToSpawn = s.attacksToSpawn || 1;
    const actualCount = Math.min(avgDuration / (finalSpa * attacksToSpawn), s.maxCount);
    return { summonDpsTotal: (avgOnePlaneDps * actualCount) * placement, summonData: { count: actualCount, max: s.maxCount, avgPlaneDps: avgOnePlaneDps, hostSpa: finalSpa, avgDuration: avgDuration, dpsA: dpsA, dpsB: dpsB } };
}

function _calcDoTDPS(uStats, traitObj, traitDotBonus, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult) {
    let dotDpsTotal = 0;
    const dotCritMult = isVirtualRealm ? avgCritMult : 1;
    
    // REFINED LOGIC: Base % * (1 + Trait/100) * (1 + Gear/100)
    const traitMultiplier = 1 + (traitDotBonus / 100);
    const gearMultiplier = 1 + (gearDotBonus / 100);
    
    let dotBreakdown = { 
        nativeDps: 0, 
        radDps: 0, 
        base: uStats.dot, 
        traitBonus: traitDotBonus,
        gearBonus: gearDotBonus,
        traitMult: traitMultiplier,
        gearMult: gearMultiplier,
        critMult: dotCritMult, 
        nativeInterval: 0, 
        nativeTotalDmg: 0, 
        radInterval: 0, 
        radTotalDmg: 0, 
        isMultiHit: false 
    };

    const canStack = (traitObj.allowDotStack || traitObj.allowPlacementStack);
    if (uStats.dot > 0) {
        const nativeTickPct = uStats.dot * traitMultiplier * gearMultiplier;
        const totalNativeDmg = finalDmg * (nativeTickPct / 100) * dotCritMult;
        const duration = uStats.dotDuration || 0;
        const interval = canStack ? finalSpa : (duration > 0 ? Math.ceil(duration / finalSpa) * finalSpa : finalSpa);
        dotBreakdown.nativeTotalDmg = totalNativeDmg; dotBreakdown.nativeInterval = interval; dotBreakdown.nativeDps = totalNativeDmg / interval;
    }
    
    dotDpsTotal = (dotBreakdown.nativeDps + dotBreakdown.radDps) * (canStack ? placement : 1);
    return { dotDpsTotal, dotBreakdown };
}

function calculateDPS(uStats, relicStats, context) {
    const { dmgPoints, spaPoints, rangePoints, wave, isBoss, traitObj, placement, isSSS, headPiece, isVirtualRealm, starMult, isAbility } = context;

    let lvStats = getLevelStats(uStats.dmg, uStats.spa, uStats.range || 0, dmgPoints, spaPoints, rangePoints);
    let rDmg = 0, rSpa = 0, rRange = 0;
    if (context.rankData) { rDmg = context.rankData.dmg || 0; rSpa = context.rankData.spa || 0; rRange = context.rankData.range || 0; } 
    else if (isSSS) { rDmg = 20; rSpa = 8; rRange = 20; }
    if (rDmg !== 0) lvStats.dmg *= (1 + rDmg/100);
    if (rSpa !== 0) lvStats.spa *= (1 - rSpa/100);
    if (rRange !== 0) lvStats.range *= (1 + rRange/100);

    let passivePcent = (uStats.passiveDmg || 0) + (uStats.buffDmg || 0), passiveSpaPcent = uStats.passiveSpa || 0;
    
    if (uStats.id === 'water_god') {
        passivePcent += (75 * placement);
    }

    const totalBossDmg = (uStats.bossDmg || 0) + (traitObj.bossDmg || 0);
    let traitDmgPct = traitObj.dmg + (totalBossDmg && isBoss ? totalBossDmg : 0), traitSpaPct = traitObj.spa; 
    let traitCritRate = traitObj.critRate || 0, traitRangePct = traitObj.range || 0, traitDotBuff = traitObj.dotBuff || 0;

    let eternalDmgBuff = 0, eternalRangeBuff = 0;
    if (traitObj.isEternal) { const waveCap = Math.min(wave, 12); eternalDmgBuff = waveCap * 5; passivePcent += eternalDmgBuff; eternalRangeBuff = waveCap * 2.5; }

    let { sBonus, tagBuffs } = _calcSetAndTagBonuses(relicStats, uStats, headPiece);
    if (starMult && starMult !== 1) { for (let key in sBonus) { if (typeof sBonus[key] === 'number') sBonus[key] *= starMult; } }

    const getRelicStat = (stat, apply) => apply ? relicStats[stat] : 0;
    let baseR_Dmg = getRelicStat('dmg', statConfig.applyRelicDmg), baseR_Spa = getRelicStat('spa', statConfig.applyRelicSpa);
    let baseR_Cm  = getRelicStat('cm', statConfig.applyRelicCrit), baseR_Cf  = relicStats.cf; 
    let baseR_Dot = getRelicStat('dot', statConfig.applyRelicDot), baseR_Range = relicStats.range || 0;

    if (traitObj.relicBuff) { 
        const mult = traitObj.relicBuff; 
        baseR_Dmg = ((1 + baseR_Dmg / 100) * mult - 1) * 100;
        baseR_Range = ((1 + baseR_Range / 100) * mult - 1) * 100;
        baseR_Spa *= mult; 
        baseR_Cm *= mult; 
        baseR_Dot *= mult; 
        baseR_Cf *= mult; 
    }

    // Assuming context.wave is available if traitObj.isEternal is true, or needs to be passed.
    // For now, let's assume it's handled upstream or passed in uStats if needed.
    // if (traitObj.isEternal) { const waveCap = Math.min(wave, 12); eternalDmgBuff = waveCap * 5; passivePcent += eternalDmgBuff; eternalRangeBuff = waveCap * 2.5; }

    const enlightBuff = (typeof window !== 'undefined' && window.enlightenedGodBuffActive) ? 20 : 0;
    const enlightSpa = (typeof window !== 'undefined' && window.enlightenedGodBuffActive) ? 20 : 0;
    const bijuuBuff = (typeof window !== 'undefined' && window.bijuuLinkActive) ? 25 : 0;
    const bijuuSpa = (typeof window !== 'undefined' && window.bijuuLinkActive) ? 15 : 0;

    // King Sailor Global Buffs
    const tags = uStats.tags || [];
    const kingMark = (typeof window !== 'undefined' && window.kingSailorMarkActive);
    let kmDmg = 0, kmSpa = 0;
    if (kingMark) {
        if (tags.includes('Magi')) { kmDmg += 50; kmSpa += 15; }
        else if (tags.includes('Uncontrollable Power')) { kmDmg += 30; kmSpa += 10; }
        else if (uStats.element === 'Water') { kmDmg += 20; kmSpa += 10; }
    }

    const isKsBuffActive = (typeof window !== 'undefined' && window.kingSailorBuffActive);
    let ksCrit = 0, ksCdmg = 0;
    if (isKsBuffActive && uStats.id !== 'king_sailor') { ksCrit = 10; ksCdmg = 20; }

    const amSupportActive = (typeof window !== 'undefined' && window.ancientMageSupportActive);
    const amCritRate = amSupportActive ? 20 : 0;
    const amCritDmg = amSupportActive ? 20 : 0;

    const mageHillBuffActive = (typeof window !== 'undefined' && window.mageHillBuffActive);
    const uType = (uStats.placementType || 'Ground').toLowerCase();
    const mageHillSpa = (mageHillBuffActive && (uType === 'hill' || uType === 'hybrid')) ? 30 : 0;

    const mageGroundBuffActive = (typeof window !== 'undefined' && window.mageGroundBuffActive);
    const mageGroundCrit = (mageGroundBuffActive && (uType === 'ground' || uType === 'hybrid')) ? 45 : 0;

    const totalAdditiveRange = (sBonus.range || 0) + (uStats.passiveRange || 0) + eternalRangeBuff + enlightBuff + (bijuuBuff > 0 ? 25 : 0) + (uStats.id === 'king_sailor' ? 10 : 0);
    const finalRange = lvStats.range * (1 + traitRangePct / 100) * (1 + baseR_Range / 100) * (1 + totalAdditiveRange / 100);
    
    const setAndPassiveSpa = (sBonus.spa || 0) + passiveSpaPcent + enlightSpa + bijuuSpa + kmSpa + mageHillSpa;
    
    // Great Mage Accessory: -20% SPA (Uptime ~60% from kill trigger)
    const mageSpaMult = (headPiece === 'mage_head') ? 0.88 : 1; // -20% * 0.6 uptime
    
    // Nutaru (Beast) dynamic SPA Cap override
    const effectiveSpaCap = (isAbility && uStats.id === 'nutaru_beast') ? 3.0 : (uStats.spaCap || 0.1);

    const spaAfterRelic = lvStats.spa * (1 - traitSpaPct / 100) * (1 - baseR_Spa / 100) * mageSpaMult;
    const rawFinalSpa = spaAfterRelic * (1 - setAndPassiveSpa / 100);
    const finalSpa = Math.max(rawFinalSpa, effectiveSpaCap);

    const { headDmgBuff, headDotBuff, headCalc } = _calcHeadDynamicBuffs(headPiece, finalSpa, finalRange, uStats);
    const mikuBuff = (typeof window !== 'undefined' && window.mikuBuffActive) ? 100 : 0;

    let additiveTotal = (sBonus.dmg || 0) + passivePcent + headDmgBuff + mikuBuff + enlightBuff + bijuuBuff + kmDmg;

    // Junior Ninja: 1.1x Multiplier to Miku Buff and Passives (WATER GOD ONLY)
    if (headPiece === 'junior' && uStats.id === 'water_god') {
        additiveTotal = ((sBonus.dmg || 0) + passivePcent + headDmgBuff + mikuBuff + enlightBuff + bijuuBuff + kmDmg) * 1.1;
    }
    
    const finalDmg = lvStats.dmg * (1 + traitDmgPct / 100) * (1 + baseR_Dmg / 100) * (1 + additiveTotal / 100) * (uStats.burnMultiplier ? (1 + uStats.burnMultiplier / 100) : 1);

    const finalCdmgStat = uStats.cdmg + (sBonus.cm || 0) + baseR_Cm + amCritDmg + ksCdmg; 
    const finalCritRate = Math.min(uStats.crit + traitCritRate + amCritRate + ksCrit + mageGroundCrit + ((uStats.id === 'kirito') ? 0 : (baseR_Cf + (sBonus.cf || 0))), 100);
    const avgCritMult = (1 + ((finalCdmgStat / 100) * (finalCritRate / 100)));
    const avgHit = finalDmg * avgCritMult;
    
    // --- SPECIAL ATTACK RATE LOGIC ---
    let attackMultiplier = 1;
    let extraAttacksData = null;
    let usedSpa = finalSpa;

    if (uStats.id === 'rohan') {
        const probs = [0.40, 0.35, 0.30, 0.25, 0.20];
        let cumulativeProbs = [];
        let currentProb = 1.0;

        for (let i = 0; i < probs.length; i++) {
            currentProb *= probs[i];
            cumulativeProbs.push(currentProb);
        }

        const sumP = cumulativeProbs.reduce((a, b) => a + b, 0);
        const expectedAttacks = 1 + sumP;
        
        // Time sequence: Initial hit (finalSpa) + Chained hits (spaCap)
        const expectedTime = finalSpa + (sumP * (uStats.spaCap || 3.0));
        
        // Effective SPA for the sequence
        usedSpa = expectedTime / expectedAttacks;

        // Damage weights: Robot (1.04x base only) + 5th Chain (+50% dmg)
        const robotMult = (!isAbility) ? 1.04 : 1.0;
        const fifthChainProb = cumulativeProbs[4];
        const dmgSumFactor = (1 + sumP + (fifthChainProb * 0.5));
        const avgDmgMult = dmgSumFactor / expectedAttacks;

        attackMultiplier = avgDmgMult * robotMult;

        extraAttacksData = { 
            req: (!isAbility) ? "Robot (5th Atk) + Chain" : "Chain Condition", 
            hits: `Avg ${expectedAttacks.toFixed(2)} Hits/Seq`, 
            extra: expectedAttacks - 1, 
            attacksNeeded: 1, 
            mult: attackMultiplier, 
            label: "Rohan Mechanics" 
        };
    } else if (uStats.id === 'super_roku' && isAbility) {
        // "Every other attack does only 30% of his damage"
        // Avg = (1.0 + 0.3) / 2 = 0.65
        attackMultiplier = 0.65;
        extraAttacksData = { 
            req: "Same Target", 
            hits: "Avg 65% Dmg", 
            extra: 0, 
            attacksNeeded: 1, 
            mult: 0.65, 
            label: "Combo Decay" 
        };
    } else if (uStats.id === 'cell' && !isAbility) {
        // Every attack has a follow-up for 50% damage.
        usedSpa = finalSpa + 1.5;
        attackMultiplier = 1.5;
        extraAttacksData = {
            req: "Follow-up hit",
            hits: "1.5x Dmg / Cycle",
            extra: 0,
            attacksNeeded: 1,
            mult: 1.5,
        };
    } else if (uStats.id === 'water_god' && uStats.followUp) {
        // Every attack fires a follow-up after one spaCap window (3.5s).
        // The full cycle = max(finalSpa, spaCap*2).
        // At cap (3.5s SPA): each hit takes 3.5s → 2 hits per 7s, always.
        // Above cap (e.g. 7.2s SPA): cycle = 7.2s with 2 hits (the 3.5s follow-up fits within the SPA gap).
        usedSpa = Math.max(finalSpa, effectiveSpaCap * 2);
        attackMultiplier = 2;
        extraAttacksData = {
            req: "Per-attack Follow-up",
            hits: `2 hits / cycle (cap: ${effectiveSpaCap}s × 2 = ${effectiveSpaCap * 2}s min)`,
            extra: 1,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: `Water God Follow-up (${effectiveSpaCap}s window)`
        };
    } else if (uStats.followUp) {
        attackMultiplier = 1 + (uStats.followUp / 100);
        extraAttacksData = {
            req: "N/A",
            hits: attackMultiplier,
            extra: uStats.followUp / 100,
            attacksNeeded: 1,
            mult: attackMultiplier,
            label: "Follow-up Attack"
        };
    } else if (uStats.reqCrits && uStats.hitCount) {
        const critsPerAttack = uStats.hitCount * (finalCritRate / 100);
        if (critsPerAttack > 0) {
            const attacksToTrigger = uStats.reqCrits / critsPerAttack;
            attackMultiplier = 1 + (uStats.extraAttacks / attacksToTrigger);
            extraAttacksData = { req: uStats.reqCrits, hits: uStats.hitCount, extra: uStats.extraAttacks, attacksNeeded: attacksToTrigger, mult: attackMultiplier };
        }
    }


    const hitDpsTotal = ((avgHit / usedSpa) * placement * attackMultiplier);

    // Nutaru E4: Clones gain +25% Damage in Beast Mode
    const summonDmgBase = (uStats.id === 'nutaru_beast' && isAbility) ? finalDmg * 1.25 : finalDmg;
    
    const { summonDpsTotal, summonData } = _calcSummonDPS(uStats, summonDmgBase, finalSpa, placement);
    const gearDotBonus = baseR_Dot + headDotBuff + (sBonus.dot || 0);
    const { dotDpsTotal, dotBreakdown } = _calcDoTDPS(uStats, traitObj, traitDotBuff, gearDotBonus, finalDmg, finalSpa, placement, isVirtualRealm, avgCritMult);
    
    const finalDotDps = dotDpsTotal;
    const finalSummonDps = summonDpsTotal;

   return {
        total: (hitDpsTotal + finalDotDps + finalSummonDps),
        hit: hitDpsTotal,
        dot: finalDotDps,
        summon: finalSummonDps,
        summonData,
        spa: usedSpa,
        spaCap: effectiveSpaCap,
        range: finalRange,
        passiveRange: (uStats.passiveRange || 0) + eternalRangeBuff,
        dmgVal: finalDmg,
        lvStats,
        traitBuffs: { dmg: traitDmgPct, spa: traitSpaPct, range: traitRangePct },
        traitObj,
        relicBuffs: { dmg: baseR_Dmg, spa: baseR_Spa, dot: baseR_Dot, range: baseR_Range, cf: baseR_Cf, cm: baseR_Cm }, 
        totalSetStats: sBonus,
        tagBuffs,
        mikuBuff: mikuBuff,
        enlightBuff: enlightBuff,
        enlightSpa: enlightSpa,
        bijuuBuff: bijuuBuff,
        bijuuSpa: bijuuSpa,
        kingMarkDmg: kmDmg,
        kingMarkSpa: kmSpa,
        ksCrit: ksCrit,
        ksCdmg: ksCdmg,
        passiveBuff: passivePcent + headDmgBuff, 
        passiveSpaBuff: passiveSpaPcent,
        eternalBuff: eternalDmgBuff,
        eternalRangeBuff: eternalRangeBuff,
        totalAdditivePct: additiveTotal,
        conditionalData: uStats.burnMultiplier ? { name: "Target: Burn", val: uStats.burnMultiplier, mult: (1 + uStats.burnMultiplier / 100) } : null,
        headBuffs: { dmg: headDmgBuff, dot: headDotBuff, type: headPiece, ...headCalc },
        dotData: dotBreakdown,
        critData: { rate: finalCritRate, cdmg: finalCdmgStat, baseCdmg: uStats.cdmg, relicCmPct: baseR_Cm, setCm: sBonus.cm, totalCmBuff: (sBonus.cm || 0) + baseR_Cm, preRelicCdmg: uStats.cdmg, avgMult: avgCritMult },
        placement,
        isSSS,
        rawFinalSpa,
        spaAfterRelic, 
        setAndPassiveSpa, 
        baseStats: uStats,
        dmgPoints: context.dmgPoints,
        spaPoints: context.spaPoints,
        rangePoints: context.rangePoints,
        singleUnitDoT: dotDpsTotal / (traitObj.allowDotStack || traitObj.allowPlacementStack ? placement : 1), 
        hasStackingDoT: traitObj.allowDotStack || traitObj.allowPlacementStack,
        extraAttacks: extraAttacksData,
        abilityBuff: uStats.buffDmg || 0,
        amSupportActive,
        amCritRate,
        amCritDmg,
        mageHillSpa,
        mageGroundCrit
    };
}
// ============================================================================
// CALCULATIONS.JS - Build Calculation Logic
// ============================================================================

// --- HELPERS ---

// Speed optimization: Fast lookup maps for static data
const _traitCacheMap = new Map();
const _setCacheMap = new Map();

const getTraitFast = (idOrName) => {
    if (_traitCacheMap.size === 0) {
        traitsList.forEach(t => { _traitCacheMap.set(t.id, t); _traitCacheMap.set(t.name, t); });
    }
    return _traitCacheMap.get(idOrName);
};
const getSetFast = (name) => {
    if (_setCacheMap.size === 0) {
        SETS.forEach(s => _setCacheMap.set(s.name, s));
    }
    return _setCacheMap.get(name);
};

/**
 * UNIFIED Context Builder
 * Prepares unit stats, applies overrides (Ability, Kirito, Bambietta), resolves Traits,
 * and sets up the math context (placement, wave, points).
 * 
 * @param {Object} unit - The unit object from database
 * @param {string|Object} traitIdent - Trait ID (string) or Trait Object
 * @param {Object} options - Config options { isAbility, mode, points... }
 */
function buildCalculationContext(unit, traitIdent, options = {}) {
    const { isAbility = false, mode = 'fixed', dmgPoints = 99, spaPoints = 0, rangePoints = 0, wave = 25, isBoss = false, headPiece = 'none', starMult = 1, rankData = null } = options;
    let traitObj = null;
    if (typeof traitIdent === 'object') traitObj = traitIdent;
    else traitObj = getTraitFast(traitIdent) || getTraitFast('ruler');

    let effectiveStats = { ...unit.stats };
    effectiveStats.id = unit.id;
    effectiveStats.placementType = unit.placementType;
    if (unit.tags) effectiveStats.tags = unit.tags;
    if (isAbility && unit.ability) Object.assign(effectiveStats, unit.ability);
    

    const isKiritoVR = (unit.id === 'kirito' && kiritoState.realm);
    if (unit.id === 'kirito' && isKiritoVR && kiritoState.card) { effectiveStats.dot = 200; effectiveStats.dotDuration = 4; effectiveStats.dotStacks = 1; }
    if (unit.id === 'bambietta' && typeof BAMBIETTA_MODES !== 'undefined') {
        const currentEl = bambiettaState.element || "Dark";
        const modeStats = BAMBIETTA_MODES[currentEl];
        if (modeStats) Object.assign(effectiveStats, modeStats);
    }
    if (unit.id === 'robot1718' && unit.modes) {
        const currentMode = robot1718State.mode || "Robot 17";
        const modeStats = unit.modes[currentMode];
        if (modeStats) Object.assign(effectiveStats, modeStats);
    }

    let actualPlacement = unit.placement;
    if (traitObj.limitPlace) actualPlacement = Math.min(unit.placement, traitObj.limitPlace);
    if (isAbility && unit.ability && unit.ability.limitPlace) actualPlacement = Math.min(actualPlacement, unit.ability.limitPlace);

    let suffix = isAbility ? '-ABILITY' : '-BASE';
    if (unit.id === 'kirito') { if (kiritoState.realm) suffix += '-VR'; if (kiritoState.card) suffix += '-CARD'; }
    const modeTag = (mode === 'bugged') ? '-b-' : '-f-';

    const context = { dmgPoints, spaPoints, rangePoints, wave, isBoss, traitObj, placement: actualPlacement, isSSS: true, isVirtualRealm: isKiritoVR, headPiece, starMult, rankData, isAbility };
    return { effectiveStats, traitObj, context, isKiritoVR, suffix, modeTag };
}

function createResultEntry({ id, buildName, traitName, res, prio, mainStats, subStats, headUsed, isCustom, relicIds = null }) {
    const entry = { id: id, setName: buildName.split('(')[0].trim(), traitName: traitName, dps: res.total, dmgVal: res.dmgVal, spa: res.spa, range: res.range, prio: prio, mainStats: mainStats, subStats: subStats, headUsed: headUsed, isCustom: isCustom };
    if (relicIds) entry.relicIds = relicIds;
    return entry;
}

function calculateUnitBuilds(unit, _stats, filteredBuilds, subCandidates, headsToProcess, includeSubs, specificTraitsOnly = null, isAbilityContext = false, mode = 'fixed') {
    if (inventoryMode && relicInventory && relicInventory.length > 0) return calculateInventoryBuilds(unit, null, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs);
    window.cachedResults = window.cachedResults || {};
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) activeTraits = specificTraitsOnly;
    else { const specificTraits = unitSpecificTraits[unit.id] || []; activeTraits = [...traitsList, ...customTraits, ...specificTraits]; }

    let unitResults = [];
    const { effectiveStats: baseEffective, isKiritoVR: baseVR } = buildCalculationContext(unit, 'ruler', { isAbility: isAbilityContext });
    const hasNativeDoT = (baseEffective.dot > 0) || (baseEffective.burnMultiplier > 0) || baseVR;
    let unitSubCandidates = [...subCandidates];
    if (!hasNativeDoT) unitSubCandidates = unitSubCandidates.filter(c => c !== 'dot');
    const subsSuffix = includeSubs ? '-SUBS' : '-NOSUBS';

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return; 
        const { effectiveStats, context, isKiritoVR, suffix, modeTag } = buildCalculationContext(unit, trait, { isAbility: isAbilityContext, mode: mode });
        const traitAddsDot = trait.dotBuff > 0 || trait.hasRadiation || trait.allowDotStack;
        const isDotPossible = hasNativeDoT || traitAddsDot;
        const currentCandidates = (traitAddsDot) ? subCandidates : unitSubCandidates;
        const relevantBuilds = (!isDotPossible) ? filteredBuilds.filter(b => b.bodyType !== 'dot') : filteredBuilds;

        relevantBuilds.forEach(build => {
            let relevantHeads = headsToProcess;
            if (!isDotPossible) relevantHeads = headsToProcess.filter(h => h !== 'ninja');

            relevantHeads.forEach(headMode => {
                const runOpt = (dmgP, spaP, rangeP, optType) => {
                    context.dmgPoints = dmgP; context.spaPoints = spaP; context.rangePoints = rangeP;
                    effectiveStats.context = context;
                    return getBestSubConfig(build, effectiveStats, includeSubs, headMode, currentCandidates, optType);
                };

                const maxPts = (unit.id === 'king_sailor') ? 129 : 99;
                const cfgDmg = runOpt(maxPts, 0, 0, 'dps');
                const cfgSpa = runOpt(0, maxPts, 0, 'dps');
                const cfgRaw = runOpt(maxPts, 0, 0, 'raw_dmg');
                const cfgRange = runOpt(0, 0, 99, 'range');

                const baseId = `${unit.id}${suffix}-${trait.id}-${build.name.replace(/[^a-zA-Z0-9]/g, '')}`;
                const processResult = (config, prioStr) => {
                    const res = config.res;
                    if (isNaN(res.total)) return;
                    const fullId = `${baseId}-${prioStr}${subsSuffix}-${headMode}${modeTag}`;
                    const entry = createResultEntry({ id: fullId, buildName: build.name, traitName: trait.name, res: res, prio: prioStr, mainStats: { body: build.bodyType, legs: build.legType }, subStats: config.assignments, headUsed: config.assignments.selectedHead, isCustom: trait.isCustom });
                    window.cachedResults[fullId] = entry;
                    unitResults.push(entry);
                    return entry;
                };

                const dmgEntry = processResult(cfgDmg, "dmg");
                processResult(cfgSpa, "spa");
                processResult(cfgRaw, "raw_dmg");
                processResult(cfgRange, "range");
            });
        });
    });
    unitResults.sort((a, b) => b.dps - a.dps);
    return unitResults;
}
// Inventory Mode Calculation
function calculateInventoryBuilds(unit, _stats, specificTraitsOnly, isAbilityContext, mode, headsToProcess, includeSubs, forcedRelic = null) {
    window.cachedResults = window.cachedResults || {};
    
    // 1. Determine Traits List
    let activeTraits = [];
    if (specificTraitsOnly && Array.isArray(specificTraitsOnly)) {
        activeTraits = specificTraitsOnly;
    } else {
        const specificTraits = unitSpecificTraits[unit.id] || [];
        activeTraits = [...traitsList, ...customTraits, ...specificTraits];
    }
    
    let unitResults = [];

    // 1. Separate Inventory by Slot
    const allowHeads = headsToProcess.some(h => h !== 'none');
    
    let heads = allowHeads ? relicInventory.filter(r => r.slot === 'Head') : [];
    const bodies = relicInventory.filter(r => r.slot === 'Body');
    const legs = relicInventory.filter(r => r.slot === 'Legs');

    // Apply Force Logic (Relic Optimality)
    if (forcedRelic) {
        if (forcedRelic.slot === 'Head') heads = [forcedRelic];
        if (forcedRelic.slot === 'Body') bodies = [forcedRelic];
        if (forcedRelic.slot === 'Legs') legs = [forcedRelic];
    }

    // Add 'None' options
    // Only add 'None' if we aren't forcing a specific relic in that slot
    if (!forcedRelic || forcedRelic.slot !== 'Head') heads.push({ id: 'none', slot: 'Head', setKey: 'none', stars: 1, mainStat: 'none', subs: {} });
    if ((!forcedRelic || forcedRelic.slot !== 'Body') && (bodies.length === 0 || !forcedRelic)) bodies.push({ id: 'none-b', slot: 'Body', setKey: 'none', stars: 1, mainStat: null, subs: {} }); 
    if ((!forcedRelic || forcedRelic.slot !== 'Legs') && (legs.length === 0 || !forcedRelic)) legs.push({ id: 'none-l', slot: 'Legs', setKey: 'none', stars: 1, mainStat: null, subs: {} }); 

    const cfgTag = `-${allowHeads ? 'H' : 'nH'}-${includeSubs ? 'S' : 'nS'}`;

    activeTraits.forEach(trait => {
        if (trait.id === 'none') return;
        
        // Use Unified Context Builder
        const { effectiveStats, context, suffix, modeTag } = buildCalculationContext(unit, trait, { 
            isAbility: isAbilityContext, 
            mode: mode 
        });

        heads.forEach(head => {
            bodies.forEach(body => {
                legs.forEach(leg => {
                    
                    // A. Determine Set Bonus & Star Multiplier
                    let activeSetKey = 'none';
                    let starMult = 1;
                    
                    if (body.setKey !== 'none' && body.setKey === leg.setKey) {
                        activeSetKey = body.setKey;
                        starMult = Math.min(body.stars || 1, leg.stars || 1);
                    }

                    // B. Construct Total Stats Object (Main + Subs)
                    let totalStats = { set: activeSetKey, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
                    const addStat = (type, val) => { if (totalStats[type] !== undefined) totalStats[type] += val; };
                    
                    const getMainVal = (relic) => {
                        let base = 0;
                        if(!relic.mainStat || relic.mainStat === 'none') return 0;
                        if(relic.slot === 'Body') base = MAIN_STAT_VALS.body[relic.mainStat] || 0;
                        if(relic.slot === 'Legs') base = MAIN_STAT_VALS.legs[relic.mainStat] || 0;
                        return base * (relic.stars || 1);
                    };

                    [body, leg].forEach(r => {
                        if (r.id.startsWith('none')) return;
                        addStat(r.mainStat, getMainVal(r));
                        if (includeSubs) Object.entries(r.subs).forEach(([k, v]) => addStat(k, v));
                    });

                    if (head.id !== 'none' && includeSubs) {
                        Object.entries(head.subs).forEach(([k, v]) => addStat(k, v));
                    }

                    // C. Run Calculation Loops (DMG, SPA, RANGE)
                    const maxPts = (unit.id === 'king_sailor') ? 129 : 99;
                    const calcVariations = [
                        { id: 'dmg',   dmgPts: maxPts, spaPts: 0,  rangePts: 0 },
                        { id: 'spa',   dmgPts: 0,  spaPts: maxPts, rangePts: 0 },
                        { id: 'range', dmgPts: 0,  spaPts: 0,  rangePts: 99 } 
                    ];

                    calcVariations.forEach(prio => {
                        // Update context for this variation
                        context.dmgPoints = prio.dmgPts;
                        context.spaPoints = prio.spaPts;
                        context.rangePoints = prio.rangePts;
                        context.headPiece = head.setKey === 'none' ? 'none' : head.setKey;
                        context.starMult = starMult;

                        effectiveStats.context = context;
                        
                        let res = calculateDPS(effectiveStats, totalStats, context);

                        const uniqueCombId = `${head.id}_${body.id}_${leg.id}`; 
                        const id = `${unit.id}${suffix}-${trait.id}-INV-${uniqueCombId}${modeTag}${cfgTag}-${prio.id}`;

                        // UI Formatting
                        const formatSubs = (relic) => Object.entries(relic.subs).map(([k,v]) => ({ type: k, val: v }));
                        let subStatsUI = {
                            head: (includeSubs && head.id !== 'none') ? formatSubs(head) : null,
                            body: (includeSubs && body.id !== 'none-b') ? formatSubs(body) : null,
                            legs: (includeSubs && leg.id !== 'none-l') ? formatSubs(leg) : null,
                            selectedHead: head.setKey
                        };

                        const setName = activeSetKey !== 'none' ? SETS.find(s=>s.id===activeSetKey)?.name : "Mixed Set";

                        const entry = createResultEntry({
                            id: id,
                            buildName: setName,
                            traitName: trait.name,
                            res: res,
                            prio: prio.id,
                            mainStats: { body: body.mainStat, legs: leg.mainStat },
                            subStats: subStatsUI,
                            headUsed: head.setKey,
                            isCustom: trait.isCustom,
                            relicIds: { head: head.id, body: body.id, legs: leg.id }
                        });

                        window.cachedResults[id] = entry;
                        unitResults.push(entry);
                    }); // end variation loop

                }); // end leg
            }); // end body
        }); // end head
    }); // end trait

    unitResults.sort((a, b) => b.dps - a.dps);
    return unitResults;
}

function reconstructMathData(liteData) {
    if (!liteData || !liteData.id) throw new Error("Invalid data for reconstruction");

    const unitId = liteData.id.split('-')[0];
    const unit = unitDatabase.find(u => u.id === unitId);
    if (!unit) return null;

    // 1. Identify Context from ID Tags
    const isAbility = liteData.id.includes('ABILITY');
    const isBuggedMode = liteData.id.includes('-b-');
    const isFixedMode = liteData.id.includes('-f-');
    const isNoSubsMode = liteData.id.includes('-NOSUBS');

    // Determine Logic State based on ID (Override global state for reconstruction)
    const previousDotState = statConfig.applyRelicDot;
    const previousCritState = statConfig.applyRelicCrit;

    if (isBuggedMode) { statConfig.applyRelicDot = false; statConfig.applyRelicCrit = true; } 
    else if (isFixedMode) { statConfig.applyRelicDot = true; statConfig.applyRelicCrit = true; }

    const isSpaPrio = liteData.prio === 'spa';
    const isRangePrio = liteData.prio === 'range';
    const maxPts = (unit.id === 'king_sailor') ? 129 : 99;
    let dmgPts = maxPts, spaPts = 0, rangePts = 0;
    if (isSpaPrio) { dmgPts = 0; spaPts = maxPts; }
    else if (isRangePrio) { dmgPts = 0; spaPts = 0; rangePts = 99; }

    // Use Unified Context Builder
    // NOTE: passing traitName here, helper will resolve it
    const { effectiveStats, context } = buildCalculationContext(unit, liteData.traitName, {
        isAbility,
        dmgPoints: dmgPts,
        spaPoints: spaPts,
        rangePoints: rangePts,
        headPiece: liteData.headUsed || (liteData.subStats && liteData.subStats.selectedHead) || 'none'
    });
    
    // Set Entry
    const setEntry = getSetFast(liteData.setName) || SETS[2]; 
    let totalStats = { set: setEntry.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };

    const mapStatKey = (k) => {
        if (k === 'cdmg' || k === 'crit dmg') return 'cm';
        if (k === 'crit' || k === 'crit rate') return 'cf';
        return k;
    };

    if (liteData.mainStats) {
        if (liteData.mainStats.body) { const k = mapStatKey(liteData.mainStats.body); if (MAIN_STAT_VALS.body[k]) totalStats[k] += MAIN_STAT_VALS.body[k]; }
        if (liteData.mainStats.legs) { const k = mapStatKey(liteData.mainStats.legs); if (MAIN_STAT_VALS.legs[k]) totalStats[k] += MAIN_STAT_VALS.legs[k]; }
    }

    // 1. Add explicitly stored sub-stats
    if (liteData.subStats) {
        ['head', 'body', 'legs'].forEach(slot => {
            if (liteData.subStats[slot] && Array.isArray(liteData.subStats[slot])) {
                liteData.subStats[slot].forEach(sub => {
                    if (sub.type && sub.val) {
                        const k = mapStatKey(sub.type);
                        totalStats[k] = (totalStats[k] || 0) + sub.val;
                    }
                });
            }
        });
    }

    // 2. FILL MISSING BASE STATS (Auto-fill for Static DB)
    // Only needed if we didn't have explicit substats in the liteData (older db format or static fallback)
    const addBaseFills = (slot, mainStatType) => {
        const existingTypes = new Set();
        if (liteData.subStats && liteData.subStats[slot] && Array.isArray(liteData.subStats[slot])) {
             liteData.subStats[slot].forEach(s => existingTypes.add(mapStatKey(s.type)));
        }
        const mappedMain = mapStatKey(mainStatType);

        const validCandidates = SUB_CANDIDATES.filter(c => {
            if (!statConfig.applyRelicDot && c === 'dot') return false;
            if (!statConfig.applyRelicCrit && (c === 'cm' || c === 'cf')) return false;
            return true;
        });

        validCandidates.forEach(cand => {
             if (cand === mappedMain) return;
             if (existingTypes.has(cand)) return;
             totalStats[cand] = (totalStats[cand] || 0) + PERFECT_SUBS[cand];
        });
    };

    if (!isNoSubsMode && liteData.headUsed && liteData.headUsed !== 'none') {
        addBaseFills('head', null); 
    }
    if (!isNoSubsMode && liteData.mainStats) {
        addBaseFills('body', liteData.mainStats.body);
        addBaseFills('legs', liteData.mainStats.legs);
    }

    // Run Calc
    effectiveStats.context = context;
    const result = calculateDPS(effectiveStats, totalStats, context);

    // Restore Config
    statConfig.applyRelicDot = previousDotState;
    statConfig.applyRelicCrit = previousCritState;

    return result;
}

const fs = require('fs');
const os = require('os');
const { performance } = require('perf_hooks');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

let buffConfig = {};
let outPath = 'static-database.js';

if (isMainThread) {
    buffConfig = JSON.parse(process.argv[2]);
    outPath = process.argv[3];
} else {
    buffConfig = workerData.buffConfig;
}

// --- 1. NODE.JS POLYFILLS & MOCKS ---
global.window = global;

// Map Python configs to Window States
window.mikuBuffActive = buffConfig.miku === '1';
window.enlightenedGodBuffActive = buffConfig.enlightened === '1';
window.bijuuLinkActive = buffConfig.bijuu === '1';
window.ancientMageSupportActive = buffConfig.amage === '1';
window.kingSailorMarkActive = buffConfig.ksailor === '1';
window.kingSailorBuffActive = buffConfig.ksailor === '1';
window.mageHillBuffActive = buffConfig.mage === 'hill';
window.mageGroundBuffActive = buffConfig.mage === 'ground';

global.btoa = function(str) {
    return Buffer.from(str, 'binary').toString('base64');
};

// OPTIMIZED: Only calculate Max Potential (Head + Subs)
const CONFIGS = [
    { head: true,  subs: true }
];

if (isMainThread) {
    // ==========================================
    // MAIN THREAD: Orchestration & Compression
    // ==========================================
    const tasks = [];
    unitDatabase.forEach(u => {
        tasks.push({ u, isCard: false });
        if(u.id === 'kirito') tasks.push({ u, isCard: true });
    });

    const numCores = os.cpus().length;
    const chunks = Array.from({ length: numCores }, () => []);
    tasks.forEach((task, i) => chunks[i % numCores].push(task));

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

        worker.on('error', err => console.error(`Worker ${i+1} Error:`, err));
        worker.on('exit', () => {
            activeWorkers--;
            if (activeWorkers === 0) finalizeDatabase(mergedRawDb);
        });
    });

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

        const FINAL_DB = {};
        for (const [key, data] of Object.entries(rawDb)) {
            FINAL_DB[key] = {
                fixed: data.fixed.map(configRows => rowsToBuffer(configRows)),
                bugged: data.bugged.map(configRows => rowsToBuffer(configRows))
            };
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
                        const subsSuffix = "-SUBS"; // Hardcoded since we only export max potential now

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

    // THE HIGH-SPEED RUNNER: Maps templates through calculateDPS instantly
    function fastCalculateUnitBuilds(unit, cfg, traitsForCalc, isAbility) {
        const { effectiveStats, isKiritoVR, suffix } = buildCalculationContext(unit, 'ruler', { isAbility });
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
        const isSjw = u.id === 'sjw';
        const isLaw = u.id === 'law';
        
        const sortFn = isLaw 
            ? (a, b) => (b.range || 0) - (a.range || 0)
            : (a, b) => {
                let wa = 1.0, wb = 1.0;
                if (isSjw) {
                    if (a.mainStats.body === 'dmg' && a.mainStats.legs === 'dmg') wa = 1.3;
                    if (b.mainStats.body === 'dmg' && b.mainStats.legs === 'dmg') wb = 1.3;
                }
                return (b.dps * wb) - (a.dps * wa);
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
