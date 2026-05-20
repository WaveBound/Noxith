// Ensure Global Caches and State are initialized
window.unitBuildsCache = window.unitBuildsCache || {};
window.cachedResults = window.cachedResults || {};
window.unitELevels = window.unitELevels || {};
window.unitSystemLevels = window.unitSystemLevels || {};
window.unitTraits = window.unitTraits || {};
window.unitHeads = window.unitHeads || {};
window.unitModesState = window.unitModesState || {};

// Single Source of Truth for Head Item UI mapping in rendering
const HEAD_CONFIG = {
    'sun_god': { name: 'Sun God', search: 'Sun God', cls: 'sungod' },
    'ninja': { name: 'Junior Ninja', search: 'Junior Ninja', cls: 'ninja' },
    'reaper_necklace': { name: 'Reaper', search: 'Reaper', cls: 'reaper' },
    'shadow_reaper_necklace': { name: 'S. Reaper', search: 'Shadow Reaper', cls: 'sreaper' },
    'junior': { name: 'Junior Ninja', search: 'Junior', cls: 'ninja' },
    'biju_head': { name: 'Biju', search: 'Biju', cls: 'sungod' },
    'reanimated_head': { name: 'Reanimated', search: 'Reanimated', cls: 'reaper' },
    'bloodline_head': { name: 'Bloodline', search: 'Bloodline', cls: 'ninja' },
    'sorcerer_hunter_spirit': { name: 'S.H. Spirit', search: 'S. Hunter', cls: 'custom' },
    'strongest_sorcerer_glasses': { name: 'Strongest', search: 'Strongest', cls: 'custom' },
    'monarch': { name: 'Monarch Cape', search: 'Monarch', cls: 'custom' },
    'warlord_hat': { name: 'Warlord Hat', search: 'Warlord', cls: 'custom' },
    'mochi_scarf': { name: 'Mochi Scarf', search: 'Mochi', cls: 'custom' },
    'flaming_donut': { name: 'Flaming Donut', search: 'Flaming Donut', cls: 'custom' }
};

// Config for Custom Ability Buttons
const TOGGLE_OVERRIDES = {
    'phantom_captain': { label: 'Planes' },
    'megumin': { label: 'Passive' },
    'vegeta': { label: 'Boss Stacks' },
    'nutaru_beast': { label: 'Beast Mode' },
    'ancient_shinob': { label: 'Reanimation' },
    'super_roku': { label: 'Same Enemy' },
    'cell': {
        dynamicLabel: (isChecked) => isChecked ? 'Perfect Form' : 'True Form',
        script: `this.parentElement.previousElementSibling.innerText = this.checked ? 'Perfect Form' : 'True Form'; this.closest('.unit-toolbar').firstElementChild.style.gap = '2px';`
    }
};

const unitControls = {};

function getUnitControlsHtml(unit) {
    const fileKey = window.getFileName(unit.id);
    return unitControls[fileKey] ? unitControls[fileKey](unit) : '';
}

function createBaseUnitCard(unit, options = {}) {
    const { id = '', additionalClasses = '', bannerContent = '', topControls = '', bottomControls = '', mainContent = '' } = options;
    const card = document.createElement('div');
    card.className = `unit-card ${additionalClasses}`;
    if (id) card.id = id;

    const banner = `<div class="unit-banner">${bannerContent}</div>`;
    card.innerHTML = `${banner}${topControls}${getUnitControlsHtml(unit)}${bottomControls}${mainContent}`;
    return card;
}

function calculateBuildEfficiency(build, unitCost, unitMaxPlacement, unitId) {
    const foundTrait = getTraitByName(build.traitName, unitId);
    const unitObj = window.getUnitById(unitId);

    let traitLimit = null;
    if (build.traitName && build.traitName.includes('Ruler')) {
        traitLimit = 1;
    } else if (foundTrait && foundTrait.limitPlace) {
        traitLimit = foundTrait.limitPlace;
    }

    const abilityRef = Array.isArray(unitObj.ability) ? unitObj.ability[0] : unitObj.ability;
    if (build.id && build.id.includes('ABILITY') && unitObj && unitObj.ability && abilityRef.limitPlace) {
        traitLimit = traitLimit ? Math.min(traitLimit, abilityRef.limitPlace) : abilityRef.limitPlace;
    }

    const actualPlacement = traitLimit ? Math.min(unitMaxPlacement, traitLimit) : unitMaxPlacement;
    const costMult = (foundTrait && foundTrait.costReduction) ? Math.max(0, 1 - (foundTrait.costReduction / 100)) : 1;
    const actualTotalCost = unitCost * actualPlacement * costMult;
    return actualTotalCost === 0 ? 0 : (build.dps / actualTotalCost);
}

function getHeadBadgeHtml(headUsed) {
    if (!headUsed || headUsed === 'none') return '';
    const h = HEAD_CONFIG[headUsed] || { name: 'Unknown', cls: 'unknown' };
    return `<div class="stat-line"><span class="sl-label">HEAD</span><div class="badge-base border-${h.cls}"><span class="text-${h.cls}">${h.name}</span></div></div>`;
}

