window.GLOBAL_BUFF_DATA = {
    miku: {
        id: 'miku',                 // Used for DB filename (db_miku_...)
        stateKey: 'mikuActive',     // window.mikuActive
        name: 'Miku Buff',
        desc: "Apply Miku's +100% Damage Buff",
        color: '#4ade80',           // Color used in UI and math renders
        math: (uStats) => ({ dmg: 100 }), // The actual math applied
        renderLabel: "Active: +100% Damage",
        genType: 'boolean'          // Tells Python to generate ON/OFF states
    },
    enlightenedGod: {
        id: 'enlightenedgod',
        stateKey: 'enlightenedGodActive',
        name: 'Enlightened God',
        desc: "Buffs allied unit's by 5% Attack, Attack Speed, and Range every 60 seconds. (Cap of 20%)",
        color: '#fbbf24',
        math: (uStats) => ({ dmg: 20, spa: 20, range: 20 }),
        renderLabel: "Active: +20% Dmg, -20% SPA, +20% Range",
        genType: 'boolean'
    },
    bijuu: {
        id: 'bijuu',
        stateKey: 'bijuuActive',
        name: 'Bijuu Link',
        desc: "Apply Bijuu Link: +25% Dmg, +25% Range, -15% SPA",
        color: '#f87171',
        math: (uStats) => {
            // Bijuu Link comes from Unparalleled Armor — doesn't apply to providers
            const baseId = (uStats.id || "").split('-')[0];
            if (baseId === 'unparalleled_armor' || baseId === 'nutaru_beast' || baseId === 'ancient_shinob') return {};
            return { dmg: 25, spa: 15, range: 25 };
        },
        renderLabel: "Active: +25% Dmg, +25% Range, -15% SPA",
        genType: 'boolean'
    },
    ancientMage: {
        id: 'amage',
        stateKey: 'ancientMageActive',
        name: 'Ancient Mage',
        desc: "Apply Ancient Mage Buff: +20% Crit Rate/Dmg",
        color: '#60a5fa',
        math: (uStats) => {
            // Ancient Mage buff can't apply to Ancient Mage itself
            if (window.isUnit(uStats.id, 'ancient_mage')) return {};
            return { crit: 20, cdmg: 20 };
        },
        renderLabel: "Active: +20% Crit Rate/Dmg",
        genType: 'boolean'
    },
    kingSailor: {
        id: 'ksailor',
        stateKey: 'kingSailorActive',
        name: 'King Sailor',
        desc: "Leader Passive: King's Mark. Only activates if in Slot 1. +10% Crit Rate, +20% Crit Damage. Magi: +50% Dmg/+15% SPA. Uncontrollable: +30% Dmg/+10% SPA. Water: +20% Dmg/+10% SPA.",
        color: '#60a5fa',
        math: (uStats, context) => {
            // King Sailor buff can't apply to King Sailor itself
            if (window.isUnit(uStats.id, 'king_sailor')) return {};

            // In loadout mode, it ONLY applies if the unit is equipped in the hotbar
            const isLoadout = (typeof window !== 'undefined' && window.CALCULATION_MODE === 'loadout');
            if (isLoadout && (!context || !context.isHotbar)) return {};

            // Determine if the buff should be active (Check all sources)
            const hState = window.hotbarState || (typeof hotbarState !== 'undefined' ? hotbarState : null);
            const leader = hState?.slots ? hState.slots[0] : null;
            const isKsLeading = leader && window.isUnit(leader.id, 'king_sailor');

            const hotbarBuffActive = hState?.buffState?.kingSailor || hState?.buffState?.ksailor;
            const globalActive = window.kingSailorActive;
            const contextActive = context?.kingSailorActive;

            if (!globalActive && !hotbarBuffActive && !contextActive && !isKsLeading) return {};

            // 1. BASE BUFF (+10% Crit, +20% CDmg)
            let b = { crit: 10, cdmg: 20 };

            // 2. LEADER PASSIVE (Specific Mark Bonuses)
            // Only applies if King Sailor is in Slot 1 OR in Potential Mode
            if (isKsLeading || window.CALCULATION_MODE === 'potential') {
                const tags = uStats.tags || [];
                if (tags.includes('Magi')) { b.dmg = 50; b.spa = 15; }
                else if (tags.includes('Uncontrollable Power')) { b.dmg = 30; b.spa = 10; }
                else if (String(uStats.element).toLowerCase() === 'water') { b.dmg = 20; b.spa = 10; }
            }

            return b;
        },
        renderLabel: "+10% Crit Rate, +20% Crit Damage",
        genType: 'boolean'
    },
    tripleThreat: {
        id: 'triplethreat',
        stateKey: 'tripleThreatActive',
        name: 'Unrivaled Mark',
        desc: "Leader Passive: Unrivaled Mark. Only activates if in Slot 1 (Works on self). Tag Sword (+50% Dmg, -7.5% Cost), Tag Piece (+25% Dmg, +10% Range), Element Wind (+20% Dmg, +5% Crit Rate).",
        color: '#a7f3d0',
        hideButton: true,
        math: (uStats, context) => {
            const isPotential = (typeof window !== 'undefined' && window.CALCULATION_MODE !== undefined) ? (window.CALCULATION_MODE === 'potential') : true;

            // In loadout mode, it ONLY applies if the unit is equipped in the hotbar
            if (!isPotential && (!context || !context.isHotbar)) return {};

            let isActive = false;
            if (isPotential) {
                // In potential mode, leader buff is active ONLY on Triple Threat himself!
                isActive = (uStats.id === 'triple_threat');
            } else {
                // In loadout mode, active if Triple Threat is in Slot 1 of the hotbar
                const hState = (typeof window !== 'undefined') ? window.hotbarState : null;
                const leader = hState?.slots ? hState.slots[0] : null;
                isActive = leader && (leader.id === 'triple_threat' || (typeof window !== 'undefined' && window.isUnit && window.isUnit(leader.id, 'triple_threat')));
            }

            if (!isActive) return {};

            const tags = uStats.tags || [];
            const element = String(uStats.element || uStats.stats?.element || "").toLowerCase();

            let b = { dmg: 0, range: 0, crit: 0 };

            if (tags.includes('Sword')) {
                b.dmg = 50;
            } else if (tags.includes('Piece')) {
                b.dmg = 25;
                b.range = 10;
            } else if (element === 'wind') {
                b.dmg = 20;
                b.crit = 5;
            }

            return b;
        },
        renderLabel: "Leader: Unrivaled Mark",
        genType: 'boolean'
    },
    mageHill: {
        id: 'magehill',
        stateKey: 'fernHillActive',
        name: 'Fern (Hill)',
        desc: "Apply Fern (Hill) Buff: -30% SPA (Hill Only)",
        color: '#fb923c',
        excludes: 'mageGround', // Automatically disables mageGround if checked
        math: (uStats, context) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            const isMatching = (uType === 'hill' || uType === 'hybrid');
            const isFernSelf = window.isUnit(uStats.id, 'prodigy_mage');
            if (!isMatching && !isFernSelf) return {};

            if (window.CALCULATION_MODE === 'potential') return { spa: 30 };

            // Hotbar unit: context.isHotbar is set by the rendering pipeline
            if (context.isHotbar) {
                const hotbar = window.hotbarState;
                if (!hotbar || !hotbar.slots) return {};
                const targets = hotbar.fernTargets || [];
                if (targets.length === 0) return {};
                const isFernPresent = hotbar.slots.some(s => s && window.isUnit(s.id, 'prodigy_mage'));
                if (!isFernPresent) return {};

                // "Both units" — Fern always receives her own buff when she has targets
                if (isFernSelf) return { spa: 30 };

                const slotIdx = hotbar.slots.findIndex(s => s && (s.id === uStats.id || window.isUnit(s.id, uStats.id)));
                return (slotIdx !== -1 && targets.includes(slotIdx)) ? { spa: 30 } : {};
            }

            // Main list unit: apply globally
            return { spa: 30 };
        },
        renderLabel: "Active: -30% SPA",
        genType: 'exclusive:fern' // Tells Python these are mutually exclusive
    },
    mageGround: {
        id: 'mageground',
        stateKey: 'fernGroundActive',
        name: 'Fern (Ground)',
        desc: "Apply Fern (Ground) Buff: +45% Crit Rate (Ground Only)",
        color: '#f472b6',
        excludes: 'mageHill', // Automatically disables mageHill if checked
        math: (uStats, context) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            const isMatching = (uType === 'ground' || uType === 'hybrid');
            const isFernSelf = window.isUnit(uStats.id, 'prodigy_mage');
            if (!isMatching && !isFernSelf) return {};

            if (window.CALCULATION_MODE === 'potential') return { crit: 45 };

            // Hotbar unit: context.isHotbar is set by the rendering pipeline
            if (context.isHotbar) {
                const hotbar = window.hotbarState;
                if (!hotbar || !hotbar.slots) return {};
                const targets = hotbar.fernTargets || [];
                if (targets.length === 0) return {};
                const isFernPresent = hotbar.slots.some(s => s && window.isUnit(s.id, 'prodigy_mage'));
                if (!isFernPresent) return {};

                // "Both units" — Fern always receives her own buff when she has targets
                if (isFernSelf) return { crit: 45 };

                const slotIdx = hotbar.slots.findIndex(s => s && (s.id === uStats.id || window.isUnit(s.id, uStats.id)));
                return (slotIdx !== -1 && targets.includes(slotIdx)) ? { crit: 45 } : {};
            }

            // Main list unit: apply globally
            return { crit: 45 };
        },
        renderLabel: "Active: +45% Crit Rate",
        genType: 'exclusive:fern'
    },
    bulma: {
        id: 'bulma',
        stateKey: 'bulmaActive',
        name: 'Bulma Buff',
        desc: "Apply Bulma's +15% Crit Rate Buff",
        color: '#f472b6',
        math: (uStats) => ({ crit: 15 }),
        renderLabel: "Active: +15% Crit Rate",
        tags: ["Assistant"],
        genType: 'boolean'
    },
};
