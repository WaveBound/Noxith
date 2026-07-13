// ============================================================================
// UI-HELPERS.JS - UI Interaction, Global State & Toggle Functions
// ============================================================================

// --- GLOBAL BUFF DATA (Single Source of Truth & Evaluation Methods) ---
window.GLOBAL_BUFF_DATA = {
    miku: {
        id: 'miku',
        name: 'Miku',
        stateKey: 'mikuActive',
        color: '#38bdf8',
        desc: 'Apply Miku\'s +100% Damage Buff',
        tagLabel: 'Miku',
        math: (uStats, context) => ({ dmg: 100 })
    },
    enlightenedGod: {
        id: 'enlightenedgod',
        name: 'Enlightened God',
        stateKey: 'enlightenedGodActive',
        color: '#fbbf24',
        desc: 'Apply Enlightened God\'s +20% Damage & +20% SPA Buff',
        tagLabel: 'Enlightened God',
        math: (uStats, context) => ({ dmg: 20, spa: 20 })
    },
    bijuu: {
        id: 'bijuu',
        name: 'Bijuu Link',
        stateKey: 'bijuuActive',
        color: '#f87171',
        desc: 'Apply Bijuu Link\'s +25% Damage, +25% Range, & +15% SPA Buff',
        tagLabel: 'Bijuu Link',
        math: (uStats, context) => ({ dmg: 25, range: 25, spa: 15 })
    },
    ancientMage: {
        id: 'amage',
        name: 'Ancient Mage',
        stateKey: 'ancientMageActive',
        color: '#a78bfa',
        desc: 'Apply Ancient Mage\'s +20% Crit Rate & +20% Crit Dmg Buff',
        tagLabel: 'Ancient Mage',
        math: (uStats, context) => {
            if (window.isUnit && window.isUnit(uStats.id, 'ancient_mage')) return {};
            return { crit: 20, cdmg: 20 };
        }
    },
    kingSailor: {
        id: 'ksailor',
        name: 'King Sailor',
        stateKey: 'kingSailorActive',
        color: '#60a5fa',
        desc: 'Apply King Sailor\'s +10% Crit Rate & +25% Crit Dmg Buff',
        tagLabel: 'King Sailor',
        math: (uStats, context) => {
            if (window.isUnit && window.isUnit(uStats.id, 'king_sailor')) return {};
            return { crit: 10, cdmg: 25 };
        }
    },
    mageHill: {
        id: 'magehill',
        name: 'Fern (Hill)',
        stateKey: 'mageHillActive',
        color: '#34d399',
        desc: 'Apply Fern (Hill)\'s +30% SPA Buff to Hill/Hybrid units',
        tagLabel: 'Fern (Hill)',
        excludes: 'mageGround',
        math: (uStats, context) => {
            if (!window.mageHillActive) return {}; // Global check for buff state
            if (!uStats || !uStats.id) return {};

            const pType = String(uStats.placementType || uStats.placement || 'Ground').toLowerCase();
            const unitId = String(uStats.id).split('-')[0];
            const isFernSelf = unitId === 'prodigy_mage';
            // merciless_god is Hybrid but should ONLY receive Fern Hill
            const isMercilessGod = unitId === 'merciless_god';
            const isMatching = (pType === 'hill' || pType === 'hybrid' || isMercilessGod);

            if (isMatching || isFernSelf) {
                if (window.CALCULATION_MODE === 'loadout' && window.hotbarState) {
                    const slots = window.hotbarState.slots;
                    if (!slots) return {}; // Defensive check: Ensure slots array exists

                    const slotIdx = slots.findIndex(s => s && s.id && (s.id === uStats.id || s.id.split('-')[0] === unitId));

                    const isFernPresent = slots.some(s => s && s.id && s.id.split('-')[0] === 'prodigy_mage');
                    if (isFernPresent) {
                        const targets = window.hotbarState.fernTargets;
                        if (!targets) return {}; // Defensive check: Ensure fernTargets array exists
                        if (!targets.includes(slotIdx) && !(isFernSelf && targets.length > 0)) return {};
                    } else {
                        return {};
                    }
                }
                return { spa: 30 };
            }
            return {};
        }
    },
    mageGround: {
        id: 'mageground',
        name: 'Fern (Ground)',
        stateKey: 'mageGroundActive',
        color: '#60a5fa',
        desc: 'Apply Fern (Ground)\'s +45% Crit Rate Buff to Ground/Hybrid units',
        tagLabel: 'Fern (Ground)',
        excludes: 'mageHill',
        math: (uStats, context) => {
            if (!window.mageGroundActive) return {}; // Global check for buff state
            if (!uStats || !uStats.id) return {};

            const pType = String(uStats.placementType || uStats.placement || 'Ground').toLowerCase();
            const unitId = String(uStats.id).split('-')[0];
            const isFernSelf = unitId === 'prodigy_mage';
            // merciless_god is Hybrid but should NOT receive Fern Ground — only Fern Hill
            const isMercilessGod = unitId === 'merciless_god';
            const isMatching = (pType === 'ground' || pType === 'hybrid') && !isMercilessGod;

            if (isMatching || isFernSelf) {
                if (window.CALCULATION_MODE === 'loadout' && window.hotbarState) {
                    const slots = window.hotbarState.slots;
                    if (!slots) return {}; // Defensive check: Ensure slots array exists

                    const slotIdx = slots.findIndex(s => s && s.id && (s.id === uStats.id || s.id.split('-')[0] === unitId));

                    const isFernPresent = slots.some(s => s && s.id && s.id.split('-')[0] === 'prodigy_mage');
                    if (isFernPresent) {
                        const targets = window.hotbarState.fernTargets;
                        if (!targets) return {}; // Defensive check: Ensure fernTargets array exists
                        if (!targets.includes(slotIdx) && !(isFernSelf && targets.length > 0)) return {};
                    } else {
                        return {};
                    }
                }
                return { crit: 45 };
            }
            return {};
        }
    },
    unrivaledMark: {
        id: 'unrivaledMark',
        name: 'Unrivaled Mark',
        stateKey: 'unrivaledMarkActive',
        color: '#10b981',
        desc: 'Apply Unrivaled Mark Leader Buff from Triple Threat / King Sailor / Angel Born in Hell',
        tagLabel: 'Unrivaled Mark',
        hideButton: true,
        math: (uStats, context) => {
            const isPotential = window.CALCULATION_MODE === 'potential';
            const isLoadout = window.CALCULATION_MODE === 'loadout';
            const normalizeUnitId = id => String(id || '').split('-')[0];
            const unrivaledMarkActive = context.unrivaledMark || window.unrivaledMark || (window.hotbarState?.buffState?.unrivaledMark);
            const leader = window.hotbarState?.slots?.[0];
            const hotbarIds = [
                ...(window.hotbarState?.slots || []).filter(Boolean).map(slot => slot.id),
                ...(typeof window.getActiveFusions === 'function' ? window.getActiveFusions().map(fusion => fusion.id) : [])
            ];
            const hotbarUnitIds = new Set(hotbarIds.filter(Boolean).map(normalizeUnitId));

            if (isLoadout && !hotbarUnitIds.has(normalizeUnitId(uStats.id))) return {};

            let activeLeaderId = null;
            if (isPotential) {
                if (window.isUnit && window.isUnit(uStats.id, 'king_sailor')) {
                    activeLeaderId = 'king_sailor';
                } else if (window.isUnit && window.isUnit(uStats.id, 'angel_born_in_hell')) {
                    activeLeaderId = 'angel_born_in_hell';
                } else {
                    activeLeaderId = 'triple_threat';
                }
            } else if (leader) {
                activeLeaderId = leader.id;
            }

            if (!activeLeaderId || !unrivaledMarkActive) return {};

            const tags = uStats.tags || [];
            const rawElement = uStats.element || uStats.stats?.element || "";
            const element = String(rawElement).toLowerCase();

            if (window.isUnit && window.isUnit(activeLeaderId, 'triple_threat')) {
                if (tags.includes('Piece')) return { dmg: 50, costReduction: 7.5 };
                if (tags.includes('Sword')) return { dmg: 25, range: 10 };
                if (element === 'wind') return { dmg: 20, crit: 5 };
            }
            if (window.isUnit && window.isUnit(activeLeaderId, 'king_sailor')) {
                if (tags.includes('Magi')) return { dmg: 50, spa: 15 };
                if (tags.includes('Uncontrollable Power')) return { dmg: 30, spa: 10 };
                if (element === 'water') return { dmg: 20, spa: 10 };
            }
            if (window.isUnit && window.isUnit(activeLeaderId, 'angel_born_in_hell')) {
                if (tags.includes('Fused') || tags.includes('Fusion')) return { dmg: 50, cdmg: 50 };
                if (tags.includes('Super Warrior')) return { dmg: 30, spa: 10 };
                if (element === 'light') return { dmg: 20, crit: 5 };
            }
            return {};
        }
    },
    mercilessGod: {
        id: 'merciless_god',
        name: 'Merciless God',
        stateKey: 'mercilessGodActive',
        color: '#fca5a5',
        desc: 'Apply Merciless God\'s +50% DoT Buff (from Godly Earrings)',
        tagLabel: 'Merciless God',
        hideButton: true,
        math: (uStats, context) => {
            if (!uStats || !uStats.id) return {};
            if (uStats.id.split('-')[0] === 'merciless_god') return {};
            if (window.CALCULATION_MODE === 'loadout' && window.hotbarState && window.hotbarState.slots) {
                const slots = window.hotbarState.slots;
                const mgPresent = slots.some(s => s && s.id && s.id.split('-')[0] === 'merciless_god');
                if (mgPresent) {
                    const mgState = window.unitModesState ? window.unitModesState['merciless_god'] : undefined;
                    const mgIdx = Array.isArray(mgState) ? mgState[0] : (mgState !== undefined ? mgState : 4);
                    const mgUnit = typeof window.getUnitById === 'function' ? window.getUnitById('merciless_god') : null;
                    if (mgUnit && mgUnit.modes && mgUnit.modes[mgIdx]) {
                        const passives = mgUnit.modes[mgIdx].passives || [];
                        if (passives.some(p => p.name === 'Godly Earrings')) {
                            return { dot: 50 };
                        }
                    }
                }
            }
            return {};
        }
    },
    customBuff: {
        id: 'customBuff',
        name: 'Custom Buff',
        stateKey: 'customBuffActive',
        color: '#a3e635',
        desc: 'Apply manually entered custom DMG/SPA/DoT buffs',
        tagLabel: 'Custom Buff',
        hideButton: true,
        math: (uStats, context) => {
            const s = window.customBuffState || {};
            const result = {};
            if (s.dmg)  result.dmg  = Number(s.dmg)  || 0;
            if (s.spa)  result.spa  = Number(s.spa)  || 0;
            if (s.dot)  result.dot  = Number(s.dot)  || 0;
            if (s.crit) result.crit = Number(s.crit) || 0;
            if (s.cdmg) result.cdmg = Number(s.cdmg) || 0;
            return result;
        }
    }
};

