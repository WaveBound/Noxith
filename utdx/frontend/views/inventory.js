// ============================================================================
// INVENTORY.JS - Relic Inventory Management (Refactored)
// ============================================================================

const RELIC_STORAGE_KEY = 'uto_relic_inventory_v1';
const INVENTORY_ASSIGNMENTS_STORAGE_KEY = 'uto_inventory_unit_traits_v1';

const RELIC_COLORS = {
    'ninja': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'sun_god': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'laughing': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'ex': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'shadow_reaper': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'reaper_set': 'linear-gradient(135deg, #1e1b4b, #020617)',
    'default': 'linear-gradient(135deg, #1e1b4b, #020617)'
};

// Refactored to use Constants dynamically
function getSlotOptions(slot, starMult = 1) {
    const opts = [];

    // Helper to format option
    const makeOpt = (key, baseVal) => ({
        value: key,
        text: `${STAT_LABELS[getStatType(key)] || key.toUpperCase()} (${fix1(baseVal * starMult)}%)`
    });

    if (slot === 'Head') {
        opts.push(makeOpt('potency', 45)); // Head specific constants
        opts.push(makeOpt('elemental', 30));
    } else if (slot === 'Body') {
        Object.entries(MAIN_STAT_VALS.body).forEach(([key, val]) => opts.push(makeOpt(key, val)));
    } else if (slot === 'Legs') {
        Object.entries(MAIN_STAT_VALS.legs).forEach(([key, val]) => opts.push(makeOpt(key, val)));
    }
    return opts;
}

const STAT_MAPPING = {
    'subDmg': 'dmg', 'subSpa': 'spa', 'subCdmg': 'cm',
    'subCrit': 'cf', 'subDot': 'dot', 'subRange': 'range'
};

const REVERSE_STAT_MAPPING = {
    'dmg': 'subDmg', 'spa': 'subSpa', 'range': 'subRange',
    'cm': 'subCdmg', 'cf': 'subCrit', 'dot': 'subDot'
};

function getInventoryHeadOptions() {
    return (window.RELIC_PIECE_CATALOG || [])
        .filter(piece => piece.slot === 'Head')
        .map(piece => ({ id: piece.id, name: piece.name }));
}

function getRelicPiece(setKey, slot) {
    return (window.RELIC_PIECE_CATALOG || []).find(piece => piece.id === setKey && piece.slot === slot)
        || (window.RELIC_PIECE_CATALOG || []).find(piece => piece.id === setKey);
}

