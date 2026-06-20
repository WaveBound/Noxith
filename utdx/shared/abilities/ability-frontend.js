// ============================================================================
// ABILITY-FRONTEND.JS - UI State & Toggle Logic for Abilities
// ============================================================================

const getAbilityEntryForAbilityDefaults = (unit) => Array.isArray(unit?.ability) ? unit.ability[0] : unit?.ability;

const getUnitDatabaseForAbilityDefaults = () => {
    if (Array.isArray(window.unitDatabase)) return window.unitDatabase;
    if (typeof unitDatabase !== 'undefined' && Array.isArray(unitDatabase)) return unitDatabase;
    return [];
};

window.getAbilityDefaultState = function (unit) {
    const ability = getAbilityEntryForAbilityDefaults(unit);
    if (!unit?.id || !ability) return false;
    if (unit.defaultAbilityActive !== undefined) return !!unit.defaultAbilityActive;
    return !!(ability.defaultActive || ability.defaultOn || ability.enabledByDefault);
};

window.initDefaultAbilityState = function () {
    window.activeAbilityIds = window.activeAbilityIds || new Set();
    getUnitDatabaseForAbilityDefaults().forEach(unit => {
        if (window.getAbilityDefaultState(unit)) window.activeAbilityIds.add(unit.id);
    });
    return window.activeAbilityIds;
};

window.isAbilityActive = function (unitId) {
    return window.activeAbilityIds && window.activeAbilityIds.has(unitId);
};

window.toggleAbility = function (unitId, checkbox) {
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

    if (typeof window.invalidateUnitMathCaches === 'function') window.invalidateUnitMathCaches(unitId);

    if (typeof window.refreshUnitAbilityBuildContainers === 'function') {
        window.refreshUnitAbilityBuildContainers(unitId, true, 150);
    } else if (typeof window.updateBuildListDisplay === 'function') {
        window.updateBuildListDisplay(unitId, true);
    }

    // Refresh hotbar stats if this unit is in the hotbar
    if (typeof window.updateHotbarUI === 'function') window.updateHotbarUI();

    // Ability state changes DPS for this unit, but card placement stays fixed.
};