// --- DUAL BUFF CONTEXT SYSTEM ---
window.GLOBAL_BUFF_STATE = {};
window.HOTBAR_BUFF_STATE = {};
window.CALCULATION_MODE = 'potential';
window.GLOBAL_MODE_SORT = 'none';
window.unitELevels = window.unitELevels || {};
window.unitSystemLevels = window.unitSystemLevels || {};
window.visibleUnitIds = new Set();
window.isBuffUpdateRunning = false;

if (window.GLOBAL_BUFF_DATA) {
    Object.entries(window.GLOBAL_BUFF_DATA).forEach(([k, c]) => {
        window.GLOBAL_BUFF_STATE[k] = window.HOTBAR_BUFF_STATE[k] = window[c.stateKey] = false;
    });
}

window.toggleCalcMode = function (mode) {
    if (mode === 'loadout' && (typeof ENABLE_LOADOUT_CLICKABLE !== 'undefined' ? !ENABLE_LOADOUT_CLICKABLE : false)) {
        callIfFn('showToast', "Loadout Mode is currently disabled.");
        return;
    }
    if (window.CALCULATION_MODE === mode) return;
    window.CALCULATION_MODE = mode;

    const pBtn = getEl('modeBtnPotential'), lBtn = getEl('modeBtnLoadout');
    if (pBtn && lBtn) {
        pBtn.classList.toggle('active', mode === 'potential');
        lBtn.classList.toggle('active', mode === 'loadout');
    }

    const hotbarEl = getEl('unitHotbar');
    if (hotbarEl) hotbarEl.style.display = mode === 'loadout' ? '' : 'none';

    const onDone = () => {
        const hasPendingCustomPairs = window.pendingCustomPairBuilds?.size > 0;

        window.resetCachesForBuffChange();
        if (mode === 'loadout') {
            if (!hasPendingCustomPairs) {
                callIfFn('precalculateAllLoadoutBuilds');
                callIfFn('recalculateHotbarTeam');
            } else {
                callIfFn('showToast', "Loadout recalculations are paused because custom pairs are pending. Quick-load the affected cards first.");
            }
        }
        callIfFn('resetAndRender');
        if (!hasPendingCustomPairs) {
            callIfFn('updateHotbarUI');
        }
    };

    if (mode === 'loadout' && typeof window.loadHotbarDb === 'function') {
        window.loadHotbarDb(onDone);
    } else {
        onDone();
    }
};