function getRelicDisplayName(setKey) {
    if (!setKey) return setKey;

    const piece = getRelicPiece(setKey, 'Head') || getRelicPiece(setKey, 'Body') || getRelicPiece(setKey, 'Legs');
    if (piece) return piece.name;

    const setObj = (SETS || []).find(s => s.id === setKey);
    if (setObj) return setObj.name;

    return String(setKey).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

let inventoryGrid;
let inventoryAssignmentPanel;
let highlightedRelicIds = new Set();

function initInventory() {
    inventoryGrid = document.getElementById('relicGrid');

    document.getElementById('openAddRelicBtn')?.addEventListener('click', openAddRelicModal);
    document.getElementById('addRelicConfirmBtn')?.addEventListener('click', addRelic);
    document.getElementById('addRelicCancelBtn')?.addEventListener('click', () => closeModal('addRelicModal'));

    setupModalInputs();
    loadInventory();
    loadInventoryAssignments();
    renderInventory();
    updateInventoryToggleState();

    // Update static labels for Crit Dmg and Crit Rate
    document.querySelectorAll('.sub-label.sub-cm').forEach(el => el.textContent = 'Crit Dmg');
    document.querySelectorAll('.sub-label.sub-cf').forEach(el => el.textContent = 'Crit Rate');


}

function saveInventory() {
    try { localStorage.setItem(RELIC_STORAGE_KEY, JSON.stringify(relicInventory)); } catch (e) { console.error(e); }
}

function saveInventoryAssignments() {
    try { localStorage.setItem(INVENTORY_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(inventoryUnitTraits || {})); } catch (e) { console.error(e); }
}

function loadInventoryAssignments() {
    try {
        const stored = localStorage.getItem(INVENTORY_ASSIGNMENTS_STORAGE_KEY);
        inventoryUnitTraits = stored ? JSON.parse(stored) : {};
    } catch (e) {
        inventoryUnitTraits = {};
    }
    window.inventoryUnitTraits = inventoryUnitTraits;
}

function getInventoryAssignedTrait(unitId) {
    return (inventoryUnitTraits && inventoryUnitTraits[unitId]) || null;
}
window.getInventoryAssignedTrait = getInventoryAssignedTrait;

function hasInventoryAssignments() {
    return !!(inventoryUnitTraits && Object.keys(inventoryUnitTraits).length > 0);
}
window.hasInventoryAssignments = hasInventoryAssignments;

function refreshInventoryAssignmentCalculations() {
    if (typeof window.resetCachesForBuffChange === 'function') window.resetCachesForBuffChange();
    if (typeof window.resetAndRender === 'function') window.resetAndRender();
    if (document.getElementById('guidesPage')?.classList.contains('active') && typeof window.renderGuides === 'function') window.renderGuides();
}

function renderInventoryAssignments() {
    inventoryAssignmentPanel = document.getElementById('inventoryAssignmentPanel');
    if (!inventoryAssignmentPanel) return;

    const sortedUnits = (unitDatabase || [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    const unitChoices = sortedUnits.map(u => `
        <label class="inventory-unit-choice" data-unit-name="${u.name.toLowerCase()}">
            <input type="checkbox" value="${u.id}" onchange="refreshInventoryTraitOptions()">
            <img src="${u.img}" alt="${u.name}" onerror="this.style.display='none'">
            <span>${u.name}</span>
        </label>
    `).join('');
    const firstUnitId = sortedUnits[0]?.id;
    const traitOptions = getInventoryTraitOptionsHtml(firstUnitId);

    const assignments = Object.entries(inventoryUnitTraits || {}).map(([unitId, traitId]) => {
        const unit = unitDatabase.find(u => u.id === unitId);
        const trait = traitsList.find(t => t.id === traitId) || customTraits.find(t => t.id === traitId) || (unitSpecificTraits[unitId] || []).find(t => t.id === traitId);
        if (!unit || !trait) return '';
        return `
            <div class="inventory-assignment-chip">
                <img src="${unit.img}" alt="${unit.name}" onerror="this.style.display='none'">
                <span class="ia-unit">${unit.name}</span>
                <span class="ia-trait">${trait.name}</span>
                <button type="button" onclick="removeInventoryAssignment('${unitId}')" title="Remove assignment">x</button>
            </div>`;
    }).join('');

    inventoryAssignmentPanel.innerHTML = `
        <div class="inventory-assignment-header">
            <div>
                <div class="inventory-assignment-title">Inventory Unit Traits</div>
                <div class="inventory-assignment-subtitle">Inventory mode only calculates relic builds for these unit and trait pairs.</div>
            </div>
        </div>
        <div class="inventory-assignment-controls">
            <input id="inventoryAssignSearch" class="inventory-assignment-search" type="text" placeholder="Search units..." oninput="filterInventoryAssignmentUnits(this.value)">
            <select id="inventoryAssignTrait" class="inventory-assignment-select">${traitOptions}</select>
            <button type="button" class="inventory-assignment-add" onclick="addInventoryAssignment()">Add</button>
        </div>
        <div id="inventoryAssignUnitList" class="inventory-unit-choice-list">${unitChoices}</div>
        <div class="inventory-assignment-list">
            ${assignments || '<div class="inventory-assignment-empty">Add a unit and trait to use Inventory mode for that unit.</div>'}
        </div>
    `;
}
window.renderInventoryAssignments = renderInventoryAssignments;

function getInventoryTraitOptionsHtml(unitId) {
    const allTraits = [...(traitsList || []), ...(customTraits || []), ...((unitSpecificTraits && unitSpecificTraits[unitId]) || [])];
    return allTraits
        .filter((t, index, self) => t.id !== 'none' && index === self.findIndex(x => x.id === t.id))
        .map(t => `<option value="${t.id}">${t.name}</option>`)
        .join('');
}

window.refreshInventoryTraitOptions = function () {
    const selectedUnits = Array.from(document.querySelectorAll('#inventoryAssignUnitList input:checked')).map(input => input.value);
    const unitId = selectedUnits[0] || document.querySelector('#inventoryAssignUnitList input')?.value;
    const traitSelect = document.getElementById('inventoryAssignTrait');
    if (!traitSelect) return;
    traitSelect.innerHTML = getInventoryTraitOptionsHtml(unitId);
};

window.filterInventoryAssignmentUnits = function (query) {
    const q = (query || '').trim().toLowerCase();
    document.querySelectorAll('#inventoryAssignUnitList .inventory-unit-choice').forEach(item => {
        const name = item.dataset.unitName || '';
        item.classList.toggle('hidden', q && !name.includes(q));
    });
};

window.openInventoryAssignmentsMenu = function () {
    if (typeof window.showUniversalModal !== 'function') return;
    window.showUniversalModal({
        title: 'INVENTORY MODE',
        content: '<div id="inventoryAssignmentPanel" class="inventory-assignment-panel inventory-assignment-modal"></div>',
        footerButtons: '<button class="action-btn secondary" onclick="closeModal(\'universalModal\')">Close</button>',
        size: 'modal-md'
    });
    renderInventoryAssignments();
};

window.addInventoryAssignment = function () {
    const unitIds = Array.from(document.querySelectorAll('#inventoryAssignUnitList input:checked')).map(input => input.value);
    const traitId = document.getElementById('inventoryAssignTrait')?.value;
    if (unitIds.length === 0 || !traitId) return;

    unitIds.forEach(unitId => {
        inventoryUnitTraits[unitId] = traitId;
    });
    window.inventoryUnitTraits = inventoryUnitTraits;
    saveInventoryAssignments();
    renderInventoryAssignments();
    refreshInventoryAssignmentCalculations();
};

window.removeInventoryAssignment = function (unitId) {
    if (!inventoryUnitTraits || !inventoryUnitTraits[unitId]) return;
    delete inventoryUnitTraits[unitId];
    window.inventoryUnitTraits = inventoryUnitTraits;
    saveInventoryAssignments();
    renderInventoryAssignments();
    refreshInventoryAssignmentCalculations();
};

function loadInventory() {
    try {
        const stored = localStorage.getItem(RELIC_STORAGE_KEY);
        relicInventory = stored ? JSON.parse(stored) : [];

        // Migration for old head pieces
        relicInventory.forEach(r => {
            if (r.slot === 'Head') {
                if (r.setKey === 'biju_set') r.setKey = 'biju_head';
                if (r.setKey === 'reanimated_ninja') r.setKey = 'reanimated_head';
                if (r.setKey === 'sorcerer_hunter') r.setKey = 'sorcerer_hunter_spirit';
                if (r.setKey === 'strongest_sorcerer') r.setKey = 'strongest_sorcerer_glasses';
                if (r.setKey === 'mochi') r.setKey = 'mochi_scarf';
                if (r.setKey === 'fused_set') r.setKey = 'fused_earrings';
            }
        });
    } catch (e) {
        relicInventory = [];
    }
}

function updateInventoryToggleState() {
    const inventoryList = (typeof window !== 'undefined' && window.relicInventory && window.relicInventory.length > 0)
        ? window.relicInventory
        : (relicInventory || []);
    const inventoryModeEnabled = (typeof window !== 'undefined' && typeof window.inventoryMode !== 'undefined')
        ? window.inventoryMode
        : inventoryMode;
    const isEmpty = (!inventoryList || inventoryList.length === 0);
    const toggleIds = ['globalInventoryMode', 'guideInventoryMode'];

    if (isEmpty && typeof inventoryMode !== 'undefined' && inventoryModeEnabled) {
        inventoryMode = false;
        window.inventoryMode = false;
        if (typeof resetAndRender === 'function') resetAndRender();
    }

    toggleIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        const label = input.parentNode;

        if (isEmpty) {
            input.disabled = true; input.checked = false;
            label.classList.add('disabled'); label.classList.remove('is-checked');
            label.title = "Inventory is empty. Add relics to enable.";
        } else {
            input.disabled = false; label.classList.remove('disabled');
            label.title = "Calculate using ONLY relics from your Inventory";
            if (typeof inventoryModeEnabled !== 'undefined') {
                input.checked = inventoryModeEnabled;
                label.classList.toggle('is-checked', inventoryModeEnabled);
            }
        }
    });
}

function updateSetOptions(slot) {
    const setSelect = document.getElementById('newRelicSet');
    if (!setSelect) return;
    const currentSelection = setSelect.value;
    const options = (window.RELIC_PIECE_CATALOG || [])
        .filter(piece => piece.slot === slot)
        .map(piece => ({ id: piece.id, name: piece.name }));

    setSelect.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.id;
        opt.textContent = option.name;
        setSelect.appendChild(opt);
    });

    if (options.some(option => option.id === currentSelection)) setSelect.value = currentSelection;
    else if (options.length > 0) setSelect.value = options[0].id;

    updateStarVisibility();
}

