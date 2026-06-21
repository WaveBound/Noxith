// Ensure Global Caches and State are initialized
window.unitBuildsCache = window.unitBuildsCache || {};
window.unitActiveBuilds = window.unitActiveBuilds || {};
window.bestHydratedBuildCache = window.bestHydratedBuildCache || {};
window.nextLevelStatsCache = window.nextLevelStatsCache || {};
window.visibleUnitIds = window.visibleUnitIds || new Set();
window.LIVE_SCORE_CACHE = window.LIVE_SCORE_CACHE || {};
window.activeAbilityIds = window.activeAbilityIds || new Set();
window.unitELevels = window.unitELevels || {};
window.unitSystemLevels = window.unitSystemLevels || {};
window.PEAK_MODE_STATE = {
    'the_strongest_in_history': [1, 2],
    'jinoo_shadow_monarch': [0, 1, 2, 3, 4],
    'merciless_god': 5
};
window.unitTraits = window.unitTraits || {};
window.unitHeads = window.unitHeads || {};
window.unitModesState = window.unitModesState || {};
window.inventoryMode = window.inventoryMode || false;

// Bulletproof database key resolution helper to handle Fused Warrior and other ID mismatches
window.getRelicDbEntry = function (db, unitId, activeType) {
    if (!db) return null;

    const state = window.unitModesState[unitId] ?? (window.getUnitById?.(unitId)?.defaultMode ?? 0);
    const modeIdx = Array.isArray(state) ? state[0] : state;
    const modeKey = 'fixed';
    const suffix = activeType === 'abil' ? '_abil' : '';
    const dbKey = unitId + suffix;

    // 1. Direct match
    let entry = db[dbKey] || db[unitId];
    if (entry && entry[modeKey]) {
        const match = entry[modeKey][modeIdx];
        if (match) return match;

        // Optimized multi-mode handling: Only force thread-blocking dynamic calc in Inventory Mode
        // Otherwise fallback to mode 0 from DB to maintain UI fluidness while calculating active form stats in background
        if (window.inventoryMode && window.getUnitById?.(unitId)?.modes) return null;

        return entry[modeKey][0] || null;
    }

    // 2. Fallbacks for Fused Warrior mismatch variations
    if (unitId.includes('fused') || unitId.includes('warrior')) {
        const keys = ['ultimate_fused_warrior', 'fused_warrior', 'ultimate_fused', 'fused_warrior_set', 'fused', 'fused_set'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 3. Fallbacks for Jinwoo / Shadow Monarch mismatch variations
    if (unitId.includes('jinoo') || unitId.includes('monarch') || unitId.includes('sjw')) {
        const keys = ['jinoo_shadow_monarch', 'sjw', 'jinoo'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 4. Fallbacks for Sukuna mismatch variations
    if (unitId.includes('strongest') || unitId.includes('history') || unitId.includes('sukuna')) {
        const keys = ['the_strongest_in_history', 'sukuna', 'strongest_in_history'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 5. Fallbacks for Gojo mismatch variations
    if (unitId.includes('today') || unitId.includes('gojo') || unitId.includes('strongest_of_today')) {
        const keys = ['the_strongest_of_today', 'strongest_of_today', 'gojo'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 6. Fallbacks for Revolutionary Chief mismatch variations
    if (unitId.includes('chief') || unitId.includes('revolutionary')) {
        const keys = ['revolutionary_chief_syncro', 'revolutionary_chief', 'chief'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 7. Fallbacks for Merciless God specific technical IDs
    if (unitId === 'merciless_god' || unitId.includes('merciless_god')) {
        const keys = ['merciless_god', 'merciless_god_syncro'];
        for (const k of keys) {
            const altEntry = db[k + suffix] || db[k];
            if (altEntry && altEntry[modeKey]) return altEntry[modeKey][modeIdx] || altEntry[modeKey][0] || null;
        }
    }

    // 8. CRITICAL FALLBACK: If the buff-specific DB doesn't contain this unit,
    // fall back to the base database instead of returning null (which triggers
    // expensive dynamic calculateUnitBuilds and freezes the UI).
    const baseDb = window.GLOBAL_STATIC_BUILD_DB_BASE;
    if (baseDb && baseDb !== db) {
        const baseEntry = baseDb[dbKey] || baseDb[unitId];
        if (baseEntry && baseEntry[modeKey]) {
            return baseEntry[modeKey][modeIdx] || baseEntry[modeKey][0] || null;
        }
    }

    return null;
};

// Inject global styles for filters to fix the "all white" issue
(function injectStyles() {
    if (document.getElementById('rendering-styles')) return;
    const style = document.createElement('style');
    style.id = 'rendering-styles';
    style.innerHTML = `
        .search-input, .search-select, .sort-select, #unitElementSort, #globalModeSelect, .global-mode-select, select[onchange*="handleGlobalModeSort"], .search-container input, .search-container select {
            background: rgba(10, 10, 16, 0.9) !important;
            color: #f8fafc !important;
            border: 1px solid rgba(139, 92, 246, 0.28) !important;
            border-radius: 4px;
            padding: 3px 6px;
            outline: none;
            color-scheme: dark;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .search-input:focus, .search-select:focus {
            border-color: #a78bfa !important;
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
        }
        .search-select option, #unitElementSort option, #globalModeSelect option {
            background: #0f172a;
            color: #f8fafc;
        }
        .filter-tab-content .search-row { gap: 5px; flex-wrap: wrap; }

        .unit-card {
            position: relative !important;
            overflow: hidden !important;
            min-height: 530px !important;
            border-radius: 20px !important;
            background:
                linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.98) 45%, rgba(2, 6, 23, 0.98)),
                radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), transparent 38%);
            border: 1px solid rgba(148, 163, 184, 0.14) !important;
            box-shadow: 0 22px 55px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
        }
        .unit-card::before {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
                linear-gradient(135deg, rgba(139, 92, 246, 0.12), transparent 34%),
                radial-gradient(circle at 82% 10%, rgba(56, 189, 248, 0.13), transparent 28%);
        }
        .unit-card > * { position: relative; z-index: 1; }
        .unit-card:hover {
            transform: translateY(-5px);
            border-color: rgba(167, 139, 250, 0.55) !important;
            box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55), 0 0 34px rgba(139, 92, 246, 0.16) !important;
        }
        .unit-shell {
            display: flex;
            flex-direction: column;
            min-height: 530px;
        }
        .unit-banner {
            position: relative;
            padding: 8px 12px !important;
            border-radius: 20px 20px 0 0;
            background: linear-gradient(135deg, rgba(88, 28, 135, 0.42), rgba(15, 23, 42, 0.84) 62%, rgba(2, 6, 23, 0.95));
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .unit-banner::after {
            content: '';
            position: absolute;
            inset: auto -18% -55% -18%;
            height: 76px;
            background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2), transparent 68%);
            pointer-events: none;
        }
        .banner-badges {
            position: relative;
            z-index: 1;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            margin-bottom: 0;
            padding-left: 4px;
        }
        .unit-badge-stack {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding-left: 4px;
            transform: translateY(-5px);
        }
        .placement-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 7px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: rgba(248, 250, 252, 0.86);
            font-size: 0.62rem !important;
            font-weight: 800;
            letter-spacing: 0.02em;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .placement-badge.is-hybrid, .placement-badge.is-ground, .placement-badge.is-hill {
            background: rgba(96, 165, 250, 0.12);
            border-color: rgba(96, 165, 250, 0.24);
            color: #bfdbfe;
        }
        .unit-hero {
            position: static;
            z-index: 1;
            display: grid;
            grid-template-columns: minmax(92px, 0.55fr) 62px minmax(0, 2.45fr);
            align-items: center;
            gap: 8px;
        }
        .unit-badge-stack {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .unit-image-frame {
            position: relative;
            justify-self: center;
            width: 62px;
            height: 62px;
            padding: 3px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(56, 189, 248, 0.48));
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.38);
        }
        .unit-img-wrapper,
        .unit-image-frame > img,
        .unit-image-frame .unit-img-wrapper {
            width: 100%;
            height: 100%;
            display: block;
            overflow: hidden;
        }
        .unit-img-wrapper {
            position: relative;
            border-radius: 13px;
            background: rgba(2, 6, 23, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .unit-avatar,
        .unit-img-wrapper > img {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            object-fit: cover !important;
        }
        .element-icon,
        .unit-img-wrapper .element-icon {
            position: absolute !important;
            right: -5px !important;
            bottom: -5px !important;
            z-index: 2;
            width: 26px !important;
            height: 26px !important;
            border-radius: 999px;
            background: rgba(2, 6, 23, 0.94);
            border: 2px solid rgba(255, 255, 255, 0.38);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.42);
        }
        .unit-title { min-width: 0; min-height: 72px; text-align: left; display: flex; flex-direction: row; align-items: flex-end; justify-content: space-between; padding: 10px 0; position: relative; gap: 6px; }
        .unit-title-text { min-width: 0; flex: 1; padding-right: 0; }
        .unit-title h2 {
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 0.96rem !important;
            line-height: 1.1;
            color: #f8fafc;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
            letter-spacing: -0.02em;
        }
        .unit-title span {
            display: block;
            margin-top: 4px;
            color: rgba(226, 232, 240, 0.72);
            font-size: 0.72rem;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .unit-title small {
            display: block;
            margin-top: 2px;
            color: rgba(148, 163, 184, 0.72);
            font-size: 0.62rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .trait-guide-btn {
            position: static !important;
            align-self: flex-end !important;
            flex-shrink: 0;
            z-index: 4;
            width: max-content !important;
            max-width: 115px !important;
            height: 22px !important;
            padding: 1px 5px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            box-sizing: border-box !important;
            border-radius: 50px;
            border: 1px solid rgba(129, 140, 248, 0.35);
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.22), rgba(168, 85, 247, 0.16));
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
        }
        .trait-guide-btn:hover {
            border-color: rgba(167, 139, 250, 0.6) !important;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.32), rgba(168, 85, 247, 0.24)) !important;
        }

        .top-builds-list { max-height: 360px !important; }
        .combo-section-header { 
            background: #16161d !important; color: #c084fc; font-size: 0.65rem; font-weight: 900; 
            padding: 4px 10px; margin: 10px 0 5px; border-radius: 4px; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.03); }
        
        .fs-comparison-grid {
            display: grid !important;
            grid-template-columns: 1.8fr 1fr !important;
            gap: 12px !important;
            padding: 12px 14px !important;
            background: #0d0d12 !important;
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            border-radius: 10px !important;
            margin: 0 !important;
            box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.4) !important;
        }
        .fs-stats-subgrid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px 8px !important;
            align-content: center !important;
        }

        /* Removing gradients from card internal boxes */
        .br-col, .br-res-col, .br-full-stats { background: none !important; background-image: none !important; border: none !important; }
        
        .fs-eff-summary {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            background: none !important;
            border: none !important;
            border-left: 1px solid rgba(255, 255, 255, 0.06) !important;
            border-radius: 0 !important;
            padding: 0 !important;
            padding-left: 12px !important;
            margin: 0 !important;
            box-shadow: none !important;
            gap: 6px !important;
        }
        .fs-eff-summary .eff-label {
            font-size: 0.55rem !important;
            font-weight: 800 !important;
            color: #94a3b8 !important;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
            opacity: 0.8;
            text-align: center;
        }
        .fs-eff-summary .eff-divider {
            width: 70%;
            height: 1px;
            background: rgba(255, 255, 255, 0.06);
            margin: 4px 0;
        }
        .fs-eff-summary .eff-val {
            font-size: 1.45rem !important;
            font-weight: 900 !important;
            color: #4ade80 !important;
            text-shadow: 0 0 12px rgba(74, 222, 128, 0.35) !important;
            line-height: 1.1;
        }

        /* Sub Row (Crit %, CDmg, etc.) - Seperate standalone blocks */
        .fs-sub-row {
            display: flex !important;
            justify-content: space-between !important;
            gap: 8px !important;
            padding: 0 !important;
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            margin: 8px 0 0 0 !important;
        }
        .fs-sub-row .fs-item-sm {
            flex: 1 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: #0d0d12 !important;
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            border-radius: 8px !important;
            padding: 6px 12px !important;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2) !important;
        }

        .fs-item-lg {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #121217 !important; /* Keeps the target panel lighter */
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            border-radius: 8px;
            padding: 3px 8px;
            min-width: 0;
            transition: background 0.2s;
        }
        .fs-item-lg.is-maxed {
            border-color: rgba(74, 222, 128, 0.2) !important;
            background: rgba(74, 222, 128, 0.02) !important;
        }
        .fs-item-lg.is-maxed .val-maxed {
            color: #4ade80 !important;
            font-weight: bold !important;
        }
        .br-col-header {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
        }

        /* MAIN STATS & SUB STATS Card Enclosures */
        .br-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important; /* Main and Sub take exactly 50% / 50% each */
            gap: 12px !important;
            padding: 4px 10px !important;
        }
        .br-grid.no-subs {
            grid-template-columns: 1fr !important;
        }
        .br-col.main, .br-col.sub {
            background: #0d0d12 !important;
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            border-radius: 10px !important;
            padding: 6px 8px !important; /* Tightened container padding */
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important; /* Tightened vertical gap between items */
            border-right: none !important;
        }
        .br-col-title {
            font-size: 0.65rem !important;
            color: #94a3b8 !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            text-align: center !important;
            margin-bottom: 4px !important;
        }
        .br-col .stat-line {
            display: flex !important;
            justify-content: flex-start !important; /* Align everything cleanly to the left */
            align-items: center !important;
            background: rgba(255, 255, 255, 0.02) !important;
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            border-radius: 6px !important;
            padding: 3px 6px !important; /* Tightened internal padding to make containers hug badges snugly */
            width: 100% !important;
            box-sizing: border-box !important;
            gap: 6px !important;
        }
        .br-col.main .stat-line .sl-label {
            background: none !important;
            border: none !important;
            color: #94a3b8 !important;
            font-size: 0.65rem !important;
            font-weight: 800 !important;
            padding: 0 !important;
            min-width: 32px !important;
            display: inline-block !important;
            text-align: left !important;
        }
        .br-col.sub .sl-label {
            display: none !important; /* Completely hides HEAD, BODY, LEGS in the sub-stat panel */
        }

        .br-set-info-text {
            cursor: pointer !important;
            transition: opacity 0.15s ease;
        }
        .br-set-info-text:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
        .unit-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(13, 13, 20, 0.82);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ut-actions {
            display: flex;
            flex-wrap: nowrap;
            gap: 5px;
            min-width: 0;
            align-items: center;
            transform: translateX(-5px);
        }
        .calc-btn {
            height: 24px !important;
            padding: 0 7px !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0 !important;
            text-align: center;
            line-height: 1 !important;
        }
        .calc-btn > svg {
            flex: 0 0 13px !important;
            flex-shrink: 0;
            width: 13px !important;
            height: 13px !important;
            margin-right: 2px !important;
            transform: translate(-1px, -1px) !important;
            vertical-align: middle !important;
        }
        .calc-btn .btn-label {
            flex: 0 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
            line-height: 1 !important;
            vertical-align: middle !important;
        }
        .ut-btn-compact {
            height: 24px !important;
            border-radius: 999px !important;
            padding: 0 7px !important;
            font-size: 0.58rem !important;
            letter-spacing: 0.03em;
            flex: 0 0 auto;
            box-sizing: border-box !important;
            min-width: 0;
            background: transparent !important;
            border-color: rgba(255, 255, 255, 0.23) !important;
            border-width: 1px !important;
            box-shadow: none !important;
            color: inherit !important;
        }
        .ut-btn-compact:hover {
            background: rgba(255, 255, 255, 0.04) !important;
            border-color: rgba(255, 255, 255, 0.32) !important;
            box-shadow: none !important;
        }
        .ut-btn-compact svg {
            width: 13px !important;
            height: 13px !important;
            flex-shrink: 0;
            margin: -1px 2px -1px -1px !important;
            vertical-align: middle !important;
        }
        .ut-toggle-area {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px; /* Reduced gap from 8px to 4px to maintain compact layout consistency */
            margin-left: auto;
            flex-wrap: wrap;
        }
        .search-container {
            padding: 6px 10px;
            background: rgba(13, 13, 20, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .search-row {
            display: flex;
            gap: 5px;
            align-items: center;
        }
        .filter-tab-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 5px;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .filter-tab-content .search-row {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 5px;
        }
        @media (max-width: 768px) {
            /* Stack main and sub stats vertically at full width on mobile screens */
            .br-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
            }
            .br-col.main, .br-col.sub {
                display: flex !important;
                width: 100% !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

/**
 * Requirement: Dynamic card count to ensure exactly 2 rows regardless of resolution.
 */
window.getUnitsPerPage = () => {
    const w = window.innerWidth;
    // Sidebar width is 260px. Grid padding is 20px on each side (40px total).
    const sidebarWidth = w > 768 ? 260 : 0;
    const gridPadding = 40;
    const availableWidth = w - sidebarWidth - gridPadding;

    // Matches CSS: minmax(380px, 1fr) with an 18px gap.
    const minCardWidth = 380;
    const gap = 18;

    const columns = Math.floor((availableWidth + gap) / (minCardWidth + gap));
    return Math.max(1, columns) * 2; // Always returns exactly 2 rows worth of units
};

// Constants & Configurations
const HEADS_LIST = ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut', 'ultiorras_wings', 'berserks_cleave', 'panther_claws', 'fused_earrings', 'koyotes_sword'];

const HEAD_CONFIG = {
    sun_god: { name: 'Sun God', search: 'Sun God', cls: 'sungod' },
    ninja: { name: 'Junior Ninja', search: 'Junior Ninja', cls: 'ninja' },
    reaper_necklace: { name: 'Reaper', search: 'Reaper', cls: 'reaper' },
    shadow_reaper_necklace: { name: 'S. Reaper', search: 'Shadow Reaper', cls: 'sreaper' },
    junior: { name: 'Junior Ninja', search: 'Junior', cls: 'ninja' },
    biju_head: { name: 'Biju', search: 'Biju', cls: 'sungod' },
    reanimated_head: { name: 'Reanimated', search: 'Reanimated', cls: 'reaper' },
    bloodline_head: { name: 'Bloodline', search: 'Bloodline', cls: 'ninja' },
    sorcerer_hunter_spirit: { name: 'S.H. Spirit', search: 'S. Hunter', cls: 'custom' },
    strongest_sorcerer_glasses: { name: 'Strongest', search: 'Strongest', cls: 'custom' },
    monarch: { name: 'Monarch Cape', search: 'Monarch', cls: 'custom' },
    warlord_hat: { name: 'Warlord Hat', search: 'Warlord', cls: 'custom' },
    mochi_scarf: { name: 'Mochi Scarf', search: 'Scarf', cls: 'custom' },
    flaming_donut: { name: 'Flaming Donut', search: 'Donut', cls: 'custom' },
    ultiorras_wings: { name: "Ultiorra's Wings", search: 'Ultiorra Wings', cls: 'custom' },
    berserks_cleave: { name: "Berserk's Cleave", search: 'Berserk Cleave', cls: 'custom' },
    panther_claws: { name: 'Panther Claws', search: 'Panther Claws', cls: 'custom' },
    fused_earrings: { name: 'Fused Earrings', search: 'Earrings', cls: 'custom' },
    koyotes_sword: { name: "Koyote's Sword", search: "Koyote Sword", cls: 'custom' }
};

const COMBO_TITLES = {
    'dmg_dmg': 'Dmg / Dmg',
    'dmg_cf': 'Dmg / Crate',
    'dmg_spa': 'Dmg / Spa',
    'cm_dmg': 'CDmg / Dmg',
    'cm_cf': 'CDmg / Crate',
    'cm_spa': 'CDmg / Spa',
    'dot_dmg': 'DoT / Dmg',
    'dot_spa': 'DoT / Spa',
    'dot_cf': 'DoT / Crate'
};

const TOGGLE_OVERRIDES = {
    phantom_captain: { label: 'Planes' },
    megumin: { label: 'Passive' },
    vegeta: { label: 'Boss Stacks' },
    nutaru_beast: { label: 'Beast Mode' },
    ancient_shinob: { label: 'Reanimation' },
    super_roku: { label: 'Same Enemy' },
    marine_hero: { label: 'Boss' },
    cell: {
        dynamicLabel: (isChecked) => isChecked ? 'Perfect Form' : 'True Form',
        script: `this.parentElement.previousElementSibling.innerText = this.checked ? 'Perfect Form' : 'True Form'; this.closest('.unit-toolbar').firstElementChild.style.gap = '2px';`
    }
};

const SVGS = {
    dmg: `<svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg>`,
    spa: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg>`,
    range: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
    custom: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #06b6d4;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
    traits: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #a78bfa;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    info: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #0ea5e9;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
};

const unitControls = {};

// Extraction and Calculation Helpers
const getUnitControlsHtml = (unit) => {
    const fileKey = window.getFileName(unit.id);
    return unitControls[fileKey] ? unitControls[fileKey](unit) : '';
};

const createBaseUnitCard = (unit, options = {}) => {
    const { id = '', additionalClasses = '', bannerContent = '', topControls = '', bottomControls = '', mainContent = '' } = options;
    const card = document.createElement('div');
    card.className = `unit-card ${additionalClasses}`;
    if (id) card.id = id;
    card.innerHTML = `<div class="unit-shell"><div class="unit-banner">${bannerContent}</div>${topControls}${getUnitControlsHtml(unit)}${bottomControls}${mainContent}</div>`;
    return card;
};

function getUnitCostAndPlacement(unit, activeModeIdx) {
    const idx = Array.isArray(activeModeIdx) ? activeModeIdx[0] : activeModeIdx;
    const modeObj = unit?.modes?.[idx] || null;
    const upgradesArr = (modeObj?.upgrades?.length > 0) ? modeObj.upgrades : (unit?.upgrades?.length > 0 ? unit.upgrades : null);
    let unitCost = modeObj ? (modeObj.totalCost || unit?.totalCost || 50000) : (unit?.totalCost || 50000);

    if (upgradesArr) {
        const currentUpgrade = window.unitELevels[unit.id] || 0;
        let cumulative = upgradesArr[0].cost || 0;
        if (currentUpgrade > 0) {
            for (let i = 1; i <= currentUpgrade; i++) {
                if (upgradesArr[i]?.cost) cumulative += upgradesArr[i].cost;
            }
            unitCost = cumulative;
        } else {
            unitCost = cumulative;
        }
    }

    let unitPlace = modeObj?.limitPlace || unit?.placement || 1;
    if (isUnit(unit?.id, 'water_god')) {
        const hbStats = (typeof getCachedHotbarStats === 'function') ? getCachedHotbarStats() : null;
        if (hbStats?.ugPresent) unitPlace = Math.max(1, unitPlace - 1);
    }
    return { unitCost, unitPlace, upgradesArr };
}

function calculateBuildEfficiency(build, unitCost, unitMaxPlacement, unitId) {
    const foundTrait = getTraitByName(build.traitName, unitId);
    const unitObj = window.getUnitById(unitId);
    let traitLimit = build.traitName?.includes('Ruler') ? 1 : foundTrait?.limitPlace || null;

    const abilityRef = Array.isArray(unitObj?.ability) ? unitObj.ability[0] : unitObj?.ability;
    if (build.id?.includes('ABILITY') && abilityRef?.limitPlace) {
        traitLimit = traitLimit ? Math.min(traitLimit, abilityRef.limitPlace) : abilityRef.limitPlace;
    }

    const actualPlacement = traitLimit ? Math.min(unitMaxPlacement, traitLimit) : unitMaxPlacement;
    const costMult = foundTrait?.costReduction ? Math.max(0, 1 - (foundTrait.costReduction / 100)) : 1;
    const actualTotalCost = unitCost * actualPlacement * costMult;
    return actualTotalCost === 0 ? 0 : (build.dps / actualTotalCost);
}

function getPreferredModeIdx(unitId, unitObj) {
    const explicitState = window.unitModesState?.[unitId];
    if (explicitState !== undefined) {
        return Array.isArray(explicitState) ? explicitState[0] : explicitState;
    }

    const activeBuildMode = window.unitActiveBuilds?.[unitId]?.activeModeIdx;
    if (activeBuildMode !== undefined) {
        return activeBuildMode;
    }

    if (unitObj?.defaultMode !== undefined && unitObj?.defaultMode !== null) {
        return unitObj.defaultMode;
    }

    const peakMode = window.PEAK_MODE_STATE?.[unitId];
    if (peakMode !== undefined) {
        return Array.isArray(peakMode) ? peakMode[0] : peakMode;
    }

    return 0;
}

function getHeadBadgeHtml(headUsed) {
    if (!headUsed || headUsed === 'none') return '';

    const h = HEAD_CONFIG[headUsed] || { name: 'Unknown', cls: 'custom' };
    const label = "Elemental";
    const val = "30%";
    const color = "#f97316";

    return `<div class="stat-line"><span class="sl-label">HEAD</span>
                <div class="badge-base" style="border-color: ${color}66;" title="${h.name}">
                    <span style="color: ${color};">${label}</span><span class="badge-val val-main" style="color: white !important;">${val}</span>
                </div>
            </div>`;
}

function getSynergyBadgeHtml(unit, activeMode) {
    if (window.CALCULATION_MODE !== 'loadout') return '';
    const modeStats = unit.modes?.[activeMode] || {};
    const requiresDot = modeStats.requiresDot || unit.stats?.requiresDot;
    if (!requiresDot) return '';

    const hotbar = window.hotbarState;
    const met = hotbar?.slots?.some(s => {
        if (!s || s.id.split('-')[0] === unit.id) return false;
        const sUnit = window.getUnitById(s.id);
        if (!sUnit) return false;
        if (sUnit.stats && (sUnit.stats.dotType === requiresDot && sUnit.stats.dot > 0 || (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === requiresDot))) return true;
        const sMode = window.unitModesState?.[sUnit.id] || 0;
        if (sUnit.modes?.[sMode]) {
            const m = sUnit.modes[sMode];
            if (m.dotType === requiresDot && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotType === requiresDot))) return true;
        }
        return false;
    });

    return met
        ? `<div class="placement-badge synergy-dot-badge sync-active" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.08); font-weight: 900;">🔗 SYNCED: ${requiresDot.toUpperCase()}</div>`
        : `<div class="placement-badge synergy-dot-badge" style="color: #71717a; border-color: rgba(113, 113, 122, 0.3); background: rgba(0,0,0,0.2); font-weight: 700; opacity: 0.6;">⛓ REQUIRED: ${requiresDot.toUpperCase()}</div>`;
}

function getSubstatDetailHtml(build) {
    const subs = build?.subStats || {};
    const statLabel = (key) => {
        const labels = { dmg: 'Damage', spa: 'SPA', cm: 'Crit Dmg', cf: 'Crit Rate', dot: 'Dot', range: 'Range' };
        return labels[key] || key;
    };
    const pieceRows = ['head', 'body', 'legs'].map(piece => {
        const entries = Array.isArray(subs[piece]) ? subs[piece].filter(item => item && item.type) : [];
        const totalByStat = {};
        entries.forEach(item => {
            totalByStat[item.type] = (totalByStat[item.type] || 0) + (Number(item.val) || 0);
        });
        const badgeHtml = entries.length ? entries.map(item => {
            const val = Number(item.val) || 0;
            return `<span class="stat-badge ${item.type}" style="font-size:0.72rem;padding:4px 7px;">${statLabel(item.type)} ${val.toFixed(1)}%</span>`;
        }).join('') : `<span style="color:#64748b;font-size:0.72rem;">No substats</span>`;
        return `<div style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px;background:rgba(255,255,255,0.02);margin-bottom:8px;">
            <div style="font-weight:800;text-transform:uppercase;font-size:0.7rem;color:#94a3b8;margin-bottom:6px;">${piece.toUpperCase()}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">${badgeHtml}</div>
            ${Object.entries(totalByStat).length ? `<div style="margin-top:8px;font-size:0.72rem;color:#cbd5e1;">Totals: ${Object.entries(totalByStat).map(([k, v]) => `${statLabel(k)} ${Number(v).toFixed(1)}%`).join(' · ')}</div>` : ''}
        </div>`;
    }).join('');
    return `<div style="font-size:0.78rem;line-height:1.45;">${pieceRows}</div>`;
}

window.showSubstatDetails = function (buildId) {
    const build = window.cachedResults?.[buildId] || window.staticBuildDb?.find?.(b => b.id === buildId);
    if (!build) return;
    window.showUniversalModal({
        title: 'SUBSTAT DETAILS',
        content: getSubstatDetailHtml(build),
        size: 'modal-sm'
    });
};

function sortNumber(value, fallback = 0) {
    const n = Number(value ?? fallback ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function getFinalDpsScore(build) {
    if (!build) return 0;

    const displayedDps = Math.max(
        sortNumber(build.sortDps),
        sortNumber(build.dps),
        sortNumber(build.bossDps),
        sortNumber(build.bd),
        sortNumber(build.bossTotal),
        sortNumber(build.boss_total)
    );

    if (displayedDps > 0) return displayedDps;

    return Math.max(
        sortNumber(build.total),
        sortNumber(build.finalDps),
        sortNumber(build.d)
    );
}

function getRuntimeEffectiveCritCap(unit, critData, headUsed = 'none') {
    if (isUnit(unit?.id, 'pirate_king')) return 40;
    if (headUsed === 'sorcerer_hunter_spirit') return 0;
    if (isUnit(unit?.id, 'angel_born_in_hell') || isUnit(unit?.id, 'the_strongest_of_today') || isUnit(unit?.id, 'strongest_of_today')) return 50;
    if (isUnit(unit?.id, 'kirito')) return unit?.stats?.crit || 0;
    return 100;
}

function hasCritRateSubstats(subStats) {
    if (!subStats) return false;
    return ['head', 'body', 'legs'].some(piece => (subStats[piece] || []).some(sub => sub.type === 'cf'));
}

function stripCritRateSubstats(subStats) {
    if (!subStats) return {};
    const stripped = { ...subStats };
    ['head', 'body', 'legs'].forEach(piece => {
        const list = (stripped[piece] || []).filter(sub => sub.type !== 'cf');
        if (list.length) stripped[piece] = list;
        else delete stripped[piece];
    });
    return stripped;
}

function hydrateBuildEntry(r, unitId, isHotbar, activeModeIdx = undefined) {
    if (!r) return null;

    if (activeModeIdx === undefined) {
        const state = window.unitModesState[unitId] ?? (window.getUnitById?.(unitId)?.defaultMode ?? 0);
        activeModeIdx = Array.isArray(state) ? state[0] : state;
    }

    let res = (r.id && r.mainStats && r.setName) ? { ...r } : {
        id: r.id || `${unitId}-static-${Math.random().toString(36).substr(2, 9)}`,
        traitName: (typeof r.t === 'number' ? (traitsList[r.t]?.name) : (r.traitName || r.t)) || 'Unknown Trait',
        setName: (typeof r.s === 'number' ? (SETS[r.s]?.name) : (r.setName || r.s)) || 'Unknown Set', // Set name is needed for display
        prio: r.p || r.prio || 'dmg',
        headUsed: (typeof r.h === 'number' ? HEADS_LIST[r.h] : (r.headUsed || r.h)) || 'none',
        isCustom: !!(r.c || r.isCustom),
        subStats: r.ss || r.subStats || {},
        mainStats: r.ms || r.mainStats || {
            body: typeof r.b === 'string' ? r.b : (r.b === 1 ? 'dot' : (r.b === 2 ? 'cm' : 'dmg')),
            legs: typeof r.l === 'string' ? r.l : (r.l === 1 ? 'spa' : (r.l === 2 ? 'cf' : 'dmg'))
        }
    };
    // Initialize calculated stats to 0, they will be filled by reconstructMathData
    res.dps = 0;
    res.bossDps = 0;
    res.dmgVal = 0;
    res.spa = 0;
    res.range = 0;
    res.activeModeIdx = activeModeIdx;

    if (typeof reconstructMathData === 'function') {
        try {
            const fullMath = reconstructMathData(res, undefined, { isHotbar: isHotbar, activeModeIdx: activeModeIdx });
            if (fullMath) {
                const sanitizerUnit = window.getUnitById(unitId);
                const ctxOverrides = { isHotbar: isHotbar, activeModeIdx: activeModeIdx };
                if (hasCritRateSubstats(res.subStats) && fullMath.critData) {
                    const strippedSubStats = stripCritRateSubstats(res.subStats);
                    const strippedRes = { ...res, subStats: strippedSubStats };
                    const strippedMath = reconstructMathData(strippedRes, undefined, ctxOverrides);
                    if (strippedMath?.critData) {
                        const cap = getRuntimeEffectiveCritCap(sanitizerUnit, strippedMath.critData, strippedRes.headUsed || 'none');
                        const strippedRate = strippedMath.critData.rate ?? 0;
                        const strippedRaw = strippedMath.critData.rawRate ?? 0;
                        const fixedCritUnit = isUnit(sanitizerUnit?.id, 'pirate_king');
                        if (fixedCritUnit || strippedRate >= cap || strippedRaw >= cap) {
                            res = strippedRes;
                            fullMath = strippedMath;
                            window.cachedResults[res.id] = fullMath;
                            fullMath.id = res.id;
                        }
                    }
                }

                window.cachedResults[res.id] = fullMath;
                fullMath.id = res.id;

                res.dps = fullMath.total || fullMath.dps || 0;
                res.bossDps = fullMath.bossTotal || fullMath.bossDps || 0;
                res.dmgVal = fullMath.dmgVal;
                res.spa = fullMath.spa;
                res.range = fullMath.range;
                res.dot = fullMath.dot;
                res.dotTotal = fullMath.dotData ? (
                    (fullMath.dotData.nativeTotalDmg || 0) +
                    (fullMath.dotData.radTotalDmg || 0) +
                    (fullMath.dotData.fuaDotTotalDmg || 0) +
                    (fullMath.dotData.scarfBurnTotalDmg || 0)
                ) : 0;
                res.placement = fullMath.placement;
                res.detailedBuffs = fullMath.detailedBuffs;
                res.critData = fullMath.critData;
                res.appliedDebuffs = fullMath.appliedDebuffs;

                // --- Apply clamping and sanity checks after full math calculation ---
                // 1. Clamp Crit Rate to 100%
                if (res.critData && res.critData.rawRate > 100) {
                    res.critData.rawRate = 100;
                    // Re-calculate avgMult if rate was clamped
                    res.critData.avgMult = 1 + (res.critData.rawRate / 100) * (res.critData.cdmg / 100);
                }

                // 2. Ensure SPA is not negative or excessively low (clamp to unit's cap or a minimum positive value)
                const unit = window.getUnitById(unitId);
                const unitSpaCap = fullMath.spaCap || unit?.stats?.spaCap || 0.1; // Use fullMath.spaCap if available, else unit.stats.spaCap, else 0.1
                if (res.spa < unitSpaCap) {
                    res.spa = unitSpaCap;
                }

                // 3. Ensure DPS values are not negative
                if (res.dps < 0) res.dps = 0;
                if (res.bossDps < 0) res.bossDps = 0;
                if (res.dmgVal < 0) res.dmgVal = 0;

                res.appliedDebuffs = fullMath.appliedDebuffs;
                if (!res.subStats) res.subStats = {};
                res.subStats.finalCf = fullMath.critData ? fullMath.critData.rawRate : 0;
                res.subStats.finalCm = fullMath.critData ? fullMath.critData.cdmg : 0;
            }
        } catch (e) {
            console.warn("Hydration Math Error for", res.id, e);
        }
    }
    res.bossDps = res.bossDps || res.bd || res.bossTotal || 0;
    res.dps = res.dps || res.d || 0;
    res.sortDps = Math.max(res.dps || 0, res.bossDps || 0);
    return res;
}

function getBuildSortScore(build) {
    return getFinalDpsScore(build);
}

function getBestHydratedBuild(builds, unitId, isHotbar, activeModeIdx = undefined, candidateLimit = Infinity) {
    if (activeModeIdx === undefined) {
        const state = window.unitModesState[unitId] ?? (window.getUnitById?.(unitId)?.defaultMode ?? 0);
        activeModeIdx = Array.isArray(state) ? state[0] : state;
    }

    const globalSortMode = document.querySelector('.search-container select[data-filter="sort"]')?.value || 'dps';

    let limit = Math.min(builds?.length || 0, candidateLimit);
    if (isHotbar && Number.isFinite(candidateLimit)) {
        limit = Math.min(limit, candidateLimit);
    }

    const rankedCandidates = [...(builds || [])]
        .map(build => ({ build, rawScore: getBuildSortScore(build, globalSortMode) }))
        .sort((a, b) => {
            if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;

            const setB = (b.build.setName || b.build.s || '').toString().toLowerCase();
            const setA = (a.build.setName || a.build.s || '').toString().toLowerCase();
            const isEndgameB = setB.includes('warlord') || setB.includes('monarch') || setB.includes('fused');
            const isEndgameA = setA.includes('warlord') || setA.includes('monarch') || setA.includes('fused');
            if (isEndgameB !== isEndgameA) return isEndgameB ? -1 : 1;
            return 0;
        });

    const ids = rankedCandidates.slice(0, limit).map(item => item.build?.id || `${item.build?.t || item.build?.traitName || ''}:${item.build?.s || item.build?.setName || ''}:${item.build?.h || item.build?.headUsed || ''}:${item.build?.b || item.build?.mainStats?.body || ''}:${item.build?.l || item.build?.mainStats?.legs || ''}`).join('|');
    const cacheKey = `${unitId}:${isHotbar ? 1 : 0}:${activeModeIdx}:${ids}`;
    if (window.bestHydratedBuildCache?.[cacheKey]) return window.bestHydratedBuildCache[cacheKey];

    const HYDRATION_CHUNK_SIZE = 64;
    let best = null;
    let bestScore = -1;
    let evaluated = 0;

    while (evaluated < rankedCandidates.length) {
        const chunk = rankedCandidates.slice(evaluated, Math.min(evaluated + HYDRATION_CHUNK_SIZE, rankedCandidates.length));
        const hydrated = chunk.map(item => hydrateBuildEntry(item.build, unitId, isHotbar, activeModeIdx)).filter(Boolean);

        for (const cur of hydrated) {
            const score = getBuildSortScore(cur, globalSortMode);
            if (score > bestScore) {
                bestScore = score;
                best = cur;
            }
        }

        evaluated += chunk.length;
        const nextRawScore = rankedCandidates[evaluated]?.rawScore ?? -1;
        if (bestScore >= nextRawScore) break;
    }

    if (!best) return null;
    window.bestHydratedBuildCache[cacheKey] = best;
    return best;
}

// Rendering HTML Rows & Cards
function generateBuildRowHTML(r, i, unitConfig = {}) {
    const { totalCost = 50000, placement = 1, sortMode = 'dps', unitId = '', traitBenchmarks = {}, optimalityBenchmarks = {} } = unitConfig;
    const currentLevel = window.unitELevels[unitId] || 0;
    const nextLevel = currentLevel + 1;
    const unitObj = window.getUnitById(unitId);
    const maxLevel = unitObj?.upgrades ? unitObj.upgrades.length - 1 : 0;
    let nextStats = { dmgVal: 0, spa: 0, range: 0 };

    const optimalityKey = `${r.traitName || ''}|${r.prio || 'default'}|${r.mainStats?.body || ''}_${r.mainStats?.legs || ''}`;
    const benchmarkDps = (window.inventoryMode && optimalityBenchmarks[optimalityKey])
        ? optimalityBenchmarks[optimalityKey]
        : (traitBenchmarks[r.traitName] || traitBenchmarks['peak'] || 0);

    if (nextLevel <= maxLevel) {
        const nextCacheKey = `${unitId}:${r.id || r.traitName}:${nextLevel}`;
        nextStats = window.nextLevelStatsCache[nextCacheKey] || nextStats;
        if (!window.nextLevelStatsCache[nextCacheKey]) {
            try {
                const nextMath = reconstructMathData(r, nextLevel);
                if (nextMath) {
                    nextStats = { dmgVal: nextMath.dmgVal, spa: nextMath.spa, range: nextMath.range };
                    window.nextLevelStatsCache[nextCacheKey] = nextStats;
                }
            } catch (e) { console.warn("Next Stats Error", e); }
        }
    }

    const rankClass = `${i < 3 ? `rank-${i + 1}` : 'rank-other'}${r.isCustom ? ' is-custom' : ''}`;
    const effScore = calculateBuildEfficiency(r, totalCost, placement, unitId).toFixed(3);

    let optimalityHtml = '';
    if (window.inventoryMode && benchmarkDps > 0) {
        const optPct = (r.dps / benchmarkDps) * 100;
        const color = optPct >= 95 ? '#00ffaa' : (optPct >= 80 ? '#ffcc00' : '#ff4d4d');
        const glow = `rgba(${optPct >= 95 ? '0, 255, 170' : (optPct >= 80 ? '255, 204, 0' : '255, 77, 77')}, 0.15)`;
        optimalityHtml = `<div class="optimality-badge" style="color: ${color}; border-color: ${color}33; --glow-color: ${glow}; flex-direction: row; justify-content: center; gap: 6px; width: auto; min-width: 112px; box-sizing: border-box; padding: 2px 8px; cursor: default;"><span class="opt-label" style="color: ${color}; margin-bottom: 0;">OPTIMALITY</span><span class="opt-pct">${fix1(optPct)}%</span></div>`;
    }

    const prioConfig = { spa: { label: 'SPA<br>STAT', cls: 'prio-spa' }, default: { label: 'DMG<br>STAT', cls: 'prio-dmg' } };
    let prioHtml = '';
    if (r.relicIds) {
        const hId = r.relicIds.head || 'none', bId = r.relicIds.body || 'none-b', lId = r.relicIds.legs || 'none-l';
        const pCfg = prioConfig[r.prio || 'default'] || prioConfig.default;
        prioHtml = `<div class="br-badges">
            <button class="prio-badge prio-inv clickable" onclick="viewInventoryItems('${hId}', '${bId}', '${lId}')" title="Locate in Inventory"><img src="https://img.icons8.com/fluency-systems-filled/48/ffffff/backpack.png" alt="Inv"></button>
            ${unitId === 'joyful_captain' ? '' : `<span class="prio-badge ${pCfg.cls}">${pCfg.label}</span>`}
        </div>`;
    } else {
        const pCfg = prioConfig[r.prio] || prioConfig.default;
        prioHtml = unitId === 'joyful_captain' ? '' : `<span class="prio-badge ${pCfg.cls}">${pCfg.label}</span>`;
    }

    const s = window.disableSubStats ? {} : { ...(r.subStats || {}) };
    if (!window.disableSubStats && unitId === 'ant_king_savage' && r.mainStats?.body === 'dot' && (!Array.isArray(s.body) || s.body.length === 0)) {
        s.body = [{ type: 'dmg', val: (typeof PERFECT_SUBS !== 'undefined' ? PERFECT_SUBS.dmg : 4) * 6 }];
    }
    const filterBaseRolls = (arr) => arr.filter(s => {
        if (!s || !s.type) return false;
        return s.val > (typeof PERFECT_SUBS !== 'undefined' ? PERFECT_SUBS[s.type] : 0);
    });

    const headRow = (!window.disableSubStats && r.headUsed && r.headUsed !== 'none') ? `<div class="stat-line"><span class="sl-label">HEAD</span>${getRichBadgeHtml(filterBaseRolls(s.head || []))}</div>` : '';
    const bodyRow = window.disableSubStats ? '' : `<div class="stat-line"><span class="sl-label">BODY</span>${getRichBadgeHtml(filterBaseRolls(s.body || []))}</div>`;
    const legsRow = window.disableSubStats ? '' : `<div class="stat-line"><span class="sl-label">LEGS</span>${getRichBadgeHtml(filterBaseRolls(s.legs || []))}</div>`;

    const isBossHigher = (r.bossDps > (r.dps || 0));
    const displayVal = format(isBossHigher ? r.bossDps : (r.dps || 0));
    const displayLabel = isBossHigher ? 'BOSS DPS' : 'DPS';

    const renderValRow = (iconKey, currentVal, nextVal, extraClass = '') => {
        const isMaxed = nextLevel > maxLevel;
        return `
        <div class="fs-item-lg ${iconKey}-row">
            <span class="fs-icon-box ${iconKey}-bg">${SVGS[iconKey]}</span>
            <span class="fs-val ${extraClass}">${currentVal}</span>
        </div>
        <div class="fs-item-lg ${iconKey}-row ${isMaxed ? 'is-maxed' : ''}">
            <span class="fs-icon-box ${iconKey}-bg">${SVGS[iconKey]}</span>
            <span class="fs-val ${isMaxed ? 'val-maxed' : extraClass}">${isMaxed ? 'Maxed' : nextVal}</span>
        </div>`;
    };

    const headName = (r.headUsed && r.headUsed !== 'none') ? (HEAD_CONFIG[r.headUsed]?.name || r.headUsed) : '';
    const headHeaderHtml = headName ? `<span class="br-sep" style="margin: 0 1px;">/</span><span class="br-set" style="color:#60a5fa; font-size: 0.72em; padding: 1px 3px; letter-spacing: -0.2px;">${headName.toUpperCase()}</span>` : '';

    return `
        <div class="build-row ${rankClass} ${sortMode === 'efficiency' ? 'is-efficiency-sort' : ''}">
            <div class="br-header" style="align-items: center; padding-top: 6px; padding-bottom: 1px;">
                <div class="br-header-info" style="margin-top: 0; align-items: center; gap: 4px;">
                    <span class="br-rank" style="font-size: 0.7em; width: auto;">#${i + 1}</span>
                    <div class="br-set-info-text" style="display: flex; align-items: center;" onclick="window.viewBuildRelicDatabase('${r.id}', '${unitId}')" title="Click to view map locations in Relic Database">
                        <span class="br-set" style="font-size: 0.75em; padding: 1px 3px; letter-spacing: -0.2px;">${r.setName.toLowerCase().includes('set') ? r.setName : r.setName + ' Set'}</span>
                        ${headHeaderHtml}
                    </div>
                    <span class="br-sep" style="margin: 0 1px;">/</span>
                    <span class="br-trait" style="font-size: 0.75em; letter-spacing: -0.2px;">${r.traitName}</span>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                    ${prioHtml}
                </div>
            </div>
            ${optimalityHtml ? `<div style="display:flex; justify-content:center; margin-top:1px; margin-bottom:1px;">${optimalityHtml}</div>` : ''}
            <div class="br-grid ${window.disableSubStats ? 'no-subs' : ''}" style="padding-top:0;">
                <div class="br-col main" style="flex: 1 !important; width: 100% !important; box-sizing: border-box !important;"><div class="br-col-title">MAIN STAT</div>${getHeadBadgeHtml(r.headUsed)}<div class="stat-line"><span class="sl-label">BODY</span> ${window.getBadgeHtml(r.mainStats.body, MAIN_STAT_VALS.body[r.mainStats.body])}</div><div class="stat-line"><span class="sl-label">LEGS</span> ${window.getBadgeHtml(r.mainStats.legs, MAIN_STAT_VALS.legs[r.mainStats.legs])}</div></div>
                ${window.disableSubStats ? '' : `<div class="br-col sub" style="flex: 1 !important; width: 100% !important; box-sizing: border-box !important;"><div class="br-col-header"><div class="br-col-title">SUB STAT</div><button class="info-btn" onclick="event.stopPropagation(); window.showSubstatDetails('${r.id}')" style="width:13px;height:13px;font-size:0.55rem;padding:0;display:inline-flex;align-items:center;justify-content:center;line-height:1;" title="Show full substats">?</button></div>${headRow}${bodyRow}${legsRow}</div>`}
            </div>
            <div class="br-full-stats">
                <div class="fs-comparison-grid">
                    <div class="fs-stats-subgrid">
                        ${renderValRow('dmg', format(r.dmgVal || 0), format(nextStats.dmgVal), 'val-dmg')}
                        ${renderValRow('spa', `${fix2(r.spa || 0)}s`, `${fix2(nextStats.spa)}s`, 'val-spa')}
                        ${renderValRow('range', fix1(r.range || 0), fix1(nextStats.range), 'val-range')}
                    </div>
                    <div class="fs-eff-summary">
                        <div class="eff-group" onclick="event.stopPropagation(); openInfoPopup('efficiency')" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; width: 100%;">
                            <span class="eff-label">COST EFFICIENCY</span>
                            <span class="eff-val">${effScore}</span>
                        </div>
                        <div class="eff-divider"></div>
                        <div class="dps-group" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                            <div style="display: flex; align-items: center; gap: 4px; justify-content: center; width: 100%;">
                                <span class="build-dps" style="font-size: 1.15rem; font-weight: 850; color: #fff; line-height: 1;">${displayVal}</span>
                                <button class="info-btn" onclick="showMath('${r.id}')" style="width: 13px; height: 13px; font-size: 0.55rem; padding: 0; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">?</button>
                            </div>
                            <span class="dps-label" style="font-size: 0.55rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 2px 0 0 0; line-height: 1; text-align: center; ${isBossHigher ? 'color: #fca5a5;' : ''}">${displayLabel}</span>
                            ${(isBossHigher || (r.bossDps && r.bossDps !== r.dps)) ? `
                            <div class="boss-dps-mini" style="font-size: 0.6rem; color: #94a3b8; font-weight: 700; display: flex; gap: 4px; line-height: 1; margin-top: 4px; justify-content: center;">
                                ${isBossHigher ? `<span style="opacity: 0.6; font-weight: 500;">BASE:</span> ${format(r.dps)}` : `<span style="opacity: 0.6; font-weight: 500; color: #fca5a5;">BOSS:</span> ${format(r.bossDps)}`}
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="fs-sub-row">
                    <div class="fs-item-sm"><span class="fs-label">Crit %</span><span class="fs-val val-crit">${fix1(Math.min(s.finalCf || 0, 100))}%</span></div>
                    <div class="fs-item-sm"><span class="fs-label">CDmg</span><span class="fs-val val-cdmg">${(s.finalCm || 0).toFixed(0)}%</span></div>
                    <div class="fs-item-sm"><span class="fs-label">DoT Dmg</span><span class="fs-val val-dot">${format(r.dotTotal || 0)}</span></div>
                </div>
            </div>
        </div>`;
}

// Unified Active Build calculation & tracking
function invalidateUnitScoreCaches(unitId) {
    if (!unitId) return;
    if (window.LIVE_SCORE_CACHE) delete window.LIVE_SCORE_CACHE[unitId];
    if (window.unitActiveBuilds) delete window.unitActiveBuilds[unitId];
    if (window.hotbarFilteredBuilds) delete window.hotbarFilteredBuilds[unitId];
    if (window.bestHydratedBuildCache) {
        Object.keys(window.bestHydratedBuildCache).forEach(key => {
            if (key === unitId || key.startsWith(`${unitId}:`)) delete window.bestHydratedBuildCache[key];
        });
    }
}

window.invalidateUnitScoreCaches = invalidateUnitScoreCaches;

function invalidateUnitMathCaches(unitId) {
    if (!unitId) return;

    if (window.unitBuildsCache) delete window.unitBuildsCache[unitId];

    const buildPrefixes = [unitId + '-', `${unitId}_abil-`, `${unitId}-BASE-`, `${unitId}-ABILITY-`];
    if (window.cachedResults) {
        Object.keys(window.cachedResults).forEach(key => {
            if (key === unitId || buildPrefixes.some(prefix => key.startsWith(prefix))) {
                delete window.cachedResults[key];
            }
        });
    }

    if (window.nextLevelStatsCache) {
        Object.keys(window.nextLevelStatsCache).forEach(key => {
            if (key === unitId || key.startsWith(`${unitId}:`)) {
                delete window.nextLevelStatsCache[key];
            }
        });
    }

    if (window.customTraitBuildCache) {
        Object.keys(window.customTraitBuildCache).forEach(key => {
            if (key === unitId || key.startsWith(`${unitId}|`) || key.includes(`|${unitId}|`)) {
                delete window.customTraitBuildCache[key];
            }
        });
    }
}

window.invalidateUnitMathCaches = invalidateUnitMathCaches;

window.refreshActiveBuild = function (unit) {
    const unitId = unit.id;
    const isLoadout = (window.CALCULATION_MODE === 'loadout');
    const isInHotbarState = window.hotbarState?.slots.some(s => s && (s.id === unitId || s.id.split('-')[0] === unitId.split('-')[0]));
    const isHotbar = isLoadout && isInHotbarState;

    const activeType = (window.activeAbilityIds?.has(unitId) && unit.ability) ? 'abil' : 'base';
    const activeMode = 'fixed';

    invalidateUnitScoreCaches(unitId);

    if (window.inventoryMode) {
        console.debug('[INVENTORY-MODE-DIAG] refreshActiveBuild entry', {
            unitId,
            isHotbar,
            inventoryLength: window.relicInventory?.length || 0,
            assignedTrait: window.getInventoryAssignedTrait?.(unitId) || null
        });
    }

    let modesToEval = [];
    if (window.unitModesState[unitId] !== undefined) {
        const state = window.unitModesState[unitId];
        modesToEval = [Array.isArray(state) ? state[0] : state];
    } else if (unit.modes && Array.isArray(unit.modes)) {
        modesToEval = unit.modes.map((_, i) => i);
    } else {
        modesToEval = [unit.defaultMode ?? 0];
    }

    if (unit.systemLevel && window.unitSystemLevels[unitId] === undefined) {
        window.unitSystemLevels[unitId] = unit.systemLevel.default !== undefined ? unit.systemLevel.default : (unit.systemLevel.max || 100);
    }

    let builds = null;
    const db = (isHotbar && window.HOTBAR_STATIC_BUILD_DB) ? window.HOTBAR_STATIC_BUILD_DB : (window.GLOBAL_STATIC_BUILD_DB || window.STATIC_BUILD_DB);
    const ignoreInventory = window.inventoryMode !== true;
    if (!ignoreInventory) {
        builds = null;
        console.debug('[INVENTORY-MODE-DIAG] refreshActiveBuild skipping static-db lookup', {
            unitId,
            activeType,
            inventoryLength: window.relicInventory?.length || 0,
            assignedTrait: window.getInventoryAssignedTrait?.(unitId) || null
        });
    } else {
        builds = window.getRelicDbEntry(db, unitId, activeType);
    }

    if (!builds || builds.length === 0) {
        if (typeof window.calculateUnitBuilds === 'function') {
            const selectedTraitId = window.unitTraits?.[unitId];
            const selectedTrait = selectedTraitId ? getTraitFast(selectedTraitId) : null;
            const traitsForCalc = selectedTrait ? [selectedTrait] : null;

            const selectedHead = window.unitHeads?.[unitId] || 'none';
            const headsForCalc = selectedHead !== 'none' ? [selectedHead] : HEADS_LIST;

            const dynamicList = window.calculateUnitBuilds(
                unit, null, window.getFilteredBuilds?.() || null,
                window.getValidSubCandidates?.() || ['dmg', 'spa', 'cm', 'cf', 'range', 'dot'],
                headsForCalc, !window.disableSubStats, traitsForCalc,
                activeType === 'abil', activeMode, isHotbar, ignoreInventory
            );
            if (dynamicList && dynamicList.length > 0) builds = dynamicList;
            else return null;
        } else return null;
    }

    let bestHydrated = null;
    let bestScore = -1;

    modesToEval.forEach(modeIdx => {
        let topBuild = builds[0];
        const selectedTrait = window.unitTraits?.[unitId];
        const selectedTraitLower = selectedTrait?.toLowerCase();
        const selectedHead = window.unitHeads?.[unitId];

        const matches = builds.filter(b => {
            const tName = String(typeof b.t === 'number' ? traitsList[b.t]?.name : b.traitName || b.t) || '';
            const hName = String(typeof b.h === 'number' ? HEADS_LIST[b.h] : b.headUsed || b.h) || 'none';
            if (selectedTraitLower && tName.toLowerCase() !== selectedTraitLower) return false;
            if (selectedHead && selectedHead !== 'none' && hName !== String(selectedHead)) return false;
            return true;
        });

        if (matches.length > 0) {
            topBuild = getBestHydratedBuild(matches, unitId, isHotbar, modeIdx) || matches[0];
        } else if (selectedTrait) {
            const singleTraitObj = getTraitFast(selectedTrait);
            if (singleTraitObj) {
                const dynamicList = window.calculateUnitBuilds(
                    unit, null, getFilteredBuilds(), getValidSubCandidates(),
                    selectedHead ? [selectedHead] : HEADS_LIST, !window.disableSubStats,
                    [singleTraitObj], activeType === 'abil', activeMode, isHotbar, ignoreInventory
                );
                if (dynamicList && dynamicList.length > 0) topBuild = dynamicList[0];
            }
        }

        const hydrated = hydrateBuildEntry(topBuild, unitId, isHotbar, modeIdx);
        if (hydrated) {
            const score = getFinalDpsScore(hydrated);
            if (score > bestScore) {
                bestScore = score;
                bestHydrated = hydrated;
            }
        }
    });

    if (bestHydrated) {
        if (!window.unitActiveBuilds) window.unitActiveBuilds = {};
        window.unitActiveBuilds[unitId] = bestHydrated;

        if (!window.hotbarFilteredBuilds) window.hotbarFilteredBuilds = {};
        window.hotbarFilteredBuilds[unitId] = bestHydrated;
        if (window.LIVE_SCORE_CACHE) delete window.LIVE_SCORE_CACHE[unitId];
    }
    return bestHydrated;
};

window.refreshAllActiveBuilds = function () {
    window.unitActiveBuilds = window.unitActiveBuilds || {};

    const list = window.paginatedSortedUnits?.length > 0
        ? window.paginatedSortedUnits.map(e => e.unit)
        : (unitDatabase || []);

    const processedIds = new Set();
    list.forEach(unit => {
        window.refreshActiveBuild(unit);
        processedIds.add(unit.id);
    });

    if (window.hotbarState?.slots) {
        window.hotbarState.slots.forEach(slot => {
            if (slot && !processedIds.has(slot.id)) {
                const fullUnit = window.getUnitById(slot.id);
                if (fullUnit) {
                    window.refreshActiveBuild(fullUnit);
                    processedIds.add(slot.id);
                }
            }
        });
    }
};

// Update Build List display for a card
function updateBuildListDisplay(unitId, forceSync = false, renderLimit = 150, forcedType = null) {
    const card = document.getElementById('card-' + unitId);
    if (!card) return;
    const unitObj = window.getUnitById(unitId);
    if (!unitObj) return;

    const isInHotbarState = window.hotbarState?.slots.some(s => s && (s.id === unitId || s.id.split('-')[0] === unitId.split('-')[0]));
    const isHotbar = card.parentElement?.id === 'hotbarHiddenRender' || !!card.closest('.team-summary-container') || isInHotbarState;
    const useInventory = window.inventoryMode === true;

    if (useInventory) {
        console.debug('[INVENTORY-MODE-DIAG] updateBuildListDisplay entry', {
            unitId,
            inventoryLength: window.relicInventory?.length || 0,
            assignedTrait: window.getInventoryAssignedTrait?.(unitId) || null,
            isHotbar,
            forceSync
        });
    }

    let activeModeIdx = getPreferredModeIdx(unitId, unitObj);

    const systemLevelBar = card.querySelector('.system-level-bar');
    if (systemLevelBar && unitObj?.systemLevel) {
        const visible = !unitObj.systemLevel.restrictModes || unitObj.systemLevel.restrictModes.includes(activeModeIdx);
        systemLevelBar.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    }

    const activeType = ['base', 'abil'].includes(forcedType) ? forcedType : ((window.activeAbilityIds?.has(unitObj.id) && unitObj?.ability) ? 'abil' : 'base');
    const activeMode = 'fixed';

    const { unitCost, unitPlace } = getUnitCostAndPlacement(unitObj, activeModeIdx);

    let traitBenchmarks = {};
    try {
        if (!useInventory && window.STATIC_BUILD_DB) {
            const dbKey = unitId + (activeType === 'abil' ? '_abil' : '');
            let dbEntry = window.STATIC_BUILD_DB[dbKey] || {};
            if (!dbEntry.fixed && window.GLOBAL_STATIC_BUILD_DB_BASE?.[dbKey]) {
                dbEntry = window.GLOBAL_STATIC_BUILD_DB_BASE[dbKey];
            }

            const modeData = dbEntry[activeMode] || dbEntry[activeMode === 'fixed' ? 'f' : 'b'];
            const perfectBuilds = modeData?.[0];
            if (perfectBuilds) {
                perfectBuilds.forEach(b => {
                    const hydrated = hydrateBuildEntry(b, unitId, isHotbar);
                    if (hydrated) {
                        const val = hydrated.dps || 0;
                        if (!traitBenchmarks[hydrated.traitName] || val > traitBenchmarks[hydrated.traitName]) traitBenchmarks[hydrated.traitName] = val;
                        if (!traitBenchmarks['peak'] || val > traitBenchmarks['peak']) traitBenchmarks['peak'] = val;
                    }
                });
            }

            const PEAK_MODE_STATE = window.PEAK_MODE_STATE || {};
            const needsDynamicBench = !traitBenchmarks['peak'] && (forceSync || !traitBenchmarks['peak']);

            if (needsDynamicBench && unitObj) {
                const savedState = window.unitModesState[unitId];
                let dynamicResults;
                try {
                    const peakMode = PEAK_MODE_STATE[unitId];
                    if (peakMode !== undefined) {
                        window.unitModesState[unitId] = peakMode;
                    } else if (unitObj.modes && Array.isArray(unitObj.modes)) {
                        window.unitModesState[unitId] = unitObj.modes.length - 1;
                    }

                    dynamicResults = window.calculateUnitBuilds(
                        unitObj, null, window.getFilteredBuilds?.() || [], window.getValidSubCandidates?.() || [], HEADS_LIST,
                        !window.disableSubStats, null, activeType === 'abil', activeMode, isHotbar, true
                    );
                } finally {
                    window.unitModesState[unitId] = savedState;
                }

                if (dynamicResults?.length > 0) {
                    traitBenchmarks = {};
                    dynamicResults.forEach(res => {
                        if (!traitBenchmarks[res.traitName] || res.dps > traitBenchmarks[res.traitName]) {
                            traitBenchmarks[res.traitName] = res.dps;
                        }
                    });
                    traitBenchmarks['peak'] = dynamicResults[0].dps || 0;

                    if (!window.modeBenchmarks) window.modeBenchmarks = {};
                    window.modeBenchmarks[`${unitId}-${activeType}`] = traitBenchmarks;
                }
            } else if (unitObj?.modes || unitId.toLowerCase().includes('syncro')) {
                traitBenchmarks = window.modeBenchmarks?.[`${unitId}-${activeType}`] || {};
            }
        }
    } catch (e) { console.warn("Benchmark error", e); }

    const globalSearch = (document.getElementById('globalSearch')?.value || document.getElementById('sidebarSearch')?.value || '').trim().toLowerCase();
    const localSearch = card.querySelector('.search-container input')?.value?.toLowerCase() || '';
    let searchInput = localSearch || globalSearch;
    const isGlobalFallback = !localSearch && !!globalSearch;

    const prioSelect = card.querySelector('select[data-filter="prio"]')?.value || 'all';
    const setSelect = card.querySelector('select[data-filter="set"]')?.value || 'all';
    const headSelect = card.querySelector('select[data-filter="head"]')?.value || 'all';
    const comboSelect = card.querySelector('select[data-filter="combo"]')?.value || 'all';
    const sortSelect = card.querySelector('select[data-filter="sort"]')?.value || 'dps';

    const renderListInternal = (builds, limit) => {
        if (!builds || builds.length === 0) return '<div class="msg-empty">No valid builds found.</div>';

        const sortBuilds = (list) => [...list].sort((a, b) => {
            const dpsScore = (entry) => getFinalDpsScore(entry);
            const bossScore = (entry) => Math.max(sortNumber(entry.bossDps), sortNumber(entry.bd), sortNumber(entry.bossTotal), sortNumber(entry.boss_total));
            const damageScore = (entry) => Math.max(sortNumber(entry.dmgVal), getFinalDpsScore(entry));

            if (window.GLOBAL_MODE_SORT !== 'none' && unitObj?.meta) {
                const modeKey = window.GLOBAL_MODE_SORT === 'short' ? 'short' : 'long';
                const textRec = (unitObj.meta[modeKey] || '').toLowerCase();
                const recTraits = textRec.split('/').map(s => s.trim());
                const aIsRec = recTraits.some(rt => rt && a.traitName.toLowerCase().includes(rt));
                const bIsRec = recTraits.some(rt => rt && b.traitName.toLowerCase().includes(rt));
                if (aIsRec !== bIsRec) return aIsRec ? -1 : 1;
            }
            if (sortSelect === 'boss') {
                const scoreDelta = bossScore(b) - bossScore(a);
                if (scoreDelta !== 0) return scoreDelta;
            } else if (sortSelect === 'damage') {
                const damageDelta = damageScore(b) - damageScore(a);
                if (damageDelta !== 0) return damageDelta;
            } else if (sortSelect === 'efficiency') {
                const effA = calculateBuildEfficiency(a, unitCost, unitPlace, unitId);
                const effB = calculateBuildEfficiency(b, unitCost, unitPlace, unitId);
                const effDelta = sortNumber(effB) - sortNumber(effA);
                if (effDelta !== 0) return effDelta;
            } else {
                const scoreDelta = dpsScore(b) - dpsScore(a);
                if (scoreDelta !== 0) return scoreDelta;
            }

            return String(a.traitName || '').localeCompare(String(b.traitName || ''))
                || String(a.setName || '').localeCompare(String(b.setName || ''))
                || String(a.headUsed || '').localeCompare(String(b.headUsed || ''));
        });

        const allHydrated = builds.map(b => hydrateBuildEntry(b, unitId, isHotbar, activeModeIdx)).filter(Boolean);
        const optimalityBenchmarks = {};
        allHydrated.forEach(r => {
            const val = Math.max(r.dps || 0, r.bossDps || 0);
            if (val <= 0) return;
            const key = `${r.traitName || ''}|${r.prio || 'default'}|${r.mainStats?.body || ''}_${r.mainStats?.legs || ''}`;
            if (!optimalityBenchmarks[key] || val > optimalityBenchmarks[key]) optimalityBenchmarks[key] = val;
        });

        const globalSorted = sortBuilds(allHydrated);
        const globalRankMap = new Map();
        globalSorted.forEach((r, idx) => globalRankMap.set(r.id, idx + 1));

        const filtered = allHydrated.filter(r => {
            if (!r) return false;
            if (prioSelect !== 'all' && r.prio !== prioSelect) return false;
            if (setSelect !== 'all' && r.setName !== setSelect) return false;
            if (headSelect !== 'all' && (r.headUsed || 'none') !== headSelect) return false;

            const currentCombo = r.mainStats.body + '_' + r.mainStats.legs;
            if (comboSelect !== 'all' && currentCombo !== comboSelect) return false;

            const hSearch = HEAD_CONFIG[r.headUsed]?.search || '';
            const headName = HEAD_CONFIG[r.headUsed]?.name || '';
            const combo = r.mainStats.body + '_' + r.mainStats.legs;
            const comboText = COMBO_TITLES[combo] || combo;
            const subStatsText = JSON.stringify(r.subStats || {});
            const searchText = `${r.traitName} ${r.setName} ${r.prio} ${hSearch} ${headName} ${comboText} ${r.mainStats?.body || ''} ${r.mainStats?.legs || ''} ${r.spa || ''} ${r.range || ''} ${subStatsText}`.toLowerCase();

            return searchText.includes(searchInput) || (isGlobalFallback && searchText.includes(''));
        });

        if (filtered.length === 0) return '<div class="msg-empty">No matches found.</div>';

        const comboGroups = {};
        filtered.forEach(r => {
            const bodyType = r.mainStats?.body || 'dmg';
            const legsType = r.mainStats?.legs || 'dmg';
            const comboKey = `${bodyType}_${legsType}`;

            if (!comboGroups[comboKey]) {
                comboGroups[comboKey] = [];
            }
            comboGroups[comboKey].push(r);
        });

        let candidates = [];
        for (const comboKey in comboGroups) {
            const comboList = comboGroups[comboKey];
            const sortedCombo = sortBuilds(comboList);

            const seenGearTrait = new Set();
            let count = 0;
            for (const b of sortedCombo) {
                const gearHash = `${b.setName}|${b.headUsed || 'none'}|${b.traitName}`;
                if (!seenGearTrait.has(gearHash)) {
                    candidates.push(b);
                    seenGearTrait.add(gearHash);
                    count++;
                    if (count >= 3) {
                        break;
                    }
                }
            }
        }

        candidates = sortBuilds(candidates);

        const slice = candidates.slice(0, limit);
        if (slice.length > 0) {
            if (!window.hotbarFilteredBuilds) window.hotbarFilteredBuilds = {};
            const selectedTrait = window.CALCULATION_MODE === 'loadout' && window.unitTraits?.[unitId];
            const selectedTraitLower = typeof selectedTrait === 'string' ? selectedTrait.toLowerCase() : '';

            window.hotbarFilteredBuilds[unitId] = selectedTraitLower
                ? (allHydrated.find(b => b.traitName?.toLowerCase() === selectedTraitLower)
                    || filtered.find(b => b.traitName?.toLowerCase() === selectedTraitLower)
                    || slice[0])
                : slice[0];

            if (!window.unitActiveBuilds) window.unitActiveBuilds = {};
            window.unitActiveBuilds[unitId] = window.hotbarFilteredBuilds[unitId];

            if (window.LIVE_SCORE_CACHE) delete window.LIVE_SCORE_CACHE[unitId];
        }

        return slice.map((r, i) => generateBuildRowHTML(r, i, {
            totalCost: unitCost,
            placement: unitPlace,
            sortMode: sortSelect,
            unitId,
            traitBenchmarks,
            optimalityBenchmarks,
            globalRank: globalRankMap.get(r.id)
        })).join('');
    };

    const container = document.getElementById(`results-${activeType}-${activeMode}-0-${unitId}`);
    if (!container) return;

    let buildData = null;
    const db = (isHotbar && window.HOTBAR_STATIC_BUILD_DB) ? window.HOTBAR_STATIC_BUILD_DB : (window.GLOBAL_STATIC_BUILD_DB || window.STATIC_BUILD_DB);
    if (useInventory) {
        try {
            window.processUnitCache(unitObj, 0, activeType);
            buildData = window.unitBuildsCache[unitObj.id]?.[activeType]?.[activeMode]?.[0];
        } catch (e) {
            console.error('[INVENTORY-MODE-DIAG] updateBuildListDisplay inventory calculation failed', e, { unitId, activeType });
            container.innerHTML = `<div class="msg-empty">Inventory calculation failed. Check console for details.</div>`;
            return;
        }
        console.debug('[INVENTORY-MODE-DIAG] updateBuildListDisplay using inventory calculation path', {
            unitId,
            activeType,
            dbAvailable: !!db,
            dbBuildCount: buildData?.length || 0,
            cacheHit: !!buildData
        });
    } else if (db) {
        buildData = window.getRelicDbEntry(db, unitId, activeType);
    }

    if (buildData) {
        let displayBuilds = [...buildData];
        const customTraitsToCalc = [
            ...(window.customTraits || []),
            ...(window.unitSpecificTraits?.[unitId] || [])
        ];
        const forceCustomBuilds = window.forceCustomPairBuildRefresh?.has(unitId);
        const quickCustomBuilds = window.quickCustomPairBuildRefresh?.has(unitId);
        const hasPendingCustomBuilds = window.pendingCustomPairBuilds?.has(unitId);
        const customBuilds = (!hasPendingCustomBuilds || forceCustomBuilds || quickCustomBuilds)
            ? getCachedCustomTraitBuilds(unitObj, customTraitsToCalc, activeType, activeMode, isHotbar, quickCustomBuilds ? 'quick' : 0)
            : [];

        if (customBuilds && customBuilds.length > 0) {
            const seenIds = new Set(displayBuilds.map(b => b.id));
            customBuilds.forEach(cb => {
                if (!seenIds.has(cb.id)) {
                    displayBuilds.push(cb);
                    seenIds.add(cb.id);
                }
            });
        }

        if (useInventory) {
            traitBenchmarks = {};
            displayBuilds.forEach(r => {
                const val = Math.max(r.dps || 0, r.bossDps || 0);
                if (val <= 0) return;
                if (!traitBenchmarks[r.traitName] || val > traitBenchmarks[r.traitName]) traitBenchmarks[r.traitName] = val;
                if (!traitBenchmarks['peak'] || val > traitBenchmarks['peak']) traitBenchmarks['peak'] = val;
            });
        }

        container.innerHTML = renderListInternal(displayBuilds, renderLimit);

        if (hasPendingCustomBuilds && !forceCustomBuilds && !quickCustomBuilds && typeof window.renderCustomPairPendingBanner === 'function') {
            window.renderCustomPairPendingBanner(unitId);
        }

        if (forceCustomBuilds && window.forceCustomPairBuildRefresh) {
            window.forceCustomPairBuildRefresh.delete(unitId);
        }
        if (quickCustomBuilds && window.quickCustomPairBuildRefresh) {
            window.quickCustomPairBuildRefresh.delete(unitId);
        }
    } else if (unitObj && !window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0]) {
        window.processUnitCache(unitObj, 0, activeType);
        const finalData = window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0];
        if (finalData) container.innerHTML = renderListInternal(finalData, renderLimit);
        else container.innerHTML = `<div class="msg-loading"><div class="loading-spinner"></div><span>Calculating...</span></div>`;
    } else {
        container.innerHTML = `<div class="msg-loading"><div class="loading-spinner"></div><span>Calculating...</span></div>`;
    }

    if (unitObj && card) {
        const badgesDiv = card.querySelector('.banner-badges');
        const toggleArea = card.querySelector('.ut-toggle-area');
        if (toggleArea) {
            let existingModeBadge = toggleArea.querySelector('.mode-indicator-badge');
            if (unitObj.modes && Array.isArray(unitObj.modes)) {
                const currentMode = unitObj.modes[activeModeIdx];
                const isSummon = unitObj.modesLabel?.toLowerCase() === 'summons' || unitObj.id === 'the_strongest_in_history';
                if (currentMode && !isSummon) {
                    const modeHtml = `<div class="mode-indicator-badge" style="display: flex; align-items: center; color: #c084fc; font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(192, 132, 252, 0.4); background: rgba(192, 132, 252, 0.06); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis;" title="${currentMode.name}">⚙ ${currentMode.name.toUpperCase()}</div>`;
                    if (existingModeBadge) existingModeBadge.outerHTML = modeHtml;
                    else toggleArea.insertAdjacentHTML('afterbegin', modeHtml);
                } else existingModeBadge?.remove();
            } else existingModeBadge?.remove();
        }

        if (badgesDiv) {
            let existingSynergyBadge = badgesDiv.querySelector('.synergy-dot-badge');
            const synHtml = getSynergyBadgeHtml(unitObj, activeModeIdx);
            if (synHtml) {
                if (existingSynergyBadge) existingSynergyBadge.outerHTML = synHtml;
                else badgesDiv.insertAdjacentHTML('beforeend', synHtml);
            } else existingSynergyBadge?.remove();
        }
    }
}

function refreshUnitAbilityBuildContainers(unitId, forceSync = false, renderLimit = 150) {
    const unitObj = window.getUnitById?.(unitId);
    if (!unitObj || !unitObj.ability) {
        updateBuildListDisplay(unitId, forceSync, renderLimit);
        return;
    }

    const activeType = window.activeAbilityIds?.has(unitId) ? 'abil' : 'base';
    const inactiveType = activeType === 'abil' ? 'base' : 'abil';

    updateBuildListDisplay(unitId, forceSync, renderLimit, inactiveType);
    updateBuildListDisplay(unitId, forceSync, renderLimit, activeType);
}

window.refreshUnitAbilityBuildContainers = refreshUnitAbilityBuildContainers;

function getCachedReconstructedCustomTraitBuilds(unit, customTraitsToCalc, activeType, activeMode, isHotbar) {
    if (!unit || !customTraitsToCalc || customTraitsToCalc.length === 0 || typeof window.reconstructMathData !== 'function') {
        return [];
    }

    window.customTraitBuildCache = window.customTraitBuildCache || {};
    const dbVersion = isHotbar ? window.hotbarCurrentDb : window.globalCurrentDb;
    const cachedBuilds = [];
    const dbTable = window.STATIC_BUILD_DB?.[unit.id + (activeType === 'abil' && unit.ability ? '_abil' : '')] || window.STATIC_BUILD_DB?.[unit.id];
    const dbList = dbTable?.[activeMode] || dbTable?.[activeMode === 'fixed' ? 'f' : 'b'];
    const sourceBuilds = dbList?.[0] || (window.getFilteredBuilds?.() || []);
    const seenTraitIds = new Set();

    customTraitsToCalc.forEach(trait => {
        if (!trait || trait.id === 'none') return;
        const traitId = trait.id || trait.name;
        if (!traitId || seenTraitIds.has(traitId)) return;
        seenTraitIds.add(traitId);

        const cacheKey = `${unit.id}|${activeType}|${activeMode}|${isHotbar ? 1 : 0}|${window.disableSubStats ? 1 : 0}|${dbVersion || 'db'}|quick-reconstruct|${traitId}`;
        if (!window.customTraitBuildCache[cacheKey]) {
            const rebuilt = [];
            sourceBuilds.forEach(build => {
                if (!build || !build.id || !build.setName) return;

                const res = window.reconstructMathData(build, undefined, {
                    traitOverride: trait,
                    activeModeIdx: window.unitModesState?.[unit.id] || 0,
                    isHotbar
                });

                if (!res || !isFinite(res.total)) return;

                rebuilt.push({
                    ...build,
                    id: `${build.id}-custom-${traitId}`,
                    traitName: trait.name,
                    dps: res.total,
                    bossDps: res.bossTotal,
                    dmgVal: res.dmgVal,
                    spa: res.spa,
                    range: res.range,
                    dot: res.dot || build.dot || 0,
                    bossDot: res.bossTotal - (res.hit || 0) - (res.summon || 0),
                    dotTotal: res.dotData ? (
                        (res.dotData.nativeTotalDmg || 0) +
                        (res.dotData.radTotalDmg || 0) +
                        (res.dotData.fuaDotTotalDmg || 0) +
                        (res.dotData.scarfBurnTotalDmg || 0)
                    ) : 0,
                    placement: res.placement || build.placement || build.p || 0,
                    isCustom: true,
                    quickCustom: true
                });
            });
            window.customTraitBuildCache[cacheKey] = rebuilt;
        }

        cachedBuilds.push(...window.customTraitBuildCache[cacheKey]);
    });

    return cachedBuilds;
}

function getCachedCustomTraitBuilds(unit, customTraitsToCalc, activeType, activeMode, isHotbar, quickLimit = 0) {
    if (!unit || !customTraitsToCalc || customTraitsToCalc.length === 0 || typeof window.calculateUnitBuilds !== 'function') {
        return [];
    }

    if (quickLimit === 'quick') {
        return getCachedReconstructedCustomTraitBuilds(unit, customTraitsToCalc, activeType, activeMode, isHotbar);
    }

    window.customTraitBuildCache = window.customTraitBuildCache || {};
    const dbVersion = isHotbar ? window.hotbarCurrentDb : window.globalCurrentDb;
    const cachedBuilds = [];
    const seenTraitIds = new Set();

    customTraitsToCalc.forEach(trait => {
        if (!trait || trait.id === 'none') return;
        const traitId = trait.id || trait.name;
        if (!traitId || seenTraitIds.has(traitId)) return;
        seenTraitIds.add(traitId);

        const cacheKey = `${unit.id}|${activeType}|${activeMode}|${isHotbar ? 1 : 0}|${window.disableSubStats ? 1 : 0}|${dbVersion || 'db'}|${quickLimit || 'full'}|${traitId}`;
        if (!window.customTraitBuildCache[cacheKey]) {
            const filteredBuilds = window.getFilteredBuilds?.() || [];
            const buildsForCalc = quickLimit && Array.isArray(filteredBuilds) ? filteredBuilds.slice(0, quickLimit) : filteredBuilds;

            window.customTraitBuildCache[cacheKey] = window.calculateUnitBuilds(
                unit,
                null,
                buildsForCalc,
                window.getValidSubCandidates?.() || ['dmg', 'spa', 'cm', 'cf', 'range', 'dot'],
                HEADS_LIST,
                !window.disableSubStats,
                [trait],
                activeType === 'abil',
                activeMode,
                isHotbar,
                true
            ) || [];
        }

        cachedBuilds.push(...window.customTraitBuildCache[cacheKey]);
    });

    return cachedBuilds;
}

window.getQuickScore = (unit) => {
    if (!unit) return 0;

    // 1. Fast-Path Cache: If the card's displayed active build is already known, sort by that exact value.
    if (window.unitActiveBuilds && window.unitActiveBuilds[unit.id]) {
        return getFinalDpsScore(window.unitActiveBuilds[unit.id]);
    }

    // 2. Delegate to the unified build resolution engine to find the context-appropriate top build
    if (typeof window.refreshActiveBuild === 'function') {
        const activeBuild = window.refreshActiveBuild(unit);
        if (activeBuild) {
            return getFinalDpsScore(activeBuild);
        }
    }

    if (window.inventoryMode) {
        console.debug('[INVENTORY-MODE-DIAG] getQuickScore skipped static-db fallback', {
            unitId: unit.id,
            inventoryLength: window.relicInventory?.length || 0,
            assignedTrait: window.getInventoryAssignedTrait?.(unit.id) || null
        });
        return 0;
    }

    // 3. Absolute Fallback: Baseline static DB list[0] parsing
    const activeDb = (window.CALCULATION_MODE === 'loadout' && window.HOTBAR_STATIC_BUILD_DB) ? window.HOTBAR_STATIC_BUILD_DB : (window.GLOBAL_STATIC_BUILD_DB || window.STATIC_BUILD_DB);
    const list = window.getRelicDbEntry(activeDb, unit.id, unit.ability && window.activeAbilityIds?.has(unit.id) ? 'abil' : 'base');

    if (list && list.length > 0) {
        const topBuild = list[0];
        const isLoadout = (window.CALCULATION_MODE === 'loadout');
        const isInHotbarState = window.hotbarState?.slots.some(s => s && (s.id === unit.id || s.id.split('-')[0] === unit.id.split('-')[0]));
        const isHotbar = isLoadout && isInHotbarState;

        let activeMode = getPreferredModeIdx(unit.id, unit);

        const hydrated = hydrateBuildEntry(topBuild, unit.id, isHotbar, activeMode);
        if (hydrated) {
            return getFinalDpsScore(hydrated);
        }
        return getFinalDpsScore(topBuild);
    }
    return 0;
};

window.getLiveScore = (unit) => {
    const unitId = unit.id;
    if (window.LIVE_SCORE_CACHE[unitId] !== undefined) {
        return window.LIVE_SCORE_CACHE[unitId];
    }
    const score = window.getQuickScore(unit);
    window.LIVE_SCORE_CACHE[unitId] = score;
    return score;
};

window.resortUnitCards = function () {
    if (!paginatedSortedUnits || paginatedSortedUnits.length === 0) return;
    window.LIVE_SCORE_CACHE = {};
    window.unitActiveBuilds = {};
    window.hotbarFilteredBuilds = {};
    window.bestHydratedBuildCache = {};
    paginatedSortedUnits = [...paginatedSortedUnits].sort((a, b) => getLiveScore(b.unit) - getLiveScore(a.unit));

    window.unitAbsoluteRanks = {};
    paginatedSortedUnits.forEach((entry, i) => {
        window.unitAbsoluteRanks[entry.unit.id] = i + 1;
    });

    renderCurrentPage();
};

window.resortUnitCardsInPlace = function () {
    if (!paginatedSortedUnits || paginatedSortedUnits.length === 0) return;
    window.LIVE_SCORE_CACHE = {};
    window.unitActiveBuilds = {};
    window.hotbarFilteredBuilds = {};
    window.bestHydratedBuildCache = {};
    paginatedSortedUnits = [...paginatedSortedUnits].sort((a, b) => getLiveScore(b.unit) - getLiveScore(a.unit));

    window.unitAbsoluteRanks = {};
    paginatedSortedUnits.forEach((entry, i) => {
        window.unitAbsoluteRanks[entry.unit.id] = i + 1;
    });

    renderCurrentPage();
};

function renderUnitCard(unit, absoluteIndex) {
    let activeMode = getPreferredModeIdx(unit.id, unit);
    const { upgradesArr = null } = getUnitCostAndPlacement(unit, activeMode);

    if (window.unitELevels[unit.id] === undefined && upgradesArr) {
        window.unitELevels[unit.id] = upgradesArr.length - 1;
    }

    const abilityObj = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;
    let abilityLabel = abilityObj?.abilityName || 'Ability', toggleScript = '';
    const isToggled = window.activeAbilityIds?.has(unit.id);
    const override = TOGGLE_OVERRIDES[window.getFileName(unit.id)];
    if (override) {
        abilityLabel = override.dynamicLabel ? override.dynamicLabel(isToggled) : override.label;
        toggleScript = override.script ? `; ${override.script}` : '';
    }

    const currentLevel = window.unitELevels[unit.id] || 0;
    const abilityUnlocked = !upgradesArr || !upgradesArr.some(u => u.unlocksAbility) || upgradesArr.slice(0, currentLevel + 1).some(u => u.unlocksAbility);

    const abilityToggleHtml = (unit.ability && !abilityObj.noToggle)
        ? `<div class="toggle-wrapper" style="display: ${abilityUnlocked ? 'flex' : 'none'}"><span class="ut-ability-text" title="${abilityLabel}">${abilityLabel}</span><label><input type="checkbox" class="ability-cb" ${isToggled ? 'checked' : ''} onchange="window.toggleAbility('${unit.id}', this)${toggleScript}"><div class="mini-switch"></div></label></div>`
        : '<div></div>';

    const modesBtn = Array.isArray(unit.modes) ? `<button class="calc-btn ut-btn-compact modes-btn" onclick="openUnitModes('${unit.id}')" title="Change Mode"><span class="btn-label">${unit.modesLabel || 'Modes'}</span></button>` : '';

    let initialModeIndicatorHtml = '';
    if (Array.isArray(unit.modes)) {
        const currentMode = unit.modes[activeMode];
        const isSummon = unit.modesLabel?.toLowerCase() === 'summons' || unit.id === 'the_strongest_in_history';
        if (currentMode && !isSummon) {
            const modeHtml = `<div class="mode-indicator-badge" style="display: flex; align-items: center; color: #c084fc; font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(192, 132, 252, 0.4); background: rgba(192, 132, 252, 0.06); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis;" title="${currentMode.name}">
                ${currentMode.img ? `<img src="${currentMode.img}" alt="${currentMode.name}" style="width: 16px; height: 16px; margin-right: 8px; object-fit: contain;">` : '⚙'}
                ${currentMode.name.toUpperCase()}
            </div>`;
            initialModeIndicatorHtml = modeHtml;
        }
    }

    let dynamicPlacement = unit.placement || 1;
    if (isUnit(unit.id, 'water_god')) {
        const hbStats = (typeof getCachedHotbarStats === 'function') ? getCachedHotbarStats() : null;
        if (hbStats?.ugPresent) dynamicPlacement = Math.max(1, dynamicPlacement - 1);
    }

    const topControls = `<div class="unit-toolbar">
        <div class="ut-actions">
            <button class="calc-btn ut-btn-compact" onclick="openCalc('${unit.id}')"><span class="btn-label">CUSTOM</span></button>
            <button class="calc-btn ut-btn-compact" onclick="openTraitBestList('${unit.id}')" title="Best Build per Trait"><span class="btn-label">TRAITS</span></button>
            <button class="calc-btn ut-btn-compact" onclick="openUnitInfo('${unit.id}')">${SVGS.info}<span class="btn-label">INFO</span></button>
        </div>
        <div class="ut-toggle-area">${initialModeIndicatorHtml}${modesBtn}${abilityToggleHtml}</div>
    </div>`;

    const defaultSort = isAnyUnit(unit.id, ['sjw', 'esdeath']) ? 'damage' : 'dps';

    const notices = {
        king_sailor: { icon: '⚠️', text: '<strong>Notice:</strong> In-game he hits as 5 base hits instead of 2 for 2.5x total base hit damage; chain lightning scales off his pre-2.5x damage.', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
        fused_warrior_super_syncro: { icon: '⚠️', text: '<strong>Notice:</strong> Fused Warrior Super Syncro is bugged; his 2x damage bonus against enemies with more than 10x HP does not work.', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
        mochi_pirate: { icon: '⚠️', text: '<strong>Notice:</strong> Mochi Pirate is bugged; he does not apply Time Snail currently / Crit Time snail enemies.', color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)' },
        revolutionary_chief_syncro: { icon: '🔥', text: '<strong>Notice:</strong> DoT restarts duration if attacked again. DPS is calculated as 1 continuous tick per second.', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.08)', border: 'rgba(96, 165, 250, 0.15)' },
        ant_king_savage: { icon: '⚠️', text: '<strong>Notice:</strong> Ant King is bugged; any DoT%+ buffs applied to him are calculated twice.', color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)' },
        angel_born_in_hell: { icon: '⚠️', text: '<strong>Notice:</strong> Angel in Hell is bugged; he has a fixed 50% crit rate that cannot change, and crits work, though he is not meant to crit.', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
        the_drink_super_rage: { icon: '⚠️', text: '<strong>Notice:</strong> The Drink is bugged; his boss damage multiplier is currently non-functional in-game and does nothing.', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
        the_drink: { icon: '⚠️', text: '<strong>Notice:</strong> The Drink is bugged; his boss damage multiplier is currently non-functional in-game and does nothing.', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' }
    };
    const notice = notices[unit.id];
    const customNoticeHtml = notice ? `
        <div class="unit-card-warning" style="padding: 6px 12px; background: ${notice.bg}; border-bottom: 1px solid ${notice.border}; display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; color: ${notice.color};">
            <span style="font-size: 0.85rem; line-height: 1;">${notice.icon}</span>
            <span>${notice.text}</span>
        </div>` : '';

    const bottomControls = `
        <div class="search-container">
            <div class="search-row">
                <input type="text" placeholder="Search..." class="search-input" onkeyup="filterList(this)">
                <button class="filter-tab-btn" onclick="toggleFilterTab(this)">Filters ▼</button>
            </div>
            <div class="filter-tab-content hidden">
                <div class="search-row">
                    <select onchange="filterList(this)" data-filter="sort" class="search-select sort-select">
                        <option value="dps" ${defaultSort === 'dps' ? 'selected' : ''}>Sort: DPS</option>
                        <option value="boss">Sort: Boss DPS</option>
                        <option value="damage" ${defaultSort === 'damage' ? 'selected' : ''}>Sort: Damage</option>
                        <option value="efficiency" ${defaultSort === 'efficiency' ? 'selected' : ''}>Sort: Efficiency</option>
                    </select>
                    <select onchange="filterList(this)" data-filter="set" class="search-select">
                        <option value="all">Sets: All</option>
                        ${(typeof SETS !== 'undefined' ? SETS : []).filter(s => s.id !== 'none').map(set => `<option value="${set.name}">Sets: ${set.name.replace(' Set', '').replace('Captain', '')}</option>`).join('')}
                    </select>
                    <select onchange="filterList(this)" data-filter="head" class="search-select">
                        <option value="all">Heads: All</option>
                        ${HEADS_LIST.map(h => `<option value="${h}">Heads: ${HEAD_CONFIG[h]?.name || (h === 'none' ? 'None' : h.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()))}</option>`).join('')}
                    </select>
                    <select onchange="filterList(this)" data-filter="combo" class="search-select">
                        <option value="all">Combos: All</option>
                        <option value="dmg_dmg">Dmg / Dmg</option>
                        <option value="dmg_cf">Dmg / Crate</option>
                        <option value="dmg_spa">Dmg / Spa</option>
                        <option value="cm_dmg">CDmg / Dmg</option>
                        <option value="cm_cf">CDmg / Crate</option>
                        <option value="cm_spa">CDmg / Spa</option>
                        <option value="dot_dmg">DoT / Dmg</option>
                        <option value="dot_spa">DoT / Spa</option>
                        <option value="dot_cf">DoT / Crate</option>
                    </select>
                </div>
            </div>
        </div>
        ${upgradesArr && upgradesArr.length > 1 ? `<div class="upgrade-toolbar">
            ${upgradesArr.map((u, idx) => {
        const isActive = (window.unitELevels[unit.id] || 0) === idx;
        const isUnlocked = (window.unitELevels[unit.id] || 0) >= idx;
        return `<div class="e-pill ${isActive ? 'active' : ''} ${isUnlocked && (window.unitELevels[unit.id] || 0) > 0 ? 'e-unlocked' : ''} ${idx === upgradesArr.length - 1 ? 'is-special' : 'is-stat'}" 
                                     onclick="selectELevel('${unit.id}', ${idx})" data-level="${idx}" title="Upgrade ${idx}">${idx}</div>`;
    }).join('')}
        </div>` : ''}
        ${unit.systemLevel && window.CALCULATION_MODE !== 'loadout' ? (() => {
            const cfg = unit.systemLevel;
            if (cfg.restrictModes) {
                const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
                if (!cfg.restrictModes.includes(activeMode)) return '';
            }
            const currentSysLvl = window.unitSystemLevels[unit.id] ?? (cfg.default || cfg.max || 100);
            if (window.unitSystemLevels[unit.id] === undefined) window.unitSystemLevels[unit.id] = currentSysLvl;

            if (cfg.controlType === 'slider') {
                return `<div class="system-level-bar" style="display:flex; align-items:center; gap:12px; padding:6px 15px; background:rgba(99,102,241,0.06); border-bottom:1px solid var(--card-border);">
                    <span style="font-size:0.65rem; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:0.5px; min-width: 55px;">${cfg.label || 'System Level'}</span>
                    <input type="range" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                        style="flex:1; height:4px; background:rgba(99,102,241,0.2); border-radius:2px; cursor:pointer; accent-color:#818cf8; outline:none;"
                        oninput="document.getElementById('sys-lvl-val-${unit.id}').innerText = this.value; setSystemLevel('${unit.id}', this.value)">
                    <span id="sys-lvl-val-${unit.id}" style="font-size:0.8rem; font-weight:700; color:#e0e7ff; background:rgba(99,102,241,0.3); padding:1px 6px; border-radius:4px; min-width:18px; text-align:center;">${currentSysLvl}</span>
                    <span style="font-size:0.65rem; color:rgba(165,180,252,0.4);">MAX LV. ${cfg.max || 100}</span>
                </div>`;
            } else {
                return `<div class="system-level-bar" style="display:flex; align-items:center; gap:8px; padding:4px 15px; background:rgba(99,102,241,0.06); border-bottom:1px solid var(--card-border);">
                    <span style="font-size:0.65rem; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:0.5px;">${cfg.label || 'System Level'}</span>
                    <input type="number" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                        style="width:45px; padding:1px 4px; background:rgba(0,0,0,0.4); border:1px solid rgba(99,102,241,0.3); border-radius:4px; color:#e0e7ff; font-size:0.8rem; font-weight:700; text-align:center;"
                        onchange="setSystemLevel('${unit.id}', this.value)" onkeyup="if(event.key==='Enter') setSystemLevel('${unit.id}', this.value)">
                    <span style="font-size:0.65rem; color:rgba(165,180,252,0.4); margin-left: auto;">MAX LV. ${cfg.max || 100}</span>
                </div>`;
            }
        })() : ''}
        ${customNoticeHtml}`;

    let mainContent = '';
    ['base', 'abil'].forEach(type => {
        mainContent += `<div class="top-builds-list build-list-container mode-${type} mode-fixed cfg-0" id="results-${type}-fixed-0-${unit.id}"></div>`;
    });

    let traitBadgeHtml = '';
    if (unit.meta) {
        const guideMode = window.GLOBAL_MODE_SORT;
        if (guideMode !== 'none' && unit.meta[guideMode]) {
            const name = unit.meta[guideMode].split('/')[0].trim();
            const clean = name.split('(')[0].trim();
            const trait = typeof traitsList !== 'undefined' && traitsList.find(t => t.name === clean || t.id === clean.toLowerCase());
            const icon = trait ? `<div class="trait-img-rainbow trait-icon-small"><img src="images/traits/${trait.name}.png" onerror="this.parentElement.style.display='none'"></div>` : '🌟';
            traitBadgeHtml = `<div class="trait-guide-btn" style="font-size: 0.65rem; padding: 2px 6px; cursor: default; background: linear-gradient(135deg, #a855f7, #6366f1); border-color: #818cf8; font-weight: bold; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${icon} ${name}</div>`;
        } else {
            traitBadgeHtml = `<button class="trait-guide-btn" onclick="openTraitGuide('${unit.id}')" style="font-size: 0.65rem; padding: 2px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📋 Rec. Traits</button>`;
        }
    }

    return createBaseUnitCard(unit, {
        id: 'card-' + unit.id,
        additionalClasses: (window.activeAbilityIds?.has(unit.id) ? ' use-ability' : '') + ' lazy-build-load',
        bannerContent: `<div class="unit-hero">
            <div class="unit-badge-stack">
                <div class="banner-badges">
                    <div class="placement-badge">Max Place: ${dynamicPlacement}</div>
                    <div class="placement-badge" style="color: #4ade80; border-color: rgba(74, 222, 128, 0.3);">DPS Rank: #${absoluteIndex}</div>
                    ${getSynergyBadgeHtml(unit, activeMode)}
                </div>
            </div>
            <div class="unit-image-frame">${getUnitImgHtml(unit, 'unit-avatar')}</div>
            <div class="unit-title"><div class="unit-title-text"><h2>${unit.name}</h2><span>${unit.role}</span><small>${unit.placementType || 'Ground'}</small></div>${traitBadgeHtml}</div>
        </div>`,
        topControls, bottomControls, mainContent
    });
}

// Pagination Controls & Display
function buildPaginationControls(totalUnits, activePage, totalPages) {
    const upp = getUnitsPerPage();
    const start = (activePage - 1) * upp + 1;
    const end = Math.min(activePage * upp, totalUnits);

    let pageButtons = '';
    const maxVisible = 5;
    let startPage = Math.max(1, activePage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) pageButtons += `<button class="pg-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) pageButtons += `<span class="pg-ellipsis">...</span>`;

    for (let p = startPage; p <= endPage; p++) {
        pageButtons += `<button class="pg-btn${p === activePage ? ' pg-active' : ''}" onclick="goToPage(${p})">${p}</button>`;
    }

    if (endPage < totalPages - 1) pageButtons += `<span class="pg-ellipsis">...</span>`;
    if (endPage < totalPages) pageButtons += `<button class="pg-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;

    return `<div class="pagination-bar">
        <button class="pg-btn pg-nav" onclick="goToPage(${activePage - 1})" ${activePage <= 1 ? 'disabled' : ''}>‹ Prev</button>
        <div class="pg-numbers">${pageButtons}</div>
        <button class="pg-btn pg-nav" onclick="goToPage(${activePage + 1})" ${activePage >= totalPages ? 'disabled' : ''}>Next ›</button>
        <span class="pg-info">Showing ${start}–${end} of ${totalUnits}</span>
    </div>`;
}

function renderCurrentPage() {
    const container = document.getElementById('dbPage');
    if (!container) return;

    if (window.buildLoadObserver) {
        window.buildLoadObserver.disconnect();
        window.buildLoadObserver = null;
    }
    window.pendingBuildRenders = window.pendingBuildRenders || new Set();

    const scheduleBuildRender = (unitId, forceSync = false, renderLimit = 100) => {
        if (!unitId || !window.getUnitById?.(unitId)) return;
        const key = `${unitId}:${renderLimit}:${forceSync ? 1 : 0}`;
        if (window.pendingBuildRenders.has(key)) return;
        window.pendingBuildRenders.add(key);

        const run = () => {
            window.pendingBuildRenders.delete(key);
            if (!document.getElementById('card-' + unitId)) return;
            try {
                updateBuildListDisplay(unitId, forceSync, renderLimit);
            } catch (e) {
                console.error('[INVENTORY-MODE-DIAG] renderCurrentPage updateBuildListDisplay failed', e, { unitId });
            }
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(run, { timeout: 1000 });
        } else {
            window.requestAnimationFrame(run);
        }
    };

    const upp = getUnitsPerPage();
    const totalUnits = paginatedSortedUnits.length;
    const totalPages = Math.max(1, Math.ceil(totalUnits / upp));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * upp;
    const pageUnits = paginatedSortedUnits.slice(startIdx, startIdx + upp);

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    pageUnits.forEach((entry, i) => {
        const existing = document.getElementById('card-' + entry.unit.id);
        if (existing?.parentElement?.id === 'hotbarHiddenRender') existing.remove();

        const absoluteRank = window.unitAbsoluteRanks?.[entry.unit.id] || (startIdx + i + 1);
        const card = renderUnitCard(entry.unit, absoluteRank);
        card.classList.add('lazy-build-load');
        card.style.setProperty('--stagger-delay', `${i * 50}ms`);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);

    const pgHtml = buildPaginationControls(totalUnits, currentPage, totalPages);
    const topPg = document.getElementById('topPagination');
    if (topPg) {
        topPg.innerHTML = pgHtml;
        topPg.classList.toggle('hidden', totalPages <= 1);
    }

    const pgWrapper = document.createElement('div');
    pgWrapper.className = 'pagination-wrapper bottom-pagination' + (totalPages <= 1 ? ' hidden' : '');
    pgWrapper.innerHTML = pgHtml;
    container.appendChild(pgWrapper);

    window.buildLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const unitId = entry.target.id.replace('card-', '');
            if (entry.isIntersecting) {
                window.visibleUnitIds.add(unitId);
                scheduleBuildRender(unitId, false, 100);
                entry.target.classList.remove('lazy-build-load');
            } else {
                window.visibleUnitIds.delete(unitId);
                entry.target.classList.add('lazy-build-load');
            }
        });
    }, { rootMargin: '200px' });

    container.querySelectorAll('.lazy-build-load').forEach(c => {
        window.buildLoadObserver.observe(c);
        const unitId = c.id.replace('card-', '');
        window.visibleUnitIds.add(unitId);
        scheduleBuildRender(unitId, false, 100);
    });
}

window.goToPage = function (page) {
    const totalPages = Math.max(1, Math.ceil(paginatedSortedUnits.length / getUnitsPerPage()));
    if (page < 1 || page > totalPages) return;
    if (window.buildLoadObserver) {
        window.buildLoadObserver.disconnect();
        window.buildLoadObserver = null;
    }
    window.pendingBuildRenders = new Set();
    currentPage = page;
    renderCurrentPage();
    document.querySelector('.dashboard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
};

// Database Querying & Filtering
function renderDatabase() {
    const container = document.getElementById('dbPage');
    if (!container) return;
    if (renderQueueId) { cancelAnimationFrame(renderQueueId); renderQueueId = null; }
    renderQueueIndex = 0;
    if (!window.STATIC_BUILD_DB) window.cachedResults = {};
    window.unitBuildsCache = {};
    window.unitActiveBuilds = {};
    window.bestHydratedBuildCache = {};
    window.LIVE_SCORE_CACHE = {};
    globalFilterUnits(document.getElementById('globalSearch')?.value || '');
}

const ELEMENT_SEARCH_VALUES = ['water', 'fire', 'rose', 'wind', 'ice', 'light', 'dark'];
const PLACEMENT_SEARCH_VALUES = ['ground', 'hybrid', 'hill'];

function getUnitElement(unit) {
    return String(unit?.element || unit?.stats?.element || unit?.meta?.element || '').trim();
}

function stripHtml(value) {
    return String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/[_-]/g, ' ')
        .replace(/[()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function flattenSearchValue(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(flattenSearchValue);
    if (typeof value === 'object') {
        return Object.values(value).flatMap(flattenSearchValue);
    }
    return [stripHtml(value)];
}

function getUnitNameSearchText(unit) {
    const tags = Array.isArray(unit?.tags) ? unit.tags : [];

    return [
        stripHtml(unit?.name),
        stripHtml(unit?.id),
        ...tags.map(stripHtml)
    ].filter(Boolean).join(' | ');
}

function getUnitSearchText(unit) {
    const abilityList = Array.isArray(unit?.ability) ? unit.ability : (unit?.ability ? [unit.ability] : []);
    const passiveList = Array.isArray(unit?.passives) ? unit.passives : [];
    const modeList = Array.isArray(unit?.modes) ? unit.modes : [];

    return [
        ...flattenSearchValue(unit?.name),
        ...flattenSearchValue(unit?.role),
        ...flattenSearchValue(unit?.id),
        ...flattenSearchValue(unit?._fileName),
        ...flattenSearchValue(unit?.placementType || 'Ground'),
        ...flattenSearchValue(getUnitElement(unit)),
        ...flattenSearchValue(unit?.tags),
        ...flattenSearchValue(unit?.meta?.short),
        ...flattenSearchValue(unit?.meta?.long),
        ...flattenSearchValue(abilityList.map(a => `${a?.abilityName || ''} ${a?.desc || ''} ${a?.name || ''}`)),
        ...flattenSearchValue(passiveList.map(p => `${p?.name || ''} ${p?.desc || ''}`)),
        ...flattenSearchValue(modeList.map(m => `${m?.name || ''} ${m?.desc || ''}`))
    ].filter(Boolean).join(' ').toLowerCase();
}

function getSearchTokens(term) {
    return String(term || '')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(token => token.replace(/[:.,;()[\]{}]/g, ''))
        .filter(Boolean);
}

function getSearchElement(term) {
    return getSearchTokens(term).find(token => ELEMENT_SEARCH_VALUES.includes(token));
}

function unitMatchesSearchTerm(unit, term) {
    const tokens = getSearchTokens(term);
    if (!tokens.length) return true;

    const elementTokens = tokens.filter(token => ELEMENT_SEARCH_VALUES.includes(token));
    const placementTokens = tokens.filter(token => PLACEMENT_SEARCH_VALUES.includes(token));
    const genericTokens = tokens.filter(token =>
        !ELEMENT_SEARCH_VALUES.includes(token) &&
        !PLACEMENT_SEARCH_VALUES.includes(token) &&
        token !== 'element' &&
        token !== 'type'
    );

    if (!elementTokens.length && !placementTokens.length && !genericTokens.length) {
        return false;
    }

    const unitElement = getUnitElement(unit).toLowerCase();
    if (elementTokens.length && !elementTokens.every(token => unitElement.includes(token))) {
        return false;
    }

    const placement = (unit.placementType || 'Ground').toLowerCase();
    if (placementTokens.length) {
        const matchesPlacement = placement === 'hybrid'
            ? placementTokens.some(token => ['ground', 'hybrid', 'hill'].includes(token))
            : placementTokens.includes(placement);
        if (!matchesPlacement) return false;
    }

    const genericPhrase = genericTokens.length > 1 ? genericTokens.join(' ') : '';
    const nameSearchText = getUnitNameSearchText(unit);

    if (genericPhrase && !nameSearchText.includes(genericPhrase)) {
        return false;
    }

    const searchText = getUnitSearchText(unit);
    if (genericTokens.length && !genericTokens.every(token => searchText.includes(token))) {
        return false;
    }

    return true;
}

// --- DEBOUNCED GLOBAL SEARCH PIPELINE ---
let globalFilterTimeout = null;

window.globalFilterUnits = (term) => {
    if (globalFilterTimeout) clearTimeout(globalFilterTimeout);

    globalFilterTimeout = setTimeout(() => {
        _executeGlobalFilter(term);
    }, 120);
};

// Optimized single-pass filtering and sorting execution
function _executeGlobalFilter(term) {
    const searchTerm = (term || '').trim().toLowerCase();
    const clearBtn = document.getElementById('globalSearchClear');
    if (clearBtn) clearBtn.style.display = searchTerm ? 'flex' : 'none';
    window.LIVE_SCORE_CACHE = {};
    window.unitActiveBuilds = {};
    window.hotbarFilteredBuilds = {};
    window.bestHydratedBuildCache = {};

    const assignedInventoryUnitIds = new Set(Object.keys(window.inventoryUnitTraits || {}));
    const hasInventoryAssignments = assignedInventoryUnitIds.size > 0;
    const selectedElement = getSearchElement(term) || document.getElementById('unitElementSort')?.value || 'none';

    const baseList = window.inventoryMode && hasInventoryAssignments
        ? unitDatabase.filter(unit => assignedInventoryUnitIds.has(unit.id))
        : unitDatabase;

    const allSorted = baseList.map(unit => ({
        unit,
        maxScore: window.getLiveScore(unit)
    })).sort((a, b) => b.maxScore - a.maxScore);

    window.unitAbsoluteRanks = {};
    allSorted.forEach((entry, i) => {
        window.unitAbsoluteRanks[entry.unit.id] = i + 1;
    });

    let filtered = allSorted;

    if (selectedElement !== 'none') {
        filtered = filtered.filter(entry => getUnitElement(entry.unit).toLowerCase() === selectedElement.toLowerCase());
    }

    if (searchTerm) {
        filtered = filtered.filter(entry => {
            const unit = entry.unit;
            let matches = unitMatchesSearchTerm(unit, searchTerm);

            if (!matches) {
                matches = [unit.meta?.short, unit.meta?.long].some(v => v?.toLowerCase().includes(searchTerm));
                if (!matches && typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unit.id]) {
                    matches = unitSpecificTraits[unit.id].some(t => t?.name?.toLowerCase().includes(searchTerm));
                }
                if (!matches && window.STATIC_BUILD_DB) {
                    const ab = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;
                    const dbKey = unit.id + (ab?.noToggle && !unit.allowMultipleModes && window.STATIC_BUILD_DB[unit.id + "_abil"] ? "_abil" : "");
                    const list = window.STATIC_BUILD_DB[dbKey]?.fixed?.[0] || window.STATIC_BUILD_DB[dbKey]?.f?.[0] || window.STATIC_BUILD_DB[unit.id]?.fixed?.[0];
                    if (list) {
                        matches = list.some(b => {
                            const traitName = typeof b.t === 'number' && typeof traitsList !== 'undefined' ? traitsList[b.t]?.name : b.traitName || b.trait || b.t || '';
                            const setName = typeof b.s === 'number' && typeof SETS !== 'undefined' ? SETS[b.s]?.name : b.setName || b.s || '';
                            const combo = `${b.mainStats?.body || ''} ${b.mainStats?.legs || ''}`;
                            const head = HEAD_CONFIG[b.headUsed]?.name || '';
                            const buildSearch = `${traitName} ${setName} ${b.prio || ''} ${combo} ${head} ${b.spa || ''} ${b.range || ''} ${JSON.stringify(b.subStats || {})}`;
                            return buildSearch.toLowerCase().includes(searchTerm);
                        });
                    }
                }
            }
            return matches;
        });
    }

    paginatedSortedUnits = filtered;

    paginatedSortedUnits.forEach(entry => {
        const u = entry.unit;
        let mode = getPreferredModeIdx(u.id, u);
        const upgrades = u.modes?.[mode]?.upgrades || u.upgrades;
        if (window.unitELevels[u.id] === undefined && upgrades) {
            window.unitELevels[u.id] = upgrades.length - 1;
        }
    });

    currentPage = 1;
    renderCurrentPage();
}

window.clearGlobalSearch = () => {
    ['globalSearch', 'sidebarSearch'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    globalFilterUnits('');
};

const escapeAttr = value => String(value ?? '')
    .replace(/&/g, String.fromCharCode(38, 97, 109, 112, 59))
    .replace(/"/g, String.fromCharCode(38, 113, 117, 111, 116, 59))
    .replace(/'/g, String.fromCharCode(38, 35, 51, 57, 59));

function resolveUnitTrait(unitId, traitIdent) {
    if (!traitIdent || traitIdent === 'none') return null;

    const unitSpecific = unitSpecificTraits?.[unitId] || [];
    const allTraits = [...(traitsList || []), ...(customTraits || []), ...unitSpecific];
    const directMatch = allTraits.find(t => t.id === traitIdent || t.name === traitIdent);
    if (directMatch) return directMatch;

    return (typeof getTraitByName === 'function' && getTraitByName(traitIdent, unitId))
        || (typeof getTraitFast === 'function' && getTraitFast(traitIdent))
        || (typeof getTraitById === 'function' && getTraitById(traitIdent, unitId));
}

window.applyUnitTrait = function (unitId, traitName) {
    const unit = (typeof getUnitById === 'function') ? getUnitById(unitId) : null;
    const trait = resolveUnitTrait(unitId, traitName);

    if (!unit || !trait) {
        callIfFn('showToast', 'Unable to apply trait: trait not found.');
        return;
    }

    window.unitTraits = window.unitTraits || {};
    window.unitTraits[unitId] = trait.name;

    window.LIVE_SCORE_CACHE = {};
    window.bestHydratedBuildCache = {};
    window.cachedResults = {};
    if (typeof window.resetCachesForBuffChange === 'function') {
        window.resetCachesForBuffChange(unitId);
    }

    if (typeof window.refreshActiveBuild === 'function' && unit) {
        window.refreshActiveBuild(unit);
    }

    if (typeof window.updateBuildListDisplay === 'function') {
        window.updateBuildListDisplay(unitId, true);
    }

    if (window.CALCULATION_MODE === 'loadout') {
        if (typeof window.recalculateHotbarTeam === 'function') {
            window.recalculateHotbarTeam();
        }
        if (typeof window.updateHotbarUI === 'function') {
            window.updateHotbarUI();
        }
    } else if (typeof window.resortUnitCards === 'function') {
        window.resortUnitCards();
    }

    if (typeof window.renderGuides === 'function' && document.getElementById('guidesPage')?.classList.contains('active')) {
        window.renderGuides();
    }

    if (document.getElementById('universalModal')?.classList.contains('is-visible')) {
        window.openTraitBestList(unitId);
    }
};

// Trait Leaderboards
function openTraitBestList(unitId) {
    const unit = window.getUnitById(unitId);
    if (!unit) return;

    const isLoadout = (window.CALCULATION_MODE === 'loadout');
    const activeType = (window.activeAbilityIds?.has(unitId) && unit.ability) ? 'abil' : 'base';

    let builds = window.unitBuildsCache[unitId]?.[activeType]?.fixed?.[0] || [];

    if (!builds || builds.length === 0) {
        const db = isLoadout ? (window.HOTBAR_STATIC_BUILD_DB || window.STATIC_BUILD_DB) : window.STATIC_BUILD_DB;
        builds = window.getRelicDbEntry(db, unitId, activeType) || [];
    }

    if (!builds || builds.length === 0) {
        showUniversalModal({ title: 'TRAIT LEADERBOARD', content: '<div class="msg-empty">No builds calculated. Please wait for calculation to finish.</div>', size: 'modal-sm' });
        return;
    }

    // Hydrate all builds first to get accurate DPS values for the current context
    const hydratedBuilds = builds.map(b => hydrateBuildEntry(b, unitId, isLoadout)).filter(Boolean);

    const bestByTrait = new Map();
    hydratedBuilds.forEach(b => {
        const existing = bestByTrait.get(b.traitName);
        const currentScore = getBuildSortScore(b);
        const existingScore = getBuildSortScore(existing);
        if (!existing || currentScore > existingScore) {
            bestByTrait.set(b.traitName, b);
        }
    });

    const sortedTraits = Array.from(bestByTrait.values())
        .sort((a, b) => {
            return getBuildSortScore(b) - getBuildSortScore(a);
        });

    let tagsHtml = '';
    if (window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(cfg => {
            if (window[cfg.stateKey]) {
                tagsHtml += `<span style="background: ${cfg.color}33; color: ${cfg.color}; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; border: 1px solid ${cfg.color}4D;">${cfg.tagLabel}</span>`;
            }
        });
    }
    if (window.activeAbilityIds?.has(unitId) && unit.ability) {
        tagsHtml += `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; border: 1px solid rgba(168, 85, 247, 0.3);">Ability Active</span>`;
    }

    let html = `<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="width: 56px; height: 56px; flex-shrink: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);">
            <img src="${unit.img}" style="width: 110%; height: 110%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
            <div class="text-xl font-bold text-white leading-tight" style="display: flex; align-items: center; gap: 8px; letter-spacing: -0.5px;">${unit.name}</div>
            <div class="text-xs text-dim font-bold" style="margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">${unit.role} ${unit.stats.element ? `• ${unit.stats.element}` : ''}</div>
            ${tagsHtml ? `<div style="margin-top: 8px; display: flex; gap: 6px;">${tagsHtml}</div>` : ''}
        </div>
    </div>`;

    const isPotential = window.CALCULATION_MODE === 'potential';
    html += `<table class="compare-table" style="border-collapse: separate; border-spacing: 0 4px;">
        <thead>
            <tr>
                <th style="width: 8%; text-align: center;">#</th>
                <th style="width: ${isPotential ? '30%' : '25%'}">Trait</th>
                <th style="width: ${isPotential ? '42%' : '32%'}">Best Setup</th>
                <th style="width: 20%; text-align: right;">Potential</th>
                ${isPotential ? '' : '<th style="width: 15%; text-align: center;">Action</th>'}
            </tr>
        </thead>
        <tbody>`;

    const mapStat = s => ({ cf: 'Crit', cm: 'CDmg', spa: 'SPA', range: 'Rng', dot: 'DoT' }[s] || 'Dmg');

    sortedTraits.forEach((b, idx) => {
        const isBossHigher = b.bossDps > (b.dps || 0);
        const val = format(isBossHigher ? b.bossDps : (b.dps || 0));
        const label = isBossHigher ? 'BOSS' : 'DPS';
        const tObj = getTraitByName(b.traitName, unitId);
        const setupText = `<b class="text-white">${b.setName}</b> <span class="text-dim text-xs">(${mapStat(b.mainStats.body)}/${mapStat(b.mainStats.legs)})</span>${b.headUsed && b.headUsed !== 'none' ? ` + ${HEAD_CONFIG[b.headUsed]?.name || 'Head'}` : ''}`;

        let rankStyle = idx === 0 ? 'color: #fbbf24; font-weight: 900; font-size: 1.2em; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4);'
            : idx === 1 ? 'color: #e2e8f0; font-weight: 800; font-size: 1.1em;'
                : idx === 2 ? 'color: #b45309; font-weight: 800; font-size: 1.1em;'
                    : 'opacity: 0.6; font-size: 0.85em; font-family: monospace;';

        const isActive = (window.unitTraits?.[unitId] === b.traitName) || (!window.unitTraits?.[unitId] && idx === 0);
        const actionBtn = isActive
            ? `<span style="color: #10b981; font-weight: bold; font-size: 0.75rem;">ACTIVE</span>`
            : `<button class="calc-btn ut-btn-compact" onclick="window.applyUnitTrait('${escapeAttr(unitId)}', '${escapeAttr(b.traitName)}')" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981; color: white; padding: 4px 10px; font-size: 0.75rem; font-weight: bold; border-radius: 4px; cursor: pointer;">SELECT</button>`;

        html += `<tr style="${idx === 0 ? 'background: rgba(251, 191, 36, 0.04);' : ''}">
            <td style="text-align: center; padding: 10px 5px;"><span style="${rankStyle}">#${idx + 1}</span></td>
            <td style="padding: 10px 5px;">
                <div style="display: flex; align-items: center;">
                    ${tObj ? `<div class="trait-img-rainbow" style="width: 22px; height: 22px; margin-right: 10px; flex-shrink: 0;"><img src="images/traits/${tObj.name}.png" onerror="this.parentElement.style.display='none'"></div>` : ''}
                    <span class="comp-tag" style="margin: 0; font-weight: 700; font-size: 0.85rem;">${b.traitName}</span>
                </div>
            </td>
            <td style="padding: 10px 5px;">
                <div class="text-sm">${setupText}</div>
                <div class="text-xs" style="margin-top: 2px; color: rgba(255,255,255,0.4);">Prio: <span class="text-custom" style="font-weight: 600;">${b.prio.toUpperCase()}</span></div>
            </td>
            <td style="text-align: right; padding: 10px 5px;">
                <div class="comp-highlight" style="font-weight: 800; font-size: 1rem; ${isBossHigher ? 'color: #fca5a5;' : ''}">${val} <span class="comp-val-label ${(isBossHigher ? 'comp-val-boss' : 'comp-val-dps')}" style="${isBossHigher ? 'color: #f87171;' : ''}">${label}</span></div>
                ${isBossHigher ? `<div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; margin-top: 2px;">${format(b.dps)} <span style="opacity: 0.6; font-size: 0.6rem;">BASE</span></div>` : ''}
            </td>
            ${isPotential ? '' : `<td style="text-align: center; padding: 10px 5px;">${actionBtn}</td>`}
        </tr>`;
    });

    html += `</tbody></table>`;
    showUniversalModal({ title: `<span class="text-gold">TRAIT LEADERBOARD</span>`, content: html, size: 'modal-lg' });
}

window.viewBuildRelicDatabase = function (buildId, unitId) {
    let build = window.cachedResults[buildId];
    if (!build && window.unitBuildsCache[unitId]) {
        const cache = window.unitBuildsCache[unitId];
        const allBuilds = [
            ...(cache.base?.fixed?.[0] || []),
            ...(cache.abil?.fixed?.[0] || [])
        ];
        build = allBuilds.find(b => b.id === buildId);
    }
    if (!build) return;

    let headSetId = build.headUsed || 'none';
    const accessoryToSetMap = {
        'fused_earrings': 'fused_set',
        'warlord_hat': 'warlord'
    };
    if (accessoryToSetMap[headSetId]) headSetId = accessoryToSetMap[headSetId];

    let bodySetId = 'none';
    let legsSetId = 'none';

    if (build.relicIds) {
        const headRelic = (window.relicInventory || []).find(relic => relic.id === build.relicIds.head);
        const bodyRelic = (window.relicInventory || []).find(relic => relic.id === build.relicIds.body);
        const legsRelic = (window.relicInventory || []).find(relic => relic.id === build.relicIds.legs);
        if (headRelic) headSetId = headRelic.setKey;
        if (bodyRelic) bodySetId = bodyRelic.setKey;
        if (legsRelic) legsSetId = legsRelic.setKey;
    } else {
        const foundSet = (window.SETS || []).find(s => s.name === build.setName || s.id === build.setName || (s.name + ' Set') === build.setName || s.name.toLowerCase() === build.setName.toLowerCase());
        if (foundSet) {
            bodySetId = foundSet.id;
            legsSetId = foundSet.id;
        }
    }

    window.customRelicSetup = {
        head: headSetId,
        body: bodySetId,
        legs: legsSetId,
        buildName: build.setName,
        traitName: build.traitName
    };

    if (typeof switchPage === 'function') {
        switchPage('relics');
    }
    if (typeof window.renderRelicDatabase === 'function') {
        window.renderRelicDatabase();
    }
};

// Global Exports
window.renderUnitCard = renderUnitCard;
window.renderListInternal = undefined;
window.updateBuildListDisplay = updateBuildListDisplay;
window.openTraitBestList = openTraitBestList;

window.processUnitCache = function (unit, specificCfg = null, specificType = null) {
    if (!window.unitBuildsCache[unit.id]) {
        window.unitBuildsCache[unit.id] = { base: { fixed: [null] }, abil: { fixed: [null] } };
    }

    const CONFIGS = [{ head: true, subs: !window.disableSubStats }];

    const performCalSet = (mode, useAbility, targetCache) => {
        let dbKey = unit.id + (useAbility && unit.ability ? '_abil' : '');
        const useInventory = (window.inventoryMode === true);

        if (window.inventoryMode) {
            console.debug('[INVENTORY-MODE-DIAG] processUnitCache performCalSet', {
                unitId: unit.id,
                mode,
                useAbility,
                dbKey,
                useInventory,
                inventoryLength: window.relicInventory?.length || 0,
                assignedTrait: window.getInventoryAssignedTrait?.(unit.id) || null
            });
        }

        for (let i = 0; i < 1; i++) {
            if (targetCache[i] !== null) continue;
            const cfg = CONFIGS[i];
            let calculatedResults = [];

            if (!useInventory) {
                const dbTable = window.STATIC_BUILD_DB?.[dbKey] || window.STATIC_BUILD_DB?.[unit.id];
                const dbList = dbTable?.[mode] || dbTable?.[mode === 'fixed' ? 'f' : 'b'];
                if (dbList && dbList[i]) {
                    calculatedResults = dbList[i].map(r => ({ ...r }));
                }

                const anyGlobal = window.GLOBAL_BUFF_DATA && Object.values(window.GLOBAL_BUFF_DATA).some(b => !b.hideButton && !!window[b.stateKey]) || window.disableSubStats;
                if (anyGlobal && calculatedResults.length > 0) {
                    calculatedResults = calculatedResults.map(r => {
                        const setName = r.setName || (typeof r.s === 'number' ? SETS[r.s]?.id : r.s) || window.getSetFast?.(r.setName)?.id;
                        const traitId = r.traitName || r.trait || (typeof r.t === 'number' ? traitsList[r.t]?.id : r.t);
                        if (!setName || !traitId) return r;

                        const singleBuilds = (window.getFilteredBuilds?.() || []).filter(b => b.setName === setName);
                        const singleTrait = traitsList.find(t => t.id === traitId || t.name === traitId);
                        const optResList = window.calculateUnitBuilds(
                            unit, null, singleBuilds, window.getValidSubCandidates?.() || [], HEADS_LIST,
                            cfg.subs, singleTrait ? [singleTrait] : null, useAbility, mode
                        );
                        return optResList?.reduce((best, cur) => {
                            const curScore = Math.max(cur.dps || 0, cur.bossDps || 0);
                            const bestScore = Math.max(best.dps || 0, best.bossDps || 0);
                            return curScore > bestScore ? cur : best;
                        }, optResList[0]) || r;
                    });
                }
            }

            calculatedResults.forEach(r => { if (r.id) window.cachedResults[r.id] = r; });

            const selectedTraitId = window.unitTraits?.[unit.id];
            const selectedTrait = selectedTraitId ? getTraitFast(selectedTraitId) : null;
            const traitsForCalc = selectedTrait ? [selectedTrait] : null;

            const selectedHead = window.unitHeads?.[unit.id] || 'none';
            const headsForCalc = selectedHead !== 'none' ? [selectedHead] : (cfg.head ? HEADS_LIST : ['none']);

            let dynamicResults = [];
            try {
                dynamicResults = calculateUnitBuilds(unit, null, getFilteredBuilds(), getValidSubCandidates(), headsForCalc, cfg.subs, traitsForCalc, useAbility, mode);
            } catch (e) {
                console.error('[INVENTORY-MODE-DIAG] processUnitCache calculateUnitBuilds failed', e, {
                    unitId: unit.id,
                    mode,
                    useAbility,
                    inventoryMode: window.inventoryMode,
                    inventoryLength: window.relicInventory?.length || relicInventory?.length || 0
                });
            }
            if (window.inventoryMode) {
                console.debug('[INVENTORY-MODE-DIAG] processUnitCache dynamicResults', {
                    unitId: unit.id,
                    mode,
                    useAbility,
                    resultCount: dynamicResults?.length || 0,
                    topDps: dynamicResults?.[0]?.dps || 0,
                    topRelicIds: dynamicResults?.[0]?.relicIds || null
                });
            }
            if (dynamicResults.length > 0) {
                const seen = new Set(calculatedResults.map(r => r.id));
                dynamicResults.forEach(r => {
                    if (!seen.has(r.id)) {
                        calculatedResults.push(r);
                        seen.add(r.id);
                    }
                });
            }

            calculatedResults.sort((a, b) => {
                const scoreA = Math.max(a.dps || a.d || 0, a.bossDps || a.bd || a.bossTotal || 0);
                const scoreB = Math.max(b.dps || b.d || 0, b.bossDps || b.bd || b.bossTotal || 0);
                return scoreB - scoreA;
            });
            targetCache[i] = calculatedResults;
        }
    };

    if (!specificType || specificType === 'base') performCalSet('fixed', false, window.unitBuildsCache[unit.id].base.fixed);
    if (unit.ability && (!specificType || specificType === 'abil')) performCalSet('fixed', true, window.unitBuildsCache[unit.id].abil.fixed);
};

setTimeout(() => {
    const key = 'angel_born_in_hell';
    if (window.unitControls && window.unitControls[key]) {
        const original = window.unitControls[key];
        window.unitControls[key] = function (unit) {
            let html = original(unit);
            if (unit.tags && (unit.tags.includes('Fusion') || unit.tags.includes('Fused')) && html.includes('Super Warrior')) {
                html = html.replace(/UNRIVALED: \+30% DMG \/ -10% CD \(Super Warrior\)/g, 'UNRIVALED: +50% DMG / +50% CDmg (Fusion)');
                html = html.replace(/unrivaled-badge-super-warrior/g, 'unrivaled-badge-fusion');
            }
            return html;
        };
    }
}, 1000);