window.handleGlobalModeSort = function (value) {
    window.GLOBAL_MODE_SORT = value;
    const labelText = { none: 'DEFAULT', short: 'PROGRESSION', long: 'INFINITE' }[value] || 'DEFAULT';

    qAll('#activeModeLabel, .active-mode-label, .current-mode-text').forEach(el => el.innerText = labelText);
    qAll('#globalModeSelect, .global-mode-select, select[onchange*="handleGlobalModeSort"]').forEach(el => {
        if (el.tagName === 'SELECT') el.value = value;
        else el.innerText = labelText;
    });

    if (typeof window.resetCachesForBuffChange === 'function') {
        window.resetCachesForBuffChange();
    }
    callIfFn('resetAndRender');
};

window.showModeSelectionModal = function () {
    if (typeof showUniversalModal !== 'function') return;
    const current = window.GLOBAL_MODE_SORT || 'none';
    const btn = (mode, color, text, desc, extraStyle = '') => `
        <button class="mode-select-btn ${current === mode ? 'active' : ''}" onclick="window.handleGlobalModeSort('${mode}'); closeModal('universalModal');" style="${extraStyle}">
            <b style="color: ${color};">${text}</b>
            <span>${desc}</span>
        </button>`;

    showUniversalModal({
        title: '<span style="color: #60a5fa; font-size: 0.75rem; letter-spacing: 2px; font-weight: 900; text-transform: uppercase;">Optimization Strategy</span>',
        content: `
            <div style="text-align: center; padding: 10px 10px 5px;">
                <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.6;">
                    Select your calculation mode. This will <strong style="color:#fff">prioritize</strong> specific traits at the top while still showing others below.
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${btn('none', '#fff', 'DEFAULT MODE', 'Standard ranking based on raw DPS.')}
                    ${btn('short', '#4ade80', 'PROGRESSION MODE', "Focus on early game potential. This is the unit's recommended trait for Progression.", 'border-color: #4ade8022; background: linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(0,0,0,0.1) 100%);')}
                    ${btn('long', '#a78bfa', 'INFINITE MODE', "Focus on scaling & utility. This is the unit's recommended trait for Infinite Mode.", 'border-color: #a78bfa22; background: linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(0,0,0,0.1) 100%);')}
                </div>
            </div>
            <style>
                .mode-select-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-align: center; }
                .mode-select-btn:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: rgba(255,255,255,0.3); }
                .mode-select-btn.active { border-color: #60a5fa !important; background: rgba(96, 165, 250, 0.1) !important; box-shadow: 0 0 15px rgba(96, 165, 250, 0.1); }
                .mode-select-btn b { font-size: 1rem; margin-bottom: 4px; letter-spacing: 1.5px; font-weight: 900; }
                .mode-select-btn span { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }
            </style>`,
        size: 'modal-sm',
        footerButtons: '<button class="action-btn secondary" style="width:100%" onclick="closeModal(\'universalModal\')">Keep Current</button>'
    });
};

