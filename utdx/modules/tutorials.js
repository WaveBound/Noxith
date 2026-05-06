// ============================================================================
// TUTORIALS.JS - Automated Interactive Tour (Premium & New-User Friendly)
// ============================================================================

const TutorialSystem = (function () {
    let mask, tooltip, vCursor;
    let currentStep = 0;
    let currentAutoClickStep = null; // Used to abort animations if user skips/clicks early
    let tutorialActive = false;
    let isAnimating = false;

    // Inject premium tutorial CSS
    const injectStyles = () => {
        if (document.getElementById('tutorial-styles')) return;
        const style = document.createElement('style');
        style.id = 'tutorial-styles';
        style.innerHTML = `
            #tut-mask {
                position: fixed; border-radius: 8px;
                /* Clean glowing border ONLY - No dark screen/blur overlay */
                border: 2px solid #60a5fa;
                box-shadow: 0 0 25px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.2);
                z-index: 9991; pointer-events: none; opacity: 0;
                /* Transition handles the expand-from-center animation */
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #tut-tooltip {
                position: fixed; width: 420px;
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
            .tut-controls-right {
                display: flex; gap: 8px; align-items: center; flex-wrap: nowrap;
            }
            .tut-btn {
                background: #1a1c23; border: 1px solid #333640;
                color: #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; 
                font-weight: 800; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase;
                white-space: nowrap; flex-shrink: 0;
            }
            .tut-btn:hover:not(:disabled) { background: #252830; color: #fff; border-color: #4a4d59; }
            .tut-btn:disabled { opacity: 0.3; cursor: not-allowed; }
            .tut-btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
            .tut-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #60a5fa, #3b82f6); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5); border: none; }
            .tut-counter { font-size: 0.75rem; color: #64748b; font-weight: 900; letter-spacing: 1px; white-space: nowrap; margin-right: auto; margin-left: 15px; }
            
            /* Enhanced Premium Cursor */
            #tut-cursor {
                position: fixed; width: 40px; height: 40px; z-index: 100000; pointer-events: none; opacity: 0;
                /* Use CSS Variables to allow scale/rotation on top of translation */
                transform: translate(var(--tx, 100vw), var(--ty, 100vh)) scale(var(--ts, 1)) rotate(var(--tr, 0deg));
                filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
                transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
                will-change: transform, opacity;
                /* Slight offset so the visual tip aligns with the actual element center */
                margin-top: -6px;
                margin-left: -6px;
            }
            #tut-cursor.visible { opacity: 1; }
            #tut-cursor.clicking { 
                --ts: 0.85; 
                --tr: -8deg; 
                transition: transform 0.1s ease-in; 
            }
            
            /* Premium Ripple */
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

    // --- STATE ENFORCEMENT HELPERS (FOR UNDO/REDO) ---
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
                    clearInterval(interval);
                    resolve(el);
                }
                if (++attempts > 30) { clearInterval(interval); resolve(null); }
            }, 100);
        });
    };

    // Virtual Mouse Animation (Strictly tracked to prevent ghosts)
    const autoClickElement = async (selector, triggerSelector, animId) => {
        currentAutoClickStep = animId;

        const target = await waitForElement(selector);
        if (currentAutoClickStep !== animId || !tutorialActive || !target) return;

        const trigger = triggerSelector ? document.querySelector(triggerSelector) : target;
        if (!trigger) return;

        const rect = target.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);

        if (vCursor) {
            // Force cursor to start from bottom-right so it flies in cleanly every time
            vCursor.style.transition = 'none';
            vCursor.style.setProperty('--tx', `${window.innerWidth}px`);
            vCursor.style.setProperty('--ty', `${window.innerHeight}px`);
            void vCursor.offsetWidth; // Force browser reflow

            // Re-enable transition and move to target
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
        if (currentAutoClickStep !== animId || !tutorialActive) { ripple.remove(); return; }

        trigger.click();

        if (vCursor) vCursor.classList.remove('clicking');
        setTimeout(() => { if (ripple) ripple.remove(); }, 400);

        await new Promise(r => setTimeout(r, 500));
        if (currentAutoClickStep !== animId || !tutorialActive) return;

        if (vCursor) {
            vCursor.style.setProperty('--tx', `${x + 40}px`);
            vCursor.style.setProperty('--ty', `${y + 40}px`);
            vCursor.classList.remove('visible');
        }
    };

    // --- TUTORIAL STEPS ---
    const steps = [
        {
            title: "Welcome!",
            desc: "Welcome to Universal TD Optimizer. This quick tour will show you how to use buffs and easily read our optimized builds.<br><br>Let's get started!",
            selector: null,
            position: "center",
            padding: 0,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); window.scrollTo(0, 0); }
        },
        {
            title: "The Control Hub",
            desc: "This top bar is your control hub. Here you can search the database, add custom pairs, or manage active buffs.",
            selector: "#dbInjector",
            position: "bottom",
            padding: 0,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        },
        {
            title: "Global Buffs",
            desc: "Watch the mouse. Let's open the Global Buffs menu.",
            selector: "#globalBuffsToggleBtn",
            position: "bottom",
            padding: 5,
            setup: async (isBackwards) => { ensureMikuOff(); if (isBackwards) await ensurePanelOpen(); else await ensurePanelClosed(); },
            autoClick: "#globalBuffsToggleBtn",
            undoClick: "#globalBuffsToggleBtn" // Closes menu when going back
        },
        {
            title: "Dynamic Optimization",
            desc: "We'll enable the <b>Miku Buff</b>.<br><br>Watch how the site recalculates instantly! Applying buffs can completely change a unit's math, meaning they might need entirely new <b>Relic Sets</b> or <b>Sub-Stats</b> to stay optimal.",
            selector: "label[title*='Miku']",
            position: "bottom",
            padding: 5,
            setup: async (isBackwards) => { await ensurePanelOpen(); if (isBackwards) ensureMikuOn(); else ensureMikuOff(); },
            autoClick: "label[title*='Miku']",
            clickTarget: "input[data-buff='miku']",
            undoClick: "label[title*='Miku']",
            undoClickTarget: "input[data-buff='miku']" // Unchecks Miku when going back
        },
        {
            title: "The Unit Card",
            desc: "This is a Unit Card. It holds the mathematically optimized data for a character.",
            selector: ".unit-card",
            position: "right",
            padding: 5,
            setup: async () => {
                await ensurePanelClosed(); ensureMikuOff();
                const el = document.querySelector('.unit-card');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            title: "The Best Setup",
            desc: "This area shows you the absolute best <b>Relic Set</b> and <b>Trait</b> to equip. The badge on the right tells you exactly which <b>Stat Points</b> to level up for this build.",
            selector: ".unit-card .build-row .br-header",
            position: "bottom",
            padding: 8,
            setup: async () => {
                await ensurePanelClosed(); ensureMikuOff();
            }
        },
        {
            title: "Main Stats & Gear",
            desc: "Here are the exact <b>Main Stats</b> needed for your Body and Legs relics. It also shows the best <b>Head Piece</b> to equip, just like the set or trait.",
            selector: ".unit-card .build-row .br-col.main",
            position: "bottom",
            padding: 8,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); }
        },
        {
            title: "Best Sub-Stats",
            desc: "These are the best <b>Sub-Stats</b> to go for on your relics to maximize this specific build's potential.",
            selector: ".unit-card .build-row .br-col.sub",
            position: "bottom",
            padding: 8,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); }
        },
        {
            title: "You're Ready!",
            desc: "That's it! You're ready to explore the database, build your Relic Inventory, and optimize your teams.",
            selector: null,
            position: "center",
            padding: 0,
            setup: async () => { await ensurePanelClosed(); ensureMikuOff(); }
        }
    ];

    const buildUI = () => {
        injectStyles();

        mask = document.createElement('div'); mask.id = 'tut-mask';
        tooltip = document.createElement('div'); tooltip.id = 'tut-tooltip';
        vCursor = document.createElement('div'); vCursor.id = 'tut-cursor';

        // Simple white cursor
        vCursor.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8 L30 16 L20 20 L16 30 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>`;

        tooltip.innerHTML = `
            <h3 class="tut-title" id="tut-title"></h3>
            <div class="tut-desc" id="tut-desc"></div>
            <div class="tut-controls">
                <button class="tut-btn" id="tut-skip">Skip Tour</button>
                <div class="tut-counter" id="tut-counter">1 / ${steps.length}</div>
                <div class="tut-controls-right">
                    <button class="tut-btn" id="tut-prev">Back</button>
                    <button class="tut-btn tut-btn-primary" id="tut-next">Next</button>
                </div>
            </div>
        `;

        document.body.appendChild(mask);
        document.body.appendChild(tooltip);
        document.body.appendChild(vCursor);

        // Bind events
        document.getElementById('tut-skip').onclick = endTutorial;
        document.getElementById('tut-prev').onclick = () => transitionStep(-1);
        document.getElementById('tut-next').onclick = () => transitionStep(1);
    };

    const toggleButtons = (disabled) => {
        const next = document.getElementById('tut-next');
        const prev = document.getElementById('tut-prev');
        const skip = document.getElementById('tut-skip');
        if (next) next.disabled = disabled;
        if (prev) prev.disabled = disabled;
        if (skip) skip.disabled = disabled;
    };

    // Destroy any ghost elements created by the autoclicker
    const cleanupGhostElements = () => {
        document.querySelectorAll('.tut-ripple').forEach(el => el.remove());
    };

    const transitionStep = async (direction) => {
        if (isAnimating || !tutorialActive) return;

        // Block UI immediately
        isAnimating = true;
        toggleButtons(true);
        currentAutoClickStep = null; // Abort running animations
        cleanupGhostElements();

        if (mask) mask.style.opacity = '0';
        if (tooltip) tooltip.classList.remove('visible');
        if (vCursor) vCursor.classList.remove('visible');

        let nextStep = currentStep + direction;
        if (nextStep < 0 || nextStep >= steps.length) {
            endTutorial();
            return;
        }

        // --- UNDO ANIMATION LOGIC ---
        // If going backward and the CURRENT step has an undo click, play it before transitioning
        if (direction === -1 && steps[currentStep].undoClick) {
            await autoClickElement(steps[currentStep].undoClick, steps[currentStep].undoClickTarget, 'undo');
            await new Promise(r => setTimeout(r, 200));
        } else {
            await new Promise(r => setTimeout(r, 250));
        }

        isAnimating = false;
        if (tutorialActive) showStep(nextStep, direction === -1);
    };

    const showStep = async (index, isBackwards = false) => {
        isAnimating = true;
        toggleButtons(true);
        currentStep = index;
        const step = steps[currentStep];

        // Enforce the exact state this step requires
        if (step.setup) {
            await step.setup(isBackwards);
            await new Promise(r => setTimeout(r, 100)); // Small buffer for DOM to catch up
        }
        if (!tutorialActive) return;

        let targetEl = null;
        if (step.selector) targetEl = await waitForElement(step.selector);

        if (targetEl && mask && tooltip) {
            const rect = targetEl.getBoundingClientRect();
            const pad = step.padding !== undefined ? step.padding : 5;

            const targetWidth = rect.width + (pad * 2);
            const targetHeight = rect.height + (pad * 2);
            const targetTop = rect.top - pad;
            const targetLeft = rect.left - pad;

            const centerX = rect.left + (rect.width / 2);
            const centerY = rect.top + (rect.height / 2);

            // Temporarily disable transition to snap invisibly to the center of the element
            mask.style.transition = 'none';
            mask.style.width = '0px';
            mask.style.height = '0px';
            mask.style.top = `${centerY}px`;
            mask.style.left = `${centerX}px`;

            // Force browser reflow to apply the 0px state instantly
            void mask.offsetWidth;

            // Re-enable transition and expand outward
            mask.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            mask.style.width = `${targetWidth}px`;
            mask.style.height = `${targetHeight}px`;
            mask.style.top = `${targetTop}px`;
            mask.style.left = `${targetLeft}px`;
            mask.style.opacity = '1';

            positionTooltip(rect, step.position, pad);
        } else if (mask && tooltip) {
            mask.style.opacity = '0';
            tooltip.style.top = `50%`;
            tooltip.style.left = `50%`;
            tooltip.style.transform = `translate(-50%, -50%)`;
        }

        if (tutorialActive && tooltip) {
            document.getElementById('tut-title').innerHTML = step.title;
            document.getElementById('tut-desc').innerHTML = step.desc;
            document.getElementById('tut-counter').innerText = `${currentStep + 1} / ${steps.length}`;
            document.getElementById('tut-prev').style.display = currentStep === 0 ? 'none' : 'inline-block';
            document.getElementById('tut-next').innerText = currentStep === steps.length - 1 ? 'Finish' : 'Next';

            tooltip.classList.add('visible');
        }

        // Fire autoclicker AFTER tooltip is visible (Only if going forward)
        if (step.autoClick && tutorialActive && !isBackwards) {
            await autoClickElement(step.autoClick, step.clickTarget, currentStep);
        }

        toggleButtons(false);
        isAnimating = false;
    };

    const positionTooltip = (rect, pos, padding) => {
        if (!tooltip) return;
        const tooltipRect = tooltip.getBoundingClientRect();
        const gap = 15 + padding;
        let top = 0, left = 0;

        tooltip.style.transform = 'translate(0,0)';

        switch (pos) {
            case 'bottom':
                top = rect.bottom + gap;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = rect.top - tooltipRect.height - gap;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - gap;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + gap;
                break;
            default:
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                break;
        }

        if (left < 15) left = 15;
        if (left + tooltipRect.width > window.innerWidth - 15) left = window.innerWidth - tooltipRect.width - 15;
        if (top < 15) top = 15;
        if (top + tooltipRect.height > window.innerHeight - 15) top = window.innerHeight - tooltipRect.height - 15;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    };

    const endTutorial = () => {
        tutorialActive = false;
        currentAutoClickStep = null;
        cleanupGhostElements();

        // Remove all DOM elements
        const idsToRemove = ['tut-mask', 'tut-tooltip', 'tut-cursor', 'tutorial-styles'];
        idsToRemove.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

        ensurePanelClosed();
        ensureMikuOff();

        // Permanently sets local storage so it never auto-opens again
        localStorage.setItem('hasSeenTutorial_v8', 'true');
    };

    // Responsive abort: If the user resizes to mobile while tutorial is running, shut it down.
    window.addEventListener('resize', () => {
        if (tutorialActive && window.innerWidth <= 1024) {
            endTutorial();
        }
    });

    // Silent Wait: Timeout fallback to guarantee tutorial starts even if DOM is weird
    const silentWait = async () => {
        let attempts = 0;
        while (!document.querySelector('.unit-card .build-row') && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        attempts = 0;
        while (document.querySelectorAll('.modal-overlay.is-visible').length > 0 && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        await new Promise(r => setTimeout(r, 500));
    };

    return {
        start: async () => {
            // Do not start on mobile/tablet screens to prevent layout overflow or weird behaviors
            if (window.innerWidth <= 769) return;

            // Prevents replay after "Skip" or "Finish"
            if (localStorage.getItem('hasSeenTutorial_v9')) return;

            if (tutorialActive) return;
            tutorialActive = true;

            await silentWait();

            window.scrollTo(0, 0);
            buildUI();
            showStep(0);
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    TutorialSystem.start();
});