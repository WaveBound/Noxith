// MODALS.JS - Unified Modal Manager
// ============================================================================

// --- GENERIC MODAL CONTROLLER ---

/**
 * Toggles visibility of a specific modal ID.
 * Handles scroll locking on the body and exclusive modal visibility.
 */
window.toggleModal = (modalId, show = true) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (show) {
        // Requirement 1: Close all other open modals first
        const otherVisible = document.querySelectorAll('.modal-overlay.is-visible');
        otherVisible.forEach(m => {
            if (m.id !== modalId) m.classList.remove('is-visible');
        });

        modal.classList.add('is-visible');
        if (typeof updateBodyScroll === 'function') updateBodyScroll();

        // Requirement 2: Add class to body to hide Mobile FAB via CSS
        document.body.classList.add('modal-open');
    } else {
        modal.classList.remove('is-visible');

        // Check if any other modals are still open
        setTimeout(() => {
            const anyVisible = document.querySelectorAll('.modal-overlay.is-visible').length > 0;
            if (!anyVisible) {
                if (typeof updateBodyScroll === 'function') updateBodyScroll();
                document.body.classList.remove('modal-open'); // Re-show FAB
            }
        }, 50);
    }
};

/**
 * Opens the single Universal Modal with dynamic content.
 */
function showUniversalModal({ title, content, leftPanel = '', rightPanel = '', footerButtons = '', size = '', headerClass = '', boxClass = '', footerClass = '' }) {
    const modal = document.getElementById('universalModal');
    const box = modal.querySelector('.modal-box');
    const titleEl = modal.querySelector('.modal-title');
    const bodyEl = modal.querySelector('.modal-body');
    const footerEl = modal.querySelector('.modal-footer');
    const headerEl = modal.querySelector('.modal-header');

    const leftEl = modal.querySelector('.left-panel');
    const rightEl = modal.querySelector('.right-panel');
    const leftToggle = document.getElementById('toggleLeftPanelBtn');

    // Reset Classes
    box.className = 'modal-box ' + size + ' ' + boxClass;
    headerEl.className = 'modal-header ' + headerClass;
    footerEl.className = 'modal-footer ' + footerClass;

    // Set Content
    titleEl.innerHTML = title;
    bodyEl.innerHTML = content;

    // Handle Left Panel
    if (leftPanel) {
        leftEl.innerHTML = leftPanel;
        if (leftToggle) {
            leftToggle.classList.remove('hidden');
            leftToggle.classList.add('active'); // Start open for better UX
        }
        leftEl.classList.remove('hidden');
    } else {
        leftEl.innerHTML = '';
        if (leftToggle) leftToggle.classList.add('hidden');
        leftEl.classList.add('hidden');
    }

    // Handle Right Panel
    if (rightPanel) {
        rightEl.innerHTML = rightPanel;
        rightEl.classList.remove('hidden');
    } else {
        rightEl.innerHTML = '';
        rightEl.classList.add('hidden');
    }

    // Default Close Button if no footer provided, or append custom buttons
    if (!footerButtons) {
        footerEl.innerHTML = `<button class="action-btn" onclick="closeModal('universalModal')">Close</button>`;
    } else {
        footerEl.innerHTML = footerButtons;
    }

    toggleModal('universalModal', true);
}

window.toggleFloatingPanel = (side) => {
    const panel = document.querySelector(`.${side}-panel`);
    const btn = document.getElementById(`toggle${side.charAt(0).toUpperCase() + side.slice(1)}PanelBtn`);
    if (!panel) return;

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        if (btn) btn.classList.add('active');
    } else {
        panel.classList.add('hidden');
        if (btn) btn.classList.remove('active');
    }
};

// Global closer helper
window.closeModal = (id) => toggleModal(id, false);

/**
 * Specifically handles closing the one-time announcement modal
 */
window.closeAnnouncement = () => {
    localStorage.setItem('hasSeenFinalUpdateNotice', 'true');
    closeModal('announcementModal');
};

// --- SPECIFIC IMPLEMENTATIONS USING UNIVERSAL MODAL ---

/**
 * Shows Math Breakdown
 */
const showMath = (id) => {
    let data = window.cachedResults[id];

    // FALLBACK: If cache was cleared (due to global toggle), attempt to re-generate
    if (!data) {
        const unitId = id.split('-')[0];
        const unit = typeof unitDatabase !== 'undefined' ? unitDatabase.find(u => u.id === unitId) : null;
        if (unit && typeof processUnitCache === 'function') {
            processUnitCache(unit);
            data = window.cachedResults[id];
        }
    }

    if (!data) return;

    if (!data.lvStats || !data.critData) {
        try {
            data = reconstructMathData(data);
        } catch (e) { console.error(e); return; }
    }

    const hasSummons = !!data.summonData;
    const isSplit = window.innerWidth > 992 && hasSummons;
    const mathResult = renderMathContent(data, isSplit);

    const title = `<span class="text-white">DPS BREAKDOWN</span>`;
    const size = 'modal-md'; // Standardized width for all units

    if (isSplit) {
        showUniversalModal({
            title,
            content: mathResult.content,
            leftPanel: mathResult.leftPanel,
            rightPanel: mathResult.rightPanel,
            size
        });
    } else {
        showUniversalModal({
            title,
            content: mathResult,
            size
        });
    }
};
window.showMath = showMath; // Expose global

