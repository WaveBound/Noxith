// ============================================================================
// CUSTOM-PAIR.JS - Custom Trait Combination Creator (Optimized & Safe)
// ============================================================================

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
    renderCustomPairUI();
};

const selectCpT1 = (id) => {
    cpT1 = id;
    renderCustomPairUI();
};

const selectCpT2 = (id) => {
    cpT2 = id;
    renderCustomPairUI();
};

function renderCustomPairUI() {
    const unitGrid = document.getElementById('cpUnitGrid');
    const t1List = document.getElementById('cpTrait1List');
    const t2List = document.getElementById('cpTrait2List');

    // Check if 'all' is selected
    const isAll = cpUnitSelection.has('all');

    // Units Grid
    let unitsHtml = `<div class="config-item ${isAll ? 'selected' : ''}" onclick="selectCpUnit('all')"><div class="cp-avatar-placeholder">ALL</div><span>All Units</span></div>`;

    unitDatabase.forEach(u => {
        const element = (u.stats && u.stats.element) ? u.stats.element.toLowerCase() : '';
        const nameMatches = u.name.toLowerCase().includes(cpSearchQuery);
        const elementMatches = element.includes(cpSearchQuery);
        if (cpSearchQuery && !nameMatches && !elementMatches) return;
        const isSelected = cpUnitSelection.has(u.id);
        unitsHtml += `<div class="config-item ${isSelected ? 'selected' : ''}" onclick="selectCpUnit('${u.id}')">${getUnitImgHtml(u, '', 'small')}<span>${u.name}</span></div>`;
    });
    unitGrid.innerHTML = unitsHtml;

    // Trait 1 List
    const standardTraits = traitsList.filter(t => t.id !== 'none');
    let t1Html = '';
    standardTraits.forEach(t => {
        t1Html += `<div class="config-chip ${cpT1 === t.id ? 'selected' : ''}" onclick="selectCpT1('${t.id}')">${t.name}</div>`;
    });
    t1List.innerHTML = t1Html;

    // Trait 2 List
    let t2Html = `<div class="config-chip ${cpT2 === 'none' ? 'selected' : ''}" onclick="selectCpT2('none')">None</div>`;
    standardTraits.forEach(t => {
        t2Html += `<div class="config-chip ${cpT2 === t.id ? 'selected' : ''}" onclick="selectCpT2('${t.id}')">${t.name}</div>`;
    });
    t2List.innerHTML = t2Html;

    // Preview Text Logic
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

    document.getElementById('cpPreviewText').innerHTML = `${uName} <span class="text-dim">+</span> <span class="text-accent-start">${t1Name}</span> <span class="text-dim">+</span> <span class="text-accent-end">${t2Name}</span>`;
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

        // Clear trait fast-lookup cache to force evaluation of the new combination
        if (window._traitCacheMap && typeof window._traitCacheMap.clear === 'function') {
            window._traitCacheMap.clear();
        }

        // Refresh UI
        resetAndRender();
        const guidesPage = document.getElementById('guidesPage');
        if (guidesPage && guidesPage.classList.contains('active') && typeof renderGuides === 'function') renderGuides();

        closeModal('customPairModal');
    }
}