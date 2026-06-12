const comingSoonData = [
    { type: "Feature", title: "Relic Database", desc: "A dedicated page showing all relic stats, set bonuses, and specific drop locations/obtainable methods." },
];

const patchNotesData = [
    {
        version: "v6.7",
        date: "Jun 11, 2026",
        changes: [
            { type: "Unit", text: "<b>New Unit:</b> Added <b>The Drink Super Rage</b>." },
            { type: "UI", text: "<b>Design Updates:</b> Applied UI design changes for improved layout and readability." },
            { type: "Fix", text: "<b>Loadout Mode:</b> Fixed hotbar trait selection so selecting a trait now updates the unit’s active trait/build." }
        ]
    },
    {
        version: "v6.6",
        date: "Jun 06, 2026",
        changes: [
            { type: "Unit", text: "<b>New Unit:</b> Added <b>Merciless God</b>. A high-cost Hybrid utility unit with 6 adaptable battle modes." },
            { type: "Fix", text: "<b>Follow-Up Attacks:</b> Fixed an issue where the animation lock was not being added to the end of the snapping cycle for Nursefather." },
            { type: "UI", text: "<b>DPS Breakdown:</b> Redesigned the Attack Cycle section to clearly show Damage Multipliers and Speed Penalties." }
        ]
    },
    {
        version: "v6.5",
        date: "Jun 04, 2026",
        changes: [
            { type: "Unit", text: "<b>New Units:</b> Added <b>Angel Born in Hell</b> and <b>Ultimate Fused Warrior</b>." },
            { type: "Item", text: "<b>New Gear:</b> Added the <b>Fused Warrior Set</b> and <b>Fused Earrings</b> head piece." },
            { type: "Fix", text: "<b>Card Sorting:</b> Updated build sorting to correctly prioritize <b>Boss DPS</b> and fixed several consistency issues." },
            { type: "UI", text: "<b>Unit Cards:</b> Redesigned card UI for improved information density and better visual layout." }
        ]
    },
    {
        version: "v6.4",
        date: "Jun 03, 2026",
        changes: [
            { type: "Balance", text: "<b>Relic Main Stats:</b> Dmg main stat increased from <b>60%</b> to <b>70%</b>." },
            { type: "Balance", text: "<b>Relic Main Stats:</b> DoT main stat increased from <b>75%</b> to <b>99%</b>." },
            { type: "Fix", text: "<b>Build Sorting:</b> Fixed several sorting issues across build lists." },
            { type: "Feature", text: "<b>Inventory Mode:</b> Updated unit selection so new units can be chosen in inventory calculations." },
            { type: "Fix", text: "<b>Ant King (Savage):</b> DoT-main relic builds now consider valid sub-stat pairings like <b>Dmg</b> instead of falling back to <b>None</b>." }
        ]
    },
    {
        version: "v6.3",
        date: "May 30, 2026",
        changes: [
            { type: "UI", text: "<b>New Layout:</b> Completely redesigned unit cards and refreshed color palette for better info density." },
            { type: "Feature", text: "<b>Elemental Mask:</b> Added new head piece with custom elemental damage scaling." },
            { type: "Feature", text: "<b>Advanced Sorting:</b> Added sorting by <b>Elemental Type</b> and <b>Main Stat Combinations</b> (e.g., Dmg/SPA) to build lists." }
        ]
    },
    {
        version: "v6.2",
        date: "May 25, 2026",
        changes: [
            { type: "Fix", text: "<b>Inventory Mode:</b> Fixed optimality calculation logic and fully integrated <b>Strongest Swordsman</b>, <b>Marine Hero</b>, and <b>Revolutionary Chief (Syncro)</b>." },
            { type: "Unit", text: "<b>Revolutionary Chief (Syncro):</b> Adjusted DoT logic to account for duration refresh on attack; DPS now reflects 1 continuous tick per second." },
            { type: "Fix", text: "<b>Trait Tier List:</b> Added bug notification for <b>Astral</b> trait (DoT stacking currently non-functional)." }
        ]
    },
    {
        version: "v6.1",
        date: "May 22, 2026",
        changes: [
            { type: "Fix", text: "<b>Triple Threat:</b> Implemented 1.45x Boss Damage hidden passive into calculation engine and added UI notice banner." }
        ]
    },
    {
        version: "v6.0",
        date: "May 19, 2026",
        changes: [
            { type: "Balance", text: "<b>DoT Duration Reduction:</b> Reduced all character DoT durations by 1 tick/second across all modes and passives as a global balance adjustment, since the first tick applies instantly." },
            { type: "Relics", text: "<b>Gluttonous Warlord:</b> Enabled <b>Monarch Cape</b> head piece compatibility, allowing her to combine the Warlord set with Monarch Cape for a dynamic +60% damage buff." },
            { type: "Relics", text: "<b>Triple Threat:</b> Enabled <b>Bijuu Head Piece</b> compatibility, granting a permanent +70% passive damage bonus." },
            { type: "Fix", text: "<b>Mochi Pirate:</b> Fixed bugs by disabling his default 100% base crit rate (set to 0%) and excluding him from the Time Snail relic check. Added a warning notice banner to his unit profile." },
            { type: "Fix", text: "<b>Bio Android (Relic):</b> SPA stat set from -5 to 0 to match in-game behavior as it is currently bugged." },
            { type: "UI", text: "<b>Relic Sets:</b> Added 'Set' suffix to UI rendering for clarity (e.g., Warlord Set, Sorcerer Hunter Set)." },
            { type: "Feature", text: "<b>No Substats Toggle:</b> Added a 'No Substats' mode that recalculates all builds without sub-stat bonuses, showing the best relic setups based on main stats alone." }
        ]
    },
    {
        version: "v5.9",
        date: "May 19, 2026",
        changes: [
            { type: "Unit", text: "<b>New Units:</b> Added <b>Quake Warlord</b> and <b>Gluttonous Warlord</b>." },
            { type: "Feature", text: "<b>Loadout Mode:</b> Added dynamic <b>Trait Selection</b> to customize unit builds and accurately calculate trait-specific DPS." },
            { type: "UI", text: "<b>Modes Overlay:</b> Polished modal layout and fixed charge/system level slider positioning across various unit forms." }
        ]
    },
    {
        version: "v5.8",
        date: "May 18, 2026",
        changes: [
            { type: "Unit", text: "<b>New Units:</b> Added <b>Triple Threat</b>, <b>Joyful Captain</b>, and <b>Mochi Pirate</b>." },
            { type: "Item", text: "<b>New Gear:</b> Added the <b>Warlord</b> Set and <b>Warlord Hat</b>." },
            { type: "UI", text: "<b>UI Rework:</b> Fixed build card display and sorting to dynamically prioritize <b>Boss DPS</b> for boss-centric traits like Duelist." }
        ]
    },
    {
        version: "v5.7",
        date: "May 10, 2026",
        changes: [
            { type: "Synergy", text: "<b>Loadout Logic:</b> Implemented dynamic DoT requirements. Certain modes (like Devil Hunter's 'Devil Sword') now require a specific DoT type (e.g., Bleed) in the team to activate." },
            { type: "Unit", text: "<b>DoT Tagging:</b> Labeled DoT types for <b>Sukuna</b>, <b>Alpha Devil</b>, and <b>Grimjaw</b> (Bleed) to support synergy checks." },
            { type: "UI", text: "<b>Loadout Feedback:</b> Math breakdown now highlights <b>INACTIVE</b> DoTs with a warning if requirements are not met." }
        ]
    },
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
    { unit: "mimicry_sorcerer", img: "images/units/MimicrySorcerer.png", isCalculated: true },
    { unit: "triple_threat", img: "images/units/TripleThreat.png", isCalculated: true },
    { unit: "mochi_pirate", img: "images/units/MochiPirate.png", isCalculated: true },
    { unit: "joyful_captain", img: "images/units/JoyfulCaptain.png", isCalculated: true },
    { unit: "gluttonous_warlord", img: "images/units/GluttonousWarlord.png", isCalculated: true },
    { unit: "quake_warlord", img: "images/units/QuakeWarlord.png", isCalculated: true },
    { unit: "dragon_warlord", img: "images/units/DragonWarlord.png", isCalculated: true },
    { unit: "string_warlord", img: "images/units/StringWarlord.png", isCalculated: true },
    { unit: "shadow_knight", img: "images/units/ShadowKnight.png", isCalculated: true },
    { unit: "revolutionary_chief_syncro", img: "images/units/RevolutionaryChiefSyncro.png", isCalculated: true },
    { unit: "strongest_swordsman_hunter", img: "images/units/StrongestSwordsman.png", isCalculated: true },
    { unit: "pirate_king", img: "images/units/PirateKing.png", isCalculated: true },
    { unit: "marine_hero", img: "images/units/MarineHero.png", isCalculated: true },
    { unit: "sharpshooter_king_trapper", img: "images/units/SharpshooterKingTrapper.png", isCalculated: true },
    { unit: "ultimate_fused_warrior", img: "images/units/UltimateFusedWarrior.png", isCalculated: true },
    { unit: "angel_born_in_hell", img: "images/units/AngelBornInHell.png", isCalculated: true },
    { unit: "nursefather_thumb", img: "images/units/nursefather_thumb.png", isCalculated: true },
    { unit: "merciless_god", img: "images/units/MercilessGod.png", isCalculated: true },
    { unit: "the_drink_super_rage", img: "images/units/TheDrink.png", isCalculated: true }
];
const elementIcons = {
    "Water": "images/elements/Water.png",
    "Fire": "images/elements/Fire.png",
    "Light": "images/elements/Light.png",
    "Dark": "images/elements/Dark.png",
    "Ice": "images/elements/Ice.png",
    "Rose": "images/elements/Rose.png",
    "Wind": "images/elements/Wind.png"
};
const creditsData = [
    { role: "Owner", name: "xKing.", id: "xking.", userId: "347578773857632258", pfp: "images/pfp/xking.png", type: "owner" },
    { role: "Helper", name: "xAuroraFlare", id: "xauroraflare", userId: "216293393888837632", pfp: "images/pfp/xauroraflare.gif", type: "helper" }
];