/**
 * Shows Patch Notes
 */
const openPatchNotes = () => {
    if (typeof patchNotesData === 'undefined') return;

    const html = patchNotesData.map(patch => {
        const changesHtml = patch.changes.map(c =>
            `<li><span class="patch-tag">${c.type}</span> <span>${c.text}</span></li>`
        ).join('');

        return `
            <div class="patch-entry">
                <div class="patch-header">
                    <span class="patch-version">${patch.version}</span>
                    <span class="patch-date">${patch.date}</span>
                </div>
                <ul class="patch-list">${changesHtml}</ul>
            </div>
        `;
    }).join('');

    showUniversalModal({
        title: 'PATCH NOTES',
        content: html,
        size: 'modal-md'
    });
};

window.openComingSoon = () => {
    if (typeof comingSoonData === 'undefined') return;

    const html = comingSoonData.map(item => `
        <div class="patch-entry">
            <div class="patch-header">
                <span class="patch-tag">${item.type}</span>
                <span class="patch-version" style="font-size: 0.8rem;">Planned</span>
            </div>
            <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <b style="color: var(--accent-light); display: block; margin-bottom: 4px; font-size: 0.95rem;">${item.title}</b>
                <span style="font-size: 0.85rem; color: #9ca3af; line-height: 1.4;">${item.desc}</span>
            </div>
        </div>
    `).join('');

    showUniversalModal({
        title: 'COMING SOON',
        content: `<div class="patch-notes-container">${html}</div>`,
        size: 'modal-md'
    });
};

/**
 * Shows Trait Guide
 */
function openTraitGuide(unitId) {
    const unit = unitDatabase.find(u => u.id === unitId);
    if (!unit || !unit.meta) return;

    const getTraitName = (id) => {
        if (!id) return '-';
        const t = traitsList.find(x => x.id === id || x.name === id);
        return t ? t.name : id;
    };

    const generateSection = (label, traitId, icon) => {
        const name = getTraitName(traitId);

        const parts = name.split('/').map(s => s.trim());
        let imagesHtml = '';
        parts.forEach(part => {
            const cleanPart = part.split('(')[0].trim();
            const t = traitsList.find(x => x.name.toLowerCase() === cleanPart.toLowerCase() || x.id === cleanPart.toLowerCase());
            if (t) {
                imagesHtml += `<div class="trait-img-rainbow"><img src="images/traits/${t.name}.png" onerror="this.parentElement.style.display='none'"></div>`;
            }
        });

        return `
            <div class="tg-section">
                <span class="tg-label">${label}</span>
                <span class="tg-trait-rainbow">${name}</span>
                <div class="tg-images-row">${imagesHtml}</div>
            </div>
        `;
    };

    const html = `
        <div class="tg-grid">
            ${generateSection('Progression', unit.meta.short, '⚡')}
            ${generateSection('Infinite Mode', unit.meta.long, '♾️')}
        </div>
        <div class="tg-note">
            <strong>Strategy Note:</strong><br>
            ${unit.meta.note || "No specific strategy notes available for this unit."}
        </div>
    `;

    showUniversalModal({
        title: 'RECOMMENDED TRAITS',
        content: html,
        size: 'modal-sm'
    });
}

// Pre-calculated map for O(1) lookups
let unitMap = null;
const refreshUnitMap = () => {
    unitMap = new Map();
    unitDatabase.forEach(u => unitMap.set(u.id, u));
};

const getUnitById = (id) => {
    if (!unitMap) refreshUnitMap();
    return unitMap.get(id);
};

window.refreshUnitMap = refreshUnitMap;

