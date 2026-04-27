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
        id: "Maid", name: "Scarlet Maid (World)", role: "Damage / Support",
        img: "images/units/Maid.png",
        totalCost: 80700,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3.5, 
            passiveDmg: 0, 
            element: "Light", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 156, spa: 4, range: 16, cost: 1400 },    // Up 0 (Base)
            { dmg: 286, spa: 4, range: 17, cost: 2600 },    // Up 1
            { dmg: 429, spa: 4, range: 18, cost: 4200 },    // Up 2
            { dmg: 715, spa: 5, range: 20, cost: 6000 },    // Up 3
            { dmg: 910, spa: 5, range: 20, cost: 6500 },    // Up 4
            { dmg: 1170, spa: 5, range: 22, cost: 7500 },   // Up 5
            { dmg: 1430, spa: 5, range: 24, cost: 8500 },   // Up 6
            { dmg: 1690, spa: 5, range: 24, cost: 10000 },  // Up 7
            { dmg: 2015, spa: 5, range: 26, cost: 12000 },  // Up 8
            { dmg: 2730, spa: 5, range: 28, cost: 22000 }   // Up 9
        ]
    },
    {
        id: "sjw", name: "Jinoo (Monarch)", role: "Damage",
        img: "images/units/Sjw.png",
        totalCost: 93300,
        placement: 1, tags: [], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 5, 
            passiveDmg: 25, 
            element: "Dark" 
        },
        upgrades: [
            { dmg: 184, spa: 4, range: 27, cost: 800 },    // Up 0 (Base)
            { dmg: 322, spa: 4, range: 27, cost: 1700 },   // Up 1
            { dmg: 506, spa: 4, range: 27, cost: 2800 },   // Up 2
            { dmg: 920, spa: 6, range: 29, cost: 3600 },   // Up 3 (Line + Hybrid)
            { dmg: 1092, spa: 6, range: 29, cost: 4400 },  // Up 4
            { dmg: 1256, spa: 6, range: 29, cost: 6000 },  // Up 5
            { dmg: 1437, spa: 6, range: 32, cost: 12000 }, // Up 6 (AoE → Circle)
            { dmg: 1725, spa: 6, range: 32, cost: 18000 }, // Up 7
            { dmg: 2185, spa: 6, range: 35, cost: 19000 }, // Up 8
            { dmg: 2875, spa: 5, range: 35, cost: 25000 }  // Up 9
        ]
    },
    {
        id: "ragna", name: "Dragon Guy", role: "Burst / Hybrid",
        img: "images/units/Ragna.png",
        totalCost: 75700,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 12, 
            element: "Ice" 
        },
        ability: { dmg: 3600, spa: 15, passiveDmg: 72, },
        upgrades: [
            { dmg: 260, spa: 8, range: 23, cost: 2200 },   // Up 0 (Base)
            { dmg: 320, spa: 8, range: 24, cost: 2800 },   // Up 1
            { dmg: 440, spa: 8, range: 24, cost: 3800 },   // Up 2
            { dmg: 480, spa: 7.5, range: 27, cost: 5200 },  // Up 3
            { dmg: 580, spa: 7.5, range: 27, cost: 6700 },  // Up 4
            { dmg: 700, spa: 7.5, range: 28, cost: 8500 },  // Up 5
            { dmg: 750, spa: 7, range: 29, cost: 9500 },   // Up 6 (Line AoE)
            { dmg: 900, spa: 7, range: 29, cost: 11000 },  // Up 7
            { dmg: 1200, spa: 9, range: 30, cost: 12000 }, // Up 8 (Circle AoE)
            { dmg: 1500, spa: 7, range: 35, cost: 14000, unlocksAbility: true } // Up 9
        ]
    },
    {
        id: "kirito", name: "Kriatu", role: "Burst / Crit",
        img: "images/units/Kirito.png",
        totalCost: 30400,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", virtual: "Astral", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { 
            crit: 50, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 4, 
            hitCount: 14, 
            reqCrits: 50, 
            extraAttacks: 0, 
            element: "Ice" 
        },
        upgrades: [
            { dmg: 80, spa: 7, range: 18, cost: 1200 },    // Up 0 (Base)
            { dmg: 150, spa: 7, range: 20, cost: 1000 },   // Up 1
            { dmg: 184, spa: 7, range: 30, cost: 1300 },   // Up 2
            { dmg: 237, spa: 6, range: 32, cost: 1800 },   // Up 3 (Circle AoE)
            { dmg: 294, spa: 6, range: 33, cost: 2200 },   // Up 4
            { dmg: 357, spa: 6, range: 33, cost: 2750 },   // Up 5
            { dmg: 453, spa: 6, range: 36, cost: 3050 },   // Up 6 (Circle AoE)
            { dmg: 567, spa: 6, range: 36, cost: 3600 },   // Up 7
            { dmg: 750, spa: 8, range: 30, cost: 6000 },   // Up 8 (Full AoE)
            { dmg: 1000, spa: 7, range: 30, cost: 7500 }   // Up 9 (Enhance Armament)
        ]
    },
    {
        id: "genos", name: "Cyborg", role: "DoT / Damage",
        img: "images/units/Genos.png",
        totalCost: 26900,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Standard DPS Selection." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 14, 
            dotStacks: 1, 
            spaCap: 4, 
            passiveDmg: 0, 
            element: "Fire", 
            burnMultiplier: 45 
        },
        ability: { abilityName: "Nuke Blast", passiveDmg: 75 },
        upgrades: [
            { dmg: 50, spa: 4, range: 25, cost: 700 },     // Up 0 (Base)
            { dmg: 115, spa: 4, range: 25, cost: 800 },    // Up 1
            { dmg: 200, spa: 4, range: 25, cost: 1400 },   // Up 2
            { dmg: 350, spa: 4, range: 25, cost: 2000 },   // Up 3
            { dmg: 500, spa: 4, range: 25, cost: 2500 },   // Up 4
            { dmg: 600, spa: 4, range: 28, cost: 2750 },   // Up 5
            { dmg: 720, spa: 4, range: 28, cost: 3000 },   // Up 6
            { dmg: 800, spa: 4, range: 30, cost: 3500 },   // Up 7
            { dmg: 950, spa: 4, range: 32, cost: 5000, unlocksAbility: true }, // Up 8 (Gains Nuke Blast Ability)
            { dmg: 1200, spa: 4, range: 32, cost: 5250 }   // Up 9
        ]
    },
    {
        id: "kenpachi", name: "Berserker", role: "Damage / Slow",
        img: "images/units/Kenpachi.png",
        totalCost: 61700,
        placement: 3, tags: ["Peroxide", "Reaper", "Rage"], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2.0, 
            element: "Light" 
        },
        upgrades: [
            { dmg: 150, spa: 5, range: 20, cost: 800 },    // Up 0 (Base)
            { dmg: 225, spa: 5, range: 20, cost: 1200 },   // Up 1
            { dmg: 335, spa: 5, range: 20, cost: 1800 },   // Up 2
            { dmg: 540, spa: 6, range: 22, cost: 2400 },   // Up 3 (AoE → Cone)
            { dmg: 700, spa: 6, range: 22, cost: 3800 },   // Up 4
            { dmg: 1000, spa: 6, range: 22, cost: 5400 },  // Up 5
            { dmg: 1600, spa: 8, range: 24, cost: 8000 },  // Up 6 (AoE → Line)
            { dmg: 1750, spa: 7, range: 24, cost: 9800 },  // Up 7
            { dmg: 1900, spa: 10, range: 27, cost: 12500 }, // Up 8 (AoE → Full AoE, Gains Hybrid)
            { dmg: 2400, spa: 10, range: 27, cost: 16000 }  // Up 9
        ]
    },
    {
        id: "sasuke", name: "Sasuke (Chakra)", role: "Damage",
        img: "images/units/Sasuke.png",
        totalCost: 42400,
        placement: 2, tags: ["Team 7", "Ninjaverse", "Hero", "Bloodline"], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Ruler for DPS, Eternal/Sacred for support." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 4, 
            passiveDmg: 25, 
            element: "Dark" 
        },
        upgrades: [
            { dmg: 125, spa: 7, range: 15, cost: 1400 },   // Up 0 (Base)
            { dmg: 250, spa: 7, range: 17, cost: 2000 },   // Up 1
            { dmg: 400, spa: 7, range: 17, cost: 2700 },   // Up 2
            { dmg: 425, spa: 9, range: 19, cost: 3100 },   // Up 3
            { dmg: 475, spa: 9, range: 19, cost: 3900 },   // Up 4
            { dmg: 560, spa: 6, range: 21, cost: 4500 },   // Up 5
            { dmg: 650, spa: 6, range: 21, cost: 4800 },   // Up 6
            { dmg: 800, spa: 6, range: 21, cost: 5800 },   // Up 7
            { dmg: 1800, spa: 7.5, range: 28, cost: 6700 }, // Up 8
            { dmg: 2175, spa: 7.5, range: 30, cost: 7500 }  // Up 9
        ]
    },
    {
        id: "mob", name: "Psycho (100%)", role: "Damage",
        img: "images/units/Mob.png",
        totalCost: 56900,
        placement: 3, tags: [], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Standard DPS selection." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 20, 
            dotStacks: 1, 
            spaCap: 5.5, 
            passiveDmg: 0, 
            element: "Rose", 
            dotDuration: 4 
        },
        upgrades: [
            { dmg: 120, spa: 5, range: 15, cost: 1000 },   // Up 0 (Base)
            { dmg: 247, spa: 5, range: 18, cost: 1500 },   // Up 1
            { dmg: 500, spa: 5, range: 20, cost: 2500 },   // Up 2
            { dmg: 670, spa: 5, range: 22, cost: 3700 },   // Up 3
            { dmg: 750, spa: 5, range: 25, cost: 4500 },   // Up 4
            { dmg: 850, spa: 8, range: 20, cost: 6500 },   // Up 5 (Full AoE)
            { dmg: 980, spa: 8, range: 20, cost: 7200 },   // Up 6
            { dmg: 1100, spa: 8, range: 20, cost: 8000 },  // Up 7
            { dmg: 1450, spa: 7, range: 30, cost: 10000 }, // Up 8 (Circle + Hybrid)
            { dmg: 1800, spa: 6.5, range: 30, cost: 12000 } // Up 9
        ]
    },
    {
        id: "shanks", name: "Shunks", role: "Damage",
        img: "images/units/Shanks.png",
        totalCost: 66800,
        placement: 3, tags: [], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2.5, 
            passiveDmg: 0, 
            element: "Rose", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 100, spa: 8, range: 15, cost: 800 },    // Up 0 (Base)
            { dmg: 145, spa: 8, range: 15, cost: 1200 },   // Up 1
            { dmg: 217, spa: 8, range: 15, cost: 1800 },   // Up 2
            { dmg: 290, spa: 8, range: 18, cost: 2400 },   // Up 3 (Line AoE)
            { dmg: 360, spa: 8, range: 18, cost: 3000 },   // Up 4
            { dmg: 435, spa: 8, range: 18, cost: 3600 },   // Up 5
            { dmg: 520, spa: 8, range: 21, cost: 4200 },   // Up 6
            { dmg: 600, spa: 8, range: 21, cost: 4800 },   // Up 7
            { dmg: 2000, spa: 12, range: 30, cost: 20000 }, // Up 8 (AoE + Hybrid)
            { dmg: 2200, spa: 12, range: 30, cost: 25000 }  // Up 9
        ]
    },
    {
        id: "law", name: "Rule (ROOM)", role: "Support",
        img: "images/units/Law.png",
        totalCost: 85000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler/Sacred", long: "Ruler/Sacred", note: "Ruler/Sacred offer the most Spa%- / Rng%+" },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 20, 
            passiveSpa: 10, 
            element: "Water", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 160, spa: 6, range: 29, cost: 1200 },    // Up 0 (Base)
            { dmg: 160, spa: 5.5, range: 30, cost: 2000 },  // Up 1
            { dmg: 400, spa: 5.5, range: 30, cost: 3400 },  // Up 2
            { dmg: 450, spa: 8, range: 25, cost: 5600 },    // Up 3
            { dmg: 550, spa: 8, range: 25, cost: 6500 },    // Up 4
            { dmg: 600, spa: 8, range: 26, cost: 8000 },    // Up 5
            { dmg: 700, spa: 5, range: 32, cost: 8500 },    // Up 6
            { dmg: 850, spa: 5, range: 35, cost: 9000 },    // Up 7
            { dmg: 1050, spa: 5, range: 38, cost: 9800 },   // Up 8
            { dmg: 1250, spa: 5, range: 40, cost: 11000 },  // Up 9
            { dmg: 1300, spa: 5, range: 42, cost: 20000 }   // Up 10
        ]
    },
    {
        id: "akainu", name: "Akainu", role: "Support / Damage",
        img: "images/units/Akainu.png",
        totalCost: 27150,
        placement: 3, tags: [], placementType: "Hybrid",
        meta: { short: "Eternal/Sacred", long: "Eternal/Sacred", note: "Eternal/Sacred offer the the best dps + support performance." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 60, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 0, 
            passiveSpa: 0, 
            element: "Fire", 
            dotDuration: 7 
        },
        upgrades: [
            { dmg: 150, spa: 7, range: 20, cost: 1000 },   // Up 0 (Base)
            { dmg: 300, spa: 7, range: 22, cost: 1600 },   // Up 1
            { dmg: 400, spa: 6, range: 24, cost: 2000 },   // Up 2
            { dmg: 500, spa: 8, range: 23, cost: 2500 },   // Up 3 (Circle AoE)
            { dmg: 640, spa: 8, range: 24, cost: 3000 },   // Up 4
            { dmg: 700, spa: 7, range: 27, cost: 3400 },   // Up 5
            { dmg: 830, spa: 7, range: 30, cost: 3900 },   // Up 6
            { dmg: 950, spa: 8, range: 33, cost: 4500 },   // Up 7 (Line AoE + Hybrid)
            { dmg: 1100, spa: 7, range: 37, cost: 5250 }   // Up 8
        ]
    },
    {
        id: "ichigo", name: "Ichiko (Rage)", role: "Damage",
        img: "images/units/Ichigo.png",
        totalCost: 111880,
        placement: 1, tags: ["Peroxide", "Reaper", "Rage", "Hollow"], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 15, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 7, 
            passiveDmg: 50, 
            passiveSpa: 0, 
            element: "Dark", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 180, spa: 5.5, range: 25, cost: 1750 },   // Up 0 (Base)
            { dmg: 255, spa: 5.5, range: 25, cost: 2250 },   // Up 1
            { dmg: 365, spa: 5.0, range: 25, cost: 3000 },   // Up 2
            { dmg: 570, spa: 7.0, range: 20, cost: 5800 },   // Up 3 (AoE → Line)
            { dmg: 730, spa: 7.0, range: 20, cost: 8205 },   // Up 4
            { dmg: 1300, spa: 6.5, range: 22, cost: 10750 }, // Up 5
            { dmg: 1900, spa: 6.5, range: 22, cost: 12150 }, // Up 6 (AoE → Line continues)
            { dmg: 2150, spa: 7.5, range: 28, cost: 14400 }, // Up 7
            { dmg: 2400, spa: 7.5, range: 28, cost: 16000 }, // Up 8
            { dmg: 2850, spa: 8.0, range: 35, cost: 18250 }, // Up 9
            { dmg: 3000, spa: 8.0, range: 38, cost: 19325 }  // Up 10
        ]
    },
    {
        id: "grimjaw", name: "Grommjaw (Panther)", role: "Damage",
        img: "images/units/Grimjaw.png",
        totalCost: 41175,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 50, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 6.67, 
            passiveSpa: 4.17, 
            element: "Water", 
            dotDuration: 10 
        },
        upgrades: [
            { dmg: 85, spa: 7, range: 20, cost: 1300 },    // Up 0 (Base)
            { dmg: 140, spa: 7, range: 20, cost: 1850 },   // Up 1
            { dmg: 245, spa: 6.5, range: 22, cost: 2290 }, // Up 2
            { dmg: 320, spa: 6.5, range: 22, cost: 2900 }, // Up 3
            { dmg: 485, spa: 6.5, range: 22, cost: 3575 }, // Up 4
            { dmg: 545, spa: 8, range: 25, cost: 3775 },   // Up 5
            { dmg: 670, spa: 7.5, range: 25, cost: 3900 }, // Up 6
            { dmg: 870, spa: 7.5, range: 25, cost: 4450 }, // Up 7
            { dmg: 955, spa: 7.5, range: 28, cost: 5010 }, // Up 8
            { dmg: 1135, spa: 7, range: 28, cost: 5675 },  // Up 9
            { dmg: 1590, spa: 9, range: 35, cost: 6450 }   // Up 10
        ]
    },
    {
        id: "stark", name: "Koyote", role: "Damage",
        img: "images/units/Stark.png",
        totalCost: 34855,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 6, 
            passiveDmg: 0, 
            passiveSpa: 0, 
            element: "Ice", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 90, spa: 7, range: 20, cost: 1200 },    // Up 0 (Base)
            { dmg: 145, spa: 7, range: 20, cost: 1750 },   // Up 1
            { dmg: 250, spa: 7, range: 20, cost: 2190 },   // Up 2
            { dmg: 330, spa: 7, range: 25, cost: 2800 },   // Up 3 (Circle + Hybrid)
            { dmg: 490, spa: 7, range: 25, cost: 3475 },   // Up 4
            { dmg: 540, spa: 7, range: 28, cost: 3675 },   // Up 5
            { dmg: 675, spa: 6.5, range: 30, cost: 3800 }, // Up 6
            { dmg: 775, spa: 6.5, range: 30, cost: 4350 }, // Up 7
            { dmg: 830, spa: 6.5, range: 33, cost: 4990 }, // Up 8
            { dmg: 905, spa: 6.5, range: 33, cost: 5575 }, // Up 9
            { dmg: 1050, spa: 6, range: 35, cost: 1050 }   // Up 10
        ]
    },
    {
        id: "ulquiorra", name: "Ultiorra", role: "Damage",
        img: "images/units/Ulqiorra.png",
        totalCost: 31760,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 0, 
            passiveSpa: 5, 
            element: "Dark", 
            dotDuration: 0 
        },
        ability: { buffDmg: 65, passiveSpa: 2.5, crit: 10 },
        upgrades: [
            { dmg: 80, spa: 7, range: 15, cost: 1000 },    // Up 0 (Base)
            { dmg: 200, spa: 7, range: 15, cost: 1550 },   // Up 1
            { dmg: 315, spa: 6.5, range: 18, cost: 1980 },  // Up 2
            { dmg: 490, spa: 8, range: 25, cost: 2600 },   // Up 3 (Line AoE)
            { dmg: 675, spa: 8, range: 25, cost: 3250 },   // Up 4
            { dmg: 875, spa: 7.5, range: 28, cost: 3475 },  // Up 5
            { dmg: 940, spa: 7, range: 35, cost: 3600 },   // Up 6 (Circle AoE)
            { dmg: 1025, spa: 7, range: 35, cost: 4150 },  // Up 7
            { dmg: 1190, spa: 5.5, range: 30, cost: 4880 }, // Up 8 (Line AoE)
            { dmg: 1275, spa: 5, range: 33, cost: 5275, unlocksAbility: true } // Up 9
        ]
    },
    {
        id: "harribel", name: "Tierabel", role: "Damage",
        img: "images/units/Harribel.png",
        totalCost: 30990,
        placement: 3, tags: ["Peroxide", "Hollow"], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal", note: "Standard DPS selection." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 0, 
            passiveSpa: 0, 
            element: "Water", 
            dotDuration: 0 
        },
        ability: { buffDmg: 35, buffDuration: 80, spaCap: 4, hasToggle: true },
        upgrades: [
            { dmg: 100, spa: 6, range: 20, cost: 700 },     // Up 0 (Base)
            { dmg: 310, spa: 6, range: 20, cost: 1150 },    // Up 1
            { dmg: 480, spa: 6, range: 25, cost: 1775 },    // Up 2
            { dmg: 620, spa: 6, range: 25, cost: 2250 },    // Up 3
            { dmg: 760, spa: 7, range: 28, cost: 2925 },    // Up 4 (Line AoE)
            { dmg: 885, spa: 7, range: 28, cost: 3475 },    // Up 5
            { dmg: 990, spa: 6.5, range: 28, cost: 3800 },  // Up 6
            { dmg: 1115, spa: 6.5, range: 28, cost: 4350 }, // Up 7
            { dmg: 1490, spa: 8.5, range: 30, cost: 4990 }, // Up 8 (Circle AoE)
            { dmg: 1560, spa: 8.5, range: 30, cost: 5575 }  // Up 9
        ]
    },
    {
        id: "ace", name: "Spade", role: "Damage / Burn(DoT)",
        img: "images/units/Ace.png",
        totalCost: 39000,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler/Astral", note: "Ruler provides good dps to cost." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 100, 
            dotStacks: 1, 
            spaCap: 6, 
            passiveDmg: 60, 
            element: "Fire", 
            dotDuration: 4 
        },
        upgrades: [
            { dmg: 100, spa: 5, range: 22, cost: 1000 },   // Up 0 (Base)
            { dmg: 250, spa: 4.8, range: 24, cost: 1300 }, // Up 1
            { dmg: 360, spa: 4.5, range: 26, cost: 1750 }, // Up 2
            { dmg: 575, spa: 6, range: 28, cost: 2350 },   // Up 3
            { dmg: 750, spa: 5.8, range: 28, cost: 2900 }, // Up 4
            { dmg: 850, spa: 5.6, range: 30, cost: 3500 }, // Up 5
            { dmg: 975, spa: 5.4, range: 30, cost: 4700 }, // Up 6
            { dmg: 1000, spa: 8, range: 27, cost: 6000 },  // Up 7 (Full AoE)
            { dmg: 1100, spa: 8, range: 27, cost: 7000 },  // Up 8
            { dmg: 1250, spa: 8, range: 30, cost: 8500 }   // Up 9
        ]
    },
    {
        id: "Jingliu", name: "Jangluu", role: "Damage",
        img: "images/units/Jingliu.png",
        totalCost: 33725,
        placement: 3, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Eternal/Sacred", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { 
            crit: 50, 
            cdmg: 200, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 35, 
            element: "Ice", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 80, spa: 4.5, range: 20, cost: 1200 },   // Up 0 (Base)
            { dmg: 185, spa: 4.5, range: 20, cost: 1750 },  // Up 1
            { dmg: 310, spa: 4, range: 23, cost: 2190 },    // Up 2
            { dmg: 495, spa: 4, range: 23, cost: 2800 },    // Up 3
            { dmg: 685, spa: 5.5, range: 25, cost: 3475 },  // Up 4
            { dmg: 880, spa: 5.5, range: 25, cost: 3675 },  // Up 5
            { dmg: 1035, spa: 5.5, range: 28, cost: 3800 }, // Up 6
            { dmg: 1290, spa: 5.5, range: 28, cost: 4350 }, // Up 7
            { dmg: 1550, spa: 6.5, range: 35, cost: 4910 }, // Up 8
            { dmg: 1700, spa: 6, range: 40, cost: 5575 }    // Up 9
        ]

    },
    {
        id: "megumin", name: "Migumen", role: "Damage / Burn(Dot)",
        img: "images/units/Megumin.png",
        totalCost: 136000,
        placement: 1, tags: [], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 50, 
            dotStacks: 1, 
            spaCap: 4, 
            passiveDmg: 0, 
            element: "Fire", 
            dotDuration: 10 
        },
        ability: { passiveDmg: 50, passiveSpa: -50 },
        upgrades: [
            { dmg: 1000, spa: 11.5, range: 30, cost: 3000 },  // Up 0 (Base)
            { dmg: 2175, spa: 11.5, range: 35, cost: 11865 }, // Up 1
            { dmg: 3980, spa: 13, range: 38, cost: 21250 },   // Up 2
            { dmg: 5050, spa: 13.5, range: 40, cost: 28600 }, // Up 3
            { dmg: 5000, spa: 11.5, range: 45, cost: 32580 }, // Up 4
            { dmg: 7230, spa: 14, range: 50, cost: 40000 }    // Up 5
        ]
    },
    {
        id: "bambietta", name: "Bambee", role: "Damage / (Support/Dot)",
        img: "images/units/Bambietta.png",
        totalCost: 40000,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Eternal provides highest DPS Potential, Ruler provides good dps to cost." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 0, 
            element: "Dark", 
            dotDuration: 0, 
            hasElementSelect: true 
        },
        upgrades: [
            { dmg: 60, spa: 5, range: 25, cost: 900 },     // Up 0 (Base)
            { dmg: 195, spa: 5, range: 28, cost: 1750 },   // Up 1
            { dmg: 305, spa: 4.5, range: 28, cost: 2180 }, // Up 2
            { dmg: 425, spa: 4.5, range: 30, cost: 2800 }, // Up 3
            { dmg: 580, spa: 5.5, range: 30, cost: 3950 }, // Up 4
            { dmg: 675, spa: 5.5, range: 33, cost: 5175 }, // Up 5
            { dmg: 790, spa: 5.5, range: 35, cost: 7600 }, // Up 6
            { dmg: 1050, spa: 7, range: 35, cost: 8150 },  // Up 7
            { dmg: 1230, spa: 6.5, range: 38, cost: 9980 } // Up 8
        ]
    },
    {
        id: "esdeath", name: "Ice Empress", role: "Damage / Support",
        img: "images/units/Esdeath.png",
        totalCost: 92890,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Passive avg 37.5% Dmg (Cycles 0-75%). Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 37.5, 
            element: "Ice", 
            dotDuration: 0 
        },
        upgrades: [
            { dmg: 120, spa: 6, range: 25, cost: 1500 },     // Up 0 (Base)
            { dmg: 265, spa: 6, range: 28, cost: 2150 },     // Up 1
            { dmg: 470, spa: 5.5, range: 30, cost: 3000 },   // Up 2
            { dmg: 695, spa: 7, range: 35, cost: 6600 },     // Up 3
            { dmg: 870, spa: 7, range: 35, cost: 7290 },     // Up 4
            { dmg: 1050, spa: 7, range: 38, cost: 8750 },    // Up 5
            { dmg: 1190, spa: 6.5, range: 40, cost: 9870 },  // Up 6
            { dmg: 1265, spa: 6.5, range: 40, cost: 11100 }, // Up 7
            { dmg: 1400, spa: 6.5, range: 45, cost: 12900 }, // Up 8
            { dmg: 1765, spa: 8, range: 45, cost: 13730 },   // Up 9
            { dmg: 1975, spa: 8.5, range: 50, cost: 16000 }  // Up 10
        ]
    },
    {
        id: "phantom_captain", name: "Phantom Captain", role: "Summon / Dmg",
        img: "images/units/Phantom.png",
        totalCost: 69000,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Needs low SPA (High Speed) to maintain max 9 planes." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 0, 
            element: "Light", 
            dotDuration: 0 
        },
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
        },
        upgrades: [
            { dmg: 500, spa: 15, range: 20, cost: 2500 },   // Up 0 (Base)
            { dmg: 1250, spa: 15, range: 25, cost: 7500 },  // Up 1
            { dmg: 2375, spa: 15, range: 30, cost: 13000 }, // Up 2
            { dmg: 2980, spa: 15, range: 35, cost: 19000 }, // Up 3
            { dmg: 3600, spa: 10, range: 55, cost: 27000 }  // Up 4
        ]
    },
    {
        id: "sharpshooter", name: "Sharpshooter", role: "Damage / Support",
        img: "images/units/Sharpshooter.png",
        totalCost: 57560,
        placement: 2, tags: [], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler", note: "Toggle Ability for Sniper Mode (Global Range)." },
        stats: {
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3.5,
            element: "Fire", 
            dotDuration: 0,
            passiveDmg: 125, // Normal Mode: 2.25x Dmg
            passiveSpa: 0
        },
        ability: {
            passiveDmg: 10,  // Sniper Mode: 1.1x Dmg
            passiveSpa: 10,  // Sniper Mode: 0.9x SPA (10% reduction)
            range: 120  // Sniper Mode: 200 Range
        },
        upgrades: [
            { dmg: 130, spa: 5, range: 25, cost: 1750 },   // Up 0 (Base)
            { dmg: 205, spa: 5, range: 28, cost: 2300 },   // Up 1
            { dmg: 355, spa: 6.5, range: 30, cost: 3900 },  // Up 2
            { dmg: 470, spa: 6, range: 35, cost: 4950 },   // Up 3
            { dmg: 685, spa: 7.5, range: 38, cost: 6010 },  // Up 4
            { dmg: 815, spa: 7.5, range: 38, cost: 7250 },  // Up 5
            { dmg: 970, spa: 6.5, range: 40, cost: 8980 },  // Up 6
            { dmg: 1065, spa: 6.5, range: 43, cost: 10355 }, // Up 7
            { dmg: 1145, spa: 6, range: 45, cost: 12065 }   // Up 8
        ]
    },
    {
        id: "rohan", name: "Rohan & Robot 16", role: "Damage",
        img: "images/units/Rohan.png",
        totalCost: 70185,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Ability activates Unleashed mode." },
        stats: { 
            crit: 15, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 30, 
            passiveSpa: 5, 
            element: "Light", 
            dotDuration: 0 
        },
        ability: { dmg: 2445, spa: 8.5, range: 58, spaCap: 2 },
        upgrades: [
            { dmg: 145, spa: 6, range: 28, cost: 1750 },   // Up 0 (Base)
            { dmg: 250, spa: 6, range: 30, cost: 2890 },   // Up 1
            { dmg: 340, spa: 6, range: 33, cost: 3200 },   // Up 2
            { dmg: 495, spa: 5.5, range: 35, cost: 3975 },  // Up 3
            { dmg: 565, spa: 5, range: 40, cost: 4650 },   // Up 4 (Splash)
            { dmg: 690, spa: 5, range: 45, cost: 5450 },   // Up 5
            { dmg: 750, spa: 5, range: 48, cost: 6900 },   // Up 6
            { dmg: 800, spa: 4.5, range: 50, cost: 7575 },  // Up 7
            { dmg: 1650, spa: 8, range: 53, cost: 8800 },   // Up 8 (Cone)
            { dmg: 1820, spa: 7.5, range: 55, cost: 10995 }, // Up 9
            { dmg: 2445, spa: 8.5, range: 58, cost: 14000 }  // Up 10 (Line AoE)
        ]
    },
    {
        id: "cell", name: "Bio-Android (Imperfect)", role: "Damage / Summon",
        img: "images/units/Cell.png",
        totalCost: 59110,
        placement: 1, tags: ["Bio-Android"], placementType: "Hybrid",
        meta: { short: "Ruler", long: "Ruler", note: "Imperfect Form base. Toggle for True Form available at Max Upgrade." },
        stats: {
            baseName: "Imperfect Form",
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            spaCap: 4.1,
            passiveDmg: 70, 
            element: "Wind"
        },
        ability: {
            abilityName: "True Form",
            dmg: 3225, spa: 10, spaCap: 2.5, range: 43,
            passiveDmg: 50,
            summonStats: {
                attacksToSpawn: 3, maxCount: 3, dmgPct: 50, buffWindow: 0,
                planeA: { spa: 7.5, duration: 30 },
                planeB: { spa: 7.5, duration: 30 }
            }
        },
        upgrades: [
            { dmg: 115, spa: 7.5, range: 25, cost: 1000 },  // Up 0 (Base)
            { dmg: 280, spa: 7.0, range: 25, cost: 1800 },  // Up 1
            { dmg: 475, spa: 7.0, range: 25, cost: 2700 },  // Up 2
            { dmg: 625, spa: 6.5, range: 25, cost: 3680 },  // Up 3
            { dmg: 795, spa: 6.5, range: 30, cost: 4150 },  // Up 4
            { dmg: 980, spa: 6.5, range: 30, cost: 5700 },  // Up 5
            { dmg: 1085, spa: 6.0, range: 35, cost: 6150 }, // Up 6
            { dmg: 1790, spa: 8.5, range: 38, cost: 6980 }, // Up 7 (Becomes Hybrid)
            { dmg: 1860, spa: 8.0, range: 40, cost: 8350 }, // Up 8
            { dmg: 2695, spa: 10.0, range: 45, cost: 8850 }, // Up 9
            { dmg: 3000, spa: 9.5, range: 48, cost: 9750, unlocksAbility: true }   // Up 10
        ]
    },
    {
        id: "vegeta", name: "Fallen Prince", role: "Damage",
        img: "images/units/Vegeta.png",
        totalCost: 35115,
        placement: 3, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Eternal", note: "Toggle Boss Stacks for max damage." },
        stats: { 
            crit: 45, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 0, 
            element: "Dark", 
            dotDuration: 0, 
            passiveSpa: 15, 
            passiveRange: 15 
        },
        ability: { passiveDmg: 150 },
        upgrades: [
            { dmg: 130, spa: 9.5, range: 22, cost: 1000 },  // Up 0 (Base)
            { dmg: 355, spa: 9.5, range: 22, cost: 1550 },  // Up 1
            { dmg: 515, spa: 9.5, range: 25, cost: 2600 },  // Up 2
            { dmg: 810, spa: 9, range: 30, cost: 3250 },    // Up 3
            { dmg: 1080, spa: 9, range: 30, cost: 3875 },   // Up 4
            { dmg: 1250, spa: 8.5, range: 35, cost: 4150 }, // Up 5
            { dmg: 1699, spa: 8.5, range: 38, cost: 5200 }, // Up 6
            { dmg: 1945, spa: 8, range: 40, cost: 6490 },   // Up 7 (AoE → Line)
            { dmg: 2250, spa: 8, range: 45, cost: 7000 }    // Up 8
        ]
    },
    {
        id: "super_roku", name: "Super Roku", role: "Damage",
        img: "images/units/SuperRoku.png",
        totalCost: 50250,
        placement: 2, tags: ["Saiyan"], placementType: "Hill",
        meta: { short: "Ruler", long: "Ruler", note: "Toggle Same Enemy for boss DPS calculation." },
        stats: { 
            crit: 10, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 4, 
            passiveDmg: 25, 
            element: "Light", 
            dotDuration: 0 
        },
        ability: {},
        upgrades: [
            { dmg: 64, spa: 4.5, range: 20, cost: 1250 },   // Up 0 (Base)
            { dmg: 205, spa: 4.5, range: 22, cost: 1850 },  // Up 1
            { dmg: 242, spa: 4, range: 22, cost: 2925 },    // Up 2
            { dmg: 505, spa: 6, range: 25, cost: 4240 },    // Up 3
            { dmg: 735, spa: 6, range: 25, cost: 5200 },    // Up 4
            { dmg: 822, spa: 5.5, range: 25, cost: 5725 },  // Up 5
            { dmg: 1195, spa: 7.5, range: 30, cost: 6055 }, // Up 6
            { dmg: 1425, spa: 7.5, range: 33, cost: 6275 }, // Up 7
            { dmg: 1630, spa: 6.5, range: 35, cost: 7730 }, // Up 8
            { dmg: 1950, spa: 6.5, range: 41, cost: 9000 }  // Up 9
        ]
    },
    {
        id: "trunks", name: "The Drink", role: "Damage / DoT",
        img: "images/units/Trunks.png",
        totalCost: 41865,
        placement: 4, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", note: "Passive averages to +25% Damage." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 25, 
            dotStacks: 1, 
            spaCap: 2, 
            passiveDmg: 45, 
            element: "Water", 
            dotDuration: 5 
        },
        upgrades: [
            { dmg: 85, spa: 7.5, range: 20, cost: 950 },    // Up 0 (Base)
            { dmg: 170, spa: 7.6, range: 20, cost: 1350 },  // Up 1
            { dmg: 245, spa: 7.0, range: 20, cost: 2225 },  // Up 2
            { dmg: 375, spa: 8.5, range: 25, cost: 2650 },  // Up 3
            { dmg: 500, spa: 8.5, range: 25, cost: 3050 },  // Up 4
            { dmg: 635, spa: 8.5, range: 28, cost: 3385 },  // Up 5
            { dmg: 680, spa: 6.5, range: 30, cost: 4235 },  // Up 6 (AoE → Full)
            { dmg: 740, spa: 6.0, range: 30, cost: 4235 },  // Up 7
            { dmg: 865, spa: 6.0, range: 33, cost: 4750 },  // Up 8
            { dmg: 1615, spa: 9.0, range: 40, cost: 6800 }, // Up 9 (AoE → Cone)
            { dmg: 1810, spa: 8.5, range: 45, cost: 8235 }  // Up 10
        ]
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
        stats: { 
            crit: 50, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 3.5, 
            passiveDmg: 225, 
            element: "Water", 
            dotDuration: 0 
        },
        ability: { buffDmg: 50, abilityName: "Primordial Wave", noToggle: true, cooldown: 60, desc: "Water God summons a Primordial Wave down The Path that deals 200% Damage to all Enemies on That Path." },
        passives: [
            { name: "God Of The Seas", desc: "Applies +20% DoT and Affliction Time (+30% at E4). Increases Crit Rate by 5% per attack up to 30% (50% at E2). Performs FuA at cap." },
            { name: "Primordial Power", desc: "Inflicts 'Time Snail' (3s): +20% DoT Duration, 30% Slow, and buffs Water God Damage by 5% per enemy effected (max +50%)." }
        ],
        upgrades: [
            { dmg: 200, spa: 7, range: 22, cost: 1500 },  // Up 0 (Base)
            { dmg: 600, spa: 7, range: 24, cost: 3000 },  // Up 1
            { dmg: 1000, spa: 6.5, range: 25, cost: 5000 },  // Up 2
            { dmg: 1500, spa: 3, range: 28, cost: 7600 },  // Up 3
            { dmg: 1950, spa: 8, range: 28, cost: 10000 }, // Up 4
            { dmg: 2050, spa: 9, range: 25, cost: 13500 }, // Up 5
            { dmg: 2300, spa: 9, range: 26, cost: 15000 }, // Up 6
            { dmg: 2500, spa: 9, range: 30, cost: 17000 }  // Up 7
        ],
        etherealization: [
            "+10 Stat Points (E1)",
            "Crit rate cap increased to 50%\n(God Of The Seas) (E2)",
            "+10 Stat Points (E3)",
            "DoT and Affliction Time increased by 10%\n(God Of The Seas) (E4)",
            "+10 Stat Points (E5)",
            "+75% Damage per placement (E6)",
            "+10 Stat Points (E7)",
            "Final Evolution: God of the Seas (E8)"
        ]
    },
    {
        id: "first_emperor", name: "First Emperor (Greatest)", role: "Specialist / Ground",
        img: "images/units/FirstEmperor.png",
        totalCost: 89500,
        placement: 1, tags: [], placementType: "Ground",
        meta: { short: "Ruler", long: "Ruler", noz: "Attack Form: Demon art : Axe. Ruler is strictly best due to 1 placement count." },
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 120, 
            dotStacks: 1, 
            spaCap: 3, 
            passiveDmg: 0, 
            element: "Rose", 
            dotDuration: 10 
        },
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
                "<span style='display: block; margin-top: 6px;'><b class='mt-text-gold'>Axe:</b> Attacks Slow Enemies by 40% for 5s. Confusion for 3s on first hit.</span>" +
                "<span style='display: block; margin-top: 6px;'><b class='text-accent-start'>Crossbow:</b> +1000% Range, Sets Priority to Strongest. Attacks apply Stun for 2s, but -20% Attack Speed. <span class='text-dim'>[On E6: +30% Damage]</span></span>" +
                "<span style='display: block; margin-top: 6px;'><b class='mt-text-green'>Spear:</b> Attacks get rid of old Bleed and apply new Bleed (100% Damage, 120% on E2) over 10 ticks.</span>" +
                "<span style='display: block; margin-top: 6px;'><b class='text-accent-end'>Armor:</b> Sets Priority to Last and moves to Closest Path point. Confusion for 1.5s (2.5s on E4) to Non-Boss enemies walking into him. <span class='text-dim'>[On E4: deals 50% Damage to confused enemies]</span></span>"
        },
        upgrades: [
            { dmg: 440, spa: 7, range: 25, cost: 3000 },   // Up 0 (Base)
            { dmg: 560, spa: 7, range: 26, cost: 2500 },   // Up 1
            { dmg: 720, spa: 7, range: 26, cost: 3000 },   // Up 2
            { dmg: 905, spa: 7, range: 27, cost: 5000 },   // Up 3
            { dmg: 1155, spa: 7, range: 27, cost: 7500 },  // Up 4
            { dmg: 1690, spa: 7, range: 27, cost: 9500 },  // Up 5
            { dmg: 1600, spa: 7, range: 29, cost: 11000 }, // Up 6
            { dmg: 2000, spa: 7, range: 29, cost: 13000 }, // Up 7
            { dmg: 2600, spa: 7, range: 30, cost: 15000 }, // Up 8
            { dmg: 3200, spa: 7, range: 32, cost: 20000 }  // Up 9 (Unlocks Demon’s Arts)
        ],
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
        stats: { 
            crit: 0, 
            cdmg: 150, 
            dot: 0, 
            dotStacks: 1, 
            spaCap: 4, 
            passiveDmg: 90, 
            passiveSpa: 15, 
            element: "Wind" 
        },
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
        ],
        upgrades: [
            { dmg: 175, spa: 6, range: 22, cost: 1400 },   // Up 0 (Base)
            { dmg: 500, spa: 6, range: 24, cost: 3000 },   // Up 1
            { dmg: 850, spa: 5.5, range: 25, cost: 5000 },  // Up 2
            { dmg: 1100, spa: 7, range: 27, cost: 8000 },   // Up 3
            { dmg: 1350, spa: 6, range: 32, cost: 12000 },  // Up 4
            { dmg: 1450, spa: 9, range: 38, cost: 18000 },  // Up 5
            { dmg: 1850, spa: 9, range: 40, cost: 20000 },  // Up 6
            { dmg: 2200, spa: 9, range: 45, cost: 22000 },  // Up 7
            { dmg: 7500, spa: 10, range: 40, cost: 0, note: "SYNCRO DRIVE (Hybrid)" } // Up 8
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
        ],
        upgrades: [
            { dmg: 310, spa: 8, range: 26, cost: 2750 },   // Up 0
            { dmg: 820, spa: 7.5, range: 31, cost: 5300 }, // Up 1
            { dmg: 1230, spa: 7.5, range: 35, cost: 7700 }, // Up 2
            { dmg: 2945, spa: 10, range: 40, cost: 15000 }, // Up 3
            { dmg: 5875, spa: 15, range: 44, cost: 18900 }, // Up 4
            { dmg: 6200, spa: 14.5, range: 48, cost: 23400 }, // Up 5
            { dmg: 11750, spa: 25, range: 45, cost: 23400, unlocksAbility: true } // Up 6
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
        upgrades: [
            { dmg: 220, spa: 8, range: 23, cost: 2000 },   // Up 0 (Base)
            { dmg: 580, spa: 8, range: 26, cost: 3000 },   // Up 1
            { dmg: 950, spa: 8, range: 29, cost: 9500 },   // Up 2
            { dmg: 1680, spa: 9, range: 32, cost: 12500 }, // Up 3
            { dmg: 2450, spa: 9, range: 35, cost: 18500 }, // Up 4
            { dmg: 3000, spa: 9, range: 40, cost: 23500 }  // Up 5
        ],
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
        meta: { short: "Ruler", long: "Ruler", note: "Manipulator of Fate: +50% Dmg / -25% SPA. Baal's Lightning provides +20% Chain Lightning damage." },
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
            "\"Rukh's Judgement\" Buffs increased by 15% each.",
            "+10 Stat Points"
        ],
        upgrades: [
            { dmg: 280, spa: 10, range: 25, cost: 2800 }, // Up 0
            { dmg: 650, spa: 10, range: 27, cost: 6000 }, // Up 1
            { dmg: 1050, spa: 10, range: 30, cost: 9500 }, // Up 2
            { dmg: 1500, spa: 10, range: 33, cost: 13500 }, // Up 3
            { dmg: 2120, spa: 10, range: 36, cost: 18000 }, // Up 4
            { dmg: 2575, spa: 10, range: 40, cost: 20000 }, // Up 5
            { dmg: 6325, spa: 15, range: 45, cost: 22000 } // Up 6
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
        ],
        upgrades: [
            { dmg: 205, spa: 7, range: 25, cost: 2000 },    // Up 0 (Base)
            { dmg: 570, spa: 6.5, range: 28, cost: 4450 },  // Up 1
            { dmg: 800, spa: 6.5, range: 30, cost: 6750 },  // Up 2
            { dmg: 1325, spa: 9, range: 34, cost: 9560 },   // Up 3
            { dmg: 1900, spa: 8.5, range: 37, cost: 12650 },// Up 4
            { dmg: 2500, spa: 8.5, range: 42, cost: 16000 },// Up 5
            { dmg: 3300, spa: 8, range: 45, cost: 20500 }   // Up 6
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
        upgrades: [
            { dmg: 150, spa: 6, range: 29, cost: 2750 },   // Up 0 (Base)
            { dmg: 400, spa: 6, range: 33, cost: 2700 },   // Up 1
            { dmg: 835, spa: 6, range: 35, cost: 7500 },   // Up 2
            { dmg: 1165, spa: 8, range: 40, cost: 14500 }, // Up 3
            { dmg: 2530, spa: 8, range: 43, cost: 18500 }, // Up 4
            { dmg: 3050, spa: 8, range: 46, cost: 22500 }, // Up 5
        ],
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
        upgrades: [
            { dmg: 280, spa: 8, range: 25, cost: 2300 },   // Up 0 (Base)
            { dmg: 700, spa: 8, range: 28, cost: 5800 },   // Up 1
            { dmg: 1160, spa: 8, range: 32, cost: 9600 },  // Up 2
            { dmg: 1950, spa: 8, range: 34, cost: 11500 }, // Up 3
            { dmg: 3600, spa: 8, range: 40, cost: 15000 }, // Up 4
            { dmg: 5500, spa: 8, range: 45, cost: 22500 }  // Up 5
        ],
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
        upgrades: [
            { dmg: 175, spa: 6, range: 26, cost: 1200 },   // Up 0 (Base)
            { dmg: 400, spa: 6, range: 28, cost: 2000 },   // Up 1
            { dmg: 800, spa: 6, range: 30, cost: 3000 },   // Up 2
            { dmg: 1250, spa: 6, range: 38, cost: 5000 },  // Up 3
            { dmg: 1600, spa: 6, range: 40, cost: 8000 },  // Up 4
            { dmg: 1925, spa: 6, range: 41, cost: 12000 }, // Up 5
            { dmg: 2450, spa: 6, range: 44, cost: 15000 }  // Up 6
        ],
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
        ],
        upgrades: [
            { dmg: 250, spa: 8, range: 30, cost: 2000 }, // Up 0
            { dmg: 600, spa: 8, range: 31, cost: 5000 }, // Up 1
            { dmg: 1150, spa: 8, range: 33, cost: 7500 }, // Up 2
            { dmg: 2000, spa: 8, range: 34, cost: 9500 }, // Up 3
            { dmg: 3800, spa: 8, range: 37, cost: 14000 }, // Up 4
            { dmg: 4300, spa: 8, range: 40, cost: 25000 } // Up 5
        ]
    }
];

const creditsData = [
    { role: "Owner", name: "xKing.", id: "xking.", userId: "347578773857632258", pfp: "images/pfp/xking.png", type: "owner" },
    { role: "Helper", name: "xAuroraFlare", id: "xauroraflare", userId: "216293393888837632", pfp: "images/pfp/xauroraflare.gif", type: "helper" }
];