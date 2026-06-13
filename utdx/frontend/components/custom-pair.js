// ============================================================================
// CUSTOM-PAIR.JS - Custom Trait Combination Creator (Optimized & Safe)
// ============================================================================

window.customTraits = window.customTraits || [];
window.unitSpecificTraits = window.unitSpecificTraits || {};

let cpUnitSelection = new Set(['all']);
let cpT1 = 'ruler';
let cpT2 = 'none';
let cpSearchQuery = '';

function handleCpSearch(val) {
    cpSearchQuery = (val || '').trim().toLowerCase();
    renderCustomPairUI();
}

function openCustomPairModal() {
    // Reset to default state
    cpUnitSelection = new Set(['all']);
    cpT1 = 'ruler';
    cpT2 = 'none';
    cpSearchQuery = '';
    const searchInput = document.getElementById('cpUnitSearch');
    if (searchInput) searchInput.value = '';
    renderCustomPairUI();
    toggleModal('customPairModal', true);
}

const selectCpUnit = (id) => {
    if (id === 'all') {
        cpUnitSelection.clear();
        cpUnitSelection.add('all');
    } else {
        // If "all" was selected, remove it first
        if (cpUnitSelection.has('all')) cpUnitSelection.delete('all');

        // Toggle selection
        if (cpUnitSelection.has(id)) {
            cpUnitSelection.delete(id);
        } else {
            cpUnitSelection.add(id);
        }

        // If nothing selected, revert to all
        if (cpUnitSelection.size === 0) cpUnitSelection.add('all');
    }
    updateCpUnitSelectionClasses();
    updateCpPreviewText();
};

const selectCpT1 = (id) => {
    cpT1 = id;
    updateCpTraitSelectionClasses();
    updateCpPreviewText();
};

const selectCpT2 = (id) => {
    cpT2 = id;
    updateCpTraitSelectionClasses();
    updateCpPreviewText();
};

function renderCustomPairUI() {
    renderCustomPairUnitGrid();
    renderCustomPairTraitLists();
    updateCpPreviewText();
}

function renderCustomPairUnitGrid() {
    const unitGrid = document.getElementById('cpUnitGrid');
    if (!unitGrid) return;

    // Check if 'all' is selected
    const isAll = cpUnitSelection.has('all');

    // Units Grid
    let unitsHtml = `<div class="config-item ${isAll ? 'selected' : ''}" data-cp-unit="all" onclick="selectCpUnit('all')"><div class="cp-avatar-placeholder">ALL</div><span>All Units</span></div>`;

    unitDatabase.forEach(u => {
        const element = (u.stats && u.stats.element) ? u.stats.element.toLowerCase() : '';
        const nameMatches = u.name.toLowerCase().includes(cpSearchQuery);
        const elementMatches = element.includes(cpSearchQuery);
        if (cpSearchQuery && !nameMatches && !elementMatches) return;
        const isSelected = !isAll && cpUnitSelection.has(u.id);
        unitsHtml += `<div class="config-item ${isSelected ? 'selected' : ''}" data-cp-unit="${u.id}" onclick="selectCpUnit('${u.id}')">${getUnitImgHtml(u, '', 'small')}<span>${u.name}</span></div>`;
    });
    unitGrid.innerHTML = unitsHtml;
}

function renderCustomPairTraitLists() {
    const t1List = document.getElementById('cpTrait1List');
    const t2List = document.getElementById('cpTrait2List');
    if (!t1List || !t2List) return;

    // Trait 1 List
    const standardTraits = traitsList.filter(t => t.id !== 'none');
    let t1Html = '';
    standardTraits.forEach(t => {
        t1Html += `<div class="config-chip ${cpT1 === t.id ? 'selected' : ''}" data-cp-trait="${t.id}" onclick="selectCpT1('${t.id}')">${t.name}</div>`;
    });
    t1List.innerHTML = t1Html;

    // Trait 2 List
    let t2Html = `<div class="config-chip ${cpT2 === 'none' ? 'selected' : ''}" data-cp-trait="none" onclick="selectCpT2('none')">None</div>`;
    standardTraits.forEach(t => {
        t2Html += `<div class="config-chip ${cpT2 === t.id ? 'selected' : ''}" data-cp-trait="${t.id}" onclick="selectCpT2('${t.id}')">${t.name}</div>`;
    });
    t2List.innerHTML = t2Html;
}

