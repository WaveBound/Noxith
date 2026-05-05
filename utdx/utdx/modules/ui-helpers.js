// ============================================================================
// UI-HELPERS.JS - UI Interaction, Global State & Toggle Functions
// ============================================================================

// --- 1. GLOBAL BUFF SYSTEM CONFIGURATION ---
// Initialize global buff states dynamically from data.js
if (window.GLOBAL_BUFF_DATA) {
    Object.values(window.GLOBAL_BUFF_DATA).forEach(config => {
        window[config.stateKey] = false;
    });
}

// Automated DB Filename generator based on active buffs
window.getActiveDbFilename = () => {
    const parts = [];
    if (window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            if (window[buff.stateKey]) {
                parts.push(buff.id);
            }
        });
    }
    return parts.length === 0 ? 'db_base.js' : 'db_' + parts.join('_') + '.js';
};

window.currentLoadedDb = 'db_base.js';

window.loadDatabaseForCurrentBuffs = (callback) => {
    const dbName = window.getActiveDbFilename();
    if (window.currentLoadedDb === dbName) return callback && callback();

    const scriptId = 'dynamic-db-script';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'databases/' + dbName;
    script.onload = () => { window.currentLoadedDb = dbName; if (callback) callback(); };
    script.onerror = () => { console.error("Failed to load database: " + dbName); if (callback) callback(); };
    document.head.appendChild(script);
};

// --- 2. GLOBAL BUFF LOGIC MANAGERS ---
window.visibleUnitIds = new Set();
window.isBuffUpdateRunning = false;
let buffUpdateTimer = null;

window.resetCachesForBuffChange = () => {
    window.unitBuildsCache = {};
    window.cachedResults = {};
};

window.triggerGlobalBuffUpdate = () => {
    if (buffUpdateTimer) clearTimeout(buffUpdateTimer);
    buffUpdateTimer = setTimeout(() => {
        window.loadDatabaseForCurrentBuffs(() => {
            window.resetCachesForBuffChange();
            // Re-render full database to cleanly resort by DPS ranking with buffs
            if (typeof renderDatabase === 'function') {
                renderDatabase();
            } else if (typeof updateAllUnitsBuilds === 'function') {
                window.updateAllUnitsBuilds();
            }

            const guidesPage = document.getElementById('guidesPage');
            if (guidesPage && guidesPage.classList.contains('active') && typeof renderGuides === 'function') renderGuides();
        });
    }, 50);
};

function updateBuffVisuals(label, isChecked, color) {
    if (!label) return;
    label.classList.toggle('is-checked', isChecked);
    const span = label.querySelector('span');
    if (span) {
        span.style.color = isChecked ? color : '';
        span.style.textShadow = isChecked ? `0 0 10px ${color}` : '';
        span.style.fontWeight = isChecked ? 'bold' : '';
    }
}

// Master Toggle Handler for all buffs
window.handleBuffToggle = function (configKey, checkbox) {
    const config = window.GLOBAL_BUFF_DATA[configKey];
    if (!config) return;

    const isChecked = checkbox.checked;
    if (window[config.stateKey] === isChecked) return;

    window[config.stateKey] = isChecked;

    // Handle mutually exclusive buffs automatically
    if (isChecked && config.excludes) {
        const exclConfig = window.GLOBAL_BUFF_DATA[config.excludes];
        if (exclConfig) {
            window[exclConfig.stateKey] = false;
            document.querySelectorAll(`input[data-buff="${config.excludes}"]`).forEach(cb => {
                cb.checked = false;
                updateBuffVisuals(cb.closest('.nav-toggle-label'), false, exclConfig.color);
            });
        }
    }

    // Sync all related checkbox UI inputs (e.g., hotbar vs sidebar)
    document.querySelectorAll(`input[data-buff="${configKey}"]`).forEach(cb => {
        cb.checked = isChecked;
        updateBuffVisuals(cb.closest('.nav-toggle-label'), isChecked, config.color);
    });

    window.triggerGlobalBuffUpdate();
};


// --- 3. UI STATE & LIST MANAGEMENT ---
window.unitELevels = window.unitELevels || {};

window.resetAndRender = () => {
    renderQueueIndex = 0;
    currentPage = 1;
    if (typeof renderDatabase === 'function') renderDatabase();
};