window.applyBuffContext = (state) => {
    if (window.GLOBAL_BUFF_DATA) {
        Object.entries(window.GLOBAL_BUFF_DATA).forEach(([k, c]) => window[c.stateKey] = !!state[k]);
    }
};

window.getDbFilenameForState = (state) => {
    const parts = window.GLOBAL_BUFF_DATA ? Object.entries(window.GLOBAL_BUFF_DATA).filter(([k]) => state[k]).map(([, c]) => c.id) : [];
    return parts.length ? `db_${parts.join('_')}.js` : 'db_base.js';
};

// --- DATABASE LOADERS (CONSOLIDATED) ---
window.GLOBAL_STATIC_BUILD_DB = null;
window.globalCurrentDb = 'db_base.js';
window.HOTBAR_STATIC_BUILD_DB = null;
window.hotbarCurrentDb = 'db_base.js';

const loadDb = (isHotbar, callback) => {
    const state = isHotbar ? window.HOTBAR_BUFF_STATE : window.GLOBAL_BUFF_STATE;
    const dbName = window.getDbFilenameForState(state);
    const currentKey = isHotbar ? 'hotbarCurrentDb' : 'globalCurrentDb';
    const cacheKey = isHotbar ? 'HOTBAR_STATIC_BUILD_DB' : 'GLOBAL_STATIC_BUILD_DB';

    if (window[currentKey] === dbName && window[cacheKey]) {
        return callback && callback();
    }

    const id = `dynamic-db-script-${isHotbar ? 'hotbar' : 'global'}`;
    const old = getEl(id);
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = id;
    script.src = `databases/${dbName}`;
    script.onload = () => {
        window[cacheKey] = window.STATIC_BUILD_DB;
        if (!isHotbar) {
            if (dbName === 'db_base.js') window.GLOBAL_STATIC_BUILD_DB_BASE = window.STATIC_BUILD_DB;
        } else if (window.GLOBAL_STATIC_BUILD_DB) {
            window.STATIC_BUILD_DB = window.GLOBAL_STATIC_BUILD_DB;
        }
        window[currentKey] = dbName;
        if (callback) callback();
    };
    script.onerror = () => { console.error(`Failed to load ${isHotbar ? 'hotbar' : 'global'} DB: ${dbName}`); if (callback) callback(); };
    document.head.appendChild(script);
};

window.loadGlobalDb = (cb) => loadDb(false, cb);
window.loadHotbarDb = (cb) => loadDb(true, cb);

// --- 2. BUFF LOGIC MANAGERS ---
let buffUpdateTimer = null;