function openUnitInfo(unitId) {
    const unit = getUnitById(unitId);
    if (!unit) return;

    let passivesHtml = '';
    const s = unit.stats;
    let innateStatsHtml = '';
    if (s.passiveDmg) innateStatsHtml += `<li><span>Passive Damage:</span> <span class="text-white">+${s.passiveDmg}%</span></li>`;
    if (s.passiveSpa) innateStatsHtml += `<li><span>Passive SPA:</span> <span class="text-white">-${s.passiveSpa}%</span></li>`;
    if (s.passiveRange) innateStatsHtml += `<li><span>Passive Range:</span> <span class="text-white">+${s.passiveRange}%</span></li>`;
    if (s.trueDmg) innateStatsHtml += `<li><span>True Dmg:</span> <span class="text-white">+${s.trueDmg}%</span></li>`;
    if (s.hyper) innateStatsHtml += `<li><span>Hyper Dmg:</span> <span class="text-white">+${s.hyper}%</span></li>`;

    const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
    const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;
    const passivesSource = (modeObj && modeObj.passives) ? modeObj.passives : unit.passives;

    if (passivesSource && Array.isArray(passivesSource)) {
        passivesHtml = passivesSource.map(p => {
            let desc = p.desc;

            return `<li class="info-passive-item"><strong class="text-white">${p.name}:</strong> <span class="info-passive-desc">${desc}</span></li>`;
        }).join('');
        if (innateStatsHtml) passivesHtml = innateStatsHtml + passivesHtml;
    } else {
        passivesHtml = innateStatsHtml;
    }

    if (!passivesHtml) passivesHtml = '<li>None</li>';

    let modesHtml = '';
    if (unit.modes && Array.isArray(unit.modes)) {
        modesHtml = unit.modes.map(mode =>
            `<li class="info-passive-item"><strong class="text-custom">${mode.name}:</strong> <span class="info-passive-desc">${mode.desc}</span></li>`
        ).join('');
    } else if (unit.modes && typeof unit.modes === 'object') {
        modesHtml = Object.entries(unit.modes).map(([name, data]) =>
            `<li class="info-passive-item"><strong class="text-custom">${name}:</strong> <span class="info-passive-desc">${data.desc}</span></li>`
        ).join('');
    }

    let etherealHtml = '';
    if (unit.etherealization) {
        if (Array.isArray(unit.etherealization)) {
            etherealHtml = unit.etherealization.map((upgrade, idx) => {
                let text = upgrade;
                if (typeof upgrade === 'object') {
                    text = upgrade.desc || "";
                    const stats = [];
                    if (upgrade.passiveDmg) stats.push(`+${upgrade.passiveDmg}% Dmg`);
                    if (upgrade.passiveSpa) stats.push(`+${upgrade.passiveSpa}% SPA`);
                    if (upgrade.passiveCrit) stats.push(`+${upgrade.passiveCrit}% Crit`);
                    if (upgrade.passiveCdmg) stats.push(`+${upgrade.passiveCdmg}% CDmg`);
                    if (upgrade.dotBuff) stats.push(`+${upgrade.dotBuff}% DoT`);
                    if (upgrade.passiveRange) stats.push(`+${upgrade.passiveRange}% Rng`);
                    if (upgrade.trueDmg) stats.push(`+${upgrade.trueDmg}% True`);
                    if (stats.length > 0) {
                        const statsStr = `(${stats.join(', ')})`;
                        text = text ? `${text} <span class="text-custom">${statsStr}</span>` : statsStr;
                    }
                }
                return `
                <li class="info-ethereal-item">
                    <span class="info-ethereal-text">${text}</span>
                    <span class="e-badge">E${idx + 1}</span>
                </li>
            `;
            }).join('');
        } else {
            const e = unit.etherealization;
            if (e.dmg) etherealHtml += `<li><span>Damage:</span> <span>+${e.dmg}%</span></li>`;
            if (e.spa) etherealHtml += `<li><span>SPA:</span> <span>-${e.spa}%</span></li>`;
            if (e.range) etherealHtml += `<li><span>Range:</span> <span>+${e.range}%</span></li>`;
            if (e.desc) etherealHtml += `<li class="text-xs text-dim" style="margin-top: 5px; display: block; text-align: center;">${e.desc}</li>`;
        }
    } else {
        etherealHtml = '<li>None</li>';
    }

    const html = `
        <div class="unit-info-modal">
            <div class="info-section section-discovery">
                <div class="info-sec-title">Unit Discovery</div>
                <ul class="info-list">
                    <li><span>Level:</span> <span class="text-white">${unit.level || 1}</span></li>
                    ${unit.noPoints ? '' : `<li><span>Total Stat Points:</span> <span class="text-gold">${((unit.level || 1) - 1) + 30}</span></li>`}
                    <li><span>Role:</span> <span>${unit.role}</span></li>
                    <li><span>Placement Type:</span> <span class="${unit.placementType === 'Hill' ? 'text-gold' : (unit.placementType === 'Hybrid' ? 'text-white' : 'text-custom')}">${unit.placementType || 'Ground'}</span></li>
                    <li><span>Element:</span> <span class="text-custom">${unit.stats.element}</span></li>
                    ${unit.stats.support ? `<li><span>Support:</span> <span class="text-custom">${unit.stats.support}</span></li>` : ''}
                    <li><span>Cost:</span> <span class="text-gold">${unit.totalCost.toLocaleString()}</span></li>
                    <li><span>Max Placements:</span> <span>${unit.placement}</span></li>
                </ul>
            </div>
            ${unit.tags && unit.tags.length > 0 ? `
            <div class="info-section section-tags">
                <div class="info-sec-title">Unit Tags</div>
                <div class="info-tags-container">
                    ${unit.tags.map(t => `<span class="info-tag-chip">${t}</span>`).join('')}
                </div>
            </div>` : ''}
            <div class="info-section section-stats">
                <div class="info-sec-title">Maximum Statistics (Lv 1)</div>
                <ul class="info-list">
                    ${(() => {
            const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
            const modeObj = (unit.modes && unit.modes[activeMode]) ? unit.modes[activeMode] : null;
            const upgradesArr = (modeObj && modeObj.upgrades && modeObj.upgrades.length > 0) ? modeObj.upgrades : (unit.upgrades && unit.upgrades.length > 0 ? unit.upgrades : null);
            const finalDmg = unit.stats.dmg || (upgradesArr ? (upgradesArr[upgradesArr.length - 1].dmg || 0) : 0);
            const finalSpa = unit.stats.spa || (upgradesArr ? (upgradesArr[upgradesArr.length - 1].spa || 0) : 0);
            const finalRange = unit.stats.range || (upgradesArr ? (upgradesArr[upgradesArr.length - 1].range || 0) : 0);
            return `
                            <li><span>Damage:</span> <span class="text-white">${finalDmg.toLocaleString()}</span></li>
                            <li><span>SPA:</span> <span class="text-white">${finalSpa}s</span></li>
                            <li><span>Range:</span> <span class="text-white">${finalRange}</span></li>
                        `;
        })()}
                    <li><span>Animation Cap:</span> <span class="text-white">${unit.stats.spaCap}s</span></li>
                </ul>
            </div>
            <div class="info-section section-passives">
                <div class="info-sec-title">Passives / Innates</div>
                <ul class="info-list">${passivesHtml}</ul>
            </div>
            <div class="info-section section-ethereal">
                <div class="info-sec-title">Etherealization Buffs</div>
                <ul class="info-list">${etherealHtml}</ul>
            </div>
            ${unit.ability ? `
<div class="info-section section-ability">
    ${(Array.isArray(unit.ability) ? unit.ability : [unit.ability]).map(ab => `
        <div class="info-sec-title">Active Ability: ${ab.abilityName}</div>
        <ul class="info-list">
            ${ab.cooldown ? `<li><span>Cooldown:</span> <span class="text-gold">${ab.cooldown}s</span></li>` : ''}
            <li class="info-ability-desc-item"><span class="info-ability-desc">${ab.desc || 'No description available.'}</span></li>
        </ul>
    `).join('')}
</div>` : ''}
            ${modesHtml ? `<div class="info-section section-modes">
                <div class="info-sec-title">Class Details (Battle Adaptation)</div>
                <ul class="info-list">${modesHtml}</ul>
            </div>` : ''}
        </div>
    `;

    const existing = document.getElementById('unitInfoPopup');
    if (existing) existing.remove();

    let overlay = document.createElement('div');
    overlay.id = 'unitInfoPopup';
    overlay.className = 'info-popup-overlay is-visible';

    document.body.classList.add('modal-open');

    // Close on backdrop click
    overlay.onclick = function (e) {
        if (e.target === overlay) {
            overlay.remove();
            const otherModals = document.querySelectorAll('.modal-overlay.is-visible');
            if (otherModals.length === 0) document.body.classList.remove('modal-open');
        }
    };

    // Structure similar to openInfoPopup but for unit info
    overlay.innerHTML = `
        <div class="modal-box modal-sm info-popup-box">
            <div class="modal-header">
                <h2 class="modal-title">UNIT INFO: ${unit.name.toUpperCase()}</h2>
            </div>
            <div class="modal-body" style="padding-top: 5px;">
                ${html}
            </div>
            <div class="modal-footer">
                <button class="action-btn secondary" onclick="document.getElementById('unitInfoPopup').remove(); if(document.querySelectorAll('.modal-overlay.is-visible').length === 0) document.body.classList.remove('modal-open');">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}
window.openUnitInfo = openUnitInfo;
window.unitModesState = window.unitModesState || {};

window.updateOverlaySlider = function (unitId, activeModeIdx) {
    const unit = getUnitById(unitId);
    if (!unit) return;
    const overlay = document.getElementById('modesOverlay');
    if (!overlay) return;

    let sliderContainer = overlay.querySelector('.modes-overlay-slider-container');
    if (sliderContainer) sliderContainer.remove();

    if (unit.systemLevel) {
        const cfg = unit.systemLevel;
        // Only show the slider in the modes overlay if it has restrictModes.
        // Units without restrictModes (like Jinoo) already have the slider on their card.
        if (!cfg.restrictModes) return;

        let showSlider = cfg.restrictModes.includes(activeModeIdx);
        if (showSlider) {
            const currentSysLvl = (window.unitSystemLevels && window.unitSystemLevels[unitId] !== undefined) ? window.unitSystemLevels[unitId] : (cfg.default || cfg.max || 100);

            sliderContainer = document.createElement('div');
            sliderContainer.className = 'modes-overlay-slider-container';
            sliderContainer.onclick = (e) => e.stopPropagation();
            sliderContainer.style.cssText = `
                position: relative;
                margin: 15px auto 0;
                width: 90%;
                max-width: 450px;
                background: rgba(10, 10, 12, 0.95);
                border: 1px solid rgba(165, 180, 252, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.05);
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 5000;
                backdrop-filter: blur(12px);
                animation: modeEntrance 0.5s ease forwards;
            `;
            sliderContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">Adjust ${cfg.label || 'System Level'}</span>
                    <span style="font-size: 0.75rem; color: rgba(165, 180, 252, 0.5);">MAX LV. ${cfg.max || 100}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                    <input id="overlay-system-level-${unitId}" type="range" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                        style="flex: 1; height: 6px; background: rgba(99, 102, 241, 0.2); border-radius: 3px; cursor: pointer; accent-color: #818cf8; outline: none; margin: 0;"
                        oninput="document.getElementById('overlay-sys-lvl-val-${unitId}').innerText = this.value; if(document.getElementById('system-level-${unitId}')) { document.getElementById('system-level-${unitId}').value = this.value; } if(document.getElementById('sys-lvl-val-${unitId}')) { document.getElementById('sys-lvl-val-${unitId}').innerText = this.value; } window.setSystemLevel('${unitId}', this.value)">
                    <span id="overlay-sys-lvl-val-${unitId}" style="font-size: 0.9rem; font-weight: 900; color: #e0e7ff; background: rgba(99, 102, 241, 0.25); padding: 3px 10px; border-radius: 6px; min-width: 32px; text-align: center; border: 1px solid rgba(99, 102, 241, 0.15);">${currentSysLvl}</span>
                </div>
            `;
            // Append after the grid so it appears right below the mode cards
            const grid = overlay.querySelector('#modesOverlayGrid');
            if (grid && grid.nextSibling) {
                overlay.insertBefore(sliderContainer, grid.nextSibling);
            } else {
                overlay.appendChild(sliderContainer);
            }
        }
    }
};

