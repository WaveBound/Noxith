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

    // 6. Development Resumed Notice
    if (!localStorage.getItem('resume_notice_hidden_v8')) {
        setTimeout(() => {
            if (typeof showUniversalModal === 'function') {
                showUniversalModal({
                    title: '<span style="color: #a855f7; font-size: 0.75rem; letter-spacing: 2px; font-weight: 900; text-transform: uppercase;">Site Announcement</span>',
                    content: `
                        <div style="text-align: center; padding: 10px 10px 5px;">
                            
                            <!-- Gradient Headline -->
                            <h3 style="font-size: 1.6rem; font-weight: 900; margin: 10px 0 14px; background: linear-gradient(to right, #e9d5ff, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px;">Updates Are Back!</h3>
                            
                            <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
                                We previously put this tool on hold because the game's future was looking a bit uncertain. Now that things have stabilized, <strong style="color: #e2e8f0;">active development on this site has officially resumed!</strong>
                            </p>

                            <!-- Premium Callout Box -->
                            <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%); border: 1px solid rgba(168, 85, 247, 0.15); border-left: 3px solid #a855f7; border-radius: 8px; padding: 16px; margin-bottom: 5px; text-align: left;">
                                <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; margin: 0;">
                                    <strong style="color: #c084fc; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">What to expect:</strong><br>
                                    While we'll be maintaining the site again, please note that adding new units might take a little time after they release in-game. A huge thank you to everyone who stuck around!
                                </p>
                            </div>
                        </div>
                    `,
                    footerButtons: `
                        <div style="display: flex; gap: 12px; width: 100%; margin-top: 5px;">
                            <button class="action-btn secondary" style="flex: 1; border-radius: 8px; font-weight: 700; letter-spacing: 0.5px;" onclick="closeModal('universalModal')">Close</button>
                            <button class="action-btn" style="flex: 1.5; border-radius: 8px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #7e22ce); border: none; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); letter-spacing: 1px;" onclick="localStorage.setItem('resume_notice_hidden_v8', 'true'); closeModal('universalModal')">Awesome!</button>
                        </div>
                    `,
                    size: 'modal-sm'
                });
            }
        }, 500);
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
            if (config.hideButton) return;
            frag.appendChild(createBtn(key, config));
        });
    }

    container.appendChild(frag);
}