window.resetCachesForBuffChange = (unitId, excludeIds = []) => {
    window.LIVE_SCORE_CACHE = {};
    window.modeBenchmarks = {};
    window.nextLevelStatsCache = {};
    window.customTraitBuildCache = {};
    window.pendingCustomPairBuilds = window.pendingCustomPairBuilds || new Set();
    window.forceCustomPairBuildRefresh = window.forceCustomPairBuildRefresh || new Set();
    window.quickCustomPairBuildRefresh = window.quickCustomPairBuildRefresh || new Set();
    window.pendingCustomPairBuilds.clear();
    window.forceCustomPairBuildRefresh.clear();
    window.quickCustomPairBuildRefresh.clear();

    if (!unitId && excludeIds.length === 0) {
        window.unitBuildsCache = {};
        window.cachedResults = {};
        window.hotbarFilteredBuilds = {};
        window.unitActiveBuilds = {}; // <--- IT CLEARS unitActiveBuilds completely!
        window.bestHydratedBuildCache = {};
        return;
    }

    const excl = new Set(excludeIds);
    const clear = (cache, prefixKeys = false) => {
        if (!cache) return;
        if (unitId) {
            if (prefixKeys) Object.keys(cache).forEach(k => { if (k === unitId || k.startsWith(`${unitId}:`)) delete cache[k]; });
            else delete cache[unitId];
        }
        else Object.keys(cache).forEach(k => { if (!excl.has(k)) delete cache[k]; });
    };
    clear(window.unitBuildsCache);
    clear(window.cachedResults);
    clear(window.hotbarFilteredBuilds);
    clear(window.unitActiveBuilds);
    clear(window.bestHydratedBuildCache, true);
};

window.triggerGlobalBuffUpdate = (unitId) => {
    if (typeof unitId === 'object') unitId = null;

    const hotbarIds = [];
    if (typeof window.getHotbarState === 'function') {
        (window.getHotbarState()?.slots || []).forEach(s => s?.id && hotbarIds.push(s.id));
    }
    if (typeof window.getActiveFusions === 'function') {
        window.getActiveFusions().forEach(f => f?.id && hotbarIds.push(f.id));
    }

    if (buffUpdateTimer) clearTimeout(buffUpdateTimer);
    buffUpdateTimer = setTimeout(() => {
        window.applyBuffContext(window.GLOBAL_BUFF_STATE);
        window.loadGlobalDb(() => {
            window.resetCachesForBuffChange(unitId, hotbarIds);

            if (unitId) {
                if (!hotbarIds.includes(unitId)) callIfFn('updateBuildListDisplay', unitId);
            } else {
                callIfFn('resortUnitCards');
                callIfFn('updateAllUnitsBuilds', hotbarIds);
                callIfFn('updateHotbarUI');

                if (getEl('guidesPage')?.classList.contains('active')) callIfFn('renderGuides');
            }
        });
    }, 50);
};

const updateBuffVisuals = (label, isChecked, color) => {
    if (!label) return;
    label.classList.toggle('is-checked', isChecked);
    const span = label.querySelector('span');
    if (span) {
        span.style.color = isChecked ? color : '';
        span.style.textShadow = isChecked ? `0 0 10px ${color}` : '';
        span.style.fontWeight = isChecked ? 'bold' : '';
    }
};

window.handleBuffToggle = function (configKey, checkbox, unitId) {
    const config = window.GLOBAL_BUFF_DATA?.[configKey];
    if (!config || window.GLOBAL_BUFF_STATE[configKey] === checkbox.checked) return;

    window.GLOBAL_BUFF_STATE[configKey] = checkbox.checked;

    if (checkbox.checked && config.excludes) {
        const excl = window.GLOBAL_BUFF_DATA[config.excludes];
        if (excl) {
            window.GLOBAL_BUFF_STATE[config.excludes] = false;
            qAll('#globalBuffsPanel input[data-buff="' + config.excludes + '"]').forEach(cb => {
                cb.checked = false;
                updateBuffVisuals(cb.closest('.nav-toggle-label'), false, excl.color);
            });
        }
    }

    qAll('#globalBuffsPanel input[data-buff="' + configKey + '"]').forEach(cb => {
        cb.checked = checkbox.checked;
        updateBuffVisuals(cb.closest('.nav-toggle-label'), cb.checked, config.color);
    });

    window.triggerGlobalBuffUpdate(unitId);
};

// --- 3. UI STATE & LIST MANAGEMENT ---
window.setSystemLevel = function (unitId, value) {
    const unit = callIfFn('getUnitById', unitId) || (window.unitDatabase || []).find(u => u.id === unitId);
    const cfg = unit?.systemLevel;
    if (!cfg) return;

    const lvl = Math.max(cfg.min || 1, Math.min(cfg.max || 100, parseInt(value) || 0));
    window.unitSystemLevels[unitId] = lvl;

    const input = document.querySelector(`#system-level-${unitId}`);
    if (input && parseInt(input.value) !== lvl) input.value = lvl;

    if (window.LIVE_SCORE_CACHE) {
        Object.keys(window.LIVE_SCORE_CACHE).forEach(k => {
            if (k.startsWith(unitId)) delete window.LIVE_SCORE_CACHE[k];
        });
    }

    if (window.unitBuildsCache?.[unitId]) {
        window.unitBuildsCache[unitId] = { base: { fixed: [null] }, abil: { fixed: [null] } };
    }

    if (typeof window.refreshActiveBuild === 'function' && unit) {
        window.refreshActiveBuild(unit);
    }

    setTimeout(() => {
        callIfFn('updateBuildListDisplay', unitId, true);
        callIfFn('updateHotbarUI');
    }, 10);
};

