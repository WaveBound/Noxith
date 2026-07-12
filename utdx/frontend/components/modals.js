// ============================================================================
// MODALS.JS - Unified Modal Manager (Encapsulated)
// ============================================================================

(() => {
    // --- LOCAL HELPERS ---
    const getEl = id => document.getElementById(id);
    const qSel = s => document.querySelector(s);
    const qAll = s => document.querySelectorAll(s);
    const hasVisibleModals = () => qAll('.modal-overlay.is-visible').length > 0;

    // --- GENERIC MODAL CONTROLLER ---

    /**
     * Toggles visibility of a specific modal ID.
     * Handles scroll locking on the body and exclusive modal visibility.
     */
    window.toggleModal = (modalId, show = true) => {
        const modal = getEl(modalId);
        if (!modal) return;

        if (show) {
            // Requirement 1: Close all other open modals first
            qAll('.modal-overlay.is-visible').forEach(m => {
                if (m.id !== modalId) m.classList.remove('is-visible');
            });

            modal.classList.add('is-visible');
            window.updateBodyScroll?.();

            // Requirement 2: Add class to body to hide Mobile FAB via CSS
            document.body.classList.add('modal-open');
        } else {
            modal.classList.remove('is-visible');

            // Check if any other modals are still open
            setTimeout(() => {
                if (!hasVisibleModals()) {
                    window.updateBodyScroll?.();
                    document.body.classList.remove('modal-open'); // Re-show FAB
                }
            }, 50);
        }
    };

    /**
     * Opens the single Universal Modal with dynamic content.
     */
    window.showUniversalModal = ({ title, content, leftPanel = '', rightPanel = '', footerButtons = '', size = '', headerClass = '', boxClass = '', footerClass = '' }) => {
        const modal = getEl('universalModal');
        if (!modal) return;
        const box = modal.querySelector('.modal-box');
        const leftEl = modal.querySelector('.left-panel');
        const rightEl = modal.querySelector('.right-panel');
        const leftToggle = getEl('toggleLeftPanelBtn');

        // Reset Classes
        box.className = `modal-box ${size} ${boxClass}`;
        modal.querySelector('.modal-header').className = `modal-header ${headerClass}`;
        modal.querySelector('.modal-footer').className = `modal-footer ${footerClass}`;

        // Set Content
        modal.querySelector('.modal-title').innerHTML = title;
        modal.querySelector('.modal-body').innerHTML = content;

        // Handle Panels
        const handlePanel = (el, panelContent, toggleBtn) => {
            if (panelContent) {
                el.innerHTML = panelContent;
                if (toggleBtn) {
                    toggleBtn.classList.remove('hidden');
                    toggleBtn.classList.add('active'); // Start open for better UX
                }
                el.classList.remove('hidden');
            } else {
                el.innerHTML = '';
                if (toggleBtn) toggleBtn.classList.add('hidden');
                el.classList.add('hidden');
            }
        };

        handlePanel(leftEl, leftPanel, leftToggle);
        handlePanel(rightEl, rightPanel, null);

        // Default Close Button if no footer provided, or append custom buttons
        modal.querySelector('.modal-footer').innerHTML = footerButtons || `<button class="action-btn" onclick="closeModal('universalModal')">Close</button>`;

        window.toggleModal('universalModal', true);
    };

    window.toggleFloatingPanel = (side) => {
        const panel = qSel(`.${side}-panel`);
        const btn = getEl(`toggle${side.charAt(0).toUpperCase() + side.slice(1)}PanelBtn`);
        if (panel) {
            const isHidden = panel.classList.toggle('hidden');
            if (btn) btn.classList.toggle('active', !isHidden);
        }
    };

    // Global closer helper
    window.closeModal = (id) => window.toggleModal(id, false);

    /**
     * Specifically handles closing the one-time announcement modal
     */
    window.closeAnnouncement = () => {
        localStorage.setItem('hasSeenFinalUpdateNotice', 'true');
        window.closeModal('announcementModal');
    };

    // --- SPECIFIC IMPLEMENTATIONS USING UNIVERSAL MODAL ---

    const getActiveModeIdx = (unitId) => {
        const state = window.unitModesState?.[unitId] ?? window.getUnitById?.(unitId)?.defaultMode ?? 0;
        return Array.isArray(state) ? state[0] : state;
    };

    const resolveMathUnit = (buildId) => {
        const unitIdPart = String(buildId || '').split('-')[0];
        let unit = window.getUnitById?.(unitIdPart);

        if (!unit && unitIdPart.includes('merciless_god')) unit = window.getUnitById?.('merciless_god');

        return unit || null;
    };

    const getActiveTypeForUnit = (unit) => {
        if (!unit) return 'base';
        return unit.ability && window.activeAbilityIds?.has(unit.id) ? 'abil' : 'base';
    };

    const getStaticDbBuildById = (unit, activeType, buildId) => {
        const db = window.CALCULATION_MODE === 'loadout'
            ? (window.HOTBAR_STATIC_BUILD_DB || window.GLOBAL_STATIC_BUILD_DB || window.STATIC_BUILD_DB)
            : (window.GLOBAL_STATIC_BUILD_DB || window.STATIC_BUILD_DB);
        if (!db) return null;

        const suffix = activeType === 'abil' ? '_abil' : '';
        const entries = [db[unit.id + suffix], db[unit.id]].filter(Boolean);

        for (const entry of entries) {
            const builds = entry?.fixed?.[getActiveModeIdx(unit.id)] || entry?.fixed?.[0] || entry?.f?.[0] || [];
            const build = builds.find?.(b => b.id === buildId);
            if (build) return build;
        }

        return null;
    };

    const hydrateMathBuildById = (buildId) => {
        if (!buildId || typeof window.reconstructMathData !== 'function') return null;

        const unit = resolveMathUnit(buildId);
        if (!unit) return null;

        const activeType = getActiveTypeForUnit(unit);
        let build = window.unitBuildsCache?.[unit.id]?.[activeType]?.fixed?.[getActiveModeIdx(unit.id)]?.find?.(b => b.id === buildId)
            || window.unitBuildsCache?.[unit.id]?.[activeType]?.fixed?.[0]?.find?.(b => b.id === buildId);

        if (!build) build = getStaticDbBuildById(unit, activeType, buildId);
        if (!build) return null;

        try {
            const fullMath = window.reconstructMathData(build, undefined, {
                isHotbar: window.CALCULATION_MODE === 'loadout',
                activeModeIdx: getActiveModeIdx(unit.id)
            });

            if (!fullMath) return null;

            fullMath.id = buildId;
            window.cachedResults = window.cachedResults || {};
            window.cachedResults[buildId] = fullMath;

            return fullMath;
        } catch (e) {
            console.error('Math hydration error for', buildId, e);
            return null;
        }
    };

    /**
     * Shows Math Breakdown
     */
    window.showMath = (id) => {
        let data = window.cachedResults?.[id];

        if (!data) data = hydrateMathBuildById(id);

        if (!data) {
            const unit = resolveMathUnit(id);
            if (unit) {
                window.processUnitCache?.(unit);
                data = window.cachedResults?.[id] || hydrateMathBuildById(id);
            }
        }

        if (!data) return;

        if (!data.lvStats || !data.critData) {
            try {
                data = window.reconstructMathData?.(data) || reconstructMathData(data);
            } catch (e) { console.error(e); return; }
        }

        const hasSummons = !!data.summonData;
        const isSplit = window.innerWidth > 992 && hasSummons;
        const mathResult = renderMathContent(data, isSplit);
        const title = `<span class="text-white">DPS BREAKDOWN</span>`;

        window.showUniversalModal(isSplit ? {
            title, content: mathResult.content, leftPanel: mathResult.leftPanel, rightPanel: mathResult.rightPanel, size: 'modal-md'
        } : {
            title, content: mathResult, size: 'modal-md'
        });
    };

    /**
     * Shows Patch Notes
     */
    window.openPatchNotes = () => {
        if (typeof patchNotesData === 'undefined') return;

        const html = patchNotesData.map(patch => `
            <div class="patch-entry">
                <div class="patch-header">
                    <span class="patch-version">${patch.version}</span>
                    <span class="patch-date">${patch.date}</span>
                </div>
                <ul class="patch-list">
                    ${patch.changes.map(c => `<li><span class="patch-tag">${c.type}</span> <span>${c.text}</span></li>`).join('')}
                </ul>
            </div>
        `).join('');

        window.showUniversalModal({ title: 'PATCH NOTES', content: html, size: 'modal-md' });
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

        window.showUniversalModal({
            title: 'COMING SOON',
            content: `<div class="patch-notes-container">${html}</div>`,
            size: 'modal-md'
        });
    };

    /**
     * Shows Trait Guide
     */
    window.openTraitGuide = (unitId) => {
        const unit = window.getUnitById(unitId);
        if (!unit || !unit.meta) return;

        const getTraitName = (id) => id ? (traitsList.find(x => x.id === id || x.name === id)?.name || id) : '-';

        const generateSection = (label, traitId) => {
            const name = getTraitName(traitId);
            const imagesHtml = name.split('/').map(part => {
                const cleanPart = part.split('(')[0].trim().toLowerCase();
                const t = traitsList.find(x => x.name.toLowerCase() === cleanPart || x.id === cleanPart);
                return t ? `<div class="trait-img-rainbow"><img src="images/traits/${t.name}.png" onerror="this.parentElement.style.display='none'"></div>` : '';
            }).join('');

            return `
                <div class="tg-section">
                    <span class="tg-label">${label}</span>
                    <span class="tg-trait-rainbow">${name}</span>
                    <div class="tg-images-row">${imagesHtml}</div>
                </div>
            `;
        };

        window.showUniversalModal({
            title: 'RECOMMENDED TRAITS',
            content: `
                <div class="tg-grid">
                    ${generateSection('Progression', unit.meta.short)}
                    ${generateSection('Infinite Mode', unit.meta.long)}
                </div>
                <div class="tg-note">
                    <strong>Strategy Note:</strong><br>
                    ${unit.meta.note || "No specific strategy notes available for this unit."}
                </div>
            `,
            size: 'modal-sm'
        });
    };

    /**
     * Shows Known Bugs for a Unit
     */
    window.openUnitBugs = (unitId) => {
        const unit = window.getUnitById(unitId);
        if (!unit || !unit.bugs || unit.bugs.length === 0) return;

        const bugsHtml = unit.bugs.map((bug, i) => `
            <div style="
                display: flex; gap: 14px; align-items: flex-start;
                padding: 14px 16px;
                background: rgba(239, 68, 68, 0.06);
                border: 1px solid rgba(239, 68, 68, 0.18);
                border-radius: 10px;
                margin-bottom: ${i < unit.bugs.length - 1 ? '10px' : '0'};
            ">
                <span style="font-size: 1.3rem; line-height: 1; flex-shrink: 0; margin-top: 1px;">🐛</span>
                <div>
                    ${bug.name ? `<div style="font-size: 0.85rem; font-weight: 800; color: #fca5a5; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.4px;">${bug.name}</div>` : ''}
                    <div style="font-size: 0.82rem; color: #d1d5db; line-height: 1.55;">${bug.desc}</div>
                </div>
            </div>
        `).join('');

        window.showUniversalModal({
            title: `<span style="color: #f87171;">🐛 KNOWN BUGS</span> <span style="font-size: 0.75rem; color: #9ca3af; font-weight: 500; text-transform: none;">${unit.name}</span>`,
            content: `
                <div style="padding: 4px 0 8px;">
                    <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 14px; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        ⚠️ These are known in-game bugs that may affect how this unit behaves or how the calculator handles it.
                    </div>
                    ${bugsHtml}
                </div>
            `,
            size: 'modal-sm'
        });
    };

    window.openUnitInfo = (unitId) => {
        const unit = window.getUnitById(unitId);
        if (!unit) return;

        const s = unit.stats;
        let innateStatsHtml = '';
        const addInnate = (val, label, prefix = '+', suffix = '%') => val ? `<li><span>${label}:</span> <span class="text-white">${prefix}${val}${suffix}</span></li>` : '';
        innateStatsHtml += addInnate(s.passiveDmg, 'Passive Damage');
        innateStatsHtml += addInnate(s.passiveSpa, 'Passive SPA', '-');
        innateStatsHtml += addInnate(s.passiveRange, 'Passive Range');
        innateStatsHtml += addInnate(s.trueDmg, 'True Dmg');
        innateStatsHtml += addInnate(s.hyper, 'Hyper Dmg');

        const activeMode = window.unitModesState?.[unit.id] ?? 0;
        const modeObj = unit.modes?.[activeMode];
        const passivesSource = modeObj?.passives || unit.passives;

        let passivesHtml = innateStatsHtml;
        if (passivesSource && Array.isArray(passivesSource)) {
            passivesHtml += passivesSource.map(p => `
                <li class="info-passive-item"><strong class="text-white">${p.name}:</strong> <span class="info-passive-desc">${p.desc}</span></li>
            `).join('');
        }
        if (!passivesHtml) passivesHtml = '<li>None</li>';

        let modesHtml = '';
        if (unit.modes) {
            const list = Array.isArray(unit.modes) ? unit.modes : Object.entries(unit.modes).map(([name, data]) => ({ name, desc: data.desc }));
            modesHtml = list.map(m => `
                <li class="info-passive-item"><strong class="text-custom">${m.name}:</strong> <span class="info-passive-desc">${m.desc}</span></li>
            `).join('');
        }

        let etherealHtml = '<li>None</li>';
        if (unit.etherealization) {
            if (Array.isArray(unit.etherealization)) {
                etherealHtml = unit.etherealization.map((upg, idx) => {
                    let text = upg;
                    if (typeof upg === 'object') {
                        text = upg.desc || "";
                        const stats = [];
                        if (upg.passiveDmg) stats.push(`+${upg.passiveDmg}% Dmg`);
                        if (upg.passiveSpa) stats.push(`+${upg.passiveSpa}% SPA`);
                        if (upg.passiveCrit) stats.push(`+${upg.passiveCrit}% Crit`);
                        if (upg.passiveCdmg) stats.push(`+${upg.passiveCdmg}% CDmg`);
                        if (upg.dotBuff) stats.push(`+${upg.dotBuff}% DoT`);
                        if (upg.passiveRange) stats.push(`+${upg.passiveRange}% Rng`);
                        if (upg.trueDmg) stats.push(`+${upg.trueDmg}% True`);
                        if (stats.length > 0) text = `${text} <span class="text-custom">(${stats.join(', ')})</span>`.trim();
                    }
                    return `
                        <li class="info-ethereal-item">
                            <span class="info-ethereal-text">${text}</span>
                            <span class="e-badge">E${idx + 1}</span>
                        </li>`;
                }).join('');
            } else {
                const e = unit.etherealization;
                etherealHtml = `
                    ${e.dmg ? `<li><span>Damage:</span> <span>+${e.dmg}%</span></li>` : ''}
                    ${e.spa ? `<li><span>SPA:</span> <span>-${e.spa}%</span></li>` : ''}
                    ${e.range ? `<li><span>Range:</span> <span>+${e.range}%</span></li>` : ''}
                    ${e.desc ? `<li class="text-xs text-dim" style="margin-top: 5px; display: block; text-align: center;">${e.desc}</li>` : ''}
                `;
            }
        }

        const upgradesArr = modeObj?.upgrades?.length ? modeObj.upgrades : (unit.upgrades?.length ? unit.upgrades : null);
        const lastUpg = upgradesArr ? upgradesArr[upgradesArr.length - 1] : {};
        const finalDmg = s.dmg || lastUpg.dmg || 0;
        const finalSpa = s.spa || lastUpg.spa || 0;
        const finalRange = s.range || lastUpg.range || 0;

        const html = `
            <div class="unit-info-modal">
                <div class="info-section section-discovery">
                    <div class="info-sec-title">Unit Discovery</div>
                    <ul class="info-list">
                        <li><span>Level:</span> <span class="text-white">${unit.level || 1}</span></li>
                        ${unit.noPoints ? '' : `<li><span>Total Stat Points:</span> <span class="text-gold">${((unit.level || 1) - 1) + 30}</span></li>`}
                        <li><span>Role:</span> <span>${unit.role}</span></li>
                        <li><span>Placement Type:</span> <span class="${unit.placementType === 'Hill' ? 'text-gold' : (unit.placementType === 'Hybrid' ? 'text-white' : 'text-custom')}">${unit.placementType || 'Ground'}</span></li>
                        <li><span>Element:</span> <span class="text-custom">${s.element}</span></li>
                        ${s.support ? `<li><span>Support:</span> <span class="text-custom">${s.support}</span></li>` : ''}
                        <li><span>Cost:</span> <span class="text-gold">${unit.totalCost.toLocaleString()}</span></li>
                        <li><span>Max Placements:</span> <span>${unit.placement}</span></li>
                    </ul>
                </div>
                ${unit.tags?.length ? `
                <div class="info-section section-tags">
                    <div class="info-sec-title">Unit Tags</div>
                    <div class="info-tags-container">${unit.tags.map(t => `<span class="info-tag-chip">${t}</span>`).join('')}</div>
                </div>` : ''}
                <div class="info-section section-stats">
                    <div class="info-sec-title">Maximum Statistics (Lv 1)</div>
                    <ul class="info-list">
                        <li><span>Damage:</span> <span class="text-white">${finalDmg.toLocaleString()}</span></li>
                        <li><span>SPA:</span> <span class="text-white">${finalSpa}s</span></li>
                        <li><span>Range:</span> <span class="text-white">${finalRange}</span></li>
                        <li><span>Animation Cap:</span> <span class="text-white">${s.spaCap}s</span></li>
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

        getEl('unitInfoPopup')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'unitInfoPopup';
        overlay.className = 'info-popup-overlay is-visible';

        document.body.classList.add('modal-open');

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (!hasVisibleModals()) document.body.classList.remove('modal-open');
            }
        };

        overlay.innerHTML = `
            <div class="modal-box modal-sm info-popup-box">
                <div class="modal-header"><h2 class="modal-title">UNIT INFO: ${unit.name.toUpperCase()}</h2></div>
                <div class="modal-body" style="padding-top: 5px;">${html}</div>
                <div class="modal-footer">
                    <button class="action-btn secondary" onclick="getEl('unitInfoPopup').remove(); if(!qAll('.modal-overlay.is-visible').length) document.body.classList.remove('modal-open');">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    window.unitModesState = window.unitModesState || {};

    window.updateOverlaySlider = (unitId, activeModeIdx) => {
        const unit = window.getUnitById(unitId);
        if (!unit) return;
        const overlay = getEl('modesOverlay');
        if (!overlay) return;

        overlay.querySelector('.modes-overlay-slider-container')?.remove();

        const cfg = unit.systemLevel;
        if (!cfg || !cfg.restrictModes || !cfg.restrictModes.includes(activeModeIdx)) return;

        const currentSysLvl = window.unitSystemLevels?.[unitId] ?? (cfg.default || cfg.max || 100);

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'modes-overlay-slider-container';
        sliderContainer.onclick = (e) => e.stopPropagation();
        sliderContainer.style.cssText = `
            position: relative; margin: 15px auto 0; width: 90%; max-width: 450px;
            background: rgba(10, 10, 12, 0.95); border: 1px solid rgba(165, 180, 252, 0.2);
            border-radius: 12px; padding: 16px 20px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.05);
            display: flex; flex-direction: column; gap: 10px; z-index: 5000; backdrop-filter: blur(12px);
            animation: modeEntrance 0.5s ease forwards;
        `;
        sliderContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">Adjust ${cfg.label || 'System Level'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                <input id="overlay-system-level-${unitId}" type="range" min="${cfg.min || 1}" max="${cfg.max || 100}" value="${currentSysLvl}"
                    style="flex: 1; height: 6px; background: rgba(99, 102, 241, 0.2); border-radius: 3px; cursor: pointer; accent-color: #818cf8; outline: none; margin: 0;"
                    oninput="getEl('overlay-sys-lvl-val-${unitId}').innerText = this.value; if(getEl('system-level-${unitId}')) getEl('system-level-${unitId}').value = this.value; if(getEl('sys-lvl-val-${unitId}')) getEl('sys-lvl-val-${unitId}').innerText = this.value; window.setSystemLevel('${unitId}', this.value)">
                <span id="overlay-sys-lvl-val-${unitId}" style="font-size: 0.9rem; font-weight: 900; color: #e0e7ff; background: rgba(99, 102, 241, 0.25); padding: 3px 10px; border-radius: 6px; min-width: 32px; text-align: center; border: 1px solid rgba(99, 102, 241, 0.15);">${currentSysLvl}</span>
            </div>
        `;

        const grid = overlay.querySelector('#modesOverlayGrid');
        if (grid && grid.nextSibling) {
            overlay.insertBefore(sliderContainer, grid.nextSibling);
        } else {
            overlay.appendChild(sliderContainer);
        }
    };

    window.openUnitModes = (unitId) => {
        const unit = window.getUnitById(unitId);
        if (!unit || !unit.modes) return;

        const overlay = getEl('modesOverlay');
        const grid = getEl('modesOverlayGrid');
        if (!overlay || !grid) return;

        overlay.querySelector('.modes-overlay-slider-container')?.remove();

        if (unitId === 'jinoo_shadow_monarch') {
            if (!Array.isArray(window.unitModesState[unitId])) {
                window.unitModesState[unitId] = [0];
                window.updateBuildListDisplay?.(unitId, true);
            }
            renderShadowMonarchSpecialUI(unit, grid, overlay);
            return;
        }

        const state = window.unitModesState[unitId];
        const isMulti = !!unit.allowMultipleModes;

        // FIX: Safely unpack array mode states to prevent nested [[0]] array mismatches on single-select mode overlays
        const activeModes = isMulti ? (Array.isArray(state) ? state : []) : (state !== undefined ? (Array.isArray(state) ? state : [state]) : (isUnit(unitId, 'merciless_god') ? [] : [unit.defaultMode ?? 0]));

        grid.innerHTML = unit.modes.map((mode, idx) => `
            <div class="mode-card-large ${activeModes.includes(idx) ? 'active' : ''}" 
                 style="transition-delay: ${idx * 0.05}s"
                 onclick="selectUnitMode('${unitId}', ${idx})">
                <div class="mode-img-container-large"><img src="${mode.img}" alt="${mode.name}"></div>
                <div class="mode-card-info">
                    <div class="mode-card-name">${mode.name}</div>
                    <div class="mode-card-desc">${mode.desc}</div>
                </div>
            </div>
        `).join('');

        grid.className = `modes-overlay-grid unit-${unitId}`;
        if (unit.allowMultipleModes) grid.classList.add('multi-select-modes');
        if (unitId === 'the_strongest_in_history') grid.classList.add('circular-layout');

        window.updateOverlaySlider(unitId, activeModes[0] || 0);

        overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
    };

    window.selectUnitMode = (unitId, modeIdx) => {
        const unit = window.getUnitById(unitId);
        if (!unit) return;

        const isMulti = !!unit.allowMultipleModes;
        if (isMulti) {
            let state = window.unitModesState[unitId];
            if (!Array.isArray(state)) state = (state !== undefined) ? [state] : [];

            if (state.includes(modeIdx)) {
                state = state.filter(i => i !== modeIdx);
                if (state.length === 0 && unitId !== 'jinoo_shadow_monarch') state = [0];
            } else {
                if (unitId === 'jinoo_shadow_monarch') {
                    const sysLvl = window.unitSystemLevels?.[unitId] ?? (unit.systemLevel?.default ?? 100);
                    const reqLvl = [0, 40, 60, 80, 100][modeIdx] || 0;
                    if (sysLvl < reqLvl) return;
                }
                state.push(modeIdx);
            }
            window.unitModesState[unitId] = state;

            if (unitId === 'the_strongest_in_history' && state.includes(1) && state.includes(2)) {
                setTimeout(window.closeModesOverlay, 500);
            }
        } else {
            window.unitModesState[unitId] = modeIdx;
        }

        // Bust live score caches for this unit; card placement stays fixed for mode UI changes.
        if (window.LIVE_SCORE_CACHE) {
            delete window.LIVE_SCORE_CACHE[unitId];
        }

        if (window.unitBuildsCache?.[unitId]) delete window.unitBuildsCache[unitId];

        // Refresh dynamic active build parameters for the unit in the global registry
        if (typeof window.refreshActiveBuild === 'function' && unit) {
            window.refreshActiveBuild(unit);
        }

        // Update the card display to reflect changes, keeping card in place
        if (typeof window.updateBuildListDisplay === 'function') {
            window.updateBuildListDisplay(unitId, true);
        }

        if (unitId === 'jinoo_shadow_monarch') {
            renderShadowMonarchSpecialUI(unit, getEl('modesOverlayGrid'), getEl('modesOverlay'));
        } else {
            const activeModes = isMulti ? window.unitModesState[unitId] : [window.unitModesState[unitId]];
            document.querySelectorAll('.mode-card-large').forEach((card, idx) => {
                card.classList.toggle('active', activeModes.includes(idx));
            });
            window.updateOverlaySlider(unitId, activeModes[0] || 0);
        }

        window.updateHotbarUI?.();
        window.updateOverlaySlider?.(unitId, modeIdx);

        if (!isMulti && unitId !== 'joyful_captain') {
            setTimeout(window.closeModesOverlay, 100);
        }
    };

    window.closeModesOverlay = () => {
        const overlay = getEl('modesOverlay');
        if (!overlay) return;

        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('closing');
            if (!hasVisibleModals()) document.body.classList.remove('modal-open');
        }, 200);
    };

    function renderShadowMonarchSpecialUI(unit, grid, overlay) {
        const state = window.unitModesState[unit.id] || [];
        const sysLvl = window.unitSystemLevels?.[unit.id] ?? 100;

        let dmgVal = unit.stats.dmg || 0;
        let dpsVal = dmgVal / (unit.stats.spa || 1);

        const currentBuild = window.hotbarFilteredBuilds?.[unit.id];
        if (currentBuild) {
            dmgVal = currentBuild.dmgVal || currentBuild.dmg || 0;
            dpsVal = currentBuild.dps || 0;
        } else {
            const list = window.STATIC_BUILD_DB?.[unit.id]?.['fixed']?.[0];
            if (list) {
                dmgVal = list.dmgVal || list.dmg || 0;
                dpsVal = list.dps || 0;
            }
        }

        grid.innerHTML = `
        <div class="sm-special-ui">
            <img src="images/units/Jinoo/main_ui.png" class="sm-main-bg" alt="Main UI">
            
            <div class="sm-side-panel-container">
                <img src="images/units/Jinoo/Side Panel.png" class="sm-side-panel-bg" alt="Side Panel">
                <img src="images/units/Jinoo/Jinwo Side Panel.png" class="sm-side-character" alt="Jinwoo">
                <div class="sm-pill-dmg"><span class="sm-pill-label">DMG:</span><span class="sm-pill-val">${Math.floor(dmgVal).toLocaleString()}</span></div>
                <div class="sm-pill-dps"><span class="sm-pill-label">DPS:</span><span class="sm-pill-val">${Math.floor(dpsVal).toLocaleString()}</span></div>
            </div>

            <div class="sm-close-btn" onclick="closeModesOverlay()"><img src="images/units/Jinoo/X.png" alt="Close"></div>
            
            <div class="sm-cards-row">
                ${unit.customSummons.map((s, idx) => {
            const reqLvl = [0, 40, 60, 80, 100][idx] || 0;
            const isUnlocked = sysLvl >= reqLvl;
            const btnImg = state.includes(idx) ? 'btn_disable.png' : 'btn_enable.png';

            return `
                    <div class="sm-card-slot ${!isUnlocked ? 'locked' : ''}">
                        <div class="sm-card-inner">
                            <img src="${unit.modes[idx].img}" alt="${s.name}" class="sm-card-image">
                            <img src="images/units/Jinoo/${btnImg}" 
                                 class="sm-toggle-btn" 
                                 onclick="${isUnlocked ? `event.stopPropagation(); selectUnitMode('${unit.id}', ${idx})` : ''}"
                                 alt="Toggle">
                        </div>
                    </div>`;
        }).join('')}
            </div>
        </div>`;

        grid.className = 'modes-overlay-grid sm-custom-layout';
        overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    /**
     * Shows Trait Tier List (All Units)
     */
    window.openTraitTierList = () => {
        const shortMap = { Fission: [] };
        const longMap = { Fission: [] };
        const virtualMap = {};

        const addToMap = (map, traitStr, unit) => {
            if (!traitStr || traitStr === '-') return;
            traitStr.split('/').map(s => s.trim()).forEach(p => {
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

        const getUnitScore = (u) => {
            const list = window.STATIC_BUILD_DB?.[u.id]?.['fixed']?.[0];
            if (list?.length) {
                return window.isUnit(u.id, 'law') ? (list[0].range || 0) : list[0].dps;
            }
            return u.stats.dmg || 0;
        };

        const traitOrder = ['Ruler', 'Eternal', 'Sacred', 'Fission', 'Astral', 'Duelist', 'Wizard'];

        const renderSection = (title, map) => {
            const sortedTraits = Object.keys(map).sort((a, b) => {
                const cleanA = a.split('(')[0].trim();
                const cleanB = b.split('(')[0].trim();
                const idxA = traitOrder.indexOf(cleanA);
                const idxB = traitOrder.indexOf(cleanB);
                return (idxA !== -1 && idxB !== -1) ? idxA - idxB : (idxA !== -1 ? -1 : (idxB !== -1 ? 1 : a.localeCompare(b)));
            });

            const rows = sortedTraits.map(t => {
                const units = [...map[t]].sort((a, b) => getUnitScore(b) - getUnitScore(a));
                const unitIcons = units.map(u => `
                    <div class="tier-unit" data-id="${u.id}" title="${u.name} (Score: ${parseInt(getUnitScore(u)).toLocaleString()})">
                        <img src="${u.img}" class="tier-unit-img" onerror="this.style.display='none'">
                    </div>
                `).join('');

                const cleanT = t.split('(')[0].trim();
                const tObj = traitsList.find(x => x.name.toLowerCase() === cleanT.toLowerCase() || x.id === cleanT.toLowerCase());
                const traitImg = tObj ? `<div class="trait-img-rainbow" style="width: 22px; height: 22px; margin-right: 10px; flex-shrink: 0;"><img src="images/traits/${tObj.name}.png" onerror="this.parentElement.style.display='none'"></div>` : '';

                return `
                    <div class="tier-row">
                        <div class="tier-head">${traitImg}<div class="tier-trait-name">${t}</div></div>
                        <div class="tier-body">${unitIcons}</div>
                    </div>`;
            }).join('');

            return `<div class="tier-section"><div class="tier-section-title">${title}</div><div class="tier-grid">${rows}</div></div>`;
        };

        window.showUniversalModal({
            title: 'TRAIT SUGGESTIONS TIER LIST',
            content: `<div class="tier-list-container">${renderSection('Wave 1-30', shortMap)}${renderSection('Infinite Mode', longMap)}
                <div style="margin-top: 20px; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; color: #fca5a5; font-size: 0.8rem; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                    <strong>Note:</strong> The <b>Astral</b> trait is currently bugged and no longer currently stacks DoT.
                </div>
            </div>`,
            size: 'modal-lg',
            footerButtons: `<button class="action-btn secondary" onclick="closeModal('universalModal')">Close</button>`
        });
    };

    /**
     * Shows a guide of all standard traits and their stats.
     */
    window.openAllTraitsGuide = () => {
        if (typeof traitsList === 'undefined') return;

        const formatStat = (key, trait) => {
            const value = trait[key];
            if (value === undefined || value === 0 || value === false) return '';

            let label = key.toUpperCase(), valText = '', sign = '+', suffix = '%';
            const bugTxt = flag => flag ? ' <span style="color: #f87171; font-size: 0.8em;">(Bugged)</span>' : '';

            switch (key) {
                case 'dmg': label = 'Damage'; valText = `${sign}${value}${suffix}`; break;
                case 'spa': label = 'SPA'; valText = `-${value}${suffix}`; break;
                case 'range': label = 'Range'; valText = `${sign}${value}${suffix}`; break;
                case 'bossDmg': label = 'Boss Dmg'; valText = `${sign}${value}${suffix}`; break;
                case 'critRate': label = 'Crit Rate'; valText = `${sign}${value}${suffix}`; break;
                case 'dotBuff': label = 'DoT Buff'; valText = `${sign}${value}${suffix}${bugTxt(trait.isDotBugged)}`; break;
                case 'costReduction': label = 'Cost'; valText = `-${value}${suffix}`; break;
                case 'limitPlace': label = 'Placement'; valText = `Limit ${value}`; break;
                case 'afflictionDuration': label = 'Affliction Dur.'; valText = `${sign}${value}${suffix}${bugTxt(trait.isAfflictionBugged)}`; break;
                case 'relicBuff': label = 'Relic Stats'; valText = `${sign}${((value - 1) * 100).toFixed(0)}${suffix}`; break;
                case 'isEternal': return `<li><span class="atg-label">Passive</span><span class="atg-value" style="font-size: 0.75rem; text-align: right; line-height: 1.2;">+5% Dmg & +2.5% Rng / Wave<br>Max: +60% & +30% (12 Waves)</span></li>`;
                case 'hasRadiation': return `<li><span class="atg-label">Radiation</span><span class="atg-value" title="Deals ${trait.radiationPct}% of Unit Damage over 10 seconds">${trait.radiationPct}% Dmg / 10s</span></li>`;
                case 'dmgDebuff': label = 'Debuff'; valText = `${sign}${value}${suffix}${bugTxt(trait.isDebuffBugged)}`; break;
                case 'allowDotStack': return `<li><span class="atg-label">Passive</span><span class="atg-value">DoT Stacks</span></li>`;
                default: return '';
            }
            return `<li><span class="atg-label">${label}</span><span class="atg-value">${valText}</span></li>`;
        };

        const html = traitsList.filter(t => t.id !== 'none').map(trait => {
            const statOrder = ['dmg', 'spa', 'range', 'critRate', 'bossDmg', 'dotBuff', 'afflictionDuration', 'relicBuff', 'costReduction', 'limitPlace', 'isEternal', 'hasRadiation', 'dmgDebuff', 'allowDotStack'];
            const statsHtml = statOrder.map(key => formatStat(key, trait)).join('');

            return `
                <div class="all-traits-card">
                    <div class="atg-header">
                        <div class="trait-img-rainbow"><img src="images/traits/${trait.name}.png" onerror="this.parentElement.style.display='none'"></div>
                        <span class="atg-name">${trait.name}</span>
                    </div>
                    <div class="atg-desc">${trait.desc}</div>
                    <ul class="atg-stats">${statsHtml}</ul>
                </div>`;
        }).join('');

        window.showUniversalModal({ title: 'TRAIT STATS', content: `<div class="all-traits-grid">${html}</div>`, size: 'modal-lg' });
    };

    // --- INFO POPUPS (Overlay style) ---

    window.openInfoPopup = (key) => {
        const data = infoDefinitions[key];
        if (!data) return;

        getEl('mathInfoPopup')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'mathInfoPopup';
        overlay.className = 'info-popup-overlay is-visible';

        document.body.classList.add('modal-open');

        overlay.onclick = (e) => { if (e.target === overlay) window.closeInfoPopup(); };
        overlay.innerHTML = `
            <div class="modal-box modal-sm info-popup-box">
                <div class="modal-header"><h2 class="modal-title">${data.title}</h2></div>
                <div class="modal-body">
                    <p style="color: #ccc; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px;">${data.desc}</p>
                    <div class="ip-formula">${data.formula}</div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn secondary" onclick="closeInfoPopup()">Close</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);
    };

    window.closeInfoPopup = () => {
        getEl('mathInfoPopup')?.remove();
        if (!hasVisibleModals()) document.body.classList.remove('modal-open');
    };

    /**
     * General bugs not tied to a specific unit
     */
    const GENERAL_BUGS = [
        {
            name: 'Astral Trait — DoT Stacking Broken',
            desc: 'The <strong>Astral</strong> trait is currently bugged and no longer stacks DoT. It does not function as intended in DoT-based builds.'
        },
        {
            name: 'Elemental Advantages/Disadvantages',
            desc: 'The <strong>Elemental Advantages/Disadvantages</strong> system is currently bugged and does not provide any damage bonus or damage reductions.'
        }
    ];

    /**
     * Shows All Known Bugs (unit-specific + general)
     */
    window.openAllBugsGuide = () => {
        if (typeof unitDatabase === 'undefined') return;

        const unitsWithBugs = unitDatabase.filter(u => u.bugs && u.bugs.length > 0);

        const generalSection = GENERAL_BUGS.length > 0 ? `
            <div style="margin-bottom: 22px;">
                <div style="
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 12px; padding-bottom: 8px;
                    border-bottom: 1px solid rgba(239, 68, 68, 0.2);
                ">
                    <span style="font-size: 1.1rem;">🌐</span>
                    <span style="font-size: 0.8rem; font-weight: 900; color: #f87171; text-transform: uppercase; letter-spacing: 1px;">General / Game-Wide Bugs</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${GENERAL_BUGS.map(bug => `
                        <div style="
                            display: flex; gap: 12px; align-items: flex-start;
                            padding: 12px 14px;
                            background: rgba(239, 68, 68, 0.06);
                            border: 1px solid rgba(239, 68, 68, 0.18);
                            border-radius: 9px;
                        ">
                            <span style="font-size: 1.1rem; flex-shrink: 0; margin-top: 1px;">🐛</span>
                            <div>
                                <div style="font-size: 0.82rem; font-weight: 800; color: #fca5a5; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">${bug.name}</div>
                                <div style="font-size: 0.8rem; color: #d1d5db; line-height: 1.5;">${bug.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const unitBugsHtml = unitsWithBugs.map(unit => `
            <div style="margin-bottom: 18px;">
                <div style="
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 10px; padding-bottom: 8px;
                    border-bottom: 1px solid rgba(239, 68, 68, 0.15);
                ">
                    <img src="${unit.img}" alt="${unit.name}" style="
                        width: 34px; height: 34px; border-radius: 6px; object-fit: cover;
                        border: 1px solid rgba(239, 68, 68, 0.25);
                        background: rgba(0,0,0,0.4);
                        flex-shrink: 0;
                    " onerror="this.style.display='none'">
                    <div>
                        <div style="font-size: 0.82rem; font-weight: 900; color: #f9a8d4; text-transform: uppercase; letter-spacing: 0.5px;">${unit.name}</div>
                        <div style="font-size: 0.68rem; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">${unit.role} · ${unit.placementType || 'Ground'}</div>
                    </div>
                    <div style="margin-left: auto;">
                        <span style="
                            font-size: 0.6rem; font-weight: 900; padding: 2px 7px;
                            background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3);
                            border-radius: 50px; color: #f87171; text-transform: uppercase; letter-spacing: 0.5px;
                        ">${unit.bugs.length} bug${unit.bugs.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 7px; padding-left: 4px;">
                    ${unit.bugs.map(bug => `
                        <div style="
                            display: flex; gap: 12px; align-items: flex-start;
                            padding: 11px 13px;
                            background: rgba(239, 68, 68, 0.05);
                            border: 1px solid rgba(239, 68, 68, 0.14);
                            border-radius: 8px;
                        ">
                            <span style="font-size: 1rem; flex-shrink: 0; margin-top: 1px;">🐛</span>
                            <div>
                                ${bug.name ? `<div style="font-size: 0.79rem; font-weight: 800; color: #fca5a5; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.3px;">${bug.name}</div>` : ''}
                                <div style="font-size: 0.78rem; color: #d1d5db; line-height: 1.5;">${bug.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        const totalBugs = GENERAL_BUGS.length + unitsWithBugs.reduce((acc, u) => acc + u.bugs.length, 0);

        window.showUniversalModal({
            title: `<span style="color: #f87171;">🐛 KNOWN BUGS</span> <span style="font-size: 0.7rem; color: #6b7280; font-weight: 500; text-transform: none;">${totalBugs} total</span>`,
            content: `
                <div style="padding: 2px 0 8px;">
                    <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 16px; padding: 9px 12px; background: rgba(239, 68, 68, 0.05); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.1); line-height: 1.5;">
                        ⚠️ These are known in-game bugs that may affect unit behaviour or calculator accuracy. Some bugs are reflected in the numbers, others are noted for awareness.
                    </div>
                    ${generalSection}
                    ${unitsWithBugs.length > 0 ? `
                        <div style="font-size: 0.75rem; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            Unit-Specific Bugs (${unitsWithBugs.length} units)
                        </div>
                        ${unitBugsHtml}
                    ` : '<div style="color: #4b5563; text-align: center; padding: 20px;">No unit-specific bugs on record.</div>'}
                </div>
            `,
            size: 'modal-md'
        });
    };

})();