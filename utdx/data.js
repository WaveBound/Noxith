// ============================================================================
// DATA.JS - Static Data & Configuration
// ============================================================================

// --- THE SINGLE SOURCE OF TRUTH FOR ALL GLOBAL BUFFS ---
// Add a new buff here and the UI, Math Engine, and Python Generator update automatically.
window.GLOBAL_BUFF_DATA = {
    miku: {
        id: 'miku',                 // Used for DB filename (db_miku_...)
        stateKey: 'mikuActive',     // window.mikuActive
        name: 'Miku Buff',
        desc: "Apply Miku's +100% Damage Buff",
        color: '#4ade80',           // Color used in UI and math renders
        math: (uStats) => ({ dmg: 100 }), // The actual math applied
        renderLabel: "Active: +100% Damage",
        genType: 'boolean'          // Tells Python to generate ON/OFF states
    },
    enlightenedGod: {
        id: 'enlightenedgod',
        stateKey: 'enlightenedGodActive',
        name: 'Enlightened God',
        desc: "Buffs allied unit's by 5% Attack, Attack Speed, and Range every 60 seconds. (Cap of 20%)",
        color: '#fbbf24',
        math: (uStats) => ({ dmg: 20, spa: 20, range: 20 }),
        renderLabel: "Active: +20% Dmg, -20% SPA, +20% Range",
        genType: 'boolean'
    },
    bijuu: {
        id: 'bijuu',
        stateKey: 'bijuuActive',
        name: 'Bijuu Link',
        desc: "Apply Bijuu Link: +25% Dmg, +25% Range, -15% SPA",
        color: '#f87171',
        math: (uStats) => {
            // Bijuu Link comes from Unparalleled Armor — can't buff itself
            if (window.isUnit(uStats.id, 'unparalleled_armor')) return {};
            return { dmg: 25, spa: 15, range: 25 };
        },
        renderLabel: "Active: +25% Dmg, +25% Range, -15% SPA",
        genType: 'boolean'
    },
    ancientMage: {
        id: 'amage',
        stateKey: 'ancientMageActive',
        name: 'Ancient Mage',
        desc: "Apply Ancient Mage Buff: +20% Crit Rate/Dmg",
        color: '#60a5fa',
        math: (uStats) => {
            // Ancient Mage buff can't apply to Ancient Mage itself
            if (window.isUnit(uStats.id, 'ancient_mage')) return {};
            return { crit: 20, cdmg: 20 };
        },
        renderLabel: "Active: +20% Crit Rate/Dmg",
        genType: 'boolean'
    },
    kingSailor: {
        id: 'ksailor',
        stateKey: 'kingSailorActive',
        name: 'King Sailor',
        desc: "Leader Passive: King's Mark. Only activates if in Slot 1. +10% Crit Rate, +20% Crit Damage. Magi: +50% Dmg/+15% SPA. Uncontrollable: +30% Dmg/+10% SPA. Water: +20% Dmg/+10% SPA.",
        color: '#60a5fa',
        math: (uStats, context) => {
            // King Sailor buff can't apply to King Sailor itself
            if (window.isUnit(uStats.id, 'king_sailor')) return {};

            // Determine if the buff should be active (Check all sources)
            const hState = window.hotbarState || (typeof hotbarState !== 'undefined' ? hotbarState : null);
            const leader = hState?.slots ? hState.slots[0] : null;
            const isKsLeading = leader && window.isUnit(leader.id, 'king_sailor');

            const hotbarBuffActive = hState?.buffState?.kingSailor || hState?.buffState?.ksailor;
            const globalActive = window.kingSailorActive;
            const contextActive = context?.kingSailorActive;

            if (!globalActive && !hotbarBuffActive && !contextActive && !isKsLeading) return {};

            // 1. BASE BUFF (+10% Crit, +20% CDmg)
            let b = { crit: 10, cdmg: 20 };

            // 2. LEADER PASSIVE (Specific Mark Bonuses)
            // Only applies if King Sailor is in Slot 1 OR in Potential Mode
            if (isKsLeading || window.CALCULATION_MODE === 'potential') {
                const tags = uStats.tags || [];
                if (tags.includes('Magi')) { b.dmg = 50; b.spa = 15; }
                else if (tags.includes('Uncontrollable Power')) { b.dmg = 30; b.spa = 10; }
                else if (String(uStats.element).toLowerCase() === 'water') { b.dmg = 20; b.spa = 10; }
            }

            return b;
        },
        renderLabel: "Mark: +10% Crit, +20% CDmg. Extra for Magi/Uncontrollable/Water.",
        genType: 'boolean'
    },
    mageHill: {
        id: 'magehill',
        stateKey: 'fernHillActive',
        name: 'Fern (Hill)',
        desc: "Apply Fern (Hill) Buff: -30% SPA (Hill Only)",
        color: '#fb923c',
        excludes: 'mageGround', // Automatically disables mageGround if checked
        math: (uStats) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            return (uType === 'hill' || uType === 'hybrid') ? { spa: 30 } : {};
        },
        renderLabel: "Active: -30% SPA",
        genType: 'exclusive:fern' // Tells Python these are mutually exclusive
    },
    mageGround: {
        id: 'mageground',
        stateKey: 'fernGroundActive',
        name: 'Fern (Ground)',
        desc: "Apply Fern (Ground) Buff: +45% Crit Rate (Ground Only)",
        color: '#f472b6',
        excludes: 'mageHill', // Automatically disables mageHill if checked
        math: (uStats) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            return (uType === 'ground' || uType === 'hybrid') ? { crit: 45 } : {};
        },
        renderLabel: "Active: +45% Crit Rate",
        genType: 'exclusive:fern'
    },
    bulma: {
        id: 'bulma',
        stateKey: 'bulmaActive',
        name: 'Bulma Buff',
        desc: "Apply Bulma's +15% Crit Rate Buff",
        color: '#f472b6',
        math: (uStats) => ({ crit: 15 }),
        renderLabel: "Active: +15% Crit Rate",
        genType: 'boolean'
    },
};

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