window.resetAndRender = () => {
    window.renderQueueIndex = 0;
    window.currentPage = 1;
    callIfFn('renderDatabase');
};

window.selectELevel = function (unitId, level) {
    const next = ((window.unitELevels[unitId] || 0) === level) ? 0 : level;
    window.unitELevels[unitId] = next;

    const card = getEl('card-' + unitId);
    if (!card) return;

    const toolbar = card.querySelector('.upgrade-toolbar');
    if (toolbar) {
        toolbar.querySelectorAll('.e-pill').forEach(p => {
            const l = parseInt(p.dataset.level);
            p.classList.toggle('active', l === next);
            p.classList.toggle('e-unlocked', l <= next && next > 0);
        });
    }

    const unit = callIfFn('getUnitById', unitId) || (window.unitDatabase || []).find(u => u.id === unitId);
    if (unit?.upgrades?.some(u => u.unlocksAbility)) {
        const unlocked = unit.upgrades.slice(0, next + 1).some(u => u?.unlocksAbility);
        const wrapper = card.querySelector('.toggle-wrapper');
        if (wrapper) {
            wrapper.style.display = unlocked ? 'flex' : 'none';
            if (!unlocked && window.activeAbilityIds?.has(unitId)) {
                const cb = wrapper.querySelector('input');
                if (cb) { cb.checked = false; callIfFn('toggleAbility', unitId, cb); }
            }
        }
    }

    if (typeof window.refreshActiveBuild === 'function' && unit) {
        window.refreshActiveBuild(unit);
    }

    callIfFn('updateBuildListDisplay', unitId, true);
};

window.filterList = function (element) {
    const card = element.closest('.unit-card');
    if (card) {
        const unitId = card.id.replace('card-', '');
        callIfFn('updateBuildListDisplay', unitId);
        callIfFn('updateHotbarUI');
    }
};

window.toggleCheckbox = (checkbox, callback) => {
    checkbox.parentNode.classList.toggle('is-checked', checkbox.checked);
    if (callback) callback(checkbox);
};

// --- 4. CALCULATION HELPERS ---
window.getFilteredBuilds = () => (Array.isArray(globalBuilds) ? globalBuilds : []).filter(b =>
    b &&
    (statConfig.applyRelicCrit || (b.cf <= 0 && b.cm <= 0)) &&
    (statConfig.applyRelicDot || b.dot <= 0) &&
    (statConfig.applyRelicRange || b.legType !== 'range') &&
    (!(!statConfig.applyRelicDmg && b.dmg > 10) && !(!statConfig.applyRelicSpa && b.spa > 10))
);

window.getValidSubCandidates = () => (Array.isArray(SUB_CANDIDATES) ? SUB_CANDIDATES : []).filter(c =>
    (statConfig.applyRelicCrit || (c !== 'cm' && c !== 'cf')) &&
    (statConfig.applyRelicDot || c !== 'dot') &&
    (statConfig.applyRelicRange || c !== 'range')
);

// --- 5. COMPACT TOGGLES & SYNCS ---
const syncCheckboxes = (ids, isChecked) => {
    ids.forEach(id => {
        const cb = getEl(id);
        if (cb) {
            cb.checked = isChecked;
            cb.parentNode?.classList.toggle('is-checked', isChecked);
        }
    });
};

window.toggleInventoryMode = (checkbox) => {
    window.inventoryMode = checkbox.checked;
    if (typeof inventoryMode !== 'undefined') inventoryMode = checkbox.checked;
    console.debug('[INVENTORY-MODE-DIAG] toggleInventoryMode', {
        enabled: checkbox.checked,
        inventoryLength: window.relicInventory?.length || 0,
        assignments: Object.keys(window.inventoryUnitTraits || {})
    });
    syncCheckboxes(['globalInventoryMode', 'guideInventoryMode', 'sidebarInventoryMode'], checkbox.checked);
    window.resetCachesForBuffChange();
    window.resetAndRender();
    if (getEl('guidesPage')?.classList.contains('active')) callIfFn('renderGuides');
    if (checkbox.checked) callIfFn('openInventoryAssignmentsMenu');
};

window.toggleNoSubStats = (checkbox) => {
    window.disableSubStats = checkbox.checked;
    syncCheckboxes(['globalNoSubStats', 'sidebarNoSubStats', 'guideNoSubStats'], checkbox.checked);
    window.resetCachesForBuffChange();
    window.resetAndRender();
    if (getEl('guidesPage')?.classList.contains('active')) callIfFn('renderGuides');
};