function openUnitModes(unitId) {
    const unit = getUnitById(unitId);
    if (!unit || !unit.modes) return;

    const overlay = document.getElementById('modesOverlay');
    const grid = document.getElementById('modesOverlayGrid');

    if (!overlay || !grid) return;

    // Always clean up any existing overlay slider when opening modes for ANY unit
    let existingSlider = overlay.querySelector('.modes-overlay-slider-container');
    if (existingSlider) existingSlider.remove();

    if (unitId === 'jinoo_shadow_monarch') {
        if (!Array.isArray(window.unitModesState[unitId])) {
            window.unitModesState[unitId] = [0]; // Shadow Legion enabled by default
            // Trigger a card refresh immediately
            if (typeof updateBuildListDisplay === 'function') {
                updateBuildListDisplay(unitId, true);
            }
        }
        renderShadowMonarchSpecialUI(unit, grid, overlay);
        return;
    }

    const state = window.unitModesState[unitId];
    const isMulti = !!unit.allowMultipleModes;
    const activeModes = isMulti ? (Array.isArray(state) ? state : []) : (state !== undefined ? [state] : [0]);

    const modesHtml = unit.modes.map((mode, idx) => {
        const isActive = activeModes.includes(idx);
        return `
            <div class="mode-card-large ${isActive ? 'active' : ''}" 
                 style="transition-delay: ${idx * 0.05}s"
                 onclick="selectUnitMode('${unitId}', ${idx})">
                <div class="mode-img-container-large">
                    <img src="${mode.img}" alt="${mode.name}">
                </div>
                <div class="mode-card-info">
                    <div class="mode-card-name">${mode.name}</div>
                    <div class="mode-card-desc">${mode.desc}</div>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = modesHtml;
    grid.className = 'modes-overlay-grid unit-' + unitId;
    if (unit.allowMultipleModes) grid.classList.add('multi-select-modes');
    if (unitId === 'the_strongest_in_history') grid.classList.add('circular-layout');

    window.updateOverlaySlider(unitId, activeModes[0] || 0);

    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
}
window.openUnitModes = openUnitModes;

function selectUnitMode(unitId, modeIdx) {
    const unit = getUnitById(unitId);
    if (!unit) return;

    const isMulti = !!unit.allowMultipleModes;
    if (isMulti) {
        let state = window.unitModesState[unitId];
        if (!Array.isArray(state)) {
            state = (state !== undefined) ? [state] : [];
        }

        if (state.includes(modeIdx)) {
            state = state.filter(i => i !== modeIdx);
            // For Sukuna we might want to default back, but Jinoo should stay empty
            if (state.length === 0 && unitId !== 'jinoo_shadow_monarch') state = [0];
        } else {
            // Requirement: System Level verification for Jinoo
            if (unitId === 'jinoo_shadow_monarch') {
                const sysLvl = (window.unitSystemLevels && window.unitSystemLevels[unitId] !== undefined)
                    ? window.unitSystemLevels[unitId]
                    : (unit.systemLevel ? (unit.systemLevel.default || 100) : 100);

                let reqLvl = 0;
                if (modeIdx === 1) reqLvl = 40;
                if (modeIdx === 2) reqLvl = 60;
                if (modeIdx === 3) reqLvl = 80;
                if (modeIdx === 4) reqLvl = 100;

                if (sysLvl < reqLvl) return; // Prevent selection if locked
            }
            state.push(modeIdx);
        }
        window.unitModesState[unitId] = state;

        // Auto-close Sukuna if both curses are selected
        if (unitId === 'the_strongest_in_history' && state.includes(1) && state.includes(2)) {
            setTimeout(() => closeModesOverlay(), 500);
        }
    } else {
        window.unitModesState[unitId] = modeIdx;
    }

    // Clear caches for this unit as stats changed
    if (window.unitBuildsCache) {
        delete window.unitBuildsCache[unitId];
    }

    // Update the unit card display in the main database
    if (typeof updateBuildListDisplay === 'function') {
        updateBuildListDisplay(unitId, true);
    }

    // Update UI in overlay
    if (unitId === 'jinoo_shadow_monarch') {
        renderShadowMonarchSpecialUI(unit, document.getElementById('modesOverlayGrid'), document.getElementById('modesOverlay'));
    } else {
        const cards = document.querySelectorAll('.mode-card-large');
        const newState = window.unitModesState[unitId];
        const activeModes = isMulti ? newState : [newState];

        cards.forEach((card, idx) => {
            if (activeModes.includes(idx)) card.classList.add('active');
            else card.classList.remove('active');
        });
    }

    // Refresh hotbar stats if this unit is in the hotbar
    if (typeof window.updateHotbarUI === 'function') {
        window.updateHotbarUI();
    }

    // Dynamically update overlay slider based on newly selected mode
    if (typeof window.updateOverlaySlider === 'function') {
        window.updateOverlaySlider(unitId, modeIdx);
    }

    // Auto close after selection ONLY for single-select units
    if (!isMulti && unitId !== 'joyful_captain') {
        setTimeout(() => {
            closeModesOverlay();
        }, 100);
    }
}
window.selectUnitMode = selectUnitMode;

function closeModesOverlay() {
    const overlay = document.getElementById('modesOverlay');
    if (!overlay) return;

    overlay.classList.add('closing');

    // Wait for the exit animation to complete before hiding
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('closing');

        // Only remove modal-open if no other modals are active
        const otherModals = document.querySelectorAll('.modal-overlay.is-visible');
        if (otherModals.length === 0) {
            document.body.classList.remove('modal-open');
        }
    }, 200);
}

window.closeModesOverlay = closeModesOverlay;

function renderShadowMonarchSpecialUI(unit, grid, overlay) {
    const state = window.unitModesState[unit.id];
    const activeModes = Array.isArray(state) ? state : [];
    const sysLvl = (window.unitSystemLevels && window.unitSystemLevels[unit.id] !== undefined) ? window.unitSystemLevels[unit.id] : 100;

    let dmgText = "0";
    let dpsText = "0";

    // 1. Prioritize currently rendered/calculated build for Jinoo (respects active modes)
    const currentBuild = window.hotbarFilteredBuilds ? window.hotbarFilteredBuilds[unit.id] : null;

    if (currentBuild) {
        dmgText = Math.floor(currentBuild.dmgVal || currentBuild.dmg || 0).toLocaleString();
        dpsText = Math.floor(currentBuild.dps || 0).toLocaleString();
    }
    // 2. Fallback to STATIC_BUILD_DB
    else if (window.STATIC_BUILD_DB && window.STATIC_BUILD_DB[unit.id] && window.STATIC_BUILD_DB[unit.id]['fixed']) {
        const buildList = window.STATIC_BUILD_DB[unit.id]['fixed'][0];
        if (buildList && buildList.length > 0) {
            dmgText = Math.floor(buildList[0].dmgVal || buildList[0].dmg || 0).toLocaleString();
            dpsText = Math.floor(buildList[0].dps).toLocaleString();
        }
    } else {
        dmgText = Math.floor(unit.stats.dmg || 0).toLocaleString();
        dpsText = Math.floor((unit.stats.dmg || 0) / (unit.stats.spa || 1)).toLocaleString();
    }

    const html = `
    <div class="sm-special-ui">
        <img src="images/units/Jinoo/main_ui.png" class="sm-main-bg" alt="Main UI">
        
        <div class="sm-side-panel-container">
            <img src="images/units/Jinoo/Side Panel.png" class="sm-side-panel-bg" alt="Side Panel">
            <img src="images/units/Jinoo/Jinwo Side Panel.png" class="sm-side-character" alt="Jinwoo">
            
            <div class="sm-pill-dmg">
                <span class="sm-pill-label">DMG:</span>
                <span class="sm-pill-val">${dmgText}</span>
            </div>
            <div class="sm-pill-dps">
                <span class="sm-pill-label">DPS:</span>
                <span class="sm-pill-val">${dpsText}</span>
            </div>
        </div>

        <div class="sm-close-btn" onclick="closeModesOverlay()">
            <img src="images/units/Jinoo/X.png" alt="Close">
        </div>
        
        <div class="sm-cards-row">
            ${unit.customSummons.map((s, idx) => {
        const isActive = activeModes.includes(idx);
        let isUnlocked = true;
        let reqLvl = 0;
        if (idx === 1) reqLvl = 40;
        if (idx === 2) reqLvl = 60;
        if (idx === 3) reqLvl = 80;
        if (idx === 4) reqLvl = 100;
        if (sysLvl < reqLvl) isUnlocked = false;

        const btnImg = isActive ? 'btn_disable.png' : 'btn_enable.png';

        return `
                <div class="sm-card-slot ${!isUnlocked ? 'locked' : ''}">
                    <div class="sm-card-inner">
                        <img src="${unit.modes[idx].img}" alt="${s.name}" class="sm-card-image">
                        <img src="images/units/Jinoo/${btnImg}" 
                             class="sm-toggle-btn" 
                             onclick="${isUnlocked ? `event.stopPropagation(); selectUnitMode('${unit.id}', ${idx})` : ''}"
                             alt="Toggle">
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    </div>
    `;

    grid.innerHTML = html;
    grid.className = 'modes-overlay-grid sm-custom-layout';
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

/**
 * Shows Trait Tier List (All Units)
 */
function openTraitTierList() {
    const shortMap = {};
    const longMap = {};
    const virtualMap = {};

    const addToMap = (map, traitStr, unit) => {
        if (!traitStr || traitStr === '-') return;
        const parts = traitStr.split('/').map(s => s.trim());
        parts.forEach(p => {
            if (!map[p]) map[p] = [];
            map[p].push(unit);
        });
    };

    unitDatabase.forEach(u => {
        if (u.meta) {
            addToMap(shortMap, u.meta.short, u);
            addToMap(longMap, u.meta.long, u);
            if (u.meta.virtual) addToMap(virtualMap, u.meta.virtual, u);
        }
    });

    // Helper to get DPS score for sorting
    const getUnitScore = (u) => {
        if (window.STATIC_BUILD_DB) {
            const dbKey = u.id;
            // Use fixed mode, config 0 (Max Potential)
            const list = window.STATIC_BUILD_DB[dbKey]?.['fixed']?.[0];
            if (list && list.length > 0) {
                return window.isUnit(u.id, 'law') ? (list[0].range || 0) : list[0].dps;
            }
        }
        return u.stats.dmg || 0;
    };

    const traitOrder = ['Ruler', 'Eternal', 'Sacred', 'Fission', 'Astral', 'Duelist', 'Wizard'];

    if (!shortMap['Fission']) shortMap['Fission'] = [];
    if (!longMap['Fission']) longMap['Fission'] = [];

    const renderSection = (title, map) => {
        const traits = Object.keys(map).sort((a, b) => {
            const cleanA = a.split('(')[0].trim();
            const cleanB = b.split('(')[0].trim();
            const idxA = traitOrder.indexOf(cleanA);
            const idxB = traitOrder.indexOf(cleanB);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        let rows = '';

        traits.forEach(t => {
            const units = map[t];
            // Sort units by DPS descending
            units.sort((a, b) => getUnitScore(b) - getUnitScore(a));

            const unitIcons = units.map(u => `
                <div class="tier-unit" data-id="${u.id}" title="${u.name} (Score: ${parseInt(getUnitScore(u)).toLocaleString()})">
                    <img src="${u.img}" class="tier-unit-img" onerror="this.style.display='none'">
                </div>
            `).join('');

            const cleanT = t.split('(')[0].trim();
            const tObj = traitsList.find(x => x.name.toLowerCase() === cleanT.toLowerCase() || x.id === cleanT.toLowerCase());
            const traitImg = tObj ? `<div class="trait-img-rainbow tier-trait-icon"><img src="images/traits/${tObj.name}.png" onerror="this.parentElement.style.display='none'"></div>` : '';

            rows += `
                <div class="tier-row">
                    <div class="tier-head">
                        ${traitImg}
                        <div class="tier-trait-name">${t}</div>
                    </div>
                    <div class="tier-body">
                        ${unitIcons}
                    </div>
                </div>
            `;
        });

        return `<div class="tier-section"><div class="tier-section-title">${title}</div><div class="tier-grid">${rows}</div></div>`;
    };

    showUniversalModal({
        title: 'TRAIT SUGGESTIONS TIER LIST',
        content: `<div class="tier-list-container">${renderSection('Wave 1-30', shortMap)}${renderSection('Infinite Mode', longMap)}</div>`,
        size: 'modal-lg',
        footerButtons: `<button class="action-btn secondary" onclick="closeModal('universalModal')">Close</button>`
    });
}
window.openTraitTierList = openTraitTierList;

/**
 * Shows a guide of all standard traits and their stats.
 */
function openAllTraitsGuide() {
    if (typeof traitsList === 'undefined') return;

    const traitsToShow = traitsList.filter(t => t.id !== 'none');

    const formatStat = (key, trait) => {
        const value = trait[key];
        if (value === undefined || value === 0 || value === false) return '';

        let label = key.toUpperCase();
        let valText = '';
        let sign = '+';
        let suffix = '%';

        switch (key) {
            case 'dmg': label = 'Damage'; valText = `${sign}${value}${suffix}`; break;
            case 'spa': label = 'SPA'; valText = `-${value}${suffix}`; break;
            case 'range': label = 'Range'; valText = `${sign}${value}${suffix}`; break;
            case 'bossDmg': label = 'Boss Dmg'; valText = `${sign}${value}${suffix}`; break;
            case 'critRate': label = 'Crit Rate'; valText = `${sign}${value}${suffix}`; break;
            case 'dotBuff':
                label = 'DoT Buff';
                valText = `${sign}${value}${suffix}`;
                if (trait.isDotBugged) valText += ` <span style="color: #f87171; font-size: 0.8em;">(Bugged)</span>`;
                break;
            case 'costReduction': label = 'Cost'; valText = `-${value}${suffix}`; break;
            case 'limitPlace': label = 'Placement'; valText = `Limit ${value}`; break;
            case 'afflictionDuration':
                label = 'Affliction Dur.';
                valText = `${sign}${value}${suffix}`;
                if (trait.isAfflictionBugged) valText += ` <span style="color: #f87171; font-size: 0.8em;">(Bugged)</span>`;
                break;
            case 'relicBuff': label = 'Relic Stats'; valText = `${sign}${((value - 1) * 100).toFixed(0)}${suffix}`; break;
            case 'isEternal': return `<li><span class="atg-label">Passive</span><span class="atg-value" style="font-size: 0.75rem; text-align: right; line-height: 1.2;">+5% Dmg & +2.5% Rng / Wave<br>Max: +60% & +30% (12 Waves)</span></li>`;
            case 'hasRadiation': return `<li><span class="atg-label">Radiation</span><span class="atg-value" title="Deals ${trait.radiationPct}% of Unit Damage over 10 seconds">${trait.radiationPct}% Dmg / 10s</span></li>`;
            case 'dmgDebuff':
                label = 'Debuff';
                valText = `${sign}${value}${suffix}`;
                if (trait.isDebuffBugged) valText += ` <span style="color: #f87171; font-size: 0.8em;">(Bugged)</span>`;
                break;
            case 'allowDotStack': return `<li><span class="atg-label">Passive</span><span class="atg-value">DoT Stacks</span></li>`;
            default: return '';
        }
        return `<li><span class="atg-label">${label}</span><span class="atg-value">${valText}</span></li>`;
    };

    const html = traitsToShow.map(trait => {
        const statOrder = ['dmg', 'spa', 'range', 'critRate', 'bossDmg', 'dotBuff', 'afflictionDuration', 'relicBuff', 'costReduction', 'limitPlace', 'isEternal', 'hasRadiation', 'dmgDebuff', 'allowDotStack'];
        const statsHtml = statOrder.map(key => formatStat(key, trait)).join('');

        return `
            <div class="all-traits-card">
                <div class="atg-header">
                    <div class="trait-img-rainbow"><img src="images/traits/${trait.name}.png" onerror="this.parentElement.style.display='none'"></div>
                    <span class="atg-name">${trait.name}</span>
                </div>
                <div class="atg-desc">${trait.desc}</div>
                <ul class="atg-stats">
                    ${statsHtml}
                </ul>
            </div>
        `;
    }).join('');

    showUniversalModal({
        title: 'TRAIT STATS',
        content: `<div class="all-traits-grid">${html}</div>`,
        size: 'modal-lg'
    });
}
window.openAllTraitsGuide = openAllTraitsGuide;

// --- INFO POPUPS (Overlay style) ---

function openInfoPopup(key) {
    const data = infoDefinitions[key];
    if (!data) return;

    // Remove existing if any
    const existing = document.getElementById('mathInfoPopup');
    if (existing) existing.remove();

    let overlay = document.createElement('div');
    overlay.id = 'mathInfoPopup';
    overlay.className = 'info-popup-overlay is-visible';

    // Prevent background scrolling while this top-level popup is open
    document.body.classList.add('modal-open');

    // Close on backdrop click
    overlay.onclick = function (e) {
        if (e.target === overlay) closeInfoPopup();
    };

    // Reusing the standard .modal-box structure
    overlay.innerHTML = `
        <div class="modal-box modal-sm info-popup-box">
            <div class="modal-header">
                <h2 class="modal-title">${data.title}</h2>
            </div>
            <div class="modal-body">
                <p style="color: #ccc; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">
                    ${data.desc}
                </p>
                <div class="ip-formula">${data.formula}</div>
            </div>
            <div class="modal-footer">
                <button class="action-btn secondary" onclick="closeInfoPopup()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeInfoPopup() {
    const overlay = document.getElementById('mathInfoPopup');
    if (overlay) overlay.remove();

    // Only remove modal-open if no other modals are active
    const otherModals = document.querySelectorAll('.modal-overlay.is-visible');
    if (otherModals.length === 0) {
        document.body.classList.remove('modal-open');
    }
}