window.selectELevel = function (unitId, level) {
    const current = window.unitELevels[unitId] || 0;
    const next = (current === level) ? 0 : level;
    window.unitELevels[unitId] = next;

    const card = document.getElementById('card-' + unitId);
    if (!card) return;

    const container = card.querySelector('.upgrade-toolbar');
    if (container) {
        container.querySelectorAll('.e-pill').forEach(p => {
            const l = parseInt(p.dataset.level);
            p.classList.toggle('active', l === next);
            p.classList.toggle('e-unlocked', l <= next && next > 0);
        });
    }

    const unit = typeof getUnitById === 'function' ? getUnitById(unitId) : (typeof unitDatabase !== 'undefined' ? unitDatabase.find(u => u.id === unitId) : null);
    if (unit && unit.upgrades && unit.upgrades.some(u => u.unlocksAbility)) {
        let unlocked = false;
        for (let i = 0; i <= next; i++) {
            if (unit.upgrades[i] && unit.upgrades[i].unlocksAbility) {
                unlocked = true; break;
            }
        }
        const toggleWrapper = card.querySelector('.toggle-wrapper');
        if (toggleWrapper) {
            toggleWrapper.style.display = unlocked ? 'flex' : 'none';
            if (!unlocked && activeAbilityIds.has(unitId)) {
                const checkbox = toggleWrapper.querySelector('input');
                if (checkbox) {
                    checkbox.checked = false;
                    window.toggleAbility(unitId, checkbox);
                }
            }
        }
    }

    if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(unitId);
};

window.filterList = function (element) {
    const card = element.closest('.unit-card');
    if (card && typeof updateBuildListDisplay === 'function') {
        updateBuildListDisplay(card.id.replace('card-', ''));
    }
};

window.toggleCheckbox = function (checkbox, callback) {
    checkbox.parentNode.classList.toggle('is-checked', checkbox.checked);
    if (callback) callback(checkbox);
};


// --- 4. CALCULATION HELPERS ---
window.getFilteredBuilds = () => globalBuilds.filter(b => {
    if (!statConfig.applyRelicCrit && (b.cf > 0 || b.cm > 0)) return false;
    if (!statConfig.applyRelicDot && b.dot > 0) return false;
    if (!statConfig.applyRelicDmg && b.dmg > 10 || !statConfig.applyRelicSpa && b.spa > 10) return false;
    return true;
});

window.getValidSubCandidates = () => SUB_CANDIDATES.filter(c =>
    !((!statConfig.applyRelicCrit && (c === 'cm' || c === 'cf')) || (!statConfig.applyRelicDot && c === 'dot'))
);


// --- 5. UNIT MODE MANAGERS ---
function handleUnitModeChange(unitId, updateStateCallback) {
    updateStateCallback();

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
}

window.setBambiettaElement = (element) => handleUnitModeChange(window.getUnitId('bambietta'), () => bambiettaState.element = element);
window.setRobot1718Mode = (mode) => handleUnitModeChange(window.getUnitId('robot1718'), () => robot1718State.mode = mode);
window.setAncientMageMode = (mode) => handleUnitModeChange(window.getUnitId('ancient_mage'), () => ancientMageState.mode = mode);
window.toggleAMSpecialist = (cb) => handleUnitModeChange(window.getUnitId('ancient_mage'), () => ancientMageState.mode = cb.checked ? "DPS" : "Specialist");

window.toggleKiritoMode = (mode, checkbox) => {
    handleUnitModeChange(window.getUnitId('kirito'), () => {
        if (mode === 'realm') {
            kiritoState.realm = checkbox.checked;
            if (!checkbox.checked) kiritoState.card = false;
        } else if (mode === 'card') {
            kiritoState.card = checkbox.checked;
        }
    });

    const unit = typeof getUnitById === 'function' ? getUnitById(window.getUnitId('kirito')) : null;
    const card = document.getElementById('card-' + window.getUnitId('kirito'));
    if (card && unit && typeof getKiritoControlsHtml === 'function') {
        card.querySelectorAll('.unit-toolbar').forEach(tb => {
            if (tb.innerText.includes('Virtual Realm')) tb.outerHTML = getKiritoControlsHtml(unit);
        });
    }
};