function generateBuildRowHTML(r, i, unitConfig = {}) {
    const { totalCost = 50000, placement = 1, sortMode = 'dps', unitId = '', benchmarkDps = 0 } = unitConfig;

    const currentLevel = (window.unitELevels && window.unitELevels[unitId]) || 0;
    const nextLevel = currentLevel + 1;
    const unitObj = window.getUnitById(unitId);
    const maxLevel = (unitObj && unitObj.upgrades) ? unitObj.upgrades.length - 1 : 0;
    let nextStats = { dmgVal: 0, spa: 0, range: 0 };
    if (nextLevel <= maxLevel) {
        try {
            const nextMath = reconstructMathData(r, nextLevel);
            if (nextMath) {
                nextStats.dmgVal = nextMath.dmgVal;
                nextStats.spa = nextMath.spa;
                nextStats.range = nextMath.range;
            }
        } catch (e) { console.warn("Next Stats Error", e); }
    }

    let rankClass = (i < 3 ? `rank-${i + 1}` : 'rank-other') + (r.isCustom ? ' is-custom' : '');
    const effScore = calculateBuildEfficiency(r, totalCost, placement, unitId).toFixed(3);

    let optimalityHtml = '';
    if (inventoryMode && benchmarkDps > 0) {
        const optPct = (r.dps / benchmarkDps) * 100;
        let color, glow;
        if (optPct >= 95) { color = '#00ffaa'; glow = 'rgba(0, 255, 170, 0.15)'; }
        else if (optPct >= 80) { color = '#ffcc00'; glow = 'rgba(255, 204, 0, 0.15)'; }
        else { color = '#ff4d4d'; glow = 'rgba(255, 77, 77, 0.15)'; }

        // Changed to a <div>, removed onclick, removed title, added cursor: default
        optimalityHtml = `<div class="optimality-badge" style="color: ${color}; border-color: ${color}33; --glow-color: ${glow}; flex-direction: row; justify-content: center; gap: 6px; width: 100%; box-sizing: border-box; padding: 3px 8px; cursor: default;"><span class="opt-label" style="color: ${color}; margin-bottom: 0;">OPTIMALITY</span><span class="opt-pct">${fix1(optPct)}%</span></div>`;
    }

    const prioConfig = { 'spa': { label: 'SPA STAT', cls: 'prio-spa' }, 'range': { label: 'RANGE STAT', cls: 'prio-range' }, 'default': { label: 'DMG STAT', cls: 'prio-dmg' } };

    let prioHtml = '';
    if (r.relicIds) {
        const hId = r.relicIds.head || 'none';
        const bId = r.relicIds.body || 'none-b';
        const lId = r.relicIds.legs || 'none-l';
        const currentPrio = r.prio || 'default';
        const secCfg = prioConfig[currentPrio] || prioConfig['default'];
        const invBadge = `<button class="prio-badge prio-inv clickable" onclick="viewInventoryItems('${hId}', '${bId}', '${lId}')" title="Locate in Inventory"><img src="https://img.icons8.com/fluency-systems-filled/48/ffffff/backpack.png" alt="Inv"></button>`;
        const statBadge = (unitId === 'joyful_captain') ? '' : `<span class="prio-badge ${secCfg.cls}">${secCfg.label}</span>`;
        prioHtml = `<div class="br-badges">${invBadge}${statBadge}</div>`;
    } else {
        const pCfg = prioConfig[r.prio] || prioConfig['default'];
        prioHtml = (unitId === 'joyful_captain') ? '' : `<span class="prio-badge ${pCfg.cls}">${pCfg.label}</span>`;
    }

    const mainBodyBadge = getBadgeHtml(r.mainStats.body, MAIN_STAT_VALS.body[r.mainStats.body]);
    const mainLegsBadge = getBadgeHtml(r.mainStats.legs, MAIN_STAT_VALS.legs[r.mainStats.legs]);
    const headHtml = getHeadBadgeHtml(r.headUsed);
    const s = window.disableSubStats ? {} : (r.subStats || {});
    const headRow = (!window.disableSubStats && r.headUsed && r.headUsed !== 'none') ? `<div class="stat-line"><span class="sl-label">HEAD</span>${getRichBadgeHtml(s.head || [])}</div>` : '';
    const bodyRow = window.disableSubStats ? '' : `<div class="stat-line"><span class="sl-label">BODY</span>${getRichBadgeHtml(s.body || [])}</div>`;
    const legsRow = window.disableSubStats ? '' : `<div class="stat-line"><span class="sl-label">LEGS</span>${getRichBadgeHtml(s.legs || [])}</div>`;

    const mobileToggle = `<button class="mobile-stat-toggle" onclick="toggleRelicStatDisplay(this)"><span class="m-toggle-txt">Main</span><span class="m-toggle-txt">Sub</span></button>`;

    const isBossHigher = (sortMode === 'dps') && (r.bossDps > (r.dps || 0));
    let displayVal = format(r.sortDps || r.dps || 0), displayLabel = "DPS";
    if (sortMode === 'range') { displayVal = fix1(r.range || 0); displayLabel = "RNG"; }
    else if (isBossHigher) {
        displayLabel = `BOSS DPS`;
    }
    const hasBossDps = isBossHigher || (r.bossDps && r.bossDps !== r.dps);

    return `
        <div class="build-row ${rankClass} ${sortMode === 'efficiency' ? 'is-efficiency-sort' : ''}">
            <div class="br-header" style="align-items: flex-start; padding-top: 6px;">
                <div class="br-header-info" style="margin-top: 2px;"><span class="br-rank">#${i + 1}</span><span class="br-set">${r.setName.toLowerCase().includes('set') ? r.setName : r.setName + ' Set'}</span><span class="br-sep">/</span><span class="br-trait">${r.traitName}</span></div>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                    <div style="display:flex; gap:6px; align-items:center;">${mobileToggle}${hasBossDps ? `<div class="eff-score-line" onclick="event.stopPropagation(); openInfoPopup('efficiency')">${effScore} <span class="eff-label">Eff</span></div>` : ''}${prioHtml}</div>
                    ${optimalityHtml}
                </div>
            </div>
            <div class="br-grid ${window.disableSubStats ? 'no-subs' : ''}">
                <div class="br-col main"><div class="br-col-title">MAIN STAT</div>${headHtml}<div class="stat-line"><span class="sl-label">BODY</span> ${mainBodyBadge}</div><div class="stat-line"><span class="sl-label">LEGS</span> ${mainLegsBadge}</div></div>
                ${window.disableSubStats ? '' : `<div class="br-col sub">
                    <div class="br-col-header"><div class="br-col-title">SUB STAT</div></div>
                    ${headRow}${bodyRow}${legsRow}
                </div>`}
                <div class="br-res-col">
                    ${!hasBossDps ? `<div class="eff-score-line" onclick="event.stopPropagation(); openInfoPopup('efficiency')">${effScore} <span class="eff-label">Eff</span></div>` : ''}
                    <div class="dps-container">
                        <span class="build-dps">${displayVal}</span>
                        <div style="display:flex; align-items:center; gap:4px; justify-content: flex-end; margin-top: 2px;">
                            <span class="dps-label" style="margin:0; ${isBossHigher ? 'color: #fca5a5;' : ''}">${displayLabel}</span>
                            <button class="info-btn" onclick="showMath('${r.id}')">?</button>
                        </div>
                        <div class="boss-dps-mini" style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; margin-top: 4px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                            ${isBossHigher ? `<div style="display: flex; gap: 4px; color: #cbd5e1;"><span style="opacity: 0.6; font-weight: 500;">BASE:</span> ${format(r.dps)}</div>` : ''}
                            ${(!isBossHigher && r.bossDps && r.bossDps !== r.dps) ? `<div style="display: flex; gap: 4px; color: #fca5a5;"><span style="opacity: 0.6; font-weight: 500;">BOSS:</span> ${format(r.bossDps)}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="br-full-stats">
                <div class="fs-comparison-grid">
                    <div class="fs-col-header">CURRENT</div>
                    <div class="fs-col-header">${nextLevel > maxLevel ? 'STATUS' : 'NEXT UPGRADE'}</div>

                    <div class="fs-item-lg dmg-row">
                        <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
                        <span class="fs-val val-dmg">${format(r.dmgVal || 0)}</span>
                    </div>
                    <div class="fs-item-lg dmg-row">
                        <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
                        <span class="fs-val val-dmg">${nextLevel > maxLevel ? '<span style="color:#4ade80; font-weight: bold;">Maxed</span>' : format(nextStats.dmgVal)}</span>
                    </div>

                    <div class="fs-item-lg spa-row">
                        <span class="fs-icon-box spa-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg></span>
                        <span class="fs-val val-spa">${fix2(r.spa || 0)}s</span>
                    </div>
                    <div class="fs-item-lg spa-row">
                        <span class="fs-icon-box spa-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg></span>
                        <span class="fs-val val-spa">${nextLevel > maxLevel ? '<span style="color:#4ade80; font-weight: bold;">Maxed</span>' : fix2(nextStats.spa) + 's'}</span>
                    </div>

                    <div class="fs-item-lg range-row">
                        <span class="fs-icon-box range-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span>
                        <span class="fs-val val-range">${fix1(r.range || 0)}</span>
                    </div>
                    <div class="fs-item-lg range-row">
                        <span class="fs-icon-box range-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span>
                        <span class="fs-val val-range">${nextLevel > maxLevel ? '<span style="color:#4ade80; font-weight: bold;">Maxed</span>' : fix1(nextStats.range)}</span>
                    </div>
                </div>
                <div class="fs-sub-row">
                    <div class="fs-item-sm"><span class="fs-label">Crit %</span><span class="fs-val val-crit">${fix1(s.finalCf || 0)}%</span></div>
                    <div class="fs-item-sm"><span class="fs-label">CDmg</span><span class="fs-val val-cdmg">${(s.finalCm || 0).toFixed(0)}%</span></div>
                    <div class="fs-item-sm"><span class="fs-label">DoT Dmg</span><span class="fs-val val-dot">${format(r.dotTotal || 0)}</span></div>
                </div>
            </div>
        </div>`;
}

function updateBuildListDisplay(unitId, forceSync = false, renderLimit = 150) {
    const card = document.getElementById('card-' + unitId);
    if (!card) return;
    const unitObj = window.getUnitById(unitId);

    const isInHotbarState = window.hotbarState?.slots.some(s => s && (s.id === unitId || s.id.split('-')[0] === unitId.split('-')[0]));
    const isHotbar = card.parentElement?.id === 'hotbarHiddenRender' || !!card.closest('.team-summary-container') || isInHotbarState;

    const hydrateBuildEntry = (r) => {
        if (!r) return null;
        let res;
        if (r.id && r.mainStats && r.setName) {
            res = r;
        } else {
            res = {
                id: r.id || `${unitId}-static-${Math.random().toString(36).substr(2, 9)}`,
                traitName: (typeof r.t === 'number' ? (traitsList[r.t]?.name) : (r.traitName || r.t)) || 'Unknown Trait',
                setName: (typeof r.s === 'number' ? (SETS[r.s]?.name) : (r.setName || r.s)) || 'Unknown Set',
                dps: r.d || r.dps || 0,
                dmgVal: r.dv || r.dmgVal || 0,
                spa: r.sp || r.spa || 0,
                range: r.ra || r.range || 0,
                prio: r.p || r.prio || 'dmg',
                headUsed: (typeof r.h === 'number' ? (['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut'][r.h]) : (r.headUsed || r.h)) || 'none',
                isCustom: !!(r.c || r.isCustom),
                subStats: r.ss || r.subStats || {},
                mainStats: r.ms || r.mainStats || {
                    body: (typeof r.b === 'string' ? r.b : (r.b === 1 ? 'dot' : (r.b === 2 ? 'cm' : 'dmg'))),
                    legs: (typeof r.l === 'string' ? r.l : (r.l === 1 ? 'spa' : (r.l === 2 ? 'cf' : (r.l === 3 ? 'range' : 'dmg'))))
                }
            };
        }

        if (typeof reconstructMathData === 'function') {
            try {
                const fullMath = reconstructMathData(res, undefined, { isHotbar: isHotbar });
                if (fullMath) {
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
                    if (!res.subStats) res.subStats = {};
                    res.subStats.finalCf = fullMath.critData ? fullMath.critData.rate : 0;
                    res.subStats.finalCm = fullMath.critData ? fullMath.critData.cdmg : 0;
                }
                res.dps = res.dps || 0;
                res.sortDps = Math.max(res.dps || 0, res.bossDps || 0);
                res.baseStats = null;
            } catch (e) {
                console.warn("Hydration Math Error for", res.id, e);
            }
        }
        return res;
    };

    const activeModeIdx = (window.unitModesState && window.unitModesState[unitId] !== undefined) ? window.unitModesState[unitId] : 0;
    const systemLevelBar = card.querySelector('.system-level-bar');
    if (systemLevelBar && unitObj && unitObj.systemLevel) {
        const cfg = unitObj.systemLevel;
        let visible = true;
        if (cfg.restrictModes) {
            visible = cfg.restrictModes.includes(activeModeIdx);
        }
        systemLevelBar.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    }

    const activeType = (window.activeAbilityIds && window.activeAbilityIds.has(unitId) && unitObj && unitObj.ability) ? 'abil' : 'base';
    const activeMode = 'fixed';
    const hasCache = !!(window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0]);

    // OPTIMIZATION: Only force sync for multi-mode units if they don't have a cache yet
    if (!forceSync && unitObj && unitObj.allowMultipleModes && !hasCache) {
        forceSync = true;
    }

    const currentUpgrade = (window.unitELevels && window.unitELevels[unitId]) || 0;

    const modeObj = (unitObj && unitObj.modes && unitObj.modes[activeModeIdx]) ? unitObj.modes[activeModeIdx] : null;
    const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unitObj && unitObj.upgrades && unitObj.upgrades.length > 0 ? unitObj.upgrades : null);

    let unitCost = modeObj ? (modeObj.totalCost || (unitObj ? unitObj.totalCost : 50000)) : (unitObj ? (unitObj.totalCost || 50000) : 50000);

    if (upgradesArr) {
        let placementCost = upgradesArr[0].cost || 0;

        if (currentUpgrade > 0) {
            let cumulative = placementCost;
            for (let i = 1; i <= currentUpgrade; i++) {
                if (upgradesArr[i] && upgradesArr[i].cost) {
                    cumulative += upgradesArr[i].cost;
                }
            }
            unitCost = cumulative;
        } else {
            unitCost = placementCost;
        }
    }
    let unitPlace = unitObj ? (unitObj.placement || 1) : 1;
    if (isUnit(unitId, 'water_god')) {
        const hbStats = (typeof getCachedHotbarStats === 'function') ? getCachedHotbarStats() : null;
        if (hbStats && hbStats.ugPresent) {
            unitPlace = Math.max(1, unitPlace - 1);
        }
    }


    let benchmarkDps = 0;
    try {
        if (inventoryMode && window.STATIC_BUILD_DB) {
            let dbKey = unitId;
            if (activeType === 'abil') dbKey += '_abil';

            // Try current buffed DB first
            let dbEntry = window.STATIC_BUILD_DB[dbKey] || {};

            // FALLBACK: If unit not in current buffed DB (skipped by generator), try baseline DB
            if (!dbEntry.fixed && window.GLOBAL_STATIC_BUILD_DB_BASE && window.GLOBAL_STATIC_BUILD_DB_BASE[dbKey]) {
                dbEntry = window.GLOBAL_STATIC_BUILD_DB_BASE[dbKey];
            }

            const modeData = dbEntry[activeMode] || dbEntry[activeMode === 'fixed' ? 'f' : 'b'];
            const perfectBuilds = modeData ? modeData[0] : null;
            if (perfectBuilds && perfectBuilds.length > 0) {
                // Hydrate the benchmark build through hydrateBuildEntry so it goes through reconstructMathData properly
                try {
                    const hydratedBench = hydrateBuildEntry(perfectBuilds[0]);
                    benchmarkDps = hydratedBench ? (hydratedBench.dps || 0) : 0;
                } catch (e) {
                    benchmarkDps = perfectBuilds[0].dps || 0;
                }
            }

            // NEW: If unit has modes and we are forcing a sync (from a mode change),
            // re-calculate the best possible build dynamically. 
            // The static DB only contains results for the "Base" form.
            if (forceSync && unitObj && unitObj.modes) {
                const dynamicResults = calculateUnitBuilds(
                    unitObj,
                    null,
                    null, // No filter
                    ['dmg', 'spa', 'cm', 'cf', 'range', 'dot'],
                    ['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut'],
                    !window.disableSubStats,
                    null,
                    activeType === 'abil',
                    activeMode
                );
                if (dynamicResults && dynamicResults.length > 0) {
                    benchmarkDps = dynamicResults[0].dps || 0;
                    // Cache this new benchmark for this unit/mode combo
                    if (!window.modeBenchmarks) window.modeBenchmarks = {};
                    const stateStr = JSON.stringify(window.unitModesState[unitId]);
                    const modeKey = `${unitId}-${stateStr}-${activeType}`;
                    window.modeBenchmarks[modeKey] = benchmarkDps;

                    // Directly cache the dynamic results so it doesn't fall back to the static DB
                    if (!window.unitBuildsCache[unitId]) window.unitBuildsCache[unitId] = {};
                    if (!window.unitBuildsCache[unitId][activeType]) window.unitBuildsCache[unitId][activeType] = {};
                    window.unitBuildsCache[unitId][activeType][activeMode] = [dynamicResults];
                    // DO NOT return here, we must continue to render the list!
                }
            } else if (unitObj && unitObj.modes) {
                // Check cache if not forcing sync
                const stateStr = JSON.stringify(window.unitModesState[unitId]);
                const modeKey = `${unitId}-${stateStr}-${activeType}`;
                if (window.modeBenchmarks && window.modeBenchmarks[modeKey]) {
                    benchmarkDps = window.modeBenchmarks[modeKey];
                }
            }
        }
    } catch (e) { console.warn("Benchmark error", e); }

    const globalSearchInput = (document.getElementById('globalSearch')?.value || document.getElementById('sidebarSearch')?.value || '').trim().toLowerCase();
    const localSearchInput = card.querySelector('.search-container input')?.value?.toLowerCase() || '';
    const searchInput = localSearchInput || globalSearchInput;
    const prioSelect = card.querySelector('select[data-filter="prio"]')?.value || 'all';
    const setSelect = card.querySelector('select[data-filter="set"]')?.value || 'all';
    const headSelect = card.querySelector('select[data-filter="head"]')?.value || 'all';
    const sortSelect = card.querySelector('select[data-filter="sort"]')?.value || 'dps';

    const renderListInternal = (builds, limit) => {
        if (!builds || builds.length === 0) return '<div class="msg-empty">No valid builds found.</div>';

        let filtered = builds.map(hydrateBuildEntry).filter(r => {
            if (!r) return false;
            const prioMatch = (prioSelect === 'all' || r.prio === prioSelect);
            if (!prioMatch) return false;
            if (setSelect !== 'all' && r.setName !== setSelect) return false;
            if (headSelect !== 'all' && (r.headUsed || 'none') !== headSelect) return false;

            let hSearch = HEAD_CONFIG[r.headUsed]?.search || '';
            const searchText = `${r.traitName} ${r.setName} ${r.prio} ${hSearch}`.toLowerCase();
            return searchText.includes(searchInput);
        });

        if (prioSelect === 'all') {
            const uniqueMap = new Map();
            filtered.forEach(r => {
                const key = r.setName + r.traitName + (r.headUsed || 'none');

                let isBetter = false;
                if (!uniqueMap.has(key)) {
                    isBetter = true;
                } else {
                    const currentBest = uniqueMap.get(key);
                    if (sortSelect === 'damage') {
                        if (r.dmgVal > currentBest.dmgVal) isBetter = true;
                        else if (r.dmgVal === currentBest.dmgVal && r.sortDps > currentBest.sortDps) isBetter = true;
                    }
                    else if (sortSelect === 'range') isBetter = (r.range > currentBest.range);
                    else isBetter = (r.sortDps > currentBest.sortDps);
                }
                if (isBetter) uniqueMap.set(key, r);
            });
            filtered = Array.from(uniqueMap.values());
        }

        if (filtered.length === 0) return '<div class="msg-empty">No matches found.</div>';

        filtered.sort((a, b) => {
            if (sortSelect === 'range') return (b.range || 0) - (a.range || 0);
            if (sortSelect === 'damage') {
                if (b.dmgVal !== a.dmgVal) return (b.dmgVal || 0) - (a.dmgVal || 0);
                return (b.sortDps || 0) - (a.sortDps || 0);
            }
            return (b.sortDps || 0) - (a.sortDps || 0);
        });

        const slice = filtered.slice(0, limit);

        // EXPORT CURRENTLY FILTERED TOP BUILD
        // This ensures the hotbar stats match exactly what the user sees on the card,
        // respecting their set/priority filters instead of always picking the absolute best.
        if (slice.length > 0) {
            if (!window.hotbarFilteredBuilds) window.hotbarFilteredBuilds = {};

            // In loadout mode with a selected trait, export the best build for THAT trait
            // so the hotbar DPS reflects the user's trait choice, not just the overall #1.
            const selectedTrait = (window.CALCULATION_MODE === 'loadout' && window.unitTraits && window.unitTraits[unitId]);
            if (selectedTrait) {
                const traitMatch = slice.find(b => b.traitName && b.traitName.toLowerCase() === selectedTrait.toLowerCase());
                window.hotbarFilteredBuilds[unitId] = traitMatch || slice[0];
            } else {
                window.hotbarFilteredBuilds[unitId] = slice[0];
            }
        }

        return slice.map((r, i) => generateBuildRowHTML(r, i, { totalCost: unitCost, placement: unitPlace, sortMode: sortSelect, unitId, benchmarkDps: benchmarkDps })).join('');
    };

    const container = document.getElementById(`results-${activeType}-${activeMode}-0-${unitId}`);
    if (!container) return;

    let buildData = window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0];

    // Fallback: If Ability mode is active but no builds were pre-generated, show Base builds 
    // (they will be re-calculated with the Ability multiplier by reconstructMathData)
    if (!buildData && activeType === 'abil') {
        buildData = window.unitBuildsCache[unitId]?.['base']?.[activeMode]?.[0];
    }

    if (!buildData && unitObj) {
        processUnitCache(unitObj, 0, activeType, false);
        buildData = window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0];
    }

    if (buildData) {
        container.innerHTML = renderListInternal(buildData, renderLimit);
    } else if (forceSync && unitObj) {
        processUnitCache(unitObj, 0, activeType);
        const finalData = window.unitBuildsCache[unitId]?.[activeType]?.[activeMode]?.[0];
        if (finalData) container.innerHTML = renderListInternal(finalData, renderLimit);
    } else {
        container.innerHTML = `<div class="msg-loading"><div class="loading-spinner"></div><span>Calculating...</span></div>`;
    }

    // --- DYNAMIC BADGE UPDATES (Mode + Synergy) ---
    // These badges must be updated every re-render since hotbar composition changes affect them
    if (unitObj && card) {
        const badgesDiv = card.querySelector('.banner-badges');
        if (badgesDiv) {
            // 1. MODE INDICATOR BADGE — shows which mode the unit is currently in (moved to toggle area)
            const toggleArea = card.querySelector('.ut-toggle-area');
            if (toggleArea) {
                let existingModeBadge = toggleArea.querySelector('.mode-indicator-badge');
                if (unitObj.modes && Array.isArray(unitObj.modes)) {
                    const currentModeIdx = (window.unitModesState && window.unitModesState[unitId] !== undefined) ? window.unitModesState[unitId] : 0;
                    const currentMode = unitObj.modes[currentModeIdx];
                    const isSummon = (unitObj.modesLabel && unitObj.modesLabel.toLowerCase() === 'summons') || unitObj.id === 'the_strongest_in_history';
                    if (currentMode && !isSummon) {
                        const modeHtml = `<div class="mode-indicator-badge" style="display: flex; align-items: center; color: #c084fc; font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(192, 132, 252, 0.4); background: rgba(192, 132, 252, 0.06); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis;" title="${currentMode.name}">⚙ ${currentMode.name.toUpperCase()}</div>`;
                        if (existingModeBadge) {
                            existingModeBadge.outerHTML = modeHtml;
                        } else {
                            toggleArea.insertAdjacentHTML('afterbegin', modeHtml);
                        }
                    } else if (existingModeBadge) {
                        existingModeBadge.remove();
                    }
                } else if (existingModeBadge) {
                    existingModeBadge.remove();
                }
            }

            // 2. SYNERGY BADGE — shows SYNCED/REQUIRED for DoT dependencies
            let existingSynergyBadge = badgesDiv.querySelector('.synergy-dot-badge');
            if (window.CALCULATION_MODE === 'loadout') {
                const currentModeIdx = (window.unitModesState && window.unitModesState[unitId] !== undefined) ? window.unitModesState[unitId] : 0;
                const modeStats = unitObj.modes && unitObj.modes[currentModeIdx] ? unitObj.modes[currentModeIdx] : {};
                const requiresDot = modeStats.requiresDot || (unitObj.stats && unitObj.stats.requiresDot);

                if (requiresDot) {
                    const hotbar = window.hotbarState;
                    const met = hotbar && hotbar.slots && hotbar.slots.some(s => {
                        if (!s || s.id.split('-')[0] === unitId) return false;
                        const sUnit = window.getUnitById(s.id);
                        if (!sUnit) return false;
                        if (sUnit.stats && (sUnit.stats.dotType === requiresDot && sUnit.stats.dot > 0 || (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === requiresDot))) return true;
                        const sMode = (window.unitModesState && window.unitModesState[sUnit.id]) || 0;
                        if (sUnit.modes && sUnit.modes[sMode]) {
                            const m = sUnit.modes[sMode];
                            if (m.dotType === requiresDot && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotType === requiresDot))) return true;
                        }
                        return false;
                    });

                    let synergyHtml;
                    if (met) {
                        synergyHtml = `<div class="placement-badge synergy-dot-badge sync-active" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.08); font-weight: 900;">🔗 SYNCED: ${requiresDot.toUpperCase()}</div>`;
                    } else {
                        synergyHtml = `<div class="placement-badge synergy-dot-badge" style="color: #71717a; border-color: rgba(113, 113, 122, 0.3); background: rgba(0,0,0,0.2); font-weight: 700; opacity: 0.6;">⛓ REQUIRED: ${requiresDot.toUpperCase()}</div>`;
                    }
                    if (existingSynergyBadge) {
                        existingSynergyBadge.outerHTML = synergyHtml;
                    } else {
                        badgesDiv.insertAdjacentHTML('beforeend', synergyHtml);
                    }
                } else if (existingSynergyBadge) {
                    existingSynergyBadge.remove();
                }
            } else if (existingSynergyBadge) {
                existingSynergyBadge.remove();
            }
        }
    }
}