function updateStarVisibility() {
    const slot = document.getElementById('newRelicSlot').value;
    const setId = document.getElementById('newRelicSet').value;
    const starSelect = document.getElementById('newRelicStars');
    if (!starSelect) return;

    const piece = getRelicPiece(setId, slot);
    const selectedSet = piece?.setId ? (SETS || []).find(s => s.id === piece.setId) : null;
    const showStars = !!piece && !!selectedSet && selectedSet.rarity === 'Secret' && !piece.headPiece;
    if (showStars) {
        starSelect.parentElement.classList.remove('hidden');
    } else {
        starSelect.parentElement.classList.add('hidden');
        if (starSelect.value !== "1") {
            starSelect.value = "1";
            updateMainStatOptions(slot);
            updateSubStatValues(1);
        }
    }
}

function lockConflictingSubStat(mainStatValue) {
    const normKey = normalizeStatKey(mainStatValue);
    const targetId = REVERSE_STAT_MAPPING[normKey];

    Object.keys(STAT_MAPPING).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const shouldDisable = (id === targetId);
        el.disabled = shouldDisable;
        el.parentElement.classList.toggle('disabled', shouldDisable);
        if (shouldDisable) {
            el.value = '';
            el.removeAttribute('data-base-val');
        }
    });
}

function updateSubStatValues(newMult) {
    Object.keys(STAT_MAPPING).forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.disabled) {
            applyStarScalingToInput(input, newMult);
        }
    });
}