window.toggleAbility = function (unitId, checkbox) {
    const card = document.getElementById('card-' + unitId);
    if (!card) return;
    checkbox.parentNode.classList.toggle('is-checked', checkbox.checked);
    if (checkbox.checked) {
        card.classList.add('use-ability');
        activeAbilityIds.add(unitId);
    } else {
        card.classList.remove('use-ability');
        activeAbilityIds.delete(unitId);
    }
    if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(unitId);
    if (typeof resortUnitCards === 'function') resortUnitCards();
};

window.toggleInventoryMode = (checkbox) => {
    const isChecked = checkbox.checked;
    inventoryMode = isChecked;
    checkbox.parentNode.classList.toggle('is-checked', isChecked);

    const otherId = checkbox.id === 'globalInventoryMode' ? 'guideInventoryMode' : 'globalInventoryMode';
    const otherCheckbox = document.getElementById(otherId);
    if (otherCheckbox) {
        otherCheckbox.checked = isChecked;
        otherCheckbox.parentNode.classList.toggle('is-checked', isChecked);
    }

    window.resetAndRender();
    const guidesPage = document.getElementById('guidesPage');
    if (guidesPage && guidesPage.classList.contains('active') && typeof renderGuides === 'function') renderGuides();
};


// --- 6. PAGE HELPERS & LISTENERS ---
let activeBuildUpdateFrame = null;
window.updateAllUnitsBuilds = function () {
    if (activeBuildUpdateFrame) cancelAnimationFrame(activeBuildUpdateFrame);

    const queue = Array.from(window.visibleUnitIds);
    document.querySelectorAll('.unit-card.lazy-build-load').forEach(card => {
        card.querySelectorAll('.top-builds-list').forEach(c => c.innerHTML = '');
    });

    window.isBuffUpdateRunning = true;
    function processBatch() {
        const frameStart = performance.now();
        while (queue.length > 0) {
            const unitId = queue.shift();
            if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(unitId, true, 30);
            if (performance.now() - frameStart > 4) {
                activeBuildUpdateFrame = requestAnimationFrame(processBatch);
                return;
            }
        }
        activeBuildUpdateFrame = null;
        window.isBuffUpdateRunning = false;
    }
    activeBuildUpdateFrame = requestAnimationFrame(processBatch);
};

window.injectDbToolbarButtons = function () {
    const toolbar = document.getElementById('dbInjector');
    if (!toolbar) return;

    toolbar.querySelectorAll('button, .action-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('trait tier list') || text.includes('trait stats')) {
            btn.classList.add('hide-on-desktop');
        }
    });

    if (!document.getElementById('pc-toolbar-fix')) {
        const style = document.createElement('style');
        style.id = 'pc-toolbar-fix';
        style.innerHTML = `@media (min-width: 1024px) { .hide-on-desktop { display: none !important; } }`;
        document.head.appendChild(style);
    }
};

window.switchPage = function (pid) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dashboard-sidebar .nav-btn').forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', onClickAttr.includes(`switchPage('${pid}')`) || (pid === 'inventory' && onClickAttr.includes('resetAndOpenInventory')));
    });

    const toolbars = { 'db': 'dbInjector', 'guides': 'guidesToolbar', 'inventory': 'inventoryToolbar' };

    Object.values(toolbars).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    if (toolbars[pid]) {
        const activeToolbar = document.getElementById(toolbars[pid]);
        if (activeToolbar) activeToolbar.classList.remove('hidden');
    }

    if (pid === 'db') {
        document.getElementById('dbPage').classList.add('active');
        window.injectDbToolbarButtons();
    } else if (pid === 'guides') {
        document.getElementById('guidesPage').classList.add('active');
        if (typeof renderGuides === 'function') renderGuides();
    } else if (pid === 'inventory') {
        document.getElementById('inventoryPage').classList.add('active');
        const invBtn = document.querySelector(`button[onclick*="switchPage('inventory')"]`) || document.querySelector(`button[onclick*="resetAndOpenInventory()"]`);
        if (invBtn) invBtn.classList.add('active');
    }
};

window.resetAndOpenInventory = function () {
    if (typeof clearInventoryHighlights === 'function') clearInventoryHighlights();
    window.switchPage('inventory');
};