function processUnitCache(unit, specificCfg = null, specificType = null) {
    if (!window.unitBuildsCache[unit.id]) {
        window.unitBuildsCache[unit.id] = {
            base: { fixed: [null] },
            abil: { fixed: [null] }
        };
    }

    const CONFIGS = [{ head: true, subs: !window.disableSubStats }];

    const performCalcSet = (mode, useAbility, targetCache) => {
        let dbKey = unit.id;
        if (useAbility && unit.ability) dbKey += '_abil';

        const useInventory = (inventoryMode === true);

        for (let i = 0; i < 1; i++) {
            if (targetCache[i] !== null) continue;

            const cfg = CONFIGS[i];
            let calculatedResults = [];

            if (!useInventory) {
                if (window.STATIC_BUILD_DB && window.STATIC_BUILD_DB[dbKey]) {
                    const dbTable = window.STATIC_BUILD_DB[dbKey];
                    const dbList = dbTable[mode] || dbTable[mode === 'fixed' ? 'f' : 'b'];
                    if (dbList && dbList[i]) {
                        calculatedResults = dbList[i].map(r => ({ ...r }));
                    }
                }

                // If global buffers are active or special dynamic states exist, re-optimize
                // the static builds dynamically in the browser (incredibly fast single-relic single-trait calculations)!
                const anyGlobal = (window.GLOBAL_BUFF_DATA && Object.values(window.GLOBAL_BUFF_DATA).some(buff => !buff.hideButton && !!window[buff.stateKey])) || window.disableSubStats;

                if (anyGlobal && calculatedResults.length > 0) {
                    calculatedResults = calculatedResults.map(r => {
                        const setName = r.setName || (typeof r.s === 'number' ? SETS[r.s]?.id : r.s) || (window.getSetFast && window.getSetFast(r.setName)?.id);
                        const traitId = r.traitName || r.trait || (typeof r.t === 'number' ? traitsList[r.t]?.id : r.t);
                        if (!setName || !traitId) return r;

                        const singleBuilds = window.getFilteredBuilds().filter(b => b.setName === setName);
                        const singleTrait = traitsList.find(t => t.id === traitId || t.name === traitId);
                        const traitArr = singleTrait ? [singleTrait] : null;

                        const optResList = window.calculateUnitBuilds(
                            unit,
                            null,
                            singleBuilds,
                            window.getValidSubCandidates(),
                            cfg.head ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut'] : ['none'],
                            cfg.subs,
                            traitArr,
                            useAbility,
                            mode
                        );

                        if (optResList && optResList.length > 0) {
                            let best = optResList[0];
                            optResList.forEach(opt => {
                                if (opt.dps > best.dps) best = opt;
                            });
                            return best;
                        }
                        return r;
                    });
                }
            }

            calculatedResults.forEach(r => { if (r.id) window.cachedResults[r.id] = r; });

            const traitsForCalc = (calculatedResults.length > 0)
                ? [...(typeof customTraits !== 'undefined' ? customTraits : []), ...(unitSpecificTraits[unit.id] || [])]
                : null;

            const dynamicResults = calculateUnitBuilds(unit, null, getFilteredBuilds(), getValidSubCandidates(), cfg.head ? ['sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut'] : ['none'], cfg.subs, traitsForCalc, useAbility, mode);

            if (dynamicResults.length > 0) {
                const seen = new Set(calculatedResults.map(r => r.id));
                dynamicResults.forEach(r => {
                    if (!seen.has(r.id)) {
                        calculatedResults.push(r);
                        seen.add(r.id);
                    }
                });
            }

            const unitId = unit.id.toLowerCase();
            const sortFn = (unitId === 'law')
                ? (a, b) => (b.range || 0) - (a.range || 0)
                : (a, b) => (b.dps || 0) - (a.dps || 0);

            calculatedResults.sort(sortFn);
            targetCache[i] = calculatedResults;
        }
    };

    if (!specificType || specificType === 'base') {
        performCalcSet('fixed', false, window.unitBuildsCache[unit.id].base.fixed);
    }

    if (unit.ability && (!specificType || specificType === 'abil')) {
        performCalcSet('fixed', true, window.unitBuildsCache[unit.id].abil.fixed);
    }
}