function updateMainStatOptions(slot) {
    const starSelect = document.getElementById('newRelicStars');
    const starVal = starSelect ? (parseFloat(starSelect.value) || 1) : 1;
    const select = document.getElementById('newRelicMainStat');
    const currentVal = select.value;

    const opts = getSlotOptions(slot, starVal);
    select.innerHTML = opts.map(o => `<option value="${o.value}">${o.text}</option>`).join('');

    if (opts.some(o => o.value === currentVal)) {
        select.value = currentVal;
    } else if (opts.length > 0) {
        select.value = opts[0].value;
        lockConflictingSubStat(opts[0].value);
    }
}

// --- Setup ---

function setupModalInputs() {
    const slotSelect = document.getElementById('newRelicSlot');
    const mainStatSelect = document.getElementById('newRelicMainStat');
    const setSelect = document.getElementById('newRelicSet');
    const starSelect = document.getElementById('newRelicStars');

    if (slotSelect && mainStatSelect && setSelect) {
        updateSetOptions(slotSelect.value);
        slotSelect.addEventListener('change', () => {
            updateMainStatOptions(slotSelect.value);
            updateSetOptions(slotSelect.value);
        });
        mainStatSelect.addEventListener('change', () => lockConflictingSubStat(mainStatSelect.value));
        setSelect.addEventListener('change', updateStarVisibility);
        updateMainStatOptions(slotSelect.value);
        updateStarVisibility();
    }

    if (starSelect) {
        starSelect.innerHTML = `<option value="1">1★</option><option value="1.025">2★</option><option value="1.05">3★</option>`;
        starSelect.addEventListener('change', () => {
            const newMult = parseFloat(starSelect.value) || 1;
            updateMainStatOptions(document.getElementById('newRelicSlot').value);
            updateSubStatValues(newMult);
        });
    }

    // SHARED INPUT SCALING LOGIC
    const getModalStarMult = () => parseFloat(document.getElementById('newRelicStars').value) || 1;

    Object.keys(STAT_MAPPING).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            attachStatScaler(input, getModalStarMult);
        }
    });
}

// --- Modal Actions ---

function openAddRelicModal() {
    document.querySelectorAll('#addRelicModal input[type="number"]').forEach(inp => {
        inp.value = '';
        inp.removeAttribute('data-base-val');
        inp.disabled = false;
        inp.parentElement.classList.remove('disabled');
    });

    const slotSelect = document.getElementById('newRelicSlot');
    if (slotSelect) {
        slotSelect.value = 'Head';
        updateMainStatOptions('Head');
        updateSetOptions('Head');
    }

    const starSelect = document.getElementById('newRelicStars');
    if (starSelect) starSelect.value = "1";

    updateStarVisibility();
    updateSubStatValues(1);
    toggleModal('addRelicModal', true);
}