window.getQuickScore = (unit) => {
    // ALWAYS use base key for ranking to maintain consistent spot
    let dbKey = (window.isUnit(unit.id, 'kirito') && kiritoState.card) ? 'kirito_card' : unit.id;

    if (window.STATIC_BUILD_DB && window.STATIC_BUILD_DB[dbKey]) {
        const list = window.STATIC_BUILD_DB[dbKey]['fixed']?.[0];
        if (list && list.length > 0) {
            return window.isUnit(unit.id, 'law') ? (list[0].range || 0) : list[0].dps;
        }
    }
    if (window.isUnit(unit.id, 'law')) {
        if (unit.stats.range) return unit.stats.range;
        if (unit.upgrades && unit.upgrades.length > 0) return unit.upgrades[unit.upgrades.length - 1].range || 0;
        return 0;
    }
    let d = unit.stats.dmg, s = unit.stats.spa;
    if ((!d || !s) && unit.upgrades && unit.upgrades.length > 0) {
        const last = unit.upgrades[unit.upgrades.length - 1];
        d = d || last.dmg;
        s = s || last.spa;
    }
    return ((d || 0) / (s || 1)) * 35;
};

window.toggleDeepDive = (btn) => {
    const content = btn.nextElementSibling;
    const arrow = btn.querySelector('.dd-arrow');
    if (!content || !arrow) return;

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.textContent = '▼';
        btn.classList.add('active');
    } else {
        content.classList.add('hidden');
        arrow.textContent = '▶';
        btn.classList.remove('active');
    }
};

window.swapBreakdownPanels = (btn) => {
    const wrapper = btn.closest('.breakdown-top-wrapper');
    if (!wrapper) return;
    const left = wrapper.querySelector('.breakdown-panel--left');
    const right = wrapper.querySelector('.breakdown-panel--right');
    if (!left || !right) return;

    if (!left.classList.contains('is-hidden')) {
        left.classList.replace('is-visible', 'is-hidden') || left.classList.add('is-hidden');
        right.classList.replace('is-hidden', 'is-visible') || right.classList.add('is-visible');
        const label = btn.querySelector('.swap-label');
        if (label) label.textContent = 'Source';
    } else {
        left.classList.replace('is-hidden', 'is-visible') || left.classList.add('is-visible');
        right.classList.replace('is-visible', 'is-hidden') || right.classList.add('is-hidden');
        const label = btn.querySelector('.swap-label');
        if (label) label.textContent = 'Details';
    }
};

window.toggleTopPanel = (btn) => {
    const container = btn.closest('.breakdown-top-panels');
    if (!container) return;
    const left = container.querySelector('.breakdown-panel--left');
    const right = container.querySelector('.breakdown-panel--right');
    if (!left || !right) return;

    const isShowingLeft = !left.classList.contains('hidden');
    const label = btn.querySelector('span');

    if (isShowingLeft) {
        left.classList.add('hidden');
        right.classList.remove('hidden');
        right.style.display = 'block';
        if (label) label.textContent = 'VIEW SOURCE TOTALS';
    } else {
        left.classList.remove('hidden');
        right.classList.add('hidden');
        right.style.display = 'none';
        if (label) label.textContent = 'VIEW SUMMARY & BUFFS';
    }
};

window.toggleSummonDesc = (btn) => {
    const headerRow = btn.closest('tr');
    const descRow = headerRow.nextElementSibling;
    if (!descRow) return;

    if (descRow.classList.contains('hidden')) {
        descRow.classList.remove('hidden');
        btn.textContent = 'HIDE INFO';
        btn.style.background = 'rgba(96, 165, 250, 0.2)';
    } else {
        descRow.classList.add('hidden');
        btn.textContent = 'VIEW INFO';
        btn.style.background = '';
    }
};

window.toggleHeader = () => document.body.classList.toggle('header-collapsed');

// --- 7. PANEL TOGGLERS ---
window.toggleGlobalBuffs = function (btn) {
    const panel = document.getElementById('globalBuffsPanel');
    if (!panel) return;

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        btn.innerHTML = 'Buffs ▲';
        btn.classList.add('active');
    } else {
        panel.classList.add('hidden');
        btn.innerHTML = 'Buffs ▼';
        btn.classList.remove('active');
    }
};