window.getQuickScore = (unit) => {
    // ALWAYS use base key for ranking to maintain consistent spot
    // Prefer _abil key for units with noToggle abilities (always-on power)
    // EXCEPT for multi-mode units (Sukuna, Jinoo) where we want the baseline rank
    let dbKey = unit.id;
    if (unit.ability) {
        const ab = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;
        if (ab.noToggle && !unit.allowMultipleModes && window.STATIC_BUILD_DB && window.STATIC_BUILD_DB[unit.id + "_abil"]) {
            dbKey = unit.id + "_abil";
        }
    }

    let score = 0;
    const activeDb = (window.CALCULATION_MODE === 'loadout' && window.HOTBAR_STATIC_BUILD_DB) ? window.HOTBAR_STATIC_BUILD_DB : window.STATIC_BUILD_DB;
    if (activeDb && activeDb[dbKey]) {
        const list = activeDb[dbKey]['fixed'][0];
        if (list && list.length > 0) {
            score = window.isUnit(unit.id, 'law') ? (list[0].range || 0) : list[0].dps;
        }
    }

    if (score > 0) return score;
    const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
    const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;
    const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unit.upgrades && unit.upgrades.length > 0 ? unit.upgrades : null);

    if (window.isUnit(unit.id, 'law')) {
        if (unit.stats.range) return unit.stats.range;
        if (upgradesArr) return upgradesArr[upgradesArr.length - 1].range || 0;
        return 0;
    }
    let d = unit.stats.dmg, s = unit.stats.spa;
    if ((!d || !s) && upgradesArr) {
        const last = upgradesArr[upgradesArr.length - 1];
        d = d || last.dmg;
        s = s || last.spa;
    }
    return ((d || 0) / (s || 1)) * 35;
};

window.getLiveScore = (unit) => {
    let unitId = unit.id;

    if (window.CALCULATION_MODE === 'loadout') {
        const currentBuild = window.hotbarFilteredBuilds && window.hotbarFilteredBuilds[unitId];
        if (currentBuild) {
            return window.isUnit(unitId, 'law') ? (currentBuild.range || 0) : (currentBuild.dps || 0);
        }
        return window.getQuickScore ? window.getQuickScore(unit) : 0;
    }

    window.LIVE_SCORE_CACHE = window.LIVE_SCORE_CACHE || {};
    const currentTrait = (window.unitTraits && window.unitTraits[unitId]);
    const currentHead = (window.unitHeads && window.unitHeads[unitId]);
    let activeType = (window.activeAbilityIds && window.activeAbilityIds.has(unitId)) ? 'abil' : 'base';

    const anyGlobal = (window.GLOBAL_BUFF_DATA && Object.values(window.GLOBAL_BUFF_DATA).some(buff => !buff.hideButton && !!window[buff.stateKey])) || window.disableSubStats;
    const activeModeIdx = (window.unitModesState && window.unitModesState[unitId] !== undefined) ? window.unitModesState[unitId] : 0;
    const cacheKey = `${unitId}-${currentTrait || ''}-${currentHead || ''}-${activeType}-${anyGlobal ? 'buffed' : 'base'}-${activeModeIdx}`;
    if (window.LIVE_SCORE_CACHE[cacheKey] !== undefined) {
        return window.LIVE_SCORE_CACHE[cacheKey];
    }

    let dbKey = unitId;
    if (activeType === 'abil' && !unit.allowMultipleModes) dbKey += '_abil';

    const buildList = window.STATIC_BUILD_DB && window.STATIC_BUILD_DB[dbKey] ? window.STATIC_BUILD_DB[dbKey]['fixed']?.[0] : null;

    if (!buildList || buildList.length === 0) {
        const val = window.getQuickScore(unit);
        window.LIVE_SCORE_CACHE[cacheKey] = val;
        return val;
    }

    // FAST PATH: If no custom trait/head is set, and no global buffer is active,
    // we can just read the pre-saved dps directly from the #1 build in the database!
    // This is instant and avoids thousands of reconstructMathData calls on load.
    if (!currentTrait && !currentHead && !anyGlobal) {
        const topBuild = buildList[0];
        if (topBuild) {
            let score = topBuild.d || topBuild.dps || 0;
            if (score > 0) {
                window.LIVE_SCORE_CACHE[cacheKey] = score;
                return score;
            }
        }
    }

    let maxScore = 0;

    // To ensure UI and sorting perfectly match, we evaluate up to the top 20 builds from the DB
    // to find the true maximum DPS under the current user-selected trait/head configuration.
    const searchLimit = Math.min(20, buildList.length);

    for (let i = 0; i < searchLimit; i++) {
        const sourceEntry = buildList[i];
        const scoringEntry = { ...sourceEntry };

        // Unpack compact DB format
        if (!scoringEntry.subStats && scoringEntry.ss) scoringEntry.subStats = scoringEntry.ss;
        if (!scoringEntry.mainStats && scoringEntry.ms) scoringEntry.mainStats = scoringEntry.ms;
        if (!scoringEntry.mainStats && (scoringEntry.b !== undefined || scoringEntry.l !== undefined)) {
            scoringEntry.mainStats = {
                body: (typeof scoringEntry.b === 'string' ? scoringEntry.b : (scoringEntry.b === 1 ? 'dot' : (scoringEntry.b === 2 ? 'cm' : 'dmg'))),
                legs: (typeof scoringEntry.l === 'string' ? scoringEntry.l : (scoringEntry.l === 1 ? 'spa' : (scoringEntry.l === 2 ? 'cf' : (scoringEntry.l === 3 ? 'range' : 'dmg'))))
            };
        }

        if (currentTrait) scoringEntry.traitName = currentTrait;
        if (currentHead) scoringEntry.headUsed = currentHead;

        let finalScoringEntry = scoringEntry;
        if (anyGlobal) {
            const setName = scoringEntry.setName || (typeof scoringEntry.s === 'number' ? SETS[scoringEntry.s]?.id : scoringEntry.s) || (window.getSetFast && window.getSetFast(scoringEntry.setName)?.id);
            const traitId = scoringEntry.traitName || scoringEntry.trait || (typeof scoringEntry.t === 'number' ? traitsList[scoringEntry.t]?.id : scoringEntry.t);
            if (setName && traitId) {
                const singleBuilds = window.getFilteredBuilds().filter(b => b.setName === setName);
                const singleTrait = traitsList.find(t => t.id === traitId || t.name === traitId);
                const traitArr = singleTrait ? [singleTrait] : null;

                const optResList = window.calculateUnitBuilds(
                    unit,
                    null,
                    singleBuilds,
                    window.getValidSubCandidates(),
                    currentHead ? [currentHead] : ['none'],
                    !window.disableSubStats, // includeSubs
                    traitArr,
                    activeType === 'abil',
                    'fixed'
                );

                if (optResList && optResList.length > 0) {
                    let best = optResList[0];
                    optResList.forEach(opt => {
                        if (opt.dps > best.dps) best = opt;
                    });
                    finalScoringEntry = best;
                }
            }
        }

        try {
            const res = window.reconstructMathData(finalScoringEntry);
            if (res) {
                let score = window.isUnit(unitId, 'law') ? (res.range || 0) : Math.max(res.total || 0, res.bossTotal || 0);
                if (score > maxScore) maxScore = score;
            }
        } catch (e) {
            // Ignore individual build failures
        }
    }

    if (maxScore === 0) {
        const val = window.getQuickScore(unit);
        window.LIVE_SCORE_CACHE[cacheKey] = val;
        return val;
    }

    window.LIVE_SCORE_CACHE[cacheKey] = maxScore;
    return maxScore;
};