function addRelic() {
    const subs = {};
    Object.keys(STAT_MAPPING).forEach(id => {
        const val = parseFloat(document.getElementById(id).value) || 0;
        if (val > 0) subs[STAT_MAPPING[id]] = val;
    });

    const slot = document.getElementById('newRelicSlot').value;
    let setKey = document.getElementById('newRelicSet').value;
    const selectedPiece = getRelicPiece(setKey, slot);

    if (slot === 'Head') {
        if (setKey === 'shadow_reaper') setKey = 'shadow_reaper_necklace';
        if (setKey === 'reaper_set') setKey = 'reaper_necklace';
        if (setKey === 'warlord') setKey = 'warlord_hat';
        if (setKey === 'rebellious') setKey = 'rebellious';
        if (setKey === 'biju_set') setKey = 'biju_head';
        if (setKey === 'reanimated_ninja') setKey = 'reanimated_head';
        if (setKey === 'sorcerer_hunter') setKey = 'sorcerer_hunter_spirit';
        if (setKey === 'strongest_sorcerer') setKey = 'strongest_sorcerer_glasses';
        if (setKey === 'mochi') setKey = 'mochi_scarf';
        if (setKey === 'fused_set') setKey = 'fused_earrings';
    }

    const newRelic = {
        id: Date.now().toString(),
        slot: slot,
        setKey: setKey,
        stars: parseFloat(document.getElementById('newRelicStars').value) || 1,
        mainStat: document.getElementById('newRelicMainStat').value,
        subs: subs
    };

    relicInventory.push(newRelic);
    saveInventory();
    renderInventory();
    updateInventoryToggleState();

    if (typeof window.resetCachesForBuffChange === 'function') window.resetCachesForBuffChange();
    if (typeof resetAndRender === 'function') resetAndRender();
    closeModal('addRelicModal');
}

function deleteRelic(id) {
    if (confirm('Delete this relic?')) {
        relicInventory = relicInventory.filter(r => r.id !== id);
        saveInventory();
        renderInventory();
        updateInventoryToggleState();
        if (typeof window.resetCachesForBuffChange === 'function') window.resetCachesForBuffChange();
        if (typeof resetAndRender === 'function') resetAndRender();
    }
}

// --- Visuals & Rendering ---

function getRelicVisuals(setKey, slot) {
    const piece = getRelicPiece(setKey, slot);
    if (piece?.headPiece && slot === 'Head') {
        return { src: '', bg: RELIC_COLORS.default };
    }

    let visualKey = piece?.setId || setKey;
    if (visualKey === 'shadow_reaper_necklace') visualKey = 'shadow_reaper';
    if (visualKey === 'reaper_necklace') visualKey = 'reaper_set';
    if (visualKey === 'warlord_hat') visualKey = 'warlord';
    if (visualKey === 'reanimated_head') visualKey = 'reanimated_ninja';
    if (visualKey === 'biju_head') visualKey = 'biju_set';
    if (visualKey === 'strongest_sorcerer_glasses') visualKey = 'strongest_sorcerer';
    if (visualKey === 'sorcerer_hunter_spirit') visualKey = 'sorcerer_hunter';
    if (visualKey === 'junior') visualKey = 'ninja';
    if (visualKey === 'rebellious') visualKey = 'rebellious_set';
    if (visualKey === 'fused_earrings') visualKey = 'fused_set';

    const customImages = {
        'ninja': { 'Head': 'JuniorMask.png', 'Body': 'JuniorTop.png', 'Legs': 'JuniorBottom.png' },
        'sun_god': { 'Head': 'SunGodMask.png', 'Body': 'SunGodTop.png', 'Legs': 'SunGodBottom.png' },
        'laughing': { 'Head': 'LaughingMask.png', 'Body': 'LaughingTop.png', 'Legs': 'LaughingBottom.png' },
        'ex': { 'Head': 'ExMask.png', 'Body': 'ExTop.png', 'Legs': 'ExBottom.png' },
        'shadow_reaper': { 'Head': 'ShadowMask.png', 'Body': 'ShadowTop.png', 'Legs': 'ShadowBottom.png' },
        'reaper_set': { 'Head': 'ReaperMask.png', 'Body': 'ReaperTop.png', 'Legs': 'ReaperBottom.png' },
        'super_roku': { 'Head': 'RokuMask.png', 'Body': 'RokuTop.png', 'Legs': 'RokuBottom.png' },
        'bio_android': { 'Head': 'AndroidMask.png', 'Body': 'AndroidTop.png', 'Legs': 'AndroidBottom.png' },
        'biju_set': { 'Head': 'BijuMask.png', 'Body': 'BijuTop.png', 'Legs': 'BijuBottom.png' },
        'rebellious_set': { 'Head': 'ReblliousMask.png', 'Body': 'ReblliousTop.png', 'Legs': 'ReblliousBottom.png' },
        'reanimated_ninja': { 'Head': 'ReanimatedMask.png', 'Body': 'ReanimatedTop.png', 'Legs': 'ReanimatedBottom.png' },
        'great_mage': { 'Head': 'MageMask.png', 'Body': 'MageTop.png', 'Legs': 'MageBottom.png' },
        'warlord': { 'Head': 'WarlordMask.png', 'Body': 'WarlordTop.png', 'Legs': 'WarlordBottom.png' },
        'monarch': { 'Head': 'MonarchHead.png', 'Body': 'MonarchTop.png', 'Legs': 'MonarchBottom.png' },
        'strongest_sorcerer': { 'Head': 'StrongestHead.png', 'Body': 'StrongestTop.png', 'Legs': 'StrongestBottom.png' },
        'sorcerer_hunter': { 'Head': 'HunterHead.png', 'Body': 'HunterTop.png', 'Legs': 'HunterBottom.png' }
    };

    if (customImages[visualKey] && customImages[visualKey][slot]) {
        return { src: `images/relic/${customImages[visualKey][slot]}`, bg: RELIC_COLORS[visualKey] || RELIC_COLORS.default };
    }
    return { src: `images/relic/${visualKey}_${slot.toLowerCase()}.png`, bg: RELIC_COLORS[visualKey] || RELIC_COLORS.default };
}

