// ============================================================================
// HOTBAR.JS - Unit Selection Hotbar Logic
// ============================================================================

const hotbarState = {
    slots: Array(6).fill(null), // Array of unit objects or IDs
    fusionMode: false, // When true, swap component unit stats for fusion unit stats
};

function initHotbar() {
    // Create Hotbar HTML if it doesn't exist
    if (!document.getElementById('unitHotbar')) {
        const hotbar = document.createElement('div');
        hotbar.id = 'unitHotbar';
        hotbar.className = 'unit-hotbar';

        // --- LEFT WRAPPER (Stats & Info) ---
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'hotbar-left-wrapper';

        const statsBox = document.createElement('div');
        statsBox.className = 'hotbar-stats-box';
        statsBox.innerHTML = `
            <div class="hotbar-stat-group dmg-group" title="Total Team Damage">
                <div class="stat-label">TOTAL DMG</div>
                <div class="stat-value-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f87171"><path d="M14.59 2.41L2 15l1.41 1.41L16 3.83l-1.41-1.42zM21 5.41L8.41 18l1.41 1.41L22.41 6.83 21 5.41zM2 21.5V19h2.5l12.83-12.83 2.5 2.5L7 21.5H2z"/></svg>
                    <span id="totalTeamDmg">0</span>
                </div>
            </div>
            <div class="hotbar-stat-group dps-group" title="Total Team DPS">
                <div class="stat-label">TOTAL DPS</div>
                <div class="stat-value-box dps-value-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#60a5fa"><path d="M13 3v6h8V3h-8zm6 4h-4V5h4v2zM3 21h8v-6H3v6zm2-4h4v2H5v-2zM3 3v6h8V3H3zm6 4H5V5h4v2zm4 14h8v-6h-8v6zm2-4h4v2h-4v-2z"/></svg>
                    <span id="totalTeamDps">0</span>
                </div>
            </div>
        `;

        const infoBtn = document.createElement('button');
        infoBtn.className = 'hotbar-extra-btn hotbar-info-btn';
        infoBtn.innerHTML = 'Info';
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof openTeamSummary === 'function') openTeamSummary();
        };

        leftWrapper.appendChild(statsBox);
        leftWrapper.appendChild(infoBtn);
        hotbar.appendChild(leftWrapper);

        // --- CENTER WRAPPER (Slots) ---
        const centerWrapper = document.createElement('div');
        centerWrapper.className = 'hotbar-center-wrapper';

        const slotsWrapper = document.createElement('div');
        slotsWrapper.className = 'hotbar-slots-wrapper';

        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.index = i;

            const num = document.createElement('div');
            num.className = 'slot-number';
            num.innerText = i + 1;
            slot.appendChild(num);

            slotsWrapper.appendChild(slot);
        }
        centerWrapper.appendChild(slotsWrapper);
        hotbar.appendChild(centerWrapper);

        // Add Farms & Buffers Buttons and Menus
        const extraButtonsWrapper = document.createElement('div');
        extraButtonsWrapper.className = 'extra-buttons-wrapper';

        // --- FARMS ---
        const farmsContainer = document.createElement('div');
        farmsContainer.className = 'hotbar-extra-container';

        const farmsBtn = document.createElement('button');
        farmsBtn.className = 'hotbar-extra-btn farms-btn';
        farmsBtn.innerHTML = 'Farms';
        farmsBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m !== farmsMenu && m.classList.remove('active'));
            farmsMenu.classList.toggle('active');
        };

        const farmsMenu = document.createElement('div');
        farmsMenu.className = 'hotbar-extra-menu farms-menu';
        farmsMenu.onclick = (e) => e.stopPropagation();

        const farmUnits = [
            { id: 'bulma', name: 'Bulma', img: 'images/units/Bulma.png' },
            { id: 'speedwagon', name: 'Speedwagon', img: 'images/units/Speedwagon.png' }
        ];

        farmUnits.forEach(farm => {
            const item = document.createElement('div');
            item.className = 'farm-item';
            item.innerHTML = `<img src="${farm.img}" alt="${farm.name}" title="${farm.name}" onerror="this.src='images/units/placeholder.png'">`;
            item.onclick = (e) => {
                e.stopPropagation();
                addUnitToHotbar(farm);
                farmsMenu.classList.remove('active');
            };
            farmsMenu.appendChild(item);
        });

        farmsContainer.appendChild(farmsBtn);
        farmsContainer.appendChild(farmsMenu);

        // --- BUFFERS ---
        const buffersContainer = document.createElement('div');
        buffersContainer.className = 'hotbar-extra-container';

        const buffersBtn = document.createElement('button');
        buffersBtn.className = 'hotbar-extra-btn buffers-btn';
        buffersBtn.innerHTML = 'Buffers';
        buffersBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m !== buffersMenu && m.classList.remove('active'));
            buffersMenu.classList.toggle('active');
        };

        const buffersMenu = document.createElement('div');
        buffersMenu.className = 'hotbar-extra-menu buffers-menu';
        buffersMenu.onclick = (e) => e.stopPropagation();

        const bufferUnits = [
            { id: 'miku', name: 'Miku', img: 'images/units/Miku.png' },
            { id: 'water_god', name: 'Water God', img: 'images/units/EnlightenedGod.png' }
        ];

        bufferUnits.forEach(buff => {
            const item = document.createElement('div');
            item.className = 'farm-item buffer-item'; // Reuse farm-item class for styling
            item.innerHTML = `<img src="${buff.img}" alt="${buff.name}" title="${buff.name}" onerror="this.src='images/units/placeholder.png'">`;
            item.onclick = (e) => {
                e.stopPropagation();
                addUnitToHotbar(buff);
                buffersMenu.classList.remove('active');
            };
            buffersMenu.appendChild(item);
        });

        buffersContainer.appendChild(buffersBtn);
        buffersContainer.appendChild(buffersMenu);

        extraButtonsWrapper.appendChild(farmsContainer);
        extraButtonsWrapper.appendChild(buffersContainer);
        hotbar.appendChild(extraButtonsWrapper);

        document.body.appendChild(hotbar);

        // Close menus on click outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m.classList.remove('active'));
        });
    }

    // Add global click listener for unit cards using event delegation
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.unit-card');
        if (card) {
            // Check if we clicked a button or interactive element inside the card
            const interactive = e.target.closest('button, input, select, label, .e-pill');
            if (interactive) return;

            const unitId = card.id.replace('card-', '');
            const unit = unitDatabase.find(u => u.id === unitId);
            if (unit) {
                addUnitToHotbar(unit);
            }
        }
    });

    // Initial UI update
    updateHotbarUI();
}

