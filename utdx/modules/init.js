// ============================================================================
// INIT.JS - Application Initialization
// ============================================================================

function initApp() {
    // 0. Populate default abilities safely regardless of current IDs
    ['phantom_captain', 'megumin', 'ancient_shinob'].forEach(file => {
        const dynamicId = window.getUnitId(file);
        if (dynamicId) activeAbilityIds.add(dynamicId);
    });

    // 1. Initialize Hotbar
    if (typeof ENABLE_HOTBAR !== 'undefined' && ENABLE_HOTBAR && typeof initHotbar === 'function') {
        initHotbar();
    }

    // 2. Inject Buff Buttons Efficiently via DocumentFragment batching
    injectBuffButtons();

    // 3. Render Content
    if (typeof renderCredits === 'function') {
        renderCredits();
    }

    // 4. Initialize Database
    renderDatabase();

    // 5. Initialize Inventory
    if (typeof initInventory === 'function') {
        initInventory();
    }

    // 6. End of Life Notice
    if (!localStorage.getItem('eol_notice_hidden_v2')) {
        setTimeout(() => {
            if (typeof showUniversalModal === 'function') {
                showUniversalModal({
                    title: '<span style="color: var(--text-color, #fff); font-size: 1.1rem; letter-spacing: 1px; font-weight: 600;">Development Update</span>',
                    content: `
                        <div style="text-align: center; padding: 25px 20px 10px; color: #e0e0e0; font-family: var(--font-main);">
                            <div style="margin-bottom: 24px; color: #fff;">
                                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto; filter: drop-shadow(0 0 12px rgba(255,255,255,0.15)); opacity: 0.9;">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            
                            <h3 style="font-size: 1.35rem; font-weight: 700; font-family: var(--font-header); margin-bottom: 16px; color: #ffffff;">Development Paused</h3>
                            
                            <p style="font-size: 0.95rem; color: #a0a0a5; margin: 0 auto 16px auto; line-height: 1.6;">
                                Heads up: this tool is no longer actively maintained. We likely won't be pushing any new features or adding new units going forward.
                            </p>

                            <p style="font-size: 0.9rem; color: #808088; max-width: 90%; margin: 0 auto; line-height: 1.6;">
                                Thanks to everyone who supported the site and used it along the way.
                            </p>
                        </div>
                    `,
                    footerButtons: `
                        <div style="display: flex; gap: 12px; width: 100%; margin-top: 10px;">
                            <button class="action-btn secondary" style="flex: 1; border-radius: 8px; font-weight: 600;" onclick="closeModal('universalModal')">Close</button>
                            <button class="action-btn" style="flex: 1.25; border-radius: 8px; font-weight: 600;" onclick="localStorage.setItem('eol_notice_hidden_v2', 'true'); closeModal('universalModal')">Don't Show Again</button>
                        </div>
                    `,
                    size: 'modal-sm'
                });
            }
        }, 1200);
    }


}

// Wait for DOMContentLoaded AND all unit scripts before initialising.
function _bootstrap() {
    (window.__unitsReady || Promise.resolve()).then(initApp);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _bootstrap);
} else {
    _bootstrap();
}

// Batch DOM operations to avoid layout thrashing and unnecessary reflows
function injectBuffButtons() {
    if (!document.getElementById('buff-btn-style')) {
        const style = document.createElement('style');
        style.id = 'buff-btn-style';
        style.innerHTML = `
            .miku-btn-label:hover span {
                color: #fff;
                text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // DYNAMIC BUTTON GENERATOR using the Single Source of Truth
    const createBtn = (configKey, config) => {
        const label = document.createElement('label');
        label.className = 'nav-toggle-label miku-btn-label';
        label.title = config.desc; // Dynamic tooltip

        label.innerHTML = `
            <div class="toggle-wrapper" style="gap: 6px;">
                <input type="checkbox" data-buff="${configKey}" style="cursor: pointer;">
                <div class="mini-switch"></div>
                <span style="white-space: nowrap;">${config.name}</span>
            </div>`;

        const input = label.querySelector('input');
        input.addEventListener('change', function () {
            if (typeof window.handleBuffToggle === 'function') {
                window.handleBuffToggle(configKey, this);
            }
        });

        return label;
    };

    const container = document.getElementById('globalBuffsPanel');
    if (!container) return;

    const frag = document.createDocumentFragment();

    if (window.GLOBAL_BUFF_DATA) {
        Object.entries(window.GLOBAL_BUFF_DATA).forEach(([key, config]) => {
            frag.appendChild(createBtn(key, config));
        });
    }

    container.appendChild(frag);
}