function calculateMainValue(relic) {
    let base = 0;
    if (relic.mainStat === 'potency') base = 45;
    else if (relic.mainStat === 'elemental') base = 30;
    else if (MAIN_STAT_VALS.body[relic.mainStat]) base = MAIN_STAT_VALS.body[relic.mainStat];
    else if (MAIN_STAT_VALS.legs[relic.mainStat]) base = MAIN_STAT_VALS.legs[relic.mainStat];
    return base * (relic.stars || 1);
}

function viewInventoryItems(headId, bodyId, legsId) {
    highlightedRelicIds.clear();
    if (headId && headId !== 'none') highlightedRelicIds.add(headId);
    if (bodyId && bodyId !== 'none-b') highlightedRelicIds.add(bodyId);
    if (legsId && legsId !== 'none-l') highlightedRelicIds.add(legsId);

    switchPage('inventory');
    renderInventory();
    if (inventoryGrid) inventoryGrid.scrollTop = 0;
}
window.viewInventoryItems = viewInventoryItems;
window.clearInventoryHighlights = () => { highlightedRelicIds.clear(); renderInventory(); };

function renderInventory() {
    if (!inventoryGrid) return;
    inventoryGrid.innerHTML = '';

    if (!relicInventory || relicInventory.length === 0) {
        inventoryGrid.innerHTML = '<div class="inventory-empty-msg">No relics in inventory. Add one to get started!</div>';
        return;
    }

    const frag = document.createDocumentFragment();

    const sortedInventory = [...relicInventory].sort((a, b) => {
        const aH = highlightedRelicIds.has(a.id), bH = highlightedRelicIds.has(b.id);
        if (aH && !bH) return -1;
        if (!aH && bH) return 1;
        return 0;
    });

    sortedInventory.forEach(relic => {
        const card = document.createElement('div');
        const isHighlighted = highlightedRelicIds.has(relic.id);

        card.className = 'relic-card-clean' + (isHighlighted ? ' relic-highlighted' : '');

        const visuals = getRelicVisuals(relic.setKey, relic.slot);
        const piece = getRelicPiece(relic.setKey, relic.slot);
        const lookupKey = piece?.setId || relic.setKey;

        const setObj = (SETS || []).find(s => s.id === lookupKey);
        let starCount = 0;
        if (setObj && setObj.rarity === 'Secret') {
            if (relic.stars >= 1.05) starCount = 3;
            else if (relic.stars >= 1.025) starCount = 2;
            else if (relic.stars >= 1) starCount = 1;
        }

        const mainVal = calculateMainValue(relic);
        const mainBadge = getBadgeHtml(relic.mainStat, mainVal);

        const subData = Object.entries(relic.subs).map(([k, v]) => ({ type: k, val: v }));
        const subBadges = subData.map(s => getBadgeHtml(s.type, s.val)).join('');
        const imageHtml = visuals.src ? `<img src="${visuals.src}" class="rc-image" onerror="this.style.display='none'">` : '';

        card.innerHTML = `
            <div class="rc-header">
                <div class="rc-set-info">
                    <span class="rc-set-name">${getRelicDisplayName(relic.setKey)}</span>
                    <span class="rc-stars">${starCount > 0 ? "★".repeat(starCount) : ""}</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0; margin-left: auto;">
                    <button class="rc-opt-btn" onclick="event.stopPropagation(); checkOptimality('${relic.id}')" title="Check Optimality">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                        OPTIMALITY
                    </button>
                    <button class="rc-delete-btn" onclick="event.stopPropagation(); deleteRelic('${relic.id}')" title="Delete">×</button>
                </div>
            </div>
            <div class="rc-visual-container">
                <div class="rc-image-wrapper" style="background: ${visuals.bg}">
                    ${imageHtml}
                    <div class="rc-slot-badge">${relic.slot}</div>
                </div>
            </div>
            <div class="rc-stats-container">
                <div class="rc-main-stat">
                    <div class="rc-label" style="font-size: 0.75rem;">MAIN STAT</div>
                    <div class="rc-main-badge-wrapper">${mainBadge}</div>
                </div>
                <div class="rc-separator"></div>
                <div class="rc-sub-stats">
                    <div class="rc-label" style="font-size: 0.75rem;">SUB STATS</div>
                    <div class="rc-subs-grid" style="display: flex; flex-wrap: wrap; gap: 4px;">${subBadges}</div>
                </div>
            </div>
        `;

        frag.appendChild(card);
    });

    inventoryGrid.appendChild(frag);
}