function updateCpUnitSelectionClasses() {
    const unitGrid = document.getElementById('cpUnitGrid');
    if (!unitGrid) return;

    const isAll = cpUnitSelection.has('all');
    unitGrid.querySelectorAll('.config-item[data-cp-unit]').forEach(el => {
        const unitId = el.dataset.cpUnit;
        el.classList.toggle('selected', isAll ? unitId === 'all' : unitId !== 'all' && cpUnitSelection.has(unitId));
    });
}

function updateCpTraitSelectionClasses() {
    document.querySelectorAll('#cpTrait1List .config-chip[data-cp-trait]').forEach(el => {
        el.classList.toggle('selected', el.dataset.cpTrait === cpT1);
    });
    document.querySelectorAll('#cpTrait2List .config-chip[data-cp-trait]').forEach(el => {
        el.classList.toggle('selected', el.dataset.cpTrait === cpT2);
    });
}

function updateCpPreviewText() {
    const preview = document.getElementById('cpPreviewText');
    if (!preview) return;

    const isAll = cpUnitSelection.has('all');
    let uName = 'All Units';
    if (!isAll) {
        if (cpUnitSelection.size === 1) {
            // Get name of single selected unit
            const id = Array.from(cpUnitSelection)[0];
            const u = unitDatabase.find(x => x.id === id);
            uName = u ? u.name : 'Unknown';
        } else {
            uName = `${cpUnitSelection.size} Units Selected`;
        }
    }

    const t1Obj = traitsList.find(t => t.id === cpT1);
    const t1Name = t1Obj ? t1Obj.name : cpT1;

    const t2Obj = cpT2 === 'none' ? null : traitsList.find(t => t.id === cpT2);
    const t2Name = t2Obj ? t2Obj.name : '(None)';

    preview.innerHTML = `${uName} <span class="text-dim">+</span> <span class="text-accent-start">${t1Name}</span> <span class="text-dim">+</span> <span class="text-accent-end">${t2Name}</span>`;
}

function confirmAddCustomPair() {
    // Safe lookup of selected traits
    const t1 = typeof window.getTraitFast === 'function' ? window.getTraitFast(cpT1) : traitsList.find(t => t.id === cpT1);
    const t2 = cpT2 === 'none' ? { id: 'none', name: 'None' } : (typeof window.getTraitFast === 'function' ? window.getTraitFast(cpT2) : traitsList.find(t => t.id === cpT2));

    if (t1 && t2) {
        const combo = window.combineTraits(t1, t2);

        if (cpUnitSelection.has('all')) {
            // Case 1: Add to Global Custom Traits
            const allTraits = [...traitsList, ...window.customTraits];
            const alreadyExists = allTraits.some(t => t.name === combo.name);

            if (!alreadyExists && combo.id !== 'none') {
                window.customTraits.push(combo);
                alert(`Added global custom trait: ${combo.name}`);
            } else {
                alert("Trait combination already exists globally!");
                return; // Stop here if duplicate
            }

        } else {
            // Case 2: Add to specific units
            let successCount = 0;

            cpUnitSelection.forEach(unitId => {
                if (!window.unitSpecificTraits[unitId]) window.unitSpecificTraits[unitId] = [];
                const unitList = window.unitSpecificTraits[unitId];

                // Check duplicate per unit
                const alreadyExists = unitList.some(t => t.name === combo.name);

                if (!alreadyExists && combo.id !== 'none') {
                    window.unitSpecificTraits[unitId].push(combo);
                    successCount++;
                }
            });

            if (successCount > 0) {
                alert(`Added custom trait to ${successCount} unit(s).`);
            } else {
                alert("Trait combination already exists for selected unit(s)!");
                return;
            }
        }

        cacheCustomTraitForFastLookup(combo);

        // Refresh UI. Global custom traits affect every unit, but unit-specific
        // custom traits only need the affected unit(s) recalculated.
        const shouldFullRefresh = cpUnitSelection.has('all');

        closeModal('customPairModal');

        if (shouldFullRefresh) {
            resetAndRender();
            const guidesPage = document.getElementById('guidesPage');
            if (guidesPage && guidesPage.classList.contains('active') && typeof renderGuides === 'function') renderGuides();
        } else {
            scheduleCustomPairAffectedRefresh(Array.from(cpUnitSelection));
        }
    }
}

function cacheCustomTraitForFastLookup(combo) {
    if (!combo || !combo.id || !combo.name) return;
    if (window._traitCacheMap && typeof window._traitCacheMap.set === 'function') {
        window._traitCacheMap.set(combo.id.toLowerCase(), combo);
        window._traitCacheMap.set(combo.name.toLowerCase(), combo);
    }
}