// --- 6. PAGE HELPERS & LISTENERS ---
let activeBuildUpdateFrame = null;
window.updateAllUnitsBuilds = function (excludeIds = []) {
    if (activeBuildUpdateFrame) cancelAnimationFrame(activeBuildUpdateFrame);
    const queue = Array.from(window.visibleUnitIds).filter(id => !excludeIds.includes(id));

    qAll('.unit-card.lazy-build-load .top-builds-list').forEach(c => c.innerHTML = '');
    window.isBuffUpdateRunning = true;

    const processBatch = () => {
        const start = performance.now();
        while (queue.length > 0) {
            callIfFn('updateBuildListDisplay', queue.shift(), true, 30);
            if (performance.now() - start > 4) {
                activeBuildUpdateFrame = requestAnimationFrame(processBatch);
                return;
            }
        }
        activeBuildUpdateFrame = null;
        window.isBuffUpdateRunning = false;
        callIfFn('resortUnitCards'); // <--- RE-SORT ACTIVE CARDS VISUALLY ON COMPLETION
        callIfFn('updateHotbarUI');
    };
    activeBuildUpdateFrame = requestAnimationFrame(processBatch);
};

window.injectDbToolbarButtons = () => {
    const tb = getEl('dbInjector');
    if (tb) {
        tb.querySelectorAll('button, .action-btn').forEach(btn => {
            if (btn.textContent.toLowerCase().match(/trait tier list|trait stats/)) {
                btn.classList.add('hide-on-desktop');
            }
        });
    }
    if (!getEl('pc-toolbar-fix')) {
        const style = document.createElement('style');
        style.id = 'pc-toolbar-fix';
        style.innerHTML = `@media (min-width: 1024px) { .hide-on-desktop { display: none !important; } }`;
        document.head.appendChild(style);
    }
};

window.switchPage = (pid) => {
    qAll('.page').forEach(p => p.classList.remove('active'));
    qAll('.dashboard-sidebar .nav-btn').forEach(btn => {
        const click = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', click.includes(`switchPage('${pid}')`) || (pid === 'inventory' && click.includes('resetAndOpenInventory')));
    });

    const toolbars = { db: 'dbInjector', guides: 'guidesToolbar', inventory: 'inventoryToolbar', relics: 'relicsToolbar' };
    Object.entries(toolbars).forEach(([id, target]) => getEl(target)?.classList.toggle('hidden', id !== pid));

    const pageMap = { db: 'dbPage', guides: 'guidesPage', inventory: 'inventoryPage', relics: 'relicsPage' };
    getEl(pageMap[pid])?.classList.add('active');

    if (pid === 'db') window.injectDbToolbarButtons();
    else if (pid === 'guides') callIfFn('renderGuides');
    else if (pid === 'relics') callIfFn('renderRelicDatabase');
    else if (pid === 'inventory') {
        const invBtn = document.querySelector(`button[onclick*="switchPage('inventory')"], button[onclick*="resetAndOpenInventory()"]`);
        invBtn?.classList.add('active');
    }
};

window.resetAndOpenInventory = () => {
    callIfFn('clearInventoryHighlights');
    window.switchPage('inventory');
};

// --- VISUAL TOGGLE HELPERS ---
window.toggleDeepDive = (btn) => {
    const content = btn.nextElementSibling, arrow = btn.querySelector('.dd-arrow');
    if (content && arrow) {
        const isHidden = content.classList.toggle('hidden');
        arrow.textContent = isHidden ? '▶' : '▼';
        btn.classList.toggle('active', !isHidden);
    }
};

window.swapBreakdownPanels = (btn) => {
    const wrapper = btn.closest('.breakdown-top-wrapper');
    const left = wrapper?.querySelector('.breakdown-panel--left');
    const right = wrapper?.querySelector('.breakdown-panel--right');
    if (!left || !right) return;

    const isLeftHidden = left.classList.contains('is-hidden');
    left.classList.toggle('is-hidden', !isLeftHidden);
    left.classList.toggle('is-visible', isLeftHidden);
    right.classList.toggle('is-hidden', isLeftHidden);
    right.classList.toggle('is-visible', !isLeftHidden);

    const label = btn.querySelector('.swap-label');
    if (label) label.textContent = isLeftHidden ? 'Details' : 'Source';
};

window.toggleTopPanel = (btn) => {
    const container = btn.closest('.breakdown-top-panels');
    const left = container?.querySelector('.breakdown-panel--left');
    const right = container?.querySelector('.breakdown-panel--right');
    if (!left || !right) return;

    const isLeftHidden = left.classList.toggle('hidden');
    right.classList.toggle('hidden', !isLeftHidden);
    right.style.display = isLeftHidden ? 'block' : 'none';
    const label = btn.querySelector('span');
    if (label) label.textContent = isLeftHidden ? 'VIEW SOURCE TOTALS' : 'VIEW SUMMARY & BUFFS';
};

window.toggleHeader = () => document.body.classList.toggle('header-collapsed');