const comingSoonData = [
    { type: "Feature", title: "Relic Database", desc: "A dedicated page showing all relic stats, set bonuses, and specific drop locations/obtainable methods." },
    { type: "Feature", title: "Mode Differentiation", desc: "Potential Mode will assume maximum possible stats and self-leading buffs. Loadout Mode will require meeting specific positional/team requirements." },
    { type: "Feature", title: "Team Synergy Dashboard", desc: "Real-time summary of team-wide buffs, total team DPS, debuff contributions, and equipped synergy sets." }
];

const patchNotesData = [
    {
        version: "v5.6",
        date: "May 09, 2026",
        changes: [
            { type: "Math", text: "<b>True Damage:</b> Refactored True Damage from a multiplicative bonus into a <b>percentage-based conversion</b> of total damage." },
            { type: "Unit", text: "<b>King Sailor:</b> Added +20% Crit Rate to E2 (Etherealization 2) to better reflect in-game scaling." },
            { type: "Buff", text: "<b>Bulma:</b> Added a dedicated 'Bulma Buff' button (+15% Crit Rate) to the global buffs panel." }
        ]
    },
    {
        version: "v5.5",
        date: "May 06, 2026",
        changes: [
            { type: "UI", text: "<b>Unit Info:</b> Now displays <b>Maximum Upgrade Statistics</b> by default to better reflect a unit's endgame potential." },
            { type: "UI", text: "<b>Passive Attribution:</b> Unit passives now display their explicit stat bonuses (e.g., [Applied: +50% Crit]) in the calculation breakdown for easier troubleshooting." },
            { type: "UI", text: "<b>Renaming:</b> Renamed 'SPA Cap' to <b>Animation Cap</b> across the entire application for improved clarity." }
        ]
    },
    {
        version: "v5.4",
        date: "May 05, 2026",
        changes: [
            { type: "Fix", text: "<b>Custom Pair:</b> Restored full functionality and fixed Trait combination logic." },
            { type: "Fix", text: "<b>Relic Inventory:</b> Major performance optimization; resolved UI hangs during massive inventory calculations." },
            { type: "UI", text: "<b>Inventory Mode:</b> Fixed unit cards getting stuck on 'Calculating...' state." },
            { type: "UI", text: "<b>Optimality Badge:</b> Improved design (smaller, better hover) and added click-to-view breakdown functionality." },
            { type: "UI", text: "<b>Relic Bag:</b> Added interactive hover effect for the inventory bag icon." }
        ]
    },
    {
        version: "v5.3",
        date: "May 04, 2026",
        changes: [
            { type: "Fix", text: "<b>Buffs:</b> Fixed <b>Reaper</b> and <b>S.Reaper</b> Necklace stacking buff logic." },
            { type: "Fix", text: "<b>Performance:</b> Resolved UI lagging/stuttering when scrolling past Sasuke units." },
            { type: "Unit", text: "<b>New Units:</b> Added <b>Sukuna (The Strongest in History)</b> and <b>Gojo (The Strongest of Today)</b>." },
            { type: "Unit", text: "<b>New Units:</b> Added <b>Devil Hunter</b> and <b>Alpha Devil</b>." },
            { type: "UI", text: "<b>Pages:</b> Added page list, should help with any lag/slow rendering." },
            { type: "UI", text: "<b>DPS Breakdown:</b> Improved visual elements and clarity in the math breakdown modal." },
            { type: "UI", text: "<b>Navigation:</b> Moved global buffs to a dedicated <b>Buffs Button</b> to declutter the toolbar." },
            { type: "UI", text: "<b>Search:</b> Added a <b>Search Bar</b> to quickly find units by name, role, or type." },
            { type: "Math", text: "<b>Ranking:</b> Enabling a buff now dynamically re-orders all units by their new DPS rank." },
            { type: "Feature", text: "<b>Unit Modes:</b> Added a <b>Modes Button</b> to select unit forms visually using card images." }
        ]
    },
    {
        version: "v5.2",
        date: "May 03, 2026",
        changes: [
            { type: "Relics", text: "<b>Monarch Set:</b> <b>Phantom Captain</b> planes now count as summons in all forms." }
        ]
    },
    {
        version: "v5.1",
        date: "Apr 29, 2026",
        changes: [
            { type: "Relics", text: "<b>New Sets:</b> Added <b>Sorcerer Hunter</b> (+15% True Damage) and <b>Strongest Sorcerer</b> sets." },
            { type: "Relics", text: "<b>New Heads:</b> Added <b>Sorcerer Hunter Spirit</b> (Disables Crits, +60% Dmg) and <b>Strongest Glasses</b>." },
            { type: "Math", text: "<b>King Sailor:</b> Implemented custom <b>Baal's Lightning</b> math." },
            { type: "UI", text: "<b>Renaming:</b> Renamed 'Enlightened God' to <b>Water God</b> consistently across the app." }
        ]
    },
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
    { unit: "prodigy_mage", img: "images/units/ProdigyMage.png", isCalculated: true },
    { unit: "the_strongest_in_history", img: "images/units/Sukuna.png", isCalculated: true },
    { unit: "the_strongest_of_today", img: "images/units/Gojo.png", isCalculated: true },
    { unit: "devil_hunter", img: "images/units/DevilHunter.png", isCalculated: true },
    { unit: "alpha_devil", img: "images/units/AlphaDevil.png", isCalculated: true },
    { unit: "mimicry_sorcerer", img: "images/units/MimicrySorcerer.png", isCalculated: true }
];



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
    sorcerer_hunter: { dmg: 10, spa: 7.5, cf: 0, cm: 0, range: 0 },
    strongest_sorcerer: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 5 },
    monarch: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }, // Dynamic bonus handled in math.js
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
    { id: "rebellious_set", name: "Rebellious Shinobi", bonus: { dmg: "+30% Damage (CC)" } },
    { id: "reanimated_ninja", name: "Reanimated Ninja", bonus: { dmg: 10, dot: 30 } },
    { id: "great_mage", name: "Great Mage", bonus: { range: 10 } },
    { id: "sorcerer_hunter", name: "Sorcerer Hunter", bonus: { dmg: 10, spa: 7.5 } },
    { id: "strongest_sorcerer", name: "Strongest Sorcerer", bonus: { dmg: 10, range: 5 } },
    { id: "monarch", name: "Monarch", bonus: { dmg: "Up to +40% (Summon Based)" } }
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
    return _originalPush.call(this, unit);
};

const creditsData = [
    { role: "Owner", name: "xKing.", id: "xking.", userId: "347578773857632258", pfp: "images/pfp/xking.png", type: "owner" },
    { role: "Helper", name: "xAuroraFlare", id: "xauroraflare", userId: "216293393888837632", pfp: "images/pfp/xauroraflare.gif", type: "helper" }
];

// ============================================================================
// UNIT FILE MANIFEST
// To add a new unit: add its filename to this array. That's it.
// ============================================================================
const UNIT_FILES = [
    'sukuna.js',
    'jingliu.js',
    'maid.js',
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