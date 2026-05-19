// ============================================================================
// ABILITY-FRONTEND.JS - UI State & Toggle Logic for Abilities
// ============================================================================

window.isAbilityActive = function(unitId) {
    return window.activeAbilityIds && window.activeAbilityIds.has(unitId);
};

window.toggleAbility = function(unitId, checkbox) {
    const card = document.getElementById('card-' + unitId);
    if (!card) return;
    
    checkbox.parentNode.classList.toggle('is-checked', checkbox.checked);
    if (checkbox.checked) {
        card.classList.add('use-ability');
        window.activeAbilityIds.add(unitId);
    } else {
        card.classList.remove('use-ability');
        window.activeAbilityIds.delete(unitId);
    }
    
    if (typeof window.updateBuildListDisplay === 'function') window.updateBuildListDisplay(unitId, true);
    // Refresh hotbar stats if this unit is in the hotbar
    if (typeof window.updateHotbarUI === 'function') window.updateHotbarUI();
};