function addUnitToHotbar(unit, forceAdd = false) {
    if (typeof ENABLE_HOTBAR !== 'undefined' && !ENABLE_HOTBAR) return;
    const slots = hotbarState.slots;
    const unitIds = slots.filter(u => u !== null).map(u => u.id);

    // Special Case: Unparalleled Armor
    if (unit.id === 'unparalleled_armor') {
        const setIds = ['ancient_shinob', 'nutaru_beast'];
        const hasShinobi = unitIds.includes('ancient_shinob');
        const hasNutaru = unitIds.includes('nutaru_beast');
        const isComplete = hasShinobi && hasNutaru;

        if (isComplete && !forceAdd) {
            // Remove logic: Only remove if not needed by other set
            // Nutaru is needed by Majestic if Sasuke is present
            const hasSasuke = unitIds.includes('sasuke_great_war');

            const idxShinobi = slots.findIndex(s => s && s.id === 'ancient_shinob');
            if (idxShinobi !== -1) clearHotbarSlot(idxShinobi);

            if (!hasSasuke) {
                const idxNutaru = slots.findIndex(s => s && s.id === 'nutaru_beast');
                if (idxNutaru !== -1) clearHotbarSlot(idxNutaru);
            }
        } else {
            // Add missing logic
            if (!hasShinobi) {
                const u = unitDatabase.find(x => x.id === 'ancient_shinob');
                if (u) _executeAddUnit(u, true);
            }
            if (!hasNutaru) {
                const u = unitDatabase.find(x => x.id === 'nutaru_beast');
                if (u) _executeAddUnit(u, true);
            }
        }
        return;
    }

    // Special Case: Majestic Armor
    if (unit.id === 'majestic_armor') {
        const setIds = ['sasuke_great_war', 'nutaru_beast'];
        const hasSasuke = unitIds.includes('sasuke_great_war');
        const hasNutaru = unitIds.includes('nutaru_beast');
        const isComplete = hasSasuke && hasNutaru;

        if (isComplete && !forceAdd) {
            // Remove logic: Nutaru is needed by Unparalleled if Shinobi is present
            const hasShinobi = unitIds.includes('ancient_shinob');

            const idxSasuke = slots.findIndex(s => s && s.id === 'sasuke_great_war');
            if (idxSasuke !== -1) clearHotbarSlot(idxSasuke);

            if (!hasShinobi) {
                const idxNutaru = slots.findIndex(s => s && s.id === 'nutaru_beast');
                if (idxNutaru !== -1) clearHotbarSlot(idxNutaru);
            }
        } else {
            // Add missing
            if (!hasSasuke) {
                const u = unitDatabase.find(x => x.id === 'sasuke_great_war');
                if (u) _executeAddUnit(u, true);
            }
            if (!hasNutaru) {
                const u = unitDatabase.find(x => x.id === 'nutaru_beast');
                if (u) _executeAddUnit(u, true);
            }
        }
        return;
    }

    _executeAddUnit(unit);
}

