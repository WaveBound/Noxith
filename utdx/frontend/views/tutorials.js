// ============================================================================
// TUTORIALS.JS - Automated Interactive Tour (Full Replay Version + Delay)
// ============================================================================

const TutorialSystem = (function () {
    let mask, tooltip, vCursor;
    let currentStep = 0;
    let currentAutoClickStep = null;
    let tutorialActive = false;
    let isAnimating = false;
    let nextButtonTimeout = null; // Used for the 1.5s Next button delay

    const injectStyles = () => {
        if (document.getElementById('tutorial-styles')) return;
        const style = document.createElement('style');
        style.id = 'tutorial-styles';
        style.innerHTML = `
            #tut-mask {
                position: fixed; border-radius: 8px;
                border: 2px solid #60a5fa;
                box-shadow: 0 0 25px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.2);
                z-index: 9991; pointer-events: none; opacity: 0;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #tut-tooltip {
                position: fixed; width: 440px;
                background: #0b0c10; 
                border: 1px solid #2d2f36; border-top: 4px solid #3b82f6;
                border-radius: 14px; padding: 24px; color: #fff;
                z-index: 9992; box-shadow: 0 25px 50px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.02) inset;
                opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: auto; 
                transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                will-change: opacity, transform;
            }
            #tut-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
            
            .tut-title {
                font-size: 1.25rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;
                background: linear-gradient(135deg, #60a5fa, #a855f7);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 12px 0;
            }
            .tut-desc { font-size: 0.9rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; font-weight: 500; }
            .tut-desc b { color: #fff; font-weight: 800; }
            
            .tut-controls {
                display: flex; justify-content: space-between; align-items: center;
                border-top: 1px solid #2d2f36; padding-top: 16px;
                flex-wrap: nowrap; gap: 10px;
            }
            .tut-controls-right { display: flex; gap: 8px; align-items: center; }
            .tut-btn {
                background: #1a1c23; border: 1px solid #333640;
                color: #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; 
                font-weight: 800; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase;
            }
            .tut-btn:hover:not(:disabled) { background: #252830; color: #fff; border-color: #4a4d59; }
            .tut-btn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
            .tut-btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
            .tut-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5); }
            .tut-counter { font-size: 0.75rem; color: #64748b; font-weight: 900; margin-left: 15px; }
            
            /* Sleek Custom Checkbox Styling */
            .tut-checkbox-label {
                font-size: 0.75rem;
                color: #64748b;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                user-select: none;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: color 0.2s ease;
            }
            .tut-checkbox-label:hover {
                color: #94a3b8;
            }
            .tut-checkbox-label input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }
            .tut-checkbox-custom {
                height: 16px;
                width: 16px;
                background-color: #111217;
                border: 1.5px solid #2d2f36;
                border-radius: 4px;
                display: inline-block;
                position: relative;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            .tut-checkbox-label:hover input ~ .tut-checkbox-custom {
                border-color: #3b82f6;
            }
            .tut-checkbox-label input:checked ~ .tut-checkbox-custom {
                background-color: #3b82f6;
                border-color: #3b82f6;
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
            }
            .tut-checkbox-custom::after {
                content: "";
                position: absolute;
                display: none;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            .tut-checkbox-label input:checked ~ .tut-checkbox-custom::after {
                display: block;
            }

            #tut-cursor {
                position: fixed; width: 40px; height: 40px; z-index: 100000; pointer-events: none; opacity: 0;
                transform: translate(var(--tx, 100vw), var(--ty, 100vh)) scale(var(--ts, 1)) rotate(var(--tr, 0deg));
                filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
                transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
                will-change: transform, opacity;
                margin-top: -6px; margin-left: -6px;
            }
            #tut-cursor.visible { opacity: 1; }
            #tut-cursor.clicking { --ts: 0.85; --tr: -8deg; transition: transform 0.1s ease-in; }
            
            .tut-ripple {
                position: fixed; border-radius: 50%; background: rgba(168, 85, 247, 0.3);
                border: 2px solid rgba(168, 85, 247, 1); pointer-events: none; z-index: 99999;
                transform: translate(-50%, -50%) scale(0); opacity: 1;
                animation: rippleAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes rippleAnim { to { transform: translate(-50%, -50%) scale(3.5); opacity: 0; } }
        `;
        document.head.appendChild(style);
    };

    // --- HELPERS ---
    const ensurePanelClosed = async () => {
        const panel = document.getElementById('globalBuffsPanel');
        const btn = document.getElementById('globalBuffsToggleBtn');
        if (panel && !panel.classList.contains('hidden') && btn) {
            btn.click();
            await new Promise(r => setTimeout(r, 250));
        }
    };
    const ensurePanelOpen = async () => {
        const panel = document.getElementById('globalBuffsPanel');
        const btn = document.getElementById('globalBuffsToggleBtn');
        if (panel && panel.classList.contains('hidden') && btn) {
            btn.click();
            await new Promise(r => setTimeout(r, 250));
        }
    };
    const ensureMikuOff = () => {
        const cb = document.querySelector('input[data-buff="miku"]');
        if (cb && cb.checked) {
            cb.checked = false;
            if (window.handleBuffToggle) window.handleBuffToggle("miku", cb);
        }
    };
    const ensureMikuOn = () => {
        const cb = document.querySelector('input[data-buff="miku"]');
        if (cb && !cb.checked) {
            cb.checked = true;
            if (window.handleBuffToggle) window.handleBuffToggle("miku", cb);
        }
    };
    const waitForElement = (selector) => {
        return new Promise(resolve => {
            const el = document.querySelector(selector);
            if (el && el.getBoundingClientRect().width > 0) return resolve(el);
            let attempts = 0;
            const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el && el.getBoundingClientRect().width > 0) {
                    clearInterval(interval); resolve(el);
                }
                if (++attempts > 30) { clearInterval(interval); resolve(null); }
            }, 100);
        });
    };

    const autoClickElement = async (selector, triggerSelector, animId) => {
        currentAutoClickStep = animId;
        const target = await waitForElement(selector);
        if (currentAutoClickStep !== animId || !tutorialActive || !target) return;
        const trigger = triggerSelector ? document.querySelector(triggerSelector) : target;
        const rect = target.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);

        if (vCursor) {
            vCursor.style.transition = 'none';
            vCursor.style.setProperty('--tx', `${window.innerWidth}px`);
            vCursor.style.setProperty('--ty', `${window.innerHeight}px`);
            void vCursor.offsetWidth;
            vCursor.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
            vCursor.classList.add('visible');
            vCursor.style.setProperty('--tx', `${x}px`);
            vCursor.style.setProperty('--ty', `${y}px`);
        }

        await new Promise(r => setTimeout(r, 600));
        if (currentAutoClickStep !== animId || !tutorialActive) return;
        if (vCursor) vCursor.classList.add('clicking');
        const ripple = document.createElement('div');
        ripple.className = 'tut-ripple';
        ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
        ripple.style.width = '30px'; ripple.style.height = '30px';
        document.body.appendChild(ripple);

        await new Promise(r => setTimeout(r, 100));
        if (trigger) trigger.click();
        if (vCursor) vCursor.classList.remove('clicking');
        setTimeout(() => ripple.remove(), 400);

        await new Promise(r => setTimeout(r, 500));
        if (vCursor && currentAutoClickStep === animId) {
            vCursor.style.setProperty('--tx', `${x + 40}px`);
            vCursor.style.setProperty('--ty', `${y + 40}px`);
            vCursor.classList.remove('visible');
        }
    };

    // --- STEPS ---
    const steps = [
        {
            title: "Welcome!",
            desc: "Welcome to Universal TD Optimizer. Let's show you how to find the best gear for your units and build teams.",
            selector: null,
            position: "center",
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); window.scrollTo(0, 0); }
        },
        {
            title: "The Unit Card",
            desc: "This is a Unit Card. It holds the mathematically optimized data for a character based on current buffs.",
            selector: ".unit-card",
            position: "right",
            padding: 5,
            setup: async () => {
                const el = document.querySelector('.unit-card');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            title: "Recommended Traits",
            desc: "Click <b>📋 REC. TRAITS</b> to see the best traits for this character. This helps you decide which traits are worth rolling for!",
            selector: ".trait-guide-btn",
            position: "bottom",
            padding: 5
        },
        {
            title: "Best Setup",
            desc: "This header shows the absolute best <b>Relic Set</b>. The badge on the right shows the exact <b>Stat Points</b> to level up.",
            selector: ".unit-card .build-row .br-header",
            position: "bottom",
            padding: 8
        },
        {
            title: "Main Stats & Gear",
            desc: "Here are the exact <b>Main Stats</b> needed for Body and Legs relics. 'Stat-heads' should always use <b>Elemental</b>!",
            selector: ".unit-card .build-row .br-col.main",
            position: "bottom",
            padding: 8
        },
        {
            title: "Best Sub-Stats",
            desc: "Focus on these <b>Sub-Stats</b> to maximize this specific build's damage potential.",
            selector: ".unit-card .build-row .br-col.sub",
            position: "bottom",
            padding: 8
        },
        {
            title: "Global Buffs",
            desc: "Let's see how external buffs change these builds. Open the Global Buffs menu.",
            selector: "#globalBuffsToggleBtn",
            position: "bottom",
            padding: 5,
            setup: async (isBackwards) => { if (isBackwards) await ensurePanelOpen(); else await ensurePanelClosed(); },
            autoClick: "#globalBuffsToggleBtn",
            undoClick: "#globalBuffsToggleBtn"
        },
        {
            title: "Dynamic Optimization",
            desc: "We'll enable the <b>Miku Buff</b>. Watch how the site recalculates the best gear instantly!",
            selector: "label[title*='Miku']",
            position: "bottom",
            padding: 5,
            setup: async (isBackwards) => { await ensurePanelOpen(); if (isBackwards) ensureMikuOn(); else ensureMikuOff(); },
            autoClick: "label[title*='Miku']",
            clickTarget: "input[data-buff='miku']",
            undoClick: "label[title*='Miku']",
            undoClickTarget: "input[data-buff='miku']"
        },
        {
            title: "Potential vs Loadout",
            desc: "We have disabled Miku. Now, let's switch modes.<br><br><b>POTENTIAL:</b> Maxed passives.<br><b>LOADOUT:</b> Live stats based on your team.",
            selector: ".mode-selector",
            position: "bottom",
            padding: 5,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); }
        },
        {
            title: "Trying Loadout Mode",
            desc: "Switching to <b>LOADOUT</b> mode to see real-time team positioning math.",
            selector: "#modeBtnLoadout",
            position: "bottom",
            padding: 5,
            setup: async () => { if (typeof toggleCalcMode === 'function' && window.CALCULATION_MODE !== 'loadout') toggleCalcMode('potential'); },
            autoClick: "#modeBtnLoadout",
            undoClick: "#modeBtnPotential"
        },
        {
            title: "Building Your Team",
            desc: "In Loadout mode, you can add units. Let's add <b>King Sailor</b> from the Buffers menu.",
            selector: ".buffers-btn",
            position: "top",
            padding: 5,
            setup: async () => { if (window.CALCULATION_MODE !== 'loadout' && typeof toggleCalcMode === 'function') toggleCalcMode('loadout'); },
            autoClick: ".buffers-btn"
        },
        {
            title: "Adding a Leader",
            desc: "Click King Sailor. Buffers added to your hotbar provide their specific bonuses to your builds.",
            selector: ".buffer-item img[title='King Sailor']",
            position: "top",
            padding: 5,
            setup: async () => {
                const menu = document.querySelector('.buffers-menu');
                if (menu && !menu.classList.contains('active')) {
                    const btn = document.querySelector('.buffers-btn');
                    if (btn) btn.click();
                }
            },
            autoClick: ".buffer-item img[title='King Sailor']"
        },
        {
            title: "Deep Math Breakdown",
            desc: "Finally, open the <b>INFO</b> tab to see the total mathematical breakdown of your current loadout.",
            selector: ".hotbar-info-btn",
            position: "top",
            padding: 5,
            setup: async () => { if (typeof closeModal === 'function') closeModal('universalModal'); },
            autoClick: ".hotbar-info-btn"
        },
        {
            title: "You're Ready!",
            desc: "That's it! You can now explore the database and optimize your characters for any team setup.",
            selector: null,
            position: "center",
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); }
        }
    ];

    const buildUI = () => {
        injectStyles();
        mask = document.createElement('div'); mask.id = 'tut-mask';
        tooltip = document.createElement('div'); tooltip.id = 'tut-tooltip';
        vCursor = document.createElement('div'); vCursor.id = 'tut-cursor';
        vCursor.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M8 8 L30 16 L20 20 L16 30 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/></svg>`;
        tooltip.innerHTML = `
            <h3 class="tut-title" id="tut-title"></h3>
            <div class="tut-desc" id="tut-desc"></div>
            <div class="tut-controls">
                <button class="tut-btn" id="tut-skip">Skip</button>
                <label class="tut-checkbox-label">
                    <input type="checkbox" id="tut-dont-show">
                    <span class="tut-checkbox-custom"></span>
                    <span>Don't show again</span>
                </label>
                <div class="tut-counter" id="tut-counter"></div>
                <div class="tut-controls-right">
                    <button class="tut-btn" id="tut-prev">Back</button>
                    <button class="tut-btn tut-btn-primary" id="tut-next" disabled>Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(mask);
        document.body.appendChild(tooltip);
        document.body.appendChild(vCursor);
        document.getElementById('tut-skip').onclick = endTutorial;
        document.getElementById('tut-prev').onclick = () => transitionStep(-1);
        document.getElementById('tut-next').onclick = () => transitionStep(1);
    };

    const transitionStep = async (direction) => {
        if (isAnimating || !tutorialActive) return;
        isAnimating = true;
        currentAutoClickStep = null;

        if (nextButtonTimeout) clearTimeout(nextButtonTimeout);

        document.querySelectorAll('.tut-ripple').forEach(el => el.remove());

        if (mask) mask.style.opacity = '0';
        if (tooltip) tooltip.classList.remove('visible');
        if (vCursor) vCursor.classList.remove('visible');

        let nextStep = currentStep + direction;
        if (nextStep < 0 || nextStep >= steps.length) { endTutorial(); return; }

        if (direction === -1 && steps[currentStep].undoClick) {
            await autoClickElement(steps[currentStep].undoClick, steps[currentStep].undoClickTarget, 'undo');
            await new Promise(r => setTimeout(r, 200));
        } else {
            await new Promise(r => setTimeout(r, 250));
        }

        isAnimating = false;
        showStep(nextStep, direction === -1);
    };

    const showStep = async (index, isBackwards = false) => {
        isAnimating = true;
        currentStep = index;
        const step = steps[currentStep];
        if (step.setup) await step.setup(isBackwards);
        if (!tutorialActive) return;

        let targetEl = step.selector ? await waitForElement(step.selector) : null;
        if (targetEl && mask && tooltip) {
            const rect = targetEl.getBoundingClientRect();
            const pad = step.padding || 5;
            mask.style.transition = 'none';
            mask.style.top = `${rect.top + rect.height / 2}px`; mask.style.left = `${rect.left + rect.width / 2}px`;
            mask.style.width = '0px'; mask.style.height = '0px';
            void mask.offsetWidth;
            mask.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            mask.style.width = `${rect.width + pad * 2}px`; mask.style.height = `${rect.height + pad * 2}px`;
            mask.style.top = `${rect.top - pad}px`; mask.style.left = `${rect.left - pad}px`;
            mask.style.opacity = '1';
            positionTooltip(rect, step.position, pad);
        } else {
            mask.style.opacity = '0';
            tooltip.style.top = '50%'; tooltip.style.left = '50%'; tooltip.style.transform = 'translate(-50%, -50%)';
        }

        document.getElementById('tut-title').innerHTML = step.title;
        document.getElementById('tut-desc').innerHTML = step.desc;
        document.getElementById('tut-counter').innerText = `${currentStep + 1} / ${steps.length}`;
        document.getElementById('tut-prev').style.display = currentStep === 0 ? 'none' : 'inline-block';

        const nextBtn = document.getElementById('tut-next');
        nextBtn.innerText = currentStep === steps.length - 1 ? 'Finish' : 'Next';

        nextBtn.disabled = true;
        if (nextButtonTimeout) clearTimeout(nextButtonTimeout);
        nextButtonTimeout = setTimeout(() => {
            if (tutorialActive && nextBtn) {
                nextBtn.disabled = false;
            }
        }, 1500);

        tooltip.classList.add('visible');

        if (step.autoClick && tutorialActive && !isBackwards) {
            await autoClickElement(step.autoClick, step.clickTarget, currentStep);
        }
        isAnimating = false;
    };

    const positionTooltip = (rect, pos, padding) => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const gap = 15 + padding;
        let top, left;
        tooltip.style.transform = 'translate(0,0)';
        if (pos === 'bottom') { top = rect.bottom + gap; left = rect.left + rect.width / 2 - tooltipRect.width / 2; }
        else if (pos === 'top') { top = rect.top - tooltipRect.height - gap; left = rect.left + rect.width / 2 - tooltipRect.width / 2; }
        else if (pos === 'right') { top = rect.top + rect.height / 2 - tooltipRect.height / 2; left = rect.right + gap; }
        else { top = window.innerHeight / 2 - tooltipRect.height / 2; left = window.innerWidth / 2 - tooltipRect.width / 2; }

        left = Math.max(15, Math.min(left, window.innerWidth - tooltipRect.width - 15));
        top = Math.max(15, Math.min(top, window.innerHeight - tooltipRect.height - 15));
        tooltip.style.top = `${top}px`; tooltip.style.left = `${left}px`;
    };

    const endTutorial = () => {
        tutorialActive = false;
        if (nextButtonTimeout) clearTimeout(nextButtonTimeout);

        const dontShowCb = document.getElementById('tut-dont-show');
        if (dontShowCb && dontShowCb.checked) {
            localStorage.setItem('uto_hide_tutorial_v1', 'true');
        }

        ['tut-mask', 'tut-tooltip', 'tut-cursor', 'tutorial-styles'].forEach(id => {
            const el = document.getElementById(id); if (el) el.remove();
        });
        ensurePanelClosed();
        ensureMikuOff();

        if (typeof window.showModeSelectionModal === 'function') {
            window.showModeSelectionModal();
        }
    };

    return {
        start: async () => {
            if (window.innerWidth <= 769 || tutorialActive || localStorage.getItem('uto_hide_tutorial_v1') === 'true') return;
            tutorialActive = true;
            buildUI();
            showStep(0);
        }
    };
})();

// Automatically start on every reload if not blocked by user preference
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => TutorialSystem.start(), 1000);
});