function checkOptimality(relicId) {
    const relic = relicInventory.find(r => r.id === relicId);
    if (!relic) return;

    // Build Modal Content
    const unitOptions = unitDatabase.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    const traitOptions = traitsList.filter(t => t.id !== 'none').map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    const content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
                <div class="text-sm text-dim mb-1">Analyzing Relic:</div>
                <div class="text-white text-bold">${getRelicDisplayName(relic.setKey)} (${relic.slot})</div>
                <div class="text-xs text-gold">${relic.mainStat.toUpperCase()} ${relic.stars}★</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.75rem; color: #aaa;">Compare Context (Unit)</label>
                    <select id="optUnitSelect" class="modal-select" style="padding: 4px;">${unitOptions}</select>
                </div>
                <div class="input-group" style="margin: 0;">
                    <label style="font-size: 0.75rem; color: #aaa;">Trait</label>
                    <select id="optTraitSelect" class="modal-select" style="padding: 4px;">${traitOptions}</select>
                </div>
            </div>
        </div>
        <div id="optResultArea" class="hidden" style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 15px; display: flex; align-items: center; gap: 20px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="position: relative; width: 70px; height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,0.05); border: 2px solid #555;" id="optCircle">
                <span id="optPercent" style="font-size: 1.2rem; font-weight: bold; color: #fff;">0%</span>
                <small style="font-size: 0.6rem; color: #aaa; text-transform: uppercase;">Optimality</small>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Current DPS:</span> <span id="optCurrent" class="text-white">-</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Potential DPS:</span> <span id="optMax" class="text-gold">-</span></div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);"><span class="text-xs text-dim">Best Stat for Slot:</span> <span id="optBestStat" class="text-xs text-accent-start">-</span></div>
                <div id="optSuggestion" class="text-xs text-dim mt-1" style="margin-top: 6px; font-style: italic;"></div>
            </div>
        </div>
    `;

    showUniversalModal({
        title: 'RELIC OPTIMALITY',
        content: content,
        footerButtons: `<button class="action-btn" onclick="runOptimalityCalc('${relicId}')">Calculate</button><button class="action-btn secondary" onclick="closeModal('universalModal')">Close</button>`,
        size: 'modal-sm'
    });

    if (currentCalcUnitId) document.getElementById('optUnitSelect').value = currentCalcUnitId;
    else document.getElementById('optUnitSelect').value = unitDatabase[0].id;
}

window.runOptimalityCalc = function (relicId) {
    const relic = relicInventory.find(r => r.id === relicId);
    if (!relic) return;

    const unitId = document.getElementById('optUnitSelect').value;
    const traitId = document.getElementById('optTraitSelect').value;
    const unit = unitDatabase.find(u => u.id === unitId);
    if (!unit) return;

    // 1. Setup Context
    const { effectiveStats, context } = buildCalculationContext(unit, traitId, {
        isAbility: activeAbilityIds.has(unitId),
        headPiece: (relic.slot === 'Head') ? relic.setKey : 'none',
        starMult: relic.stars || 1
    });

    const starMult = relic.stars || 1;

    // 2. Calculate CURRENT DPS
    const buildCurrentStats = () => {
        let stats = { set: relic.setKey, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };
        const mainBase = relic.slot === 'Body' ? MAIN_STAT_VALS.body[relic.mainStat] : MAIN_STAT_VALS.legs[relic.mainStat];
        if (mainBase) stats[relic.mainStat] = mainBase * starMult;
        Object.entries(relic.subs).forEach(([k, v]) => { if (stats[k] !== undefined) stats[k] += v; });
        return stats;
    };
    const currentRes = calculateDPS(effectiveStats, buildCurrentStats(), context);

    // 3. Find BENCHMARK (Absolute Best possible piece for this unit)
    let maxScore = 0;
    let bestConfig = { set: '', main: '', sub: '', filler: [] };

    const candidates = ['dmg', 'spa', 'range', 'cm', 'cf', 'dot'].filter(c => {
        if (c === 'dot' && !statConfig.applyRelicDot) return false;
        if ((c === 'cm' || c === 'cf') && !statConfig.applyRelicCrit) return false;
        return true;
    });

    // Scan every set to find the absolute ceiling for this unit
    SETS.forEach(set => {
        candidates.forEach(masterStat => {
            let benchStats = { set: set.id, dmg: 0, spa: 0, range: 0, cm: 0, cf: 0, dot: 0 };

            const slotMains = relic.slot === 'Body' ? MAIN_STAT_VALS.body : MAIN_STAT_VALS.legs;
            let bestMain = 'dmg';
            let bestMainDps = 0;

            Object.keys(slotMains).forEach(mKey => {
                let temp = { ...benchStats, [mKey]: slotMains[mKey] * starMult };
                let res = calculateDPS(effectiveStats, temp, context);
                if (res.total > bestMainDps) { bestMainDps = res.total; bestMain = mKey; }
            });
            benchStats[bestMain] = slotMains[bestMain] * starMult;

            // Apply 1 Master Stat (base + 5 upgrades = 6 rolls)
            benchStats[masterStat] += MAX_SUB_STAT_VALUES[masterStat] * starMult;

            // Apply 3 Filler Stats (1 Roll Each) for a "Legal" God Roll
            let fillers = candidates.filter(c => c !== masterStat && c !== bestMain);
            let fillerDpsMap = fillers.map(fKey => {
                let temp = { ...benchStats, [fKey]: PERFECT_SUBS[fKey] * starMult };
                return { key: fKey, dps: calculateDPS(effectiveStats, temp, context).total };
            }).sort((a, b) => b.dps - a.dps);

            const top3Fillers = fillerDpsMap.slice(0, 3);
            top3Fillers.forEach(f => benchStats[f.key] += PERFECT_SUBS[f.key] * starMult);

            let finalBenchRes = calculateDPS(effectiveStats, benchStats, context);
            if (finalBenchRes.total > maxScore) {
                maxScore = finalBenchRes.total;
                bestConfig = { set: set.name, main: bestMain, sub: masterStat, filler: top3Fillers };
            }
        });
    });

    // 4. Update UI Display
    const pct = (currentRes.total / maxScore) * 100;
    document.getElementById('optResultArea').classList.remove('hidden');
    document.getElementById('optPercent').innerText = fix1(pct) + '%';
    document.getElementById('optCurrent').innerText = format(currentRes.total);
    document.getElementById('optMax').innerText = format(maxScore);

    // Calculate exact values for the God-Roll
    const mainVal = (relic.slot === 'Body' ? MAIN_STAT_VALS.body[bestConfig.main] : MAIN_STAT_VALS.legs[bestConfig.main]) * starMult;
    const masterVal = MAX_SUB_STAT_VALUES[bestConfig.sub] * starMult;

    // Create styled badges for every stat using the unified helper
    const mainBadge = getBadgeHtml(bestConfig.main, mainVal);
    const masterBadge = getBadgeHtml(bestConfig.sub, masterVal);
    const fillerHtml = bestConfig.filler.map(f => {
        const val = PERFECT_SUBS[f.key] * starMult;
        return getBadgeHtml(f.key, val);
    }).join('');

    document.getElementById('optBestStat').innerHTML = `
        <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
            <div class="text-xs text-dim mb-2" style="letter-spacing:1px; font-weight: 800; opacity: 0.6;">BENCHMARK GOD-ROLL (100%):</div>
            <div style="display:flex; flex-direction:column; gap:8px; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                <div class="text-white text-bold" style="font-size: 13px; margin-bottom: 2px;">${bestConfig.set} (${relic.slot})</div>
                
                <div class="text-xs" style="display:flex; align-items:center; gap:8px;">
                    <span style="width: 50px; opacity: 0.7;">Main:</span> ${mainBadge}
                </div>
                
                <div class="text-xs" style="display:flex; align-items:center; gap:8px;">
                    <span style="width: 50px; opacity: 0.7;">Master:</span> ${masterBadge}
                </div>
                
                <div class="text-xs" style="display:flex; align-items:flex-start; gap:8px;">
                    <span style="width: 50px; opacity: 0.7; margin-top: 3px;">Base:</span> 
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">${fillerHtml}</div>
                </div>
            </div>
        </div>
    `;

    const circle = document.getElementById('optCircle');
    const color = pct >= 95 ? '#4ade80' : pct >= 80 ? '#fbbf24' : '#f87171';
    circle.style.borderColor = color;
    document.getElementById('optPercent').style.color = color;
};