function _executeAddUnit(unit, onlyAdd = false) {
    // Check if unit is already in hotbar
    const existingIndex = hotbarState.slots.findIndex(s => s && s.id === unit.id);

    if (existingIndex !== -1) {
        if (onlyAdd) return; // Don't remove if we are just ensuring it's there
        // Toggle: If it exists, remove it
        clearHotbarSlot(existingIndex);
        return;
    }

    // Find first empty slot
    const emptyIndex = hotbarState.slots.findIndex(s => s === null);

    if (emptyIndex !== -1) {
        hotbarState.slots[emptyIndex] = unit;
        updateHotbarUI();
    }
}

function clearHotbarSlot(index) {
    if (hotbarState.slots[index]) {
        hotbarState.slots[index] = null;
        updateHotbarUI();
    }
}

function showFusionImages(armorIds) {
    if (!armorIds || armorIds.length === 0) return;

    const bestBuilds = {
        'unparalleled_armor': { dmg: '251.2k', spa: '5.39s', range: '75.2', crit: '77.5%', cdmg: '189%', dot: '0' },
        'majestic_armor': { dmg: '132.4k', spa: '7.12s', range: '52.5', crit: '95%', cdmg: '284%', dot: '0' },
        'sjw': { dmg: '312.5k', spa: '3.82s', range: '82.4', crit: '85%', cdmg: '215%', dot: '0' }
    };

    let contentHtml = '';
    armorIds.forEach(id => {
        const unit = unitDatabase.find(u => u.id === id);
        if (unit) {
            const build = bestBuilds[id] || { dmg: '0', spa: '0', range: '0', crit: '0%', cdmg: '0%', dot: '0' };
            const fusionImg = unit.img.replace('.png', 'Syncro.png');
            const isFused = hotbarState.fusionMode;
            const fuseBtnText = isFused ? 'UNFUSE' : 'FUSE';
            const fuseBtnClass = isFused ? 'fusion-btn-unfuse' : 'fusion-btn-fuse';

            contentHtml += `
                <div class="fusion-card-overlay" onclick="event.stopPropagation();">
                    <img src="${fusionImg}" class="fusion-bg-img-clean" onerror="this.src='${unit.img}'">
                    
                    <div class="br-full-stats fusion-stats-box-full-build">
                        <div class="fs-comparison-grid" style="grid-template-columns: 1fr;">
                            <div class="fs-item-lg dmg-row" style="justify-content: center;">
                                <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
                                <span class="fs-val val-dmg" style="width: 60px; text-align: left;">${build.dmg}</span>
                            </div>

                            <div class="fs-item-lg spa-row" style="justify-content: center;">
                                <span class="fs-icon-box spa-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg></span>
                                <span class="fs-val val-spa" style="width: 60px; text-align: left;">${build.spa}</span>
                            </div>

                            <div class="fs-item-lg range-row" style="justify-content: center;">
                                <span class="fs-icon-box range-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span>
                                <span class="fs-val val-range" style="width: 60px; text-align: left;">${build.range}</span>
                            </div>
                        </div>
                        <div class="fs-sub-row">
                            <div class="fs-item-sm"><span class="fs-label">Crit %</span><span class="fs-val val-crit">${build.crit}</span></div>
                            <div class="fs-item-sm"><span class="fs-label">CDmg</span><span class="fs-val val-cdmg">${build.cdmg}</span></div>
                            <div class="fs-item-sm"><span class="fs-label">DoT Dmg</span><span class="fs-val val-dot">${build.dot}</span></div>
                        </div>
                    </div>

                    <button class="fusion-toggle-btn ${fuseBtnClass}" onclick="event.stopPropagation(); hotbarState.fusionMode = !hotbarState.fusionMode; updateHotbarUI(); closeModal('universalModal');">
                        ${fuseBtnText}
                    </button>
                </div>
            `;
        }
    });

    if (typeof showUniversalModal === 'function') {
        showUniversalModal({
            title: '',
            content: `<div class="fusion-overlay-container" onclick="closeModal('universalModal')">${contentHtml}</div>`,
            size: 'modal-full',
            headerClass: 'hidden-header',
            footerClass: 'hidden-header',
            boxClass: 'modal-transparent'
        });

        // Ensure clicking the background overlay also closes it
        const overlay = document.getElementById('universalModal');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) closeModal('universalModal');
            };
        }
    }
}