function scheduleCustomPairAffectedRefresh(unitIds) {
    const run = () => markCustomPairUnitsPending(unitIds);

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 1000 });
    } else {
        setTimeout(run, 0);
    }
}

function markCustomPairUnitsPending(unitIds) {
    const uniqueUnitIds = Array.from(new Set(unitIds)).filter(Boolean);

    uniqueUnitIds.forEach(unitId => {
        clearCustomPairUnitCache(unitId);
        window.pendingCustomPairBuilds = window.pendingCustomPairBuilds || new Set();
        window.pendingCustomPairBuilds.add(unitId);

        if (window.forceCustomPairBuildRefresh) {
            window.forceCustomPairBuildRefresh.delete(unitId);
        }

        if (window.CALCULATION_MODE !== 'loadout' && typeof updateBuildListDisplay === 'function') {
            updateBuildListDisplay(unitId, true);
        }
        renderCustomPairPendingBanner(unitId);
    });

    // Keep unit-specific custom-pair adds lazy. In loadout mode, hotbar/team
    // recalculation would otherwise rerun the heavy build path immediately.
}

function renderCustomPairPendingBanner(unitId) {
    const card = document.getElementById(`card-${unitId}`);
    if (!card) return;

    let banner = card.querySelector('.custom-pair-pending-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.className = 'custom-pair-pending-banner';
        banner.style.cssText = 'position:sticky;top:0;z-index:8;margin:8px 10px 0;padding:10px 12px;border:1px solid rgba(96,165,250,.45);border-radius:12px;background:linear-gradient(135deg,rgba(96,165,250,.16),rgba(168,85,247,.10));box-shadow:0 8px 24px rgba(2,6,23,.35);font-size:.78rem;line-height:1.35;color:#dbeafe;';
        const insertAfter = card.querySelector('.unit-toolbar') || card.querySelector('.unit-hero') || card.firstChild;
        if (insertAfter && insertAfter.parentNode) {
            insertAfter.parentNode.insertBefore(banner, insertAfter.nextSibling);
        } else {
            card.prepend(banner);
        }
    }

    banner.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span>Custom pair added. Use quick card load to avoid freezing the site.</span>
            <button class="calc-btn" style="padding:3px 8px;font-size:.72rem;" onclick="window.refreshCustomPairBuilds('${unitId}')">Quick card load</button>
        </div>
    `;
}

window.refreshCustomPairBuilds = function (unitId) {
    if (!unitId) return;

    window.pendingCustomPairBuilds = window.pendingCustomPairBuilds || new Set();
    window.pendingCustomPairBuilds.delete(unitId);

    window.forceCustomPairBuildRefresh = window.forceCustomPairBuildRefresh || new Set();
    window.forceCustomPairBuildRefresh.delete(unitId);

    window.quickCustomPairBuildRefresh = window.quickCustomPairBuildRefresh || new Set();
    window.quickCustomPairBuildRefresh.add(unitId);

    clearCustomPairUnitCache(unitId);

    if (window.CALCULATION_MODE !== 'loadout' && typeof updateBuildListDisplay === 'function') {
        updateBuildListDisplay(unitId, true);
    }

    const card = document.getElementById(`card-${unitId}`);
    card?.querySelector('.custom-pair-pending-banner')?.remove();
    if (window.quickCustomPairBuildRefresh) {
        window.quickCustomPairBuildRefresh.delete(unitId);
    }
};

function clearCustomPairUnitCache(unitId) {
    if (window.unitBuildsCache) delete window.unitBuildsCache[unitId];
    if (window.unitActiveBuilds) delete window.unitActiveBuilds[unitId];
    if (window.hotbarFilteredBuilds) delete window.hotbarFilteredBuilds[unitId];
    if (window.LIVE_SCORE_CACHE) delete window.LIVE_SCORE_CACHE[unitId];

    if (window.bestHydratedBuildCache) {
        Object.keys(window.bestHydratedBuildCache).forEach(key => {
            if (key === unitId || key.startsWith(`${unitId}:`)) {
                delete window.bestHydratedBuildCache[key];
            }
        });
    }

    if (window.cachedResults) {
        Object.keys(window.cachedResults).forEach(key => {
            if (key === unitId || key.startsWith(`${unitId}-`)) {
                delete window.cachedResults[key];
            }
        });
    }

    if (window.modeBenchmarks) {
        delete window.modeBenchmarks[`${unitId}-base`];
        delete window.modeBenchmarks[`${unitId}-abil`];
    }
}