window.resortUnitCards = function () {
    if (!paginatedSortedUnits || paginatedSortedUnits.length === 0) return;
    paginatedSortedUnits.sort((a, b) => getLiveScore(b.unit) - getLiveScore(a.unit));
    renderCurrentPage();
};

// Re-orders card DOM elements in-place without clearing innerHTML (no flash/scroll reset).
window.resortUnitCardsInPlace = function () {
    if (!paginatedSortedUnits || paginatedSortedUnits.length === 0) return;
    paginatedSortedUnits.sort((a, b) => getLiveScore(b.unit) - getLiveScore(a.unit));
    const container = document.getElementById('dbPage');
    if (!container) return;
    paginatedSortedUnits.forEach(entry => {
        const card = document.getElementById('card-' + entry.unit.id);
        if (card) container.appendChild(card); // moves existing card to new position
    });
};

function renderUnitCard(unit, absoluteIndex) {
    const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
    const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;
    const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unit.upgrades && unit.upgrades.length > 0 ? unit.upgrades : null);

    if (window.unitELevels[unit.id] === undefined && upgradesArr) {
        window.unitELevels[unit.id] = upgradesArr.length - 1;
    }

    const abilityObj = Array.isArray(unit.ability) ? unit.ability[0] : unit.ability;
    let abilityLabel = (abilityObj && abilityObj.abilityName) ? abilityObj.abilityName : 'Ability';
    let toggleScript = '';
    const isToggled = activeAbilityIds.has(unit.id);
    const override = TOGGLE_OVERRIDES[window.getFileName(unit.id)];
    if (override) {
        abilityLabel = override.dynamicLabel ? override.dynamicLabel(isToggled) : override.label;
        toggleScript = override.script ? `; ${override.script}` : '';
    }

    const currentLevel = (window.unitELevels && window.unitELevels[unit.id]) || 0;
    let abilityUnlocked = true;
    if (upgradesArr) {
        const hasUnlockCondition = upgradesArr.some(u => u.unlocksAbility);
        if (hasUnlockCondition) {
            abilityUnlocked = false;
            for (let i = 0; i <= currentLevel; i++) {
                if (upgradesArr[i] && upgradesArr[i].unlocksAbility) { abilityUnlocked = true; break; }
            }
        }
    }

    let abilityToggleHtml = (unit.ability && !abilityObj.noToggle) ? `<div class="toggle-wrapper" style="display: ${abilityUnlocked ? 'flex' : 'none'}"><span class="ut-ability-text" title="${abilityLabel}">${abilityLabel}</span><label><input type="checkbox" class="ability-cb" ${isToggled ? 'checked' : ''} onchange="toggleAbility('${unit.id}', this)${toggleScript}"><div class="mini-switch"></div></label></div>` : '<div></div>';



    const modesBtn = (unit.modes && Array.isArray(unit.modes)) ? `<button class="calc-btn ut-btn-compact modes-btn" onclick="openUnitModes('${unit.id}')" title="Change Mode">${unit.modesLabel || 'Modes'}</button>` : '';

    let initialModeIndicatorHtml = '';
    if (unit.modes && Array.isArray(unit.modes)) {
        const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
        const currentMode = unit.modes[activeMode];
        const isSummon = (unit.modesLabel && unit.modesLabel.toLowerCase() === 'summons') || unit.id === 'the_strongest_in_history';
        if (currentMode && !isSummon) {
            initialModeIndicatorHtml = `<div class="mode-indicator-badge" style="display: flex; align-items: center; color: #c084fc; font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(192, 132, 252, 0.4); background: rgba(192, 132, 252, 0.06); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis;" title="${currentMode.name}">⚙ ${currentMode.name.toUpperCase()}</div>`;
        }
    }

    // Calculate Dynamic Placement
    let dynamicPlacement = unit.placement || 1;
    if (isUnit(unit.id, 'water_god')) {
        const hbStats = (typeof getCachedHotbarStats === 'function') ? getCachedHotbarStats() : null;
        if (hbStats && hbStats.ugPresent) {
            dynamicPlacement = Math.max(1, dynamicPlacement - 1);
        }
    }

    const iconCustom = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #06b6d4;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;
    const iconTraits = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #a78bfa;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
    const iconInfo = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; color: #0ea5e9;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    const topControls = `<div class="unit-toolbar"><div class="ut-actions"><button class="calc-btn ut-btn-compact" onclick="openCalc('${unit.id}')">${iconCustom} CUSTOM</button><button class="calc-btn ut-btn-compact" onclick="openTraitBestList('${unit.id}')" title="Best Build per Trait">${iconTraits} TRAITS</button><button class="calc-btn ut-btn-compact" onclick="openUnitInfo('${unit.id}')">${iconInfo} INFO</button></div><div class="ut-toggle-area">${initialModeIndicatorHtml}${modesBtn}${abilityToggleHtml}</div></div>`;

    let defaultSort = 'dps';
    if (isAnyUnit(unit.id, ['sjw', 'esdeath'])) defaultSort = 'damage';
    else if (isUnit(unit.id, 'law')) defaultSort = 'range';

    let customNoticeHtml = '';
    if (unit.id === 'triple_threat') {
        customNoticeHtml = `
        <div class="unit-card-warning" style="padding: 6px 12px; background: rgba(239, 68, 68, 0.08); border-bottom: 1px solid rgba(239, 68, 68, 0.15); display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; color: #f87171;">
            <span style="font-size: 0.85rem; line-height: 1;">⚠️</span>
            <span><strong>Notice:</strong> Triple Threat is bugged; his DoT doesn't crit currently.</span>
        </div>`;
    } else if (unit.id === 'king_sailor') {
        customNoticeHtml = `
        <div class="unit-card-warning" style="padding: 6px 12px; background: rgba(245, 158, 11, 0.08); border-bottom: 1px solid rgba(245, 158, 11, 0.15); display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; color: #fbbf24;">
            <span style="font-size: 0.85rem; line-height: 1;">⚠️</span>
            <span><strong>Notice:</strong> In-game he does 2.5x dmg currently (e.g. 147.4k dps x2.5).</span>
        </div>`;
    } else if (unit.id === 'mochi_pirate') {
        customNoticeHtml = `
        <div class="unit-card-warning" style="padding: 6px 12px; background: rgba(239, 68, 68, 0.08); border-bottom: 1px solid rgba(239, 68, 68, 0.15); display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; color: #f87171;">
            <span style="font-size: 0.85rem; line-height: 1;">⚠️</span>
            <span><strong>Notice:</strong> Mochi Pirate is bugged; he does not apply Time Snail currently / Crit Time snail enemies.</span>
        </div>`;
    }

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
                        <option value="damage" ${defaultSort === 'damage' ? 'selected' : ''}>Sort: Damage</option>
                        <option value="range" ${defaultSort === 'range' ? 'selected' : ''}>Sort: Range</option>
                        <option value="efficiency" ${defaultSort === 'efficiency' ? 'selected' : ''}>Sort: Efficiency</option>
                    </select>
                    <select onchange="filterList(this)" data-filter="set" class="search-select">
                        <option value="all">Sets: All</option>
                        <option value="Junior Ninja">Sets: Junior Ninja</option>
                        <option value="Sun God">Sets: Sun God</option>
                        <option value="Laughing Captain">Sets: Laughing</option>
                        <option value="Ex Captain">Sets: Ex</option>
                        <option value="Shadow Reaper">Sets: Shadow Reaper</option>
                        <option value="Reaper Set">Sets: Reaper</option>
                        <option value="Super Roku">Sets: Super Roku</option>
                        <option value="Bio-Android">Sets: Bio-Android</option>
                        <option value="Biju Set">Sets: Biju</option>
                        <option value="Rebellious Shinobi">Sets: Rebellious</option>
                        <option value="Reanimated Ninja">Sets: Reanimated</option>
                        <option value="Great Mage">Sets: Great Mage</option>
                        <option value="Sorcerer Hunter">Sets: S. Hunter</option>
                        <option value="Strongest Sorcerer">Sets: Strongest</option>
                        <option value="Monarch">Sets: Monarch</option>
                        <option value="Warlord">Sets: Warlord</option>
                        <option value="Mochi">Sets: Mochi</option>
                    </select>
                    <select onchange="filterList(this)" data-filter="head" class="search-select">
                        <option value="all">Heads: All</option>
                        <option value="sun_god">Heads: Sun God</option>
                        <option value="ninja">Heads: Junior Ninja</option>
                        <option value="reaper_necklace">Heads: Reaper</option>
                        <option value="shadow_reaper_necklace">Heads: Shadow Reaper</option>
                        <option value="junior">Heads: Junior Ninja</option>
                        <option value="biju_head">Heads: Biju</option>
                        <option value="reanimated_head">Heads: Reanimated</option>
                        <option value="bloodline_head">Heads: Bloodline</option>
                        <option value="sorcerer_hunter_spirit">Heads: S. Hunter Spirit</option>
                        <option value="strongest_sorcerer_glasses">Heads: Strongest Glasses</option>
                        <option value="monarch">Heads: Monarch Cape</option>
                        <option value="warlord_hat">Heads: Warlord Hat</option>
                        <option value="mochi_scarf">Heads: Mochi Scarf</option>
                        <option value="flaming_donut">Heads: Flaming Donut</option>
                        <option value="none">Heads: None</option>
                    </select>
                </div>
            </div>
        </div>
              ${(unit.upgrades && unit.upgrades.length > 0) ? `
        <div class="upgrade-toolbar">
            ${unit.upgrades.map((u, idx) => {
        const level = idx;
        const isActive = (window.unitELevels[unit.id] || 0) === level;
        const isUnlocked = (window.unitELevels[unit.id] || 0) >= level;
        const isSpecial = (idx === unit.upgrades.length - 1);
        return `<div class="e-pill ${isActive ? 'active' : ''} ${isUnlocked && (window.unitELevels[unit.id] || 0) > 0 ? 'e-unlocked' : ''} ${isSpecial ? 'is-special' : 'is-stat'}" 
                                 onclick="selectELevel('${unit.id}', ${level})" 
                                 data-level="${level}" 
                                 title="Upgrade ${level}">${level}</div>`;
    }).join('')}
        </div>` : ''}
        ${unit.systemLevel ? (() => {
            // In loadout mode, hide the inline slider — it's accessible through the modes overlay
            if (window.CALCULATION_MODE === 'loadout') return '';
            const cfg = unit.systemLevel;
            if (cfg.restrictModes) {
                const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
                if (!cfg.restrictModes.includes(activeMode)) return '';
            }
            const currentSysLvl = (window.unitSystemLevels && window.unitSystemLevels[unit.id] !== undefined) ? window.unitSystemLevels[unit.id] : (cfg.default || cfg.max || 100);
            if (window.unitSystemLevels[unit.id] === undefined) window.unitSystemLevels[unit.id] = currentSysLvl;
            if (cfg.controlType === 'slider') {
                return `<div class="system-level-bar" style="display:flex; align-items:center; gap:12px; padding:6px 15px; background:rgba(99,102,241,0.06); border-bottom:1px solid var(--card-border);">
                    <span style="font-size:0.65rem; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:0.5px; min-width: 55px;">${cfg.label || 'System Level'}</span>
                    <input id="system-level-${unit.id}" type="range" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                        style="flex:1; height:4px; background:rgba(99,102,241,0.2); border-radius:2px; cursor:pointer; accent-color:#818cf8; outline:none;"
                        oninput="document.getElementById('sys-lvl-val-${unit.id}').innerText = this.value; setSystemLevel('${unit.id}', this.value)">
                    <span id="sys-lvl-val-${unit.id}" style="font-size:0.8rem; font-weight:700; color:#e0e7ff; background:rgba(99,102,241,0.3); padding:1px 6px; border-radius:4px; min-width:18px; text-align:center;">${currentSysLvl}</span>
                    <span style="font-size:0.65rem; color:rgba(165,180,252,0.4);">MAX LV. ${cfg.max || 100}</span>
                </div>`;
            } else {
                return `<div class="system-level-bar" style="display:flex; align-items:center; gap:8px; padding:4px 15px; background:rgba(99,102,241,0.06); border-bottom:1px solid var(--card-border);">
                    <span style="font-size:0.65rem; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:0.5px;">${cfg.label || 'System Level'}</span>
                    <input id="system-level-${unit.id}" type="number" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                        style="width:45px; padding:1px 4px; background:rgba(0,0,0,0.4); border:1px solid rgba(99,102,241,0.3); border-radius:4px; color:#e0e7ff; font-size:0.8rem; font-weight:700; text-align:center;"
                        onchange="setSystemLevel('${unit.id}', this.value)"
                        onkeyup="if(event.key==='Enter') setSystemLevel('${unit.id}', this.value)">
                    <span style="font-size:0.65rem; color:rgba(165,180,252,0.4); margin-left: auto;">MAX LV. ${cfg.max || 100}</span>
                </div>`;
            }
        })() : ''}
        ${customNoticeHtml}
        `;

    let mainContent = '';
    ['base', 'abil'].forEach(type => { const mode = 'fixed'; mainContent += `<div class="top-builds-list build-list-container mode-${type} mode-${mode} cfg-0" id="results-${type}-${mode}-0-${unit.id}"></div>`; });

    return createBaseUnitCard(unit, {
        id: 'card-' + unit.id,
        additionalClasses: (activeAbilityIds.has(unit.id) ? ' use-ability' : '') + ' lazy-build-load',
        bannerContent: `<div class="banner-badges">
            <div class="placement-badge">Max Place: ${dynamicPlacement}</div>
            <div class="placement-badge is-${(unit.placementType || 'Ground').toLowerCase()}">${unit.placementType || 'Ground'}</div>
            <div class="placement-badge" style="color: #4ade80; border-color: rgba(74, 222, 128, 0.3);">DPS Rank: #${absoluteIndex}</div>

            ${(() => {
                if (window.CALCULATION_MODE !== 'loadout') return '';
                const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
                const modeStats = unit.modes && unit.modes[activeMode] ? unit.modes[activeMode] : {};
                const requiresDot = modeStats.requiresDot || (unit.stats && unit.stats.requiresDot);
                if (!requiresDot) return '';

                const hotbar = window.hotbarState;
                const met = hotbar && hotbar.slots && hotbar.slots.some(s => {
                    if (!s || s.id.split('-')[0] === unit.id) return false;
                    const sUnit = window.getUnitById(s.id);
                    if (!sUnit) return false;
                    if (sUnit.stats && (sUnit.stats.dotType === requiresDot && sUnit.stats.dot > 0 || (sUnit.stats.customFollowUp && sUnit.stats.customFollowUp.dotType === requiresDot))) return true;
                    const sMode = (window.unitModesState && window.unitModesState[sUnit.id]) || 0;
                    if (sUnit.modes && sUnit.modes[sMode]) {
                        const m = sUnit.modes[sMode];
                        if (m.dotType === requiresDot && (m.dot > 0 || (m.customFollowUp && m.customFollowUp.dotType === requiresDot))) return true;
                    }
                    return false;
                });

                if (met) {
                    return `<div class="placement-badge synergy-dot-badge sync-active" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.08); font-weight: 900;">🔗 SYNCED: ${requiresDot.toUpperCase()}</div>`;
                } else {
                    return `<div class="placement-badge synergy-dot-badge" style="color: #71717a; border-color: rgba(113, 113, 122, 0.3); background: rgba(0,0,0,0.2); font-weight: 700; opacity: 0.6;">⛓ REQUIRED: ${requiresDot.toUpperCase()}</div>`;
                }
            })()}
        </div>${getUnitImgHtml(unit, 'unit-avatar')}<div class="unit-title"><h2>${unit.name}</h2><span>${unit.role}</span></div>${unit.meta ? `<button class="trait-guide-btn" onclick="openTraitGuide('${unit.id}')" style="font-size: 0.65rem; padding: 2px 6px;">📋 Rec. Traits</button>` : ''}`,
        topControls, bottomControls, mainContent
    });
}

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
    if (startPage > 2) pageButtons += `<span class="pg-ellipsis">…</span>`;

    for (let p = startPage; p <= endPage; p++) {
        pageButtons += `<button class="pg-btn${p === activePage ? ' pg-active' : ''}" onclick="goToPage(${p})">${p}</button>`;
    }

    if (endPage < totalPages - 1) pageButtons += `<span class="pg-ellipsis">…</span>`;
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

    // Disconnect old observers
    if (window.buildLoadObserver) {
        window.buildLoadObserver.disconnect();
    }

    const upp = getUnitsPerPage();
    const totalUnits = paginatedSortedUnits.length;
    const totalPages = Math.max(1, Math.ceil(totalUnits / upp));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * upp;
    const endIdx = Math.min(startIdx + upp, totalUnits);
    const pageUnits = paginatedSortedUnits.slice(startIdx, endIdx);

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    pageUnits.forEach((entry, i) => {
        // If it was in the hidden container, remove it first to avoid ID duplication
        const existing = document.getElementById('card-' + entry.unit.id);
        if (existing && existing.parentElement?.id === 'hotbarHiddenRender') {
            existing.remove();
        }

        const absoluteRank = (window.unitAbsoluteRanks && window.unitAbsoluteRanks[entry.unit.id]) || (startIdx + i + 1);
        const card = renderUnitCard(entry.unit, absoluteRank);
        card.style.setProperty('--stagger-delay', `${i * 50}ms`);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);

    // Add pagination controls
    const pgHtml = buildPaginationControls(totalUnits, currentPage, totalPages);

    // Top Pagination (Toolbar)
    const topPg = document.getElementById('topPagination');
    if (topPg) {
        topPg.innerHTML = pgHtml;
        topPg.classList.toggle('hidden', totalPages <= 1);
    }

    // Bottom Pagination (Optional, user said 'instead of' but keeping a small one for accessibility is often good, 
    // however I will follow the 'instead of' strictly if it feels better)
    // For now, let's just use the top one as requested.
    const pgWrapper = document.createElement('div');
    pgWrapper.className = 'pagination-wrapper bottom-pagination';
    pgWrapper.innerHTML = pgHtml;
    container.appendChild(pgWrapper);
    if (totalPages <= 1) pgWrapper.classList.add('hidden');

    // Setup IntersectionObserver for lazy build loading
    if (!window.buildLoadObserver) {
        window.buildLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const unitId = entry.target.id.replace('card-', '');
                if (entry.isIntersecting) {
                    window.visibleUnitIds.add(unitId);
                    const unit = window.getUnitById(unitId);
                    if (unit) updateBuildListDisplay(unitId, false, 100);
                    entry.target.classList.remove('lazy-build-load');
                } else {
                    window.visibleUnitIds.delete(unitId);
                    entry.target.classList.add('lazy-build-load');
                }
            });
        }, { rootMargin: '200px' });
    }

    container.querySelectorAll('.lazy-build-load').forEach(c => window.buildLoadObserver.observe(c));
}

window.goToPage = function (page) {
    const totalPages = Math.max(1, Math.ceil(paginatedSortedUnits.length / getUnitsPerPage()));
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCurrentPage();
    // Scroll to top of the main content area
    const main = document.querySelector('.dashboard-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderDatabase() {
    const container = document.getElementById('dbPage');
    if (!container) return;

    if (renderQueueId) { cancelAnimationFrame(renderQueueId); renderQueueId = null; }
    renderQueueIndex = 0;

    if (!window.STATIC_BUILD_DB) window.cachedResults = {};
    window.unitBuildsCache = {};

    const currentSearch = document.getElementById('globalSearch')?.value || '';
    globalFilterUnits(currentSearch);
}

window.globalFilterUnits = (term) => {
    const searchTerm = (term || '').trim().toLowerCase();
    const clearBtn = document.getElementById('globalSearchClear');
    if (clearBtn) clearBtn.style.display = searchTerm ? 'flex' : 'none';

    // 1. Compute absolute ranks from the FULL database (before any search filtering)
    const allSorted = unitDatabase.map(unit => {
        return { unit, maxScore: getLiveScore(unit) };
    }).sort((a, b) => b.maxScore - a.maxScore);

    window.unitAbsoluteRanks = {};
    allSorted.forEach((entry, i) => { window.unitAbsoluteRanks[entry.unit.id] = i + 1; });

    // 2. Filter by search term
    let filtered = unitDatabase;
    if (searchTerm) {
        filtered = unitDatabase.filter(unit => {
            const title = unit.name.toLowerCase();
            const role = unit.role.toLowerCase();
            const id = unit.id.toLowerCase();
            const placement = (unit.placementType || 'Ground').toLowerCase();
            const element = (unit.stats && unit.stats.element) ? unit.stats.element.toLowerCase() : '';

            let matches = title.includes(searchTerm) ||
                role.includes(searchTerm) ||
                id.includes(searchTerm) ||
                placement.includes(searchTerm) ||
                element.includes(searchTerm);
            if (!matches && (searchTerm === 'ground' || searchTerm === 'hill')) {
                if (placement === 'hybrid') matches = true;
            }
            if (!matches) {
                const uTraits = [
                    ...(typeof traitsList !== 'undefined' ? traitsList : []),
                    ...(typeof customTraits !== 'undefined' ? customTraits : []),
                    ...(typeof unitSpecificTraits !== 'undefined' && unitSpecificTraits[unit.id] ? unitSpecificTraits[unit.id] : [])
                ];
                if (uTraits.some(t => t && t.name && t.name.toLowerCase().includes(searchTerm))) {
                    matches = true;
                }
            }
            return matches;
        });
    }

    // 3. Prepare paginated list using LIVE score (real-time math)
    paginatedSortedUnits = filtered.map(unit => {
        return { unit, maxScore: getLiveScore(unit) };
    }).sort((a, b) => b.maxScore - a.maxScore);

    // 4. Initialize upgrade levels if needed
    paginatedSortedUnits.forEach(entry => {
        const unit = entry.unit;
        const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
        const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;
        const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unit.upgrades && unit.upgrades.length > 0 ? unit.upgrades : null);

        if (window.unitELevels[unit.id] === undefined && upgradesArr) {
            window.unitELevels[unit.id] = upgradesArr.length - 1;
        }
    });

    // 5. Reset to page 1 and render
    currentPage = 1;
    renderCurrentPage();
};

window.clearGlobalSearch = () => {
    const input = document.getElementById('globalSearch');
    if (input) {
        input.value = '';
    }
    const sidebarInput = document.getElementById('sidebarSearch');
    if (sidebarInput) {
        sidebarInput.value = '';
    }
    globalFilterUnits('');
};

function openTraitBestList(unitId) {
    const unit = window.getUnitById(unitId);
    if (!unit) return;

    const mode = 'fixed';
    const type = (window.activeAbilityIds && window.activeAbilityIds.has(unitId) && unit.ability) ? 'abil' : 'base';

    const cfgIndex = 0; // Forced Max Potential

    const allBuilds = window.unitBuildsCache[unitId]?.[type]?.[mode]?.[cfgIndex] || [];

    if (allBuilds.length === 0) {
        showUniversalModal({
            title: 'TRAIT LEADERBOARD',
            content: '<div class="msg-empty">No builds calculated. Please wait for calculation to finish.</div>',
            size: 'modal-sm'
        });
        return;
    }

    const bestByTrait = new Map();
    allBuilds.forEach(build => {
        if (!bestByTrait.has(build.traitName)) {
            bestByTrait.set(build.traitName, build);
        } else {
            const current = bestByTrait.get(build.traitName);
            const isRange = (unitId === 'law');
            const valBuild = isRange ? (build.range || 0) : (build.dps || build.d || 0);
            const valCurrent = isRange ? (current.range || 0) : (current.dps || current.d || 0);

            if (valBuild > valCurrent) {
                bestByTrait.set(build.traitName, build);
            }
        }
    });

    const hydratedBest = Array.from(bestByTrait.values()).map(b => {
        if (typeof window.reconstructMathData === 'function') {
            try {
                const bClone = { ...b };
                if (!bClone.subStats && bClone.ss) bClone.subStats = bClone.ss;
                if (!bClone.mainStats && bClone.ms) bClone.mainStats = bClone.ms;
                if (!bClone.mainStats && (bClone.b !== undefined || bClone.l !== undefined)) {
                    bClone.mainStats = {
                        body: (typeof bClone.b === 'string' ? bClone.b : (bClone.b === 1 ? 'dot' : (bClone.b === 2 ? 'cm' : 'dmg'))),
                        legs: (typeof bClone.l === 'string' ? bClone.l : (bClone.l === 1 ? 'spa' : (bClone.l === 2 ? 'cf' : (bClone.l === 3 ? 'range' : 'dmg'))))
                    };
                }
                const math = window.reconstructMathData(bClone);
                if (math) {
                    bClone.bossDps = math.bossTotal || math.bossDps || 0;
                    bClone.dps = math.total || math.dps || 0;
                }
                return bClone;
            } catch (e) { }
        }
        return b;
    });

    const sortedTraits = hydratedBest.sort((a, b) => {
        const isRange = (unitId === 'law');
        const valA = isRange ? (a.range || 0) : Math.max(a.dps || 0, a.bossDps || 0);
        const valB = isRange ? (b.range || 0) : Math.max(b.dps || 0, b.bossDps || 0);
        return valB - valA;
    });

    // DYNAMIC TAG GENERATION using GLOBAL_BUFF_DATA
    let tagsHtml = '';
    if (window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(config => {
            if (window[config.stateKey]) {
                // Generate pill styling automatically based on the config color
                tagsHtml += `<span style="background: ${config.color}33; color: ${config.color}; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; border: 1px solid ${config.color}4D;">${config.tagLabel}</span>`;
            }
        });
    }

    // Ability Active is unit-specific, so it stays separate
    if (window.activeAbilityIds && window.activeAbilityIds.has(unitId) && unit.ability) {
        tagsHtml += `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; border: 1px solid rgba(168, 85, 247, 0.3);">Ability Active</span>`;
    }

    let html = `<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
        <div style="width: 56px; height: 56px; flex-shrink: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);">
            <img src="${unit.img}" style="width: 110%; height: 110%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
            <div class="text-xl font-bold text-white leading-tight" style="display: flex; align-items: center; gap: 8px; letter-spacing: -0.5px;">
                ${unit.name}
            </div>
            <div class="text-xs text-dim font-bold" style="margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">${unit.role} ${unit.stats.element ? `• ${unit.stats.element}` : ''}</div>
            ${tagsHtml ? `<div style="margin-top: 8px; display: flex; gap: 6px;">${tagsHtml}</div>` : ''}
        </div>
    </div>`;

    const isPotential = (window.CALCULATION_MODE === 'potential');

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

    const mapStat = (s) => {
        if (s === 'cf') return 'Crit';
        if (s === 'cm') return 'CDmg';
        if (s === 'spa') return 'SPA';
        if (s === 'range') return 'Rng';
        if (s === 'dot') return 'DoT';
        return 'Dmg';
    };

    sortedTraits.forEach((b, idx) => {
        const isRange = (unitId === 'law');
        const isBossHigher = !isRange && (b.bossDps > (b.dps || 0));
        const val = isRange ? (b.range || 0).toFixed(1) : format(Math.max(b.dps || 0, b.bossDps || 0));
        const label = isRange ? 'RNG' : (isBossHigher ? 'BOSS DPS' : 'DPS');
        const labelClass = isRange ? 'comp-val-rng' : (isBossHigher ? 'comp-val-boss' : 'comp-val-dps');

        const tObj = getTraitByName(b.traitName, unitId);
        const traitImg = tObj ? `<div class="trait-img-rainbow" style="width: 22px; height: 22px; margin-right: 10px; flex-shrink: 0;"><img src="images/traits/${tObj.name}.png" onerror="this.parentElement.style.display='none'"></div>` : '';

        let headText = (b.headUsed && b.headUsed !== 'none') ? ` + ${HEAD_CONFIG[b.headUsed]?.name || 'Head'}` : '';
        const setupText = `<b class="text-white">${b.setName}</b> <span class="text-dim text-xs">(${mapStat(b.mainStats.body)}/${mapStat(b.mainStats.legs)})</span>${headText}`;

        let rowStyle = '';
        let rankStyle = 'opacity: 0.6; font-size: 0.85em; font-family: monospace;';

        if (idx === 0) {
            rankStyle = 'color: #fbbf24; font-weight: 900; font-size: 1.2em; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4);';
            rowStyle = 'background: rgba(251, 191, 36, 0.04);';
        }
        else if (idx === 1) rankStyle = 'color: #e2e8f0; font-weight: 800; font-size: 1.1em;';
        else if (idx === 2) rankStyle = 'color: #b45309; font-weight: 800; font-size: 1.1em;';

        const isCurrentlyEquipped = (window.unitTraits && window.unitTraits[unitId] === b.traitName) || (!window.unitTraits?.[unitId] && idx === 0);
        const actionBtn = isCurrentlyEquipped
            ? `<span style="color: #10b981; font-weight: bold; font-size: 0.75rem;">ACTIVE</span>`
            : `<button class="calc-btn ut-btn-compact" onclick="window.applyUnitTrait('${unitId}', '${b.traitName}')" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981; color: white; padding: 4px 10px; font-size: 0.75rem; font-weight: bold; border-radius: 4px; cursor: pointer; transition: all 0.2s;">SELECT</button>`;

        html += `<tr style="${rowStyle}">
            <td style="text-align: center; vertical-align: middle; padding: 10px 5px;"><span style="${rankStyle}">#${idx + 1}</span></td>
            <td style="vertical-align: middle; padding: 10px 5px;">
                <div style="display: flex; align-items: center;">
                    ${traitImg}
                    <span class="comp-tag" style="margin: 0; font-weight: 700; font-size: 0.85rem;">${b.traitName}</span>
                </div>
            </td>
            <td style="vertical-align: middle; padding: 10px 5px;">
                <div class="text-sm">${setupText}</div>
                <div class="text-xs" style="margin-top: 2px; color: rgba(255,255,255,0.4);">Prio: <span class="text-custom" style="font-weight: 600;">${b.prio.toUpperCase()}</span></div>
            </td>
            <td style="vertical-align: middle; text-align: right; padding: 10px 5px;">
                <div class="comp-highlight" style="font-weight: 800; font-size: 1rem; ${isBossHigher ? 'color: #fca5a5;' : ''}">${val} <span class="comp-val-label ${labelClass}" style="${isBossHigher ? 'color: #f87171;' : ''}">${label}</span></div>
                ${isBossHigher ? `<div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; margin-top: 2px;">${format(b.dps)} <span style="opacity: 0.6; font-size: 0.6rem;">BASE</span></div>` : ''}
            </td>
            ${isPotential ? '' : `
            <td style="vertical-align: middle; text-align: center; padding: 10px 5px;">
                ${actionBtn}
            </td>`}
        </tr>`;
    });

    html += `</tbody></table>`;
    showUniversalModal({ title: `<span class="text-gold">TRAIT LEADERBOARD</span>`, content: html, size: 'modal-lg' });
}

window.applyUnitTrait = function (unitId, traitName) {
    window.unitTraits = window.unitTraits || {};
    window.unitTraits[unitId] = traitName;

    // Clear the stale hotbarFilteredBuilds entry for this unit so the recalculation
    // writes a fresh hydrated build for the newly selected trait.
    if (window.hotbarFilteredBuilds) {
        delete window.hotbarFilteredBuilds[unitId];
    }
    // Clear live score cache for this unit
    if (window.LIVE_SCORE_CACHE) {
        Object.keys(window.LIVE_SCORE_CACHE).forEach(k => {
            if (k.startsWith(unitId)) delete window.LIVE_SCORE_CACHE[k];
        });
    }

    // Re-hydrate hotbarFilteredBuilds with the selected trait's best build
    if (typeof window.precalculateAllLoadoutBuilds === 'function') {
        window.precalculateAllLoadoutBuilds();
    }

    // Force a full recalculation with proper hotbar buff context.
    // recalculateHotbarTeam swaps to HOTBAR_STATIC_BUILD_DB + hotbar buff state,
    // then calls updateBuildListDisplay which writes the final hydrated build
    // to hotbarFilteredBuilds[unitId] (via renderListInternal line ~473).
    if (typeof window.recalculateHotbarTeam === 'function') {
        window.recalculateHotbarTeam();
    }

    // Refresh the hotbar slot stats overlay (reads from hotbarFilteredBuilds)
    if (typeof window.updateHotbarUI === 'function') {
        window.updateHotbarUI();
    }

    // Re-render the modal in-place so the selected trait gets the "ACTIVE" tag
    if (typeof openTraitBestList === 'function') openTraitBestList(unitId);
    if (typeof showToast === 'function') {
        const u = window.getUnitById(unitId);
        showToast(`Successfully selected ${traitName} trait for ${u ? u.name : unitId}!`);
    }
};

// Global Exports
window.processUnitCache = processUnitCache;
window.renderUnitCard = renderUnitCard;
window.renderListInternal = renderListInternal;
window.updateBuildListDisplay = updateBuildListDisplay;

window.precalculateAllLoadoutBuilds = function () {
    const activeDb = (window.CALCULATION_MODE === 'loadout' && window.HOTBAR_STATIC_BUILD_DB) ? window.HOTBAR_STATIC_BUILD_DB : window.STATIC_BUILD_DB;
    if (!activeDb) return;
    if (!window.hotbarFilteredBuilds) window.hotbarFilteredBuilds = {};

    unitDatabase.forEach(unit => {
        const unitId = unit.id;
        const activeType = (window.activeAbilityIds && window.activeAbilityIds.has(unitId) && unit.ability) ? 'abil' : 'base';
        const activeMode = 'fixed';

        let dbKey = unitId;
        if (activeType === 'abil') dbKey += '_abil';

        const dbEntry = activeDb[dbKey] || {};
        const modeData = dbEntry[activeMode] || dbEntry[activeMode === 'fixed' ? 'f' : 'b'];
        let perfectBuilds = modeData ? modeData[0] : null;

        // Try to pull comprehensive builds from the browser's dynamic cache if available,
        // because the static DB is truncated and might not contain the selected trait!
        if (window.unitBuildsCache && window.unitBuildsCache[unitId] && window.unitBuildsCache[unitId][activeType] && window.unitBuildsCache[unitId][activeType][activeMode]) {
            const cacheBuilds = window.unitBuildsCache[unitId][activeType][activeMode][0];
            if (cacheBuilds && cacheBuilds.length > 0) {
                perfectBuilds = cacheBuilds;
            }
        }

        if (perfectBuilds && perfectBuilds.length > 0) {
            let topBuild = perfectBuilds[0];
            const selectedTrait = window.unitTraits && window.unitTraits[unitId];
            if (selectedTrait) {
                const matchingBuilds = perfectBuilds.filter(b => {
                    const tName = (typeof b.t === 'number' ? (traitsList[b.t]?.name) : (b.traitName || b.t)) || 'Unknown Trait';
                    return tName.toLowerCase() === selectedTrait.toLowerCase();
                });
                if (matchingBuilds.length > 0) {
                    // Pick the highest-DPS matching build, not just the first one
                    topBuild = matchingBuilds.reduce((best, cur) => {
                        const bestDps = best.d || best.dps || 0;
                        const curDps = cur.d || cur.dps || 0;
                        return curDps > bestDps ? cur : best;
                    }, matchingBuilds[0]);
                }
            }
            const hydrated = {
                id: topBuild.id || `${unitId}-static`,
                traitName: (typeof topBuild.t === 'number' ? (traitsList[topBuild.t]?.name) : (topBuild.traitName || topBuild.t)) || 'Unknown Trait',
                setName: (typeof topBuild.s === 'number' ? (SETS[topBuild.s]?.name) : (topBuild.setName || topBuild.s)) || 'Unknown Set',
                dps: topBuild.d || topBuild.dps || 0,
                dmgVal: topBuild.dv || topBuild.dmgVal || 0,
                spa: topBuild.sp || topBuild.spa || 0,
                range: topBuild.ra || topBuild.range || 0,
                prio: topBuild.p || topBuild.prio || 'dmg',
                headUsed: (typeof topBuild.h === 'number' ? (['none', 'sun_god', 'ninja', 'reaper_necklace', 'shadow_reaper_necklace', 'junior', 'biju_head', 'bloodline_head', 'reanimated_head', 'sorcerer_hunter_spirit', 'strongest_sorcerer_glasses', 'monarch', 'warlord_hat', 'mochi_scarf', 'flaming_donut'][topBuild.h]) : (topBuild.headUsed || topBuild.h)) || 'none',
                subStats: topBuild.ss || topBuild.subStats || {},
                mainStats: topBuild.ms || topBuild.mainStats || {
                    body: (typeof topBuild.b === 'string' ? topBuild.b : (topBuild.b === 1 ? 'dot' : (topBuild.b === 2 ? 'cm' : 'dmg'))),
                    legs: (typeof topBuild.l === 'string' ? topBuild.l : (topBuild.l === 1 ? 'spa' : (topBuild.l === 2 ? 'cf' : (topBuild.l === 3 ? 'range' : 'dmg'))))
                }
            };

            const isInHotbarState = window.hotbarState?.slots.some(s => s && (s.id === unitId || s.id.split('-')[0] === unitId.split('-')[0]));
            if (typeof reconstructMathData === 'function') {
                try {
                    const fullMath = reconstructMathData(hydrated, undefined, { isHotbar: isInHotbarState });
                    if (fullMath) {
                        hydrated.dps = fullMath.total || fullMath.dps || 0;
                        hydrated.bossDps = fullMath.bossTotal || fullMath.bossDps || 0;
                        hydrated.dmgVal = fullMath.dmgVal;
                        hydrated.spa = fullMath.spa;
                        hydrated.range = fullMath.range;
                    }
                } catch (e) {
                    console.warn("Precalc Math Error", unitId, e);
                }
            }
            window.hotbarFilteredBuilds[unitId] = hydrated;
        }
    });
};