function updateHotbarUI() {
    const hotbar = document.getElementById('unitHotbar');
    if (!hotbar) return;

    // 1. Detect Fusions dynamically
    const unitIdsInHotbar = hotbarState.slots.filter(u => u !== null).map(u => u.id);
    const hasNutaru = unitIdsInHotbar.includes('nutaru_beast');
    const hasShinobi = unitIdsInHotbar.includes('ancient_shinob');
    const hasSasuke = unitIdsInHotbar.includes('sasuke_great_war');

    // Detect available fusions
    const activeFusions = [];
    if (hasNutaru && hasShinobi) activeFusions.push({ id: 'unparalleled_armor', components: ['nutaru_beast', 'ancient_shinob'] });
    if (hasNutaru && hasSasuke) activeFusions.push({ id: 'majestic_armor', components: ['nutaru_beast', 'sasuke_great_war'] });

    // Auto-disable fusion mode if no fusions available
    if (activeFusions.length === 0) hotbarState.fusionMode = false;

    // 1.5 Calculate Team Totals
    // Build a set of component unit IDs to skip in fusion mode
    const fusionSkipIds = new Set();
    if (hotbarState.fusionMode) {
        activeFusions.forEach(f => f.components.forEach(c => fusionSkipIds.add(c)));
    }

    const getUnitStats = (unitId) => {
        const unitCache = window.unitBuildsCache && window.unitBuildsCache[unitId];
        const isAbility = activeAbilityIds.has(unitId);
        const cachePath = isAbility ? unitCache?.abil?.fixed : unitCache?.base?.fixed;
        const bestBuild = cachePath?.[0]?.[0];
        if (bestBuild) return { dmg: bestBuild.dmgVal || bestBuild.dv || 0, dps: bestBuild.dps || 0 };

        // Fallback calculation
        const fullUnit = typeof unitDatabase !== 'undefined' ? unitDatabase.find(x => x.id === unitId) : null;
        if (!fullUnit || typeof calculateDPS !== 'function') return { dmg: 0, dps: 0 };
        const pts = (typeof sharedPoints !== 'undefined') ? sharedPoints : { dmg: 100, spa: 100, range: 100 };
        const ctx = { dmgPoints: pts.dmg, spaPoints: pts.spa, rangePoints: pts.range, wave: 12, isBoss: false, traitObj: { id: 'none', name: 'None', dmg: 0, spa: 0 }, placement: 1, headPiece: 'none' };
        const data = calculateDPS(fullUnit, { set: 'none' }, ctx);
        return { dmg: data.dmgVal || 0, dps: data.total || 0 };
    };

    let teamDmg = 0;
    let teamDps = 0;

    // Add stats for non-fused units
    hotbarState.slots.forEach(u => {
        if (!u) return;
        if (fusionSkipIds.has(u.id)) return; // Skip component units in fusion mode
        const stats = getUnitStats(u.id);
        teamDmg += stats.dmg;
        teamDps += stats.dps;
    });

    // Add fusion unit stats when fusion mode is active
    if (hotbarState.fusionMode) {
        activeFusions.forEach(f => {
            const stats = getUnitStats(f.id);
            teamDmg += stats.dmg;
            teamDps += stats.dps;
        });
    }

    const formatStat = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return Math.floor(n).toLocaleString();
    };

    const teamDmgEl = document.getElementById('totalTeamDmg');
    const teamDpsEl = document.getElementById('totalTeamDps');
    if (teamDmgEl) teamDmgEl.innerText = formatStat(teamDmg);
    if (teamDpsEl) teamDpsEl.innerText = formatStat(teamDps);

    // Visual indicator on stats box
    const statsBox = hotbar.querySelector('.hotbar-stats-box');
    if (statsBox) statsBox.classList.toggle('fusion-active', hotbarState.fusionMode && activeFusions.length > 0);



    // Fusion Map: Unit ID -> Array of Armor IDs
    const fusionMap = new Map();
    if (hasNutaru && hasShinobi) {
        if (!fusionMap.has('nutaru_beast')) fusionMap.set('nutaru_beast', []);
        fusionMap.get('nutaru_beast').push('unparalleled_armor');
        fusionMap.set('ancient_shinob', ['unparalleled_armor']);
    }
    if (hasNutaru && hasSasuke) {
        if (!fusionMap.has('nutaru_beast')) fusionMap.set('nutaru_beast', []);
        fusionMap.get('nutaru_beast').push('majestic_armor');
        fusionMap.set('sasuke_great_war', ['majestic_armor']);
    }

    const slots = hotbar.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, i) => {
        const unit = hotbarState.slots[i];

        // Clear previous
        const existingImg = slot.querySelector('img');
        if (existingImg) existingImg.remove();
        const existingBtn = slot.querySelector('.remove-btn');
        if (existingBtn) existingBtn.remove();
        const existingBadge = slot.querySelector('.fusion-badge');
        if (existingBadge) existingBadge.remove();

        if (unit) {
            slot.classList.add('filled');

            const img = document.createElement('img');
            img.src = unit.img;
            img.alt = unit.name;
            img.onerror = () => { img.src = 'images/units/placeholder.png'; };

            // DYNAMIC FUSION BADGE — opens fusion image modal, shows fused state
            const armorIds = fusionMap.get(unit.id);
            if (armorIds && armorIds.length > 0) {
                const fusionBadge = document.createElement('div');
                fusionBadge.className = 'fusion-badge interactive' + (hotbarState.fusionMode ? ' fused-active' : '');
                fusionBadge.innerText = hotbarState.fusionMode ? 'FUSED' : 'FUSION';

                fusionBadge.onclick = (e) => {
                    e.stopPropagation();
                    showFusionImages(armorIds);
                };

                slot.appendChild(fusionBadge);
                slot.classList.add('fused-slot');
            } else {
                slot.classList.remove('fused-slot');
            }

            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                clearHotbarSlot(i);
            };

            slot.appendChild(img);
            slot.appendChild(removeBtn);
        } else {
            slot.classList.remove('filled');
            slot.classList.remove('fused-slot');
        }
    });
}

// Export for use in other modules if needed
window.addUnitToHotbar = addUnitToHotbar;
window.clearHotbarSlot = clearHotbarSlot;
window.initHotbar = initHotbar;