window.toggleFilterTab = (btn) => {
    const content = btn.closest('.search-container').querySelector('.filter-tab-content');
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        btn.innerHTML = 'Filters ▲';
        btn.classList.add('active');
    } else {
        content.classList.add('hidden');
        btn.innerHTML = 'Filters ▼';
        btn.classList.remove('active');
    }
};

window.toggleRelicStatDisplay = (btn) => {
    const row = btn.closest('.build-row');
    if (row) row.classList.toggle('show-subs-mobile');
};

window.toggleMobileMenu = (show = null) => {
    const shouldOpen = show !== null ? show : !document.body.classList.contains('mobile-menu-open');
    document.body.classList.toggle('mobile-menu-open', shouldOpen);
    if (typeof updateBodyScroll === 'function') window.updateBodyScroll();
};

window.initMobileUI = () => {
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = () => window.toggleMobileMenu(false);
        document.body.appendChild(overlay);
    }
    if (!document.querySelector('.mobile-fab')) {
        const fab = document.createElement('button');
        fab.className = 'mobile-fab';
        fab.innerHTML = '<span>☰</span>';
        fab.onclick = () => window.toggleMobileMenu(true);
        document.body.appendChild(fab);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const sentinel = document.getElementById('sticky-sentinel');
    const toolbar = document.getElementById('headerToolbarSection');
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
    const visibleModals = Array.from(document.querySelectorAll('.modal-overlay')).some(m => m.classList.contains('is-visible'));
    const visiblePopups = document.getElementById('mathInfoPopup') || document.getElementById('unitInfoPopup');
    const body = document.body;

    if (visibleModals || visiblePopups) {
        if (!body.classList.contains('scroll-locked')) {
            savedScrollPosition = window.scrollY;
            body.style.setProperty('--scroll-offset', `-${savedScrollPosition}px`);
            body.classList.add('scroll-locked');
        }
    } else {
        if (body.classList.contains('scroll-locked')) {
            body.classList.remove('scroll-locked');
            body.style.removeProperty('--scroll-offset');
            window.scrollTo(0, savedScrollPosition);
        }
    }
};

window.renderCredits = function () {
    const container = document.getElementById('creditsContainer');
    if (!container || typeof creditsData === 'undefined') return;

    const discordLogo = `<svg class="discord-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.7;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.28 18.27 18.27 0 0 0-4.998 0 13.49 13.49 0 0 0-.644-1.28.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg>`;
    const linkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

    container.innerHTML = creditsData.map(c => {
        const linkButtonHtml = c.userId ? `<a href="https://discord.com/users/${c.userId}" target="_blank" rel="noopener noreferrer" class="discord-link-btn" onclick="window.handleDiscordLink('${c.userId}', event)" title="Open Discord Profile" style="display: inline-flex; align-items: center; justify-content: center; text-decoration: none; color: inherit;">${linkIcon}</a>` : '';
        return `
            <div class="credit-badge ${c.type}" onclick="window.handleCreditClick('${c.id}')" title="Copy Username: ${c.id}">
                <div class="badge-role">${c.role}</div>
                <div class="badge-content">
                    ${c.pfp ? `<img src="${c.pfp}" class="badge-pfp" alt="${c.name}">` : ''}
                    <span class="badge-name">${c.name}</span>
                    ${discordLogo}${linkButtonHtml}
                </div>
            </div>`;
    }).join('');
};

window.handleCreditClick = (username) => window.copyDiscordToClipboard(username);
window.handleDiscordLink = (userId, event) => {
    event.stopPropagation();
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `discord://-/users/${userId}`;
    }
};

window.copyDiscordToClipboard = (username) => {
    navigator.clipboard.writeText(username)
        .then(() => window.showToast(`Copied "${username}" to clipboard! Paste in Discord to message.`))
        .catch(err => { console.error('Failed to copy: ', err); window.showToast('Failed to copy username.'); });
};

window.showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)', color: '#fff', padding: '12px 24px',
        borderRadius: '50px', zIndex: '9999', fontSize: '0.9rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(5px)', animation: 'fadeInOut 3s forwards'
    });

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `@keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, 20px); } 10%, 90% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};