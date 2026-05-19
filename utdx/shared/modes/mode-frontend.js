// ============================================================================
// MODE-FRONTEND.JS - UI State & Interaction Logic for Unit Modes
// ============================================================================

window.getActiveModeIndex = function(unitId) {
    if (!window.unitModesState) window.unitModesState = {};
    return window.unitModesState[unitId] !== undefined ? window.unitModesState[unitId] : 0;
};

window.handleUnitModeChange = function(unitId, updateStateCallback) {
    if (updateStateCallback) updateStateCallback();

    const unit = typeof getUnitById === 'function' ? getUnitById(unitId) : (typeof unitDatabase !== 'undefined' ? unitDatabase.find(u => u.id === unitId) : null);
    if (!unit) return;

    if (window.unitBuildsCache && window.unitBuildsCache[unitId]) {
        window.unitBuildsCache[unitId] = { base: { fixed: [null, null, null, null] }, abil: { fixed: [null, null, null, null] } };
    }

    if (typeof processUnitCache === 'function') processUnitCache(unit);
    else return window.resetAndRender();

    // Small timeout to ensure DOM resolves before updating UI list
    setTimeout(() => {
        if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(unitId);
        const guidesPage = document.getElementById('guidesPage');
        if (guidesPage && guidesPage.classList.contains('active') && typeof renderGuides === 'function') renderGuides();
    }, 10);
};