window.toggleGlobalBuffs = (btn) => {
    const panel = getEl('globalBuffsPanel');
    if (panel) {
        const isHidden = panel.classList.toggle('hidden');
        btn.innerHTML = `Buffs ${isHidden ? '▼' : '▲'}`;
        btn.classList.toggle('active', !isHidden);
    }
};

window.toggleFilterTab = (btn) => {
    const content = btn.closest('.search-container')?.querySelector('.filter-tab-content');
    if (content) {
        const isHidden = content.classList.toggle('hidden');
        btn.innerHTML = `Filters ${isHidden ? '▼' : '▲'}`;
        btn.classList.toggle('active', !isHidden);
    }
};

window.toggleMobileMenu = (show = null) => {
    document.body.classList.toggle('mobile-menu-open', show !== null ? show : !document.body.classList.contains('mobile-menu-open'));
    callIfFn('updateBodyScroll');
};

window.initMobileUI = () => {
    const addEl = (tag, cls, html, click) => {
        if (!document.querySelector('.' + cls)) {
            const el = document.createElement(tag);
            el.className = cls;
            el.innerHTML = html;
            el.onclick = click;
            document.body.appendChild(el);
        }
    };
    addEl('div', 'mobile-overlay', '', () => window.toggleMobileMenu(false));
    addEl('button', 'mobile-fab', '<span>☰</span>', () => window.toggleMobileMenu(true));
};

document.addEventListener('DOMContentLoaded', () => {
    const sentinel = getEl('sticky-sentinel'), toolbar = getEl('headerToolbarSection');
    if (sentinel && toolbar) {
        new IntersectionObserver(([entry]) => {
            toolbar.classList.toggle('is-sticky', !entry.isIntersecting && entry.boundingClientRect.top < 0);
        }, { threshold: [1] }).observe(sentinel);
    }
    window.injectDbToolbarButtons();
    window.initMobileUI();
});

let savedScrollPosition = 0;
window.updateBodyScroll = function () {
    const hasModals = Array.from(qAll('.modal-overlay')).some(m => m.classList.contains('is-visible'));
    const hasPopups = getEl('mathInfoPopup') || getEl('unitInfoPopup');
    const body = document.body;

    if (hasModals || hasPopups) {
        if (!body.classList.contains('scroll-locked')) {
            savedScrollPosition = window.scrollY;
            body.style.setProperty('--scroll-offset', `-${savedScrollPosition}px`);
            body.classList.add('scroll-locked');
        }
    } else if (body.classList.contains('scroll-locked')) {
        body.classList.remove('scroll-locked');
        body.style.removeProperty('--scroll-offset');
        window.scrollTo(0, savedScrollPosition);
    }
};

// --- CREDITS & TOAST SYSTEM ---
window.renderCredits = function () {
    const container = getEl('creditsContainer');
    if (!container || typeof creditsData === 'undefined') return;

    const discordLogo = `<svg class="discord-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.7;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.28 18.27 18.27 0 0 0-4.998 0 13.49 13.49 0 0 0-.644-1.28.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg>`;
    const linkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

    container.innerHTML = creditsData.map(c => {
        const link = c.userId ? `<a href="https://discord.com/users/${c.userId}" target="_blank" rel="noopener noreferrer" class="discord-link-btn" onclick="window.handleDiscordLink('${c.userId}', event)" title="Open Discord Profile" style="display: inline-flex; align-items: center; justify-content: center; text-decoration: none; color: inherit;">${linkIcon}</a>` : '';
        return `
            <div class="credit-badge ${c.type}" onclick="window.handleCreditClick('${c.id}')" title="Copy Username: ${c.id}">
                <div class="badge-role">${c.role}</div>
                <div class="badge-content">
                    ${c.pfp ? `<img src="${c.pfp}" class="badge-pfp" alt="${c.name}">` : ''}
                    <span class="badge-name">${c.name}</span>
                    ${discordLogo}${link}
                </div>
            </div>`;
    }).join('');
};

window.handleCreditClick = (username) => window.copyDiscordToClipboard(username);
window.handleDiscordLink = (userId, e) => {
    e.stopPropagation();
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `discord://-/users/${userId}`;
    }
};

window.copyDiscordToClipboard = (username) => {
    navigator.clipboard.writeText(username)
        .then(() => window.showToast(`Copied "${username}" to clipboard! Paste in Discord to message.`))
        .catch(() => window.showToast('Failed to copy username.'));
};

window.showToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = msg;

    Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)', color: '#fff', padding: '12px 24px',
        borderRadius: '50px', zIndex: '9999', fontSize: '0.9rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(5px)', animation: 'fadeInOut 3s forwards'
    });

    if (!getEl('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `@keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, 20px); } 10%, 90% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// --- HELPER COMPATIBILITY BINDINGS ---
const callIfFn = (name, ...args) => typeof window[name] === 'function' && window[name](...args);
const getEl = id => document.getElementById(id);
const qAll = sel => document.querySelectorAll(sel);